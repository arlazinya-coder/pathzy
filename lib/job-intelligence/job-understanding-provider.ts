import type {
  JobImportRecord,
  JobImportRequirement,
  JobImportRequirementImportance,
  JobSourceEvidence,
  JobUnderstandingProvider,
  JobUnderstandingRequirementType,
  JobUnderstandingResult,
  SemanticJobUnderstanding,
  StructuredJobApplicationDetails,
  StructuredJobRequirement,
  StructuredJobResponsibility,
  StructuredJobSalary
} from "./job-intelligence.types";

export const JOB_UNDERSTANDING_MODEL_VERSION = "pathzy-job-understanding-local-v1";
export const JOB_UNDERSTANDING_PROMPT_VERSION = "deterministic-schema-v1";

const conceptAliases: Array<{ id: string; concept: string; aliases: RegExp[] }> = [
  { id: "skill:microsoft-excel", concept: "Microsoft Excel", aliases: [/\b(ms\s*)?excel\b/i, /\bexcel spreadsheets?\b/i] },
  { id: "skill:microsoft-word", concept: "Microsoft Word", aliases: [/\b(ms\s*)?word\b/i, /\bmicrosoft word\b/i] },
  { id: "skill:sql", concept: "SQL", aliases: [/\bsql\b/i, /\bdatabase queries\b/i] },
  { id: "skill:data-analysis", concept: "Data analysis", aliases: [/\bdata analys[ie]s\b/i, /\banaly[sz]e data\b/i, /\banalys[ei] des donn[Ã©e]es\b/i] },
  { id: "skill:customer-service", concept: "Customer service", aliases: [/\bcustomer service\b/i, /\bclient service\b/i, /\bservice client\b/i] },
  { id: "skill:communication", concept: "Communication", aliases: [/\bcommunication\b/i, /\bwritten and verbal\b/i, /\bcommuniquer\b/i] },
  { id: "skill:project-management", concept: "Project management", aliases: [/\bproject management\b/i, /\bgestion de projet\b/i] },
  { id: "language:english", concept: "English", aliases: [/\benglish\b/i, /\banglais\b/i] },
  { id: "language:french", concept: "French", aliases: [/\bfrench\b/i, /\bfran[Ã§c]ais\b/i] },
  { id: "education:bachelors-degree", concept: "Bachelor's degree", aliases: [/\bbachelor'?s?\b/i, /\blicence universitaire\b/i, /\bdipl[oÃ´]me de licence\b/i] },
  { id: "licence:drivers-licence", concept: "Driver's licence", aliases: [/\bdriver'?s licence\b/i, /\bdriving licence\b/i, /\bpermis de conduire\b/i] }
];

function clean(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function normalizeForKey(value: string) {
  return clean(value).toLowerCase().replace(/[^a-z0-9Ã -Ã¿]+/gi, " ").replace(/\s+/g, " ").trim();
}

export function normalizeJobConcept(text: string) {
  const cleanText = clean(text);
  const alias = conceptAliases.find((item) => item.aliases.some((pattern) => pattern.test(cleanText)));
  if (alias) return { canonicalConceptId: alias.id, normalizedConcept: alias.concept };
  return { normalizedConcept: cleanText.replace(/^(must have|required|preferred|essential|minimum|desirable|advantageous)\s+/i, "") };
}

function evidenceFor(source: string, section: string, rawText: string, confidence: number): JobSourceEvidence {
  const startOffset = rawText.indexOf(source);
  return {
    text: source,
    originalWording: source,
    startOffset: startOffset >= 0 ? startOffset : undefined,
    endOffset: startOffset >= 0 ? startOffset + source.length : undefined,
    section,
    confidence
  };
}

function inferRequirementType(text: string): JobUnderstandingRequirementType {
  const lower = normalizeForKey(text);
  if (/\b(years?|experience|track record|background|exp[Ã©e]rience)\b/.test(lower)) return "experience";
  if (/\bdegree|diploma|bachelor|master|qualification|education|formation|diplome|diplÃ´me\b/.test(lower)) return "education";
  if (/\bcertification|certificate|certified|attestation|certificat\b/.test(lower)) return "certification";
  if (/\blicen[cs]e|registration|registered|permit|permis\b/.test(lower)) return "licence";
  if (/\benglish|french|bilingual|language|anglais|francais|franÃ§ais|langue\b/.test(lower)) return "language";
  if (/\blocation|remote|hybrid|onsite|on site|relocat|city|country|lieu|ville|pays\b/.test(lower)) return "location";
  if (/\bwork authorization|visa|eligible to work|right to work|autorisation\b/.test(lower)) return "work_authorization";
  if (/\bavailable|shift|weekend|night|travel|overtime|availability|disponible\b/.test(lower)) return lower.includes("travel") ? "travel" : "availability";
  if (/\blift|standing|physical|manual handling|porter|physique\b/.test(lower)) return "physical";
  if (/\bjavascript|typescript|python|sql|excel|software|system|platform|tool|technology|outil|logiciel\b/.test(lower)) return "technical";
  if (/\bcommunication|teamwork|leadership|problem solving|adapt|organised|organized|interpersonal\b/.test(lower)) return "behavioural";
  if (/\bindustry|sector|banking|healthcare|retail|manufacturing|clinical|laboratory\b/.test(lower)) return "industry";
  if (/\bskill|competenc|compÃ©tenc|proficient|knowledge\b/.test(lower)) return "skill";
  return "other";
}

function inferImportance(source: JobImportRequirement): JobImportRequirementImportance {
  const text = source.text.toLowerCase();
  if (source.importance === "mandatory" || /\b(must|required|minimum|essential|compulsory|must have|obligatoire|exig[Ã©e])\b/i.test(text)) return "mandatory";
  if (source.importance === "preferred" || /\b(preferred|advantageous|desirable|would be an advantage|nice to have|souhait[Ã©e]|atout)\b/i.test(text)) return "preferred";
  if (source.importance === "optional" || /\b(optional|bonus|plus|facultatif)\b/i.test(text)) return "optional";
  return "unclear";
}

function extractMinimumYears(text: string) {
  const match = text.match(/\b(\d{1,2})\+?\s*(?:-|to\s*)?(?:\d{1,2})?\s*(?:years?|ans)\b/i);
  return match ? Number(match[1]) : undefined;
}

function inferProficiency(text: string) {
  const lower = text.toLowerCase();
  if (/\badvanced|expert|excellent|maitrise|maÃ®trise\b/.test(lower)) return "advanced";
  if (/\bintermediate|working knowledge|good knowledge\b/.test(lower)) return "intermediate";
  if (/\bbasic|familiar|notions\b/.test(lower)) return "basic";
  if (/\bfluent|courant\b/.test(lower)) return "fluent";
  return undefined;
}

function toStructuredRequirement(source: JobImportRequirement, rawText: string, index: number): StructuredJobRequirement {
  const normalized = normalizeJobConcept(source.text);
  const type = inferRequirementType(source.text);
  const warnings: string[] = [];
  if (source.importance === "unclear") warnings.push("Importance needs review.");
  if (type === "other") warnings.push("Requirement type is uncertain.");
  return {
    id: `structured-requirement-${index + 1}`,
    type,
    importance: inferImportance(source),
    sourceText: source.text,
    normalizedConcept: normalized.normalizedConcept,
    canonicalConceptId: normalized.canonicalConceptId,
    minimumYears: extractMinimumYears(source.text),
    proficiencyLevel: inferProficiency(source.text),
    requiredValue: type === "location" || type === "language" || type === "licence" ? normalized.normalizedConcept : undefined,
    confidence: Math.min(0.95, Math.max(0.45, source.confidence + (source.importance === "unclear" ? -0.08 : 0.08))),
    evidence: evidenceFor(source.sourceLine ?? source.text, "requirements", rawText, source.confidence),
    warnings: warnings.length ? warnings : undefined,
    userStatus: "active"
  };
}

function toStructuredResponsibility(source: JobImportRequirement, rawText: string, index: number): StructuredJobResponsibility {
  const concepts = source.text
    .split(/,|;|\band\b|\bet\b/i)
    .map((part) => normalizeJobConcept(part).normalizedConcept)
    .filter((part): part is string => Boolean(part && part.length > 2))
    .slice(0, 5);
  return {
    id: `structured-responsibility-${index + 1}`,
    text: source.text,
    normalizedConcepts: Array.from(new Set(concepts)),
    confidence: Math.min(0.95, Math.max(0.45, source.confidence)),
    evidence: evidenceFor(source.sourceLine ?? source.text, "responsibilities", rawText, source.confidence),
    userStatus: "active"
  };
}

function dedupeRequirements(requirements: StructuredJobRequirement[]) {
  const seen = new Set<string>();
  const deduped: StructuredJobRequirement[] = [];
  for (const requirement of requirements) {
    const key = requirement.canonicalConceptId ?? normalizeForKey(requirement.normalizedConcept ?? requirement.sourceText);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(requirement);
  }
  return deduped;
}

function inferSeniority(title: string, requirements: StructuredJobRequirement[]) {
  const haystack = `${title} ${requirements.map((item) => item.sourceText).join(" ")}`.toLowerCase();
  if (/\b(intern|graduate|entry|junior|assistant)\b/.test(haystack)) return "junior";
  if (/\b(senior|lead|principal|head|manager|director|executive)\b/.test(haystack)) return "senior";
  if (/\b(mid|intermediate)\b/.test(haystack)) return "mid";
  return undefined;
}

function detectIndustry(rawText: string) {
  const lower = rawText.toLowerCase();
  if (/\bhealthcare|clinical|hospital|patient|laboratory\b/.test(lower)) return "Healthcare";
  if (/\bsoftware|developer|cloud|data|engineering|technology\b/.test(lower)) return "Technology";
  if (/\bsales|retail|customer|account\b/.test(lower)) return "Sales and customer operations";
  if (/\bteacher|school|curriculum|learners?|students?\b/.test(lower)) return "Education";
  if (/\bfinance|banking|accounting|audit\b/.test(lower)) return "Finance";
  return undefined;
}

function extractEmail(rawText: string) {
  return rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
}

function extractUrl(rawText: string) {
  return rawText.match(/https?:\/\/[^\s)]+/i)?.[0];
}

function extractReferenceNumber(rawText: string) {
  return rawText.match(/\b(?:ref(?:erence)?\.?\s*(?:no\.?|number)?|reference)\s*[:#-]?\s*([A-Z0-9/-]{3,})/i)?.[1];
}

function extractRequiredDocuments(rawText: string) {
  const docs = [
    ["CV", /\bcv\b|r[Ã©e]sum[Ã©e]/i],
    ["Cover letter", /cover letter|lettre de motivation/i],
    ["Certificates", /certificates?|certificats?|qualifications?/i],
    ["Academic transcript", /transcript|relev[Ã©e] de notes/i],
    ["Portfolio", /portfolio/i]
  ] as const;
  return docs.filter(([, pattern]) => pattern.test(rawText)).map(([label]) => label);
}

function parseSalary(raw?: string): StructuredJobSalary | undefined {
  if (!raw) return undefined;
  const numbers = Array.from(raw.matchAll(/\d[\d,. ]*/g)).map((match) => Number(match[0].replace(/[ ,.]/g, ""))).filter((value) => Number.isFinite(value));
  const currency = raw.match(/\b(USD|ZAR|EUR|GBP)\b|R|\$/i)?.[0];
  const period = raw.match(/\b(month|monthly|year|annual|annually|hour|hourly|mois|an)\b/i)?.[0];
  return {
    rawText: raw,
    minimum: numbers[0],
    maximum: numbers[1],
    currency,
    period,
    confidence: numbers.length ? 0.78 : 0.58
  };
}

function summarize(input: {
  title: string;
  organization?: string;
  responsibilities: StructuredJobResponsibility[];
  requirements: StructuredJobRequirement[];
  seniority?: string;
  workArrangement?: string;
}) {
  const parts = [
    input.title ? `This ${input.seniority ? `${input.seniority} ` : ""}${input.title} role${input.organization ? ` at ${input.organization}` : ""}` : "This role",
    input.responsibilities[0]?.text ? `focuses on ${input.responsibilities[0].text.toLowerCase()}` : "has responsibilities that need review",
    input.requirements[0]?.normalizedConcept ? `and highlights ${input.requirements[0].normalizedConcept} as an important requirement` : "with requirements that need review",
    input.workArrangement ? `The work arrangement appears to be ${input.workArrangement}.` : ""
  ].filter(Boolean);
  return `${parts.slice(0, 3).join(" ")}. ${parts[3] ?? ""}`.replace(/\s+/g, " ").trim();
}

function confidenceScore(input: {
  requirements: StructuredJobRequirement[];
  responsibilities: StructuredJobResponsibility[];
  warnings: string[];
  hasTitle: boolean;
  hasOrganization: boolean;
}) {
  let score = 0.58;
  if (input.hasTitle) score += 0.08;
  if (input.hasOrganization) score += 0.06;
  if (input.requirements.length >= 2) score += 0.1;
  if (input.responsibilities.length >= 2) score += 0.08;
  if (input.requirements.some((item) => item.importance !== "unclear")) score += 0.06;
  score -= Math.min(0.22, input.warnings.length * 0.035);
  return Math.round(Math.max(0.2, Math.min(0.96, score)) * 100) / 100;
}

function collectWarnings(input: {
  title: string;
  seniority?: string;
  requirements: StructuredJobRequirement[];
  responsibilities: StructuredJobResponsibility[];
  importWarnings: string[];
}) {
  const warnings = [...input.importWarnings];
  if (!input.responsibilities.length) warnings.push("No clear responsibilities were extracted. Review the source advert.");
  if (!input.requirements.length) warnings.push("No meaningful candidate requirements were extracted. Review before matching.");
  const maxYears = Math.max(0, ...input.requirements.map((item) => item.minimumYears ?? 0));
  if (/\bjunior|graduate|entry\b/i.test(input.title) && maxYears >= 5) warnings.push("Seniority information may be inconsistent.");
  if (input.requirements.some((item) => item.importance === "unclear")) warnings.push("Some requirements need importance review.");
  return Array.from(new Set(warnings));
}

export function validateSemanticJobUnderstanding(understanding: SemanticJobUnderstanding) {
  const warnings = [...understanding.warnings];
  if (!understanding.title.trim()) warnings.push("Job title needs review.");
  if (!understanding.requirements.length) warnings.push("No meaningful requirements were found.");
  if (!understanding.responsibilities.length) warnings.push("No clear responsibilities were found.");
  if (understanding.overallConfidence < 0.45) warnings.push("Low-confidence extraction. Review carefully.");
  const seenRequirements = new Set<string>();
  const duplicate = understanding.requirements.some((requirement) => {
    const key = requirement.canonicalConceptId ?? normalizeForKey(requirement.sourceText);
    if (seenRequirements.has(key)) return true;
    seenRequirements.add(key);
    return false;
  });
  if (duplicate) warnings.push("Duplicate requirements were detected and should be reviewed.");
  return { ...understanding, warnings: Array.from(new Set(warnings)) };
}

export class DeterministicJobUnderstandingProvider implements JobUnderstandingProvider {
  async understandJob(input: { jobImport: JobImportRecord }): Promise<JobUnderstandingResult> {
    const jobImport = input.jobImport;
    const rawText = jobImport.normalizedText || jobImport.rawText || "";
    const details = jobImport.inspection.preliminaryDetails;
    const requirements = dedupeRequirements(jobImport.inspection.requirements.map((item, index) => toStructuredRequirement(item, rawText, index)));
    const responsibilities = jobImport.inspection.responsibilities.map((item, index) => toStructuredResponsibility(item, rawText, index));
    const title = clean(details.jobTitle) || "Job title needs review";
    const seniority = inferSeniority(title, requirements);
    const warnings = collectWarnings({
      title,
      seniority,
      requirements,
      responsibilities,
      importWarnings: jobImport.inspection.warnings.map((item) => item.message)
    });
    const applicationDetails: StructuredJobApplicationDetails = {
      closingDate: details.closingDate,
      applicationMethod: details.applicationInstructions,
      contactEmail: extractEmail(rawText),
      applicationUrl: extractUrl(rawText),
      referenceNumber: extractReferenceNumber(rawText),
      requiredDocuments: extractRequiredDocuments(rawText)
    };
    const sourceEvidence = [
      ...requirements.map((item) => item.evidence),
      ...responsibilities.map((item) => item.evidence)
    ];
    const understanding: SemanticJobUnderstanding = validateSemanticJobUnderstanding({
      id: `job-understanding-${jobImport.id}`,
      userId: jobImport.userId,
      jobImportId: jobImport.id,
      status: "review_required",
      language: jobImport.language,
      title,
      organization: details.organisation,
      location: details.location,
      employmentType: details.employmentType,
      workArrangement: details.workArrangement,
      seniority,
      industry: detectIndustry(rawText),
      summary: summarize({ title, organization: details.organisation, responsibilities, requirements, seniority, workArrangement: details.workArrangement }),
      responsibilities,
      requirements,
      benefits: jobImport.inspection.optionalContext.map((item) => item.text).slice(0, 8),
      salary: parseSalary(details.salary),
      applicationDetails,
      warnings,
      overallConfidence: confidenceScore({
        requirements,
        responsibilities,
        warnings,
        hasTitle: Boolean(details.jobTitle),
        hasOrganization: Boolean(details.organisation)
      }),
      modelVersion: JOB_UNDERSTANDING_MODEL_VERSION,
      promptVersion: JOB_UNDERSTANDING_PROMPT_VERSION,
      sourceEvidence,
      systemExtraction: {
        importInspection: jobImport.inspection,
        provider: "deterministic"
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { understanding };
  }
}
