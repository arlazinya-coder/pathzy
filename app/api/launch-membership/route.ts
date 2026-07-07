import { NextResponse } from "next/server";
import { claimFounderMembership, getLaunchMembershipStats, getMembershipState } from "@/lib/launch/launch-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) return NextResponse.json({ error: "You must be logged in to join the launch." }, { status: 401 });

  const existing = await getMembershipState(supabase, user.id);
  if (existing.isFounder) {
    const membership = await claimFounderMembership(supabase, user.id);
    return NextResponse.json({ membership });
  }

  const stats = await getLaunchMembershipStats(supabase, user.id);
  if (stats.foundingTestersRemaining <= 0 && process.env.NODE_ENV === "production") {
    return NextResponse.json({ waitingList: true, error: "Founder spots are full. Join the waiting list." }, { status: 409 });
  }

  const membership = await claimFounderMembership(supabase, user.id);
  return NextResponse.json({ membership });
}
