import type { CvContent, CvViewConfiguration, ProfessionalDocumentWarning } from "./professional-document.types";
import { fieldText } from "./presentation-fields";

function issue(input: Omit<ProfessionalDocumentWarning, "id">): ProfessionalDocumentWarning {
  return { id: `${input.category}:${input.section}:${input.message}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"), ...input };
}

function repeated(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values.map((item) => item.toLowerCase().replace(/[^a-z0-9]+/g, ""))) {
    if (!value) continue;
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return duplicates.size > 0;
}

export function reviewCvQuality(content: CvContent, configuration: CvViewConfiguration, freshnessStatus: "current" | "partially_stale" | "stale" = "current"): ProfessionalDocumentWarning[] {
  const warnings: ProfessionalDocumentWarning[] = [];
  const contact = [content.header.email, content.header.phone, content.header.linkedIn, content.header.portfolio].some((field) => fieldText(field));
  if (!fieldText(content.header.fullName)) warnings.push(issue({ category: "missing_information", severity: "blocking", section: "Header", message: "Your CV needs your name.", suggestedAction: "Add your full name in Professional Identity.", blocksExport: true }));
  if (!fieldText(content.header.targetRole)) warnings.push(issue({ category: "target_relevance", severity: "warning", section: "Header", message: "Your CV needs a clear target role.", suggestedAction: "Add or confirm a professional headline or target role.", blocksExport: false }));
  if (!contact) warnings.push(issue({ category: "missing_information", severity: "blocking", section: "Header", message: "Employers need at least one contact method.", suggestedAction: "Add email, phone, LinkedIn, or portfolio.", blocksExport: true }));
  if (!fieldText(content.professionalSummary)) warnings.push(issue({ category: "content_quality", severity: "warning", section: "Professional Summary", message: "A short professional summary would help recruiters understand your direction.", suggestedAction: "Generate or write a grounded 3-5 line summary.", blocksExport: false }));
  if (!content.employment.length && configuration.purpose !== "early_career") warnings.push(issue({ category: "missing_information", severity: "warning", section: "Employment", message: "This CV has no selected employment history.", suggestedAction: "Add experience, volunteering, projects, or switch to an early-career CV.", blocksExport: false }));
  if (!content.education.length && ["early_career", "academic"].includes(configuration.purpose)) warnings.push(issue({ category: "missing_information", severity: "warning", section: "Education", message: "This CV purpose usually needs education details.", suggestedAction: "Add education or choose a different CV purpose.", blocksExport: false }));
  if (content.skills.length < 4) warnings.push(issue({ category: "target_relevance", severity: "info", section: "Skills", message: "Add more confirmed skills for a stronger scan.", suggestedAction: "Confirm relevant skills in your Professional Identity.", blocksExport: false }));
  const bullets = content.employment.flatMap((employment) => employment.bullets.map(fieldText)).filter(Boolean);
  if (repeated(bullets)) warnings.push(issue({ category: "content_quality", severity: "warning", section: "Experience", message: "Some experience bullets repeat similar wording.", suggestedAction: "Shorten repeated responsibilities or keep the strongest proof.", blocksExport: false }));
  if (bullets.some((bullet) => bullet.length > 240)) warnings.push(issue({ category: "readability", severity: "warning", section: "Experience", message: "Some bullets are too long to scan quickly.", suggestedAction: "Split or shorten long bullets.", blocksExport: false }));
  if (configuration.pagePreference === "one_page" && content.employment.length > 4) warnings.push(issue({ category: "layout", severity: "warning", section: "Page length", message: "This may be too much content for a one-page CV.", suggestedAction: "Hide older roles or switch to automatic page length.", blocksExport: false }));
  if (freshnessStatus !== "current") warnings.push(issue({ category: "stale_information", severity: "warning", section: "Profile version", message: "Your Professional Identity has changed since this CV was created.", suggestedAction: "Review updates, keep this version, or create an updated copy.", blocksExport: false }));
  if (content.skills.some((skill) => skill.name.unsupportedClaimDetected) || content.employment.some((employment) => employment.bullets.some((bullet) => bullet.unsupportedClaimDetected))) {
    warnings.push(issue({ category: "profile_conflict", severity: "blocking", section: "Grounding", message: "One or more statements could not be grounded in your Professional Identity.", suggestedAction: "Edit or reject unsupported wording before export.", blocksExport: true }));
  }
  return warnings;
}

export function summarizeCvQuality(warnings: ProfessionalDocumentWarning[]) {
  const blocking = warnings.filter((warning) => warning.severity === "blocking").length;
  const important = warnings.filter((warning) => warning.severity === "warning").length;
  const optional = warnings.filter((warning) => warning.severity === "info").length;
  return {
    label: blocking ? "Needs important fixes" : important ? "Strong foundation" : "Recruiter ready",
    blocking,
    important,
    optional
  };
}

