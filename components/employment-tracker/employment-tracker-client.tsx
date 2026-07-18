"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, ProgressBar } from "@/components/ui";
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

const statuses = [...APPLICATION_TRACKER_STATUSES];

function statusLabel(status: string) {
  return labelApplicationStatus(status);
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
  timelineEvents = []
}: {
  initialApplications: EmploymentApplication[];
  supportingDocuments?: SupportingDocumentOption[];
  timelineEvents?: TimelineEventRow[];
}) {
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState(initialApplications);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [celebration, setCelebration] = useState("");
  const [activeView, setActiveView] = useState<ApplicationTrackerView>("all");
  const [search, setSearch] = useState("");
  const summary = useMemo(() => summarizeApplicationTracker(applications), [applications]);
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
          {celebration ? <p className="mb-4 rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold text-[#b9f8d5]">{celebration}</p> : null}
          <div className="grid gap-3 sm:grid-cols-4">
            <div><p className="text-sm text-white/48">Active applications</p><strong className="text-3xl font-black">{summary.activeApplications}</strong></div>
            <div><p className="text-sm text-white/48">Follow-ups due</p><strong className="text-3xl font-black">{summary.followUpsDue}</strong></div>
            <div><p className="text-sm text-white/48">Interviews</p><strong className="text-3xl font-black">{summary.interviews}</strong></div>
            <div><p className="text-sm text-white/48">Next Action</p><strong className="text-base font-black">{summary.nextAction.label}</strong></div>
          </div>
          <div className="mt-5"><ProgressBar value={progress} /></div>
        </Card>

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
                        <span className="rounded-full bg-[#5B8CFF]/14 px-3 py-1 text-xs font-extrabold text-[#c7d6ff]">{countApplicationDocuments(application)} document{countApplicationDocuments(application) === 1 ? "" : "s"}</span>
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
                      {application.job_match_analysis_id ? <p className="mt-2 text-xs font-bold text-[#c7d6ff]/72">Match summary linked from Job Intelligence.</p> : null}
                      {application.contacts_json?.length ? (
                        <div className="mt-3 rounded-[14px] border border-white/10 bg-white/5 p-3 text-sm text-white/58">
                          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Contacts</p>
                          {application.contacts_json.map((contact) => (
                            <p key={contact.id} className="mt-2"><strong className="text-white/76">{contact.name}</strong> - {contact.type.replace(/_/g, " ")}{contact.email ? ` - ${contact.email}` : ""}</p>
                          ))}
                        </div>
                      ) : null}
                      {application.notes ? <p className="mt-3 text-sm leading-6 text-white/58">{application.notes}</p> : null}
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
    <div className="mt-4 grid gap-4 rounded-[20px] border border-[#5B8CFF]/24 bg-[#5B8CFF]/8 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#aac1ff]">Application Workspace</p>
          <h4 className="mt-2 text-lg font-black">Application Package</h4>
          <p className="mt-2 text-sm leading-6 text-white/58">Review your job match, targeted documents, supporting files, and checklist before you apply. PATHZY does not submit anything automatically.</p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-extrabold ${application.status === "ready_to_apply" ? "bg-[#39d98a]/18 text-[#b9f8d5]" : "bg-[#FFD166]/15 text-[#ffe2a3]"}`}>
          {application.status === "ready_to_apply" ? "Ready to Apply" : "Review Required"}
        </span>
      </div>

      {application.stale_state === "stale" ? (
        <div className="rounded-[16px] border border-[#FFD166]/30 bg-[#FFD166]/10 p-3 text-sm font-bold text-[#ffe2a3]">
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
              <span className={item.state === "complete" ? "text-[#b9f8d5]" : item.state === "blocked" ? "text-[#ffc5c5]" : "text-[#ffe2a3]"}>{statusLabel(item.state)}</span>
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
        <button disabled={busy} onClick={() => onApproval("packageApproved", !approvals.packageApproved)} className="rounded-full bg-[#39d98a] px-5 py-3 text-sm font-extrabold text-[#062615] disabled:opacity-60">
          {approvals.packageApproved ? "Package approved" : "Approve Package"}
        </button>
      </div>
    </div>
  );
}
