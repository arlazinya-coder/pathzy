import type { ProfessionalDocumentTemplateDefinition } from "./professional-document.types";
import { CV_TEMPLATE_VERSION } from "./cv-configuration";

export const professionalDocumentTemplates: ProfessionalDocumentTemplateDefinition[] = [
  {
    id: "pathzy-signature",
    name: "PATHZY Signature",
    version: CV_TEMPLATE_VERSION,
    category: "professional",
    supportedLanguages: ["en", "fr"],
    layout: "two_column",
    supportedSections: ["header", "professional_summary", "core_skills", "employment", "education", "certifications", "projects", "languages", "awards", "memberships", "volunteering", "references"],
    renderer: "shared-a4-cv-renderer",
    printStyles: "balanced-premium-hierarchy"
  },
  {
    id: "executive",
    name: "Executive",
    version: CV_TEMPLATE_VERSION,
    category: "executive",
    supportedLanguages: ["en", "fr"],
    layout: "single_column",
    supportedSections: ["header", "professional_summary", "employment", "core_skills", "education", "certifications", "projects", "languages", "awards", "memberships"],
    renderer: "shared-a4-cv-renderer",
    printStyles: "leadership-achievement-emphasis"
  },
  {
    id: "modern-professional",
    name: "Modern Professional",
    version: CV_TEMPLATE_VERSION,
    category: "modern",
    supportedLanguages: ["en", "fr"],
    layout: "sidebar",
    supportedSections: ["header", "professional_summary", "core_skills", "employment", "education", "certifications", "projects", "languages"],
    renderer: "shared-a4-cv-renderer",
    printStyles: "sidebar-contact-skills"
  },
  {
    id: "ats-conscious",
    name: "ATS-conscious",
    version: CV_TEMPLATE_VERSION,
    category: "minimal",
    supportedLanguages: ["en", "fr"],
    layout: "single_column",
    supportedSections: ["header", "professional_summary", "core_skills", "employment", "education", "certifications", "projects", "languages"],
    renderer: "shared-a4-cv-renderer",
    printStyles: "selectable-text-single-column"
  },
  {
    id: "early-career",
    name: "Early Career",
    version: CV_TEMPLATE_VERSION,
    category: "early_career",
    supportedLanguages: ["en", "fr"],
    layout: "two_column",
    supportedSections: ["header", "professional_summary", "education", "projects", "core_skills", "certifications", "languages", "volunteering"],
    renderer: "shared-a4-cv-renderer",
    printStyles: "education-projects-first"
  }
];

export function resolveProfessionalDocumentTemplate(templateId?: string) {
  return professionalDocumentTemplates.find((template) => template.id === templateId || template.name === templateId) ?? professionalDocumentTemplates[0];
}

