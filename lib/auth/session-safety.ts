import { appRoutes, routeBuilders, safeRedirectDestination } from "@/lib/navigation/routes";

export type AuthFlowIntent = "signup" | "login" | "logout" | "password_reset" | "email_confirmation" | "session_refresh";

export type AuthSessionStatus =
  | "anonymous"
  | "authenticated"
  | "expired"
  | "refreshing"
  | "email_verification_required"
  | "password_recovery"
  | "misconfigured";

export type AuthSessionDecision = {
  status: AuthSessionStatus;
  destination: string;
  message: string;
  preserveReturnTo: boolean;
};

const genericAuthFailure = "We could not verify your session. Please log in again to continue.";

export function friendlyAuthErrorMessage(message?: string | null) {
  const lower = (message ?? "").toLowerCase();
  if (!lower) return genericAuthFailure;
  if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
    return "Email not confirmed. Please open the confirmation email from PATHZY, then log in again.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Wrong password or account not found. Check your email and password, then try again.";
  }
  if (lower.includes("expired") || lower.includes("jwt") || lower.includes("session")) {
    return "Your session has expired. Please log in again to continue.";
  }
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("failed to fetch")) {
    return "Network error. Check your internet connection and try again.";
  }
  return "We could not complete the authentication step. Please try again.";
}

export function authRedirectForStatus(status: AuthSessionStatus, requestedDestination?: string | null): AuthSessionDecision {
  const safeDestination = safeRedirectDestination(requestedDestination, appRoutes.authenticatedHome);

  if (status === "authenticated") {
    return {
      status,
      destination: safeDestination,
      message: "Session is active.",
      preserveReturnTo: false
    };
  }

  if (status === "password_recovery") {
    return {
      status,
      destination: appRoutes.authUpdatePassword,
      message: "Continue to password reset.",
      preserveReturnTo: false
    };
  }

  if (status === "misconfigured") {
    return {
      status,
      destination: appRoutes.home,
      message: "PATHZY authentication is still being configured.",
      preserveReturnTo: false
    };
  }

  return {
    status,
    destination: routeBuilders.login(safeDestination),
    message: status === "email_verification_required" ? "Please confirm your email before continuing." : "Please log in to continue.",
    preserveReturnTo: true
  };
}

export function isSessionExpiredError(message?: string | null) {
  const lower = (message ?? "").toLowerCase();
  return lower.includes("expired") || lower.includes("jwt") || lower.includes("refresh token") || lower.includes("session");
}
