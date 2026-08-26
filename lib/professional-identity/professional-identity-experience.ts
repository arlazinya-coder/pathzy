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

const STRUCTURAL_DELIMITER_PATTERN = "[|;/:,·•\\-–—]";

function slug(value: string) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

function stripSourceLabel(value: string) {
  return cleanText(value.replace(/^(role|title|position|company|employer|organisation|organization|institution|period|date|dates|location|description|responsibilities|achievements?)\s*[:=-]\s*/i, ""));
}

function splitRecordParts(value: string) {
  const protectedDateRanges = cleanText(value).replace(
    /\b((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|present|current|actuel|aujourd'hui)\b/gi,
    "$1~date-range~$2"
  );
  return protectedDateRanges
    .split(/\s*(?:\||•|·|;| \/ )\s*/g)
    .flatMap((part) => part.split(/\s+-\s+/g))
    .map((part) => stripSourceLabel(part.replace(/~date-range~/g, " - ")))
    .filter(Boolean);
}

function removeKnownPrefix(value: string, parts: string[]) {
  let text = cleanText(value);
  for (const part of parts.map(cleanText).filter(Boolean)) {
    const pattern = new RegExp(`^${escapeRegExp(part)}(?=$|\\s|${STRUCTURAL_DELIMITER_PATTERN})\\s*(?:${STRUCTURAL_DELIMITER_PATTERN}\\s*)?`, "i");
    text = cleanText(text.replace(pattern, "").replace(new RegExp(`^(?:${STRUCTURAL_DELIMITER_PATTERN}\\s*)+`), ""));
  }
  return text;
}

function looseStructuralPattern(value: string) {
  return cleanText(value)
    .split(/\s+/)
    .map(escapeRegExp)
    .join("[\\s\\W]+");
}

function removeLooseKnownPrefix(value: string, parts: string[]) {
  let text = cleanText(value);
  for (const part of parts.map(cleanText).filter(Boolean)) {
    const pattern = looseStructuralPattern(part);
    if (!pattern) continue;
    text = cleanText(
      text
        .replace(new RegExp(`^${pattern}(?=$|[\\s\\W])\\s*(?:${STRUCTURAL_DELIMITER_PATTERN}\\s*)?`, "i"), "")
        .replace(new RegExp(`^(?:${STRUCTURAL_DELIMITER_PATTERN}\\s*)+`), "")
    );
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
    const looseStripped = removeLooseKnownPrefix(text, structuralParts);
    if (looseStripped && looseStripped !== text) return looseStripped;
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

function normalizedTextKey(value: string) {
  return cleanText(value).toLowerCase();
}

function isGeneratedExperienceId(value: string) {
  return /^experience-\d+(?:-|$)/i.test(cleanText(value));
}

function stableExperienceId(value: string) {
  const id = cleanText(value);
  return id && !isGeneratedExperienceId(id) ? id : "";
}

function experienceStructureKey(entry: ProfessionalIdentityExperienceEntry) {
  const role = comparable(entry.role);
  const company = comparable(entry.company);
  const startDate = comparable(entry.startDate);
  const endDate = comparable(entry.endDate);
  if (!role || !company) return "";
  return [role, company, startDate, endDate].join("|");
}

function experienceContentKey(entry: ProfessionalIdentityExperienceEntry) {
  return [
    entry.role,
    entry.company,
    entry.location,
    entry.startDate,
    entry.endDate,
    entry.description,
    ...entry.achievements
  ].map(normalizedTextKey).join("|");
}

function descriptionsOverlap(first: string, second: string) {
  const firstKey = comparable(first);
  const secondKey = comparable(second);
  if (!firstKey || !secondKey) return false;
  return firstKey.includes(secondKey) || secondKey.includes(firstKey);
}

function sameCanonicalExperience(first: ProfessionalIdentityExperienceEntry, second: ProfessionalIdentityExperienceEntry) {
  const firstStableId = stableExperienceId(first.id);
  const secondStableId = stableExperienceId(second.id);
  if (firstStableId && secondStableId && firstStableId === secondStableId) return true;

  const firstStructure = experienceStructureKey(first);
  const secondStructure = experienceStructureKey(second);
  if (firstStructure && secondStructure && firstStructure === secondStructure) return true;

  const sameRole = comparable(first.role) && comparable(first.role) === comparable(second.role);
  const sameCompany = comparable(first.company) && comparable(first.company) === comparable(second.company);
  if (!sameRole || !sameCompany) return false;

  const firstDates = [comparable(first.startDate), comparable(first.endDate)].filter(Boolean).join("|");
  const secondDates = [comparable(second.startDate), comparable(second.endDate)].filter(Boolean).join("|");
  if (firstDates && secondDates && firstDates !== secondDates) return false;

  return Boolean(firstDates || secondDates || descriptionsOverlap(first.description, second.description));
}

function richerText(first: string, second: string) {
  const cleanFirst = cleanText(first);
  const cleanSecond = cleanText(second);
  if (!cleanFirst) return cleanSecond;
  if (!cleanSecond) return cleanFirst;
  if (descriptionsOverlap(cleanFirst, cleanSecond)) return cleanFirst.length >= cleanSecond.length ? cleanFirst : cleanSecond;
  return cleanFirst;
}

function mergeAchievements(first: string[], second: string[], entry: Omit<ProfessionalIdentityExperienceEntry, "id" | "achievements">) {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const achievement of [...first, ...second]) {
    const text = cleanText(achievement);
    const key = comparable(text);
    if (!text || !key || seen.has(key) || isDuplicateRecordText(text, entry)) continue;
    seen.add(key);
    output.push(text);
  }
  return output;
}

function mergeExperienceEntries(first: ProfessionalIdentityExperienceEntry, second: ProfessionalIdentityExperienceEntry) {
  const entryCore = {
    role: first.role || second.role,
    company: first.company || second.company,
    location: first.location || second.location,
    startDate: first.startDate || second.startDate,
    endDate: first.endDate || second.endDate,
    description: removeDuplicateStructuralText(richerText(first.description, second.description), {
      role: first.role || second.role,
      company: first.company || second.company,
      location: first.location || second.location,
      startDate: first.startDate || second.startDate,
      endDate: first.endDate || second.endDate,
      description: ""
    })
  };
  return {
    id: stableExperienceId(first.id) ? first.id : stableExperienceId(second.id) ? second.id : first.id || second.id,
    ...entryCore,
    achievements: mergeAchievements(first.achievements, second.achievements, entryCore)
  };
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
  const dates = splitDates(dateText);
  const entryCore = {
    role,
    company,
    location,
    startDate: dates.startDate,
    endDate: dates.endDate,
    description: ""
  };
  const description = removeDuplicateStructuralText(remaining.slice(descriptionStart).join(". "), entryCore);
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
  const fallback = stringRecordToExperience(
    cleanText(value.sourceText) ||
      cleanText(value.source_text) ||
      cleanText(value.rawText) ||
      cleanText(value.raw_text) ||
      cleanText(value.displayValue) ||
      cleanText(value.generatedText) ||
      cleanText(value.generated_text) ||
      cleanText(value.raw) ||
      "",
    index
  );
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
  const output: ProfessionalIdentityExperienceEntry[] = [];
  source.forEach((item, index) => {
    const entry = typeof item === "string"
      ? stringRecordToExperience(item, index)
      : item && typeof item === "object"
        ? objectRecordToExperience(item as Record<string, unknown>, index)
        : null;
    if (!entry) return;
    const normalizedEntry = { ...entry, id: entry.id || `experience-${index}` };
    const key = experienceContentKey(normalizedEntry);
    if (!key.replace(/\|/g, "")) return;
    const existingIndex = output.findIndex((existing) => sameCanonicalExperience(existing, normalizedEntry) || experienceContentKey(existing) === key);
    if (existingIndex >= 0) {
      output[existingIndex] = mergeExperienceEntries(output[existingIndex], normalizedEntry);
      return;
    }
    output.push(normalizedEntry);
  });
  return output;
}

export type ProfessionalIdentityExperienceSourceSet = {
  experience?: unknown;
  experience_entries?: unknown;
  experienceEntries?: unknown;
  experience_history?: unknown;
  experienceHistory?: unknown;
  personal_background?: unknown;
  personalBackground?: unknown;
};

function hasExperienceSourceSetShape(value: unknown): value is ProfessionalIdentityExperienceSourceSet {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      (
        "experience" in value ||
        "experience_entries" in value ||
        "experienceEntries" in value ||
        "experience_history" in value ||
        "experienceHistory" in value ||
        "personal_background" in value ||
        "personalBackground" in value
      )
  );
}

export function selectCanonicalProfessionalIdentityExperiences(source: unknown): ProfessionalIdentityExperienceEntry[] {
  if (!hasExperienceSourceSetShape(source)) {
    return normalizeProfessionalIdentityExperienceEntries(source);
  }
  const candidates = [
    source.experience_entries,
    source.experienceEntries,
    source.experience,
    source.experience_history,
    source.experienceHistory,
    source.personal_background,
    source.personalBackground
  ];
  for (const candidate of candidates) {
    const entries = normalizeProfessionalIdentityExperienceEntries(candidate);
    if (entries.length) return entries;
  }
  return [];
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
