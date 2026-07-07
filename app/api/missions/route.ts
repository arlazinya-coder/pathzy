import { NextResponse } from "next/server";
import { completeMission, ensureMissionState } from "@/lib/missions/engine";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function requireUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { error: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: "You must be logged in to update missions." }, { status: 401 }) };
  }

  return { supabase, user };
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const state = await ensureMissionState(auth.supabase, auth.user.id);
  return NextResponse.json(state);
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as { missionId?: string };
  if (!body.missionId) {
    return NextResponse.json({ error: "Mission id is required." }, { status: 400 });
  }

  try {
    const state = await completeMission(auth.supabase, auth.user.id, body.missionId);
    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not complete mission." }, { status: 500 });
  }
}
