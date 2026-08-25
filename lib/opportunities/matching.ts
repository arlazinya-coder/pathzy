import type { CanonicalProfessionalIdentity } from "@/lib/canonical-profile";
import { valueText } from "@/lib/canonical-profile";
import type { Opportunity, OpportunityAction, OpportunityMatchExplanation, PersonalizedOpportunity } from "./types";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function lower(value: unknown) {
  return cleanText(value).toLowerCase();
}

function includesAny(text: string, values: string[]) {
  return values.some((value) => value && text.includes(value.toLowerCase()));
}

function dateValue(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function normalizeOpportunityFreshness(opportunity: Opportunity, now = new Date()): Opportunity["status"] {
  const closing = dateValue(opportunity.closingAt);
  if (!closing) return opportunity.status === "EXPIRED" ? "EXPIRED" : opportunity.status === "CLOSING_SOON" ? "CLOSING_SOON" : opportunity.status === "ACTIVE" ? "ACTIVE" : "UNKNOWN";
  if (closing.getTime() < now.getTime()) return "EXPIRED";
  const daysUntilClosing = (closing.getTime() - now.getTime()) / 86_400_000;
  return daysUntilClosing <= 7 ? "CLOSING_SOON" : "ACTIVE";
}

export function deduplicateOpportunities(opportunities: Opportunity[]): Opportunity[] {
  const seen = new Map<string, Opportunity>();
  for (const opportunity of opportunities) {
    const sourceKey = [opportunity.source, opportunity.externalId].map(lower).join(":");
    const contentKey = [opportunity.employer, opportunity.title, opportunity.location].map(lower).join(":");
    const urlKey = lower(opportunity.sourceUrl || opportunity.applicationUrl);
    const key = sourceKey || urlKey || contentKey;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, opportunity);
      continue;
    }
    const preferred = existing.applicationUrl.includes(existing.employer.toLowerCase()) ? existing : opportunity;
    seen.set(key, preferred.applicationUrl ? preferred : existing);
  }
  return Array.from(seen.values());
}

export function candidateSignalsFromProfessionalIdentity(profile: CanonicalProfessionalIdentity) {
  const targetRoles = [
    valueText(profile.professionalProfile.headline),
    ...profile.professionalProfile.targetRoles.map(valueText),
    ...(profile.careerPreferences?.targetRoles.map(valueText) ?? []),
    valueText(profile.identity.professionalHeadline)
  ].filter(Boolean);
  const skills = profile.skills.map((skill) => valueText(skill.canonicalName)).filter(Boolean);
  const education = profile.education.flatMap((item) => [valueText(item.qualification), valueText(item.fieldOfStudy), valueText(item.institution)]).filter(Boolean);
  const licences = profile.licences.map((item) => valueText(item.canonicalName)).filter(Boolean);
  const certifications = profile.certifications.map((item) => valueText(item.canonicalName)).filter(Boolean);
  const languages = profile.languages.map((item) => valueText(item.language)).filter(Boolean);
  const experience = profile.employment.flatMap((item) => [
    valueText(item.canonicalTitle),
    valueText(item.employer),
    ...item.responsibilities.map((responsibility) => valueText(responsibility.statement)),
    ...item.achievements.map((achievement) => valueText(achievement.statement))
  ]).filter(Boolean);
  return {
    targetRoles,
    skills,
    education,
    licences,
    certifications,
    languages,
    experience,
    location: valueText(profile.contact.city) || valueText(profile.contact.country),
    workPreferences: profile.professionalProfile.workPreferences.map(valueText).filter(Boolean),
    noFormalExperience: profile.employment.length === 0
  };
}

function suitabilityLabel(score: number): OpportunityMatchExplanation["suitabilityLabel"] {
  if (score >= 75) return "STRONG_MATCH";
  if (score >= 58) return "GOOD_MATCH";
  if (score >= 38) return "POSSIBLE_MATCH";
  return "STRETCH_OPPORTUNITY";
}

function recommendationFor(input: {
  status: Opportunity["status"];
  eligibilityStatus: OpportunityMatchExplanation["eligibilityStatus"];
  score: number;
}): OpportunityMatchExplanation["recommendation"] {
  if (input.status === "EXPIRED" || input.eligibilityStatus === "BLOCKED") return "DO_NOT_RECOMMEND_NOW";
  if (input.eligibilityStatus === "CHECK_NEEDED") return "APPLY_AFTER_CHECKING";
  if (input.score >= 58) return "WORTH_APPLYING";
  return "PREPARE_FIRST";
}

export function explainOpportunityForProfile(opportunity: Opportunity, profile: CanonicalProfessionalIdentity): OpportunityMatchExplanation {
  const signals = candidateSignalsFromProfessionalIdentity(profile);
  const jobText = [
    opportunity.title,
    opportunity.description,
    opportunity.employmentType,
    opportunity.location,
    ...opportunity.requirements,
    ...opportunity.responsibilities
  ].join(" ").toLowerCase();
  const targetAligned = includesAny(lower(opportunity.title), signals.targetRoles) || includesAny(jobText, signals.targetRoles);
  const matchedRequiredSkills = opportunity.requiredSkills.filter((skill) => includesAny(lower(skill), signals.skills) || includesAny(jobText, [skill]) && includesAny(lower(skill), signals.experience));
  const matchedPreferredSkills = opportunity.preferredSkills.filter((skill) => includesAny(lower(skill), signals.skills));
  const educationMatch = opportunity.requiredEducation.length === 0 || opportunity.requiredEducation.some((item) => includesAny(lower(item), signals.education));
  const licenceMatch = opportunity.licences.length === 0 || opportunity.licences.some((item) => includesAny(lower(item), signals.licences));
  const certificationMatch = opportunity.certifications.length === 0 || opportunity.certifications.some((item) => includesAny(lower(item), signals.certifications));
  const languageMatch = opportunity.languages.length === 0 || opportunity.languages.some((item) => includesAny(lower(item), signals.languages));
  const locationKnown = Boolean(signals.location);
  const locationCompatible = !opportunity.location || !locationKnown || lower(opportunity.location).includes(lower(signals.location)) || opportunity.remoteType === "REMOTE";

  const unknowns: string[] = [];
  const gaps: string[] = [];
  if (opportunity.workAuthorizationRequirement) unknowns.push("PATHZY needs your work authorization information for this vacancy.");
  if (opportunity.licences.length && !signals.licences.length) unknowns.push("PATHZY needs your licence information.");
  if (opportunity.certifications.length && !signals.certifications.length) unknowns.push("PATHZY needs your certification information.");
  if (opportunity.languages.length && !signals.languages.length) unknowns.push("PATHZY needs your language information.");
  if (!locationKnown) unknowns.push("PATHZY needs your location or remote-work preference.");
  if (opportunity.requiredSkills.length && !matchedRequiredSkills.length) gaps.push("Required skills need review against your Professional Identity.");
  if (opportunity.requiredEducation.length && !educationMatch) gaps.push("Required education needs review.");

  const hardBlocked = opportunity.status === "EXPIRED";
  const eligibilityStatus: OpportunityMatchExplanation["eligibilityStatus"] = hardBlocked
    ? "BLOCKED"
    : unknowns.length
      ? "CHECK_NEEDED"
      : gaps.some((gap) => /required education/i.test(gap)) || !licenceMatch || !certificationMatch || !languageMatch || !locationCompatible
        ? "CHECK_NEEDED"
        : "COMPATIBLE";

  let score = 26;
  if (targetAligned) score += 22;
  if (matchedRequiredSkills.length) score += Math.min(24, matchedRequiredSkills.length * 8);
  if (matchedPreferredSkills.length) score += Math.min(12, matchedPreferredSkills.length * 4);
  if (educationMatch) score += 8;
  if (signals.experience.length) score += 8;
  if (signals.noFormalExperience && (opportunity.category === "Internships" || /junior|assistant|trainee|intern|learnership/i.test(opportunity.title))) score += 12;
  if (locationCompatible) score += 6;
  if (opportunity.status === "EXPIRED") score = Math.min(score, 20);
  const suitabilityScore = Math.max(5, Math.min(96, Math.round(score)));

  const reasons = [
    targetAligned ? "Career direction aligns with this role." : "",
    matchedRequiredSkills[0] ? `${matchedRequiredSkills[0]} appears supported by your Professional Identity.` : "",
    matchedPreferredSkills[0] ? `${matchedPreferredSkills[0]} may strengthen your application.` : "",
    educationMatch && opportunity.requiredEducation.length ? "Education appears relevant." : "",
    locationCompatible ? "Location or remote arrangement appears workable." : "",
    signals.noFormalExperience ? "PATHZY considered education, projects and entry-level signals because formal experience is limited." : ""
  ].filter(Boolean).slice(0, 4);

  return {
    suitabilityScore,
    suitabilityLabel: suitabilityLabel(suitabilityScore),
    eligibilityStatus,
    reasons: reasons.length ? reasons : ["PATHZY found a real vacancy and needs more Professional Identity detail to explain the fit."],
    gaps: gaps.slice(0, 3),
    unknowns: unknowns.slice(0, 4),
    recommendation: recommendationFor({ status: opportunity.status, eligibilityStatus, score: suitabilityScore })
  };
}

export function personalizeRealOpportunities(input: {
  opportunities: Opportunity[];
  profile: CanonicalProfessionalIdentity;
  actions: OpportunityAction[];
  now?: Date;
}): PersonalizedOpportunity[] {
  const actionMap = new Map(input.actions.map((action) => [action.opportunity_id, action]));
  return deduplicateOpportunities(input.opportunities)
    .map((opportunity) => {
      const status = normalizeOpportunityFreshness(opportunity, input.now);
      return { ...opportunity, status };
    })
    .filter((opportunity) => opportunity.status !== "EXPIRED")
    .map((opportunity) => {
      const match = explainOpportunityForProfile(opportunity, input.profile);
      const action = actionMap.get(opportunity.id) ?? {
        opportunity_id: opportunity.id,
        saved: false,
        applied: false,
        completed: false,
        hidden: false
      };
      return {
        ...opportunity,
        fit: match.suitabilityScore,
        reasons: match.reasons,
        action,
        match
      };
    })
    .filter((opportunity) => !opportunity.action.hidden)
    .sort((a, b) => b.match.suitabilityScore - a.match.suitabilityScore);
}

export function opportunityToJobImportText(opportunity: Opportunity) {
  return [
    `Job title: ${opportunity.title}`,
    `Organisation: ${opportunity.employer}`,
    `Location: ${opportunity.location}`,
    `Employment type: ${opportunity.employmentType}`,
    `Work arrangement: ${opportunity.remoteType}`,
    opportunity.closingAt ? `Closing date: ${opportunity.closingAt}` : "",
    `Application URL: ${opportunity.applicationUrl}`,
    opportunity.description,
    opportunity.responsibilities.length ? `Responsibilities:\n${opportunity.responsibilities.join("\n")}` : "",
    opportunity.requirements.length ? `Requirements:\n${opportunity.requirements.join("\n")}` : ""
  ].filter(Boolean).join("\n");
}
