import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfigStatus, supabaseAnonKey, supabaseConfigurationMessage, supabaseUrl } from "@/lib/supabase/config";
export { isSupabaseConfigured } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  const status = getSupabasePublicConfigStatus();
  if (!status.configured || !supabaseUrl || !supabaseAnonKey) {
    throw new Error(supabaseConfigurationMessage(status));
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  return browserClient;
}
