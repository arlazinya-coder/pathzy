"use client";

import { Suspense } from "react";
import { AuthNotice } from "@/components/auth/auth-notice";
import { LoginForm } from "@/components/auth/login-form";
import { LanguageSelector, usePathzyLanguage } from "@/components/language/language-selector";
import { Card, PageHeader } from "@/components/ui";
import { pathzyPhase2T, pathzyT } from "@/lib/language/pathzy-i18n";

export function LoginContent() {
  const { language } = usePathzyLanguage();
  const t = (key: Parameters<typeof pathzyT>[1]) => pathzyT(language, key);

  return (
    <div className="container page-pad">
      <div className="mb-5 flex justify-end">
        <LanguageSelector persistAuthenticated={false} label={pathzyPhase2T(language, "language.selector.public")} />
      </div>
      <PageHeader eyebrow={t("auth.login.eyebrow")} title={t("auth.login.title")}>
        {t("auth.login.body")}
      </PageHeader>
      <Card className="mx-auto max-w-xl">
        <AuthNotice />
        <Suspense fallback={<div className="rounded-[18px] border border-white/10 bg-white/7 p-4 text-sm font-bold text-white/64">{pathzyT(language, "auth.login.loading")}</div>}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
