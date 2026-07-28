import { ResetPasswordContent } from "@/components/auth/reset-password-content";
import { PathzyLanguageProvider } from "@/components/language/language-selector";
import { getServerInterfaceLanguage } from "@/lib/language/server-language";

export default async function ResetPasswordPage() {
  const initialLanguage = await getServerInterfaceLanguage();

  return (
    <PathzyLanguageProvider initialLanguage={initialLanguage}>
      <ResetPasswordContent />
    </PathzyLanguageProvider>
  );
}
