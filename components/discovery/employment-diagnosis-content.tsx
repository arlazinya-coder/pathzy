"use client";

import { DiscoveryFlow } from "@/components/discovery/discovery-flow";
import { usePathzyLanguage } from "@/components/language/language-selector";
import { PageHeader } from "@/components/ui";
import { pathzyPhase2T } from "@/lib/language/pathzy-i18n";

export function EmploymentDiagnosisContent() {
  const { language } = usePathzyLanguage();

  return (
    <div className="container page-pad">
      <PageHeader eyebrow={pathzyPhase2T(language, "discovery.eyebrow")} title={pathzyPhase2T(language, "discovery.title")}>
        {pathzyPhase2T(language, "discovery.body")}
      </PageHeader>
      <DiscoveryFlow />
    </div>
  );
}
