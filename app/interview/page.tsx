import { Suspense } from "react";
import InterviewClient from "./InterviewClient";
import { PageHeader } from "@/components/ui";
import { listInterviewPrepApplications } from "@/lib/interview/interview-prep-service";
import { appRoutes } from "@/lib/navigation/routes";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

export default async function InterviewPage() {
  const { user, supabase } = await requireAuthenticatedUser(appRoutes.interview);
  const applications = await listInterviewPrepApplications(supabase, user.id);

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Interview Practice" title="Practice before the opportunity arrives.">
        Prepare job-specific questions, evidence-backed STAR stories, honest gap responses, and safe practice feedback for one tracked application.
      </PageHeader>
      <Suspense fallback={<div className="mt-6 rounded-[22px] border border-white/10 bg-white/6 p-6 text-sm font-bold text-white/62">Loading interview...</div>}>
        <InterviewClient applications={applications as never[]} />
      </Suspense>
    </div>
  );
}
