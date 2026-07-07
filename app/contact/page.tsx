import { PageHeader, Card } from "@/components/ui";

export default function ContactPage() {
  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Contact" title="Contact PATHZY">
        Questions, feedback, and founder tester reports can be sent to the PATHZY team.
      </PageHeader>
      <Card>
        <p className="leading-7 text-white/62">
          Contact details will be finalized before public launch. For now, use this page as the support destination for tester feedback, bug reports, and partnership interest.
        </p>
      </Card>
    </div>
  );
}
