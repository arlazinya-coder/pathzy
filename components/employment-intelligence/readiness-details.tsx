import { Card } from "@/components/ui";
import type { EmploymentHomeViewModel, EmploymentIntelligenceLanguage } from "@/lib/employment-intelligence/client";

export function ReadinessDetails({ model, language }: { model: EmploymentHomeViewModel; language: EmploymentIntelligenceLanguage }) {
  return (
    <Card>
      <details>
        <summary className="cursor-pointer text-xl font-black text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d93a46]">
          {language === "fr" ? "Voir les détails de préparation" : "View readiness details"}
        </summary>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {model.dimensions.map((dimension) => (
            <article key={dimension.key} className="rounded-3xl border border-white/10 bg-white/7 p-4">
              <p className="text-sm font-black capitalize text-white">{dimension.name}</p>
              <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#93c5fd]">{dimension.band}</p>
              <p className="mt-3 text-sm leading-6 text-white/62">{dimension.explanation}</p>
              {dimension.missingInformation.length ? <p className="mt-3 text-sm font-bold text-white/58">{dimension.missingInformation.join(", ")}</p> : null}
            </article>
          ))}
        </div>
      </details>
    </Card>
  );
}
