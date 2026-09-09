import { OpportunitiesHub } from "@/components/opportunities/opportunities-hub";
import { PageHeader } from "@/components/ui";
import { getOrCreateCanonicalProfile, valueText, type CanonicalProfessionalIdentity } from "@/lib/canonical-profile";
import { analyzeJobAgainstCanonicalProfile, inspectJobAdvertisement, type JobMatchAnalysis } from "@/lib/job-intelligence";
import { opportunityToJobImportText, personalizeRealOpportunities } from "@/lib/opportunities/matching";
import type { OpportunityAction } from "@/lib/opportunities/types";
import { fetchProductionOpportunities } from "@/lib/opportunities/providers";
import { fetchProfileRoleOpportunities } from "@/lib/opportunities/profile-search";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

function firstText(values: Array<string | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean) ?? "";
}

type OpportunitiesSearchParams = {
  query?: string;
  location?: string;
  country?: string;
  employmentType?: string;
  workMode?: string;
  minimumSalary?: string;
  postedWithin?: string;
  seniority?: string;
};

function paramText(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function opportunitySearchFromProfile(canonicalProfile: CanonicalProfessionalIdentity, params: OpportunitiesSearchParams = {}) {
  return {
    query: paramText(params.query) || firstText([
      valueText(canonicalProfile.professionalProfile.headline),
      ...canonicalProfile.professionalProfile.targetRoles.map(valueText),
      ...(canonicalProfile.careerPreferences?.targetRoles.map(valueText) ?? []),
      valueText(canonicalProfile.identity.professionalHeadline)
    ]) || "entry level",
    location: paramText(params.location) || firstText([
      valueText(canonicalProfile.contact.city),
      ...(canonicalProfile.careerPreferences?.preferredLocations.map(valueText) ?? [])
    ]),
    country: paramText(params.country) || firstText([valueText(canonicalProfile.contact.country)]) || "South Africa",
    filters: {
      keyword: paramText(params.query),
      location: paramText(params.location),
      employmentType: paramText(params.employmentType),
      workMode: paramText(params.workMode),
      minimumSalary: paramText(params.minimumSalary),
      postedWithin: paramText(params.postedWithin),
      seniority: paramText(params.seniority)
    }
  };
}

export default async function OpportunitiesPage({ searchParams }: { searchParams?: Promise<OpportunitiesSearchParams> }) {
  const { user, supabase } = await requireAuthenticatedUser("/opportunities");
  const params = searchParams ? await searchParams : {};

  const canonicalProfile = await getOrCreateCanonicalProfile(supabase, user.id);
  const search = opportunitySearchFromProfile(canonicalProfile, params);
  const { filters, ...providerSearch } = search;
  const fetchOpportunities = () => paramText(params.query)
    ? fetchProductionOpportunities({ ...providerSearch, resultsPerPage: 20 })
    : fetchProfileRoleOpportunities({ ...providerSearch, resultsPerPage: 20 }, [
      ...canonicalProfile.professionalProfile.targetRoles.map(valueText),
      ...(canonicalProfile.careerPreferences?.targetRoles.map(valueText) ?? []),
      valueText(canonicalProfile.professionalProfile.headline),
      valueText(canonicalProfile.identity.professionalHeadline)
    ], fetchProductionOpportunities);
  const [{ data: actions }, providerResult] = await Promise.all([
    supabase.from("user_opportunity_actions").select("opportunity_id,saved,applied,completed,hidden").eq("user_id", user.id),
    fetchOpportunities()
  ]);

  const personalizedOpportunities = personalizeRealOpportunities({
    opportunities: providerResult.opportunities,
    profile: canonicalProfile,
    actions: (actions ?? []) as OpportunityAction[]
  });
  const pipelineCounts = {
    raw: providerResult.diagnostics?.rawCount ?? providerResult.opportunities.length,
    normalized: providerResult.diagnostics?.normalizedCount ?? providerResult.opportunities.length,
    allJobs: personalizedOpportunities.length,
    recommended: personalizedOpportunities.filter((opportunity) => opportunity.match.recommendation === "WORTH_APPLYING").length,
    nearReach: personalizedOpportunities.filter((opportunity) => opportunity.match.recommendation === "PREPARE_FIRST" || opportunity.match.recommendation === "APPLY_AFTER_CHECKING").length
  };
  console.info("[opportunities-page]", JSON.stringify({
    provider: providerResult.status.provider,
    query: providerSearch.query, country: providerResult.diagnostics?.country,
    location: providerSearch.location, status: providerResult.status.status,
    ...pipelineCounts
  }));
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
      <PageHeader eyebrow="Find Opportunities" title="Find opportunities that fit where you're going.">
        PATHZY compares real vacancies with your Professional Identity, career direction and employment preferences before you decide what to do next.
      </PageHeader>
      <OpportunitiesHub initialOpportunities={personalizedOpportunities} initialJobIntelligence={jobIntelligence} providerStatus={providerResult.status} initialFilters={filters} pipelineCounts={pipelineCounts} />
    </div>
  );
}
