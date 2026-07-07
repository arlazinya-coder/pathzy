import { ProfessionalIdentityTool } from "@/components/professional-identity/professional-identity-tool";
import { PageHeader } from "@/components/ui";
import { canCurrentUserExportProfessionalDocuments, canCurrentUserUseProfessionalIdentityTools, getProfessionalIdentityContext, premiumDocumentTemplates } from "@/lib/professional-identity/professional-identity-service";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function CoverLetterPage({ searchParams }: { searchParams?: Promise<{ role?: string; company?: string }> }) {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/cover-letter");
  const unlocked = await canCurrentUserUseProfessionalIdentityTools(supabase, user.id);
  const canExport = await canCurrentUserExportProfessionalDocuments(supabase, user.id);
  const context = await getProfessionalIdentityContext(supabase, user.id);
  const params = searchParams ? await searchParams : {};
  const hasCv = Boolean(context && context.identity.cv_status !== "not_started");

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Professional Profile" title="Create My Cover Letter">
        Generate a concise, honest, role-specific cover letter that users can review before sending.
      </PageHeader>
      <ProfessionalIdentityTool
        tool="cover-letter"
        title="Create your cover letter"
        description="Add the company and role. Paste a job description when you want the draft tailored to a real opportunity."
        trustNote="PATHZY strengthens your wording but does not add experience you do not have."
        locked={!unlocked}
        exportLocked={!canExport}
        guidance={!hasCv ? {
          recommendation: "Build your CV first.",
          why: "A CV gives PATHZY stronger facts for your cover letter, but you can still create a draft now.",
          impact: "+8 Job Readiness",
          followHref: "/professional-identity/cv",
          followLabel: "Build CV first",
          continueLabel: "Continue with cover letter"
        } : null}
        defaultOptions={{ role: params.role ?? "", company: params.company ?? "", language: "english", templateName: "ATS Friendly" }}
        fields={[
          { name: "company", label: "Company", placeholder: "Example: Flutterwave" },
          { name: "role", label: "Role", placeholder: "Example: Junior Product Designer" },
          { name: "jobDescription", label: "Job description optional", type: "textarea", placeholder: "Paste the job description here" },
          { name: "tone", label: "Tone", type: "select", options: ["professional", "confident", "warm"] }
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
