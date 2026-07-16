import { Card, ProgressBar } from "@/components/ui";
import type { CanonicalProfileSummary } from "@/lib/canonical-profile";

function readinessLabel(readiness: CanonicalProfileSummary["readiness"]) {
  if (readiness === "ready") return "Ready";
  if (readiness === "ready_with_warnings") return "Ready with guidance";
  if (readiness === "review_required") return "Review needed";
  return "Getting started";
}

export function CanonicalProfileOverview({ summary }: { summary: CanonicalProfileSummary }) {
  return (
    <Card className="mb-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_.85fr]">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">PATHZY Professional Identity</p>
          <h2 className="mt-3 text-3xl font-black">One profile for every career document.</h2>
          <p className="mt-3 max-w-3xl leading-7 text-white/62">
            PATHZY now keeps confirmed career information in one evidence-backed profile. Your CV, cover letter, LinkedIn content, applications, and career guidance can all read from the same source as this foundation grows.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-[#74d4ff]/30 bg-[#74d4ff]/10 px-3 py-1 text-xs font-extrabold text-[#bdefff]">{readinessLabel(summary.readiness)}</span>
            <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-xs font-extrabold text-white/60">Version {summary.version}</span>
            {summary.reviewNeededCount ? (
              <span className="rounded-full border border-[#f8c45d]/30 bg-[#f8c45d]/10 px-3 py-1 text-xs font-extrabold text-[#ffe2a8]">{summary.reviewNeededCount} item{summary.reviewNeededCount === 1 ? "" : "s"} to review</span>
            ) : (
              <span className="rounded-full border border-[#9df0c4]/30 bg-[#9df0c4]/10 px-3 py-1 text-xs font-extrabold text-[#c8ffde]">No review alerts</span>
            )}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm font-bold text-white/50">
              <span>Completion</span>
              <span>{summary.completion}%</span>
            </div>
            <ProgressBar value={summary.completion} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm font-bold text-white/50">
              <span>Confidence</span>
              <span>{summary.confidence}%</span>
            </div>
            <ProgressBar value={summary.confidence} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm font-bold text-white/50">
              <span>Consistency</span>
              <span>{summary.consistency}%</span>
            </div>
            <ProgressBar value={summary.consistency} />
          </div>
        </div>
      </div>
    </Card>
  );
}

