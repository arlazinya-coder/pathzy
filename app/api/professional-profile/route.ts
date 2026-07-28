import { NextResponse } from "next/server";
import {
  professionalIdentityRequiredChecks,
  professionalIdentityReviewHref,
  professionalIdentitySectionHref
} from "@/lib/navigation/auth-routing";
import { appRoutes } from "@/lib/navigation/routes";
import { legacyLanguageValue, normalizeLanguageCode, normalizeProfessionalDocumentLanguageChoice } from "@/lib/language/language-preferences";
import { updatePathzyBrain } from "@/lib/pathzy-brain/brain-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const availableSections = new Set([
  "profile",
  "photo",
  "profilePhoto",
  "name",
  "email",
  "phone",
  "personalInfo",
  "personal_information",
  "location",
  "nationality",
  "work_authorization",
  "currentStatus",
  "education",
  "fieldOfStudy",
  "careerDirection",
  "careerGoal",
  "career_goal",
  "professionalSummary",
  "professional_summary",
  "experience",
  "skills",
  "projects",
  "achievements",
  "certificates",
  "licences",
  "languages",
  "references",
  "portfolio",
  "social_profiles",
  "preferences",
  "employmentPreferences",
  "employment_preferences",
  "salary_expectations",
  "availability"
]);

type CleanValue = string | string[];
type CleanValues = Record<string, CleanValue>;
type ProfessionalProfileRequest = {
  action?: "finishSetup";
  section?: string;
  values?: Record<string, unknown>;
};

function cleanValues(values: unknown): CleanValues {
  if (!values || typeof values !== "object") return {};
  return Object.fromEntries(
    Object.entries(values as Record<string, unknown>).map(([key, value]) => {
      if (Array.isArray(value)) return [key, value.map((item) => String(item ?? "").trim()).filter(Boolean)];
      return [key, typeof value === "string" ? value.trim() : String(value ?? "").trim()];
    })
  );
}

function textValue(values: CleanValues, key: string) {
  const value = values[key];
  if (Array.isArray(value)) return value.join(", ");
  return value ?? "";
}

function listValue(values: CleanValues, key: string) {
  const value = values[key];
  if (Array.isArray(value)) return value;
  return value ? value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean) : [];
}

function firstListItem(values: CleanValues, key: string) {
  return listValue(values, key)[0] ?? "";
}

function baseProfilePayload(user: { id: string }) {
  return { id: user.id, user_id: user.id, updated_at: new Date().toISOString() };
}

function profilePayload(user: { id: string; email?: string | null }, section: string, values: CleanValues): Record<string, unknown> | null {
  const base = baseProfilePayload(user);

  if (section === "profile") {
    const currentStatus = textValue(values, "current_status");
    return { ...base, current_status: currentStatus || null, employment_status: currentStatus || null };
  }
  if (section === "name") return { ...base, full_name: textValue(values, "full_name") || null };
  if (section === "email") return { ...base, email: textValue(values, "email") || user.email || null };
  if (section === "phone") return { ...base, phone: textValue(values, "phone") || null };
  if (section === "personalInfo" || section === "personal_information") {
    const currentStatus = textValue(values, "current_status");
    return {
      ...base,
      full_name: textValue(values, "full_name") || null,
      email: textValue(values, "email") || user.email || null,
      phone: textValue(values, "phone") || null,
      current_status: currentStatus || null,
      employment_status: currentStatus || null
    };
  }
  if (section === "location") return { ...base, city: textValue(values, "city") || null, country: textValue(values, "country") || null };
  if (section === "currentStatus") {
    const currentStatus = textValue(values, "current_status");
    return { ...base, current_status: currentStatus || null, employment_status: currentStatus || null };
  }
  if (section === "education") {
    const education = firstListItem(values, "education") || textValue(values, "education");
    return {
      ...base,
      education: education || null,
      highest_qualification: education || null,
      field_of_study: textValue(values, "field_of_study") || null
    };
  }
  if (section === "fieldOfStudy") return { ...base, field_of_study: textValue(values, "field_of_study") || null };
  if (section === "careerDirection" || section === "careerGoal" || section === "career_goal") {
    const careerGoal = textValue(values, "career_goal");
    return { ...base, career_goal: careerGoal || null, preferred_path: careerGoal || null };
  }
  if (section === "preferences") return { ...base, language: legacyLanguageValue(normalizeLanguageCode(textValue(values, "interface_language"))) };
  if (section === "languages") return { ...base, language: listValue(values, "languages").join(", ") || textValue(values, "language") || null };
  if (section === "portfolio" || section === "social_profiles") {
    return {
      ...base,
      linkedin_url: textValue(values, "linkedin_url") || null,
      portfolio_url: textValue(values, "portfolio_url") || textValue(values, "website_url") || null
    };
  }
  return null;
}

function discoveryPayload(section: string, values: CleanValues) {
  if (section === "photo" || section === "profilePhoto") return { profile_photo: textValue(values, "profilePhoto") };
  if (section === "location") {
    return {
      nationality: textValue(values, "nationality"),
      work_authorization: textValue(values, "work_authorization")
    };
  }
  if (section === "nationality") return { nationality: textValue(values, "nationality") };
  if (section === "work_authorization") return { work_authorization: textValue(values, "work_authorization") };
  if (section === "professionalSummary" || section === "professional_summary") return { professional_summary: textValue(values, "professional_summary") };
  if (section === "education") return { education_history: listValue(values, "education") };
  if (section === "experience") return { experience_history: listValue(values, "experience"), personal_background: listValue(values, "experience").join("\n") };
  if (section === "skills") return { skills: listValue(values, "skills") };
  if (section === "projects") return { projects_history: listValue(values, "projects"), interests: listValue(values, "projects").join("\n") };
  if (section === "achievements") return { achievements_list: listValue(values, "achievements"), achievements: listValue(values, "achievements").join("\n") };
  if (section === "certificates") return { certificates_list: listValue(values, "certificates"), certifications: listValue(values, "certificates").join("\n") };
  if (section === "licences") return { licences: listValue(values, "licences") };
  if (section === "languages") return { languages: listValue(values, "languages") };
  if (section === "references") return { references_list: listValue(values, "references"), references: listValue(values, "references").join("\n") };
  if (section === "portfolio" || section === "social_profiles") {
    return {
      github_url: textValue(values, "github_url"),
      website_url: textValue(values, "website_url"),
      behance_url: textValue(values, "behance_url")
    };
  }
  if (section === "preferences") {
    return {
      interface_language: legacyLanguageValue(normalizeLanguageCode(textValue(values, "interface_language"))),
      professional_document_language: normalizeProfessionalDocumentLanguageChoice(textValue(values, "professional_document_language")),
      career_coach_intro_seen: textValue(values, "career_coach_intro_seen") === "true"
    };
  }
  if (section === "employmentPreferences" || section === "employment_preferences" || section === "salary_expectations" || section === "availability") {
    return {
      preferred_roles: listValue(values, "preferred_roles"),
      industries: listValue(values, "industries"),
      employment_type: textValue(values, "employment_type"),
      salary_expectations: textValue(values, "salary_expectations"),
      availability: textValue(values, "availability"),
      work_type: textValue(values, "work_type"),
      relocation: textValue(values, "relocation")
    };
  }
  return {};
}

async function updateDiscoveryAnswers(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, userId: string, answersPatch: Record<string, unknown>) {
  const { data: latest } = await supabase
    .from("discovery_responses")
    .select("id,answers,generated_result")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const answers = { ...((latest?.answers as Record<string, unknown> | null) ?? {}), ...answersPatch };

  if (latest?.id) {
    return supabase.from("discovery_responses").update({ answers }).eq("id", latest.id).eq("user_id", userId);
  }

  return supabase.from("discovery_responses").insert({
    user_id: userId,
    answers,
    generated_result: latest?.generated_result ?? {}
  });
}

async function finishProfessionalIdentitySetup(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, user: { id: string; email?: string | null }) {
  const [{ data: profile }, { data: discovery }] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("full_name,email,city,country,education,highest_qualification,field_of_study,current_status,career_goal,onboarding_completed")
      .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      .maybeSingle(),
    supabase
      .from("discovery_responses")
      .select("answers")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);
  const missing = professionalIdentityRequiredChecks(profile, discovery, user).filter((item) => !item.complete);

  if (missing.length) {
    return NextResponse.json(
      {
        error: "Some required Professional Identity details still need attention before Home.",
        missing,
        redirectTo: missing[0] ? professionalIdentitySectionHref(missing[0].section) : professionalIdentityReviewHref()
      },
      { status: 422 }
    );
  }

  const { error } = await supabase.from("user_profiles").upsert(
    {
      ...baseProfilePayload(user),
      email: profile?.email ?? user.email ?? null,
      onboarding_completed: true,
      onboarding_step: 16
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.warn("[professional-profile] finish setup failed", { code: error.code, message: error.message });
    return NextResponse.json({ error: "We could not finish setup yet. Your information is still saved, so please try again." }, { status: 500 });
  }

  await updatePathzyBrain(supabase, user.id, "Professional Identity setup completed").catch((brainError) => {
    console.warn("[professional-profile] completion refresh unavailable", brainError instanceof Error ? brainError.message : brainError);
  });

  await updateDiscoveryAnswers(supabase, user.id, {
    identity_review_completed: true,
    setup_finished: true,
    employment_diagnosis_status: "pending",
    professional_identity_completed_at: new Date().toISOString()
  }).catch((stateError) => {
    console.warn("[professional-profile] setup state compatibility save unavailable", stateError instanceof Error ? stateError.message : "unknown");
  });

  return NextResponse.json({ ok: true, redirectTo: `${appRoutes.discovery}?reason=setup-complete` });
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) return NextResponse.json({ error: "Please log in to update your professional profile." }, { status: 401 });

  const payload = (await request.json().catch(() => null)) as ProfessionalProfileRequest | null;

  if (payload?.action === "finishSetup") {
    return finishProfessionalIdentitySetup(supabase, user);
  }

  const section = payload?.section ?? "";
  const values = cleanValues(payload?.values);

  if (!availableSections.has(section)) {
    return NextResponse.json({ error: "This profile section is not available yet. Please stay on My Professional Profile and try another section." }, { status: 400 });
  }

  const profile = profilePayload(user, section, values);
  const answers = discoveryPayload(section, values);

  const profileResult = profile ? await supabase.from("user_profiles").upsert(profile, { onConflict: "user_id" }) : { error: null };
  if (profileResult.error) {
    console.error("[professional-profile] save failed", {
      section,
      user_id: user.id,
      message: profileResult.error.message,
      code: profileResult.error.code,
      details: profileResult.error.details,
      hint: profileResult.error.hint
    });
    return NextResponse.json({ error: "We could not save this information yet. Please check your connection and try again." }, { status: 500 });
  }

  if (section === "certificates") {
    const certificates = listValue(values, "certificates");
    const certificateResult = await supabase.from("user_profiles").upsert(
      {
        ...baseProfilePayload(user),
        has_certificates: certificates.length > 0
      },
      { onConflict: "user_id" }
    );
    if (certificateResult.error) {
      console.error("[professional-profile] certificate flag save failed", certificateResult.error);
      return NextResponse.json({ error: "We could not save this information yet. Please check your connection and try again." }, { status: 500 });
    }
  }

  if (Object.keys(answers).length) {
    const discoveryResult = await updateDiscoveryAnswers(supabase, user.id, answers);
    if (discoveryResult.error) {
      console.error("[professional-profile] discovery save failed", {
        section,
        user_id: user.id,
        message: discoveryResult.error.message,
        code: discoveryResult.error.code,
        details: discoveryResult.error.details,
        hint: discoveryResult.error.hint
      });
      return NextResponse.json({ error: "We could not save this information yet. Please check your connection and try again." }, { status: 500 });
    }
  }

  await updatePathzyBrain(supabase, user.id, `Professional profile ${section} updated`).catch((brainError) => {
    console.error("[professional-profile] readiness refresh failed", brainError);
  });

  return NextResponse.json({ ok: true, section, redirectTo: "/professional-identity" });
}
