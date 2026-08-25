import type { SupabaseClient } from "@supabase/supabase-js";

export type AccessLevel = "founder" | "beta_full" | "trial" | "paid_pro" | "paid_premium" | "expired" | "free";
export type EntitlementStatus = "active" | "expired" | "revoked" | "none";
export type EntitlementFeature =
  | "professional_identity"
  | "document_preview"
  | "document_export"
  | "document_upload"
  | "premium_templates"
  | "mentor"
  | "opportunities"
  | "application_tracker"
  | "admin_beta_management";

export type UserEntitlements = {
  userId: string;
  accessLevel: AccessLevel;
  status: EntitlementStatus;
  isFounder: boolean;
  isAdmin: boolean;
  isBetaFull: boolean;
  isTrial: boolean;
  isPaid: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  badge: "FOUNDING TESTER" | "PATHZY Member";
  message: string | null;
};

type EntitlementRow = {
  access_level?: string | null;
  status?: string | null;
  starts_at?: string | null;
  expires_at?: string | null;
  revoked_at?: string | null;
};

function nowTime() {
  return Date.now();
}

function isPast(value?: string | null) {
  return Boolean(value && new Date(value).getTime() < nowTime());
}

function isBeforeStart(value?: string | null) {
  return Boolean(value && new Date(value).getTime() > nowTime());
}

function normalizeAccessLevel(value?: string | null): AccessLevel {
  if (value === "founder" || value === "beta_full" || value === "trial" || value === "paid_pro" || value === "paid_premium" || value === "expired") return value;
  if (value === "pro") return "paid_pro";
  if (value === "premium" || value === "enterprise" || value === "starter") return "paid_premium";
  return "free";
}

function entitlementActive(row: EntitlementRow | null | undefined) {
  if (!row || row.revoked_at || row.status === "revoked") return false;
  if (isBeforeStart(row.starts_at)) return false;
  if (isPast(row.expires_at)) return false;
  return row.status === "active";
}

function chooseBestLevel(levels: AccessLevel[]) {
  const priority: AccessLevel[] = ["founder", "beta_full", "paid_premium", "paid_pro", "trial", "expired", "free"];
  return priority.find((level) => levels.includes(level)) ?? "free";
}

function profileLevels(profile: any): AccessLevel[] {
  const levels: AccessLevel[] = [];
  if (profile?.founder || profile?.membership_type === "Founding Tester" || profile?.membership_type === "Admin") levels.push("founder");
  const profilePaid = profile?.premium || ["starter", "pro", "premium", "enterprise"].includes(profile?.plan) || ["starter", "pro", "premium", "enterprise"].includes(profile?.premium_status);
  if (profilePaid && !isPast(profile?.premium_expires_at)) {
    levels.push(profile?.plan === "pro" || profile?.premium_status === "pro" ? "paid_pro" : "paid_premium");
  }
  return levels;
}

function fromSources(userId: string, profile: any, rows: EntitlementRow[]): UserEntitlements {
  const activeRows = rows.filter(entitlementActive);
  const activeLevels = activeRows.map((row) => normalizeAccessLevel(row.access_level));
  const hasExpiredOrRevoked = rows.some((row) => row.status === "revoked" || row.revoked_at || isPast(row.expires_at));
  const accessLevel = chooseBestLevel([...profileLevels(profile), ...activeLevels, hasExpiredOrRevoked ? "expired" : "free"]);
  const bestRow = activeRows.find((row) => normalizeAccessLevel(row.access_level) === accessLevel) ?? activeRows[0] ?? rows[0] ?? null;
  const isFounder = accessLevel === "founder";
  const isBetaFull = accessLevel === "beta_full";
  const isAdmin = Boolean(profile?.is_admin || profile?.membership_type === "Admin" || activeRows.some((row) => normalizeAccessLevel(row.access_level) === "founder"));
  const isPaid = accessLevel === "paid_pro" || accessLevel === "paid_premium";
  const isTrial = accessLevel === "trial";
  const status: EntitlementStatus = accessLevel === "expired" ? "expired" : accessLevel === "free" ? "none" : "active";

  return {
    userId,
    accessLevel,
    status,
    isFounder,
    isAdmin,
    isBetaFull,
    isTrial,
    isPaid,
    startsAt: bestRow?.starts_at ?? null,
    expiresAt: isFounder ? null : bestRow?.expires_at ?? profile?.premium_expires_at ?? null,
    badge: isFounder || isBetaFull ? "FOUNDING TESTER" : "PATHZY Member",
    message: isFounder || isBetaFull ? "You have full access to PATHZY during our private beta." : accessLevel === "expired" ? "Your private beta access has ended. Your documents are safe, and premium actions now follow the current pricing model." : null
  };
}

export function canAccessFeature(entitlements: UserEntitlements | null | undefined, feature: EntitlementFeature): boolean {
  if (!entitlements) return false;
  if (entitlements.isAdmin || entitlements.isFounder) return true;
  if (feature === "admin_beta_management") return false;
  if (feature === "professional_identity" || feature === "document_preview" || feature === "document_upload" || feature === "document_export" || feature === "application_tracker" || feature === "opportunities") return true;
  if (entitlements.status !== "active") return false;
  if (entitlements.isBetaFull || entitlements.isTrial || entitlements.isPaid) return true;
  return false;
}

export async function getUserEntitlements(supabase: SupabaseClient, userId: string): Promise<UserEntitlements> {
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("founder,premium,premium_expires_at,membership_type,plan,premium_status,is_admin")
    .or(`user_id.eq.${userId},id.eq.${userId}`)
    .maybeSingle();

  const { data: rows, error } = await supabase
    .from("user_entitlements")
    .select("access_level,status,starts_at,expires_at,revoked_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return fromSources(userId, profile, []);
  await supabase.rpc("touch_user_entitlements_last_seen").then(() => null);
  return fromSources(userId, profile, rows ?? []);
}

export async function userCanAccessFeature(supabase: SupabaseClient, userId: string, feature: EntitlementFeature) {
  return canAccessFeature(await getUserEntitlements(supabase, userId), feature);
}
