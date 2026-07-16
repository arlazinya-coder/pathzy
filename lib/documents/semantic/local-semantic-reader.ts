import type { VisualDocumentModel, VisualRegion } from "@/lib/documents/visual";
import { SEMANTIC_PROCESSING_VERSION, SEMANTIC_TAXONOMY_VERSION, SEMANTIC_THRESHOLDS } from "./semantic.constants";
import { degreeLevelFor, entityTypeForText, isHumanLanguage, normalizeLanguageProficiency, semanticSectionFor, skillCategoryFor, careerFieldFor } from "./semantic-classifiers";
import { parseSemanticDateRange } from "./date-understanding";
import { cleanSemanticText, entity, evidence, semanticValue, sourceFor, uniqueByText } from "./semantic-utils";
import type {
  SemanticDocumentModel,
  SemanticEducationEntry,
  SemanticEmploymentEntry,
  SemanticEntity,
  SemanticLanguage,
  SemanticRelationship,
  SemanticSkill,
  SemanticUnderstandingInput,
  SemanticWarning
} from "./semantic.types";

type SemanticRegionContext = { region: VisualRegion; sectionId?: string; sectionType: string; sectionTitle?: string };

function orderedRegions(visualReading: VisualDocumentModel): SemanticRegionContext[] {
  return visualReading.readingOrder
    .map((item) => {
      const page = visualReading.pages.find((candidate) => candidate.pageNumber === item.pageNumber);
      const region = page?.regions.find((candidate) => candidate.id === item.regionId);
      if (!region) return null;
      const section = visualReading.sections.find((candidate) => candidate.regionIds.includes(region.id));
      return { region, sectionId: section?.id, sectionType: semanticSectionFor(section?.normalizedType ?? section?.title), sectionTitle: section?.title };
    })
    .filter(Boolean) as SemanticRegionContext[];
}

function confidenceFor(region: VisualRegion, visualReading: VisualDocumentModel, sectionType: string) {
  const sectionBoost = sectionType === "unknown" ? -0.08 : 0.08;
  return Math.max(0.42, Math.min(0.96, Number(((region.confidence * 0.5) + (visualReading.confidence.overall * 0.35) + 0.1 + sectionBoost).toFixed(3))));
}

function buildEntities(input: SemanticUnderstandingInput) {
  const entities: SemanticEntity[] = [];
  const contexts = orderedRegions(input.visualReading);
  let index = 1;
  for (const context of contexts) {
    const text = cleanSemanticText(context.region.detectedText);
    if (!text || context.region.type === "section_header") continue;
    const type = entityTypeForText(text, context.sectionType);
    const category = type === "email" || type === "phone_number" || type.endsWith("_url") || type === "location" ? "contact"
      : context.sectionType === "employment" ? "employment"
        : context.sectionType === "education" ? "education"
          : context.sectionType === "certification" ? "certification"
            : context.sectionType === "skills" ? "skills"
              : context.sectionType === "languages" ? "languages"
                : context.sectionType === "professional_profile" ? "professional_profile"
                  : context.sectionType === "projects" ? "projects"
                    : "unknown";
    const confidence = confidenceFor(context.region, input.visualReading, context.sectionType);
    entities.push(entity({
      id: `entity-${index}`,
      type,
      category,
      originalText: text,
      source: sourceFor(context.region, context.sectionId),
      confidence: type === "unknown" ? Math.min(0.58, confidence) : confidence,
      evidence: [
        evidence("text", "Detected from visible document text.", regionEvidenceConfidence(context.region)),
        evidence("section", `Region appears in ${context.sectionTitle ?? context.sectionType} context.`, context.sectionType === "unknown" ? 0.45 : 0.78),
        evidence("layout", "Grounded to Phase 3 visual region and reading order.", input.visualReading.confidence.readingOrder)
      ],
      explicitness: "explicit",
      normalizedValue: normalizeEntityValue(type, text),
      alternatives: type === "job_title" ? [{ type: "employer", confidence: 0.52 }] : undefined
    }));
    index += 1;
  }
  return entities;
}

function regionEvidenceConfidence(region: VisualRegion) {
  return Math.max(0.4, Math.min(0.95, region.confidence));
}

function normalizeEntityValue(type: SemanticEntity["type"], text: string) {
  if (type === "email" || type === "linkedin_url" || type === "github_url" || type === "website") return text.toLowerCase();
  if (type === "qualification") return degreeLevelFor(text) ? text.replace(/\bB\.?\s?Tech\b/i, "Bachelor of Technology").replace(/\bB\.?\s?Sc\b/i, "Bachelor of Science") : text;
  return text;
}

function firstEntity(entities: SemanticEntity[], type: SemanticEntity["type"]) {
  return entities.find((item) => item.type === type);
}

function buildRelationships(entities: SemanticEntity[]) {
  const relationships: SemanticRelationship[] = [];
  let index = 1;
  const bySection = new Map<string, SemanticEntity[]>();
  for (const entityItem of entities) {
    const key = entityItem.source.sectionId ?? "document";
    bySection.set(key, [...(bySection.get(key) ?? []), entityItem]);
  }
  for (const sectionEntities of bySection.values()) {
    const employmentAnchor = sectionEntities.find((item) => item.type === "job_title" || item.type === "employment_entry");
    const educationAnchor = sectionEntities.find((item) => item.type === "qualification" || item.type === "education_entry");
    for (const item of sectionEntities) {
      if (employmentAnchor && item.id !== employmentAnchor.id && item.category === "employment") {
        const type = item.type === "achievement" ? "achievement_for_employment" : item.type === "responsibility" ? "responsibility_for_employment" : item.type === "date_range" ? "date_for_entity" : "belongs_to_employment_entry";
        relationships.push({ id: `semantic-rel-${index++}`, type, sourceEntityId: item.id, targetEntityId: employmentAnchor.id, confidence: Math.min(item.confidence, employmentAnchor.confidence), evidenceRegionIds: item.source.regionIds });
      }
      if (educationAnchor && item.id !== educationAnchor.id && item.category === "education") {
        const type = item.type === "education_institution" ? "qualification_from_institution" : item.type === "field_of_study" ? "field_of_study_for_qualification" : item.type === "date" || item.type === "date_range" ? "date_for_entity" : "belongs_to_education_entry";
        relationships.push({ id: `semantic-rel-${index++}`, type, sourceEntityId: item.id, targetEntityId: educationAnchor.id, confidence: Math.min(item.confidence, educationAnchor.confidence), evidenceRegionIds: item.source.regionIds });
      }
    }
  }
  return relationships;
}

function buildEmployment(entities: SemanticEntity[]): SemanticEmploymentEntry[] {
  const employmentEntities = entities.filter((item) => item.category === "employment");
  const entries: SemanticEmploymentEntry[] = [];
  let current: SemanticEmploymentEntry | null = null;
  const push = () => {
    if (current && (current.jobTitle || current.employer || current.responsibilities.length || current.achievements.length)) entries.push(current);
    current = null;
  };
  employmentEntities.forEach((item) => {
    if (item.type === "job_title" && (!current || current.jobTitle)) {
      push();
      current = { id: `employment-${entries.length + 1}`, jobTitle: semanticValue(item.originalText, item.originalText, item.source.regionIds, item.confidence), responsibilities: [], achievements: [], tools: [], technologies: [], skills: [], sourceRegionIds: [...item.source.regionIds], confidence: item.confidence, requiresReview: item.requiresReview };
      return;
    }
    current ??= { id: `employment-${entries.length + 1}`, responsibilities: [], achievements: [], tools: [], technologies: [], skills: [], sourceRegionIds: [], confidence: 0.62, requiresReview: true };
    current.sourceRegionIds.push(...item.source.regionIds);
    if (item.type === "employer" || (item.type === "unknown" && !current.employer && current.jobTitle)) current.employer = semanticValue(item.originalText, item.originalText, item.source.regionIds, Math.min(item.confidence, 0.68));
    else if (item.type === "date_range") {
      const range = parseSemanticDateRange(item.originalText, item.source.regionIds);
      current.startDate = range.startDate ?? current.startDate;
      current.endDate = range.endDate ?? current.endDate;
      current.isCurrent = semanticValue(range.isCurrent, item.originalText, item.source.regionIds, range.isCurrent ? 0.88 : 0.72);
    } else if (item.type === "achievement") current.achievements.push(semanticValue(item.originalText, item.originalText, item.source.regionIds, item.confidence));
    else if (item.type === "responsibility") current.responsibilities.push(semanticValue(item.originalText, item.originalText, item.source.regionIds, item.confidence));
  });
  push();
  return entries.map((entry) => ({ ...entry, confidence: Math.max(0.5, Math.min(0.94, average([entry.jobTitle?.confidence, entry.employer?.confidence, entry.startDate?.confidence, ...entry.responsibilities.map((item) => item.confidence), ...entry.achievements.map((item) => item.confidence)]))), requiresReview: !entry.jobTitle || !entry.employer || entry.requiresReview }));
}

function buildEducation(entities: SemanticEntity[]): SemanticEducationEntry[] {
  const educationEntities = entities.filter((item) => item.category === "education");
  const entries: SemanticEducationEntry[] = [];
  let current: SemanticEducationEntry | null = null;
  const push = () => {
    if (current && (current.qualification || current.institution)) entries.push(current);
    current = null;
  };
  educationEntities.forEach((item) => {
    if (item.type === "qualification" && (!current || current.qualification)) {
      push();
      const level = degreeLevelFor(item.originalText);
      current = { id: `education-${entries.length + 1}`, qualification: semanticValue(item.originalText, item.originalText, item.source.regionIds, item.confidence, "explicit", item.normalizedValue), degreeLevel: level ? semanticValue(level, item.originalText, item.source.regionIds, 0.8) : undefined, sourceRegionIds: [...item.source.regionIds], confidence: item.confidence, requiresReview: item.requiresReview || !level };
      return;
    }
    current ??= { id: `education-${entries.length + 1}`, sourceRegionIds: [], confidence: 0.62, requiresReview: true };
    current.sourceRegionIds.push(...item.source.regionIds);
    if (item.type === "education_institution") current.institution = semanticValue(item.originalText, item.originalText, item.source.regionIds, item.confidence);
    else if (item.type === "date" || item.type === "date_range") {
      const range = parseSemanticDateRange(item.originalText, item.source.regionIds);
      current.startDate = range.startDate ?? current.startDate;
      current.endDate = range.endDate ?? current.endDate;
      current.status = semanticValue(range.endDate?.normalized?.expected ? "in_progress" : "unknown", item.originalText, item.source.regionIds, 0.68);
    } else if (!current.fieldOfStudy && /in\s+|:/.test(item.originalText)) current.fieldOfStudy = semanticValue(item.originalText.split(/\bin\b|:/i).pop()?.trim() ?? item.originalText, item.originalText, item.source.regionIds, 0.64);
  });
  push();
  return entries.map((entry) => ({ ...entry, confidence: Math.max(0.5, Math.min(0.94, average([entry.qualification?.confidence, entry.institution?.confidence, entry.degreeLevel?.confidence]))), requiresReview: !entry.qualification || !entry.institution || entry.requiresReview }));
}

function buildSkills(entities: SemanticEntity[]): SemanticSkill[] {
  const explicit = entities.filter((item) => item.category === "skills" && item.originalText.length < 90);
  const skills = explicit.flatMap((item) => item.originalText.split(/[,;|]/).map((part) => cleanSemanticText(part)).filter(Boolean).map((name) => ({
    id: `skill-${item.id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    normalizedName: name,
    category: skillCategoryFor(name),
    sourceRegionIds: item.source.regionIds,
    confidence: item.confidence,
    explicitness: "explicit" as const,
    requiresReview: item.confidence < 0.75,
    reviewStatus: "unreviewed" as const
  })));
  return uniqueByName(skills);
}

function buildLanguages(entities: SemanticEntity[]): SemanticLanguage[] {
  const values = entities.filter((item) => item.category === "languages" || isHumanLanguage(item.originalText));
  return uniqueByText(values.map((item) => {
    const [language, proficiency = ""] = item.originalText.split(/[-—:]/).map((part) => cleanSemanticText(part));
    return {
      id: `language-${item.id}`,
      language,
      proficiency,
      normalizedProficiency: normalizeLanguageProficiency(item.originalText),
      sourceRegionIds: item.source.regionIds,
      confidence: isHumanLanguage(item.originalText) ? Math.max(item.confidence, 0.78) : 0.58,
      reviewStatus: "unreviewed" as const
    };
  })).filter((item) => item.language);
}

function uniqueByName<T extends { name: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function average(values: Array<number | undefined>) {
  const clean = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : 0.62;
}

function buildWarnings(model: Omit<SemanticDocumentModel, "warnings" | "status">): SemanticWarning[] {
  const warnings: SemanticWarning[] = [];
  if (model.confidence.overall < SEMANTIC_THRESHOLDS.reviewRecommended) warnings.push({ code: "low_semantic_confidence", severity: "warning", message: "Some extracted meanings need review before they become your PATHZY profile.", confidence: model.confidence.overall, suggestedAction: "Review extracted information before accepting it." });
  for (const entry of model.employment) {
    if (!entry.jobTitle || !entry.employer) warnings.push({ code: "job_title_employer_uncertain", severity: "warning", message: "PATHZY could not confidently separate a job title and employer.", regionIds: entry.sourceRegionIds, confidence: entry.confidence, suggestedAction: "Check this employment entry before saving it to your profile." });
  }
  for (const entityItem of model.entities.filter((item) => item.type === "unknown")) {
    warnings.push({ code: "ambiguous_entity_type", severity: "info", message: "Some document content was preserved for review instead of guessed.", entityIds: [entityItem.id], regionIds: entityItem.source.regionIds, confidence: entityItem.confidence, suggestedAction: "Review this item manually." });
  }
  return warnings.slice(0, 20);
}

function conflictWithProfile(entities: SemanticEntity[], existingProfile?: Record<string, unknown> | null) {
  const conflicts = [];
  const profileGoal = typeof existingProfile?.career_goal === "string" ? existingProfile.career_goal : "";
  const profession = entities.find((item) => item.type === "profession" || item.type === "professional_headline");
  if (profileGoal && profession && profileGoal.toLowerCase() !== profession.originalText.toLowerCase()) {
    conflicts.push({ id: "conflict-career-goal", type: "different_value" as const, field: "career_goal", documentValue: profession.originalText, profileValue: profileGoal, entityIds: [profession.id], confidence: 0.78, requiresReview: true });
  }
  return conflicts;
}

export function buildLocalSemanticModel(input: SemanticUnderstandingInput): SemanticDocumentModel {
  const startedAt = new Date().toISOString();
  const phase3VisualRegions = orderedRegions(input.visualReading);
  void phase3VisualRegions;
  const entities = buildEntities(input);
  const relationships = buildRelationships(entities);
  const employment = buildEmployment(entities);
  const education = buildEducation(entities);
  const skills = buildSkills(entities);
  const languages = buildLanguages(entities);
  const headlineEntity = firstEntity(entities, "professional_headline") ?? firstEntity(entities, "job_title");
  const summaryEntity = firstEntity(entities, "professional_summary");
  const nameEntity = entities.find((item) => item.source.pageNumber === 1 && item.source.regionIds.length && item.type === "unknown" && item.originalText.length < 60);
  if (headlineEntity && headlineEntity.type === "professional_headline") {
    const field = careerFieldFor(headlineEntity.originalText);
    if (field) {
      entities.push(entity({ id: `entity-${entities.length + 1}`, type: "career_field", category: "professional_profile", originalText: field, normalizedValue: field, source: headlineEntity.source, confidence: 0.72, explicitness: "strongly_implied", evidence: [evidence("document_type", "Career field inferred from a high-level professional headline.", 0.72)] }));
    }
  }
  const confidence = {
    identity: nameEntity ? 0.68 : 0.42,
    contact: average(entities.filter((item) => item.category === "contact").map((item) => item.confidence)),
    professionalProfile: average([headlineEntity?.confidence, summaryEntity?.confidence]),
    employment: average(employment.map((item) => item.confidence)),
    education: average(education.map((item) => item.confidence)),
    certifications: average(entities.filter((item) => item.category === "certification").map((item) => item.confidence)),
    skills: average(skills.map((item) => item.confidence)),
    languages: average(languages.map((item) => item.confidence)),
    overall: 0
  };
  confidence.overall = Number(average(Object.entries(confidence).filter(([key]) => key !== "overall").map(([, value]) => value)).toFixed(3));
  const base = {
    id: `semantic-${input.documentId}`,
    documentId: input.documentId,
    inspectionId: input.inspection.id,
    visualReadingId: input.visualReading.id,
    userId: input.userId,
    documentType: input.inspection.documentType.value,
    primaryLanguage: input.inspection.languages.find((language) => language.primary)?.code,
    identity: nameEntity ? { fullName: semanticValue(nameEntity.originalText, nameEntity.originalText, nameEntity.source.regionIds, 0.68), sourceRegionIds: nameEntity.source.regionIds, confidence: 0.68, requiresReview: true } : undefined,
    contact: {
      emails: entities.filter((item) => item.type === "email").map((item) => semanticValue(item.normalizedValue ?? item.originalText, item.originalText, item.source.regionIds, item.confidence)),
      phones: entities.filter((item) => item.type === "phone_number").map((item) => semanticValue(item.originalText, item.originalText, item.source.regionIds, item.confidence)),
      locations: [],
      websites: entities.filter((item) => item.type === "website").map((item) => semanticValue(item.originalText, item.originalText, item.source.regionIds, item.confidence)),
      linkedIn: entities.find((item) => item.type === "linkedin_url") ? semanticValue(entities.find((item) => item.type === "linkedin_url")!.originalText, entities.find((item) => item.type === "linkedin_url")!.originalText, entities.find((item) => item.type === "linkedin_url")!.source.regionIds, 0.86) : undefined,
      github: entities.find((item) => item.type === "github_url") ? semanticValue(entities.find((item) => item.type === "github_url")!.originalText, entities.find((item) => item.type === "github_url")!.originalText, entities.find((item) => item.type === "github_url")!.source.regionIds, 0.86) : undefined,
      confidence: confidence.contact,
      requiresReview: confidence.contact < 0.75
    },
    professionalProfile: {
      headline: headlineEntity ? semanticValue(headlineEntity.originalText, headlineEntity.originalText, headlineEntity.source.regionIds, headlineEntity.confidence) : undefined,
      profession: headlineEntity ? semanticValue(headlineEntity.originalText, headlineEntity.originalText, headlineEntity.source.regionIds, Math.min(0.82, headlineEntity.confidence), "strongly_implied") : undefined,
      careerField: careerFieldFor(headlineEntity?.originalText ?? "") ? semanticValue(careerFieldFor(headlineEntity?.originalText ?? "")!, headlineEntity!.originalText, headlineEntity!.source.regionIds, 0.72, "strongly_implied") : undefined,
      summary: summaryEntity ? semanticValue(summaryEntity.originalText, summaryEntity.originalText, summaryEntity.source.regionIds, summaryEntity.confidence) : undefined,
      confidence: confidence.professionalProfile,
      requiresReview: confidence.professionalProfile < 0.75
    },
    employment,
    education,
    certifications: [],
    skills,
    languages,
    projects: [],
    awards: entities.filter((item) => item.category === "awards").map((item) => semanticValue(item.originalText, item.originalText, item.source.regionIds, item.confidence)),
    memberships: entities.filter((item) => item.category === "memberships").map((item) => semanticValue(item.originalText, item.originalText, item.source.regionIds, item.confidence)),
    publications: entities.filter((item) => item.category === "publications").map((item) => semanticValue(item.originalText, item.originalText, item.source.regionIds, item.confidence)),
    volunteering: entities.filter((item) => item.category === "volunteering").map((item) => semanticValue(item.originalText, item.originalText, item.source.regionIds, item.confidence)),
    references: [],
    entities,
    relationships,
    unclassifiedContent: entities.filter((item) => item.type === "unknown").map((item) => ({ originalText: item.originalText, source: item.source, reason: "No safe semantic class was found.", confidence: item.confidence, reviewStatus: "unreviewed" as const })),
    conflicts: conflictWithProfile(entities, input.existingProfile),
    confidence,
    provider: { model: "pathzy-local-semantic-reader", version: SEMANTIC_PROCESSING_VERSION, taxonomyVersion: SEMANTIC_TAXONOMY_VERSION, deterministicOnly: true },
    createdAt: startedAt,
    completedAt: new Date().toISOString()
  } satisfies Omit<SemanticDocumentModel, "warnings" | "status">;
  const warnings = buildWarnings(base);
  const status = confidence.overall < SEMANTIC_THRESHOLDS.manualReviewRequired || warnings.some((warning) => warning.code === "job_title_employer_uncertain")
    ? "manual_review_required"
    : warnings.length ? "completed_with_warnings" : "completed";
  return { ...base, warnings, status };
}

export function shouldUseSemanticModel(entityItem: SemanticEntity): { useModel: boolean; reason: string; entityIds: string[] } {
  const complex = entityItem.type === "unknown" || entityItem.alternatives?.length || entityItem.confidence < 0.72;
  return { useModel: Boolean(complex), reason: complex ? "Entity needs model interpretation after deterministic parsing." : "Deterministic parser produced sufficient confidence.", entityIds: [entityItem.id] };
}
