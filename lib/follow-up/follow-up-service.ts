import { normalizeApplicationStatus } from "@/lib/applications/application-tracker-service";
import type { ApplicationContact } from "@/lib/applications/smart-application.types";
import type { ApplicationFollowUp, FollowUpApplicationContext, FollowUpRecipient, FollowUpStatus, FollowUpType } from "./follow-up.types";

export const FOLLOW_UP_TYPES = [
  "application_follow_up",
  "recruiter_follow_up",
  "interview_thank_you",
  "interview_status_follow_up",
  "referral_thank_you",
  "offer_response",
  "custom"
] as const satisfies readonly FollowUpType[];

export const FOLLOW_UP_STATUSES = ["suggested", "scheduled", "drafted", "approved", "sent", "dismissed", "cancelled"] as const satisfies readonly FollowUpStatus[];

const terminalApplicationStatuses = new Set(["offer_accepted", "offer_declined", "rejected", "withdrawn", "closed", "archived"]);
const blockedAfterRejection = new Set<FollowUpType>(["application_follow_up", "recruiter_follow_up", "interview_status_follow_up", "referral_thank_you"]);

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function isWeekend(date: Date) {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function nextBusinessDay(date: Date) {
  const next = startOfDay(date);
  while (isWeekend(next)) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

export function addBusinessDays(value: Date, days: number) {
  const date = startOfDay(value);
  let remaining = days;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (!isWeekend(date)) remaining -= 1;
  }
  return nextBusinessDay(date);
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function contactLabel(contact: ApplicationContact | undefined, fallback: string): FollowUpRecipient {
  if (!contact?.name?.trim()) return { label: fallback, known: false };
  return {
    contactId: contact.id,
    contactType: contact.type,
    name: contact.name.trim(),
    email: contact.email?.trim() || undefined,
    label: contact.name.trim(),
    known: true
  };
}

function selectContact(application: FollowUpApplicationContext, type: FollowUpType) {
  const contacts = Array.isArray(application.contacts_json) ? application.contacts_json : [];
  const byType = (contactType: ApplicationContact["type"]) => contacts.find((contact) => contact.type === contactType && contact.name?.trim());
  if (type === "referral_thank_you") return contactLabel(byType("referral_contact"), "Referral contact");
  if (type === "interview_thank_you" || type === "interview_status_follow_up") return contactLabel(byType("interviewer") ?? byType("hiring_manager") ?? byType("recruiter"), "Interview team");
  if (type === "recruiter_follow_up") return contactLabel(byType("recruiter") ?? byType("hiring_manager"), "Recruiter");
  if (type === "offer_response") return contactLabel(byType("hiring_manager") ?? byType("recruiter"), "Hiring team");
  return contactLabel(byType("recruiter") ?? byType("hiring_manager") ?? contacts[0], "Hiring team");
}

export function canSuggestFollowUp(application: FollowUpApplicationContext, type: FollowUpType) {
  const status = normalizeApplicationStatus(application.status);
  if (status === "withdrawn" || status === "closed" || status === "archived") return { allowed: false, reason: "Follow-ups are not suggested after an application is withdrawn, closed, or archived." };
  if (status === "rejected" && blockedAfterRejection.has(type)) return { allowed: false, reason: "PATHZY will not suggest pressure follow-ups after a rejection." };
  if ((status === "offer_accepted" || status === "offer_declined") && type !== "custom") return { allowed: false, reason: "This offer already has a final decision. Add a custom note only if you need one." };
  return { allowed: true, reason: "Follow-up is appropriate for the current application state." };
}

export function recommendFollowUpDate(application: FollowUpApplicationContext, type: FollowUpType, now = new Date()) {
  const status = normalizeApplicationStatus(application.status);
  const appliedDate = parseDate(application.application_date);
  const interviewDate = parseDate(application.interview_date);
  const expectedResponse = parseDate(application.expected_response_date);
  const closingDate = parseDate(application.closing_date);
  const plannedFollowUp = parseDate(application.follow_up_date);

  if (status === "withdrawn" || status === "closed" || status === "archived") return { date: null, reason: "No follow-up is recommended because this application is no longer active." };
  if (status === "rejected" && blockedAfterRejection.has(type)) return { date: null, reason: "No follow-up is recommended after rejection unless the user creates a custom record." };

  if (type === "interview_thank_you" && interviewDate) {
    return { date: toDateOnly(nextBusinessDay(interviewDate)), reason: "Interview thank-you messages are normally prepared within 24 hours, adjusted away from weekends." };
  }

  if (type === "interview_status_follow_up") {
    if (expectedResponse) return { date: toDateOnly(addBusinessDays(expectedResponse, 1)), reason: "The employer response timeline has passed, so one business day is added before following up." };
    if (interviewDate) return { date: toDateOnly(addBusinessDays(interviewDate, 5)), reason: "No response timeline was saved, so PATHZY uses a practical five-business-day interview follow-up window." };
  }

  if (type === "offer_response") {
    return { date: toDateOnly(nextBusinessDay(now)), reason: "Offer responses should be handled promptly, but the user remains in control." };
  }

  if (plannedFollowUp) return { date: toDateOnly(nextBusinessDay(plannedFollowUp)), reason: "The saved follow-up date on this application is used." };
  if (expectedResponse) return { date: toDateOnly(addBusinessDays(expectedResponse, 1)), reason: "The known employer response date is respected before suggesting a follow-up." };
  if (appliedDate) {
    const suggested = addBusinessDays(appliedDate, 6);
    if (closingDate && suggested < closingDate) {
      return { date: toDateOnly(nextBusinessDay(closingDate)), reason: "The closing date is respected before sending an application follow-up." };
    }
    return { date: toDateOnly(suggested), reason: "Application follow-ups are normally suggested after five to seven business days." };
  }

  return { date: toDateOnly(addBusinessDays(now, 6)), reason: "No applied date is saved, so PATHZY suggests a conservative five-to-seven-business-day reminder." };
}

function greeting(recipient: FollowUpRecipient) {
  return recipient.name ? `Hello ${recipient.name},` : "Hello,";
}

function signoff() {
  return "Kind regards";
}

export function draftFollowUpMessage(application: FollowUpApplicationContext, type: FollowUpType, recipient = selectContact(application, type)) {
  const role = cleanText(application.role) || "the role";
  const company = cleanText(application.company_name) || "your organization";
  const applied = application.application_date ? ` I applied on ${application.application_date}.` : "";
  const interviewed = application.interview_date ? ` Thank you for the conversation on ${application.interview_date.slice(0, 10)}.` : "";
  const subjectBase = `${role} application`;

  if (type === "interview_thank_you") {
    return {
      recipient,
      subject: `Thank you - ${role}`,
      body: `${greeting(recipient)}\n\nThank you for taking the time to discuss the ${role} opportunity at ${company}.${interviewed} I appreciated learning more about the role, the team, and the priorities ahead.\n\nI remain interested in the opportunity and would be glad to provide any additional information that would help with your review.\n\n${signoff()}`
    };
  }

  if (type === "interview_status_follow_up") {
    return {
      recipient,
      subject: `Follow-up on ${role} interview`,
      body: `${greeting(recipient)}\n\nI hope you are well. I wanted to follow up on the ${role} interview process at ${company}.${interviewed} I remain interested in the opportunity and would appreciate any update you are able to share when convenient.\n\nThank you again for your time.\n\n${signoff()}`
    };
  }

  if (type === "referral_thank_you") {
    return {
      recipient,
      subject: `Thank you for your support`,
      body: `${greeting(recipient)}\n\nThank you for supporting my interest in the ${role} opportunity at ${company}. I appreciate your guidance and will keep you updated as the process moves forward.\n\n${signoff()}`
    };
  }

  if (type === "offer_response") {
    return {
      recipient,
      subject: `Response to ${role} offer`,
      body: `${greeting(recipient)}\n\nThank you for the offer for the ${role} position at ${company}. I appreciate the confidence shown in me and would like to review the details carefully before confirming my response.\n\nPlease let me know if there is a preferred deadline for my final decision.\n\n${signoff()}`
    };
  }

  return {
    recipient,
    subject: `Follow-up on ${subjectBase}`,
    body: `${greeting(recipient)}\n\nI hope you are well. I am writing to follow up on my application for the ${role} position at ${company}.${applied} I remain interested in the opportunity and would be grateful for any update you are able to share.\n\nThank you for your time and consideration.\n\n${signoff()}`
  };
}

export function duplicateKeyForFollowUp(applicationId: string, type: FollowUpType) {
  return `${applicationId}:${type}`;
}

export function prepareFollowUpDraft(application: FollowUpApplicationContext, type: FollowUpType, timezone = "UTC", now = new Date()) {
  const permission = canSuggestFollowUp(application, type);
  const timing = recommendFollowUpDate(application, type, now);
  const draft = draftFollowUpMessage(application, type);
  const status: FollowUpStatus = permission.allowed ? "drafted" : "cancelled";

  return {
    follow_up_type: type,
    status,
    recommended_date: permission.allowed ? timing.date : null,
    scheduled_date: null,
    sent_at: null,
    recipient_json: draft.recipient,
    subject: draft.subject,
    body: draft.body,
    approval_json: { approved: false },
    timezone,
    timing_reason: permission.allowed ? timing.reason : permission.reason,
    duplicate_key: duplicateKeyForFollowUp(application.id, type)
  };
}

export function canMarkFollowUpSent(followUp: Pick<ApplicationFollowUp, "status" | "recipient_json" | "approval_json">) {
  if (!followUp.recipient_json?.known) return { allowed: false, reason: "Add a known recipient before recording this follow-up as sent." };
  if (!followUp.approval_json?.approved) return { allowed: false, reason: "Approve the follow-up before recording it as sent." };
  if (followUp.status === "sent") return { allowed: false, reason: "This follow-up is already marked as sent." };
  if (followUp.status === "dismissed" || followUp.status === "cancelled") return { allowed: false, reason: "This follow-up is not active." };
  return { allowed: true, reason: "The user approved this follow-up." };
}
