import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfigStatus, supabaseAnonKey, supabaseConfigurationMessage, supabaseUrl } from "@/lib/supabase/config";
export { isSupabaseConfigured } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

const AUTH_FETCH_TIMEOUT_MS = 15_000;

function authNetworkFailureResponse() {
  return new Response(
    JSON.stringify({
      error: "pathzy_auth_network_unavailable",
      error_description: "PATHZY authentication network unavailable."
    }),
    {
      status: 503,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}

function isAuthFetchNetworkFailure(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network error") ||
    message.includes("fetch failed") ||
    message.includes("load failed")
  );
}

export function createPathzyAuthFetch(fetcher: typeof fetch = fetch) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), AUTH_FETCH_TIMEOUT_MS);
    const callerSignal = init?.signal;
    const abortFromCaller = () => controller.abort(callerSignal?.reason);

    if (callerSignal?.aborted) {
      abortFromCaller();
    } else {
      callerSignal?.addEventListener("abort", abortFromCaller, { once: true });
    }

    try {
      return await fetcher(input, { ...init, signal: controller.signal });
    } catch (error) {
      if (isAuthFetchNetworkFailure(error)) return authNetworkFailureResponse();
      throw error;
    } finally {
      globalThis.clearTimeout(timeout);
      callerSignal?.removeEventListener("abort", abortFromCaller);
    }
  };
}

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
      },
      global: {
        fetch: createPathzyAuthFetch()
      }
    });
  }

  return browserClient;
}
