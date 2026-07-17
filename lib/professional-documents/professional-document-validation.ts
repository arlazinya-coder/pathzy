import type { CvContent, CvViewConfiguration, ProfessionalDocument, ProfessionalDocumentWarning } from "./professional-document.types";
import { fieldText } from "./presentation-fields";

function validationWarning(id: string, section: string, message: string, suggestedAction: string, blocksExport = false): ProfessionalDocumentWarning {
  return {
    id,
    category: blocksExport ? "profile_conflict" : "content_quality",
    severity: blocksExport ? "blocking" : "warning",
    section,
    message,
    suggestedAction,
    blocksExport
  };
}

export function validateCvConfiguration(configuration: CvViewConfiguration): ProfessionalDocumentWarning[] {
  const warnings: ProfessionalDocumentWarning[] = [];
  const sectionTypes = new Set<string>();
  for (const section of configuration.sections) {
    if (sectionTypes.has(section.type)) {
      warnings.push(validationWarning(`duplicate-section-${section.type}`, "Configuration", `The ${section.type} section appears more than once.`, "Keep one section entry and reorder it instead of duplicating it."));
    }
    sectionTypes.add(section.type);
  }
  if (!configuration.sections.some((section) => section.type === "header" && section.visible)) {
    warnings.push(validationWarning("missing-visible-header", "Configuration", "This CV needs a visible header.", "Show the header section before export.", true));
  }
  return warnings;
}

export function validateGroundedCvContent(content: CvContent): ProfessionalDocumentWarning[] {
  const warnings: ProfessionalDocumentWarning[] = [];
  const generatedFields = [
    content.professionalSummary,
    ...content.employment.flatMap((item) => item.bullets),
    ...content.additionalSections.flatMap((item) => item.fields)
  ].filter(Boolean);

  for (const field of generatedFields) {
    if (!field) continue;
    if (field.unsupportedClaimDetected) {
      warnings.push(validationWarning(`unsupported-claim-${field.canonicalEntityId ?? field.canonicalFieldPath ?? fieldText(field).slice(0, 24)}`, "Grounding", "A generated statement could not be grounded in confirmed Professional Identity facts.", "Edit, reject, or replace this wording before export.", true));
    }
    if ((field.sourceType === "generated" || field.sourceType === "targeted_generated") && !field.sourceFactIds.length) {
      warnings.push(validationWarning(`ungrounded-generated-${field.canonicalFieldPath ?? fieldText(field).slice(0, 24)}`, "Grounding", "Generated wording needs source facts before it can be trusted.", "Regenerate from confirmed profile facts or write your own wording.", true));
    }
  }

  return warnings;
}

export function validateProfessionalDocument(document: ProfessionalDocument): ProfessionalDocumentWarning[] {
  const warnings: ProfessionalDocumentWarning[] = [];
  if (document.type === "cv") {
    warnings.push(...validateCvConfiguration(document.configuration as CvViewConfiguration));
    warnings.push(...validateGroundedCvContent(document.content as CvContent));
  }
  if (document.freshness.status !== "current") {
    warnings.push(validationWarning("stale-document-profile-version", "Profile freshness", "Your Professional Identity changed after this document was created.", "Review profile updates, keep this version, or create an updated copy."));
  }
  return warnings;
}
