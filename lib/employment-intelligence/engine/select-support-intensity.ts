import type { DetectedBarrier } from "../domain/barriers";
import type { EmploymentIntelligenceInput } from "../domain/employment-intelligence-input";
import type { MissingInformation, SupportIntensitySelection } from "./engine-types";
import { createConfidenceAssessment } from "./calculate-confidence";
import { normalizeText } from "./normalize-input";

export function selectSupportIntensity(input: EmploymentIntelligenceInput, barriers: DetectedBarrier[], missing: MissingInformation[]): SupportIntensitySelection {
  const reasons: string[] = [];
  const device = normalizeText(input.employmentDiagnosis.deviceInternetAccess.value).toLowerCase();
  const literacy = normalizeText(input.employmentDiagnosis.literacyCommunicationComfort.value).toLowerCase();
  const urgency = normalizeText(input.employmentDiagnosis.incomeUrgency.value).toLowerCase();
  if (missing.filter((item) => item.blocksConclusion).length) reasons.push("Critical information is still needed before confident conclusions.");
  if (barriers.some((item) => item.definitionCode === "WORK_AUTHORIZATION_UNCERTAINTY")) reasons.push("Work eligibility needs careful review.");
  if (barriers.some((item) => item.severity === "HIGH" || item.severity === "CRITICAL")) reasons.push("At least one high-impact barrier needs structured support.");
  if (/(none|no|limited|shared|unreliable)/.test(device)) reasons.push("Limited device or internet access means fewer, clearer steps are safer.");
  if (/(low|limited|difficult|support|help)/.test(literacy)) reasons.push("Communication support should be explicit and plain-language.");
  if (/(urgent|immediate|high|now)/.test(urgency)) reasons.push("Immediate income pressure requires practical short-term options.");

  const level =
    barriers.some((item) => item.definitionCode === "WORK_AUTHORIZATION_UNCERTAINTY") ? "HUMAN_SUPPORT_RECOMMENDED" :
    reasons.length >= 4 ? "HIGH_SUPPORT" :
    reasons.length >= 2 ? "STRUCTURED_GUIDANCE" :
    missing.length ? "LIGHT_GUIDANCE" :
    "SELF_GUIDED";

  return {
    level,
    reasons,
    explanationKey: `support_intensity.${level.toLowerCase()}`,
    confidence: createConfidenceAssessment({
      completeness: missing.length ? 0.55 : 0.82,
      evidence: barriers.length ? 0.58 : 0.42,
      ruleCertainty: 0.75,
      countryContext: 0.35,
      rationale: ["support_intensity.from.barriers.missing_and_access"]
    })
  };
}
