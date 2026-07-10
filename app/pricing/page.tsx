import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { getLaunchMembershipStats } from "@/lib/launch/launch-service";
import { pricingPlans } from "@/lib/pathzy-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PricingPage() {
  const supabase = await createSupabaseServerClient();
  const stats = supabase
    ? await getLaunchMembershipStats(supabase)
    : { foundingTestersClaimed: 0, foundingTestersRemaining: 20, earlyAdoptersClaimed: 0, earlyAdoptersRemaining: 100, totalLaunchMembers: 0 };

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Pricing" title="Start strong. Upgrade as your future gets clearer.">
        Start free. Experience PATHZY first. Upgrade only when you need downloads, advanced optimization, interview coaching, and deeper employment support.
      </PageHeader>
      <Card className="mb-6 border-[#39d98a]/30 bg-[#39d98a]/10">
        <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#9df0c4]">Private Launch Offer</span>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-black">First 20: Founding Testers</h2>
            <p className="mt-2 leading-7 text-white/62">Free Premium for 12 months. {stats.foundingTestersClaimed} / 20 claimed.</p>
          </div>
          <div>
            <h2 className="text-2xl font-black">Founder Access</h2>
            <p className="mt-2 leading-7 text-white/62">Invite-only Founder accounts receive Premium access, a Founder badge, and priority support during beta.</p>
          </div>
        </div>
        <p className="mt-5 text-sm font-bold leading-6 text-white/58">PATHZY helps improve job readiness and application quality. It does not guarantee jobs or interviews.</p>
        <p className="mt-5 text-sm font-bold leading-6 text-white/58">Founder access is reserved for internal testers and is managed from Profile/Billing, not the normal journey.</p>
      </Card>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {pricingPlans.filter((plan) => plan.name !== "Founder").map((plan) => (
          <Card key={plan.name} className={plan.featured ? "relative overflow-hidden border-[#7B5CFF]/50 bg-[linear-gradient(145deg,rgba(91,140,255,.20),rgba(123,92,255,.24))]" : ""}>
            {plan.featured ? <span className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[#0B1020]">Most popular</span> : null}
            <h2 className="text-2xl font-black">{plan.name}</h2>
            <p className="mt-2 min-h-12 text-white/58">{plan.description}</p>
            <div className="my-6">
              <strong className="text-5xl font-black">{plan.price}</strong>
              <span className="ml-2 text-white/48">/{plan.cadence}</span>
            </div>
            {"annual" in plan ? <p className="mb-5 rounded-full bg-white/8 px-4 py-2 text-sm font-bold text-white/58">Annual option: {plan.annual}</p> : null}
            <div className="grid gap-3">
              {plan.features.map((feature) => (
                <div key={feature} className="rounded-[16px] border border-white/10 bg-white/7 px-4 py-3 text-sm font-bold text-white/70">{feature}</div>
              ))}
            </div>
            <div className="mt-6">
              <ButtonLink href="/signup" variant={plan.featured ? "primary" : "secondary"}>
                {plan.name === "Free" ? "Start Free" : "Choose Plan"}
              </ButtonLink>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
