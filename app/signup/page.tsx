import { PathzyLanguageProvider } from "@/components/language/language-selector";
import { SignupContent } from "@/components/auth/signup-content";
import { getServerInterfaceLanguage } from "@/lib/language/server-language";

export default async function SignupPage() {
  const initialLanguage = await getServerInterfaceLanguage();

  return (
    <PathzyLanguageProvider initialLanguage={initialLanguage}>
      <SignupContent />
    </PathzyLanguageProvider>
  );
}
