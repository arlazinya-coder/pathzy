"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { PremiumUpgradeCard } from "@/components/upgrade/premium-upgrade-card";
import { downloadBlob, pathzyFilename, simplePdfDocument } from "@/components/professional-identity/document-downloads";
import { appRoutes } from "@/lib/navigation/routes";

type ReferenceItem = {
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
};

const blankReference: ReferenceItem = {
  name: "",
  role: "",
  company: "",
  email: "",
  phone: "",
  relationship: ""
};

function parseReferences(value: string): ReferenceItem[] {
  if (!value.trim()) return [];
  return value.split(/\n{2,}/).map((block) => {
    const parts = block.split(/\n/).map((part) => part.trim());
    return {
      name: parts[0] ?? "",
      role: parts[1] ?? "",
      company: parts[2] ?? "",
      email: parts[3] ?? "",
      phone: parts[4] ?? "",
      relationship: parts[5] ?? ""
    };
  });
}

function serializeReferences(items: ReferenceItem[]) {
  return items
    .map((item) => [item.name, item.role, item.company, item.email, item.phone, item.relationship].map((part) => part.trim()).filter(Boolean).join("\n"))
    .filter(Boolean)
    .join("\n\n");
}

export function ReferencesClient({ initialReferences, canExport }: { initialReferences: string; canExport: boolean }) {
  const [items, setItems] = useState<ReferenceItem[]>(parseReferences(initialReferences));
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const content = useMemo(() => serializeReferences(items), [items]);

  function updateItem(index: number, field: keyof ReferenceItem, value: string) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  }

  async function save(nextItems = items) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/professional-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "references", values: { references: serializeReferences(nextItems) } })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save references.");
      setNotice("References saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save references.");
    } finally {
      setSaving(false);
    }
  }

  function aiFormat() {
    if (!canExport) {
      setUpgradeRequired(true);
      return;
    }
    setItems((current) => current.map((item) => ({
      ...item,
      name: item.name.trim(),
      role: item.role.trim(),
      company: item.company.trim(),
      email: item.email.trim().toLowerCase(),
      phone: item.phone.trim(),
      relationship: item.relationship.trim()
    })));
    setNotice("References formatted.");
  }

  async function downloadPdf() {
    if (!canExport) {
      setUpgradeRequired(true);
      return;
    }
    downloadBlob(pathzyFilename("References", "Professional References", "pdf"), "application/pdf", simplePdfDocument("Professional References", content || "References available upon request.", "ATS Friendly", false));
    setNotice("Your file has downloaded to your browser's Downloads folder.");
  }

  if (upgradeRequired) {
    return (
      <PremiumUpgradeCard
        title="This feature is available with PATHZY Premium."
        subtitle="You can add, edit, save, and preview references for free. Premium unlocks AI formatting and PDF download."
        primaryLabel="Upgrade to Starter - $9.99/month"
        secondaryLabel="Keep editing"
        onSecondary={() => setUpgradeRequired(false)}
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[.45fr_1fr]">
      <Card className="h-fit">
        <h2 className="text-2xl font-black">References</h2>
        <p className="mt-3 text-sm leading-6 text-white/58">Add people who can speak honestly about your work, studies, projects, or character.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => setItems((current) => [...current, blankReference])} className="rounded-full blue-purple px-5 py-3 text-sm font-extrabold text-white">Add Reference</button>
          <button onClick={aiFormat} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82">AI Formatting</button>
        </div>
        {notice || saving ? <p className="mt-4 rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold text-[#b9f8d5]">{saving ? "Saving..." : notice}</p> : null}
        {error ? <p className="mt-4 rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc5c5]">{error}</p> : null}
      </Card>
      <Card>
        <div className="grid gap-4">
          {items.length ? items.map((item, index) => (
            <div key={index} className="rounded-[20px] border border-white/10 bg-white/6 p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-black">Reference {index + 1}</h3>
                <button onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-full border border-[#ff6b6b]/25 bg-[#ff6b6b]/10 px-4 py-2 text-sm font-extrabold text-[#ffc5c5]">Delete Reference</button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {Object.keys(blankReference).map((field) => (
                  <label key={field} className="label capitalize">
                    {field}
                    <input className="field" value={item[field as keyof ReferenceItem]} onChange={(event) => updateItem(index, field as keyof ReferenceItem, event.target.value)} />
                  </label>
                ))}
              </div>
            </div>
          )) : (
            <div className="rounded-[22px] border border-dashed border-white/14 bg-white/5 p-8 text-center">
              <h3 className="text-xl font-black">No references yet.</h3>
              <p className="mt-3 text-sm leading-6 text-white/58">Add a reference when you have permission to include them.</p>
            </div>
          )}
        </div>
        <div className="mt-5 rounded-[22px] border border-white/10 bg-white/6 p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Preview</p>
          <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/72">{content || "References available upon request."}</pre>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={() => save()} className="rounded-full blue-purple px-5 py-3 text-sm font-extrabold text-white">Save References</button>
          <button onClick={downloadPdf} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82">Download PDF</button>
          <Link href={appRoutes.professionalIdentity} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82">Back to My Professional Profile</Link>
          <Link href={appRoutes.roadmap} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82">Back to My Employment Journey</Link>
        </div>
      </Card>
    </div>
  );
}
