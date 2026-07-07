import type { PersonalizedOpportunity } from "@/lib/opportunities/types";

export type MissionDifficulty = "Easy" | "Medium" | "Hard";
export type MissionType = "daily" | "weekly";

export type Mission = {
  id: string;
  mission_key: string;
  mission_type: MissionType;
  title: string;
  description: string;
  estimated_time: string;
  xp_reward: number;
  difficulty: MissionDifficulty;
  category: string;
  due_date: string;
  week_start: string | null;
  completed: boolean;
  completed_at: string | null;
};

export type UserLevel = {
  user_id: string;
  total_xp: number;
  level: number;
  daily_streak: number;
  weekly_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  last_completed_week: string | null;
};

export type Achievement = {
  achievement_key: string;
  title: string;
  description: string;
  xp_reward: number;
  unlocked_at?: string;
};

export type MissionContext = {
  primaryCareer: string;
  primarySkill: string;
  secondarySkill: string;
  opportunity: Pick<PersonalizedOpportunity, "id" | "title" | "category"> | null;
  challenge: string;
};

export type MissionState = {
  dailyMissions: Mission[];
  weeklyGoal: Mission | null;
  level: UserLevel;
  achievements: Achievement[];
  availableAchievements: Achievement[];
  progress: number;
  xpToNextLevel: number;
};
