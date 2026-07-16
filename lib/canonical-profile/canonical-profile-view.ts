import type { CvModel } from "@/components/professional-identity/document-downloads";
import type { CanonicalProfessionalIdentity, ProfessionalIdentityView, ProfessionalIdentityViewType, ViewFieldOverride, ViewFreshness } from "./canonical-profile.types";
import { uniqueClean, valueText } from "./canonical-profile-utils";

export function viewFreshnessFor(view: Pick<ProfessionalIdentityView, "profileVersion" | "configuration">, currentProfileVersion: number, changedEntityIds: string[] = []): ViewFreshness {
  if (view.profileVersion === currentProfileVersion) {
    return { profileVersionUsed: view.profileVersion, currentProfileVersion, status: "current", changedEntityIds: [] };
  }
  const selectedIds = new Set([
    ...(view.configuration.selectedEmploymentIds ?? []),
    ...(view.configuration.selectedEducationIds ?? []),
    ...(view.configuration.selectedSkillIds ?? []),
    ...(view.configuration.selectedCertificationIds ?? [])
  ]);
  const changedSelected = changedEntityIds.filter((id) => selectedIds.has(id));
  return {
    profileVersionUsed: view.profileVersion,
    currentProfileVersion,
    status: changedSelected.length || !changedEntityIds.length ? "stale" : "partially_stale",
    changedEntityIds: changedSelected.length ? changedSelected : changedEntityIds
  };
}

export function buildProfessionalIdentityView(input: {
  profile: CanonicalProfessionalIdentity;
  type: ProfessionalIdentityViewType;
  name?: string;
  configuration?: ProfessionalIdentityView["configuration"];
  generatedContent?: unknown;
}): ProfessionalIdentityView {
  const now = new Date().toISOString();
  return {
    id: `view-${input.profile.id}-${input.type}-${input.profile.version}`,
    userId: input.profile.userId,
    canonicalProfileId: input.profile.id,
    type: input.type,
    name: input.name,
    configuration: input.configuration ?? {},
    generatedContent: input.generatedContent,
    profileVersion: input.profile.version,
    createdAt: now,
    updatedAt: now
  };
}

function hidden(overrides: ViewFieldOverride[] | undefined, id: string) {
  return overrides?.some((override) => override.canonicalEntityId === id && override.overrideType === "hide") ?? false;
}

export function canonicalProfileToCvModel(profile: CanonicalProfessionalIdentity, configuration: ProfessionalIdentityView["configuration"] = {}): CvModel {
  const fieldOverrides = configuration.fieldOverrides ?? [];
  const selectedEmploymentIds = configuration.selectedEmploymentIds ? new Set(configuration.selectedEmploymentIds) : null;
  const selectedEducationIds = configuration.selectedEducationIds ? new Set(configuration.selectedEducationIds) : null;
  const selectedSkillIds = configuration.selectedSkillIds ? new Set(configuration.selectedSkillIds) : null;
  const employment = profile.employment
    .filter((item) => item.status !== "archived" && !hidden(fieldOverrides, item.id) && (!selectedEmploymentIds || selectedEmploymentIds.has(item.id)))
    .map((item) => ({
      role: valueText(item.canonicalTitle),
      company: valueText(item.employer),
      location: valueText(item.location),
      startDate: item.startDate?.value?.raw ?? "",
      endDate: item.endDate?.value?.current ? "Present" : item.endDate?.value?.raw ?? "",
      current: Boolean(item.isCurrent.value),
      achievements: uniqueClean([...item.achievements.map((achievement) => valueText(achievement.statement)), ...item.responsibilities.map((responsibility) => valueText(responsibility.statement))]).slice(0, 5)
    }));
  const education = profile.education
    .filter((item) => item.reviewStatus !== "archived" && !hidden(fieldOverrides, item.id) && (!selectedEducationIds || selectedEducationIds.has(item.id)))
    .map((item) => ({
      qualification: valueText(item.qualification),
      institution: valueText(item.institution),
      fieldOfStudy: valueText(item.fieldOfStudy),
      year: item.graduationDate?.value?.raw ?? item.endDate?.value?.raw ?? "",
      status: item.status.value
    }));
  const skills = profile.skills.filter((item) => item.status !== "archived" && item.explicitness !== "unconfirmed_implied" && !hidden(fieldOverrides, item.id) && (!selectedSkillIds || selectedSkillIds.has(item.id)));

  return {
    fullName: valueText(profile.identity.fullName),
    targetRole: configuration.targetRole ?? valueText(profile.professionalProfile.headline) ?? valueText(profile.identity.professionalHeadline),
    phone: valueText(profile.contact.primaryPhone),
    email: valueText(profile.contact.primaryEmail),
    city: valueText(profile.contact.city),
    country: valueText(profile.contact.country),
    linkedIn: valueText(profile.contact.linkedIn),
    portfolio: valueText(profile.contact.portfolio),
    github: valueText(profile.contact.github),
    website: valueText(profile.contact.professionalWebsite),
    professionalSummary: valueText(profile.professionalProfile.professionalSummary),
    coreSkills: uniqueClean(skills.filter((skill) => ["business", "management", "communication", "leadership", "interpersonal", "industry", "unknown"].includes(skill.category)).map((skill) => valueText(skill.canonicalName))),
    technicalSkills: uniqueClean(skills.filter((skill) => ["technical", "software", "tool", "platform", "programming_language", "framework", "laboratory"].includes(skill.category)).map((skill) => valueText(skill.canonicalName))),
    professionalSkills: uniqueClean(skills.filter((skill) => ["communication", "leadership", "interpersonal", "management"].includes(skill.category)).map((skill) => valueText(skill.canonicalName))),
    professionalExperience: employment,
    projects: profile.projects.filter((item) => item.status !== "archived").map((item) => ({ projectName: valueText(item.name), role: valueText(item.role), tools: [], description: valueText(item.description), impact: valueText(item.impact) })),
    education,
    certifications: profile.certifications.filter((item) => item.status !== "archived").map((item) => ({ name: valueText(item.canonicalName), provider: valueText(item.issuer), year: item.issueDate?.value?.raw ?? "", credentialUrl: valueText(item.credentialUrl) })),
    achievements: profile.achievements.map((item) => valueText(item.statement)).filter(Boolean),
    languages: profile.languages.map((item) => ({ language: valueText(item.language), level: valueText(item.normalizedProficiency ?? item.proficiency) })),
    references: { availableUponRequest: true, items: profile.references.map((item) => [valueText(item.name), valueText(item.role), valueText(item.organisation)].filter(Boolean).join(", ")).filter(Boolean) },
    optionalSections: {
      volunteerExperience: profile.volunteering.map((item) => [valueText(item.role), valueText(item.organisation), valueText(item.description)].filter(Boolean).join(" - ")).filter(Boolean),
      awards: profile.awards.map((item) => valueText(item.statement)).filter(Boolean),
      publications: profile.publications.map((item) => valueText(item.title)).filter(Boolean),
      conferences: [],
      professionalMemberships: profile.memberships.map((item) => valueText(item.name)).filter(Boolean),
      interests: [],
      portfolioLinks: [valueText(profile.contact.portfolio), valueText(profile.contact.github), valueText(profile.contact.professionalWebsite)].filter(Boolean),
      qrCodePlaceholder: ""
    }
  };
}

