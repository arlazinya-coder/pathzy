import { ProfessionalIdentityTool } from "@/components/professional-identity/professional-identity-tool";
import { PageHeader } from "@/components/ui";
import { canCurrentUserExportProfessionalDocuments, canCurrentUserUseProfessionalIdentityTools, getProfessionalIdentityContext } from "@/lib/professional-identity/professional-identity-service";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function CareerPassportPage() {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/career-passport");
  const unlocked = await canCurrentUserUseProfessionalIdentityTools(supabase, user.id);
  const canExport = await canCurrentUserExportProfessionalDocuments(supabase, user.id);
  const context = await getProfessionalIdentityContext(supabase, user.id);
  const hasCv = Boolean(context.identity.cv_status !== "not_started");

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Professional Profile" title="Career Passport">
        Create the foundation for a Career Passport: goal, readiness, skills, strengths, projects, achievements, focus, and next action.
      </PageHeader>
      <ProfessionalIdentityTool
        tool="career-passport"
        title="Create your Career Passport"
        description="PATHZY summarizes your current professional identity from saved data. This is not the full Career Passport yet."
        trustNote="Add only real projects, achievements, education, and experience before sharing."
        locked={!unlocked}
        exportLocked={!canExport}
        guidance={!hasCv ? {
          recommendation: "Build your CV first.",
          why: "A CV gives your Career Passport stronger facts, but you can still create a first summary now.",
          impact: "+8 Job Readiness",
          followHref: "/professional-identity/cv",
          followLabel: "Build CV first",
          continueLabel: "Create Passport now"
        } : null}
        fields={[]}
      />
    </div>
  );
}
