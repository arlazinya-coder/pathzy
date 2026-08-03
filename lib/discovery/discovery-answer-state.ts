import type { DiscoveryAnswers } from "@/lib/discovery/types";

export const discoveryAnswerKeys = [
  "personal_background",
  "education",
  "interests",
  "skills",
  "personality",
  "work_style",
  "dream_lifestyle",
  "income_goal",
  "biggest_challenge",
  "preferred_career_direction"
] as const satisfies ReadonlyArray<keyof DiscoveryAnswers>;

export type DiscoveryAnswerKey = (typeof discoveryAnswerKeys)[number];

export function emptyDiscoveryAnswers(): DiscoveryAnswers {
  return Object.fromEntries(discoveryAnswerKeys.map((key) => [key, ""])) as DiscoveryAnswers;
}

export function safeDiscoveryText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function normalizeDiscoveryAnswers(value: unknown): DiscoveryAnswers {
  const source = value && typeof value === "object" ? (value as Partial<Record<DiscoveryAnswerKey, unknown>>) : {};
  return Object.fromEntries(discoveryAnswerKeys.map((key) => [key, safeDiscoveryText(source[key])])) as DiscoveryAnswers;
}

export function discoveryAnswerValue(answers: Partial<Record<DiscoveryAnswerKey, unknown>> | null | undefined, key: DiscoveryAnswerKey): string {
  return safeDiscoveryText(answers?.[key]);
}

export function missingDiscoveryAnswerKeys(answers: unknown): DiscoveryAnswerKey[] {
  const normalized = normalizeDiscoveryAnswers(answers);
  return discoveryAnswerKeys.filter((key) => !normalized[key].trim());
}

export function hasCompleteDiscoveryAnswers(answers: unknown): answers is DiscoveryAnswers {
  return missingDiscoveryAnswerKeys(answers).length === 0;
}
