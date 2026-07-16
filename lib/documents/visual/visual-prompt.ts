import type { DocumentInspectionResult } from "@/lib/documents/inspection";

export function buildVisualReadingPrompt(inspection: DocumentInspectionResult) {
  return [
    "Analyze this page as a visually structured document.",
    "This is not a semantic extraction prompt; this is visual layout analysis.",
    "Do not summarize it. Do not rewrite it. Do not extract final profile fields.",
    "Identify page regions, visible text hierarchy, columns, tables, timelines, icons, logos, images, dates, grouped content and reading order.",
    "Preserve original visible text where possible.",
    "Use normalized coordinates between 0 and 1.",
    "Return uncertainty explicitly and valid structured JSON only.",
    `Expected document type: ${inspection.documentType.value}.`,
    `Expected language: ${inspection.languages.find((language) => language.primary)?.name ?? "unknown"}.`,
    `Phase 2 layout signal: ${inspection.layout.columnCount} column(s), tables=${inspection.layout.hasTables}, images=${inspection.layout.hasImages}.`
  ].join("\n");
}
