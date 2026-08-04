import { NextResponse } from "next/server";
import {
  employmentIntelligenceApiError,
  parseEmploymentIntelligenceOperation,
  getDetailedEmploymentIntelligence,
  getEmploymentIntelligenceSummary,
  markEmploymentIntelligenceStale,
  recomputeEmploymentIntelligence,
  updateEmploymentActionState
} from "@/lib/employment-intelligence";
import { refreshCareerPlanProgressFromActionHistory } from "@/lib/employment-intelligence/application";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function requireUser() {
  const auth = { supabase: await createSupabaseServerClient() };
  if (!auth.supabase) {
    return { error: NextResponse.json({ error: { code: "SUPABASE_UNCONFIGURED", message: "PATHZY needs setup before Employment Intelligence can load." } }, { status: 503 }) };
  }
  const {
    data: { user },
    error
  } = await auth.supabase.auth.getUser();
  if (error || !user) return { error: NextResponse.json({ error: { code: "AUTH_REQUIRED", message: "Please log in to continue." } }, { status: 401 }) };
  return { supabase: auth.supabase, user };
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  try {
    const url = new URL(request.url);
    const detail = url.searchParams.get("detail") === "true";
    const data = detail ? await getDetailedEmploymentIntelligence(auth.supabase, auth.user.id) : await getEmploymentIntelligenceSummary(auth.supabase, auth.user.id);
    return NextResponse.json({ data, responseVersion: "3F.1" });
  } catch (error) {
    return employmentIntelligenceApiError(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  try {
    const operation = parseEmploymentIntelligenceOperation(await request.json());
    if (operation.operation === "recompute" || operation.operation === "retry") {
      const result = await recomputeEmploymentIntelligence({
        supabase: auth.supabase,
        authenticatedUser: auth.user,
        trigger: operation.operation === "recompute" ? (operation.trigger ?? operation.operation) : operation.operation,
        force: operation.operation === "recompute" ? operation.force : true,
        idempotencyKey: operation.idempotencyKey
      });
      return NextResponse.json({ data: result, responseVersion: "3F.1" });
    }
    if (operation.operation === "mark_stale") {
      const result = await markEmploymentIntelligenceStale(auth.supabase, auth.user.id, { reason: operation.reason });
      return NextResponse.json({ data: result, responseVersion: "3F.1" });
    }
    if (operation.operation === "action_transition") {
      const action = await updateEmploymentActionState(auth.supabase, auth.user.id, operation);
      const plan = await refreshCareerPlanProgressFromActionHistory(auth.supabase, auth.user.id);
      return NextResponse.json({ data: { action, careerPlan: plan }, responseVersion: "3F.1" });
    }
    return NextResponse.json({ error: { code: "UNSUPPORTED_OPERATION", message: "Unsupported Employment Intelligence operation." } }, { status: 400 });
  } catch (error) {
    return employmentIntelligenceApiError(error);
  }
}
