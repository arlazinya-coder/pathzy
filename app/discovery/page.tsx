import { DiscoveryFlow } from "@/components/discovery/discovery-flow";
import { PageHeader } from "@/components/ui";

export default function DiscoveryPage() {
  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Career Discovery" title="Let PATHZY understand your future.">
        Answer a focused interview so PATHZY can generate your first career direction, skills plan, 90-day career plan, and today&apos;s first mission.
      </PageHeader>
      <DiscoveryFlow />
    </div>
  );
}
