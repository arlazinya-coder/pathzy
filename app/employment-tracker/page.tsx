import { EmploymentTrackerClient } from "@/components/employment-tracker/employment-tracker-client";
import { PageHeader } from "@/components/ui";
import { appRoutes } from "@/lib/navigation/routes";
import { requireAuthenticatedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function EmploymentTrackerPage({ redirectTo = appRoutes.applications }: { redirectTo?: string } = {}) {
  const { user, supabase } = await requireAuthenticatedUser(redirectTo);
  const [{ data: applications }, { data: supportingDocuments }, { data: timelineEvents }] = await Promise.all([
    supabase.from("employment_applications").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase
      .from("user_documents")
      .select("id, document_title, document_type, status, updated_at")
      .eq("user_id", user.id)
      .in("document_type", ["supporting_document", "certification", "licence", "uploaded_document", "career_passport"])
      .order("updated_at", { ascending: false })
      .limit(30),
    supabase
      .from("application_timeline_events")
      .select("id, application_id, event_type, from_status, to_status, note, event_at")
      .eq("user_id", user.id)
      .order("event_at", { ascending: false })
      .limit(200)
  ]);

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Applications" title="Track every application clearly.">
        Save roles, mark applications, prepare follow-ups, and see interviews and offers flow back into your journey.
      </PageHeader>
      <EmploymentTrackerClient initialApplications={(applications ?? []) as never[]} supportingDocuments={(supportingDocuments ?? []) as never[]} timelineEvents={(timelineEvents ?? []) as never[]} />
    </div>
  );
}

export default function LegacyEmploymentTrackerRedirect() {
  redirect(appRoutes.applications);
}
