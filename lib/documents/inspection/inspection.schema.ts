import { INSPECTION_THRESHOLDS, SUPPORTED_INSPECTION_MIME_TYPES } from "./inspection.constants";
import type { DocumentInspectionInput, DocumentInspectionResult } from "./inspection.types";
import { DocumentInspectionError, clampConfidence, decodeBase64Document, extensionFromFilename } from "./inspection.utils";

const mimeExtensions: Record<string, string[]> = {
  "application/pdf": ["pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
  "image/png": ["png"],
  "image/jpeg": ["jpg", "jpeg"],
  "text/plain": ["txt"]
};

export function validateInspectionInput(input: DocumentInspectionInput) {
  if (!input.userId) throw new DocumentInspectionError("missing_user", "Missing authenticated user.", "Please log in to inspect this document.");
  if (!input.documentId) throw new DocumentInspectionError("missing_document", "Missing document id.", "We could not find this document. Please upload it again.");
  if (!input.fileName.trim()) throw new DocumentInspectionError("missing_file", "Missing file name.", "Please choose a document to upload.");
  if (!SUPPORTED_INSPECTION_MIME_TYPES.has(input.mimeType)) {
    throw new DocumentInspectionError("unsupported_format", `Unsupported MIME type: ${input.mimeType}`, "This file format is not supported yet. Please upload a PDF, DOCX, PNG, JPG, or JPEG file.");
  }
  if (!input.sizeBytes || input.sizeBytes <= 0) throw new DocumentInspectionError("empty_document", "Empty file.", "The document is empty.");
  if (input.sizeBytes > INSPECTION_THRESHOLDS.maxFileSizeBytes) {
    throw new DocumentInspectionError("file_too_large", "File exceeds inspection size limit.", "This file is too large. Please upload a file smaller than 8MB.");
  }
  const extension = extensionFromFilename(input.fileName);
  if (extension && !mimeExtensions[input.mimeType]?.includes(extension)) {
    throw new DocumentInspectionError("extension_mismatch", "File extension does not match MIME type.", "The file extension does not match the file type. Please check the file and upload again.");
  }

  const buffer = decodeBase64Document(input.base64);
  if (input.base64 && buffer.length <= 0) throw new DocumentInspectionError("empty_document", "Decoded file is empty.", "The document is empty.");
  if (input.mimeType === "application/pdf" && buffer.includes(Buffer.from("/Encrypt"))) {
    throw new DocumentInspectionError("password_protected", "Password-protected PDF.", "This PDF appears to be password protected. Please upload an unlocked copy.");
  }
}

export function validateInspectionResult(result: DocumentInspectionResult) {
  const confidenceValues = [
    result.documentType.confidence,
    result.confidence.documentType,
    result.confidence.sourceDetection,
    result.confidence.languageDetection,
    result.confidence.layoutDetection,
    result.confidence.qualityDetection,
    result.confidence.overall
  ];
  if (confidenceValues.some((value) => clampConfidence(value) !== value)) {
    throw new DocumentInspectionError("invalid_confidence", "Inspection confidence is out of range.", "The document could not be inspected reliably. Please try again.");
  }
  if (result.file.pageCount > INSPECTION_THRESHOLDS.maxPageCount) {
    throw new DocumentInspectionError("page_limit", "Document exceeds page limit.", "This document has too many pages for inspection. Please upload a shorter document.");
  }
}
