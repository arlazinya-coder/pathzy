import { Card, PageHeader } from "@/components/ui";
import { AuthNotice } from "@/components/auth/auth-notice";
import { RegisterForm } from "@/components/auth/register-form";

export default function SignupPage() {
  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Sign Up" title="Start building your future today.">
        Start free. No credit card required. PATHZY will guide you from discovery to stronger applications and interview readiness.
      </PageHeader>
      <Card className="mx-auto max-w-2xl">
        <AuthNotice />
        <RegisterForm />
      </Card>
    </div>
  );
}
