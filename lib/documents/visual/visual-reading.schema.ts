import type { BoundingBox, VisualDocumentModel } from "./visual-reading.types";

export class VisualReadingError extends Error {
  userMessage: string;
  code: string;

  constructor(code: string, message: string, userMessage = message) {
    super(message);
    this.name = "VisualReadingError";
    this.code = code;
    this.userMessage = userMessage;
  }
}

function validBox(box: BoundingBox) {
  return box.unit === "normalized" && [box.x, box.y, box.width, box.height].every((value) => Number.isFinite(value) && value >= 0 && value <= 1) && box.width > 0 && box.height > 0;
}

function validConfidence(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

export function validateVisualDocumentModel(model: VisualDocumentModel) {
  if (!model.documentId || !model.inspectionId) throw new VisualReadingError("missing_document", "Visual reading is missing document references.", "PATHZY could not read this document layout. Please try again.");
  for (const page of model.pages) {
    if (!validConfidence(page.confidence)) throw new VisualReadingError("invalid_confidence", "Page confidence is invalid.");
    for (const region of page.regions) {
      if (!validBox(region.boundingBox)) throw new VisualReadingError("invalid_bounding_box", "A visual region has invalid coordinates.");
      if (!validConfidence(region.confidence)) throw new VisualReadingError("invalid_confidence", "A visual region confidence is invalid.");
    }
  }
  for (const value of Object.values(model.confidence)) {
    if (!validConfidence(value)) throw new VisualReadingError("invalid_confidence", "Visual reading confidence is invalid.");
  }
  return model;
}
