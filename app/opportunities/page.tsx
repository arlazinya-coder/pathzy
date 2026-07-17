import { OpportunitiesHub } from "@/components/opportunities/opportunities-hub";
import { PageHeader } from "@/components/ui";
import { getOrCreateCanonicalProfile } from "@/lib/canonical-profile";
import type { DiscoveryAnswers, GeneratedRoadmap } from "@/lib/discovery/types";
import { analyzeJobAgainstCanonicalProfile, inspectJobAdvertisement, type JobMatchAnalysis } from "@/lib/job-intelligence";
import { personalizeOpportunities } from "@/lib/opportunities/data";
import type { OpportunityAction, PersonalizedOpportunity } from "@/lib/opportunities/types";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

function opportunityJobText(opportunity: PersonalizedOpportunity) {
  return [
    `Job title: ${opportunity.title}`,
    `Company: ${opportunity.provider}`,
    `Location: ${opportunity.country}`,
    `Mode: ${opportunity.mode}`,
    `Level: ${opportunity.level}`,
    opportunity.description,
    `Required or useful skills: ${opportunity.skillTags.join(", ")}`,
    `Career direction: ${opportunity.careerTags.join(", ")}`,
    `Outcome: ${opportunity.outcome}`
  ].join("\n");
}

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
  let jobIntelligence: Record<string, JobMatchAnalysis> = {};

  try {
    const canonicalProfile = await getOrCreateCanonicalProfile(supabase, user.id);
    jobIntelligence = Object.fromEntries(
      personalizedOpportunities.slice(0, 12).map((opportunity) => {
        const job = inspectJobAdvertisement({
          sourceType: "opportunity_catalog",
          sourceOpportunityId: opportunity.id,
          title: opportunity.title,
          company: opportunity.provider,
          location: opportunity.country,
          employmentType: opportunity.mode,
          rawText: opportunityJobText(opportunity)
        });
        return [opportunity.id, analyzeJobAgainstCanonicalProfile({ profile: canonicalProfile, job, userId: user.id })];
      })
    );
  } catch (error) {
    console.warn("[job-intelligence] opportunity analysis unavailable", error);
  }

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Find Opportunities" title="Find chances that match your career plan.">
        PATHZY ranks jobs, internships, learnerships, apprenticeships, scholarships, free courses, and certifications by fit, readiness, location, and the skills you are building.
      </PageHeader>
      <OpportunitiesHub initialOpportunities={personalizedOpportunities} initialJobIntelligence={jobIntelligence} />
    </div>
  );
}
