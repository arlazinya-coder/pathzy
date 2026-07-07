import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ApplicationPayload = {
  id?: string;
  company_name?: string;
  role?: string;
  opportunity_type?: string;
  status?: "saved" | "applied" | "interview" | "rejected" | "offer" | "accepted";
  application_date?: string | null;
  follow_up_date?: string | null;
  notes?: string;
};

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) return { error: NextResponse.json({ error: "You must be logged in to track applications." }, { status: 401 }) };
  return { supabase, user };
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as ApplicationPayload;
  const company = body.company_name?.trim();
  const role = body.role?.trim();

  if (!company || !role) {
    return NextResponse.json({ error: "Company name and role are required." }, { status: 400 });
  }

const row = {
    user_id: auth.user.id,
    company_name: company,
    role,
    opportunity_type: body.opportunity_type?.trim() || "job",
    status: body.status ?? "saved",
    application_date: body.application_date || null,
    follow_up_date: body.follow_up_date || null,
    notes: body.notes?.trim() ?? "",
    updated_at: new Date().toISOString()
  };

  const { data, error } = await auth.supabase.from("employment_applications").insert(row).select("*").single();
  if (error) {
    console.error("[employment-tracker] insert failed", error);
    return NextResponse.json({ error: "We could not complete this action yet. Your progress is safe. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ application: data });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as ApplicationPayload;
  if (!body.id) return NextResponse.json({ error: "Application id is required." }, { status: 400 });

  const update = {
    company_name: body.company_name?.trim(),
    role: body.role?.trim(),
    opportunity_type: body.opportunity_type?.trim(),
    status: body.status,
    application_date: body.application_date || null,
    follow_up_date: body.follow_up_date || null,
    notes: body.notes?.trim(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await auth.supabase
    .from("employment_applications")
    .update(update)
    .eq("id", body.id)
    .eq("user_id", auth.user.id)
    .select("*")
    .single();

  if (error) {
    console.error("[employment-tracker] update failed", error);
    return NextResponse.json({ error: "We could not complete this action yet. Your progress is safe. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ application: data });
}

export async function DELETE(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Application id is required." }, { status: 400 });

  const { error } = await auth.supabase.from("employment_applications").delete().eq("id", id).eq("user_id", auth.user.id);
  if (error) {
    console.error("[employment-tracker] delete failed", error);
    return NextResponse.json({ error: "We could not complete this action yet. Your progress is safe. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
