import { Card } from "@/components/ui";
import type { SkillGap } from "@/lib/pathzy-brain/types";

export function SkillGapSummary({ skillGaps }: { skillGaps: SkillGap[] }) {
  const gaps = skillGaps.length
    ? skillGaps
    : [
        {
          target_career: "Career starter",
          missing_skill: "Portfolio proof",
          priority: "medium" as const,
          estimated_time_to_learn: "1-2 weeks",
          recommended_action: "Create one small proof-of-work project tied to your career plan."
        }
      ];

  return (
    <Card>
      <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Skill gaps</p>
      <h2 className="mt-2 text-2xl font-black">Close the gaps blocking employment readiness.</h2>
      <div className="mt-5 grid gap-3">
        {gaps.slice(0, 4).map((gap) => (
          <div key={`${gap.target_career}-${gap.missing_skill}`} className="rounded-[18px] border border-white/10 bg-white/7 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <strong className="text-white/82">{gap.missing_skill}</strong>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold capitalize text-white/58">{gap.priority}</span>
            </div>
            <p className="mt-2 text-sm text-white/45">{gap.target_career} - {gap.estimated_time_to_learn}</p>
            <p className="mt-2 text-sm leading-6 text-white/62">{gap.recommended_action}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
