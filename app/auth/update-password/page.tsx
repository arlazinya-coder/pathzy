import { AuthNotice } from "@/components/auth/auth-notice";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { Card, PageHeader } from "@/components/ui";

export default function UpdatePasswordPage() {
  return (
    <div className="container page-pad">
      <PageHeader eyebrow="New Password" title="Choose a secure new password.">
        After updating your password, PATHZY will take you back to My Journey.
      </PageHeader>
      <Card className="mx-auto max-w-xl">
        <AuthNotice />
        <UpdatePasswordForm />
      </Card>
    </div>
  );
}
