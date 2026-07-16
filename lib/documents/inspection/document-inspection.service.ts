import type { SupabaseClient } from "@supabase/supabase-js";
import { extractDocxText, extractPdfText } from "@/lib/professional-identity/cv-import";
import { detectDocumentType } from "./document-type-detector";
import { detectLanguages } from "./language-detector";
import { detectLayout } from "./layout-detector";
import { analyzeQuality, detectOrientation } from "./quality-analyzer";
import { determineOcrRequirement, detectDocumentSource } from "./scan-detector";
import { selectProcessingStrategy } from "./processing-strategy";
import { INSPECTION_THRESHOLDS } from "./inspection.constants";
import { validateInspectionInput, validateInspectionResult } from "./inspection.schema";
import type { DocumentInspectionInput, DocumentInspectionResult, InspectionWarning } from "./inspection.types";
import { calculateOverallConfidence, clampConfidence, decodeBase64Document, normalizeInspectionText, safeInspectionId } from "./inspection.utils";

function pageCountFromPdf(raw: string) {
  const count = (raw.match(/\/Type\s*\/Page\b/g) ?? []).length;
  return Math.max(1, count);
}

function sampleNativeText(input: DocumentInspectionInput) {
  const buffer = decodeBase64Document(input.base64);
  if (!buffer.length) return normalizeInspectionText(input.textSample ?? "");
  if (input.mimeType === "application/pdf") return extractPdfText(buffer);
  if (input.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return extractDocxText(buffer);
  if (input.mimeType === "text/plain") return normalizeInspectionText(buffer.toString("utf8"));
  return normalizeInspectionText(input.textSample ?? "");
}

function pageCountFor(input: DocumentInspectionInput, rawText: string) {
  if (input.mimeType === "application/pdf") return pageCountFromPdf(rawText);
  return 1;
}

function warningStatus(warnings: InspectionWarning[]): DocumentInspectionResult["status"] {
  if (warnings.some((warning) => warning.severity === "error")) return "failed";
  if (warnings.length) return "completed_with_warnings";
  return "completed";
}

export async function inspectDocument(input: DocumentInspectionInput): Promise<DocumentInspectionResult> {
  const startedAt = Date.now();
  validateInspectionInput(input);
  console.info("[document-inspection] started", { documentId: input.documentId, userId: input.userId, mimeType: input.mimeType });

  try {
    const buffer = decodeBase64Document(input.base64);
    const rawText = buffer.length ? buffer.toString(input.mimeType === "application/pdf" ? "latin1" : "utf8") : "";
    const nativeText = sampleNativeText(input);
    const pageCount = pageCountFor(input, rawText);
    const sourceDetection = detectDocumentSource({ mimeType: input.mimeType, pageCount, nativeText, textByPage: nativeText.split(/\f|(?:\n\s*page\s+\d+\s*\n)/i) });
    const ocrDecision = determineOcrRequirement({
      sourceType: sourceDetection.type,
      hasTextLayer: sourceDetection.hasTextLayer,
      textPageRatio: sourceDetection.textPageRatio,
      nativeText,
      pageCount
    });
    const documentType = detectDocumentType({ filename: input.fileName, text: nativeText, mimeType: input.mimeType });
    const languages = detectLanguages(nativeText);
    const { layout, readingOrder } = detectLayout({ text: nativeText, mimeType: input.mimeType, pageCount, rawText });
    const orientation = detectOrientation({ mimeType: input.mimeType, rawText, text: nativeText, pageCount });
    const { quality, warnings: qualityWarnings } = analyzeQuality({ mimeType: input.mimeType, sizeBytes: input.sizeBytes, text: nativeText, sourceNeedsOcr: ocrDecision.required, orientation });
    const warnings: InspectionWarning[] = [...qualityWarnings];

    if (pageCount > INSPECTION_THRESHOLDS.maxPageCount) {
      warnings.push({ code: "possible_missing_page", severity: "error", message: "This document has too many pages for the current inspection limit." });
    }
    if (languages.length > 1 && languages.every((language) => language.confidence > 0.35)) {
      warnings.push({ code: "mixed_languages", severity: "info", message: "This document appears to use more than one language. PATHZY will preserve the detected language context for extraction." });
    }
    if (layout.complexity === "complex") {
      warnings.push({ code: "complex_layout", severity: "warning", message: "This document has a complex layout. PATHZY may ask you to review extracted information before saving it." });
    }

    const confidenceBase = {
      documentType: documentType.confidence,
      sourceDetection: sourceDetection.confidence,
      languageDetection: clampConfidence(languages[0]?.confidence ?? 0.45),
      layoutDetection: layout.readingOrderDetected ? (layout.complexity === "simple" ? 0.86 : layout.complexity === "moderate" ? 0.76 : 0.64) : 0.5,
      qualityDetection: quality.confidence
    };
    const confidence = {
      ...confidenceBase,
      overall: calculateOverallConfidence(confidenceBase)
    };
    if (confidence.overall < INSPECTION_THRESHOLDS.lowConfidence) {
      warnings.push({ code: "low_confidence", severity: confidence.overall < INSPECTION_THRESHOLDS.manualReviewConfidence ? "warning" : "info", message: "Some parts of this document could not be inspected confidently. You may be asked to review the extracted information." });
    }

    const resultBase = {
      id: safeInspectionId(input.documentId),
      documentId: input.documentId,
      status: warningStatus(warnings),
      documentType,
      source: {
        type: sourceDetection.type,
        isScanned: sourceDetection.isScanned,
        isDigitalPdf: sourceDetection.isDigitalPdf,
        hasTextLayer: sourceDetection.hasTextLayer,
        ocrRequired: ocrDecision.required,
        ocrReason: ocrDecision.reason
      },
      file: {
        filename: input.fileName,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        pageCount
      },
      languages,
      layout,
      orientation,
      quality,
      readingOrder,
      warnings,
      confidence,
      provider: {
        inspectionEngine: "pathzy-local-document-inspector",
        version: "phase-2"
      },
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    } satisfies Omit<DocumentInspectionResult, "recommendedPipeline">;
    const result: DocumentInspectionResult = {
      ...resultBase,
      recommendedPipeline: selectProcessingStrategy(resultBase)
    };

    validateInspectionResult(result);
    console.info("[document-inspection] completed", {
      documentId: input.documentId,
      strategy: result.recommendedPipeline.strategy,
      confidence: result.confidence.overall,
      ocrRequired: result.source.ocrRequired,
      durationMs: Date.now() - startedAt
    });
    return result;
  } catch (caught) {
    console.error("[document-inspection] failed", { documentId: input.documentId, message: caught instanceof Error ? caught.message : "Unknown inspection failure" });
    throw caught;
  }
}

export async function saveDocumentInspection(supabase: SupabaseClient, userId: string, inspection: DocumentInspectionResult, errorMessage: string | null = null) {
  const { data, error } = await supabase
    .from("document_inspections")
    .upsert(
      {
        document_id: inspection.documentId,
        user_id: userId,
        status: inspection.status,
        document_type: inspection.documentType.value,
        document_type_confidence: inspection.documentType.confidence,
        source_type: inspection.source.type,
        is_scanned: inspection.source.isScanned,
        has_text_layer: inspection.source.hasTextLayer,
        ocr_required: inspection.source.ocrRequired,
        primary_language: inspection.languages.find((language) => language.primary)?.code ?? null,
        page_count: inspection.file.pageCount,
        column_count: inspection.layout.columnCount,
        has_tables: inspection.layout.hasTables,
        has_images: inspection.layout.hasImages,
        overall_quality: inspection.quality.overall,
        overall_confidence: inspection.confidence.overall,
        recommended_strategy: inspection.recommendedPipeline.strategy,
        manual_review_required: inspection.recommendedPipeline.manualReviewRequired,
        result_json: inspection,
        error_message: errorMessage,
        completed_at: inspection.completedAt ?? null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "document_id" }
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function markDocumentInspectionProcessing(supabase: SupabaseClient, input: DocumentInspectionInput) {
  await supabase
    .from("document_inspections")
    .upsert(
      {
        document_id: input.documentId,
        user_id: input.userId,
        status: "processing",
        document_type: "unknown",
        result_json: {},
        error_message: null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "document_id" }
    );
}

export async function markDocumentInspectionFailed(supabase: SupabaseClient, input: DocumentInspectionInput, errorMessage: string) {
  await supabase
    .from("document_inspections")
    .upsert(
      {
        document_id: input.documentId,
        user_id: input.userId,
        status: "failed",
        document_type: "unknown",
        result_json: {},
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      },
      { onConflict: "document_id" }
    );
}

export async function inspectAndPersistDocument(supabase: SupabaseClient, input: DocumentInspectionInput) {
  await markDocumentInspectionProcessing(supabase, input);
  try {
    const inspection = await inspectDocument(input);
    await saveDocumentInspection(supabase, input.userId, inspection);
    return inspection;
  } catch (caught) {
    await markDocumentInspectionFailed(supabase, input, caught instanceof Error ? caught.message : "Inspection failed");
    throw caught;
  }
}
