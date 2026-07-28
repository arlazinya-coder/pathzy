import { appRoutes } from "@/lib/navigation/routes";
import { requireAuthenticatedUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const { user, supabase } = await requireAuthenticatedUser(appRoutes.onboarding);
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("onboarding_completed")
    .or(`user_id.eq.${user.id},id.eq.${user.id}`)
    .maybeSingle();

  redirect(profile?.onboarding_completed ? appRoutes.authenticatedHome : appRoutes.professionalIdentity);
}
