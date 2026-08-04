import { jobLevels, type JobLevel } from "../domain/job-levels";
import { pathwayCodes, type PathwayCode, type PathwayRecommendation } from "../domain/pathways";
import type { DetectedBarrier } from "../domain/barriers";
import type { EmploymentIntelligenceInput } from "../domain/employment-intelligence-input";
import type { EvidenceAssessmentSummary, JobLevelIndication, MissingInformation, PathwayEvaluation, PathwaySuitability, Strength } from "./engine-types";
import { createConfidenceAssessment } from "./calculate-confidence";
import { arrayValue, normalizeText } from "./normalize-input";
import { includesAnyText } from "./assess-evidence";

function suitabilityScore(code: PathwayCode, args: { input: EmploymentIntelligenceInput; barriers: DetectedBarrier[]; strengths: Strength[]; missing: MissingInformation[] }) {
  const pi = args.input.professionalIdentity;
  const dx = args.input.employmentDiagnosis;
  const skills = arrayValue(pi.skills);
  const experience = arrayValue(pi.experience);
  const projects = arrayValue(pi.projects);
  const education = arrayValue(pi.education);
  const licences = arrayValue(pi.licences);
  const certificates = arrayValue(pi.certificates);
  const preferences = normalizeText(JSON.stringify(pi.employmentPreferences.value)).toLowerCase();
  const goal = normalizeText(pi.careerGoal.value).toLowerCase();
  const urgency = normalizeText(dx.incomeUrgency.value).toLowerCase();
  let score = 20;
  if (experience.length) score += ["DIRECT_EMPLOYMENT", "SKILLED_EMPLOYMENT", "RETURN_TO_WORK", "TEMPORARY_WORK", "CONTRACT_WORK"].includes(code) ? 35 : 8;
  if (skills.length) score += ["SKILLED_EMPLOYMENT", "SKILLS_FIRST_TRANSITION", "FREELANCE_WORK", "ENTRY_LEVEL_EMPLOYMENT"].includes(code) ? 24 : 6;
  if (projects.length) score += ["FREELANCE_WORK", "SKILLS_FIRST_TRANSITION", "PROFESSIONAL_EMPLOYMENT", "GRADUATE_PROGRAMME"].includes(code) ? 28 : 5;
  if (education.length && !experience.length) score += ["GRADUATE_PROGRAMME", "INTERNSHIP", "LEARNERSHIP", "ENTRY_LEVEL_EMPLOYMENT"].includes(code) ? 30 : 5;
  if (licences.length || certificates.length) score += ["LICENCE_OR_CERTIFICATE", "SKILLED_EMPLOYMENT", "APPRENTICESHIP"].includes(code) ? 28 : 5;
  if (/self|business|entrepreneur|freelance/.test(`${goal} ${preferences}`)) score += ["SELF_EMPLOYMENT", "MICRO_ENTERPRISE", "FREELANCE_WORK"].includes(code) ? 35 : 0;
  if (/urgent|immediate|high|now/.test(urgency)) score += ["TEMPORARY_WORK", "PART_TIME_WORK", "ENTRY_LEVEL_EMPLOYMENT", "PUBLIC_EMPLOYMENT_PROGRAMME"].includes(code) ? 22 : -3;
  if (args.barriers.some((item) => item.definitionCode === "WORK_AUTHORIZATION_UNCERTAINTY")) score -= ["DIRECT_EMPLOYMENT", "PROFESSIONAL_EMPLOYMENT", "SKILLED_EMPLOYMENT"].includes(code) ? 24 : 8;
  if (args.barriers.some((item) => item.definitionCode === "PRACTICAL_ACCESS_CONSTRAINT")) score -= ["DIRECT_EMPLOYMENT", "PROFESSIONAL_EMPLOYMENT"].includes(code) ? 10 : 2;
  if (args.missing.filter((item) => item.blocksConclusion).length) score -= 12;
  return Math.max(0, Math.min(100, score));
}

function suitabilityFromScore(score: number): PathwaySuitability {
  if (score >= 78) return "HIGHLY_SUITABLE";
  if (score >= 64) return "SUITABLE";
  if (score >= 50) return "SUITABLE_WITH_SUPPORT";
  if (score >= 35) return "POSSIBLE";
  if (score >= 18) return "LOW";
  return "NOT_ASSESSED";
}

export function evaluatePathways(args: {
  input: EmploymentIntelligenceInput;
  barriers: DetectedBarrier[];
  strengths: Strength[];
  missing: MissingInformation[];
}): PathwayEvaluation[] {
  const ranked = pathwayCodes.map((pathwayCode) => {
    const score = suitabilityScore(pathwayCode, args);
    const missingInformation = args.missing.filter((item) => item.blocksConclusion || item.importance === "IMPORTANT").map((item) => item.code).slice(0, 4);
    const barriers = args.barriers.map((item) => item.definitionCode).slice(0, 4);
    const evaluation: PathwayEvaluation = {
      pathwayCode,
      rank: 0,
      suitability: suitabilityFromScore(score),
      reason: `${pathwayCode} was assessed using identity, diagnosis, evidence, and support constraints.`,
      confidence: createConfidenceAssessment({
        completeness: missingInformation.length ? 0.48 : 0.75,
        evidence: args.strengths.length ? 0.65 : 0.3,
        ruleCertainty: 0.7,
        countryContext: args.input.countryContext.sourceMetadata.length ? 0.65 : 0.25,
        rationale: [`pathway.${pathwayCode.toLowerCase()}`]
      }),
      dependencies: ["Professional Identity", "Employment Diagnosis", "Country Context"],
      barriers,
      unmetDependencies: missingInformation,
      missingInformation,
      timeHorizon: score >= 64 ? "near_term" : score >= 35 ? "needs_preparation" : "exploratory",
      urgencySuitability: score >= 55 ? "can_be_considered_for_current_urgency" : "not_primary_for_current_urgency",
      supportingSignals: args.strengths.flatMap((strength) => strength.suitablePathwayConnections.includes(pathwayCode) ? [strength.code] : []),
      explanation: "Suitability is deterministic and evidence-aware; unsupported or unknown facts reduce confidence rather than inventing conclusions."
    };
    return { evaluation, score };
  });
  return ranked
    .sort((a, b) => b.score - a.score || a.evaluation.pathwayCode.localeCompare(b.evaluation.pathwayCode))
    .map((item, index) => ({ ...item.evaluation, rank: index + 1 }));
}

export function toPathwayRecommendations(evaluations: PathwayEvaluation[]): PathwayRecommendation[] {
  return evaluations.slice(0, 8).map((item) => ({
    pathwayCode: item.pathwayCode,
    rank: item.rank,
    suitability: item.suitability,
    reason: item.reason,
    confidence: item.confidence,
    dependencies: item.dependencies,
    barriers: item.barriers,
    unmetDependencies: item.unmetDependencies,
    missingInformation: item.missingInformation,
    timeHorizon: item.timeHorizon,
    urgencySuitability: item.urgencySuitability
  }));
}

export function indicateJobLevels(input: EmploymentIntelligenceInput, evidenceSummary: EvidenceAssessmentSummary): JobLevelIndication[] {
  const pi = input.professionalIdentity;
  const values = [...arrayValue(pi.skills), ...arrayValue(pi.experience), ...arrayValue(pi.projects), ...arrayValue(pi.education)];
  const levels = new Set<JobLevel>();
  if (!values.length) levels.add("FOUNDATIONAL");
  if (includesAnyText(values, ["clean", "security", "driver", "retail", "customer", "domestic"])) levels.add("SERVICE");
  if (includesAnyText(values, ["admin", "office", "records", "schedule", "support"])) levels.add("CLERICAL");
  if (includesAnyText(values, ["engineer", "software", "cloud", "developer", "system", "data", "technical"])) levels.add("TECHNICAL");
  if (includesAnyText(values, ["artisan", "trade", "electric", "plumb", "mechanic", "weld"])) levels.add("SKILLED_TRADE");
  if (arrayValue(pi.education).length && !arrayValue(pi.experience).length) levels.add("GRADUATE");
  if (arrayValue(pi.experience).length && arrayValue(pi.skills).length) levels.add("OPERATIONAL");
  if (includesAnyText(values, ["manager", "lead", "strategy", "executive", "director"])) levels.add("MANAGEMENT");
  if (includesAnyText(values, ["founder", "business", "entrepreneur", "self-employed"])) levels.add("ENTREPRENEURIAL");
  return Array.from(levels)
    .filter((level) => jobLevels.includes(level))
    .sort((a, b) => jobLevels.indexOf(a) - jobLevels.indexOf(b))
    .map((level) => ({
      level,
      confidence: createConfidenceAssessment({
        completeness: values.length ? 0.72 : 0.28,
        evidence: evidenceSummary.strongestSupportedAssets.length ? 0.62 : 0.25,
        ruleCertainty: 0.68,
        countryContext: 0.3,
        rationale: [`job_level.${level.toLowerCase()}`]
      }),
      evidence: evidenceSummary.strongestSupportedAssets.slice(0, 4),
      missingInformation: values.length ? [] : ["ROLE_EVIDENCE_MISSING"],
      explanationKey: `job_level.${level.toLowerCase()}`
    }));
}
