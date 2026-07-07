import { EmploymentTrackerClient } from "@/components/employment-tracker/employment-tracker-client";
import { PageHeader } from "@/components/ui";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function EmploymentTrackerPage() {
  const { user, supabase } = await requireAuthenticatedUser("/employment-tracker");
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
