import { NextResponse } from "next/server";
import { ensureUserDefaults } from "@/lib/auth/bootstrap";
import { getPostAuthDestination } from "@/lib/navigation/auth-routing";
import { appRoutes, PATHZY_ROUTES, safeRedirectDestination } from "@/lib/navigation/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const rawNext = requestUrl.searchParams.get("next");
  const next = rawNext?.startsWith(appRoutes.authUpdatePassword) ? appRoutes.authUpdatePassword : safeRedirectDestination(rawNext, PATHZY_ROUTES.HOME);
  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = (await supabase?.auth.exchangeCodeForSession(code)) ?? { error: new Error("Auth callback unavailable.") };
    if (error) {
      const url = new URL(PATHZY_ROUTES.LOGIN, requestUrl.origin);
      url.searchParams.set("message", "We could not confirm your login link. Please log in manually.");
      return NextResponse.redirect(url);
    }

    if (supabase) {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        try {
          await ensureUserDefaults(supabase, user);
        } catch (error) {
          console.error("[auth-callback] user default setup failed", error);
        }
      }
    }
  } else if (tokenHash && type) {
    const { error } =
      (await supabase?.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as "signup" | "email" | "recovery" | "invite" | "magiclink" | "email_change"
      })) ?? { error: new Error("Auth callback unavailable.") };

    if (error) {
      const url = new URL(PATHZY_ROUTES.LOGIN, requestUrl.origin);
      url.searchParams.set("message", "We could not confirm your login link. Please log in manually.");
      return NextResponse.redirect(url);
    }

    if (supabase) {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        try {
          await ensureUserDefaults(supabase, user);
        } catch (error) {
          console.error("[auth-callback] user default setup failed", error);
        }
      }
    }
  }

  const {
    data: { session }
  } = (await supabase?.auth.getSession()) ?? { data: { session: null } };

  if (!session) {
    const url = new URL(PATHZY_ROUTES.LOGIN, requestUrl.origin);
    url.searchParams.set("message", "Please log in to continue.");
    url.searchParams.set("redirectTo", safeRedirectDestination(next, PATHZY_ROUTES.HOME));
    return NextResponse.redirect(url);
  }

  if (next.startsWith(appRoutes.authUpdatePassword)) {
    return NextResponse.redirect(new URL(appRoutes.authUpdatePassword, requestUrl.origin));
  }

  const destination = await getPostAuthDestination(supabase!, session.user, next);
  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
