import type { CvModel } from "@/components/professional-identity/document-downloads";
import type { CvContent, PresentationField } from "./professional-document.types";
import { fieldText } from "./presentation-fields";

function text(field: PresentationField | undefined) {
  return fieldText(field);
}

function texts(fields: PresentationField[]) {
  return fields.map(text).filter(Boolean);
}

export function cvModelFromCvContent(content: CvContent): CvModel {
  return {
    fullName: text(content.header.fullName),
    targetRole: text(content.header.targetRole),
    phone: text(content.header.phone),
    email: text(content.header.email),
    city: text(content.header.city),
    country: text(content.header.country),
    linkedIn: text(content.header.linkedIn),
    portfolio: text(content.header.portfolio),
    github: text(content.header.github),
    website: text(content.header.website),
    professionalSummary: text(content.professionalSummary),
    coreSkills: content.skills.filter((skill) => skill.included && ["business", "management", "communication", "leadership", "interpersonal", "industry", "unknown"].includes(skill.category)).map((skill) => text(skill.name)).filter(Boolean),
    technicalSkills: content.skills.filter((skill) => skill.included && ["technical", "software", "tool", "platform", "programming_language", "framework", "laboratory"].includes(skill.category)).map((skill) => text(skill.name)).filter(Boolean),
    professionalSkills: content.skills.filter((skill) => skill.included && ["communication", "leadership", "interpersonal", "management"].includes(skill.category)).map((skill) => text(skill.name)).filter(Boolean),
    professionalExperience: content.employment.filter((item) => item.included).map((item) => ({
      role: text(item.role),
      company: text(item.employer),
      location: text(item.location),
      startDate: "",
      endDate: text(item.dateRange),
      current: /present|current|actuel/i.test(text(item.dateRange)),
      achievements: texts(item.bullets)
    })),
    projects: content.projects.filter((item) => item.included).map((item) => ({
      projectName: text(item.name),
      role: text(item.role),
      tools: [],
      description: text(item.description),
      impact: text(item.impact)
    })),
    education: content.education.filter((item) => item.included).map((item) => ({
      qualification: text(item.qualification),
      institution: text(item.institution),
      fieldOfStudy: text(item.fieldOfStudy),
      year: text(item.date),
      status: ""
    })),
    certifications: content.certifications.filter((item) => item.included).map((item) => ({
      name: text(item.name),
      provider: text(item.issuer),
      year: text(item.date),
      credentialUrl: ""
    })),
    achievements: content.additionalSections.filter((section) => section.included && section.type === "awards").flatMap((section) => texts(section.fields)),
    languages: content.languages.filter((item) => item.included).map((item) => ({ language: text(item.language), level: text(item.proficiency) })),
    references: {
      availableUponRequest: true,
      items: content.additionalSections.filter((section) => section.included && section.type === "references").flatMap((section) => texts(section.fields))
    },
    optionalSections: {
      volunteerExperience: content.additionalSections.filter((section) => section.included && section.type === "volunteering").flatMap((section) => texts(section.fields)),
      awards: content.additionalSections.filter((section) => section.included && section.type === "awards").flatMap((section) => texts(section.fields)),
      publications: [],
      conferences: [],
      professionalMemberships: content.additionalSections.filter((section) => section.included && section.type === "memberships").flatMap((section) => texts(section.fields)),
      interests: [],
      portfolioLinks: [text(content.header.portfolio), text(content.header.github), text(content.header.website)].filter(Boolean),
      qrCodePlaceholder: ""
    }
  };
}
