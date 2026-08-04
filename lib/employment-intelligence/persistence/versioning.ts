import { createHash } from "node:crypto";

function normalizeForHash(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeForHash);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !["interface_language", "theme", "presentationLanguage", "activeLanguage"].includes(key))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, normalizeForHash(item)])
    );
  }
  return value;
}

export function stableCanonicalStringify(value: unknown) {
  return JSON.stringify(normalizeForHash(value));
}

export function deterministicInputHash(value: unknown) {
  return createHash("sha256").update(stableCanonicalStringify(value)).digest("hex");
}

export function boundedVersion(value: unknown, fallback = 1) {
  const version = Number(value);
  return Number.isInteger(version) && version > 0 ? version : fallback;
}
