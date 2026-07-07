import { NextResponse } from "next/server";
import {
  canCurrentUserUseProfessionalIdentityTools,
  generateCV,
  generateCareerPassportSummary,
  generateCoverLetter,
  generateFollowUpEmail,
  generateLinkedInProfile,
  generateRecruiterMessage
} from "@/lib/professional-identity/professional-identity-service";
import { levelFromXp } from "@/lib/missions/engine";
import type { GenerateOptions } from "@/lib/professional-identity/professional-identity-types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Tool = "cv" | "cover-letter" | "linkedin" | "recruiter-message" | "follow-up" | "career-passport" | "uploaded-document" | "supporting-document";
type GeneratableTool = Exclude<Tool, "uploaded-document" | "supporting-document">;
type UserDocumentType = "cv" | "cover_letter" | "linkedin_profile" | "recruiter_message" | "follow_up_email" | "career_passport" | "uploaded_document" | "supporting_document" | "old_cv";

const documentTables: Record<GeneratableTool, { table: string; contentColumn: string; titleColumn: string }> = {
  cv: { table: "cv_documents", contentColumn: "content", titleColumn: "title" },
  "cover-letter": { table: "cover_letters", contentColumn: "content", titleColumn: "title" },
  linkedin: { table: "linkedin_profiles", contentColumn: "about", titleColumn: "headline" },
  "recruiter-message": { table: "recruiter_messages", contentColumn: "message", titleColumn: "role" },
  "follow-up": { table: "follow_up_emails", contentColumn: "email_content", titleColumn: "role" },
  "career-passport": { table: "career_passport_summaries", contentColumn: "summary", titleColumn: "career_goal" }
};

const friendlyError = "We could not complete this action yet. Your progress is safe. Please try again.";

const toolToUserDocumentType: Record<Tool, UserDocumentType> = {
  cv: "cv",
  "cover-letter": "cover_letter",
  linkedin: "linkedin_profile",
  "recruiter-message": "recruiter_message",
  "follow-up": "follow_up_email",
  "career-passport": "career_passport",
  "uploaded-document": "uploaded_document",
  "supporting-document": "supporting_document"
};

const userDocumentTypeToTool: Record<UserDocumentType, Tool> = {
  cv: "cv",
  cover_letter: "cover-letter",
  linkedin_profile: "linkedin",
  recruiter_message: "recruiter-message",
  follow_up_email: "follow-up",
  career_passport: "career-passport",
  uploaded_document: "uploaded-document",
  supporting_document: "supporting-document",
  old_cv: "uploaded-document"
};

const toolXp: Record<GeneratableTool, number> = {
  cv: 75,
  "cover-letter": 50,
  linkedin: 50,
  "recruiter-message": 30,
  "follow-up": 30,
  "career-passport": 60
};

async function awardProfessionalIdentityXp(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  userId: string,
  tool: GeneratableTool
) {
  const amount = toolXp[tool];
  const reason = `Professional Identity: ${tool.replace(/-/g, " ")}`;
  const { data: level } = await supabase.from("user_levels").select("*").eq("user_id", userId).maybeSingle();
  const currentXp = typeof level?.total_xp === "number" ? level.total_xp : 0;
  const nextXp = currentXp + amount;

  await supabase.from("user_xp").insert({ user_id: userId, amount, reason });
  await supabase.from("user_levels").upsert(
    {
      user_id: userId,
      total_xp: nextXp,
      level: levelFromXp(nextXp),
      daily_streak: level?.daily_streak ?? 0,
      weekly_streak: level?.weekly_streak ?? 0,
      longest_streak: level?.longest_streak ?? 0,
      last_completed_date: level?.last_completed_date ?? null,
      last_completed_week: level?.last_completed_week ?? null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id" }
  );
}

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
    return { error: NextResponse.json({ error: "Please log in to continue your journey." }, { status: 401 }) };
  }

  return { supabase, user };
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as {
    tool?: Tool;
    options?: GenerateOptions;
    replaceDocumentId?: string;
    upload?: {
      documentType?: UserDocumentType;
      title?: string;
      content?: string;
      fileName?: string;
      fileType?: string;
      fileSize?: number;
  status?: "draft" | "ready" | "downloaded" | "archived";
  content_json?: Record<string, unknown> | null;
  };
  };
  const { supabase, user } = auth;
  const tool = body.tool;

  if (!tool) {
    return NextResponse.json({ error: "Tool is required." }, { status: 400 });
  }

  if (!(await canCurrentUserUseProfessionalIdentityTools(supabase, user.id))) {
    return NextResponse.json({
      upgradeRequired: true,
      feature: "professional_identity",
      plan: "starter",
      limit: 0
    });
  }

  if (tool === "uploaded-document" || tool === "supporting-document") {
    const upload = body.upload;
    if (!upload?.title?.trim()) {
      return NextResponse.json({ error: "Document title is required." }, { status: 400 });
    }

    try {
      const documentType = upload.documentType && ["old_cv", "uploaded_document", "supporting_document"].includes(upload.documentType)
        ? upload.documentType
        : toolToUserDocumentType[tool];
      const { data, error } = await supabase
        .from("user_documents")
        .insert({
          user_id: user.id,
          document_type: documentType,
          document_title: upload.title.trim(),
          template_name: null,
          content_text: upload.content ?? "",
          content_json: {
            original_file_name: upload.fileName ?? null,
            original_file_type: upload.fileType ?? null,
            original_file_size: upload.fileSize ?? null,
            source: "professional_identity_upload"
          },
          status: upload.status ?? "draft",
          version_number: 1
        })
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({
        document: {
          id: data.id,
          tool: userDocumentTypeToTool[data.document_type as UserDocumentType] ?? tool,
          document_type: data.document_type,
          title: data.document_title,
          content: data.content_text ?? "",
          contentJson: data.content_json ?? null,
          template_name: data.template_name,
          status: data.status,
          version_number: data.version_number,
          created_at: data.created_at,
          updated_at: data.updated_at,
          last_downloaded_at: data.last_downloaded_at,
          file_url: data.file_url
        }
      });
    } catch (error) {
      console.error("[professional-identity] upload save failed", error);
      return NextResponse.json({ error: friendlyError }, { status: 500 });
    }
  }

  try {
    const options = body.options ?? {};
    let document =
      tool === "cv"
        ? await generateCV(supabase, user.id, options)
        : tool === "cover-letter"
          ? await generateCoverLetter(supabase, user.id, options)
          : tool === "linkedin"
            ? await generateLinkedInProfile(supabase, user.id, options)
            : tool === "recruiter-message"
              ? await generateRecruiterMessage(supabase, user.id, options)
              : tool === "follow-up"
                ? await generateFollowUpEmail(supabase, user.id, options)
                : await generateCareerPassportSummary(supabase, user.id, options);

    if (body.replaceDocumentId && document.id && body.replaceDocumentId !== document.id) {
      const { error: replaceError } = await supabase
        .from("user_documents")
        .update({
          document_title: document.title,
          template_name: options.templateName ?? null,
          content_text: document.content,
          content_json: {
            tool: document.tool,
            score: document.score ?? null,
            fields: document.fields ?? null,
            ...(document.contentJson ?? {}),
            replaced_from_document_id: document.id
          },
          status: "draft",
          updated_at: new Date().toISOString()
        })
        .eq("id", body.replaceDocumentId)
        .eq("user_id", user.id);
      if (!replaceError) {
        await supabase.from("user_documents").delete().eq("id", document.id).eq("user_id", user.id);
        document = { ...document, id: body.replaceDocumentId };
      }
    }

    await awardProfessionalIdentityXp(supabase, user.id, tool);

    return NextResponse.json({ document, xpAwarded: toolXp[tool] });
  } catch (error) {
    console.error("[professional-identity] generation failed", error);
    return NextResponse.json(
      {
        error: friendlyError
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  try {
    const { data: unifiedDocuments, error: unifiedError } = await auth.supabase
      .from("user_documents")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("updated_at", { ascending: false })
      .limit(100);

    if (!unifiedError && unifiedDocuments?.length) {
      return NextResponse.json({
        documents: unifiedDocuments.map((row: any) => ({
          id: row.id,
          tool: userDocumentTypeToTool[row.document_type as UserDocumentType] ?? "cv",
          document_type: row.document_type,
          title: row.document_title,
          content: row.content_text ?? "",
          contentJson: row.content_json ?? null,
          template_name: row.template_name,
          status: row.status,
          version_number: row.version_number,
          created_at: row.created_at,
          updated_at: row.updated_at,
          last_downloaded_at: row.last_downloaded_at,
          file_url: row.file_url
        }))
      });
    }

    const entries = await Promise.all(
      (Object.entries(documentTables) as Array<[GeneratableTool, (typeof documentTables)[GeneratableTool]]>).map(async ([tool, config]) => {
        const { data } = await auth.supabase
          .from(config.table)
          .select("*")
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        return (data ?? []).map((row: any) => ({
          id: row.id,
          tool,
          title: row[config.titleColumn] || row.title || tool.replace(/-/g, " "),
          content: row[config.contentColumn] || row.content || "",
          created_at: row.created_at,
          updated_at: row.updated_at
        }));
      })
    );

    return NextResponse.json({ documents: entries.flat().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))) });
  } catch (error) {
    console.error("[professional-identity] list failed", error);
    return NextResponse.json({ error: friendlyError }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as { id?: string; tool?: Tool; title?: string; content?: string; contentJson?: Record<string, unknown> | null; templateName?: string; duplicate?: boolean; status?: "draft" | "ready" | "downloaded" | "archived"; downloaded?: boolean; updateLinkedVersions?: boolean };
  if (!body.id || !body.tool) return NextResponse.json({ error: "Document is required." }, { status: 400 });

  try {
    const { data: unifiedDocument } = await auth.supabase.from("user_documents").select("*").eq("id", body.id).eq("user_id", auth.user.id).maybeSingle();

    if (unifiedDocument) {
      if (body.duplicate) {
        const { id: _id, created_at: _created, updated_at: _updated, last_downloaded_at: _downloaded, ...copy } = unifiedDocument as any;
        const now = new Date().toISOString();
        const copiedContentJson = body.contentJson && typeof body.contentJson === "object"
          ? {
              ...((unifiedDocument.content_json as Record<string, unknown> | null) ?? {}),
              ...body.contentJson
            }
          : unifiedDocument.content_json;
        const { data, error } = await auth.supabase
          .from("user_documents")
          .insert({
            ...copy,
            document_title: body.title || `${unifiedDocument.document_title || "Document"} copy`,
            template_name: typeof body.templateName === "string" && body.templateName.trim() ? body.templateName.trim() : unifiedDocument.template_name,
            content_json: copiedContentJson,
            status: "draft",
            version_number: Number(unifiedDocument.version_number ?? 1) + 1,
            created_at: now,
            updated_at: now,
            last_downloaded_at: null
          })
          .select("*")
          .single();
        if (error) throw error;
        return NextResponse.json({ document: data });
      }

      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (typeof body.content === "string") update.content_text = body.content;
      if (body.contentJson && typeof body.contentJson === "object") {
        update.content_json = {
          ...((unifiedDocument.content_json as Record<string, unknown> | null) ?? {}),
          ...body.contentJson
        };
      }
      if (typeof body.title === "string" && body.title.trim()) update.document_title = body.title.trim();
      if (typeof body.templateName === "string" && body.templateName.trim()) update.template_name = body.templateName.trim();
      if (body.status) update.status = body.status;
      if (body.downloaded) {
        update.status = "downloaded";
        update.last_downloaded_at = new Date().toISOString();
      }

      const { data, error } = await auth.supabase.from("user_documents").update(update).eq("id", body.id).eq("user_id", auth.user.id).select("*").single();
      if (error) throw error;
      if (body.updateLinkedVersions && body.tool === "cv" && body.contentJson?.cvModel && body.contentJson?.cvVersion) {
        const sourceVersion = body.contentJson.cvVersion as Record<string, unknown>;
        const sourceId = typeof sourceVersion.contentSourceId === "string" ? sourceVersion.contentSourceId : body.id;
        const { data: cvVersions } = await auth.supabase
          .from("user_documents")
          .select("id,content_json")
          .eq("user_id", auth.user.id)
          .eq("document_type", "cv");
        const linkedVersions = (cvVersions ?? [])
          .filter((row: any) => row.id !== body.id)
          .filter((row: any) => {
            const version = row.content_json?.cvVersion;
            return version && typeof version === "object" && version.contentSourceId === sourceId;
          });
        for (const linked of linkedVersions as any[]) {
          await auth.supabase
            .from("user_documents")
            .update({
              content_text: body.content,
              content_json: {
                ...((linked.content_json as Record<string, unknown> | null) ?? {}),
                cvModel: body.contentJson.cvModel
              },
              updated_at: new Date().toISOString()
            })
            .eq("id", linked.id)
            .eq("user_id", auth.user.id);
        }
      }
      return NextResponse.json({ document: data });
    }

    if (body.tool === "uploaded-document" || body.tool === "supporting-document" || !documentTables[body.tool]) {
      return NextResponse.json({ error: "Document was not found. Please refresh My Documents and try again." }, { status: 404 });
    }

    const config = documentTables[body.tool];

    if (body.duplicate) {
      const { data: existing, error: readError } = await auth.supabase.from(config.table).select("*").eq("id", body.id).eq("user_id", auth.user.id).single();
      if (readError) throw readError;
      const { id: _id, created_at: _created, updated_at: _updated, ...copy } = existing as any;
      const title = body.title || `${existing[config.titleColumn] || "Document"} copy`;
      const { data, error } = await auth.supabase
        .from(config.table)
        .insert({ ...copy, [config.titleColumn]: title, updated_at: new Date().toISOString() })
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ document: data });
    }

    const update: Record<string, string> = { updated_at: new Date().toISOString() };
    if (typeof body.content === "string") update[config.contentColumn] = body.content;
    if (typeof body.title === "string" && body.title.trim()) update[config.titleColumn] = body.title.trim();

    const { data, error } = await auth.supabase.from(config.table).update(update).eq("id", body.id).eq("user_id", auth.user.id).select("*").single();
    if (error) throw error;
    return NextResponse.json({ document: data });
  } catch (error) {
    console.error("[professional-identity] update failed", error);
    return NextResponse.json({ error: friendlyError }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const tool = searchParams.get("tool") as Tool | null;
  if (!id || !tool) return NextResponse.json({ error: "Document is required." }, { status: 400 });

  try {
    const { data: unifiedDocument } = await auth.supabase.from("user_documents").select("id").eq("id", id).eq("user_id", auth.user.id).maybeSingle();
    if (unifiedDocument) {
      const { error } = await auth.supabase.from("user_documents").delete().eq("id", id).eq("user_id", auth.user.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (tool === "uploaded-document" || tool === "supporting-document" || !documentTables[tool]) {
      return NextResponse.json({ error: "Document was not found. Please refresh My Documents and try again." }, { status: 404 });
    }

    const { error } = await auth.supabase.from(documentTables[tool].table).delete().eq("id", id).eq("user_id", auth.user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[professional-identity] delete failed", error);
    return NextResponse.json({ error: friendlyError }, { status: 500 });
  }
}
