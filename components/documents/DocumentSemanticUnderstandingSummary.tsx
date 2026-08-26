import type { SemanticDocumentModel } from "@/lib/documents/semantic";

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function DocumentSemanticUnderstandingSummary({ semanticReading }: { semanticReading: SemanticDocumentModel | null | undefined }) {
  if (!semanticReading) return null;
  const rows = [
    ["Profession detected", semanticReading.professionalProfile?.profession?.value ?? semanticReading.professionalProfile?.headline?.value ?? "Needs review"],
    ["Employment entries", String(semanticReading.employment.length)],
    ["Education entries", String(semanticReading.education.length)],
    ["Certifications", String(semanticReading.certifications.length)],
    ["Skills", String(semanticReading.skills.length)],
    ["Languages", String(semanticReading.languages.length)],
    ["Confidence", percent(semanticReading.confidence.overall)],
    ["Review", semanticReading.status === "manual_review_required" ? "Required" : semanticReading.warnings.length ? "Recommended" : "Ready"]
  ];
  return (
    <section className="pathzy-status-success mt-4 rounded-[18px] border p-4" aria-label="Semantic understanding summary">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em]">Semantic Understanding Complete</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-[14px] border border-white/10 bg-white/7 p-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/42">{label}</p>
            <p className="mt-1 text-sm font-black text-white/84">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-[14px] border border-white/10 bg-white/7 px-3 py-2 text-sm font-bold text-white/72">
        Ready for review. PATHZY has not changed your profile automatically.
      </p>
      {semanticReading.warnings.length ? (
        <div className="mt-3 grid gap-2">
          {semanticReading.warnings.slice(0, 4).map((warning) => (
            <p key={`${warning.code}-${warning.regionIds?.join("-") ?? "document"}`} className="pathzy-status-warning rounded-[14px] border px-3 py-2 text-sm font-bold">
              {warning.message}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
