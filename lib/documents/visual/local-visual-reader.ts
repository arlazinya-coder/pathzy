import type { DocumentInspectionResult } from "@/lib/documents/inspection";
import { normalizeInspectionText, wordCount } from "@/lib/documents/inspection";
import { VISUAL_CONFIDENCE_WEIGHTS } from "./visual-reading.constants";
import type {
  BoundingBox,
  RenderedDocument,
  VisualDocumentModel,
  VisualDocumentReader,
  VisualIconElement,
  VisualImageElement,
  VisualReadingDecision,
  VisualRegion,
  VisualRelationship,
  VisualSection,
  VisualTable,
  VisualTimeline
} from "./visual-reading.types";

const sectionPatterns: Array<[string, RegExp]> = [
  ["summary", /^(professional\s+)?(summary|profile|objective|profil|resume)$/i],
  ["experience", /^(professional\s+)?(experience|work experience|employment history|exp[ée]rience professionnelle|parcours professionnel)$/i],
  ["education", /^(education|formation|academic background|qualifications|dipl[oô]mes?)$/i],
  ["skills", /^(skills|competencies|comp[ée]tences|technical skills)$/i],
  ["certifications", /^(certifications?|certificats?|licenses?|licences?)$/i],
  ["languages", /^(languages|langues)$/i],
  ["references", /^(references?|r[ée]f[ée]rences)$/i],
  ["contact", /^(contact|coordonn[ée]es)$/i]
];
const datePattern = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|janvier|fevrier|février|mars|avril|mai|juin|juillet|aout|août|septembre|octobre|novembre|decembre|décembre)?\.?\s*(?:19|20)\d{2}\s*(?:[-–—/]|to|au|à)?\s*(?:present|current|now|aujourd'hui|à ce jour|a ce jour|(?:19|20)\d{2})?\b|\b(?:present|current|depuis\s+(?:19|20)\d{2})\b/i;
const iconRules: Array<[VisualIconElement["type"], RegExp]> = [
  ["email", /@/],
  ["phone", /(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?){2,5}\d{2,4}/],
  ["linkedin", /linkedin/i],
  ["github", /github/i],
  ["website", /https?:\/\/|www\./i],
  ["location", /\b(johannesburg|cape town|pretoria|south africa|france|canada|london|paris)\b/i],
  ["calendar", datePattern]
];

function box(x: number, y: number, width: number, height: number): BoundingBox {
  return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)), width: Math.max(0.01, Math.min(1, width)), height: Math.max(0.01, Math.min(1, height)), unit: "normalized" };
}

function normalizeSection(line: string) {
  const clean = line.replace(/[:\-]+$/g, "").trim();
  return sectionPatterns.find(([, pattern]) => pattern.test(clean)) ?? null;
}

function isHeading(line: string) {
  return Boolean(normalizeSection(line)) || (/^[A-ZÀ-Ÿ][A-ZÀ-Ÿ\s/&-]{3,}$/.test(line) && line.length <= 70);
}

function detectIconType(text: string): VisualIconElement["type"] | null {
  return iconRules.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
}

function confidence(values: VisualDocumentModel["confidence"]) {
  return Math.max(0, Math.min(1, Number((
    values.layout * VISUAL_CONFIDENCE_WEIGHTS.layout +
    values.hierarchy * VISUAL_CONFIDENCE_WEIGHTS.hierarchy +
    values.readingOrder * VISUAL_CONFIDENCE_WEIGHTS.readingOrder +
    values.tables * VISUAL_CONFIDENCE_WEIGHTS.tables +
    values.timelines * VISUAL_CONFIDENCE_WEIGHTS.timelines +
    values.imageClassification * VISUAL_CONFIDENCE_WEIGHTS.imageClassification +
    values.iconInterpretation * VISUAL_CONFIDENCE_WEIGHTS.iconInterpretation
  ).toFixed(3))));
}

export class LocalVisualDocumentReader implements VisualDocumentReader {
  async analyze(input: { inspection: DocumentInspectionResult; rendered: RenderedDocument; nativeText: string; decision: VisualReadingDecision }): Promise<VisualDocumentModel> {
    return buildLocalVisualModel(input.inspection, input.rendered, input.nativeText, input.decision);
  }
}

export function buildLocalVisualModel(inspection: DocumentInspectionResult, rendered: RenderedDocument, nativeText: string, decision: VisualReadingDecision): VisualDocumentModel {
  const text = normalizeInspectionText(nativeText);
  const lines = text.split("\n").filter(Boolean);
  const page = rendered.pages[0] ?? { pageNumber: 1, width: 1240, height: 1754, mimeType: "image/png" };
  const columnCount = Math.max(1, inspection.layout.columnCount);
  const leftWidth = columnCount > 1 ? 0.31 : 0;
  const regions: VisualRegion[] = [];
  const relationships: VisualRelationship[] = [];
  const sections: VisualSection[] = [];
  const icons: VisualIconElement[] = [];
  let currentSectionId: string | undefined;
  let order = 1;

  lines.slice(0, 80).forEach((line, index) => {
    const heading = isHeading(line);
    const inSidebar = columnCount > 1 && (/@|linkedin|github|phone|skills|languages|contact/i.test(line) || index < Math.min(12, lines.length / 4));
    const x = inSidebar ? 0.05 : columnCount > 1 ? 0.38 : 0.08;
    const width = inSidebar ? leftWidth - 0.08 : columnCount > 1 ? 0.55 : 0.84;
    const y = Math.min(0.92, 0.06 + index * 0.026);
    const type: VisualRegion["type"] = index === 0 ? "document_title" : heading ? "section_header" : line.includes(":") ? "label_value_pair" : /^[-•*]/.test(line) ? "list_item" : "body_text";
    const region: VisualRegion = {
      id: `r-${order}`,
      pageNumber: page.pageNumber,
      type,
      boundingBox: box(x, y, width, heading ? 0.022 : 0.019),
      readingOrder: order,
      confidence: heading ? 0.84 : 0.72,
      detectedText: line,
      textSource: inspection.source.ocrRequired ? "hybrid" : "native",
      parentRegionId: currentSectionId,
      childRegionIds: [],
      style: { fontSize: index === 0 ? "title" : heading ? "large" : "body", weight: heading || index === 0 ? "bold" : "regular", alignment: "left", emphasis: heading }
    };
    if (heading) {
      currentSectionId = region.id;
      const normalized = normalizeSection(line)?.[0] ?? null;
      sections.push({ id: `section-${sections.length + 1}`, title: line, normalizedType: normalized, pageNumber: page.pageNumber, boundingBox: region.boundingBox, regionIds: [region.id], confidence: normalized ? 0.86 : 0.62 });
    } else if (sections.length) {
      sections[sections.length - 1].regionIds.push(region.id);
      relationships.push({ id: `rel-${relationships.length + 1}`, type: "belongs_to_section", sourceRegionId: region.id, targetRegionId: sections[sections.length - 1].regionIds[0], confidence: 0.78 });
    }
    const iconType = detectIconType(line);
    if (iconType) {
      const iconId = `icon-${icons.length + 1}`;
      icons.push({ id: iconId, pageNumber: page.pageNumber, type: iconType, boundingBox: box(Math.max(0.01, x - 0.025), y, 0.018, 0.018), nearbyTextRegionIds: [region.id], confidence: 0.76 });
      relationships.push({ id: `rel-${relationships.length + 1}`, type: iconType === "calendar" ? "date_for" : "icon_labels_text", sourceRegionId: iconId, targetRegionId: region.id, confidence: 0.78 });
    }
    regions.push(region);
    order += 1;
  });

  const dateRegions = regions.filter((region) => datePattern.test(region.detectedText));
  const timelines: VisualTimeline[] = dateRegions.length ? [{
    id: "timeline-1",
    pageNumber: page.pageNumber,
    orientation: "vertical",
    title: sections.find((section) => /experience|education|formation/i.test(section.normalizedType ?? section.title))?.title,
    entries: dateRegions.map((region, index) => ({
      id: `timeline-entry-${index + 1}`,
      dateRegionIds: [region.id],
      titleRegionIds: regions.slice(Math.max(0, regions.indexOf(region) - 2), regions.indexOf(region)).map((item) => item.id),
      organisationRegionIds: regions.slice(regions.indexOf(region) + 1, regions.indexOf(region) + 2).map((item) => item.id),
      descriptionRegionIds: regions.slice(regions.indexOf(region) + 2, regions.indexOf(region) + 4).map((item) => item.id),
      relatedIconIds: icons.filter((icon) => icon.type === "calendar" && icon.nearbyTextRegionIds.includes(region.id)).map((icon) => icon.id),
      order: index + 1,
      confidence: 0.72
    })),
    confidence: 0.7
  }] : [];
  timelines.forEach((timeline) => timeline.entries.forEach((entry) => entry.dateRegionIds.forEach((dateId) => relationships.push({ id: `rel-${relationships.length + 1}`, type: "timeline_contains", sourceRegionId: timeline.id, targetRegionId: dateId, confidence: entry.confidence }))));

  const tableLines = lines.filter((line) => /\t| {3,}| : |;.*;|grade|credits?/i.test(line));
  const tables: VisualTable[] = inspection.layout.hasTables || tableLines.length ? [{
    id: "table-1",
    pageNumber: page.pageNumber,
    boundingBox: box(columnCount > 1 ? 0.38 : 0.08, 0.48, columnCount > 1 ? 0.55 : 0.84, Math.min(0.28, 0.035 * Math.max(2, tableLines.length))),
    headerRows: tableLines[0] ? [tableLines[0].split(/\t| {3,}| : |;/).map((cell) => cell.trim()).filter(Boolean)] : [],
    rows: tableLines.slice(1, 10).map((line, index) => ({ id: `table-row-${index + 1}`, cellRegionIds: [], values: line.split(/\t| {3,}| : |;/).map((cell) => cell.trim()).filter(Boolean), order: index + 1, confidence: 0.66 })),
    columnCount: Math.max(2, tableLines[0]?.split(/\t| {3,}| : |;/).filter(Boolean).length ?? 2),
    confidence: tableLines.length ? 0.72 : 0.58
  }] : [];

  const images: VisualImageElement[] = inspection.layout.hasImages ? [{
    id: "image-1",
    pageNumber: page.pageNumber,
    type: inspection.layout.hasProfilePhoto ? "profile_photo" : inspection.layout.hasLogos ? "logo" : "unknown",
    boundingBox: box(columnCount > 1 ? 0.06 : 0.76, 0.06, 0.14, 0.12),
    nearbyText: lines.slice(0, 3),
    relatedRegionIds: regions.slice(0, 3).map((region) => region.id),
    confidence: 0.62
  }] : [];

  const visualConfidence = {
    layout: columnCount > 1 || sections.length ? 0.82 : 0.74,
    hierarchy: sections.length ? 0.78 : 0.58,
    readingOrder: columnCount > 1 ? 0.76 : 0.84,
    tables: tables.length ? tables[0].confidence : 0.74,
    timelines: timelines.length ? timelines[0].confidence : 0.68,
    imageClassification: images.length ? images[0].confidence : 0.74,
    iconInterpretation: icons.length ? 0.76 : 0.68,
    overall: 0
  };
  visualConfidence.overall = confidence(visualConfidence);
  const warnings = [
    ...(visualConfidence.readingOrder < 0.78 ? [{ code: "ambiguous_reading_order" as const, severity: "warning" as const, message: "The document has a layout that may need review before final extraction.", pageNumber: page.pageNumber, confidence: visualConfidence.readingOrder }] : []),
    ...(visualConfidence.overall < 0.6 ? [{ code: "manual_review_recommended" as const, severity: "warning" as const, message: "Visual reading confidence is low. Manual review is recommended.", confidence: visualConfidence.overall }] : [])
  ];

  return {
    id: `visual-${inspection.documentId}`,
    documentId: inspection.documentId,
    inspectionId: inspection.id,
    status: warnings.length ? "completed_with_warnings" : "completed",
    documentType: inspection.documentType.value,
    primaryLanguage: inspection.languages.find((language) => language.primary)?.code,
    pages: [{
      pageNumber: page.pageNumber,
      width: page.width,
      height: page.height,
      orientation: inspection.orientation.value,
      sourceType: decision.mode === "native_layout" ? "native" : decision.mode === "hybrid_layout" ? "hybrid" : "ocr",
      regions,
      readingOrder: regions.sort((a, b) => a.readingOrder - b.readingOrder).map((region) => region.id),
      confidence: visualConfidence.layout
    }],
    hierarchy: regions.filter((region) => region.type === "document_title" || region.type === "section_header").map((region, index) => ({ id: `h-${index + 1}`, regionId: region.id, level: region.type === "document_title" ? "document" : "section", label: region.detectedText, childIds: [], confidence: region.confidence })),
    sections,
    timelines,
    tables,
    images,
    icons,
    relationships,
    readingOrder: regions.map((region) => ({ order: region.readingOrder, pageNumber: region.pageNumber, regionId: region.id, sectionId: sections.find((section) => section.regionIds.includes(region.id))?.id, parentId: region.parentRegionId })),
    warnings,
    confidence: visualConfidence,
    provider: { visualModel: "pathzy-local-visual-reader", layoutEngine: "native-text-heuristic-fusion", version: "phase-3" },
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  };
}

export function nativeTextFromVisualModel(model: VisualDocumentModel) {
  return model.readingOrder
    .map((item) => model.pages.find((page) => page.pageNumber === item.pageNumber)?.regions.find((region) => region.id === item.regionId)?.detectedText ?? "")
    .filter(Boolean)
    .join("\n");
}
