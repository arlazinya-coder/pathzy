"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, ProgressBar } from "@/components/ui";
import { appRoutes, PATHZY_ROUTES } from "@/lib/navigation/routes";

const steps = ["Choose your language", "Who are you?", "Where are you?", "Education", "Career Goal", "Current Readiness"] as const;

type OnboardingState = {
  current_status: string;
  country: string;
  city: string;
  language: "" | "english" | "french";
  highest_qualification: string;
  field_of_study: string;
  currently_studying: boolean;
  institution: string;
  graduation_year: string;
  dream_career: string;
  preferred_industries: string;
  desired_work_type: "remote" | "hybrid" | "onsite";
  has_cv: boolean;
  has_cover_letter: boolean;
  has_linkedin: boolean;
  applied_before: boolean;
  interviewed_before: boolean;
  has_certificates: boolean;
  starting_from_zero: boolean;
};

const initialState: OnboardingState = {
  current_status: "",
  country: "",
  city: "",
  language: "",
  highest_qualification: "",
  field_of_study: "",
  currently_studying: false,
  institution: "",
  graduation_year: "",
  dream_career: "",
  preferred_industries: "",
  desired_work_type: "hybrid",
  has_cv: false,
  has_cover_letter: false,
  has_linkedin: false,
  applied_before: false,
  interviewed_before: false,
  has_certificates: false,
  starting_from_zero: false
};

const countryOptions = [
  "South Africa",
  "DR Congo",
  "Zambia",
  "Zimbabwe",
  "Botswana",
  "Namibia",
  "Kenya",
  "Nigeria",
  "Ghana",
  "Rwanda",
  "Uganda",
  "Tanzania",
  "United States",
  "United Kingdom",
  "Canada",
  "France",
  "Belgium",
  "Other"
] as const;

const stepDetails = [
  {
    eyebrow: "Language",
    title: "Choose the language you want PATHZY to use.",
    body: "We will start here and keep the rest simple. You can change this later in Settings.",
    helper: "Pick the language that feels most comfortable for building your Professional Identity."
  },
  {
    eyebrow: "Your starting point",
    title: "Where are you in your employment journey today?",
    body: "There is no wrong answer. PATHZY uses this to guide you without making assumptions.",
    helper: "Choose the option closest to your current situation."
  },
  {
    eyebrow: "Location",
    title: "Where should PATHZY place you professionally?",
    body: "Your city and country help with documents, job matching, and realistic next steps.",
    helper: "Use the location you want employers to see."
  },
  {
    eyebrow: "Education",
    title: "Tell us about your learning background.",
    body: "Formal education, current studies, short courses, or no formal education are all acceptable starting points.",
    helper: "Add what is true today. You can strengthen this later inside Professional Identity."
  },
  {
    eyebrow: "Career direction",
    title: "What kind of work are you moving toward?",
    body: "A clear direction helps PATHZY recommend the right next action, but you are never locked in.",
    helper: "Use simple words. For example: Data Analyst, IT Support, Designer, Administrator."
  },
  {
    eyebrow: "Readiness",
    title: "What do you already have ready?",
    body: "This helps PATHZY decide what to build first after your Professional Identity is prepared.",
    helper: "Choose only what is true. Starting from zero is completely okay."
  }
] as const;

type InitialProfile = Partial<OnboardingState> & {
  education?: string | null;
  language?: string | null;
  onboarding_step?: number | null;
  career_goal?: string | null;
  preferred_path?: string | null;
  desired_work_type?: "remote" | "hybrid" | "onsite" | null;
  applied_before?: boolean | null;
  interviewed_before?: boolean | null;
  has_applied_before?: boolean | null;
  has_interviewed_before?: boolean | null;
};

const storageKey = "pathzy:onboarding-progress";

function valuesFromProfile(profile?: InitialProfile | null): OnboardingState {
  return {
    ...initialState,
    current_status: profile?.current_status || initialState.current_status,
    country: profile?.country || "",
    city: profile?.city || "",
    language: profile?.language === "french" ? "french" : profile?.language === "english" ? "english" : "",
    highest_qualification: profile?.highest_qualification || profile?.education || "",
    field_of_study: profile?.field_of_study || "",
    currently_studying: Boolean(profile?.currently_studying),
    institution: profile?.institution || "",
    graduation_year: profile?.graduation_year || "",
    dream_career: profile?.dream_career || profile?.career_goal || "",
    preferred_industries: profile?.preferred_industries || profile?.preferred_path || "",
    desired_work_type: profile?.desired_work_type || initialState.desired_work_type,
    has_cv: Boolean(profile?.has_cv),
    has_cover_letter: Boolean(profile?.has_cover_letter),
    has_linkedin: Boolean(profile?.has_linkedin),
    applied_before: Boolean(profile?.applied_before || profile?.has_applied_before),
    interviewed_before: Boolean(profile?.interviewed_before || profile?.has_interviewed_before),
    has_certificates: Boolean(profile?.has_certificates),
    starting_from_zero: Boolean(profile?.starting_from_zero)
  };
}

function inferredStep(values: OnboardingState, profile?: InitialProfile | null) {
  if (typeof profile?.onboarding_step === "number") return Math.max(0, Math.min(profile.onboarding_step - 1, steps.length - 1));
  if (values.dream_career.trim() && values.preferred_industries.trim()) return 5;
  if (values.highest_qualification.trim()) return 4;
  if (values.country.trim() && values.city.trim()) return 3;
  if (values.current_status) return 2;
  if (values.language) return 1;
  return 0;
}

export function OnboardingFlow({ initialProfile }: { initialProfile?: InitialProfile | null }) {
  const router = useRouter();
  const [step, setStep] = useState(() => Math.min(inferredStep(valuesFromProfile(initialProfile), initialProfile), steps.length - 1));
  const [values, setValues] = useState(() => valuesFromProfile(initialProfile));
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved">("idle");
  const hydrated = useRef(false);
  const lastFailedAction = useRef<"progress" | "submit">("progress");
  const lastFailedProgressStep = useRef<number | null>(null);
  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);
  const isLast = step === steps.length - 1;
  const activeStep = stepDetails[step];

  function setValue<K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "starting_from_zero" && value === true) {
        next.has_cv = false;
        next.has_cover_letter = false;
        next.has_linkedin = false;
        next.applied_before = false;
        next.interviewed_before = false;
        next.has_certificates = false;
      }
      if (key !== "starting_from_zero" && value === true) next.starting_from_zero = false;
      return next;
    });
  }

  function canContinue() {
    if (step === 0) return Boolean(values.language);
    if (step === 1) return Boolean(values.current_status);
    if (step === 2) return Boolean(values.country.trim() && values.city.trim() && values.language);
    if (step === 3) return Boolean(values.highest_qualification.trim());
    if (step === 4) return Boolean(values.dream_career.trim() && values.preferred_industries.trim());
    return true;
  }

  async function saveProgress(nextStep = step) {
    window.localStorage.setItem(storageKey, JSON.stringify({ values, step: nextStep, savedAt: new Date().toISOString() }));
    setAutosaveState("saving");
    const response = await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, completed_step: nextStep + 1 })
    });
    if (response.status === 401) {
      router.replace(`${PATHZY_ROUTES.LOGIN}?redirectTo=${appRoutes.onboarding}`);
      return false;
    }
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      console.error("[onboarding] saveProgress failed", data?.developerError ?? data?.error ?? response.statusText);
      throw new Error(data?.error ?? "We could not save this step. Please check your connection and try again.");
    }
    setAutosaveState("saved");
    return true;
  }

  async function retrySave() {
    setMessage("");
    setSaveError(false);
    if (lastFailedAction.current === "submit") {
      await submit();
      return;
    }
    try {
      const targetStep = lastFailedProgressStep.current ?? step;
      const saved = await saveProgress(targetStep);
      if (saved) {
        setStep(targetStep);
        lastFailedProgressStep.current = null;
        setMessage("Progress saved. You can continue.");
      }
    } catch (caught) {
      setSaveError(true);
      setAutosaveState("idle");
      setMessage(caught instanceof Error ? caught.message : "We could not save this step. Please check your connection and try again.");
    }
  }

  async function submit() {
    if (!canContinue()) {
      setMessage("Add the required details before continuing.");
      return;
    }

    setSaving(true);
    setMessage("");
    setSaveError(false);

    try {
      const saved = await saveProgress(step);
      if (!saved) return;
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const data = await response.json();
      if (response.status === 401) {
        router.replace(`${PATHZY_ROUTES.LOGIN}?redirectTo=${appRoutes.onboarding}`);
        return;
      }
      if (!response.ok) throw new Error(data.error ?? "We could not save your profile yet. Please try again.");
      window.localStorage.removeItem(storageKey);
      router.replace(data.redirectTo ?? PATHZY_ROUTES.PROFESSIONAL_IDENTITY);
      router.refresh();
    } catch (caught) {
      lastFailedAction.current = "submit";
      setSaveError(true);
      setAutosaveState("idle");
      setMessage(caught instanceof Error ? caught.message : "We could not save this step. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function next(event: FormEvent) {
    event.preventDefault();
    if (!canContinue()) {
      setMessage(step === 2 ? "Please complete country, city, and language before continuing." : "Add the required details before continuing.");
      return;
    }
    setMessage("");
    setSaveError(false);
    if (isLast) void submit();
    else {
      const nextStep = step + 1;
      try {
        const saved = await saveProgress(nextStep);
        if (saved) setStep(nextStep);
      } catch (caught) {
        lastFailedAction.current = "progress";
        lastFailedProgressStep.current = nextStep;
        setSaveError(true);
        setAutosaveState("idle");
        setMessage(caught instanceof Error ? caught.message : "We could not save this step. Please check your connection and try again.");
      }
    }
  }

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { values?: Partial<OnboardingState>; step?: number };
        if (parsed.values) setValues((current) => ({ ...current, ...parsed.values }));
        if (typeof parsed.step === "number") setStep(Math.max(0, Math.min(parsed.step, steps.length - 1)));
      }
    } finally {
      hydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    window.localStorage.setItem(storageKey, JSON.stringify({ values, step, savedAt: new Date().toISOString() }));
    const timeout = window.setTimeout(() => {
      void saveProgress(step).catch(() => {
        console.error("[onboarding] autosave failed");
        setAutosaveState("idle");
      });
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [values, step]);

  return (
    <Card className="mx-auto max-w-5xl overflow-hidden">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.25fr]">
        <aside className="rounded-[28px] border border-white/10 bg-[#071126]/70 p-5 md:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#9df0c4]">Professional Identity</p>
          <h2 className="mt-4 text-3xl font-black leading-tight md:text-4xl">Let&apos;s build the foundation first.</h2>
          <p className="mt-4 text-base font-bold leading-7 text-white/60">
            One focused step at a time. PATHZY saves your progress as you go, then opens the Employment Operating System when this setup is complete.
          </p>
          <div className="mt-6 rounded-[22px] border border-white/10 bg-white/7 p-4">
            <div className="mb-3 flex items-center justify-between text-sm font-extrabold text-white/58">
              <span>Step {step + 1} of {steps.length}</span>
              <span>{progress}%</span>
            </div>
            <ProgressBar value={progress} />
          </div>
          <div className="mt-5 grid gap-2">
            {steps.map((item, index) => {
              const isCurrent = index === step;
              const isDone = index < step;
              return (
                <div key={item} className={`rounded-[16px] border px-3 py-3 text-sm font-extrabold ${isCurrent ? "border-[#8fb0ff]/45 bg-[#5B8CFF]/16 text-white" : isDone ? "border-[#9df0c4]/25 bg-[#9df0c4]/10 text-[#d8ffe6]" : "border-white/8 bg-white/5 text-white/38"}`}>
                  <span className="mr-2">{isDone ? "Done" : isCurrent ? "Now" : "Next"}</span>
                  {item}
                </div>
              );
            })}
          </div>
        </aside>

        <form onSubmit={next} className="grid content-start gap-5">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 md:p-7">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/42">{activeStep.eyebrow}</p>
            <h3 className="mt-3 text-3xl font-black leading-tight">{activeStep.title}</h3>
            <p className="mt-3 text-base font-bold leading-7 text-white/62">{activeStep.body}</p>
            <p className="mt-5 rounded-[18px] border border-[#8fb0ff]/20 bg-[#5B8CFF]/10 p-4 text-sm font-bold leading-6 text-[#dce6ff]">{activeStep.helper}</p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#080f22]/80 p-5 md:p-7">
        {step === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["english", "English"],
              ["french", "Français"]
            ].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setValue("language", value as "english" | "french")} className={`rounded-[22px] border p-5 text-left transition ${values.language === value ? "border-[#5B8CFF]/70 bg-[#5B8CFF]/18 text-white shadow-[0_18px_45px_rgba(91,140,255,.18)]" : "border-white/10 bg-white/7 text-white/68 hover:bg-white/10"}`}>
                <span className="block text-xl font-black">{label}</span>
                <span className="mt-2 block text-sm font-bold text-white/50">Use {label} for your PATHZY guidance.</span>
              </button>
            ))}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["student", "Student"],
              ["graduate", "Graduate"],
              ["looking_first_job", "Looking for first job"],
              ["unemployed", "Unemployed"],
              ["career_changer", "Career changer"],
              ["employed", "Already employed"]
            ].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setValue("current_status", value)} className={`rounded-[20px] border p-4 text-left font-black transition ${values.current_status === value ? "border-[#5B8CFF]/70 bg-[#5B8CFF]/18 text-white shadow-[0_18px_45px_rgba(91,140,255,.14)]" : "border-white/10 bg-white/7 text-white/68 hover:bg-white/10"}`}>
                {label}
              </button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="label">
              Country
              <select className="field" value={values.country} onChange={(event) => setValue("country", event.target.value)}>
                <option value="">Select your country</option>
                {countryOptions.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </label>
            <label className="label">City<input className="field" value={values.city} onChange={(event) => setValue("city", event.target.value)} placeholder="Johannesburg" /></label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="label">
              Education situation
              <select className="field" value={values.highest_qualification} onChange={(event) => setValue("highest_qualification", event.target.value)}>
                <option value="">Select your education situation</option>
                <option value="Currently studying">Currently studying</option>
                <option value="Completed high school">Completed high school</option>
                <option value="Completed diploma">Completed diploma</option>
                <option value="Completed degree">Completed degree</option>
                <option value="No formal education">No formal education</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="label">Field of study<input className="field" value={values.field_of_study} onChange={(event) => setValue("field_of_study", event.target.value)} placeholder="Business, IT, design" /></label>
            <label className="label">Institution<input className="field" value={values.institution} onChange={(event) => setValue("institution", event.target.value)} placeholder="School, college, university, or training provider" /></label>
            <label className="label">Graduation year<input className="field" value={values.graduation_year} onChange={(event) => setValue("graduation_year", event.target.value)} placeholder="Optional" /></label>
            <label className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-white/7 p-4 font-bold text-white/74 md:col-span-2">
              Currently studying
              <input type="checkbox" checked={values.currently_studying} onChange={(event) => setValue("currently_studying", event.target.checked)} className="h-5 w-5 accent-[#5B8CFF]" />
            </label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="label">Dream career<input className="field" value={values.dream_career} onChange={(event) => setValue("dream_career", event.target.value)} placeholder="Data analyst, designer, entrepreneur" /></label>
            <label className="label">Preferred industries<input className="field" value={values.preferred_industries} onChange={(event) => setValue("preferred_industries", event.target.value)} placeholder="Technology, finance, healthcare" /></label>
            <label className="label md:col-span-2">
              Desired work type
              <select className="field" value={values.desired_work_type} onChange={(event) => setValue("desired_work_type", event.target.value as "remote" | "hybrid" | "onsite")}>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </label>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="grid gap-4">
            <div className="rounded-[20px] border border-[#5B8CFF]/25 bg-[#5B8CFF]/10 p-4">
              <p className="text-lg font-black text-white">You are almost done. Click Finish onboarding to continue.</p>
              <p className="mt-2 text-sm font-bold leading-6 text-white/62">Choose only what is true for you today. You do not need to have everything ready.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["has_cv", "I already have a CV"],
              ["has_cover_letter", "I already have a cover letter"],
              ["has_linkedin", "I have a LinkedIn profile"],
              ["applied_before", "I have applied for jobs before"],
              ["interviewed_before", "I have attended interviews before"],
              ["has_certificates", "I have certificates or qualifications to upload later"],
              ["starting_from_zero", "I am starting from zero"]
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-white/7 p-4 font-bold text-white/74">
                {label}
                <input type="checkbox" checked={Boolean(values[key as keyof OnboardingState])} onChange={(event) => setValue(key as keyof OnboardingState, event.target.checked as never)} className="h-5 w-5 accent-[#5B8CFF]" />
              </label>
            ))}
            </div>
          </div>
        ) : null}
          </div>

        {message ? (
          <div className={`rounded-[18px] border p-4 text-base font-bold leading-7 ${saveError ? "border-[#ff6b6b]/30 bg-[#ff6b6b]/10 text-[#ffc5c5]" : "border-white/10 bg-white/7 text-white/76"}`}>
            <p>{message}</p>
            {saveError ? (
              <button type="button" onClick={() => void retrySave()} className="mt-3 rounded-full border border-white/12 bg-white/10 px-5 py-2 text-sm font-extrabold text-white">
                Retry
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-[18px] border border-white/10 bg-white/5 p-4 text-sm font-bold text-white/56">
          {autosaveState === "saving" ? "Saving your progress..." : autosaveState === "saved" ? "Progress saved. You can safely continue." : "Your answers save automatically as you go."}
        </div>

        <div className="flex flex-wrap justify-between gap-3">
          <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0 || saving} className="rounded-full border border-white/12 bg-white/8 px-6 py-3 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-40">
            Back
          </button>
          <button disabled={saving} className="rounded-full blue-purple px-6 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Preparing your Employment Operating System..." : isLast ? "Open Employment Operating System" : "Next"}
          </button>
        </div>
      </form>
      </div>
    </Card>
  );
}
