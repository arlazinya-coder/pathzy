import { NextResponse } from "next/server";
import { createSemanticJobUnderstanding, JobUnderstandingError, updateSemanticJobUnderstandingReview } from "@/lib/job-intelligence";
import type { JobUnderstandingReviewPatch } from "@/lib/job-intelligence";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function requireUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { error: NextResponse.json({ error: "PATHZY needs a quick setup before analysing jobs." }, { status: 503 }) };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: "Please log in to analyse this job." }, { status: 401 }) };
  }

  return { supabase, user };
}

function safeJsonError(error: unknown) {
  if (error instanceof JobUnderstandingError) {
    return NextResponse.json({ error: error.userMessage }, { status: error.status });
  }
  console.error("[job-understanding] failed", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "We could not analyse this job yet. Please review the imported job and try again." }, { status: 500 });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as { jobImportId?: string };
    if (!body.jobImportId) {
      return NextResponse.json({ error: "Job import id is required." }, { status: 400 });
    }
    const jobUnderstanding = await createSemanticJobUnderstanding(auth.supabase, auth.user.id, body.jobImportId);
    return NextResponse.json({ jobUnderstanding });
  } catch (caught) {
    return safeJsonError(caught);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as JobUnderstandingReviewPatch & { jobUnderstandingId?: string };
    if (!body.jobUnderstandingId) {
      return NextResponse.json({ error: "Job analysis id is required." }, { status: 400 });
    }
    const jobUnderstanding = await updateSemanticJobUnderstandingReview(auth.supabase, auth.user.id, body.jobUnderstandingId, body);
    return NextResponse.json({ jobUnderstanding });
  } catch (caught) {
    return safeJsonError(caught);
  }
}
