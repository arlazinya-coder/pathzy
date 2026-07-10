import { NextResponse } from "next/server";
import { updatePathzyBrain } from "@/lib/pathzy-brain/brain-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ProfileSection =
  | "name"
  | "email"
  | "phone"
  | "location"
  | "education"
  | "field_of_study"
  | "current_status"
  | "career_goal"
  | "skills"
  | "languages"
  | "experience"
  | "projects"
  | "certifications"
  | "achievements"
  | "references";

const profileFieldMap: Partial<Record<ProfileSection, string[]>> = {
  name: ["full_name"],
  email: ["email"],
  phone: ["phone"],
  location: ["city", "country"],
  education: ["education"],
  field_of_study: ["field_of_study"],
  current_status: ["current_status", "employment_status"],
  career_goal: ["career_goal", "preferred_path"],
  languages: ["language"],
  certifications: ["has_certificates"]
};

const discoveryFieldMap: Partial<Record<ProfileSection, string[]>> = {
  skills: ["skills"],
  experience: ["personal_background"],
  projects: ["interests"],
  achievements: ["achievements"],
  references: ["references"]
};

const friendlyError = "We could not save this information yet. Please try again.";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: NextResponse.json({ error: "Something needs a quick setup. Please refresh and try again." }, { status: 503 }) };

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) return { error: NextResponse.json({ error: "Please log in to continue." }, { status: 401 }) };
  return { supabase, user };
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as { section?: ProfileSection; values?: Record<string, unknown> };
  if (!body.section || !body.values) return NextResponse.json({ error: "Choose the information you want to update." }, { status: 400 });

  try {
    const profileFields = profileFieldMap[body.section] ?? [];
    const profileUpdate: Record<string, unknown> = {
      id: auth.user.id,
      user_id: auth.user.id,
      updated_at: new Date().toISOString()
    };

    for (const field of profileFields) {
      if (field === "has_certificates") {
        profileUpdate[field] = clean(body.values[field]) ? true : false;
      } else {
        profileUpdate[field] = clean(body.values[field]);
      }
    }

    if (profileFields.length) {
      const { error } = await auth.supabase.from("user_profiles").upsert(profileUpdate, { onConflict: "user_id" });
      if (error) throw error;
    }

    const discoveryFields = discoveryFieldMap[body.section] ?? [];
    if (discoveryFields.length) {
      const { data: existing, error: readError } = await auth.supabase
        .from("discovery_responses")
        .select("id,answers,generated_result")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (readError) throw readError;

      const answers = {
        ...((existing?.answers as Record<string, unknown> | null) ?? {})
      };
      for (const field of discoveryFields) answers[field] = clean(body.values[field]);

      if (existing?.id) {
        const { error } = await auth.supabase
          .from("discovery_responses")
          .update({ answers })
          .eq("id", existing.id)
          .eq("user_id", auth.user.id);
        if (error) throw error;
      } else {
        const { error } = await auth.supabase.from("discovery_responses").insert({
          user_id: auth.user.id,
          answers,
          generated_result: {}
        });
        if (error) throw error;
      }
    }

    await updatePathzyBrain(auth.supabase, auth.user.id, "Professional profile updated");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[professional-profile] update failed", error);
    return NextResponse.json({ error: friendlyError }, { status: 500 });
  }
}
