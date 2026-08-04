import type { EmploymentIntelligenceInput } from "../domain/employment-intelligence-input";
import type { ProvenancedValue } from "../domain/evidence";
import { inputProvenanceStates, type InputProvenanceState } from "../domain/evidence";
import { genericCountryEmploymentContext } from "../domain/country-context";
import type { NormalizationReport } from "./engine-types";
import { createConfidenceAssessment } from "./calculate-confidence";

function isProvenance(value: unknown): value is InputProvenanceState {
  return typeof value === "string" && inputProvenanceStates.includes(value as InputProvenanceState);
}

function blankConfidence() {
  return createConfidenceAssessment({ completeness: 0, evidence: 0, ruleCertainty: 0.7, countryContext: 0.3, rationale: ["normalization.default.unknown"] });
}

export function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function uniqueStrings(value: unknown): string[] {
  const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[,\n;]/) : [];
  return Array.from(new Set(source.map((item) => normalizeText(item)).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export function normalizeProvenancedValue<T>(value: unknown, fallback: T | null = null): ProvenancedValue<T> {
  const source = value && typeof value === "object" && "provenance" in value ? (value as Partial<ProvenancedValue<T>>) : null;
  const provenance = isProvenance(source?.provenance) ? source.provenance : source?.value == null ? "UNKNOWN" : "KNOWN";
  return {
    value: (source?.value as T | null | undefined) ?? fallback,
    provenance,
    evidence: Array.isArray(source?.evidence) ? source.evidence : [],
    confidence: source?.confidence ?? blankConfidence()
  };
}

export function normalizeEmploymentIntelligenceInput(input: EmploymentIntelligenceInput): { input: EmploymentIntelligenceInput; report: NormalizationReport } {
  const report: NormalizationReport = { issues: [], duplicateFieldsNormalized: [], declinedFields: [], unknownFields: [] };
  const professionalIdentity = { ...input.professionalIdentity };
  const employmentDiagnosis = { ...input.employmentDiagnosis };

  for (const [key, value] of Object.entries(professionalIdentity)) {
    const provenanced = normalizeProvenancedValue(value);
    if (provenanced.provenance === "USER_DECLINED") report.declinedFields.push(`professionalIdentity.${key}`);
    if (provenanced.provenance === "UNKNOWN") report.unknownFields.push(`professionalIdentity.${key}`);
    (professionalIdentity as Record<string, unknown>)[key] = provenanced;
  }
  for (const [key, value] of Object.entries(employmentDiagnosis)) {
    const provenanced = normalizeProvenancedValue(value);
    if (provenanced.provenance === "USER_DECLINED") report.declinedFields.push(`employmentDiagnosis.${key}`);
    if (provenanced.provenance === "UNKNOWN") report.unknownFields.push(`employmentDiagnosis.${key}`);
    (employmentDiagnosis as Record<string, unknown>)[key] = provenanced;
  }

  for (const key of ["education", "experience", "skills", "projects", "achievements", "certificates", "licences", "languages", "references", "portfolio", "socialProfiles"] as const) {
    const current = professionalIdentity[key] as ProvenancedValue<unknown[]>;
    if (Array.isArray(current.value)) {
      const serialized = Array.from(new Map(current.value.map((item) => [JSON.stringify(item), item])).values());
      if (serialized.length !== current.value.length) report.duplicateFieldsNormalized.push(`professionalIdentity.${key}`);
      professionalIdentity[key] = { ...current, value: serialized };
    }
  }

  return {
    input: {
      ...input,
      inputSnapshotVersion: normalizeText(input.inputSnapshotVersion) || "unknown-input-snapshot",
      professionalIdentity: professionalIdentity as EmploymentIntelligenceInput["professionalIdentity"],
      employmentDiagnosis: employmentDiagnosis as EmploymentIntelligenceInput["employmentDiagnosis"],
      countryContext: input.countryContext ?? genericCountryEmploymentContext
    },
    report
  };
}

export function valueKnown<T>(value: ProvenancedValue<T>) {
  return value.provenance !== "UNKNOWN" && value.provenance !== "USER_DECLINED" && value.value !== null && value.value !== "";
}

export function arrayValue(value: ProvenancedValue<unknown[]>) {
  return Array.isArray(value.value) ? value.value : [];
}
