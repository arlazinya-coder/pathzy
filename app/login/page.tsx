import { LoginContent } from "@/components/auth/login-content";
import { PathzyLanguageProvider } from "@/components/language/language-selector";
import { getServerInterfaceLanguage } from "@/lib/language/server-language";

export default async function LoginPage() {
  const initialLanguage = await getServerInterfaceLanguage();

  return (
    <PathzyLanguageProvider initialLanguage={initialLanguage}>
      <LoginContent />
    </PathzyLanguageProvider>
  );
}
