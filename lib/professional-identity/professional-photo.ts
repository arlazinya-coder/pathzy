export const PROFESSIONAL_PHOTO_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type ProfessionalPhotoMimeType = (typeof PROFESSIONAL_PHOTO_ALLOWED_MIME_TYPES)[number];
export type ProfessionalPhotoStatus = "missing" | "pending_upload" | "processing" | "ready" | "failed" | "removed";
export type ProfessionalPhotoVisibility = "private" | "profile" | "public";
export type ProfessionalPhotoUsageDecision = "allowed" | "disabled";
export type ProfessionalPhotoAspect = "original" | "square" | "portrait" | "circle-safe";

export type ProfessionalPhotoCropMetadata = {
  aspect: ProfessionalPhotoAspect;
  x: number;
  y: number;
  width: number;
  height: number;
  focalPointX?: number;
  focalPointY?: number;
};

export type ProfessionalPhotoDerivative = {
  kind: "avatar_thumbnail" | "profile_preview" | "document_portrait";
  storagePath: string;
  mimeType: ProfessionalPhotoMimeType;
  width: number;
  height: number;
  fileSize: number;
  createdAt: string;
};

export type CanonicalProfessionalPhotoAsset = {
  photoAssetId: string;
  userId: string;
  storagePath: string;
  originalFileName: string | null;
  mimeType: ProfessionalPhotoMimeType;
  fileSize: number;
  width: number;
  height: number;
  photoStatus: ProfessionalPhotoStatus;
  crop: ProfessionalPhotoCropMetadata | null;
  derivatives: ProfessionalPhotoDerivative[];
  updatedAt: string;
  photoConsent: boolean;
  profileVisibility: ProfessionalPhotoVisibility;
  cvUsageAllowed: boolean;
  publicSharingAllowed: boolean;
};

export type ProfessionalPhotoAssetView = CanonicalProfessionalPhotoAsset & {
  signedUrl?: string | null;
};

export type ProfessionalPhotoUploadValidationInput = {
  fileName: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
};

export type ProfessionalPhotoTemplateCapability = {
  photoMode: "none" | "optional" | "recommended";
  supportedAspects: ProfessionalPhotoAspect[];
  fallbackLayout: "no-frame" | "text-only-header" | "balanced-header";
};

export const PROFESSIONAL_PHOTO_LIMITS = {
  maxFileSizeBytes: 5 * 1024 * 1024,
  minWidth: 256,
  minHeight: 256
} as const;

export const professionalPhotoStorageContract = {
  bucketName: "professional-photos",
  privateBucketRequired: true,
  userScopedPathPattern: "{userId}/profile/{photoAssetId}.{extension}",
  persistBinaryInProfileRecord: false,
  persistTemporaryBrowserUrls: false,
  publicSharingDefault: false
} as const;

export const professionalPhotoErrorMessages = {
  unsupported_mime_type: "This file format is not supported. Please upload a JPEG, PNG, or WebP image.",
  extension_mime_mismatch: "The file extension does not match the image type. Please choose the original image file.",
  empty_file: "This image appears to be empty. Please choose another photo.",
  file_too_large: "This photo is too large. Please upload an image smaller than 5MB.",
  image_too_narrow: "This image is too small. Please choose a photo at least 256px wide.",
  image_too_short: "This image is too small. Please choose a photo at least 256px tall.",
  corrupted_image: "We could not read this image. Please choose another photo.",
  storage_unavailable: "Photo storage is not ready yet. Please try again after PATHZY storage is configured.",
  storage_bucket_missing: "Photo storage is not ready yet. PATHZY needs the professional photo storage bucket configured.",
  storage_permission_denied: "Photo storage permissions are blocking this upload. Please ask PATHZY support to verify photo storage policies.",
  upload_failed: "We could not upload this photo. Please try again.",
  metadata_failed: "The photo uploaded, but PATHZY could not save the profile reference. Please retry.",
  delete_failed: "We could not remove this photo yet. Please try again.",
  session_expired: "Your session expired. Please log in again and retry."
} as const;

export function isAllowedProfessionalPhotoMimeType(value: unknown): value is ProfessionalPhotoMimeType {
  return typeof value === "string" && PROFESSIONAL_PHOTO_ALLOWED_MIME_TYPES.includes(value as ProfessionalPhotoMimeType);
}

export function isTemporaryProfessionalPhotoUrl(value: unknown) {
  return typeof value === "string" && /^(blob:|data:)/i.test(value.trim());
}

export function validateProfessionalPhotoUploadInput(input: ProfessionalPhotoUploadValidationInput) {
  const errors: string[] = [];
  const extension = input.fileName.split(".").pop()?.toLowerCase() ?? "";
  const extensionMatchesMime =
    (input.mimeType === "image/jpeg" && ["jpg", "jpeg"].includes(extension)) ||
    (input.mimeType === "image/png" && extension === "png") ||
    (input.mimeType === "image/webp" && extension === "webp");

  if (!isAllowedProfessionalPhotoMimeType(input.mimeType)) errors.push("unsupported_mime_type");
  if (!extensionMatchesMime) errors.push("extension_mime_mismatch");
  if (!Number.isFinite(input.fileSize) || input.fileSize <= 0) errors.push("empty_file");
  if (input.fileSize > PROFESSIONAL_PHOTO_LIMITS.maxFileSizeBytes) errors.push("file_too_large");
  if (typeof input.width === "number" && input.width < PROFESSIONAL_PHOTO_LIMITS.minWidth) errors.push("image_too_narrow");
  if (typeof input.height === "number" && input.height < PROFESSIONAL_PHOTO_LIMITS.minHeight) errors.push("image_too_short");

  return {
    ok: errors.length === 0,
    errors
  };
}

export function professionalPhotoUserMessage(errorCode: string) {
  return professionalPhotoErrorMessages[errorCode as keyof typeof professionalPhotoErrorMessages] ?? professionalPhotoErrorMessages.upload_failed;
}

export function sanitizeProfessionalPhotoFileName(fileName: string) {
  const cleaned = fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned.slice(0, 120) || "professional-photo";
}

export function professionalPhotoExtensionForMimeType(mimeType: ProfessionalPhotoMimeType) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export function professionalPhotoStoragePath(userId: string, photoAssetId: string, mimeType: ProfessionalPhotoMimeType) {
  return `${userId}/profile/${photoAssetId}.${professionalPhotoExtensionForMimeType(mimeType)}`;
}

export function professionalPhotoAssetFromUnknown(value: unknown): CanonicalProfessionalPhotoAsset | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Partial<CanonicalProfessionalPhotoAsset>;
  if (
    typeof source.photoAssetId !== "string" ||
    typeof source.userId !== "string" ||
    typeof source.storagePath !== "string" ||
    !isAllowedProfessionalPhotoMimeType(source.mimeType) ||
    !Number.isFinite(source.fileSize) ||
    !Number.isFinite(source.width) ||
    !Number.isFinite(source.height)
  ) {
    return null;
  }
  return {
    photoAssetId: source.photoAssetId,
    userId: source.userId,
    storagePath: source.storagePath,
    originalFileName: typeof source.originalFileName === "string" ? source.originalFileName : null,
    mimeType: source.mimeType,
    fileSize: Number(source.fileSize),
    width: Number(source.width),
    height: Number(source.height),
    photoStatus: source.photoStatus ?? "ready",
    crop: source.crop ?? null,
    derivatives: Array.isArray(source.derivatives) ? source.derivatives : [],
    updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : new Date(0).toISOString(),
    photoConsent: source.photoConsent === true,
    profileVisibility: source.profileVisibility === "public" || source.profileVisibility === "profile" ? source.profileVisibility : "private",
    cvUsageAllowed: source.cvUsageAllowed === true,
    publicSharingAllowed: source.publicSharingAllowed === true
  };
}

export function pngDimensions(bytes: Uint8Array) {
  if (bytes.length < 24) return null;
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!signature.every((value, index) => bytes[index] === value)) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

export function jpegDimensions(bytes: Uint8Array) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    const length = (bytes[offset + 2] << 8) + bytes[offset + 3];
    if (length < 2) return null;
    if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
      return {
        height: (bytes[offset + 5] << 8) + bytes[offset + 6],
        width: (bytes[offset + 7] << 8) + bytes[offset + 8]
      };
    }
    offset += 2 + length;
  }
  return null;
}

export function webpDimensions(bytes: Uint8Array) {
  if (bytes.length < 30) return null;
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  const chunk = String.fromCharCode(...bytes.slice(12, 16));
  if (riff !== "RIFF" || webp !== "WEBP") return null;
  if (chunk === "VP8X" && bytes.length >= 30) {
    const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
    const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    return { width, height };
  }
  if (chunk === "VP8 " && bytes.length >= 30) {
    return {
      width: bytes[26] + ((bytes[27] & 0x3f) << 8),
      height: bytes[28] + ((bytes[29] & 0x3f) << 8)
    };
  }
  if (chunk === "VP8L" && bytes.length >= 25) {
    const b0 = bytes[21];
    const b1 = bytes[22];
    const b2 = bytes[23];
    const b3 = bytes[24];
    return {
      width: 1 + (((b1 & 0x3f) << 8) | b0),
      height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6))
    };
  }
  return null;
}

export function detectProfessionalPhotoDimensions(bytes: Uint8Array, mimeType: ProfessionalPhotoMimeType) {
  if (mimeType === "image/png") return pngDimensions(bytes);
  if (mimeType === "image/webp") return webpDimensions(bytes);
  return jpegDimensions(bytes);
}
