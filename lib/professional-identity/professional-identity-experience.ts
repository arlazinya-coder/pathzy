export type ProfessionalIdentityExperienceEntry = {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function cleanList(value: unknown) {
  const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(/\r?\n|[;,]/) : [];
  const seen = new Set<string>();
  const output: string[] = [];
  for (const item of source) {
    const text = cleanText(item);
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    output.push(text);
  }
  return output;
}

function comparable(value: string) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slug(value: string) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

function stripSourceLabel(value: string) {
  return cleanText(value.replace(/^(role|title|position|company|employer|organisation|organization|institution|period|date|dates|location|description|responsibilities|achievements?)\s*[:=-]\s*/i, ""));
}

function splitRecordParts(value: string) {
  return cleanText(value)
    .split(/\s*(?:\||•|·|;| \/ )\s*/g)
    .map(stripSourceLabel)
    .filter(Boolean);
}

function removeKnownPrefix(value: string, parts: string[]) {
  let text = cleanText(value);
  for (const part of parts.map(cleanText).filter(Boolean)) {
    const pattern = new RegExp(`^${escapeRegExp(part)}\\s*(?:\\||-|;|/|,|:)?\\s*`, "i");
    text = cleanText(text.replace(pattern, ""));
  }
  return text;
}

function removeDuplicateStructuralText(value: string, entry: Omit<ProfessionalIdentityExperienceEntry, "id" | "achievements">) {
  const text = cleanText(value);
  if (!text) return "";
  const structuralParts = [entry.role, entry.company, entry.location, entry.startDate, entry.endDate].map(cleanText).filter(Boolean);
  const textKey = comparable(text);
  const matchedParts = structuralParts.filter((part) => textKey.includes(comparable(part))).length;
  if (matchedParts >= Math.min(2, structuralParts.length)) {
    const stripped = removeKnownPrefix(text, structuralParts);
    if (stripped && stripped !== text) return stripped;
  }
  return text;
}

function isDuplicateRecordText(value: string, entry: Omit<ProfessionalIdentityExperienceEntry, "id" | "achievements">) {
  const text = cleanText(value);
  if (!text) return true;
  const textKey = comparable(text);
  const roleKey = comparable(entry.role);
  const companyKey = comparable(entry.company);
  const descriptionKey = comparable(entry.description);
  const dateKeys = [entry.startDate, entry.endDate].map(comparable).filter(Boolean);
  if (descriptionKey && textKey === descriptionKey) return true;
  if (roleKey && companyKey && textKey.includes(roleKey) && textKey.includes(companyKey)) {
    const containsDate = dateKeys.some((dateKey) => textKey.includes(dateKey));
    const containsDescription = descriptionKey && (textKey.includes(descriptionKey) || descriptionKey.includes(textKey));
    return Boolean(containsDate || containsDescription);
  }
  return false;
}

function looksLikeDateRange(value: string) {
  return /\b(19|20)\d{2}\b|present|current|actuel|aujourd'hui|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|janv|fev|fév|mars|avr|mai|juin|juil|aout|août|sept|oct|nov|dec|déc/i.test(value);
}

function normalizeDateRange(value: string) {
  return cleanText(value).replace(/[–—]/g, "-").replace(/\bcurrent\b/i, "Present");
}

function splitDates(value: string) {
  const text = normalizeDateRange(value);
  const parts = text.split(/\s+(?:-|to|au|a)\s+/i).map(cleanText).filter(Boolean);
  return {
    startDate: parts[0] ?? text,
    endDate: parts.length > 1 ? parts.slice(1).join(" - ") : ""
  };
}

function stringRecordToExperience(value: string, index: number): ProfessionalIdentityExperienceEntry | null {
  const sourceText = cleanText(value);
  if (!sourceText) return null;
  const parts = splitRecordParts(sourceText);
  const dateIndex = parts.findIndex(looksLikeDateRange);
  const dateText = dateIndex >= 0 ? parts[dateIndex] : "";
  const remaining = parts.filter((_, partIndex) => partIndex !== dateIndex);
  const role = remaining[0] ?? sourceText;
  const company = remaining[1] ?? "";
  const location = remaining.length > 3 ? remaining[2] : "";
  const descriptionStart = company ? (location ? 3 : 2) : 1;
  const description = remaining.slice(descriptionStart).join(". ");
  const dates = splitDates(dateText);
  const id = `experience-${index}-${slug([role, company, dates.startDate, dates.endDate, description].filter(Boolean).join("-")) || "entry"}`;
  return {
    id,
    role,
    company,
    location,
    startDate: dates.startDate,
    endDate: dates.endDate,
    description,
    achievements: []
  };
}

function objectRecordToExperience(value: Record<string, unknown>, index: number): ProfessionalIdentityExperienceEntry | null {
  const dateText = cleanText(value.dates) || cleanText(value.period) || cleanText(value.dateRange);
  const dates = splitDates(dateText);
  const role = cleanText(value.role) || cleanText(value.title) || cleanText(value.position) || cleanText(value.jobTitle);
  const company = cleanText(value.company) || cleanText(value.employer) || cleanText(value.organization) || cleanText(value.organisation) || cleanText(value.institution);
  const rawDescription = cleanText(value.description) || cleanText(value.summary) || cleanText(value.responsibilities);
  const achievements = cleanList(value.achievements);
  const fallback = stringRecordToExperience(cleanText(value.sourceText) || cleanText(value.raw) || "", index);
  const entryCore = {
    role: role || fallback?.role || "",
    company: company || fallback?.company || "",
    location: cleanText(value.location) || fallback?.location || "",
    startDate: cleanText(value.startDate) || cleanText(value.start_date) || dates.startDate || fallback?.startDate || "",
    endDate: cleanText(value.endDate) || cleanText(value.end_date) || dates.endDate || fallback?.endDate || "",
    description: ""
  };
  const description = removeDuplicateStructuralText(rawDescription || fallback?.description || "", entryCore);
  const entry = {
    id: cleanText(value.id) || fallback?.id || `experience-${index}-${slug([role, company, description].filter(Boolean).join("-")) || "entry"}`,
    ...entryCore,
    description,
    achievements: achievements.filter((achievement) => !isDuplicateRecordText(achievement, { ...entryCore, description }))
  };
  return entry.role || entry.company || entry.description || entry.achievements.length ? entry : null;
}

export function normalizeProfessionalIdentityExperienceEntries(value: unknown): ProfessionalIdentityExperienceEntry[] {
  const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(/\r?\n/).filter(Boolean) : [];
  const seen = new Set<string>();
  const output: ProfessionalIdentityExperienceEntry[] = [];
  source.forEach((item, index) => {
    const entry = typeof item === "string"
      ? stringRecordToExperience(item, index)
      : item && typeof item === "object"
        ? objectRecordToExperience(item as Record<string, unknown>, index)
        : null;
    if (!entry) return;
    const key = [entry.role, entry.company, entry.startDate, entry.endDate, entry.description].map((part) => cleanText(part).toLowerCase()).join("|");
    if (!key.replace(/\|/g, "") || seen.has(key)) return;
    seen.add(key);
    output.push({ ...entry, id: entry.id || `experience-${index}` });
  });
  return output;
}

export function experienceEntryDateLabel(entry: ProfessionalIdentityExperienceEntry) {
  return [entry.startDate, entry.endDate].map(cleanText).filter(Boolean).join(" - ");
}

export function experienceEntryToText(entry: ProfessionalIdentityExperienceEntry) {
  return [
    entry.role,
    entry.company,
    entry.location,
    experienceEntryDateLabel(entry),
    entry.description,
    ...entry.achievements
  ].map(cleanText).filter(Boolean).join(" | ");
}

export function experienceEntryEvidenceText(entry: ProfessionalIdentityExperienceEntry) {
  const heading = [entry.role, entry.company ? `at ${entry.company}` : ""].map(cleanText).filter(Boolean).join(" ");
  return [heading, experienceEntryDateLabel(entry), entry.description, ...entry.achievements].map(cleanText).filter(Boolean).join(". ");
}
