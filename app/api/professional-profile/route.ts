import { NextResponse } from "next/server";
import {
  finishProfessionalIdentitySetupWrite,
  professionalIdentityWriteSections,
  saveEmploymentReadiness,
  saveProfessionalIdentityOnboardingProgress,
  saveProfessionalIdentitySection
} from "@/lib/professional-identity/professional-identity-write-service";
import { syncProfessionalIdentityAfterWrite } from "@/lib/professional-identity/professional-identity-sync";
import {
  professionalIdentityReviewHref,
  professionalIdentitySectionHref
} from "@/lib/navigation/auth-routing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ProfessionalProfileRequest = {
  action?: "finishSetup";
  mode?: "autosave" | "navigation";
  section?: string;
  values?: Record<string, unknown>;
};

function timedJson(body: unknown, startedAt: number, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  const duration = Math.max(0, Date.now() - startedAt);
  response.headers.set("Server-Timing", `pathzy_profile_save;dur=${duration}`);
  response.headers.set("X-Pathzy-Profile-Save-Duration-Ms", String(duration));
  return response;
}

function failedSaveResponse(startedAt: number, error?: string, status = 500) {
  return timedJson({ error: error ?? "We could not save this information yet. Please check your connection and try again." }, startedAt, { status });
}

export async function PATCH(request: Request) {
  const startedAt = Date.now();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return timedJson({ error: "Supabase is not configured." }, startedAt, { status: 503 });

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) return timedJson({ error: "Please log in to update your professional profile." }, startedAt, { status: 401 });

  const payload = (await request.json().catch(() => null)) as ProfessionalProfileRequest | null;

  if (payload?.action === "finishSetup") {
    const result = await finishProfessionalIdentitySetupWrite(supabase, user);
    if (!result.ok) {
      if (result.missing?.length) {
        return timedJson(
          {
            error: result.error,
            missing: result.missing,
            redirectTo: result.missing[0] ? professionalIdentitySectionHref(result.missing[0].section) : professionalIdentityReviewHref()
          },
          startedAt,
          { status: 422 }
        );
      }
      return failedSaveResponse(startedAt, result.error);
    }

    await syncProfessionalIdentityAfterWrite(supabase, user.id, {
      mode: "completion",
      reason: "Professional Identity setup completed"
    });
    return timedJson({ ok: true, redirectTo: result.redirectTo }, startedAt);
  }

  const section = payload?.section ?? "";

  if (!professionalIdentityWriteSections.has(section)) {
    return timedJson({ error: "This profile section is not available yet. Please stay on My Professional Profile and try another section." }, startedAt, { status: 400 });
  }

  if (section === "readiness_check") {
    const result = await saveEmploymentReadiness(supabase, user.id, payload?.values);
    if (!result.ok) return failedSaveResponse(startedAt, result.error);
    return timedJson(result, startedAt);
  }

  if (section === "onboarding_progress") {
    const result = await saveProfessionalIdentityOnboardingProgress(supabase, user.id, payload?.values);
    if (!result.ok) return failedSaveResponse(startedAt, result.error);
    return timedJson(result, startedAt);
  }

  const result = await saveProfessionalIdentitySection(supabase, user, section, payload?.values);
  if (result.error) {
    console.warn("[professional-profile] save failed", {
      section,
      code: result.error.code ?? "unknown",
      message: result.error.message ?? "unknown"
    });
    return failedSaveResponse(startedAt);
  }

  await syncProfessionalIdentityAfterWrite(supabase, user.id, {
    mode: payload?.mode ?? "navigation",
    reason: `Professional Identity ${section} updated`
  });

  return timedJson({ ok: true, section, redirectTo: "/professional-identity" }, startedAt);
}
