export const PATHZY_ROUTES = {
  WELCOME_HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  MY_EMPLOYMENT_JOURNEY: "/roadmap",
  MY_PROFESSIONAL_PROFILE: "/professional-identity",
  CV_BUILDER: "/professional-identity/cv",
  COVER_LETTER: "/professional-identity/cover-letter",
  LINKEDIN_OPTIMIZER: "/professional-identity/linkedin",
  MY_DOCUMENTS: "/professional-identity/documents",
  REFERENCES: "/professional-identity/references",
  SUPPORTING_DOCUMENTS: "/professional-identity/supporting-documents",
  FIND_OPPORTUNITIES: "/opportunities",
  MY_APPLICATIONS: "/applications",
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
  REFERENCES: "References",
  SUPPORTING_DOCUMENTS: "Supporting Documents",
  FIND_OPPORTUNITIES: "Find Opportunities",
  MY_APPLICATIONS: "My Applications",
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
  home: PATHZY_ROUTES.WELCOME_HOME,
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
  interview: "/interview",
  profile: "/profile",
  foundingMembers: "/founding-members",
  professionalIdentity: PATHZY_ROUTES.MY_PROFESSIONAL_PROFILE,
  documents: PATHZY_ROUTES.MY_DOCUMENTS,
  professionalIdentityCv: PATHZY_ROUTES.CV_BUILDER,
  professionalIdentityCoverLetter: PATHZY_ROUTES.COVER_LETTER,
  professionalIdentityLinkedin: PATHZY_ROUTES.LINKEDIN_OPTIMIZER,
  professionalIdentityRecruiterMessage: "/professional-identity/recruiter-message",
  professionalIdentityFollowUp: "/professional-identity/follow-up",
  professionalIdentityFollowUpEmail: "/professional-identity/follow-up-email",
  professionalIdentityCareerPassport: "/professional-identity/career-passport",
  professionalIdentityReferences: PATHZY_ROUTES.REFERENCES,
  professionalIdentitySupportingDocuments: PATHZY_ROUTES.SUPPORTING_DOCUMENTS,
  login: PATHZY_ROUTES.LOGIN,
  register: legacyRoutes.register,
  signup: PATHZY_ROUTES.SIGNUP,
  authCallback: "/auth/callback",
  authResetPassword: "/auth/reset-password",
  authUpdatePassword: "/auth/update-password",
  qaPathzyJourney: "/qa-pathzy-journey",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  disclaimer: "/disclaimer"
} as const;

export type AppRouteKey = keyof typeof appRoutes;
export type AppRoute = (typeof appRoutes)[AppRouteKey];

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

export const protectedRoutes = [
  appRoutes.dashboard,
  appRoutes.onboarding,
  appRoutes.discovery,
  appRoutes.roadmap,
  appRoutes.missions,
  appRoutes.achievements,
  appRoutes.mentor,
  appRoutes.cvBuilder,
  appRoutes.skills,
  appRoutes.progress,
  appRoutes.billing,
  appRoutes.settings,
  appRoutes.opportunities,
  appRoutes.applications,
  appRoutes.professionalIdentity,
  appRoutes.employmentTracker,
  appRoutes.interview,
  appRoutes.profile,
  appRoutes.foundingMembers
] as const;

export const professionalIdentityRoutes = [
  appRoutes.professionalIdentity,
  appRoutes.documents,
  appRoutes.professionalIdentityCv,
  appRoutes.professionalIdentityCoverLetter,
  appRoutes.professionalIdentityLinkedin,
  appRoutes.professionalIdentityRecruiterMessage,
  appRoutes.professionalIdentityFollowUp,
  appRoutes.professionalIdentityFollowUpEmail,
  appRoutes.professionalIdentityCareerPassport,
  appRoutes.professionalIdentityReferences,
  appRoutes.professionalIdentitySupportingDocuments,
  appRoutes.cvBuilder
] as const;

export const premiumActionRoutes = [
  appRoutes.documents,
  appRoutes.professionalIdentityCv,
  appRoutes.professionalIdentityCoverLetter,
  appRoutes.professionalIdentityLinkedin,
  appRoutes.professionalIdentityRecruiterMessage,
  appRoutes.professionalIdentityFollowUp,
  appRoutes.professionalIdentityFollowUpEmail,
  appRoutes.professionalIdentityCareerPassport,
  appRoutes.professionalIdentityReferences,
  appRoutes.professionalIdentitySupportingDocuments,
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
