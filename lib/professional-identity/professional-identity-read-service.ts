import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  calculateProfessionalIdentityCompletion,
  professionalIdentityRequiredChecksFromValues,
  professionalIdentityValuesFromSources,
  type ProfessionalIdentityCompletionValues
} from "@/lib/professional-identity/professional-identity-completion";
import {
  diagnosisWorkflowFlags,
  selectEmploymentDiagnosisDiscoveryRow,
  selectProfessionalIdentityDiscoveryRow,
  type DiscoveryCompatibilityRow
} from "@/lib/professional-identity/professional-identity-discovery-compatibility";

export type ProfessionalIdentityProfileSnapshot = Record<string, unknown> & {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  education?: string | null;
  highest_qualification?: string | null;
  field_of_study?: string | null;
  current_status?: string | null;
  employment_status?: string | null;
  career_goal?: string | null;
  preferred_path?: string | null;
  language?: string | null;
  has_certificates?: boolean | null;
  onboarding_completed?: boolean | null;
  onboarding_step?: number | null;
  updated_at?: string | null;
};

export type ProfessionalIdentityDiscoverySnapshot = {
  answers?: Record<string, unknown> | null;
  generated_result?: Record<string, unknown> | null;
} | null;

export type ProfessionalIdentityReadModel = {
  profile: ProfessionalIdentityProfileSnapshot | null;
  discovery: ProfessionalIdentityDiscoverySnapshot;
  values: ProfessionalIdentityCompletionValues;
  completion: ReturnType<typeof calculateProfessionalIdentityCompletion>;
  requiredChecks: ReturnType<typeof professionalIdentityRequiredChecksFromValues>;
};

export async function loadProfessionalIdentitySources(
  supabase: SupabaseClient,
  userId: string
): Promise<{ profile: ProfessionalIdentityProfileSnapshot | null; discovery: ProfessionalIdentityDiscoverySnapshot }> {
  const [{ data: profile, error: profileError }, { data: discoveryRows, error: discoveryError }] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("full_name,email,phone,city,country,education,highest_qualification,field_of_study,current_status,employment_status,career_goal,preferred_path,linkedin_url,portfolio_url,language,has_certificates,onboarding_completed,onboarding_step,updated_at")
      .or(`user_id.eq.${userId},id.eq.${userId}`)
      .maybeSingle(),
    supabase
      .from("discovery_responses")
      .select("id,answers,generated_result,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
  ]);

  if (profileError) throw profileError;
  if (discoveryError) throw discoveryError;

  const identityDiscovery = selectProfessionalIdentityDiscoveryRow((discoveryRows ?? []) as DiscoveryCompatibilityRow[]);
  const diagnosisDiscovery = selectEmploymentDiagnosisDiscoveryRow((discoveryRows ?? []) as DiscoveryCompatibilityRow[]);
  const mergedDiscovery = identityDiscovery
    ? {
        ...identityDiscovery,
        answers: {
          ...((identityDiscovery.answers as Record<string, unknown> | null) ?? {}),
          ...diagnosisWorkflowFlags(diagnosisDiscovery)
        }
      }
    : diagnosisDiscovery
      ? { answers: diagnosisWorkflowFlags(diagnosisDiscovery), generated_result: null }
      : null;

  return {
    profile: (profile as ProfessionalIdentityProfileSnapshot | null) ?? null,
    discovery: mergedDiscovery as ProfessionalIdentityDiscoverySnapshot
  };
}

export async function getProfessionalIdentityReadModel(
  supabase: SupabaseClient,
  user: Pick<User, "id" | "email">
): Promise<ProfessionalIdentityReadModel> {
  const { profile, discovery } = await loadProfessionalIdentitySources(supabase, user.id);
  const values = professionalIdentityValuesFromSources(profile, discovery, user);
  return {
    profile,
    discovery,
    values,
    completion: calculateProfessionalIdentityCompletion(values),
    requiredChecks: professionalIdentityRequiredChecksFromValues(values)
  };
}

export async function getProfessionalIdentityReadModelSafe(
  supabase: SupabaseClient,
  user: Pick<User, "id" | "email">,
  label = "professional identity"
): Promise<ProfessionalIdentityReadModel> {
  try {
    return await getProfessionalIdentityReadModel(supabase, user);
  } catch (error) {
    console.warn(`[professional-identity:read] ${label} unavailable`, error instanceof Error ? error.message : "unknown");
    const values = professionalIdentityValuesFromSources(null, null, user);
    return {
      profile: null,
      discovery: null,
      values,
      completion: calculateProfessionalIdentityCompletion(values),
      requiredChecks: professionalIdentityRequiredChecksFromValues(values)
    };
  }
}
