import type { CvModel } from "@/components/professional-identity/document-downloads";

export type CvSourceDocument = {
  sourceType: "pdf" | "docx" | "text" | "pasted_text";
  fileName?: string;
  mimeType?: string;
  rawText: string;
  pages?: SourcePage[];
  extractionWarnings: string[];
  extractionQuality: number;
  extractionState: "ok" | "requires_ocr" | "failed";
};

export type SourcePage = {
  pageNumber: number;
  rawText: string;
};

export type SourceUnit = {
  id: string;
  text: string;
  page?: number;
  sourceOrder: number;
  blockType?: "line" | "paragraph" | "table_cell" | "unknown";
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  styleHints?: {
    bold?: boolean;
    fontSize?: number;
    uppercase?: boolean;
  };
};

export type BoundaryRelationship =
  | "same_sentence"
  | "same_record"
  | "child_item"
  | "new_item"
  | "new_section"
  | "field_pair"
  | "unrelated";

export type BoundaryDecision = {
  leftUnitId: string;
  rightUnitId: string;
  relationship: BoundaryRelationship;
  confidence: number;
  reasons: string[];
};

export type ReconstructedBlock = {
  id: string;
  sourceUnitIds: string[];
  text: string;
  blockKind:
    | "heading_candidate"
    | "record_candidate"
    | "list_candidate"
    | "paragraph_candidate"
    | "contact_candidate"
    | "date_candidate"
    | "continuation_candidate"
    | "unknown";
  parentHint?: string;
  continuationOf?: string;
  reconstructionConfidence: number;
  reconstructionReasons: string[];
};

export type SemanticRole =
  | "person_name"
  | "professional_title"
  | "professional_summary"
  | "career_objective"
  | "email"
  | "phone"
  | "alternate_phone"
  | "location"
  | "address"
  | "website"
  | "linkedin"
  | "portfolio"
  | "language"
  | "language_proficiency"
  | "job_title"
  | "employer"
  | "employment_date"
  | "employment_location"
  | "responsibility"
  | "achievement"
  | "qualification"
  | "institution"
  | "education_date"
  | "education_location"
  | "coursework"
  | "module"
  | "certification"
  | "certification_issuer"
  | "certification_date"
  | "skill"
  | "skill_category"
  | "tool"
  | "technology"
  | "instrument"
  | "methodology"
  | "competency"
  | "licence"
  | "membership"
  | "project"
  | "project_description"
  | "volunteer_role"
  | "volunteer_organisation"
  | "reference_name"
  | "reference_title"
  | "reference_organisation"
  | "reference_phone"
  | "reference_email"
  | "section_heading"
  | "document_header"
  | "document_footer"
  | "page_number"
  | "continuation_label"
  | "unknown";

export type InterpretationConfidence = {
  score: number;
  level: "high" | "medium" | "low";
  reasons: string[];
};

export type SemanticBlock = {
  id: string;
  blockId: string;
  text: string;
  roles: SemanticRole[];
  sectionHint?: CanonicalCvSectionKey;
  confidence: InterpretationConfidence;
};

export type SourceTrace = {
  sourceUnitIds: string[];
  originalText: string[];
  transformation: "preserved" | "joined" | "split" | "normalised" | "deduplicated" | "reclassified";
};

export type ExperienceRecord = {
  id: string;
  jobTitle: string;
  employer: string;
  location: string;
  startDate: string;
  endDate: string;
  dateText: string;
  responsibilities: string[];
  achievements: string[];
  sourceBlockIds: string[];
  confidence: InterpretationConfidence;
};

export type EducationRecord = {
  id: string;
  qualification: string;
  fieldOfStudy: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  dateText: string;
  modules: string[];
  coursework: string[];
  sourceBlockIds: string[];
  confidence: InterpretationConfidence;
};

export type CertificationRecord = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
  sourceBlockIds: string[];
  confidence: InterpretationConfidence;
};

export type SkillGroup = {
  category: string;
  skills: string[];
  sourceBlockIds: string[];
  confidence: InterpretationConfidence;
};

export type ReferenceRecord = {
  id: string;
  name: string;
  title: string;
  organisation: string;
  phone: string;
  email: string;
  sourceBlockIds: string[];
  confidence: InterpretationConfidence;
};

export type LanguageRecord = {
  language: string;
  proficiency: string;
  sourceBlockIds: string[];
  confidence: InterpretationConfidence;
};

export type LinkedCvRecords = {
  contact: Record<string, string>;
  experience: ExperienceRecord[];
  education: EducationRecord[];
  certifications: CertificationRecord[];
  skillGroups: SkillGroup[];
  references: ReferenceRecord[];
  languages: LanguageRecord[];
  projects: Array<{ id: string; name: string; description: string; sourceBlockIds: string[]; confidence: InterpretationConfidence }>;
  unresolved: SemanticBlock[];
};

export type CanonicalCvSectionKey =
  | "contact"
  | "professional_summary"
  | "career_objective"
  | "experience"
  | "education"
  | "certifications"
  | "skills"
  | "languages"
  | "projects"
  | "volunteer_experience"
  | "licences"
  | "memberships"
  | "references"
  | "additional_information";

export type ReconciliationItem = {
  sourceBlockId: string;
  disposition: "mapped" | "merged" | "deduplicated" | "noise" | "unresolved" | "review";
  targetRecordId?: string;
  reason: string;
};

export type InterpretationDiagnostic = {
  sourceUnitId: string;
  sourceText: string;
  reconstructedBlockId?: string;
  semanticRoles: SemanticRole[];
  linkedRecordId?: string;
  canonicalSection?: CanonicalCvSectionKey;
  normalisedOutput?: string;
};

export type CvInterpretationResult = {
  sourceDocument: CvSourceDocument;
  sourceUnits: SourceUnit[];
  boundaryDecisions: BoundaryDecision[];
  reconstructedBlocks: ReconstructedBlock[];
  semanticBlocks: SemanticBlock[];
  linkedRecords: LinkedCvRecords;
  canonicalSections: Record<CanonicalCvSectionKey, string[]>;
  normalisedOutput: Record<CanonicalCvSectionKey, string[]>;
  reconciliation: ReconciliationItem[];
  diagnostics: InterpretationDiagnostic[];
  coverage: number;
  warnings: string[];
};

const readableMinimum = 160;
const sectionOntology: Array<[CanonicalCvSectionKey, RegExp]> = [
  ["professional_summary", /\b(summary|profile|objective|career objective|personal statement|profil|objectif)\b/i],
  ["experience", /\b(experience|employment|career history|work history|work experience|internship|practical training|stages?|experience professionnelle|parcours professionnel)\b/i],
  ["education", /\b(education|academic|qualification|formation|etudes|diplome|degree|diploma|school|university|college)\b/i],
  ["certifications", /\b(certification|certificate|credential|accreditation|registration|licen[cs]e)\b/i],
  ["skills", /\b(skill|competenc|expertise|tool|technology|technical|methodolog|competence)\b/i],
  ["languages", /\b(language|langue|bilingual|fluent|native)\b/i],
  ["projects", /\b(project|portfolio|case study|projet)\b/i],
  ["volunteer_experience", /\b(volunteer|community|benevol)\b/i],
  ["memberships", /\b(membership|association|professional body)\b/i],
  ["references", /\b(reference|referee|references|reference professionnelle)\b/i],
  ["additional_information", /\b(award|publication|conference|interest|hobby|additional)\b/i]
];

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phonePattern = /(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?){2,5}\d{2,4}/;
const urlPattern = /(?:https?:\/\/|www\.|linkedin\.com|github\.com)[^\s]+/i;
const datePattern = /\b(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*)?(?:19|20)\d{2}\b|\b\d{1,2}\/\d{1,2}\/(?:19|20)\d{2}\b/i;
const pageFurniturePattern = /^(page\s+\d+|\d+\s*\/\s*\d+|curriculum vitae|resume|cv)$|\bcontinued\b/i;
const bulletPrefixPattern = /^[*\-\u2022\u25cf\u25e6\u2043]\s*/;

function cleanText(value: string) {
  return value.replace(/\r/g, "\n").replace(/\u0000/g, "").replace(/[ \t]+/g, " ").trim();
}

function confidence(score: number, reasons: string[]): InterpretationConfidence {
  const clamped = Math.max(0, Math.min(1, score));
  return { score: clamped, level: clamped >= 0.78 ? "high" : clamped >= 0.48 ? "medium" : "low", reasons };
}

function isLikelyHeading(text: string) {
  const clean = text.replace(/[:\-]+$/g, "").trim();
  if (!clean || clean.length > 80) return false;
  if (sectionOntology.some(([, pattern]) => pattern.test(clean))) return true;
  return /^[A-Z][A-Z0-9 &/().,-]{3,}$/.test(clean) && clean.split(/\s+/).length <= 7;
}

function canonicalSectionFromHeading(text: string): CanonicalCvSectionKey | undefined {
  const clean = text.replace(/[:\-]+$/g, "").trim();
  return sectionOntology.find(([, pattern]) => pattern.test(clean))?.[0];
}

function blockKindFor(text: string): ReconstructedBlock["blockKind"] {
  if (isLikelyHeading(text)) return "heading_candidate";
  if (emailPattern.test(text) || phonePattern.test(text) || urlPattern.test(text)) return "contact_candidate";
  if (datePattern.test(text) && text.length <= 80) return "date_candidate";
  if (bulletPrefixPattern.test(text) || /^(\d+\.|\([a-z]\))\s+/i.test(text)) return "list_candidate";
  if (/:\s*\S/.test(text) || /\s{2,}|\|/.test(text)) return "record_candidate";
  if (text.length <= 4 || !/[A-Za-z]/.test(text)) return "unknown";
  return "paragraph_candidate";
}

function roleEvidence(text: string, sectionHint?: CanonicalCvSectionKey): SemanticRole[] {
  const roles = new Set<SemanticRole>();
  const clean = text.replace(bulletPrefixPattern, "").trim();
  const lower = clean.toLowerCase();

  if (pageFurniturePattern.test(clean)) roles.add(/page|\d+\s*\/\s*\d+/.test(lower) ? "page_number" : "continuation_label");
  if (isLikelyHeading(clean)) roles.add("section_heading");
  if (emailPattern.test(clean)) roles.add("email");
  if (phonePattern.test(clean)) roles.add(lower.includes("alternate") ? "alternate_phone" : "phone");
  if (/linkedin\.com/i.test(clean)) roles.add("linkedin");
  else if (/github\.com/i.test(clean)) roles.add("website");
  else if (urlPattern.test(clean)) roles.add("website");
  if (sectionHint === "languages" && !emailPattern.test(clean) && !phonePattern.test(clean)) roles.add("language");
  if (sectionHint === "skills") roles.add(/^(technical|core|professional|tools?|technolog)/i.test(clean) ? "skill_category" : "skill");
  if (sectionHint === "education") {
    if (/\b(university|college|school|academy|institute|institution)\b/i.test(clean)) roles.add("institution");
    else if (/\b(degree|diploma|certificate|qualification|programme|program|course)\b/i.test(clean)) roles.add("qualification");
    else if (datePattern.test(clean)) roles.add("education_date");
    else roles.add("coursework");
  }
  if (sectionHint === "experience") {
    if (datePattern.test(clean) && clean.length <= 90) roles.add("employment_date");
    else if (/\b(company|employer|organisation|organization)\b/i.test(clean)) roles.add("employer");
    else if (clean.length <= 80 && !/[.!?]$/.test(clean)) roles.add("job_title");
    else roles.add("responsibility");
  }
  if (sectionHint === "references") {
    if (emailPattern.test(clean)) roles.add("reference_email");
    else if (phonePattern.test(clean)) roles.add("reference_phone");
    else if (/\b(manager|director|supervisor|lecturer|title|position)\b/i.test(clean)) roles.add("reference_title");
    else roles.add("reference_name");
  }
  if (sectionHint === "certifications") roles.add(datePattern.test(clean) ? "certification_date" : "certification");
  if (sectionHint === "projects") roles.add(clean.length <= 80 ? "project" : "project_description");
  if (sectionHint === "professional_summary") roles.add("professional_summary");
  if (!roles.size && /^[A-Za-z][A-Za-z' -]{2,60}$/.test(clean) && clean.split(/\s+/).length <= 5) roles.add("person_name");
  if (!roles.size) roles.add("unknown");

  return Array.from(roles);
}

function labelValue(text: string) {
  const match = text.match(/^([^:|]{2,72})\s*(?::|\|)\s*(.+)$/);
  if (!match) return null;
  return { label: match[1].replace(/\s+/g, " ").trim(), value: match[2].replace(/\s+/g, " ").trim() };
}

function isSentenceContinuation(left: string, right: string) {
  const leftClean = left.trim();
  const rightClean = right.trim();
  if (!leftClean || !rightClean || isLikelyHeading(rightClean)) return false;
  if (/[.!?;:]$/.test(leftClean)) return false;
  if (/^(and|or|with|for|to|of|in|on|by|while|including)\b/i.test(rightClean)) return true;
  if (/^[a-z(]/.test(rightClean)) return true;
  return false;
}

function semanticDomainEvidence(text: string) {
  const domains = new Set<string>();
  if (emailPattern.test(text) || phonePattern.test(text) || urlPattern.test(text)) domains.add("contact");
  if (datePattern.test(text)) domains.add("date");
  if (/\b(university|college|school|academy|institute|institution|degree|diploma|course|module|qualification)\b/i.test(text)) domains.add("education");
  if (/\b(company|employer|organisation|organization|position|role|duties|responsibilities)\b/i.test(text)) domains.add("experience");
  if (/\b(skill|tool|technology|competenc|method|procedure|quality|operate|maintain|calibrat|test|review)\b/i.test(text)) domains.add("competency");
  if (/\b(reference|referee|manager|lecturer|supervisor)\b/i.test(text)) domains.add("reference");
  if (/\b(language|fluent|native|basic|intermediate|advanced)\b/i.test(text)) domains.add("language");
  return domains;
}

export function blockCohesionScore(text: string) {
  const domains = semanticDomainEvidence(text);
  const delimiterCount = (text.match(/\||:/g) ?? []).length;
  const sentenceCount = text.split(/[.!?]+/).filter((part) => part.trim().length > 12).length;
  const score = Math.max(0, 1 - Math.max(0, domains.size - 2) * 0.22 - Math.max(0, delimiterCount - 4) * 0.08 - Math.max(0, sentenceCount - 4) * 0.08);
  return { score, domains: Array.from(domains) };
}

function normaliseProfessionalStatement(parts: string[]) {
  const joined = parts
    .map((part) => part.replace(bulletPrefixPattern, "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!joined) return "";
  const capitalised = joined.charAt(0).toUpperCase() + joined.slice(1);
  return /[.!?]$/.test(capitalised) ? capitalised : `${capitalised}.`;
}

export function createCvSourceDocument(input: {
  sourceType: CvSourceDocument["sourceType"];
  rawText: string;
  fileName?: string;
  mimeType?: string;
  pages?: SourcePage[];
  extractionWarnings?: string[];
}): CvSourceDocument {
  const rawText = input.rawText.replace(/\r/g, "\n");
  const readable = rawText.replace(/\s/g, "").length;
  const warnings = [...(input.extractionWarnings ?? [])];
  if (readable < readableMinimum) warnings.push("Insufficient machine-readable text; OCR may be required.");
  return {
    sourceType: input.sourceType,
    fileName: input.fileName,
    mimeType: input.mimeType,
    rawText,
    pages: input.pages,
    extractionWarnings: warnings,
    extractionQuality: Math.min(1, readable / 1200),
    extractionState: readable < readableMinimum ? "requires_ocr" : "ok"
  };
}

export function createSourceUnits(document: CvSourceDocument): SourceUnit[] {
  const units: SourceUnit[] = [];
  let currentPage = 1;
  const lines = document.rawText.replace(/\r/g, "\n").split("\n");
  lines.forEach((raw, index) => {
    const text = cleanText(raw);
    if (!text) return;
    const pageMatch = text.match(/^page\s+(\d+)/i);
    if (pageMatch) currentPage = Number(pageMatch[1]);
    units.push({
      id: `source-${units.length + 1}`,
      text,
      page: document.sourceType === "pdf" ? currentPage : undefined,
      sourceOrder: index,
      blockType: text.includes(" : ") || text.includes("\t") ? "table_cell" : "line",
      styleHints: {
        uppercase: /^[A-Z0-9 &/().,-]{4,}$/.test(text),
        bold: isLikelyHeading(text)
      }
    });
  });
  return units;
}

export function inferBoundaryDecisions(units: SourceUnit[]): BoundaryDecision[] {
  const decisions: BoundaryDecision[] = [];
  for (let index = 0; index < units.length - 1; index += 1) {
    const left = units[index];
    const right = units[index + 1];
    const reasons: string[] = [];
    let relationship: BoundaryRelationship = "new_item";
    let score = 0.58;

    if (isLikelyHeading(right.text)) {
      relationship = "new_section";
      reasons.push("right unit looks like a section heading");
      score = 0.86;
    } else if (labelValue(left.text) || labelValue(right.text)) {
      relationship = "field_pair";
      reasons.push("label-value structure detected");
      score = 0.74;
    } else if (isSentenceContinuation(left.text, right.text)) {
      relationship = "same_sentence";
      reasons.push("adjacent units look like wrapped sentence fragments");
      score = 0.72;
    } else if (datePattern.test(right.text) || datePattern.test(left.text)) {
      relationship = "same_record";
      reasons.push("date evidence is likely metadata for a neighbouring record");
      score = 0.65;
    } else if (bulletPrefixPattern.test(right.text)) {
      relationship = "child_item";
      reasons.push("right unit is a bullet child item");
      score = 0.78;
    } else if (pageFurniturePattern.test(left.text) || pageFurniturePattern.test(right.text)) {
      relationship = "unrelated";
      reasons.push("page furniture should not control semantic placement");
      score = 0.84;
    }

    decisions.push({ leftUnitId: left.id, rightUnitId: right.id, relationship, confidence: score, reasons });
  }
  return decisions;
}

export function reconstructDocument(units: SourceUnit[], decisions: BoundaryDecision[]): ReconstructedBlock[] {
  const blocks: ReconstructedBlock[] = [];
  let pending: SourceUnit[] = [];
  const flush = (reason = "preserved source unit") => {
    if (!pending.length) return;
    const text = normaliseProfessionalStatement(pending.map((unit) => unit.text));
    const cohesion = blockCohesionScore(text);
    blocks.push({
      id: `block-${blocks.length + 1}`,
      sourceUnitIds: pending.map((unit) => unit.id),
      text,
      blockKind: cohesion.score < 0.45 ? "unknown" : blockKindFor(text),
      reconstructionConfidence: pending.length > 1 ? 0.76 : 0.68,
      reconstructionReasons: [
        ...(pending.length > 1 ? ["joined source fragments using boundary inference"] : []),
        reason,
        `cohesion=${cohesion.score.toFixed(2)} domains=${cohesion.domains.join(",") || "general"}`
      ]
    });
    pending = [];
  };

  units.forEach((unit, index) => {
    if (pageFurniturePattern.test(unit.text)) {
      flush("noise boundary before page furniture");
      blocks.push({
        id: `block-${blocks.length + 1}`,
        sourceUnitIds: [unit.id],
        text: unit.text,
        blockKind: "unknown",
        reconstructionConfidence: 0.9,
        reconstructionReasons: ["page furniture candidate"]
      });
      return;
    }
    pending.push(unit);
    const decision = decisions[index];
    if (!decision || !["same_sentence"].includes(decision.relationship)) {
      flush(decision?.relationship ?? "end of source");
    }
  });
  flush("end of document");
  return blocks;
}

export function inferSemanticRoles(blocks: ReconstructedBlock[]): SemanticBlock[] {
  const semanticBlocks: SemanticBlock[] = [];
  let activeSection: CanonicalCvSectionKey | undefined = "contact";

  for (const block of blocks) {
    const headingSection = canonicalSectionFromHeading(block.text);
    if (headingSection) activeSection = headingSection;
    const roles = roleEvidence(block.text, activeSection);
    const reasons = [
      headingSection ? `heading maps to ${headingSection}` : "",
      activeSection ? `current section context is ${activeSection}` : "",
      block.reconstructionReasons.join("; ")
    ].filter(Boolean);
    semanticBlocks.push({
      id: `semantic-${semanticBlocks.length + 1}`,
      blockId: block.id,
      text: block.text,
      roles,
      sectionHint: headingSection ? undefined : activeSection,
      confidence: confidence(roles.includes("unknown") ? 0.38 : roles.includes("section_heading") ? 0.86 : 0.66, reasons)
    });
  }
  return semanticBlocks;
}

function appendUnique(target: string[], value: string) {
  const clean = value.replace(bulletPrefixPattern, "").trim();
  if (clean && !target.some((item) => item.toLowerCase() === clean.toLowerCase())) target.push(clean);
}

export function linkSemanticRecords(semanticBlocks: SemanticBlock[]): LinkedCvRecords {
  const records: LinkedCvRecords = {
    contact: {},
    experience: [],
    education: [],
    certifications: [],
    skillGroups: [],
    references: [],
    languages: [],
    projects: [],
    unresolved: []
  };
  let currentExperience: ExperienceRecord | null = null;
  let currentEducation: EducationRecord | null = null;
  let currentSkillGroup: SkillGroup | null = null;
  let currentReference: ReferenceRecord | null = null;

  const flushExperience = () => {
    if (currentExperience && (currentExperience.jobTitle || currentExperience.employer || currentExperience.responsibilities.length)) records.experience.push(currentExperience);
    currentExperience = null;
  };
  const flushEducation = () => {
    if (currentEducation && (currentEducation.qualification || currentEducation.institution || currentEducation.modules.length)) records.education.push(currentEducation);
    currentEducation = null;
  };
  const flushSkillGroup = () => {
    if (currentSkillGroup && (currentSkillGroup.category || currentSkillGroup.skills.length)) records.skillGroups.push(currentSkillGroup);
    currentSkillGroup = null;
  };
  const flushReference = () => {
    if (currentReference && (currentReference.name || currentReference.phone || currentReference.email)) records.references.push(currentReference);
    currentReference = null;
  };

  semanticBlocks.forEach((block) => {
    if (block.roles.includes("section_heading") || block.roles.includes("page_number") || block.roles.includes("continuation_label")) return;
    const text = block.text.replace(bulletPrefixPattern, "").trim();
    const pair = labelValue(text);
    const value = pair?.value ?? text;

    if (block.roles.includes("email")) records.contact.email ??= text.match(emailPattern)?.[0] ?? value;
    if (block.roles.includes("phone")) records.contact.phone ??= text.match(phonePattern)?.[0] ?? value;
    if (block.roles.includes("linkedin")) records.contact.linkedIn ??= value;
    if (block.roles.includes("website")) records.contact.website ??= value;
    if (block.roles.includes("person_name") && !records.contact.fullName) records.contact.fullName = value;

    if (block.sectionHint === "experience") {
      flushEducation();
      flushSkillGroup();
      flushReference();
      currentExperience ??= {
        id: `experience-${records.experience.length + 1}`,
        jobTitle: "",
        employer: "",
        location: "",
        startDate: "",
        endDate: "",
        dateText: "",
        responsibilities: [],
        achievements: [],
        sourceBlockIds: [],
        confidence: confidence(0.62, ["experience section context"])
      };
      currentExperience.sourceBlockIds.push(block.blockId);
      if (block.roles.includes("employment_date")) currentExperience.dateText = value;
      else if (pair && /\b(company|employer|organisation|organization|institution)\b/i.test(pair.label)) currentExperience.employer = value;
      else if (pair && /\b(role|position|title|department)\b/i.test(pair.label)) {
        if (currentExperience.jobTitle) flushExperience();
        currentExperience ??= {
          id: `experience-${records.experience.length + 1}`,
          jobTitle: "",
          employer: "",
          location: "",
          startDate: "",
          endDate: "",
          dateText: "",
          responsibilities: [],
          achievements: [],
          sourceBlockIds: [block.blockId],
          confidence: confidence(0.62, ["experience section context"])
        };
        currentExperience.jobTitle = value;
      } else if (!currentExperience.jobTitle && text.length <= 90) currentExperience.jobTitle = text;
      else appendUnique(currentExperience.responsibilities, text);
      return;
    }

    if (block.sectionHint === "education") {
      flushExperience();
      flushSkillGroup();
      flushReference();
      currentEducation ??= {
        id: `education-${records.education.length + 1}`,
        qualification: "",
        fieldOfStudy: "",
        institution: "",
        location: "",
        startDate: "",
        endDate: "",
        dateText: "",
        modules: [],
        coursework: [],
        sourceBlockIds: [],
        confidence: confidence(0.62, ["education section context"])
      };
      currentEducation.sourceBlockIds.push(block.blockId);
      if (block.roles.includes("institution")) currentEducation.institution = value;
      else if (block.roles.includes("education_date")) currentEducation.dateText = value;
      else if (block.roles.includes("qualification")) currentEducation.qualification = value;
      else appendUnique(currentEducation.modules, value);
      return;
    }

    if (block.sectionHint === "skills") {
      flushExperience();
      flushEducation();
      flushReference();
      if (block.roles.includes("skill_category")) {
        flushSkillGroup();
        currentSkillGroup = { category: value.replace(/:$/, ""), skills: [], sourceBlockIds: [block.blockId], confidence: confidence(0.68, ["skill category evidence"]) };
      } else {
        currentSkillGroup ??= { category: "", skills: [], sourceBlockIds: [], confidence: confidence(0.58, ["skill section context"]) };
        currentSkillGroup.sourceBlockIds.push(block.blockId);
        value.split(/[,;|]/).forEach((item) => appendUnique(currentSkillGroup!.skills, item));
      }
      return;
    }

    if (block.sectionHint === "languages" && !block.roles.includes("email") && !block.roles.includes("phone")) {
      flushExperience();
      flushEducation();
      flushSkillGroup();
      const [language, proficiency = ""] = value.split(/[-:|]/).map((part) => part.trim());
      if (language) records.languages.push({ language, proficiency, sourceBlockIds: [block.blockId], confidence: confidence(0.62, ["language section context"]) });
      return;
    }

    if (block.sectionHint === "references") {
      flushExperience();
      flushEducation();
      flushSkillGroup();
      currentReference ??= { id: `reference-${records.references.length + 1}`, name: "", title: "", organisation: "", phone: "", email: "", sourceBlockIds: [], confidence: confidence(0.62, ["reference section context"]) };
      currentReference.sourceBlockIds.push(block.blockId);
      if (block.roles.includes("reference_email")) currentReference.email = text.match(emailPattern)?.[0] ?? value;
      else if (block.roles.includes("reference_phone")) currentReference.phone = text.match(phonePattern)?.[0] ?? value;
      else if (!currentReference.name) currentReference.name = value;
      else if (!currentReference.title) currentReference.title = value;
      else currentReference.organisation = [currentReference.organisation, value].filter(Boolean).join(" | ");
      return;
    }

    if (block.sectionHint === "certifications") {
      records.certifications.push({ id: `certification-${records.certifications.length + 1}`, name: value, issuer: "", date: datePattern.test(value) ? value.match(datePattern)?.[0] ?? "" : "", credentialId: "", sourceBlockIds: [block.blockId], confidence: confidence(0.62, ["certification section context"]) });
      return;
    }

    if (block.sectionHint === "projects") {
      records.projects.push({ id: `project-${records.projects.length + 1}`, name: value, description: "", sourceBlockIds: [block.blockId], confidence: confidence(0.62, ["project section context"]) });
      return;
    }

    if (!["email", "phone", "linkedin", "website", "person_name"].some((role) => block.roles.includes(role as SemanticRole))) records.unresolved.push(block);
  });

  flushExperience();
  flushEducation();
  flushSkillGroup();
  flushReference();
  return records;
}

export function classifyCanonicalSections(semanticBlocks: SemanticBlock[], records: LinkedCvRecords): Record<CanonicalCvSectionKey, string[]> {
  const sections: Record<CanonicalCvSectionKey, string[]> = {
    contact: [],
    professional_summary: [],
    career_objective: [],
    experience: [],
    education: [],
    certifications: [],
    skills: [],
    languages: [],
    projects: [],
    volunteer_experience: [],
    licences: [],
    memberships: [],
    references: [],
    additional_information: []
  };

  for (const block of semanticBlocks) {
    if (block.roles.includes("section_heading") || block.roles.includes("page_number") || block.roles.includes("continuation_label")) continue;
    const target = block.sectionHint ?? (block.roles.includes("email") || block.roles.includes("phone") ? "contact" : undefined);
    if (!target) continue;
    if (!semanticTargetIsCompatible(block.roles, target)) {
      appendUnique(sections.additional_information, block.text);
      continue;
    }
    appendUnique(sections[target], block.text);
  }

  Object.values(records.contact).forEach((value) => appendUnique(sections.contact, value));
  records.unresolved.forEach((block) => appendUnique(sections.additional_information, block.text));
  return sections;
}

export function semanticTargetIsCompatible(roles: SemanticRole[], target: CanonicalCvSectionKey) {
  if (roles.includes("email")) return target === "contact" || target === "references";
  if (roles.includes("phone") || roles.includes("alternate_phone")) return target === "contact" || target === "references";
  if (roles.includes("language") || roles.includes("language_proficiency")) return target === "languages";
  if (roles.includes("employment_date")) return target === "experience";
  if (roles.includes("education_date")) return target === "education";
  if (roles.includes("continuation_label") || roles.includes("page_number")) return false;
  return true;
}

export function normaliseProfessionalContent(sections: Record<CanonicalCvSectionKey, string[]>): Record<CanonicalCvSectionKey, string[]> {
  const normalised = {} as Record<CanonicalCvSectionKey, string[]>;
  for (const key of Object.keys(sections) as CanonicalCvSectionKey[]) {
    normalised[key] = Array.from(new Set(sections[key].map((item) => normaliseProfessionalStatement([item])).filter(Boolean)));
  }
  return normalised;
}

export function validateSemanticDocument(semanticBlocks: SemanticBlock[], records: LinkedCvRecords) {
  const warnings: string[] = [];
  if (semanticBlocks.some((block) => block.sectionHint === "languages" && (block.roles.includes("email") || block.roles.includes("phone")))) {
    warnings.push("Contact evidence appeared near languages and was protected from language placement.");
  }
  if (records.experience.some((record) => datePattern.test(record.jobTitle) && record.jobTitle.length < 40)) {
    warnings.push("A date appeared as an experience title candidate and needs review.");
  }
  if (semanticBlocks.some((block) => blockCohesionScore(block.text).score < 0.45)) {
    warnings.push("A low-cohesion reconstructed block was kept out of automatic structured placement.");
  }
  if (records.unresolved.length) warnings.push("Some meaningful content remained unresolved for review.");
  return warnings;
}

export function reconcileSourceToOutput(blocks: ReconstructedBlock[], semanticBlocks: SemanticBlock[], records: LinkedCvRecords): ReconciliationItem[] {
  const mappedBlockIds = new Set<string>();
  records.experience.forEach((record) => record.sourceBlockIds.forEach((id) => mappedBlockIds.add(id)));
  records.education.forEach((record) => record.sourceBlockIds.forEach((id) => mappedBlockIds.add(id)));
  records.certifications.forEach((record) => record.sourceBlockIds.forEach((id) => mappedBlockIds.add(id)));
  records.skillGroups.forEach((record) => record.sourceBlockIds.forEach((id) => mappedBlockIds.add(id)));
  records.references.forEach((record) => record.sourceBlockIds.forEach((id) => mappedBlockIds.add(id)));
  records.languages.forEach((record) => record.sourceBlockIds.forEach((id) => mappedBlockIds.add(id)));
  records.projects.forEach((record) => record.sourceBlockIds.forEach((id) => mappedBlockIds.add(id)));
  const unresolvedIds = new Set(records.unresolved.map((block) => block.blockId));
  const semanticByBlock = new Map(semanticBlocks.map((block) => [block.blockId, block]));

  return blocks.map((block) => {
    const semantic = semanticByBlock.get(block.id);
    if (semantic?.roles.includes("page_number") || semantic?.roles.includes("continuation_label")) return { sourceBlockId: block.id, disposition: "noise", reason: "document furniture" };
    if (mappedBlockIds.has(block.id)) return { sourceBlockId: block.id, disposition: "mapped", reason: "linked into a semantic record" };
    if (unresolvedIds.has(block.id)) return { sourceBlockId: block.id, disposition: "review", reason: "meaningful content could not be placed with high confidence" };
    if (semantic?.roles.includes("section_heading")) return { sourceBlockId: block.id, disposition: "mapped", reason: "used as section context" };
    return { sourceBlockId: block.id, disposition: "unresolved", reason: "no confident target record" };
  });
}

export function buildInterpretationDiagnostics(
  units: SourceUnit[],
  blocks: ReconstructedBlock[],
  semanticBlocks: SemanticBlock[],
  reconciliation: ReconciliationItem[],
  normalisedOutput: Record<CanonicalCvSectionKey, string[]>
): InterpretationDiagnostic[] {
  const blockByUnitId = new Map<string, ReconstructedBlock>();
  blocks.forEach((block) => block.sourceUnitIds.forEach((unitId) => blockByUnitId.set(unitId, block)));
  const semanticByBlock = new Map(semanticBlocks.map((block) => [block.blockId, block]));
  const reconciliationByBlock = new Map(reconciliation.map((item) => [item.sourceBlockId, item]));
  return units.map((unit) => {
    const block = blockByUnitId.get(unit.id);
    const semantic = block ? semanticByBlock.get(block.id) : undefined;
    const reconciliationItem = block ? reconciliationByBlock.get(block.id) : undefined;
    const section = semantic?.sectionHint;
    return {
      sourceUnitId: unit.id,
      sourceText: unit.text,
      reconstructedBlockId: block?.id,
      semanticRoles: semantic?.roles ?? ["unknown"],
      linkedRecordId: reconciliationItem?.targetRecordId,
      canonicalSection: section,
      normalisedOutput: section ? normalisedOutput[section]?.find((item) => item.includes(semantic?.text ?? "")) : undefined
    };
  });
}

export function interpretCvSourceDocument(document: CvSourceDocument): CvInterpretationResult {
  const sourceUnits = createSourceUnits(document);
  const boundaryDecisions = inferBoundaryDecisions(sourceUnits);
  const reconstructedBlocks = reconstructDocument(sourceUnits, boundaryDecisions);
  const semanticBlocks = inferSemanticRoles(reconstructedBlocks);
  const linkedRecords = linkSemanticRecords(semanticBlocks);
  const canonicalSections = classifyCanonicalSections(semanticBlocks, linkedRecords);
  const normalisedOutput = normaliseProfessionalContent(canonicalSections);
  const warnings = [...document.extractionWarnings, ...validateSemanticDocument(semanticBlocks, linkedRecords)];
  const reconciliation = reconcileSourceToOutput(reconstructedBlocks, semanticBlocks, linkedRecords);
  const meaningful = reconciliation.filter((item) => item.disposition !== "noise").length || 1;
  const covered = reconciliation.filter((item) => ["mapped", "merged", "deduplicated"].includes(item.disposition)).length;
  const diagnostics = buildInterpretationDiagnostics(sourceUnits, reconstructedBlocks, semanticBlocks, reconciliation, normalisedOutput);

  return {
    sourceDocument: document,
    sourceUnits,
    boundaryDecisions,
    reconstructedBlocks,
    semanticBlocks,
    linkedRecords,
    canonicalSections,
    normalisedOutput,
    reconciliation,
    diagnostics,
    coverage: Math.min(1, covered / meaningful),
    warnings
  };
}

export function cvSourceTypeFromMime(mimeType: string): CvSourceDocument["sourceType"] {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx";
  return "text";
}

export function createCanonicalCvTrace(cv: CvModel, interpretation: CvInterpretationResult): SourceTrace[] {
  const allCvText = JSON.stringify(cv).toLowerCase();
  return interpretation.reconstructedBlocks.map((block) => ({
    sourceUnitIds: block.sourceUnitIds,
    originalText: [block.text],
    transformation: allCvText.includes(block.text.toLowerCase().slice(0, 24)) ? "preserved" : block.sourceUnitIds.length > 1 ? "joined" : "reclassified"
  }));
}
