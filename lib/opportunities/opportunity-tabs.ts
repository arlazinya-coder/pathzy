import type { PersonalizedOpportunity } from "./types";

export type OpportunityTab = "recommended" | "near" | "saved" | "all";

export function opportunityTabMatches(opportunity: PersonalizedOpportunity, tab: OpportunityTab) {
  if (tab === "all") return true;
  if (tab === "saved") return opportunity.action.saved;
  if (tab === "near") return opportunity.match.recommendation === "PREPARE_FIRST" || opportunity.match.recommendation === "APPLY_AFTER_CHECKING";
  return opportunity.match.recommendation === "WORTH_APPLYING";
}

export function opportunityCountForTab(opportunities: PersonalizedOpportunity[], tab: OpportunityTab) {
  return opportunities.filter((opportunity) => opportunityTabMatches(opportunity, tab)).length;
}

export function selectInitialOpportunityTab(opportunities: PersonalizedOpportunity[]): OpportunityTab {
  if (opportunityCountForTab(opportunities, "recommended") > 0) return "recommended";
  if (opportunityCountForTab(opportunities, "near") > 0) return "near";
  if (opportunities.length > 0) return "all";
  return "recommended";
}

export function opportunityHasMissingLocationReview(opportunities: PersonalizedOpportunity[]) {
  return opportunities.some((opportunity) =>
    opportunity.match.unknowns.some((unknown) => /location|remote-work preference/i.test(unknown))
  );
}
