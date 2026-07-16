import { INSPECTION_THRESHOLDS } from "./inspection.constants";
import type { DocumentInspectionResult, InspectionWarning } from "./inspection.types";
import { wordCount } from "./inspection.utils";

export function detectOrientation(input: { mimeType: string; rawText?: string; text: string; pageCount: number }): DocumentInspectionResult["orientation"] {
  const rotateMatches = Array.from((input.rawText ?? "").matchAll(/\/Rotate\s+(\d+)/g)).map((match) => Number(match[1]));
  const rotations = rotateMatches.length ? rotateMatches : Array.from({ length: Math.max(1, input.pageCount) }, () => 0);
  const unique = Array.from(new Set(rotations));
  const value = unique.length > 1 ? "mixed" : unique[0] === 90 ? "rotated_90" : unique[0] === 180 ? "rotated_180" : unique[0] === 270 ? "rotated_270" : "portrait";
  return {
    value,
    rotationDegreesByPage: rotations,
    autoRotationRecommended: value.startsWith("rotated") || value === "mixed"
  };
}

export function analyzeQuality(input: { mimeType: string; sizeBytes: number; text: string; sourceNeedsOcr: boolean; orientation: DocumentInspectionResult["orientation"] }) {
  const words = wordCount(input.text);
  const image = input.mimeType.startsWith("image/");
  const tinyImage = image && input.sizeBytes < INSPECTION_THRESHOLDS.minImageBytesForGoodQuality;
  const lowText = !image && words < INSPECTION_THRESHOLDS.minReadableCharacters / 5;
  const rotated = input.orientation.autoRotationRecommended;
  const poor = tinyImage || (input.sourceNeedsOcr && lowText);
  const fair = rotated || input.sourceNeedsOcr || lowText;
  const quality: DocumentInspectionResult["quality"] = {
    overall: poor ? "poor" : fair ? "fair" : "good",
    confidence: poor ? 0.52 : fair ? 0.7 : 0.86,
    blur: tinyImage ? "medium" : "none",
    noise: tinyImage ? "medium" : "low",
    contrast: tinyImage ? "fair" : "good",
    brightness: "good",
    skewDetected: rotated,
    croppingDetected: false
  };
  const warnings: InspectionWarning[] = [];
  if (tinyImage) warnings.push({ code: "low_resolution", severity: "warning", message: "This document may be too low-resolution to extract accurately. Upload a clearer copy for better results." });
  if (rotated) warnings.push({ code: "rotated_page", severity: "info", message: "One or more pages appear rotated. PATHZY will recommend automatic rotation before extraction." });
  if (input.sourceNeedsOcr) warnings.push({ code: "missing_text_layer", severity: "info", message: "This document needs OCR before PATHZY can extract reliable text." });
  return { quality, warnings };
}
