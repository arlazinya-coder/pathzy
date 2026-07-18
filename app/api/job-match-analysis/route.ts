import { NextResponse } from "next/server";
import { createProfileJobMatchAnalysis, ProfileJobMatchError, refreshProfileJobMatchAnalysis } from "@/lib/job-intelligence";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function requireUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { error: NextResponse.json({ error: "PATHZY needs a quick setup before matching this job." }, { status: 503 }) };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: "Please log in to match this job." }, { status: 401 }) };
  }

  return { supabase, user };
}

function safeJsonError(error: unknown) {
  if (error instanceof ProfileJobMatchError) {
    return NextResponse.json({ error: error.userMessage }, { status: error.status });
  }
  console.error("[job-match-analysis] failed", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "We could not match this job yet. Please confirm the job analysis and try again." }, { status: 500 });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as { jobUnderstandingId?: string };
    if (!body.jobUnderstandingId) {
      return NextResponse.json({ error: "Job analysis id is required." }, { status: 400 });
    }
    const jobMatchAnalysis = await createProfileJobMatchAnalysis(auth.supabase, auth.user.id, body.jobUnderstandingId);
    return NextResponse.json({ jobMatchAnalysis });
  } catch (caught) {
    return safeJsonError(caught);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as { analysisId?: string; action?: "refresh" };
    if (!body.analysisId) {
      return NextResponse.json({ error: "Match analysis id is required." }, { status: 400 });
    }
    if (body.action !== "refresh") {
      return NextResponse.json({ error: "Unsupported match action." }, { status: 400 });
    }
    const jobMatchAnalysis = await refreshProfileJobMatchAnalysis(auth.supabase, auth.user.id, body.analysisId);
    return NextResponse.json({ jobMatchAnalysis });
  } catch (caught) {
    return safeJsonError(caught);
  }
}
