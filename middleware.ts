import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const protectedRoutes = [
  "/dashboard",
  "/onboarding",
  "/discovery",
  "/roadmap",
  "/missions",
  "/achievements",
  "/mentor",
  "/cv-builder",
  "/progress",
  "/settings",
  "/opportunities",
  "/professional-identity",
  "/employment-tracker",
  "/interview",
  "/profile",
  "/founding-members"
];

const authRoutes = ["/login", "/register", "/signup", "/auth/reset-password", "/auth/update-password"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => path === route || path.startsWith(`${route}/`));
  const isAuthRoute = authRoutes.some((route) => path === route || path.startsWith(`${route}/`));
  let response = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!isProtected) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("message", "Please log in to continue.");
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
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
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("message", "Please log in to continue.");
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user && path !== "/auth/update-password") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
