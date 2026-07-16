import { INSPECTION_CONFIDENCE_WEIGHTS } from "./inspection.constants";
import type { DocumentInspectionResult } from "./inspection.types";

export class DocumentInspectionError extends Error {
  userMessage: string;
  code: string;

  constructor(code: string, message: string, userMessage = message) {
    super(message);
    this.name = "DocumentInspectionError";
    this.code = code;
    this.userMessage = userMessage;
  }
}

export function clampConfidence(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, Number(value.toFixed(3))));
}

export function decodeBase64Document(base64?: string) {
  const clean = (base64 ?? "").replace(/^data:[^;]+;base64,/, "").trim();
  if (!clean) return Buffer.alloc(0);
  return Buffer.from(clean, "base64");
}

export function normalizeInspectionText(value: string) {
  return value
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

export function wordCount(text: string) {
  return (text.match(/[\p{L}\p{N}'-]+/gu) ?? []).length;
}

export function countMatches(text: string, pattern: RegExp) {
  return (text.match(pattern) ?? []).length;
}

export function calculateOverallConfidence(input: Omit<DocumentInspectionResult["confidence"], "overall">) {
  return clampConfidence(
    input.documentType * INSPECTION_CONFIDENCE_WEIGHTS.documentType +
      input.sourceDetection * INSPECTION_CONFIDENCE_WEIGHTS.sourceDetection +
      input.languageDetection * INSPECTION_CONFIDENCE_WEIGHTS.languageDetection +
      input.layoutDetection * INSPECTION_CONFIDENCE_WEIGHTS.layoutDetection +
      input.qualityDetection * INSPECTION_CONFIDENCE_WEIGHTS.qualityDetection
  );
}

export function safeInspectionId(documentId: string) {
  return `inspection-${documentId}`;
}

export function extensionFromFilename(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}
