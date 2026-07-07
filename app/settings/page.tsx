import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { LanguageSettingsForm } from "@/components/settings/language-settings-form";
import { getMembershipState } from "@/lib/launch/launch-service";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

const settings = ["Profile visibility", "Mentor memory", "Next step reminders", "Opportunity alerts", "Data export"];

function formatDate(value?: string | null) {
  if (!value) return "Not applicable";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

function daysRemaining(value?: string | null) {
  if (!value) return "Not applicable";
  const diff = new Date(value).getTime() - Date.now();
  return `${Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))} days`;
}

function membershipType(value?: string | null) {
  if (value === "Founding Tester") return "Founding Tester";
  return "PATHZY Member";
}

export default async function SettingsPage() {
  const { user, supabase } = await requireAuthenticatedUser("/profile");
  const [{ data: profile }, { data: discovery }, membership] = await Promise.all([
    supabase.from("user_profiles").select("full_name,email,country,career_goal,created_at,language").or(`user_id.eq.${user.id},id.eq.${user.id}`).maybeSingle(),
    supabase.from("discovery_responses").select("answers,generated_result").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    getMembershipState(supabase, user.id)
  ]);
  const roadmapGoal = (discovery?.generated_result as { career_paths?: Array<{ title?: string }> } | null)?.career_paths?.[0]?.title;
  const answers = discovery?.answers as { preferred_career_direction?: string } | null;
  const careerGoal = profile?.career_goal ?? roadmapGoal ?? answers?.preferred_career_direction ?? "Choose your career direction";
  const joinedAt = membership.joinedAt ?? profile?.created_at ?? null;

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Profile" title="Your PATHZY membership">
        View your Founder entitlement, premium access, and core career profile details.
      </PageHeader>
      <div className="grid gap-5 lg:grid-cols-[.65fr_.35fr]">
        <Card>
          <h2 className="mb-5 text-2xl font-black">Founder Premium</h2>
          <div className="mb-6 grid gap-3">
            <div className="rounded-[18px] border border-[#39d98a]/25 bg-[#39d98a]/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9df0c4]/70">Badge</p>
              <strong className="mt-2 block">{membership.label}</strong>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-[18px] border border-white/10 bg-white/7 p-4"><p className="text-xs text-white/42">Founder Number</p><strong>{membership.memberNumber ? `#${membership.memberNumber}` : "Not assigned"}</strong></div>
              <div className="rounded-[18px] border border-white/10 bg-white/7 p-4"><p className="text-xs text-white/42">Membership Type</p><strong>{membershipType(membership.badge)}</strong></div>
              <div className="rounded-[18px] border border-white/10 bg-white/7 p-4"><p className="text-xs text-white/42">Premium Until</p><strong>{formatDate(membership.premiumUntil)}</strong></div>
              <div className="rounded-[18px] border border-white/10 bg-white/7 p-4"><p className="text-xs text-white/42">Date Joined</p><strong>{formatDate(joinedAt)}</strong></div>
              <div className="rounded-[18px] border border-white/10 bg-white/7 p-4"><p className="text-xs text-white/42">Days Remaining</p><strong>{daysRemaining(membership.premiumUntil)}</strong></div>
              <div className="rounded-[18px] border border-white/10 bg-white/7 p-4"><p className="text-xs text-white/42">Access Level</p><strong className="capitalize">{membership.accessLevel}</strong></div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-white/10 bg-white/7 p-4"><p className="text-xs text-white/42">Name</p><strong>{profile?.full_name ?? user.email ?? "PATHZY user"}</strong></div>
            <div className="rounded-[18px] border border-white/10 bg-white/7 p-4"><p className="text-xs text-white/42">Country</p><strong>{profile?.country ?? "Not added yet"}</strong></div>
            <div className="rounded-[18px] border border-white/10 bg-white/7 p-4 sm:col-span-2"><p className="text-xs text-white/42">Career Goal</p><strong>{careerGoal}</strong></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/dashboard">Back to My Journey</ButtonLink>
            <ButtonLink href="/professional-identity/cv" variant="secondary">Create My CV</ButtonLink>
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Settings</h2>
          <div className="mt-5 grid gap-3">
            <LanguageSettingsForm initialLanguage={profile?.language} />
            {settings.map((item) => (
              <label key={item} className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-white/7 p-4 font-bold text-white/74">
                {item}
                <input type="checkbox" defaultChecked className="h-5 w-5 accent-[#5B8CFF]" />
              </label>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
