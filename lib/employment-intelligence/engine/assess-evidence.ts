import type { EmploymentIntelligenceInput } from "../domain/employment-intelligence-input";
import type { EvidenceRecord, ProvenancedValue } from "../domain/evidence";
import type { EvidenceAssessment, EvidenceAssessmentSummary } from "./engine-types";
import { averageConfidence, createConfidenceAssessment } from "./calculate-confidence";
import { arrayValue, normalizeText, valueKnown } from "./normalize-input";

function collectEvidence(field: string, value: ProvenancedValue<unknown>): EvidenceRecord[] {
  return value.evidence.map((item) => ({ ...item, supportingField: item.supportingField ?? field }));
}

function assessField(code: string, subject: string, value: ProvenancedValue<unknown>): EvidenceAssessment {
  const evidence = collectEvidence(code, value);
  const known = valueKnown(value);
  const verified = value.provenance === "VERIFIED" || evidence.some((item) => item.verifiedStatus === "VERIFIED");
  const unsupported = known && !evidence.length ? [`${code}_NEEDS_SUPPORTING_EVIDENCE`] : [];
  return {
    code,
    subject,
    evidence,
    confidence: createConfidenceAssessment({
      completeness: known ? 0.8 : 0.1,
      evidence: verified ? 0.95 : evidence.length ? 0.7 : known ? 0.35 : 0.05,
      ruleCertainty: 0.76,
      countryContext: 0.35,
      rationale: [`evidence.${code.toLowerCase()}`]
    }),
    verified,
    gaps: known ? unsupported : [`${code}_MISSING`],
    unsupportedClaims: unsupported,
    conflicts: value.confidence.conflictingInformation
  };
}

export function assessEmploymentEvidence(input: EmploymentIntelligenceInput): EvidenceAssessmentSummary {
  const pi = input.professionalIdentity;
  const fields: Array<[string, string, ProvenancedValue<unknown>]> = [
    ["CURRENT_SITUATION", "Current situation", pi.currentSituation],
    ["CAREER_GOAL", "Career goal", pi.careerGoal],
    ["WORK_AUTHORIZATION", "Work authorization", pi.workAuthorisation],
    ["LOCATION", "Location", pi.location],
    ["AVAILABILITY", "Availability", pi.availability],
    ["SUMMARY", "Professional summary", pi.summary],
    ["EDUCATION", "Education", pi.education],
    ["EXPERIENCE", "Experience", pi.experience],
    ["SKILLS", "Skills", pi.skills],
    ["PROJECTS", "Projects", pi.projects],
    ["ACHIEVEMENTS", "Achievements", pi.achievements],
    ["CERTIFICATES", "Certificates", pi.certificates],
    ["LICENCES", "Licences", pi.licences],
    ["REFERENCES", "References", pi.references],
    ["PORTFOLIO", "Portfolio", pi.portfolio],
    ["LANGUAGES", "Languages", pi.languages]
  ];
  const assessments = fields.map(([code, subject, value]) => assessField(code, subject, value));

  const skills = arrayValue(pi.skills);
  const experience = arrayValue(pi.experience);
  const projects = arrayValue(pi.projects);
  const certificates = arrayValue(pi.certificates);
  const licences = arrayValue(pi.licences);
  const achievements = arrayValue(pi.achievements);
  const portfolio = arrayValue(pi.portfolio);
  const evidenceGaps = Array.from(new Set(assessments.flatMap((item) => item.gaps)));
  const unsupportedClaims = Array.from(new Set(assessments.flatMap((item) => item.unsupportedClaims)));
  const conflicts = Array.from(new Set(assessments.flatMap((item) => item.conflicts)));
  const strongestSupportedAssets = [
    ...collectEvidence("experience", pi.experience),
    ...collectEvidence("projects", pi.projects),
    ...collectEvidence("achievements", pi.achievements),
    ...collectEvidence("certificates", pi.certificates),
    ...collectEvidence("licences", pi.licences),
    ...collectEvidence("portfolio", pi.portfolio)
  ].slice(0, 12);

  if (!strongestSupportedAssets.length && (experience.length || projects.length || achievements.length || certificates.length || licences.length || portfolio.length)) {
    strongestSupportedAssets.push({
      id: "system-derived-profile-evidence",
      subject: "Profile evidence exists but is not externally verified",
      evidenceType: "SYSTEM_DERIVED",
      sourceReference: "professional_identity",
      supportingField: "professionalIdentity",
      confidence: createConfidenceAssessment({
        completeness: 0.65,
        evidence: 0.35,
        ruleCertainty: 0.72,
        countryContext: 0.3,
        rationale: ["evidence.system.derived.profile.assets"]
      }),
      verifiedStatus: "INFERRED",
      timestamp: "deterministic",
      engineVersion: "3B.1",
      missingEvidence: ["Add documents, examples, references, or portfolio links to improve confidence."]
    });
  }

  if (skills.length && !experience.length && !projects.length && !certificates.length && !licences.length) {
    unsupportedClaims.push("SKILLS_NEED_EXAMPLES_PROJECTS_OR_EXPERIENCE");
  }

  return {
    assessments,
    evidenceGaps,
    strongestSupportedAssets,
    unsupportedClaims: Array.from(new Set(unsupportedClaims)),
    conflicts,
    overallEvidenceConfidence: averageConfidence(assessments.map((item) => item.confidence), ["evidence.summary.average"])
  };
}

export function includesAnyText(values: unknown[], needles: string[]) {
  const haystack = values.map((item) => normalizeText(JSON.stringify(item)).toLowerCase()).join(" ");
  return needles.some((needle) => haystack.includes(needle.toLowerCase()));
}
