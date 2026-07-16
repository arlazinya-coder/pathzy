import type { CanonicalReviewStatus, CanonicalSourceReference, CanonicalSourceType, CanonicalValue } from "./canonical-profile.types";

export function clampConfidence(value: number | null | undefined) {
  if (!Number.isFinite(value ?? NaN)) return 0;
  return Math.max(0, Math.min(1, Number(value)));
}

export function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function canonicalNow() {
  return new Date().toISOString();
}

export function createSourceReference(input: {
  sourceType: CanonicalSourceType;
  documentId?: string | null;
  semanticEntityId?: string | null;
  reasoningCaseId?: string | null;
  sourceRegionIds?: string[] | null;
  pageNumbers?: number[] | null;
  originalValue?: string | null;
  sourceConfidence?: number | null;
  addedAt?: string;
}): CanonicalSourceReference {
  return {
    sourceType: input.sourceType,
    documentId: input.documentId ?? undefined,
    semanticEntityId: input.semanticEntityId ?? undefined,
    reasoningCaseId: input.reasoningCaseId ?? undefined,
    sourceRegionIds: input.sourceRegionIds ?? undefined,
    pageNumbers: input.pageNumbers ?? undefined,
    originalValue: cleanText(input.originalValue),
    sourceConfidence: input.sourceConfidence == null ? undefined : clampConfidence(input.sourceConfidence),
    addedAt: input.addedAt ?? canonicalNow()
  };
}

export function createCanonicalValue<T>(
  value: T,
  options: {
    displayValue?: string;
    status?: CanonicalReviewStatus;
    confidence?: number;
    sourceReferences?: CanonicalSourceReference[];
    selectedSourceId?: string;
    reasoningCaseId?: string;
    userDecisionId?: string;
    createdAt?: string;
    updatedAt?: string;
    confirmedAt?: string;
  } = {}
): CanonicalValue<T> {
  const now = canonicalNow();
  return {
    value,
    displayValue: options.displayValue,
    status: options.status ?? "user_entered",
    confidence: clampConfidence(options.confidence ?? (options.status === "confirmed" ? 0.98 : 0.88)),
    sourceReferences: options.sourceReferences ?? [createSourceReference({ sourceType: "user_entry", originalValue: String(value ?? "") })],
    selectedSourceId: options.selectedSourceId,
    reasoningCaseId: options.reasoningCaseId,
    userDecisionId: options.userDecisionId,
    createdAt: options.createdAt ?? now,
    updatedAt: options.updatedAt ?? now,
    confirmedAt: options.confirmedAt
  };
}

export function valueText(value: CanonicalValue<string> | undefined) {
  return cleanText(value?.displayValue ?? value?.value);
}

export function sourceReferenceCount(values: Array<CanonicalValue<unknown> | undefined>) {
  return values.reduce((sum, value) => sum + (value?.sourceReferences?.length ?? 0), 0);
}

export function uniqueClean(values: string[]) {
  return Array.from(new Set(values.map(cleanText).filter(Boolean)));
}

