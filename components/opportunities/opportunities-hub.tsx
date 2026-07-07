"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, ProgressBar } from "@/components/ui";
import { getOpportunityStats } from "@/lib/opportunities/data";
import type { OpportunityAction, OpportunityCategory, PersonalizedOpportunity } from "@/lib/opportunities/types";

const categories: Array<OpportunityCategory | "All"> = [
  "All",
  "Recommended jobs",
  "Internships",
  "Learnerships",
  "Apprenticeships",
  "Scholarships",
  "Free online courses",
  "Certifications"
];

function sectionTitle(category: OpportunityCategory | "All") {
  if (category === "Internships") return "Internships for You";
  if (category === "Learnerships") return "Learnerships for You";
  if (category === "Scholarships") return "Scholarships for You";
  if (category === "Recommended jobs") return "Jobs for You";
  return "Jobs for You";
}

export function OpportunitiesHub({ initialOpportunities }: { initialOpportunities: PersonalizedOpportunity[] }) {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [activeCategory, setActiveCategory] = useState<OpportunityCategory | "All">("All");
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const stats = useMemo(() => getOpportunityStats(opportunities), [opportunities]);
  const visibleOpportunities = activeCategory === "All" ? opportunities : opportunities.filter((item) => item.category === activeCategory);

  async function updateAction(opportunity: PersonalizedOpportunity, patch: Partial<OpportunityAction>) {
    const nextAction = { ...opportunity.action, ...patch };
    setBusyId(opportunity.id);
    setError("");
    setSuccess("");
    setOpportunities((current) =>
      current
        .map((item) => (item.id === opportunity.id ? { ...item, action: nextAction } : item))
        .filter((item) => !item.action.hidden)
    );

    try {
      const response = await fetch("/api/opportunities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: opportunity.id, ...nextAction })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "Could not update opportunity.");

      if (patch.saved || patch.applied) {
        await fetch("/api/employment-tracker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: opportunity.provider,
            role: opportunity.title,
            opportunity_type: opportunity.category,
            status: patch.applied ? "applied" : "saved",
            application_date: patch.applied ? new Date().toISOString().slice(0, 10) : null,
            notes: "Created from PATHZY Opportunities. Review and approve every application before sending."
          })
        });
        setSuccess(patch.applied ? "Application tracked. Keep going." : "Opportunity saved to your tracker.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update opportunity.");
      setOpportunities(initialOpportunities);
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[.34fr_1fr]">
      <Card className="h-fit">
        <h2 className="text-2xl font-black">Opportunity tracker</h2>
        <p className="mt-3 text-sm leading-6 text-white/58">Save matches, track applications, and complete preparation steps. These are sample opportunities for testing.</p>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-[18px] border border-white/10 bg-white/7 p-3"><p className="text-xs font-bold text-white/45">Saved</p><strong className="mt-1 block text-2xl font-black">{stats.saved}</strong></div>
          <div className="rounded-[18px] border border-white/10 bg-white/7 p-3"><p className="text-xs font-bold text-white/45">Applied</p><strong className="mt-1 block text-2xl font-black">{stats.applied}</strong></div>
          <div className="rounded-[18px] border border-white/10 bg-white/7 p-3"><p className="text-xs font-bold text-white/45">Done</p><strong className="mt-1 block text-2xl font-black">{stats.completed}</strong></div>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">
            <span>Completion</span>
            <span>{stats.progress}%</span>
          </div>
          <ProgressBar value={stats.progress} />
        </div>
        <div className="mt-6 grid gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-[18px] border px-4 py-3 text-left text-sm font-extrabold transition ${activeCategory === category ? "border-[#5B8CFF]/60 bg-[#5B8CFF]/16 text-white" : "border-white/10 bg-white/7 text-white/66 hover:bg-white/10"}`}
            >
              {category}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black">{sectionTitle(activeCategory)}</h2>
            <p className="mt-2 text-sm leading-6 text-white/58">Jobs for You, Internships for You, Learnerships for You, and Scholarships for You are ranked by fit, readiness, location, and skills.</p>
          </div>
          <span className="w-fit rounded-full bg-[#39d98a]/15 px-4 py-2 text-sm font-extrabold text-[#9df0c4]">{visibleOpportunities.length} visible</span>
        </div>
        {error ? <p className="mt-4 rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc5c5]">{error}</p> : null}
        {success ? <p className="mt-4 rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold text-[#b9f8d5]">{success}</p> : null}
        <div className="mt-5 grid gap-4">
          {visibleOpportunities.map((opportunity) => (
            <article key={opportunity.id} className="rounded-[22px] border border-white/10 bg-white/7 p-4 md:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#FFD166]/15 px-3 py-1 text-xs font-extrabold text-[#ffe2a3]">Sample opportunity for testing</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/60">{opportunity.category}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/60">{opportunity.mode}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/60">{opportunity.country}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-black">{opportunity.title}</h3>
                  <p className="mt-1 text-sm font-bold text-white/48">{opportunity.provider} - {opportunity.deadline}</p>
                </div>
                <span className="w-fit rounded-full blue-purple px-4 py-2 text-sm font-extrabold text-white">{opportunity.fit}% match</span>
              </div>
              <p className="mt-4 leading-7 text-white/64">{opportunity.description}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_.8fr]">
                <div className="rounded-[18px] border border-white/10 bg-black/10 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/40">Why it matches</p>
                  <ul className="mt-2 grid gap-1 text-sm leading-6 text-white/62">
                    {opportunity.reasons.map((reason) => <li key={reason}>- {reason}</li>)}
                  </ul>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-black/10 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/40">Preparation</p>
                  <p className="mt-2 font-bold text-white/72">{opportunity.outcome}</p>
                  <p className="mt-2 text-sm leading-6 text-white/52">Missing skills: {opportunity.skillTags.slice(0, 4).join(" - ")}</p>
                  <p className="mt-2 text-sm leading-6 text-white/52">Preparation time: 45-90 minutes</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button disabled={busyId === opportunity.id} onClick={() => updateAction(opportunity, { saved: !opportunity.action.saved })} className={`rounded-full px-4 py-2 text-sm font-extrabold ${opportunity.action.saved ? "bg-[#39d98a]/18 text-[#9df0c4]" : "bg-white/10 text-white/68"}`}>
                  {opportunity.action.saved ? "Saved" : "Save"}
                </button>
                <Link href={`/professional-identity/cv?role=${encodeURIComponent(opportunity.title)}&company=${encodeURIComponent(opportunity.provider)}`} className="rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/68 transition hover:bg-white/14">Prepare Application</Link>
                <button disabled={busyId === opportunity.id} onClick={() => updateAction(opportunity, { saved: true, applied: !opportunity.action.applied })} className={`rounded-full px-4 py-2 text-sm font-extrabold ${opportunity.action.applied ? "bg-[#5B8CFF]/22 text-[#c7d6ff]" : "bg-white/10 text-white/68"}`}>
                  {opportunity.action.applied ? "Applied" : "Mark as Applied"}
                </button>
                <Link href={`/employment-tracker?company=${encodeURIComponent(opportunity.provider)}&role=${encodeURIComponent(opportunity.title)}&type=${encodeURIComponent(opportunity.category)}`} className="rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/68 transition hover:bg-white/14">Track application</Link>
                <Link href={`/interview?role=${encodeURIComponent(opportunity.title)}&company=${encodeURIComponent(opportunity.provider)}`} className="rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/68 transition hover:bg-white/14">Practice Interview</Link>
                <Link href={`/professional-identity/cover-letter?role=${encodeURIComponent(opportunity.title)}&company=${encodeURIComponent(opportunity.provider)}`} className="rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/68 transition hover:bg-white/14">Cover letter</Link>
                <Link href={`/professional-identity/recruiter-message?role=${encodeURIComponent(opportunity.title)}&company=${encodeURIComponent(opportunity.provider)}`} className="rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/68 transition hover:bg-white/14">Recruiter message</Link>
                <button disabled={busyId === opportunity.id} onClick={() => updateAction(opportunity, { hidden: true })} className="rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/54">Hide</button>
              </div>
            </article>
          ))}
          {!visibleOpportunities.length ? (
            <div className="rounded-[22px] border border-white/10 bg-white/7 p-6 text-center text-white/58">
              No visible opportunities in this category. Switch filters or refresh after updating your Discovery answers.
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
