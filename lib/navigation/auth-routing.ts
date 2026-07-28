import type { SupabaseClient, User } from "@supabase/supabase-js";
import { PROFESSIONAL_IDENTITY_SECTION_IDS, type ProfessionalIdentitySectionId } from "@/lib/canonical-profile/canonical-professional-identity.model";
import { appRoutes, isAuthRoute, routeBuilders, routeMatches } from "@/lib/navigation/routes";

export type ProfessionalIdentityResumeSection = ProfessionalIdentitySectionId;
export type PathzyOnboardingState =
  | "unauthenticated"
  | "authenticated_language_pending"
  | "identity_not_started"
  | "identity_in_progress"
  | "identity_review_pending"
  | "identity_finish_pending"
  | "diagnosis_pending"
  | "diagnosis_complete"
  | "home_ready";

export type PathzyNextRouteDecision = {
  destination: string;
  reason: string;
  currentState: PathzyOnboardingState;
  safeFallback: string;
  resumeSection?: ProfessionalIdentityResumeSection;
};

type ProfileSnapshot = {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  education?: string | null;
  highest_qualification?: string | null;
  field_of_study?: string | null;
  current_status?: string | null;
  career_goal?: string | null;
  onboarding_completed?: boolean | null;
  onboarding_step?: number | null;
  language?: string | null;
  interface_language?: string | null;
  language_preference?: string | null;
  preferred_language?: string | null;
  identity_review_completed?: boolean | null;
  setup_finished?: boolean | null;
  employment_diagnosis_completed?: boolean | null;
};

type DiscoverySnapshot = {
  answers?: Record<string, unknown> | null;
};

export type ProfessionalIdentityRequiredCheck = {
  section: ProfessionalIdentityResumeSection;
  label: string;
  status: "required" | "recommended" | "optional";
  complete: boolean;
  guidance: string;
};

const protectedAuthDestinations = new Set<string>([
  appRoutes.login,
  appRoutes.register,
  appRoutes.signup,
  appRoutes.authCallback,
  appRoutes.authResetPassword,
  appRoutes.authUpdatePassword
]);

const legacySectionToCanonical: Record<string, ProfessionalIdentityResumeSection> = {
  profilePhoto: "photo",
  name: "personal_information",
  email: "personal_information",
  phone: "personal_information",
  personalInfo: "personal_information",
  currentStatus: "personal_information",
  location: "location",
  nationality: "nationality",
  workAuthorization: "work_authorization",
  work_authorization: "work_authorization",
  careerGoal: "career_goal",
  careerDirection: "career_goal",
  professionalSummary: "professional_summary",
  fieldOfStudy: "education",
  employmentPreferences: "employment_preferences"
};

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function answerText(discovery: DiscoverySnapshot | null | undefined, key: string) {
  const value = discovery?.answers?.[key];
  return typeof value === "string" ? value : "";
}

function answerListHasText(discovery: DiscoverySnapshot | null | undefined, key: string) {
  const value = discovery?.answers?.[key];
  if (Array.isArray(value)) return value.some((item) => hasText(String(item ?? "")));
  if (typeof value === "string") return value.split(/\r?\n|,/).some((item) => hasText(item));
  return false;
}

function normalizeInternalPath(target?: string | null) {
  if (!target?.startsWith("/")) return "";
  try {
    const url = new URL(target, "https://pathzy.local");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "";
  }
}

function pathnameFor(target: string) {
  try {
    return new URL(target, "https://pathzy.local").pathname;
  } catch {
    return "";
  }
}

export function normalizeProfessionalIdentitySection(section?: string | null): ProfessionalIdentityResumeSection {
  if (section && (PROFESSIONAL_IDENTITY_SECTION_IDS as readonly string[]).includes(section)) return section as ProfessionalIdentityResumeSection;
  if (section && legacySectionToCanonical[section]) return legacySectionToCanonical[section];
  return "profile";
}

export function professionalIdentitySectionHref(section: ProfessionalIdentityResumeSection | string) {
  return routeBuilders.professionalIdentitySection(normalizeProfessionalIdentitySection(section));
}

export function professionalIdentityReviewHref() {
  return routeBuilders.professionalIdentityReview();
}

type UserEmailSnapshot = { email?: string | null };

export function professionalIdentityRequiredChecks(
  profile: ProfileSnapshot | null,
  discovery?: DiscoverySnapshot | null,
  user?: UserEmailSnapshot | null
): ProfessionalIdentityRequiredCheck[] {
  const hasLocation = hasText(profile?.city) && hasText(profile?.country);
  const hasEligibility = hasText(answerText(discovery, "nationality")) && hasText(answerText(discovery, "work_authorization"));
  const hasEducationOrStatus = hasText(profile?.current_status) || hasText(profile?.education) || hasText(profile?.highest_qualification) || hasText(profile?.field_of_study);
  const hasEmploymentPreference =
    hasText(answerText(discovery, "employment_type")) ||
    hasText(answerText(discovery, "work_type")) ||
    answerListHasText(discovery, "preferred_roles") ||
    answerListHasText(discovery, "industries");

  return [
    {
      section: "personal_information",
      label: "Personal Information",
      status: "required",
      complete: hasText(profile?.full_name) && hasText(profile?.email ?? user?.email),
      guidance: "Add the name and email PATHZY can use across your employment journey."
    },
    {
      section: "location",
      label: "Location, Nationality and Work Authorization",
      status: "required",
      complete: hasLocation && hasEligibility,
      guidance: "Add your location, nationality, and truthful work authorization details."
    },
    {
      section: "nationality",
      label: "Nationality",
      status: "required",
      complete: hasText(answerText(discovery, "nationality")),
      guidance: "Add your nationality where it affects work eligibility or employment documents."
    },
    {
      section: "work_authorization",
      label: "Work Authorization",
      status: "required",
      complete: hasText(answerText(discovery, "work_authorization")),
      guidance: "Add truthful work authorization details before PATHZY guides applications."
    },
    {
      section: "career_goal",
      label: "Career Goal",
      status: "required",
      complete: hasText(profile?.career_goal),
      guidance: "Tell PATHZY the professional direction you want support with."
    },
    {
      section: "education",
      label: "Education or Current Status",
      status: "required",
      complete: hasEducationOrStatus,
      guidance: "Add education, training, current work, current study, or your current employment status."
    },
    {
      section: "skills",
      label: "Core Skills",
      status: "required",
      complete: answerListHasText(discovery, "skills"),
      guidance: "Add skills you already use so future documents and job matching stay factual."
    },
    {
      section: "employment_preferences",
      label: "Employment Preferences and Availability",
      status: "required",
      complete: hasEmploymentPreference && hasText(answerText(discovery, "availability")),
      guidance: "Add the work you prefer and when you can realistically start."
    }
  ];
}

function hasAnyIdentityProgress(profile: ProfileSnapshot | null, discovery?: DiscoverySnapshot | null, user?: UserEmailSnapshot | null) {
  return Boolean(
    hasText(profile?.full_name) ||
      hasText(profile?.email ?? user?.email) ||
      hasText(profile?.phone) ||
      hasText(profile?.city) ||
      hasText(profile?.country) ||
      hasText(profile?.current_status) ||
      hasText(profile?.career_goal) ||
      hasText(profile?.education) ||
      hasText(profile?.highest_qualification) ||
      hasText(profile?.field_of_study) ||
      Object.values(discovery?.answers ?? {}).some((value) => (Array.isArray(value) ? value.length > 0 : hasText(value)))
  );
}

function hasGuidedIdentitySetupStarted(profile: ProfileSnapshot | null, discovery?: DiscoverySnapshot | null) {
  return Boolean(
    profile?.onboarding_step ||
      profile?.language ||
      profile?.interface_language ||
      profile?.language_preference ||
      profile?.preferred_language ||
      hasText(profile?.phone) ||
      hasText(profile?.city) ||
      hasText(profile?.country) ||
      hasText(profile?.current_status) ||
      hasText(profile?.career_goal) ||
      hasText(profile?.education) ||
      hasText(profile?.highest_qualification) ||
      hasText(profile?.field_of_study) ||
      Object.values(discovery?.answers ?? {}).some((value) => (Array.isArray(value) ? value.length > 0 : hasText(value)))
  );
}

export function firstIncompleteProfessionalIdentitySection(profile: ProfileSnapshot | null, user?: UserEmailSnapshot | null, discovery?: DiscoverySnapshot | null): ProfessionalIdentityResumeSection | null {
  const missing = professionalIdentityRequiredChecks(profile, discovery, user).find((item) => !item.complete);
  if (missing) return missing.section;
  return null;
}

export function professionalIdentityIsSufficient(profile: ProfileSnapshot | null, user?: UserEmailSnapshot | null, discovery?: DiscoverySnapshot | null) {
  return firstIncompleteProfessionalIdentitySection(profile, user, discovery) === null;
}

export function professionalIdentityNeedsReview(profile: ProfileSnapshot | null, user?: UserEmailSnapshot | null, discovery?: DiscoverySnapshot | null) {
  return professionalIdentityIsSufficient(profile, user, discovery) && !profile?.onboarding_completed;
}

export function resolvePathzyOnboardingState(input: {
  authenticated: boolean;
  profile?: ProfileSnapshot | null;
  discovery?: DiscoverySnapshot | null;
  user?: UserEmailSnapshot | null;
  interfaceLanguageSelected?: boolean | null;
  reviewCompleted?: boolean | null;
  setupFinished?: boolean | null;
  diagnosisComplete?: boolean | null;
}): PathzyOnboardingState {
  if (!input.authenticated) return "unauthenticated";

  if (!input.profile?.onboarding_completed && !hasGuidedIdentitySetupStarted(input.profile ?? null, input.discovery)) {
    return "identity_not_started";
  }

  // Compatibility note: PATHZY does not yet have a final interface-language field.
  // Missing storage must not trap existing users, so only an explicit false blocks progression.
  const languageSelected =
    input.interfaceLanguageSelected ??
    Boolean(input.profile?.interface_language || input.profile?.language_preference || input.profile?.preferred_language || input.profile?.language);
  if (!languageSelected) return "authenticated_language_pending";

  if (!hasAnyIdentityProgress(input.profile ?? null, input.discovery, input.user)) return "identity_not_started";

  const missingSection = firstIncompleteProfessionalIdentitySection(input.profile ?? null, input.user, input.discovery);
  if (missingSection) return "identity_in_progress";

  const setupFinished = input.setupFinished ?? Boolean(input.profile?.setup_finished ?? input.discovery?.answers?.setup_finished ?? input.profile?.onboarding_completed);
  const reviewCompleted = input.reviewCompleted ?? Boolean(input.profile?.identity_review_completed ?? input.discovery?.answers?.identity_review_completed ?? input.profile?.onboarding_completed);
  if (!reviewCompleted) return "identity_review_pending";
  if (!setupFinished) return "identity_finish_pending";

  const diagnosisComplete =
    input.diagnosisComplete ??
    input.profile?.employment_diagnosis_completed ??
    (input.discovery?.answers?.employment_diagnosis_status === "complete" || input.discovery?.answers?.employment_diagnosis_completed === true);
  if (!diagnosisComplete) return "diagnosis_pending";
  return "home_ready";
}

export function resolvePathzyNextRoute(input: {
  authenticated: boolean;
  profile?: ProfileSnapshot | null;
  discovery?: DiscoverySnapshot | null;
  user?: UserEmailSnapshot | null;
  requestedDestination?: string | null;
  preferSignup?: boolean;
  interfaceLanguageSelected?: boolean | null;
  reviewCompleted?: boolean | null;
  setupFinished?: boolean | null;
  diagnosisComplete?: boolean | null;
}): PathzyNextRouteDecision {
  const safeFallback = appRoutes.authenticatedHome;
  const currentState = resolvePathzyOnboardingState(input);
  const missingSection = firstIncompleteProfessionalIdentitySection(input.profile ?? null, input.user, input.discovery);

  if (currentState === "unauthenticated") {
    const destination = input.preferSignup ? appRoutes.signup : routeBuilders.login(input.requestedDestination ?? appRoutes.authenticatedHome);
    return { destination, reason: "Authentication is required before PATHZY can resume the employment journey.", currentState, safeFallback };
  }
  if (currentState === "authenticated_language_pending") {
    return { destination: routeBuilders.professionalIdentitySection("preferences"), reason: "Choose the interface language PATHZY should use before continuing.", currentState, safeFallback, resumeSection: "preferences" };
  }
  if (currentState === "identity_not_started") {
    return { destination: routeBuilders.professionalIdentityWelcome(), reason: "Start with the focused PATHZY welcome before Professional Identity.", currentState, safeFallback, resumeSection: "profile" };
  }
  if (currentState === "identity_in_progress") {
    const resumeSection = missingSection ?? "profile";
    return { destination: routeBuilders.professionalIdentitySection(resumeSection), reason: "Resume the next incomplete Professional Identity section.", currentState, safeFallback, resumeSection };
  }
  if (currentState === "identity_review_pending") {
    return { destination: routeBuilders.professionalIdentityReview(), reason: "Review My Information before finishing setup.", currentState, safeFallback };
  }
  if (currentState === "identity_finish_pending") {
    return { destination: routeBuilders.professionalIdentityFinish(), reason: "Finish setup so PATHZY can move to Employment Diagnosis.", currentState, safeFallback };
  }
  if (currentState === "diagnosis_pending") {
    return { destination: routeBuilders.employmentDiagnosis("setup-complete"), reason: "Complete Employment Diagnosis before Personalised Home.", currentState, safeFallback };
  }

  return {
    destination: safePostAuthDestination(input.requestedDestination, appRoutes.authenticatedHome),
    reason: "Professional Identity setup is complete, so PATHZY can open the requested safe destination or Home.",
    currentState: currentState === "diagnosis_complete" ? "diagnosis_complete" : "home_ready",
    safeFallback
  };
}

export function safePostAuthDestination(target?: string | null, fallback = appRoutes.authenticatedHome) {
  const normalized = normalizeInternalPath(target);
  if (!normalized) return fallback;
  const pathname = pathnameFor(normalized);
  if (!pathname || protectedAuthDestinations.has(pathname) || isAuthRoute(pathname)) return fallback;
  return normalized;
}

export async function getPostAuthDestination(supabase: SupabaseClient, user: User, requestedDestination?: string | null) {
  const [{ data: profile }, { data: discovery }] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("full_name,email,city,country,education,highest_qualification,field_of_study,current_status,career_goal,onboarding_completed,onboarding_step,language")
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

  const decision = resolvePathzyNextRoute({
    authenticated: true,
    profile: profile as ProfileSnapshot | null,
    user,
    discovery: discovery as DiscoverySnapshot | null,
    requestedDestination
  });
  const destination = decision.destination;
  const destinationPathname = pathnameFor(destination);
  if (routeMatches(destinationPathname, appRoutes.billing) || routeMatches(destinationPathname, appRoutes.foundingMembers) || routeMatches(destinationPathname, appRoutes.pricing)) {
    return appRoutes.authenticatedHome;
  }
  return destination;
}
