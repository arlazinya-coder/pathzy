import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) return { error: NextResponse.json({ error: "You must be logged in to save interview prep." }, { status: 401 }) };
  return { supabase, user };
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as {
    role?: string;
    company?: string;
    language?: "english" | "french";
    jobDescription?: string;
    content?: string;
  };

  if (!body.role?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "Role and prep content are required." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("interview_preps")
    .insert({
      user_id: auth.user.id,
      role: body.role.trim(),
      company: body.company?.trim() || null,
      language: body.language ?? "english",
      job_description: body.jobDescription?.trim() || null,
      content: body.content,
      updated_at: new Date().toISOString()
    })
    .select("*")
    .single();

  if (error) {
    console.error("[interview-prep] insert failed", error);
    return NextResponse.json({ error: "We could not complete this action yet. Your progress is safe. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ prep: data });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as { id?: string; completed?: boolean; content?: string };
  if (!body.id) return NextResponse.json({ error: "Interview prep id is required." }, { status: 400 });

  const update: Record<string, string | boolean | null> = { updated_at: new Date().toISOString() };
  if (typeof body.content === "string") update.content = body.content;
  if (typeof body.completed === "boolean") {
    update.completed = body.completed;
    update.completed_at = body.completed ? new Date().toISOString() : null;
  }

  const { data, error } = await auth.supabase
    .from("interview_preps")
    .update(update)
    .eq("id", body.id)
    .eq("user_id", auth.user.id)
    .select("*")
    .single();

  if (error) {
    console.error("[interview-prep] update failed", error);
    return NextResponse.json({ error: "We could not complete this action yet. Your progress is safe. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ prep: data });
}
