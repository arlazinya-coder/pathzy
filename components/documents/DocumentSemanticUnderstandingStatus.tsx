export function DocumentSemanticUnderstandingStatus({ status = "idle" }: { status?: "idle" | "understanding" | "completed" | "failed" }) {
  const steps = [
    "Identifying your profession",
    "Understanding your work experience",
    "Recognising your education",
    "Identifying skills and qualifications",
    "Connecting dates, employers, and roles",
    "Preparing your information for review"
  ];
  if (status === "idle") return null;
  return (
    <div className="pathzy-status-success mt-4 rounded-[18px] border p-4" aria-live="polite">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em]">
        {status === "failed" ? "Semantic understanding needs attention" : status === "completed" ? "Semantic understanding complete" : "Understanding your career information"}
      </p>
      <div className="mt-3 grid gap-2">
        {steps.map((step) => (
          <div key={step} className="flex items-center gap-2 text-sm font-bold text-white/70">
            <span className={`h-2 w-2 rounded-full ${status === "understanding" ? "bg-[var(--status-success)]" : status === "failed" ? "bg-[#ff6b6b]" : "bg-[var(--status-success)]"}`} />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
