export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type SupabasePublicConfigStatus = {
  configured: boolean;
  url: "present" | "missing" | "malformed";
  anonKey: "present" | "missing" | "malformed";
  loadedByServer: boolean;
  loadedByClient: boolean;
};

function hasValidSupabaseUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

function hasValidPublicAnonKey(value: string | undefined) {
  if (!value) return false;
  return value.startsWith("eyJ") || value.startsWith("sb_publishable_");
}

export function getSupabasePublicConfigStatus(input: { url?: string; anonKey?: string } = {}): SupabasePublicConfigStatus {
  const url = Object.prototype.hasOwnProperty.call(input, "url") ? input.url : supabaseUrl;
  const anonKey = Object.prototype.hasOwnProperty.call(input, "anonKey") ? input.anonKey : supabaseAnonKey;
  const urlStatus = !url ? "missing" : hasValidSupabaseUrl(url) ? "present" : "malformed";
  const anonKeyStatus = !anonKey ? "missing" : hasValidPublicAnonKey(anonKey) ? "present" : "malformed";

  return {
    configured: urlStatus === "present" && anonKeyStatus === "present",
    url: urlStatus,
    anonKey: anonKeyStatus,
    loadedByServer: typeof window === "undefined",
    loadedByClient: typeof window !== "undefined"
  };
}

export function supabaseConfigurationMessage(status = getSupabasePublicConfigStatus()) {
  if (status.configured) return "";
  return "PATHZY authentication is not configured correctly for this environment.";
}

export function isSupabaseConfigured() {
  return getSupabasePublicConfigStatus().configured;
}
