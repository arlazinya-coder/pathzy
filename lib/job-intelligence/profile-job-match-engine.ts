import type { CanonicalDate, CanonicalEmployment, CanonicalProfessionalIdentity, CanonicalReviewStatus } from "@/lib/canonical-profile";
import { valueText } from "@/lib/canonical-profile";
import type {
  MatchClarificationQuestion,
  MatchRecommendation,
  ProfileJobFitBand,
  ProfileJobMatchAnalysis,
  ProfileJobReadiness,
  ProfileMatchEvidence,
  ProfileMatchInsight,
  ProfileRequirementMatch,
  RequirementMatchStatus,
  SemanticJobUnderstanding,
  StructuredJobRequirement
} from "./job-intelligence.types";

export const PROFILE_JOB_MATCH_SCORING_VERSION = "pathzy-profile-job-match-v1";

const protectedCharacteristicPattern = /\b(age|race|gender|disability|religion|marital status|appearance|photo|nationality|ethnicity)\b/i;
const stopWords = new Set(["and", "the", "for", "with", "you", "your", "are", "les", "des", "pour", "avec", "une", "job", "role", "must", "required", "preferred"]);
const transferableConcepts: Record<string, string[]> = {
  "customer success": ["customer service", "account support", "sales consultation", "complaint resolution", "client service"],
  "account management": ["customer service", "sales", "client support", "relationship management"],
  reporting: ["reports", "monthly reports", "data analysis", "excel", "dashboard"],
  "data analysis": ["reporting", "excel", "sql", "dashboard", "operational data"],
  leadership: ["team coordination", "supervision", "management", "training"],
  administration: ["records", "communication", "office", "coordination", "documentation"]
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function tokens(value: string) {
  return clean(value)
    .toLowerCase()
    .split(/[^a-z0-9Ã -Ã¿]+/i)
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function overlapScore(requirement: string, evidence: string) {
  const requirementTokens = new Set(tokens(requirement));
  if (!requirementTokens.size) return 0;
  const evidenceTokens = new Set(tokens(evidence));
  const hits = Array.from(requirementTokens).filter((token) => evidenceTokens.has(token)).length;
  return hits / requirementTokens.size;
}

function reviewStatus(value?: { status?: CanonicalReviewStatus } | null): ProfileMatchEvidence["reviewStatus"] {
  if (!value?.status) return "uncertain";
  if (value.status === "confirmed" || value.status === "user_entered" || value.status === "provisionally_accepted" || value.status === "needs_review") return value.status;
  return "uncertain";
}

function sourceDocumentIds(sourceReferences?: Array<{ documentId?: string }>) {
  return Array.from(new Set((sourceReferences ?? []).map((item) => item.documentId).filter((item): item is string => Boolean(item))));
}

function evidence(input: Omit<ProfileMatchEvidence, "confidence" | "reviewStatus"> & { confidence?: number; reviewStatus?: ProfileMatchEvidence["reviewStatus"] }): ProfileMatchEvidence {
  return {
    ...input,
    confidence: Math.max(0, Math.min(1, input.confidence ?? 0.65)),
    reviewStatus: input.reviewStatus ?? "uncertain"
  };
}

function collectProfileEvidence(profile: CanonicalProfessionalIdentity): ProfileMatchEvidence[] {
  const collected: ProfileMatchEvidence[] = [];
  const summary = valueText(profile.professionalProfile.professionalSummary);
  const headline = valueText(profile.professionalProfile.headline) || valueText(profile.identity.professionalHeadline);
  if (summary) collected.push(evidence({ canonicalEntityType: "professional_profile", canonicalEntityId: "professional-summary", label: "Professional summary", evidenceText: summary, confidence: profile.confidence.overall, reviewStatus: reviewStatus(profile.professionalProfile.professionalSummary), sourceDocumentIds: sourceDocumentIds(profile.professionalProfile.professionalSummary?.sourceReferences) }));
  if (headline) collected.push(evidence({ canonicalEntityType: "professional_profile", canonicalEntityId: "headline", label: "Professional headline", evidenceText: headline, confidence: profile.confidence.overall, reviewStatus: reviewStatus(profile.professionalProfile.headline ?? profile.identity.professionalHeadline), sourceDocumentIds: sourceDocumentIds((profile.professionalProfile.headline ?? profile.identity.professionalHeadline)?.sourceReferences) }));

  for (const skill of profile.skills) {
    if (skill.status === "archived" || skill.explicitness === "unconfirmed_implied") continue;
    collected.push(evidence({ canonicalEntityType: "skill", canonicalEntityId: skill.id, label: "Skill", evidenceText: [valueText(skill.canonicalName), ...skill.aliases.map(valueText), valueText(skill.proficiency)].filter(Boolean).join(" "), confidence: skill.confidence, reviewStatus: skill.status === "confirmed" ? "confirmed" : "needs_review", sourceDocumentIds: sourceDocumentIds(skill.sourceReferences) }));
  }

  for (const employment of profile.employment) {
    if (employment.status === "archived") continue;
    const employmentText = [
      valueText(employment.canonicalTitle),
      valueText(employment.employer),
      valueText(employment.department),
      valueText(employment.location),
      ...employment.responsibilities.map((item) => valueText(item.statement)),
      ...employment.achievements.map((item) => valueText(item.statement))
    ].filter(Boolean).join(" ");
    if (employmentText) collected.push(evidence({ canonicalEntityType: "employment", canonicalEntityId: employment.id, label: [valueText(employment.canonicalTitle), valueText(employment.employer)].filter(Boolean).join(" at ") || "Employment", evidenceText: employmentText, confidence: employment.confidence, reviewStatus: employment.status === "confirmed" ? "confirmed" : "needs_review", sourceDocumentIds: sourceDocumentIds(employment.sourceReferences) }));
  }

  for (const item of profile.education) {
    if (item.reviewStatus === "archived") continue;
    const educationText = [valueText(item.qualification), valueText(item.normalizedQualification), valueText(item.degreeLevel), valueText(item.fieldOfStudy), valueText(item.institution), item.status?.value].filter(Boolean).join(" ");
    if (educationText) collected.push(evidence({ canonicalEntityType: "education", canonicalEntityId: item.id, label: "Education", evidenceText: educationText, confidence: item.confidence, reviewStatus: item.reviewStatus === "confirmed" ? "confirmed" : "needs_review", sourceDocumentIds: sourceDocumentIds(item.sourceReferences) }));
  }

  for (const item of [...profile.certifications, ...profile.licences]) {
    if (item.status === "archived") continue;
    const type = profile.licences.some((licence) => licence.id === item.id) ? "licence" : "certification";
    const certificationText = [valueText(item.canonicalName), valueText(item.issuer), valueText(item.activeStatus), valueText(item.credentialId)].filter(Boolean).join(" ");
    if (certificationText) collected.push(evidence({ canonicalEntityType: type, canonicalEntityId: item.id, label: type === "licence" ? "Licence" : "Certification", evidenceText: certificationText, confidence: item.confidence, reviewStatus: item.status === "confirmed" ? "confirmed" : "needs_review", sourceDocumentIds: sourceDocumentIds(item.sourceReferences) }));
  }

  for (const item of profile.languages) {
    if (item.status === "archived") continue;
    collected.push(evidence({ canonicalEntityType: "language", canonicalEntityId: item.id, label: "Language", evidenceText: [valueText(item.language), valueText(item.normalizedProficiency ?? item.proficiency)].filter(Boolean).join(" "), confidence: item.confidence, reviewStatus: item.status === "confirmed" ? "confirmed" : "needs_review", sourceDocumentIds: sourceDocumentIds(item.sourceReferences) }));
  }

  for (const item of profile.projects) {
    if (item.status === "archived") continue;
    const projectText = [valueText(item.name), valueText(item.role), valueText(item.description), valueText(item.impact)].filter(Boolean).join(" ");
    if (projectText) collected.push(evidence({ canonicalEntityType: "project", canonicalEntityId: item.id, label: "Project", evidenceText: projectText, confidence: item.confidence, reviewStatus: item.status === "confirmed" ? "confirmed" : "needs_review", sourceDocumentIds: sourceDocumentIds(item.sourceReferences) }));
  }

  return collected.filter((item) => !protectedCharacteristicPattern.test(item.evidenceText));
}

function dateToMonth(date?: CanonicalDate) {
  if (!date?.year) return undefined;
  return date.year * 12 + (date.month ?? 1);
}

function mergeRanges(ranges: Array<{ start: number; end: number }>) {
  const sorted = ranges.filter((range) => range.end >= range.start).sort((a, b) => a.start - b.start);
  const merged: Array<{ start: number; end: number }> = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end) merged.push({ ...range });
    else last.end = Math.max(last.end, range.end);
  }
  return merged;
}

export function calculateProfileExperienceYears(profile: CanonicalProfessionalIdentity, relatedText = "") {
  const relevant = profile.employment.filter((employment) => {
    if (employment.status === "archived") return false;
    if (!relatedText) return true;
    const haystack = [
      valueText(employment.canonicalTitle),
      ...employment.responsibilities.map((item) => valueText(item.statement)),
      ...employment.achievements.map((item) => valueText(item.statement))
    ].join(" ");
    return overlapScore(relatedText, haystack) > 0.08;
  });
  const now = new Date();
  const currentMonth = now.getFullYear() * 12 + now.getMonth() + 1;
  const ranges = relevant.flatMap((employment: CanonicalEmployment) => {
    const start = dateToMonth(employment.startDate?.value);
    const end = employment.isCurrent.value ? currentMonth : dateToMonth(employment.endDate?.value);
    return start && end ? [{ start, end }] : [];
  });
  const months = mergeRanges(ranges).reduce((sum, range) => sum + Math.max(0, range.end - range.start + 1), 0);
  return {
    years: Math.round((months / 12) * 10) / 10,
    methodology: "Merged overlapping employment date ranges and ignored roles with missing dates."
  };
}

function isTransferable(requirement: StructuredJobRequirement, evidenceText: string) {
  const normalized = clean(requirement.normalizedConcept ?? requirement.sourceText).toLowerCase();
  const related = transferableConcepts[normalized] ?? Object.entries(transferableConcepts).find(([key]) => normalized.includes(key))?.[1] ?? [];
  return related.some((term) => evidenceText.toLowerCase().includes(term));
}

function actionFor(requirement: StructuredJobRequirement, status: RequirementMatchStatus) {
  if (status === "confirmed_match") return "Use this evidence in a targeted CV.";
  if (status === "transferable_match") return "Explain this as transferable experience, not as a direct match.";
  if (status === "partial_match") return "Add clearer verified evidence before relying on this requirement.";
  if (requirement.type === "certification" || requirement.type === "licence" || requirement.type === "education") return "Upload or confirm this credential if you have it; otherwise do not claim it.";
  if (requirement.type === "work_authorization" || requirement.type === "location") return "Confirm eligibility or location availability before applying.";
  return "Confirm truthful evidence or treat this as a gap.";
}

function blockerFor(requirement: StructuredJobRequirement, status: RequirementMatchStatus, evidence: ProfileMatchEvidence[]) {
  if (status === "confirmed_match" || status === "partial_match" || status === "transferable_match" || requirement.importance !== "mandatory") return false;
  if (["licence", "certification", "education", "work_authorization", "location", "language"].includes(requirement.type)) return true;
  if (requirement.minimumYears && !evidence.length) return true;
  return false;
}

function matchOneRequirement(profile: CanonicalProfessionalIdentity, requirement: StructuredJobRequirement, evidencePool: ProfileMatchEvidence[]): ProfileRequirementMatch {
  if (requirement.importance === "optional" && requirement.confidence < 0.35) {
    return {
      requirementId: requirement.id,
      requirementText: requirement.sourceText,
      requirementImportance: requirement.importance,
      requirementType: requirement.type,
      status: "not_applicable",
      matchedCanonicalEntityIds: [],
      evidence: [],
      explanation: "This appears optional and has low extraction confidence.",
      confidence: 0.5,
      blocker: false
    };
  }

  const ranked = evidencePool
    .map((item) => {
      const normalizedConcept = clean(requirement.normalizedConcept).toLowerCase();
      const conceptScore = requirement.canonicalConceptId && item.canonicalEntityId.includes(requirement.canonicalConceptId.split(":")[1] ?? "")
        ? 0.85
        : normalizedConcept && item.evidenceText.toLowerCase().includes(normalizedConcept)
          ? 0.82
          : 0;
      const textScore = overlapScore(`${requirement.normalizedConcept ?? ""} ${requirement.sourceText}`, item.evidenceText);
      const transferScore = isTransferable(requirement, item.evidenceText) ? 0.42 : 0;
      return { item, score: Math.max(conceptScore, textScore, transferScore) * item.confidence, transfer: transferScore > textScore && transferScore > conceptScore };
    })
    .filter((item) => item.score > 0.12)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const evidence = ranked.map((item) => item.item);
  const top = ranked[0];
  let status: RequirementMatchStatus = "not_confirmed";
  if (requirement.confidence < 0.45 || requirement.importance === "unclear") status = "unclear";
  if (top?.score >= 0.58 && top.item.reviewStatus === "confirmed") status = "confirmed_match";
  else if (top?.transfer) status = "transferable_match";
  else if ((top?.score ?? 0) >= 0.3) status = "partial_match";

  if (requirement.minimumYears) {
    const duration = calculateProfileExperienceYears(profile, requirement.sourceText);
    if (duration.years >= requirement.minimumYears && status !== "confirmed_match") status = "partial_match";
    if (duration.years > 0 && duration.years < requirement.minimumYears && requirement.importance === "mandatory") status = "confirmed_gap";
  }

  const blocker = blockerFor(requirement, status, evidence);
  const explanation = status === "confirmed_match"
    ? "Confirmed profile evidence supports this requirement."
    : status === "partial_match"
      ? "Related profile evidence exists, but it needs clearer proof or positioning."
      : status === "transferable_match"
        ? "Profile evidence may transfer to this requirement, but it is not a direct confirmed match."
        : status === "confirmed_gap"
          ? "Available profile evidence suggests this mandatory requirement may not be met."
          : status === "unclear"
            ? "The requirement or profile evidence is ambiguous and needs review."
            : "PATHZY could not confirm this requirement from the current Professional Identity.";

  return {
    requirementId: requirement.id,
    requirementText: requirement.sourceText,
    requirementImportance: requirement.importance,
    requirementType: requirement.type,
    status,
    matchedCanonicalEntityIds: evidence.map((item) => item.canonicalEntityId),
    evidence,
    explanation,
    userAction: actionFor(requirement, status),
    confidence: Math.round(Math.max(0.25, Math.min(0.96, (top?.score ?? 0.28) + (requirement.confidence * 0.2))) * 100) / 100,
    blocker
  };
}

function insightFromMatch(match: ProfileRequirementMatch, title: string, severity?: ProfileMatchInsight["severity"]): ProfileMatchInsight {
  return {
    id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${match.requirementId}`,
    title,
    description: match.explanation,
    requirementIds: [match.requirementId],
    evidenceIds: match.evidence.map((item) => item.canonicalEntityId),
    severity
  };
}

function scoreWeight(match: ProfileRequirementMatch) {
  const importanceWeight = match.requirementImportance === "mandatory" ? 1.6 : match.requirementImportance === "preferred" ? 1 : match.requirementImportance === "optional" ? 0.45 : 0.7;
  const statusWeight: Record<RequirementMatchStatus, number> = {
    confirmed_match: 1,
    partial_match: 0.62,
    transferable_match: 0.5,
    not_confirmed: 0.12,
    confirmed_gap: 0,
    unclear: 0.24,
    not_applicable: 0.35
  };
  return { possible: importanceWeight, achieved: importanceWeight * statusWeight[match.status] };
}

function fitBand(score: number | undefined, blockers: ProfileMatchInsight[], confidence: number): ProfileJobFitBand {
  if (!score || confidence < 0.38) return "insufficient_information";
  if (blockers.length || score < 38) return "significant_gaps";
  if (score >= 78) return "strong_match";
  if (score >= 60) return "good_potential";
  return "possible_match";
}

function readinessFor(band: ProfileJobFitBand, blockers: ProfileMatchInsight[], uncertainties: ProfileMatchInsight[]): ProfileJobReadiness {
  if (blockers.length) return "eligibility_concern";
  if (band === "strong_match" || band === "good_potential") return "ready_to_prepare_application";
  if (uncertainties.length >= 3 || band === "insufficient_information") return "information_needed";
  if (band === "significant_gaps") return "not_recommended_without_changes";
  return "review_recommended";
}

function recommendationsFor(input: { matches: ProfileRequirementMatch[]; analysisId: string; jobUnderstanding: SemanticJobUnderstanding }): MatchRecommendation[] {
  const recommendations: MatchRecommendation[] = [];
  if (input.matches.some((match) => match.status === "confirmed_match")) {
    recommendations.push({ id: "prepare-targeted-cv", label: "Prepare Targeted Application", description: "Use confirmed evidence to prepare a truthful targeted CV for this role.", route: `/professional-identity/cv?jobUnderstanding=${encodeURIComponent(input.jobUnderstanding.id)}&intent=targeted`, priority: "high" });
  }
  if (input.matches.some((match) => match.status === "transferable_match")) {
    recommendations.push({ id: "position-transferable", label: "Highlight transferable experience", description: "Explain related experience carefully without claiming a direct match.", priority: "medium" });
  }
  if (input.matches.some((match) => match.status === "not_confirmed" || match.status === "unclear")) {
    recommendations.push({ id: "confirm-profile-evidence", label: "Confirm missing profile information", description: "Add or confirm truthful evidence in My Professional Profile before relying on this requirement.", route: "/professional-identity", priority: "high" });
  }
  if (input.matches.some((match) => match.blocker)) {
    recommendations.push({ id: "review-eligibility", label: "Review eligibility", description: "A mandatory requirement could not be confirmed. Review this before spending time on the application.", priority: "high" });
  }
  return recommendations;
}

function clarificationQuestions(matches: ProfileRequirementMatch[]): MatchClarificationQuestion[] {
  return matches
    .filter((match) => ["not_confirmed", "unclear", "partial_match", "transferable_match"].includes(match.status))
    .slice(0, 8)
    .map((match) => ({
      id: `question-${match.requirementId}`,
      relatedRequirementId: match.requirementId,
      question: match.requirementType === "language"
        ? `Can you confirm your level for this language requirement: ${match.requirementText}?`
        : match.requirementType === "licence" || match.requirementType === "certification"
          ? `Do you currently hold this credential: ${match.requirementText}?`
          : `Can you confirm truthful evidence for: ${match.requirementText}?`,
      reason: "Answers should go through the Professional Identity evidence review process before they are used in documents."
    }));
}

export function analyzeConfirmedJobAgainstProfile(input: {
  profile: CanonicalProfessionalIdentity;
  jobUnderstanding: SemanticJobUnderstanding;
}): ProfileJobMatchAnalysis {
  const evidencePool = collectProfileEvidence(input.profile);
  const activeRequirements = input.jobUnderstanding.requirements.filter((requirement) => requirement.userStatus !== "removed" && !protectedCharacteristicPattern.test(requirement.sourceText));
  const matches = activeRequirements.map((requirement) => matchOneRequirement(input.profile, requirement, evidencePool));
  const scoreParts = matches.map(scoreWeight);
  const possible = Math.max(1, scoreParts.reduce((sum, item) => sum + item.possible, 0));
  const fitScore = Math.round((scoreParts.reduce((sum, item) => sum + item.achieved, 0) / possible) * 100);
  const evidenceConfidence = evidencePool.length ? evidencePool.reduce((sum, item) => sum + item.confidence, 0) / evidencePool.length : 0.25;
  const requirementConfidence = activeRequirements.length ? activeRequirements.reduce((sum, item) => sum + item.confidence, 0) / activeRequirements.length : 0.25;
  const analysisConfidence = Math.round(Math.max(0.2, Math.min(0.94, evidenceConfidence * 0.55 + requirementConfidence * 0.35 + (matches.length ? 0.1 : 0))) * 100) / 100;
  const strengths = matches.filter((match) => match.status === "confirmed_match").map((match) => insightFromMatch(match, "Strong match", "info"));
  const partialMatches = matches.filter((match) => match.status === "partial_match" || match.status === "transferable_match").map((match) => insightFromMatch(match, match.status === "transferable_match" ? "Transferable match" : "Partial match", "info"));
  const gaps = matches.filter((match) => match.status === "not_confirmed" || match.status === "confirmed_gap").map((match) => insightFromMatch(match, match.status === "confirmed_gap" ? "Confirmed gap" : "Not confirmed", match.requirementImportance === "mandatory" ? "warning" : "info"));
  const uncertainties = matches.filter((match) => match.status === "unclear").map((match) => insightFromMatch(match, "Information needed", "warning"));
  const blockers = matches.filter((match) => match.blocker).map((match) => insightFromMatch(match, "Potential blocker", "high"));
  const band = fitBand(fitScore, blockers, analysisConfidence);
  const readiness = readinessFor(band, blockers, uncertainties);
  const strongEvidence = [
    `${strengths.length} requirement${strengths.length === 1 ? "" : "s"} confirmed by Professional Identity evidence.`,
    `${partialMatches.length} partial or transferable match${partialMatches.length === 1 ? "" : "es"} found.`
  ];
  const concerns = [
    blockers.length ? `${blockers.length} potential blocker${blockers.length === 1 ? "" : "s"} need review.` : "",
    gaps.length ? `${gaps.length} requirement${gaps.length === 1 ? "" : "s"} not confirmed yet.` : "",
    uncertainties.length ? `${uncertainties.length} uncertain requirement${uncertainties.length === 1 ? "" : "s"} need clarification.` : ""
  ].filter(Boolean);
  const now = new Date().toISOString();
  const analysis: ProfileJobMatchAnalysis = {
    id: `profile-job-match-${input.jobUnderstanding.id}-${input.profile.version}`,
    userId: input.profile.userId,
    jobUnderstandingId: input.jobUnderstanding.id,
    jobUnderstandingVersion: input.jobUnderstanding.versionNumber ?? 1,
    canonicalProfileId: input.profile.id,
    canonicalProfileVersion: input.profile.version,
    status: "current",
    requirements: matches,
    strengths,
    partialMatches,
    gaps,
    uncertainties,
    blockers,
    fitScore: analysisConfidence < 0.35 ? undefined : fitScore,
    fitBand: band,
    analysisConfidence,
    readiness,
    scoreExplanation: {
      strongEvidence,
      concerns,
      methodology: "Weighted mandatory requirements highest, counted partial and transferable matches separately, reduced readiness for blockers, and kept fit score separate from analysis confidence."
    },
    recommendations: recommendationsFor({ matches, analysisId: "", jobUnderstanding: input.jobUnderstanding }),
    clarificationQuestions: clarificationQuestions(matches),
    targetedCvRoute: `/professional-identity/cv?jobUnderstanding=${encodeURIComponent(input.jobUnderstanding.id)}&intent=targeted`,
    scoringVersion: PROFILE_JOB_MATCH_SCORING_VERSION,
    createdAt: now,
    updatedAt: now,
    freshness: {
      currentProfileVersion: input.profile.version,
      currentJobUnderstandingVersion: input.jobUnderstanding.versionNumber ?? 1,
      stale: false
    }
  };
  return analysis;
}

export function freshnessForProfileJobMatch(input: {
  analysis: ProfileJobMatchAnalysis;
  currentProfileVersion: number;
  currentJobUnderstandingVersion: number;
}) {
  const staleProfile = input.analysis.canonicalProfileVersion !== input.currentProfileVersion;
  const staleJob = input.analysis.jobUnderstandingVersion !== input.currentJobUnderstandingVersion;
  return {
    currentProfileVersion: input.currentProfileVersion,
    currentJobUnderstandingVersion: input.currentJobUnderstandingVersion,
    stale: staleProfile || staleJob,
    reason: staleProfile
      ? "Your Professional Identity changed after this analysis."
      : staleJob
        ? "This job analysis changed after the match was created."
        : undefined
  };
}
