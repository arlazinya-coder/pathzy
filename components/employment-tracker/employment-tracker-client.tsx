"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, ProgressBar } from "@/components/ui";
import { buildCareerAnalytics, type AnalyticsPeriod, type CareerAnalyticsDocument, type CareerAnalyticsJobMatch } from "@/lib/analytics/career-analytics-service";
import {
  APPLICATION_TRACKER_STATUSES,
  APPLICATION_TRACKER_VIEWS,
  applicationMatchesTrackerView,
  countApplicationDocuments,
  getApplicationNextAction,
  labelApplicationStatus,
  normalizeApplicationStatus,
  summarizeApplicationTracker
} from "@/lib/applications/application-tracker-service";
import type { ApplicationContact, ApplicationTrackerView, SmartApplicationApprovals, SmartApplicationChecklistItem, SmartApplicationReadiness } from "@/lib/applications/smart-application.types";
import type { ApplicationFollowUp, FollowUpStatus, FollowUpType } from "@/lib/follow-up/follow-up.types";

type ApplicationStatus = (typeof APPLICATION_TRACKER_STATUSES)[number];

type EmploymentApplication = {
  id: string;
  company_name: string;
  role: string;
  opportunity_type: string;
  source?: string | null;
  status: ApplicationStatus | string;
  application_readiness?: SmartApplicationReadiness;
  application_date: string | null;
  follow_up_date: string | null;
  closing_date?: string | null;
  planned_application_date?: string | null;
  assessment_deadline?: string | null;
  interview_date?: string | null;
  expected_response_date?: string | null;
  next_action_date?: string | null;
  next_action?: string | null;
  follow_up_state?: string | null;
  contacts_json?: ApplicationContact[] | null;
  match_summary_json?: Record<string, unknown> | null;
  notes: string;
  canonical_profile_id?: string | null;
  canonical_profile_version?: number | null;
  job_understanding_id?: string | null;
  job_understanding_version?: number | null;
  job_match_analysis_id?: string | null;
  targeted_cv_document_id?: string | null;
  cover_letter_document_id?: string | null;
  optional_message_ids_json?: string[] | null;
  supporting_document_ids_json?: string[] | null;
  checklist_json?: SmartApplicationChecklistItem[] | null;
  warnings_json?: string[] | null;
  approvals_json?: SmartApplicationApprovals | null;
  status_history_json?: Array<{ at: string; event: string; note: string }> | null;
  stale_state?: "current" | "stale" | null;
  updated_at: string;
};

type SupportingDocumentOption = {
  id: string;
  document_title: string;
  document_type: string;
  status?: string | null;
};

type TimelineEventRow = {
  id: string;
  application_id: string;
  event_type: string;
  from_status?: string | null;
  to_status?: string | null;
  note: string;
  event_at: string;
};

type FollowUpRow = ApplicationFollowUp;

const statuses = [...APPLICATION_TRACKER_STATUSES];
const followUpTypes: FollowUpType[] = ["application_follow_up", "recruiter_follow_up", "interview_thank_you", "interview_status_follow_up", "referral_thank_you", "offer_response", "custom"];

function statusLabel(status: string) {
  return labelApplicationStatus(status);
}

const followUpTypeLabels: Record<FollowUpType, string> = {
  application_follow_up: "Application follow-up",
  recruiter_follow_up: "Recruiter follow-up",
  interview_thank_you: "Interview thank-you",
  interview_status_follow_up: "Interview status follow-up",
  referral_thank_you: "Referral thank-you",
  offer_response: "Offer response",
  custom: "Custom"
};

function followUpStatusLabel(status: FollowUpStatus | string) {
  return String(status).split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

const viewLabels: Record<ApplicationTrackerView, string> = {
  all: "All",
  preparing: "Preparing",
  ready_to_apply: "Ready to Apply",
  applied: "Applied",
  interviews: "Interviews",
  offers: "Offers",
  follow_up_needed: "Follow-Up Needed",
  closed: "Closed"
};

function dateOnly(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

function safeContactsFromForm(form: FormData): ApplicationContact[] {
  const name = String(form.get("contact_name") ?? "").trim();
  if (!name) return [];
  return [{
    id: String(form.get("contact_id") ?? "") || crypto.randomUUID(),
    type: String(form.get("contact_type") ?? "recruiter") as ApplicationContact["type"],
    name,
    email: String(form.get("contact_email") ?? "").trim(),
    notes: String(form.get("contact_notes") ?? "").trim()
  }];
}

function applicationSearchText(application: EmploymentApplication) {
  return [
    application.role,
    application.company_name,
    application.notes,
    application.next_action,
    application.source,
    ...(application.contacts_json ?? []).map((contact) => `${contact.name} ${contact.email ?? ""} ${contact.notes ?? ""}`)
  ].join(" ").toLowerCase();
}

function smartRecordToApplicationPatch(record: any): Partial<EmploymentApplication> {
  return {
    status: record.status,
    application_readiness: record.readiness,
    supporting_document_ids_json: record.supportingDocumentIds,
    checklist_json: record.checklist,
    warnings_json: record.warnings,
    approvals_json: record.approvals,
    status_history_json: record.history,
    stale_state: record.staleState,
    updated_at: record.updatedAt
  };
}

function approvalState(application: EmploymentApplication): SmartApplicationApprovals {
  return {
    cv: false,
    coverLetter: false,
    applicationMessage: false,
    supportingDocuments: false,
    packageApproved: false,
    ...(application.approvals_json ?? {})
  };
}

function checklistItems(application: EmploymentApplication) {
  return application.checklist_json ?? [];
}

function isSmartApplication(application: EmploymentApplication) {
  return Boolean(application.job_match_analysis_id || application.targeted_cv_document_id || application.cover_letter_document_id);
}

export function EmploymentTrackerClient({
  initialApplications,
  supportingDocuments = [],
  timelineEvents = [],
  initialFollowUps = [],
  matchAnalyses = [],
  professionalDocuments = []
}: {
  initialApplications: EmploymentApplication[];
  supportingDocuments?: SupportingDocumentOption[];
  timelineEvents?: TimelineEventRow[];
  initialFollowUps?: FollowUpRow[];
  matchAnalyses?: CareerAnalyticsJobMatch[];
  professionalDocuments?: CareerAnalyticsDocument[];
}) {
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState(initialApplications);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [celebration, setCelebration] = useState("");
  const [activeView, setActiveView] = useState<ApplicationTrackerView>("all");
  const [search, setSearch] = useState("");
  const [followUps, setFollowUps] = useState(initialFollowUps);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>("90d");
  const [analyticsCustomStart, setAnalyticsCustomStart] = useState("");
  const [analyticsCustomEnd, setAnalyticsCustomEnd] = useState("");
  const summary = useMemo(() => summarizeApplicationTracker(applications), [applications]);
  const careerAnalytics = useMemo(() => buildCareerAnalytics({
    applications,
    timelineEvents,
    matchAnalyses,
    professionalDocuments,
    period: {
      type: analyticsPeriod,
      start: analyticsPeriod === "custom" ? analyticsCustomStart || undefined : undefined,
      end: analyticsPeriod === "custom" ? analyticsCustomEnd || undefined : undefined
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }), [analyticsCustomEnd, analyticsCustomStart, analyticsPeriod, applications, matchAnalyses, professionalDocuments, timelineEvents]);
  const visibleApplications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesView = applicationMatchesTrackerView(application, activeView);
      const matchesSearch = !query || applicationSearchText(application).includes(query);
      return matchesView && matchesSearch;
    });
  }, [activeView, applications, search]);
  const progress = Math.min(100, applications.length ? Math.round((applications.filter((item) => !["planning", "preparing"].includes(normalizeApplicationStatus(item.status))).length / applications.length) * 100) : 0);
  const timelineByApplication = useMemo(() => {
    const groups = new Map<string, TimelineEventRow[]>();
    for (const event of timelineEvents) {
      const current = groups.get(event.application_id) ?? [];
      current.push(event);
      groups.set(event.application_id, current);
    }
    return groups;
  }, [timelineEvents]);
  const followUpsByApplication = useMemo(() => {
    const groups = new Map<string, FollowUpRow[]>();
    for (const followUp of followUps) {
      const current = groups.get(followUp.application_id) ?? [];
      current.push(followUp);
      groups.set(followUp.application_id, current);
    }
    return groups;
  }, [followUps]);

  function updateApplicationAfterFollowUp(followUp: FollowUpRow) {
    setApplications((current) => current.map((application) => {
      if (application.id !== followUp.application_id) return application;
      const state = followUp.status === "sent" ? "sent" : followUp.status === "dismissed" ? "dismissed" : followUp.status === "cancelled" ? "cancelled" : "draft ready";
      return {
        ...application,
        follow_up_date: followUp.recommended_date,
        follow_up_state: state,
        next_action: followUp.status === "sent" ? "Wait for employer response" : followUp.status === "dismissed" || followUp.status === "cancelled" ? "Keep application updated" : "Review follow-up draft",
        next_action_date: followUp.recommended_date
      };
    }));
  }

  async function addApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusyId("new");
    setError("");

    try {
      const response = await fetch("/api/employment-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: form.get("company_name"),
          role: form.get("role"),
          opportunity_type: form.get("opportunity_type"),
          source: form.get("source"),
          status: form.get("status"),
          application_date: form.get("application_date") || null,
          follow_up_date: form.get("follow_up_date") || null,
          closing_date: form.get("closing_date") || null,
          planned_application_date: form.get("planned_application_date") || null,
          assessment_deadline: form.get("assessment_deadline") || null,
          interview_date: form.get("interview_date") || null,
          expected_response_date: form.get("expected_response_date") || null,
          next_action_date: form.get("next_action_date") || null,
          next_action: form.get("next_action"),
          follow_up_state: form.get("follow_up_state"),
          contacts_json: safeContactsFromForm(form),
          notes: form.get("notes")
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not add application.");
      setApplications((current) => [data.application, ...current]);
      if (normalizeApplicationStatus(data.application.status) === "applied") setCelebration("First application tracked. That counts.");
      event.currentTarget.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not add application.");
    } finally {
      setBusyId("");
    }
  }

  async function updateStatus(application: EmploymentApplication, status: ApplicationStatus) {
    setBusyId(application.id);
    setError("");

    try {
      const response = await fetch("/api/employment-tracker", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: application.id, status, follow_up_date: application.follow_up_date, notes: application.notes })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update application.");
      setApplications((current) => current.map((item) => (item.id === application.id ? data.application : item)));
      if (status === "interview_scheduled") setCelebration("Interview tracked. Time to prepare with PATHZY.");
      if (status === "offer_received") setCelebration("Offer tracked. Big milestone.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update application.");
    } finally {
      setBusyId("");
    }
  }

  async function updateSmartApplication(application: EmploymentApplication, patch: Partial<EmploymentApplication>) {
    setApplications((current) => current.map((item) => (item.id === application.id ? { ...item, ...patch } : item)));
  }

  async function updateApproval(application: EmploymentApplication, approval: keyof SmartApplicationApprovals, value: boolean) {
    setBusyId(application.id);
    setError("");
    try {
      const response = await fetch("/api/smart-applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id, approval, value })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update approval.");
      await updateSmartApplication(application, smartRecordToApplicationPatch(data.application));
      if (data.application.status === "ready_to_apply") setCelebration("Application package approved. You are ready to apply.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update approval.");
    } finally {
      setBusyId("");
    }
  }

  async function updateSupportingDocuments(application: EmploymentApplication, supportingDocumentIds: string[]) {
    setBusyId(application.id);
    setError("");
    try {
      const response = await fetch("/api/smart-applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id, supportingDocumentIds })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update supporting documents.");
      await updateSmartApplication(application, smartRecordToApplicationPatch(data.application));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update supporting documents.");
    } finally {
      setBusyId("");
    }
  }

  async function saveApplication(event: FormEvent<HTMLFormElement>, application: EmploymentApplication) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusyId(application.id);
    setError("");

    try {
      const response = await fetch("/api/employment-tracker", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: application.id,
          company_name: form.get("company_name"),
          role: form.get("role"),
          opportunity_type: form.get("opportunity_type"),
          source: form.get("source"),
          status: form.get("status"),
          application_date: form.get("application_date") || null,
          follow_up_date: form.get("follow_up_date") || null,
          closing_date: form.get("closing_date") || null,
          planned_application_date: form.get("planned_application_date") || null,
          assessment_deadline: form.get("assessment_deadline") || null,
          interview_date: form.get("interview_date") || null,
          expected_response_date: form.get("expected_response_date") || null,
          next_action_date: form.get("next_action_date") || null,
          next_action: form.get("next_action"),
          follow_up_state: form.get("follow_up_state"),
          contacts_json: safeContactsFromForm(form),
          note_event: form.get("note_event"),
          correction: form.get("correction") === "on",
          notes: form.get("notes")
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save application.");
      setApplications((current) => current.map((item) => (item.id === application.id ? data.application : item)));
      setEditingId("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save application.");
    } finally {
      setBusyId("");
    }
  }

  async function deleteApplication(application: EmploymentApplication) {
    setBusyId(application.id);
    setError("");

    try {
      const response = await fetch(`/api/employment-tracker?id=${encodeURIComponent(application.id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not delete application.");
      setApplications((current) => current.filter((item) => item.id !== application.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete application.");
    } finally {
      setBusyId("");
    }
  }

  async function prepareFollowUp(application: EmploymentApplication, type: FollowUpType) {
    setBusyId(`followup:${application.id}`);
    setError("");
    try {
      const response = await fetch("/api/application-follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          type,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not prepare follow-up.");
      setFollowUps((current) => {
        const withoutExisting = current.filter((item) => item.id !== data.followUp.id);
        return [data.followUp, ...withoutExisting];
      });
      updateApplicationAfterFollowUp(data.followUp);
      setCelebration(data.reused ? "Existing follow-up draft opened." : "Follow-up draft prepared. Review it before sending anything.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not prepare follow-up.");
    } finally {
      setBusyId("");
    }
  }

  async function updateFollowUp(followUp: FollowUpRow, patch: Record<string, unknown>) {
    setBusyId(`followup:${followUp.application_id}`);
    setError("");
    try {
      const response = await fetch("/api/application-follow-ups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: followUp.id, ...patch })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update follow-up.");
      setFollowUps((current) => current.map((item) => (item.id === data.followUp.id ? data.followUp : item)));
      updateApplicationAfterFollowUp(data.followUp);
      if (patch.markSent) setCelebration("Follow-up recorded as sent. PATHZY did not send it automatically.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update follow-up.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[.38fr_1fr]">
      <Card className="h-fit">
        <h2 className="text-2xl font-black">Add application</h2>
        <p className="mt-3 text-sm leading-6 text-white/58">Track planning, documents, applications, interviews, offers, notes, contacts, and follow-ups in one operational view.</p>
        {error ? <p className="mt-4 rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc5c5]">{error}</p> : null}
        <form onSubmit={addApplication} className="mt-5 grid gap-4">
          <label className="label">Company name<input className="field" name="company_name" defaultValue={searchParams?.get("company") ?? ""} required /></label>
          <label className="label">Role<input className="field" name="role" defaultValue={searchParams?.get("role") ?? ""} required /></label>
          <label className="label">Opportunity type<input className="field" name="opportunity_type" defaultValue={searchParams?.get("type") ?? "job"} /></label>
          <label className="label">Source<input className="field" name="source" placeholder="LinkedIn, referral, company site" /></label>
          <label className="label">
            Status
            <select className="field" name="status" defaultValue="planning">
              {statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="label">Planned date<input className="field" name="planned_application_date" type="date" /></label>
            <label className="label">Closing date<input className="field" name="closing_date" type="date" /></label>
            <label className="label">Applied date<input className="field" name="application_date" type="date" /></label>
            <label className="label">Follow-up date<input className="field" name="follow_up_date" type="date" /></label>
            <label className="label">Assessment deadline<input className="field" name="assessment_deadline" type="date" /></label>
            <label className="label">Interview date<input className="field" name="interview_date" type="datetime-local" /></label>
            <label className="label">Expected response<input className="field" name="expected_response_date" type="date" /></label>
            <label className="label">Next action date<input className="field" name="next_action_date" type="date" /></label>
          </div>
          <label className="label">Next Action<input className="field" name="next_action" placeholder="Prepare documents, send follow-up, practise interview" /></label>
          <label className="label">Follow-up state<input className="field" name="follow_up_state" placeholder="Not due, due today, sent, waiting" /></label>
          <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Contact</p>
            <div className="mt-3 grid gap-3">
              <label className="label">Type<select className="field" name="contact_type" defaultValue="recruiter"><option value="recruiter">Recruiter</option><option value="hiring_manager">Hiring manager</option><option value="referral_contact">Referral contact</option><option value="interviewer">Interviewer</option></select></label>
              <label className="label">Name<input className="field" name="contact_name" /></label>
              <label className="label">Email<input className="field" name="contact_email" type="email" /></label>
              <label className="label">Contact notes<textarea className="field" name="contact_notes" /></label>
            </div>
          </div>
          <label className="label">Notes<textarea className="field" name="notes" placeholder="What did you submit? Who should you follow up with?" /></label>
          <button disabled={busyId === "new"} className="rounded-full blue-purple px-6 py-3 text-sm font-extrabold text-white disabled:opacity-50">
            {busyId === "new" ? "Saving" : "Add to tracker"}
          </button>
        </form>
      </Card>

      <div className="grid gap-5">
        <Card>
          {celebration ? <p className="pathzy-status-success mb-4 rounded-[16px] border px-4 py-3 text-sm font-bold">{celebration}</p> : null}
          <div className="grid gap-3 sm:grid-cols-4">
            <div><p className="text-sm text-white/48">Active applications</p><strong className="text-3xl font-black">{summary.activeApplications}</strong></div>
            <div><p className="text-sm text-white/48">Follow-ups due</p><strong className="text-3xl font-black">{summary.followUpsDue}</strong></div>
            <div><p className="text-sm text-white/48">Interviews</p><strong className="text-3xl font-black">{summary.interviews}</strong></div>
            <div><p className="text-sm text-white/48">Next Action</p><strong className="text-base font-black">{summary.nextAction.label}</strong></div>
          </div>
          <div className="mt-5"><ProgressBar value={progress} /></div>
        </Card>

        <CareerAnalyticsDashboard
          analytics={careerAnalytics}
          activePeriod={analyticsPeriod}
          onPeriodChange={setAnalyticsPeriod}
          customStart={analyticsCustomStart}
          customEnd={analyticsCustomEnd}
          onCustomStartChange={setAnalyticsCustomStart}
          onCustomEndChange={setAnalyticsCustomEnd}
        />

        <Card>
          <h2 className="text-2xl font-black">Application board</h2>
          <div className="mt-4 grid gap-3">
            <label className="label">
              Search applications
              <input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, organization, contact or private notes" />
            </label>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Application views">
              {APPLICATION_TRACKER_VIEWS.map((view) => (
                <button
                  key={view}
                  type="button"
                  role="tab"
                  aria-selected={activeView === view}
                  onClick={() => setActiveView(view)}
                  className={`rounded-full px-4 py-2 text-xs font-extrabold ${activeView === view ? "blue-purple text-white" : "bg-white/10 text-white/62"}`}
                >
                  {viewLabels[view]}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {visibleApplications.map((application) => (
              <article key={application.id} className="rounded-[20px] border border-white/10 bg-white/7 p-4">
                {editingId === application.id ? (
                  <form onSubmit={(event) => saveApplication(event, application)} className="grid gap-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="label">Company<input className="field" name="company_name" defaultValue={application.company_name} required /></label>
                      <label className="label">Role<input className="field" name="role" defaultValue={application.role} required /></label>
                      <label className="label">Type<input className="field" name="opportunity_type" defaultValue={application.opportunity_type} /></label>
                      <label className="label">Source<input className="field" name="source" defaultValue={application.source ?? ""} /></label>
                      <label className="label">Status<select className="field" name="status" defaultValue={application.status}>{statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
                      <label className="label">Planned date<input className="field" name="planned_application_date" type="date" defaultValue={dateOnly(application.planned_application_date)} /></label>
                      <label className="label">Closing date<input className="field" name="closing_date" type="date" defaultValue={dateOnly(application.closing_date)} /></label>
                      <label className="label">Application date<input className="field" name="application_date" type="date" defaultValue={dateOnly(application.application_date)} /></label>
                      <label className="label">Follow-up date<input className="field" name="follow_up_date" type="date" defaultValue={dateOnly(application.follow_up_date)} /></label>
                      <label className="label">Assessment deadline<input className="field" name="assessment_deadline" type="date" defaultValue={dateOnly(application.assessment_deadline)} /></label>
                      <label className="label">Interview date<input className="field" name="interview_date" type="datetime-local" defaultValue={application.interview_date?.slice(0, 16) ?? ""} /></label>
                      <label className="label">Expected response<input className="field" name="expected_response_date" type="date" defaultValue={dateOnly(application.expected_response_date)} /></label>
                      <label className="label">Next action date<input className="field" name="next_action_date" type="date" defaultValue={dateOnly(application.next_action_date)} /></label>
                    </div>
                    <label className="label">Next Action<input className="field" name="next_action" defaultValue={application.next_action ?? ""} /></label>
                    <label className="label">Follow-up state<input className="field" name="follow_up_state" defaultValue={application.follow_up_state ?? ""} /></label>
                    <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">
                      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Contact</p>
                      <input type="hidden" name="contact_id" defaultValue={application.contacts_json?.[0]?.id ?? ""} />
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <label className="label">Type<select className="field" name="contact_type" defaultValue={application.contacts_json?.[0]?.type ?? "recruiter"}><option value="recruiter">Recruiter</option><option value="hiring_manager">Hiring manager</option><option value="referral_contact">Referral contact</option><option value="interviewer">Interviewer</option></select></label>
                        <label className="label">Name<input className="field" name="contact_name" defaultValue={application.contacts_json?.[0]?.name ?? ""} /></label>
                        <label className="label">Email<input className="field" name="contact_email" type="email" defaultValue={application.contacts_json?.[0]?.email ?? ""} /></label>
                        <label className="label">Contact notes<textarea className="field" name="contact_notes" defaultValue={application.contacts_json?.[0]?.notes ?? ""} /></label>
                      </div>
                    </div>
                    <label className="label">Notes<textarea className="field" name="notes" defaultValue={application.notes} /></label>
                    <label className="label">Add Note<textarea className="field" name="note_event" placeholder="Private note for this application's timeline" /></label>
                    <label className="flex items-start gap-3 text-sm font-bold text-white/62">
                      <input className="mt-1" type="checkbox" name="correction" />
                      <span>This is a correction to a previous status.</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button disabled={busyId === application.id} className="rounded-full blue-purple px-4 py-2 text-sm font-extrabold text-white">Save</button>
                      <button type="button" onClick={() => setEditingId("")} className="rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/68">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-xl font-black">{application.role}</h3>
                      <p className="mt-1 text-sm font-bold text-white/50">{application.company_name} - {application.opportunity_type}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/66">{statusLabel(application.status)}</span>
                        {application.source ? <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/50">{application.source}</span> : null}
                        <span className="rounded-full bg-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)] px-3 py-1 text-xs font-extrabold text-[var(--pathzy-red-dark)]">{countApplicationDocuments(application)} document{countApplicationDocuments(application) === 1 ? "" : "s"}</span>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs font-bold text-white/42 sm:grid-cols-2">
                        {application.planned_application_date ? <p>Prepared: {dateOnly(application.planned_application_date)}</p> : null}
                        {application.application_date ? <p>Applied: {dateOnly(application.application_date)}</p> : null}
                        {application.closing_date ? <p>Closing: {dateOnly(application.closing_date)}</p> : null}
                        {application.follow_up_date ? <p>Follow up: {dateOnly(application.follow_up_date)} {application.follow_up_state ? `- ${application.follow_up_state}` : ""}</p> : null}
                        {application.assessment_deadline ? <p>Assessment: {dateOnly(application.assessment_deadline)}</p> : null}
                        {application.interview_date ? <p>Interview: {new Date(application.interview_date).toLocaleString()}</p> : null}
                        {application.expected_response_date ? <p>Expected response: {dateOnly(application.expected_response_date)}</p> : null}
                        {application.next_action_date ? <p>Next action date: {dateOnly(application.next_action_date)}</p> : null}
                      </div>
                      <p className="mt-3 rounded-[14px] border border-white/10 bg-black/14 p-3 text-sm font-bold text-white/68">
                        Next Action: {getApplicationNextAction(application)}
                      </p>
                      {application.job_match_analysis_id ? <p className="mt-2 text-xs font-bold text-[var(--text-secondary)]">Match summary linked from Job Intelligence.</p> : null}
                      {application.contacts_json?.length ? (
                        <div className="mt-3 rounded-[14px] border border-white/10 bg-white/5 p-3 text-sm text-white/58">
                          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Contacts</p>
                          {application.contacts_json.map((contact) => (
                            <p key={contact.id} className="mt-2"><strong className="text-white/76">{contact.name}</strong> - {contact.type.replace(/_/g, " ")}{contact.email ? ` - ${contact.email}` : ""}</p>
                          ))}
                        </div>
                      ) : null}
                      {application.notes ? <p className="mt-3 text-sm leading-6 text-white/58">{application.notes}</p> : null}
                      <FollowUpWorkspace
                        application={application}
                        followUps={followUpsByApplication.get(application.id) ?? []}
                        busy={busyId === `followup:${application.id}`}
                        onPrepare={(type) => prepareFollowUp(application, type)}
                        onUpdate={updateFollowUp}
                      />
                      {(timelineByApplication.get(application.id) ?? []).length ? (
                        <div className="mt-3 rounded-[14px] border border-white/10 bg-black/14 p-3">
                          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Timeline</p>
                          <ul className="mt-2 grid gap-1 text-xs leading-5 text-white/52">
                            {(timelineByApplication.get(application.id) ?? []).slice(0, 4).map((event) => (
                              <li key={event.id}>{new Date(event.event_at).toLocaleString()} - {event.note}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {isSmartApplication(application) ? (
                        <SmartApplicationWorkspace
                          application={application}
                          supportingDocuments={supportingDocuments}
                          timelineEvents={timelineByApplication.get(application.id) ?? []}
                          busy={busyId === application.id}
                          onApproval={(approval, value) => updateApproval(application, approval, value)}
                          onSupportingDocuments={(ids) => updateSupportingDocuments(application, ids)}
                        />
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => setEditingId(application.id)} className="rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold text-white/68">Edit</button>
                        <button onClick={() => deleteApplication(application)} disabled={busyId === application.id} className="rounded-full bg-[#ff6b6b]/10 px-4 py-2 text-xs font-extrabold text-[#ffc5c5]">Delete</button>
                      </div>
                    </div>
                    <select
                      className="field md:max-w-[190px]"
                      value={application.status}
                      disabled={busyId === application.id}
                      onChange={(event) => updateStatus(application, event.target.value as ApplicationStatus)}
                    >
                      {statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                    </select>
                  </div>
                )}
              </article>
            ))}
            {!visibleApplications.length ? (
              <div className="grid place-items-center rounded-[22px] border border-dashed border-white/14 bg-white/5 p-8 text-center">
                <h3 className="text-xl font-black">{applications.length ? "No applications match this view." : "No applications yet."}</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/56">{applications.length ? "Try another view or search term." : "Save one opportunity or add a role manually. Your journey will update as soon as you track progress."}</p>
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

function CareerAnalyticsDashboard({
  analytics,
  activePeriod,
  onPeriodChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange
}: {
  analytics: ReturnType<typeof buildCareerAnalytics>;
  activePeriod: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
}) {
  const periods: Array<{ key: AnalyticsPeriod; label: string }> = [
    { key: "7d", label: "7 days" },
    { key: "30d", label: "30 days" },
    { key: "90d", label: "90 days" },
    { key: "year", label: "This year" },
    { key: "custom", label: "Custom" }
  ];
  const funnelStages = [
    ["prepared", "Prepared"],
    ["applied", "Applied"],
    ["employer_response", "Employer response"],
    ["screening", "Screening"],
    ["assessment", "Assessment"],
    ["interview", "Interview"],
    ["offer", "Offer"],
    ["accepted", "Accepted"]
  ] as const;
  const maxFunnel = Math.max(...Object.values(analytics.funnel), 1);

  return (
    <div id="career-analytics" className="scroll-mt-28">
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="pathzy-eyebrow-accent text-xs font-extrabold uppercase tracking-[0.14em]">Career Analytics</p>
          <h2 className="mt-2 text-2xl font-black">Private job-search signals you can act on.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/58">
            PATHZY uses your tracker, match analyses, and document metadata to show early patterns. Unknown outcomes are not treated as rejection.
          </p>
        </div>
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Career Analytics time filters">
            {periods.map((period) => (
              <button
                key={period.key}
                type="button"
                onClick={() => onPeriodChange(period.key)}
                className={`rounded-full px-3 py-2 text-xs font-extrabold ${activePeriod === period.key ? "blue-purple text-white" : "bg-white/10 text-white/62"}`}
              >
                {period.label}
              </button>
            ))}
          </div>
          {activePeriod === "custom" ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="label">
                Custom start
                <input className="field" type="date" value={customStart} onChange={(event) => onCustomStartChange(event.target.value)} />
              </label>
              <label className="label">
                Custom end
                <input className="field" type="date" value={customEnd} onChange={(event) => onCustomEndChange(event.target.value)} />
              </label>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {Object.values(analytics.metrics).map((metric) => (
          <div key={metric.label} className="rounded-[16px] border border-white/10 bg-black/14 p-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">{metric.label}</p>
            <strong className="mt-2 block text-xl font-black">{metric.value}</strong>
            <p className={`mt-2 text-xs font-bold ${metric.state === "known" ? "text-[var(--status-success)]" : metric.state === "early_signal" ? "text-[var(--status-warning)]" : "text-white/42"}`}>{metric.state === "early_signal" ? "Early Signal" : metric.state === "insufficient_data" ? "Not Enough Data Yet" : "Known"}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
          <h3 className="text-lg font-black">Application Funnel</h3>
          <div className="mt-4 grid gap-3">
            {funnelStages.map(([key, label]) => (
              <div key={key} className="grid gap-2">
                <div className="flex justify-between gap-3 text-sm font-bold text-white/66">
                  <span>{label}</span>
                  <span>{analytics.funnel[key]}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[var(--brand-primary)]" style={{ width: `${Math.max(4, (analytics.funnel[key] / maxFunnel) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
            <h3 className="text-lg font-black">Applications by Role</h3>
            <div className="mt-3 grid gap-2">
              {analytics.byRole.length ? analytics.byRole.slice(0, 4).map((item) => <AnalyticsGroupRow key={item.label} item={item} />) : <EmptyAnalyticsState />}
            </div>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
            <h3 className="text-lg font-black">Applications by Source</h3>
            <div className="mt-3 grid gap-2">
              {analytics.bySource.length ? analytics.bySource.slice(0, 4).map((item) => <AnalyticsGroupRow key={item.label} item={item} />) : <EmptyAnalyticsState />}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
          <h3 className="text-lg font-black">CV Performance</h3>
          <div className="mt-3 grid gap-2">
            {analytics.documentSignals.length ? analytics.documentSignals.map((item, index) => (
              <div key={item.documentId} className="rounded-[14px] bg-black/14 p-3">
                <p className="text-sm font-black">CV version {index + 1}</p>
                <p className="mt-1 text-xs leading-5 text-white/50">{item.applications} applications - {item.interviews} interviews - {item.signal === "not_enough_data" ? "Not enough data yet" : "Early signal"}</p>
                <p className="mt-2 text-xs leading-5 text-white/42">{item.note}</p>
              </div>
            )) : <EmptyAnalyticsState />}
          </div>
        </div>

        <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
          <h3 className="text-lg font-black">Recurring Gaps</h3>
          <div className="mt-3 grid gap-2">
            {analytics.recurringGaps.length ? analytics.recurringGaps.slice(0, 5).map((gap) => (
              <div key={`${gap.category}-${gap.label}`} className="rounded-[14px] bg-black/14 p-3">
                <p className="text-sm font-black">{gap.label}</p>
                <p className="mt-1 text-xs font-bold text-[var(--status-warning)]">{gap.category.replace(/_/g, " ")} - seen {gap.count} time{gap.count === 1 ? "" : "s"}</p>
                <p className="mt-2 text-xs leading-5 text-white/46">{gap.action}</p>
              </div>
            )) : <EmptyAnalyticsState />}
          </div>
        </div>

        <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
          <h3 className="text-lg font-black">Recommended Actions</h3>
          <div className="mt-3 grid gap-2">
            {analytics.recommendedActions.length ? analytics.recommendedActions.map((action) => (
              <div key={`${action.label}-${action.reason}`} className="rounded-[14px] bg-black/14 p-3">
                <p className="text-sm font-black">{action.label}</p>
                <p className="mt-2 text-xs leading-5 text-white/50">{action.reason}</p>
                {action.route ? <Link href={action.route} className="mt-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/66">Open</Link> : null}
              </div>
            )) : <EmptyAnalyticsState />}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-[18px] border border-white/10 bg-black/14 p-4 text-xs leading-5 text-white/46 md:grid-cols-2">
        <div>
          <p className="font-extrabold uppercase tracking-[0.12em] text-white/60">Calculation methodology</p>
          <ul className="mt-2 grid gap-1">
            {analytics.methodology.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <p className="font-extrabold uppercase tracking-[0.12em] text-white/60">Data honesty</p>
          <ul className="mt-2 grid gap-1">
            {analytics.dataWarnings.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </Card>
    </div>
  );
}

function AnalyticsGroupRow({ item }: { item: { label: string; applications: number; responses: number; interviews: number; offers: number; note: string } }) {
  return (
    <div className="rounded-[14px] bg-black/14 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black">{item.label}</p>
        <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-extrabold text-white/54">{item.applications} applications</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-white/50">{item.responses} responses - {item.interviews} interviews - {item.offers} offers</p>
      <p className="mt-1 text-xs leading-5 text-white/36">{item.note}</p>
    </div>
  );
}

function EmptyAnalyticsState() {
  return <p className="rounded-[14px] border border-dashed border-white/12 bg-black/14 p-3 text-sm leading-6 text-white/46">Not Enough Data Yet. Keep tracking applications and PATHZY will show useful signals.</p>;
}

function FollowUpWorkspace({
  application,
  followUps,
  busy,
  onPrepare,
  onUpdate
}: {
  application: EmploymentApplication;
  followUps: FollowUpRow[];
  busy: boolean;
  onPrepare: (type: FollowUpType) => void;
  onUpdate: (followUp: FollowUpRow, patch: Record<string, unknown>) => void;
}) {
  const status = normalizeApplicationStatus(application.status);
  const activeFollowUps = followUps.filter((followUp) => !["dismissed", "cancelled"].includes(followUp.status));
  const today = dateOnly(new Date().toISOString());
  const due = activeFollowUps.some((followUp) => followUp.recommended_date && followUp.recommended_date <= today && followUp.status !== "sent");
  const suggestedTypes = followUpTypes.filter((type) => {
    if (type === "interview_thank_you") return status === "interview_scheduled" || status === "interview_completed";
    if (type === "interview_status_follow_up") return status === "interview_completed" || Boolean(application.expected_response_date);
    if (type === "offer_response") return status === "offer_received";
    if (type === "referral_thank_you") return Boolean(application.contacts_json?.some((contact) => contact.type === "referral_contact"));
    return true;
  });

  function submitDraft(event: FormEvent<HTMLFormElement>, followUp: FollowUpRow) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onUpdate(followUp, {
      subject: form.get("subject"),
      body: form.get("body"),
      scheduledDate: form.get("scheduled_date") || null
    });
  }

  return (
    <div className="pathzy-status-info mt-3 rounded-[16px] border p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="pathzy-eyebrow-accent text-xs font-extrabold uppercase tracking-[0.14em]">Follow-Up</p>
          <h4 className="mt-1 text-base font-black">{due ? "Follow-Up Due" : activeFollowUps.length ? "Draft ready" : "Prepare a follow-up"}</h4>
          <p className="mt-2 text-sm leading-6 text-white/56">PATHZY can prepare a concise message and timing suggestion. Nothing is sent automatically.</p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-extrabold ${due ? "bg-[color-mix(in_srgb,var(--status-warning)_16%,transparent)] text-[var(--status-warning)]" : "bg-white/10 text-white/58"}`}>
          {application.follow_up_state || (due ? "due" : "user approval required")}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {suggestedTypes.map((type) => (
          <button
            key={type}
            type="button"
            disabled={busy}
            onClick={() => onPrepare(type)}
            className="rounded-full bg-white/10 px-3 py-2 text-xs font-extrabold text-white/68 disabled:opacity-50"
          >
            Prepare {followUpTypeLabels[type]}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3">
        {activeFollowUps.map((followUp) => {
          const canRecordSent = Boolean(followUp.approval_json?.approved && followUp.recipient_json?.known && followUp.status !== "sent");
          return (
            <form key={followUp.id} onSubmit={(event) => submitDraft(event, followUp)} className="grid gap-3 rounded-[14px] border border-white/10 bg-black/14 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-white/82">{followUpTypeLabels[followUp.follow_up_type]}</p>
                  <p className="mt-1 text-xs text-white/44">
                    {followUp.recommended_date ? `Recommended: ${followUp.recommended_date}` : "No recommended date"} - {followUpStatusLabel(followUp.status)}
                  </p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/58">{followUp.recipient_json?.label ?? "Recipient not set"}</span>
              </div>
              {!followUp.recipient_json?.known ? (
                <p className="pathzy-status-warning rounded-[12px] border p-2 text-xs font-bold">Add a known contact before recording this follow-up as sent.</p>
              ) : null}
              <p className="text-xs leading-5 text-white/42">{followUp.timing_reason}</p>
              <label className="label">Subject<input className="field" name="subject" defaultValue={followUp.subject} /></label>
              <label className="label">Message<textarea className="field min-h-[150px]" name="body" defaultValue={followUp.body} /></label>
              <label className="label">Schedule<input className="field" name="scheduled_date" type="datetime-local" defaultValue={followUp.scheduled_date?.slice(0, 16) ?? ""} /></label>
              <div className="flex flex-wrap gap-2">
                <button disabled={busy} className="rounded-full blue-purple px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50">Save Draft</button>
                <button type="button" disabled={busy || followUp.status === "sent"} onClick={() => onUpdate(followUp, { approve: true })} className="rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold text-white/68 disabled:opacity-50">Approve</button>
                <button type="button" disabled={busy || !canRecordSent} onClick={() => onUpdate(followUp, { markSent: true })} className="rounded-full bg-[color-mix(in_srgb,var(--status-success)_14%,transparent)] px-4 py-2 text-xs font-extrabold text-[var(--status-success)] disabled:opacity-50">Mark as Sent</button>
                <button type="button" disabled={busy || followUp.status === "sent"} onClick={() => onUpdate(followUp, { dismiss: true })} className="rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold text-white/58 disabled:opacity-50">Dismiss</button>
              </div>
            </form>
          );
        })}
      </div>
    </div>
  );
}

function SmartApplicationWorkspace({
  application,
  supportingDocuments,
  timelineEvents,
  busy,
  onApproval,
  onSupportingDocuments
}: {
  application: EmploymentApplication;
  supportingDocuments: SupportingDocumentOption[];
  timelineEvents: TimelineEventRow[];
  busy: boolean;
  onApproval: (approval: keyof SmartApplicationApprovals, value: boolean) => void;
  onSupportingDocuments: (ids: string[]) => void;
}) {
  const approvals = approvalState(application);
  const selectedSupportingIds = application.supporting_document_ids_json ?? [];
  const checklist = checklistItems(application);
  const readyCount = checklist.filter((item) => item.state === "complete").length;
  const completion = checklist.length ? Math.round((readyCount / checklist.length) * 100) : 0;

  function toggleSupportingDocument(id: string) {
    const next = selectedSupportingIds.includes(id)
      ? selectedSupportingIds.filter((item) => item !== id)
      : [...selectedSupportingIds, id];
    onSupportingDocuments(next);
  }

  return (
    <div className="pathzy-status-info mt-4 grid gap-4 rounded-[20px] border p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="pathzy-eyebrow-accent text-xs font-extrabold uppercase tracking-[0.14em]">Application Workspace</p>
          <h4 className="mt-2 text-lg font-black">Application Package</h4>
          <p className="mt-2 text-sm leading-6 text-white/58">Review your job match, targeted documents, supporting files, and checklist before you apply. PATHZY does not submit anything automatically.</p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-extrabold ${application.status === "ready_to_apply" ? "bg-[color-mix(in_srgb,var(--status-success)_16%,transparent)] text-[var(--status-success)]" : "bg-[color-mix(in_srgb,var(--status-warning)_16%,transparent)] text-[var(--status-warning)]"}`}>
          {application.status === "ready_to_apply" ? "Ready to Apply" : "Review Required"}
        </span>
      </div>

      {application.stale_state === "stale" ? (
        <div className="pathzy-status-warning rounded-[16px] border p-3 text-sm font-bold">
          This workspace may be stale because the profile, job, or match changed. Refresh before applying.
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[16px] border border-white/10 bg-black/14 p-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">Overview</p>
          <p className="mt-2 text-sm leading-6 text-white/62">Profile v{application.canonical_profile_version ?? "?"} · Job v{application.job_understanding_version ?? "?"}</p>
          <p className="mt-1 text-sm leading-6 text-white/62">Readiness: {statusLabel(application.application_readiness ?? "review_required")}</p>
        </div>
        <div className="rounded-[16px] border border-white/10 bg-black/14 p-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">Job Match</p>
          <p className="mt-2 text-sm leading-6 text-white/62">Match analysis linked.</p>
          <p className="mt-1 text-xs text-white/40">{application.job_match_analysis_id}</p>
        </div>
        <div className="rounded-[16px] border border-white/10 bg-black/14 p-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">Checklist</p>
          <p className="mt-2 text-2xl font-black">{completion}%</p>
          <p className="mt-1 text-sm text-white/52">{readyCount} of {checklist.length} items complete</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-[16px] border border-white/10 bg-black/14 p-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">Documents</p>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-white/7 p-3">
              <span>Targeted CV</span>
              <div className="flex flex-wrap gap-2">
                {application.targeted_cv_document_id ? <Link href={`/professional-identity/cv?documentId=${application.targeted_cv_document_id}&intent=targeted`} className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/66">Open</Link> : null}
                <button disabled={busy} onClick={() => onApproval("cv", !approvals.cv)} className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/66">{approvals.cv ? "Approved" : "Approve CV"}</button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-white/7 p-3">
              <span>Cover Letter</span>
              <div className="flex flex-wrap gap-2">
                {application.cover_letter_document_id ? <Link href={`/professional-identity/cover-letter?documentId=${application.cover_letter_document_id}&intent=targeted`} className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/66">Open</Link> : null}
                <button disabled={busy} onClick={() => onApproval("coverLetter", !approvals.coverLetter)} className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/66">{approvals.coverLetter ? "Approved" : "Approve Letter"}</button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] bg-white/7 p-3">
              <span>Application Message</span>
              <button disabled={busy} onClick={() => onApproval("applicationMessage", !approvals.applicationMessage)} className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/66">{approvals.applicationMessage ? "Approved" : "Approve Message"}</button>
            </div>
          </div>
        </div>

        <div className="rounded-[16px] border border-white/10 bg-black/14 p-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">Supporting Documents</p>
          <div className="mt-3 grid gap-2">
            {supportingDocuments.length ? supportingDocuments.map((document) => (
              <label key={document.id} className="flex items-start gap-3 rounded-[14px] bg-white/7 p-3 text-sm text-white/66">
                <input
                  type="checkbox"
                  checked={selectedSupportingIds.includes(document.id)}
                  disabled={busy}
                  onChange={() => toggleSupportingDocument(document.id)}
                  className="mt-1"
                />
                <span>
                  <strong className="block text-white/78">{document.document_title}</strong>
                  <span className="text-xs text-white/42">{document.document_type} · {document.status ?? "saved"}</span>
                </span>
              </label>
            )) : (
              <p className="rounded-[14px] border border-dashed border-white/12 bg-white/5 p-3 text-sm leading-6 text-white/52">No supporting documents saved yet. Upload certificates, licences, transcripts or references in My Documents.</p>
            )}
          </div>
          <button disabled={busy} onClick={() => onApproval("supportingDocuments", !approvals.supportingDocuments)} className="mt-3 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold text-white/66">{approvals.supportingDocuments ? "Supporting documents approved" : "Approve selected documents"}</button>
        </div>
      </div>

      <div className="rounded-[16px] border border-white/10 bg-black/14 p-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">Checklist</p>
        <div className="mt-3 grid gap-2">
          {checklist.map((item) => (
            <div key={item.id} className="grid gap-2 rounded-[14px] bg-white/7 p-3 text-sm md:grid-cols-[1fr_.35fr_.35fr]">
              <span className="font-bold text-white/76">{item.label}</span>
              <span className="text-white/50">{item.required ? "Required" : "Optional"}</span>
              <span className={item.state === "complete" ? "text-[var(--status-success)]" : item.state === "blocked" ? "text-[#ffc5c5]" : "text-[var(--status-warning)]"}>{statusLabel(item.state)}</span>
              <p className="text-xs leading-5 text-white/42 md:col-span-3">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="rounded-[16px] border border-white/10 bg-black/14 p-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">History</p>
          {timelineEvents.length ? <p className="mt-2 text-xs text-white/42">{timelineEvents.length} immutable event{timelineEvents.length === 1 ? "" : "s"} saved.</p> : null}
          <ul className="mt-2 grid gap-1 text-xs leading-5 text-white/52">
            {(application.status_history_json ?? []).slice(-3).map((item) => <li key={`${item.at}-${item.event}`}>{new Date(item.at).toLocaleString()} · {item.note}</li>)}
          </ul>
        </div>
        <button disabled={busy} onClick={() => onApproval("packageApproved", !approvals.packageApproved)} className="rounded-full bg-[var(--brand-primary)] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-60">
          {approvals.packageApproved ? "Package approved" : "Approve Package"}
        </button>
      </div>
    </div>
  );
}
