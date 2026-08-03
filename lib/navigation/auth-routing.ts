import type { SupabaseClient, User } from "@supabase/supabase-js";
import { PROFESSIONAL_IDENTITY_SECTION_IDS, type ProfessionalIdentitySectionId } from "@/lib/canonical-profile/canonical-professional-identity.model";
import { appRoutes, isAuthRoute, routeBuilders, routeMatches } from "@/lib/navigation/routes";
import { loadProfessionalIdentitySources } from "@/lib/professional-identity/professional-identity-read-service";
import {
  professionalIdentityRequiredChecksFromValues,
  professionalIdentityValuesFromSources
} from "@/lib/professional-identity/professional-identity-completion";

export type ProfessionalIdentityResumeSection = ProfessionalIdentitySectionId;
export type PathzyOnboardingState =
  | "unauthenticated"
  | "welcome_pending"
  | "interface_language_pending"
  | "document_language_pending"
  | "coach_intro_pending"
  | "professional_identity_intro_pending"
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

function storedOnboardingState(discovery: DiscoverySnapshot | null | undefined): StoredOnboardingState | "" {
  const value = discovery?.answers?.pathzy_onboarding_state;
  return typeof value === "string" && (onboardingStateOrder as readonly string[]).includes(value) ? value as StoredOnboardingState : "";
}

function onboardingStateAtLeast(discovery: DiscoverySnapshot | null | undefined, expected: StoredOnboardingState) {
  const current = storedOnboardingState(discovery);
  if (!current) return false;
  return onboardingStateOrder.indexOf(current) >= onboardingStateOrder.indexOf(expected);
}

function onboardingFlag(discovery: DiscoverySnapshot | null | undefined, key: string) {
  return discovery?.answers?.[key] === true;
}

function hasIdentityAnswerProgress(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return false;
  return hasText(value);
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

export function professionalIdentitySectionHref(section: ProfessionalIdentityResumeSection | string, returnTo?: string | null) {
  const safeReturnTo = returnTo === "review" ? professionalIdentityReviewHref() : returnTo;
  return routeBuilders.professionalIdentitySection(normalizeProfessionalIdentitySection(section), safeReturnTo);
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
  return professionalIdentityRequiredChecksFromValues(professionalIdentityValuesFromSources(profile, discovery, user)).map((check) => ({
    section: check.section as ProfessionalIdentityResumeSection,
    label: check.label,
    status: check.status,
    complete: check.complete,
    guidance: check.guidance
  }));
}

function hasAnyIdentityProgress(profile: ProfileSnapshot | null, discovery?: DiscoverySnapshot | null) {
  return Boolean(
    hasText(profile?.phone) ||
      hasText(profile?.city) ||
      hasText(profile?.country) ||
      hasText(profile?.current_status) ||
      hasText(profile?.career_goal) ||
      hasText(profile?.education) ||
      hasText(profile?.highest_qualification) ||
      hasText(profile?.field_of_study) ||
      Object.entries(discovery?.answers ?? {}).some(([key, value]) => !key.startsWith("employment_readiness_check") && !key.startsWith("pathzy_onboarding") && !["welcome_completed", "interface_language", "professional_document_language", "career_coach_intro_seen", "professional_identity_intro_seen"].includes(key) && hasIdentityAnswerProgress(value))
  );
}

function hasGuidedIdentitySetupStarted(profile: ProfileSnapshot | null, discovery?: DiscoverySnapshot | null) {
  return Boolean(
    onboardingStateAtLeast(discovery, "identity_started") ||
      (typeof profile?.onboarding_step === "number" && profile.onboarding_step > 1) ||
      hasText(profile?.phone) ||
      hasText(profile?.city) ||
      hasText(profile?.country) ||
      hasText(profile?.current_status) ||
      hasText(profile?.career_goal) ||
      hasText(profile?.education) ||
      hasText(profile?.highest_qualification) ||
      hasText(profile?.field_of_study) ||
      Object.entries(discovery?.answers ?? {}).some(([key, value]) => !key.startsWith("employment_readiness_check") && !key.startsWith("pathzy_onboarding") && !["welcome_completed", "interface_language", "professional_document_language", "career_coach_intro_seen", "professional_identity_intro_seen"].includes(key) && hasIdentityAnswerProgress(value))
  );
}

function welcomeCompleted(profile: ProfileSnapshot | null, discovery?: DiscoverySnapshot | null) {
  return Boolean(
    profile?.onboarding_completed ||
      onboardingFlag(discovery, "welcome_completed") ||
      onboardingStateAtLeast(discovery, "welcome_completed") ||
      hasGuidedIdentitySetupStarted(profile, discovery)
  );
}

function interfaceLanguageCompleted(profile: ProfileSnapshot | null, discovery?: DiscoverySnapshot | null) {
  return Boolean(
    profile?.onboarding_completed ||
      onboardingStateAtLeast(discovery, "interface_language_completed") ||
      hasText(answerText(discovery, "interface_language")) ||
      hasGuidedIdentitySetupStarted(profile, discovery)
  );
}

function professionalDocumentLanguageCompleted(profile: ProfileSnapshot | null, discovery?: DiscoverySnapshot | null) {
  return Boolean(
    profile?.onboarding_completed ||
      onboardingStateAtLeast(discovery, "document_language_completed") ||
      hasText(answerText(discovery, "professional_document_language")) ||
      hasGuidedIdentitySetupStarted(profile, discovery)
  );
}

function coachIntroCompleted(profile: ProfileSnapshot | null, discovery?: DiscoverySnapshot | null) {
  return Boolean(
    profile?.onboarding_completed ||
      onboardingStateAtLeast(discovery, "coach_intro_completed") ||
      discovery?.answers?.career_coach_intro_seen === true ||
      answerText(discovery, "career_coach_intro_seen") === "true" ||
      hasGuidedIdentitySetupStarted(profile, discovery)
  );
}

function professionalIdentityIntroductionCompleted(profile: ProfileSnapshot | null, discovery?: DiscoverySnapshot | null) {
  return Boolean(
    profile?.onboarding_completed ||
      onboardingStateAtLeast(discovery, "professional_identity_intro_completed") ||
      onboardingStateAtLeast(discovery, "identity_started") ||
      discovery?.answers?.professional_identity_intro_seen === true ||
      answerText(discovery, "professional_identity_intro_seen") === "true" ||
      hasGuidedIdentitySetupStarted(profile, discovery)
  );
}

function identityStarted(profile: ProfileSnapshot | null, discovery?: DiscoverySnapshot | null) {
  return Boolean(
    profile?.onboarding_completed ||
      onboardingStateAtLeast(discovery, "identity_started") ||
      onboardingFlag(discovery, "identity_started") ||
      hasGuidedIdentitySetupStarted(profile, discovery)
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

  if (!input.profile?.onboarding_completed && !welcomeCompleted(input.profile ?? null, input.discovery)) {
    return "welcome_pending";
  }

  // Compatibility note: PATHZY does not yet have a final interface-language field.
  // Missing storage must not trap existing users, so only an explicit false blocks progression.
  const languageSelected =
    input.interfaceLanguageSelected ??
    interfaceLanguageCompleted(input.profile ?? null, input.discovery);
  if (!languageSelected) return "interface_language_pending";

  if (!input.profile?.onboarding_completed && !professionalDocumentLanguageCompleted(input.profile ?? null, input.discovery)) {
    return "document_language_pending";
  }

  if (!input.profile?.onboarding_completed && !coachIntroCompleted(input.profile ?? null, input.discovery)) {
    return "coach_intro_pending";
  }

  if (!input.profile?.onboarding_completed && !professionalIdentityIntroductionCompleted(input.profile ?? null, input.discovery)) {
    return "professional_identity_intro_pending";
  }

  if (!identityStarted(input.profile ?? null, input.discovery) && !hasAnyIdentityProgress(input.profile ?? null, input.discovery)) {
    return "identity_not_started";
  }

  if (!hasAnyIdentityProgress(input.profile ?? null, input.discovery)) return "identity_not_started";

  const missingSection = firstIncompleteProfessionalIdentitySection(input.profile ?? null, input.user, input.discovery);
  if (missingSection) return "identity_in_progress";

  const setupFinished =
    input.setupFinished ??
    Boolean(
      input.discovery?.answers?.setup_finished ||
        input.discovery?.answers?.setup_completed ||
        onboardingStateAtLeast(input.discovery, "setup_completed") ||
        input.profile?.onboarding_completed
    );
  const reviewCompleted =
    input.reviewCompleted ??
    Boolean(
      input.discovery?.answers?.identity_review_completed ||
        input.discovery?.answers?.identity_reviewed ||
        onboardingStateAtLeast(input.discovery, "identity_reviewed") ||
        input.profile?.onboarding_completed
    );
  if (!reviewCompleted) return "identity_review_pending";
  if (!setupFinished) return "identity_finish_pending";

  const diagnosisComplete =
    input.diagnosisComplete ??
    (input.discovery?.answers?.employment_diagnosis_status === "complete" ||
      input.discovery?.answers?.employment_diagnosis_completed === true ||
      input.discovery?.answers?.diagnosis_completed === true ||
      onboardingStateAtLeast(input.discovery, "diagnosis_completed"));
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
  if (currentState === "welcome_pending") {
    return { destination: routeBuilders.professionalIdentityWelcome(), reason: "Start with the PATHZY welcome before Professional Identity.", currentState, safeFallback };
  }
  if (currentState === "interface_language_pending" || currentState === "authenticated_language_pending") {
    return { destination: routeBuilders.professionalIdentityOnboardingStage("interfaceLanguage"), reason: "Choose the interface language PATHZY should use before continuing.", currentState, safeFallback, resumeSection: "preferences" };
  }
  if (currentState === "document_language_pending") {
    return { destination: routeBuilders.professionalIdentityOnboardingStage("documentLanguage"), reason: "Choose the language PATHZY should use for professional documents.", currentState, safeFallback };
  }
  if (currentState === "coach_intro_pending") {
    return { destination: routeBuilders.professionalIdentityOnboardingStage("careerCoach"), reason: "Meet the PATHZY Career Coach before building Professional Identity.", currentState, safeFallback };
  }
  if (currentState === "professional_identity_intro_pending") {
    return { destination: routeBuilders.professionalIdentityIntroduction(), reason: "Understand Professional Identity before opening the guided setup.", currentState, safeFallback };
  }
  if (currentState === "identity_not_started") {
    return { destination: routeBuilders.professionalIdentitySection("profile"), reason: "Start the guided Professional Identity setup at Profile.", currentState, safeFallback, resumeSection: "profile" };
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
  const { profile, discovery } = await loadProfessionalIdentitySources(supabase, user.id);

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
