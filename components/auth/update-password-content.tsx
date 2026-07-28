"use client";

import { AuthNotice } from "@/components/auth/auth-notice";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { usePathzyLanguage } from "@/components/language/language-selector";
import { Card, PageHeader } from "@/components/ui";
import { pathzyPhase2T } from "@/lib/language/pathzy-i18n";

export function UpdatePasswordContent() {
  const { language } = usePathzyLanguage();

  return (
    <div className="container page-pad">
      <PageHeader eyebrow={pathzyPhase2T(language, "auth.update.eyebrow")} title={pathzyPhase2T(language, "auth.update.title")}>
        {pathzyPhase2T(language, "auth.update.body")}
      </PageHeader>
      <Card className="mx-auto max-w-xl">
        <AuthNotice />
        <UpdatePasswordForm />
      </Card>
    </div>
  );
}
