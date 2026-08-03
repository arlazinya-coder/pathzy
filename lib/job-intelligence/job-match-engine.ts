import type { CanonicalProfessionalIdentity, CanonicalReviewStatus } from "@/lib/canonical-profile";
import { valueText } from "@/lib/canonical-profile";
import { appRoutes } from "@/lib/navigation/routes";
import type {
  CanonicalEvidenceReference,
  JobGap,
  JobMatchAnalysis,
  JobRequirement,
  JobRequirementMatch,
  JobRisk,
  JobSuitability,
  StructuredJobOpportunity
} from "./job-intelligence.types";
import { createTargetedCvPreparationPlan } from "./targeted-cv-bridge";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function tokens(value: string) {
  return clean(value)
    .toLowerCase()
    .split(/[^a-z0-9àâçéèêëîïôûùüÿñæœ]+/i)
    .filter((token) => token.length > 2 && !["and", "the", "for", "with", "you", "your", "are", "les", "des", "pour", "avec", "une"].includes(token));
}

function overlapScore(requirement: string, evidence: string) {
  const req = new Set(tokens(requirement));
  if (!req.size) return 0;
  const ev = new Set(tokens(evidence));
  const hits = Array.from(req).filter((token) => ev.has(token)).length;
  return hits / req.size;
}

function reviewStatus(value?: { status?: CanonicalReviewStatus } | null): CanonicalEvidenceReference["reviewStatus"] {
  if (!value?.status) return "uncertain";
  if (value.status === "confirmed" || value.status === "user_entered" || value.status === "provisionally_accepted" || value.status === "needs_review") return value.status;
  return "uncertain";
}

function evidenceReference(input: Omit<CanonicalEvidenceReference, "confidence" | "reviewStatus"> & { confidence?: number; reviewStatus?: CanonicalEvidenceReference["reviewStatus"] }): CanonicalEvidenceReference {
  return {
    ...input,
    confidence: Math.max(0, Math.min(1, input.confidence ?? 0.7)),
    reviewStatus: input.reviewStatus ?? "uncertain"
  };
}

function collectEvidence(profile: CanonicalProfessionalIdentity): CanonicalEvidenceReference[] {
  const evidence: CanonicalEvidenceReference[] = [];
  const summary = valueText(profile.professionalProfile.professionalSummary);
  const headline = valueText(profile.professionalProfile.headline) || valueText(profile.identity.professionalHeadline);
  if (summary) evidence.push(evidenceReference({ entityType: "professional_profile", entityId: "professional-summary", label: "Professional summary", value: summary, confidence: profile.confidence.overall, reviewStatus: reviewStatus(profile.professionalProfile.professionalSummary) }));
  if (headline) evidence.push(evidenceReference({ entityType: "professional_profile", entityId: "headline", label: "Professional headline", value: headline, confidence: profile.confidence.overall, reviewStatus: reviewStatus(profile.professionalProfile.headline ?? profile.identity.professionalHeadline) }));

  for (const skill of profile.skills) {
    if (skill.status === "archived" || skill.explicitness === "unconfirmed_implied") continue;
    evidence.push(evidenceReference({ entityType: "skill", entityId: skill.id, label: "Skill", value: valueText(skill.canonicalName), confidence: skill.confidence, reviewStatus: skill.status === "confirmed" ? "confirmed" : "needs_review" }));
  }

  for (const employment of profile.employment) {
    if (employment.status === "archived") continue;
    const facts = [
      valueText(employment.canonicalTitle),
      valueText(employment.employer),
      valueText(employment.location),
      ...employment.achievements.map((item) => valueText(item.statement)),
      ...employment.responsibilities.map((item) => valueText(item.statement))
    ].filter(Boolean);
    if (facts.length) evidence.push(evidenceReference({ entityType: "employment", entityId: employment.id, label: [valueText(employment.canonicalTitle), valueText(employment.employer)].filter(Boolean).join(" at ") || "Employment record", value: facts.join(" "), confidence: employment.confidence, reviewStatus: employment.status === "confirmed" ? "confirmed" : "needs_review" }));
  }

  for (const education of profile.education) {
    if (education.reviewStatus === "archived") continue;
    const facts = [valueText(education.qualification), valueText(education.fieldOfStudy), valueText(education.institution), valueText(education.degreeLevel)].filter(Boolean);
    if (facts.length) evidence.push(evidenceReference({ entityType: "education", entityId: education.id, label: "Education", value: facts.join(" "), confidence: education.confidence, reviewStatus: education.reviewStatus === "confirmed" ? "confirmed" : "needs_review" }));
  }

  for (const certification of [...profile.certifications, ...profile.licences]) {
    if (certification.status === "archived") continue;
    const facts = [valueText(certification.canonicalName), valueText(certification.issuer)].filter(Boolean);
    if (facts.length) evidence.push(evidenceReference({ entityType: "certification", entityId: certification.id, label: "Certification or licence", value: facts.join(" "), confidence: certification.confidence, reviewStatus: certification.status === "confirmed" ? "confirmed" : "needs_review" }));
  }

  for (const language of profile.languages) {
    if (language.status === "archived") continue;
    evidence.push(evidenceReference({ entityType: "language", entityId: language.id, label: "Language", value: [valueText(language.language), valueText(language.proficiency)].filter(Boolean).join(" "), confidence: language.confidence, reviewStatus: language.status === "confirmed" ? "confirmed" : "needs_review" }));
  }

  for (const project of profile.projects) {
    if (project.status === "archived") continue;
    const facts = [valueText(project.name), valueText(project.role), valueText(project.description), valueText(project.impact)].filter(Boolean);
    if (facts.length) evidence.push(evidenceReference({ entityType: "project", entityId: project.id, label: "Project", value: facts.join(" "), confidence: project.confidence, reviewStatus: project.status === "confirmed" ? "confirmed" : "needs_review" }));
  }

  return evidence;
}

function questionFor(requirement: JobRequirement) {
  return `Can you confirm whether you have evidence for: ${requirement.text}?`;
}

function actionFor(requirement: JobRequirement) {
  if (requirement.category === "skill" || requirement.category === "technology") return "Add confirmed skill evidence or complete a short learning step before applying.";
  if (requirement.category === "experience") return "Add relevant experience, projects, volunteering, or examples that truthfully show this requirement.";
  if (requirement.category === "education" || requirement.category === "certification" || requirement.category === "licence") return "Upload or confirm the qualification if you have it; otherwise avoid claiming it.";
  if (requirement.category === "language") return "Confirm your language level before using it in a targeted CV.";
  return "Review this requirement and decide whether you can support it with truthful evidence.";
}

function matchRequirement(requirement: JobRequirement, evidencePool: CanonicalEvidenceReference[]): JobRequirementMatch {
  const ranked = evidencePool
    .map((evidence) => ({ evidence, score: overlapScore(requirement.normalizedText, evidence.value) * evidence.confidence }))
    .filter((item) => item.score > 0.12)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  const topScore = ranked[0]?.score ?? 0;
  const status = topScore >= 0.46 ? "matched" : topScore >= 0.24 ? "partial" : requirement.confidence < 0.65 ? "uncertain" : "missing";
  const explanation =
    status === "matched"
      ? "Your confirmed profile has evidence that supports this requirement."
      : status === "partial"
        ? "Your profile has related evidence, but it may need clearer positioning before applying."
        : status === "uncertain"
          ? "The job requirement is unclear, so PATHZY needs your review before using it."
          : "No confirmed evidence was found in your professional identity yet.";
  return {
    requirement,
    status,
    score: Math.round(topScore * 100),
    explanation,
    evidence: ranked.map((item) => item.evidence),
    questions: status === "matched" ? [] : [questionFor(requirement)]
  };
}

function suitabilityFrom(readiness: number, gaps: JobGap[], risks: JobRisk[]): JobSuitability {
  const highRisk = risks.some((risk) => risk.severity === "high");
  const mandatoryGaps = gaps.filter((gap) => gap.importance === "mandatory").length;
  if (highRisk || (mandatoryGaps >= 3 && readiness < 45)) return "not_recommended_yet";
  if (readiness >= 75 && mandatoryGaps === 0) return "strong_fit";
  if (readiness >= 55 && mandatoryGaps <= 1) return "potential_fit";
  if (readiness >= 35) return "stretch";
  return "not_enough_information";
}

function headlineFor(suitability: JobSuitability, readiness: number) {
  if (suitability === "strong_fit") return `Strong evidence fit. Your profile supports most key requirements (${readiness}/100 readiness).`;
  if (suitability === "potential_fit") return `Promising fit with a few review points (${readiness}/100 readiness).`;
  if (suitability === "stretch") return `Possible stretch role. Prepare carefully before applying (${readiness}/100 readiness).`;
  if (suitability === "not_recommended_yet") return `Not ready to apply yet. Strengthen missing evidence first (${readiness}/100 readiness).`;
  return "PATHZY needs more confirmed profile evidence before judging this opportunity.";
}

export function analyzeJobAgainstCanonicalProfile(input: {
  profile: CanonicalProfessionalIdentity;
  job: StructuredJobOpportunity;
  userId?: string;
}): JobMatchAnalysis {
  const evidencePool = collectEvidence(input.profile);
  const requirementMatches = input.job.requirements.map((requirement) => matchRequirement(requirement, evidencePool));
  const strengths = requirementMatches.filter((match) => match.status === "matched");
  const partialMatches = requirementMatches.filter((match) => match.status === "partial");
  const uncertainties = requirementMatches.filter((match) => match.status === "uncertain");
  const gaps: JobGap[] = requirementMatches
    .filter((match) => match.status === "missing")
    .map((match) => ({
      requirementId: match.requirement.id,
      requirement: match.requirement.text,
      importance: match.requirement.importance,
      category: match.requirement.category,
      action: actionFor(match.requirement)
    }));
  const mandatoryMatches = requirementMatches.filter((match) => match.requirement.importance === "mandatory");
  const readinessDenominator = Math.max(1, requirementMatches.reduce((sum, match) => sum + (match.requirement.importance === "mandatory" ? 1.4 : match.requirement.importance === "preferred" ? 1 : 0.6), 0));
  const readinessNumerator = requirementMatches.reduce((sum, match) => {
    const weight = match.requirement.importance === "mandatory" ? 1.4 : match.requirement.importance === "preferred" ? 1 : 0.6;
    const multiplier = match.status === "matched" ? 1 : match.status === "partial" ? 0.55 : match.status === "uncertain" ? 0.22 : 0;
    return sum + weight * multiplier;
  }, 0);
  const readinessScore = Math.round((readinessNumerator / readinessDenominator) * 100);
  const risks: JobRisk[] = [];
  if (!evidencePool.length) {
    risks.push({ id: "no-profile-evidence", severity: "high", message: "Your canonical professional identity does not yet contain enough confirmed evidence.", userAction: "Complete or confirm your Professional Profile before preparing a targeted CV." });
  }
  if (mandatoryMatches.length && mandatoryMatches.every((match) => match.status === "missing")) {
    risks.push({ id: "mandatory-requirements-missing", severity: "high", message: "The mandatory requirements are not supported by confirmed profile evidence yet.", userAction: "Review whether this role is suitable before applying." });
  }
  if (uncertainties.length > 3) {
    risks.push({ id: "unclear-job-ad", severity: "warning", message: "Several job requirements are unclear and need review.", userAction: "Paste a fuller job advert or confirm the unclear requirements manually." });
  }
  const suitability = suitabilityFrom(readinessScore, gaps, risks);
  const targetedCvPlan = createTargetedCvPreparationPlan({
    profile: input.profile,
    job: input.job,
    matches: requirementMatches,
    gaps
  });
  const questionsForUser = Array.from(new Set([...uncertainties.flatMap((match) => match.questions), ...gaps.slice(0, 4).map((gap) => `Do you have truthful evidence for ${gap.requirement}?`)]));
  const now = new Date().toISOString();
  return {
    id: `analysis-${input.job.id}-${input.profile.version}`,
    userId: input.userId,
    canonicalProfileId: input.profile.id,
    profileVersion: input.profile.version,
    job: input.job,
    readinessScore,
    suitability,
    headline: headlineFor(suitability, readinessScore),
    strengths,
    partialMatches,
    gaps,
    uncertainties,
    risks,
    questionsForUser,
    targetedCvPlan,
    nextActions: [
      { label: "Review match evidence", route: "/opportunities", reason: "Confirm strengths, gaps, and uncertain requirements before applying." },
      { label: "Prepare truthful targeted CV", route: `/professional-identity/cv?role=${encodeURIComponent(input.job.title ?? "")}&job=${encodeURIComponent(input.job.id)}&intent=targeted`, reason: "Use only verified profile evidence in the targeted CV." },
      { label: "Track this opportunity", route: `${appRoutes.applications}?company=${encodeURIComponent(input.job.company ?? "")}&role=${encodeURIComponent(input.job.title ?? "")}`, reason: "Keep preparation and follow-up under your control." }
    ],
    createdAt: now
  };
}
