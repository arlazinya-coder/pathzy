import type { CoverLetterData } from "@/components/professional-identity/document-downloads";
import {
  selectCanonicalProfessionalIdentityExperiences,
  type ProfessionalIdentityExperienceEntry
} from "@/lib/professional-identity/professional-identity-experience";
import {
  normalizeProfessionalIdentityCompletionValues,
  type ProfessionalIdentityCompletionValues
} from "@/lib/professional-identity/professional-identity-completion";
import type { CoverLetterJobContext } from "@/lib/professional-identity/professional-identity-cover-letter-model";

export type CoverLetterRequirementImportance = "mandatory" | "preferred" | "responsibility" | "context";
export type CoverLetterEvidenceType = "experience" | "skill" | "education" | "project" | "achievement" | "certification" | "language" | "summary";

export type CoverLetterJobRequirementSignal = {
  id: string;
  text: string;
  importance: CoverLetterRequirementImportance;
  source: "job_title" | "description" | "requirement" | "responsibility" | "qualification" | "experience" | "context";
  keywords: string[];
};

export type CoverLetterJobAnalysis = {
  jobTitle: string;
  employer: string;
  location: string;
  responsibilities: CoverLetterJobRequirementSignal[];
  mandatoryRequirements: CoverLetterJobRequirementSignal[];
  preferredRequirements: CoverLetterJobRequirementSignal[];
  qualifications: CoverLetterJobRequirementSignal[];
  experienceRequirements: CoverLetterJobRequirementSignal[];
  importantKeywords: string[];
  employerPriorities: string[];
};

export type CoverLetterEvidenceSelectionItem = {
  id: string;
  type: CoverLetterEvidenceType;
  label: string;
  presentation: string;
  score: number;
  matchedKeywords: string[];
  sourceText: string;
};

export type CoverLetterEvidenceSelection = {
  jobAnalysis: CoverLetterJobAnalysis;
  selectedEvidence: CoverLetterEvidenceSelectionItem[];
  selectedSkills: string[];
  selectedMotivation: string;
  trace: Array<{
    requirement: string;
    evidenceIds: string[];
    status: "supported" | "transferable" | "not_supported";
  }>;
  warnings: string[];
};

const STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "and",
  "are",
  "avec",
  "can",
  "chez",
  "dans",
  "des",
  "for",
  "from",
  "has",
  "have",
  "into",
  "job",
  "les",
  "not",
  "our",
  "pour",
  "role",
  "that",
  "the",
  "their",
  "this",
  "une",
  "with",
  "work",
  "you",
  "your"
]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function cleanList(value: unknown) {
  const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(/\r?\n|;|,/) : [];
  const seen = new Set<string>();
  const output: string[] = [];
  for (const item of source) {
    const text = cleanText(item);
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    output.push(text);
  }
  return output;
}

function unique(values: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values.map(cleanText).filter(Boolean)) {
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(value);
  }
  return output;
}

function words(value: string) {
  return unique(
    cleanText(value)
      .toLowerCase()
      .replace(/[^a-z0-9À-ÿ+\s-]/gi, " ")
      .split(/\s+/)
      .map((word) => word.replace(/^-|-$/g, ""))
      .filter((word) => word.length >= 3 && !STOP_WORDS.has(word))
  );
}

function phraseSignals(value: string) {
  const phrases = cleanText(value)
    .split(/\r?\n|[.;:•]/)
    .map((item) => cleanText(item.replace(/^(required|requirements?|responsibilities|duties|preferred|qualifications?|skills?|must have|nice to have)\s*[:=-]\s*/i, "")))
    .filter((item) => item.length >= 8);
  return unique(phrases).slice(0, 8);
}

function signal(id: string, text: string, importance: CoverLetterRequirementImportance, source: CoverLetterJobRequirementSignal["source"]): CoverLetterJobRequirementSignal | null {
  const clean = cleanText(text);
  if (!clean) return null;
  return {
    id,
    text: clean,
    importance,
    source,
    keywords: words(clean).slice(0, 8)
  };
}

function inferDescriptionSignals(jobDescription: string) {
  const lines = phraseSignals(jobDescription);
  const mandatory: string[] = [];
  const preferred: string[] = [];
  const responsibilities: string[] = [];
  const context: string[] = [];
  for (const line of lines) {
    if (/\b(must|required|essential|minimum|obligatoire|exige|exigé|necessaire|nécessaire)\b/i.test(line)) {
      mandatory.push(line);
    } else if (/\b(preferred|advantage|nice to have|souhait|atout|preferred)\b/i.test(line)) {
      preferred.push(line);
    } else if (/\b(responsible|responsibilities|duties|coordinate|support|manage|deliver|prepare|develop|maintain|assurer|gerer|gérer|coordonner)\b/i.test(line)) {
      responsibilities.push(line);
    } else {
      context.push(line);
    }
  }
  return { mandatory, preferred, responsibilities, context };
}

export function analyzeCoverLetterJobContext(jobContext: CoverLetterJobContext): CoverLetterJobAnalysis {
  const inferred = inferDescriptionSignals(cleanText(jobContext.jobDescription));
  const mandatoryInputs = [...cleanList(jobContext.requirements), ...inferred.mandatory];
  const preferredInputs = inferred.preferred;
  const responsibilityInputs = [...cleanList(jobContext.responsibilities), ...inferred.responsibilities];
  const qualificationInputs = cleanList(jobContext.qualifications);
  const experienceInputs = cleanText(jobContext.experienceRequirements) ? [cleanText(jobContext.experienceRequirements)] : [];
  const contextInputs = [
    cleanText(jobContext.employmentType),
    cleanText(jobContext.workArrangement),
    cleanText(jobContext.location),
    ...inferred.context
  ];
  const responsibilities = responsibilityInputs.map((item, index) => signal(`responsibility-${index + 1}`, item, "responsibility", "responsibility")).filter(Boolean) as CoverLetterJobRequirementSignal[];
  const mandatoryRequirements = mandatoryInputs.map((item, index) => signal(`mandatory-${index + 1}`, item, "mandatory", "requirement")).filter(Boolean) as CoverLetterJobRequirementSignal[];
  const preferredRequirements = preferredInputs.map((item, index) => signal(`preferred-${index + 1}`, item, "preferred", "description")).filter(Boolean) as CoverLetterJobRequirementSignal[];
  const qualifications = qualificationInputs.map((item, index) => signal(`qualification-${index + 1}`, item, "mandatory", "qualification")).filter(Boolean) as CoverLetterJobRequirementSignal[];
  const experienceRequirements = experienceInputs.map((item, index) => signal(`experience-${index + 1}`, item, "mandatory", "experience")).filter(Boolean) as CoverLetterJobRequirementSignal[];
  const contextSignals = contextInputs.map((item, index) => signal(`context-${index + 1}`, item, "context", "context")).filter(Boolean) as CoverLetterJobRequirementSignal[];
  const titleSignal = signal("job-title", cleanText(jobContext.role), "context", "job_title");
  const allSignals = [
    ...(titleSignal ? [titleSignal] : []),
    ...mandatoryRequirements,
    ...preferredRequirements,
    ...qualifications,
    ...experienceRequirements,
    ...responsibilities,
    ...contextSignals
  ];
  const importantKeywords = unique(allSignals.flatMap((item) => item.keywords)).slice(0, 24);
  return {
    jobTitle: cleanText(jobContext.role),
    employer: cleanText(jobContext.company),
    location: cleanText(jobContext.location),
    responsibilities,
    mandatoryRequirements,
    preferredRequirements,
    qualifications,
    experienceRequirements,
    importantKeywords,
    employerPriorities: unique([...mandatoryInputs, ...responsibilityInputs, ...qualificationInputs]).slice(0, 5)
  };
}

function textOverlapScore(sourceText: string, keywords: string[]) {
  const source = words(sourceText);
  if (!source.length || !keywords.length) return { score: 0, matches: [] as string[] };
  const sourceSet = new Set(source);
  const matches = keywords.filter((keyword) => sourceSet.has(keyword));
  return { score: matches.length, matches };
}

function compactMatchPhrase(matches: string[]) {
  const clean = unique(matches).slice(0, 3);
  if (!clean.length) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean[0]}, ${clean[1]} and ${clean[2]}`;
}

function evidenceLabelFromExperience(entry: ProfessionalIdentityExperienceEntry) {
  return [entry.role, entry.company ? `at ${entry.company}` : ""].map(cleanText).filter(Boolean).join(" ");
}

function experienceSourceText(entry: ProfessionalIdentityExperienceEntry) {
  return [entry.role, entry.company, entry.location, entry.description, ...entry.achievements].map(cleanText).filter(Boolean).join(" ");
}

function experiencePresentation(entry: ProfessionalIdentityExperienceEntry, matches: string[], language: "english" | "french") {
  const label = evidenceLabelFromExperience(entry) || (language === "french" ? "une experience confirmee" : "confirmed experience");
  const matchPhrase = compactMatchPhrase(matches);
  if (matchPhrase) {
    return language === "french"
      ? `${label}, avec des preuves reliees a ${matchPhrase}`
      : `${label}, with evidence connected to ${matchPhrase}`;
  }
  if (entry.achievements.length) {
    const achievement = cleanText(entry.achievements[0]).split(/[.;]/)[0];
    return language === "french"
      ? `${label}, avec une contribution confirmee: ${achievement}`
      : `${label}, with a confirmed contribution: ${achievement}`;
  }
  return language === "french"
    ? `${label}, montrant une experience pratique pertinente`
    : `${label}, showing relevant practical experience`;
}

function skillPresentation(skill: string, language: "english" | "french") {
  return language === "french" ? `competence confirmee en ${skill}` : `confirmed skill in ${skill}`;
}

function genericPresentation(label: string, type: CoverLetterEvidenceType, matches: string[], language: "english" | "french") {
  const matchPhrase = compactMatchPhrase(matches);
  if (matchPhrase) {
    return language === "french"
      ? `${label}, utile pour ${matchPhrase}`
      : `${label}, relevant to ${matchPhrase}`;
  }
  const fallback = {
    education: language === "french" ? "formation pertinente" : "relevant education",
    project: language === "french" ? "projet pratique" : "practical project work",
    achievement: language === "french" ? "realisation confirmee" : "confirmed achievement",
    certification: language === "french" ? "certification ou licence pertinente" : "relevant certification or licence",
    language: language === "french" ? "competence linguistique confirmee" : "confirmed language capability",
    summary: language === "french" ? "orientation professionnelle confirmee" : "confirmed professional direction",
    skill: language === "french" ? "competence confirmee" : "confirmed skill",
    experience: language === "french" ? "experience confirmee" : "confirmed experience"
  } satisfies Record<CoverLetterEvidenceType, string>;
  return `${fallback[type]}: ${label}`;
}

function itemKey(item: { type: CoverLetterEvidenceType; label: string; sourceText: string }) {
  return `${item.type}:${cleanText(item.label).toLowerCase()}:${cleanText(item.sourceText).toLowerCase().slice(0, 120)}`;
}

function rankEvidence(items: CoverLetterEvidenceSelectionItem[]) {
  const seen = new Set<string>();
  return items
    .sort((a, b) => b.score - a.score || b.matchedKeywords.length - a.matchedKeywords.length || a.label.localeCompare(b.label))
    .filter((item) => {
      const key = itemKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function selectCoverLetterEvidence(
  values: ProfessionalIdentityCompletionValues,
  jobContext: CoverLetterJobContext,
  options: { language?: "english" | "french" } = {}
): CoverLetterEvidenceSelection {
  const identity = normalizeProfessionalIdentityCompletionValues(values);
  const language = options.language === "french" ? "french" : "english";
  const jobAnalysis = analyzeCoverLetterJobContext(jobContext);
  const keywords = jobAnalysis.importantKeywords;
  const evidenceItems: CoverLetterEvidenceSelectionItem[] = [];

  selectCanonicalProfessionalIdentityExperiences(identity.experience).forEach((entry, index) => {
    const sourceText = experienceSourceText(entry);
    const overlap = textOverlapScore(sourceText, keywords);
    const score = 24 + overlap.score * 12 + (entry.achievements.length ? 6 : 0) + (entry.description ? 4 : 0) - index;
    evidenceItems.push({
      id: entry.id || `experience-${index + 1}`,
      type: "experience",
      label: evidenceLabelFromExperience(entry),
      presentation: experiencePresentation(entry, overlap.matches, language),
      score,
      matchedKeywords: overlap.matches,
      sourceText
    });
  });

  cleanList(identity.skills).forEach((skill, index) => {
    const overlap = textOverlapScore(skill, keywords);
    evidenceItems.push({
      id: `skill-${index + 1}`,
      type: "skill",
      label: skill,
      presentation: skillPresentation(skill, language),
      score: 18 + overlap.score * 15 - index,
      matchedKeywords: overlap.matches,
      sourceText: skill
    });
  });

  [
    ["education", cleanList(identity.education)] as const,
    ["project", cleanList(identity.projects)] as const,
    ["achievement", cleanList(identity.achievements)] as const,
    ["certification", [...cleanList(identity.certificates), ...cleanList(identity.licences)]] as const,
    ["language", cleanList(identity.languages)] as const
  ].forEach(([type, list]) => {
    list.forEach((value, index) => {
      const overlap = textOverlapScore(value, keywords);
      evidenceItems.push({
        id: `${type}-${index + 1}`,
        type,
        label: value,
        presentation: genericPresentation(value, type, overlap.matches, language),
        score: 12 + overlap.score * 13 - index,
        matchedKeywords: overlap.matches,
        sourceText: value
      });
    });
  });

  const ranked = rankEvidence(evidenceItems);
  const jobMatched = ranked.filter((item) => item.matchedKeywords.length > 0);
  const selectedEvidence = (jobMatched.length ? jobMatched : ranked).filter((item) => item.type !== "skill").slice(0, 4);
  const selectedSkills = rankEvidence(evidenceItems.filter((item) => item.type === "skill"))
    .slice(0, 5)
    .map((item) => item.label);
  const selectedMotivation = jobAnalysis.employerPriorities[0] || jobAnalysis.responsibilities[0]?.text || jobAnalysis.mandatoryRequirements[0]?.text || "";
  const trace = [...jobAnalysis.mandatoryRequirements, ...jobAnalysis.preferredRequirements, ...jobAnalysis.responsibilities].slice(0, 8).map((requirement) => {
    const supporting = ranked.filter((item) => item.matchedKeywords.some((keyword) => requirement.keywords.includes(keyword))).slice(0, 3);
    const status: "supported" | "transferable" | "not_supported" = supporting.length ? (supporting.some((item) => item.type === "experience" || item.type === "skill") ? "supported" : "transferable") : "not_supported";
    return {
      requirement: requirement.text,
      evidenceIds: supporting.map((item) => item.id),
      status
    };
  });
  const warnings = [
    !jobAnalysis.jobTitle ? "missing_job_title" : "",
    !jobAnalysis.employer ? "missing_employer" : "",
    !selectedEvidence.length && !selectedSkills.length ? "limited_candidate_evidence" : "",
    trace.some((item) => item.status === "not_supported") ? "some_requirements_not_supported" : ""
  ].filter(Boolean);
  return {
    jobAnalysis,
    selectedEvidence,
    selectedSkills,
    selectedMotivation,
    trace,
    warnings
  };
}

function paragraphKey(value: string) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9À-ÿ]+/gi, " ").trim();
}

function wordCount(value: string) {
  return cleanText(value).split(/\s+/).filter(Boolean).length;
}

export function validateCoverLetterDraftQuality(data: CoverLetterData, selection: CoverLetterEvidenceSelection) {
  const paragraphs = [
    data.openingParagraph,
    data.motivationParagraph,
    data.evidenceParagraph,
    data.companyAlignmentParagraph,
    ...data.bodyParagraphs,
    data.closingParagraph
  ].map(cleanText).filter(Boolean);
  const paragraphKeys = paragraphs.map(paragraphKey);
  const duplicateParagraphs = paragraphKeys.filter((key, index) => key && paragraphKeys.indexOf(key) !== index);
  const fullText = paragraphs.join(" ");
  return {
    valid: Boolean(data.fullName && data.companyName && data.jobTitle && !duplicateParagraphs.length && wordCount(fullText) <= 430),
    warnings: unique([
      !data.fullName ? "missing_candidate_name" : "",
      !data.companyName ? "missing_employer" : "",
      !data.jobTitle ? "missing_target_role" : "",
      duplicateParagraphs.length ? "duplicate_paragraph" : "",
      wordCount(fullText) > 430 ? "cover_letter_too_long" : "",
      selection.warnings.includes("limited_candidate_evidence") ? "limited_candidate_evidence" : ""
    ])
  };
}
