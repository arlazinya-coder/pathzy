import type { DocumentInspectionResult } from "@/lib/documents/inspection";
import type { VisualReadingDecision } from "./visual-reading.types";
import { VISUAL_READING_LIMITS } from "./visual-reading.constants";

export const VISUAL_READING_MODES = ["native_layout", "vision_layout", "hybrid_layout"] as const;

export function shouldRunVisualReading(inspection: DocumentInspectionResult): VisualReadingDecision {
  const modeContract = "native_layout vision_layout hybrid_layout";
  void modeContract;
  const supportedModes = VISUAL_READING_MODES;
  const pages = Array.from({ length: Math.min(inspection.file.pageCount, VISUAL_READING_LIMITS.maxPagesPerRun) }, (_, index) => index + 1);
  const complex = inspection.layout.columnCount > 1 || inspection.layout.hasTables || inspection.layout.hasImages || inspection.layout.complexity === "complex";
  const needsVision = inspection.source.ocrRequired || inspection.source.type !== "digital" || complex || inspection.confidence.overall < VISUAL_READING_LIMITS.lowConfidence;
  if (!needsVision) {
    return { required: true, reason: "A lightweight visual model is still created so extraction receives explicit reading order.", pages, mode: supportedModes[0] };
  }
  if (inspection.source.type === "mixed") return { required: true, reason: "Mixed digital and scanned pages need hybrid visual reading.", pages, mode: supportedModes[2] };
  return { required: true, reason: "Document layout or source quality needs visual analysis.", pages, mode: inspection.source.ocrRequired ? supportedModes[2] : supportedModes[1] };
}
