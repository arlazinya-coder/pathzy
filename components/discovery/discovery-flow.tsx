"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthNotice } from "@/components/auth/auth-notice";
import { usePathzyLanguage } from "@/components/language/language-selector";
import { Card, ProgressBar } from "@/components/ui";
import { discoveryAnswerValue, emptyDiscoveryAnswers, normalizeDiscoveryAnswers } from "@/lib/discovery/discovery-answer-state";
import type { DiscoveryAnswers } from "@/lib/discovery/types";
import { getEmploymentDiagnosisSteps, pathzyPhase2T } from "@/lib/language/pathzy-i18n";
import { appRoutes } from "@/lib/navigation/routes";

const initialAnswers = emptyDiscoveryAnswers();

export function DiscoveryFlow() {
  const router = useRouter();
  const { language } = usePathzyLanguage();
  const steps = useMemo(() => getEmploymentDiagnosisSteps(language), [language]);
  const [answers, setAnswers] = useState<DiscoveryAnswers>(initialAnswers);
  const [stepIndex, setStepIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const currentStep = steps[stepIndex] ?? steps[0] ?? null;
  const progress = useMemo(() => Math.round(((Math.min(stepIndex, steps.length - 1) + 1) / Math.max(steps.length, 1)) * 100), [stepIndex, steps.length]);
  const isLastStep = stepIndex === steps.length - 1;
  const currentValue = currentStep ? discoveryAnswerValue(answers, currentStep.key) : "";
  const currentAnswerIsValid = currentValue.trim().length > 0;

  function updateCurrent(value: string) {
    if (!currentStep) return;
    setAnswers((current) => ({ ...current, [currentStep.key]: value }));
  }

  async function saveDiscovery() {
    setSaving(true);
    setMessage("");
    const safeAnswers = normalizeDiscoveryAnswers(answers);

    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: safeAnswers })
      });
      const payload = (await response.json()) as { error?: string; redirectTo?: string };

      if (response.status === 401) {
        setMessage(payload.error || pathzyPhase2T(language, "discovery.login"));
        router.replace(`${appRoutes.login}?redirectTo=${appRoutes.discovery}`);
        return;
      }

      if (!response.ok) {
        setMessage(payload.error || pathzyPhase2T(language, "discovery.error"));
        return;
      }

      router.replace(payload.redirectTo ?? appRoutes.authenticatedHome);
      router.refresh();
    } catch {
      setMessage(pathzyPhase2T(language, "discovery.error"));
    } finally {
      setSaving(false);
    }
  }

  function goNext() {
    if (!currentStep) {
      setMessage(pathzyPhase2T(language, "discovery.error"));
      return;
    }
    if (!currentValue.trim()) {
      setMessage(pathzyPhase2T(language, "discovery.required"));
      return;
    }

    setMessage("");
    if (isLastStep) {
      void saveDiscovery();
      return;
    }

    setStepIndex((current) => Math.min(steps.length - 1, current + 1));
  }

  if (!currentStep) {
    return (
      <Card className="mx-auto max-w-4xl">
        <AuthNotice />
        <p className="rounded-[18px] border border-white/10 bg-white/7 p-3 text-sm font-bold text-white/70">{pathzyPhase2T(language, "discovery.error")}</p>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <AuthNotice />
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">{pathzyPhase2T(language, "discovery.step")} {stepIndex + 1} {pathzyPhase2T(language, "identity.ui.stepConnector")} {steps.length}</p>
          <h2 className="mt-2 text-3xl font-black">{currentStep.title}</h2>
        </div>
        <span className="w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/64">{progress}% {pathzyPhase2T(language, "discovery.complete")}</span>
      </div>

      <ProgressBar value={progress} />

      <div className="mt-8 grid gap-5">
        <label className="label text-base">
          {currentStep.prompt}
          <textarea
            className="field min-h-[190px]"
            value={currentValue}
            onChange={(event) => updateCurrent(event.target.value)}
            placeholder={currentStep.placeholder}
            aria-invalid={!currentAnswerIsValid && Boolean(message)}
          />
        </label>

        {message ? <p className="rounded-[18px] border border-white/10 bg-white/7 p-3 text-sm font-bold text-white/70">{message}</p> : null}

        <div className="flex flex-wrap justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setMessage("");
              setStepIndex((current) => Math.max(0, current - 1));
            }}
            disabled={stepIndex === 0 || saving}
            className="rounded-full border border-white/12 bg-white/8 px-6 py-3 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pathzyPhase2T(language, "discovery.back")}
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={saving || !currentAnswerIsValid}
            className="rounded-full blue-purple px-6 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? pathzyPhase2T(language, "discovery.saving") : isLastStep ? pathzyPhase2T(language, "discovery.submit") : pathzyPhase2T(language, "discovery.continue")}
          </button>
        </div>
      </div>
    </Card>
  );
}
