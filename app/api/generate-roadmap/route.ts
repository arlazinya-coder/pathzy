import { NextResponse } from "next/server";
import { generateOpenAIRoadmap } from "@/lib/discovery/openai-generator";
import type { DiscoveryAnswers } from "@/lib/discovery/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const answerKeys: Array<keyof DiscoveryAnswers> = [
  "personal_background",
  "education",
  "interests",
  "skills",
  "personality",
  "work_style",
  "dream_lifestyle",
  "income_goal",
  "biggest_challenge",
  "preferred_career_direction"
];

const roadmapError = "We could not complete this action yet. Your progress is safe. Please try again.";

function isDiscoveryAnswers(value: unknown): value is DiscoveryAnswers {
  if (!value || typeof value !== "object") return false;
  const answers = value as Partial<DiscoveryAnswers>;
  return answerKeys.every((key) => typeof answers[key] === "string" && Boolean(answers[key]?.trim()));
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Something needs a quick setup. Please refresh and try again." }, { status: 503 });
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Please log in to continue your journey." }, { status: 401 });
  }

  const body = (await request.json()) as { answers?: unknown };
  if (!isDiscoveryAnswers(body.answers)) {
    return NextResponse.json({ error: "Please complete Discovery before creating your career plan." }, { status: 400 });
  }

  try {
    const generatedRoadmap = await generateOpenAIRoadmap(body.answers);
    const { error: saveError } = await supabase.from("discovery_responses").insert({
      user_id: user.id,
      answers: body.answers,
      generated_result: generatedRoadmap
    });

    if (saveError) {
      console.error("[roadmap] save failed", saveError);
      return NextResponse.json({ error: roadmapError }, { status: 500 });
    }

    return NextResponse.json({ roadmap: generatedRoadmap });
  } catch (error) {
    console.error("[roadmap] generation failed", error);
    return NextResponse.json(
      {
        error: roadmapError
      },
      { status: 502 }
    );
  }
}
