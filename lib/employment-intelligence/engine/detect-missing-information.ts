import type { EmploymentIntelligenceInput } from "../domain/employment-intelligence-input";
import type { ReadinessDimensionKey } from "../domain/readiness";
import type { MissingInformation, MissingInformationImportance } from "./engine-types";
import { arrayValue, normalizeText, valueKnown } from "./normalize-input";

function missing(
  code: string,
  dimensions: ReadinessDimensionKey[],
  importance: MissingInformationImportance,
  reason: string,
  resolutionAction: string,
  blocksConclusion = false,
  userDeclined = false
): MissingInformation {
  return {
    code,
    affectedReadinessDimensions: dimensions,
    importance,
    reason,
    resolutionAction,
    userDeclined,
    blocksConclusion,
    explanationKey: `missing.${code.toLowerCase()}`
  };
}

export function detectMissingInformation(input: EmploymentIntelligenceInput): MissingInformation[] {
  const pi = input.professionalIdentity;
  const dx = input.employmentDiagnosis;
  const items: MissingInformation[] = [];

  if (!valueKnown(pi.currentSituation)) {
    items.push(missing("CURRENT_SITUATION_MISSING", ["IDENTITY_READINESS"], "REQUIRED_FOR_ASSESSMENT", "PATHZY needs the user's current situation to resume the right journey.", "Choose the current situation that fits best.", true, pi.currentSituation.provenance === "USER_DECLINED"));
  }
  if (!valueKnown(pi.careerGoal) || normalizeText(pi.careerGoal.value).length < 3) {
    items.push(missing("CAREER_GOAL_MISSING", ["CAREER_DIRECTION_READINESS", "OPPORTUNITY_READINESS"], "IMPORTANT", "A target direction helps PATHZY judge suitable pathways without guessing.", "Add a career goal or target role."));
  }
  if (!valueKnown(pi.workAuthorisation)) {
    items.push(missing("WORK_AUTHORIZATION_UNCLEAR", ["WORK_ELIGIBILITY_READINESS"], "REQUIRED_FOR_ASSESSMENT", "Work eligibility affects some pathways and document preparation.", "Confirm work authorization or mark it for review.", true));
  }
  if (!valueKnown(pi.location)) {
    items.push(missing("LOCATION_MISSING", ["PRACTICAL_ACCESS_READINESS", "OPPORTUNITY_READINESS"], "IMPORTANT", "Location is needed to assess access and opportunity context.", "Add city, region, or preferred work location."));
  }
  if (!valueKnown(pi.availability)) {
    items.push(missing("AVAILABILITY_MISSING", ["PRACTICAL_ACCESS_READINESS", "APPLICATION_READINESS"], "IMPORTANT", "Availability affects realistic pathways and application timing.", "Add when and how the user can work."));
  }
  if (!arrayValue(pi.skills).length) {
    items.push(missing("SKILLS_MISSING", ["SKILLS_READINESS"], "IMPORTANT", "Skills are needed to connect identity to pathways.", "Add skills from work, study, projects, volunteering, or informal experience."));
  }
  if (!arrayValue(pi.experience).length && !arrayValue(pi.projects).length && !arrayValue(pi.achievements).length) {
    items.push(missing("EXPERIENCE_OR_PROJECT_EVIDENCE_MISSING", ["EXPERIENCE_READINESS", "EVIDENCE_READINESS"], "USEFUL", "Formal experience is not required, but examples improve confidence.", "Add work, informal work, projects, achievements, volunteering, or practical examples."));
  }
  if (!arrayValue(pi.education).length) {
    items.push(missing("EDUCATION_MISSING", ["QUALIFICATION_READINESS"], "USEFUL", "Education can support some pathways and credential checks.", "Add education or mark it as not applicable."));
  }
  if (!valueKnown(dx.transportAccess)) {
    items.push(missing("TRANSPORT_ACCESS_UNKNOWN", ["PRACTICAL_ACCESS_READINESS"], "USEFUL", "Transport affects practical access, not capability.", "Add transport access so PATHZY can adapt suggestions."));
  }
  if (!valueKnown(dx.deviceInternetAccess)) {
    items.push(missing("DEVICE_INTERNET_ACCESS_UNKNOWN", ["DIGITAL_ACCESS_READINESS"], "USEFUL", "Device and internet access affect online applications.", "Add device and internet access."));
  }
  if (!valueKnown(dx.literacyCommunicationComfort)) {
    items.push(missing("COMMUNICATION_COMFORT_UNKNOWN", ["CONFIDENCE_AND_SUPPORT_READINESS", "INTERVIEW_READINESS"], "USEFUL", "Communication support preferences help PATHZY avoid overwhelming guidance.", "Add communication comfort or support needs."));
  }
  if (!valueKnown(dx.incomeUrgency)) {
    items.push(missing("INCOME_URGENCY_UNKNOWN", ["OPPORTUNITY_READINESS"], "USEFUL", "Urgency affects whether immediate pathways should be prioritized.", "Add immediate income urgency."));
  }

  return items.sort((a, b) => a.code.localeCompare(b.code));
}
