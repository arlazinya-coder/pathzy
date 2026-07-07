import { MentorChat } from "@/components/mentor/mentor-chat";
import { PageHeader } from "@/components/ui";
import { requireAuthenticatedUser } from "@/lib/supabase/server";
import { Suspense } from "react";

export default async function MentorPage() {
  await requireAuthenticatedUser("/mentor");

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Your Mentor" title="Your personal career mentor.">
        Continue saved conversations, ask for career plan guidance, prepare for interviews, improve your CV, and get the next best mission for your future.
      </PageHeader>
      <Suspense fallback={<div className="rounded-[24px] border border-white/10 bg-white/7 p-6 text-white/58">Loading your Mentor...</div>}>
        <MentorChat />
      </Suspense>
    </div>
  );
}
