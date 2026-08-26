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
    <div className="pathzy-status-info mt-4 rounded-[18px] border p-4" aria-live="polite">
      <p className="pathzy-eyebrow-accent text-xs font-extrabold uppercase tracking-[0.14em]">
        {status === "failed" ? "Inspection needs attention" : status === "completed" ? "Document inspection complete" : "Inspecting your document"}
      </p>
      <div className="mt-3 grid gap-2">
        {steps.map((step) => (
          <div key={step} className="flex items-center gap-2 text-sm font-bold text-white/70">
            <span className={`h-2 w-2 rounded-full ${status === "inspecting" ? "bg-[var(--brand-primary)]" : status === "failed" ? "bg-[var(--status-danger)]" : "bg-[var(--status-success)]"}`} />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
