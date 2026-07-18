"use client";

import { InterviewPrepClient } from "@/components/interview/interview-prep-client";

type ApplicationOption = {
  id: string;
  company_name: string;
  role: string;
  status: string;
  job_understanding_id?: string | null;
  job_match_analysis_id?: string | null;
  targeted_cv_document_id?: string | null;
  interview_date?: string | null;
};

export default function InterviewClient({ applications }: { applications: ApplicationOption[] }) {
  return <InterviewPrepClient applications={applications} />;
}
