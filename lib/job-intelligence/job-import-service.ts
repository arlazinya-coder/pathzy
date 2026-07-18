import dns from "node:dns/promises";
import net from "node:net";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CvImportError, extractDocxText, extractPdfText } from "@/lib/professional-identity/cv-import";
import { DocumentInspectionError, inspectAndPersistDocument } from "@/lib/documents/inspection";
import { detectLanguages } from "@/lib/documents/inspection/language-detector";
import { inspectJobAdvertisement } from "./job-requirement-parser";
import type {
  CreateJobImportInput,
  JobImportInspection,
  JobImportPreliminaryDetails,
  JobImportRecord,
  JobImportRequirement,
  JobImportRequirementImportance,
  JobImportStatus,
  JobImportUpload,
  JobImportWarning,
  JobIntelligenceLanguage,
  JobRequirement
} from "./job-intelligence.types";

type Supabase = SupabaseClient;

const supportedUploadTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "text/plain"
]);

const maxJobUploadBytes = 8 * 1024 * 1024;
const maxUrlBytes = 1_200_000;
const minUsefulJobTextCharacters = 80;
const unsafeHostnames = new Set(["localhost", "0.0.0.0"]);
const shortenedHostPattern = /\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|cutt\.ly|rebrand\.ly)\b/i;

export class JobImportError extends Error {
  userMessage: string;
  status: number;

  constructor(message: string, userMessage = message, status = 400) {
    super(message);
    this.name = "JobImportError";
    this.userMessage = userMessage;
    this.status = status;
  }
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : "";
}

function normalizeJobText(value: string) {
  return value
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return `job_import_${Math.abs(hash).toString(36)}`;
}

function decodeBase64(base64: string) {
  const cleaned = base64.replace(/^data:[^;]+;base64,/, "").trim();
  if (!cleaned) throw new JobImportError("Missing file data.", "We could not read this job advert. Please upload it again.");
  return Buffer.from(cleaned, "base64");
}

function detectPrimaryLanguage(text: string): JobIntelligenceLanguage | "unknown" {
  const primary = detectLanguages(text).find((language) => language.primary);
  if (primary?.code === "fr") return "fr";
  if (primary?.code === "en") return "en";
  return "unknown";
}

function requirementImportance(requirement: JobRequirement): JobImportRequirementImportance {
  if (requirement.importance === "mandatory") return "mandatory";
  if (requirement.importance === "preferred") return "preferred";
  return "unclear";
}

function toImportRequirement(requirement: JobRequirement, prefix: string, index: number): JobImportRequirement {
  return {
    id: `${prefix}-${index + 1}`,
    text: requirement.text,
    category: requirement.category,
    importance: requirementImportance(requirement),
    sourceLine: requirement.sourceLine,
    confidence: requirement.confidence
  };
}

function extractLineValue(rawText: string, labels: string[]) {
  const pattern = new RegExp(`^(?:${labels.join("|")})\\s*[:\\-]\\s*(.+)$`, "im");
  return clean(rawText.match(pattern)?.[1]);
}

function extractWorkArrangement(text: string) {
  if (/\bhybrid\b|hybride/i.test(text)) return "Hybrid";
  if (/\bremote\b|teletravail|a distance|Ã distance/i.test(text)) return "Remote";
  if (/\bon[-\s]?site\b|sur site|presentiel|prÃ©sentiel/i.test(text)) return "On-site";
  return "";
}

function extractClosingDate(text: string) {
  const labelled = extractLineValue(text, ["closing date", "deadline", "application deadline", "date limite", "cloture", "clÃ´ture"]);
  if (labelled) return labelled;
  return clean(text.match(/\b(?:closing date|deadline|date limite|cloture|clÃ´ture)\b[^.\n:]*[:\-]?\s*([A-Za-z0-9 ,/.-]{4,40})/i)?.[1]);
}

function extractSalary(text: string) {
  const labelled = extractLineValue(text, ["salary", "remuneration", "rÃ©munÃ©ration", "salaire"]);
  if (labelled) return labelled;
  return clean(text.match(/(?:R|\$|USD|ZAR|EUR|GBP)\s?\d[\d,.\s]*(?:\s?-\s?(?:R|\$|USD|ZAR|EUR|GBP)?\s?\d[\d,.\s]*)?/i)?.[0]);
}

function extractApplicationInstructions(text: string) {
  const lines = text.split("\n").map((line) => clean(line)).filter(Boolean);
  const start = lines.findIndex((line) => /\b(apply|application|submit|send your|to apply|postuler|candidature|envoyez|soumettre)\b/i.test(line));
  if (start < 0) return "";
  return lines.slice(start, start + 3).join(" ");
}

function warning(code: JobImportWarning["code"], message: string, severity: JobImportWarning["severity"] = "warning"): JobImportWarning {
  return { code, message, severity };
}

function createWarnings(text: string, details: JobImportPreliminaryDetails, requirementsCount: number) {
  const warnings: JobImportWarning[] = [];
  if (!details.jobTitle) warnings.push(warning("missing_job_title", "We could not confidently find the job title. Please review it before continuing.", "info"));
  if (!details.organisation) warnings.push(warning("missing_organisation", "We could not confidently find the organisation. You can still review and add it.", "info"));
  if (!details.location) warnings.push(warning("missing_location", "The job location was not clear in this advert.", "info"));
  if (!details.closingDate) warnings.push(warning("missing_closing_date", "No closing date was detected. Check the advert before applying.", "info"));
  if (!details.applicationInstructions) warnings.push(warning("missing_application_instructions", "Application instructions were not clear. PATHZY will not apply automatically.", "info"));
  if (!requirementsCount) warnings.push(warning("unclear_requirements", "The candidate requirements were unclear. Please review the advert text.", "warning"));
  if (/\b(pay|payment|fee|deposit|bank details|bank account|upfront|registration fee|bitcoin|crypto|western union)\b/i.test(text)) {
    warnings.push(warning("suspicious_payment_request", "This advert may request payment or banking details. Review carefully before sharing information.", "warning"));
  }
  if (/\b(id number|passport number|password|pin|one-time password|otp|social security|identity number)\b/i.test(text)) {
    warnings.push(warning("suspicious_personal_data_request", "This advert may request sensitive personal information. Do not share private details unless you trust the employer.", "warning"));
  }
  if (shortenedHostPattern.test(text)) {
    warnings.push(warning("suspicious_shortened_link", "This advert contains a shortened link. Open links carefully and verify the employer.", "info"));
  }
  if (text.replace(/\s/g, "").length < 220) {
    warnings.push(warning("low_text_quality", "The advert text is quite short, so PATHZY may need your review before matching it later.", "info"));
  }
  return warnings;
}

export function inspectImportedJobText(input: {
  sourceType: JobImportInspection["sourceType"];
  rawText: string;
  details?: JobImportPreliminaryDetails;
  sourceLabel?: string;
  sourceUrl?: string;
  sourceDocumentId?: string;
  opportunityId?: string;
  extraWarnings?: JobImportWarning[];
}): JobImportInspection {
  const normalizedText = normalizeJobText(input.rawText);
  if (normalizedText.replace(/\s/g, "").length < minUsefulJobTextCharacters) {
    throw new JobImportError("Insufficient job text.", "Please paste more of the job description so PATHZY can inspect it.");
  }
  const structured = inspectJobAdvertisement({
    sourceType: input.sourceType === "uploaded_document" ? "uploaded_job_ad" : input.sourceType === "public_url" ? "external_link" : input.sourceType === "existing_opportunity" ? "opportunity_catalog" : "manual",
    sourceOpportunityId: input.opportunityId,
    title: input.details?.jobTitle,
    company: input.details?.organisation,
    location: input.details?.location,
    employmentType: input.details?.employmentType,
    rawText: normalizedText
  });
  const details: JobImportPreliminaryDetails = {
    jobTitle: clean(input.details?.jobTitle) || structured.title || extractLineValue(normalizedText, ["job title", "role", "position", "poste", "titre"]),
    organisation: clean(input.details?.organisation) || structured.company || extractLineValue(normalizedText, ["company", "organisation", "organization", "employer", "entreprise", "societe", "sociÃ©tÃ©"]),
    location: clean(input.details?.location) || structured.location || extractLineValue(normalizedText, ["location", "city", "country", "lieu", "ville", "pays"]),
    employmentType: clean(input.details?.employmentType) || structured.employmentType || extractLineValue(normalizedText, ["employment type", "contract type", "type de contrat", "type d'emploi"]),
    workArrangement: clean(input.details?.workArrangement) || extractWorkArrangement(normalizedText),
    salary: clean(input.details?.salary) || extractSalary(normalizedText),
    closingDate: clean(input.details?.closingDate) || extractClosingDate(normalizedText),
    applicationInstructions: clean(input.details?.applicationInstructions) || extractApplicationInstructions(normalizedText)
  };
  const requirements = structured.requirements.map((item, index) => toImportRequirement(item, "requirement", index));
  const responsibilities = structured.responsibilities.map((item, index) => toImportRequirement(item, "responsibility", index));
  const optionalContext = structured.benefitsOrContext.map((item, index) => ({
    ...toImportRequirement(item, "context", index),
    importance: "optional" as const
  }));
  const missingFields = (["jobTitle", "organisation", "location", "closingDate", "applicationInstructions"] as Array<keyof JobImportPreliminaryDetails>)
    .filter((field) => !details[field]);
  const warnings = [
    ...createWarnings(normalizedText, details, requirements.length),
    ...(input.extraWarnings ?? [])
  ];

  return {
    sourceType: input.sourceType,
    sourceLabel: input.sourceLabel,
    sourceUrl: input.sourceUrl,
    sourceDocumentId: input.sourceDocumentId,
    opportunityId: input.opportunityId,
    language: structured.language ?? detectPrimaryLanguage(normalizedText),
    layout: {
      hasResponsibilities: responsibilities.length > 0,
      hasRequirements: requirements.length > 0,
      hasApplicationInstructions: Boolean(details.applicationInstructions),
      hasClosingDate: Boolean(details.closingDate)
    },
    preliminaryDetails: details,
    responsibilities,
    requirements,
    optionalContext,
    missingFields,
    warnings,
    rawTextHash: hashText(normalizedText),
    inspectedAt: new Date().toISOString()
  };
}

function validateUpload(upload: JobImportUpload) {
  if (!upload.fileName?.trim()) throw new JobImportError("Missing file.", "Please choose a job advert file to import.");
  if (!supportedUploadTypes.has(upload.fileType)) {
    throw new JobImportError("Unsupported job advert file type.", "Please upload a PDF, DOCX, TXT, JPG, or PNG job advert.");
  }
  if (!upload.fileSize || upload.fileSize <= 0) throw new JobImportError("Empty file.", "The job advert file appears to be empty.");
  if (upload.fileSize > maxJobUploadBytes) throw new JobImportError("File too large.", "Please upload a job advert smaller than 8MB.");
}

async function extractTextFromJobUpload(upload: JobImportUpload) {
  validateUpload(upload);
  const buffer = decodeBase64(upload.base64);
  if (upload.fileType === "application/pdf") return extractPdfText(buffer);
  if (upload.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return extractDocxText(buffer);
  if (upload.fileType === "text/plain") return normalizeJobText(buffer.toString("utf8"));
  throw new JobImportError("OCR required.", "This job advert is an image. OCR is required before PATHZY can inspect it.", 422);
}

function isPrivateIp(address: string) {
  if (net.isIPv4(address)) {
    const parts = address.split(".").map(Number);
    return parts[0] === 10
      || parts[0] === 127
      || (parts[0] === 169 && parts[1] === 254)
      || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
      || (parts[0] === 192 && parts[1] === 168)
      || parts[0] === 0;
  }
  return address === "::1" || address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80:");
}

export async function validatePublicJobUrl(urlValue: string) {
  let url: URL;
  try {
    url = new URL(urlValue);
  } catch {
    throw new JobImportError("Invalid URL.", "Please paste a valid public job advert URL.");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new JobImportError("Unsupported URL protocol.", "Only public http or https job links can be imported.");
  }
  const hostname = url.hostname.toLowerCase();
  if (unsafeHostnames.has(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new JobImportError("Unsafe local URL.", "This link cannot be imported. Please paste the job description instead.");
  }
  if (net.isIP(hostname) && isPrivateIp(hostname)) {
    throw new JobImportError("Unsafe private URL.", "This link cannot be imported. Please paste the job description instead.");
  }
  const records = await dns.lookup(hostname, { all: true }).catch(() => []);
  if (records.some((record) => isPrivateIp(record.address))) {
    throw new JobImportError("Unsafe resolved URL.", "This link cannot be imported safely. Please paste the job description instead.");
  }
  return url;
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"");
}

async function fetchPublicJobText(urlValue: string) {
  const url = await validatePublicJobUrl(urlValue);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { Accept: "text/html,text/plain,application/xhtml+xml" }
    });
    if (!response.ok) throw new JobImportError("URL fetch failed.", "We could not read this job link. Please paste the job description here.");
    const contentType = response.headers.get("content-type") ?? "";
    if (!/text\/html|text\/plain|application\/xhtml\+xml/i.test(contentType)) {
      throw new JobImportError("Unsupported URL content type.", "This job link does not look like a readable web page. Please paste the job description here.");
    }
    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > maxUrlBytes) throw new JobImportError("URL content too large.", "This job page is too large to import safely. Please paste the job description here.");
    const text = await response.text();
    if (text.length > maxUrlBytes) throw new JobImportError("URL content too large.", "This job page is too large to import safely. Please paste the job description here.");
    return normalizeJobText(contentType.includes("html") ? stripHtml(text) : text);
  } finally {
    clearTimeout(timeout);
  }
}

async function createJobUploadShell(supabase: Supabase, userId: string, upload: JobImportUpload) {
  const { data, error } = await supabase
    .from("user_documents")
    .insert({
      user_id: userId,
      document_type: "uploaded_document",
      document_title: `Job advert - ${upload.fileName}`,
      template_name: null,
      content_text: "",
      content_json: {
        source: "job_import",
        original_file_name: upload.fileName,
        original_file_type: upload.fileType,
        original_file_size: upload.fileSize
      },
      status: "draft",
      version_number: 1
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

function rowToRecord(row: any): JobImportRecord {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    sourceType: row.source_type,
    sourceLabel: row.source_label ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    sourceDocumentId: row.source_document_id ?? undefined,
    opportunityId: row.opportunity_id ?? undefined,
    rawText: row.raw_text ?? undefined,
    normalizedText: row.normalized_text ?? undefined,
    language: row.language ?? "unknown",
    inspection: row.inspection_json,
    userCorrections: row.user_corrections_json ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function persistJobImport(supabase: Supabase, userId: string, input: {
  status: JobImportStatus;
  sourceType: JobImportInspection["sourceType"];
  rawText?: string;
  inspection: JobImportInspection;
}) {
  const normalizedText = input.rawText ? normalizeJobText(input.rawText) : "";
  const { data, error } = await supabase
    .from("job_imports")
    .insert({
      user_id: userId,
      source_type: input.sourceType,
      source_label: input.inspection.sourceLabel ?? null,
      source_url: input.inspection.sourceUrl ?? null,
      source_document_id: input.inspection.sourceDocumentId ?? null,
      opportunity_id: input.inspection.opportunityId ?? null,
      status: input.status,
      language: input.inspection.language,
      raw_text: input.rawText ?? null,
      normalized_text: normalizedText || null,
      preliminary_details_json: input.inspection.preliminaryDetails,
      inspection_json: input.inspection,
      warnings_json: input.inspection.warnings,
      missing_fields_json: input.inspection.missingFields,
      updated_at: new Date().toISOString()
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowToRecord(data);
}

function manualEntryToText(input: Extract<CreateJobImportInput, { sourceType: "manual_entry" }>) {
  return normalizeJobText([
    input.details.jobTitle ? `Job title: ${input.details.jobTitle}` : "",
    input.details.organisation ? `Organisation: ${input.details.organisation}` : "",
    input.details.location ? `Location: ${input.details.location}` : "",
    input.details.employmentType ? `Employment type: ${input.details.employmentType}` : "",
    input.details.workArrangement ? `Work arrangement: ${input.details.workArrangement}` : "",
    input.details.closingDate ? `Closing date: ${input.details.closingDate}` : "",
    input.requirements ? `Requirements:\n${input.requirements}` : "",
    input.responsibilities ? `Responsibilities:\n${input.responsibilities}` : "",
    input.applicationInstructions ?? input.details.applicationInstructions ? `Application instructions:\n${input.applicationInstructions ?? input.details.applicationInstructions}` : ""
  ].filter(Boolean).join("\n"));
}

export async function createJobImport(supabase: Supabase, userId: string, input: CreateJobImportInput): Promise<JobImportRecord> {
  if (!userId) throw new JobImportError("Missing authenticated user.", "Please log in to import a job advert.", 401);

  if (input.sourceType === "pasted_text") {
    const inspection = inspectImportedJobText({ sourceType: "pasted_text", rawText: input.rawText, sourceLabel: "Pasted job description" });
    return persistJobImport(supabase, userId, { status: "review_required", sourceType: "pasted_text", rawText: input.rawText, inspection });
  }

  if (input.sourceType === "manual_entry") {
    const rawText = manualEntryToText(input);
    const inspection = inspectImportedJobText({ sourceType: "manual_entry", rawText, details: input.details, sourceLabel: "Manual job entry" });
    return persistJobImport(supabase, userId, { status: "review_required", sourceType: "manual_entry", rawText, inspection });
  }

  if (input.sourceType === "existing_opportunity") {
    const inspection = inspectImportedJobText({
      sourceType: "existing_opportunity",
      rawText: input.rawText,
      details: input.details,
      sourceLabel: "PATHZY opportunity",
      opportunityId: input.opportunityId
    });
    return persistJobImport(supabase, userId, { status: "review_required", sourceType: "existing_opportunity", rawText: input.rawText, inspection });
  }

  if (input.sourceType === "public_url") {
    const url = await validatePublicJobUrl(input.url);
    let rawText = "";
    const extraWarnings: JobImportWarning[] = [];
    try {
      rawText = await fetchPublicJobText(input.url);
    } catch (caught) {
      if (caught instanceof JobImportError) throw caught;
      extraWarnings.push(warning("url_fetch_unavailable", "We could not read this link automatically. Paste the job description if the details look incomplete.", "warning"));
      throw new JobImportError("URL fetch unavailable.", "We could not read this job link. Please paste the job description here.");
    }
    const inspection = inspectImportedJobText({ sourceType: "public_url", rawText, sourceUrl: url.toString(), sourceLabel: url.hostname, extraWarnings });
    return persistJobImport(supabase, userId, { status: "review_required", sourceType: "public_url", rawText, inspection });
  }

  const upload = input.upload;
  validateUpload(upload);
  const sourceDocumentId = await createJobUploadShell(supabase, userId, upload);
  const inspectionResult = await inspectAndPersistDocument(supabase, {
    documentId: sourceDocumentId,
    userId,
    fileName: upload.fileName,
    mimeType: upload.fileType,
    sizeBytes: upload.fileSize,
    base64: upload.base64
  });
  const documentWarnings = inspectionResult.warnings.map((item) => warning("document_warning", item.message, item.severity === "error" ? "error" : item.severity));

  try {
    const rawText = await extractTextFromJobUpload(upload);
    const inspection = inspectImportedJobText({
      sourceType: "uploaded_document",
      rawText,
      sourceLabel: upload.fileName,
      sourceDocumentId,
      extraWarnings: documentWarnings
    });
    return persistJobImport(supabase, userId, { status: "review_required", sourceType: "uploaded_document", rawText, inspection });
  } catch (caught) {
    if (caught instanceof CvImportError || caught instanceof JobImportError || inspectionResult.source.ocrRequired || ["ocr", "image_ocr", "hybrid"].includes(inspectionResult.recommendedPipeline.strategy)) {
      const ocrInspection: JobImportInspection = {
        sourceType: "uploaded_document",
        sourceLabel: upload.fileName,
        sourceDocumentId,
        language: "unknown",
        layout: {
          hasResponsibilities: false,
          hasRequirements: false,
          hasApplicationInstructions: false,
          hasClosingDate: false
        },
        preliminaryDetails: {},
        responsibilities: [],
        requirements: [],
        optionalContext: [],
        missingFields: ["jobTitle", "organisation", "location", "closingDate", "applicationInstructions"],
        warnings: [
          warning("ocr_required", "This job advert needs OCR before PATHZY can inspect it. Paste the job description text for now.", "warning"),
          ...documentWarnings
        ],
        rawTextHash: hashText(`${upload.fileName}-${upload.fileSize}`),
        inspectedAt: new Date().toISOString()
      };
      return persistJobImport(supabase, userId, { status: "ocr_required", sourceType: "uploaded_document", inspection: ocrInspection });
    }
    if (caught instanceof DocumentInspectionError) throw new JobImportError(caught.message, caught.userMessage);
    throw caught;
  }
}

export async function updateJobImportReview(supabase: Supabase, userId: string, jobImportId: string, corrections: Partial<JobImportPreliminaryDetails>, markReady = false) {
  const { data: existing, error: existingError } = await supabase
    .from("job_imports")
    .select("*")
    .eq("id", jobImportId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existingError) throw existingError;
  if (!existing) throw new JobImportError("Job import not found.", "We could not find this job import. Please try again.", 404);

  const inspection = existing.inspection_json as JobImportInspection;
  const nextDetails = { ...inspection.preliminaryDetails, ...corrections };
  const nextInspection = {
    ...inspection,
    preliminaryDetails: nextDetails,
    missingFields: (["jobTitle", "organisation", "location", "closingDate", "applicationInstructions"] as Array<keyof JobImportPreliminaryDetails>).filter((field) => !nextDetails[field])
  } satisfies JobImportInspection;
  const { data, error } = await supabase
    .from("job_imports")
    .update({
      status: markReady ? "ready" : "review_required",
      preliminary_details_json: nextDetails,
      inspection_json: nextInspection,
      missing_fields_json: nextInspection.missingFields,
      user_corrections_json: corrections,
      updated_at: new Date().toISOString()
    })
    .eq("id", jobImportId)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return rowToRecord(data);
}
