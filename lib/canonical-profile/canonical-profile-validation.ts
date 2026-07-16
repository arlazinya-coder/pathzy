import type { CanonicalDate, CanonicalEducation, CanonicalEmployment, CanonicalProfileIssue } from "./canonical-profile.types";
import { valueText } from "./canonical-profile-utils";

type ValidationIssue = CanonicalProfileIssue;

function dateScore(date?: CanonicalDate) {
  if (!date) return 0;
  if (date.current) return Number.MAX_SAFE_INTEGER;
  return (date.year ?? 0) * 10000 + (date.month ?? 0) * 100 + (date.day ?? 0);
}

function issue(fieldPath: string, messageKey: string, severity: ValidationIssue["severity"] = "warning"): ValidationIssue {
  return { id: `${fieldPath}:${messageKey}`, fieldPath, messageKey, severity, sourceReferences: [] };
}

export function validateCanonicalEmployment(employment: CanonicalEmployment): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!valueText(employment.canonicalTitle)) issues.push(issue("employment.canonicalTitle", "employment_title_required", "blocking"));
  if (!valueText(employment.employer)) issues.push(issue("employment.employer", "employment_employer_required", "blocking"));
  const start = employment.startDate?.value;
  const end = employment.endDate?.value;
  if (start && end && !end.current && dateScore(end) < dateScore(start)) issues.push(issue("employment.dateRange", "employment_end_before_start"));
  if (employment.isCurrent.value && end && !end.current) issues.push(issue("employment.isCurrent", "current_employment_has_end_date"));
  return issues;
}

export function validateCanonicalEducation(education: CanonicalEducation): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!valueText(education.qualification)) issues.push(issue("education.qualification", "education_qualification_required", "blocking"));
  if (!valueText(education.institution)) issues.push(issue("education.institution", "education_institution_required"));
  const start = education.startDate?.value;
  const end = education.endDate?.value ?? education.graduationDate?.value;
  if (start && end && dateScore(end) < dateScore(start)) issues.push(issue("education.dateRange", "education_end_before_start"));
  if (education.status.value === "in_progress" && education.graduationDate?.confirmedAt) issues.push(issue("education.status", "in_progress_with_confirmed_graduation"));
  return issues;
}

export function validateCanonicalContact(input: { email?: string; url?: string; visibility?: string }): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) issues.push(issue("contact.email", "contact_email_invalid"));
  if (input.url && !/^https?:\/\/[^\s]+\.[^\s]+/i.test(input.url)) issues.push(issue("contact.url", "contact_url_invalid"));
  if (input.visibility && !["private", "profile", "exportable", "public"].includes(input.visibility)) issues.push(issue("contact.visibility", "contact_visibility_invalid"));
  return issues;
}
