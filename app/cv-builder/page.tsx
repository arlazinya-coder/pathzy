import { ProfessionalIdentityTool } from "@/components/professional-identity/professional-identity-tool";
import { PageHeader } from "@/components/ui";
import { canCurrentUserExportProfessionalDocuments, canCurrentUserUseProfessionalIdentityTools } from "@/lib/professional-identity/professional-identity-service";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function CvBuilderPage() {
  const { user, supabase } = await requireAuthenticatedUser("/cv-builder");
  const unlocked = await canCurrentUserUseProfessionalIdentityTools(supabase, user.id);
  const canExport = await canCurrentUserExportProfessionalDocuments(supabase, user.id);

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Professional Profile" title="Create My CV">
        PATHZY builds a CV from your profile, education, experience, skills, career goal, career plan, and saved career context.
      </PageHeader>
      <ProfessionalIdentityTool
        tool="cv"
        title="Generate your CV"
        description="Choose a CV type, generate a draft, preview it, edit it, save it to My Documents, and download a recruiter-ready PDF."
        trustNote="PATHZY will not invent experience, education, qualifications, projects, or references."
        locked={!unlocked}
        exportLocked={!canExport}
        defaultOptions={{ cvType: "Entry-Level CV", language: "english", templateName: "ATS Friendly" }}
        fields={[
          { name: "cvType", label: "CV type", type: "select", options: ["Entry-Level CV", "Graduate CV", "Internship CV", "Career Change CV", "Professional CV"] }
        ]}
      />
    </div>
  );
}
