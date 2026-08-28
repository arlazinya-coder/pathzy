import type { Opportunity, JobProviderStatus } from "@/lib/opportunities/types";

export type JobProviderSearchInput = {
  query?: string;
  location?: string;
  country?: string;
  page?: number;
  resultsPerPage?: number;
};

export type JobProviderDiagnostics = {
  country: string;
  query: string;
  location: string;
  requestUrl: string;
  responseStatus?: number;
  rawCount: number;
  normalizedCount: number;
};

export type JobProviderSearchResult = {
  opportunities: Opportunity[];
  status: JobProviderStatus;
  diagnostics?: JobProviderDiagnostics;
};

export type JobProvider = {
  id: string;
  search(input: JobProviderSearchInput): Promise<JobProviderSearchResult>;
};

export class JobProviderError extends Error {
  constructor(
    message: string,
    public readonly status: JobProviderStatus["status"],
    public readonly provider: string
  ) {
    super(message);
    this.name = "JobProviderError";
  }
}
