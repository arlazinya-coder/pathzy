import type { CountryContextResolutionRequest } from "./country-employment-context";
import { countryContextRegistry } from "./country-context-registry";
import { resolveGenericCountryEmploymentContext } from "./generic-country-context";

export function normalizeCountryCode(countryCode?: string | null) {
  return (countryCode ?? "").trim().toUpperCase();
}

export function resolveCountryEmploymentContext(request: CountryContextResolutionRequest = {}) {
  const countryCode = normalizeCountryCode(request.countryCode);
  if (countryCode === "ZA") return countryContextRegistry.ZA.resolve(request);
  if (!countryCode || countryCode === "GENERIC") return countryContextRegistry.GENERIC.resolve(request);
  return resolveGenericCountryEmploymentContext(request);
}
