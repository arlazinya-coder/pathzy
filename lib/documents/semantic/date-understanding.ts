import type { SemanticDate } from "./semantic.types";

const monthMap: Record<string, number> = {
  jan: 1, january: 1, janvier: 1,
  feb: 2, february: 2, fevrier: 2, février: 2,
  mar: 3, march: 3, mars: 3,
  apr: 4, april: 4, avril: 4,
  may: 5, mai: 5,
  jun: 6, june: 6, juin: 6,
  jul: 7, july: 7, juillet: 7,
  aug: 8, august: 8, aout: 8, août: 8,
  sep: 9, sept: 9, september: 9, septembre: 9,
  oct: 10, october: 10, octobre: 10,
  nov: 11, november: 11, novembre: 11,
  dec: 12, december: 12, decembre: 12, décembre: 12
};
const currentPattern = /\b(present|current|now|to date|à ce jour|a ce jour|aujourd'hui|actuel|actuellement)\b/i;
const expectedPattern = /\b(expected|prévue|prevue|graduation prévue|anticipated)\b/i;

export function parseSemanticDate(originalText: string, sourceRegionIds: string[]): SemanticDate | null {
  const clean = originalText.replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
  const year = clean.match(/\b(19|20)\d{2}\b/)?.[0];
  if (!year && !currentPattern.test(clean)) return null;
  const monthToken = clean.toLowerCase().match(/\b[a-zàâéèêôû]{3,12}\b/i)?.[0];
  const month = monthToken ? monthMap[monthToken.normalize("NFC")] : undefined;
  const current = currentPattern.test(clean);
  const approximate = /\b(since|depuis|around|approx|about|environ)\b/i.test(clean);
  const expected = expectedPattern.test(clean);
  return {
    value: clean,
    originalText,
    normalizedValue: clean,
    normalized: {
      year: year ? Number(year) : undefined,
      month,
      current,
      approximate,
      expected
    },
    confidence: year ? (month ? 0.86 : 0.78) : 0.62,
    sourceRegionIds,
    explicitness: "explicit",
    requiresReview: approximate || (!year && current),
    reviewStatus: "unreviewed"
  };
}

export function parseSemanticDateRange(originalText: string, sourceRegionIds: string[]) {
  const clean = originalText.replace(/[–—]/g, "-");
  const parts = clean.split(/\s+-\s+|\s+to\s+|\s+au\s+|\s+à\s+/i).map((part) => part.trim()).filter(Boolean);
  const startDate = parts[0] ? parseSemanticDate(parts[0], sourceRegionIds) : parseSemanticDate(clean, sourceRegionIds);
  const endDate = parts.length > 1 ? parseSemanticDate(parts.slice(1).join(" "), sourceRegionIds) : currentPattern.test(clean) ? parseSemanticDate("Present", sourceRegionIds) : null;
  return { startDate, endDate, isCurrent: Boolean(endDate?.normalized?.current || currentPattern.test(clean)) };
}
