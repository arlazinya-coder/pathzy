import type { SupabaseClient } from "@supabase/supabase-js";
import { extractDocxText, extractPdfText } from "@/lib/professional-identity/cv-import";
import { normalizeInspectionText, decodeBase64Document } from "@/lib/documents/inspection";
import { LocalMetadataDocumentRenderer } from "./document-renderer";
import { LocalVisualDocumentReader } from "./local-visual-reader";
import { shouldRunVisualReading } from "./visual-cost-control";
import { buildVisualReadingPrompt } from "./visual-prompt";
import { VisualReadingError, validateVisualDocumentModel } from "./visual-reading.schema";
import type { VisualDocumentModel, VisualReadingInput } from "./visual-reading.types";

async function sampleNativeText(input: Pick<VisualReadingInput, "base64" | "nativeText" | "inspection">) {
  if (input.nativeText?.trim()) return normalizeInspectionText(input.nativeText);
  const buffer = decodeBase64Document(input.base64);
  if (!buffer.length) return "";
  if (input.inspection.file.mimeType === "application/pdf") return await extractPdfText(buffer);
  if (input.inspection.file.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return await extractDocxText(buffer);
  if (input.inspection.file.mimeType === "text/plain") return normalizeInspectionText(buffer.toString("utf8"));
  return "";
}

async function inspectionRecordIdFor(supabase: SupabaseClient, userId: string, documentId: string) {
  const { data } = await supabase
    .from("document_inspections")
    .select("id")
    .eq("user_id", userId)
    .eq("document_id", documentId)
    .maybeSingle();
  return typeof data?.id === "string" ? data.id : null;
}

function pageRowsFor(model: VisualDocumentModel, visualReadingId: string, userId: string) {
  return model.pages.map((page) => ({
    visual_reading_id: visualReadingId,
    document_id: model.documentId,
    user_id: userId,
    page_number: page.pageNumber,
    status: model.status,
    source_type: page.sourceType,
    layout_confidence: model.confidence.layout,
    reading_order_confidence: model.confidence.readingOrder,
    result_json: page,
    error_message: null,
    completed_at: model.completedAt ?? new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
}

export async function runVisualReading(input: VisualReadingInput): Promise<VisualDocumentModel> {
  if (input.inspection.status === "failed") {
    throw new VisualReadingError("inspection_failed", "Visual reading requires a completed inspection.", "PATHZY could not read this document layout because inspection failed.");
  }
  const nativeText = await sampleNativeText(input);
  const decision = shouldRunVisualReading(input.inspection);
  const renderer = new LocalMetadataDocumentRenderer();
  const reader = new LocalVisualDocumentReader();
  const rendered = await renderer.render({
    documentId: input.documentId,
    mimeType: input.inspection.file.mimeType,
    pageCount: input.inspection.file.pageCount,
    sourceType: input.inspection.source.type,
    base64: input.base64
  });
  const model = await reader.analyze({
    inspection: input.inspection,
    rendered,
    nativeText,
    decision
  });
  return validateVisualDocumentModel({
    ...model,
    provider: {
      ...model.provider,
      visualPromptVersion: "phase-3",
      promptChecksum: String(buildVisualReadingPrompt(input.inspection).length)
    } as VisualDocumentModel["provider"]
  });
}

export async function markVisualReadingProcessing(supabase: SupabaseClient, input: Pick<VisualReadingInput, "documentId" | "userId" | "inspection">) {
  const inspectionRecordId = await inspectionRecordIdFor(supabase, input.userId, input.documentId);
  await supabase
    .from("document_visual_readings")
    .upsert(
      {
        document_id: input.documentId,
        inspection_record_id: inspectionRecordId,
        inspection_id: input.inspection.id,
        user_id: input.userId,
        status: "processing",
        document_type: input.inspection.documentType.value,
        page_count: input.inspection.file.pageCount,
        result_json: {},
        error_message: null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "document_id" }
    );
}

export async function markVisualReadingFailed(supabase: SupabaseClient, input: Pick<VisualReadingInput, "documentId" | "userId" | "inspection">, errorMessage: string) {
  const inspectionRecordId = await inspectionRecordIdFor(supabase, input.userId, input.documentId);
  await supabase
    .from("document_visual_readings")
    .upsert(
      {
        document_id: input.documentId,
        inspection_record_id: inspectionRecordId,
        inspection_id: input.inspection.id,
        user_id: input.userId,
        status: "failed",
        document_type: input.inspection.documentType.value,
        page_count: input.inspection.file.pageCount,
        result_json: {},
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: "document_id" }
    );
}

export async function saveVisualReading(supabase: SupabaseClient, userId: string, model: VisualDocumentModel, errorMessage: string | null = null) {
  const inspectionRecordId = await inspectionRecordIdFor(supabase, userId, model.documentId);
  const { data, error } = await supabase
    .from("document_visual_readings")
    .upsert(
      {
        document_id: model.documentId,
        inspection_record_id: inspectionRecordId,
        inspection_id: model.inspectionId,
        user_id: userId,
        status: model.status,
        document_type: model.documentType,
        primary_language: model.primaryLanguage ?? null,
        page_count: model.pages.length,
        detected_section_count: model.sections.length,
        detected_table_count: model.tables.length,
        detected_timeline_count: model.timelines.length,
        detected_image_count: model.images.length,
        detected_icon_count: model.icons.length,
        overall_confidence: model.confidence.overall,
        model_name: model.provider?.visualModel ?? "pathzy-local-visual-reader",
        result_json: model,
        error_message: errorMessage,
        completed_at: model.completedAt ?? null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "document_id" }
    )
    .select("*")
    .single();
  if (error) throw error;

  const rows = pageRowsFor(model, data.id as string, userId);
  if (rows.length) {
    const { error: pageError } = await supabase.from("document_visual_pages").upsert(rows, { onConflict: "visual_reading_id,page_number" });
    if (pageError) throw pageError;
  }
  return data;
}

export async function runAndPersistVisualReading(supabase: SupabaseClient, input: VisualReadingInput) {
  await markVisualReadingProcessing(supabase, input);
  try {
    const model = await runVisualReading(input);
    await saveVisualReading(supabase, input.userId, model);
    return model;
  } catch (caught) {
    await markVisualReadingFailed(supabase, input, caught instanceof Error ? caught.message : "Visual reading failed");
    throw caught;
  }
}
