import type { EmploymentIntelligenceInput } from "../domain/employment-intelligence-input";
import type { EvidenceRecord } from "../domain/evidence";
import type {
  CandidateContextAssessment,
  CandidateContextCode,
  CareerDirection,
  NormalizedJobOpportunity,
  NormalizedSkillCategory,
  NormalizedSkillEvidence,
  OpportunityMatch,
  OpportunityMatcherContract,
  SkillIntelligenceSummary
} from "../domain/opportunity-matching";
import type { JobLevel } from "../domain/job-levels";
import { createConfidenceAssessment } from "./calculate-confidence";
import type { EvidenceAssessmentSummary, MissingInformation, PathwayEvaluation, Strength } from "./engine-types";
import { arrayValue, normalizeText } from "./normalize-input";

const skillAliases: Record<string, string> = {
  excel: "Microsoft Excel",
  "ms excel": "Microsoft Excel",
  "microsoft excel": "Microsoft Excel",
  word: "Microsoft Word",
  "ms word": "Microsoft Word",
  sql: "SQL",
  "structured query language": "SQL",
  javascript: "JavaScript",
  js: "JavaScript",
  communication: "Communication",
  "customer service": "Customer Service"
};

function serializeItem(item: unknown) {
  if (typeof item === "string") return normalizeText(item);
  if (!item || typeof item !== "object") return "";
  const source = item as Record<string, unknown>;
  return [
    source.title,
    source.role,
    source.position,
    source.name,
    source.company,
    source.institution,
    source.qualification,
    source.description,
    source.summary,
    source.field,
    Array.isArray(source.stack) ? source.stack.join(" ") : source.stack,
    Array.isArray(source.tools) ? source.tools.join(" ") : source.tools,
    Array.isArray(source.technologies) ? source.technologies.join(" ") : source.technologies,
    source.outcome
  ].map(normalizeText).filter(Boolean).join(" ");
}

function uniqueOrdered(values: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values.map(normalizeText).filter(Boolean)) {
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(value);
  }
  return output;
}

function textFromItems(items: unknown[]) {
  return items.map(serializeItem).filter(Boolean).join(" ").toLowerCase();
}

function evidenceForField(summary: EvidenceAssessmentSummary, field: string): EvidenceRecord[] {
  const direct = summary.assessments.find((item) => item.code === field)?.evidence ?? [];
  if (direct.length) return direct;
  return summary.strongestSupportedAssets.filter((item) => item.supportingField?.toUpperCase() === field).slice(0, 4);
}

function confidence(completeness: number, evidence: number, rationale: string[]) {
  return createConfidenceAssessment({ completeness, evidence, ruleCertainty: 0.74, countryContext: 0.35, rationale });
}

export function classifyCandidateContext(input: EmploymentIntelligenceInput, evidenceSummary: EvidenceAssessmentSummary): CandidateContextAssessment {
  const pi = input.professionalIdentity;
  const experience = arrayValue(pi.experience);
  const education = arrayValue(pi.education);
  const skills = arrayValue(pi.skills);
  const projects = arrayValue(pi.projects);
  const certificates = arrayValue(pi.certificates);
  const licences = arrayValue(pi.licences);
  const combined = textFromItems([...experience, ...education, ...skills, ...projects, ...certificates, ...licences, pi.currentSituation.value]);
  const primary = new Set<CandidateContextCode>();
  const secondary = new Set<CandidateContextCode>();

  if (!experience.length) primary.add("NO_FORMAL_EXPERIENCE");
  if (education.length && experience.length <= 1) primary.add("GRADUATE_OR_EMERGING_TALENT");
  if (experience.length > 0 && experience.length <= 2) primary.add("ENTRY_LEVEL");
  if (experience.length >= 3) primary.add("EXPERIENCED_PROFESSIONAL");
  if (experience.length >= 8 || /director|executive|head of|senior manager|chief/.test(combined)) primary.add("SENIOR_PROFESSIONAL");
  if (primary.has("SENIOR_PROFESSIONAL")) primary.add("EXPERIENCED_PROFESSIONAL");
  if (/career change|transition|changing|switch/.test(combined)) primary.add("CAREER_CHANGER");
  if (/trade|artisan|weld|electric|plumb|mechanic|driver|licen[cs]e/.test(combined)) primary.add("VOCATIONAL_OR_TRADE");
  if (/clean|security|retail|cashier|customer|hospitality|domestic|driver|frontline/.test(combined)) primary.add("SERVICE_OR_FRONTLINE");
  if (/informal|community|volunteer|self-employed|family business/.test(combined)) secondary.add("INFORMAL_WORK_BACKGROUND");
  if (projects.length >= 2 || (projects.length && !experience.length)) primary.add("PROJECT_HEAVY_PROFILE");
  if (!primary.size) primary.add(skills.length || education.length ? "ENTRY_LEVEL" : "NO_FORMAL_EXPERIENCE");

  const weightingNotes = [
    primary.has("GRADUATE_OR_EMERGING_TALENT") ? "Education, projects and skills carry extra weight." : "",
    primary.has("EXPERIENCED_PROFESSIONAL") ? "Experience, achievements and specialization carry extra weight." : "",
    primary.has("VOCATIONAL_OR_TRADE") ? "Licences, practical capability and verified experience carry extra weight." : "",
    primary.has("SERVICE_OR_FRONTLINE") ? "Availability, location and practical capabilities can strongly influence recommendations." : "",
    primary.has("PROJECT_HEAVY_PROFILE") ? "Project evidence can compensate for limited formal employment where relevant." : ""
  ].filter(Boolean);

  return {
    primaryContexts: Array.from(primary),
    secondaryContexts: Array.from(secondary).filter((item) => !primary.has(item)),
    weightingNotes,
    evidence: evidenceSummary.strongestSupportedAssets.slice(0, 6),
    confidence: confidence(primary.size ? 0.72 : 0.4, evidenceSummary.strongestSupportedAssets.length ? 0.62 : 0.3, ["candidate_context.deterministic"])
  };
}

export function deriveCareerDirections(input: EmploymentIntelligenceInput, strengths: Strength[], pathways: PathwayEvaluation[], evidenceSummary: EvidenceAssessmentSummary): CareerDirection {
  const pi = input.professionalIdentity;
  const statedGoal = normalizeText(pi.careerGoal.value);
  const employmentPreferenceValues = pi.employmentPreferences.value && typeof pi.employmentPreferences.value === "object"
    ? Object.values(pi.employmentPreferences.value).map(String)
    : [];
  const preferredRoles = uniqueOrdered([
    ...employmentPreferenceValues,
    ...arrayValue(pi.projects).map(serializeItem)
  ]).slice(0, 6);
  const strongestStrengths = strengths.map((item) => item.code.replace(/_/g, " ").toLowerCase()).slice(0, 4);
  const primaryTargets = uniqueOrdered([statedGoal, ...preferredRoles]).slice(0, 3);
  const adjacentTargets = uniqueOrdered([
    ...strongestStrengths.map((item) => `${item} related role`),
    ...pathways.slice(0, 3).map((item) => item.pathwayCode.replace(/_/g, " ").toLowerCase())
  ]).filter((item) => !primaryTargets.some((target) => target.toLowerCase() === item.toLowerCase())).slice(0, 4);
  const exploratoryTargets = pathways.slice(3, 6).map((item) => item.pathwayCode.replace(/_/g, " ").toLowerCase());
  return {
    primaryTargets: primaryTargets.length ? primaryTargets : ["Career direction in progress"],
    adjacentTargets,
    exploratoryTargets,
    confidence: confidence(statedGoal ? 0.82 : 0.45, evidenceSummary.strongestSupportedAssets.length ? 0.65 : 0.28, ["career_direction.grounded_profile"]),
    reasoning: [
      statedGoal ? "Primary direction uses the stated Professional Identity career goal." : "Primary direction remains provisional because the career goal is incomplete.",
      adjacentTargets.length ? "Adjacent roles are derived from supported strengths and pathway analysis." : "Adjacent role confidence will improve with more skills, experience, or project evidence."
    ],
    evidence: evidenceForField(evidenceSummary, "CAREER_GOAL").slice(0, 4)
  };
}

function categorizeSkill(skill: string, sourceField: string): NormalizedSkillCategory {
  const text = skill.toLowerCase();
  if (sourceField === "LANGUAGES") return "LANGUAGE";
  if (sourceField === "LICENCES" || sourceField === "CERTIFICATES") return "LICENCE_OR_CERTIFICATION";
  if (/excel|word|powerpoint|sql|javascript|python|cloud|software|system|platform|tool|microsoft|google/.test(text)) return "TOOLS_AND_PLATFORMS";
  if (/technical|data|analysis|programming|support|maintenance|machine|equipment/.test(text)) return "TECHNICAL";
  if (/communication|team|leadership|problem|organis|customer|service|admin/.test(text)) return "TRANSFERABLE";
  if (/health|finance|education|security|retail|hospitality|engineering|construction/.test(text)) return "DOMAIN";
  return "CORE_PROFESSIONAL";
}

export function buildSkillIntelligence(input: EmploymentIntelligenceInput, evidenceSummary: EvidenceAssessmentSummary): SkillIntelligenceSummary {
  const sources: Array<{ field: string; items: unknown[] }> = [
    { field: "SKILLS", items: arrayValue(input.professionalIdentity.skills) },
    { field: "EXPERIENCE", items: arrayValue(input.professionalIdentity.experience) },
    { field: "PROJECTS", items: arrayValue(input.professionalIdentity.projects) },
    { field: "EDUCATION", items: arrayValue(input.professionalIdentity.education) },
    { field: "CERTIFICATES", items: arrayValue(input.professionalIdentity.certificates) },
    { field: "LICENCES", items: arrayValue(input.professionalIdentity.licences) },
    { field: "LANGUAGES", items: arrayValue(input.professionalIdentity.languages) }
  ];
  const normalized = new Map<string, NormalizedSkillEvidence>();
  const equivalenceRules = new Set<string>();
  const knownAliasKeys = Object.keys(skillAliases);

  for (const source of sources) {
    for (const rawItem of source.items) {
      const serialized = serializeItem(rawItem);
      const candidates = source.field === "SKILLS" || source.field === "LANGUAGES" || source.field === "LICENCES" || source.field === "CERTIFICATES"
        ? serialized.split(/[,;/|]/)
        : [serialized, ...knownAliasKeys.filter((alias) => serialized.toLowerCase().includes(alias))];
      for (const candidate of candidates.map(normalizeText).filter(Boolean).slice(0, 24)) {
        const aliasKey = candidate.toLowerCase();
        const canonicalName = skillAliases[aliasKey] ?? candidate;
        if (skillAliases[aliasKey] && skillAliases[aliasKey] !== candidate) equivalenceRules.add(`${candidate} -> ${skillAliases[aliasKey]}`);
        const key = canonicalName.toLowerCase();
        const existing = normalized.get(key);
        const states: NormalizedSkillEvidence["evidenceStates"] = [];
        if (source.field === "SKILLS") states.push("USER_DECLARED");
        if (source.field === "EXPERIENCE") states.push("EXPERIENCE_EVIDENCED");
        if (source.field === "PROJECTS") states.push("PROJECT_EVIDENCED");
        if (source.field === "EDUCATION") states.push("QUALIFICATION_SUPPORTED");
        if (source.field === "CERTIFICATES" || source.field === "LICENCES") states.push("CERTIFICATION_SUPPORTED");
        const evidence = evidenceForField(evidenceSummary, source.field);
        const next: NormalizedSkillEvidence = existing ?? {
          canonicalName,
          aliases: [],
          category: categorizeSkill(canonicalName, source.field),
          evidenceStates: [],
          evidence: [],
          confidence: confidence(0.4, 0.2, ["skill_intelligence.initial"]),
          unsupportedClaim: false
        };
        next.aliases = uniqueOrdered([...next.aliases, candidate].filter((item) => item !== canonicalName));
        next.evidenceStates = uniqueOrdered([...next.evidenceStates, ...states]) as NormalizedSkillEvidence["evidenceStates"];
        next.evidence = [...next.evidence, ...evidence].slice(0, 6);
        next.unsupportedClaim = next.evidenceStates.includes("USER_DECLARED") && next.evidenceStates.length === 1;
        next.confidence = confidence(
          next.evidenceStates.length >= 2 ? 0.8 : 0.58,
          next.unsupportedClaim ? 0.35 : next.evidence.length ? 0.72 : 0.45,
          [`skill_intelligence.${next.category.toLowerCase()}`]
        );
        normalized.set(key, next);
      }
    }
  }

  const normalizedSkills = Array.from(normalized.values()).sort((a, b) => b.evidenceStates.length - a.evidenceStates.length || a.canonicalName.localeCompare(b.canonicalName));
  return {
    normalizedSkills,
    strongestSkills: normalizedSkills.filter((item) => !item.unsupportedClaim).slice(0, 12),
    skillsNeedingEvidence: normalizedSkills.filter((item) => item.unsupportedClaim).slice(0, 10),
    equivalenceRulesApplied: Array.from(equivalenceRules)
  };
}

export function buildOpportunityMatcherContract(args: {
  candidateContext: CandidateContextAssessment;
  careerDirection: CareerDirection;
  skillIntelligence: SkillIntelligenceSummary;
  suitableJobLevels: JobLevel[];
}): OpportunityMatcherContract {
  return {
    version: "employment-opportunity-contract.v1",
    consumes: "EmploymentIntelligenceProfile",
    candidateContexts: args.candidateContext.primaryContexts,
    careerTargets: [...args.careerDirection.primaryTargets, ...args.careerDirection.adjacentTargets],
    skillNames: args.skillIntelligence.normalizedSkills.map((item) => item.canonicalName),
    suitableJobLevels: args.suitableJobLevels,
    matchDimensions: [
      "target-role alignment",
      "skills alignment",
      "experience alignment",
      "education alignment",
      "project/evidence alignment",
      "certification/licence alignment",
      "career-level alignment",
      "location alignment",
      "work authorization",
      "language alignment",
      "employment-type preference",
      "availability",
      "salary alignment where salary is known"
    ],
    freshnessRule: "Do not recommend expired opportunities as current.",
    feedbackPrepared: {
      positive: "RELEVANT",
      negative: "NOT_FOR_ME",
      reasons: ["wrong career", "too far", "too senior", "too junior", "salary", "qualification mismatch", "not interested"]
    }
  };
}

export function explainOpportunityMatch(args: {
  opportunity: NormalizedJobOpportunity;
  careerDirection: CareerDirection;
  skillIntelligence: SkillIntelligenceSummary;
  missingInformation: MissingInformation[];
  evidenceSummary: EvidenceAssessmentSummary;
}): OpportunityMatch {
  const opportunity = args.opportunity;
  const supportedSkills = new Set(args.skillIntelligence.normalizedSkills.map((item) => item.canonicalName.toLowerCase()));
  const mandatory = opportunity.requirements.filter((item) => item.importance === "MANDATORY");
  const missingMandatory = mandatory.filter((item) => item.category === "SKILL" && !supportedSkills.has(item.label.toLowerCase()));
  const unknownEligibility = mandatory.filter((item) => ["WORK_AUTHORIZATION", "LICENCE", "LOCATION", "LANGUAGE"].includes(item.category) && !supportedSkills.has(item.label.toLowerCase()));
  const targetAligned = args.careerDirection.primaryTargets.some((target) => opportunity.title.toLowerCase().includes(target.toLowerCase()));
  const requiredSkillMatches = opportunity.requiredSkills.filter((skill) => supportedSkills.has(skill.toLowerCase()));
  const preferredSkillMatches = opportunity.preferredSkills.filter((skill) => supportedSkills.has(skill.toLowerCase()));
  const rawSuitability = Math.min(100, Math.round((targetAligned ? 28 : 8) + requiredSkillMatches.length * 14 + preferredSkillMatches.length * 8 + args.evidenceSummary.strongestSupportedAssets.length * 3));
  const eligibilityStatus = opportunity.status === "EXPIRED"
    ? "BLOCKED"
    : unknownEligibility.length
      ? "UNKNOWN"
      : missingMandatory.length
        ? "CONDITIONAL"
        : "ELIGIBLE";
  return {
    jobId: opportunity.id,
    eligibilityStatus,
    suitabilityScore: rawSuitability,
    suitabilityLabel: rawSuitability >= 75 ? "EXCELLENT" : rawSuitability >= 55 ? "STRONG" : rawSuitability >= 35 ? "POSSIBLE" : "LOW",
    confidence: confidence(args.missingInformation.length ? 0.54 : 0.78, args.evidenceSummary.strongestSupportedAssets.length ? 0.68 : 0.32, ["opportunity_match.explainable"]),
    strongestMatches: [...requiredSkillMatches, ...preferredSkillMatches].slice(0, 5).map((skill) => ({ label: skill, evidence: args.evidenceSummary.strongestSupportedAssets.slice(0, 3) })),
    gaps: [
      ...missingMandatory.map((item) => ({ requirementId: item.id, label: item.label, type: "DEVELOPMENT_GAP" as const })),
      ...args.missingInformation.slice(0, 4).map((item) => ({ label: item.code, type: "MISSING_INFORMATION" as const }))
    ],
    criticalBarriers: [
      ...(opportunity.status === "EXPIRED" ? [{ label: "Opportunity appears expired", reason: "Closing-date/freshness checks are independent from professional suitability." }] : []),
      ...unknownEligibility.map((item) => ({ requirementId: item.id, label: item.label, reason: "Eligibility-related information is unknown and must not be guessed." }))
    ],
    reasons: [
      targetAligned ? "The title aligns with the current career direction." : "Career-direction alignment is partial or uncertain.",
      requiredSkillMatches.length ? "Required skills are supported by Professional Identity." : "Required skill support needs review.",
      "Eligibility and suitability are evaluated separately."
    ],
    recommendedAction: opportunity.status === "EXPIRED" || eligibilityStatus === "BLOCKED"
      ? "DO_NOT_RECOMMEND_NOW"
      : eligibilityStatus === "UNKNOWN"
        ? "APPLY_WITH_REVIEW"
        : rawSuitability >= 55
          ? "WORTH_APPLYING"
          : "PREPARE_FIRST",
    dimensions: {
      TARGET_ROLE_ALIGNMENT: targetAligned ? "STRONG" : "PARTIAL",
      SKILLS_READINESS: requiredSkillMatches.length ? "STRONG" : "WEAK",
      WORK_ELIGIBILITY_READINESS: unknownEligibility.length ? "UNKNOWN" : "STRONG",
      LOCATION_ALIGNMENT: opportunity.location ? "PARTIAL" : "UNKNOWN",
      SALARY_ALIGNMENT: opportunity.salary ? "PARTIAL" : "UNKNOWN"
    }
  };
}
