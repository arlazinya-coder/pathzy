import { NextResponse } from "next/server";
import { generateOpenAIRoadmap } from "@/lib/discovery/openai-generator";
import { discoveryAnswerKeys, hasCompleteDiscoveryAnswers } from "@/lib/discovery/discovery-answer-state";
import type { DiscoveryAnswers } from "@/lib/discovery/types";
import { getEmploymentDiagnosisSteps } from "@/lib/language/pathzy-i18n";
import { normalizeLanguageCode } from "@/lib/language/language-preferences";
import { appRoutes } from "@/lib/navigation/routes";
import { saveCompletedEmploymentDiagnosis } from "@/lib/professional-identity/professional-identity-write-service";
import { syncProfessionalIdentityAfterWrite } from "@/lib/professional-identity/professional-identity-sync";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const answerKeys: ReadonlyArray<keyof DiscoveryAnswers> = discoveryAnswerKeys;

const roadmapError = "We could not complete this action yet. Your progress is safe. Please try again.";

function isDiscoveryAnswers(value: unknown): value is DiscoveryAnswers {
  return answerKeys.length > 0 && hasCompleteDiscoveryAnswers(value);
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const language = normalizeLanguageCode(url.searchParams.get("language"));
  const questions = getEmploymentDiagnosisSteps(language);
  return NextResponse.json({ questions, total: questions.length });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Something needs a quick setup. Please refresh and try again." }, { status: 503 });
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Please log in to continue your journey." }, { status: 401 });
  }

  const body = (await request.json()) as { answers?: unknown };
  if (!isDiscoveryAnswers(body.answers)) {
    return NextResponse.json({ error: "Please complete Discovery before creating your career plan." }, { status: 400 });
  }

  try {
    const generatedRoadmap = await generateOpenAIRoadmap(body.answers);
    const { error: saveError } = await saveCompletedEmploymentDiagnosis(supabase, user.id, body.answers, generatedRoadmap);

    if (saveError) {
      console.error("[roadmap] save failed", saveError);
      return NextResponse.json({ error: roadmapError }, { status: 500 });
    }

    await syncProfessionalIdentityAfterWrite(supabase, user.id, {
      mode: "diagnosis",
      reason: "Employment Diagnosis completed"
    });

    return NextResponse.json({ roadmap: generatedRoadmap, redirectTo: appRoutes.authenticatedHome });
  } catch (error) {
    console.error("[roadmap] generation failed", error);
    return NextResponse.json(
      {
        error: roadmapError
      },
      { status: 502 }
    );
  }
}
