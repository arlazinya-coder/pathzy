import { Suspense } from "react";
import { Card, PageHeader } from "@/components/ui";
import { AuthNotice } from "@/components/auth/auth-notice";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Login" title="Welcome back to PATHZY.">
        Continue your PATHZY journey, today&apos;s mission, documents, opportunities, and employment tracker.
      </PageHeader>
      <Card className="mx-auto max-w-xl">
        <AuthNotice />
        <Suspense fallback={<div className="rounded-[18px] border border-white/10 bg-white/7 p-4 text-sm font-bold text-white/64">Loading secure login...</div>}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
