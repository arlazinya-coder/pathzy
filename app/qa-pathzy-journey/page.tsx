import Link from "next/link";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { getMembershipState } from "@/lib/launch/launch-service";
import { createSupabaseServerClient, getCurrentSession, getCurrentUser } from "@/lib/supabase/server";

type QaStatus = "pass" | "fail" | "manual";

const journeyItems = [
  ["Logged out home", "/"],
  ["Signup", "/signup"],
  ["Login", "/login"],
  ["My Employment Journey", "/roadmap"],
  ["Continue My Journey opens current step", "/roadmap"],
  ["Current step matches Journey Engine", "/roadmap"],
  ["Up next appears once", "/roadmap"],
  ["Founder does not interrupt journey", "/roadmap"],
  ["Your Mentor", "/mentor"],
  ["Career Discovery", "/discovery"],
  ["My CV", "/professional-identity/cv"],
  ["Create My Cover Letter", "/professional-identity/cover-letter"],
  ["Improve My LinkedIn", "/professional-identity/linkedin"],
  ["Career Passport", "/professional-identity/career-passport"],
  ["My Documents", "/professional-identity/documents"],
  ["Find Opportunities", "/opportunities"],
  ["My Applications", "/applications"],
  ["Interview Practice", "/interview"],
  ["Billing", "/billing"],
  ["Logout/Login persistence", "/login"],
  ["Mobile check", "/roadmap"],
  ["Mobile journey is simple", "/roadmap"],
  ["No technical errors", "/qa-pathzy-journey"]
] as const;

function StatusBadge({ status }: { status: QaStatus }) {
  const classes =
    status === "pass"
      ? "bg-[#39d98a]/15 text-[#9df0c4]"
      : status === "fail"
        ? "bg-[#ff6b6b]/15 text-[#ffc5c5]"
        : "bg-[#FFD166]/15 text-[#ffe2a3]";

  return <span className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${classes}`}>{status === "manual" ? "Needs manual test" : status}</span>;
}

export default async function QaPathzyJourneyPage() {
  const user = await getCurrentUser();
  const session = await getCurrentSession();
  const supabase = await createSupabaseServerClient();
  const [{ data: profile }, { data: discovery }, { data: brain }, { data: professionalIdentity }, { data: applications }, { data: conversations }, launchMembership] =
    user && supabase
      ? await Promise.all([
          supabase.from("user_profiles").select("onboarding_completed,founder,premium").or(`user_id.eq.${user.id},id.eq.${user.id}`).maybeSingle(),
          supabase.from("discovery_responses").select("id").eq("user_id", user.id).limit(1).maybeSingle(),
          supabase.from("pathzy_brain").select("employment_readiness_score,career_goal").eq("user_id", user.id).maybeSingle(),
          supabase.from("professional_identity").select("professional_identity_score,cv_status,cover_letter_status,linkedin_status,career_passport_status").eq("user_id", user.id).maybeSingle(),
          supabase.from("employment_applications").select("id,status").eq("user_id", user.id),
          supabase.from("mentor_conversations").select("id").eq("user_id", user.id).limit(1),
          getMembershipState(supabase, user.id)
        ])
      : [{ data: null }, { data: null }, { data: null }, { data: null }, { data: [] }, { data: [] }, null];

  const statuses: Record<string, { status: QaStatus; note: string }> = {
    "Logged out home": { status: "manual", note: "Home should show PATHZY, Start Free, Login, and no credit card required." },
    Signup: { status: "manual", note: "Create a new account and confirm the success message is clear." },
    Login: { status: user ? "pass" : "manual", note: "Confirmed users can log in and land on My Journey." },
    "My Employment Journey": { status: user ? "pass" : "manual", note: "My Employment Journey should show one clear next step, why it matters, estimated time, one Continue button, Up next, and Later." },
    "Current step matches Journey Engine": { status: "manual", note: "The current step should match the Continue My Journey destination." },
    "Continue My Journey opens current step": { status: "manual", note: "Click Continue My Journey and confirm it opens the active next step, never Founder access." },
    "Up next appears once": { status: "manual", note: "Confirm the current step is not repeated in another large timeline block." },
    "Founder does not interrupt journey": { status: "manual", note: "Founder/Billing should appear only when clicked from Billing or account areas." },
    "Your Mentor": { status: conversations?.length ? "pass" : "manual", note: "Ask: What should I do next? It should include one next step, time, why, and a relevant route." },
    "Career Discovery": { status: discovery ? "pass" : "manual", note: "Complete Discovery and confirm a career direction is saved." },
    "My CV": { status: professionalIdentity?.cv_status !== "not_started" ? "pass" : "manual", note: "Generate, preview, edit, copy, and test paid/founder download behavior." },
    "Create My Cover Letter": { status: professionalIdentity?.cover_letter_status !== "not_started" ? "pass" : "manual", note: "Generate, preview, edit, copy, and test paid/founder download behavior." },
    "Improve My LinkedIn": { status: professionalIdentity?.linkedin_status !== "not_started" ? "pass" : "manual", note: "Generate LinkedIn copy and confirm it saves to My Documents." },
    "Career Passport": { status: professionalIdentity?.career_passport_status !== "not_started" ? "pass" : "manual", note: "Generate Career Passport and confirm it saves to My Documents." },
    "My Documents": { status: "manual", note: "Confirm saved documents appear and support view, rename, copy, download, duplicate, and delete." },
    "Find Opportunities": { status: applications?.length ? "pass" : "manual", note: "Save one opportunity and confirm it creates or updates application tracking." },
    "My Applications": { status: applications?.length ? "pass" : "manual", note: "Mark an opportunity as applied or update an application." },
    "Interview Practice": { status: "manual", note: "Generate practice, save it, copy it, and mark it complete." },
    Billing: { status: "manual", note: "Confirm Free, Pro, Premium, and Career Pro pricing are shown. Founder should not appear as a normal pricing card." },
    "Logout/Login persistence": { status: "manual", note: "Log out, log back in, and confirm Founder/Premium state persists." },
    "Mobile check": { status: "manual", note: "Test My Journey, Mentor, Today&apos;s Next Step, Documents, Opportunities, and Interview Practice on mobile width." },
    "Mobile journey is simple": { status: "manual", note: "On mobile, the journey should show one main action, no horizontal overflow, and readable buttons." },
    "No technical errors": { status: "manual", note: "Move through the journey and confirm no setup, database, provider, or stack messages appear to users." }
  };

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Internal QA" title="Launch Readiness Checklist">
        Development-only checklist for the first real user test. Items use app state where possible and link to the route to test.
      </PageHeader>
      <div className="mb-6 flex flex-wrap gap-3">
        <ButtonLink href="/signup">Start Full Test Journey</ButtonLink>
        <ButtonLink href="/roadmap" variant="secondary">Open My Employment Journey</ButtonLink>
      </div>
      {process.env.NODE_ENV !== "production" ? (
        <Card className="mb-6">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Development auth state</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[18px] border border-white/10 bg-white/7 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">Logged in</p>
              <strong className="mt-2 block">{user ? "yes" : "no"}</strong>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/7 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">User email</p>
              <strong className="mt-2 block break-all">{user?.email ?? "none"}</strong>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/7 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">Session exists</p>
              <strong className="mt-2 block">{session ? "yes" : "no"}</strong>
            </div>
          </div>
        </Card>
      ) : null}
      <Card>
        <div className="grid gap-3">
          {journeyItems.map(([label, href]) => {
            const item = statuses[label] ?? { status: "manual" as const, note: "Open this route and verify manually." };
            return (
              <Link key={label} href={href} className="grid gap-3 rounded-[18px] border border-white/10 bg-white/7 p-4 transition hover:bg-white/10 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <span className="font-black text-white/82">{label}</span>
                  <p className="mt-1 text-sm leading-6 text-white/54">{item.note}</p>
                </div>
                <StatusBadge status={item.status} />
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
