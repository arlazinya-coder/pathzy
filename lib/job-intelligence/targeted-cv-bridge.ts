import type { CanonicalProfessionalIdentity } from "@/lib/canonical-profile";
import { defaultCvViewConfiguration } from "@/lib/professional-documents/cv-configuration";
import type { CvViewConfiguration } from "@/lib/professional-documents/professional-document.types";
import type { CanonicalEvidenceReference, JobGap, JobRequirementMatch, StructuredJobOpportunity, TargetedCvPreparationPlan } from "./job-intelligence.types";

function uniqueEvidence(matches: JobRequirementMatch[]) {
  const seen = new Set<string>();
  const evidence: CanonicalEvidenceReference[] = [];
  for (const match of matches) {
    for (const item of match.evidence) {
      const key = `${item.entityType}:${item.entityId}`;
      if (!seen.has(key)) {
        seen.add(key);
        evidence.push(item);
      }
    }
  }
  return evidence;
}

function selectedIds(evidence: CanonicalEvidenceReference[]) {
  return {
    employment: evidence.filter((item) => item.entityType === "employment").map((item) => item.entityId),
    education: evidence.filter((item) => item.entityType === "education").map((item) => item.entityId),
    certifications: evidence.filter((item) => item.entityType === "certification" || item.entityType === "licence").map((item) => item.entityId),
    skills: evidence.filter((item) => item.entityType === "skill").map((item) => item.entityId),
    projects: evidence.filter((item) => item.entityType === "project").map((item) => item.entityId),
    languages: evidence.filter((item) => item.entityType === "language").map((item) => item.entityId)
  };
}

export function createTargetedCvPreparationPlan(input: {
  profile: CanonicalProfessionalIdentity;
  job: StructuredJobOpportunity;
  matches: JobRequirementMatch[];
  gaps: JobGap[];
}): TargetedCvPreparationPlan {
  const evidenceToEmphasize = uniqueEvidence(input.matches.filter((match) => match.status === "matched" || match.status === "partial")).slice(0, 12);
  const configuration: CvViewConfiguration = defaultCvViewConfiguration({
    purpose: "targeted",
    language: input.job.language,
    targetRole: input.job.title,
    targetJobId: input.job.id
  });
  configuration.selectedEntityIds = selectedIds(evidenceToEmphasize);
  return {
    targetRole: input.job.title,
    targetCompany: input.job.company,
    targetJobId: input.job.id,
    cvConfiguration: {
      purpose: configuration.purpose,
      targetRole: configuration.targetRole,
      targetJobId: configuration.targetJobId,
      selectedEntityIds: configuration.selectedEntityIds
    },
    truthfulPositioning: evidenceToEmphasize.slice(0, 5).map((item) => `${item.label}: ${item.value}`),
    evidenceToEmphasize,
    gapsToAddressBeforeApplying: input.gaps.filter((gap) => gap.importance === "mandatory").slice(0, 5),
    userReviewQuestions: input.matches.flatMap((match) => match.questions).slice(0, 6),
    blockedClaims: input.gaps.map((gap) => gap.requirement)
  };
}
