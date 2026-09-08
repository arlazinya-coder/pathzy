import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/signup",
    "/auth/reset-password",
    "/auth/update-password",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/discovery/:path*",
    "/roadmap/:path*",
    "/missions/:path*",
    "/achievements/:path*",
    "/mentor/:path*",
    "/skills/:path*",
    "/progress/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/opportunities/:path*",
    "/applications/:path*",
    "/employment-center/:path*",
    "/professional-identity/:path*",
    "/cv-builder/:path*",
    "/employment-tracker/:path*",
    "/interview/:path*",
    "/profile/:path*",
    "/founding-members/:path*"
  ]
};
