import type { CanonicalProfessionalIdentity, CanonicalProfileQuality, CanonicalReadiness } from "./canonical-profile.types";
import { sourceReferenceCount, valueText } from "./canonical-profile-utils";

function ratio(found: number, total: number) {
  return total <= 0 ? 0 : Math.round((found / total) * 100);
}

export function calculateCanonicalCompletion(profile: Pick<CanonicalProfessionalIdentity, "identity" | "contact" | "professionalProfile" | "employment" | "education" | "skills" | "languages" | "certifications" | "projects" | "unresolvedIssues">) {
  const checks = [
    valueText(profile.identity.fullName),
    valueText(profile.contact.primaryEmail),
    valueText(profile.contact.city) || valueText(profile.contact.country),
    valueText(profile.professionalProfile.headline) || valueText(profile.professionalProfile.profession),
    valueText(profile.professionalProfile.professionalSummary),
    profile.employment.length ? "employment" : "",
    profile.education.length ? "education" : "",
    profile.skills.length ? "skills" : "",
    profile.languages.length ? "languages" : "",
    profile.certifications.length || profile.projects.length ? "proof" : ""
  ];
  const missingSections = [
    !checks[0] ? "identity.fullName" : "",
    !checks[1] ? "contact.primaryEmail" : "",
    !checks[2] ? "contact.location" : "",
    !checks[3] ? "professionalProfile.headline" : "",
    !checks[4] ? "professionalProfile.professionalSummary" : "",
    !checks[5] ? "employment" : "",
    !checks[6] ? "education" : "",
    !checks[7] ? "skills" : ""
  ].filter(Boolean);

  return {
    percentage: ratio(checks.filter(Boolean).length, checks.length),
    missingSections,
    reviewNeededCount: profile.unresolvedIssues.length
  };
}

export function calculateCanonicalConfidence(profile: Pick<CanonicalProfessionalIdentity, "identity" | "contact" | "professionalProfile" | "employment" | "education" | "skills" | "unresolvedIssues">) {
  const identityValues = [profile.identity.fullName, profile.identity.professionalHeadline, profile.identity.currentProfession];
  const contactValues = [profile.contact.primaryEmail, profile.contact.primaryPhone, profile.contact.city, profile.contact.country];
  const profileValues = [profile.professionalProfile.headline, profile.professionalProfile.profession, profile.professionalProfile.professionalSummary];
  const employmentConfidence = profile.employment.length ? profile.employment.reduce((sum, item) => sum + item.confidence, 0) / profile.employment.length : 0;
  const educationConfidence = profile.education.length ? profile.education.reduce((sum, item) => sum + item.confidence, 0) / profile.education.length : 0;
  const skillsConfidence = profile.skills.length ? profile.skills.reduce((sum, item) => sum + item.confidence, 0) / profile.skills.length : 0;
  const evidenceBonus = Math.min(0.12, sourceReferenceCount([...identityValues, ...contactValues, ...profileValues]) * 0.01);
  const contradictionPenalty = Math.min(0.35, profile.unresolvedIssues.filter((issue) => issue.severity !== "info").length * 0.07);
  const identity = Math.min(1, averageConfidence(identityValues) + evidenceBonus);
  const contact = Math.min(1, averageConfidence(contactValues) + evidenceBonus);
  const professionalProfile = Math.min(1, averageConfidence(profileValues) + evidenceBonus);
  const consistency = Math.max(0, 1 - contradictionPenalty);
  const overall = Math.max(0, Math.min(1, (identity + contact + professionalProfile + employmentConfidence + educationConfidence + skillsConfidence + consistency) / 7));

  return { overall, identity, contact, employment: employmentConfidence, education: educationConfidence, skills: skillsConfidence, consistency };
}

function averageConfidence(values: Array<{ confidence?: number } | undefined>) {
  const present = values.filter(Boolean) as Array<{ confidence?: number }>;
  if (!present.length) return 0;
  return present.reduce((sum, value) => sum + (value.confidence ?? 0), 0) / present.length;
}

export function calculateCanonicalReadiness(completeness: number, confidence: number, consistency: number, reviewNeededCount: number): CanonicalReadiness {
  if (completeness < 35) return "not_ready";
  if (reviewNeededCount > 0 || consistency < 0.72) return "review_required";
  if (confidence < 0.72 || completeness < 70) return "ready_with_warnings";
  return "ready";
}

export function calculateCanonicalProfileQuality(profile: CanonicalProfessionalIdentity): CanonicalProfileQuality {
  const completion = calculateCanonicalCompletion(profile);
  const confidence = calculateCanonicalConfidence(profile);
  return {
    completeness: completion.percentage,
    confidence: Math.round(confidence.overall * 100),
    consistency: Math.round(confidence.consistency * 100),
    readiness: calculateCanonicalReadiness(completion.percentage, confidence.overall, confidence.consistency, completion.reviewNeededCount)
  };
}

