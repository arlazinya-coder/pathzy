import { ProfessionalIdentityTool } from "@/components/professional-identity/professional-identity-tool";
import { PageHeader } from "@/components/ui";
import { canCurrentUserExportProfessionalDocuments, canCurrentUserUseProfessionalIdentityTools, premiumDocumentTemplates } from "@/lib/professional-identity/professional-identity-service";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function ProfessionalCvPage() {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/cv");
  const unlocked = await canCurrentUserUseProfessionalIdentityTools(supabase, user.id);
  const canExport = await canCurrentUserExportProfessionalDocuments(supabase, user.id);
  const { data: discovery } = await supabase.from("discovery_responses").select("id").eq("user_id", user.id).limit(1).maybeSingle();

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Professional Profile" title="Create My CV">
        Build a clear CV draft using your PATHZY profile, career plan, skills, and Job Readiness context.
      </PageHeader>
      <ProfessionalIdentityTool
        tool="cv"
        title="Generate your CV"
        description="Choose the CV type that matches your current stage. PATHZY will ask for missing details through clear placeholders instead of inventing information."
        trustNote="PATHZY will not invent experience, education, or qualifications."
        locked={!unlocked}
        exportLocked={!canExport}
        guidance={!discovery ? {
          recommendation: "Complete Career Discovery first.",
          why: "You can build your CV now. Completing Career Discovery first may help PATHZY create a stronger CV.",
          impact: "+10 Job Readiness",
          followHref: "/discovery",
          followLabel: "Complete Discovery first",
          continueLabel: "Build CV now"
        } : null}
        defaultOptions={{ cvType: "Entry-Level CV", language: "english", templateName: "Modern ATS" }}
        fields={[
          { name: "cvType", label: "CV type", type: "select", options: ["Entry-Level CV", "Graduate CV", "Internship CV", "Career Change CV", "Professional CV"] }
        ]}
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {premiumDocumentTemplates.map((template) => (
          <div key={template.name} className="rounded-[18px] border border-white/10 bg-white/6 p-4">
            <div className="h-28 rounded-[14px] border border-white/10 p-3" style={{ background: template.thumbnail.background }}>
              <div className="h-3 w-16 rounded-full" style={{ background: template.thumbnail.accent }} />
              <div className="mt-4 grid gap-2">
                <div className="h-2 w-4/5 rounded-full bg-black/18" />
                <div className="h-2 w-3/5 rounded-full bg-black/14" />
                <div className="h-2 w-5/6 rounded-full bg-black/14" />
              </div>
              <div className={template.thumbnail.layout === "single" ? "mt-4 grid gap-1" : "mt-4 grid grid-cols-[.42fr_1fr] gap-2"}>
                <div className="h-10 rounded bg-black/10" />
                <div className="h-10 rounded bg-black/10" />
              </div>
            </div>
            <p className="mt-4 font-black">{template.name}</p>
            <p className="mt-2 text-xs leading-5 text-white/52">{template.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-extrabold text-white/70">
              <span className="rounded-full bg-white/8 px-3 py-2">ATS {template.atsRating}%</span>
              <span className="rounded-full bg-white/8 px-3 py-2">Recruiter {template.recruiterRating}%</span>
            </div>
            <p className="mt-3 text-xs font-bold leading-5 text-[#c7d6ff]">Best for: {template.bestFor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
