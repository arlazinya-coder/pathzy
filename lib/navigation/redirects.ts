import { appRoutes } from "./routes";
import { canUseProfessionalIdentity, hasPremiumAccess, type PermissionContext } from "./permissions";

export type RedirectState = PermissionContext & {
  pathname?: string;
  onboardingComplete?: boolean;
  profileComplete?: boolean;
  requestedPremiumFeature?: boolean;
  requestedProfessionalIdentity?: boolean;
};

export function getRedirectForState(state: RedirectState | null | undefined) {
  if (!state?.isAuthenticated && state?.pathname && state.pathname !== appRoutes.login) return appRoutes.login;
  if (state?.isAuthenticated && state.onboardingComplete === false) return appRoutes.onboarding;
  if (state?.isAuthenticated && state.profileComplete === false) return appRoutes.professionalIdentity;
  if (state?.requestedPremiumFeature && !hasPremiumAccess(state)) return appRoutes.billing;
  if (state?.requestedProfessionalIdentity && !canUseProfessionalIdentity(state)) return appRoutes.billing;
  return appRoutes.dashboard;
}

export function redirectToLogin(pathname: string) {
  return `${appRoutes.login}?message=${encodeURIComponent("Please log in to continue.")}&redirectTo=${encodeURIComponent(pathname)}`;
}

export function redirectAfterAuth(next?: string | null) {
  return next?.startsWith("/") ? next : appRoutes.dashboard;
}
