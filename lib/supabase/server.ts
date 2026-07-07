import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot always write cookies. Middleware handles refreshes.
        }
      }
    }
  });
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getCurrentSession() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function requireAuthenticatedUser(redirectTo = "/dashboard") {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect(`/login?message=${encodeURIComponent("Please log in to continue.")}&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(`/login?message=${encodeURIComponent("Please log in to continue.")}&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return { supabase, user };
}
