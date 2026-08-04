import type { CountryEmploymentContext } from "../domain/country-context";
import type { PathwayCode } from "../domain/pathways";
import { normalizeText } from "./normalize-input";

export function isSouthAfricaContext(context: CountryEmploymentContext) {
  return context.countryCode.toUpperCase() === "ZA";
}

export function contextArray<T = Record<string, unknown>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function contextRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function getSouthAfricaPathwayContext(context: CountryEmploymentContext, pathwayCode: PathwayCode) {
  const programmeContract = contextRecord(context.employmentProgrammeContract);
  const mapping = contextArray<Record<string, unknown>>((contextRecord(context.jobTaxonomyMapping).pathwayContexts));
  const contractMapping = contextArray<Record<string, unknown>>((contextRecord(context.employmentProgrammeContract).pathwayContexts));
  return [...mapping, ...contractMapping].find((item) => item.pathwayCode === pathwayCode) ?? (
    contextArray<Record<string, unknown>>((contextRecord(context as unknown as Record<string, unknown>).pathwayContexts)).find((item) => item.pathwayCode === pathwayCode)
  ) ?? (Array.isArray(programmeContract.supportedPathways) && programmeContract.supportedPathways.includes(pathwayCode) ? { pathwayCode, defaultLiveAvailabilityStatus: programmeContract.defaultLiveAvailabilityStatus } : null);
}

export function hasUnavailableMarker(context: CountryEmploymentContext, marker: string) {
  return context.unavailableDataMarkers.some((item) => item.includes(marker));
}

export function inputHasText(value: unknown, needles: string[]) {
  const haystack = normalizeText(JSON.stringify(value)).toLowerCase();
  return needles.some((needle) => haystack.includes(needle.toLowerCase()));
}

export function qualificationFrameworkItems(context: CountryEmploymentContext) {
  return contextArray<Record<string, unknown>>(contextRecord(context.qualificationFramework).qualificationContexts);
}
