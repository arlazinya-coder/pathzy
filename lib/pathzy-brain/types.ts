import type { DiscoveryAnswers, GeneratedRoadmap } from "@/lib/discovery/types";
import type { Achievement, Mission, UserLevel } from "@/lib/missions/types";
import type { PersonalizedOpportunity } from "@/lib/opportunities/types";

export type ReadinessLabel = "Needs Setup" | "Not Ready Yet" | "Needs Preparation" | "Getting Ready" | "Interview Ready" | "Employment Ready";

export type BrainCategoryScores = {
  career_clarity_score: number;
  skills_readiness_score: number;
  cv_readiness_score: number;
  opportunity_readiness_score: number;
  interview_readiness_score: number;
  consistency_score: number;
  digital_professionalism_score: number;
};

export type PathzyBrainRecord = BrainCategoryScores & {
  id?: string;
  user_id: string;
  language: "english" | "french";
  career_goal: string | null;
  employment_readiness_score: number;
  readiness_label: ReadinessLabel;
  top_strengths: string[];
  top_weaknesses: string[];
  recommended_next_actions: string[];
  last_updated?: string | null;
};

export type SkillGap = {
  target_career: string;
  missing_skill: string;
  priority: "high" | "medium" | "low";
  estimated_time_to_learn: string;
  recommended_action: string;
};

export type ReadinessInputs = {
  profile: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    country?: string | null;
    education?: string | null;
    field_of_study?: string | null;
    highest_qualification?: string | null;
    current_status?: string | null;
    career_goal?: string | null;
    linkedin_url?: string | null;
    onboarding_completed?: boolean | null;
  } | null;
  professionalIdentity: {
    professional_identity_score?: number | null;
    cv_status?: string | null;
    cover_letter_status?: string | null;
    linkedin_status?: string | null;
  } | null;
  interviewPrepCompleted: boolean;
  discoveryAnswers: Partial<DiscoveryAnswers> | null;
  roadmap: GeneratedRoadmap | null;
  dailyMissions: Mission[];
  weeklyGoal: Mission | null;
  level: UserLevel | null;
  achievements: Achievement[];
  opportunities: PersonalizedOpportunity[];
  mentorMessagesCount: number;
};

export type ReadinessResult = {
  totalScore: number;
  label: ReadinessLabel;
  categoryScores: BrainCategoryScores;
  careerGoal: string | null;
  topStrengths: string[];
  topWeaknesses: string[];
  nextActions: string[];
  todayPriority: string;
  skillGaps: SkillGap[];
  careerDna: {
    strongestCareerDirection: string;
    topStrengths: string[];
    workStyle: string;
    preferredWorkEnvironment: string;
    recommendedCareers: string[];
    confidenceLevel: string;
    firstCareerFocus: string;
  };
};
