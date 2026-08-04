import type { CountryEmploymentContext } from "../../../domain/country-context";
import type { CountryContextResolutionRequest } from "../../country-employment-context";
import { toCountrySourceMetadata } from "../../country-employment-context";
import { southAfricaFormalInformalEmploymentContext, southAfricaPracticalAccessContext } from "./practical-access-context";
import { southAfricaJobLevelContexts, southAfricaSecuritySectorContext, southAfricaServiceRoleEvidenceContext } from "./job-level-mapping";
import { southAfricaLanguageContext } from "./language-context";
import { southAfricaMatricNonMatricContext, southAfricaQualificationContexts, southAfricaTvetTradeContext } from "./qualification-framework";
import { southAfricaRecruitmentConventions, southAfricaSalaryDataContract } from "./recruitment-conventions";
import { southAfricaPathwayContexts, southAfricaEmploymentProgrammeContracts } from "./pathway-context";
import { southAfricaSourceRegistry } from "./source-registry";
import { findSouthAfricaRegion, southAfricaRegions } from "./regions";
import { southAfricaUnavailableDataMarkers, SOUTH_AFRICA_CONTEXT_EFFECTIVE_DATE, SOUTH_AFRICA_EMPLOYMENT_CONTEXT_VERSION, southAfricaAdapterLimitations } from "./data-status";
import { southAfricaWorkAuthorisationContext } from "./work-authorisation-context";
import { southAfricaEvidenceRequirements } from "./evidence-requirements";

export function buildSouthAfricaEmploymentContext(request: CountryContextResolutionRequest = {}) {
  const region = findSouthAfricaRegion(request.regionCode);
  const context: CountryEmploymentContext = {
    countryCode: "ZA",
    version: SOUTH_AFRICA_EMPLOYMENT_CONTEXT_VERSION,
    effectiveDate: SOUTH_AFRICA_CONTEXT_EFFECTIVE_DATE,
    sourceMetadata: southAfricaSourceRegistry.map(toCountrySourceMetadata),
    qualificationFramework: {
      adapterVersion: SOUTH_AFRICA_EMPLOYMENT_CONTEXT_VERSION,
      recognitionStates: ["NOT_REQUIRED", "RECOGNISED", "RECOGNITION_REQUIRED", "IN_PROGRESS", "NOT_RECOGNISED", "UNKNOWN", "NOT_APPLICABLE"],
      qualificationContexts: southAfricaQualificationContexts,
      matricNonMatricContext: southAfricaMatricNonMatricContext,
      tvetTradeContext: southAfricaTvetTradeContext,
      evidenceRequirements: southAfricaEvidenceRequirements.qualification,
      rules: ["Do not assign NQF levels without reliable mapping evidence.", "No degree must not be treated as inability.", "Informal and occupational learning remain relevant."]
    },
    regionModel: {
      adapterVersion: SOUTH_AFRICA_EMPLOYMENT_CONTEXT_VERSION,
      provinces: southAfricaRegions,
      selectedRegion: region ?? null,
      invalidRegion: request.regionCode && !region ? request.regionCode : null,
      unavailableWhenInvalid: request.regionCode && !region ? "REGION_CONTEXT_UNAVAILABLE" : null
    },
    jobTaxonomyMapping: {
      adapterVersion: SOUTH_AFRICA_EMPLOYMENT_CONTEXT_VERSION,
      jobLevelContexts: southAfricaJobLevelContexts,
      securitySectorContext: southAfricaSecuritySectorContext,
      serviceRoleEvidenceContext: southAfricaServiceRoleEvidenceContext,
      pathwayContexts: southAfricaPathwayContexts
    },
    workAuthorisationContext: southAfricaWorkAuthorisationContext,
    recruitmentConventionContract: southAfricaRecruitmentConventions,
    employmentProgrammeContract: {
      ...southAfricaEmploymentProgrammeContracts,
      pathwayContexts: southAfricaPathwayContexts
    },
    salaryDataContract: southAfricaSalaryDataContract,
    languageContext: southAfricaLanguageContext,
    transportGeographicContext: southAfricaPracticalAccessContext,
    formalInformalEmploymentContext: southAfricaFormalInformalEmploymentContext,
    lowLiteracySupport: southAfricaPracticalAccessContext.lowLiteracySupport,
    dataFreshness: "CURRENT",
    unavailableDataMarkers: [
      ...southAfricaUnavailableDataMarkers,
      ...(request.regionCode && !region ? ["ZA_REGION_CONTEXT_UNAVAILABLE"] : [])
    ]
  };
  return {
    context,
    adapterVersion: SOUTH_AFRICA_EMPLOYMENT_CONTEXT_VERSION,
    resolvedAt: request.asOfDate ?? SOUTH_AFRICA_CONTEXT_EFFECTIVE_DATE,
    limitations: [...southAfricaAdapterLimitations],
    selectedRegion: region,
    sourceRegistry: southAfricaSourceRegistry
  };
}
