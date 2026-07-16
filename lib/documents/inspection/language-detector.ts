import { countMatches, wordCount } from "./inspection.utils";

const frenchSignals = /\b(et|avec|pour|dans|formation|exp[ée]rience|comp[ée]tences|candidature|poste|responsabilit[ée]s|exigences|dipl[oô]me|certificat|fran[çc]ais)\b/gi;
const englishSignals = /\b(and|with|for|experience|education|skills|application|role|responsibilities|requirements|certificate|transcript|summary|profile)\b/gi;

export function detectLanguages(text: string) {
  const totalWords = Math.max(1, wordCount(text));
  const french = countMatches(text, frenchSignals);
  const english = countMatches(text, englishSignals);
  const languages = [
    { code: "en", name: "English", score: english },
    { code: "fr", name: "French", score: french }
  ].filter((item) => item.score > 0);

  if (!languages.length) return [{ code: "unknown", name: "Unknown", confidence: 0.45, primary: true }];

  const totalSignal = Math.max(1, english + french);
  return languages
    .map((item) => ({
      code: item.code,
      name: item.name,
      confidence: Math.min(0.98, Math.max(0.52, item.score / totalSignal + Math.min(0.2, item.score / totalWords))),
      primary: false
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .map((item, index) => ({ ...item, primary: index === 0 }));
}
