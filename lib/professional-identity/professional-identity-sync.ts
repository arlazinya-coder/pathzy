import type { SupabaseClient } from "@supabase/supabase-js";
import { updatePathzyBrain } from "@/lib/pathzy-brain/brain-service";

export type ProfessionalIdentitySyncMode = "autosave" | "navigation" | "completion" | "diagnosis";

export async function syncProfessionalIdentityAfterWrite(
  supabase: SupabaseClient,
  userId: string,
  options: { mode?: ProfessionalIdentitySyncMode; reason: string }
) {
  if (options.mode === "autosave") return { skipped: true };

  try {
    await updatePathzyBrain(supabase, userId, options.reason);
    return { skipped: false, ok: true };
  } catch (error) {
    console.warn("[professional-identity:sync] Post-write sync unavailable", {
      reason: options.reason,
      message: error instanceof Error ? error.message : "unknown"
    });
    return { skipped: false, ok: false };
  }
}
