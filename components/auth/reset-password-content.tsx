"use client";

import { AuthNotice } from "@/components/auth/auth-notice";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { usePathzyLanguage } from "@/components/language/language-selector";
import { Card, PageHeader } from "@/components/ui";
import { pathzyPhase2T } from "@/lib/language/pathzy-i18n";

export function ResetPasswordContent() {
  const { language } = usePathzyLanguage();

  return (
    <div className="container page-pad">
      <PageHeader eyebrow={pathzyPhase2T(language, "auth.reset.eyebrow")} title={pathzyPhase2T(language, "auth.reset.title")}>
        {pathzyPhase2T(language, "auth.reset.body")}
      </PageHeader>
      <Card className="mx-auto max-w-xl">
        <AuthNotice />
        <ResetPasswordForm />
      </Card>
    </div>
  );
}
