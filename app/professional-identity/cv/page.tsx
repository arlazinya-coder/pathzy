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
        defaultOptions={{ cvType: "Entry-Level CV", language: "english", templateName: "ATS Friendly" }}
        fields={[
          { name: "cvType", label: "CV type", type: "select", options: ["Entry-Level CV", "Graduate CV", "Internship CV", "Career Change CV", "Professional CV"] }
        ]}
      />
      <div className="mt-6 grid gap-3 md:grid-cols-5">
        {premiumDocumentTemplates.map((template) => (
          <div key={template.name} className="rounded-[18px] border border-white/10 bg-white/6 p-4">
            <p className="font-black">{template.name}</p>
            <p className="mt-2 text-xs leading-5 text-white/52">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
