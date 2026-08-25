import { OpportunitiesHub } from "@/components/opportunities/opportunities-hub";
import { PageHeader } from "@/components/ui";
import { getOrCreateCanonicalProfile, valueText, type CanonicalProfessionalIdentity } from "@/lib/canonical-profile";
import { analyzeJobAgainstCanonicalProfile, inspectJobAdvertisement, type JobMatchAnalysis } from "@/lib/job-intelligence";
import { opportunityToJobImportText, personalizeRealOpportunities } from "@/lib/opportunities/matching";
import type { OpportunityAction } from "@/lib/opportunities/types";
import { fetchProductionOpportunities } from "@/lib/opportunities/providers";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

function firstText(values: Array<string | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean) ?? "";
}

function opportunitySearchFromProfile(canonicalProfile: CanonicalProfessionalIdentity) {
  return {
    query: firstText([
      valueText(canonicalProfile.professionalProfile.headline),
      ...canonicalProfile.professionalProfile.targetRoles.map(valueText),
      ...(canonicalProfile.careerPreferences?.targetRoles.map(valueText) ?? []),
      valueText(canonicalProfile.identity.professionalHeadline)
    ]) || "entry level",
    location: firstText([
      valueText(canonicalProfile.contact.city),
      ...(canonicalProfile.careerPreferences?.preferredLocations.map(valueText) ?? [])
    ]),
    country: firstText([valueText(canonicalProfile.contact.country)]) || "South Africa"
  };
}

export default async function OpportunitiesPage() {
  const { user, supabase } = await requireAuthenticatedUser("/opportunities");

  const canonicalProfile = await getOrCreateCanonicalProfile(supabase, user.id);
  const search = opportunitySearchFromProfile(canonicalProfile);
  const [{ data: actions }, providerResult] = await Promise.all([
    supabase.from("user_opportunity_actions").select("opportunity_id,saved,applied,completed,hidden").eq("user_id", user.id),
    fetchProductionOpportunities({ ...search, resultsPerPage: 20 })
  ]);

  const personalizedOpportunities = personalizeRealOpportunities({
    opportunities: providerResult.opportunities,
    profile: canonicalProfile,
    actions: (actions ?? []) as OpportunityAction[]
  });
  let jobIntelligence: Record<string, JobMatchAnalysis> = {};

  try {
    jobIntelligence = Object.fromEntries(
      personalizedOpportunities.slice(0, 12).map((opportunity) => {
        const job = inspectJobAdvertisement({
          sourceType: "external_link",
          sourceOpportunityId: opportunity.id,
          title: opportunity.title,
          company: opportunity.employer,
          location: opportunity.location,
          employmentType: opportunity.employmentType,
          rawText: opportunityToJobImportText(opportunity)
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
        PATHZY brings in real vacancies, then compares them with your confirmed Professional Identity before you decide what to do next.
      </PageHeader>
      <OpportunitiesHub initialOpportunities={personalizedOpportunities} initialJobIntelligence={jobIntelligence} providerStatus={providerResult.status} />
    </div>
  );
}
