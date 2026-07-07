import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { FloatingMentorButton } from "@/components/mentor/floating-mentor-button";
import { appRoutes } from "@/lib/navigation/routes";
import { navigation } from "@/lib/pathzy-data";
import { getCurrentUser } from "@/lib/supabase/server";

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
  const loggedOutNavigation: NavigationItem[] = [
    { label: "Home", href: appRoutes.home },
    { label: "Pricing", href: appRoutes.pricing }
  ];
  const loggedInNavigation: NavigationItem[] = [
    { label: "My Employment Journey", href: appRoutes.roadmap },
    ...navigation.filter((item) => item.href !== appRoutes.home && item.href !== appRoutes.roadmap)
  ];
  const primaryNavigation = uniqueByHref(user ? loggedInNavigation : loggedOutNavigation);
  const mobileNavigation = uniqueByHref(user ? loggedInNavigation : loggedOutNavigation);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050816]/78 backdrop-blur-2xl">
        <nav className="container flex min-h-20 items-center justify-between gap-4">
          <Link href={user ? appRoutes.roadmap : appRoutes.home} className="flex items-center gap-3 font-extrabold tracking-wide">
            <span className="grid h-11 w-11 place-items-center rounded-2xl blue-purple shadow-[0_18px_48px_rgba(91,140,255,.35)]">
              P
            </span>
            <span>PATHZY</span>
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            {primaryNavigation.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-bold text-white/68 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href={appRoutes.login} className="hidden rounded-full px-4 py-2 text-sm font-bold text-white/70 transition hover:text-white sm:inline-flex">
                  Login
                </Link>
                <Link href={appRoutes.signup} className="rounded-full blue-purple px-5 py-3 text-sm font-extrabold shadow-[0_14px_34px_rgba(91,140,255,.28)]">
                  Start Free
                </Link>
              </>
            )}
          </div>
        </nav>
        <div className="container flex gap-2 overflow-x-auto pb-3 lg:hidden">
          {mobileNavigation.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href} className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/72">
              {item.label}
            </Link>
          ))}
        </div>
      </header>
      {user ? <FloatingMentorButton /> : null}
      <main>{children}</main>
      <footer className="container border-t border-white/10 py-8 text-center text-sm text-white/48">
        <p>PATHZY is The Employment Support System. From Potential to Employment.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
          <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
        </div>
      </footer>
    </>
  );
}
