import { ButtonLink, Card, PageHeader, ProgressBar } from "@/components/ui";
import { achievementCatalog, ensureMissionState } from "@/lib/missions/engine";
import { appRoutes } from "@/lib/navigation/routes";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";

export default async function AchievementsPage() {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();
  const state = user && supabase ? await ensureMissionState(supabase, user.id) : null;
  const unlockedKeys = new Set(state?.achievements.map((achievement) => achievement.achievement_key) ?? []);
  const progress = achievementCatalog.length ? Math.round((unlockedKeys.size / achievementCatalog.length) * 100) : 0;

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Achievements" title="Build proof of momentum.">
        Unlock badges as you complete missions, protect your streak, earn XP, apply to opportunities, and become interview-ready.
      </PageHeader>
      <div className="grid gap-5 lg:grid-cols-[.34fr_1fr]">
        <Card className="h-fit">
          <h2 className="text-2xl font-black">Badge progress</h2>
          <strong className="mt-5 block text-6xl font-black">{unlockedKeys.size}<span className="text-2xl text-white/45">/{achievementCatalog.length}</span></strong>
          <p className="mt-2 text-white/58">badges unlocked</p>
          <div className="mt-5"><ProgressBar value={progress} /></div>
          {state ? (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[18px] border border-white/10 bg-white/7 p-3">
                <p className="text-xs font-bold text-white/45">Level</p>
                <strong className="mt-1 block text-2xl font-black">{state.level.level}</strong>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/7 p-3">
                <p className="text-xs font-bold text-white/45">XP</p>
                <strong className="mt-1 block text-2xl font-black">{state.level.total_xp}</strong>
              </div>
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href={appRoutes.missions}>Earn Next Badge</ButtonLink>
            <ButtonLink href={appRoutes.roadmap} variant="secondary">Back to Journey</ButtonLink>
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">PATHZY badges</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {achievementCatalog.map((achievement) => {
              const unlocked = unlockedKeys.has(achievement.achievement_key);
              return (
                <article key={achievement.achievement_key} className={`rounded-[22px] border p-5 transition ${unlocked ? "border-[#39d98a]/30 bg-[#39d98a]/10" : "border-white/10 bg-white/7"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-black">{achievement.title}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${unlocked ? "bg-[#39d98a]/18 text-[#9df0c4]" : "bg-white/10 text-white/45"}`}>
                      {unlocked ? "Unlocked" : `${achievement.xp_reward} XP`}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/58">{achievement.description}</p>
                </article>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
