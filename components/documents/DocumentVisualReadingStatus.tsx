export function DocumentVisualReadingStatus({ status = "idle" }: { status?: "idle" | "reading" | "completed" | "failed" }) {
  const steps = [
    "Reading page structure",
    "Detecting sections and columns",
    "Preserving reading order",
    "Finding tables, timelines and icons",
    "Preparing the document for safe extraction"
  ];
  if (status === "idle") return null;
  return (
    <div className="mt-4 rounded-[18px] border border-[#9D5BFF]/20 bg-[#9D5BFF]/10 p-4" aria-live="polite">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#e0d2ff]/78">
        {status === "failed" ? "Visual reading needs attention" : status === "completed" ? "Visual reading complete" : "Understanding document layout"}
      </p>
      <div className="mt-3 grid gap-2">
        {steps.map((step) => (
          <div key={step} className="flex items-center gap-2 text-sm font-bold text-white/70">
            <span className={`h-2 w-2 rounded-full ${status === "reading" ? "bg-[#9D5BFF]" : status === "failed" ? "bg-[#ff6b6b]" : "bg-[#39d98a]"}`} />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
