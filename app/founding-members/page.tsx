import { ClaimFounderButton } from "@/components/founding/claim-founder-button";
import { ButtonLink, Card, PageHeader, ProgressBar } from "@/components/ui";
import { getLaunchMembershipStats, getMembershipState } from "@/lib/launch/launch-service";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";

const foundingBenefits = [
  "Free Premium for 12 months",
  "Founding Tester badge and member number",
  "Unlimited Mentor access",
  "Full professional profile tools",
  "CV and cover letter creation",
  "Career Passport and My Documents",
  "Direct founder support",
  "Early access to new PATHZY features"
];

function phaseLabel(value?: string) {
  if (value === "Founding Tester") return "Founding Tester";
  return "Public Member";
}

export default async function FoundingMembersPage() {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();
  const stats = supabase
    ? await getLaunchMembershipStats(supabase, user?.id)
    : { foundingTestersClaimed: 0, foundingTestersRemaining: 20, earlyAdoptersClaimed: 0, earlyAdoptersRemaining: 100, totalLaunchMembers: 0 };
  const membership = user && supabase ? await getMembershipState(supabase, user.id) : null;
  const hasFounderAccess = Boolean(membership?.isFounder);
  const founderSpotsFull = stats.foundingTestersRemaining <= 0 && !hasFounderAccess && process.env.NODE_ENV === "production";
  const progress = Math.min(100, (stats.foundingTestersClaimed / 20) * 100);

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Private Launch" title="Claim your PATHZY Founder spot">
        Founding Testers receive Premium access for 12 months while helping shape PATHZY before public launch.
      </PageHeader>

      {hasFounderAccess && membership ? (
        <Card className="mb-6 border-[#39d98a]/30 bg-[#39d98a]/10">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#9df0c4]/70">Your launch membership</p>
          <h2 className="mt-2 text-3xl font-black">{membership.label}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[18px] border border-white/10 bg-white/7 p-4"><p className="text-xs text-white/42">Phase</p><strong>{phaseLabel(membership.badge)}</strong></div>
            <div className="rounded-[18px] border border-white/10 bg-white/7 p-4"><p className="text-xs text-white/42">Access</p><strong className="capitalize">{membership.accessLevel}</strong></div>
            <div className="rounded-[18px] border border-white/10 bg-white/7 p-4"><p className="text-xs text-white/42">Member number</p><strong>{membership.memberNumber ? `#${membership.memberNumber}` : "Assigned"}</strong></div>
          </div>
          <div className="mt-5">
            <ButtonLink href="/dashboard">Open My Journey</ButtonLink>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(57,217,138,.20),transparent_22rem)]" />
          <div className="relative">
            <span className="rounded-full bg-[#39d98a]/15 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#9df0c4]">Founding Testers</span>
            <h2 className="mt-5 text-4xl font-black">{stats.foundingTestersRemaining} Founder spots remaining</h2>
            <p className="mt-3 text-white/62">20 total beta Founder places. {stats.foundingTestersClaimed} claimed.</p>
            <div className="mt-5"><ProgressBar value={progress} /></div>
            <div className="mt-6">
              {hasFounderAccess ? (
                <ButtonLink href="/dashboard">Founder Premium Active</ButtonLink>
              ) : user ? (
                <ClaimFounderButton disabled={founderSpotsFull} />
              ) : (
                <ButtonLink href="/signup">{founderSpotsFull ? "Join Waiting List" : "Create Account to Claim"}</ButtonLink>
              )}
            </div>
            <p className="mt-4 text-sm leading-6 text-white/48">Early Adopters will open automatically after the Founder beta period.</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-3xl font-black">Founder benefits</h2>
          <div className="mt-5 grid gap-3">
            {foundingBenefits.map((benefit) => (
              <div key={benefit} className="rounded-[16px] border border-white/10 bg-white/7 px-4 py-3 text-sm font-bold text-white/70">{benefit}</div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-2xl font-black">What happens after claiming?</h2>
            <p className="mt-2 leading-7 text-white/58">PATHZY activates your Founder badge, premium access, 12-month expiry, and premium feature access immediately, then sends you back to My Journey.</p>
          </div>
          <ButtonLink href={user ? "/dashboard" : "/signup"}>{user ? "Open My Journey" : "Start Free"}</ButtonLink>
        </div>
      </Card>
    </div>
  );
}
