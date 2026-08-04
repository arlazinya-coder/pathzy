import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeSupportedLanguage } from "@/lib/language/language-preferences";
import { withEmploymentDiagnosisRecordType, type DiscoveryCompatibilityRow } from "@/lib/professional-identity/professional-identity-discovery-compatibility";
import { createEmploymentDiagnosisSession, normalizeEmploymentDiagnosisSession } from "./adaptive-question-engine";
import type { EmploymentDiagnosisResult, EmploymentDiagnosisSession } from "./diagnosis-models";
import { EMPLOYMENT_DIAGNOSIS_ENGINE_VERSION_3D } from "./diagnosis-version";

type DiagnosisRow = DiscoveryCompatibilityRow & { id?: string | null };

function newestDiagnosisRow(rows: DiagnosisRow[]) {
  return rows
    .filter((row) => row.answers?._pathzy_record_type === "employment_diagnosis" || row.answers?.employment_diagnosis_session)
    .sort((a, b) => Date.parse(b.created_at ?? "") - Date.parse(a.created_at ?? ""))[0] ?? null;
}

export async function loadDiagnosisRows(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("discovery_responses")
    .select("id,answers,generated_result,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
}

export async function loadOrCreateDiagnosisSession(args: {
  supabase: SupabaseClient;
  userId: string;
  countryContextVersion: string;
  inputSnapshotVersion: string;
  language?: string | null;
}) {
  const { data, error } = await loadDiagnosisRows(args.supabase, args.userId);
  if (error) return { session: null, rowId: null, error };

  const fallback = createEmploymentDiagnosisSession({
    userId: args.userId,
    inputSnapshotVersion: args.inputSnapshotVersion,
    countryContextVersion: args.countryContextVersion,
    interfaceLanguage: normalizeSupportedLanguage(args.language)
  });
  const row = newestDiagnosisRow((data ?? []) as DiagnosisRow[]);
  const rawSession = row?.answers?.employment_diagnosis_session;
  const session = normalizeEmploymentDiagnosisSession(rawSession, fallback);
  return { session, rowId: row?.id ?? null, error: null };
}

export async function saveDiagnosisSession(args: {
  supabase: SupabaseClient;
  userId: string;
  rowId?: string | null;
  session: EmploymentDiagnosisSession;
  result?: EmploymentDiagnosisResult | null;
}) {
  const answers = withEmploymentDiagnosisRecordType({
    employment_diagnosis_status: args.session.status === "COMPLETED" ? "complete" : "in_progress",
    employment_diagnosis_completed: args.session.status === "COMPLETED",
    diagnosis_completed: args.session.status === "COMPLETED",
    pathzy_onboarding_state: args.session.status === "COMPLETED" ? "diagnosis_completed" : "setup_completed",
    ...(args.session.status === "COMPLETED" ? { pathzy_onboarding_diagnosis_completed: true, employment_diagnosis_completed_at: args.session.completedAt ?? new Date().toISOString() } : {}),
    employment_diagnosis_session: args.session,
    employment_diagnosis_result: args.result ?? null,
    employment_diagnosis_engine_version: EMPLOYMENT_DIAGNOSIS_ENGINE_VERSION_3D
  });
  const payload = { answers, generated_result: args.result ?? {} };

  if (args.rowId) {
    return args.supabase.from("discovery_responses").update(payload).eq("id", args.rowId).eq("user_id", args.userId);
  }

  return args.supabase.from("discovery_responses").insert({
    user_id: args.userId,
    ...payload
  });
}
