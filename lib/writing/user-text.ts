export type DetectedLanguage = "english" | "french" | "mixed" | "unknown";

export function cleanUserInput(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

function capitalizeSentenceStarts(value: string) {
  return value.replace(/(^|[.!?]\s+)([a-zà-ÿ])/g, (match, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`);
}

export function detectLanguage(value: unknown): DetectedLanguage {
  const text = cleanUserInput(value).toLowerCase();
  if (!text) return "unknown";
  const frenchSignals = ["bonjour", "merci", "carriere", "compétence", "competence", "emploi", "formation", "je suis", "j'ai"];
  const englishSignals = ["hello", "career", "skill", "job", "education", "i am", "i have", "thank"];
  const hasFrench = frenchSignals.some((signal) => text.includes(signal));
  const hasEnglish = englishSignals.some((signal) => text.includes(signal));
  if (hasFrench && hasEnglish) return "mixed";
  if (hasFrench) return "french";
  if (hasEnglish) return "english";
  return "unknown";
}

export function professionalizeUserInput(value: unknown) {
  return capitalizeSentenceStarts(cleanUserInput(value));
}

export function formatRecruiterBullet(value: unknown) {
  const cleaned = professionalizeUserInput(value);
  if (!cleaned) return "";
  const withoutWeakStart = cleaned.replace(/^(i was responsible for|responsible for|worked on|helped with)\s+/i, "");
  const startsWithAction = /^(built|created|managed|supported|improved|organized|analyzed|designed|delivered|coordinated|assisted|developed|prepared|maintained|learned|completed)\b/i.test(withoutWeakStart);
  const factualBullet = startsWithAction ? withoutWeakStart : `Delivered ${withoutWeakStart.charAt(0).toLowerCase()}${withoutWeakStart.slice(1)}`;
  return factualBullet.replace(/[.]+$/, "");
}

export function prepareForProfessionalDocument(value: unknown) {
  const original = typeof value === "string" ? value : "";
  const cleaned = cleanUserInput(original);
  const professional = professionalizeUserInput(cleaned);
  return {
    original,
    cleaned,
    professional,
    language: detectLanguage(original)
  };
}
