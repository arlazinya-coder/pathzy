import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPostAuthDestination } from "@/lib/navigation/auth-routing";
import { appRoutes, isAuthRoute, isProtectedRoute } from "@/lib/navigation/routes";
import { redirectToLogin } from "@/lib/navigation/redirects";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const intendedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const isProtected = isProtectedRoute(path);
  const isAuthPage = isAuthRoute(path);
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    if (isProtected) {
      return NextResponse.redirect(new URL(redirectToLogin(intendedPath), request.url));
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    return NextResponse.redirect(new URL(redirectToLogin(intendedPath), request.url));
  }

  if (isProtected && user && path !== appRoutes.professionalIdentity) {
    const destination = await getPostAuthDestination(supabase, user, intendedPath);
    if (destination !== intendedPath) {
      const destinationUrl = new URL(destination, request.url);
      const url = request.nextUrl.clone();
      url.pathname = destinationUrl.pathname;
      url.search = destinationUrl.search;
      url.hash = destinationUrl.hash;
      return NextResponse.redirect(url);
    }
  }

  if (isAuthPage && user && path !== appRoutes.authUpdatePassword) {
    const url = request.nextUrl.clone();
    const destination = await getPostAuthDestination(supabase, user, appRoutes.authenticatedHome);
    const destinationUrl = new URL(destination, request.url);
    url.pathname = destinationUrl.pathname;
    url.search = destinationUrl.search;
    url.hash = destinationUrl.hash;
    return NextResponse.redirect(url);
  }

  return response;
}
