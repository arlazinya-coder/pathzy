import { PageHeader, Card } from "@/components/ui";

export default function DisclaimerPage() {
  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Disclaimer" title="Employment Support Disclaimer">
        PATHZY supports your journey. It does not promise a result.
      </PageHeader>
      <Card>
        <p className="leading-7 text-white/62">
          PATHZY helps improve job readiness and application quality. It does not guarantee jobs or interviews. Always review your documents, applications, and decisions before sending or acting.
        </p>
      </Card>
    </div>
  );
}
