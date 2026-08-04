import { NextResponse } from "next/server";
import { normalizeSupportedLanguage } from "@/lib/language/language-preferences";
import { appRoutes } from "@/lib/navigation/routes";
import {
  answerForQuestion,
  applyDiagnosisAnswer,
  buildEmploymentDiagnosisResult,
  diagnosisQuestionById,
  generateEmploymentIntelligenceWithTrace,
  loadOrCreateDiagnosisSession,
  mapDiagnosisToEmploymentIntelligenceInput,
  resolveCountryEmploymentContext,
  saveDiagnosisSession,
  selectNextDiagnosisQuestion
} from "@/lib/employment-intelligence/engine";
import type { DiagnosisAnswerState, EmploymentDiagnosisSession } from "@/lib/employment-intelligence/diagnosis";
import { getProfessionalIdentityReadModelSafe } from "@/lib/professional-identity/professional-identity-read-service";
import { syncProfessionalIdentityAfterWrite } from "@/lib/professional-identity/professional-identity-sync";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const diagnosisError = "We could not complete this action yet. Your progress is safe. Please try again.";

function languageFromRequest(request: Request, fallback?: string | null) {
  const url = new URL(request.url);
  return normalizeSupportedLanguage(url.searchParams.get("language"), fallback);
}

function countryCodeFromIdentity(values: Record<string, unknown>) {
  const country = values.country;
  return typeof country === "string" && country.trim() ? country : "GENERIC";
}

function questionPayload(session: EmploymentDiagnosisSession, professionalIdentity: Record<string, unknown>, language: string) {
  const country = resolveCountryEmploymentContext({ countryCode: countryCodeFromIdentity(professionalIdentity) }).context;
  const selection = selectNextDiagnosisQuestion({
    userId: session.userId,
    professionalIdentity,
    session,
    countryContext: country,
    missingInformationCodes: [],
    detectedBarrierCodes: [],
    interfaceLanguage: normalizeSupportedLanguage(language),
    supportIntensity: session.presentationMode
  });

  return {
    session,
    currentQuestion: selection.nextQuestion,
    reasonForAsking: selection.reasonForAsking,
    progress: selection.progress,
    canComplete: selection.canComplete,
    estimatedRemainingQuestions: selection.estimatedRemainingQuestions,
    answers: session.answers,
    countryContext: {
      countryCode: country.countryCode,
      version: country.version,
      dataFreshness: country.dataFreshness
    }
  };
}

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Something needs a quick setup. Please refresh and try again." }, { status: 503 });

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Please log in to continue your journey." }, { status: 401 });
  }

  const identity = await getProfessionalIdentityReadModelSafe(supabase, user, "adaptive diagnosis");
  const language = languageFromRequest(request, String(identity.values.interface_language ?? identity.profile?.language ?? ""));
  const country = resolveCountryEmploymentContext({ countryCode: countryCodeFromIdentity(identity.values as Record<string, unknown>) }).context;
  const { session, rowId, error } = await loadOrCreateDiagnosisSession({
    supabase,
    userId: user.id,
    inputSnapshotVersion: String(identity.profile?.updated_at ?? "identity.current"),
    countryContextVersion: country.version,
    language
  });

  if (error || !session) return NextResponse.json({ error: diagnosisError }, { status: 500 });
  const payload = questionPayload({ ...session, interfaceLanguage: language, explanationLanguage: language }, identity.values as Record<string, unknown>, language);
  if (!rowId) {
    const saveResult = await saveDiagnosisSession({ supabase, userId: user.id, session: payload.session });
    if (saveResult.error) return NextResponse.json({ error: diagnosisError }, { status: 500 });
  }
  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Something needs a quick setup. Please refresh and try again." }, { status: 503 });

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Please log in to continue your journey." }, { status: 401 });
  }

  const body = (await request.json()) as {
    mode?: "save_answer" | "complete";
    questionId?: string;
    value?: unknown;
    state?: DiagnosisAnswerState;
    language?: string | null;
  };
  const identity = await getProfessionalIdentityReadModelSafe(supabase, user, "adaptive diagnosis save");
  const language = normalizeSupportedLanguage(body.language, String(identity.values.interface_language ?? identity.profile?.language ?? ""));
  const country = resolveCountryEmploymentContext({ countryCode: countryCodeFromIdentity(identity.values as Record<string, unknown>) }).context;
  const { session, rowId, error } = await loadOrCreateDiagnosisSession({
    supabase,
    userId: user.id,
    inputSnapshotVersion: String(identity.profile?.updated_at ?? "identity.current"),
    countryContextVersion: country.version,
    language
  });

  if (error || !session) return NextResponse.json({ error: diagnosisError }, { status: 500 });

  let nextSession: EmploymentDiagnosisSession = { ...session, interfaceLanguage: language, explanationLanguage: language };
  if (body.mode === "save_answer") {
    const question = diagnosisQuestionById(body.questionId);
    if (!question) return NextResponse.json({ error: "This question is no longer available. Please refresh and continue." }, { status: 409 });
    const optionState = question.options.find((option) => option.code === body.value)?.answerState;
    nextSession = applyDiagnosisAnswer(nextSession, answerForQuestion(question, body.value, body.state ?? optionState ?? "ANSWERED"));
    const selection = questionPayload(nextSession, identity.values as Record<string, unknown>, language);
    nextSession = { ...nextSession, currentQuestionId: selection.currentQuestion?.questionId ?? null };
    const saveResult = await saveDiagnosisSession({ supabase, userId: user.id, rowId, session: nextSession });
    if (saveResult.error) return NextResponse.json({ error: diagnosisError }, { status: 500 });
    return NextResponse.json(questionPayload(nextSession, identity.values as Record<string, unknown>, language));
  }

  if (body.mode === "complete") {
    const selection = questionPayload(nextSession, identity.values as Record<string, unknown>, language);
    if (!selection.canComplete) {
      return NextResponse.json({ error: "A few important questions still need an answer before PATHZY can summarise your diagnosis.", ...selection }, { status: 400 });
    }
    const completedAt = new Date().toISOString();
    nextSession = {
      ...nextSession,
      status: "COMPLETED",
      completedAt,
      updatedAt: completedAt,
      currentQuestionId: null
    };
    const result = buildEmploymentDiagnosisResult(nextSession);
    const intelligenceInput = mapDiagnosisToEmploymentIntelligenceInput({
      userId: user.id,
      professionalIdentity: identity.values as Record<string, unknown>,
      session: nextSession,
      result,
      countryCode: country.countryCode
    });
    const intelligence = generateEmploymentIntelligenceWithTrace(intelligenceInput, { assessedAt: completedAt }).profile;
    const saveResult = await saveDiagnosisSession({
      supabase,
      userId: user.id,
      rowId,
      session: nextSession,
      result: { ...result, explanationFacts: [...result.explanationFacts, `Employment Intelligence draft ${intelligence.engineVersion} refreshed.`] }
    });
    if (saveResult.error) return NextResponse.json({ error: diagnosisError }, { status: 500 });
    await syncProfessionalIdentityAfterWrite(supabase, user.id, { mode: "diagnosis", reason: "Adaptive Employment Diagnosis completed" });
    return NextResponse.json({ result, intelligence, redirectTo: appRoutes.authenticatedHome });
  }

  return NextResponse.json({ error: "Unsupported diagnosis action." }, { status: 400 });
}
