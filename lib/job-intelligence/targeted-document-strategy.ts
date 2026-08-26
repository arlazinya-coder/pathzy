import { randomUUID } from "crypto";
import type { CanonicalProfessionalIdentity } from "@/lib/canonical-profile";
import { valueText } from "@/lib/canonical-profile";
import { buildCvContentFromCanonicalProfile } from "@/lib/professional-documents/cv-content-builder";
import { defaultCvViewConfiguration, CV_ENGINE_VERSION, CV_RENDERING_ENGINE_VERSION, CV_TEMPLATE_VERSION } from "@/lib/professional-documents/cv-configuration";
import { createPresentationField, fieldText } from "@/lib/professional-documents/presentation-fields";
import { reviewCvQuality } from "@/lib/professional-documents/cv-quality";
import type { CvContent, CvViewConfiguration, ProfessionalDocument, ProfessionalDocumentLanguage, ProfessionalDocumentWarning } from "@/lib/professional-documents/professional-document.types";
import type {
  ProfileJobMatchAnalysis,
  ProfileMatchEvidence,
  ProfileRequirementMatch,
  SemanticJobUnderstanding,
  TargetedDocumentType,
  TargetedDocumentPackage,
  TargetedDocumentStrategy
} from "./job-intelligence.types";

export const TARGETING_STRATEGY_VERSION = "pathzy-targeted-documents-v1";
export const TARGETED_CONTENT_VERSION = "pathzy-targeted-content-v1";

type TargetedDocumentBuildResult = {
  package: TargetedDocumentPackage;
  documents: ProfessionalDocument[];
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function sentence(value: string) {
  const clean = value.trim().replace(/\s+/g, " ");
  if (!clean) return "";
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function conciseEvidenceText(value: string) {
  const firstClause = sentence(value).split(/[.;]/)[0]?.trim() ?? "";
  const clean = firstClause.replace(/\s+/g, " ");
  if (clean.length <= 140) return clean;
  return `${clean.slice(0, 137).replace(/\s+\S*$/, "")}...`;
}

function selectedEvidence(matches: ProfileRequirementMatch[]) {
  const byEntity = new Map<string, ProfileMatchEvidence>();
  for (const match of matches) {
    if (!["confirmed_match", "partial_match", "transferable_match"].includes(match.status)) continue;
    for (const item of match.evidence) {
      if (item.reviewStatus === "uncertain") continue;
      const key = `${item.canonicalEntityType}:${item.canonicalEntityId}`;
      if (!byEntity.has(key) || (byEntity.get(key)?.confidence ?? 0) < item.confidence) {
        byEntity.set(key, item);
      }
    }
  }
  return Array.from(byEntity.values()).sort((a, b) => b.confidence - a.confidence);
}

function idsByType(evidence: ProfileMatchEvidence[]) {
  return {
    employment: unique(evidence.filter((item) => item.canonicalEntityType === "employment").map((item) => item.canonicalEntityId)),
    education: unique(evidence.filter((item) => item.canonicalEntityType === "education").map((item) => item.canonicalEntityId)),
    certifications: unique(evidence.filter((item) => item.canonicalEntityType === "certification" || item.canonicalEntityType === "licence").map((item) => item.canonicalEntityId)),
    skills: unique(evidence.filter((item) => item.canonicalEntityType === "skill").map((item) => item.canonicalEntityId)),
    projects: unique(evidence.filter((item) => item.canonicalEntityType === "project").map((item) => item.canonicalEntityId)),
    languages: unique(evidence.filter((item) => item.canonicalEntityType === "language").map((item) => item.canonicalEntityId)),
    achievements: unique(evidence.filter((item) => item.canonicalEntityType === "achievement").map((item) => item.canonicalEntityId))
  };
}

function activeProfileIds(profile: CanonicalProfessionalIdentity) {
  return {
    employment: profile.employment.filter((item) => item.status !== "archived").map((item) => item.id),
    education: profile.education.filter((item) => item.reviewStatus !== "archived").map((item) => item.id),
    certifications: [...profile.certifications, ...profile.licences].filter((item) => item.status !== "archived").map((item) => item.id),
    skills: profile.skills.filter((item) => item.status !== "archived" && item.explicitness !== "unconfirmed_implied").map((item) => item.id),
    projects: profile.projects.filter((item) => item.status !== "archived").map((item) => item.id),
    languages: profile.languages.filter((item) => item.status !== "archived").map((item) => item.id),
    achievements: profile.achievements.filter((item) => item.status !== "archived").map((item) => item.id)
  };
}

function withFallbackSelection(profile: CanonicalProfessionalIdentity, selected: ReturnType<typeof idsByType>) {
  const fallback = activeProfileIds(profile);
  return {
    employment: selected.employment.length ? selected.employment : fallback.employment.slice(0, 3),
    education: selected.education.length ? selected.education : fallback.education.slice(0, 2),
    certifications: selected.certifications.length ? selected.certifications : fallback.certifications.slice(0, 4),
    skills: selected.skills.length ? selected.skills : fallback.skills.slice(0, 12),
    projects: selected.projects.length ? selected.projects : fallback.projects.slice(0, 3),
    languages: selected.languages.length ? selected.languages : fallback.languages,
    achievements: selected.achievements.length ? selected.achievements : fallback.achievements.slice(0, 4)
  };
}

function excludedIds(profile: CanonicalProfessionalIdentity, selected: ReturnType<typeof withFallbackSelection>) {
  const active = activeProfileIds(profile);
  return {
    employment: active.employment.filter((id) => !selected.employment.includes(id)),
    education: active.education.filter((id) => !selected.education.includes(id)),
    certifications: active.certifications.filter((id) => !selected.certifications.includes(id)),
    skills: active.skills.filter((id) => !selected.skills.includes(id)),
    projects: active.projects.filter((id) => !selected.projects.includes(id)),
    languages: active.languages.filter((id) => !selected.languages.includes(id)),
    achievements: active.achievements.filter((id) => !selected.achievements.includes(id))
  };
}

function strategyFor(input: {
  profile: CanonicalProfessionalIdentity;
  jobUnderstanding: SemanticJobUnderstanding;
  matchAnalysis: ProfileJobMatchAnalysis;
}): TargetedDocumentStrategy {
  const evidence = selectedEvidence(input.matchAnalysis.requirements);
  const selected = withFallbackSelection(input.profile, idsByType(evidence));
  const confirmedMatches = input.matchAnalysis.requirements.filter((match) => match.status === "confirmed_match");
  const partialMatches = input.matchAnalysis.requirements.filter((match) => match.status === "partial_match" || match.status === "transferable_match");
  const gaps = input.matchAnalysis.requirements.filter((match) => match.status === "not_confirmed" || match.status === "confirmed_gap" || match.status === "unclear");
  return {
    targetRole: input.jobUnderstanding.title,
    targetOrganization: input.jobUnderstanding.organization,
    selectedEmploymentIds: selected.employment,
    selectedEducationIds: selected.education,
    selectedCertificationIds: selected.certifications,
    selectedSkillIds: selected.skills,
    selectedProjectIds: selected.projects,
    selectedAchievementIds: selected.achievements,
    emphasizedRequirementIds: confirmedMatches.concat(partialMatches).map((match) => match.requirementId),
    deEmphasizedRequirementIds: gaps.map((match) => match.requirementId),
    gapHandling: gaps.map((match) => ({
      requirementId: match.requirementId,
      approach: match.status === "transferable_match"
        ? "highlight_transferable_evidence"
        : match.status === "unclear"
          ? "request_user_confirmation"
          : match.requirementImportance === "mandatory"
            ? "address_honestly"
            : "exclude_unsupported_claim",
      explanation: match.userAction ?? "Do not claim this requirement unless truthful evidence is confirmed."
    })),
    warnings: [
      ...input.matchAnalysis.blockers.map((item) => item.description),
      ...gaps.filter((match) => match.requirementImportance === "mandatory").map((match) => `Mandatory requirement not confirmed: ${match.requirementText}`)
    ].slice(0, 8)
  };
}

function summaryFor(input: { job: SemanticJobUnderstanding; profile: CanonicalProfessionalIdentity; evidence: ProfileMatchEvidence[]; language: ProfessionalDocumentLanguage }) {
  const profession = valueText(input.profile.professionalProfile.profession) || valueText(input.profile.professionalProfile.headline) || valueText(input.profile.identity.professionalHeadline);
  const strongest = input.evidence.slice(0, 3).map((item) => item.evidenceText.split(/[.;]/)[0]).filter(Boolean);
  const opening = profession
    ? `${profession} targeting ${input.job.title}${input.job.organization ? ` at ${input.job.organization}` : ""}`
    : `Professional targeting ${input.job.title}${input.job.organization ? ` at ${input.job.organization}` : ""}`;
  const evidenceLine = strongest.length ? `Relevant confirmed evidence includes ${strongest.join("; ")}.` : "The CV should be reviewed against confirmed Professional Identity evidence before submission.";
  return sentence(`${opening}. ${evidenceLine}`);
}

function markTargetedCvContent(input: { content: CvContent; job: SemanticJobUnderstanding; strategy: TargetedDocumentStrategy; evidence: ProfileMatchEvidence[]; profile: CanonicalProfessionalIdentity; language: ProfessionalDocumentLanguage }) {
  const sourceFactIds = unique(input.evidence.slice(0, 8).map((item) => item.canonicalEntityId));
  input.content.professionalSummary = createPresentationField({
    value: summaryFor({ job: input.job, profile: input.profile, evidence: input.evidence, language: input.language }),
    canonicalFieldPath: "professionalProfile.professionalSummary",
    sourceType: "targeted_generated",
    userApproved: false,
    approvalState: "suggested",
    generatedForTargetJobId: input.job.id,
    sourceFactIds,
    language: input.language
  });
  for (const employment of input.content.employment) {
    employment.selectionReason = "Selected because it supports the job match analysis.";
    employment.bullets = employment.bullets.slice(0, 4).map((bullet) => createPresentationField({
      value: fieldText(bullet),
      canonicalEntityId: bullet.canonicalEntityId,
      canonicalFieldPath: bullet.canonicalFieldPath,
      originalCanonicalValue: bullet.originalCanonicalValue,
      approvedMasterValue: bullet.approvedMasterValue,
      sourceType: "targeted_generated",
      userApproved: false,
      approvalState: "suggested",
      generatedForTargetJobId: input.job.id,
      sourceFactIds: bullet.sourceFactIds.length ? bullet.sourceFactIds : [employment.id],
      language: input.language
    }));
  }
  input.content.skills = input.content.skills.slice(0, 16);
  return input.content;
}

function warning(id: string, message: string, severity: ProfessionalDocumentWarning["severity"] = "warning"): ProfessionalDocumentWarning {
  return {
    id,
    category: "target_relevance",
    severity,
    section: "Targeted documents",
    message,
    suggestedAction: "Review this before approving the document.",
    blocksExport: severity === "blocking"
  };
}

function unsupportedClaims(input: { matchAnalysis: ProfileJobMatchAnalysis; strategy: TargetedDocumentStrategy }) {
  return input.matchAnalysis.requirements
    .filter((match) => match.status === "not_confirmed" || match.status === "confirmed_gap" || match.status === "unclear")
    .map((match) => match.requirementText)
    .filter((text) => !input.strategy.emphasizedRequirementIds.includes(text));
}

function baseTargeting(input: {
  packageId: string;
  profile: CanonicalProfessionalIdentity;
  job: SemanticJobUnderstanding;
  match: ProfileJobMatchAnalysis;
  strategy: TargetedDocumentStrategy;
  selected: ReturnType<typeof withFallbackSelection>;
  excluded: ReturnType<typeof excludedIds>;
}) {
  return {
    packageId: input.packageId,
    jobUnderstandingId: input.job.id,
    jobUnderstandingVersion: input.job.versionNumber ?? 1,
    jobMatchAnalysisId: input.match.id,
    canonicalProfileVersion: input.profile.version,
    selectedEntityIds: input.selected,
    excludedEntityIds: input.excluded,
    templateVersion: CV_TEMPLATE_VERSION,
    contentVersion: TARGETED_CONTENT_VERSION,
    targetingStrategyVersion: TARGETING_STRATEGY_VERSION,
    strategy: input.strategy,
    approvalState: "review_required" as const,
    staleState: "current" as const
  };
}

function targetedCvDocument(input: {
  packageId: string;
  userId: string;
  profile: CanonicalProfessionalIdentity;
  job: SemanticJobUnderstanding;
  match: ProfileJobMatchAnalysis;
  strategy: TargetedDocumentStrategy;
  evidence: ProfileMatchEvidence[];
}) {
  const selected = {
    employment: input.strategy.selectedEmploymentIds,
    education: input.strategy.selectedEducationIds,
    certifications: input.strategy.selectedCertificationIds,
    skills: input.strategy.selectedSkillIds,
    projects: input.strategy.selectedProjectIds,
    languages: idsByType(input.evidence).languages,
    achievements: input.strategy.selectedAchievementIds
  };
  const configuration: CvViewConfiguration = defaultCvViewConfiguration({
    purpose: "targeted",
    language: input.job.language === "fr" ? "fr" : "en",
    targetRole: input.job.title,
    targetJobId: input.job.id
  });
  configuration.selectedEntityIds = {
    employment: selected.employment,
    education: selected.education,
    certifications: selected.certifications,
    skills: selected.skills,
    projects: selected.projects,
    languages: selected.languages
  };
  const content = markTargetedCvContent({
    content: buildCvContentFromCanonicalProfile(input.profile, configuration),
    job: input.job,
    strategy: input.strategy,
    evidence: input.evidence,
    profile: input.profile,
    language: configuration.language
  });
  const excluded = excludedIds(input.profile, selected);
  const warnings = [
    ...reviewCvQuality(content, configuration),
    ...input.strategy.warnings.map((message, index) => warning(`targeted-cv-warning-${index}`, message))
  ];
  const now = new Date().toISOString();
  const document: ProfessionalDocument = {
    id: randomUUID(),
    userId: input.userId,
    canonicalProfileId: input.profile.id,
    profileVersion: input.profile.version,
    type: "cv",
    status: "ready_with_warnings",
    name: `Targeted CV - ${input.job.title}`,
    language: configuration.language,
    target: { targetRole: input.job.title, targetJobId: input.job.id },
    targeting: baseTargeting({ packageId: input.packageId, profile: input.profile, job: input.job, match: input.match, strategy: input.strategy, selected, excluded }),
    configuration,
    selectedEntities: {
      employmentIds: selected.employment,
      educationIds: selected.education,
      certificationIds: selected.certifications,
      skillIds: selected.skills,
      languageIds: selected.languages,
      projectIds: selected.projects,
      achievementIds: selected.achievements
    },
    content,
    template: { templateId: "modern-ats", templateVersion: CV_TEMPLATE_VERSION, layoutVariant: "single_column" },
    generation: { contentEngineVersion: CV_ENGINE_VERSION, renderingEngineVersion: CV_RENDERING_ENGINE_VERSION, generatedAt: now },
    freshness: { profileVersionUsed: input.profile.version, currentProfileVersion: input.profile.version, status: "current", changedEntityIds: [] },
    warnings,
    createdAt: now,
    updatedAt: now
  };
  return document;
}

function letterContent(input: { profile: CanonicalProfessionalIdentity; job: SemanticJobUnderstanding; evidence: ProfileMatchEvidence[]; language: ProfessionalDocumentLanguage }) {
  const name = valueText(input.profile.identity.fullName);
  const strongest = unique(input.evidence.slice(0, 4).map((item) => conciseEvidenceText(item.evidenceText)).filter(Boolean)).slice(0, 3);
  const primaryRequirements = input.job.requirements
    .filter((requirement) => requirement.importance === "mandatory" || requirement.importance === "preferred")
    .map((requirement) => requirement.normalizedConcept || requirement.sourceText)
    .filter(Boolean)
    .slice(0, 3);
  const requirementFocus = primaryRequirements.length ? primaryRequirements.join(", ") : input.job.title;
  return {
    opening: createPresentationField({ value: `I am applying for the ${input.job.title} opportunity${input.job.organization ? ` at ${input.job.organization}` : ""}, with this letter focused on the reviewed requirements for this role.`, sourceType: "targeted_generated", approvalState: "suggested", userApproved: false, generatedForTargetJobId: input.job.id, language: input.language }),
    evidence: createPresentationField({ value: strongest.length ? `The most relevant confirmed evidence is ${strongest.join("; ")}.` : "My Professional Identity should be reviewed against this role before any claims are made.", sourceType: "targeted_generated", approvalState: "suggested", userApproved: false, generatedForTargetJobId: input.job.id, sourceFactIds: input.evidence.slice(0, 4).map((item) => item.canonicalEntityId), language: input.language }),
    motivation: createPresentationField({ value: `The application should stay focused on ${requirementFocus} and avoid unsupported claims about requirements that are not yet confirmed.`, sourceType: "targeted_generated", approvalState: "suggested", userApproved: false, generatedForTargetJobId: input.job.id, language: input.language }),
    closing: createPresentationField({ value: "I would welcome the opportunity to discuss how my confirmed background can support this role.", sourceType: "targeted_generated", approvalState: "suggested", userApproved: false, generatedForTargetJobId: input.job.id, language: input.language }),
    signature: createPresentationField({ value: name, canonicalFieldPath: "identity.fullName", sourceType: "canonical", userApproved: true, approvalState: "accepted", language: input.language })
  };
}

function simpleDocument(input: {
  type: ProfessionalDocument["type"];
  title: string;
  body: Record<string, string>;
  packageId: string;
  userId: string;
  profile: CanonicalProfessionalIdentity;
  job: SemanticJobUnderstanding;
  match: ProfileJobMatchAnalysis;
  strategy: TargetedDocumentStrategy;
  selected: ReturnType<typeof withFallbackSelection>;
  excluded: ReturnType<typeof excludedIds>;
}) {
  const language: ProfessionalDocumentLanguage = input.job.language === "fr" ? "fr" : "en";
  const content = Object.fromEntries(Object.entries(input.body).map(([key, value]) => [
    key,
    createPresentationField({ value, sourceType: "targeted_generated", userApproved: false, approvalState: "suggested", generatedForTargetJobId: input.job.id, language })
  ]));
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    userId: input.userId,
    canonicalProfileId: input.profile.id,
    profileVersion: input.profile.version,
    type: input.type,
    status: "draft" as const,
    name: input.title,
    language,
    target: { targetRole: input.job.title, targetJobId: input.job.id },
    targeting: baseTargeting({ packageId: input.packageId, profile: input.profile, job: input.job, match: input.match, strategy: input.strategy, selected: input.selected, excluded: input.excluded }),
    configuration: { targetRole: input.job.title, targetJobId: input.job.id, organization: input.job.organization, language },
    selectedEntities: {
      employmentIds: input.selected.employment,
      educationIds: input.selected.education,
      certificationIds: input.selected.certifications,
      skillIds: input.selected.skills,
      languageIds: input.selected.languages,
      projectIds: input.selected.projects,
      achievementIds: input.selected.achievements
    },
    content,
    template: { templateId: input.type, templateVersion: CV_TEMPLATE_VERSION, layoutVariant: "single_column" },
    generation: { contentEngineVersion: CV_ENGINE_VERSION, renderingEngineVersion: CV_RENDERING_ENGINE_VERSION, generatedAt: now },
    freshness: { profileVersionUsed: input.profile.version, currentProfileVersion: input.profile.version, status: "current" as const, changedEntityIds: [] },
    warnings: [] as ProfessionalDocumentWarning[],
    createdAt: now,
    updatedAt: now
  } satisfies ProfessionalDocument;
}

function targetedDraftType(document: ProfessionalDocument): TargetedDocumentType {
  if (document.type === "cv") return "targeted_cv";
  if (document.type === "cover_letter") return "tailored_cover_letter";
  if (document.type === "application_email" || document.type === "linkedin_message" || document.type === "recruiter_message") return document.type;
  throw new Error(`Unsupported targeted document type: ${document.type}`);
}

function coverLetterDocument(input: {
  packageId: string;
  userId: string;
  profile: CanonicalProfessionalIdentity;
  job: SemanticJobUnderstanding;
  match: ProfileJobMatchAnalysis;
  strategy: TargetedDocumentStrategy;
}) {
  const evidence = selectedEvidence(input.match.requirements);
  const selected = withFallbackSelection(input.profile, idsByType(evidence));
  const excluded = excludedIds(input.profile, selected);
  const language: ProfessionalDocumentLanguage = input.job.language === "fr" ? "fr" : "en";
  return simpleDocument({
    type: "cover_letter",
    title: `Tailored Cover Letter - ${input.job.title}`,
    body: Object.fromEntries(Object.entries(letterContent({ profile: input.profile, job: input.job, evidence, language })).map(([key, field]) => [key, field.presentationValue])),
    packageId: input.packageId,
    userId: input.userId,
    profile: input.profile,
    job: input.job,
    match: input.match,
    strategy: input.strategy,
    selected,
    excluded
  });
}

export function buildTargetedProfessionalDocuments(input: {
  userId: string;
  profile: CanonicalProfessionalIdentity;
  jobUnderstanding: SemanticJobUnderstanding;
  matchAnalysis: ProfileJobMatchAnalysis;
  includeApplicationEmail?: boolean;
  includeLinkedInMessage?: boolean;
  includeRecruiterMessage?: boolean;
}): TargetedDocumentBuildResult {
  const packageId = `targeted-package-${input.matchAnalysis.id}-${Date.now()}`;
  const strategy = strategyFor({ profile: input.profile, jobUnderstanding: input.jobUnderstanding, matchAnalysis: input.matchAnalysis });
  const evidence = selectedEvidence(input.matchAnalysis.requirements);
  const selected = withFallbackSelection(input.profile, idsByType(evidence));
  const excluded = excludedIds(input.profile, selected);
  const cv = targetedCvDocument({ packageId, userId: input.userId, profile: input.profile, job: input.jobUnderstanding, match: input.matchAnalysis, strategy, evidence });
  const coverLetter = coverLetterDocument({ packageId, userId: input.userId, profile: input.profile, job: input.jobUnderstanding, match: input.matchAnalysis, strategy });
  const optionalDocuments: ProfessionalDocument[] = [];
  if (input.includeApplicationEmail) {
    optionalDocuments.push(simpleDocument({
      type: "application_email",
      title: `Application Email - ${input.jobUnderstanding.title}`,
      body: {
        recipient: "",
        subject: `Application for ${input.jobUnderstanding.title}${input.jobUnderstanding.organization ? ` - ${input.jobUnderstanding.organization}` : ""}`,
        body: `Dear Hiring Team,\n\nPlease find attached my application for the ${input.jobUnderstanding.title} role. I have prepared my documents using confirmed professional evidence and the reviewed job requirements.\n\nKind regards,`,
        attachments: "Targeted CV and tailored cover letter for user review before sending."
      },
      packageId,
      userId: input.userId,
      profile: input.profile,
      job: input.jobUnderstanding,
      match: input.matchAnalysis,
      strategy,
      selected,
      excluded
    }));
  }
  if (input.includeLinkedInMessage) {
    optionalDocuments.push(simpleDocument({
      type: "linkedin_message",
      title: `LinkedIn Message - ${input.jobUnderstanding.title}`,
      body: {
        message: `Hello, I am interested in the ${input.jobUnderstanding.title} role${input.jobUnderstanding.organization ? ` at ${input.jobUnderstanding.organization}` : ""}. I have relevant confirmed background and would appreciate the chance to learn more about the opportunity.`
      },
      packageId,
      userId: input.userId,
      profile: input.profile,
      job: input.jobUnderstanding,
      match: input.matchAnalysis,
      strategy,
      selected,
      excluded
    }));
  }
  if (input.includeRecruiterMessage) {
    optionalDocuments.push(simpleDocument({
      type: "recruiter_message",
      title: `Recruiter Message - ${input.jobUnderstanding.title}`,
      body: {
        message: `Hello, I saw the ${input.jobUnderstanding.title} opportunity${input.jobUnderstanding.organization ? ` with ${input.jobUnderstanding.organization}` : ""}. Based on my confirmed profile evidence, I would like to be considered if my background fits what the team needs.`
      },
      packageId,
      userId: input.userId,
      profile: input.profile,
      job: input.jobUnderstanding,
      match: input.matchAnalysis,
      strategy,
      selected,
      excluded
    }));
  }
  const documents = [cv, coverLetter, ...optionalDocuments];
  const blockedClaims = unsupportedClaims({ matchAnalysis: input.matchAnalysis, strategy });
  const now = new Date().toISOString();
  return {
    documents,
    package: {
      id: packageId,
      userId: input.userId,
      canonicalProfileId: input.profile.id,
      canonicalProfileVersion: input.profile.version,
      jobUnderstandingId: input.jobUnderstanding.id,
      jobUnderstandingVersion: input.jobUnderstanding.versionNumber ?? 1,
      jobMatchAnalysisId: input.matchAnalysis.id,
      scoringVersion: input.matchAnalysis.scoringVersion,
      targetingStrategyVersion: TARGETING_STRATEGY_VERSION,
      strategy,
      documents: documents.map((document) => ({
        id: `${packageId}-${document.type}`,
        type: targetedDraftType(document),
        professionalDocumentId: document.id,
        title: document.name,
        approvalState: document.targeting?.approvalState ?? "review_required",
        staleState: document.targeting?.staleState ?? "current",
        route: document.type === "cv"
          ? `/professional-identity/cv?documentId=${encodeURIComponent(document.id)}&intent=targeted`
          : document.type === "cover_letter"
            ? `/professional-identity/cover-letter?documentId=${encodeURIComponent(document.id)}&intent=targeted`
            : undefined,
        warnings: document.warnings.map((item) => item.message)
      })),
      unsupportedClaimsBlocked: blockedClaims,
      freshness: {
        stale: false,
        profileVersionUsed: input.profile.version,
        jobUnderstandingVersionUsed: input.jobUnderstanding.versionNumber ?? 1,
        matchAnalysisUpdatedAt: input.matchAnalysis.updatedAt
      },
      createdAt: now,
      updatedAt: now
    }
  };
}
