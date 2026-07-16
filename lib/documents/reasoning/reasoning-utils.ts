import { createHash } from "node:crypto";
import { EMPLOYMENT_CONTRADICTION_WEIGHTS, EMPLOYMENT_MATCH_WEIGHTS, REASONING_ENGINE_VERSION, REASONING_TAXONOMY_VERSION, SOURCE_RELIABILITY_WEIGHTS } from "./reasoning.constants";
import type { SemanticDate, SemanticDocumentModel, SemanticEmploymentEntry } from "@/lib/documents/semantic";
import type { CareerEvidenceRecord, DateComparisonResult, EvidenceSourceType, ReasoningBlockingKey, ReasoningCandidateGroup, ReasoningCasePriority, ReasoningSignal, SkillRelationship } from "./reasoning.types";

const legalSuffixPattern = /\b(limited|ltd|pty|inc|incorporated|corp|corporation|company|co|gmbh|sa|plc|llc|ngo|npc)\b/gi;
const punctuationPattern = /[.,:;()[\]{}'"]/g;
const seniorityPattern = /\b(junior|jr|senior|sr|lead|principal|head|chief|assistant|trainee|intern)\b/gi;
const titleStopWords = /\b(the|and|of|for|at|in|to|de|du|des|la|le|les|et)\b/gi;
const roleFamilies: Array<{ family: string; terms: string[] }> = [
  { family: "customer_service_sales", terms: ["customer", "client", "sales", "advisor", "consultant", "service", "commercial", "retail"] },
  { family: "technology_data", terms: ["software", "developer", "engineer", "data", "analyst", "it", "support", "systems", "cloud"] },
  { family: "administration_operations", terms: ["admin", "administrator", "office", "coordinator", "operations", "assistant", "records"] },
  { family: "healthcare_clinical", terms: ["clinical", "health", "nurse", "medical", "patient", "care"] },
  { family: "education_training", terms: ["teacher", "educator", "lecturer", "trainer", "curriculum", "academic"] },
  { family: "leadership_management", terms: ["manager", "director", "executive", "leader", "supervisor", "head"] },
  { family: "trades_technical", terms: ["technician", "mechanic", "electrician", "artisan", "operator", "maintenance"] }
];

export function clampReasoningConfidence(value: number) {
  return Number(Math.max(0, Math.min(1, value)).toFixed(3));
}

export function normalizeReasoningText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—]/g, "-")
    .replace(punctuationPattern, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function normalizeOrganisationName(value: string | null | undefined) {
  return normalizeReasoningText(value).replace(legalSuffixPattern, " ").replace(/\s+/g, " ").trim();
}

export function normalizeTitle(value: string | null | undefined) {
  return normalizeReasoningText(value).replace(seniorityPattern, " ").replace(titleStopWords, " ").replace(/\s+/g, " ").trim();
}

export function titleSeniority(value: string | null | undefined) {
  const normalized = normalizeReasoningText(value);
  if (/\b(chief|head|director|executive)\b/.test(normalized)) return 5;
  if (/\b(principal|lead|manager)\b/.test(normalized)) return 4;
  if (/\b(senior|sr)\b/.test(normalized)) return 3;
  if (/\b(junior|jr|assistant|trainee|intern)\b/.test(normalized)) return 1;
  return 2;
}

function tokens(value: string) {
  return normalizeReasoningText(value).split(/\s+/).filter((token) => token.length > 2 && !titleStopWords.test(token));
}

export function tokenSimilarity(a: string | undefined, b: string | undefined) {
  const aTokens = new Set(tokens(a ?? ""));
  const bTokens = new Set(tokens(b ?? ""));
  if (!aTokens.size || !bTokens.size) return 0;
  const shared = [...aTokens].filter((token) => bTokens.has(token)).length;
  return shared / Math.max(aTokens.size, bTokens.size);
}

export function roleFamilyForTitle(title: string | null | undefined) {
  const normalized = normalizeTitle(title);
  if (!normalized) return "unknown";
  const titleTokens = new Set(tokens(normalized));
  const scored = roleFamilies
    .map((family) => ({ family: family.family, score: family.terms.filter((term) => titleTokens.has(term)).length }))
    .sort((a, b) => b.score - a.score);
  return scored[0]?.score ? scored[0].family : "unknown";
}

export function compareTitles(a: string | undefined, b: string | undefined) {
  const normalizedA = normalizeTitle(a);
  const normalizedB = normalizeTitle(b);
  if (!normalizedA || !normalizedB) return 0;
  if (normalizedA === normalizedB) return 1;
  const familyA = roleFamilyForTitle(a);
  const familyB = roleFamilyForTitle(b);
  const familyScore = familyA !== "unknown" && familyA === familyB ? 0.55 : 0;
  return clampReasoningConfidence(Math.max(tokenSimilarity(normalizedA, normalizedB), familyScore));
}

export function compareSkills(a: string[], b: string[]): { relationship: SkillRelationship; score: number } {
  const score = tokenSimilarity(a.join(" "), b.join(" "));
  if (score >= 0.9) return { relationship: "same_skill", score };
  if (score >= 0.72) return { relationship: "alias", score };
  if (score >= 0.42) return { relationship: "related_skill", score };
  return { relationship: "different_skill", score };
}

function datePoint(date: SemanticDate | undefined, boundary: "start" | "end") {
  if (!date?.normalized?.year) {
    if (date?.normalized?.current) return boundary === "end" ? 9999 * 12 : undefined;
    return undefined;
  }
  const month = date.normalized.month ?? (boundary === "start" ? 1 : 12);
  return date.normalized.year * 12 + month;
}

export function compareSemanticDateRanges(aStart?: SemanticDate, aEnd?: SemanticDate, bStart?: SemanticDate, bEnd?: SemanticDate): DateComparisonResult {
  const aS = datePoint(aStart, "start");
  const aE = datePoint(aEnd, "end") ?? aS;
  const bS = datePoint(bStart, "start");
  const bE = datePoint(bEnd, "end") ?? bS;
  if (aS === undefined || aE === undefined || bS === undefined || bE === undefined) {
    return { relation: "unknown", confidence: 0.35, explanation: "One or both records do not provide enough date detail." };
  }
  if (aS === bS && aE === bE) return { relation: "exact", overlapRatio: 1, confidence: 0.96, explanation: "The date ranges match exactly at the available precision." };
  const overlap = Math.max(0, Math.min(aE, bE) - Math.max(aS, bS) + 1);
  const union = Math.max(aE, bE) - Math.min(aS, bS) + 1;
  const overlapRatio = union > 0 ? overlap / union : 0;
  if (overlapRatio >= 0.82) return { relation: "compatible", overlapRatio, confidence: 0.86, explanation: "The date ranges are compatible at their stated precision." };
  if (overlapRatio > 0) return { relation: "overlapping", overlapRatio, confidence: 0.62, explanation: "The date ranges partially overlap." };
  if (Math.abs(aS - bE) <= 1 || Math.abs(bS - aE) <= 1) return { relation: "adjacent", overlapRatio: 0, confidence: 0.58, explanation: "The date ranges are adjacent and may represent progression." };
  return { relation: "conflicting", overlapRatio: 0, confidence: 0.76, explanation: "The date ranges do not overlap." };
}

export function sourceTypeForDocumentType(documentType: string): EvidenceSourceType {
  const normalized = normalizeReasoningText(documentType);
  if (normalized.includes("reference")) return "reference_letter";
  if (normalized.includes("transcript")) return "academic_transcript";
  if (normalized.includes("certificate") || normalized.includes("licence")) return "certificate";
  if (normalized.includes("linkedin")) return "linkedin";
  if (normalized.includes("cover")) return "cover_letter";
  if (normalized.includes("portfolio")) return "portfolio";
  if (normalized.includes("employment")) return "official_employment_document";
  if (normalized.includes("cv") || normalized.includes("resume") || normalized.includes("old_cv")) return "cv";
  return "unknown";
}

export function reliabilityForSource(sourceType: EvidenceSourceType) {
  return SOURCE_RELIABILITY_WEIGHTS[sourceType] ?? SOURCE_RELIABILITY_WEIGHTS.unknown;
}

function valueRegionIds(values: Array<{ sourceRegionIds: string[] } | undefined>) {
  return [...new Set(values.flatMap((value) => value?.sourceRegionIds ?? []))];
}

export function collectReasoningRecords(input: { semanticModels: SemanticDocumentModel[]; existingProfile?: Record<string, unknown> | null }) {
  const records: CareerEvidenceRecord[] = [];
  for (const model of input.semanticModels) {
    const sourceType = sourceTypeForDocumentType(model.documentType);
    for (const employment of model.employment) {
      records.push(recordFromEmployment(model, employment, sourceType));
    }
    for (const education of model.education) {
      records.push({
        id: `${model.id}:${education.id}`,
        userId: model.userId,
        entityType: "education",
        semanticReadingId: model.id,
        documentId: model.documentId,
        sourceType,
        qualification: education.qualification?.value,
        institution: education.institution?.value,
        location: education.location?.city?.value ?? education.location?.country?.value,
        startDate: education.startDate,
        endDate: education.endDate ?? education.graduationDate,
        responsibilities: [],
        achievements: [],
        skills: [education.fieldOfStudy?.value ?? ""].filter(Boolean),
        confidence: education.confidence,
        entityIds: [education.id],
        regionIds: valueRegionIds([education.qualification, education.institution, education.fieldOfStudy]),
        pageNumbers: [],
        original: education
      });
    }
    for (const certification of model.certifications) {
      records.push({
        id: `${model.id}:${certification.id}`,
        userId: model.userId,
        entityType: "certification",
        semanticReadingId: model.id,
        documentId: model.documentId,
        sourceType,
        title: certification.name?.value,
        issuer: certification.issuer?.value,
        credentialId: certification.credentialId?.value,
        startDate: certification.issueDate,
        endDate: certification.expiryDate,
        responsibilities: [],
        achievements: [],
        skills: [],
        confidence: certification.confidence,
        entityIds: [certification.id],
        regionIds: valueRegionIds([certification.name, certification.issuer, certification.credentialId]),
        pageNumbers: [],
        original: certification
      });
    }
    for (const skill of model.skills) {
      records.push({
        id: `${model.id}:${skill.id}`,
        userId: model.userId,
        entityType: "skill",
        semanticReadingId: model.id,
        documentId: model.documentId,
        sourceType,
        title: skill.name,
        responsibilities: [],
        achievements: [],
        skills: [skill.normalizedName ?? skill.name],
        confidence: skill.confidence,
        entityIds: [skill.id],
        regionIds: skill.sourceRegionIds,
        pageNumbers: [],
        original: skill
      });
    }
  }
  if (input.existingProfile?.career_goal || input.existingProfile?.current_status) {
    records.push({
      id: "profile:career-goal",
      userId: String(input.semanticModels[0]?.userId ?? ""),
      entityType: "profile_field",
      semanticReadingId: "user_profile",
      documentId: "user_profile",
      sourceType: "user_confirmed_profile",
      title: String(input.existingProfile.career_goal ?? input.existingProfile.current_status ?? ""),
      responsibilities: [],
      achievements: [],
      skills: [],
      confidence: 1,
      entityIds: ["user_profile:career_goal"],
      regionIds: [],
      pageNumbers: [],
      original: input.existingProfile
    });
  }
  return records;
}

function recordFromEmployment(model: SemanticDocumentModel, employment: SemanticEmploymentEntry, sourceType: EvidenceSourceType): CareerEvidenceRecord {
  return {
    id: `${model.id}:${employment.id}`,
    userId: model.userId,
    entityType: "employment",
    semanticReadingId: model.id,
    documentId: model.documentId,
    sourceType,
    semanticEntityType: "employment_entry",
    title: employment.jobTitle?.value,
    organisation: employment.employer?.value,
    location: employment.location?.city?.value ?? employment.location?.country?.value,
    startDate: employment.startDate,
    endDate: employment.endDate,
    responsibilities: employment.responsibilities.map((item) => item.value),
    achievements: employment.achievements.map((item) => item.value),
    skills: [...employment.skills, ...employment.tools, ...employment.technologies].map((item) => item.value),
    confidence: employment.confidence,
    entityIds: [employment.id],
    regionIds: employment.sourceRegionIds,
    pageNumbers: [],
    original: employment
  };
}

export function blockingKeysForRecord(record: CareerEvidenceRecord): ReasoningBlockingKey[] {
  const keys: ReasoningBlockingKey[] = [];
  const organisation = normalizeOrganisationName(record.organisation ?? record.institution ?? record.issuer);
  const roleFamily = roleFamilyForTitle(record.title ?? record.qualification);
  const location = normalizeReasoningText(record.location);
  const qualification = normalizeReasoningText(record.qualification);
  const credential = normalizeReasoningText(record.credentialId);
  const skill = normalizeReasoningText(record.skills[0] ?? record.title);
  const startYear = record.startDate?.normalized?.year;
  const endYear = record.endDate?.normalized?.year ?? (record.endDate?.normalized?.current ? "current" : undefined);
  if (organisation) keys.push({ type: record.entityType === "education" ? "institution" : record.entityType === "certification" ? "issuer" : "organisation", value: organisation });
  if (roleFamily !== "unknown") keys.push({ type: "role_family", value: roleFamily });
  if (location) keys.push({ type: "location", value: location });
  if (qualification) keys.push({ type: "qualification", value: qualification });
  if (credential) keys.push({ type: "credential_id", value: credential });
  if (skill) keys.push({ type: "skill", value: skill });
  if (startYear || endYear) keys.push({ type: "date_window", value: `${startYear ?? "unknown"}-${endYear ?? "unknown"}` });
  return keys;
}

export function createReasoningFingerprint(caseType: string, records: CareerEvidenceRecord[]) {
  const value = [
    REASONING_ENGINE_VERSION,
    REASONING_TAXONOMY_VERSION,
    caseType,
    ...records.map((record) => `${record.id}:${record.confidence}`).sort()
  ].join("|");
  return createHash("sha256").update(value).digest("hex");
}

export function signal(type: ReasoningSignal["type"], direction: ReasoningSignal["direction"], description: string, score: number, records: CareerEvidenceRecord[]): ReasoningSignal {
  return {
    type,
    direction,
    description,
    score,
    sourceEntityIds: [...new Set(records.flatMap((record) => record.entityIds))],
    sourceDocumentIds: [...new Set(records.map((record) => record.documentId))],
    confidence: clampReasoningConfidence(Math.abs(score))
  };
}

export function scoreCandidateGroup(group: ReasoningCandidateGroup) {
  const support = group.matchingSignals.reduce((sum, item) => sum + Math.max(0, item.score), 0);
  const contradiction = group.conflictingSignals.reduce((sum, item) => sum + Math.abs(Math.min(0, item.score)), 0);
  return clampReasoningConfidence(group.preliminaryScore + support - contradiction);
}

export function employmentSignals(a: CareerEvidenceRecord, b: CareerEvidenceRecord) {
  const signals: ReasoningSignal[] = [];
  const orgA = normalizeOrganisationName(a.organisation);
  const orgB = normalizeOrganisationName(b.organisation);
  if (orgA && orgB && orgA === orgB) signals.push(signal("same_normalized_organisation", "supports", "Employer names match after normalisation.", EMPLOYMENT_MATCH_WEIGHTS.organisation, [a, b]));
  if (orgA && orgB && orgA !== orgB && tokenSimilarity(orgA, orgB) < 0.35) signals.push(signal("contradictory_employer", "contradicts", "Employer names appear different.", EMPLOYMENT_CONTRADICTION_WEIGHTS.incompatibleEmployer, [a, b]));
  const dateComparison = compareSemanticDateRanges(a.startDate, a.endDate, b.startDate, b.endDate);
  if (["exact", "compatible"].includes(dateComparison.relation)) signals.push(signal("overlapping_date_range", "supports", dateComparison.explanation, EMPLOYMENT_MATCH_WEIGHTS.dates * dateComparison.confidence, [a, b]));
  if (dateComparison.relation === "adjacent") signals.push(signal("adjacent_date_range", "supports", dateComparison.explanation, 0.12, [a, b]));
  if (dateComparison.relation === "conflicting") signals.push(signal("contradictory_dates", "contradicts", dateComparison.explanation, EMPLOYMENT_CONTRADICTION_WEIGHTS.incompatibleDates, [a, b]));
  const titleScore = compareTitles(a.title, b.title);
  if (titleScore >= 0.45) signals.push(signal("semantic_title_similarity", "supports", "Role titles belong to a similar occupation family or share meaningful wording.", EMPLOYMENT_MATCH_WEIGHTS.titleMeaning * titleScore, [a, b]));
  const responsibilityScore = tokenSimilarity([...a.responsibilities, ...a.achievements].join(" "), [...b.responsibilities, ...b.achievements].join(" "));
  if (responsibilityScore >= 0.25) signals.push(signal("responsibility_similarity", "supports", "Responsibilities or achievements overlap in meaning.", EMPLOYMENT_MATCH_WEIGHTS.responsibilities * responsibilityScore, [a, b]));
  const skillScore = compareSkills(a.skills, b.skills).score;
  if (skillScore >= 0.25) signals.push(signal("skill_overlap", "supports", "Skills or tools overlap.", EMPLOYMENT_MATCH_WEIGHTS.skills * skillScore, [a, b]));
  if (normalizeReasoningText(a.location) && normalizeReasoningText(a.location) === normalizeReasoningText(b.location)) signals.push(signal("same_location", "supports", "Locations match.", EMPLOYMENT_MATCH_WEIGHTS.location, [a, b]));
  if (a.sourceType !== b.sourceType && a.documentId !== b.documentId) signals.push(signal("independent_source_confirmation", "supports", "Independent sources describe related evidence.", EMPLOYMENT_MATCH_WEIGHTS.independentConfirmation, [a, b]));
  const reliability = (reliabilityForSource(a.sourceType) + reliabilityForSource(b.sourceType)) / 2;
  signals.push(signal("source_reliability", "supports", "Source reliability contributes to confidence.", EMPLOYMENT_MATCH_WEIGHTS.sourceReliability * reliability, [a, b]));
  if (Math.abs(titleSeniority(a.title) - titleSeniority(b.title)) >= 2 && dateComparison.relation === "adjacent") {
    signals.push(signal("contradictory_seniority", "neutral", "The title seniority changes across adjacent periods, which may indicate progression.", 0.08, [a, b]));
  }
  return signals;
}

export function priorityForCase(entityType: string, confidence: number, hasConflict: boolean): ReasoningCasePriority {
  const base = entityType === "employment" ? 0.9 : entityType === "education" ? 0.75 : entityType === "certification" ? 0.68 : 0.42;
  const score = clampReasoningConfidence(base * 0.55 + confidence * 0.35 + (hasConflict ? 0.1 : 0));
  return { score, impact: score >= 0.74 ? "high" : score >= 0.5 ? "medium" : "low", reason: hasConflict ? "This may affect the user's employment record accuracy." : "This may improve the user's career profile consistency." };
}
