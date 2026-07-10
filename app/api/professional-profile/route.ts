import { NextResponse } from "next/server";
import { updatePathzyBrain } from "@/lib/pathzy-brain/brain-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const profileSections = new Set(["name", "email", "phone", "location", "currentStatus", "education", "fieldOfStudy", "careerDirection", "languages"]);
const discoverySections = new Set(["experience", "skills", "projects", "certificates", "achievements", "references"]);

function cleanValues(values: unknown) {
  if (!values || typeof values !== "object") return {};
  return Object.fromEntries(
    Object.entries(values as Record<string, unknown>).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
  ) as Record<string, string>;
}

function profilePayload(user: { id: string; email?: string | null }, section: string, values: Record<string, string>) {
  const now = new Date().toISOString();
  const base = { id: user.id, user_id: user.id, updated_at: now };

  if (section === "name") return { ...base, full_name: values.full_name || null };
  if (section === "email") return { ...base, email: values.email || user.email || null };
  if (section === "phone") return { ...base, phone: values.phone || null };
  if (section === "location") return { ...base, city: values.city || null, country: values.country || null };
  if (section === "currentStatus") return { ...base, current_status: values.current_status || null, employment_status: values.current_status || null };
  if (section === "education") return { ...base, education: values.education || null, highest_qualification: values.education || null };
  if (section === "fieldOfStudy") return { ...base, field_of_study: values.field_of_study || null };
  if (section === "careerDirection") return { ...base, career_goal: values.career_goal || null, preferred_path: values.career_goal || null };
  if (section === "languages") return { ...base, language: values.language || null };

  return base;
}

function discoveryKey(section: string) {
  if (section === "experience") return "personal_background";
  if (section === "projects") return "interests";
  if (section === "certificates") return "certifications";
  return section;
}

async function updateDiscoveryAnswers(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, userId: string, section: string, values: Record<string, string>) {
  const { data: latest } = await supabase
    .from("discovery_responses")
    .select("id,answers,generated_result")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const key = discoveryKey(section);
  const value = values[key] ?? Object.values(values)[0] ?? "";
  const answers = { ...((latest?.answers as Record<string, unknown> | null) ?? {}), [key]: value };

  if (section === "certificates") {
    await supabase.from("user_profiles").upsert(
      {
        id: userId,
        user_id: userId,
        has_certificates: Boolean(value.trim()),
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );
  }

  if (latest?.id) {
    return supabase.from("discovery_responses").update({ answers }).eq("id", latest.id).eq("user_id", userId);
  }

  return supabase.from("discovery_responses").insert({
    user_id: userId,
    answers,
    generated_result: latest?.generated_result ?? {}
  });
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) return NextResponse.json({ error: "Please log in to update your professional profile." }, { status: 401 });

  const payload = (await request.json().catch(() => null)) as { section?: string; values?: Record<string, string> } | null;
  const section = payload?.section ?? "";
  const values = cleanValues(payload?.values);

  if (!profileSections.has(section) && !discoverySections.has(section)) {
    return NextResponse.json({ error: "This profile section is not available yet. Please stay on My Professional Profile and try another section." }, { status: 400 });
  }

  const result = profileSections.has(section)
    ? await supabase.from("user_profiles").upsert(profilePayload(user, section, values), { onConflict: "user_id" })
    : await updateDiscoveryAnswers(supabase, user.id, section, values);

  if (result.error) {
    console.error("[professional-profile] save failed", {
      section,
      user_id: user.id,
      message: result.error.message,
      code: result.error.code,
      details: result.error.details,
      hint: result.error.hint
    });
    return NextResponse.json({ error: "We could not save this information yet. Please check your connection and try again." }, { status: 500 });
  }

  await updatePathzyBrain(supabase, user.id, `Professional profile ${section} updated`).catch((brainError) => {
    console.error("[professional-profile] readiness refresh failed", brainError);
  });

  return NextResponse.json({ ok: true, section, redirectTo: "/professional-identity" });
}
