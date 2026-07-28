import type { CanonicalProfessionalIdentity, CanonicalProfileIssue } from "./canonical-profile.types";
import { PROFESSIONAL_IDENTITY_SECTION_IDS, type ProfessionalIdentitySectionId } from "./canonical-professional-identity.model";
import { valueText } from "./canonical-profile-utils";
import { validateCanonicalContact, validateCanonicalEducation, validateCanonicalEmployment } from "./canonical-profile-validation";

export type CanonicalValidationResult = {
  valid: boolean;
  blockingIssues: CanonicalProfileIssue[];
  warnings: CanonicalProfileIssue[];
  coveredSections: ProfessionalIdentitySectionId[];
  missingCoreSections: ProfessionalIdentitySectionId[];
};

function issue(fieldPath: string, messageKey: string, severity: CanonicalProfileIssue["severity"] = "warning"): CanonicalProfileIssue {
  return { id: `${fieldPath}:${messageKey}`, fieldPath, messageKey, severity, sourceReferences: [] };
}

export function validateCanonicalProfessionalIdentityModel(profile: CanonicalProfessionalIdentity): CanonicalValidationResult {
  const issues: CanonicalProfileIssue[] = [];

  if (!profile.userId) issues.push(issue("profile.userId", "canonical_user_id_required", "blocking"));
  if (!profile.id) issues.push(issue("profile.id", "canonical_profile_id_required", "blocking"));
  if (!Number.isInteger(profile.version) || profile.version < 1) issues.push(issue("profile.version", "canonical_version_invalid", "blocking"));

  const fullName = valueText(profile.identity.fullName);
  const email = valueText(profile.contact.primaryEmail);
  const targetRole = valueText(profile.professionalProfile.headline) || valueText(profile.identity.professionalHeadline);

  if (!fullName) issues.push(issue("identity.fullName", "canonical_full_name_missing", "warning"));
  if (!email) issues.push(issue("contact.primaryEmail", "canonical_email_missing", "warning"));
  if (!targetRole) issues.push(issue("professionalProfile.headline", "canonical_career_goal_missing", "warning"));

  issues.push(...validateCanonicalContact({ email, url: valueText(profile.contact.professionalWebsite) || valueText(profile.contact.portfolio) }));
  profile.employment.forEach((employment) => issues.push(...validateCanonicalEmployment(employment)));
  profile.education.forEach((education) => issues.push(...validateCanonicalEducation(education)));

  const missingCoreSections: ProfessionalIdentitySectionId[] = [];
  if (!fullName) missingCoreSections.push("personal_information");
  if (!valueText(profile.contact.city) && !valueText(profile.contact.country)) missingCoreSections.push("location");
  if (!targetRole) missingCoreSections.push("career_goal");
  if (!valueText(profile.professionalProfile.professionalSummary)) missingCoreSections.push("professional_summary");
  if (!profile.education.length) missingCoreSections.push("education");
  if (!profile.employment.length) missingCoreSections.push("experience");
  if (!profile.skills.length) missingCoreSections.push("skills");

  const blockingIssues = issues.filter((item) => item.severity === "blocking");
  const warnings = issues.filter((item) => item.severity !== "blocking");

  return {
    valid: blockingIssues.length === 0,
    blockingIssues,
    warnings,
    coveredSections: [...PROFESSIONAL_IDENTITY_SECTION_IDS],
    missingCoreSections
  };
}

export function assertCanonicalProfessionalIdentityIsPersistable(profile: CanonicalProfessionalIdentity): void {
  const validation = validateCanonicalProfessionalIdentityModel(profile);
  if (!validation.valid) {
    throw new Error(`Canonical Professional Identity is not persistable: ${validation.blockingIssues.map((item) => item.messageKey).join(", ")}`);
  }
}
