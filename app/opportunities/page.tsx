import { OpportunitiesHub } from "@/components/opportunities/opportunities-hub";
import { PageHeader } from "@/components/ui";
import type { DiscoveryAnswers, GeneratedRoadmap } from "@/lib/discovery/types";
import { personalizeOpportunities } from "@/lib/opportunities/data";
import type { OpportunityAction } from "@/lib/opportunities/types";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function OpportunitiesPage() {
  const { user, supabase } = await requireAuthenticatedUser("/opportunities");

  const [{ data: profile }, { data: discovery }, { data: actions }] = await Promise.all([
    supabase.from("user_profiles").select("country").or(`user_id.eq.${user.id},id.eq.${user.id}`).maybeSingle(),
    supabase
      .from("discovery_responses")
      .select("answers,generated_result")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("user_opportunity_actions").select("opportunity_id,saved,applied,completed,hidden").eq("user_id", user.id)
  ]);

  const personalizedOpportunities = personalizeOpportunities({
    answers: (discovery?.answers as Partial<DiscoveryAnswers> | null) ?? null,
    roadmap: (discovery?.generated_result as GeneratedRoadmap | null) ?? null,
    country: profile?.country ?? null,
    actions: (actions ?? []) as OpportunityAction[]
  });

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Find Opportunities" title="Find chances that match your career plan.">
        PATHZY ranks jobs, internships, learnerships, apprenticeships, scholarships, free courses, and certifications by fit, readiness, location, and the skills you are building.
      </PageHeader>
      <OpportunitiesHub initialOpportunities={personalizedOpportunities} />
    </div>
  );
}
