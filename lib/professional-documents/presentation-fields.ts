import type { PresentationApprovalState, PresentationField, PresentationSourceType, ProfessionalDocumentLanguage } from "./professional-document.types";

export function cleanDocumentText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function createPresentationField(input: {
  value: string;
  canonicalEntityId?: string;
  canonicalFieldPath?: string;
  originalCanonicalValue?: string;
  approvedMasterValue?: string;
  sourceType?: PresentationSourceType;
  userApproved?: boolean;
  approvalState?: PresentationApprovalState;
  generatedForTargetJobId?: string;
  sourceFactIds?: string[];
  unsupportedClaimDetected?: boolean;
  language?: ProfessionalDocumentLanguage;
}): PresentationField {
  const now = new Date().toISOString();
  const value = cleanDocumentText(input.value);
  return {
    canonicalEntityId: input.canonicalEntityId,
    canonicalFieldPath: input.canonicalFieldPath,
    originalCanonicalValue: input.originalCanonicalValue ?? value,
    approvedMasterValue: input.approvedMasterValue,
    presentationValue: value,
    sourceType: input.sourceType ?? "canonical",
    userApproved: input.userApproved ?? input.sourceType === "canonical",
    approvalState: input.approvalState ?? (input.userApproved ? "accepted" : "suggested"),
    generatedForTargetJobId: input.generatedForTargetJobId,
    sourceFactIds: input.sourceFactIds ?? (input.canonicalEntityId ? [input.canonicalEntityId] : []),
    unsupportedClaimDetected: Boolean(input.unsupportedClaimDetected),
    language: input.language ?? "en",
    createdAt: now,
    updatedAt: now
  };
}

export function fieldText(field: PresentationField | undefined) {
  return cleanDocumentText(field?.presentationValue);
}

