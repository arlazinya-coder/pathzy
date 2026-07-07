import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { PageHeader } from "@/components/ui";
import { requireAuthenticatedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const { user, supabase } = await requireAuthenticatedUser("/onboarding");
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("current_status,country,city,language,highest_qualification,education,field_of_study,currently_studying,institution,graduation_year,career_goal,preferred_path,has_cv,has_cover_letter,has_linkedin,has_applied_before,has_interviewed_before,has_certificates,starting_from_zero,onboarding_completed,onboarding_step")
    .or(`user_id.eq.${user.id},id.eq.${user.id}`)
    .maybeSingle();

  if (profile?.onboarding_completed) redirect("/dashboard");

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Career Discovery" title="Build a profile that can guide your future.">
        Complete five quick steps so PATHZY can create your first direction, Job Readiness score, and today&apos;s next action.
      </PageHeader>
      <OnboardingFlow initialProfile={profile} />
    </div>
  );
}
