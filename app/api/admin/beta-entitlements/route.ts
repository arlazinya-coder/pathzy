import { NextResponse } from "next/server";
import { canAccessFeature, getUserEntitlements } from "@/lib/access/entitlements";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type BetaAction = "invite" | "grant" | "extend" | "revoke";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: NextResponse.json({ error: "Server configuration is not ready." }, { status: 503 }) };

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { error: NextResponse.json({ error: "Please log in to continue." }, { status: 401 }) };

  const entitlements = await getUserEntitlements(supabase, user.id);
  if (!canAccessFeature(entitlements, "admin_beta_management")) {
    return { error: NextResponse.json({ error: "You do not have permission to manage beta access." }, { status: 403 }) };
  }

  return { supabase, user };
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" && value.includes("@") ? value.trim().toLowerCase() : null;
}

function normalizeDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function defaultBetaExpiry() {
  return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { data: entitlements, error } = await auth.supabase
    .from("user_entitlements")
    .select("id,user_id,email,access_level,status,starts_at,expires_at,revoked_at,last_seen_at,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin] beta entitlement list failed", error);
    return NextResponse.json({ error: "Could not load beta testers." }, { status: 500 });
  }

  const userIds = Array.from(new Set((entitlements ?? []).map((row) => row.user_id).filter(Boolean)));
  const [{ data: profiles }, { data: professionalIdentity }] = await Promise.all([
    userIds.length
      ? auth.supabase.from("user_profiles").select("user_id,full_name,email,onboarding_completed,country,career_goal").in("user_id", userIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? auth.supabase.from("professional_identity").select("user_id,cv_status,cover_letter_status,linkedin_status,career_passport_status").in("user_id", userIds)
      : Promise.resolve({ data: [] })
  ]);

  const profilesByUser = new Map((profiles ?? []).map((row: any) => [row.user_id, row]));
  const identityByUser = new Map((professionalIdentity ?? []).map((row: any) => [row.user_id, row]));

  return NextResponse.json({
    testers: (entitlements ?? []).map((row: any) => {
      const profile = profilesByUser.get(row.user_id);
      const identity = identityByUser.get(row.user_id);
      return {
        id: row.id,
        userId: row.user_id,
        email: row.email ?? profile?.email ?? null,
        name: profile?.full_name ?? null,
        accessLevel: row.access_level,
        status: row.status,
        startsAt: row.starts_at,
        expiresAt: row.expires_at,
        revokedAt: row.revoked_at,
        lastLogin: row.last_seen_at,
        completion: {
          onboarding: Boolean(profile?.onboarding_completed),
          cv: identity?.cv_status ?? "not_started",
          coverLetter: identity?.cover_letter_status ?? "not_started",
          linkedin: identity?.linkedin_status ?? "not_started",
          careerPassport: identity?.career_passport_status ?? "not_started"
        }
      };
    })
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as {
    action?: BetaAction;
    entitlementId?: string;
    userId?: string;
    email?: string;
    startsAt?: string;
    expiresAt?: string;
    notes?: string;
  };

  const action = body.action;
  const email = normalizeEmail(body.email);
  const expiresAt = normalizeDate(body.expiresAt) ?? defaultBetaExpiry();
  const startsAt = normalizeDate(body.startsAt) ?? new Date().toISOString();

  if (action === "revoke") {
    if (!body.entitlementId) return NextResponse.json({ error: "Entitlement id is required." }, { status: 400 });
    const { error } = await auth.supabase
      .from("user_entitlements")
      .update({ status: "revoked", revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", body.entitlementId);
    if (error) return NextResponse.json({ error: "Could not revoke beta access." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "extend") {
    if (!body.entitlementId) return NextResponse.json({ error: "Entitlement id is required." }, { status: 400 });
    const { data, error } = await auth.supabase
      .from("user_entitlements")
      .update({ status: "active", expires_at: expiresAt, revoked_at: null, updated_at: new Date().toISOString() })
      .eq("id", body.entitlementId)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: "Could not extend beta access." }, { status: 500 });
    return NextResponse.json({ entitlement: data });
  }

  if (action !== "invite" && action !== "grant") {
    return NextResponse.json({ error: "Supported actions are invite, grant, extend, and revoke." }, { status: 400 });
  }

  if (action === "grant" && !body.userId) return NextResponse.json({ error: "User id is required to grant beta access." }, { status: 400 });
  if (action === "invite" && !email) return NextResponse.json({ error: "Email is required to invite a beta tester." }, { status: 400 });

  const { data, error } = await auth.supabase
    .from("user_entitlements")
    .insert({
      user_id: body.userId ?? null,
      email,
      access_level: "beta_full",
      status: "active",
      starts_at: startsAt,
      expires_at: expiresAt,
      granted_by: auth.user.id,
      notes: body.notes ?? null
    })
    .select("*")
    .single();

  if (error) {
    console.error("[admin] beta entitlement save failed", error);
    return NextResponse.json({ error: "Could not save beta access." }, { status: 500 });
  }

  return NextResponse.json({ entitlement: data });
}
