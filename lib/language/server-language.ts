import { cookies, headers } from "next/headers";
import { interfaceLanguageCookieName, normalizeLanguageCode, suggestedLanguageFromBrowser, type SupportedLanguageCode } from "@/lib/language/language-preferences";

export async function getServerInterfaceLanguage(profileLanguage?: string | null): Promise<SupportedLanguageCode> {
  if (profileLanguage) return normalizeLanguageCode(profileLanguage);

  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(interfaceLanguageCookieName)?.value;
  if (cookieLanguage) return normalizeLanguageCode(cookieLanguage);

  const headerStore = await headers();
  return suggestedLanguageFromBrowser(headerStore.get("accept-language"));
}
