import { PageHeader, Card } from "@/components/ui";

export default function TermsPage() {
  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Terms" title="Terms of Use">
        Use PATHZY as a support tool while making your own career decisions.
      </PageHeader>
      <Card>
        <p className="leading-7 text-white/62">
          This is a launch placeholder. PATHZY helps improve job readiness and application quality. It does not guarantee jobs or interviews. A full legal review is recommended before public launch.
        </p>
      </Card>
    </div>
  );
}
