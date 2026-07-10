import { EmploymentTrackerClient } from "@/components/employment-tracker/employment-tracker-client";
import { PageHeader } from "@/components/ui";
import { appRoutes } from "@/lib/navigation/routes";
import { requireAuthenticatedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function EmploymentTrackerPage({ redirectTo = appRoutes.applications }: { redirectTo?: string } = {}) {
  const { user, supabase } = await requireAuthenticatedUser(redirectTo);
  const { data: applications } = await supabase.from("employment_applications").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="My Applications" title="Track every application clearly.">
        Save roles, mark applications, prepare follow-ups, and see interviews and offers flow back into your journey.
      </PageHeader>
      <EmploymentTrackerClient initialApplications={(applications ?? []) as never[]} />
    </div>
  );
}

export default function LegacyEmploymentTrackerRedirect() {
  redirect(appRoutes.applications);
}
