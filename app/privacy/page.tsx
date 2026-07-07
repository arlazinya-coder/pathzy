import { PageHeader, Card } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Privacy" title="Privacy Policy">
        PATHZY only asks for information that helps personalize your employment journey.
      </PageHeader>
      <Card>
        <p className="leading-7 text-white/62">
          This is a launch placeholder. PATHZY may store profile details, career goals, documents, applications, and progress so the product can guide your next step. We do not sell user data. A full legal policy should be reviewed before public launch.
        </p>
      </Card>
    </div>
  );
}
