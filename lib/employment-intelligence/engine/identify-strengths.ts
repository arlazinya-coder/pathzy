import type { EmploymentIntelligenceInput } from "../domain/employment-intelligence-input";
import type { EvidenceAssessmentSummary, Strength } from "./engine-types";
import { createConfidenceAssessment } from "./calculate-confidence";
import { arrayValue } from "./normalize-input";
import { includesAnyText } from "./assess-evidence";

export function identifyStrengths(input: EmploymentIntelligenceInput, evidenceSummary: EvidenceAssessmentSummary): Strength[] {
  const pi = input.professionalIdentity;
  const skills = arrayValue(pi.skills);
  const experience = arrayValue(pi.experience);
  const projects = arrayValue(pi.projects);
  const achievements = arrayValue(pi.achievements);
  const education = arrayValue(pi.education);
  const strengths: Strength[] = [];

  const baseConfidence = createConfidenceAssessment({
    completeness: 0.72,
    evidence: evidenceSummary.strongestSupportedAssets.length ? 0.68 : 0.36,
    ruleCertainty: 0.72,
    countryContext: 0.35,
    rationale: ["strengths.from.professional.identity.evidence"]
  });

  if (experience.length) {
    strengths.push({
      code: "WORK_EXPERIENCE_PRESENT",
      evidence: evidenceSummary.strongestSupportedAssets,
      confidence: baseConfidence,
      relevance: "Confirmed experience can support direct, skilled, return-to-work, or temporary pathways.",
      suitablePathwayConnections: ["DIRECT_EMPLOYMENT", "SKILLED_EMPLOYMENT", "RETURN_TO_WORK", "TEMPORARY_WORK"],
      explanationKey: "strength.work_experience_present"
    });
  }
  if (projects.length || achievements.length) {
    strengths.push({
      code: "PROJECT_OR_ACHIEVEMENT_EVIDENCE",
      evidence: evidenceSummary.strongestSupportedAssets,
      confidence: baseConfidence,
      relevance: "Projects and achievements can provide evidence even when formal work history is limited.",
      suitablePathwayConnections: ["SKILLS_FIRST_TRANSITION", "FREELANCE_WORK", "GRADUATE_PROGRAMME"],
      explanationKey: "strength.project_or_achievement_evidence"
    });
  }
  if (skills.length) {
    strengths.push({
      code: "TRANSFERABLE_SKILLS_PRESENT",
      evidence: evidenceSummary.strongestSupportedAssets,
      confidence: baseConfidence,
      relevance: "Skills can inform suitable role families once supported by examples.",
      suitablePathwayConnections: ["ENTRY_LEVEL_EMPLOYMENT", "SKILLS_FIRST_TRANSITION", "SUPPORTED_EMPLOYMENT"],
      explanationKey: "strength.transferable_skills_present"
    });
  }
  if (education.length && !experience.length) {
    strengths.push({
      code: "EDUCATION_FIRST_PROFILE",
      evidence: evidenceSummary.strongestSupportedAssets,
      confidence: baseConfidence,
      relevance: "Education can support graduate, internship, learnership, or entry-level routes.",
      suitablePathwayConnections: ["GRADUATE_PROGRAMME", "INTERNSHIP", "LEARNERSHIP", "ENTRY_LEVEL_EMPLOYMENT"],
      explanationKey: "strength.education_first_profile"
    });
  }
  if (includesAnyText([...experience, ...skills], ["clean", "security", "driver", "retail", "warehouse", "domestic", "customer", "service", "administration", "admin"])) {
    strengths.push({
      code: "PRACTICAL_SERVICE_OR_OPERATIONAL_EXPERIENCE",
      evidence: evidenceSummary.strongestSupportedAssets,
      confidence: baseConfidence,
      relevance: "Practical service or operational experience counts even when it is informal.",
      suitablePathwayConnections: ["ENTRY_LEVEL_EMPLOYMENT", "TEMPORARY_WORK", "PART_TIME_WORK", "INFORMAL_OR_COMMUNITY_WORK"],
      explanationKey: "strength.practical_service_or_operational_experience"
    });
  }

  return Array.from(new Map(strengths.map((item) => [item.code, item])).values()).sort((a, b) => a.code.localeCompare(b.code));
}
