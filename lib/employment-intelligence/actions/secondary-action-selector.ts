import type { ActionCandidate } from "./action-models";
import { orderActionCandidates } from "./action-priority";

export function selectSecondaryActionCandidates(candidates: ActionCandidate[], primaryCode: string, limit = 3) {
  const selected: ActionCandidate[] = [];
  const seenCategories = new Set<string>();
  for (const candidate of orderActionCandidates(candidates)) {
    if (candidate.definition.code === primaryCode) continue;
    if (candidate.state === "ALREADY_COMPLETED" || candidate.state === "NOT_RELEVANT") continue;
    if (selected.some((item) => item.definition.code === candidate.definition.code)) continue;
    if (seenCategories.has(candidate.definition.category) && selected.length < limit - 1) continue;
    selected.push(candidate);
    seenCategories.add(candidate.definition.category);
    if (selected.length >= limit) break;
  }
  return selected;
}
