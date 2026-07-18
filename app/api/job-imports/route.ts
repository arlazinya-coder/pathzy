import { NextResponse } from "next/server";
import { createJobImport, JobImportError, updateJobImportReview } from "@/lib/job-intelligence";
import type { CreateJobImportInput, JobImportPreliminaryDetails } from "@/lib/job-intelligence";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function requireUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { error: NextResponse.json({ error: "PATHZY needs a quick setup before importing jobs." }, { status: 503 }) };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: "Please log in to import a job advert." }, { status: 401 }) };
  }

  return { supabase, user };
}

function safeJsonError(error: unknown) {
  if (error instanceof JobImportError) {
    return NextResponse.json({ error: error.userMessage }, { status: error.status });
  }
  console.error("[job-import] failed", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "We could not inspect this job advert. Please try again or paste the job description." }, { status: 500 });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as CreateJobImportInput;
    const record = await createJobImport(auth.supabase, auth.user.id, body);
    return NextResponse.json({ jobImport: record });
  } catch (caught) {
    return safeJsonError(caught);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as {
      jobImportId?: string;
      corrections?: Partial<JobImportPreliminaryDetails>;
      markReady?: boolean;
    };
    if (!body.jobImportId) {
      return NextResponse.json({ error: "Job import id is required." }, { status: 400 });
    }
    const record = await updateJobImportReview(auth.supabase, auth.user.id, body.jobImportId, body.corrections ?? {}, Boolean(body.markReady));
    return NextResponse.json({ jobImport: record });
  } catch (caught) {
    return safeJsonError(caught);
  }
}
