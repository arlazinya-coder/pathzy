import { INSPECTION_THRESHOLDS } from "./inspection.constants";
import type { DocumentInspectionResult } from "./inspection.types";

export function selectProcessingStrategy(inspection: Pick<DocumentInspectionResult, "source" | "quality" | "confidence" | "warnings">): DocumentInspectionResult["recommendedPipeline"] {
  const manualReviewRequired = inspection.confidence.overall < INSPECTION_THRESHOLDS.manualReviewConfidence || inspection.quality.overall === "poor";
  if (inspection.warnings.some((warning) => warning.severity === "error")) {
    return {
      strategy: "manual_review",
      steps: ["Stop extraction", "Show actionable error", "Allow replacement upload or manual entry"],
      extractionAllowed: false,
      manualReviewRequired: true
    };
  }
  if (inspection.source.type === "mixed") {
    return {
      strategy: "hybrid",
      steps: ["Native extraction on digital pages", "OCR on scanned pages", "Merge page results", "Apply layout-aware reading order", "Continue to document-specific parsing"],
      extractionAllowed: true,
      manualReviewRequired
    };
  }
  if (inspection.source.type === "image") {
    return {
      strategy: "image_ocr",
      steps: ["Image preprocessing", "OCR", "Layout analysis", "Section detection", "Manual review if confidence is low"],
      extractionAllowed: true,
      manualReviewRequired: true
    };
  }
  if (inspection.source.ocrRequired) {
    return {
      strategy: "ocr",
      steps: ["Image enhancement", "OCR", "Layout analysis", "Section detection", "Document-specific parsing"],
      extractionAllowed: true,
      manualReviewRequired
    };
  }
  return {
    strategy: "native_text",
    steps: ["Native text extraction", "Layout analysis", "Section detection", "Document-specific parsing"],
    extractionAllowed: true,
    manualReviewRequired
  };
}
