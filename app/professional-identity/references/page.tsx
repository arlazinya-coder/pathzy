import { ReferencesClient } from "@/components/professional-identity/references-client";
import { PageHeader } from "@/components/ui";
import { canCurrentUserExportProfessionalDocuments } from "@/lib/professional-identity/professional-identity-service";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function ReferencesPage() {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/references");
  const [{ data: discovery }, canExport] = await Promise.all([
    supabase
      .from("discovery_responses")
      .select("answers")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    canCurrentUserExportProfessionalDocuments(supabase, user.id)
  ]);
  const answers = (discovery?.answers ?? {}) as Record<string, unknown>;

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Professional Profile" title="References">
        Prepare professional references separately from your CV so they can be shared only when appropriate.
      </PageHeader>
      <ReferencesClient initialReferences={typeof answers.references === "string" ? answers.references : ""} canExport={canExport} />
    </div>
  );
}
