export type DocumentType =
  | "cv"
  | "cover_letter"
  | "academic_transcript"
  | "diploma"
  | "certificate"
  | "passport"
  | "identity_document"
  | "drivers_licence"
  | "payslip"
  | "employment_contract"
  | "recommendation_letter"
  | "portfolio"
  | "job_advertisement"
  | "unknown";

export type DocumentSourceType = "digital" | "scanned" | "image" | "mixed";
export type DocumentOrientation = "portrait" | "landscape" | "rotated_90" | "rotated_180" | "rotated_270" | "mixed";
export type DocumentInspectionStatus = "pending" | "processing" | "completed" | "completed_with_warnings" | "failed";
export type ProcessingStrategyName = "native_text" | "ocr" | "hybrid" | "image_ocr" | "manual_review";

export type InspectionWarningCode =
  | "low_resolution"
  | "low_confidence"
  | "blur_detected"
  | "cropped_text"
  | "rotated_page"
  | "handwriting_detected"
  | "heavy_shadow"
  | "watermark_detected"
  | "password_protected"
  | "unsupported_format"
  | "empty_document"
  | "missing_text_layer"
  | "mixed_languages"
  | "complex_layout"
  | "possible_missing_page"
  | "ocr_failed"
  | "inspection_failed";

export type InspectionWarning = {
  code: InspectionWarningCode;
  severity: "info" | "warning" | "error";
  message: string;
  page?: number;
};

export type DocumentInspectionInput = {
  documentId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  base64?: string;
  textSample?: string;
};

export type DocumentInspectionResult = {
  id: string;
  documentId: string;
  status: DocumentInspectionStatus;
  documentType: {
    value: DocumentType;
    confidence: number;
    alternatives?: Array<{ value: DocumentType; confidence: number }>;
  };
  source: {
    type: DocumentSourceType;
    isScanned: boolean;
    isDigitalPdf: boolean;
    hasTextLayer: boolean;
    ocrRequired: boolean;
    ocrReason?: string;
  };
  file: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    pageCount: number;
  };
  languages: Array<{
    code: string;
    name: string;
    confidence: number;
    primary: boolean;
  }>;
  layout: {
    columnCount: number;
    columnCountByPage?: number[];
    hasTables: boolean;
    tableCount: number;
    hasImages: boolean;
    imageCount: number;
    hasProfilePhoto: boolean;
    hasLogos: boolean;
    hasSignatures: boolean;
    hasStamps: boolean;
    hasQrCodes: boolean;
    hasHeaders: boolean;
    hasFooters: boolean;
    readingOrderDetected: boolean;
    complexity: "simple" | "moderate" | "complex";
  };
  orientation: {
    value: DocumentOrientation;
    rotationDegreesByPage?: number[];
    autoRotationRecommended: boolean;
  };
  quality: {
    overall: "excellent" | "good" | "fair" | "poor";
    confidence: number;
    estimatedDpi?: number;
    blur: "none" | "low" | "medium" | "high";
    noise: "none" | "low" | "medium" | "high";
    contrast: "good" | "fair" | "poor";
    brightness: "good" | "too_dark" | "too_bright";
    skewDetected: boolean;
    croppingDetected: boolean;
  };
  readingOrder?: Array<{
    page: number;
    regionId: string;
    order: number;
    regionType: "header" | "left_column" | "main_column" | "right_column" | "table" | "image" | "footer" | "unknown";
  }>;
  warnings: InspectionWarning[];
  recommendedPipeline: {
    strategy: ProcessingStrategyName;
    steps: string[];
    extractionAllowed: boolean;
    manualReviewRequired: boolean;
  };
  confidence: {
    documentType: number;
    sourceDetection: number;
    languageDetection: number;
    layoutDetection: number;
    qualityDetection: number;
    overall: number;
  };
  provider?: {
    inspectionEngine?: string;
    ocrEngine?: string;
    model?: string;
    version?: string;
  };
  createdAt: string;
  completedAt?: string;
};

export type OcrDecision = {
  required: boolean;
  reason?: string;
  pages?: number[];
};

export type DocumentInspector = {
  inspect(input: DocumentInspectionInput): Promise<DocumentInspectionResult>;
};

export type OcrProvider = {
  extract(input: { documentId: string; pages?: number[] }): Promise<{ text: string; confidence: number }>;
};

export type LayoutAnalysisProvider = {
  analyze(input: { textSample: string; pageCount: number }): Promise<Pick<DocumentInspectionResult, "layout" | "readingOrder">>;
};
