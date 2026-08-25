import { AdzunaJobProvider } from "./adzuna-provider";
import type { JobProvider, JobProviderSearchInput, JobProviderSearchResult } from "./types";

export function getProductionJobProvider(): JobProvider {
  return new AdzunaJobProvider();
}

export async function fetchProductionOpportunities(input: JobProviderSearchInput): Promise<JobProviderSearchResult> {
  return getProductionJobProvider().search(input);
}
