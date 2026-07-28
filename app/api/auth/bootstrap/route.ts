import { NextResponse } from "next/server";
import { ensureUserDefaults } from "@/lib/auth/bootstrap";
import { getPostAuthDestination } from "@/lib/navigation/auth-routing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "PATHZY auth is still being configured." }, { status: 503 });

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) return NextResponse.json({ error: "Please log in again to continue." }, { status: 401 });

  try {
    const payload = await request.json().catch(() => ({}));
    const defaults = await ensureUserDefaults(supabase, user);
    const redirectTo = await getPostAuthDestination(supabase, user, typeof payload?.redirectTo === "string" ? payload.redirectTo : null);
    return NextResponse.json({ ok: true, membership: defaults.membership, redirectTo });
  } catch (caught) {
    console.error("[auth-bootstrap] failed", caught);
    return NextResponse.json({ error: "PATHZY is still setting up your profile. Please refresh or try again." }, { status: 500 });
  }
}
