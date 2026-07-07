export const appRoutes = {
  home: "/",
  dashboard: "/dashboard",
  onboarding: "/onboarding",
  discovery: "/discovery",
  roadmap: "/roadmap",
  missions: "/missions",
  achievements: "/achievements",
  mentor: "/mentor",
  cvBuilder: "/cv-builder",
  skills: "/skills",
  progress: "/progress",
  billing: "/billing",
  pricing: "/pricing",
  settings: "/settings",
  opportunities: "/opportunities",
  applications: "/applications",
  employmentTracker: "/employment-tracker",
  interview: "/interview",
  profile: "/profile",
  foundingMembers: "/founding-members",
  professionalIdentity: "/professional-identity",
  documents: "/professional-identity/documents",
  professionalIdentityCv: "/professional-identity/cv",
  professionalIdentityCoverLetter: "/professional-identity/cover-letter",
  professionalIdentityLinkedin: "/professional-identity/linkedin",
  professionalIdentityRecruiterMessage: "/professional-identity/recruiter-message",
  professionalIdentityFollowUp: "/professional-identity/follow-up",
  professionalIdentityCareerPassport: "/professional-identity/career-passport",
  login: "/login",
  register: "/register",
  signup: "/signup",
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
  appRoutes.professionalIdentityCareerPassport,
  appRoutes.cvBuilder
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
