import { ButtonLink, Card, ProgressBar } from "@/components/ui";
import type { ProgressMilestone } from "@/lib/progress/progress-engine";

const descriptions: Record<string, string> = {
  profile: "Add the basics PATHZY needs to guide you.",
  discovery: "Answer a few questions about your background, interests, and goals.",
  choose_career: "Pick the direction your documents and applications should support.",
  cv: "Create the CV employers will use to understand you.",
  cover_letter: "Prepare a focused letter for real opportunities.",
  linkedin: "Make your online profile clearer.",
  career_passport: "Bring your story, strengths, and direction into one place.",
  opportunities: "Find roles, programmes, and learning that fit you.",
  applications: "Start applying and tracking what happens next.",
  interview_prep: "Prepare your answers before conversations with employers.",
  employment: "Track offers and your move into work."
};

export function PathzyTimeline({
  milestones,
  current,
  progress
}: {
  milestones: ProgressMilestone[];
  current: ProgressMilestone;
  progress: number;
}) {
  const remaining = milestones.filter((milestone) => !milestone.complete && milestone.key !== current.key);
  const next = remaining[0];
  const later = remaining.slice(1, 5);

  return (
    <Card>
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">PATHZY Timeline</p>
          <h2 className="mt-2 text-3xl font-black">From Potential to Employment</h2>
          <p className="mt-3 leading-7 text-white/58">A simple view of where you are and what comes next.</p>
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm font-bold text-white/52">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <ProgressBar value={progress} />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[22px] border border-[#5B8CFF]/35 bg-[#5B8CFF]/12 p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#c7d6ff]/72">Today&apos;s step</p>
            <h3 className="mt-2 text-2xl font-black">{current.title}</h3>
            <p className="mt-2 leading-7 text-white/62">{descriptions[current.key] ?? current.why}</p>
            <div className="mt-4">
              <ButtonLink href={current.href}>Continue My Journey</ButtonLink>
            </div>
          </div>

          {next ? (
            <div className="rounded-[20px] border border-white/10 bg-white/7 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Up next</p>
              <h3 className="mt-2 text-xl font-black">{next.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/56">{descriptions[next.key] ?? next.why}</p>
            </div>
          ) : null}

          {later.length ? (
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Later</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {later.map((milestone) => (
                  <span key={milestone.key} className="rounded-full border border-white/10 bg-white/7 px-3 py-2 text-xs font-bold text-white/58">
                    {milestone.title}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
