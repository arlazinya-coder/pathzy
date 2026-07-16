export function DocumentInspectionStatus({ status = "idle" }: { status?: "idle" | "inspecting" | "completed" | "failed" }) {
  const steps = [
    "Checking document type",
    "Checking pages and layout",
    "Checking language",
    "Checking document quality",
    "Deciding whether OCR is needed"
  ];
  if (status === "idle") return null;
  return (
    <div className="mt-4 rounded-[18px] border border-[#5B8CFF]/20 bg-[#5B8CFF]/10 p-4" aria-live="polite">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#c7d6ff]/72">
        {status === "failed" ? "Inspection needs attention" : status === "completed" ? "Document inspection complete" : "Inspecting your document"}
      </p>
      <div className="mt-3 grid gap-2">
        {steps.map((step) => (
          <div key={step} className="flex items-center gap-2 text-sm font-bold text-white/70">
            <span className={`h-2 w-2 rounded-full ${status === "inspecting" ? "bg-[#5B8CFF]" : status === "failed" ? "bg-[#ff6b6b]" : "bg-[#39d98a]"}`} />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
