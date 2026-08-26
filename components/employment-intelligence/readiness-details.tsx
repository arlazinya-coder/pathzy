import { Card } from "@/components/ui";
import type { EmploymentHomeViewModel, EmploymentIntelligenceLanguage } from "@/lib/employment-intelligence/client";

export function ReadinessDetails({ model, language }: { model: EmploymentHomeViewModel; language: EmploymentIntelligenceLanguage }) {
  return (
    <Card>
      <details>
        <summary className="cursor-pointer text-xl font-black text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d93a46]">
          {language === "fr" ? "Voir les détails de préparation" : "View readiness details"}
        </summary>
        <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-3">
          {model.dimensions.map((dimension) => (
            <article key={dimension.key} className="min-w-0 rounded-3xl border border-white/10 bg-white/7 p-4">
              <p className="text-sm font-black capitalize text-white [overflow-wrap:anywhere]">{dimension.name}</p>
              <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--brand-primary)] [overflow-wrap:anywhere]">{dimension.band}</p>
              <p className="mt-3 text-sm leading-6 text-white/62 [overflow-wrap:anywhere]">{dimension.explanation}</p>
              {dimension.missingInformation.length ? <p className="mt-3 text-sm font-bold text-white/58 [overflow-wrap:anywhere]">{dimension.missingInformation.join(", ")}</p> : null}
            </article>
          ))}
        </div>
      </details>
    </Card>
  );
}
