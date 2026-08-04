import { buildSouthAfricaEmploymentContext, SOUTH_AFRICA_EMPLOYMENT_CONTEXT_VERSION } from "./adapters/south-africa";
import { resolveGenericCountryEmploymentContext } from "./generic-country-context";

export const countryContextRegistry = {
  ZA: {
    countryCode: "ZA",
    adapterVersion: SOUTH_AFRICA_EMPLOYMENT_CONTEXT_VERSION,
    resolve: buildSouthAfricaEmploymentContext
  },
  GENERIC: {
    countryCode: "GENERIC",
    adapterVersion: "3C.generic-fallback.v1",
    resolve: resolveGenericCountryEmploymentContext
  }
} as const;

export type SupportedCountryContextCode = keyof typeof countryContextRegistry;
