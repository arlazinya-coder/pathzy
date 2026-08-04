import { genericCountryEmploymentContext } from "../domain/country-context";
import type { CountryContextResolution, CountryContextResolutionRequest } from "./country-employment-context";

export const GENERIC_COUNTRY_CONTEXT_ADAPTER_VERSION = "3C.generic-fallback.v1";

export function resolveGenericCountryEmploymentContext(request: CountryContextResolutionRequest = {}): CountryContextResolution {
  return {
    context: {
      ...genericCountryEmploymentContext,
      countryCode: request.countryCode?.toUpperCase() || genericCountryEmploymentContext.countryCode,
      unavailableDataMarkers: Array.from(new Set([
        ...genericCountryEmploymentContext.unavailableDataMarkers,
        "COUNTRY_ADAPTER_UNAVAILABLE",
        request.regionCode ? "REGION_CONTEXT_UNAVAILABLE" : "REGION_NOT_PROVIDED"
      ]))
    },
    adapterVersion: GENERIC_COUNTRY_CONTEXT_ADAPTER_VERSION,
    resolvedAt: request.asOfDate ?? genericCountryEmploymentContext.effectiveDate,
    limitations: ["No country-specific context adapter is available; PATHZY will use generic deterministic rules."],
    sourceRegistry: []
  };
}
