"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthNotice } from "@/components/auth/auth-notice";
import { usePathzyLanguage } from "@/components/language/language-selector";
import { Card, ProgressBar } from "@/components/ui";
import type { DiagnosisOption, DiagnosisProgress, DiagnosisQuestionDefinition, EmploymentDiagnosisAnswer, EmploymentDiagnosisSession } from "@/lib/employment-intelligence/diagnosis";
import { pathzyPhase2T } from "@/lib/language/pathzy-i18n";
import { normalizeSupportedLanguage, type SupportedLanguageCode } from "@/lib/language/language-preferences";
import { appRoutes } from "@/lib/navigation/routes";

type DiagnosisPayload = {
  session: EmploymentDiagnosisSession;
  currentQuestion: DiagnosisQuestionDefinition | null;
  reasonForAsking: string;
  progress: DiagnosisProgress;
  canComplete: boolean;
  estimatedRemainingQuestions: number;
  answers: Record<string, EmploymentDiagnosisAnswer>;
  error?: string;
  redirectTo?: string;
};

function optionLabel(option: DiagnosisOption, language: SupportedLanguageCode) {
  return option.plainLabel?.[language] ?? option.label[language] ?? option.label.en ?? option.code;
}

function questionTitle(question: DiagnosisQuestionDefinition | null, language: SupportedLanguageCode) {
  return question?.title[language] ?? question?.title.en ?? "";
}

function questionPrompt(question: DiagnosisQuestionDefinition | null, language: SupportedLanguageCode) {
  return question?.prompt[language] ?? question?.prompt.en ?? "";
}

function questionHelp(question: DiagnosisQuestionDefinition | null, language: SupportedLanguageCode) {
  return question?.helpText[language] ?? question?.helpText.en ?? "";
}

function answerValueFor(question: DiagnosisQuestionDefinition | null, answers: Record<string, EmploymentDiagnosisAnswer>) {
  if (!question) return "";
  const value = answers[question.questionId]?.value;
  if (Array.isArray(value)) return value;
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : "";
}

function answerIsValid(question: DiagnosisQuestionDefinition | null, value: string | string[]) {
  if (!question) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value.trim().length > 0;
}

export function DiscoveryFlow() {
  const router = useRouter();
  const { language } = usePathzyLanguage();
  const activeLanguage = normalizeSupportedLanguage(language);
  const [payload, setPayload] = useState<DiagnosisPayload | null>(null);
  const [currentValue, setCurrentValue] = useState<string | string[]>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const currentQuestion = payload?.currentQuestion ?? null;
  const progressValue = useMemo(() => Math.round((payload?.progress.completionConfidence ?? 0.1) * 100), [payload?.progress.completionConfidence]);
  const currentAnswerIsValid = answerIsValid(currentQuestion, currentValue);

  useEffect(() => {
    let cancelled = false;
    async function loadDiagnosis() {
      setLoading(true);
      setMessage("");
      try {
        const response = await fetch(`/api/generate-roadmap?language=${activeLanguage}`, { method: "GET" });
        const nextPayload = (await response.json()) as DiagnosisPayload;
        if (cancelled) return;
        if (response.status === 401) {
          router.replace(`${appRoutes.login}?redirectTo=${appRoutes.discovery}`);
          return;
        }
        if (!response.ok) {
          setMessage(nextPayload.error || pathzyPhase2T(activeLanguage, "discovery.error"));
          return;
        }
        setPayload(nextPayload);
        setCurrentValue(answerValueFor(nextPayload.currentQuestion, nextPayload.answers ?? {}));
      } catch {
        if (!cancelled) setMessage(pathzyPhase2T(activeLanguage, "discovery.error"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadDiagnosis();
    return () => {
      cancelled = true;
    };
  }, [activeLanguage, router]);

  function toggleMulti(optionCode: string) {
    setCurrentValue((current) => {
      const list = Array.isArray(current) ? current : [];
      return list.includes(optionCode) ? list.filter((item) => item !== optionCode) : [...list, optionCode];
    });
  }

  async function postDiagnosis(body: Record<string, unknown>) {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, language: activeLanguage })
      });
      const nextPayload = (await response.json()) as DiagnosisPayload;

      if (response.status === 401) {
        setMessage(nextPayload.error || pathzyPhase2T(activeLanguage, "discovery.login"));
        router.replace(`${appRoutes.login}?redirectTo=${appRoutes.discovery}`);
        return null;
      }

      if (!response.ok) {
        setMessage(nextPayload.error || pathzyPhase2T(activeLanguage, "discovery.error"));
        if (nextPayload.currentQuestion) setPayload(nextPayload);
        return null;
      }

      return nextPayload;
    } catch {
      setMessage(pathzyPhase2T(activeLanguage, "discovery.error"));
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function saveCurrentAnswer() {
    if (!currentQuestion) return null;
    if (!currentAnswerIsValid) {
      setMessage(pathzyPhase2T(activeLanguage, "discovery.required"));
      return null;
    }
    const nextPayload = await postDiagnosis({
      mode: "save_answer",
      questionId: currentQuestion.questionId,
      value: currentValue
    });
    if (!nextPayload) return null;
    setPayload(nextPayload);
    setCurrentValue(answerValueFor(nextPayload.currentQuestion, nextPayload.answers ?? {}));
    return nextPayload;
  }

  async function completeDiagnosis() {
    const nextPayload = await postDiagnosis({ mode: "complete" });
    if (!nextPayload) return;
    router.replace(nextPayload.redirectTo ?? appRoutes.authenticatedHome);
    router.refresh();
  }

  async function goNext() {
    const nextPayload = currentQuestion ? await saveCurrentAnswer() : payload;
    if (!nextPayload) return;
    if (!nextPayload.currentQuestion && nextPayload.canComplete) {
      await completeDiagnosis();
    }
  }

  if (loading) {
    return (
      <Card className="mx-auto max-w-4xl">
        <AuthNotice />
        <p className="rounded-[18px] border border-white/10 bg-white/7 p-3 text-sm font-bold text-white/70">{pathzyPhase2T(activeLanguage, "discovery.saving")}</p>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <AuthNotice />
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">{pathzyPhase2T(activeLanguage, "discovery.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-black">{currentQuestion ? questionTitle(currentQuestion, activeLanguage) : pathzyPhase2T(activeLanguage, "discovery.title")}</h2>
        </div>
        <span className="w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/64">
          {payload?.progress.explanation ?? `${progressValue}% ${pathzyPhase2T(activeLanguage, "discovery.complete")}`}
        </span>
      </div>

      <ProgressBar value={progressValue} />

      <div className="mt-8 grid gap-5">
        {currentQuestion ? (
          <>
            <div className="rounded-[18px] border border-white/10 bg-white/7 p-4">
              <p className="text-lg font-black text-white">{questionPrompt(currentQuestion, activeLanguage)}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-white/64">{questionHelp(currentQuestion, activeLanguage)}</p>
              <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">{payload?.reasonForAsking}</p>
            </div>

            {currentQuestion.answerType === "SHORT_TEXT" || currentQuestion.answerType === "OPTIONAL_LONG_TEXT" ? (
              <label className="label text-base">
                {questionTitle(currentQuestion, activeLanguage)}
                <textarea className="field min-h-[150px]" value={Array.isArray(currentValue) ? currentValue.join("\n") : currentValue} onChange={(event) => setCurrentValue(event.target.value)} aria-invalid={!currentAnswerIsValid && Boolean(message)} />
              </label>
            ) : currentQuestion.answerType === "MULTI_SELECT" ? (
              <div className="grid gap-3">
                {currentQuestion.options.map((option) => {
                  const selected = Array.isArray(currentValue) && currentValue.includes(option.code);
                  return (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => toggleMulti(option.code)}
                      className={`rounded-[18px] border px-4 py-3 text-left text-sm font-extrabold transition ${selected ? "border-blue-300 bg-blue-400/18 text-white" : "border-white/10 bg-white/7 text-white/76 hover:bg-white/12"}`}
                      aria-pressed={selected}
                    >
                      {optionLabel(option, activeLanguage)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-3">
                {currentQuestion.options.map((option) => {
                  const selected = currentValue === option.code;
                  return (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => setCurrentValue(option.code)}
                      className={`rounded-[18px] border px-4 py-3 text-left text-sm font-extrabold transition ${selected ? "border-blue-300 bg-blue-400/18 text-white" : "border-white/10 bg-white/7 text-white/76 hover:bg-white/12"}`}
                      aria-pressed={selected}
                    >
                      {optionLabel(option, activeLanguage)}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[18px] border border-white/10 bg-white/7 p-4">
            <h3 className="text-2xl font-black">{pathzyPhase2T(activeLanguage, "discovery.submit")}</h3>
            <p className="mt-2 text-sm font-bold leading-6 text-white/64">{payload?.progress.explanation ?? pathzyPhase2T(activeLanguage, "discovery.body")}</p>
          </div>
        )}

        {message ? <p className="rounded-[18px] border border-white/10 bg-white/7 p-3 text-sm font-bold text-white/70">{message}</p> : null}

        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={currentQuestion ? goNext : completeDiagnosis} disabled={saving || (Boolean(currentQuestion) && !currentAnswerIsValid)} className="rounded-full blue-purple px-6 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? pathzyPhase2T(activeLanguage, "discovery.saving") : currentQuestion ? pathzyPhase2T(activeLanguage, "discovery.continue") : pathzyPhase2T(activeLanguage, "discovery.submit")}
          </button>
        </div>
      </div>
    </Card>
  );
}
