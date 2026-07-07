import type { SupabaseClient } from "@supabase/supabase-js";
import type { DiscoveryAnswers, GeneratedRoadmap } from "@/lib/discovery/types";
import { personalizeOpportunities } from "@/lib/opportunities/data";
import type { OpportunityAction } from "@/lib/opportunities/types";
import type { Achievement, Mission, MissionContext, MissionDifficulty, MissionState, UserLevel } from "@/lib/missions/types";

const XP_BY_DIFFICULTY: Record<MissionDifficulty, number> = {
  Easy: 20,
  Medium: 50,
  Hard: 100
};

export const achievementCatalog: Achievement[] = [
  { achievement_key: "first_mission", title: "First Mission", description: "Complete your first PATHZY mission.", xp_reward: 10 },
  { achievement_key: "seven_day_streak", title: "7-Day Streak", description: "Build momentum for seven mission days.", xp_reward: 70 },
  { achievement_key: "thirty_day_streak", title: "30-Day Streak", description: "Stay consistent for thirty mission days.", xp_reward: 200 },
  { achievement_key: "xp_100", title: "100 XP", description: "Earn your first 100 XP.", xp_reward: 25 },
  { achievement_key: "xp_1000", title: "1000 XP", description: "Reach 1000 total XP.", xp_reward: 100 },
  { achievement_key: "first_job_application", title: "First Job Application", description: "Complete an application mission.", xp_reward: 50 },
  { achievement_key: "discovery_complete", title: "Discovery Complete", description: "Complete your PATHZY Discovery interview.", xp_reward: 30 },
  { achievement_key: "roadmap_complete", title: "Career Plan Complete", description: "Complete your first weekly career plan goal.", xp_reward: 120 },
  { achievement_key: "interview_ready", title: "Interview Ready", description: "Complete interview practice.", xp_reward: 80 },
  { achievement_key: "cv_master", title: "CV Master", description: "Complete a CV improvement mission.", xp_reward: 80 }
];

function isoDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date = new Date()) {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() - day + 1);
  return isoDate(copy);
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return isoDate(copy);
}

export function levelFromXp(totalXp: number) {
  return Math.max(1, Math.floor(totalXp / 250) + 1);
}

export function xpToNextLevel(totalXp: number) {
  const nextLevelXp = levelFromXp(totalXp) * 250;
  return Math.max(0, nextLevelXp - totalXp);
}

function defaultUserLevel(userId: string): UserLevel {
  return {
    user_id: userId,
    total_xp: 0,
    level: 1,
    daily_streak: 0,
    weekly_streak: 0,
    longest_streak: 0,
    last_completed_date: null,
    last_completed_week: null
  };
}

async function ensureUserLevel(supabase: SupabaseClient, userId: string): Promise<UserLevel> {
  const defaults = defaultUserLevel(userId);

  const { data: existingLevel } = await supabase.from("user_levels").select("*").eq("user_id", userId).maybeSingle();
  if (existingLevel) {
    return existingLevel as UserLevel;
  }

  const { data: createdLevel } = await supabase
    .from("user_levels")
    .upsert({ ...defaults, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    .select("*")
    .maybeSingle();

  return (createdLevel as UserLevel | null) ?? defaults;
}

function missionContext({
  answers,
  roadmap,
  opportunities
}: {
  answers: Partial<DiscoveryAnswers> | null;
  roadmap: GeneratedRoadmap | null;
  opportunities: ReturnType<typeof personalizeOpportunities>;
}): MissionContext {
  const topPath = roadmap?.career_paths?.[0];
  const primaryCareer = topPath?.title ?? answers?.preferred_career_direction ?? "your chosen career path";
  const primarySkill = topPath?.skills?.[0] ?? "career fundamentals";
  const secondarySkill = topPath?.skills?.[1] ?? "portfolio proof";

  return {
    primaryCareer,
    primarySkill,
    secondarySkill,
    opportunity: opportunities.find((item) => item.category === "Internships" || item.category === "Recommended jobs") ?? opportunities[0] ?? null,
    challenge: answers?.biggest_challenge ?? "staying consistent"
  };
}

function dailyMissionTemplates(context: MissionContext, today: string) {
  return [
    {
      mission_key: `daily-skill-${today}`,
      mission_type: "daily",
      title: `Learn one ${context.primarySkill} concept`,
      description: `Spend focused time learning ${context.primarySkill} for ${context.primaryCareer}. Write three notes you can reuse later.`,
      estimated_time: "25 min",
      xp_reward: XP_BY_DIFFICULTY.Easy,
      difficulty: "Easy",
      category: "Learning",
      due_date: today,
      source_context: context
    },
    {
      mission_key: `daily-proof-${today}`,
      mission_type: "daily",
      title: "Improve your CV or LinkedIn proof",
      description: `Add one stronger CV bullet, LinkedIn skill, or portfolio note connected to ${context.secondarySkill}.`,
      estimated_time: "40 min",
      xp_reward: XP_BY_DIFFICULTY.Medium,
      difficulty: "Medium",
      category: "CV",
      due_date: today,
      source_context: context
    },
    {
      mission_key: `daily-opportunity-${today}`,
      mission_type: "daily",
      title: context.opportunity ? `Research and prepare for ${context.opportunity.title}` : "Research 3 companies and choose one opportunity",
      description: context.opportunity
        ? `Research the company, prepare one interview answer, tailor your CV, or write the first outreach message.`
        : "Find three companies or programs linked to your career plan, then choose one opportunity to save or apply for.",
      estimated_time: "35 min",
      xp_reward: XP_BY_DIFFICULTY.Medium,
      difficulty: "Medium",
      category: "Opportunity",
      due_date: today,
      source_context: context
    }
  ];
}

function weeklyMissionTemplate(context: MissionContext, weekStart: string) {
  return {
    mission_key: `weekly-${weekStart}`,
    mission_type: "weekly",
    title: `Complete your ${context.primarySkill} basics this week`,
    description: `Build a small weekly win for ${context.primaryCareer}: learn the basics, create one proof, and connect it to an opportunity.`,
    estimated_time: "3-4 hr",
    xp_reward: XP_BY_DIFFICULTY.Hard,
    difficulty: "Hard",
    category: "Weekly Goal",
    due_date: addDays(new Date(`${weekStart}T00:00:00.000Z`), 6),
    week_start: weekStart,
    source_context: context
  };
}

async function getUserInputs(supabase: SupabaseClient, userId: string) {
  const [{ data: profile }, { data: discovery }, { data: actions }] = await Promise.all([
    supabase.from("user_profiles").select("country").or(`user_id.eq.${userId},id.eq.${userId}`).maybeSingle(),
    supabase
      .from("discovery_responses")
      .select("answers,generated_result")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("user_opportunity_actions").select("opportunity_id,saved,applied,completed,hidden").eq("user_id", userId)
  ]);

  const answers = (discovery?.answers as Partial<DiscoveryAnswers> | null) ?? null;
  const roadmap = (discovery?.generated_result as GeneratedRoadmap | null) ?? null;
  const opportunities = personalizeOpportunities({
    answers,
    roadmap,
    country: profile?.country ?? null,
    actions: (actions ?? []) as OpportunityAction[]
  });

  return { answers, roadmap, opportunities };
}

export async function ensureMissionState(supabase: SupabaseClient, userId: string): Promise<MissionState> {
  const today = isoDate();
  const week = startOfWeek();
  const inputs = await getUserInputs(supabase, userId);
  const context = missionContext(inputs);

  const { data: existingDaily } = await supabase
    .from("missions")
    .select("*")
    .eq("user_id", userId)
    .eq("mission_type", "daily")
    .eq("due_date", today)
    .order("created_at", { ascending: true });

  if (!existingDaily?.length) {
    await supabase.from("missions").upsert(
      dailyMissionTemplates(context, today).map((mission) => ({ ...mission, user_id: userId })),
      { onConflict: "user_id,mission_key,due_date" }
    );
  }

  const { data: existingWeekly } = await supabase
    .from("missions")
    .select("*")
    .eq("user_id", userId)
    .eq("mission_type", "weekly")
    .eq("week_start", week)
    .maybeSingle();

  if (!existingWeekly) {
    await supabase.from("missions").upsert({ ...weeklyMissionTemplate(context, week), user_id: userId }, { onConflict: "user_id,mission_key,due_date" });
  }

  await ensureUserLevel(supabase, userId);

  const [{ data: daily }, { data: weekly }, currentLevel, { data: achievements }] = await Promise.all([
    supabase.from("missions").select("*").eq("user_id", userId).eq("mission_type", "daily").eq("due_date", today).order("created_at", { ascending: true }),
    supabase.from("missions").select("*").eq("user_id", userId).eq("mission_type", "weekly").eq("week_start", week).maybeSingle(),
    ensureUserLevel(supabase, userId),
    supabase.from("achievements").select("achievement_key,title,description,xp_reward,unlocked_at").eq("user_id", userId).order("unlocked_at", { ascending: false })
  ]);

  const dailyMissions = (daily ?? []) as Mission[];
  const progress = dailyMissions.length ? Math.round((dailyMissions.filter((mission) => mission.completed).length / dailyMissions.length) * 100) : 0;

  return {
    dailyMissions,
    weeklyGoal: (weekly as Mission | null) ?? null,
    level: currentLevel,
    achievements: (achievements ?? []) as Achievement[],
    availableAchievements: achievementCatalog,
    progress,
    xpToNextLevel: xpToNextLevel(currentLevel.total_xp)
  };
}

function isYesterday(lastDate: string | null, today: string) {
  if (!lastDate) return false;
  return addDays(new Date(`${lastDate}T00:00:00.000Z`), 1) === today;
}

function calculateLevelUpdate(level: UserLevel, xp: number, mission: Mission) {
  const today = isoDate();
  const week = startOfWeek();
  const alreadyToday = level.last_completed_date === today;
  const dailyStreak = alreadyToday ? level.daily_streak : isYesterday(level.last_completed_date, today) ? level.daily_streak + 1 : 1;
  const weeklyStreak = level.last_completed_week === week ? level.weekly_streak : level.weekly_streak + 1;
  const total_xp = level.total_xp + xp;

  return {
    total_xp,
    level: levelFromXp(total_xp),
    daily_streak: dailyStreak,
    weekly_streak: mission.mission_type === "weekly" ? weeklyStreak : level.weekly_streak,
    longest_streak: Math.max(level.longest_streak, dailyStreak),
    last_completed_date: today,
    last_completed_week: mission.mission_type === "weekly" ? week : level.last_completed_week,
    updated_at: new Date().toISOString()
  };
}

export async function completeMission(supabase: SupabaseClient, userId: string, missionId: string) {
  const { data: mission, error: missionError } = await supabase.from("missions").select("*").eq("id", missionId).eq("user_id", userId).single();
  if (missionError || !mission) throw new Error(missionError?.message ?? "Mission not found.");

  if (mission.completed) {
    return ensureMissionState(supabase, userId);
  }

  const typedMission = mission as Mission;
  const xp = typedMission.xp_reward;
  await supabase.from("missions").update({ completed: true, completed_at: new Date().toISOString() }).eq("id", missionId).eq("user_id", userId);
  await supabase.from("mission_history").insert({ user_id: userId, mission_id: missionId, action: "completed", xp_awarded: xp });
  await supabase.from("user_xp").insert({ user_id: userId, amount: xp, reason: `Completed mission: ${typedMission.title}`, mission_id: missionId });

  const currentLevel = await ensureUserLevel(supabase, userId);
  const nextLevel = calculateLevelUpdate(currentLevel, xp, typedMission);
  await supabase.from("user_levels").upsert({ user_id: userId, ...nextLevel }, { onConflict: "user_id" });

  await unlockAchievements(supabase, userId, typedMission, nextLevel);
  return ensureMissionState(supabase, userId);
}

async function unlockAchievements(supabase: SupabaseClient, userId: string, mission: Mission, level: ReturnType<typeof calculateLevelUpdate>) {
  const { count: completedCount } = await supabase
    .from("missions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("completed", true);

  const unlockKeys = new Set<string>();
  if ((completedCount ?? 0) >= 1) unlockKeys.add("first_mission");
  if (level.daily_streak >= 7) unlockKeys.add("seven_day_streak");
  if (level.daily_streak >= 30) unlockKeys.add("thirty_day_streak");
  if (level.total_xp >= 100) unlockKeys.add("xp_100");
  if (level.total_xp >= 1000) unlockKeys.add("xp_1000");
  if (mission.category === "Opportunity") unlockKeys.add("first_job_application");
  if (mission.category === "Weekly Goal") unlockKeys.add("roadmap_complete");
  if (mission.title.toLowerCase().includes("interview")) unlockKeys.add("interview_ready");
  if (mission.title.toLowerCase().includes("cv") || mission.category === "CV") unlockKeys.add("cv_master");

  const { data: discovery } = await supabase.from("discovery_responses").select("id").eq("user_id", userId).limit(1).maybeSingle();
  if (discovery) unlockKeys.add("discovery_complete");

  const rows = achievementCatalog
    .filter((achievement) => unlockKeys.has(achievement.achievement_key))
    .map((achievement) => ({ ...achievement, user_id: userId }));

  if (!rows.length) return;
  await supabase.from("achievements").upsert(rows, { onConflict: "user_id,achievement_key", ignoreDuplicates: true });
}
