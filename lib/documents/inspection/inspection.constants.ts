import type { DocumentType } from "./inspection.types";

export const INSPECTION_THRESHOLDS = {
  maxFileSizeBytes: 8 * 1024 * 1024,
  maxPageCount: 30,
  minNativeCharactersPerPage: 40,
  minNativeTextWordsPerPage: 8,
  minNativeTextPageRatio: 0.6,
  lowConfidence: 0.75,
  manualReviewConfidence: 0.6,
  minReadableCharacters: 120,
  minImageBytesForGoodQuality: 120_000
} as const;

export const INSPECTION_CONFIDENCE_WEIGHTS = {
  documentType: 0.3,
  sourceDetection: 0.2,
  languageDetection: 0.15,
  layoutDetection: 0.2,
  qualityDetection: 0.15
} as const;

export const SUPPORTED_INSPECTION_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "text/plain"
]);

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  cv: "CV",
  cover_letter: "Cover Letter",
  academic_transcript: "Academic Transcript",
  diploma: "Diploma",
  certificate: "Certificate",
  passport: "Passport",
  identity_document: "Identity Document",
  drivers_licence: "Driver's Licence",
  payslip: "Payslip",
  employment_contract: "Employment Contract",
  recommendation_letter: "Recommendation Letter",
  portfolio: "Portfolio",
  job_advertisement: "Job Advertisement",
  unknown: "Unknown Document"
};
