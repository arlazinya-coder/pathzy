import { NextResponse } from "next/server";
import { createMentorStream } from "@/lib/ai/mentor";
import type { DiscoveryAnswers, GeneratedRoadmap } from "@/lib/discovery/types";
import { ensureMissionState } from "@/lib/missions/engine";
import type { MissionState } from "@/lib/missions/types";
import { personalizeOpportunities } from "@/lib/opportunities/data";
import type { OpportunityAction } from "@/lib/opportunities/types";
import { dashboardMetrics } from "@/lib/pathzy-data";
import type { MentorContext, MentorMessage } from "@/lib/mentor/types";
import { getCurrentUserAccess } from "@/lib/launch/launch-service";
import { getBrainContextForAI } from "@/lib/pathzy-brain/brain-service";
import { getProfessionalIdentityContext } from "@/lib/professional-identity/professional-identity-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const FREE_MENTOR_LIMIT = 3;
const COACH_TEMPORARY_UNAVAILABLE = "Your Mentor is temporarily unavailable. Your next recommended step is shown on My Journey.";
const PROFILE_SETUP_MESSAGE = "PATHZY is still setting up your profile. Please complete your profile or refresh the page.";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown mentor stream error.";
  }
}

function getOpenAIEventError(event: unknown) {
  if (!event || typeof event !== "object") return "";
  const maybeEvent = event as { error?: { message?: string; code?: string }; response?: { error?: { message?: string; code?: string } } };
  return maybeEvent.error?.message ?? maybeEvent.response?.error?.message ?? maybeEvent.error?.code ?? maybeEvent.response?.error?.code ?? "";
}

function isProfileSetupError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("user_profiles") || message.includes("schema cache") || message.includes("column") || message.includes("relation");
}

function defaultMissionState(): MissionState {
  return {
    dailyMissions: [],
    weeklyGoal: null,
    level: {
      user_id: "",
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

async function getSafeProfile(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, userId: string, email?: string | null) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .or(`user_id.eq.${userId},id.eq.${userId}`)
    .maybeSingle();

  if (!error && data) return data;

  if (error && !isProfileSetupError(error)) {
    console.warn("[mentor] profile read failed", error.message);
  }

  const fallbackProfile = {
    id: userId,
    user_id: userId,
    email,
    full_name: null,
    country: null,
    city: null,
    language: "English",
    education: null,
    employment_status: null,
    career_goal: null
  };

  await Promise.resolve(supabase.from("user_profiles").upsert(fallbackProfile, { onConflict: "user_id" })).catch(() => null);
  return fallbackProfile;
}

function defaultBrainContext() {
  return {
    brain: null,
    readiness: {
      totalScore: 0,
      label: "Needs Setup" as const,
      careerGoal: null,
      topWeaknesses: ["Complete your profile so PATHZY can personalize guidance."],
      nextActions: ["Complete your profile or refresh the page."],
      todayPriority: "Complete your profile so PATHZY can guide your next action."
    },
    skillGaps: [],
    memoryFacts: [],
    language: "english" as const,
    aiCoachRule: "Respond only in English or French. End every response with NEXT STEP, Estimated time, and Why this helps you get employed."
  };
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function cleanTitle(message: string) {
  const title = message.replace(/\s+/g, " ").trim();
  return title.length > 62 ? `${title.slice(0, 59)}...` : title || "Career Coach Chat";
}

async function getMentorUsage(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, userId: string) {
  const today = todayDate();
  const access = await getCurrentUserAccess(supabase, userId);
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .or(`user_id.eq.${userId},id.eq.${userId}`)
    .maybeSingle();

  if (error) {
    console.warn("[mentor] usage profile fallback", error.message);
    return {
      plan: "free",
      isFree: true,
      count: 0,
      date: today
    };
  }

  const rawPlan = access.isPremium ? access.plan : profile?.plan ?? "free";
  const plan = rawPlan === "free" ? "free" : rawPlan || profile?.premium_status || "free";
  const storedDate = profile?.mentor_messages_date ?? null;
  const storedCount = typeof profile?.mentor_messages_today === "number" ? profile.mentor_messages_today : 0;

  if (storedDate !== today) {
    await supabase
      .from("user_profiles")
      .update({ mentor_messages_today: 0, mentor_messages_date: today })
      .or(`user_id.eq.${userId},id.eq.${userId}`);

    return {
      plan,
      isFree: plan === "free",
      count: 0,
      date: today
    };
  }

  return {
    plan,
    isFree: plan === "free",
    count: storedCount,
    date: today
  };
}

async function incrementMentorUsage(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, userId: string, currentCount: number) {
  await supabase
    .from("user_profiles")
    .update({
      mentor_messages_today: currentCount + 1,
      mentor_messages_date: todayDate()
    })
    .or(`user_id.eq.${userId},id.eq.${userId}`)
    .then(() => null);
}

function getProgressContext() {
  const metric = (label: string) => {
    const item = dashboardMetrics.find((entry) => entry.label === label);
    return item ? `${item.value}${item.suffix}` : "0";
  };

  return {
    career_score: metric("Employment Readiness Score"),
    tasks_completed: "18",
    skills_learned: metric("Skills Learned"),
    applications_sent: metric("Applications Sent"),
    weekly_streak: metric("Weekly Streak")
  };
}

async function getUserContext(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, userId: string): Promise<MentorContext> {
  const [{ data: authUser }] = await Promise.all([supabase.auth.getUser()]);
  const [profile, { data: discovery }, { data: actions }, { data: applications }, { data: interviewPreps }, missionState, brainContext, professionalIdentityContext] = await Promise.all([
    getSafeProfile(supabase, userId, authUser.user?.email ?? null),
    Promise.resolve(
      supabase
        .from("discovery_responses")
        .select("answers,generated_result")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ).catch(() => ({ data: null })),
    Promise.resolve(supabase.from("user_opportunity_actions").select("opportunity_id,saved,applied,completed,hidden").eq("user_id", userId)).catch(() => ({ data: [] })),
    Promise.resolve(supabase.from("employment_applications").select("status").eq("user_id", userId)).catch(() => ({ data: [] })),
    Promise.resolve(supabase.from("interview_preps").select("completed").eq("user_id", userId)).catch(() => ({ data: [] })),
    ensureMissionState(supabase, userId).catch((error) => {
      console.warn("[mentor] mission context fallback", getErrorMessage(error));
      return defaultMissionState();
    }),
    getBrainContextForAI(supabase, userId).catch((error) => {
      console.warn("[mentor] brain context fallback", getErrorMessage(error));
      return defaultBrainContext();
    }),
    getProfessionalIdentityContext(supabase, userId).catch((error) => {
      console.warn("[mentor] professional identity fallback", getErrorMessage(error));
      return null;
    })
  ]);
  const roadmap = (discovery?.generated_result as GeneratedRoadmap | null) ?? null;
  const opportunities = personalizeOpportunities({
    answers: (discovery?.answers as Partial<DiscoveryAnswers> | null) ?? null,
    roadmap,
    country: profile?.country ?? null,
    actions: (actions ?? []) as OpportunityAction[]
  }).slice(0, 6);
  const careerGoal =
    brainContext.brain?.career_goal ??
    brainContext.readiness.careerGoal ??
    roadmap?.career_paths?.[0]?.title ??
    "Choose your career direction";
  const documentsCreated = [
    professionalIdentityContext?.latest_cv ? "CV" : "",
    professionalIdentityContext?.latest_cover_letter ? "Cover letter" : "",
    professionalIdentityContext?.linkedin_profile ? "LinkedIn profile" : "",
    professionalIdentityContext?.latest_recruiter_message ? "Recruiter message" : "",
    professionalIdentityContext?.latest_follow_up_email ? "Follow-up email" : "",
    professionalIdentityContext?.career_passport ? "Career Passport" : ""
  ].filter(Boolean);
  const savedOpportunityCount = (actions ?? []).filter((action: any) => action.saved).length;
  const applicationsSent = (applications ?? []).filter((application: any) => ["applied", "interview", "offer", "accepted"].includes(application.status)).length || (actions ?? []).filter((action: any) => action.applied).length;
  const interviewPrepComplete = (interviewPreps ?? []).some((prep: any) => prep.completed);
  const todayMission = missionState.dailyMissions.find((mission) => !mission.completed)?.title ?? brainContext.readiness.todayPriority;

  return {
    profile: profile ?? null,
    discovery_answers: discovery?.answers ?? null,
    roadmap,
    progress: getProgressContext(),
    completed_missions: missionState.dailyMissions.filter((mission) => mission.completed).map((mission) => mission.title),
    today_missions: missionState.dailyMissions.map((mission) => ({
      title: mission.title,
      description: mission.description,
      xp_reward: mission.xp_reward,
      difficulty: mission.difficulty,
      category: mission.category,
      completed: mission.completed
    })),
    weekly_goal: missionState.weeklyGoal
      ? {
          title: missionState.weeklyGoal.title,
          description: missionState.weeklyGoal.description,
          xp_reward: missionState.weeklyGoal.xp_reward,
          completed: missionState.weeklyGoal.completed
        }
      : null,
    level_state: {
      total_xp: missionState.level.total_xp,
      level: missionState.level.level,
      daily_streak: missionState.level.daily_streak,
      weekly_streak: missionState.level.weekly_streak,
      longest_streak: missionState.level.longest_streak
    },
    achievements: missionState.achievements.slice(0, 8).map((achievement) => ({
      title: achievement.title,
      description: achievement.description,
      achievement_key: achievement.achievement_key
    })),
    opportunities: opportunities.map((opportunity) => ({
      title: opportunity.title,
      category: opportunity.category,
      fit: opportunity.fit,
      outcome: opportunity.outcome,
      reasons: opportunity.reasons,
      action: opportunity.action
    })),
    pathzy_brain: brainContext.brain,
    employment_readiness: {
      totalScore: brainContext.readiness.totalScore,
      label: brainContext.readiness.label,
      topWeaknesses: brainContext.readiness.topWeaknesses,
      nextActions: brainContext.readiness.nextActions,
      todayPriority: brainContext.readiness.todayPriority
    },
    skill_gaps: brainContext.skillGaps,
    professional_identity: professionalIdentityContext,
    dashboard_summary: {
      user_name: profile?.full_name ?? authUser.user?.email?.split("@")[0] ?? "PATHZY user",
      career_goal: careerGoal,
      readiness_score: brainContext.readiness.totalScore,
      today_mission: todayMission,
      documents_created: documentsCreated,
      saved_opportunities: savedOpportunityCount,
      applications_sent: applicationsSent,
      tracker_status: applicationsSent ? `${applicationsSent} application${applicationsSent === 1 ? "" : "s"} sent or tracked` : "No applications tracked yet",
      interview_prep_status: interviewPrepComplete ? "Interview prep completed" : "Interview prep not completed yet",
      suggested_links: [
        { label: "Today's Next Step", href: "/missions" },
        { label: "Build or improve CV", href: "/professional-identity/cv" },
        { label: "Find opportunities", href: "/opportunities" },
        { label: "Prepare for interview", href: "/interview" }
      ]
    },
    language_preference: brainContext.language
  };
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { error: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: "Please log in to use your PATHZY Mentor." }, { status: 401 }) };
  }

  return { supabase, user };
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const url = new URL(request.url);
  const requestedConversationId = url.searchParams.get("conversationId");
  const { supabase, user } = auth;

  const { data: conversations, error: conversationError } = await supabase
    .from("mentor_conversations")
    .select("id,title,updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(12);

  if (conversationError) {
    console.error("[mentor] conversation list failed", conversationError);
    return NextResponse.json({ error: isProfileSetupError(conversationError) ? PROFILE_SETUP_MESSAGE : COACH_TEMPORARY_UNAVAILABLE }, { status: 500 });
  }

  const activeConversationId = requestedConversationId ?? conversations?.[0]?.id ?? null;
  let messages: MentorMessage[] = [];

  if (activeConversationId) {
    const { data, error } = await supabase
      .from("mentor_messages")
      .select("id,role,content,created_at")
      .eq("user_id", user.id)
      .eq("conversation_id", activeConversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[mentor] message list failed", error);
      return NextResponse.json({ error: isProfileSetupError(error) ? PROFILE_SETUP_MESSAGE : COACH_TEMPORARY_UNAVAILABLE }, { status: 500 });
    }

    messages = (data ?? []) as MentorMessage[];
  }

  return NextResponse.json({
    conversations: conversations ?? [],
    activeConversationId,
    messages
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as { message?: string; conversationId?: string | null; pageContext?: string | null };
  const message = body.message?.trim();
  const pageContext = body.pageContext?.trim();

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const { supabase, user } = auth;
  let conversationId = body.conversationId ?? null;
  let usage;

  try {
    usage = await getMentorUsage(supabase, user.id);
  } catch (usageError) {
    return NextResponse.json({ error: isProfileSetupError(usageError) ? PROFILE_SETUP_MESSAGE : COACH_TEMPORARY_UNAVAILABLE }, { status: 500 });
  }

  if (usage.isFree && usage.count >= FREE_MENTOR_LIMIT) {
    return NextResponse.json({
      upgradeRequired: true,
      feature: "mentor",
      limit: FREE_MENTOR_LIMIT,
      plan: "starter"
    });
  }

  if (conversationId) {
    const { data: conversation, error } = await supabase
      .from("mentor_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[mentor] conversation check failed", error);
      return NextResponse.json({ error: isProfileSetupError(error) ? PROFILE_SETUP_MESSAGE : COACH_TEMPORARY_UNAVAILABLE }, { status: 500 });
    }

    if (!conversation) {
      return NextResponse.json({ error: "Conversation was not found." }, { status: 404 });
    }
  } else {
    const { data: conversation, error } = await supabase
      .from("mentor_conversations")
      .insert({ user_id: user.id, title: cleanTitle(message) })
      .select("id")
      .single();

    if (error || !conversation) {
      return NextResponse.json({ error: error && isProfileSetupError(error) ? PROFILE_SETUP_MESSAGE : "Could not create your Mentor conversation." }, { status: 500 });
    }

    conversationId = conversation.id;
  }

  const activeConversationId = conversationId;
  if (!activeConversationId) {
    return NextResponse.json({ error: "Could not resolve mentor conversation." }, { status: 500 });
  }

  const { error: userMessageError } = await supabase.from("mentor_messages").insert({
    conversation_id: activeConversationId,
    user_id: user.id,
    role: "user",
    content: message
  });

  if (userMessageError) {
    return NextResponse.json({ error: isProfileSetupError(userMessageError) ? PROFILE_SETUP_MESSAGE : "Could not save your Mentor message." }, { status: 500 });
  }

  const [{ data: history }, context] = await Promise.all([
    supabase
      .from("mentor_messages")
      .select("id,role,content,created_at")
      .eq("user_id", user.id)
      .eq("conversation_id", activeConversationId)
      .order("created_at", { ascending: true }),
    getUserContext(supabase, user.id)
  ]);

  try {
    console.log("[mentor] OpenAI request start", {
      userId: user.id,
      conversationId: activeConversationId,
      messageLength: message.length,
      historyCount: history?.length ?? 0,
      hasRoadmap: Boolean(context.roadmap),
      missionCount: context.today_missions.length,
      opportunityCount: context.opportunities.length
    });

    const stream = await createMentorStream({
      message,
      history: (history ?? []) as MentorMessage[],
      context: pageContext ? { ...context, current_page_context: pageContext } : context
    });

    console.log("[mentor] OpenAI response object", {
      constructor: stream.constructor?.name,
      asyncIterable: typeof stream[Symbol.asyncIterator] === "function"
    });

    let assistantContent = "";
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            console.log("[mentor] OpenAI streamed chunk", {
              type: chunk.type,
              deltaLength: chunk.type === "response.output_text.delta" ? chunk.delta.length : 0,
              error: getOpenAIEventError(chunk)
            });

            if (chunk.type === "error" || chunk.type === "response.failed" || chunk.type === "response.incomplete") {
              const openAIError = getOpenAIEventError(chunk) || `OpenAI stream event: ${chunk.type}`;
              console.error("[mentor] OpenAI stream error event", { type: chunk.type, error: openAIError, chunk });
              controller.enqueue(encoder.encode(`\n\n${COACH_TEMPORARY_UNAVAILABLE}`));
              return;
            }

            const token = chunk.type === "response.output_text.delta" ? chunk.delta : "";
            if (!token) continue;
            assistantContent += token;
            controller.enqueue(encoder.encode(token));
          }

          const finalContent = assistantContent.trim() || "I could not generate a reply. Try asking again with one clear goal.";

          await supabase.from("mentor_messages").insert({
            conversation_id: activeConversationId,
            user_id: user.id,
            role: "assistant",
            content: finalContent
          });

          await supabase.from("mentor_conversations").update({ updated_at: new Date().toISOString() }).eq("id", activeConversationId).eq("user_id", user.id);
          if (usage.isFree) {
            await incrementMentorUsage(supabase, user.id, usage.count);
          }
          console.log("[mentor] assistant message saved", {
            conversationId: activeConversationId,
            contentLength: finalContent.length
          });
        } catch (streamError) {
          const message = getErrorMessage(streamError);
          console.error("[mentor] caught stream error", { message, streamError });
          controller.enqueue(encoder.encode(`\n\n${COACH_TEMPORARY_UNAVAILABLE}`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Conversation-Id": activeConversationId
      }
    });
  } catch (error) {
    console.error("[mentor] caught OpenAI setup error", {
      message: getErrorMessage(error),
      error
    });
    return NextResponse.json(
      {
        error: COACH_TEMPORARY_UNAVAILABLE
      },
      { status: 502 }
    );
  }
}
