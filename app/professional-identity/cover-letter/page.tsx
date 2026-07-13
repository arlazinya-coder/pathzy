import { ProfessionalIdentityTool } from "@/components/professional-identity/professional-identity-tool";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { PATHZY_ROUTES } from "@/lib/navigation/routes";
import { canCurrentUserExportProfessionalDocuments, canCurrentUserUseProfessionalIdentityTools, getProfessionalIdentityContext } from "@/lib/professional-identity/professional-identity-service";
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
      <PageHeader eyebrow="My Professional Profile" title="My Cover Letter">
        Build a professional cover letter using your PATHZY profile, CV and career direction.
      </PageHeader>
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card className="flex h-full flex-col">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">MY COVER LETTER</p>
          <h2 className="mt-3 text-2xl font-black">Build your professional cover letter</h2>
          <p className="mt-3 text-sm leading-6 text-white/62">
            Create a clear cover letter tailored to the role you want to apply for.
          </p>
          <p className="mt-3 text-sm leading-6 text-white/52">
            PATHZY will prepare your first draft for you to review and improve.
          </p>
        </Card>
        <Card className="flex h-full flex-col">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">NEXT STEP</p>
          <h2 className="mt-3 text-2xl font-black">Optimise your LinkedIn</h2>
          <p className="mt-3 text-sm leading-6 text-white/62">
            Strengthen how recruiters see your professional profile online.
          </p>
          <p className="mt-3 text-sm leading-6 text-white/52">
            PATHZY will use your profile and CV to help guide your LinkedIn profile.
          </p>
          <div className="mt-5">
            <ButtonLink href={PATHZY_ROUTES.LINKEDIN_OPTIMIZER}>Optimise LinkedIn</ButtonLink>
          </div>
        </Card>
      </div>
      <ProfessionalIdentityTool
        tool="cover-letter"
        title="Generate your cover letter"
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
        defaultOptions={{ role: params.role ?? "", company: params.company ?? "", language: "english", templateName: "Modern ATS" }}
        fields={[
          { name: "company", label: "Company", placeholder: "Example: Flutterwave" },
          { name: "role", label: "Role", placeholder: "Example: Junior Product Designer" },
          { name: "jobDescription", label: "Job description optional", type: "textarea", placeholder: "Paste the job description here" },
          { name: "tone", label: "Tone", type: "select", options: ["professional", "confident", "warm"] }
        ]}
      />
    </div>
  );
}
