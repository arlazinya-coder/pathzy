import type { CanonicalProfessionalIdentity, ProfessionalIdentityView } from "@/lib/canonical-profile";
import { valueText } from "@/lib/canonical-profile";
import type { CvContent, CvViewConfiguration, ProfessionalDocumentLanguage } from "./professional-document.types";
import { createPresentationField } from "./presentation-fields";
import { selectCvContent } from "./cv-content-selector";

function languageFrom(configuration: CvViewConfiguration): ProfessionalDocumentLanguage {
  return configuration.language ?? "en";
}

function selectedIds(contentType: string, configuration: CvViewConfiguration, profile: CanonicalProfessionalIdentity) {
  const selection = selectCvContent(profile, configuration);
  const ids = selection.selected.filter((item) => item.entityType === contentType).map((item) => item.entityId);
  return new Set(ids);
}

export function buildCvContentFromCanonicalProfile(profile: CanonicalProfessionalIdentity, configuration: CvViewConfiguration): CvContent {
  const language = languageFrom(configuration);
  const employmentIds = selectedIds("employment", configuration, profile);
  const educationIds = selectedIds("education", configuration, profile);
  const skillIds = selectedIds("core_skills", configuration, profile);
  const certificationIds = selectedIds("certifications", configuration, profile);
  const projectIds = selectedIds("projects", configuration, profile);
  const languageIds = selectedIds("languages", configuration, profile);
  const header = {
    fullName: createPresentationField({ value: valueText(profile.identity.fullName), canonicalFieldPath: "identity.fullName", language }),
    targetRole: createPresentationField({ value: configuration.targetRole ?? valueText(profile.professionalProfile.headline) ?? valueText(profile.identity.professionalHeadline), canonicalFieldPath: "professionalProfile.headline", language }),
    email: createPresentationField({ value: valueText(profile.contact.primaryEmail), canonicalFieldPath: "contact.primaryEmail", language }),
    phone: createPresentationField({ value: valueText(profile.contact.primaryPhone), canonicalFieldPath: "contact.primaryPhone", language }),
    city: createPresentationField({ value: valueText(profile.contact.city), canonicalFieldPath: "contact.city", language }),
    country: createPresentationField({ value: valueText(profile.contact.country), canonicalFieldPath: "contact.country", language }),
    linkedIn: createPresentationField({ value: valueText(profile.contact.linkedIn), canonicalFieldPath: "contact.linkedIn", language }),
    portfolio: createPresentationField({ value: valueText(profile.contact.portfolio), canonicalFieldPath: "contact.portfolio", language }),
    github: createPresentationField({ value: valueText(profile.contact.github), canonicalFieldPath: "contact.github", language }),
    website: createPresentationField({ value: valueText(profile.contact.professionalWebsite), canonicalFieldPath: "contact.professionalWebsite", language })
  };

  return {
    header,
    professionalSummary: valueText(profile.professionalProfile.professionalSummary)
      ? createPresentationField({ value: valueText(profile.professionalProfile.professionalSummary), canonicalFieldPath: "professionalProfile.professionalSummary", language })
      : undefined,
    skills: profile.skills.filter((item) => skillIds.has(item.id)).map((skill) => ({
      id: skill.id,
      name: createPresentationField({ value: valueText(skill.canonicalName), canonicalEntityId: skill.id, canonicalFieldPath: "skills.canonicalName", language }),
      category: skill.category,
      included: true,
      selectionReason: skill.status === "confirmed" ? "Confirmed skill" : "Selected skill"
    })),
    employment: profile.employment.filter((item) => employmentIds.has(item.id)).map((employment) => ({
      id: employment.id,
      role: createPresentationField({ value: valueText(employment.canonicalTitle), canonicalEntityId: employment.id, canonicalFieldPath: "employment.canonicalTitle", language }),
      employer: createPresentationField({ value: valueText(employment.employer), canonicalEntityId: employment.id, canonicalFieldPath: "employment.employer", language }),
      location: createPresentationField({ value: valueText(employment.location), canonicalEntityId: employment.id, canonicalFieldPath: "employment.location", language }),
      dateRange: createPresentationField({ value: [employment.startDate?.value?.raw, employment.endDate?.value?.current ? "Present" : employment.endDate?.value?.raw].filter(Boolean).join(" - "), canonicalEntityId: employment.id, canonicalFieldPath: "employment.dateRange", language }),
      bullets: [...employment.achievements.map((achievement) => valueText(achievement.statement)), ...employment.responsibilities.map((responsibility) => valueText(responsibility.statement))]
        .filter(Boolean)
        .slice(0, 5)
        .map((value) => createPresentationField({ value, canonicalEntityId: employment.id, canonicalFieldPath: "employment.bullets", language })),
      included: true,
      selectionReason: employment.status === "confirmed" ? "Confirmed employment" : "Selected for review"
    })),
    education: profile.education.filter((item) => educationIds.has(item.id)).map((education) => ({
      id: education.id,
      qualification: createPresentationField({ value: valueText(education.qualification), canonicalEntityId: education.id, canonicalFieldPath: "education.qualification", language }),
      institution: createPresentationField({ value: valueText(education.institution), canonicalEntityId: education.id, canonicalFieldPath: "education.institution", language }),
      fieldOfStudy: createPresentationField({ value: valueText(education.fieldOfStudy), canonicalEntityId: education.id, canonicalFieldPath: "education.fieldOfStudy", language }),
      date: createPresentationField({ value: education.graduationDate?.value?.raw ?? education.endDate?.value?.raw ?? "", canonicalEntityId: education.id, canonicalFieldPath: "education.date", language }),
      included: true,
      selectionReason: "Selected education record"
    })),
    certifications: profile.certifications.filter((item) => certificationIds.has(item.id)).map((certification) => ({
      id: certification.id,
      name: createPresentationField({ value: valueText(certification.canonicalName), canonicalEntityId: certification.id, canonicalFieldPath: "certifications.canonicalName", language }),
      issuer: createPresentationField({ value: valueText(certification.issuer), canonicalEntityId: certification.id, canonicalFieldPath: "certifications.issuer", language }),
      date: createPresentationField({ value: certification.issueDate?.value?.raw ?? "", canonicalEntityId: certification.id, canonicalFieldPath: "certifications.issueDate", language }),
      included: certification.status !== "archived",
      selectionReason: "Certification evidence"
    })),
    projects: profile.projects.filter((item) => projectIds.has(item.id)).map((project) => ({
      id: project.id,
      name: createPresentationField({ value: valueText(project.name), canonicalEntityId: project.id, canonicalFieldPath: "projects.name", language }),
      role: createPresentationField({ value: valueText(project.role), canonicalEntityId: project.id, canonicalFieldPath: "projects.role", language }),
      description: createPresentationField({ value: valueText(project.description), canonicalEntityId: project.id, canonicalFieldPath: "projects.description", language }),
      impact: createPresentationField({ value: valueText(project.impact), canonicalEntityId: project.id, canonicalFieldPath: "projects.impact", language }),
      included: project.status !== "archived",
      selectionReason: "Project proof"
    })),
    languages: profile.languages.filter((item) => languageIds.has(item.id)).map((item) => ({
      id: item.id,
      language: createPresentationField({ value: valueText(item.language), canonicalEntityId: item.id, canonicalFieldPath: "languages.language", language }),
      proficiency: createPresentationField({ value: valueText(item.normalizedProficiency ?? item.proficiency), canonicalEntityId: item.id, canonicalFieldPath: "languages.proficiency", language }),
      included: item.status !== "archived",
      selectionReason: "Language record"
    })),
    additionalSections: []
  };
}

export function buildCvViewFromContent(profile: CanonicalProfessionalIdentity, configuration: CvViewConfiguration, content: CvContent): ProfessionalIdentityView {
  return {
    id: `cv-view-${profile.id}-${profile.version}-${Date.now()}`,
    userId: profile.userId,
    canonicalProfileId: profile.id,
    type: "cv",
    name: configuration.targetRole ? `${configuration.targetRole} CV` : "PATHZY CV",
    configuration: {
      selectedEmploymentIds: content.employment.map((item) => item.id),
      selectedEducationIds: content.education.map((item) => item.id),
      selectedSkillIds: content.skills.map((item) => item.id),
      selectedCertificationIds: content.certifications.map((item) => item.id),
      language: configuration.language,
      targetRole: configuration.targetRole,
      targetJobId: configuration.targetJobId,
      fieldOverrides: []
    },
    generatedContent: content,
    profileVersion: profile.version,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
