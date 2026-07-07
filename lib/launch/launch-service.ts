import type { SupabaseClient } from "@supabase/supabase-js";

export type LaunchPhase = "founding_tester" | "early_adopter" | "public_user";

export type LaunchMembership = {
  id?: string;
  user_id: string;
  launch_phase: LaunchPhase;
  member_number: number;
  badge: "Founding Tester" | "Early Adopter" | "Public Member";
  access_level: "free" | "starter" | "pro" | "premium" | "enterprise";
  price_lock: boolean;
  price_lock_amount: number | null;
  price_lock_active: boolean;
  free_access_until: string | null;
  subscription_status: string;
  joined_at?: string;
};

export type LaunchMembershipStats = {
  foundingTestersClaimed: number;
  foundingTestersRemaining: number;
  earlyAdoptersClaimed: number;
  earlyAdoptersRemaining: number;
  totalLaunchMembers: number;
};

export type MembershipState = {
  userId: string;
  isFounder: boolean;
  isPremium: boolean;
  accessLevel: "free" | "premium";
  badge: "Founding Tester" | "PATHZY Member";
  label: string;
  memberNumber: number | null;
  premiumUntil: string | null;
  joinedAt: string | null;
};

const FOUNDING_TESTER_LIMIT = 20;
const EARLY_ADOPTER_LIMIT = 100;

function normalizeFounderNumber(value: unknown) {
  if (typeof value !== "number" || value <= 0) return null;
  if (value <= FOUNDING_TESTER_LIMIT) return value;
  return ((value - 1) % FOUNDING_TESTER_LIMIT) + 1;
}

function premiumExpiry() {
  return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
}

function labelFor(state: Pick<MembershipState, "isFounder" | "isPremium" | "memberNumber">) {
  if (state.isFounder) return state.memberNumber ? `Founding Tester #${state.memberNumber}` : "Founding Tester";
  if (state.isPremium) return "Premium";
  return "PATHZY Member";
}

function normalizeMembership(profile: any, userId: string): MembershipState {
  const isFounder = Boolean(profile?.founder || profile?.membership_type === "Founding Tester");
  const isPremium = Boolean(profile?.premium || isFounder);
  const memberNumber = normalizeFounderNumber(profile?.founder_member_number);
  const state: MembershipState = {
    userId,
    isFounder,
    isPremium,
    accessLevel: isPremium ? "premium" : "free",
    badge: isFounder ? "Founding Tester" : "PATHZY Member",
    label: "PATHZY Member",
    memberNumber,
    premiumUntil: profile?.premium_expires_at ?? null,
    joinedAt: profile?.created_at ?? null
  };

  return { ...state, label: labelFor(state) };
}

export function membershipToLaunchMembership(state: MembershipState): LaunchMembership | null {
  if (!state.isFounder) return null;
  return {
    user_id: state.userId,
    launch_phase: "founding_tester",
    member_number: state.memberNumber ?? 0,
    badge: "Founding Tester",
    access_level: state.isPremium ? "premium" : "free",
    price_lock: false,
    price_lock_amount: null,
    price_lock_active: false,
    free_access_until: state.premiumUntil,
    subscription_status: "active",
    joined_at: state.joinedAt ?? undefined
  };
}

export function launchBadgeLabel(membership: LaunchMembership | MembershipState | null) {
  if (!membership) return "PATHZY Member";
  if ("label" in membership) return membership.label;
  if (membership.launch_phase === "public_user") return "PATHZY Member";
  return `${membership.badge} #${membership.member_number}`;
}

export async function getMembershipState(supabase: SupabaseClient, userId: string): Promise<MembershipState> {
  const { data } = await supabase
    .from("user_profiles")
    .select("founder,premium,founder_member_number,premium_expires_at,membership_type,created_at")
    .or(`user_id.eq.${userId},id.eq.${userId}`)
    .maybeSingle();

  return normalizeMembership(data, userId);
}

export async function claimFounderMembership(supabase: SupabaseClient, userId: string): Promise<MembershipState> {
  const current = await getMembershipState(supabase, userId);
  const { count } = await supabase.from("user_profiles").select("id", { count: "exact", head: true }).eq("founder", true);
  const memberNumber = current.memberNumber ?? Math.min(FOUNDING_TESTER_LIMIT, (count ?? 0) + 1);
  const premiumUntil = current.premiumUntil ?? premiumExpiry();

  await supabase
    .from("user_profiles")
    .upsert(
      {
        id: userId,
        user_id: userId,
        founder: true,
        premium: true,
        founder_member_number: memberNumber,
        premium_expires_at: premiumUntil,
        membership_type: "Founding Tester",
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );

  return {
    userId,
    isFounder: true,
    isPremium: true,
    accessLevel: "premium",
    badge: "Founding Tester",
    label: `Founding Tester #${memberNumber}`,
    memberNumber,
    premiumUntil,
    joinedAt: current.joinedAt
  };
}

export async function claimFounderProfileFallback(supabase: SupabaseClient, userId: string) {
  return membershipToLaunchMembership(await claimFounderMembership(supabase, userId))!;
}

export async function getLaunchMembership(supabase: SupabaseClient, userId: string): Promise<LaunchMembership | null> {
  return membershipToLaunchMembership(await getMembershipState(supabase, userId));
}

export async function getOrCreateLaunchMembership(supabase: SupabaseClient, userId: string): Promise<LaunchMembership | null> {
  return getLaunchMembership(supabase, userId);
}

export async function getLaunchMembershipStats(supabase: SupabaseClient, currentUserId?: string): Promise<LaunchMembershipStats> {
  const { count } = await supabase.from("user_profiles").select("id", { count: "exact", head: true }).eq("founder", true);
  const currentState = currentUserId ? await getMembershipState(supabase, currentUserId) : null;
  const claimedFromCount = count ?? 0;
  const claimedFromCurrentFounder = currentState?.isFounder ? Math.max(claimedFromCount, currentState.memberNumber ?? 1) : claimedFromCount;
  const foundingTestersClaimed = claimedFromCurrentFounder;

  return {
    foundingTestersClaimed,
    foundingTestersRemaining: Math.max(0, FOUNDING_TESTER_LIMIT - foundingTestersClaimed),
    earlyAdoptersClaimed: 0,
    earlyAdoptersRemaining: EARLY_ADOPTER_LIMIT,
    totalLaunchMembers: foundingTestersClaimed
  };
}

export async function getCurrentUserAccess(supabase: SupabaseClient, userId: string) {
  const membership = await getMembershipState(supabase, userId);
  return {
    membership: membershipToLaunchMembership(membership),
    plan: membership.accessLevel,
    isPremium: membership.isPremium,
    badge: membership.label,
    state: membership
  };
}

export async function isPremiumUser(supabase: SupabaseClient, userId: string) {
  const access = await getCurrentUserAccess(supabase, userId);
  return access.isPremium;
}
