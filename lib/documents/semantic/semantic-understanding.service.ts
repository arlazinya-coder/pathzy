import type { SupabaseClient } from "@supabase/supabase-js";
import { SEMANTIC_PROCESSING_VERSION, SEMANTIC_TAXONOMY_VERSION } from "./semantic.constants";
import { buildLocalSemanticModel } from "./local-semantic-reader";
import { buildSemanticUnderstandingPrompt } from "./semantic-prompt";
import { SemanticUnderstandingError, validateSemanticDocumentModel } from "./semantic.schema";
import type { SemanticDocumentModel, SemanticUnderstandingInput } from "./semantic.types";

async function visualReadingRecordIdFor(supabase: SupabaseClient, userId: string, documentId: string) {
  const { data } = await supabase
    .from("document_visual_readings")
    .select("id")
    .eq("user_id", userId)
    .eq("document_id", documentId)
    .maybeSingle();
  return typeof data?.id === "string" ? data.id : null;
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

export async function markSemanticUnderstandingProcessing(supabase: SupabaseClient, input: SemanticUnderstandingInput) {
  const [inspectionRecordId, visualReadingRecordId] = await Promise.all([
    inspectionRecordIdFor(supabase, input.userId, input.documentId),
    visualReadingRecordIdFor(supabase, input.userId, input.documentId)
  ]);
  await supabase
    .from("document_semantic_readings")
    .upsert(
      {
        document_id: input.documentId,
        inspection_record_id: inspectionRecordId,
        visual_reading_record_id: visualReadingRecordId,
        inspection_id: input.inspection.id,
        visual_reading_id: input.visualReading.id,
        user_id: input.userId,
        status: "processing",
        document_type: input.inspection.documentType.value,
        model_name: "pathzy-local-semantic-reader",
        taxonomy_version: SEMANTIC_TAXONOMY_VERSION,
        processing_version: SEMANTIC_PROCESSING_VERSION,
        result_json: {},
        error_message: null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "document_id" }
    );
}

export async function markSemanticUnderstandingFailed(supabase: SupabaseClient, input: SemanticUnderstandingInput, errorMessage: string) {
  await supabase
    .from("document_semantic_readings")
    .upsert(
      {
        document_id: input.documentId,
        inspection_id: input.inspection.id,
        visual_reading_id: input.visualReading.id,
        user_id: input.userId,
        status: "failed",
        document_type: input.inspection.documentType.value,
        taxonomy_version: SEMANTIC_TAXONOMY_VERSION,
        processing_version: SEMANTIC_PROCESSING_VERSION,
        result_json: {},
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: "document_id" }
    );
}

export async function runSemanticUnderstanding(input: SemanticUnderstandingInput): Promise<SemanticDocumentModel> {
  if (input.visualReading.status === "failed") {
    throw new SemanticUnderstandingError("missing_visual_reading", "Semantic understanding requires a completed visual reading.", "PATHZY needs to finish reading the document layout before understanding the content.");
  }
  const model = buildLocalSemanticModel(input);
  buildSemanticUnderstandingPrompt(model.entities);
  return validateSemanticDocumentModel(model);
}

export async function saveSemanticUnderstanding(supabase: SupabaseClient, userId: string, model: SemanticDocumentModel, errorMessage: string | null = null) {
  const [inspectionRecordId, visualReadingRecordId] = await Promise.all([
    inspectionRecordIdFor(supabase, userId, model.documentId),
    visualReadingRecordIdFor(supabase, userId, model.documentId)
  ]);
  const { data, error } = await supabase
    .from("document_semantic_readings")
    .upsert(
      {
        document_id: model.documentId,
        inspection_record_id: inspectionRecordId,
        visual_reading_record_id: visualReadingRecordId,
        inspection_id: model.inspectionId,
        visual_reading_id: model.visualReadingId,
        user_id: userId,
        status: model.status,
        document_type: model.documentType,
        primary_language: model.primaryLanguage ?? null,
        detected_profession: model.professionalProfile?.profession?.value ?? model.professionalProfile?.headline?.value ?? null,
        employment_count: model.employment.length,
        education_count: model.education.length,
        certification_count: model.certifications.length,
        skill_count: model.skills.length,
        language_count: model.languages.length,
        conflict_count: model.conflicts.length,
        overall_confidence: model.confidence.overall,
        manual_review_required: model.status === "manual_review_required" || model.warnings.some((warning) => warning.code === "manual_review_required"),
        model_name: model.provider?.model ?? "pathzy-local-semantic-reader",
        taxonomy_version: model.provider?.taxonomyVersion ?? SEMANTIC_TAXONOMY_VERSION,
        processing_version: model.provider?.version ?? SEMANTIC_PROCESSING_VERSION,
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

  const entityRows = model.entities.map((entity) => ({
    semantic_reading_id: data.id,
    document_id: model.documentId,
    user_id: userId,
    entity_type: entity.type,
    category: entity.category,
    original_text: entity.originalText,
    normalized_value: entity.normalizedValue ?? null,
    confidence: entity.confidence,
    explicitness: entity.explicitness,
    requires_review: entity.requiresReview,
    review_status: entity.reviewStatus,
    source_json: entity.source,
    evidence_json: entity.evidence,
    created_at: new Date().toISOString()
  }));
  await supabase.from("document_semantic_entities").delete().eq("semantic_reading_id", data.id).eq("user_id", userId);
  if (entityRows.length) {
    const { error: entityError } = await supabase.from("document_semantic_entities").insert(entityRows);
    if (entityError) throw entityError;
  }
  const relationshipRows = model.relationships.map((relationship) => ({
    semantic_reading_id: data.id,
    document_id: model.documentId,
    user_id: userId,
    source_entity_id: relationship.sourceEntityId,
    target_entity_id: relationship.targetEntityId,
    relationship_type: relationship.type,
    confidence: relationship.confidence,
    evidence_json: relationship.evidenceRegionIds,
    created_at: new Date().toISOString()
  }));
  await supabase.from("document_semantic_relationships").delete().eq("semantic_reading_id", data.id).eq("user_id", userId);
  if (relationshipRows.length) {
    const { error: relationshipError } = await supabase.from("document_semantic_relationships").insert(relationshipRows);
    if (relationshipError) throw relationshipError;
  }
  return data;
}

export async function runAndPersistSemanticUnderstanding(supabase: SupabaseClient, input: SemanticUnderstandingInput) {
  const startedAt = Date.now();
  console.info("[semantic-understanding] started", { documentId: input.documentId, taxonomyVersion: SEMANTIC_TAXONOMY_VERSION });
  await markSemanticUnderstandingProcessing(supabase, input);
  try {
    const model = await runSemanticUnderstanding(input);
    await saveSemanticUnderstanding(supabase, input.userId, model);
    console.info("[semantic-understanding] completed", {
      documentId: input.documentId,
      status: model.status,
      entities: model.entities.length,
      employment: model.employment.length,
      education: model.education.length,
      confidence: model.confidence.overall,
      durationMs: Date.now() - startedAt,
      taxonomyVersion: SEMANTIC_TAXONOMY_VERSION
    });
    return model;
  } catch (caught) {
    console.error("[semantic-understanding] failed", { documentId: input.documentId, message: caught instanceof Error ? caught.message : "Unknown semantic failure" });
    await markSemanticUnderstandingFailed(supabase, input, caught instanceof Error ? caught.message : "Semantic understanding failed");
    throw caught;
  }
}
