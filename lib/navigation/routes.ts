import { PROFESSIONAL_IDENTITY_SECTION_IDS, type ProfessionalIdentitySectionId } from "@/lib/canonical-profile/canonical-professional-identity.model";

export const PATHZY_ROUTES = {
  LANDING: "/",
  WELCOME_HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  AUTH_CALLBACK: "/auth/callback",
  FORGOT_PASSWORD: "/auth/reset-password",
  RESET_PASSWORD: "/auth/update-password",
  PROFESSIONAL_IDENTITY: "/professional-identity",
  PROFESSIONAL_IDENTITY_REVIEW: "/professional-identity/review",
  PROFESSIONAL_IDENTITY_SECTION_ROOT: "/professional-identity/section",
  HOME: "/roadmap",
  EMPLOYMENT_CENTER: "/employment-center",
  MY_EMPLOYMENT_JOURNEY: "/roadmap",
  MY_PROFESSIONAL_PROFILE: "/professional-identity",
  CV_BUILDER: "/professional-identity/cv",
  COVER_LETTER: "/professional-identity/cover-letter",
  LINKEDIN_OPTIMIZER: "/professional-identity/linkedin",
  MY_DOCUMENTS: "/professional-identity/documents",
  FIND_OPPORTUNITIES: "/opportunities",
  MY_APPLICATIONS: "/applications",
  INTERVIEW_PREPARATION: "/interview",
  CAREER_ANALYTICS: "/applications#career-analytics",
  COACH: "/mentor",
  SKILLS_CAREER_GROWTH: "/skills",
  BILLING: "/billing",
  SETTINGS: "/settings"
} as const;

export const PATHZY_ROUTE_LABELS = {
  MY_EMPLOYMENT_JOURNEY: "My Employment Journey",
  MY_PROFESSIONAL_PROFILE: "My Professional Profile",
  CV_BUILDER: "CV Builder",
  COVER_LETTER: "Cover Letter",
  LINKEDIN_OPTIMIZER: "LinkedIn",
  MY_DOCUMENTS: "My Documents",
  FIND_OPPORTUNITIES: "Find Opportunities",
  MY_APPLICATIONS: "My Applications",
  INTERVIEW_PREPARATION: "Interview Preparation",
  CAREER_ANALYTICS: "Career Analytics",
  COACH: "Coach",
  SKILLS_CAREER_GROWTH: "Skills & Career Growth",
  BILLING: "Billing",
  SETTINGS: "Settings"
} as const;

export const legacyRoutes = {
  dashboard: "/dashboard",
  cvBuilder: "/cv-builder",
  employmentTracker: "/employment-tracker",
  progress: "/progress",
  pricing: "/pricing",
  register: "/register"
} as const;

export const appRoutes = {
  home: PATHZY_ROUTES.LANDING,
  authenticatedHome: PATHZY_ROUTES.HOME,
  employmentCenter: PATHZY_ROUTES.EMPLOYMENT_CENTER,
  dashboard: legacyRoutes.dashboard,
  onboarding: "/onboarding",
  discovery: "/discovery",
  roadmap: PATHZY_ROUTES.MY_EMPLOYMENT_JOURNEY,
  missions: "/missions",
  achievements: "/achievements",
  mentor: "/mentor",
  cvBuilder: legacyRoutes.cvBuilder,
  skills: PATHZY_ROUTES.SKILLS_CAREER_GROWTH,
  progress: legacyRoutes.progress,
  billing: PATHZY_ROUTES.BILLING,
  pricing: legacyRoutes.pricing,
  settings: PATHZY_ROUTES.SETTINGS,
  opportunities: PATHZY_ROUTES.FIND_OPPORTUNITIES,
  applications: PATHZY_ROUTES.MY_APPLICATIONS,
  employmentTracker: legacyRoutes.employmentTracker,
  interview: PATHZY_ROUTES.INTERVIEW_PREPARATION,
  careerAnalytics: PATHZY_ROUTES.CAREER_ANALYTICS,
  profile: "/profile",
  foundingMembers: "/founding-members",
  professionalIdentity: PATHZY_ROUTES.MY_PROFESSIONAL_PROFILE,
  professionalIdentityReview: PATHZY_ROUTES.PROFESSIONAL_IDENTITY_REVIEW,
  professionalIdentitySectionRoot: PATHZY_ROUTES.PROFESSIONAL_IDENTITY_SECTION_ROOT,
  documents: PATHZY_ROUTES.MY_DOCUMENTS,
  professionalIdentityCv: PATHZY_ROUTES.CV_BUILDER,
  professionalIdentityCoverLetter: PATHZY_ROUTES.COVER_LETTER,
  professionalIdentityLinkedin: PATHZY_ROUTES.LINKEDIN_OPTIMIZER,
  professionalIdentityRecruiterMessage: "/professional-identity/recruiter-message",
  professionalIdentityFollowUp: "/professional-identity/follow-up",
  professionalIdentityCareerPassport: "/professional-identity/career-passport",
  coach: PATHZY_ROUTES.COACH,
  login: PATHZY_ROUTES.LOGIN,
  register: legacyRoutes.register,
  signup: PATHZY_ROUTES.SIGNUP,
  authCallback: PATHZY_ROUTES.AUTH_CALLBACK,
  authResetPassword: PATHZY_ROUTES.FORGOT_PASSWORD,
  authUpdatePassword: PATHZY_ROUTES.RESET_PASSWORD,
  qaPathzyJourney: "/qa-pathzy-journey",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  disclaimer: "/disclaimer"
} as const;

export type AppRouteKey = keyof typeof appRoutes;
export type AppRoute = (typeof appRoutes)[AppRouteKey];
export type RoutePath = `/${string}`;
export type QueryValue = string | number | boolean | null | undefined;
export type ProfessionalIdentityOnboardingStage =
  | "welcome"
  | "interfaceLanguage"
  | "documentLanguage"
  | "careerCoach"
  | "professionalIdentityIntroduction";

export const routeGroups = {
  public: {
    landing: appRoutes.home,
    features: `${appRoutes.home}#features`,
    howPathzyWorks: `${appRoutes.home}#how-pathzy-works`,
    careerJourney: `${appRoutes.home}#career-journey`,
    pricing: appRoutes.pricing,
    login: appRoutes.login,
    signup: appRoutes.signup,
    passwordRecovery: appRoutes.authResetPassword
  },
  authentication: {
    login: appRoutes.login,
    signup: appRoutes.signup,
    callback: appRoutes.authCallback,
    forgotPassword: appRoutes.authResetPassword,
    resetPassword: appRoutes.authUpdatePassword
  },
  onboarding: {
    interfaceLanguage: appRoutes.professionalIdentity,
    professionalIdentityStart: appRoutes.professionalIdentity,
    reviewMyInformation: appRoutes.professionalIdentityReview,
    finishSetup: appRoutes.professionalIdentity,
    employmentDiagnosis: appRoutes.discovery,
    personalisedHome: appRoutes.authenticatedHome
  },
  application: {
    professionalIdentity: appRoutes.professionalIdentity,
    employmentCenter: appRoutes.employmentCenter,
    cvs: appRoutes.professionalIdentityCv,
    coverLetters: appRoutes.professionalIdentityCoverLetter,
    linkedin: appRoutes.professionalIdentityLinkedin,
    professionalBio: appRoutes.professionalIdentityCareerPassport,
    opportunities: appRoutes.opportunities,
    savedJobs: appRoutes.opportunities,
    applications: appRoutes.applications,
    interviewPreparation: appRoutes.interview,
    careerGrowth: appRoutes.skills,
    settings: appRoutes.settings,
    billing: appRoutes.billing
  },
  admin: {
    betaEntitlementsApi: "/api/admin/beta-entitlements"
  },
  legacyAliases: {
    dashboard: legacyRoutes.dashboard,
    register: legacyRoutes.register,
    cvBuilder: legacyRoutes.cvBuilder,
    employmentTracker: legacyRoutes.employmentTracker,
    progress: legacyRoutes.progress,
    pricing: legacyRoutes.pricing
  }
} as const;

function appendQuery(pathname: string, query: Record<string, QueryValue> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const queryString = search.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

function internalPathWithQuery(target?: string | null) {
  if (!target?.startsWith("/")) return "";
  try {
    const url = new URL(target, "https://pathzy.local");
    if (url.origin !== "https://pathzy.local") return "";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "";
  }
}

export function safeRedirectDestination(target?: string | null, fallback = appRoutes.authenticatedHome) {
  const normalized = internalPathWithQuery(target);
  if (!normalized) return fallback;
  const pathname = new URL(normalized, "https://pathzy.local").pathname;
  if (isAuthRoute(pathname)) return fallback;
  return normalized;
}

export const routeBuilders = {
  withReturnTo(pathname: string, returnTo?: string | null) {
    return appendQuery(pathname, { returnTo: returnTo ? safeRedirectDestination(returnTo, appRoutes.authenticatedHome) : undefined });
  },
  login(returnTo?: string | null) {
    return appendQuery(appRoutes.login, { redirectTo: returnTo ? safeRedirectDestination(returnTo, appRoutes.authenticatedHome) : undefined });
  },
  // Canonical public URLs may use /professional-identity/review and
  // /professional-identity/section/[sectionId]. They redirect into this
  // query-based renderer so Review remains a single implementation.
  professionalIdentitySection(sectionId: ProfessionalIdentitySectionId, returnTo?: string | null) {
    return appendQuery(appRoutes.professionalIdentity, {
      section: PROFESSIONAL_IDENTITY_SECTION_IDS.includes(sectionId) ? sectionId : "profile",
      returnTo: returnTo ? safeRedirectDestination(returnTo, appRoutes.authenticatedHome) : undefined
    });
  },
  professionalIdentityWelcome(returnTo?: string | null) {
    return appendQuery(appRoutes.professionalIdentity, {
      stage: "welcome",
      returnTo: returnTo ? safeRedirectDestination(returnTo, appRoutes.authenticatedHome) : undefined
    });
  },
  professionalIdentityOnboardingStage(stage: ProfessionalIdentityOnboardingStage, returnTo?: string | null) {
    return appendQuery(appRoutes.professionalIdentity, {
      stage,
      returnTo: returnTo ? safeRedirectDestination(returnTo, appRoutes.authenticatedHome) : undefined
    });
  },
  professionalIdentityIntroduction(returnTo?: string | null) {
    return appendQuery(appRoutes.professionalIdentity, {
      stage: "professionalIdentityIntroduction",
      returnTo: returnTo ? safeRedirectDestination(returnTo, appRoutes.authenticatedHome) : undefined
    });
  },
  professionalIdentityReadinessCheck(returnTo?: string | null) {
    return appendQuery(appRoutes.professionalIdentity, {
      stage: "readinessCheck",
      returnTo: returnTo ? safeRedirectDestination(returnTo, appRoutes.authenticatedHome) : undefined
    });
  },
  professionalIdentityReadinessTransition(returnTo?: string | null) {
    return appendQuery(appRoutes.professionalIdentity, {
      stage: "readinessTransition",
      returnTo: returnTo ? safeRedirectDestination(returnTo, appRoutes.authenticatedHome) : undefined
    });
  },
  professionalIdentityReview(returnTo?: string | null) {
    return appendQuery(appRoutes.professionalIdentity, {
      review: "1",
      returnTo: returnTo ? safeRedirectDestination(returnTo, appRoutes.authenticatedHome) : undefined
    });
  },
  professionalIdentityFinish(returnTo?: string | null) {
    return appendQuery(appRoutes.professionalIdentity, {
      finish: "1",
      returnTo: returnTo ? safeRedirectDestination(returnTo, appRoutes.authenticatedHome) : undefined
    });
  },
  employmentDiagnosis(reason?: string | null) {
    return appendQuery(appRoutes.discovery, { reason });
  },
  cvWorkspace(options: { intent?: "build" | "upload" | "upgrade" | "review"; documentId?: string | null; returnTo?: string | null } = {}) {
    return appendQuery(appRoutes.professionalIdentityCv, {
      intent: options.intent,
      documentId: options.documentId,
      returnTo: options.returnTo ? safeRedirectDestination(options.returnTo, appRoutes.authenticatedHome) : undefined
    });
  },
  coverLetterWorkspace(options: { applicationId?: string | null; jobId?: string | null; documentId?: string | null; returnTo?: string | null } = {}) {
    return appendQuery(appRoutes.professionalIdentityCoverLetter, {
      applicationId: options.applicationId,
      jobId: options.jobId,
      documentId: options.documentId,
      returnTo: options.returnTo ? safeRedirectDestination(options.returnTo, appRoutes.authenticatedHome) : undefined
    });
  },
  linkedinWorkspace(documentId?: string | null) {
    return appendQuery(appRoutes.professionalIdentityLinkedin, { documentId });
  },
  jobMatch(jobId: string, returnTo?: string | null) {
    return appendQuery(appRoutes.opportunities, {
      jobId,
      view: "match",
      returnTo: returnTo ? safeRedirectDestination(returnTo, appRoutes.authenticatedHome) : undefined
    });
  },
  applicationDetail(applicationId: string, returnTo?: string | null) {
    return appendQuery(appRoutes.applications, {
      applicationId,
      returnTo: returnTo ? safeRedirectDestination(returnTo, appRoutes.authenticatedHome) : undefined
    });
  },
  interviewPreparation(applicationId?: string | null, type?: string | null) {
    return appendQuery(appRoutes.interview, { applicationId, type });
  },
  coachContext(contextType: string, entityId?: string | null) {
    return appendQuery(appRoutes.mentor, { context: contextType, id: entityId });
  }
} as const;

export const publicRoutes = [
  appRoutes.home,
  appRoutes.pricing,
  appRoutes.login,
  appRoutes.register,
  appRoutes.signup,
  appRoutes.authCallback,
  appRoutes.authResetPassword,
  appRoutes.authUpdatePassword,
  appRoutes.contact,
  appRoutes.privacy,
  appRoutes.terms,
  appRoutes.disclaimer
] as const;

export const authRoutes = [
  appRoutes.login,
  appRoutes.register,
  appRoutes.signup,
  appRoutes.authResetPassword,
  appRoutes.authUpdatePassword
] as const;

export const professionalIdentityRoutes = [
  appRoutes.professionalIdentity,
  appRoutes.documents,
  appRoutes.professionalIdentityCv,
  appRoutes.professionalIdentityCoverLetter,
  appRoutes.professionalIdentityLinkedin,
  appRoutes.professionalIdentityRecruiterMessage,
  appRoutes.professionalIdentityFollowUp,
  appRoutes.professionalIdentityCareerPassport,
  appRoutes.cvBuilder
] as const;

export const protectedRoutes = [
  appRoutes.dashboard,
  appRoutes.onboarding,
  appRoutes.discovery,
  appRoutes.roadmap,
  appRoutes.missions,
  appRoutes.achievements,
  appRoutes.mentor,
  appRoutes.skills,
  appRoutes.progress,
  appRoutes.billing,
  appRoutes.settings,
  appRoutes.opportunities,
  appRoutes.applications,
  appRoutes.employmentCenter,
  ...professionalIdentityRoutes,
  appRoutes.employmentTracker,
  appRoutes.interview,
  appRoutes.profile,
  appRoutes.foundingMembers
] as const;

export const premiumActionRoutes = [
  appRoutes.documents,
  appRoutes.professionalIdentityCv,
  appRoutes.professionalIdentityCoverLetter,
  appRoutes.professionalIdentityLinkedin,
  appRoutes.professionalIdentityRecruiterMessage,
  appRoutes.professionalIdentityFollowUp,
  appRoutes.professionalIdentityCareerPassport,
  appRoutes.mentor,
  appRoutes.interview
] as const;

export function routeMatches(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => routeMatches(pathname, route));
}

export function isAuthRoute(pathname: string) {
  return authRoutes.some((route) => routeMatches(pathname, route));
}

export function isProfessionalIdentityRoute(pathname: string) {
  return professionalIdentityRoutes.some((route) => routeMatches(pathname, route));
}
