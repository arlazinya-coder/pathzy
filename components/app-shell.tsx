import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { LanguageSelector, PathzyLanguageProvider } from "@/components/language/language-selector";
import { FloatingMentorButton } from "@/components/mentor/floating-mentor-button";
import { getUserEntitlements } from "@/lib/access/entitlements";
import { pathzyNavigationLabel, pathzyPhase2T, pathzyT } from "@/lib/language/pathzy-i18n";
import { getServerInterfaceLanguage } from "@/lib/language/server-language";
import { resolvePathzyNextRoute } from "@/lib/navigation/auth-routing";
import { appRoutes } from "@/lib/navigation/routes";
import { navigation } from "@/lib/pathzy-data";
import { getProfessionalIdentityReadModelSafe } from "@/lib/professional-identity/professional-identity-read-service";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";

type NavigationItem = { label: string; href: string };

function uniqueByHref<T extends NavigationItem>(items: readonly T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const supabase = user ? await createSupabaseServerClient() : null;
  const [entitlements, identityReadModel] = user && supabase
    ? await Promise.all([
        getUserEntitlements(supabase, user.id),
        getProfessionalIdentityReadModelSafe(supabase, user, "app shell identity")
      ])
    : [null, null];
  const journeyDecision = user
    ? resolvePathzyNextRoute({
        authenticated: true,
        profile: identityReadModel?.profile,
        discovery: identityReadModel?.discovery,
        user
      })
    : null;
  const profileLanguage = identityReadModel?.profile?.language ?? null;
  const interfaceLanguage = await getServerInterfaceLanguage(profileLanguage);
  const focusedOnboarding =
    Boolean(user) &&
    journeyDecision?.currentState !== "home_ready" &&
    journeyDecision?.currentState !== "diagnosis_complete";
  const loggedOutNavigation: NavigationItem[] = [
    { label: "Home", href: appRoutes.home },
    { label: "Pricing", href: appRoutes.pricing }
  ];
  const loggedInNavigation: NavigationItem[] = [...navigation];
  const focusedNavigation: NavigationItem[] = [];
  const primaryNavigation = uniqueByHref(user ? (focusedOnboarding ? focusedNavigation : loggedInNavigation) : loggedOutNavigation);
  const mobileNavigation = uniqueByHref(user ? (focusedOnboarding ? focusedNavigation : loggedInNavigation) : loggedOutNavigation);

  return (
    <PathzyLanguageProvider initialLanguage={interfaceLanguage}>
    <div className="pathzy-page-shell pathzy-auth-shell">
      <header className="sticky top-0 z-40 border-b border-[var(--border-default)] bg-[color-mix(in_srgb,var(--background-elevated)_92%,transparent)] backdrop-blur-2xl">
        <nav className="container flex min-h-20 items-center justify-between gap-4">
          <Link href={user ? appRoutes.roadmap : appRoutes.home} className="flex items-center gap-3 text-lg font-black tracking-tight text-white">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--pathzy-red)] text-white shadow-[0_14px_34px_rgba(217,58,70,.22)]">
              P
            </span>
            <span>PATHZY</span>
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            {primaryNavigation.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                {pathzyNavigationLabel(interfaceLanguage, item.label)}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <LanguageSelector initialLanguage={profileLanguage} />
                {entitlements?.badge === "FOUNDING TESTER" ? (
                  <span className="hidden rounded-full border border-[rgba(217,58,70,.28)] bg-[rgba(217,58,70,.12)] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--pathzy-ivory)] md:inline-flex" title={entitlements.message ?? undefined}>
                    FOUNDING TESTER
                  </span>
                ) : null}
                {!focusedOnboarding ? (
                <Link href={appRoutes.roadmap} className="hidden rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white/78 shadow-sm transition hover:bg-white/12 hover:text-white sm:inline-flex">
                    {pathzyNavigationLabel(interfaceLanguage, "Home")}
                  </Link>
                ) : (
                  <span className="hidden rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white/72 sm:inline-flex">{pathzyPhase2T(interfaceLanguage, "app.shell.setupInProgress")}</span>
                )}
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href={appRoutes.login} className="hidden rounded-full px-4 py-2 text-sm font-semibold text-white/72 transition hover:text-white sm:inline-flex">
                  {pathzyT(interfaceLanguage, "public.nav.login")}
                </Link>
                <Link href={appRoutes.signup} className="rounded-full bg-[var(--pathzy-red)] px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_34px_rgba(217,58,70,.22)]">
                  {pathzyT(interfaceLanguage, "public.nav.start")}
                </Link>
              </>
            )}
          </div>
        </nav>
        {mobileNavigation.length ? <div className="container flex flex-wrap gap-2 pb-3 lg:hidden">
          {mobileNavigation.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href} className="min-h-10 min-w-0 rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold leading-5 text-white/72 shadow-sm [overflow-wrap:anywhere]">
              {pathzyNavigationLabel(interfaceLanguage, item.label)}
            </Link>
          ))}
        </div> : null}
      </header>
      {user && !focusedOnboarding ? <FloatingMentorButton /> : null}
      <main>{children}</main>
      <footer className="container border-t border-white/10 py-8 text-center text-sm text-white/58">
        <p>{pathzyPhase2T(interfaceLanguage, "app.shell.tagline")}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Link href="/privacy" className="hover:text-[var(--pathzy-ivory)]">{pathzyPhase2T(interfaceLanguage, "public.footer.privacy")}</Link>
          <Link href="/terms" className="hover:text-[var(--pathzy-ivory)]">{pathzyPhase2T(interfaceLanguage, "public.footer.terms")}</Link>
          <Link href="/contact" className="hover:text-[var(--pathzy-ivory)]">{pathzyPhase2T(interfaceLanguage, "public.footer.contact")}</Link>
          <Link href="/disclaimer" className="hover:text-[var(--pathzy-ivory)]">{pathzyPhase2T(interfaceLanguage, "public.footer.disclaimer")}</Link>
        </div>
      </footer>
    </div>
    </PathzyLanguageProvider>
  );
}
