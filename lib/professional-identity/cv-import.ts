import { inflateRawSync } from "node:zlib";
import { cvModelFromUnknown, normalizeCvModelForExport } from "@/components/professional-identity/document-downloads";
import type { CvModel } from "@/components/professional-identity/document-downloads";
import {
  createCanonicalCvTrace,
  createCvSourceDocument,
  cvSourceTypeFromMime,
  interpretCvSourceDocument,
  type CvInterpretationResult,
  type ExperienceRecord,
  type SourceTrace
} from "@/lib/professional-identity/cv-interpretation-engine";

export type CvImportConfidence = "high" | "medium" | "low";

export type CvImportCounts = {
  workExperiences: number;
  educationRecords: number;
  skills: number;
  certifications: number;
  languages: number;
  references: number;
  projects: number;
  achievements: number;
  unclassifiedItems: number;
  excludedSensitiveFields: number;
};

export type ImportedCvResult = {
  cvModel: CvModel;
  normalizedText: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  confidence: CvImportConfidence;
  reviewItems: string[];
  counts: CvImportCounts;
  unclassifiedItems: string[];
  excludedSensitiveNotice?: string;
  interpretation?: {
    coverage: number;
    warnings: string[];
    sourceTrace: SourceTrace[];
  };
};

export type CvImportUpload = {
  fileName: string;
  fileType: string;
  fileSize: number;
  base64: string;
};

export type CvSourceFormat = "pdf" | "docx" | "txt";
export type CvBlockType =
  | "heading"
  | "subheading"
  | "paragraph"
  | "bullet"
  | "labelValue"
  | "tableRow"
  | "tableCell"
  | "dateLine"
  | "contactLine"
  | "unknown";

export type NormalizedCvBlock = {
  id: string;
  text: string;
  normalizedText: string;
  blockType: CvBlockType;
  sourceFormat: CvSourceFormat;
  order: number;
  page: number | null;
  styleHint: string | null;
  indentation: number;
  tableContext: string | null;
  bulletContext: string | null;
  confidence: CvImportConfidence;
};

export class CvImportError extends Error {
  userMessage: string;

  constructor(message: string, userMessage = message) {
    super(message);
    this.name = "CvImportError";
    this.userMessage = userMessage;
  }
}

type SectionKey =
  | "header"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "references"
  | "achievements"
  | "volunteer"
  | "awards"
  | "publications"
  | "conferences"
  | "memberships"
  | "interests"
  | "unclassified";

const supportedTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
]);
const maxFileSize = 8 * 1024 * 1024;
const minReadableCharacters = 160;
const sensitiveLabelPattern = /\b(identity|id\s*number|passport|date\s*of\s*birth|birth\s*date|age|gender|marital|religion|health|criminal|offence|photo|photograph|residential\s+address|street\s+address)\b/i;
const valueSeparator = /\s*(?::|\s+-\s+|\t+|\s{3,})\s*/;

const headingAliases: Array<[SectionKey, RegExp]> = [
  ["summary", /^(professional\s+)?(summary|profile|objective|career\s+objective|personal\s+statement)$/i],
  ["experience", /^(professional\s+)?(experience|work\s+experience|employment\s+history|career\s+history|work\s+history|employment|career\s+experience|experiential\s+training|internship|practical\s+training|expérience\s+professionnelle|parcours\s+professionnel|stages?)$/i],
  ["education", /^(education|academic\s+details|academic\s+background|educational\s+background|qualifications|secondary\s+school\s+education|secondary\s+education|tertiary\s+education|education\s+and\s+training|training|formation|études|etudes|parcours\s+académique|parcours\s+academique|diplômes|diplomes)$/i],
  ["skills", /^(skills|core\s+skills|technical\s+skills|competencies|core\s+competencies|technical\s+competencies|duties|responsibilities|key\s+functions|expertise|compétences|competences|compétences\s+techniques|competences\s+techniques)$/i],
  ["projects", /^(projects|portfolio\s+projects|selected\s+projects|projets)$/i],
  ["certifications", /^(certifications|certificates|qualification|professional\s+qualification|registration|professional\s+registration|licenses|licences|license|licence|professional\s+certifications|accreditations|certifications\s+et\s+licences)$/i],
  ["languages", /^(languages|home\s+language|other\s+languages|language\s+skills|language\s+proficiency|langues)$/i],
  ["references", /^(references?|referees|professional\s+references|références|references)$/i],
  ["achievements", /^(achievements|accomplishments|awards\s+and\s+achievements)$/i],
  ["volunteer", /^(volunteer|volunteering|volunteer\s+experience|community\s+work)$/i],
  ["awards", /^awards$/i],
  ["publications", /^publications?$/i],
  ["conferences", /^conferences?$/i],
  ["memberships", /^(memberships|professional\s+memberships|associations)$/i],
  ["interests", /^(interests|hobbies|other\s+interests\s+and\s+activities)$/i]
];

export function validateCvImportFile(upload: Pick<CvImportUpload, "fileName" | "fileType" | "fileSize">) {
  if (!upload.fileName?.trim()) throw new CvImportError("Missing file.", "Please choose a CV file to import.");
  if (!supportedTypes.has(upload.fileType)) throw new CvImportError("Unsupported file type.", "This file format isn't supported yet. Please upload a PDF, DOCX, or TXT CV.");
  if (!upload.fileSize || upload.fileSize <= 0) throw new CvImportError("Empty file.", "This CV file appears to be empty.");
  if (upload.fileSize > maxFileSize) throw new CvImportError("File too large.", "This CV is too large. Please upload a PDF or DOCX smaller than 8MB.");
}

function decodeBase64File(base64: string) {
  const clean = base64.replace(/^data:[^;]+;base64,/, "").trim();
  if (!clean) throw new CvImportError("Missing file data.", "We could not read this CV file. Please try uploading it again.");
  return Buffer.from(clean, "base64");
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
}

function normalizeExtractedText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[–—]/g, "-")
    .replace(/[：]/g, ":")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sourceFormatFromType(fileType: string): CvSourceFormat {
  if (fileType === "application/pdf") return "pdf";
  if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  return "txt";
}

function decodePdfLiteral(value: string) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, " ")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(Number.parseInt(octal, 8)));
}

export function extractPdfText(buffer: Buffer) {
  const raw = buffer.toString("latin1");
  const textParts: string[] = [];
  const literalText = /\((?:\\.|[^\\()]){2,}\)\s*Tj/g;
  const arrayText = /\[((?:.|\n)*?)\]\s*TJ/g;
  let literalMatch: RegExpExecArray | null;
  while ((literalMatch = literalText.exec(raw))) textParts.push(decodePdfLiteral(literalMatch[0].replace(/\)\s*Tj$/, "").slice(1)));
  let arrayMatch: RegExpExecArray | null;
  while ((arrayMatch = arrayText.exec(raw))) {
    const fragments = Array.from(arrayMatch[1].matchAll(/\((?:\\.|[^\\()])*\)/g)).map((fragment) => decodePdfLiteral(fragment[0].slice(1, -1)));
    if (fragments.length) textParts.push(fragments.join(""));
  }
  if (textParts.join("").length < minReadableCharacters) {
    textParts.push(
      raw
        .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, "\n")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /[A-Za-z]{3,}/.test(line) && line.length < 180)
        .join("\n")
    );
  }
  return normalizeExtractedText(textParts.join("\n"));
}

type ZipEntry = {
  name: string;
  compression: number;
  compressedSize: number;
  localHeaderOffset: number;
};

function findEndOfCentralDirectory(buffer: Buffer) {
  for (let offset = buffer.length - 22; offset >= Math.max(0, buffer.length - 66000); offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  return -1;
}

function readZipEntries(buffer: Buffer) {
  const eocd = findEndOfCentralDirectory(buffer);
  if (eocd < 0) throw new CvImportError("Invalid DOCX zip.", "We could not read this DOCX file. Please try saving it again and re-uploading.");
  const entries = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  const result: ZipEntry[] = [];
  for (let index = 0; index < entries; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) break;
    const compression = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    result.push({ name, compression, compressedSize, localHeaderOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return result;
}

function readZipEntry(buffer: Buffer, entry: ZipEntry) {
  const offset = entry.localHeaderOffset;
  if (buffer.readUInt32LE(offset) !== 0x04034b50) throw new CvImportError("Invalid DOCX entry.", "We could not read this DOCX file.");
  const nameLength = buffer.readUInt16LE(offset + 26);
  const extraLength = buffer.readUInt16LE(offset + 28);
  const start = offset + 30 + nameLength + extraLength;
  const data = buffer.subarray(start, start + entry.compressedSize);
  if (entry.compression === 0) return data;
  if (entry.compression === 8) return inflateRawSync(data);
  throw new CvImportError("Unsupported DOCX compression.", "We could not read this DOCX file. Please export it again and try once more.");
}

export function extractDocxText(buffer: Buffer) {
  const entries = readZipEntries(buffer);
  const documentEntry = entries.find((entry) => entry.name === "word/document.xml");
  if (!documentEntry) throw new CvImportError("Missing DOCX document XML.", "We could not read the main text in this DOCX file.");
  const xml = readZipEntry(buffer, documentEntry).toString("utf8");
  const text = decodeXmlEntities(
    xml
      .replace(/<w:tab\s*\/>/g, " ")
      .replace(/<w:br\s*\/>/g, "\n")
      .replace(/<\/w:tc>/g, " : ")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<\/w:tr>/g, "\n")
      .replace(/<[^>]+>/g, "")
  );
  return normalizeExtractedText(text);
}

export function extractTextFromUploadedCv(upload: CvImportUpload) {
  validateCvImportFile(upload);
  const buffer = decodeBase64File(upload.base64);
  if (!buffer.length) throw new CvImportError("Empty decoded file.", "This CV file appears to be empty.");
  const text = upload.fileType === "application/pdf"
    ? extractPdfText(buffer)
    : upload.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ? extractDocxText(buffer)
      : normalizeExtractedText(buffer.toString("utf8"));
  if (text.replace(/\s/g, "").length < minReadableCharacters) {
    throw new CvImportError("Insufficient readable text.", "We couldn't read enough text from this CV. If it is scanned, please upload a text-based PDF, DOCX, or TXT version.");
  }
  return text;
}

function classifyBlock(line: string): CvBlockType {
  if (headingFor(line)) return "heading";
  if (lineToPair(line)) return "labelValue";
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(line) || /linkedin\.com|github\.com|https?:\/\//i.test(line)) return "contactLine";
  if (parseDateRange(line).startDate || /\b(19|20)\d{2}\b/.test(line)) return "dateLine";
  if (/^[•*\-\u2022\u25cf\u25e6\u2043]/i.test(line.trim())) return "bullet";
  if (/^[A-Z][A-Z\s/&()-]{3,}$/.test(line.trim()) && line.length <= 72) return "subheading";
  return line.length > 0 ? "paragraph" : "unknown";
}

export function createNormalizedBlocksFromText(text: string, sourceFormat: CvSourceFormat): NormalizedCvBlock[] {
  const lines = normalizeExtractedText(text).split("\n");
  const blocks: NormalizedCvBlock[] = [];
  let page = 1;
  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return;
    if (/^page\s+\d+/i.test(line)) page = Number(line.match(/\d+/)?.[0] ?? page);
    const blockType = classifyBlock(line);
    blocks.push({
      id: `${sourceFormat}-${blocks.length + 1}`,
      text: line,
      normalizedText: line.toLowerCase().replace(/\s+/g, " ").trim(),
      blockType,
      sourceFormat,
      order: index,
      page: sourceFormat === "pdf" ? page : null,
      styleHint: blockType === "heading" ? "semantic-heading" : blockType === "subheading" ? "heading-like" : null,
      indentation: rawLine.search(/\S|$/),
      tableContext: line.includes(" : ") ? "possible-table-row" : null,
      bulletContext: blockType === "bullet" ? "list-item" : null,
      confidence: blockType === "unknown" ? "low" : blockType === "paragraph" ? "medium" : "high"
    });
  });
  return blocks;
}

export function createNormalizedBlocksFromDocxText(text: string) {
  return createNormalizedBlocksFromText(text, "docx");
}

export function createNormalizedBlocksFromPdfText(text: string) {
  return createNormalizedBlocksFromText(text, "pdf");
}

export function createNormalizedBlocksFromTxtText(text: string) {
  return createNormalizedBlocksFromText(text, "txt");
}

export function extractBlocksFromUploadedCv(upload: CvImportUpload) {
  const text = extractTextFromUploadedCv(upload);
  const sourceFormat = sourceFormatFromType(upload.fileType);
  const blocks = sourceFormat === "pdf"
    ? createNormalizedBlocksFromPdfText(text)
    : sourceFormat === "docx"
      ? createNormalizedBlocksFromDocxText(text)
      : createNormalizedBlocksFromTxtText(text);
  return { text, blocks };
}

function cleanBullet(line: string) {
  return line.replace(/^[•*\-\u2022\u25cf\u25e6\u2043]+\s*/i, "").trim();
}

function lineToPair(line: string) {
  const clean = cleanBullet(line).replace(/\s+:\s+/g, ": ").trim();
  const [rawLabel, ...rest] = clean.split(valueSeparator);
  if (!rest.length) return null;
  const label = rawLabel.replace(/\s+/g, " ").trim();
  const value = rest.join(":").replace(/\s+/g, " ").trim();
  if (!label || !value || label.length > 72) return null;
  return { label, value };
}

function labelIs(label: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(label));
}

function headingFor(line: string): SectionKey | null {
  const normalized = cleanBullet(line).replace(/[:\-]+$/g, "").trim();
  if (normalized.length > 72) return null;
  return headingAliases.find(([, pattern]) => pattern.test(normalized))?.[0] ?? null;
}

function isSpecificSubheading(line: string) {
  return /^(secondary\s+school\s+education|secondary\s+education|tertiary\s+education|experiential\s+training|internship|practical\s+training|professional\s+qualification|registration|professional\s+registration)$/i.test(cleanBullet(line).replace(/[:\-]+$/g, ""));
}

function removeSensitiveLines(lines: string[]) {
  let excludedSensitiveFields = 0;
  const safeLines = lines.filter((line) => {
    const pair = lineToPair(line);
    const sensitive = sensitiveLabelPattern.test(pair?.label ?? line);
    if (sensitive) excludedSensitiveFields += 1;
    return !sensitive;
  });
  return { safeLines, excludedSensitiveFields };
}

function sectionize(blocks: NormalizedCvBlock[]) {
  const sections: Record<SectionKey, string[]> = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    references: [],
    achievements: [],
    volunteer: [],
    awards: [],
    publications: [],
    conferences: [],
    memberships: [],
    interests: [],
    unclassified: []
  };
  let current: SectionKey = "header";
  for (const block of blocks) {
    const line = block.text;
    const heading = headingFor(line);
    if (heading) {
      if (isSpecificSubheading(line)) sections[heading].push(line);
      current = heading;
      continue;
    }
    const pair = lineToPair(line);
    if (pair && /language/i.test(pair.label)) current = "languages";
    else if (pair && /^(qualification|professional\s+qualification|registration|reference\s+number|year\s+qualified)$/i.test(pair.label)) current = "certifications";
    if (current === "header" && block.order > 18 && block.blockType !== "contactLine" && block.blockType !== "labelValue") sections.unclassified.push(line);
    else sections[current].push(line);
  }
  return sections;
}

function uniqueLines(...groups: string[][]) {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const group of groups) {
    for (const item of group) {
      const clean = cleanBullet(item).replace(/\s{2,}/g, " ").trim();
      const key = clean.toLowerCase();
      if (clean && !seen.has(key)) {
        seen.add(key);
        merged.push(clean);
      }
    }
  }
  return merged;
}

function sourceTypeFromFormat(sourceFormat: CvSourceFormat) {
  if (sourceFormat === "pdf") return "pdf";
  if (sourceFormat === "docx") return "docx";
  return "pasted_text";
}

function interpretationForBlocks(blocks: NormalizedCvBlock[], sourceFormat: CvSourceFormat): CvInterpretationResult {
  const rawText = blocks.map((block) => block.text).join("\n");
  const document = createCvSourceDocument({
    sourceType: sourceTypeFromFormat(sourceFormat),
    rawText,
    extractionWarnings: []
  });
  return interpretCvSourceDocument(document);
}

function sectionsFromInterpretation(interpretation: CvInterpretationResult, legacy: Record<SectionKey, string[]>): Record<SectionKey, string[]> {
  return {
    header: uniqueLines(legacy.header, interpretation.canonicalSections.contact),
    summary: uniqueLines(legacy.summary, interpretation.canonicalSections.professional_summary, interpretation.canonicalSections.career_objective),
    experience: uniqueLines(legacy.experience, interpretation.canonicalSections.experience),
    education: uniqueLines(legacy.education, interpretation.canonicalSections.education),
    skills: uniqueLines(legacy.skills, interpretation.canonicalSections.skills),
    projects: uniqueLines(legacy.projects, interpretation.canonicalSections.projects),
    certifications: uniqueLines(legacy.certifications, interpretation.canonicalSections.certifications, interpretation.canonicalSections.licences),
    languages: uniqueLines(legacy.languages, interpretation.canonicalSections.languages),
    references: uniqueLines(legacy.references, interpretation.canonicalSections.references),
    achievements: uniqueLines(legacy.achievements),
    volunteer: uniqueLines(legacy.volunteer, interpretation.canonicalSections.volunteer_experience),
    awards: uniqueLines(legacy.awards),
    publications: uniqueLines(legacy.publications),
    conferences: uniqueLines(legacy.conferences),
    memberships: uniqueLines(legacy.memberships, interpretation.canonicalSections.memberships),
    interests: uniqueLines(legacy.interests),
    unclassified: uniqueLines(
      legacy.unclassified,
      interpretation.canonicalSections.additional_information,
      interpretation.reconciliation
        .filter((item) => item.disposition === "review" || item.disposition === "unresolved")
        .map((item) => interpretation.reconstructedBlocks.find((block) => block.id === item.sourceBlockId)?.text ?? "")
    )
  };
}

function splitList(lines: string[]) {
  return Array.from(
    new Set(
      lines
        .flatMap((line) => {
          const pair = lineToPair(line);
          return (pair?.value ?? line).split(/[,;|]/g);
        })
        .map(cleanBullet)
        .map((item) => item.replace(/\s{2,}/g, " ").trim())
        .filter((item) => item.length > 1 && item.length < 90)
    )
  );
}

function splitSkillGroups(skills: string[]) {
  const technicalPattern = /\b(sql|excel|python|javascript|typescript|react|node|figma|power\s*bi|tableau|html|css|java|c\+\+|aws|azure|git|github|linux|api|crm|sap|salesforce|microsoft|word|powerpoint|testing|analysis|analytics|reporting|database|cloud|network|security|design|research|quality\s+control|calibration|automation|machine|equipment|software|hardware|engineering|architecture)\b/i;
  const professionalPattern = /\b(communication|leadership|teamwork|customer|problem|planning|research|analysis|management|coordination|presentation|collaboration|time\s+management)\b/i;
  return {
    technicalSkills: skills.filter((skill) => technicalPattern.test(skill)),
    professionalSkills: skills.filter((skill) => !technicalPattern.test(skill) && professionalPattern.test(skill)),
    coreSkills: skills.filter((skill) => !technicalPattern.test(skill) && !professionalPattern.test(skill))
  };
}

function extractContacts(lines: string[]) {
  const pairs = lines.map(lineToPair).filter(Boolean) as Array<{ label: string; value: string }>;
  const joined = lines.join(" ");
  const email = pairs.find((pair) => /e-?mail/i.test(pair.label))?.value ?? joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const phone = pairs.find((pair) => /(contact|phone|mobile|cell)/i.test(pair.label))?.value ?? joined.match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?){2,5}\d{2,4}/)?.[0] ?? "";
  const linkedIn = joined.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^\s]+|linkedin\.com\/[^\s]+/i)?.[0] ?? "";
  const github = joined.match(/https?:\/\/(?:www\.)?github\.com\/[^\s]+|github\.com\/[^\s]+/i)?.[0] ?? "";
  const portfolio = joined.match(/https?:\/\/(?!.*(?:linkedin|github))[^\s]+/i)?.[0] ?? "";
  const fullNameFromPair = pairs.find((pair) => /^(full\s+names?|name|names?)$/i.test(pair.label))?.value ?? "";
  const headerCandidates = lines
    .map(cleanBullet)
    .filter((line) => line && !line.includes("@") && !/https?:|linkedin\.com|github\.com/i.test(line) && line !== phone)
    .filter((line) => !/^\+?\d/.test(line))
    .filter((line) => !lineToPair(line));
  const fullName = fullNameFromPair || (headerCandidates.find((line) => /^[A-Za-z][A-Za-z' -]{2,60}$/.test(line) && line.split(/\s+/).length <= 5) ?? "");
  const targetRole = headerCandidates.find((line) => line !== fullName && line.length <= 80) ?? "";
  const locationLine = lines.find((line) => /(south africa|zambia|zimbabwe|kenya|nigeria|ghana|canada|united|johannesburg|cape town|pretoria|durban|london|paris|kinshasa|lusaka|harare)/i.test(line)) ?? "";
  const [city, country] = locationLine.split(/[,|]/).map((part) => part.trim());
  return { fullName, targetRole, email, phone, linkedIn, github, portfolio, city: city ?? "", country: country ?? "" };
}

function parseDateRange(value: string) {
  const match = value.match(/((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\.?\s*\d{4}|\d{1,2}\/\d{1,2}\/\d{4})\s*[-]\s*((?:present|current|now)|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\.?\s*\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i);
  return {
    startDate: match?.[1]?.trim() ?? "",
    endDate: match?.[2]?.trim() ?? "",
    current: /present|current|now/i.test(match?.[2] ?? ""),
    titleWithoutDates: match ? value.replace(match[0], "").replace(/[|,\-]+$/g, "").trim() : value
  };
}

function compactEntry(value: string) {
  return value.replace(/\s{2,}/g, " ").trim();
}

function parseExperience(lines: string[]) {
  const result: CvModel["professionalExperience"] = [];
  let current: CvModel["professionalExperience"][number] | null = null;
  let inDuties = false;
  const pushCurrent = () => {
    if (!current) return;
    current.achievements = Array.from(new Set(current.achievements.map(compactEntry).filter(Boolean)));
    if (current.role || current.company || current.achievements.length) result.push(current);
    current = null;
    inDuties = false;
  };

  for (const rawLine of lines) {
    const line = cleanBullet(rawLine);
    if (!line) continue;
    const pair = lineToPair(line);
    const label = pair?.label ?? "";
    const value = pair?.value ?? "";

    if (headingFor(line) === "skills" || (!pair && current && /^[A-Za-z][A-Za-z /&-]{2,42}$/.test(line) && !parseDateRange(line).startDate)) {
      inDuties = true;
      if (current) current.achievements.push(line);
      continue;
    }
    if (pair && labelIs(label, [/^period$/i, /^date/i])) {
      current ??= { role: "", company: "", location: "", startDate: "", endDate: "", current: false, achievements: [] };
      const dates = parseDateRange(value);
      current.startDate = dates.startDate || value;
      current.endDate = dates.endDate;
      current.current = dates.current;
      continue;
    }
    if (pair && labelIs(label, [/^(company|employer|organisation|organization|company\/institution|institution)$/i])) {
      current ??= { role: "", company: "", location: "", startDate: "", endDate: "", current: false, achievements: [] };
      current.company = value;
      continue;
    }
    if (pair && labelIs(label, [/^(location|city)$/i])) {
      current ??= { role: "", company: "", location: "", startDate: "", endDate: "", current: false, achievements: [] };
      current.location = value;
      continue;
    }
    if (pair && labelIs(label, [/^(duties|responsibilities|key\s+functions)$/i])) {
      inDuties = true;
      current ??= { role: "", company: "", location: "", startDate: "", endDate: "", current: false, achievements: [] };
      if (value) current.achievements.push(value);
      continue;
    }
    if (pair && labelIs(label, [/^(role|job\s+title|position|title|department)$/i])) {
      if (current?.role || current?.company || current?.achievements.length) pushCurrent();
      current = { role: value, company: "", location: "", startDate: "", endDate: "", current: false, achievements: [] };
      continue;
    }
    if (pair && /^[A-Z][A-Z\s/()-]{4,}$/.test(label) && !labelIs(label, [/^(course|qualification|institution|reference|year|home\s+language|other\s+languages)$/i])) {
      if (current?.role || current?.company || current?.achievements.length) pushCurrent();
      current = { role: compactEntry(label), company: "", location: "", startDate: "", endDate: "", current: false, achievements: value ? [compactEntry(value)] : [] };
      continue;
    }
    if (/^(secondary|tertiary|qualification|institution|course|reference\s+number|year\s+qualified)\b/i.test(line)) continue;
    if (!current) {
      current = { role: line, company: "", location: "", startDate: "", endDate: "", current: false, achievements: [] };
      continue;
    }
    if (inDuties || /^[•*\-\u2022\u25cf\u25e6\u2043]/i.test(rawLine.trim()) || line.length > 60) current.achievements.push(line);
    else if (!current.role) current.role = line;
    else current.achievements.push(line);
  }
  pushCurrent();
  return result;
}

function parseEducation(lines: string[]) {
  const result: CvModel["education"] = [];
  let current: CvModel["education"][number] | null = null;
  const pushCurrent = () => {
    if (!current) return;
    if (current.qualification || current.institution || current.fieldOfStudy) result.push(current);
    current = null;
  };

  for (const rawLine of lines) {
    const line = cleanBullet(rawLine);
    if (!line) continue;
    const pair = lineToPair(line);
    if (isSpecificSubheading(line)) {
      pushCurrent();
      current = { qualification: line, institution: "", fieldOfStudy: "", year: "", status: "" };
      continue;
    }
    current ??= { qualification: "", institution: "", fieldOfStudy: "", year: "", status: "" };
    if (pair && labelIs(pair.label, [/^(institution|school|college|university)$/i])) current.institution = pair.value;
    else if (pair && labelIs(pair.label, [/^(course|qualification|program|programme|degree|diploma)$/i])) {
      current.qualification = current.qualification && !/education/i.test(current.qualification) ? current.qualification : pair.value;
      current.fieldOfStudy = pair.value;
    } else if (pair && labelIs(pair.label, [/^(period|year|dates?)$/i])) {
      const dates = parseDateRange(pair.value);
      current.year = dates.endDate || dates.startDate || pair.value;
      current.status = dates.current ? "In progress" : current.status;
    } else if (pair && labelIs(pair.label, [/^(grade|level|status|subjects?|modules?)$/i])) {
      current.status = [current.status, pair.value].filter(Boolean).join("; ");
    } else if (!pair && !headingFor(line)) {
      if (!current.qualification) current.qualification = line;
      else if (!current.institution) current.institution = line;
      else current.status = [current.status, line].filter(Boolean).join("; ");
    }
  }
  pushCurrent();
  return result;
}

function parseProjects(lines: string[]) {
  const groups = lines.reduce<Array<{ title: string; bullets: string[] }>>((items, rawLine) => {
    const line = cleanBullet(rawLine);
    if (!line) return items;
    if (!items.length || (!lineToPair(line) && !/^[•*\-\u2022\u25cf\u25e6\u2043]/i.test(rawLine.trim()))) items.push({ title: line, bullets: [] });
    else items[items.length - 1].bullets.push(line);
    return items;
  }, []);
  return groups.map((group) => ({
    projectName: group.title,
    role: "",
    tools: splitList(group.bullets).slice(0, 8),
    description: group.bullets[0] ?? "",
    impact: group.bullets.slice(1).join(" ")
  })).filter((item) => item.projectName);
}

function parseCertifications(lines: string[]) {
  const result: CvModel["certifications"] = [];
  let current: CvModel["certifications"][number] | null = null;
  const pushCurrent = () => {
    if (current?.name) result.push(current);
    current = null;
  };
  for (const rawLine of lines) {
    const line = cleanBullet(rawLine);
    if (!line) continue;
    const pair = lineToPair(line);
    if (isSpecificSubheading(line)) {
      pushCurrent();
      current = { name: line, provider: "", year: "", credentialUrl: "" };
    } else if (pair && labelIs(pair.label, [/^(qualification|professional\s+qualification|registration|licen[cs]e)$/i])) {
      pushCurrent();
      current = { name: pair.value, provider: "", year: "", credentialUrl: "" };
    } else if (pair && labelIs(pair.label, [/^reference\s+number$/i])) {
      current ??= { name: "Professional registration", provider: "", year: "", credentialUrl: "" };
      current.credentialUrl = pair.value;
    } else if (pair && labelIs(pair.label, [/^year\s+qualified$|^year$/i])) {
      current ??= { name: "Professional qualification", provider: "", year: "", credentialUrl: "" };
      current.year = pair.value;
    } else if (!pair) {
      pushCurrent();
      const parts = line.split(/[|,]/).map((part) => part.trim()).filter(Boolean);
      current = { name: parts[0] ?? line, provider: parts[1] ?? "", year: parts.find((part) => /\b\d{4}\b/.test(part)) ?? "", credentialUrl: "" };
    }
  }
  pushCurrent();
  return result;
}

function parseLanguages(lines: string[]) {
  const languages: CvModel["languages"] = [];
  for (const rawLine of lines) {
    const line = cleanBullet(rawLine);
    const pair = lineToPair(line);
    if (pair && /language/i.test(pair.label)) {
      for (const value of splitList([pair.value])) languages.push({ language: value, level: /home/i.test(pair.label) ? "Home language" : "" });
    } else if (!headingFor(line)) {
      const [language, level = ""] = line.split(/[-:]/).map((part) => part.trim());
      if (language) languages.push({ language, level });
    }
  }
  return Array.from(new Map(languages.map((item) => [item.language.toLowerCase(), item])).values());
}

function parseReferences(lines: string[]) {
  const refs: string[] = [];
  let current: Record<string, string> = {};
  const flush = () => {
    const parts = ["name", "position", "organisation", "phone", "email"].map((key) => current[key]).filter(Boolean);
    if (parts.length) refs.push(parts.join(" | "));
    current = {};
  };
  for (const rawLine of lines) {
    const line = cleanBullet(rawLine);
    if (!line) continue;
    const pair = lineToPair(line);
    if (pair && labelIs(pair.label, [/^(name|referee)$/i])) {
      if (Object.keys(current).length) flush();
      current.name = pair.value;
    } else if (pair && labelIs(pair.label, [/^(position|title)$/i])) current.position = pair.value;
    else if (pair && labelIs(pair.label, [/^(company|organisation|organization|institution)$/i])) current.organisation = pair.value;
    else if (pair && labelIs(pair.label, [/^(contact|phone|mobile|cell)$/i])) current.phone = pair.value;
    else if (pair && /e-?mail/i.test(pair.label)) current.email = pair.value;
    else if (!pair && /@/.test(line)) current.email = line;
    else if (!pair && /\d{6,}/.test(line)) current.phone = line;
    else if (!pair) {
      if (Object.keys(current).length) flush();
      current.name = line;
    }
  }
  flush();
  return refs;
}

function compactParagraph(lines: string[]) {
  return lines.map(cleanBullet).filter(Boolean).join(" ").replace(/\s{2,}/g, " ").trim();
}

function importCounts(cv: CvModel, excludedSensitiveFields: number, unclassifiedItems: string[] = []): CvImportCounts {
  return {
    workExperiences: cv.professionalExperience.length,
    educationRecords: cv.education.length,
    skills: cv.coreSkills.length + cv.technicalSkills.length + cv.professionalSkills.length,
    certifications: cv.certifications.length,
    languages: cv.languages.length,
    references: cv.references.items.length,
    projects: cv.projects.length,
    achievements: cv.achievements.length,
    unclassifiedItems: unclassifiedItems.length,
    excludedSensitiveFields
  };
}

function explicitHeadingExists(lines: string[], section: SectionKey) {
  return lines.some((line) => headingFor(line) === section || (section === "languages" && /language/i.test(lineToPair(line)?.label ?? "")));
}

function extractSkillsFromBlocks(lines: string[]) {
  return splitList(lines)
    .flatMap((item) => item.split(/\s+\/\s+|\s+and\s+/i))
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && item.length < 90);
}

function isEmailLike(value: string) {
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value);
}

function isPhoneLike(value: string) {
  return /(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?){2,5}\d{2,4}/.test(value);
}

function isPageFurniture(value: string) {
  return /^(page\s+\d+|\d+\s*\/\s*\d+|curriculum vitae|resume|cv)$|\bcontinued\b/i.test(value.trim());
}

function isDateOnly(value: string) {
  const clean = value.replace(/[|,\-–—\s]/g, "").trim();
  return Boolean(clean) && /^(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?)?(?:19|20)\d{2}(?:present|current|now|(?:19|20)\d{2})?$/i.test(clean);
}

function safeCvText(value: string) {
  const clean = compactEntry(value).replace(/\s+\|\s+$/g, "");
  if (!clean || isPageFurniture(clean)) return "";
  return clean;
}

function normalizeCompetencyStatement(parts: string[]) {
  const clean = parts.map(safeCvText).filter(Boolean);
  if (!clean.length) return "";
  const statement = clean.join(", ").replace(/\s{2,}/g, " ").replace(/\s+,/g, ",").trim();
  return /[.!?]$/.test(statement) ? statement : `${statement}.`;
}

function semanticExperienceToCv(record: ExperienceRecord): CvModel["professionalExperience"][number] | null {
  const dates = parseDateRange(record.dateText);
  const role = safeCvText(record.jobTitle);
  const company = safeCvText(record.employer);
  if (!role && !company && !record.responsibilities.length) return null;
  if (role && isDateOnly(role)) return null;
  return {
    role,
    company,
    location: safeCvText(record.location),
    startDate: dates.startDate || safeCvText(record.startDate),
    endDate: dates.endDate || safeCvText(record.endDate),
    current: dates.current,
    achievements: uniqueLines(
      record.achievements,
      record.responsibilities.map((item) => normalizeCompetencyStatement([item]))
    ).filter((item) => !isPageFurniture(item) && !isEmailLike(item) && !isPhoneLike(item))
  };
}

function cvModelFromSemanticInterpretation(
  interpretation: CvInterpretationResult,
  sections: Record<SectionKey, string[]>,
  contacts: ReturnType<typeof extractContacts>
) {
  const base = cvModelFromUnknown(null, "");
  const records = interpretation.linkedRecords;
  const skillGroups = records.skillGroups;
  const semanticSkills = splitSkillGroups(
    skillGroups.flatMap((group) => group.skills.length ? group.skills : [])
  );
  const fallbackSkills = splitSkillGroups(extractSkillsFromBlocks(sections.skills));
  const semanticExperience = records.experience.map(semanticExperienceToCv).filter(Boolean) as CvModel["professionalExperience"];
  const fallbackExperience = parseExperience(sections.experience).filter((item) => !isDateOnly(item.role));
  const semanticEducation: CvModel["education"] = records.education
    .map((record) => ({
      qualification: safeCvText(record.qualification),
      institution: safeCvText(record.institution),
      fieldOfStudy: safeCvText(record.fieldOfStudy),
      year: safeCvText(record.dateText || record.endDate || record.startDate),
      status: uniqueLines(record.modules, record.coursework).join("; ")
    }))
    .filter((item) => item.qualification || item.institution || item.status);
  const semanticLanguages = records.languages
    .map((item) => ({ language: safeCvText(item.language), level: safeCvText(item.proficiency) }))
    .filter((item) => item.language && !isEmailLike(item.language) && !isPhoneLike(item.language));
  const semanticReferences = records.references
    .map((item) => uniqueLines([item.name, item.title, item.organisation, item.phone, item.email]).join(" | "))
    .filter(Boolean);
  const fallbackReferences = parseReferences(sections.references);
  const semanticCertifications: CvModel["certifications"] = records.certifications.map((item) => ({
    name: safeCvText(item.name),
    provider: safeCvText(item.issuer),
    year: safeCvText(item.date),
    credentialUrl: safeCvText(item.credentialId)
  })).filter((item) => item.name);
  const semanticProjects: CvModel["projects"] = records.projects.map((item) => ({
    projectName: safeCvText(item.name),
    role: "",
    tools: [],
    description: safeCvText(item.description),
    impact: ""
  })).filter((item) => item.projectName);

  return {
    ...base,
    ...contacts,
    fullName: contacts.fullName || records.contact.fullName || base.fullName,
    phone: contacts.phone || records.contact.phone || "",
    email: contacts.email || records.contact.email || "",
    linkedIn: contacts.linkedIn || records.contact.linkedIn || "",
    website: records.contact.website || contacts.portfolio || "",
    professionalSummary: compactParagraph(sections.summary),
    coreSkills: uniqueLines(semanticSkills.coreSkills, fallbackSkills.coreSkills),
    technicalSkills: uniqueLines(semanticSkills.technicalSkills, fallbackSkills.technicalSkills),
    professionalSkills: uniqueLines(semanticSkills.professionalSkills, fallbackSkills.professionalSkills),
    professionalExperience: semanticExperience.length ? semanticExperience : fallbackExperience,
    education: semanticEducation.length ? semanticEducation : parseEducation(sections.education),
    projects: semanticProjects.length ? semanticProjects : parseProjects(sections.projects),
    certifications: semanticCertifications.length ? semanticCertifications : parseCertifications(sections.certifications),
    achievements: sections.achievements.map(cleanBullet).filter(Boolean),
    languages: semanticLanguages.length ? semanticLanguages : parseLanguages(sections.languages).filter((item) => !isEmailLike(item.language) && !isPhoneLike(item.language)),
    references: {
      availableUponRequest: sections.references.some((line) => /available/i.test(line)),
      items: semanticReferences.length >= fallbackReferences.length ? semanticReferences : fallbackReferences
    },
    optionalSections: {
      volunteerExperience: sections.volunteer.map(cleanBullet).filter(Boolean),
      awards: sections.awards.map(cleanBullet).filter(Boolean),
      publications: sections.publications.map(cleanBullet).filter(Boolean),
      conferences: sections.conferences.map(cleanBullet).filter(Boolean),
      professionalMemberships: sections.memberships.map(cleanBullet).filter(Boolean),
      interests: splitList(sections.interests),
      portfolioLinks: contacts.portfolio ? [contacts.portfolio] : [],
      qrCodePlaceholder: ""
    }
  } satisfies CvModel;
}

export function validateCanonicalCvInvariants(cv: CvModel) {
  const errors: string[] = [];
  const allContent = JSON.stringify(cv);
  if (cv.languages.some((item) => isEmailLike(item.language) || isEmailLike(item.level))) errors.push("Email-shaped value was placed in languages.");
  if (cv.languages.some((item) => isPhoneLike(item.language) || isPhoneLike(item.level))) errors.push("Phone-shaped value was placed in languages.");
  if (cv.languages.some((item) => /street|avenue|road|drive|po box|postal/i.test(`${item.language} ${item.level}`))) errors.push("Address-shaped contact value was placed in languages.");
  if (cv.professionalExperience.some((item) => isDateOnly(item.role))) errors.push("Date-only value was placed as an experience role.");
  if (/\bcontinued\b/i.test(allContent)) errors.push("Continuation header reached CanonicalCv content.");
  if (/(^|["\s])page\s+\d+/i.test(allContent) || /["\s]\d{1,2}\s*\/\s*\d{1,2}["\s]/.test(allContent)) errors.push("Page number reached CanonicalCv content.");
  if (cv.professionalExperience.some((item) => item.role.includes("|") && !item.company && !item.startDate && !item.endDate)) errors.push("Pipe-separated experience string substituted for structured experience.");
  if (cv.education.some((item) => item.qualification.length > 180 || /;.*;.*;/.test(item.qualification))) errors.push("Qualification appears to have absorbed a module list.");
  const skillCategories = new Set(["technical skills", "core skills", "professional skills", "tools", "technologies", "competencies"]);
  if ([...cv.coreSkills, ...cv.technicalSkills, ...cv.professionalSkills].some((item) => skillCategories.has(item.toLowerCase().replace(/:$/, "")))) errors.push("Skill category heading was emitted as an ordinary skill.");
  if (errors.length) {
    throw new CvImportError(`Semantic CV invariant failed: ${errors.join("; ")}`, "We read the document, but some content needs review before PATHZY can safely create the CV.");
  }
}

function assertPlausibleImport(cv: CvModel, lines: string[], excludedSensitiveFields: number) {
  const counts = importCounts(cv, excludedSensitiveFields);
  const experienceLabelOnly = cv.professionalExperience.filter((item) => /^(period|qualification|company|institution|duties|course)$/i.test(item.role)).length;
  if (
    counts.workExperiences > 25 ||
    (explicitHeadingExists(lines, "education") && counts.educationRecords === 0) ||
    (explicitHeadingExists(lines, "languages") && counts.languages === 0) ||
    (counts.workExperiences > 8 && counts.workExperiences > Math.max(3, Math.floor(lines.length / 3))) ||
    experienceLabelOnly > 0
  ) {
    throw new CvImportError(
      "Implausible CV import classification.",
      "We read the document, but some sections need better interpretation before we create your PATHZY CV."
    );
  }
}

function reviewItemsFor(cv: CvModel, textLength: number, excludedSensitiveFields: number) {
  return [
    !cv.fullName ? "Full name needs review." : "",
    !cv.targetRole ? "Professional title needs review." : "",
    !cv.email && !cv.phone ? "Contact details need review." : "",
    !cv.professionalExperience.length ? "Experience section needs review." : "",
    !cv.education.length ? "Education section needs review." : "",
    textLength < 600 ? "The readable text was short, so please review the imported details." : "",
    excludedSensitiveFields ? "We found personal information that is usually unnecessary in a modern CV. It was not added." : ""
  ].filter(Boolean);
}

function mapImportedBlocksToCvModelWithMeta(blocks: NormalizedCvBlock[]) {
  const normalizedText = normalizeExtractedText(blocks.map((block) => block.text).join("\n"));
  const rawLines = blocks.map((block) => block.text).filter(Boolean);
  const { safeLines, excludedSensitiveFields } = removeSensitiveLines(rawLines);
  const safeSet = new Set(safeLines);
  const safeBlocks = blocks.filter((block) => safeSet.has(block.text));
  const sourceFormat = safeBlocks[0]?.sourceFormat ?? "txt";
  const interpretation = interpretationForBlocks(safeBlocks, sourceFormat);
  const sections = sectionsFromInterpretation(interpretation, sectionize(safeBlocks));
  const contacts = extractContacts(sections.header.length ? sections.header : safeLines.slice(0, 14));
  const cvModel = cvModelFromSemanticInterpretation(interpretation, sections, contacts);
  const normalizedCv = normalizeCvModelForExport(cvModel);
  validateCanonicalCvInvariants(normalizedCv);
  assertPlausibleImport(normalizedCv, safeLines, excludedSensitiveFields);
  return {
    cvModel: normalizedCv,
    normalizedText,
    excludedSensitiveFields,
    unclassifiedItems: sections.unclassified,
    interpretation: {
      coverage: interpretation.coverage,
      warnings: interpretation.warnings,
      sourceTrace: createCanonicalCvTrace(normalizedCv, interpretation)
    }
  };
}

function mapImportedTextToCvModelWithMeta(text: string, sourceFormat: CvSourceFormat = "txt") {
  return mapImportedBlocksToCvModelWithMeta(createNormalizedBlocksFromText(text, sourceFormat));
}

export function mapImportedTextToCvModel(text: string) {
  return mapImportedTextToCvModelWithMeta(text).cvModel;
}

export function buildCvImportResult(upload: Pick<CvImportUpload, "fileName" | "fileType" | "fileSize">, normalizedText: string): ImportedCvResult {
  const sourceDocument = createCvSourceDocument({
    sourceType: cvSourceTypeFromMime(upload.fileType),
    fileName: upload.fileName,
    mimeType: upload.fileType,
    rawText: normalizedText
  });
  if (sourceDocument.extractionState === "requires_ocr") {
    throw new CvImportError("OCR required.", "We could not read enough selectable text from this CV. If it is scanned, please upload a text-based PDF, DOCX, or TXT version.");
  }
  const mapped = mapImportedTextToCvModelWithMeta(normalizedText, sourceFormatFromType(upload.fileType));
  const counts = importCounts(mapped.cvModel, mapped.excludedSensitiveFields, mapped.unclassifiedItems);
  const reviewItems = reviewItemsFor(mapped.cvModel, mapped.normalizedText.length, mapped.excludedSensitiveFields);
  const confidence: CvImportConfidence = reviewItems.length <= 1 ? "high" : reviewItems.length <= 3 ? "medium" : "low";
  return {
    cvModel: mapped.cvModel,
    normalizedText: mapped.normalizedText,
    fileName: upload.fileName,
    fileType: upload.fileType,
    fileSize: upload.fileSize,
    confidence,
    reviewItems,
    counts,
    unclassifiedItems: mapped.unclassifiedItems,
    excludedSensitiveNotice: mapped.excludedSensitiveFields ? "We found personal information that is usually unnecessary in a modern CV. It was not added." : undefined,
    interpretation: mapped.interpretation
  };
}

export function importCvFromUpload(upload: CvImportUpload) {
  const { text, blocks } = extractBlocksFromUploadedCv(upload);
  const mapped = mapImportedBlocksToCvModelWithMeta(blocks);
  const counts = importCounts(mapped.cvModel, mapped.excludedSensitiveFields, mapped.unclassifiedItems);
  const reviewItems = reviewItemsFor(mapped.cvModel, mapped.normalizedText.length, mapped.excludedSensitiveFields);
  const confidence: CvImportConfidence = reviewItems.length + mapped.unclassifiedItems.length <= 1 ? "high" : reviewItems.length <= 3 ? "medium" : "low";
  return {
    cvModel: mapped.cvModel,
    normalizedText: text,
    fileName: upload.fileName,
    fileType: upload.fileType,
    fileSize: upload.fileSize,
    confidence,
    reviewItems,
    counts,
    unclassifiedItems: mapped.unclassifiedItems,
    excludedSensitiveNotice: mapped.excludedSensitiveFields ? "We found personal information that is usually unnecessary in a modern CV. It was not added." : undefined,
    interpretation: mapped.interpretation
  };
}
