"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthNotice } from "@/components/auth/auth-notice";
import { Card, ProgressBar } from "@/components/ui";
import type { DiscoveryAnswers } from "@/lib/discovery/types";
import { appRoutes } from "@/lib/navigation/routes";

const steps: Array<{ key: keyof DiscoveryAnswers; title: string; prompt: string; placeholder: string }> = [
  {
    key: "personal_background",
    title: "Personal background",
    prompt: "Tell PATHZY a little about where you are in life right now.",
    placeholder: "Example: I am 19, live in Cape Town, and I am trying to choose what to study next."
  },
  {
    key: "education",
    title: "Education",
    prompt: "What is your current education level and what have you studied so far?",
    placeholder: "Example: I finished high school and I am taking online business courses."
  },
  {
    key: "interests",
    title: "Interests",
    prompt: "What topics, activities, industries, or problems naturally catch your attention?",
    placeholder: "Example: Technology, design, social media, fashion, finance, helping people."
  },
  {
    key: "skills",
    title: "Skills",
    prompt: "What can you already do, even if you are still a beginner?",
    placeholder: "Example: Writing, Excel, public speaking, Canva, basic coding, selling."
  },
  {
    key: "personality",
    title: "Personality",
    prompt: "How would friends describe your personality and strengths?",
    placeholder: "Example: Curious, calm, creative, organized, confident, analytical."
  },
  {
    key: "work_style",
    title: "Work style",
    prompt: "How do you like to work when you are at your best?",
    placeholder: "Example: Alone with focus, in a team, with structure, on fast creative projects."
  },
  {
    key: "dream_lifestyle",
    title: "Dream lifestyle",
    prompt: "What kind of life are you trying to build?",
    placeholder: "Example: Remote work, financial stability, creative freedom, support my family."
  },
  {
    key: "income_goal",
    title: "Income goal",
    prompt: "What income goal would feel meaningful in the next 12 to 24 months?",
    placeholder: "Example: $1,000 per month from a stable job or freelance clients."
  },
  {
    key: "biggest_challenge",
    title: "Biggest challenge",
    prompt: "What is blocking you most right now?",
    placeholder: "Example: I do not know which career to choose or what skill to learn first."
  },
  {
    key: "preferred_career_direction",
    title: "Preferred career direction",
    prompt: "If you had to guess, which career direction feels most interesting today?",
    placeholder: "Example: Tech, design, business, healthcare, entrepreneurship, data, education."
  }
];

const initialAnswers = steps.reduce(
  (answers, step) => ({ ...answers, [step.key]: "" }),
  {} as DiscoveryAnswers
);

export function DiscoveryFlow() {
  const router = useRouter();
  const [answers, setAnswers] = useState<DiscoveryAnswers>(initialAnswers);
  const [stepIndex, setStepIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const currentStep = steps[stepIndex];
  const progress = useMemo(() => Math.round(((stepIndex + 1) / steps.length) * 100), [stepIndex]);
  const isLastStep = stepIndex === steps.length - 1;
  const currentValue = answers[currentStep.key];

  function updateCurrent(value: string) {
    setAnswers((current) => ({ ...current, [currentStep.key]: value }));
  }

  async function saveDiscovery() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });
      const payload = (await response.json()) as { error?: string };

      if (response.status === 401) {
        setMessage(payload.error || "Please log in before completing Discovery.");
        router.replace(`${appRoutes.login}?redirectTo=${appRoutes.discovery}`);
        return;
      }

      if (!response.ok) {
        setMessage(payload.error || "We could not complete this action yet. Your progress is safe. Please try again.");
        return;
      }

      router.replace(appRoutes.roadmap);
      router.refresh();
    } catch (error) {
      setMessage("We could not complete this action yet. Your progress is safe. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function goNext() {
    if (!currentValue.trim()) {
      setMessage("Add a short answer before continuing.");
      return;
    }

    setMessage("");
    if (isLastStep) {
      void saveDiscovery();
      return;
    }

    setStepIndex((current) => current + 1);
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <AuthNotice />
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Step {stepIndex + 1} of {steps.length}</p>
          <h2 className="mt-2 text-3xl font-black">{currentStep.title}</h2>
        </div>
        <span className="w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/64">{progress}% complete</span>
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
            Back
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={saving}
            className="rounded-full blue-purple px-6 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Building your career plan..." : isLastStep ? "Create My Career Plan" : "Continue"}
          </button>
        </div>
      </div>
    </Card>
  );
}
