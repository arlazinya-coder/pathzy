import { NextResponse } from "next/server";
import { canCurrentUserUseProfessionalIdentityTools, createImportedCvDraft } from "@/lib/professional-identity/professional-identity-service";
import { CvImportError, importCvFromUpload, validateCvImportFile } from "@/lib/professional-identity/cv-import";
import type { ImportedCvResult } from "@/lib/professional-identity/cv-import";
import { DocumentInspectionError, inspectAndPersistDocument } from "@/lib/documents/inspection";
import { VisualReadingError, runAndPersistVisualReading } from "@/lib/documents/visual";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const safeFailure = "We could not complete the CV import. Your existing PATHZY information is safe.";

async function createUploadShell(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  userId: string,
  upload: { fileName: string; fileType: string; fileSize: number }
) {
  const title = `Uploaded CV - ${upload.fileName}`;
  const { data: existing } = await supabase
    .from("user_documents")
    .select("id")
    .eq("user_id", userId)
    .eq("document_type", "old_cv")
    .eq("document_title", title)
    .eq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data, error } = await supabase
    .from("user_documents")
    .insert({
      user_id: userId,
      document_type: "old_cv",
      document_title: title,
      template_name: null,
      content_text: "",
      content_json: {
        source: "professional_identity_cv_import",
        original_file_name: upload.fileName,
        original_file_type: upload.fileType,
        original_file_size: upload.fileSize,
        inspection_status: "pending"
      },
      status: "draft",
      version_number: 1
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
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
    return { error: NextResponse.json({ error: "Please log in to import your CV." }, { status: 401 }) };
  }

  return { supabase, user };
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as {
      fileName?: string;
      fileType?: string;
      fileSize?: number;
      base64?: string;
      templateName?: string;
      confirm?: boolean;
      staging?: ImportedCvResult;
    };

    if (!(await canCurrentUserUseProfessionalIdentityTools(auth.supabase, auth.user.id))) {
      return NextResponse.json({
        upgradeRequired: true,
        feature: "professional_identity",
        plan: "starter",
        limit: 0
      });
    }

    if (body.confirm && body.staging) {
      const document = await createImportedCvDraft(auth.supabase, auth.user.id, body.staging, body.templateName);
      return NextResponse.json({ document });
    }

    const upload = {
      fileName: body.fileName ?? "",
      fileType: body.fileType ?? "",
      fileSize: body.fileSize ?? 0,
      base64: body.base64 ?? ""
    };

    validateCvImportFile(upload);

    const uploadDocumentId = await createUploadShell(auth.supabase, auth.user.id, upload);
    const inspection = await inspectAndPersistDocument(auth.supabase, {
      documentId: uploadDocumentId,
      userId: auth.user.id,
      fileName: upload.fileName,
      mimeType: upload.fileType,
      sizeBytes: upload.fileSize,
      base64: upload.base64
    });
    if (!inspection.recommendedPipeline.extractionAllowed) {
      return NextResponse.json({
        error: "This document needs manual review before PATHZY can extract it.",
        inspection
      }, { status: 400 });
    }
    const visualReading = await runAndPersistVisualReading(auth.supabase, {
      documentId: uploadDocumentId,
      userId: auth.user.id,
      inspection,
      nativeText: "",
      base64: upload.base64
    });

    const imported = {
      ...importCvFromUpload(upload),
      uploadDocumentId,
      inspection,
      visualReading
    };

    return NextResponse.json({
      staging: imported,
      importSummary: {
        counts: imported.counts,
        reviewItems: imported.reviewItems,
        confidence: imported.confidence,
        unclassifiedItems: imported.unclassifiedItems,
        excludedSensitiveNotice: imported.excludedSensitiveNotice ?? null,
        inspection,
        visualReading,
        message: "We've prepared your CV."
      }
    });
  } catch (caught) {
    if (caught instanceof DocumentInspectionError) {
      return NextResponse.json({ error: caught.userMessage }, { status: 400 });
    }
    if (caught instanceof CvImportError) {
      return NextResponse.json({ error: caught.userMessage }, { status: 400 });
    }
    if (caught instanceof VisualReadingError) {
      return NextResponse.json({ error: caught.userMessage }, { status: 400 });
    }

    console.error("[professional-identity] CV import failed", caught instanceof Error ? caught.message : caught);
    return NextResponse.json({ error: safeFailure }, { status: 500 });
  }
}
