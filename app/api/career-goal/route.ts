import { NextResponse } from "next/server";
import type { GeneratedRoadmap } from "@/lib/discovery/types";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

function firstMissionForCareer(careerGoal: string, skills: string[] = []) {
  const focus = skills[0] || careerGoal;

  return {
    title: `Complete ${focus} fundamentals`,
    description: `Start your ${careerGoal} plan with one focused learning step today.`,
    estimatedTime: "20 minutes",
    jobReadinessGain: 5,
    xp: 40
  };
}

export async function POST(request: Request) {
  const { user, supabase } = await requireAuthenticatedUser("/roadmap");
  const body = (await request.json()) as { careerGoal?: string };
  const careerGoal = body.careerGoal?.trim();

  if (!careerGoal) {
    return NextResponse.json({ error: "Choose a career path first." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { data: discovery } = await supabase
    .from("discovery_responses")
    .select("generated_result")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const generatedRoadmap = discovery?.generated_result as GeneratedRoadmap | null;
  const selectedPath = generatedRoadmap?.career_paths?.find((path) => path.title === careerGoal);
  const firstMission = firstMissionForCareer(careerGoal, selectedPath?.skills ?? []);

  const { error: profileError } = await supabase.from("user_profiles").upsert(
    {
      user_id: user.id,
      email: user.email,
      career_goal: careerGoal,
      preferred_path: careerGoal,
      updated_at: now
    },
    { onConflict: "user_id" }
  );

  if (profileError) {
    console.error("[career-goal] profile save failed", profileError);
    return NextResponse.json({ error: "We could not save your career choice yet. Please try again." }, { status: 500 });
  }

  const { error: brainError } = await supabase.from("pathzy_brain").upsert(
    {
      user_id: user.id,
      career_goal: careerGoal,
      recommended_next_actions: [
        firstMission.title,
        "Create a focused CV for your chosen career",
        "Save one opportunity that matches your career goal"
      ],
      updated_at: now
    },
    { onConflict: "user_id" }
  );

  if (brainError) {
    console.warn("[career-goal] brain save fallback", brainError);
  }

  return NextResponse.json({ ok: true, nextRoute: "/missions", firstMission });
}
