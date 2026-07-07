import { NextResponse } from "next/server";
import { updatePathzyBrain } from "@/lib/pathzy-brain/brain-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type OnboardingPayload = {
  current_status?: string;
  country?: string;
  city?: string;
  language?: "english" | "french";
  highest_qualification?: string;
  field_of_study?: string;
  currently_studying?: boolean;
  institution?: string;
  graduation_year?: string;
  dream_career?: string;
  preferred_industries?: string;
  desired_work_type?: "remote" | "hybrid" | "onsite";
  has_cv?: boolean;
  has_cover_letter?: boolean;
  has_linkedin?: boolean;
  applied_before?: boolean;
  interviewed_before?: boolean;
  has_certificates?: boolean;
  starting_from_zero?: boolean;
  completed_step?: number;
};

function normalizedStep(payload: OnboardingPayload) {
  const step = typeof payload.completed_step === "number" ? payload.completed_step : 1;
  return Math.max(1, Math.min(6, step));
}

function baseProfilePayload(user: { id: string; email?: string | null }, payload: OnboardingPayload) {
  return {
    user_id: user.id,
    email: user.email,
    current_status: payload.current_status || null,
    country: payload.country || null,
    city: payload.city || null,
    language: payload.language === "french" ? "french" : "english",
    onboarding_step: normalizedStep(payload),
    updated_at: new Date().toISOString()
  };
}

function profilePayload(user: { id: string; email?: string | null }, payload: OnboardingPayload, complete: boolean) {
  return {
    ...baseProfilePayload(user, payload),
    country: payload.country || null,
    city: payload.city || null,
    language: payload.language === "french" ? "french" : "english",
    education: payload.highest_qualification || null,
    current_status: payload.current_status || null,
    highest_qualification: payload.highest_qualification || null,
    field_of_study: payload.field_of_study || null,
    currently_studying: Boolean(payload.currently_studying),
    institution: payload.institution || null,
    graduation_year: payload.graduation_year || null,
    career_goal: payload.dream_career || null,
    preferred_path: payload.preferred_industries || null,
    has_cv: Boolean(payload.has_cv),
    has_cover_letter: Boolean(payload.has_cover_letter),
    has_linkedin: Boolean(payload.has_linkedin),
    has_applied_before: Boolean(payload.applied_before),
    has_interviewed_before: Boolean(payload.interviewed_before),
    has_certificates: Boolean(payload.has_certificates),
    starting_from_zero: Boolean(payload.starting_from_zero),
    onboarding_step: normalizedStep(payload),
    ...(complete ? { onboarding_completed: true, onboarding_step: 6 } : {})
  };
}

function partialProfilePayload(user: { id: string; email?: string | null }, payload: OnboardingPayload) {
  const completedStep = normalizedStep(payload);
  const base = baseProfilePayload(user, payload);

  if (completedStep <= 3) return base;
  if (completedStep === 4) {
    return {
      ...base,
      education: payload.highest_qualification || null,
      highest_qualification: payload.highest_qualification || null,
      field_of_study: payload.field_of_study || null,
      currently_studying: Boolean(payload.currently_studying),
      institution: payload.institution || null,
      graduation_year: payload.graduation_year || null
    };
  }
  if (completedStep === 5) {
    return {
      ...base,
      education: payload.highest_qualification || null,
      highest_qualification: payload.highest_qualification || null,
      field_of_study: payload.field_of_study || null,
      currently_studying: Boolean(payload.currently_studying),
      institution: payload.institution || null,
      graduation_year: payload.graduation_year || null,
      career_goal: payload.dream_career || null,
      preferred_path: payload.preferred_industries || null
    };
  }
  return profilePayload(user, payload, false);
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) return NextResponse.json({ error: "You must be logged in to save onboarding." }, { status: 401 });

  const payload = (await request.json()) as OnboardingPayload;
  const { error: profileError } = await supabase.from("user_profiles").upsert(partialProfilePayload(user, payload), { onConflict: "user_id" });

  if (profileError) {
    console.error("[onboarding:PATCH] Supabase profile save failed", {
      message: profileError.message,
      code: profileError.code,
      details: profileError.details,
      hint: profileError.hint,
      completed_step: payload.completed_step,
      user_id: user.id
    });
    return NextResponse.json({ error: "We could not save this step. Please check your connection and try again.", developerError: profileError.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) return NextResponse.json({ error: "You must be logged in to complete onboarding." }, { status: 401 });

  const payload = (await request.json()) as OnboardingPayload;
  const language = payload.language === "french" ? "french" : "english";

  const { error: profileError } = await supabase.from("user_profiles").upsert(profilePayload(user, { ...payload, language, completed_step: 6 }, true), { onConflict: "user_id" });

  if (profileError) {
    console.error("[onboarding:POST] Supabase profile completion failed", {
      message: profileError.message,
      code: profileError.code,
      details: profileError.details,
      hint: profileError.hint,
      user_id: user.id
    });
    return NextResponse.json({ error: "We could not save this step. Please check your connection and try again.", developerError: profileError.message }, { status: 500 });
  }

  await updatePathzyBrain(supabase, user.id, "Onboarding completed");

  return NextResponse.json({ ok: true, redirectTo: "/dashboard" });
}
