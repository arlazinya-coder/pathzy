import { normalizePathzyError } from "@/lib/errors/error-normalization";
import { pathzyPhase2T } from "@/lib/language/pathzy-i18n";
import { type SupportedLanguageCode } from "@/lib/language/language-preferences";
import { supabaseConfigurationMessage, type SupabasePublicConfigStatus } from "@/lib/supabase/config";

export const AUTH_NETWORK_USER_MESSAGE = "We couldn't connect to PATHZY right now. Check your connection and try again.";

type AuthOperation = "login" | "signup" | "oauth" | "bootstrap";

function messageFrom(error: unknown) {
  return normalizePathzyError(error).developerMessage;
}

export function isAuthNetworkFailure(error: unknown) {
  const message = messageFrom(error).toLowerCase();
  return (
    message.includes("networkerror") ||
    message.includes("network error") ||
    message.includes("failed to fetch") ||
    message.includes("fetch failed") ||
    message.includes("load failed") ||
    message.includes("connection") ||
    message.includes("timeout")
  );
}

export function friendlyAuthError(error: unknown, operation: AuthOperation, language: SupportedLanguageCode = "en") {
  const normalized = normalizePathzyError(error);
  const lower = normalized.developerMessage.toLowerCase();

  if (isAuthNetworkFailure(error)) return pathzyPhase2T(language, "auth.error.network");
  if (lower.includes("not configured") || lower.includes("environment variables")) return supabaseConfigurationMessage();
  if (operation === "signup" && (lower.includes("already registered") || lower.includes("already"))) return pathzyPhase2T(language, "auth.error.signup.exists");
  if (operation === "signup" && lower.includes("password")) return pathzyPhase2T(language, "auth.error.signup.password");
  if (operation === "login" && (lower.includes("email not confirmed") || lower.includes("not confirmed"))) return pathzyPhase2T(language, "auth.error.login.confirmEmail");
  if (operation === "login" && lower.includes("invalid login credentials")) return pathzyPhase2T(language, "auth.error.login.invalid");
  if (operation === "login" && (lower.includes("user not found") || lower.includes("not found"))) return pathzyPhase2T(language, "auth.error.login.notFound");

  return normalized.userMessage || (operation === "login" ? pathzyPhase2T(language, "auth.error.login.generic") : pathzyPhase2T(language, "auth.error.signup.generic"));
}

export function authConfigurationErrorMessage(status: SupabasePublicConfigStatus) {
  return supabaseConfigurationMessage(status);
}

export function logAuthDiagnostic(operation: AuthOperation, error: unknown) {
  if (process.env.NODE_ENV !== "development") return;
  const normalized = normalizePathzyError(error);
  console.warn("[PATHZY auth] Request failed", {
    operation,
    code: normalized.code ?? "unknown",
    originalType: normalized.originalType,
    network: isAuthNetworkFailure(error)
  });
}
