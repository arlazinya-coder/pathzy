import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  canTransitionApplicationStatus,
  getApplicationNextAction,
  normalizeApplicationStatus,
  timelineEventTypeForStatus
} from "@/lib/applications/application-tracker-service";
import type { ApplicationContact, SmartApplicationStatus } from "@/lib/applications/smart-application.types";

export const runtime = "nodejs";

type ApplicationPayload = {
  id?: string;
  company_name?: string;
  role?: string;
  opportunity_type?: string;
  source?: string;
  status?: SmartApplicationStatus;
  application_date?: string | null;
  follow_up_date?: string | null;
  closing_date?: string | null;
  planned_application_date?: string | null;
  assessment_deadline?: string | null;
  interview_date?: string | null;
  expected_response_date?: string | null;
  next_action_date?: string | null;
  next_action?: string | null;
  follow_up_state?: string | null;
  contacts_json?: ApplicationContact[];
  notes?: string;
  note_event?: string;
  correction?: boolean;
};

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) return { error: NextResponse.json({ error: "You must be logged in to track applications." }, { status: 401 }) };
  return { supabase, user };
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function nullableDate(value: unknown) {
  const clean = cleanText(value);
  return clean || null;
}

function safeContacts(value: unknown): ApplicationContact[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((contact) => ({
      id: cleanText(contact?.id) || crypto.randomUUID(),
      type: ["recruiter", "hiring_manager", "referral_contact", "interviewer"].includes(contact?.type) ? contact.type : "recruiter",
      name: cleanText(contact?.name),
      organization: cleanText(contact?.organization),
      email: cleanText(contact?.email),
      phone: cleanText(contact?.phone),
      notes: cleanText(contact?.notes)
    }))
    .filter((contact) => contact.name);
}

async function insertTimelineEvent(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  input: {
    userId: string;
    applicationId: string;
    eventType: string;
    fromStatus?: string | null;
    toStatus?: string | null;
    note: string;
    metadata?: Record<string, unknown>;
  }
) {
  if (!supabase) return;
  const { error } = await supabase.from("application_timeline_events").insert({
    user_id: input.userId,
    application_id: input.applicationId,
    event_type: input.eventType,
    from_status: input.fromStatus ?? null,
    to_status: input.toStatus ?? null,
    note: input.note,
    metadata_json: input.metadata ?? {},
    event_at: new Date().toISOString()
  });
  if (error) {
    console.error("[employment-tracker] timeline insert failed", error);
    throw error;
  }
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as ApplicationPayload;
  const company = body.company_name?.trim();
  const role = body.role?.trim();

  if (!company || !role) {
    return NextResponse.json({ error: "Company name and role are required." }, { status: 400 });
  }

  const status = normalizeApplicationStatus(body.status ?? "planning");
  const row = {
    user_id: auth.user.id,
    company_name: company,
    role,
    opportunity_type: cleanText(body.opportunity_type) || "job",
    source: cleanText(body.source) || null,
    status,
    application_date: nullableDate(body.application_date),
    follow_up_date: nullableDate(body.follow_up_date),
    closing_date: nullableDate(body.closing_date),
    planned_application_date: nullableDate(body.planned_application_date),
    assessment_deadline: nullableDate(body.assessment_deadline),
    interview_date: nullableDate(body.interview_date),
    expected_response_date: nullableDate(body.expected_response_date),
    next_action_date: nullableDate(body.next_action_date),
    next_action: cleanText(body.next_action) || null,
    follow_up_state: cleanText(body.follow_up_state) || null,
    contacts_json: safeContacts(body.contacts_json),
    notes: cleanText(body.notes),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await auth.supabase.from("employment_applications").insert(row).select("*").single();
  if (error) {
    console.error("[employment-tracker] insert failed", error);
    return NextResponse.json({ error: "We could not complete this action yet. Your progress is safe. Please try again." }, { status: 500 });
  }

  try {
    await insertTimelineEvent(auth.supabase, {
      userId: auth.user.id,
      applicationId: data.id,
      eventType: "application_created",
      toStatus: status,
      note: `Application tracker entry created for ${role} at ${company}.`
    });
  } catch {
    return NextResponse.json({ error: "We created the application, but could not save its timeline yet. Please refresh before updating status." }, { status: 500 });
  }

  return NextResponse.json({ application: data });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as ApplicationPayload;
  if (!body.id) return NextResponse.json({ error: "Application id is required." }, { status: 400 });

  const { data: existing, error: existingError } = await auth.supabase
    .from("employment_applications")
    .select("*")
    .eq("id", body.id)
    .eq("user_id", auth.user.id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const nextStatus = body.status ? normalizeApplicationStatus(body.status) : normalizeApplicationStatus(existing.status);
  if (!canTransitionApplicationStatus(existing.status, nextStatus, { correction: body.correction })) {
    return NextResponse.json({ error: "This status change would skip the normal application flow. Use correction mode if you are fixing a previous status." }, { status: 400 });
  }

  const update = {
    company_name: body.company_name === undefined ? existing.company_name : cleanText(body.company_name),
    role: body.role === undefined ? existing.role : cleanText(body.role),
    opportunity_type: body.opportunity_type === undefined ? existing.opportunity_type : cleanText(body.opportunity_type),
    source: body.source === undefined ? existing.source : cleanText(body.source) || null,
    status: nextStatus,
    application_date: body.application_date === undefined ? existing.application_date : nullableDate(body.application_date),
    follow_up_date: body.follow_up_date === undefined ? existing.follow_up_date : nullableDate(body.follow_up_date),
    closing_date: body.closing_date === undefined ? existing.closing_date : nullableDate(body.closing_date),
    planned_application_date: body.planned_application_date === undefined ? existing.planned_application_date : nullableDate(body.planned_application_date),
    assessment_deadline: body.assessment_deadline === undefined ? existing.assessment_deadline : nullableDate(body.assessment_deadline),
    interview_date: body.interview_date === undefined ? existing.interview_date : nullableDate(body.interview_date),
    expected_response_date: body.expected_response_date === undefined ? existing.expected_response_date : nullableDate(body.expected_response_date),
    next_action_date: body.next_action_date === undefined ? existing.next_action_date : nullableDate(body.next_action_date),
    next_action: body.next_action === undefined ? existing.next_action : cleanText(body.next_action) || null,
    follow_up_state: body.follow_up_state === undefined ? existing.follow_up_state : cleanText(body.follow_up_state) || null,
    contacts_json: body.contacts_json === undefined ? existing.contacts_json ?? [] : safeContacts(body.contacts_json),
    notes: body.notes === undefined ? existing.notes : cleanText(body.notes),
    updated_at: new Date().toISOString()
  };

  if (body.status && nextStatus === "applied" && !update.application_date) {
    update.application_date = new Date().toISOString().slice(0, 10);
  }

  const statusChanged = normalizeApplicationStatus(existing.status) !== nextStatus;
  const noteAdded = cleanText(body.note_event).length > 0;
  const history = Array.isArray(existing.status_history_json) ? existing.status_history_json : [];
  const historyItems = [...history];
  if (statusChanged) {
    historyItems.push({
      at: new Date().toISOString(),
      event: body.correction ? "status_correction" : "status_change",
      note: `${normalizeApplicationStatus(existing.status)} -> ${nextStatus}`
    });
  }
  if (noteAdded) {
    historyItems.push({
      at: new Date().toISOString(),
      event: "note",
      note: cleanText(body.note_event)
    });
  }

  const { data, error } = await auth.supabase
    .from("employment_applications")
    .update({ ...update, status_history_json: historyItems })
    .eq("id", body.id)
    .eq("user_id", auth.user.id)
    .select("*")
    .single();

  if (error) {
    console.error("[employment-tracker] update failed", error);
    return NextResponse.json({ error: "We could not complete this action yet. Your progress is safe. Please try again." }, { status: 500 });
  }

  try {
    if (statusChanged) {
      await insertTimelineEvent(auth.supabase, {
        userId: auth.user.id,
        applicationId: body.id,
        eventType: timelineEventTypeForStatus(nextStatus),
        fromStatus: normalizeApplicationStatus(existing.status),
        toStatus: nextStatus,
        note: body.correction ? `Status corrected to ${nextStatus}.` : `Status changed to ${nextStatus}.`,
        metadata: { correction: Boolean(body.correction) }
      });
    }
    if (noteAdded) {
      await insertTimelineEvent(auth.supabase, {
        userId: auth.user.id,
        applicationId: body.id,
        eventType: "note",
        fromStatus: normalizeApplicationStatus(existing.status),
        toStatus: nextStatus,
        note: cleanText(body.note_event)
      });
    }
  } catch {
    return NextResponse.json({ error: "Your application was updated, but the timeline event could not be saved. Please refresh before making another status change." }, { status: 500 });
  }

  return NextResponse.json({ application: data });
}

export async function DELETE(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Application id is required." }, { status: 400 });

  const { data: existing, error: existingError } = await auth.supabase.from("employment_applications").select("id,status").eq("id", id).eq("user_id", auth.user.id).single();
  if (existingError || !existing) return NextResponse.json({ error: "Application not found." }, { status: 404 });

  const { error } = await auth.supabase
    .from("employment_applications")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
      next_action: getApplicationNextAction({ id, status: "archived" }),
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("user_id", auth.user.id);
  if (error) {
    console.error("[employment-tracker] delete failed", error);
    return NextResponse.json({ error: "We could not complete this action yet. Your progress is safe. Please try again." }, { status: 500 });
  }

  try {
    await insertTimelineEvent(auth.supabase, {
      userId: auth.user.id,
      applicationId: id,
      eventType: "status_change",
      fromStatus: normalizeApplicationStatus(existing.status),
      toStatus: "archived",
      note: "Application archived."
    });
  } catch {
    return NextResponse.json({ error: "The application was archived, but the timeline event could not be saved." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
