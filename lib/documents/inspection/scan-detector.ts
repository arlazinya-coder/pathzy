import { INSPECTION_THRESHOLDS } from "./inspection.constants";
import type { DocumentSourceType, OcrDecision } from "./inspection.types";
import { wordCount } from "./inspection.utils";

export type SourceDetectionInput = {
  mimeType: string;
  pageCount: number;
  nativeText: string;
  textByPage?: string[];
};

export function detectDocumentSource(input: SourceDetectionInput) {
  const isImage = input.mimeType === "image/png" || input.mimeType === "image/jpeg";
  const isPdf = input.mimeType === "application/pdf";
  const meaningfulPages = (input.textByPage?.length ? input.textByPage : [input.nativeText]).filter((text) => {
    return text.replace(/\s/g, "").length >= INSPECTION_THRESHOLDS.minNativeCharactersPerPage && wordCount(text) >= INSPECTION_THRESHOLDS.minNativeTextWordsPerPage;
  }).length;
  const textPageRatio = input.pageCount > 0 ? meaningfulPages / input.pageCount : 0;
  const hasTextLayer = input.nativeText.replace(/\s/g, "").length >= INSPECTION_THRESHOLDS.minReadableCharacters;

  let type: DocumentSourceType = "digital";
  if (isImage) type = "image";
  else if (isPdf && textPageRatio <= 0.15) type = "scanned";
  else if (isPdf && textPageRatio > 0.15 && textPageRatio < INSPECTION_THRESHOLDS.minNativeTextPageRatio) type = "mixed";

  return {
    type,
    isScanned: type === "scanned",
    isDigitalPdf: isPdf && type === "digital",
    hasTextLayer,
    confidence: isImage ? 0.95 : hasTextLayer ? 0.86 : 0.78,
    textPageRatio
  };
}

export function determineOcrRequirement(input: {
  sourceType: DocumentSourceType;
  hasTextLayer: boolean;
  textPageRatio: number;
  nativeText: string;
  pageCount: number;
}): OcrDecision {
  if (input.sourceType === "image") return { required: true, reason: "The uploaded file is an image.", pages: [1] };
  if (input.sourceType === "scanned") return { required: true, reason: "The PDF appears to contain scanned pages without meaningful selectable text." };
  if (input.sourceType === "mixed") return { required: true, reason: "Some pages appear digital while others need OCR." };
  if (!input.hasTextLayer) return { required: true, reason: "A meaningful text layer was not detected." };
  if (input.nativeText.replace(/\s/g, "").length < INSPECTION_THRESHOLDS.minReadableCharacters) {
    return { required: true, reason: "Native text extraction returned too little usable text." };
  }
  return { required: false, reason: "Native text appears reliable enough for extraction." };
}
