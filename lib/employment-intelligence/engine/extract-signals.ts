import type { EmploymentIntelligenceInput } from "../domain/employment-intelligence-input";
import type { InputProvenanceState, ProvenancedValue } from "../domain/evidence";
import type { EmploymentSignal } from "./engine-types";
import { createConfidenceAssessment } from "./calculate-confidence";
import { arrayValue, normalizeText, valueKnown } from "./normalize-input";

function confidence(known: boolean, rationale: string[]) {
  return createConfidenceAssessment({ completeness: known ? 0.9 : 0.15, evidence: known ? 0.55 : 0.1, ruleCertainty: 0.78, countryContext: 0.35, rationale });
}

function signal(code: string, source: ProvenancedValue<unknown>, value: EmploymentSignal["value"], sensitivity: EmploymentSignal["sensitivity"] = "LOW"): EmploymentSignal {
  const known = valueKnown(source);
  return {
    code,
    value,
    provenance: source.provenance as InputProvenanceState,
    confidence: confidence(known, [`signal.${code.toLowerCase()}`]),
    sourceReferences: source.evidence.map((item) => item.id),
    missingData: known ? [] : [code],
    conflictingData: source.confidence.conflictingInformation,
    sensitivity
  };
}

function workAuthorisationSignalValue(source: ProvenancedValue<unknown>) {
  const serialized = normalizeText(JSON.stringify(source.value)).toLowerCase();
  if (!valueKnown(source) || /unknown|user_declined|declined|pending|expired|restricted|no_authorisation/.test(serialized)) return "unknown";
  return "known";
}

export function extractEmploymentSignals(input: EmploymentIntelligenceInput): EmploymentSignal[] {
  const pi = input.professionalIdentity;
  const dx = input.employmentDiagnosis;
  const skills = arrayValue(pi.skills);
  const experience = arrayValue(pi.experience);
  const projects = arrayValue(pi.projects);
  const education = arrayValue(pi.education);
  const certificates = arrayValue(pi.certificates);
  const licences = arrayValue(pi.licences);
  const references = arrayValue(pi.references);
  const portfolio = arrayValue(pi.portfolio);
  const achievements = arrayValue(pi.achievements);

  const signals: EmploymentSignal[] = [
    signal("IDENTITY_COMPLETENESS", pi.profileCompletionMetadata, pi.profileCompletionMetadata.value ? "present" : "unknown"),
    signal("CURRENT_SITUATION_KNOWN", pi.currentSituation, normalizeText(pi.currentSituation.value)),
    signal("CAREER_GOAL_PRESENT", pi.careerGoal, normalizeText(pi.careerGoal.value)),
    signal("CAREER_DIRECTION_SPECIFICITY", pi.careerGoal, normalizeText(pi.careerGoal.value).split(/\s+/).filter(Boolean).length >= 2 ? "specific" : "broad"),
    signal("WORK_AUTHORIZATION_KNOWN", pi.workAuthorisation, workAuthorisationSignalValue(pi.workAuthorisation), "HIGH"),
    signal("LOCATION_KNOWN", pi.location, pi.location.value ? "known" : "unknown"),
    signal("AVAILABILITY_KNOWN", pi.availability, pi.availability.value ? "known" : "unknown"),
    signal("EMPLOYMENT_PREFERENCES_PRESENT", pi.employmentPreferences, pi.employmentPreferences.value ? "present" : "unknown"),
    signal("EDUCATION_PRESENT", pi.education, education.length > 0),
    signal("CERTIFICATES_PRESENT", pi.certificates, certificates.length > 0),
    signal("LICENCES_PRESENT", pi.licences, licences.length > 0),
    signal("EXPERIENCE_PRESENT", pi.experience, experience.length > 0),
    signal("PROJECT_EVIDENCE_PRESENT", pi.projects, projects.length > 0),
    signal("ACHIEVEMENTS_PRESENT", pi.achievements, achievements.length > 0),
    signal("SKILLS_PRESENT", pi.skills, skills.length > 0),
    signal("REFERENCES_AVAILABLE", pi.references, references.length > 0),
    signal("PORTFOLIO_PRESENT", pi.portfolio, portfolio.length > 0),
    signal("SUMMARY_PRESENT", pi.summary, normalizeText(pi.summary.value).length > 0),
    signal("UNEMPLOYMENT_DURATION_KNOWN", dx.unemploymentDuration, normalizeText(dx.unemploymentDuration.value)),
    signal("APPLICATION_ACTIVITY_KNOWN", dx.applicationActivity, dx.applicationActivity.value ? "known" : "unknown"),
    signal("INTERVIEW_ACTIVITY_KNOWN", dx.interviewHistory, dx.interviewHistory.value ? "known" : "unknown"),
    signal("IMMEDIATE_INCOME_URGENCY", dx.incomeUrgency, normalizeText(dx.incomeUrgency.value), "MODERATE"),
    signal("TRANSPORT_ACCESS", dx.transportAccess, normalizeText(dx.transportAccess.value), "MODERATE"),
    signal("DEVICE_INTERNET_ACCESS", dx.deviceInternetAccess, normalizeText(dx.deviceInternetAccess.value), "MODERATE"),
    signal("DIGITAL_CONFIDENCE", dx.digitalConfidence, normalizeText(dx.digitalConfidence.value)),
    signal("LITERACY_COMMUNICATION_COMFORT", dx.literacyCommunicationComfort, normalizeText(dx.literacyCommunicationComfort.value), "MODERATE"),
    signal("CARE_RESPONSIBILITIES", dx.careResponsibilities, normalizeText(dx.careResponsibilities.value), "MODERATE"),
    signal("MOBILITY", dx.mobility, normalizeText(dx.mobility.value)),
    signal("WILLINGNESS_TO_LEARN", dx.willingnessToLearn, normalizeText(dx.willingnessToLearn.value)),
    signal("SUPPORT_NEEDS", dx.supportNeeds, Array.isArray(dx.supportNeeds.value) ? dx.supportNeeds.value.filter((item): item is string => typeof item === "string") : [], "MODERATE")
  ];

  return signals.sort((a, b) => a.code.localeCompare(b.code));
}
