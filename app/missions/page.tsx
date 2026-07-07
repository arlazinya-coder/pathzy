import { MissionSystem } from "@/components/missions/mission-system";
import { PageHeader } from "@/components/ui";
import { ensureMissionState } from "@/lib/missions/engine";
import type { MissionState } from "@/lib/missions/types";
import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";

function fallbackMissionState(): MissionState {
  const today = new Date().toISOString().slice(0, 10);

  return {
    dailyMissions: [
      {
        id: "default-profile",
        mission_key: "default-profile",
        mission_type: "daily",
        title: "Complete your profile",
        description: "Add your basic details so PATHZY can personalize your journey, coach, and career plan.",
        estimated_time: "10 min",
        xp_reward: 20,
        difficulty: "Easy",
        category: "Profile",
        due_date: today,
        week_start: null,
        completed: false,
        completed_at: null
      },
      {
        id: "default-discovery",
        mission_key: "default-discovery",
        mission_type: "daily",
        title: "Discover your path",
        description: "Answer the discovery questions so PATHZY can recommend a realistic career direction.",
        estimated_time: "15 min",
        xp_reward: 50,
        difficulty: "Medium",
        category: "Discovery",
        due_date: today,
        week_start: null,
        completed: false,
        completed_at: null
      },
      {
        id: "default-cv",
        mission_key: "default-cv",
        mission_type: "daily",
        title: "Create your CV",
        description: "Create your first CV draft from your PATHZY profile and career direction.",
        estimated_time: "20 min",
        xp_reward: 50,
        difficulty: "Medium",
        category: "CV",
        due_date: today,
        week_start: null,
        completed: false,
        completed_at: null
      },
      {
        id: "default-linkedin",
        mission_key: "default-linkedin",
        mission_type: "daily",
        title: "Improve your LinkedIn",
        description: "Write a stronger headline and skills list for your target career path.",
        estimated_time: "18 min",
        xp_reward: 20,
        difficulty: "Easy",
        category: "LinkedIn",
        due_date: today,
        week_start: null,
        completed: false,
        completed_at: null
      },
      {
        id: "default-opportunity",
        mission_key: "default-opportunity",
        mission_type: "daily",
        title: "Save one opportunity",
        description: "Find one job, internship, scholarship, or course that matches your direction.",
        estimated_time: "12 min",
        xp_reward: 20,
        difficulty: "Easy",
        category: "Opportunity",
        due_date: today,
        week_start: null,
        completed: false,
        completed_at: null
      },
      {
        id: "default-interview",
        mission_key: "default-interview",
        mission_type: "daily",
        title: "Prepare for one interview",
        description: "Practice one answer that explains your goal, strengths, and current learning path.",
        estimated_time: "25 min",
        xp_reward: 50,
        difficulty: "Medium",
        category: "Interview",
        due_date: today,
        week_start: null,
        completed: false,
        completed_at: null
      }
    ],
    weeklyGoal: {
      id: "default-weekly",
      mission_key: "default-weekly",
      mission_type: "weekly",
      title: "Become application-ready this week",
      description: "Complete your profile, discovery, first CV draft, and one saved opportunity.",
      estimated_time: "2-3 hr",
      xp_reward: 100,
      difficulty: "Hard",
      category: "Weekly Goal",
      due_date: today,
      week_start: today,
      completed: false,
      completed_at: null
    },
    level: {
      user_id: "default",
      total_xp: 0,
      level: 1,
      daily_streak: 0,
      weekly_streak: 0,
      longest_streak: 0,
      last_completed_date: null,
      last_completed_week: null
    },
    achievements: [],
    availableAchievements: [],
    progress: 0,
    xpToNextLevel: 250
  };
}

export default async function MissionsPage() {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();
  const state = user && supabase ? await ensureMissionState(supabase, user.id) : fallbackMissionState();

  return (
    <div className="container page-pad">
      <PageHeader eyebrow="Today&apos;s Next Step" title="One clear step toward employment.">
        PATHZY shows the next useful action from your career plan, profile, documents, applications, and interview progress.
      </PageHeader>
      <MissionSystem initialState={state} canComplete={Boolean(user && supabase)} />
    </div>
  );
}
