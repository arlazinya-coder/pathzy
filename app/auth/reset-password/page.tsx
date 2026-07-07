import { AuthNotice } from "@/components/auth/auth-notice";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Card, PageHeader } from "@/components/ui";

export default function ResetPasswordPage() {
  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Password Reset" title="Get back into PATHZY.">
        Enter your email and PATHZY will send a secure link to reset your password.
      </PageHeader>
      <Card className="mx-auto max-w-xl">
        <AuthNotice />
        <ResetPasswordForm />
      </Card>
    </div>
  );
}
