import { ButtonLink, Card, ProgressBar } from "@/components/ui";
import { getPathzyNextAction } from "@/lib/progress/next-action-engine";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

function greetingForNow(name?: string | null) {
  const hour = new Date().getHours();
  const suffix = name ? `, ${name}` : "";
  if (hour >= 5 && hour < 12) return `Good morning${suffix}.`;
  if (hour >= 12 && hour < 17) return `Good afternoon${suffix}.`;
  if (hour >= 17 && hour < 22) return `Good evening${suffix}.`;
  return name ? `Working late, ${name}?` : "Working late?";
}

function getFirstName(fullName?: string | null, email?: string | null) {
  const cleanName = fullName?.trim();
  if (cleanName) return cleanName.split(/\s+/)[0];
  return email?.split("@")[0] || "";
}

export default async function DashboardPage() {
  const { user, supabase } = await requireAuthenticatedUser("/dashboard");
  const [{ data: profile }, nextAction] = await Promise.all([
    supabase.from("user_profiles").select("full_name,email").or(`user_id.eq.${user.id},id.eq.${user.id}`).maybeSingle(),
    getPathzyNextAction(supabase, user)
  ]);

  const firstName = getFirstName(profile?.full_name, user.email);
  const currentStep = nextAction.milestone;
  const availableActions = nextAction.availableActions;
  const journeyProgress = nextAction.progressPercent;
  const remainingSteps = nextAction.milestones.filter((milestone) => !milestone.complete && milestone.key !== currentStep.key);
  const nextStep = remainingSteps[0];
  const laterSteps = remainingSteps.slice(1, 5);

  return (
    <div className="container page-pad">
      <section className="mx-auto max-w-3xl">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#5B8CFF]/70 to-transparent" />
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">My Employment Journey</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.04] tracking-normal md:text-6xl">
            <span className="gradient-text">{greetingForNow(firstName)}</span>
          </h1>

          <div className="mt-8 rounded-[24px] border border-[#5B8CFF]/24 bg-[#5B8CFF]/10 p-5">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#c7d6ff]/72">Today&apos;s step</p>
            <h2 className="mt-3 text-3xl font-black">{nextAction.label}</h2>
          </div>

          <div className="mt-6 grid gap-4">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Why this matters</p>
              <p className="mt-2 text-lg leading-8 text-white/70">{nextAction.reason}</p>
            </div>
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Estimated time</p>
              <p className="mt-2 text-lg font-black text-white/82">{currentStep.time}</p>
            </div>
          </div>

          <div className="mt-7">
            <ButtonLink href={nextAction.destinationRoute}>Continue My Journey</ButtonLink>
          </div>

          {availableActions.length ? (
            <div className="mt-5 rounded-[20px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Available now</p>
              <p className="mt-2 text-sm leading-6 text-white/58">PATHZY recommends one next step, but you can still move forward with other career actions.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {availableActions.map((action) => (
                  <ButtonLink key={action.key} href={action.primaryRoute} variant="secondary">
                    {action.title}
                  </ButtonLink>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8">
            <div className="mb-2 flex justify-between text-sm font-bold text-white/52">
              <span>Progress to employment</span>
              <span>{journeyProgress}%</span>
            </div>
            <ProgressBar value={journeyProgress} />
          </div>

          {nextStep ? (
            <div className="mt-8 rounded-[20px] border border-white/10 bg-white/7 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Up next</p>
              <h3 className="mt-2 text-xl font-black">{nextStep.title}</h3>
            </div>
          ) : null}

          {laterSteps.length ? (
            <div className="mt-4 rounded-[20px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Later</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {laterSteps.map((milestone) => (
                  <span key={milestone.key} className="rounded-full border border-white/10 bg-white/7 px-3 py-2 text-xs font-bold text-white/58">
                    {milestone.title}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      </section>
    </div>
  );
}
