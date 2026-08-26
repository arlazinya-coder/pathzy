import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  employmentReadinessAnswerKeys,
  isEmploymentReadinessComplete,
  normalizeEmploymentReadinessAnswers
} from "@/lib/readiness/employment-readiness-check";
import { legacyLanguageValue, normalizeLanguageCode, normalizeProfessionalDocumentLanguageChoice } from "@/lib/language/language-preferences";
import { normalizeCurrentSituation } from "@/lib/professional-identity/current-situation";
import { experienceEntryToText, selectCanonicalProfessionalIdentityExperiences } from "@/lib/professional-identity/professional-identity-experience";
import {
  professionalIdentityRequiredChecksFromValues,
  professionalIdentityValuesFromSources,
  type ProfessionalIdentityRequiredCheck
} from "@/lib/professional-identity/professional-identity-completion";
import {
  selectProfessionalIdentityDiscoveryRow,
  withEmploymentDiagnosisRecordType,
  withProfessionalIdentityRecordType,
  type DiscoveryCompatibilityRow
} from "@/lib/professional-identity/professional-identity-discovery-compatibility";

export const professionalIdentityWriteSections = new Set([
  "profile",
  "photo",
  "profilePhoto",
  "name",
  "email",
  "phone",
  "personalInfo",
  "personal_information",
  "location",
  "nationality",
  "work_authorization",
  "currentStatus",
  "education",
  "fieldOfStudy",
  "careerDirection",
  "careerGoal",
  "career_goal",
  "professionalSummary",
  "professional_summary",
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
  "onboarding_progress",
  "employmentPreferences",
  "employment_preferences",
  "readiness_check",
  "salary_expectations",
  "availability"
]);

export type CleanProfessionalIdentityValue = string | unknown[];
export type CleanProfessionalIdentityValues = Record<string, CleanProfessionalIdentityValue>;

export type ProfessionalIdentityWriteResult = {
  ok: boolean;
  section?: string;
  state?: string;
  completed?: boolean;
  missing?: ProfessionalIdentityRequiredCheck[];
  redirectTo?: string;
  error?: string;
};

const onboardingStateOrder = [
  "account_created",
  "welcome_completed",
  "interface_language_completed",
  "document_language_completed",
  "coach_intro_completed",
  "professional_identity_intro_completed",
  "identity_started",
  "identity_reviewed",
  "setup_completed",
  "diagnosis_completed"
] as const;

type StoredOnboardingState = (typeof onboardingStateOrder)[number];

export function cleanProfessionalIdentityValues(values: unknown): CleanProfessionalIdentityValues {
  if (!values || typeof values !== "object") return {};
  return Object.fromEntries(
    Object.entries(values as Record<string, unknown>).map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value.map((item) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item === "object") return item;
          return String(item ?? "").trim();
        }).filter((item) => typeof item === "string" ? Boolean(item) : Boolean(item))];
      }
      return [key, typeof value === "string" ? value.trim() : String(value ?? "").trim()];
    })
  );
}

function textValue(values: CleanProfessionalIdentityValues, key: string) {
  const value = values[key];
  if (Array.isArray(value)) return value.join(", ");
  return value ?? "";
}

function listValue(values: CleanProfessionalIdentityValues, key: string) {
  const value = values[key];
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? item.trim() : experienceEntryToText(item as never)).filter(Boolean);
  return value ? value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean) : [];
}

function experienceListValue(values: CleanProfessionalIdentityValues, key: string) {
  return selectCanonicalProfessionalIdentityExperiences(values[key]);
}

function firstListItem(values: CleanProfessionalIdentityValues, key: string) {
  return listValue(values, key)[0] ?? "";
}

function currentSituationValue(values: CleanProfessionalIdentityValues) {
  return normalizeCurrentSituation(textValue(values, "current_status"));
}

function currentSituationPatch(values: CleanProfessionalIdentityValues) {
  const currentStatus = currentSituationValue(values);
  return currentStatus ? { current_status: currentStatus, employment_status: currentStatus } : {};
}

function baseProfilePayload(user: { id: string }) {
  return { id: user.id, user_id: user.id, updated_at: new Date().toISOString() };
}

function normalizeOnboardingState(value: unknown): StoredOnboardingState {
  return typeof value === "string" && (onboardingStateOrder as readonly string[]).includes(value) ? value as StoredOnboardingState : "account_created";
}

export function profilePatchForProfessionalIdentitySection(user: { id: string; email?: string | null }, section: string, values: CleanProfessionalIdentityValues): Record<string, unknown> | null {
  const base = baseProfilePayload(user);

  if (section === "profile") {
    return { ...base, ...currentSituationPatch(values) };
  }
  if (section === "name") return { ...base, full_name: textValue(values, "full_name") || null };
  if (section === "email") return { ...base, email: textValue(values, "email") || user.email || null };
  if (section === "phone") return { ...base, phone: textValue(values, "phone") || null };
  if (section === "personalInfo" || section === "personal_information") {
    return {
      ...base,
      full_name: textValue(values, "full_name") || null,
      email: textValue(values, "email") || user.email || null,
      phone: textValue(values, "phone") || null,
      ...currentSituationPatch(values)
    };
  }
  if (section === "location") return { ...base, city: textValue(values, "city") || null, country: textValue(values, "country") || null };
  if (section === "currentStatus") {
    return { ...base, ...currentSituationPatch(values) };
  }
  if (section === "education") {
    const education = firstListItem(values, "education") || textValue(values, "education");
    return {
      ...base,
      education: education || null,
      highest_qualification: education || null,
      field_of_study: textValue(values, "field_of_study") || null
    };
  }
  if (section === "fieldOfStudy") return { ...base, field_of_study: textValue(values, "field_of_study") || null };
  if (section === "careerDirection" || section === "careerGoal" || section === "career_goal") {
    const careerGoal = textValue(values, "career_goal");
    return { ...base, career_goal: careerGoal || null, preferred_path: careerGoal || null };
  }
  if (section === "preferences") return { ...base, language: legacyLanguageValue(normalizeLanguageCode(textValue(values, "interface_language"))) };
  if (section === "languages") return { ...base, language: listValue(values, "languages").join(", ") || textValue(values, "language") || null };
  if (section === "certificates") return { ...base, has_certificates: listValue(values, "certificates").length > 0 };
  if (section === "portfolio" || section === "social_profiles") {
    return {
      ...base,
      linkedin_url: textValue(values, "linkedin_url") || null,
      portfolio_url: textValue(values, "portfolio_url") || textValue(values, "website_url") || null
    };
  }
  return null;
}

export function discoveryPatchForProfessionalIdentitySection(section: string, values: CleanProfessionalIdentityValues) {
  if (section === "profile" || section === "currentStatus") {
    return currentSituationPatch(values);
  }
  if (section === "personalInfo" || section === "personal_information") {
    return currentSituationPatch(values);
  }
  if (section === "photo" || section === "profilePhoto") return { profile_photo: textValue(values, "profilePhoto") };
  if (section === "location") {
    return {
      nationality: textValue(values, "nationality"),
      work_authorization: textValue(values, "work_authorization")
    };
  }
  if (section === "nationality") return { nationality: textValue(values, "nationality") };
  if (section === "work_authorization") return { work_authorization: textValue(values, "work_authorization") };
  if (section === "professionalSummary" || section === "professional_summary") return { professional_summary: textValue(values, "professional_summary") };
  if (section === "education") return { education_history: listValue(values, "education") };
  if (section === "experience") {
    const experienceEntries = experienceListValue(values, "experience");
    return {
      experience: experienceEntries,
      experience_history: experienceEntries,
      experience_entries: experienceEntries,
      personal_background: ""
    };
  }
  if (section === "skills") return { skills: listValue(values, "skills") };
  if (section === "projects") return { projects_history: listValue(values, "projects"), interests: listValue(values, "projects").join("\n") };
  if (section === "achievements") return { achievements_list: listValue(values, "achievements"), achievements: listValue(values, "achievements").join("\n") };
  if (section === "certificates") return { certificates_list: listValue(values, "certificates"), certifications: listValue(values, "certificates").join("\n") };
  if (section === "licences") return { licences: listValue(values, "licences") };
  if (section === "languages") return { languages: listValue(values, "languages") };
  if (section === "references") return { references_list: listValue(values, "references"), references: listValue(values, "references").join("\n") };
  if (section === "portfolio" || section === "social_profiles") {
    return {
      github_url: textValue(values, "github_url"),
      website_url: textValue(values, "website_url"),
      behance_url: textValue(values, "behance_url")
    };
  }
  if (section === "preferences") {
    return {
      interface_language: legacyLanguageValue(normalizeLanguageCode(textValue(values, "interface_language"))),
      professional_document_language: normalizeProfessionalDocumentLanguageChoice(textValue(values, "professional_document_language")),
      career_coach_intro_seen: textValue(values, "career_coach_intro_seen") === "true"
    };
  }
  if (section === "employmentPreferences" || section === "employment_preferences") {
    return {
      preferred_roles: listValue(values, "preferred_roles"),
      industries: listValue(values, "industries"),
      employment_type: textValue(values, "employment_type"),
      salary_expectations: textValue(values, "salary_expectations"),
      availability: textValue(values, "availability"),
      work_type: textValue(values, "work_type"),
      relocation: textValue(values, "relocation")
    };
  }
  if (section === "salary_expectations") return { salary_expectations: textValue(values, "salary_expectations") };
  if (section === "availability") return { availability: textValue(values, "availability") };
  return {};
}

export async function saveMergedDiscoveryAnswers(
  supabase: SupabaseClient,
  userId: string,
  answersPatch: Record<string, unknown>,
  generatedResult?: unknown,
  options: { purpose?: "professional_identity" | "employment_diagnosis" } = {}
) {
  if (options.purpose === "employment_diagnosis") {
    return supabase.from("discovery_responses").insert({
      user_id: userId,
      answers: withEmploymentDiagnosisRecordType(answersPatch),
      generated_result: generatedResult ?? {}
    });
  }

  const { data: rows, error: loadError } = await supabase
    .from("discovery_responses")
    .select("id,answers,generated_result,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (loadError) return { error: loadError };

  const target = selectProfessionalIdentityDiscoveryRow((rows ?? []) as DiscoveryCompatibilityRow[]);
  const answers = withProfessionalIdentityRecordType({ ...((target?.answers as Record<string, unknown> | null) ?? {}), ...answersPatch });
  const refreshedAt = new Date().toISOString();
  const payload = generatedResult === undefined ? { answers, created_at: refreshedAt } : { answers, generated_result: generatedResult, created_at: refreshedAt };

  if (target?.id) {
    return supabase.from("discovery_responses").update(payload).eq("id", target.id).eq("user_id", userId);
  }

  return supabase.from("discovery_responses").insert({
    user_id: userId,
    answers,
    generated_result: generatedResult ?? target?.generated_result ?? {},
    created_at: refreshedAt
  });
}

export async function saveProfessionalIdentitySection(
  supabase: SupabaseClient,
  user: Pick<User, "id" | "email">,
  section: string,
  rawValues: unknown
) {
  const values = cleanProfessionalIdentityValues(rawValues);
  const profile = profilePatchForProfessionalIdentitySection(user, section, values);
  const answers = discoveryPatchForProfessionalIdentitySection(section, values);

  if (profile) {
    const profileResult = await supabase.from("user_profiles").upsert(profile, { onConflict: "user_id" });
    if (profileResult.error) return { error: profileResult.error };
  }

  if (Object.keys(answers).length) {
    const discoveryResult = await saveMergedDiscoveryAnswers(supabase, user.id, answers);
    if (discoveryResult.error) return { error: discoveryResult.error };
  }

  return { error: null };
}

export async function saveEmploymentReadiness(
  supabase: SupabaseClient,
  userId: string,
  values: unknown
): Promise<ProfessionalIdentityWriteResult> {
  const source = values && typeof values === "object" ? (values as Record<string, unknown>) : {};
  const answers = normalizeEmploymentReadinessAnswers(source.answers);
  const currentStep = Number.isFinite(Number(source.currentStep)) ? Math.max(0, Math.min(employmentReadinessAnswerKeys.length - 1, Number(source.currentStep))) : 0;
  const completed = source.completed === true || isEmploymentReadinessComplete(answers);
  const result = await saveMergedDiscoveryAnswers(supabase, userId, {
    employment_readiness_check: answers,
    employment_readiness_check_step: currentStep,
    employment_readiness_check_status: completed ? "complete" : "in_progress",
    employment_readiness_check_completed: completed
  });

  if (result.error) return { ok: false, error: "We could not save this information yet. Please check your connection and try again." };
  return { ok: true, section: "readiness_check", completed, redirectTo: "/professional-identity" };
}

export async function saveProfessionalIdentityOnboardingProgress(
  supabase: SupabaseClient,
  userId: string,
  values: unknown
): Promise<ProfessionalIdentityWriteResult> {
  const source = values && typeof values === "object" ? (values as Record<string, unknown>) : {};
  const requestedState = normalizeOnboardingState(source.state);
  const { data: latest, error: loadError } = await supabase
    .from("discovery_responses")
    .select("answers")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (loadError) return { ok: false, error: "We could not save this setup step yet. Please check your connection and try again." };

  const currentState = normalizeOnboardingState((latest?.answers as Record<string, unknown> | null | undefined)?.pathzy_onboarding_state);
  const state = onboardingStateOrder.indexOf(currentState) > onboardingStateOrder.indexOf(requestedState) ? currentState : requestedState;
  const result = await saveMergedDiscoveryAnswers(supabase, userId, {
    pathzy_onboarding_state: state,
    [`pathzy_onboarding_${state}`]: true,
    ...(state === "welcome_completed" ? { welcome_completed: true } : {}),
    ...(state === "professional_identity_intro_completed" ? { professional_identity_intro_seen: true } : {}),
    ...(state === "identity_started" ? { identity_started: true } : {}),
    pathzy_onboarding_updated_at: new Date().toISOString()
  });

  if (result.error) return { ok: false, error: "We could not save this setup step yet. Please check your connection and try again." };
  return { ok: true, section: "onboarding_progress", state, redirectTo: "/professional-identity" };
}

export async function finishProfessionalIdentitySetupWrite(
  supabase: SupabaseClient,
  user: Pick<User, "id" | "email">
): Promise<ProfessionalIdentityWriteResult> {
  const [{ data: profile, error: profileError }, { data: discovery, error: discoveryError }] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("full_name,email,city,country,education,highest_qualification,field_of_study,current_status,employment_status,career_goal,onboarding_completed")
      .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      .maybeSingle(),
    supabase
      .from("discovery_responses")
      .select("answers")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  if (profileError || discoveryError) return { ok: false, error: "We could not finish setup yet. Your information is still saved, so please try again." };

  const missing = professionalIdentityRequiredChecksFromValues(professionalIdentityValuesFromSources(profile, discovery, user)).filter((item) => !item.complete);
  if (missing.length) {
    return {
      ok: false,
      missing,
      error: "Some required Professional Identity details still need attention before Home."
    };
  }

  const { error } = await supabase.from("user_profiles").upsert(
    {
      ...baseProfilePayload(user),
      email: (profile as { email?: string | null } | null)?.email ?? user.email ?? null,
      onboarding_completed: true,
      onboarding_step: 16
    },
    { onConflict: "user_id" }
  );

  if (error) return { ok: false, error: "We could not finish setup yet. Your information is still saved, so please try again." };

  const stateResult = await saveMergedDiscoveryAnswers(supabase, user.id, {
    identity_review_completed: true,
    identity_reviewed: true,
    setup_finished: true,
    setup_completed: true,
    employment_diagnosis_status: "pending",
    employment_diagnosis_completed: false,
    diagnosis_completed: false,
    pathzy_onboarding_state: "setup_completed",
    pathzy_onboarding_setup_completed: true,
    professional_identity_completed_at: new Date().toISOString()
  });

  if (stateResult.error) return { ok: false, error: "We could not finish setup yet. Your information is still saved, so please try again." };
  return { ok: true, redirectTo: "/discovery?reason=setup-complete" };
}

export async function saveCompletedEmploymentDiagnosis(
  supabase: SupabaseClient,
  userId: string,
  answers: Record<string, unknown>,
  generatedRoadmap: unknown
) {
  const now = new Date().toISOString();
  return saveMergedDiscoveryAnswers(
    supabase,
    userId,
    {
      ...answers,
      identity_review_completed: true,
      identity_reviewed: true,
      setup_finished: true,
      setup_completed: true,
      employment_diagnosis_status: "complete",
      employment_diagnosis_completed: true,
      diagnosis_completed: true,
      pathzy_onboarding_state: "diagnosis_completed",
      pathzy_onboarding_diagnosis_completed: true,
      employment_diagnosis_completed_at: now,
      pathzy_onboarding_updated_at: now
    },
    generatedRoadmap,
    { purpose: "employment_diagnosis" }
  );
}
