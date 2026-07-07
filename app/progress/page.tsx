import { ButtonLink, Card, PageHeader, ProgressBar } from "@/components/ui";
import { dashboardMetrics } from "@/lib/pathzy-data";

const goals = [
  ["Current Goal", "Keep moving toward the career direction PATHZY recommended."],
  ["Skills to Improve", "Focus on the next practical skill that supports your chosen role."],
  ["Recommended Learning", "Use free courses, certificates, and small projects to build proof."],
  ["Today's Advice", "Complete one useful step before opening another task."]
] as const;

export default function ProgressPage() {
  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Skills & Career Growth" title="Build skills that improve your employment chances.">
        See your current goal, skills to improve, recommended learning, recent progress, and the next growth action.
      </PageHeader>
      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Next action</p>
            <h2 className="mt-2 text-2xl font-black">Complete one skill step today.</h2>
            <p className="mt-2 leading-7 text-white/62">Use today&apos;s mission or build your CV while you keep improving your strongest skill gap.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/missions">Start Skill Mission</ButtonLink>
            <ButtonLink href="/professional-identity/cv" variant="secondary">Build CV</ButtonLink>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboardMetrics.map((metric) => (
          <Card key={metric.label}>
            <p className="text-sm font-bold text-white/50">{metric.label}</p>
            <strong className="mt-2 block text-4xl font-black">{metric.value}<span className="text-xl text-white/48">{metric.suffix}</span></strong>
            <div className="mt-5"><ProgressBar value={Math.min(Number(metric.value), 100)} /></div>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-4">
        {goals.map(([title, body]) => (
          <Card key={title}>
            <h2 className="text-lg font-black">{title}</h2>
            <p className="mt-3 leading-7 text-white/62">{body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
