import type { SupabaseClient } from "@supabase/supabase-js";
import type { DiscoveryAnswers, GeneratedRoadmap } from "@/lib/discovery/types";
import { ensureMissionState } from "@/lib/missions/engine";
import { personalizeOpportunities } from "@/lib/opportunities/data";
import type { OpportunityAction } from "@/lib/opportunities/types";
import { calculateReadiness } from "@/lib/pathzy-brain/readiness-engine";
import type { PathzyBrainRecord, ReadinessResult, SkillGap } from "@/lib/pathzy-brain/types";

type Supabase = SupabaseClient;

const defaultBrain = (userId: string): PathzyBrainRecord => ({
  user_id: userId,
  language: "english",
  career_goal: null,
  employment_readiness_score: 0,
  readiness_label: "Needs Setup",
  career_clarity_score: 0,
  skills_readiness_score: 0,
  cv_readiness_score: 0,
  opportunity_readiness_score: 0,
  interview_readiness_score: 0,
  consistency_score: 0,
  digital_professionalism_score: 0,
  top_strengths: [],
  top_weaknesses: [],
  recommended_next_actions: []
});

function parseArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeBrain(row: any, userId: string): PathzyBrainRecord {
  if (!row) return defaultBrain(userId);

  return {
    id: row.id,
    user_id: row.user_id ?? userId,
    language: row.language === "french" ? "french" : "english",
    career_goal: row.career_goal ?? null,
    employment_readiness_score: row.employment_readiness_score ?? 0,
    readiness_label: row.readiness_label ?? "Needs Setup",
    career_clarity_score: row.career_clarity_score ?? 0,
    skills_readiness_score: row.skills_readiness_score ?? 0,
    cv_readiness_score: row.cv_readiness_score ?? 0,
    opportunity_readiness_score: row.opportunity_readiness_score ?? 0,
    interview_readiness_score: row.interview_readiness_score ?? 0,
    consistency_score: row.consistency_score ?? 0,
    digital_professionalism_score: row.digital_professionalism_score ?? 0,
    top_strengths: parseArray(row.top_strengths),
    top_weaknesses: parseArray(row.top_weaknesses),
    recommended_next_actions: parseArray(row.recommended_next_actions),
    last_updated: row.last_updated ?? null
  };
}

export async function getOrCreatePathzyBrain(supabase: Supabase, userId: string): Promise<PathzyBrainRecord> {
  const { data } = await supabase.from("pathzy_brain").select("*").eq("user_id", userId).maybeSingle();
  if (data) return normalizeBrain(data, userId);

  const defaults = defaultBrain(userId);
  const { data: created } = await supabase
    .from("pathzy_brain")
    .upsert(
      {
        user_id: userId,
        language: defaults.language,
        readiness_label: defaults.readiness_label
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .maybeSingle();

  return normalizeBrain(created, userId);
}

async function getInputs(supabase: Supabase, userId: string) {
  const [{ data: profile }, { data: discovery }, { data: actions }, { count: mentorMessagesCount }, { data: professionalIdentity }, { data: interviewPreps }, missionState] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("full_name,email,phone,city,country,education,field_of_study,highest_qualification,current_status,career_goal,linkedin_url,onboarding_completed")
      .or(`user_id.eq.${userId},id.eq.${userId}`)
      .maybeSingle(),
    supabase
      .from("discovery_responses")
      .select("answers,generated_result")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("user_opportunity_actions").select("opportunity_id,saved,applied,completed,hidden").eq("user_id", userId),
    supabase.from("mentor_messages").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("professional_identity")
      .select("professional_identity_score,cv_status,cover_letter_status,linkedin_status")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("interview_preps").select("completed").eq("user_id", userId),
    ensureMissionState(supabase, userId)
  ]);

  const answers = (discovery?.answers as Partial<DiscoveryAnswers> | null) ?? null;
  const roadmap = (discovery?.generated_result as GeneratedRoadmap | null) ?? null;
  const opportunities = personalizeOpportunities({
    answers,
    roadmap,
    country: profile?.country ?? null,
    actions: (actions ?? []) as OpportunityAction[]
  });

  return {
    profile,
    professionalIdentity,
    interviewPrepCompleted: (interviewPreps ?? []).some((prep) => prep.completed),
    discoveryAnswers: answers,
    roadmap,
    dailyMissions: missionState.dailyMissions,
    weeklyGoal: missionState.weeklyGoal,
    level: missionState.level,
    achievements: missionState.achievements,
    opportunities,
    mentorMessagesCount: mentorMessagesCount ?? 0
  };
}

async function saveSkillGaps(supabase: Supabase, userId: string, skillGaps: SkillGap[]) {
  if (!skillGaps.length) return;

  await supabase.from("skill_gaps").upsert(
    skillGaps.map((gap) => ({
      user_id: userId,
      target_career: gap.target_career,
      missing_skill: gap.missing_skill,
      priority: gap.priority,
      estimated_time_to_learn: gap.estimated_time_to_learn,
      recommended_action: gap.recommended_action,
      updated_at: new Date().toISOString()
    })),
    { onConflict: "user_id,target_career,missing_skill" }
  );
}

export async function calculateEmploymentReadiness(supabase: Supabase, userId: string): Promise<ReadinessResult> {
  const inputs = await getInputs(supabase, userId);
  return calculateReadiness(inputs);
}

export async function updatePathzyBrain(supabase: Supabase, userId: string, reason = "Readiness recalculated"): Promise<PathzyBrainRecord> {
  await getOrCreatePathzyBrain(supabase, userId);
  const result = await calculateEmploymentReadiness(supabase, userId);
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("pathzy_brain")
    .upsert(
      {
        user_id: userId,
        language: "english",
        career_goal: result.careerGoal,
        employment_readiness_score: result.totalScore,
        readiness_label: result.label,
        ...result.categoryScores,
        top_strengths: result.topStrengths,
        top_weaknesses: result.topWeaknesses,
        recommended_next_actions: result.nextActions,
        last_updated: now,
        updated_at: now
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .maybeSingle();

  await saveSkillGaps(supabase, userId, result.skillGaps);
  await supabase.from("employment_readiness_history").insert({
    user_id: userId,
    score: result.totalScore,
    category_scores: result.categoryScores,
    reason_for_change: reason
  });

  return normalizeBrain(data, userId);
}

export async function getTodayPriority(supabase: Supabase, userId: string) {
  const result = await calculateEmploymentReadiness(supabase, userId);
  return result.todayPriority;
}

export async function getBrainContextForAI(supabase: Supabase, userId: string) {
  const [brain, result, skillGaps, { data: facts }] = await Promise.all([
    updatePathzyBrain(supabase, userId, "AI context refreshed"),
    calculateEmploymentReadiness(supabase, userId),
    getSkillGaps(supabase, userId),
    supabase.from("ai_memory_facts").select("fact_type,fact_value,source,importance").eq("user_id", userId).order("importance", { ascending: false }).limit(10)
  ]);

  return {
    brain,
    readiness: result,
    skillGaps,
    memoryFacts: facts ?? [],
    language: brain.language,
    aiCoachRule: "Respond only in English or French. End every response with NEXT STEP, Estimated time, and Why this helps you get employed."
  };
}

export async function saveAIMemoryFact(
  supabase: Supabase,
  userId: string,
  fact: { fact_type: string; fact_value: string; source?: string; importance?: number }
) {
  await supabase.from("ai_memory_facts").upsert(
    {
      user_id: userId,
      fact_type: fact.fact_type,
      fact_value: fact.fact_value,
      source: fact.source ?? "mentor",
      importance: fact.importance ?? 3,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id,fact_type,fact_value" }
  );
}

export async function getSkillGaps(supabase: Supabase, userId: string): Promise<SkillGap[]> {
  const { data } = await supabase
    .from("skill_gaps")
    .select("target_career,missing_skill,priority,estimated_time_to_learn,recommended_action")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(6);

  return (data ?? []) as SkillGap[];
}
