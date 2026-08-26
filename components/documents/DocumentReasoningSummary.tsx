import type { ReasoningRunSummary } from "@/lib/documents/reasoning";

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function DocumentReasoningSummary({ reasoning }: { reasoning: ReasoningRunSummary | null | undefined }) {
  if (!reasoning) return null;
  const rows = [
    ["Possible matches", String(reasoning.matches)],
    ["Information conflicts", String(reasoning.conflicts)],
    ["Needs confirmation", String(reasoning.questions)],
    ["Confidence", percent(reasoning.confidence)]
  ];
  return (
    <section className="pathzy-status-info mt-4 rounded-[18px] border p-4" aria-label="Career information check summary">
      <p className="pathzy-eyebrow-accent text-xs font-extrabold uppercase tracking-[0.14em]">Career Information Check</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-[14px] border border-white/10 bg-white/7 p-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/42">{label}</p>
            <p className="mt-1 text-sm font-black text-white/84">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-[14px] border border-white/10 bg-white/7 px-3 py-2 text-sm font-bold text-white/72">
        PATHZY has not changed your profile automatically. Any important match or conflict will ask for your confirmation first.
      </p>
      {reasoning.cases.slice(0, 3).map((item) => (
        <p key={item.id} className="mt-2 rounded-[14px] border border-white/10 bg-white/7 px-3 py-2 text-sm font-bold text-[#dce6ff]">
          {item.decision?.explanation ?? "PATHZY found a career record that may need review."}
        </p>
      ))}
    </section>
  );
}
