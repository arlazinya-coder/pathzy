import { InterviewPrepClient } from "@/components/interview/interview-prep-client";
import { PageHeader } from "@/components/ui";

export default function InterviewPage() {
  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Interview Practice" title="Practice before the opportunity arrives.">
        Prepare likely questions, STAR answers, strengths to highlight, weak spots to improve, and a final checklist before the interview.
      </PageHeader>
      <InterviewPrepClient />
    </div>
  );
}
