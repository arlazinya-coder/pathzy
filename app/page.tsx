import { PathzyLanguageProvider } from "@/components/language/language-selector";
import { LandingContent } from "@/components/public/landing-content";
import { getServerInterfaceLanguage } from "@/lib/language/server-language";
import { PATHZY_ROUTES } from "@/lib/navigation/routes";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function LandingPage() {
  const user = await getCurrentUser();
  const initialLanguage = await getServerInterfaceLanguage();
  const startHref = user ? PATHZY_ROUTES.MY_EMPLOYMENT_JOURNEY : PATHZY_ROUTES.SIGNUP;
  const loginHref = user ? PATHZY_ROUTES.MY_EMPLOYMENT_JOURNEY : PATHZY_ROUTES.LOGIN;

  return (
    <PathzyLanguageProvider initialLanguage={initialLanguage}>
      <LandingContent startHref={startHref} loginHref={loginHref} />
    </PathzyLanguageProvider>
  );
}
