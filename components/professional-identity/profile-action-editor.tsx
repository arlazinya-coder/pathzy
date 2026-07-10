"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/lib/navigation/routes";

export type ProfileSectionKey =
  | "name"
  | "email"
  | "phone"
  | "location"
  | "currentStatus"
  | "education"
  | "fieldOfStudy"
  | "careerDirection"
  | "experience"
  | "skills"
  | "languages"
  | "projects"
  | "certificates"
  | "achievements"
  | "references"
  | "uploadedDocuments";

export type ProfileActionRow = {
  section: ProfileSectionKey;
  label: string;
  value: string;
  helper: string;
};

type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea";
  placeholder?: string;
};

type SectionAction = {
  title: string;
  description: string;
  fields: FieldConfig[];
};

export const profileSectionActions: Record<Exclude<ProfileSectionKey, "uploadedDocuments">, SectionAction> = {
  name: {
    title: "Name editor",
    description: "This name appears in your CV, cover letters, and professional documents.",
    fields: [{ name: "full_name", label: "Full name", placeholder: "Nicka Candida" }]
  },
  email: {
    title: "Email editor",
    description: "Use the email address employers should contact.",
    fields: [{ name: "email", label: "Email", type: "email", placeholder: "name@example.com" }]
  },
  phone: {
    title: "Phone editor",
    description: "Add a reachable phone number for job applications.",
    fields: [{ name: "phone", label: "Phone", type: "tel", placeholder: "+27 00 000 0000" }]
  },
  location: {
    title: "Location editor",
    description: "Your location helps PATHZY personalize documents and opportunities.",
    fields: [
      { name: "city", label: "City", placeholder: "Johannesburg" },
      { name: "country", label: "Country", placeholder: "South Africa" }
    ]
  },
  currentStatus: {
    title: "Current Status editor",
    description: "Tell PATHZY where you are right now so your documents sound accurate.",
    fields: [{ name: "current_status", label: "Current status", placeholder: "Graduate, student, employed, career changer..." }]
  },
  education: {
    title: "Education editor",
    description: "Add your education level or qualification.",
    fields: [{ name: "education", label: "Education", placeholder: "Diploma in Information Technology" }]
  },
  fieldOfStudy: {
    title: "Field of Study editor",
    description: "Add your main area of study or training.",
    fields: [{ name: "field_of_study", label: "Field of study", placeholder: "Information Technology" }]
  },
  careerDirection: {
    title: "Career Direction editor",
    description: "Choose the direction PATHZY should use when guiding your next steps.",
    fields: [{ name: "career_goal", label: "Selected career direction", placeholder: "Data Analyst" }]
  },
  experience: {
    title: "Experience editor",
    description: "Summarize your work, volunteer, school, or life experience.",
    fields: [{ name: "personal_background", label: "Experience", type: "textarea", placeholder: "Describe relevant experience honestly." }]
  },
  skills: {
    title: "Skills editor",
    description: "Add skills you want PATHZY to use in your documents.",
    fields: [{ name: "skills", label: "Skills", type: "textarea", placeholder: "Excel, communication, customer service, SQL" }]
  },
  languages: {
    title: "Languages editor",
    description: "Add languages you can use professionally.",
    fields: [{ name: "language", label: "Languages", placeholder: "English, French" }]
  },
  projects: {
    title: "Projects editor",
    description: "Add projects, coursework, portfolio work, or practical examples.",
    fields: [{ name: "interests", label: "Projects", type: "textarea", placeholder: "Describe projects PATHZY can include in your documents." }]
  },
  certificates: {
    title: "Certificates editor",
    description: "Add certificates, qualifications, or short courses you have completed.",
    fields: [{ name: "certifications", label: "Certificates or qualifications", type: "textarea", placeholder: "Google Data Analytics Certificate, Excel course..." }]
  },
  achievements: {
    title: "Achievements editor",
    description: "Add achievements that show effort, consistency, leadership, or results.",
    fields: [{ name: "achievements", label: "Achievements", type: "textarea", placeholder: "Awards, milestones, academic results, community wins..." }]
  },
  references: {
    title: "References editor",
    description: "Add reference notes or people you may ask for employment references.",
    fields: [{ name: "references", label: "References", type: "textarea", placeholder: "Available on request, or add reference details." }]
  }
};

function initialDraft(row: ProfileActionRow) {
  if (row.section === "location") {
    const [city = "", country = ""] = row.value.split(",").map((part) => part.trim());
    return { city, country };
  }

  const action = row.section === "uploadedDocuments" ? null : profileSectionActions[row.section];
  const firstField = action?.fields[0]?.name ?? "value";
  return { [firstField]: row.value };
}

export function ProfileActionEditor({ rows }: { rows: ProfileActionRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<ProfileActionRow | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const action = useMemo(() => {
    if (!editing || editing.section === "uploadedDocuments") return null;
    return profileSectionActions[editing.section];
  }, [editing]);

  function openEditor(row: ProfileActionRow) {
    setNotice("");
    setError("");
    if (row.section === "uploadedDocuments") return;
    setEditing(row);
    setDraft(initialDraft(row));
  }

  function cancelEditor() {
    setEditing(null);
    setDraft({});
    setError("");
    setNotice("Cancel returns to /professional-identity without saving.");
  }

  async function saveEditor() {
    if (!editing || editing.section === "uploadedDocuments") return;
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/professional-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: editing.section, values: draft })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "We could not save this section. Please try again.");
      setNotice("Saved. Save returns to /professional-identity and updated data appears immediately after Save.");
      setEditing(null);
      setDraft({});
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "We could not save this section. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 grid gap-4">
      {notice ? <p className="rounded-[18px] border border-[#9df0c4]/25 bg-[#9df0c4]/10 px-4 py-3 text-sm font-bold text-[#bdf8d5]">{notice}</p> : null}
      {error ? <p className="rounded-[18px] border border-[#ff8f9b]/25 bg-[#ff8f9b]/10 px-4 py-3 text-sm font-bold text-[#ffc4cb]">{error}</p> : null}

      {editing && action ? (
        <div className="rounded-[22px] border border-[#8fb0ff]/30 bg-[#8fb0ff]/10 p-4 md:p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#b9c8ff]">{action.title}</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/66">{action.description}</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/58">Editing {editing.label}</span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {action.fields.map((field) => {
              const inputClasses = "min-h-12 rounded-[16px] border border-white/10 bg-[#080f22] px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-white/28 focus:border-[#8fb0ff]";
              return (
                <label key={field.name} className={field.type === "textarea" ? "grid gap-2 md:col-span-2" : "grid gap-2"}>
                  <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/46">{field.label}</span>
                  {field.type === "textarea" ? (
                    <textarea
                      className={`${inputClasses} min-h-32 resize-y`}
                      value={draft[field.name] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(event) => setDraft((current) => ({ ...current, [field.name]: event.target.value }))}
                    />
                  ) : (
                    <input
                      className={inputClasses}
                      type={field.type ?? "text"}
                      value={draft[field.name] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(event) => setDraft((current) => ({ ...current, [field.name]: event.target.value }))}
                    />
                  )}
                </label>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={saveEditor} disabled={saving} className="tap-target rounded-full blue-purple px-6 py-3 text-sm font-extrabold text-white shadow-[0_16px_42px_rgba(91,140,255,.32)] disabled:cursor-not-allowed disabled:opacity-55">
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={cancelEditor} disabled={saving} className="tap-target rounded-full border border-white/12 bg-white/8 px-6 py-3 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-55">
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => {
          const cleanValue = String(row.value ?? "").trim();
          const isUploadedDocuments = row.section === "uploadedDocuments";
          const buttonLabel = cleanValue ? "Edit" : "Add missing info";
          return (
            <div key={`${row.section}-${row.label}`} className="rounded-[18px] border border-white/10 bg-white/6 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/38">{row.label}</p>
                <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${cleanValue ? "bg-[#9df0c4]/12 text-[#bdf8d5]" : "bg-[#f8c45d]/12 text-[#ffe2a8]"}`}>{cleanValue ? "Ready" : "Missing"}</span>
              </div>
              <p className={`mt-2 text-sm leading-6 ${cleanValue ? "text-white/72" : "text-[#ffe2a8]"}`}>{cleanValue || "Missing - add this when available"}</p>
              <p className="mt-2 text-xs leading-5 text-white/42">{row.helper}</p>
              <div className="mt-3">
                {isUploadedDocuments ? (
                  <Link href={appRoutes.documents} className="tap-target inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-2 text-sm font-extrabold text-white/82 transition hover:-translate-y-0.5">
                    Open Documents
                  </Link>
                ) : (
                  <button type="button" onClick={() => openEditor(row)} className="tap-target inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-2 text-sm font-extrabold text-white/82 transition hover:-translate-y-0.5">
                    {buttonLabel}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
