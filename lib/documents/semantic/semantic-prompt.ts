import type { SemanticEntity } from "./semantic.types";

export function buildSemanticUnderstandingPrompt(entities: SemanticEntity[]) {
  const unresolved = entities.filter((entity) => entity.type === "unknown" || entity.requiresReview).slice(0, 25);
  return [
    "This is semantic career understanding, not copywriting and not profile rewriting.",
    "Use only the supplied grounded entities. Do not invent missing facts.",
    "Return typed career meaning only when supported by source region IDs.",
    "Preserve original text and store normalized meaning separately.",
    "Flag low-confidence or implied values for review.",
    `Unresolved entity count: ${unresolved.length}.`
  ].join("\n");
}
