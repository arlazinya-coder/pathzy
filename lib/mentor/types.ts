import type { GeneratedRoadmap } from "@/lib/discovery/types";
import type { Achievement, Mission, UserLevel } from "@/lib/missions/types";
import type { PersonalizedOpportunity } from "@/lib/opportunities/types";
import type { PathzyBrainRecord, ReadinessResult, SkillGap } from "@/lib/pathzy-brain/types";
import type { ProfessionalIdentityContext } from "@/lib/professional-identity/professional-identity-types";

export type MentorRole = "user" | "assistant";

export type MentorMessage = {
  id: string;
  role: MentorRole;
  content: string;
  created_at: string;
};

export type MentorConversation = {
  id: string;
  title: string;
  updated_at: string;
};

export type MentorProgress = {
  career_score: string;
  tasks_completed: string;
  skills_learned: string;
  applications_sent: string;
  weekly_streak: string;
};

export type MentorContext = {
  current_page_context?: string;
  profile: {
    full_name: string | null;
    email: string | null;
    country: string | null;
    age: number | null;
    education: string | null;
    current_status: string | null;
    premium_status: string | null;
  } | null;
  discovery_answers: unknown;
  roadmap: GeneratedRoadmap | null;
  progress: MentorProgress;
  completed_missions: string[];
  today_missions: Array<Pick<Mission, "title" | "description" | "xp_reward" | "difficulty" | "category" | "completed">>;
  weekly_goal: Pick<Mission, "title" | "description" | "xp_reward" | "completed"> | null;
  level_state: Pick<UserLevel, "total_xp" | "level" | "daily_streak" | "weekly_streak" | "longest_streak"> | null;
  achievements: Array<Pick<Achievement, "title" | "description" | "achievement_key">>;
  opportunities: Array<Pick<PersonalizedOpportunity, "title" | "category" | "fit" | "outcome" | "reasons" | "action">>;
  pathzy_brain: PathzyBrainRecord | null;
  employment_readiness: Pick<ReadinessResult, "totalScore" | "label" | "topWeaknesses" | "nextActions" | "todayPriority"> | null;
  skill_gaps: SkillGap[];
  professional_identity: ProfessionalIdentityContext | null;
  dashboard_summary?: {
    user_name: string;
    career_goal: string;
    readiness_score: number;
    today_mission: string;
    documents_created: string[];
    saved_opportunities: number;
    applications_sent: number;
    tracker_status: string;
    interview_prep_status: string;
    suggested_links: Array<{ label: string; href: string }>;
  };
  language_preference: "english" | "french";
};
