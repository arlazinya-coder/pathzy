import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type OpportunityPatch = {
  opportunityId?: string;
  saved?: boolean;
  applied?: boolean;
  completed?: boolean;
  hidden?: boolean;
};

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
    return { error: NextResponse.json({ error: "You must be logged in to update opportunities." }, { status: 401 }) };
  }

  return { supabase, user };
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as OpportunityPatch;
  const opportunityId = body.opportunityId?.trim();

  if (!opportunityId) {
    return NextResponse.json({ error: "Opportunity id is required." }, { status: 400 });
  }

  const update = {
    user_id: auth.user.id,
    opportunity_id: opportunityId,
    saved: Boolean(body.saved),
    applied: Boolean(body.applied),
    completed: Boolean(body.completed),
    hidden: Boolean(body.hidden),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await auth.supabase
    .from("user_opportunity_actions")
    .upsert(update, { onConflict: "user_id,opportunity_id" })
    .select("opportunity_id,saved,applied,completed,hidden")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ action: data });
}
