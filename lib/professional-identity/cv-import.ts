import { inflateRawSync } from "node:zlib";
import { cvModelFromUnknown, normalizeCvModelForExport } from "@/components/professional-identity/document-downloads";
import type { CvModel } from "@/components/professional-identity/document-downloads";

export type CvImportConfidence = "high" | "medium" | "low";

export type CvImportCounts = {
  workExperiences: number;
  educationRecords: number;
  skills: number;
  certifications: number;
  languages: number;
  projects: number;
  achievements: number;
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
};

export type CvImportUpload = {
  fileName: string;
  fileType: string;
  fileSize: number;
  base64: string;
};

export class CvImportError extends Error {
  userMessage: string;

  constructor(message: string, userMessage = message) {
    super(message);
    this.name = "CvImportError";
    this.userMessage = userMessage;
  }
}

const supportedTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);
const maxFileSize = 8 * 1024 * 1024;
const minReadableCharacters = 160;

export function validateCvImportFile(upload: Pick<CvImportUpload, "fileName" | "fileType" | "fileSize">) {
  if (!upload.fileName?.trim()) {
    throw new CvImportError("Missing file.", "Please choose a CV file to import.");
  }
  if (!supportedTypes.has(upload.fileType)) {
    throw new CvImportError("Unsupported file type.", "This file format isn't supported yet. Please upload a PDF or DOCX CV.");
  }
  if (!upload.fileSize || upload.fileSize <= 0) {
    throw new CvImportError("Empty file.", "This CV file appears to be empty.");
  }
  if (upload.fileSize > maxFileSize) {
    throw new CvImportError("File too large.", "This CV is too large. Please upload a PDF or DOCX smaller than 8MB.");
  }
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
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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

  while ((literalMatch = literalText.exec(raw))) {
    textParts.push(decodePdfLiteral(literalMatch[0].replace(/\)\s*Tj$/, "").slice(1)));
  }

  let arrayMatch: RegExpExecArray | null;
  while ((arrayMatch = arrayText.exec(raw))) {
    const arrayContent = arrayMatch[1];
    const fragments = Array.from(arrayContent.matchAll(/\((?:\\.|[^\\()])*\)/g)).map((fragment) => decodePdfLiteral(fragment[0].slice(1, -1)));
    if (fragments.length) textParts.push(fragments.join(""));
  }

  if (textParts.join("").length < minReadableCharacters) {
    const fallback = raw
      .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /[A-Za-z]{3,}/.test(line) && line.length < 180)
      .join("\n");
    textParts.push(fallback);
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
  const text = upload.fileType === "application/pdf" ? extractPdfText(buffer) : extractDocxText(buffer);
  if (text.replace(/\s/g, "").length < minReadableCharacters) {
    throw new CvImportError("Insufficient readable text.", "We couldn't read enough text from this CV. If it is scanned, please upload a text-based PDF or DOCX.");
  }
  return text;
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
  | "interests";

const headingAliases: Array<[SectionKey, RegExp]> = [
  ["summary", /^(professional\s+)?(summary|profile|objective|career\s+objective|personal\s+statement)$/i],
  ["experience", /^(professional\s+)?(experience|work\s+experience|employment\s+history|career\s+history|work\s+history|employment|career\s+experience)$/i],
  ["education", /^(education|academic\s+background|qualifications|education\s+and\s+training|training)$/i],
  ["skills", /^(skills|core\s+skills|technical\s+skills|competencies|core\s+competencies|expertise)$/i],
  ["projects", /^(projects|portfolio\s+projects|selected\s+projects)$/i],
  ["certifications", /^(certifications|certificates|licenses|licences|professional\s+certifications)$/i],
  ["languages", /^(languages|language\s+skills)$/i],
  ["references", /^references?$/i],
  ["achievements", /^(achievements|accomplishments|awards\s+and\s+achievements)$/i],
  ["volunteer", /^(volunteer|volunteering|volunteer\s+experience|community\s+work)$/i],
  ["awards", /^awards$/i],
  ["publications", /^publications?$/i],
  ["conferences", /^conferences?$/i],
  ["memberships", /^(memberships|professional\s+memberships|associations)$/i],
  ["interests", /^(interests|hobbies)$/i]
];

function headingFor(line: string): SectionKey | null {
  const normalized = line.replace(/[:•\-–—]+$/g, "").trim();
  if (normalized.length > 48) return null;
  return headingAliases.find(([, pattern]) => pattern.test(normalized))?.[0] ?? null;
}

function sectionize(lines: string[]) {
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
    interests: []
  };
  let current: SectionKey = "header";
  for (const line of lines) {
    const heading = headingFor(line);
    if (heading) {
      current = heading;
      continue;
    }
    sections[current].push(line);
  }
  return sections;
}

function cleanBullet(line: string) {
  return line.replace(/^[•*\-\u2022\u25CF\u25E6\u2043]+\s*/, "").trim();
}

function splitList(lines: string[]) {
  return Array.from(
    new Set(
      lines
        .flatMap((line) => line.split(/[,;|]/g))
        .map(cleanBullet)
        .map((item) => item.replace(/\s{2,}/g, " ").trim())
        .filter((item) => item.length > 1 && item.length < 80)
    )
  );
}

function splitSkillGroups(skills: string[]) {
  const technicalPattern = /\b(sql|excel|python|javascript|typescript|react|node|figma|power\s*bi|tableau|html|css|java|c\+\+|aws|azure|git|github|linux|api|crm|sap|salesforce|microsoft|word|powerpoint)\b/i;
  const professionalPattern = /\b(communication|leadership|teamwork|customer|problem|planning|research|analysis|management|coordination|presentation|collaboration|time\s+management)\b/i;
  return {
    technicalSkills: skills.filter((skill) => technicalPattern.test(skill)),
    professionalSkills: skills.filter((skill) => !technicalPattern.test(skill) && professionalPattern.test(skill)),
    coreSkills: skills.filter((skill) => !technicalPattern.test(skill) && !professionalPattern.test(skill))
  };
}

function extractContacts(lines: string[]) {
  const joined = lines.join(" ");
  const email = joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const phone = joined.match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?){2,5}\d{2,4}/)?.[0] ?? "";
  const linkedIn = joined.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^\s]+|linkedin\.com\/[^\s]+/i)?.[0] ?? "";
  const github = joined.match(/https?:\/\/(?:www\.)?github\.com\/[^\s]+|github\.com\/[^\s]+/i)?.[0] ?? "";
  const portfolio = joined.match(/https?:\/\/(?!.*(?:linkedin|github))[^\s]+/i)?.[0] ?? "";
  const headerCandidates = lines
    .map(cleanBullet)
    .filter((line) => line && !line.includes("@") && !/https?:|linkedin\.com|github\.com/i.test(line) && line !== phone)
    .filter((line) => !/^\+?\d/.test(line));
  const fullName = headerCandidates.find((line) => /^[A-Za-z][A-Za-z' -]{2,60}$/.test(line) && line.split(/\s+/).length <= 5) ?? "";
  const targetRole = headerCandidates.find((line) => line !== fullName && line.length <= 80) ?? "";
  const locationLine = lines.find((line) => /(south africa|zambia|zimbabwe|kenya|nigeria|ghana|canada|united|johannesburg|cape town|pretoria|durban|london|paris|kinshasa|lusaka|harare)/i.test(line)) ?? "";
  const [city, country] = locationLine.split(/[,|]/).map((part) => part.trim());
  return { fullName, targetRole, email, phone, linkedIn, github, portfolio, city: city ?? "", country: country ?? "" };
}

function groupEntries(lines: string[]) {
  const groups: Array<{ title: string; bullets: string[] }> = [];
  let current: { title: string; bullets: string[] } | null = null;

  for (const rawLine of lines) {
    const line = cleanBullet(rawLine);
    if (!line) continue;
    const isBullet = /^[•*\-\u2022\u25CF\u25E6\u2043]/.test(rawLine.trim()) || line.length > 90;
    if (!isBullet) {
      if (current) groups.push(current);
      current = { title: line, bullets: [] };
    } else if (current) {
      current.bullets.push(line);
    } else {
      current = { title: line, bullets: [] };
    }
  }

  if (current) groups.push(current);
  return groups;
}

function parseDateRange(value: string) {
  const match = value.match(/((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\.?\s*\d{4})\s*[-–—]\s*((?:present|current|now)|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\.?\s*\d{4})/i);
  return {
    startDate: match?.[1]?.trim() ?? "",
    endDate: match?.[2]?.trim() ?? "",
    current: /present|current|now/i.test(match?.[2] ?? ""),
    titleWithoutDates: match ? value.replace(match[0], "").replace(/[|,\-–—]+$/g, "").trim() : value
  };
}

function parseExperience(lines: string[]) {
  return groupEntries(lines).map((group) => {
    const dates = parseDateRange(group.title);
    const parts = dates.titleWithoutDates.split(/\s+(?:at|@)\s+|[|]/i).map((part) => part.trim()).filter(Boolean);
    return {
      role: parts[0] ?? dates.titleWithoutDates,
      company: parts[1] ?? "",
      location: parts[2] ?? "",
      startDate: dates.startDate,
      endDate: dates.endDate,
      current: dates.current,
      achievements: group.bullets.length ? group.bullets : []
    };
  }).filter((item) => item.role || item.achievements.length);
}

function parseEducation(lines: string[]) {
  return groupEntries(lines).map((group) => {
    const dates = parseDateRange(group.title);
    const parts = dates.titleWithoutDates.split(/[|,]/).map((part) => part.trim()).filter(Boolean);
    return {
      qualification: parts[0] ?? dates.titleWithoutDates,
      institution: parts[1] ?? "",
      fieldOfStudy: parts[2] ?? "",
      year: dates.endDate || dates.startDate,
      status: dates.current ? "In progress" : ""
    };
  }).filter((item) => item.qualification);
}

function parseProjects(lines: string[]) {
  return groupEntries(lines).map((group) => ({
    projectName: group.title,
    role: "",
    tools: splitList(group.bullets).slice(0, 8),
    description: group.bullets[0] ?? "",
    impact: group.bullets.slice(1).join(" ")
  })).filter((item) => item.projectName);
}

function parseCertifications(lines: string[]) {
  return lines.map(cleanBullet).filter(Boolean).map((line) => {
    const parts = line.split(/[|,]/).map((part) => part.trim()).filter(Boolean);
    return { name: parts[0] ?? line, provider: parts[1] ?? "", year: parts.find((part) => /\b\d{4}\b/.test(part)) ?? "", credentialUrl: "" };
  }).filter((item) => item.name);
}

function parseLanguages(lines: string[]) {
  return splitList(lines).map((line) => {
    const [language, level = ""] = line.split(/[-–—:]/).map((part) => part.trim());
    return { language, level };
  }).filter((item) => item.language);
}

function compactParagraph(lines: string[]) {
  return lines.map(cleanBullet).filter(Boolean).join(" ").replace(/\s{2,}/g, " ").trim();
}

function importCounts(cv: CvModel): CvImportCounts {
  return {
    workExperiences: cv.professionalExperience.length,
    educationRecords: cv.education.length,
    skills: cv.coreSkills.length + cv.technicalSkills.length + cv.professionalSkills.length,
    certifications: cv.certifications.length,
    languages: cv.languages.length,
    projects: cv.projects.length,
    achievements: cv.achievements.length
  };
}

function reviewItemsFor(cv: CvModel, textLength: number) {
  const reviewItems = [
    !cv.fullName ? "Full name needs review." : "",
    !cv.targetRole ? "Professional title needs review." : "",
    !cv.email && !cv.phone ? "Contact details need review." : "",
    !cv.professionalExperience.length ? "Experience section needs review." : "",
    !cv.education.length ? "Education section needs review." : "",
    textLength < 600 ? "The readable text was short, so please review the imported details." : ""
  ].filter(Boolean);
  return reviewItems;
}

export function mapImportedTextToCvModel(text: string) {
  const normalizedText = normalizeExtractedText(text);
  const lines = normalizedText.split("\n").map((line) => line.trim()).filter(Boolean);
  const sections = sectionize(lines);
  const contacts = extractContacts(sections.header.length ? sections.header : lines.slice(0, 10));
  const skills = splitSkillGroups(splitList(sections.skills));
  const base = cvModelFromUnknown(null, "");
  const cvModel: CvModel = {
    ...base,
    ...contacts,
    professionalSummary: compactParagraph(sections.summary),
    ...skills,
    professionalExperience: parseExperience(sections.experience),
    education: parseEducation(sections.education),
    projects: parseProjects(sections.projects),
    certifications: parseCertifications(sections.certifications),
    achievements: sections.achievements.map(cleanBullet).filter(Boolean),
    languages: parseLanguages(sections.languages),
    references: {
      availableUponRequest: sections.references.some((line) => /available/i.test(line)),
      items: sections.references.filter((line) => !/available/i.test(line)).map(cleanBullet).filter(Boolean)
    },
    optionalSections: {
      volunteerExperience: sections.volunteer.map(cleanBullet).filter(Boolean),
      awards: sections.awards.map(cleanBullet).filter(Boolean),
      publications: sections.publications.map(cleanBullet).filter(Boolean),
      conferences: sections.conferences.map(cleanBullet).filter(Boolean),
      professionalMemberships: sections.memberships.map(cleanBullet).filter(Boolean),
      interests: sections.interests.map(cleanBullet).filter(Boolean),
      portfolioLinks: contacts.portfolio ? [contacts.portfolio] : [],
      qrCodePlaceholder: ""
    }
  };
  return normalizeCvModelForExport(cvModel);
}

export function buildCvImportResult(upload: Pick<CvImportUpload, "fileName" | "fileType" | "fileSize">, normalizedText: string): ImportedCvResult {
  const cvModel = mapImportedTextToCvModel(normalizedText);
  const counts = importCounts(cvModel);
  const reviewItems = reviewItemsFor(cvModel, normalizedText.length);
  const confidence: CvImportConfidence = reviewItems.length <= 1 ? "high" : reviewItems.length <= 3 ? "medium" : "low";
  return {
    cvModel,
    normalizedText,
    fileName: upload.fileName,
    fileType: upload.fileType,
    fileSize: upload.fileSize,
    confidence,
    reviewItems,
    counts
  };
}

export function importCvFromUpload(upload: CvImportUpload) {
  const text = extractTextFromUploadedCv(upload);
  return buildCvImportResult(upload, text);
}
