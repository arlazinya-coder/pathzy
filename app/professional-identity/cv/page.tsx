import { ProfessionalIdentityTool } from "@/components/professional-identity/professional-identity-tool";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { PATHZY_ROUTES } from "@/lib/navigation/routes";
import { canCurrentUserExportProfessionalDocuments, canCurrentUserUseProfessionalIdentityTools } from "@/lib/professional-identity/professional-identity-service";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function ProfessionalCvPage() {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/cv");
  const unlocked = await canCurrentUserUseProfessionalIdentityTools(supabase, user.id);
  const canExport = await canCurrentUserExportProfessionalDocuments(supabase, user.id);
  const { data: discovery } = await supabase.from("discovery_responses").select("id").eq("user_id", user.id).limit(1).maybeSingle();

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Professional Profile" title="My CV">
        Build a clear CV draft using your PATHZY profile, career plan, skills, and Job Readiness context.
      </PageHeader>
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card className="flex h-full flex-col">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">MY CV</p>
          <h2 className="mt-3 text-2xl font-black">Build your professional CV</h2>
          <p className="mt-3 text-sm leading-6 text-white/62">
            Build a clear, professional CV draft using your PATHZY profile, career plan, skills and job readiness context.
          </p>
          <p className="mt-3 text-sm leading-6 text-white/52">
            PATHZY will prepare the first draft, and you can review, edit and improve it before downloading.
          </p>
        </Card>
        <Card className="flex h-full flex-col">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">NEXT STEP</p>
          <h2 className="mt-3 text-2xl font-black">Create your cover letter</h2>
          <p className="mt-3 text-sm leading-6 text-white/62">
            After creating your CV, you can create a professional cover letter tailored to the job you want to apply for.
          </p>
          <p className="mt-3 text-sm leading-6 text-white/52">
            PATHZY will use your professional profile, selected CV and job information to help you create it.
          </p>
          <div className="mt-5">
            <ButtonLink href={PATHZY_ROUTES.COVER_LETTER}>Build Cover Letter</ButtonLink>
          </div>
        </Card>
      </div>
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
    </div>
  );
}
