"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
    retry: "Retry",
    details: "Action details"
  },
  fr: {
    start: "Commencer",
    complete: "Marquer terminé",
    skip: "Ignorer",
    why: "Pourquoi PATHZY recommande cela",
    pending: "Enregistrement...",
    blocked: "Bloqué par",
    retry: "Réessayer",
    details: "Détails de l'action"
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
  const pending = pendingActionCode === action.code;
  const isPrimary = priority === "primary";
  const t = copy[language];

  async function transitionAndRefresh(type: "start" | "complete" | "skip") {
    const result = await transition({ actionCode: action.code, transition: type });
    if (result) router.refresh();
  }

  return (
    <article className={`flex h-full min-w-0 flex-col rounded-[28px] border p-5 shadow-[0_18px_60px_rgba(0,0,0,.16)] ${isPrimary ? "border-[#d93a46]/40 bg-[#111827]" : "border-white/10 bg-white/7"}`} aria-label={`${t.details}: ${action.title}`}>
      <div className="min-w-0 flex-1">
        <h2 className={`${isPrimary ? "text-2xl md:text-3xl" : "text-lg md:text-xl"} max-w-full font-black leading-tight tracking-normal text-white [overflow-wrap:anywhere]`}>{action.title}</h2>
        <p className="mt-3 max-w-3xl text-sm font-bold leading-6 text-white/68 [overflow-wrap:anywhere]">{action.explanation}</p>
        {action.blocker ? <p className="mt-3 rounded-2xl border border-white/10 bg-white/8 p-3 text-sm font-bold text-white/72 [overflow-wrap:anywhere]">{t.blocked}: {action.blocker}</p> : null}
      </div>
      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4">
        <div className="rounded-2xl border border-white/10 bg-white/8 p-3">
          <p className="text-sm font-extrabold text-[var(--brand-primary)] [overflow-wrap:anywhere]">{t.why}</p>
          <p className="mt-1 text-sm leading-6 text-white/66 [overflow-wrap:anywhere]">{action.whySentence}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <Link href={action.href} onClick={() => void transitionAndRefresh("start")} className="tap-target inline-flex min-h-12 min-w-0 items-center justify-center rounded-full blue-purple px-5 py-3 text-center text-sm font-extrabold text-white [overflow-wrap:anywhere] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d93a46]">
            {pending ? t.pending : t.start}
          </Link>
          <button type="button" disabled={pending} onClick={() => void transitionAndRefresh("complete")} className="min-h-10 min-w-0 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-bold text-white/70 [overflow-wrap:anywhere] disabled:opacity-50">
            {t.complete}
          </button>
          <button type="button" disabled={pending} onClick={() => void transitionAndRefresh("skip")} className="min-h-10 min-w-0 rounded-full border border-white/12 bg-transparent px-4 py-2 text-xs font-bold text-white/58 [overflow-wrap:anywhere] disabled:opacity-50">
            {t.skip}
          </button>
        </div>
      </div>
      {error ? <p className="mt-4 rounded-2xl border border-[#fca5a5]/30 bg-[#7f1d1d]/25 p-3 text-sm font-bold text-[#fecaca]" role="alert">{error.message}</p> : null}
    </article>
  );
}
