import { ProfessionalIdentityTool } from "@/components/professional-identity/professional-identity-tool";
import { PageHeader } from "@/components/ui";
import { canCurrentUserExportProfessionalDocuments, canCurrentUserUseProfessionalIdentityTools } from "@/lib/professional-identity/professional-identity-service";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function RecruiterMessagePage({ searchParams }: { searchParams?: Promise<{ role?: string; company?: string }> }) {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/recruiter-message");
  const unlocked = await canCurrentUserUseProfessionalIdentityTools(supabase, user.id);
  const canExport = await canCurrentUserExportProfessionalDocuments(supabase, user.id);
  const params = searchParams ? await searchParams : {};

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Professional Profile" title="Recruiter Message">
        Write a short, human message for LinkedIn, email, or WhatsApp outreach.
      </PageHeader>
      <ProfessionalIdentityTool
        tool="recruiter-message"
        title="Create recruiter outreach"
        description="Keep it relevant, respectful, and specific. PATHZY avoids spammy messages."
        trustNote="You review and send every message yourself."
        locked={!unlocked}
        exportLocked={!canExport}
        defaultOptions={{ role: params.role ?? "", company: params.company ?? "", platform: "LinkedIn", language: "english" }}
        fields={[
          { name: "recruiterName", label: "Recruiter name optional", placeholder: "Example: Amina" },
          { name: "company", label: "Company", placeholder: "Example: Andela" },
          { name: "role", label: "Role", placeholder: "Example: Frontend Intern" },
          { name: "platform", label: "Platform", type: "select", options: ["LinkedIn", "Email", "WhatsApp"] },
          { name: "tone", label: "Tone", type: "select", options: ["professional", "confident", "warm"] }
        ]}
      />
    </div>
  );
}
