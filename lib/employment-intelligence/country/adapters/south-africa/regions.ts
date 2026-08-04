import type { ProvinceCode, RegionContext } from "../../country-employment-context";
import { zaStructuralConfidence } from "./data-status";

export const southAfricaProvinceCodes: ProvinceCode[] = ["EC", "FS", "GP", "KZN", "LP", "MP", "NC", "NW", "WC"];

const names: Record<ProvinceCode, { en: string; fr: string }> = {
  EC: { en: "Eastern Cape", fr: "Cap-Oriental" },
  FS: { en: "Free State", fr: "Etat-Libre" },
  GP: { en: "Gauteng", fr: "Gauteng" },
  KZN: { en: "KwaZulu-Natal", fr: "KwaZulu-Natal" },
  LP: { en: "Limpopo", fr: "Limpopo" },
  MP: { en: "Mpumalanga", fr: "Mpumalanga" },
  NC: { en: "Northern Cape", fr: "Cap-Nord" },
  NW: { en: "North West", fr: "Nord-Ouest" },
  WC: { en: "Western Cape", fr: "Cap-Occidental" }
};

export const southAfricaRegions: RegionContext[] = southAfricaProvinceCodes.map((provinceCode) => ({
  provinceCode,
  canonicalName: names[provinceCode].en,
  labels: names[provinceCode],
  majorHubContract: "STRUCTURAL_HUB_MODEL_REQUIRES_VERIFIED_SOURCE_BEFORE_DEMAND_CLAIMS",
  urbanRuralTownshipContext: "STRUCTURAL_MARKER_ONLY",
  mobilityContext: ["local_travel_radius", "public_transport_access", "relocation_willingness", "remote_work_preference"],
  transportAccessConsiderations: ["Unknown transport lowers practical-access confidence only.", "Do not infer commute cost, safety, or travel time without user data and verified source."],
  remoteWorkContextAvailability: "UNAVAILABLE",
  dataConfidence: zaStructuralConfidence,
  sourceIds: ["ZA_INTERNAL_STRUCTURAL_CONTEXT_V1"]
}));

export function findSouthAfricaRegion(regionCode?: string | null) {
  if (!regionCode) return undefined;
  return southAfricaRegions.find((region) => region.provinceCode === regionCode.toUpperCase());
}
