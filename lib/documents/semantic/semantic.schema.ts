import { SEMANTIC_THRESHOLDS } from "./semantic.constants";
import type { SemanticDocumentModel, SemanticEntity, SemanticRelationship } from "./semantic.types";

export class SemanticUnderstandingError extends Error {
  userMessage: string;
  code: string;

  constructor(code: string, message: string, userMessage = message) {
    super(message);
    this.name = "SemanticUnderstandingError";
    this.code = code;
    this.userMessage = userMessage;
  }
}

function validConfidence(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function assertEntity(entity: SemanticEntity) {
  if (!entity.id || !entity.type || !entity.category) throw new SemanticUnderstandingError("invalid_entity", "Semantic entity is missing required fields.");
  if (!entity.originalText && entity.type !== "current_employment") throw new SemanticUnderstandingError("invalid_entity", "Semantic entity is missing original text.");
  if (!entity.source.regionIds.length) throw new SemanticUnderstandingError("missing_source_evidence", "Semantic entity is missing source regions.");
  if (!validConfidence(entity.confidence)) throw new SemanticUnderstandingError("invalid_confidence", "Semantic entity confidence is invalid.");
}

function assertRelationship(relationship: SemanticRelationship, entityIds: Set<string>) {
  if (!entityIds.has(relationship.sourceEntityId) || !entityIds.has(relationship.targetEntityId)) {
    throw new SemanticUnderstandingError("invalid_relationship", "Semantic relationship references an unknown entity.");
  }
  if (!validConfidence(relationship.confidence)) throw new SemanticUnderstandingError("invalid_confidence", "Semantic relationship confidence is invalid.");
}

export function validateSemanticDocumentModel(model: SemanticDocumentModel) {
  if (!model.documentId || !model.inspectionId || !model.visualReadingId || !model.userId) {
    throw new SemanticUnderstandingError("missing_document", "Semantic model is missing document references.", "PATHZY could not understand this document yet. Please try again.");
  }
  const entityIds = new Set<string>();
  for (const entity of model.entities) {
    if (entityIds.has(entity.id)) throw new SemanticUnderstandingError("duplicate_entity", "Semantic entity IDs must be unique.");
    entityIds.add(entity.id);
    assertEntity(entity);
  }
  for (const relationship of model.relationships) assertRelationship(relationship, entityIds);
  for (const value of Object.values(model.confidence)) {
    if (!validConfidence(value)) throw new SemanticUnderstandingError("invalid_confidence", "Semantic confidence is invalid.");
  }
  if (model.confidence.overall < SEMANTIC_THRESHOLDS.manualReviewRequired && model.status === "completed") {
    throw new SemanticUnderstandingError("invalid_status", "Low-confidence semantic results must require review.");
  }
  return model;
}
