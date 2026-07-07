import { ProfessionalIdentityTool } from "@/components/professional-identity/professional-identity-tool";
import { PageHeader } from "@/components/ui";
import { canCurrentUserExportProfessionalDocuments, canCurrentUserUseProfessionalIdentityTools, getProfessionalIdentityContext } from "@/lib/professional-identity/professional-identity-service";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function LinkedinPage() {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/linkedin");
  const unlocked = await canCurrentUserUseProfessionalIdentityTools(supabase, user.id);
  const canExport = await canCurrentUserExportProfessionalDocuments(supabase, user.id);
  const context = await getProfessionalIdentityContext(supabase, user.id);
  const hasCareerDirection = Boolean(context.score.categoryScores.career_clarity);

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Professional Profile" title="Improve My LinkedIn">
        Create a stronger headline, About section, skills list, experience summary, and profile checklist.
      </PageHeader>
      <ProfessionalIdentityTool
        tool="linkedin"
        title="Improve your LinkedIn"
        description="PATHZY creates copy-and-apply suggestions. You stay in control of your LinkedIn account."
        trustNote="PATHZY does not log into LinkedIn. You copy and apply suggestions yourself."
        locked={!unlocked}
        exportLocked={!canExport}
        guidance={!hasCareerDirection ? {
          recommendation: "Choose a career direction first.",
          why: "You can improve LinkedIn now. A clear career direction helps PATHZY suggest stronger headline and About wording.",
          impact: "+7 Job Readiness",
          followHref: "/roadmap",
          followLabel: "Choose direction first",
          continueLabel: "Improve LinkedIn now"
        } : null}
        fields={[]}
      />
    </div>
  );
}
