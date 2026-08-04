import type { CanonicalSourceReference } from "./canonical-profile.types";
import type { CanonicalCompatibilityStatus, CanonicalProfessionalIdentityEnvelope } from "./canonical-professional-identity.model";
import { createEmptyCanonicalProfessionalIdentity, refreshCanonicalProfileQuality } from "./canonical-professional-identity.model";
import { canonicalNow, cleanText, createCanonicalValue, createSourceReference } from "./canonical-profile-utils";
import { normalizeCurrentSituation } from "@/lib/professional-identity/current-situation";

export type LegacyUserProfileRow = Record<string, unknown>;
export type LegacyProfessionalIdentityRow = Record<string, unknown>;

export type CanonicalCompatibilityInput = {
  userId: string;
  profileId: string;
  legacyProfile?: LegacyUserProfileRow | null;
  professionalIdentity?: LegacyProfessionalIdentityRow | null;
  createdAt?: string;
};

export type CompatibilityMappingReport = {
  migratedFields: string[];
  skippedFields: string[];
  sourceSystems: CanonicalProfessionalIdentityEnvelope["sourceSystems"];
  compatibilityStatus: CanonicalCompatibilityStatus;
};

function readString(row: LegacyUserProfileRow | null | undefined, ...keys: string[]) {
  for (const key of keys) {
    const value = cleanText(row?.[key]);
    if (value) return value;
  }
  return "";
}

function readFirstString(rows: Array<LegacyUserProfileRow | null | undefined>, ...keys: string[]) {
  for (const row of rows) {
    const value = readString(row, ...keys);
    if (value) return value;
  }
  return "";
}

function legacySource(originalValue: string, addedAt: string): CanonicalSourceReference[] {
  return [createSourceReference({ sourceType: "existing_profile", originalValue, sourceConfidence: 0.82, addedAt })];
}

function addMigrated(report: CompatibilityMappingReport, field: string, value: string) {
  if (value) report.migratedFields.push(field);
  else report.skippedFields.push(field);
}

export function mapLegacyRowsToCanonicalProfessionalIdentity(input: CanonicalCompatibilityInput): {
  envelope: CanonicalProfessionalIdentityEnvelope;
  report: CompatibilityMappingReport;
} {
  const createdAt = input.createdAt ?? canonicalNow();
  const profile = createEmptyCanonicalProfessionalIdentity({ userId: input.userId, profileId: input.profileId, createdAt });
  const report: CompatibilityMappingReport = {
    migratedFields: [],
    skippedFields: [],
    sourceSystems: ["canonical"],
    compatibilityStatus: "canonical_ready"
  };

  if (input.legacyProfile) report.sourceSystems.push("legacy_user_profiles");
  if (input.professionalIdentity) report.sourceSystems.push("professional_identity");

  const compatibilityRows = [input.legacyProfile, input.professionalIdentity];
  const fullName = readFirstString(compatibilityRows, "full_name", "name");
  const email = readFirstString(compatibilityRows, "email", "primary_email");
  const phone = readFirstString(compatibilityRows, "phone", "primary_phone");
  const city = readFirstString(compatibilityRows, "city");
  const country = readFirstString(compatibilityRows, "country");
  const linkedIn = readFirstString(compatibilityRows, "linkedin_url", "linkedin", "linkedIn");
  const portfolio = readFirstString(compatibilityRows, "portfolio_url", "portfolio", "website");
  const careerGoal = readFirstString(compatibilityRows, "career_goal", "target_role", "desired_role", "professional_headline");
  const professionalSummary = readFirstString(compatibilityRows, "professional_summary", "summary", "bio");
  const currentStatus = normalizeCurrentSituation(readFirstString(compatibilityRows, "current_status", "employment_status", "currentSituation", "current_status_label"));
  const education = readFirstString(compatibilityRows, "education", "highest_qualification");
  const fieldOfStudy = readFirstString(compatibilityRows, "field_of_study");
  const language = readFirstString(compatibilityRows, "language");

  if (fullName) profile.identity.fullName = createCanonicalValue(fullName, { status: "provisionally_accepted", confidence: 0.82, sourceReferences: legacySource(fullName, createdAt), createdAt, updatedAt: createdAt });
  if (currentStatus) profile.identity.professionalStatus = createCanonicalValue(currentStatus, { status: "provisionally_accepted", confidence: 0.74, sourceReferences: legacySource(currentStatus, createdAt), createdAt, updatedAt: createdAt });
  if (email) profile.contact.primaryEmail = createCanonicalValue(email, { status: "provisionally_accepted", confidence: 0.82, sourceReferences: legacySource(email, createdAt), createdAt, updatedAt: createdAt, displayValue: email });
  if (phone) profile.contact.primaryPhone = createCanonicalValue(phone, { status: "provisionally_accepted", confidence: 0.78, sourceReferences: legacySource(phone, createdAt), createdAt, updatedAt: createdAt });
  if (city) profile.contact.city = createCanonicalValue(city, { status: "provisionally_accepted", confidence: 0.8, sourceReferences: legacySource(city, createdAt), createdAt, updatedAt: createdAt });
  if (country) profile.contact.country = createCanonicalValue(country, { status: "provisionally_accepted", confidence: 0.8, sourceReferences: legacySource(country, createdAt), createdAt, updatedAt: createdAt });
  if (linkedIn) profile.contact.linkedIn = createCanonicalValue(linkedIn, { status: "provisionally_accepted", confidence: 0.76, sourceReferences: legacySource(linkedIn, createdAt), createdAt, updatedAt: createdAt });
  if (portfolio) profile.contact.portfolio = createCanonicalValue(portfolio, { status: "provisionally_accepted", confidence: 0.76, sourceReferences: legacySource(portfolio, createdAt), createdAt, updatedAt: createdAt });
  if (careerGoal) {
    profile.professionalProfile.headline = createCanonicalValue(careerGoal, { status: "provisionally_accepted", confidence: 0.74, sourceReferences: legacySource(careerGoal, createdAt), createdAt, updatedAt: createdAt });
    profile.professionalProfile.targetRoles = [createCanonicalValue(careerGoal, { status: "provisionally_accepted", confidence: 0.74, sourceReferences: legacySource(careerGoal, createdAt), createdAt, updatedAt: createdAt })];
  }
  if (professionalSummary) profile.professionalProfile.professionalSummary = createCanonicalValue(professionalSummary, { status: "provisionally_accepted", confidence: 0.72, sourceReferences: legacySource(professionalSummary, createdAt), createdAt, updatedAt: createdAt });
  if (education) {
    profile.education.push({
      id: `legacy-education-${input.profileId}`,
      qualification: createCanonicalValue(education, { status: "provisionally_accepted", confidence: 0.74, sourceReferences: legacySource(education, createdAt), createdAt, updatedAt: createdAt }),
      fieldOfStudy: fieldOfStudy ? createCanonicalValue(fieldOfStudy, { status: "provisionally_accepted", confidence: 0.72, sourceReferences: legacySource(fieldOfStudy, createdAt), createdAt, updatedAt: createdAt }) : undefined,
      institution: createCanonicalValue("", { status: "needs_review", confidence: 0, sourceReferences: legacySource(education, createdAt), createdAt, updatedAt: createdAt }),
      institutionAliases: [],
      status: createCanonicalValue("unknown" as const, { status: "needs_review", confidence: 0.4, sourceReferences: legacySource(education, createdAt), createdAt, updatedAt: createdAt }),
      supportingDocumentIds: [],
      sourceReferences: legacySource(education, createdAt),
      confidence: 0.68,
      reviewStatus: "needs_review",
      createdAt,
      updatedAt: createdAt
    });
  }
  if (language) {
    profile.languages.push({
      id: `legacy-language-${input.profileId}`,
      language: createCanonicalValue(language, { status: "provisionally_accepted", confidence: 0.7, sourceReferences: legacySource(language, createdAt), createdAt, updatedAt: createdAt }),
      sourceReferences: legacySource(language, createdAt),
      confidence: 0.7,
      status: "needs_review"
    });
  }

  for (const [field, value] of Object.entries({ fullName, email, phone, city, country, linkedIn, portfolio, careerGoal, professionalSummary, currentStatus, education, fieldOfStudy, language })) {
    addMigrated(report, field, value);
  }

  report.compatibilityStatus = report.migratedFields.length ? "legacy_fallback_used" : "canonical_ready";

  return {
    envelope: {
      profile: refreshCanonicalProfileQuality(profile),
      sourceSystems: report.sourceSystems,
      compatibilityStatus: report.compatibilityStatus,
      migrationMode: "read_through",
      validationVersion: "phase_2a"
    },
    report
  };
}
