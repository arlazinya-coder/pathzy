import type {
  CanonicalContact,
  CanonicalIdentity,
  CanonicalProfessionalIdentity,
  CanonicalProfessionalProfile,
  CanonicalProfileConfidence,
  ProfileCompletion
} from "./canonical-profile.types";
import { calculateCanonicalCompletion, calculateCanonicalConfidence } from "./canonical-profile-quality";
import { canonicalNow } from "./canonical-profile-utils";

export const PROFESSIONAL_IDENTITY_SECTION_IDS = [
  "profile",
  "photo",
  "personal_information",
  "location",
  "nationality",
  "work_authorization",
  "career_goal",
  "professional_summary",
  "education",
  "experience",
  "skills",
  "projects",
  "achievements",
  "certificates",
  "licences",
  "languages",
  "references",
  "portfolio",
  "social_profiles",
  "preferences",
  "employment_preferences",
  "salary_expectations",
  "availability"
] as const;

export type ProfessionalIdentitySectionId = (typeof PROFESSIONAL_IDENTITY_SECTION_IDS)[number];

export type CanonicalSourceSystem = "canonical" | "legacy_user_profiles" | "professional_identity" | "user_documents" | "professional_documents";

export type CanonicalMigrationMode = "read_through" | "dual_write" | "canonical_primary" | "legacy_compatibility";

export type CanonicalCompatibilityStatus = "canonical_ready" | "legacy_fallback_used" | "partial_migration" | "needs_review";

export type CanonicalProfessionalIdentityEnvelope = {
  profile: CanonicalProfessionalIdentity;
  sourceSystems: CanonicalSourceSystem[];
  compatibilityStatus: CanonicalCompatibilityStatus;
  migrationMode: CanonicalMigrationMode;
  sourceVersion?: number;
  validationVersion: "phase_2a";
};

export type CanonicalProfileVersionContext = {
  userId: string;
  profileId: string;
  fromVersion: number;
  toVersion: number;
  sourceSystem: CanonicalSourceSystem;
  idempotencyKey: string;
  changeSummary: string;
  reversible: boolean;
};

export type CanonicalProfileRootSnapshot = {
  id: string;
  userId: string;
  status: CanonicalProfessionalIdentity["status"];
  currentVersion: number;
  identity: CanonicalIdentity;
  contact: CanonicalContact;
  professionalProfile: CanonicalProfessionalProfile;
  completion: ProfileCompletion;
  confidence: CanonicalProfileConfidence;
  unresolvedIssues: CanonicalProfessionalIdentity["unresolvedIssues"];
  createdAt: string;
  updatedAt: string;
  lastConfirmedAt?: string;
};

export function createEmptyCanonicalProfessionalIdentity(input: {
  userId: string;
  profileId: string;
  version?: number;
  status?: CanonicalProfessionalIdentity["status"];
  createdAt?: string;
}): CanonicalProfessionalIdentity {
  const createdAt = input.createdAt ?? canonicalNow();
  const profile: CanonicalProfessionalIdentity = {
    id: input.profileId,
    userId: input.userId,
    version: input.version ?? 1,
    status: input.status ?? "draft",
    identity: {},
    contact: { otherLinks: [] },
    professionalProfile: { targetRoles: [], industries: [], workPreferences: [] },
    employment: [],
    education: [],
    certifications: [],
    licences: [],
    skills: [],
    languages: [],
    projects: [],
    achievements: [],
    awards: [],
    memberships: [],
    publications: [],
    volunteering: [],
    references: [],
    careerTimeline: [],
    completion: { percentage: 0, missingSections: [], reviewNeededCount: 0 },
    confidence: { overall: 0, identity: 0, contact: 0, employment: 0, education: 0, skills: 0, consistency: 1 },
    unresolvedIssues: [],
    createdAt,
    updatedAt: createdAt
  };
  return refreshCanonicalProfileQuality(profile);
}

export function refreshCanonicalProfileQuality(profile: CanonicalProfessionalIdentity): CanonicalProfessionalIdentity {
  const completion = calculateCanonicalCompletion(profile);
  const confidence = calculateCanonicalConfidence(profile);
  return {
    ...profile,
    completion,
    confidence
  };
}

export function canonicalRootSnapshot(profile: CanonicalProfessionalIdentity): CanonicalProfileRootSnapshot {
  const refreshed = refreshCanonicalProfileQuality(profile);
  return {
    id: refreshed.id,
    userId: refreshed.userId,
    status: refreshed.status,
    currentVersion: refreshed.version,
    identity: refreshed.identity,
    contact: refreshed.contact,
    professionalProfile: refreshed.professionalProfile,
    completion: refreshed.completion,
    confidence: refreshed.confidence,
    unresolvedIssues: refreshed.unresolvedIssues,
    createdAt: refreshed.createdAt,
    updatedAt: refreshed.updatedAt,
    lastConfirmedAt: refreshed.lastConfirmedAt
  };
}

export function isProfessionalIdentitySectionId(value: string): value is ProfessionalIdentitySectionId {
  return (PROFESSIONAL_IDENTITY_SECTION_IDS as readonly string[]).includes(value);
}
