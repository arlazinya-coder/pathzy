import { deduplicateOpportunities } from "./matching";
import type { JobProviderSearchInput, JobProviderSearchResult } from "./providers/types";

export const MAX_AUTOMATIC_ROLE_SEARCHES = 2;

export function profileRoleQueries(roles: string[], fallback: string): string[] {
  const distinct = new Map<string, string>();
  for (const value of roles) {
    for (const part of value.split(/[,;|\n]+/)) {
      const role = part.trim().replace(/\s+/g, " ");
      if (role && !distinct.has(role.toLowerCase())) distinct.set(role.toLowerCase(), role);
      if (distinct.size === MAX_AUTOMATIC_ROLE_SEARCHES) return [...distinct.values()];
    }
  }
  return distinct.size ? [...distinct.values()] : [fallback];
}

export async function fetchProfileRoleOpportunities(
  input: JobProviderSearchInput,
  roles: string[],
  fetchProvider: (input: JobProviderSearchInput) => Promise<JobProviderSearchResult>
): Promise<JobProviderSearchResult> {
  const queries = profileRoleQueries(roles, input.query || "entry level");
  const results = await Promise.all(queries.map((query) => fetchProvider({ ...input, query })));
  if (results.length === 1) return results[0];
  const opportunities = deduplicateOpportunities(results.flatMap((result) => result.opportunities));
  const representative = results.find((result) => result.opportunities.length > 0)
    ?? results.find((result) => result.status.status !== "no_jobs_found") ?? results[0];
  return {
    opportunities,
    status: opportunities.length ? { status: "available", provider: representative.status.provider } : representative.status,
    diagnostics: representative.diagnostics ? {
      ...representative.diagnostics,
      rawCount: results.reduce((sum, result) => sum + (result.diagnostics?.rawCount ?? result.opportunities.length), 0),
      normalizedCount: results.reduce((sum, result) => sum + (result.diagnostics?.normalizedCount ?? result.opportunities.length), 0)
    } : undefined
  };
}
