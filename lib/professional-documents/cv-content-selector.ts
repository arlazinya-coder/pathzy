import type { CanonicalProfessionalIdentity } from "@/lib/canonical-profile";
import { valueText } from "@/lib/canonical-profile";
import type { CvContentSelectionItem, CvContentSelectionResult, CvSectionType, CvViewConfiguration, ProfessionalDocumentWarning } from "./professional-document.types";

function relevanceScore(text: string, targetRole?: string, targetIndustry?: string) {
  const haystack = text.toLowerCase();
  const terms = [targetRole, targetIndustry].filter(Boolean).flatMap((value) => String(value).toLowerCase().split(/[^a-z0-9]+/)).filter((value) => value.length > 2);
  if (!terms.length) return 0;
  return terms.reduce((sum, term) => sum + (haystack.includes(term) ? 8 : 0), 0);
}

function selectionItem(entityType: CvSectionType, entityId: string, included: boolean, reason: string, priority: number): CvContentSelectionItem {
  return { entityType, entityId, included, reason, priority };
}

export function selectCvContent(profile: CanonicalProfessionalIdentity, configuration: CvViewConfiguration): CvContentSelectionResult {
  const selected: CvContentSelectionItem[] = [];
  const excluded: CvContentSelectionItem[] = [];
  const warnings: ProfessionalDocumentWarning[] = [];
  const onePageLimit = configuration.pagePreference === "one_page";

  for (const employment of profile.employment) {
    const text = [valueText(employment.canonicalTitle), valueText(employment.employer), ...employment.achievements.map((item) => valueText(item.statement)), ...employment.responsibilities.map((item) => valueText(item.statement))].join(" ");
    const explicitSelection = configuration.selectedEntityIds.employment.includes(employment.id);
    const relevant = relevanceScore(text, configuration.targetRole, configuration.targetIndustry);
    const confirmed = employment.status === "confirmed";
    const priority = (confirmed ? 30 : 10) + relevant + employment.confidence * 20 + (employment.isCurrent.value ? 12 : 0);
    const include = explicitSelection || (employment.status !== "archived" && (!onePageLimit || selected.filter((item) => item.entityType === "employment").length < 3));
    (include ? selected : excluded).push(selectionItem("employment", employment.id, include, explicitSelection ? "Selected by user" : relevant ? "Relevant to the target role" : confirmed ? "Confirmed career record" : "Needs review before high-priority use", priority));
  }

  for (const education of profile.education) {
    const priority = (education.reviewStatus === "confirmed" ? 25 : 12) + education.confidence * 20 + relevanceScore([valueText(education.qualification), valueText(education.fieldOfStudy), valueText(education.institution)].join(" "), configuration.targetRole, configuration.targetIndustry);
    const include = education.reviewStatus !== "archived" && (!onePageLimit || selected.filter((item) => item.entityType === "education").length < 2);
    (include ? selected : excluded).push(selectionItem("education", education.id, include, include ? "Education supports this CV purpose" : "Lower priority for the selected page target", priority));
  }

  for (const skill of profile.skills) {
    if (skill.explicitness === "unconfirmed_implied") {
      excluded.push(selectionItem("core_skills", skill.id, false, "Unconfirmed implied skills are excluded by default", 0));
      continue;
    }
    const priority = (skill.status === "confirmed" ? 20 : 8) + skill.confidence * 20 + relevanceScore(valueText(skill.canonicalName), configuration.targetRole, configuration.targetIndustry);
    const include = skill.status !== "archived" && (!onePageLimit || selected.filter((item) => item.entityType === "core_skills").length < 14);
    (include ? selected : excluded).push(selectionItem("core_skills", skill.id, include, include ? "Confirmed or user-entered skill" : "Excluded to keep the CV concise", priority));
  }

  for (const certification of profile.certifications) {
    const explicitSelection = configuration.selectedEntityIds.certifications.includes(certification.id);
    const priority = (certification.status === "confirmed" ? 18 : 8) + certification.confidence * 18 + relevanceScore([valueText(certification.canonicalName), valueText(certification.issuer)].join(" "), configuration.targetRole, configuration.targetIndustry);
    const include = explicitSelection || (certification.status !== "archived" && (!onePageLimit || selected.filter((item) => item.entityType === "certifications").length < 4));
    (include ? selected : excluded).push(selectionItem("certifications", certification.id, include, explicitSelection ? "Selected by user" : include ? "Credential evidence supports this CV" : "Excluded to keep the CV concise", priority));
  }

  for (const project of profile.projects) {
    const explicitSelection = configuration.selectedEntityIds.projects.includes(project.id);
    const priority = (project.status === "confirmed" ? 18 : 8) + project.confidence * 18 + relevanceScore([valueText(project.name), valueText(project.role), valueText(project.description), valueText(project.impact)].join(" "), configuration.targetRole, configuration.targetIndustry);
    const include = explicitSelection || (project.status !== "archived" && (!onePageLimit || selected.filter((item) => item.entityType === "projects").length < 3));
    (include ? selected : excluded).push(selectionItem("projects", project.id, include, explicitSelection ? "Selected by user" : include ? "Project proof supports this CV" : "Excluded to keep the CV concise", priority));
  }

  for (const language of profile.languages) {
    const explicitSelection = configuration.selectedEntityIds.languages.includes(language.id);
    const priority = (language.status === "confirmed" ? 14 : 6) + language.confidence * 12;
    const include = explicitSelection || language.status !== "archived";
    (include ? selected : excluded).push(selectionItem("languages", language.id, include, explicitSelection ? "Selected by user" : "Language record", priority));
  }

  if (!selected.some((item) => item.entityType === "employment")) {
    warnings.push({
      id: "cv-no-employment-selected",
      category: "missing_information",
      severity: "warning",
      section: "Employment",
      message: "No employment record is selected for this CV.",
      suggestedAction: "Add experience, projects, volunteering, or create an early-career CV.",
      blocksExport: false
    });
  }

  return {
    selected: selected.sort((a, b) => b.priority - a.priority),
    excluded: excluded.sort((a, b) => b.priority - a.priority),
    warnings
  };
}
