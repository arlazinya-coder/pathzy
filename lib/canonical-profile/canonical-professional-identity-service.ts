import type { SupabaseClient } from "@supabase/supabase-js";
import type { CanonicalProfessionalIdentity } from "./canonical-profile.types";
import { mapLegacyRowsToCanonicalProfessionalIdentity, type CompatibilityMappingReport } from "./canonical-profile-compatibility-adapter";
import { CanonicalProfileRepository } from "./canonical-profile-repository";
import { createCanonicalProfileVersionRecord, createCanonicalVersionContext } from "./canonical-profile-versioning";
import { assertCanonicalProfessionalIdentityIsPersistable, validateCanonicalProfessionalIdentityModel } from "./canonical-professional-identity.validation";

export type CanonicalProfessionalIdentityLoadResult = {
  profile: CanonicalProfessionalIdentity;
  source: "canonical" | "legacy_compatibility";
  compatibilityReport?: CompatibilityMappingReport;
};

export class CanonicalProfessionalIdentityService {
  private readonly repository: CanonicalProfileRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new CanonicalProfileRepository(supabase);
  }

  async getOrCreate(userId: string): Promise<CanonicalProfessionalIdentityLoadResult> {
    const existing = await this.repository.loadByUserId(userId);
    if (existing) return { profile: existing, source: "canonical" };

    const compatibilityRows = await this.repository.loadLegacyCompatibilityRows(userId);
    const profileId = crypto.randomUUID();
    const { envelope, report } = mapLegacyRowsToCanonicalProfessionalIdentity({
      userId,
      profileId,
      legacyProfile: compatibilityRows.legacyProfile,
      professionalIdentity: compatibilityRows.professionalIdentity
    });

    assertCanonicalProfessionalIdentityIsPersistable(envelope.profile);
    await this.repository.upsertRootSnapshot(envelope.profile);

    const context = createCanonicalVersionContext({
      userId,
      profileId,
      currentVersion: 0,
      sourceSystem: "legacy_user_profiles",
      sourceRecordId: String(compatibilityRows.legacyProfile?.id ?? userId),
      changeSummary: "Created canonical Professional Identity from compatibility sources.",
      changeType: "field_added"
    });
    const versionRecord = createCanonicalProfileVersionRecord({
      context,
      changeType: "field_added",
      changedBy: "migration",
      changeSetJson: {
        sourceSystems: envelope.sourceSystems,
        migratedFields: report.migratedFields,
        skippedFields: report.skippedFields,
        validation: validateCanonicalProfessionalIdentityModel(envelope.profile)
      },
      snapshotJson: envelope.profile
    });
    await this.repository.insertVersion({ ...versionRecord, idempotencyKey: context.idempotencyKey });

    return { profile: envelope.profile, source: "legacy_compatibility", compatibilityReport: report };
  }

  async markViewsStaleAfterChange(userId: string, profileId: string, currentVersion: number): Promise<string[]> {
    return this.repository.markViewsStale(userId, profileId, currentVersion);
  }
}

export function createCanonicalProfessionalIdentityService(supabase: SupabaseClient): CanonicalProfessionalIdentityService {
  return new CanonicalProfessionalIdentityService(supabase);
}
