import type { SupabaseClient } from "@supabase/supabase-js";
import type { CanonicalProfessionalIdentity, CanonicalProfileVersion, CanonicalTimelineEvent } from "./canonical-profile.types";
import { canonicalRootSnapshot, refreshCanonicalProfileQuality } from "./canonical-professional-identity.model";
import { canonicalNow } from "./canonical-profile-utils";

type Supabase = SupabaseClient;
type CanonicalRow = Record<string, unknown>;

function rowString(row: CanonicalRow, key: string): string | undefined {
  const value = row[key];
  return typeof value === "string" ? value : undefined;
}

function rowNumber(row: CanonicalRow, key: string): number | undefined {
  const value = row[key];
  return typeof value === "number" ? value : undefined;
}

function normalizeProfileRow(row: CanonicalRow, employments: CanonicalRow[] = [], education: CanonicalRow[] = [], skills: CanonicalRow[] = [], timeline: CanonicalRow[] = []): CanonicalProfessionalIdentity {
  const createdAt = rowString(row, "created_at") ?? canonicalNow();
  const profile: CanonicalProfessionalIdentity = {
    id: rowString(row, "id") ?? "",
    userId: rowString(row, "user_id") ?? "",
    version: rowNumber(row, "current_version") ?? 1,
    status: (rowString(row, "status") as CanonicalProfessionalIdentity["status"]) ?? "draft",
    identity: (row.identity_json ?? {}) as CanonicalProfessionalIdentity["identity"],
    contact: { ...((row.contact_json ?? {}) as CanonicalProfessionalIdentity["contact"]), otherLinks: ((row.contact_json as { otherLinks?: unknown[] } | undefined)?.otherLinks ?? []) as CanonicalProfessionalIdentity["contact"]["otherLinks"] },
    professionalProfile: {
      ...((row.professional_profile_json ?? {}) as CanonicalProfessionalIdentity["professionalProfile"]),
      targetRoles: ((row.professional_profile_json as { targetRoles?: unknown[] } | undefined)?.targetRoles ?? []) as CanonicalProfessionalIdentity["professionalProfile"]["targetRoles"],
      industries: ((row.professional_profile_json as { industries?: unknown[] } | undefined)?.industries ?? []) as CanonicalProfessionalIdentity["professionalProfile"]["industries"],
      workPreferences: ((row.professional_profile_json as { workPreferences?: unknown[] } | undefined)?.workPreferences ?? []) as CanonicalProfessionalIdentity["professionalProfile"]["workPreferences"]
    },
    employment: employments.map((item) => (item.entity_json ?? {}) as CanonicalProfessionalIdentity["employment"][number]),
    education: education.map((item) => (item.entity_json ?? {}) as CanonicalProfessionalIdentity["education"][number]),
    certifications: [],
    licences: [],
    skills: skills.map((item) => (item.entity_json ?? {}) as CanonicalProfessionalIdentity["skills"][number]),
    languages: [],
    projects: [],
    achievements: [],
    awards: [],
    memberships: [],
    publications: [],
    volunteering: [],
    references: [],
    careerPreferences: (row.career_preferences_json ?? undefined) as CanonicalProfessionalIdentity["careerPreferences"],
    careerTimeline: timeline.map((item) => (item.event_json ?? {}) as CanonicalTimelineEvent),
    completion: (row.completion_json ?? { percentage: rowNumber(row, "completion_percentage") ?? 0, missingSections: [], reviewNeededCount: 0 }) as CanonicalProfessionalIdentity["completion"],
    confidence: (row.confidence_json ?? { overall: rowNumber(row, "overall_confidence") ?? 0, identity: 0, contact: 0, employment: 0, education: 0, skills: 0, consistency: 1 }) as CanonicalProfessionalIdentity["confidence"],
    unresolvedIssues: (row.unresolved_issues_json ?? []) as CanonicalProfessionalIdentity["unresolvedIssues"],
    createdAt,
    updatedAt: rowString(row, "updated_at") ?? createdAt,
    lastConfirmedAt: rowString(row, "last_confirmed_at")
  };
  return refreshCanonicalProfileQuality(profile);
}

export class CanonicalProfileRepository {
  constructor(private readonly supabase: Supabase) {}

  async loadByUserId(userId: string): Promise<CanonicalProfessionalIdentity | null> {
    const { data: profile, error } = await this.supabase.from("canonical_professional_profiles").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    if (!profile) return null;

    const profileId = rowString(profile, "id") ?? "";
    const [{ data: employments }, { data: education }, { data: skills }, { data: timeline }] = await Promise.all([
      this.supabase.from("canonical_employments").select("*").eq("user_id", userId).eq("profile_id", profileId).is("archived_at", null).order("created_at", { ascending: true }),
      this.supabase.from("canonical_education").select("*").eq("user_id", userId).eq("profile_id", profileId).is("archived_at", null).order("created_at", { ascending: true }),
      this.supabase.from("canonical_skills").select("*").eq("user_id", userId).eq("profile_id", profileId).is("archived_at", null).order("canonical_name", { ascending: true }),
      this.supabase.from("canonical_timeline_events").select("*").eq("user_id", userId).eq("profile_id", profileId).order("sort_date", { ascending: true })
    ]);

    return normalizeProfileRow(profile, employments ?? [], education ?? [], skills ?? [], timeline ?? []);
  }

  async loadLegacyCompatibilityRows(userId: string): Promise<{ legacyProfile: CanonicalRow | null; professionalIdentity: CanonicalRow | null }> {
    const [{ data: legacyProfile, error: legacyError }, { data: professionalIdentity, error: identityError }] = await Promise.all([
      this.supabase.from("user_profiles").select("*").or(`user_id.eq.${userId},id.eq.${userId}`).maybeSingle(),
      this.supabase.from("professional_identity").select("*").eq("user_id", userId).maybeSingle()
    ]);
    if (legacyError) throw legacyError;
    if (identityError) throw identityError;
    return { legacyProfile: legacyProfile ?? null, professionalIdentity: professionalIdentity ?? null };
  }

  async upsertRootSnapshot(profile: CanonicalProfessionalIdentity): Promise<void> {
    const snapshot = canonicalRootSnapshot(profile);
    const { error } = await this.supabase.from("canonical_professional_profiles").upsert(
      {
        id: snapshot.id,
        user_id: snapshot.userId,
        status: snapshot.status,
        current_version: snapshot.currentVersion,
        primary_language: "en",
        overall_confidence: snapshot.confidence.overall,
        completion_percentage: snapshot.completion.percentage,
        identity_json: snapshot.identity,
        contact_json: snapshot.contact,
        professional_profile_json: snapshot.professionalProfile,
        career_preferences_json: profile.careerPreferences ?? {},
        completion_json: snapshot.completion,
        confidence_json: snapshot.confidence,
        unresolved_issues_json: snapshot.unresolvedIssues,
        last_confirmed_at: snapshot.lastConfirmedAt ?? null,
        updated_at: canonicalNow()
      },
      { onConflict: "user_id" }
    );
    if (error) throw error;
  }

  async insertVersion(input: Omit<CanonicalProfileVersion, "id" | "createdAt"> & { userId: string; idempotencyKey?: string }): Promise<void> {
    const { error } = await this.supabase.from("canonical_profile_versions").insert({
      user_id: input.userId,
      profile_id: input.profileId,
      version_number: input.versionNumber,
      change_type: input.changeType,
      changed_by: input.changedBy,
      change_summary: input.changeSummary,
      change_set_json: input.changeSetJson,
      snapshot_json: input.snapshotJson ?? null,
      reasoning_case_id: input.reasoningCaseId ?? null,
      user_decision_id: input.userDecisionId ?? null,
      idempotency_key: input.idempotencyKey ?? null
    });
    if (error) throw error;
  }

  async markViewsStale(userId: string, profileId: string, currentVersion: number): Promise<string[]> {
    const { data } = await this.supabase.from("professional_identity_views").select("id,profile_version").eq("user_id", userId).eq("profile_id", profileId).lt("profile_version", currentVersion);
    if (!data?.length) return [];
    await this.supabase.from("professional_identity_views").update({ freshness_status: "stale", updated_at: canonicalNow() }).in("id", data.map((view) => view.id));
    return data.map((view) => String(view.id));
  }
}
