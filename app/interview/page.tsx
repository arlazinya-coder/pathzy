import { Suspense } from "react";
import InterviewClient from "./InterviewClient";
import { PageHeader } from "@/components/ui";

export default function InterviewPage() {
  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Interview Practice" title="Practice before the opportunity arrives.">
        Prepare likely questions, STAR answers, strengths to highlight, weak spots to improve, and a final checklist before the interview.
      </PageHeader>
      <Suspense fallback={<div className="mt-6 rounded-[22px] border border-white/10 bg-white/6 p-6 text-sm font-bold text-white/62">Loading interview...</div>}>
        <InterviewClient />
      </Suspense>
    </div>
  );
}
