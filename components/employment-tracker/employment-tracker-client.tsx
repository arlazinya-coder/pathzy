"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, ProgressBar } from "@/components/ui";

type ApplicationStatus = "saved" | "applied" | "interview" | "rejected" | "offer" | "accepted";

type EmploymentApplication = {
  id: string;
  company_name: string;
  role: string;
  opportunity_type: string;
  status: ApplicationStatus;
  application_date: string | null;
  follow_up_date: string | null;
  notes: string;
  updated_at: string;
};

const statuses: ApplicationStatus[] = ["saved", "applied", "interview", "rejected", "offer", "accepted"];

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export function EmploymentTrackerClient({ initialApplications }: { initialApplications: EmploymentApplication[] }) {
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState(initialApplications);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [celebration, setCelebration] = useState("");
  const stats = useMemo(
    () => ({
      saved: applications.filter((item) => item.status === "saved").length,
      applied: applications.filter((item) => item.status === "applied" || item.status === "interview" || item.status === "offer" || item.status === "accepted").length,
      interviews: applications.filter((item) => item.status === "interview").length,
      offers: applications.filter((item) => item.status === "offer" || item.status === "accepted").length
    }),
    [applications]
  );
  const progress = Math.min(100, applications.length ? Math.round(((stats.applied + stats.interviews + stats.offers) / (applications.length * 3)) * 100) : 0);

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
          status: form.get("status"),
          application_date: form.get("application_date") || null,
          follow_up_date: form.get("follow_up_date") || null,
          notes: form.get("notes")
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not add application.");
      setApplications((current) => [data.application, ...current]);
      if (data.application.status === "applied") setCelebration("First application tracked. That counts.");
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
      if (status === "interview") setCelebration("Interview tracked. Time to prepare with PATHZY.");
      if (status === "offer") setCelebration("Offer tracked. Big milestone.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update application.");
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
          status: form.get("status"),
          application_date: form.get("application_date") || null,
          follow_up_date: form.get("follow_up_date") || null,
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
        <p className="mt-3 text-sm leading-6 text-white/58">Track saved jobs, applications, interviews, offers, and follow-ups in one lightweight board.</p>
        {error ? <p className="mt-4 rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc5c5]">{error}</p> : null}
        <form onSubmit={addApplication} className="mt-5 grid gap-4">
          <label className="label">Company name<input className="field" name="company_name" defaultValue={searchParams?.get("company") ?? ""} required /></label>
          <label className="label">Role<input className="field" name="role" defaultValue={searchParams?.get("role") ?? ""} required /></label>
          <label className="label">Opportunity type<input className="field" name="opportunity_type" defaultValue={searchParams?.get("type") ?? "job"} /></label>
          <label className="label">
            Status
            <select className="field" name="status" defaultValue="saved">
              {statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
            </select>
          </label>
          <label className="label">Application date<input className="field" name="application_date" type="date" /></label>
          <label className="label">Follow-up date<input className="field" name="follow_up_date" type="date" /></label>
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
            <div><p className="text-sm text-white/48">Saved jobs</p><strong className="text-3xl font-black">{stats.saved}</strong></div>
            <div><p className="text-sm text-white/48">Applications sent</p><strong className="text-3xl font-black">{stats.applied}</strong></div>
            <div><p className="text-sm text-white/48">Interviews</p><strong className="text-3xl font-black">{stats.interviews}</strong></div>
            <div><p className="text-sm text-white/48">Offers</p><strong className="text-3xl font-black">{stats.offers}</strong></div>
          </div>
          <div className="mt-5"><ProgressBar value={progress} /></div>
        </Card>

        <Card>
          <h2 className="text-2xl font-black">Application board</h2>
          <div className="mt-5 grid gap-3">
            {applications.map((application) => (
              <article key={application.id} className="rounded-[20px] border border-white/10 bg-white/7 p-4">
                {editingId === application.id ? (
                  <form onSubmit={(event) => saveApplication(event, application)} className="grid gap-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="label">Company<input className="field" name="company_name" defaultValue={application.company_name} required /></label>
                      <label className="label">Role<input className="field" name="role" defaultValue={application.role} required /></label>
                      <label className="label">Type<input className="field" name="opportunity_type" defaultValue={application.opportunity_type} /></label>
                      <label className="label">Status<select className="field" name="status" defaultValue={application.status}>{statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
                      <label className="label">Application date<input className="field" name="application_date" type="date" defaultValue={application.application_date ?? ""} /></label>
                      <label className="label">Follow-up date<input className="field" name="follow_up_date" type="date" defaultValue={application.follow_up_date ?? ""} /></label>
                    </div>
                    <label className="label">Notes<textarea className="field" name="notes" defaultValue={application.notes} /></label>
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
                      {application.application_date ? <p className="mt-2 text-xs font-bold text-white/42">Applied: {application.application_date}</p> : null}
                      {application.follow_up_date ? <p className="mt-1 text-xs font-bold text-white/42">Follow up: {application.follow_up_date}</p> : null}
                      {application.notes ? <p className="mt-3 text-sm leading-6 text-white/58">{application.notes}</p> : null}
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
            {!applications.length ? (
              <div className="grid place-items-center rounded-[22px] border border-dashed border-white/14 bg-white/5 p-8 text-center">
                <h3 className="text-xl font-black">No applications yet.</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/56">Save one opportunity or add a role manually. Your journey will update as soon as you track progress.</p>
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
