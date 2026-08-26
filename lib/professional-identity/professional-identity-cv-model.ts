import { normalizeCvModelForExport, serializeCvModel, type CvModel } from "@/components/professional-identity/document-downloads";
import { routeBuilders, appRoutes } from "@/lib/navigation/routes";
import type { ProfessionalIdentitySectionId } from "@/lib/canonical-profile/canonical-professional-identity.model";
import type { GeneratedProfessionalDocument } from "@/lib/professional-identity/professional-identity-types";
import { selectCanonicalProfessionalIdentityExperiences } from "@/lib/professional-identity/professional-identity-experience";
import {
  normalizeProfessionalIdentityCompletionValues,
  professionalIdentityRequiredChecksFromValues,
  type ProfessionalIdentityCompletionSectionKey,
  type ProfessionalIdentityCompletionValues
} from "@/lib/professional-identity/professional-identity-completion";

export type ProfessionalIdentityCvMissingSection = {
  section: ProfessionalIdentityCompletionSectionKey;
  label: string;
  missingFields: string[];
  href: string;
};

export type ProfessionalIdentityCvSyncStatus = {
  source: "professional_identity";
  status: "up_to_date" | "needs_information";
  lastUpdated: string | null;
  missingSections: ProfessionalIdentityCvMissingSection[];
};

const cvSectionToProfessionalIdentitySection: Record<string, ProfessionalIdentitySectionId> = {
  "Professional Header": "personal_information",
  "Professional Summary": "professional_summary",
  "Core Competencies / Skills": "skills",
  "Technical Skills": "skills",
  "Professional Skills": "skills",
  "Professional Experience": "experience",
  Projects: "projects",
  Education: "education",
  Certifications: "certificates",
  Achievements: "achievements",
  Languages: "languages",
  References: "references",
  "Volunteer Experience": "experience",
  Awards: "achievements",
  Publications: "achievements",
  Conferences: "achievements",
  "Professional Memberships": "certificates",
  Interests: "profile",
  "Portfolio Links": "portfolio",
  GitHub: "social_profiles",
  Website: "portfolio"
};

function cleanList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function splitLanguage(value: string) {
  const [language = "", level = ""] = value.split(/\s+\|\s+|\s+-\s+|:/).map((part) => part.trim());
  return { language, level };
}

function splitDateRange(startDate: string, endDate: string) {
  if (startDate || endDate) return { startDate, endDate };
  return { startDate: "", endDate: "" };
}

function sectionHref(section: ProfessionalIdentitySectionId) {
  return routeBuilders.professionalIdentitySection(section, appRoutes.professionalIdentityCv);
}

export function professionalIdentitySectionForCvSection(sectionTitle: string): ProfessionalIdentitySectionId {
  return cvSectionToProfessionalIdentitySection[sectionTitle] ?? "profile";
}

export function professionalIdentityHrefForCvSection(sectionTitle: string) {
  return routeBuilders.professionalIdentitySection(professionalIdentitySectionForCvSection(sectionTitle), appRoutes.professionalIdentityCv);
}

export function cvModelFromProfessionalIdentity(values: ProfessionalIdentityCompletionValues): CvModel {
  const identity = normalizeProfessionalIdentityCompletionValues(values);
  const profileLinks = [identity.portfolio_url, identity.website_url, identity.behance_url, identity.github_url].filter(Boolean) as string[];
  const experienceEntries = selectCanonicalProfessionalIdentityExperiences(identity.experience);
  return normalizeCvModelForExport({
    fullName: identity.full_name ?? "",
    targetRole: identity.career_goal ?? "",
    phone: identity.phone ?? "",
    email: identity.email ?? "",
    city: identity.city ?? "",
    country: identity.country ?? "",
    linkedIn: identity.linkedin_url ?? "",
    portfolio: identity.portfolio_url ?? "",
    github: identity.github_url ?? "",
    website: identity.website_url ?? "",
    professionalSummary: identity.professional_summary ?? "",
    coreSkills: cleanList(identity.skills),
    technicalSkills: [],
    professionalSkills: [],
    professionalExperience: experienceEntries.map((item) => ({
      role: item.role,
      company: item.company,
      location: item.location,
      ...splitDateRange(item.startDate, item.endDate),
      current: false,
      achievements: [item.description, ...item.achievements].filter(Boolean)
    })),
    projects: cleanList(identity.projects).map((item) => ({
      projectName: item,
      role: "",
      tools: [],
      description: "",
      impact: ""
    })),
    education: cleanList(identity.education).map((item) => ({
      qualification: item,
      institution: "",
      fieldOfStudy: identity.field_of_study ?? "",
      year: "",
      status: ""
    })),
    certifications: [...cleanList(identity.certificates), ...cleanList(identity.licences)].map((item) => ({
      name: item,
      provider: "",
      year: "",
      credentialUrl: ""
    })),
    achievements: cleanList(identity.achievements),
    languages: cleanList(identity.languages).map(splitLanguage),
    references: {
      availableUponRequest: cleanList(identity.references).some((item) => /available/i.test(item)),
      items: cleanList(identity.references).filter((item) => !/available/i.test(item))
    },
    optionalSections: {
      volunteerExperience: [],
      awards: [],
      publications: [],
      conferences: [],
      professionalMemberships: [],
      interests: [],
      portfolioLinks: profileLinks,
      qrCodePlaceholder: ""
    }
  });
}

export function professionalIdentityHasCvSeedData(values: ProfessionalIdentityCompletionValues) {
  const identity = normalizeProfessionalIdentityCompletionValues(values);
  return Boolean(
    identity.full_name ||
      identity.email ||
      identity.phone ||
      identity.career_goal ||
      identity.professional_summary ||
      cleanList(identity.education).length ||
      selectCanonicalProfessionalIdentityExperiences(identity.experience).length ||
      cleanList(identity.skills).length ||
      cleanList(identity.projects).length
  );
}

export function professionalIdentityCvSyncStatus(
  values: ProfessionalIdentityCompletionValues,
  lastUpdated: string | null
): ProfessionalIdentityCvSyncStatus {
  const missingSections = professionalIdentityRequiredChecksFromValues(values)
    .filter((check) => !check.complete)
    .map((check) => ({
      section: check.section,
      label: check.label,
      missingFields: check.missingFields,
      href: sectionHref(check.section as ProfessionalIdentitySectionId)
    }));
  return {
    source: "professional_identity",
    status: professionalIdentityHasCvSeedData(values) ? "up_to_date" : "needs_information",
    lastUpdated,
    missingSections
  };
}

export function professionalIdentityCvDocument(
  values: ProfessionalIdentityCompletionValues,
  options: { templateName: string; lastUpdated: string | null }
): GeneratedProfessionalDocument | null {
  if (!professionalIdentityHasCvSeedData(values)) return null;
  const cvModel = cvModelFromProfessionalIdentity(values);
  const now = options.lastUpdated ?? new Date().toISOString();
  const title = `Professional CV${cvModel.fullName ? ` - ${cvModel.fullName}` : ""}`;
  const content = serializeCvModel(cvModel);
  return {
    tool: "cv",
    title,
    content,
    template_name: options.templateName,
    updated_at: now,
    contentJson: {
      source: "professional_identity",
      cvModel,
      cvVersion: {
        designSystem: options.templateName,
        versionName: title,
        createdAt: now,
        updatedAt: now,
        lastDownloadedAt: null,
        contentSourceId: null
      }
    }
  };
}
