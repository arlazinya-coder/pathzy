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
    <div className="mt-4 rounded-[18px] border border-[#39d98a]/20 bg-[#39d98a]/10 p-4" aria-live="polite">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#b9f8d5]/78">
        {status === "failed" ? "Semantic understanding needs attention" : status === "completed" ? "Semantic understanding complete" : "Understanding your career information"}
      </p>
      <div className="mt-3 grid gap-2">
        {steps.map((step) => (
          <div key={step} className="flex items-center gap-2 text-sm font-bold text-white/70">
            <span className={`h-2 w-2 rounded-full ${status === "understanding" ? "bg-[#39d98a]" : status === "failed" ? "bg-[#ff6b6b]" : "bg-[#39d98a]"}`} />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
