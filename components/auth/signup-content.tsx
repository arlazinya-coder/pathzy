"use client";

import { AuthNotice } from "@/components/auth/auth-notice";
import { RegisterForm } from "@/components/auth/register-form";
import { LanguageSelector, usePathzyLanguage } from "@/components/language/language-selector";
import { Card, PageHeader } from "@/components/ui";
import { pathzyPhase2T, pathzyT } from "@/lib/language/pathzy-i18n";

export function SignupContent() {
  const { language } = usePathzyLanguage();
  const t = (key: Parameters<typeof pathzyT>[1]) => pathzyT(language, key);

  return (
    <div className="container page-pad">
      <div className="mb-5 flex justify-end">
        <LanguageSelector persistAuthenticated={false} label={pathzyPhase2T(language, "language.selector.public")} />
      </div>
      <PageHeader eyebrow={t("auth.signup.eyebrow")} title={t("auth.signup.title")}>
        {t("auth.signup.body")}
      </PageHeader>
      <Card className="mx-auto max-w-2xl">
        <AuthNotice />
        <RegisterForm />
      </Card>
    </div>
  );
}
