import type { DocumentInspectionResult, DocumentInspectionStatus } from "@/lib/documents/inspection";

export type VisualReadingStatus = DocumentInspectionStatus;
export type VisualRegionType =
  | "page_header" | "page_footer" | "document_title" | "section_header" | "subsection_header" | "body_text"
  | "left_column" | "main_column" | "right_column" | "sidebar" | "timeline" | "timeline_entry"
  | "table" | "table_row" | "table_cell" | "image" | "profile_photo" | "logo" | "icon"
  | "signature" | "stamp" | "qr_code" | "divider" | "badge" | "label_value_pair" | "card" | "list" | "list_item" | "unknown";

export type VisualIconType = "phone" | "email" | "location" | "website" | "linkedin" | "github" | "calendar" | "education" | "employment" | "skills" | "language" | "certification" | "unknown";
export type HierarchyLevel = "document" | "section" | "subsection" | "entry" | "field" | "detail";
export type VisualRelationshipType =
  | "belongs_to_section" | "labels" | "value_of" | "date_for" | "organisation_for" | "title_for" | "description_for"
  | "icon_labels_text" | "image_associated_with" | "continues_on_next_page" | "same_entry" | "table_contains" | "timeline_contains" | "unknown";
export type VisualReadingWarningCode =
  | "ambiguous_reading_order" | "overlapping_regions" | "low_layout_confidence" | "unclassified_section" | "unclassified_icon"
  | "table_structure_uncertain" | "timeline_structure_uncertain" | "cross_page_continuation_uncertain"
  | "image_classification_uncertain" | "native_text_mismatch" | "ocr_text_mismatch" | "provider_response_repaired"
  | "manual_review_recommended" | "visual_reading_failed";

export type BoundingBox = { x: number; y: number; width: number; height: number; unit: "normalized" };
export type RenderedPage = { pageNumber: number; width: number; height: number; imagePath?: string; storagePath?: string; mimeType: string; checksum?: string };
export type RenderedDocument = { documentId: string; pages: RenderedPage[]; createdAt: string };
export type DocumentRenderInput = { documentId: string; mimeType: string; pageCount: number; sourceType: string; base64?: string };

export type VisualRegion = {
  id: string;
  pageNumber: number;
  type: VisualRegionType;
  boundingBox: BoundingBox;
  readingOrder: number;
  confidence: number;
  detectedText: string;
  textSource: "native" | "ocr" | "vision" | "hybrid";
  parentRegionId?: string;
  childRegionIds: string[];
  style?: { fontSize?: "small" | "body" | "large" | "title"; weight?: "regular" | "bold"; alignment?: "left" | "center" | "right"; emphasis?: boolean };
  relatedRegionIds?: string[];
};

export type VisualPage = {
  pageNumber: number;
  width: number;
  height: number;
  orientation: string;
  sourceType: "native" | "ocr" | "hybrid";
  regions: VisualRegion[];
  readingOrder: string[];
  confidence: number;
};

export type VisualHierarchyNode = { id: string; regionId: string; level: HierarchyLevel; label: string; parentId?: string; childIds: string[]; confidence: number };
export type VisualSection = { id: string; title: string; normalizedType: string | null; pageNumber: number; boundingBox: BoundingBox; regionIds: string[]; confidence: number };
export type VisualReadingOrderItem = { order: number; pageNumber: number; regionId: string; sectionId?: string; parentId?: string };
export type VisualRelationship = { id: string; type: VisualRelationshipType; sourceRegionId: string; targetRegionId: string; confidence: number };
export type VisualTimelineEntry = { id: string; dateRegionIds: string[]; titleRegionIds: string[]; organisationRegionIds: string[]; descriptionRegionIds: string[]; relatedIconIds?: string[]; order: number; confidence: number };
export type VisualTimeline = { id: string; pageNumber: number; orientation: "vertical" | "horizontal"; title?: string; entries: VisualTimelineEntry[]; confidence: number };
export type VisualTableRow = { id: string; cellRegionIds: string[]; values: string[]; order: number; confidence: number };
export type VisualTable = { id: string; pageNumber: number; boundingBox: BoundingBox; headerRows: string[][]; rows: VisualTableRow[]; columnCount: number; confidence: number };
export type VisualImageElement = { id: string; pageNumber: number; type: "profile_photo" | "logo" | "signature" | "stamp" | "qr_code" | "decorative" | "unknown"; boundingBox: BoundingBox; nearbyText: string[]; relatedRegionIds: string[]; confidence: number };
export type VisualIconElement = { id: string; pageNumber: number; type: VisualIconType; boundingBox: BoundingBox; nearbyTextRegionIds: string[]; confidence: number };
export type VisualReadingWarning = { code: VisualReadingWarningCode; severity: "info" | "warning" | "error"; message: string; pageNumber?: number; relatedRegionIds?: string[]; confidence?: number };

export type VisualDocumentModel = {
  id: string;
  documentId: string;
  inspectionId: string;
  status: VisualReadingStatus;
  documentType: string;
  primaryLanguage?: string;
  pages: VisualPage[];
  hierarchy: VisualHierarchyNode[];
  sections: VisualSection[];
  timelines: VisualTimeline[];
  tables: VisualTable[];
  images: VisualImageElement[];
  icons: VisualIconElement[];
  relationships: VisualRelationship[];
  readingOrder: VisualReadingOrderItem[];
  warnings: VisualReadingWarning[];
  confidence: {
    layout: number;
    hierarchy: number;
    readingOrder: number;
    tables: number;
    timelines: number;
    imageClassification: number;
    iconInterpretation: number;
    overall: number;
  };
  provider?: { visualModel?: string; layoutEngine?: string; ocrEngine?: string; version?: string };
  createdAt: string;
  completedAt?: string;
};

export type VisualReadingInput = {
  documentId: string;
  userId: string;
  inspection: DocumentInspectionResult;
  nativeText: string;
  base64?: string;
};

export type VisualReadingDecision = { required: boolean; reason: string; pages: number[]; mode: "native_layout" | "vision_layout" | "hybrid_layout" };
export type DocumentRenderer = { render(input: DocumentRenderInput): Promise<RenderedDocument> };
export type VisualDocumentReader = { analyze(input: { inspection: DocumentInspectionResult; rendered: RenderedDocument; nativeText: string; decision: VisualReadingDecision }): Promise<VisualDocumentModel> };
