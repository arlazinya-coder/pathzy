import { EmploymentDiagnosisContent } from "@/components/discovery/employment-diagnosis-content";
import { PathzyLanguageProvider } from "@/components/language/language-selector";
import { getServerInterfaceLanguage } from "@/lib/language/server-language";

export default async function DiscoveryPage() {
  const initialLanguage = await getServerInterfaceLanguage();

  return (
    <PathzyLanguageProvider initialLanguage={initialLanguage}>
      <EmploymentDiagnosisContent />
    </PathzyLanguageProvider>
  );
}
