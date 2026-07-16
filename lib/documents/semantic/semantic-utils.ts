import type { SemanticEntity, SemanticEntityType, SemanticCategory, SemanticEvidence, SemanticExplicitness, SemanticSource, SemanticValue } from "./semantic.types";

export function cleanSemanticText(value: string) {
  return value.replace(/^[•*\-\u2022\u25cf\u25e6\u2043]+\s*/g, "").replace(/\s+/g, " ").trim();
}

export function sourceFor(region: { id: string; pageNumber: number }, sectionId?: string): SemanticSource {
  return { pageNumber: region.pageNumber, regionIds: [region.id], sectionId };
}

export function evidence(kind: SemanticEvidence["kind"], description: string, confidence: number): SemanticEvidence {
  return { kind, description, confidence: Math.max(0, Math.min(1, confidence)) };
}

export function semanticValue<T>(value: T, originalText: string, sourceRegionIds: string[], confidence: number, explicitness: SemanticExplicitness = "explicit", normalizedValue?: T): SemanticValue<T> {
  return { value, originalText, normalizedValue, confidence, sourceRegionIds, explicitness, requiresReview: confidence < 0.75 || explicitness !== "explicit", reviewStatus: "unreviewed" };
}

export function entity(input: {
  id: string;
  type: SemanticEntityType;
  category: SemanticCategory;
  originalText: string;
  source: SemanticSource;
  confidence: number;
  evidence: SemanticEvidence[];
  explicitness?: SemanticExplicitness;
  normalizedValue?: string;
  structuredValue?: unknown;
  alternatives?: SemanticEntity["alternatives"];
}): SemanticEntity {
  const explicitness = input.explicitness ?? "explicit";
  return {
    id: input.id,
    type: input.type,
    category: input.category,
    originalText: input.originalText,
    normalizedValue: input.normalizedValue,
    structuredValue: input.structuredValue,
    confidence: input.confidence,
    explicitness,
    source: input.source,
    evidence: input.evidence,
    alternatives: input.alternatives,
    requiresReview: input.confidence < 0.75 || explicitness !== "explicit" || Boolean(input.alternatives?.length),
    reviewStatus: "unreviewed"
  };
}

export function uniqueByText<T extends { originalText?: string; name?: string; language?: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = String(item.originalText ?? item.name ?? item.language ?? "").toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
