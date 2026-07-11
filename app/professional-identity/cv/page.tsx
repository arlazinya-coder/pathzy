import { ProfessionalIdentityTool } from "@/components/professional-identity/professional-identity-tool";
import { TemplateMiniPreview } from "@/components/professional-identity/template-mini-preview";
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
      <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {premiumDocumentTemplates.map((template) => (
          <div key={template.name} className="flex flex-col rounded-[20px] border border-white/10 bg-white/6 p-4">
            <TemplateMiniPreview template={template} />
            <p className="mt-4 text-base font-black leading-5">{template.name}</p>
            <p className="mt-2 flex-1 text-xs leading-5 text-white/52">{template.description}</p>
            <p className="mt-3 text-xs font-bold leading-5 text-[#c7d6ff]">Best for: {template.bestFor}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white/70">
              <span className="rounded-full bg-white/8 px-2.5 py-1.5">{template.atsCharacteristic}</span>
              <span className="rounded-full bg-white/8 px-2.5 py-1.5">{template.recruiterCharacteristic}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
