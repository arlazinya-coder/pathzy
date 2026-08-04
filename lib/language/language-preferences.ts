export const supportedLanguageCodes = ["en", "fr"] as const;

export type SupportedLanguageCode = (typeof supportedLanguageCodes)[number];

export const interfaceLanguageCookieName = "pathzy_interface_language";

export type LanguagePreferenceLayer =
  | "interface"
  | "professional_document"
  | "career_coach"
  | "interview_practice"
  | "notification_email";

export type PathzyLanguagePreferences = Record<LanguagePreferenceLayer, SupportedLanguageCode>;

export const languageLabels: Record<SupportedLanguageCode, string> = {
  en: "English",
  fr: "Français"
};

export const defaultLanguagePreferences: PathzyLanguagePreferences = {
  interface: "en",
  professional_document: "en",
  career_coach: "en",
  interview_practice: "en",
  notification_email: "en"
};

export const professionalDocumentLanguageLabels = {
  same_as_interface: "Same as interface language",
  en: languageLabels.en,
  fr: languageLabels.fr
} as const;

export type ProfessionalDocumentLanguageChoice = keyof typeof professionalDocumentLanguageLabels;

export const languagePreferenceStorageMap: Record<LanguagePreferenceLayer, { current: string[]; future: string[] }> = {
  interface: { current: ["user_profiles.language"], future: ["user_profiles.interface_language"] },
  professional_document: { current: ["professional_identity.language", "professional_documents.language"], future: ["user_language_preferences.professional_document_language"] },
  career_coach: { current: ["pathzy_brain.language"], future: ["user_language_preferences.career_coach_language"] },
  interview_practice: { current: ["interview_preps.language"], future: ["user_language_preferences.interview_practice_language"] },
  notification_email: { current: [], future: ["user_language_preferences.notification_email_language"] }
};

export type LanguagePreferenceSource = Partial<Record<LanguagePreferenceLayer, string | null | undefined>> & {
  language?: string | null;
  interface_language?: string | null;
  document_language?: string | null;
  professional_document_language?: string | null;
  coach_language?: string | null;
  career_coach_language?: string | null;
  interview_language?: string | null;
  interview_practice_language?: string | null;
  notification_language?: string | null;
  notification_email_language?: string | null;
};

function parseSupportedLanguage(value?: string | null): SupportedLanguageCode | null {
  const normalized = value
    ?.trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, "-");
  if (!normalized) return null;
  if (normalized === "fr" || normalized === "french" || normalized === "francais" || normalized.startsWith("fr-")) return "fr";
  if (normalized === "en" || normalized === "english" || normalized === "anglais" || normalized.startsWith("en-")) return "en";
  return null;
}

export function normalizeSupportedLanguage(value?: string | null, fallback?: string | null): SupportedLanguageCode {
  return parseSupportedLanguage(value) ?? parseSupportedLanguage(fallback) ?? "en";
}

export function normalizeLanguageCode(value?: string | null): SupportedLanguageCode {
  return normalizeSupportedLanguage(value);
}

export function legacyLanguageValue(code: SupportedLanguageCode) {
  return code === "fr" ? "french" : "english";
}

export function normalizeProfessionalDocumentLanguageChoice(value?: string | null): ProfessionalDocumentLanguageChoice {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "same_as_interface" || normalized === "same" || normalized === "interface") return "same_as_interface";
  return normalizeLanguageCode(value);
}

export function suggestedLanguageFromBrowser(browserLanguage?: string | null): SupportedLanguageCode {
  const primary = browserLanguage?.split(",")[0]?.split("-")[0]?.trim().toLowerCase();
  return primary === "fr" ? "fr" : "en";
}

export function resolveLanguagePreferences(source: LanguagePreferenceSource | null | undefined): PathzyLanguagePreferences {
  const legacy = normalizeLanguageCode(source?.language);
  return {
    interface: normalizeLanguageCode(source?.interface ?? source?.interface_language ?? source?.language),
    professional_document: normalizeLanguageCode(source?.professional_document ?? source?.professional_document_language ?? source?.document_language ?? legacy),
    career_coach: normalizeLanguageCode(source?.career_coach ?? source?.career_coach_language ?? source?.coach_language ?? legacy),
    interview_practice: normalizeLanguageCode(source?.interview_practice ?? source?.interview_practice_language ?? source?.interview_language ?? legacy),
    notification_email: normalizeLanguageCode(source?.notification_email ?? source?.notification_email_language ?? source?.notification_language ?? legacy)
  };
}

export function updateLanguagePreference(
  preferences: PathzyLanguagePreferences,
  layer: LanguagePreferenceLayer,
  language: SupportedLanguageCode
): PathzyLanguagePreferences {
  return {
    ...preferences,
    [layer]: language
  };
}

export function profileLanguagePatchForInterface(userId: string, language: SupportedLanguageCode, email?: string | null) {
  return {
    user_id: userId,
    email: email ?? null,
    language: legacyLanguageValue(language),
    updated_at: new Date().toISOString()
  };
}
