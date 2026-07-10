import { ProfessionalIdentityTool } from "@/components/professional-identity/professional-identity-tool";
import { PageHeader } from "@/components/ui";
import { canCurrentUserExportProfessionalDocuments, canCurrentUserUseProfessionalIdentityTools } from "@/lib/professional-identity/professional-identity-service";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function FollowUpEmailPage() {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/follow-up-email");
  const unlocked = await canCurrentUserUseProfessionalIdentityTools(supabase, user.id);
  const canExport = await canCurrentUserExportProfessionalDocuments(supabase, user.id);

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Professional Profile" title="Follow-up Email">
        Generate a polite follow-up email and suggested follow-up date after submitting an application.
      </PageHeader>
      <ProfessionalIdentityTool
        tool="follow-up"
        title="Create follow-up email"
        description="Add application details and PATHZY will create a concise follow-up you can review before sending."
        trustNote="PATHZY does not auto-send emails. You approve and send manually."
        locked={!unlocked}
        exportLocked={!canExport}
        fields={[
          { name: "company", label: "Company", placeholder: "Example: Safaricom" },
          { name: "role", label: "Role", placeholder: "Example: Data Analyst Intern" },
          { name: "applicationDate", label: "Application date", type: "date" },
          { name: "recruiterName", label: "Recruiter name optional", placeholder: "Example: Daniel" }
        ]}
      />
    </div>
  );
}
