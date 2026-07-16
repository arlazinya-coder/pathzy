import type { VisualDocumentModel } from "@/lib/documents/visual";

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function DocumentVisualReadingSummary({ visualReading }: { visualReading: VisualDocumentModel | null | undefined }) {
  if (!visualReading) return null;
  const rows = [
    ["Pages read", String(visualReading.pages.length)],
    ["Sections", String(visualReading.sections.length)],
    ["Reading order", percent(visualReading.confidence.readingOrder)],
    ["Layout confidence", percent(visualReading.confidence.layout)],
    ["Tables", String(visualReading.tables.length)],
    ["Timelines", String(visualReading.timelines.length)],
    ["Images", String(visualReading.images.length)],
    ["Icons", String(visualReading.icons.length)]
  ];
  return (
    <section className="mt-4 rounded-[18px] border border-[#9D5BFF]/20 bg-[#9D5BFF]/10 p-4" aria-label="Visual document reading summary">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#e0d2ff]/78">Visual Reading Complete</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-[14px] border border-white/10 bg-white/7 p-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/42">{label}</p>
            <p className="mt-1 text-sm font-black text-white/84">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-[14px] border border-white/10 bg-white/7 px-3 py-2 text-sm font-bold text-white/72">
        PATHZY preserved the document layout, hierarchy and reading order before extracting CV content.
      </p>
      {visualReading.warnings.length ? (
        <div className="mt-3 grid gap-2">
          {visualReading.warnings.map((warning) => (
            <p key={`${warning.code}-${warning.pageNumber ?? "document"}`} className="rounded-[14px] border border-[#ffd166]/20 bg-[#ffd166]/10 px-3 py-2 text-sm font-bold text-[#ffe7a3]">
              {warning.message}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
