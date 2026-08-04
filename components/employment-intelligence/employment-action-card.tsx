"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EmploymentActionViewModel, EmploymentIntelligenceLanguage } from "@/lib/employment-intelligence/client";
import { useNextBestActions } from "@/lib/employment-intelligence/client";

const copy = {
  en: {
    start: "Start action",
    complete: "Mark complete",
    skip: "Skip",
    why: "Why PATHZY recommends this",
    pending: "Saving...",
    blocked: "Blocked by",
    retry: "Retry"
  },
  fr: {
    start: "Commencer",
    complete: "Marquer terminé",
    skip: "Ignorer",
    why: "Pourquoi PATHZY recommande cela",
    pending: "Enregistrement...",
    blocked: "Bloqué par",
    retry: "Réessayer"
  }
};

export function EmploymentActionCard({
  action,
  language,
  priority = "primary"
}: {
  action: EmploymentActionViewModel;
  language: EmploymentIntelligenceLanguage;
  priority?: "primary" | "secondary";
}) {
  const router = useRouter();
  const { transition, pendingActionCode, error } = useNextBestActions();
  const [whyOpen, setWhyOpen] = useState(false);
  const pending = pendingActionCode === action.code;
  const isPrimary = priority === "primary";
  const t = copy[language];

  async function transitionAndRefresh(type: "start" | "complete" | "skip") {
    const result = await transition({ actionCode: action.code, transition: type });
    if (result) router.refresh();
  }

  return (
    <article className={`rounded-[28px] border p-5 shadow-[0_18px_60px_rgba(0,0,0,.24)] ${isPrimary ? "border-[#d93a46]/40 bg-[#111827]" : "border-white/10 bg-white/7"}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f87171]">{action.state}</p>
          <h2 className={`${isPrimary ? "text-3xl" : "text-xl"} mt-2 font-black tracking-normal text-white`}>{action.title}</h2>
          <p className="mt-3 max-w-3xl text-sm font-bold leading-6 text-white/68">{action.explanation}</p>
          <p className="mt-3 text-sm leading-6 text-white/62">{action.reason}</p>
          {action.blocker ? <p className="mt-3 rounded-2xl border border-white/10 bg-white/8 p-3 text-sm font-bold text-white/72">{t.blocked}: {action.blocker}</p> : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
          <Link href={action.href} onClick={() => void transitionAndRefresh("start")} className="tap-target inline-flex min-h-12 items-center justify-center rounded-full blue-purple px-5 py-3 text-sm font-extrabold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d93a46]">
            {pending ? t.pending : t.start}
          </Link>
          <button type="button" disabled={pending} onClick={() => void transitionAndRefresh("complete")} className="tap-target min-h-12 rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:opacity-50">
            {t.complete}
          </button>
          <button type="button" disabled={pending} onClick={() => void transitionAndRefresh("skip")} className="tap-target min-h-12 rounded-full border border-white/12 bg-transparent px-5 py-3 text-sm font-extrabold text-white/62 disabled:opacity-50">
            {t.skip}
          </button>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-white/52">
        <span>{action.expectedOutcome}</span>
        <span>{action.effort}</span>
        <span>{action.confidenceLabel}</span>
      </div>
      <button type="button" aria-expanded={whyOpen} onClick={() => setWhyOpen((open) => !open)} className="mt-5 text-sm font-extrabold text-[#93c5fd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d93a46]">
        {t.why}
      </button>
      {whyOpen ? (
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/66">
          {action.why.length ? action.why.map((item) => <li key={item}>- {item}</li>) : <li>{action.reason}</li>}
        </ul>
      ) : null}
      {error ? <p className="mt-4 rounded-2xl border border-[#fca5a5]/30 bg-[#7f1d1d]/25 p-3 text-sm font-bold text-[#fecaca]" role="alert">{error.message}</p> : null}
    </article>
  );
}
