import type { SupabaseClient, User } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { selectEmploymentDiagnosisDiscoveryRow } from "@/lib/professional-identity/professional-identity-discovery-compatibility";
import { getProfessionalIdentityReadModelSafe } from "@/lib/professional-identity/professional-identity-read-service";
import {
  buildEmploymentDiagnosisResult,
  loadDiagnosisRows,
  mapDiagnosisToEmploymentIntelligenceInput,
  normalizeEmploymentDiagnosisSession,
  resolveCountryEmploymentContext
} from "../engine";
import type { EmploymentDiagnosisResult, EmploymentDiagnosisSession } from "../diagnosis";
import { generateEmploymentIntelligenceWithTrace } from "../engine";
import { EMPLOYMENT_ACTION_ENGINE_VERSION_3E } from "../actions";
import type { InputSnapshotReference } from "../persistence/persistence-models";
import { deterministicInputHash } from "../persistence/versioning";

function countryCodeFromIdentity(values: Record<string, unknown>) {
  const country = values.country;
  return typeof country === "string" && country.trim() ? country : "GENERIC";
}

function extractDiagnosis(row: { answers?: Record<string, unknown> | null; generated_result?: unknown } | null) {
  const answers = row?.answers ?? {};
  const session = answers.employment_diagnosis_session as EmploymentDiagnosisSession | undefined;
  const result = (answers.employment_diagnosis_result ?? row?.generated_result) as EmploymentDiagnosisResult | null | undefined;
  return { session: session ?? null, result: result ?? null };
}

export async function buildEmploymentIntelligenceInputs(supabase: SupabaseClient, user: Pick<User, "id" | "email">) {
  const identity = await getProfessionalIdentityReadModelSafe(supabase, user, "employment intelligence recompute");
  const { data, error } = await loadDiagnosisRows(supabase, user.id);
  if (error) throw error;
  const diagnosisRow = selectEmploymentDiagnosisDiscoveryRow((data ?? []) as never[]);
  const { session, result: savedResult } = extractDiagnosis(diagnosisRow);
  if (!session) throw new Error("DIAGNOSIS_UNAVAILABLE");
  const normalizedSession = normalizeEmploymentDiagnosisSession(session, session);
  const result = savedResult ?? buildEmploymentDiagnosisResult(normalizedSession);
  const country = resolveCountryEmploymentContext({ countryCode: countryCodeFromIdentity(identity.values as Record<string, unknown>) }).context;
  const intelligenceInput = mapDiagnosisToEmploymentIntelligenceInput({
    userId: user.id,
    professionalIdentity: identity.values as Record<string, unknown>,
    session: normalizedSession,
    result,
    countryCode: country.countryCode
  });
  const sanitizedSnapshot = {
    identityVersion: String(identity.profile?.updated_at ?? identity.completion.percentage ?? "identity.unknown"),
    diagnosisVersion: result.diagnosisVersion,
    diagnosisStatus: result.diagnosisStatus,
    diagnosisSummaryCodes: result.summaryCodes,
    countryCode: country.countryCode,
    countryContextVersion: country.version,
    inputSnapshotVersion: intelligenceInput.inputSnapshotVersion
  };
  const inputSnapshotHash = deterministicInputHash(sanitizedSnapshot);
  const snapshot: InputSnapshotReference = {
    userId: user.id,
    inputSnapshotVersion: intelligenceInput.inputSnapshotVersion,
    inputSnapshotHash,
    identityVersion: sanitizedSnapshot.identityVersion,
    diagnosisVersion: result.diagnosisVersion,
    countryCode: country.countryCode,
    countryContextVersion: country.version,
    engineVersion: "",
    actionEngineVersion: EMPLOYMENT_ACTION_ENGINE_VERSION_3E,
    careerPlanVersion: EMPLOYMENT_ACTION_ENGINE_VERSION_3E
  };
  return { identity, session: normalizedSession, diagnosisResult: result, country, intelligenceInput, snapshot };
}

export function runDeterministicEmploymentIntelligence(input: Awaited<ReturnType<typeof buildEmploymentIntelligenceInputs>>, assessedAt = new Date().toISOString()) {
  const { profile } = generateEmploymentIntelligenceWithTrace(input.intelligenceInput, { assessedAt });
  const snapshot: InputSnapshotReference = {
    ...input.snapshot,
    engineVersion: profile.engineVersion
  };
  return {
    profile,
    actionSet: {
      primary: profile.nextBestAction,
      secondary: profile.secondaryActions
    },
    careerPlan: profile.careerPlan,
    snapshot,
    ids: {
      intelligenceProfileId: randomUUID(),
      actionRecommendationId: randomUUID(),
      careerPlanId: randomUUID(),
      attemptId: randomUUID()
    }
  };
}
