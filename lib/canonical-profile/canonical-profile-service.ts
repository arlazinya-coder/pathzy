import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CanonicalEmployment,
  CanonicalEntityType,
  CanonicalProfessionalIdentity,
  CanonicalProfileSummary,
  CanonicalProfileVersion,
  CanonicalReviewStatus,
  CanonicalSkill,
  CanonicalSkillCategory,
  CanonicalSourceReference,
  CanonicalTimelineEvent,
  ProfessionalIdentityView,
  ViewFieldOverride
} from "./canonical-profile.types";
import { calculateCanonicalCompletion, calculateCanonicalConfidence, calculateCanonicalReadiness } from "./canonical-profile-quality";
import { canonicalNow, cleanText, createCanonicalValue, createSourceReference, uniqueClean, valueText } from "./canonical-profile-utils";

type Supabase = SupabaseClient;
type JsonRecord = Record<string, unknown>;

export type AddManualEntityCommand =
  | { userId: string; entityType: "employment"; employment: { title: string; employer: string; location?: string; isCurrent?: boolean; responsibilities?: string[]; achievements?: string[] } }
  | { userId: string; entityType: "education"; education: { qualification: string; institution: string; fieldOfStudy?: string; status?: "completed" | "in_progress" | "incomplete" | "unknown" } }
  | { userId: string; entityType: "skill"; skill: { name: string; category?: CanonicalSkillCategory; explicitness?: CanonicalSkill["explicitness"] } };

export type ApplyReasoningDecisionCommand = {
  userId: string;
  reasoningCaseId: string;
  decision: "merge" | "keep_separate" | "promotion" | "title_change" | "dismiss";
  selectedCanonicalValues?: Record<string, unknown>;
};

export type UpdateCanonicalEntityCommand = {
  userId: string;
  profileId: string;
  entityType: CanonicalEntityType;
  entityId: string;
  patch: Record<string, unknown>;
  summary: string;
};

export type ArchiveCanonicalEntityCommand = {
  userId: string;
  profileId: string;
  entityType: CanonicalEntityType;
  entityId: string;
  reason: string;
};

export type ReverseProfileChangeCommand = {
  userId: string;
  profileId: string;
  versionNumber: number;
  reason: string;
};

export type CanonicalProfileChangeResult = {
  profileId: string;
  versionNumber: number;
  changedEntityIds: string[];
  staleViewIds: string[];
  summary: string;
};

function emptyIdentity(userId: string, profileId: string, createdAt = canonicalNow()): CanonicalProfessionalIdentity {
  const base = {
    id: profileId,
    userId,
    version: 1,
    status: "draft" as const,
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
  return { ...base, completion: calculateCanonicalCompletion(base), confidence: calculateCanonicalConfidence(base) };
}

function legacySource(value: unknown): CanonicalSourceReference[] {
  return [createSourceReference({ sourceType: "existing_profile", originalValue: cleanText(value), sourceConfidence: 0.82 })];
}

function profileFromLegacyRow(row: any, userId: string, profileId: string, createdAt: string): CanonicalProfessionalIdentity {
  const profile = emptyIdentity(userId, profileId, createdAt);
  const fullName = cleanText(row?.full_name);
  const email = cleanText(row?.email);
  const phone = cleanText(row?.phone);
  const city = cleanText(row?.city);
  const country = cleanText(row?.country);
  const careerGoal = cleanText(row?.career_goal);
  const education = cleanText(row?.education ?? row?.highest_qualification);
  const fieldOfStudy = cleanText(row?.field_of_study);
  const status = cleanText(row?.current_status ?? row?.employment_status);

  if (fullName) profile.identity.fullName = createCanonicalValue(fullName, { status: "provisionally_accepted", confidence: 0.82, sourceReferences: legacySource(fullName), createdAt, updatedAt: createdAt });
  if (email) profile.contact.primaryEmail = createCanonicalValue(email, { status: "provisionally_accepted", confidence: 0.82, sourceReferences: legacySource(email), createdAt, updatedAt: createdAt, displayValue: email });
  if (phone) profile.contact.primaryPhone = createCanonicalValue(phone, { status: "provisionally_accepted", confidence: 0.78, sourceReferences: legacySource(phone), createdAt, updatedAt: createdAt });
  if (city) profile.contact.city = createCanonicalValue(city, { status: "provisionally_accepted", confidence: 0.8, sourceReferences: legacySource(city), createdAt, updatedAt: createdAt });
  if (country) profile.contact.country = createCanonicalValue(country, { status: "provisionally_accepted", confidence: 0.8, sourceReferences: legacySource(country), createdAt, updatedAt: createdAt });
  if (careerGoal) {
    profile.professionalProfile.headline = createCanonicalValue(careerGoal, { status: "provisionally_accepted", confidence: 0.74, sourceReferences: legacySource(careerGoal), createdAt, updatedAt: createdAt });
    profile.professionalProfile.targetRoles = [createCanonicalValue(careerGoal, { status: "provisionally_accepted", confidence: 0.74, sourceReferences: legacySource(careerGoal), createdAt, updatedAt: createdAt })];
  }
  if (status) profile.identity.professionalStatus = createCanonicalValue(status, { status: "provisionally_accepted", confidence: 0.72, sourceReferences: legacySource(status), createdAt, updatedAt: createdAt });
  if (education) {
    profile.education.push({
      id: `legacy-education-${profileId}`,
      qualification: createCanonicalValue(education, { status: "provisionally_accepted", confidence: 0.74, sourceReferences: legacySource(education), createdAt, updatedAt: createdAt }),
      fieldOfStudy: fieldOfStudy ? createCanonicalValue(fieldOfStudy, { status: "provisionally_accepted", confidence: 0.72, sourceReferences: legacySource(fieldOfStudy), createdAt, updatedAt: createdAt }) : undefined,
      institution: createCanonicalValue("", { status: "needs_review", confidence: 0, sourceReferences: legacySource(education), createdAt, updatedAt: createdAt }),
      institutionAliases: [],
      status: createCanonicalValue("unknown" as const, { status: "needs_review", confidence: 0.4, sourceReferences: legacySource(education), createdAt, updatedAt: createdAt }),
      supportingDocumentIds: [],
      sourceReferences: legacySource(education),
      confidence: 0.68,
      reviewStatus: "needs_review",
      createdAt,
      updatedAt: createdAt
    });
  }
  profile.completion = calculateCanonicalCompletion(profile);
  profile.confidence = calculateCanonicalConfidence(profile);
  return profile;
}

function normalizeProfileRow(row: any, employments: any[] = [], education: any[] = [], skills: any[] = [], timeline: any[] = []): CanonicalProfessionalIdentity {
  const createdAt = row.created_at ?? canonicalNow();
  const profile = emptyIdentity(row.user_id, row.id, createdAt);
  const identity = (row.identity_json ?? {}) as CanonicalProfessionalIdentity["identity"];
  const contact = (row.contact_json ?? {}) as CanonicalProfessionalIdentity["contact"];
  const professionalProfile = (row.professional_profile_json ?? {}) as CanonicalProfessionalIdentity["professionalProfile"];
  const completion = (row.completion_json ?? {}) as Partial<CanonicalProfessionalIdentity["completion"]>;
  const confidence = (row.confidence_json ?? {}) as Partial<CanonicalProfessionalIdentity["confidence"]>;
  profile.version = row.current_version ?? 1;
  profile.status = row.status ?? "draft";
  profile.identity = identity;
  profile.contact = { ...contact, otherLinks: contact.otherLinks ?? [] };
  profile.professionalProfile = {
    ...professionalProfile,
    targetRoles: professionalProfile.targetRoles ?? [],
    industries: professionalProfile.industries ?? [],
    workPreferences: professionalProfile.workPreferences ?? []
  };
  profile.employment = employments.map((item) => (item.entity_json ?? item.metadata_json ?? {}) as CanonicalProfessionalIdentity["employment"][number]);
  profile.education = education.map((item) => (item.entity_json ?? item.metadata_json ?? {}) as CanonicalProfessionalIdentity["education"][number]);
  profile.skills = skills.map((item) => (item.entity_json ?? item.metadata_json ?? {}) as CanonicalProfessionalIdentity["skills"][number]);
  profile.careerTimeline = timeline.map((item) => (item.event_json ?? item.metadata_json ?? {}) as CanonicalTimelineEvent);
  profile.completion = { percentage: row.completion_percentage ?? completion.percentage ?? 0, missingSections: completion.missingSections ?? [], reviewNeededCount: completion.reviewNeededCount ?? 0 };
  profile.confidence = { overall: row.overall_confidence ?? confidence.overall ?? 0, identity: confidence.identity ?? 0, contact: confidence.contact ?? 0, employment: confidence.employment ?? 0, education: confidence.education ?? 0, skills: confidence.skills ?? 0, consistency: confidence.consistency ?? 1 };
  profile.unresolvedIssues = (row.unresolved_issues_json ?? []) as CanonicalProfessionalIdentity["unresolvedIssues"];
  profile.updatedAt = row.updated_at ?? createdAt;
  profile.lastConfirmedAt = row.last_confirmed_at ?? undefined;
  return profile;
}

async function persistProfileSnapshot(supabase: Supabase, profile: CanonicalProfessionalIdentity) {
  const quality = {
    completion: calculateCanonicalCompletion(profile),
    confidence: calculateCanonicalConfidence(profile)
  };
  const { data, error } = await supabase
    .from("canonical_professional_profiles")
    .upsert(
      {
        id: profile.id,
        user_id: profile.userId,
        status: profile.status,
        current_version: profile.version,
        primary_language: "en",
        overall_confidence: quality.confidence.overall,
        completion_percentage: quality.completion.percentage,
        identity_json: profile.identity,
        contact_json: profile.contact,
        professional_profile_json: profile.professionalProfile,
        career_preferences_json: profile.careerPreferences ?? {},
        completion_json: quality.completion,
        confidence_json: quality.confidence,
        unresolved_issues_json: profile.unresolvedIssues,
        updated_at: canonicalNow()
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .maybeSingle();
  if (error) throw error;
  console.info("[canonical-profile] profile initialized", { userId: profile.userId, profileId: data?.id, version: profile.version, status: profile.status });
  return data;
}

export async function getOrCreateCanonicalProfile(supabase: Supabase, userId: string): Promise<CanonicalProfessionalIdentity> {
  const { data: existing } = await supabase.from("canonical_professional_profiles").select("*").eq("user_id", userId).maybeSingle();
  if (existing) {
    const [{ data: employments }, { data: education }, { data: skills }, { data: timeline }] = await Promise.all([
      supabase.from("canonical_employments").select("*").eq("user_id", userId).eq("profile_id", existing.id).is("archived_at", null).order("created_at", { ascending: true }),
      supabase.from("canonical_education").select("*").eq("user_id", userId).eq("profile_id", existing.id).is("archived_at", null).order("created_at", { ascending: true }),
      supabase.from("canonical_skills").select("*").eq("user_id", userId).eq("profile_id", existing.id).is("archived_at", null).order("canonical_name", { ascending: true }),
      supabase.from("canonical_timeline_events").select("*").eq("user_id", userId).eq("profile_id", existing.id).order("sort_date", { ascending: true })
    ]);
    return normalizeProfileRow(existing, employments ?? [], education ?? [], skills ?? [], timeline ?? []);
  }

  const { data: legacyProfile } = await supabase
    .from("user_profiles")
    .select("full_name,email,phone,city,country,education,highest_qualification,field_of_study,current_status,employment_status,career_goal,language")
    .or(`user_id.eq.${userId},id.eq.${userId}`)
    .maybeSingle();
  const createdAt = canonicalNow();
  const draft = profileFromLegacyRow(legacyProfile, userId, crypto.randomUUID(), createdAt);
  const row = await persistProfileSnapshot(supabase, draft);
  const profile = normalizeProfileRow(row ?? { ...draft, user_id: userId, current_version: 1, created_at: createdAt, updated_at: createdAt });
  await createProfileVersion(supabase, {
    userId,
    profileId: profile.id,
    versionNumber: 1,
    changeType: "field_added",
    changedBy: "migration",
    changeSummary: "Created canonical professional identity from existing profile fields.",
    changeSetJson: { source: "user_profiles", migratedFields: Object.keys(legacyProfile ?? {}) },
    snapshotJson: profile
  });
  return profile;
}

export async function createProfileVersion(
  supabase: Supabase,
  input: Omit<CanonicalProfileVersion, "id" | "createdAt"> & { userId: string }
) {
  const { data, error } = await supabase
    .from("canonical_profile_versions")
    .insert({
      user_id: input.userId,
      profile_id: input.profileId,
      version_number: input.versionNumber,
      change_type: input.changeType,
      changed_by: input.changedBy,
      change_summary: input.changeSummary,
      change_set_json: input.changeSetJson,
      snapshot_json: input.snapshotJson ?? null,
      reasoning_case_id: input.reasoningCaseId ?? null,
      user_decision_id: input.userDecisionId ?? null
    })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  console.info("[canonical-profile] profile version created", { userId: input.userId, profileId: input.profileId, version: input.versionNumber, changeType: input.changeType });
  return data;
}

async function bumpProfileVersion(supabase: Supabase, userId: string, profileId: string, summary: string, changeSetJson: JsonRecord, reasoningCaseId?: string, userDecisionId?: string): Promise<number> {
  const { data: profile, error } = await supabase.from("canonical_professional_profiles").select("current_version").eq("user_id", userId).eq("id", profileId).maybeSingle();
  if (error) throw error;
  const nextVersion = Number(profile?.current_version ?? 1) + 1;
  await supabase.from("canonical_professional_profiles").update({ current_version: nextVersion, updated_at: canonicalNow() }).eq("user_id", userId).eq("id", profileId);
  await createProfileVersion(supabase, { userId, profileId, versionNumber: nextVersion, changeType: reasoningCaseId ? "reasoning_applied" : "field_added", changedBy: reasoningCaseId ? "reasoning_confirmation" : "user", changeSummary: summary, changeSetJson, reasoningCaseId, userDecisionId });
  await markDependentViewsStale(supabase, userId, profileId, nextVersion);
  return nextVersion;
}

export async function addManualProfileEntity(supabase: Supabase, command: AddManualEntityCommand): Promise<CanonicalProfileChangeResult> {
  const profile = await getOrCreateCanonicalProfile(supabase, command.userId);
  const now = canonicalNow();
  const sourceReferences = [createSourceReference({ sourceType: "user_entry", originalValue: JSON.stringify(command) })];
  let changedEntityId = "";
  if (command.entityType === "employment") {
    const title = cleanText(command.employment.title);
    const employer = cleanText(command.employment.employer);
    if (!title || !employer) throw new Error("Employment title and employer are required.");
    changedEntityId = crypto.randomUUID();
    const entity: CanonicalEmployment = {
      id: changedEntityId,
      canonicalTitle: createCanonicalValue(title, { status: "user_entered", confidence: 0.94, sourceReferences, createdAt: now, updatedAt: now }),
      titleVariants: [],
      employer: createCanonicalValue(employer, { status: "user_entered", confidence: 0.94, sourceReferences, createdAt: now, updatedAt: now }),
      employerAliases: [],
      location: command.employment.location ? createCanonicalValue(cleanText(command.employment.location), { status: "user_entered", confidence: 0.9, sourceReferences, createdAt: now, updatedAt: now }) : undefined,
      isCurrent: createCanonicalValue(Boolean(command.employment.isCurrent), { status: "user_entered", confidence: 0.9, sourceReferences, createdAt: now, updatedAt: now }),
      responsibilities: uniqueClean(command.employment.responsibilities ?? []).map((statement) => ({ id: crypto.randomUUID(), statement: createCanonicalValue(statement, { status: "user_entered", confidence: 0.9, sourceReferences, createdAt: now, updatedAt: now }), sourceReferences })),
      achievements: uniqueClean(command.employment.achievements ?? []).map((statement) => ({ id: crypto.randomUUID(), statement: createCanonicalValue(statement, { status: "user_entered", confidence: 0.9, sourceReferences, createdAt: now, updatedAt: now }), sourceReferences, confidence: 0.9, status: "user_entered" as CanonicalReviewStatus })),
      skills: [],
      tools: [],
      technologies: [],
      projects: [],
      status: "confirmed",
      sourceReferences,
      confidence: 0.94,
      createdAt: now,
      updatedAt: now
    };
    const { error } = await supabase.from("canonical_employments").insert({ id: changedEntityId, profile_id: profile.id, user_id: command.userId, canonical_title: title, employer_name: employer, location: command.employment.location ?? null, is_current: Boolean(command.employment.isCurrent), status: "confirmed", confidence: 0.94, entity_json: entity, metadata_json: { source: "manual_entry" } });
    if (error) throw error;
  }
  if (command.entityType === "education") {
    changedEntityId = crypto.randomUUID();
    const qualification = cleanText(command.education.qualification);
    const institution = cleanText(command.education.institution);
    const entity = {
      id: changedEntityId,
      qualification: createCanonicalValue(qualification, { sourceReferences, createdAt: now, updatedAt: now }),
      fieldOfStudy: command.education.fieldOfStudy ? createCanonicalValue(cleanText(command.education.fieldOfStudy), { sourceReferences, createdAt: now, updatedAt: now }) : undefined,
      institution: createCanonicalValue(institution, { sourceReferences, createdAt: now, updatedAt: now }),
      institutionAliases: [],
      status: createCanonicalValue(command.education.status ?? "unknown", { sourceReferences, createdAt: now, updatedAt: now }),
      supportingDocumentIds: [],
      sourceReferences,
      confidence: 0.9,
      reviewStatus: "confirmed",
      createdAt: now,
      updatedAt: now
    };
    const { error } = await supabase.from("canonical_education").insert({ id: changedEntityId, profile_id: profile.id, user_id: command.userId, qualification, institution, field_of_study: command.education.fieldOfStudy ?? null, education_status: command.education.status ?? "unknown", confidence: 0.9, entity_json: entity, metadata_json: { source: "manual_entry" } });
    if (error) throw error;
  }
  if (command.entityType === "skill") {
    changedEntityId = crypto.randomUUID();
    const name = cleanText(command.skill.name);
    const entity: CanonicalSkill = {
      id: changedEntityId,
      canonicalName: createCanonicalValue(name, { sourceReferences, createdAt: now, updatedAt: now }),
      aliases: [],
      category: command.skill.category ?? "unknown",
      explicitness: command.skill.explicitness ?? "explicit",
      relatedEmploymentIds: [],
      relatedEducationIds: [],
      relatedCertificationIds: [],
      relatedProjectIds: [],
      sourceReferences,
      confidence: 0.9,
      status: "confirmed"
    };
    const { error } = await supabase.from("canonical_skills").insert({ id: changedEntityId, profile_id: profile.id, user_id: command.userId, canonical_name: name, category: entity.category, explicitness: entity.explicitness, status: "confirmed", confidence: 0.9, entity_json: entity, metadata_json: { source: "manual_entry" } });
    if (error) throw error;
  }
  const versionNumber = await bumpProfileVersion(supabase, command.userId, profile.id, `Added ${command.entityType} to professional identity.`, { command });
  console.info("[canonical-profile] canonical entity created", { userId: command.userId, profileId: profile.id, entityType: command.entityType, entityId: changedEntityId, version: versionNumber });
  return { profileId: profile.id, versionNumber, changedEntityIds: [changedEntityId], staleViewIds: [], summary: `Added ${command.entityType}.` };
}

export async function applyConfirmedReasoningDecision(supabase: Supabase, command: ApplyReasoningDecisionCommand): Promise<CanonicalProfileChangeResult> {
  const profile = await getOrCreateCanonicalProfile(supabase, command.userId);
  const { data: reasoningCase, error } = await supabase.from("career_reasoning_cases").select("*").eq("id", command.reasoningCaseId).eq("user_id", command.userId).maybeSingle();
  if (error) throw error;
  if (!reasoningCase) throw new Error("Reasoning case was not found for this user.");
  const { data: decision, error: decisionError } = await supabase
    .from("career_reasoning_user_decisions")
    .insert({ user_id: command.userId, case_id: command.reasoningCaseId, decision: command.decision, selected_option: cleanText(command.selectedCanonicalValues?.selectedOption), resulting_action: "canonical_profile_update" })
    .select("id")
    .maybeSingle();
  if (decisionError) throw decisionError;
  const sourceReferences = [createSourceReference({ sourceType: "reasoning_case", reasoningCaseId: command.reasoningCaseId, sourceConfidence: reasoningCase.confidence, originalValue: reasoningCase.recommendation })];
  let changedEntityIds: string[] = [];

  if (command.decision === "merge" || command.decision === "promotion" || command.decision === "title_change") {
    const canonicalTitle = cleanText(command.selectedCanonicalValues?.title ?? command.selectedCanonicalValues?.canonicalTitle ?? reasoningCase.result_json?.decision?.explanation);
    const employer = cleanText(command.selectedCanonicalValues?.employer ?? command.selectedCanonicalValues?.organisation ?? "Review employer");
    if (reasoningCase.subject_type === "employment" || reasoningCase.case_type?.includes("employment") || command.decision === "promotion" || command.decision === "title_change") {
      const entityId = crypto.randomUUID();
      const now = canonicalNow();
      const entity: CanonicalEmployment = {
        id: entityId,
        canonicalTitle: createCanonicalValue(canonicalTitle || "Review title", { status: "confirmed", confidence: 0.93, sourceReferences, reasoningCaseId: command.reasoningCaseId, userDecisionId: decision?.id, createdAt: now, updatedAt: now, confirmedAt: now }),
        titleVariants: [],
        employer: createCanonicalValue(employer, { status: "confirmed", confidence: 0.9, sourceReferences, reasoningCaseId: command.reasoningCaseId, userDecisionId: decision?.id, createdAt: now, updatedAt: now, confirmedAt: now }),
        employerAliases: [],
        isCurrent: createCanonicalValue(false, { status: "needs_review", confidence: 0.45, sourceReferences, reasoningCaseId: command.reasoningCaseId, userDecisionId: decision?.id, createdAt: now, updatedAt: now }),
        responsibilities: [],
        achievements: [],
        skills: [],
        tools: [],
        technologies: [],
        projects: [],
        progression: command.decision === "promotion" || command.decision === "title_change" ? { relationship: command.decision } : undefined,
        status: "needs_review",
        sourceReferences,
        confidence: 0.86,
        createdAt: now,
        updatedAt: now
      };
      const { error: insertError } = await supabase.from("canonical_employments").insert({ id: entityId, profile_id: profile.id, user_id: command.userId, canonical_title: valueText(entity.canonicalTitle), employer_name: valueText(entity.employer), status: "needs_review", confidence: entity.confidence, reasoning_case_id: command.reasoningCaseId, user_decision_id: decision?.id, entity_json: entity, metadata_json: { decision: command.decision } });
      if (insertError) throw insertError;
      changedEntityIds = [entityId];
    }
  }

  await supabase.from("career_reasoning_cases").update({ status: "resolved", resolved_at: canonicalNow(), updated_at: canonicalNow() }).eq("id", command.reasoningCaseId).eq("user_id", command.userId);
  const versionNumber = await bumpProfileVersion(supabase, command.userId, profile.id, `Applied confirmed reasoning decision: ${command.decision}.`, { command, reasoningCaseId: command.reasoningCaseId }, command.reasoningCaseId, decision?.id);
  console.info("[canonical-profile] reasoning decision applied", { userId: command.userId, profileId: profile.id, reasoningCaseId: command.reasoningCaseId, changedEntityCount: changedEntityIds.length, version: versionNumber });
  return { profileId: profile.id, versionNumber, changedEntityIds, staleViewIds: [], summary: `Applied ${command.decision} decision.` };
}

export async function updateCanonicalEntity(supabase: Supabase, command: UpdateCanonicalEntityCommand): Promise<CanonicalProfileChangeResult> {
  const table = tableForEntity(command.entityType);
  const { error } = await supabase.from(table).update({ metadata_json: command.patch, updated_at: canonicalNow() }).eq("user_id", command.userId).eq("profile_id", command.profileId).eq("id", command.entityId);
  if (error) throw error;
  const versionNumber = await bumpProfileVersion(supabase, command.userId, command.profileId, command.summary, { entityType: command.entityType, entityId: command.entityId, patch: command.patch });
  console.info("[canonical-profile] canonical entity updated", { userId: command.userId, profileId: command.profileId, entityType: command.entityType, entityId: command.entityId, version: versionNumber });
  return { profileId: command.profileId, versionNumber, changedEntityIds: [command.entityId], staleViewIds: [], summary: command.summary };
}

export async function archiveCanonicalEntity(supabase: Supabase, command: ArchiveCanonicalEntityCommand): Promise<CanonicalProfileChangeResult> {
  const table = tableForEntity(command.entityType);
  const { error } = await supabase.from(table).update({ archived_at: canonicalNow(), status: "archived", updated_at: canonicalNow() }).eq("user_id", command.userId).eq("profile_id", command.profileId).eq("id", command.entityId);
  if (error) throw error;
  const versionNumber = await bumpProfileVersion(supabase, command.userId, command.profileId, command.reason, { entityType: command.entityType, entityId: command.entityId, archived: true });
  return { profileId: command.profileId, versionNumber, changedEntityIds: [command.entityId], staleViewIds: [], summary: command.reason };
}

export async function reverseProfileChange(supabase: Supabase, command: ReverseProfileChangeCommand): Promise<CanonicalProfileChangeResult> {
  const { data: version, error } = await supabase.from("canonical_profile_versions").select("*").eq("user_id", command.userId).eq("profile_id", command.profileId).eq("version_number", command.versionNumber).maybeSingle();
  if (error) throw error;
  if (!version) throw new Error("Profile version was not found for rollback.");
  const nextVersion = await bumpProfileVersion(supabase, command.userId, command.profileId, `Rollback requested: ${command.reason}`, { rollbackFrom: command.versionNumber, previousChange: version.change_summary });
  console.info("[canonical-profile] profile rollback performed", { userId: command.userId, profileId: command.profileId, rollbackFrom: command.versionNumber, version: nextVersion });
  return { profileId: command.profileId, versionNumber: nextVersion, changedEntityIds: [], staleViewIds: [], summary: "Rollback recorded. Entity restoration is handled by reviewing the saved snapshot." };
}

function tableForEntity(entityType: CanonicalEntityType) {
  if (entityType === "employment") return "canonical_employments";
  if (entityType === "education") return "canonical_education";
  if (entityType === "skill") return "canonical_skills";
  if (entityType === "timeline_event") return "canonical_timeline_events";
  return "canonical_profile_versions";
}

export async function markDependentViewsStale(supabase: Supabase, userId: string, profileId: string, currentVersion: number) {
  const { data: staleViews } = await supabase
    .from("professional_identity_views")
    .select("id,profile_version")
    .eq("user_id", userId)
    .eq("profile_id", profileId)
    .lt("profile_version", currentVersion);
  if (staleViews?.length) {
    await supabase.from("professional_identity_views").update({ freshness_status: "stale", updated_at: canonicalNow() }).in("id", staleViews.map((view) => view.id));
    console.info("[canonical-profile] view marked stale", { userId, profileId, count: staleViews.length, currentVersion });
  }
  return staleViews?.map((view) => view.id) ?? [];
}

export async function saveProfessionalIdentityView(supabase: Supabase, view: ProfessionalIdentityView) {
  const { data, error } = await supabase
    .from("professional_identity_views")
    .upsert(
      {
        id: view.id,
        user_id: view.userId,
        profile_id: view.canonicalProfileId,
        view_type: view.type,
        name: view.name ?? null,
        language: view.configuration.language ?? null,
        target_role: view.configuration.targetRole ?? null,
        target_job_id: view.configuration.targetJobId ?? null,
        profile_version: view.profileVersion,
        configuration_json: view.configuration,
        generated_content_json: view.generatedContent ?? {},
        freshness_status: "current",
        updated_at: canonicalNow()
      },
      { onConflict: "id" }
    )
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCanonicalProfileSummary(supabase: Supabase, userId: string): Promise<CanonicalProfileSummary> {
  const profile = await getOrCreateCanonicalProfile(supabase, userId);
  const quality = {
    completion: calculateCanonicalCompletion(profile),
    confidence: calculateCanonicalConfidence(profile)
  };
  const readiness = calculateCanonicalReadiness(quality.completion.percentage, quality.confidence.overall, quality.confidence.consistency, quality.completion.reviewNeededCount);
  return {
    profileId: profile.id,
    userId,
    version: profile.version,
    status: profile.status,
    completion: quality.completion.percentage,
    confidence: Math.round(quality.confidence.overall * 100),
    consistency: Math.round(quality.confidence.consistency * 100),
    readiness,
    reviewNeededCount: quality.completion.reviewNeededCount,
    currentProfession: valueText(profile.professionalProfile.profession) || valueText(profile.professionalProfile.headline),
    currentEmployment: profile.employment[0] ? [valueText(profile.employment[0].canonicalTitle), valueText(profile.employment[0].employer)].filter(Boolean).join(" at ") : undefined,
    topSkills: profile.skills.slice(0, 6).map((skill) => valueText(skill.canonicalName)).filter(Boolean),
    latestTimelineItems: profile.careerTimeline.slice(-3),
    updatedAt: profile.updatedAt
  };
}

export const canonicalProfileCommandService = {
  applyConfirmedReasoningDecision,
  addManualProfileEntity,
  updateCanonicalEntity,
  archiveCanonicalEntity,
  reverseProfileChange
};
