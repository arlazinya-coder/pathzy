import { NextResponse } from "next/server";
import {
  analyzeJobDescription,
  buildCoverLetterProfileFacts,
  coverLetterTitle,
  eliteCoverLetterPdfDocument,
  generateEliteCoverLetterData,
  normalizeCoverLetterTemplate,
  normalizeCoverLetterTone,
  serializeEliteCoverLetterData
} from "@/lib/professional-identity/elite-cover-letter-engine";
import type { CoverLetterTargetJob, EliteCoverLetterData } from "@/lib/professional-identity/elite-cover-letter-engine";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const friendlyError = "We could not save your cover letter yet. Your draft is safe on this screen. Please try again.";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: NextResponse.json({ error: "Something needs a quick setup. Please refresh and try again." }, { status: 503 }) };
  }
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: "Please log in to continue." }, { status: 401 }) };
  }

  return { supabase, user };
}

async function loadFacts(supabase: any, userId: string) {
  const [{ data: profile }, { data: discovery }, { data: latestCv }] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("full_name,email,phone,city,country,career_goal,education,highest_qualification,field_of_study,current_status,employment_status,linkedin_url,portfolio_url")
      .or(`user_id.eq.${userId},id.eq.${userId}`)
      .maybeSingle(),
    supabase
      .from("discovery_responses")
      .select("answers,generated_result")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("user_documents")
      .select("content_json")
      .eq("user_id", userId)
      .eq("document_type", "cv")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const discoveryAnswers = (discovery?.answers ?? {}) as Record<string, unknown>;
  const latestCvJson = (latestCv?.content_json ?? {}) as Record<string, unknown>;
  return buildCoverLetterProfileFacts(profile ?? null, discoveryAnswers, latestCvJson);
}

async function latestEliteCoverLetter(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_documents")
    .select("*")
    .eq("user_id", userId)
    .eq("document_type", "cover_letter")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const json = (data?.content_json ?? {}) as Record<string, unknown>;
  const eliteCoverLetterData = json.eliteCoverLetterData as EliteCoverLetterData | undefined;
  if (!data || !eliteCoverLetterData) return null;

  return {
    id: data.id,
    title: data.document_title,
    data: eliteCoverLetterData,
    templateName: normalizeCoverLetterTemplate(data.template_name ?? eliteCoverLetterData.selectedTemplate),
    updatedAt: data.updated_at ?? null,
    lastDownloadedAt: data.last_downloaded_at ?? null
  };
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  try {
    const [facts, latestDocument] = await Promise.all([
      loadFacts(auth.supabase, auth.user.id),
      latestEliteCoverLetter(auth.supabase, auth.user.id)
    ]);

    return NextResponse.json({ facts, latestDocument });
  } catch (error) {
    console.error("[elite-cover-letter] load failed", error);
    return NextResponse.json({ error: "We could not load your cover letter workspace yet. Please refresh and try again." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = await request.json() as Partial<CoverLetterTargetJob> & { selectedTemplate?: string };
  const target: CoverLetterTargetJob = {
    jobTitle: body.jobTitle ?? "",
    companyName: body.companyName ?? "",
    hiringManager: body.hiringManager ?? "",
    companyAddress: body.companyAddress ?? "",
    jobDescription: body.jobDescription ?? "",
    tone: normalizeCoverLetterTone(body.tone)
  };

  if (!target.jobTitle.trim() || !target.companyName.trim()) {
    return NextResponse.json({ error: "Please add the job title and company name before generating." }, { status: 400 });
  }

  try {
    const facts = await loadFacts(auth.supabase, auth.user.id);
    const selectedTemplate = normalizeCoverLetterTemplate(body.selectedTemplate);
    const eliteCoverLetterData = generateEliteCoverLetterData(facts, target, selectedTemplate);
    const title = coverLetterTitle(eliteCoverLetterData.companyName, eliteCoverLetterData.jobTitle);
    const content = serializeEliteCoverLetterData(eliteCoverLetterData);

    const { data, error } = await auth.supabase
      .from("user_documents")
      .insert({
        user_id: auth.user.id,
        document_type: "cover_letter",
        document_title: title,
        template_name: selectedTemplate,
        content_text: content,
        content_json: {
          eliteCoverLetterData,
          targetJob: target,
          emphasisReview: analyzeJobDescription(target, facts),
          integration: "elite_cover_letter"
        },
        status: "draft",
        version_number: 1
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({
      document: {
        id: data.id,
        title,
        data: eliteCoverLetterData,
        templateName: selectedTemplate,
        updatedAt: data.updated_at ?? null,
        lastDownloadedAt: null
      },
      facts
    });
  } catch (error) {
    console.error("[elite-cover-letter] generation save failed", error);
    return NextResponse.json({ error: friendlyError }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = await request.json() as {
    id?: string;
    title?: string;
    data?: EliteCoverLetterData;
    duplicate?: boolean;
    downloaded?: boolean;
  };

  if (!body.id || !body.data) {
    return NextResponse.json({ error: "Cover letter draft is required." }, { status: 400 });
  }

  try {
    const title = body.title?.trim() || coverLetterTitle(body.data.companyName, body.data.jobTitle);
    const savedData = { ...body.data, updatedAt: new Date().toISOString() };
    const content = serializeEliteCoverLetterData(savedData);
    const existing = await auth.supabase
      .from("user_documents")
      .select("*")
      .eq("id", body.id)
      .eq("user_id", auth.user.id)
      .eq("document_type", "cover_letter")
      .maybeSingle();

    if (!existing.data) {
      return NextResponse.json({ error: "Cover letter draft was not found. Please refresh My Documents and try again." }, { status: 404 });
    }

    if (body.duplicate) {
      const { data, error } = await auth.supabase
        .from("user_documents")
        .insert({
          user_id: auth.user.id,
          document_type: "cover_letter",
          document_title: `${title} copy`,
          template_name: savedData.selectedTemplate,
          content_text: content,
          content_json: {
            ...((existing.data.content_json as Record<string, unknown> | null) ?? {}),
            eliteCoverLetterData: savedData,
            duplicated_from_document_id: body.id
          },
          status: "draft",
          version_number: Number(existing.data.version_number ?? 1) + 1
        })
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ document: { id: data.id, title: data.document_title, data: savedData, templateName: savedData.selectedTemplate, updatedAt: data.updated_at ?? null, lastDownloadedAt: null } });
    }

    const update: Record<string, unknown> = {
      document_title: title,
      template_name: savedData.selectedTemplate,
      content_text: content,
      content_json: {
        ...((existing.data.content_json as Record<string, unknown> | null) ?? {}),
        eliteCoverLetterData: savedData,
        pdfPreviewSample: eliteCoverLetterPdfDocument(savedData).slice(0, 16)
      },
      updated_at: new Date().toISOString()
    };
    if (body.downloaded) {
      update.status = "downloaded";
      update.last_downloaded_at = new Date().toISOString();
    }

    const { data, error } = await auth.supabase
      .from("user_documents")
      .update(update)
      .eq("id", body.id)
      .eq("user_id", auth.user.id)
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({
      document: {
        id: data.id,
        title: data.document_title,
        data: savedData,
        templateName: savedData.selectedTemplate,
        updatedAt: data.updated_at ?? null,
        lastDownloadedAt: data.last_downloaded_at ?? null
      }
    });
  } catch (error) {
    console.error("[elite-cover-letter] update failed", error);
    return NextResponse.json({ error: friendlyError }, { status: 500 });
  }
}

