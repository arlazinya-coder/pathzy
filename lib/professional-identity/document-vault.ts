export type VaultDocumentType =
  | "cv"
  | "cover_letter"
  | "old_cv"
  | "uploaded_document"
  | "supporting_document"
  | "certificate"
  | "diploma"
  | "transcript"
  | "licence"
  | "reference"
  | "portfolio_file"
  | "id_work_document";

export type VaultDocumentCategory =
  | "all"
  | "cvs"
  | "cover_letters"
  | "certificates"
  | "qualifications"
  | "licences"
  | "references"
  | "portfolio"
  | "other";

export type VaultDocumentSource = "pathzy" | "uploaded";
export type VaultDocumentErrorCode =
  | "unsupported_format"
  | "extension_mismatch"
  | "empty_file"
  | "file_too_large"
  | "storage_unavailable"
  | "storage_permission_denied"
  | "upload_failed";

export type VaultDocumentRecord = {
  id: string;
  documentType: VaultDocumentType;
  category: Exclude<VaultDocumentCategory, "all">;
  title: string;
  source: VaultDocumentSource;
  status: "draft" | "final" | "archived";
  content: string;
  contentJson: Record<string, unknown> | null;
  templateName: string | null;
  versionNumber: number | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  storagePath: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  lastDownloadedAt: string | null;
};

export const vaultDocumentStorageContract = {
  bucketName: "employment-documents",
  maxFileSizeBytes: 8 * 1024 * 1024,
  allowedMimeTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "text/plain"
  ] as const
};

export const vaultCategoryLabels: Record<VaultDocumentCategory, string> = {
  all: "All",
  cvs: "CVs",
  cover_letters: "Cover Letters",
  certificates: "Certificates",
  qualifications: "Qualifications",
  licences: "Licences",
  references: "References",
  portfolio: "Portfolio & Evidence",
  other: "Other Documents"
};

export const vaultDocumentTypeLabels: Record<VaultDocumentType, string> = {
  cv: "CV",
  cover_letter: "Cover Letter",
  old_cv: "CV",
  uploaded_document: "Uploaded Document",
  supporting_document: "Supporting Document",
  certificate: "Certificate",
  diploma: "Diploma",
  transcript: "Transcript",
  licence: "Licence",
  reference: "Reference",
  portfolio_file: "Portfolio Evidence",
  id_work_document: "Identity / Work Document"
};

const vaultDocumentTypes = new Set<VaultDocumentType>([
  "cv",
  "cover_letter",
  "old_cv",
  "uploaded_document",
  "supporting_document",
  "certificate",
  "diploma",
  "transcript",
  "licence",
  "reference",
  "portfolio_file",
  "id_work_document"
]);

const workflowDocumentTypes = new Set([
  "linkedin_profile",
  "recruiter_message",
  "follow_up_email",
  "thank_you_email",
  "career_passport",
  "application_email",
  "linkedin_message"
]);

const vaultCategories = new Set<VaultDocumentCategory>(["all", "cvs", "cover_letters", "certificates", "qualifications", "licences", "references", "portfolio", "other"]);

const extensionByMime: Record<string, string[]> = {
  "application/pdf": ["pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
  "image/png": ["png"],
  "image/jpeg": ["jpg", "jpeg"],
  "text/plain": ["txt"]
};

export function isVaultDocumentType(value: unknown): value is VaultDocumentType {
  return typeof value === "string" && vaultDocumentTypes.has(value as VaultDocumentType);
}

export function isWorkflowDocumentType(value: unknown) {
  return typeof value === "string" && workflowDocumentTypes.has(value);
}

export function isVaultDocumentCategory(value: unknown): value is VaultDocumentCategory {
  return typeof value === "string" && vaultCategories.has(value as VaultDocumentCategory);
}

export function vaultCategoryForDocumentType(type: VaultDocumentType): Exclude<VaultDocumentCategory, "all"> {
  if (type === "cv" || type === "old_cv") return "cvs";
  if (type === "cover_letter") return "cover_letters";
  if (type === "certificate") return "certificates";
  if (type === "diploma" || type === "transcript") return "qualifications";
  if (type === "licence") return "licences";
  if (type === "reference") return "references";
  if (type === "portfolio_file") return "portfolio";
  return "other";
}

export function vaultDocumentTypeForCategory(category: VaultDocumentCategory): VaultDocumentType {
  if (category === "cvs") return "uploaded_document";
  if (category === "cover_letters") return "supporting_document";
  if (category === "certificates") return "certificate";
  if (category === "qualifications") return "diploma";
  if (category === "licences") return "licence";
  if (category === "references") return "reference";
  if (category === "portfolio") return "portfolio_file";
  return "supporting_document";
}

export function vaultDocumentSourceForType(type: VaultDocumentType): VaultDocumentSource {
  return type === "cv" || type === "cover_letter" ? "pathzy" : "uploaded";
}

export function extensionFromDocumentName(fileName: string) {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

export function sanitizeVaultFileName(fileName: string) {
  const cleaned = fileName
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 120);
  return cleaned || "document";
}

export function vaultStoragePath(userId: string, documentId: string, fileName: string) {
  return `${userId}/documents/${documentId}/${sanitizeVaultFileName(fileName)}`;
}

export function validateVaultUploadInput(input: { fileName: string; mimeType: string; sizeBytes: number }) {
  const errors: string[] = [];
  const extension = extensionFromDocumentName(input.fileName);
  if (!vaultDocumentStorageContract.allowedMimeTypes.includes(input.mimeType as typeof vaultDocumentStorageContract.allowedMimeTypes[number])) {
    errors.push("unsupported_format");
  }
  if (!extension || !extensionByMime[input.mimeType]?.includes(extension)) {
    errors.push("extension_mismatch");
  }
  if (!input.sizeBytes || input.sizeBytes <= 0) {
    errors.push("empty_file");
  }
  if (input.sizeBytes > vaultDocumentStorageContract.maxFileSizeBytes) {
    errors.push("file_too_large");
  }
  return {
    ok: errors.length === 0,
    errors
  };
}

export function vaultUploadErrorMessage(code: string) {
  if (code === "unsupported_format") return "This file format is not supported. Upload a PDF, DOCX, TXT, PNG, JPG, or JPEG file.";
  if (code === "extension_mismatch") return "The file extension does not match the selected document type.";
  if (code === "empty_file") return "This file is empty.";
  if (code === "file_too_large") return "This file is too large. Upload a file smaller than 8MB.";
  if (code === "storage_unavailable" || code === "storage_permission_denied") return "We couldn't upload your document. Please try again.";
  return "We could not save this document. Please try again.";
}

export function isVaultStorageErrorCode(code: string) {
  return code === "storage_unavailable" || code === "storage_permission_denied";
}

export function suggestedVaultDocumentType(fileName: string): VaultDocumentType {
  const name = fileName.toLowerCase();
  if (/\bcv\b|resume|curriculum/.test(name)) return "uploaded_document";
  if (/cover.?letter|motivation/.test(name)) return "supporting_document";
  if (/cert|course|training/.test(name)) return "certificate";
  if (/diploma|degree|qualification|transcript/.test(name)) return "diploma";
  if (/licen[cs]e|permit|driver|trade/.test(name)) return "licence";
  if (/reference|referee|recommendation/.test(name)) return "reference";
  if (/portfolio|project|sample|award/.test(name)) return "portfolio_file";
  if (/passport|identity|id|work.?authori[sz]ation/.test(name)) return "id_work_document";
  return "supporting_document";
}

export function compactDocumentTitle(title: string, type?: VaultDocumentType) {
  const cleaned = title
    .replace(/\bPATHZY Signature\b/gi, "")
    .replace(/\bDRAFT\b|\bDOWNLOADED\b/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s+-\s+/g, " - ")
    .trim();

  const professionalTitleCase = (value: string) => value
    .split(/\s+/)
    .map((word) => {
      if (/^(cv|it|hr|ui|ux|qa|pdf|api|ai)$/i.test(word)) return word.toUpperCase();
      if (/^[A-Z]{2,}$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

  if (type === "cover_letter") {
    const base = cleaned
      .replace(/^letter\s+/i, "")
      .replace(/\s*[-–—]?\s*cover\s+letter$/i, "")
      .trim();
    const label = base ? `${professionalTitleCase(base.replace(/\s+and\s+/gi, " & "))} — Cover Letter` : "Cover Letter";
    return label.length > 82 ? `${label.slice(0, 79).trim()}...` : label;
  }

  if (type === "cv" || type === "old_cv") {
    const base = cleaned
      .replace(/^cv\s+/i, "")
      .replace(/\s*[-–—]?\s*(cv|resume)$/i, "")
      .trim();
    const label = base ? `${professionalTitleCase(base.replace(/\s+and\s+/gi, " & "))} — CV` : "CV";
    return label.length > 82 ? `${label.slice(0, 79).trim()}...` : label;
  }

  if (cleaned) {
    const titled = professionalTitleCase(cleaned);
    return titled.length > 82 ? `${titled.slice(0, 79).trim()}...` : titled;
  }
  return type ? vaultDocumentTypeLabels[type] : "Employment document";
}

export function vaultDocumentFromRow(row: Record<string, unknown>): VaultDocumentRecord | null {
  const documentType = row.document_type;
  if (!isVaultDocumentType(documentType)) return null;
  const contentJson = row.content_json && typeof row.content_json === "object" ? row.content_json as Record<string, unknown> : null;
  const fileName = typeof contentJson?.original_file_name === "string" ? contentJson.original_file_name : null;
  const fileType = typeof contentJson?.original_file_type === "string" ? contentJson.original_file_type : null;
  const fileSize = typeof contentJson?.original_file_size === "number" ? contentJson.original_file_size : null;
  const storagePath = typeof row.file_url === "string" && row.file_url.trim() ? row.file_url.trim() : typeof contentJson?.storage_path === "string" ? contentJson.storage_path : null;
  const status = row.status === "archived" ? "archived" : row.status === "ready" ? "final" : "draft";
  const storedCategory = contentJson?.vault_category;
  const category = isVaultDocumentCategory(storedCategory) && storedCategory !== "all"
    ? storedCategory
    : vaultCategoryForDocumentType(documentType);
  return {
    id: String(row.id),
    documentType,
    category,
    title: compactDocumentTitle(String(row.document_title ?? ""), documentType),
    source: vaultDocumentSourceForType(documentType),
    status,
    content: typeof row.content_text === "string" ? row.content_text : "",
    contentJson,
    templateName: typeof row.template_name === "string" ? row.template_name : null,
    versionNumber: typeof row.version_number === "number" ? row.version_number : null,
    fileName,
    fileType,
    fileSize,
    storagePath,
    createdAt: typeof row.created_at === "string" ? row.created_at : null,
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : null,
    lastDownloadedAt: typeof row.last_downloaded_at === "string" ? row.last_downloaded_at : null
  };
}
