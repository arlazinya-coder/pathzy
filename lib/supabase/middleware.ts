import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { appRoutes, isAuthRoute, isProtectedRoute } from "@/lib/navigation/routes";
import { redirectToLogin } from "@/lib/navigation/redirects";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = isProtectedRoute(path);
  const isAuthPage = isAuthRoute(path);
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    if (isProtected) {
      return NextResponse.redirect(new URL(redirectToLogin(path), request.url));
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
    return NextResponse.redirect(new URL(redirectToLogin(path), request.url));
  }

  if (isAuthPage && user && path !== appRoutes.authUpdatePassword) {
    const url = request.nextUrl.clone();
    url.pathname = appRoutes.dashboard;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
