import { UpdatePasswordContent } from "@/components/auth/update-password-content";
import { PathzyLanguageProvider } from "@/components/language/language-selector";
import { getServerInterfaceLanguage } from "@/lib/language/server-language";

export default async function UpdatePasswordPage() {
  const initialLanguage = await getServerInterfaceLanguage();

  return (
    <PathzyLanguageProvider initialLanguage={initialLanguage}>
      <UpdatePasswordContent />
    </PathzyLanguageProvider>
  );
}
