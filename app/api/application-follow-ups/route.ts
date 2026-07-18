import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  FOLLOW_UP_STATUSES,
  FOLLOW_UP_TYPES,
  canMarkFollowUpSent,
  duplicateKeyForFollowUp,
  prepareFollowUpDraft
} from "@/lib/follow-up/follow-up-service";
import type { FollowUpApplicationContext, FollowUpStatus, FollowUpType } from "@/lib/follow-up/follow-up.types";

export const runtime = "nodejs";

type FollowUpPayload = {
  id?: string;
  applicationId?: string;
  type?: FollowUpType;
  status?: FollowUpStatus;
  subject?: string;
  body?: string;
  scheduledDate?: string | null;
  timezone?: string;
  approve?: boolean;
  markSent?: boolean;
  dismiss?: boolean;
  cancel?: boolean;
};

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) return { error: NextResponse.json({ error: "Please log in to manage application follow-ups." }, { status: 401 }) };
  return { supabase, user };
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function safeTimezone(value: unknown) {
  const timezone = cleanText(value);
  if (!timezone) return "UTC";
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone });
    return timezone;
  } catch {
    return "UTC";
  }
}

function isFollowUpType(value: unknown): value is FollowUpType {
  return FOLLOW_UP_TYPES.includes(value as FollowUpType);
}

function isFollowUpStatus(value: unknown): value is FollowUpStatus {
  return FOLLOW_UP_STATUSES.includes(value as FollowUpStatus);
}

async function insertTimelineEvent(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  input: {
    userId: string;
    applicationId: string;
    note: string;
    metadata?: Record<string, unknown>;
  }
) {
  if (!supabase) return;
  const { error } = await supabase.from("application_timeline_events").insert({
    user_id: input.userId,
    application_id: input.applicationId,
    event_type: "follow_up",
    note: input.note,
    metadata_json: input.metadata ?? {},
    event_at: new Date().toISOString()
  });
  if (error) console.error("[application-follow-ups] timeline insert failed", error);
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");
  let query = auth.supabase
    .from("application_follow_ups")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("updated_at", { ascending: false });

  if (applicationId) query = query.eq("application_id", applicationId);

  const { data, error } = await query.limit(200);
  if (error) {
    console.error("[application-follow-ups] list failed", error);
    return NextResponse.json({ error: "We could not load follow-ups yet. Please refresh and try again." }, { status: 500 });
  }

  return NextResponse.json({ followUps: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as FollowUpPayload;
  if (!body.applicationId) return NextResponse.json({ error: "Application id is required." }, { status: 400 });
  if (!isFollowUpType(body.type)) return NextResponse.json({ error: "Follow-up type is required." }, { status: 400 });

  const { data: application, error: applicationError } = await auth.supabase
    .from("employment_applications")
    .select("*")
    .eq("id", body.applicationId)
    .eq("user_id", auth.user.id)
    .single();

  if (applicationError || !application) return NextResponse.json({ error: "Application not found." }, { status: 404 });

  const duplicateKey = duplicateKeyForFollowUp(body.applicationId, body.type);
  const { data: existing } = await auth.supabase
    .from("application_follow_ups")
    .select("*")
    .eq("user_id", auth.user.id)
    .eq("application_id", body.applicationId)
    .eq("follow_up_type", body.type)
    .eq("duplicate_key", duplicateKey)
    .in("status", ["suggested", "scheduled", "drafted", "approved"])
    .is("archived_at", null)
    .maybeSingle();

  if (existing) return NextResponse.json({ followUp: existing, reused: true });

  const draft = prepareFollowUpDraft(application as FollowUpApplicationContext, body.type, safeTimezone(body.timezone));
  const row = {
    ...draft,
    user_id: auth.user.id,
    application_id: body.applicationId,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await auth.supabase.from("application_follow_ups").insert(row).select("*").single();
  if (error) {
    console.error("[application-follow-ups] create failed", error);
    return NextResponse.json({ error: "We could not prepare this follow-up yet. Your application is safe. Please try again." }, { status: 500 });
  }

  await auth.supabase
    .from("employment_applications")
    .update({
      follow_up_date: data.recommended_date,
      follow_up_state: data.status === "cancelled" ? "not recommended" : "draft ready",
      next_action: data.status === "cancelled" ? "Review application status" : "Review follow-up draft",
      next_action_date: data.recommended_date,
      updated_at: new Date().toISOString()
    })
    .eq("id", body.applicationId)
    .eq("user_id", auth.user.id);

  await insertTimelineEvent(auth.supabase, {
    userId: auth.user.id,
    applicationId: body.applicationId,
    note: data.status === "cancelled" ? "Follow-up was not suggested for this application state." : "Follow-up draft prepared for user review.",
    metadata: { followUpId: data.id, followUpType: data.follow_up_type, status: data.status }
  });

  return NextResponse.json({ followUp: data });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as FollowUpPayload;
  if (!body.id) return NextResponse.json({ error: "Follow-up id is required." }, { status: 400 });

  const { data: existing, error: existingError } = await auth.supabase
    .from("application_follow_ups")
    .select("*")
    .eq("id", body.id)
    .eq("user_id", auth.user.id)
    .single();

  if (existingError || !existing) return NextResponse.json({ error: "Follow-up not found." }, { status: 404 });

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };

  if (body.subject !== undefined) update.subject = cleanText(body.subject);
  if (body.body !== undefined) update.body = cleanText(body.body);
  if (body.scheduledDate !== undefined) {
    update.scheduled_date = cleanText(body.scheduledDate) || null;
    if (cleanText(body.scheduledDate)) update.status = "scheduled";
  }
  if (body.status && isFollowUpStatus(body.status)) update.status = body.status;
  if (body.dismiss) update.status = "dismissed";
  if (body.cancel) update.status = "cancelled";
  if (body.approve) {
    update.status = "approved";
    update.approval_json = {
      ...(existing.approval_json ?? {}),
      approved: true,
      approvedAt: new Date().toISOString(),
      approvedByUserId: auth.user.id
    };
  }

  if (body.markSent) {
    const candidate = {
      ...existing,
      status: (update.status as FollowUpStatus | undefined) ?? existing.status,
      approval_json: (update.approval_json as typeof existing.approval_json | undefined) ?? existing.approval_json
    };
    const allowed = canMarkFollowUpSent(candidate);
    if (!allowed.allowed) return NextResponse.json({ error: allowed.reason }, { status: 400 });
    update.status = "sent";
    update.sent_at = new Date().toISOString();
  }

  const { data, error } = await auth.supabase
    .from("application_follow_ups")
    .update(update)
    .eq("id", body.id)
    .eq("user_id", auth.user.id)
    .select("*")
    .single();

  if (error) {
    console.error("[application-follow-ups] update failed", error);
    return NextResponse.json({ error: "We could not update this follow-up yet. Please try again." }, { status: 500 });
  }

  const nextApplicationState = data.status === "sent" ? "sent" : data.status === "dismissed" ? "dismissed" : data.status === "cancelled" ? "cancelled" : "draft ready";
  await auth.supabase
    .from("employment_applications")
    .update({
      follow_up_state: nextApplicationState,
      follow_up_date: data.recommended_date,
      next_action: data.status === "sent" ? "Wait for employer response" : data.status === "dismissed" || data.status === "cancelled" ? "Keep application updated" : "Review follow-up draft",
      next_action_date: data.recommended_date,
      updated_at: new Date().toISOString()
    })
    .eq("id", data.application_id)
    .eq("user_id", auth.user.id);

  await insertTimelineEvent(auth.supabase, {
    userId: auth.user.id,
    applicationId: data.application_id,
    note: body.markSent ? "Follow-up recorded as sent by the user." : `Follow-up updated to ${data.status}.`,
    metadata: { followUpId: data.id, followUpType: data.follow_up_type, status: data.status }
  });

  return NextResponse.json({ followUp: data });
}
