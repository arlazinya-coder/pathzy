import type { SupabaseClient, User } from "@supabase/supabase-js";
import { appRoutes } from "@/lib/navigation/routes";
import { getProfessionalIdentityContext } from "@/lib/professional-identity/professional-identity-service";
import { getJourneyActions, getProgressMilestones, getProgressPercent, type JourneyAction, type ProgressInputs, type ProgressMilestone } from "@/lib/progress/progress-engine";

type Supabase = SupabaseClient;

export type PathzyNextAction = {
  label: string;
  destinationRoute: string;
  reason: string;
  completionState: "not_started" | "in_progress" | "completed";
  progressInputs: ProgressInputs;
  progressPercent: number;
  milestone: ProgressMilestone;
  availableActions: JourneyAction[];
  milestones: ProgressMilestone[];
};

type ProfileSnapshot = {
  full_name?: string | null;
  email?: string | null;
  country?: string | null;
  city?: string | null;
  education?: string | null;
  highest_qualification?: string | null;
  field_of_study?: string | null;
  current_status?: string | null;
  career_goal?: string | null;
  onboarding_completed?: boolean | null;
};

type DiscoverySnapshot = {
  answers?: Record<string, unknown> | null;
  generated_result?: { career_paths?: Array<{ title?: string | null }> } | null;
};

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function profileIsComplete(profile: ProfileSnapshot | null, user: User) {
  if (!profile?.onboarding_completed) return false;
  return Boolean(
    hasText(profile.full_name) &&
    hasText(profile.email ?? user.email) &&
    hasText(profile.country) &&
    hasText(profile.current_status) &&
    (hasText(profile.education) || hasText(profile.highest_qualification) || hasText(profile.field_of_study))
  );
}

function careerGoalFrom(profile: ProfileSnapshot | null, discovery: DiscoverySnapshot | null) {
  const roadmapGoal = discovery?.generated_result?.career_paths?.[0]?.title;
  const preferredDirection = discovery?.answers?.preferred_career_direction;
  return profile?.career_goal ?? roadmapGoal ?? (typeof preferredDirection === "string" ? preferredDirection : "");
}

function labelForMilestone(milestone: ProgressMilestone, inputs: ProgressInputs) {
  if (milestone.key === "profile") return "Complete My Professional Profile";
  if (milestone.key === "applications" && inputs.applicationsSent > 0) return "Track application";
  if (milestone.key === "applications") return "Save or start an application";
  if (milestone.key === "interview_prep") return "Prepare for interview";
  if (milestone.key === "skills") return "Improve missing skills";
  return milestone.title;
}

function routeForMilestone(milestone: ProgressMilestone) {
  if (milestone.key === "profile") return appRoutes.professionalIdentity;
  return milestone.href;
}

function reasonForMilestone(milestone: ProgressMilestone) {
  if (milestone.key === "profile") {
    return "PATHZY needs your profile details before it can create stronger documents and guidance.";
  }
  if (milestone.key === "applications") {
    return "A saved or started application turns your plan into real employment progress.";
  }
  return milestone.why;
}

function milestoneByKey(milestones: ProgressMilestone[], key: ProgressMilestone["key"]) {
  return milestones.find((milestone) => milestone.key === key) ?? milestones[0];
}

function skillsMilestone(): ProgressMilestone {
  return {
    key: "skills",
    title: "Improve missing skills",
    href: appRoutes.skills,
    time: "15 minutes",
    difficulty: "Beginner",
    gain: 8,
    why: "Improving one missing skill makes your documents, applications, and interviews stronger.",
    complete: false
  };
}

function employmentNextMilestone(milestones: ProgressMilestone[], inputs: ProgressInputs) {
  if (!inputs.profileComplete) return milestoneByKey(milestones, "profile");
  if (!inputs.cvComplete) return milestoneByKey(milestones, "cv");
  if (!inputs.coverLetterComplete) return milestoneByKey(milestones, "cover_letter");
  if (inputs.opportunitiesSaved <= 0) return milestoneByKey(milestones, "opportunities");
  if (inputs.applicationsSent <= 0) return milestoneByKey(milestones, "applications");
  if (inputs.trackerEntries <= 0 || !inputs.activeApplicationTracked) return milestoneByKey(milestones, "applications");
  if (!inputs.interviewPrepComplete) return milestoneByKey(milestones, "interview_prep");
  if (inputs.employmentReadinessScore < 80) return skillsMilestone();
  return milestones.find((milestone) => !milestone.complete) ?? milestoneByKey(milestones, "employment");
}

export async function getPathzyNextAction(supabase: Supabase, user: User): Promise<PathzyNextAction> {
  const [
    { data: profile },
    { data: discovery },
    professionalIdentity,
    { data: opportunityActions },
    { data: applications },
    { data: interviewPreps }
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("full_name,email,country,city,education,highest_qualification,field_of_study,current_status,career_goal,onboarding_completed")
      .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      .maybeSingle(),
    supabase
      .from("discovery_responses")
      .select("answers,generated_result")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getProfessionalIdentityContext(supabase, user.id),
    supabase.from("user_opportunity_actions").select("applied,completed,saved").eq("user_id", user.id),
    supabase.from("employment_applications").select("status").eq("user_id", user.id),
    supabase.from("interview_preps").select("completed").eq("user_id", user.id)
  ]);

  const typedProfile = profile as ProfileSnapshot | null;
  const typedDiscovery = discovery as DiscoverySnapshot | null;
  const trackedApplications = applications ?? [];
  const applicationActions = opportunityActions ?? [];
  const applicationsSent = trackedApplications.length
    ? trackedApplications.filter((application) => ["applied", "interview", "offer", "accepted"].includes(application.status)).length
    : applicationActions.filter((action) => action.applied).length;
  const hasCv = Boolean(professionalIdentity && professionalIdentity.identity.cv_status !== "not_started");
  const hasCoverLetter = Boolean(professionalIdentity && professionalIdentity.identity.cover_letter_status !== "not_started");
  const hasLinkedIn = Boolean(professionalIdentity && professionalIdentity.identity.linkedin_status !== "not_started");
  const hasCareerPassport = Boolean(professionalIdentity && professionalIdentity.identity.career_passport_status !== "not_started");
  const activeApplicationTracked = trackedApplications.some((application) => ["applied", "interview", "offer", "accepted"].includes(application.status));
  const offerReceived = trackedApplications.some((application) => application.status === "offer" || application.status === "accepted");
  const employed = trackedApplications.some((application) => application.status === "accepted");
  const interviewPrepComplete = (interviewPreps ?? []).some((prep) => prep.completed);
  const onboardingComplete = Boolean(typedProfile?.onboarding_completed);

  const progressInputs: ProgressInputs = {
    profileComplete: profileIsComplete(typedProfile, user),
    discoveryComplete: Boolean(typedDiscovery),
    careerGoalSelected: Boolean(careerGoalFrom(typedProfile, typedDiscovery)),
    cvComplete: hasCv,
    coverLetterComplete: hasCoverLetter,
    linkedinComplete: hasLinkedIn,
    careerPassportComplete: hasCareerPassport,
    opportunitiesSaved: applicationActions.filter((action) => action.saved).length,
    trackerEntries: trackedApplications.length,
    applicationsSent,
    activeApplicationTracked,
    interviewPrepComplete,
    offerReceived,
    employed,
    employmentReadinessScore: 0
  };

  if (!onboardingComplete) {
    const milestones = getProgressMilestones(progressInputs);
    const milestone = milestones[0];

    return {
      label: "Complete onboarding",
      destinationRoute: appRoutes.onboarding,
      reason: "Answer a few basics so PATHZY can guide you toward employment with the right context.",
      completionState: "not_started",
      progressInputs,
      progressPercent: getProgressPercent(progressInputs),
      milestone,
      availableActions: getJourneyActions(progressInputs).filter((action) => action.status === "available").slice(0, 4),
      milestones
    };
  }

  const milestones = getProgressMilestones(progressInputs);
  const milestone = employmentNextMilestone(milestones, progressInputs);
  const progressPercent = getProgressPercent(progressInputs);

  return {
    label: labelForMilestone(milestone, progressInputs),
    destinationRoute: routeForMilestone(milestone),
    reason: reasonForMilestone(milestone),
    completionState: progressPercent >= 100 ? "completed" : progressPercent > 0 ? "in_progress" : "not_started",
    progressInputs,
    progressPercent,
    milestone,
    availableActions: getJourneyActions(progressInputs).filter((action) => action.status === "available").slice(0, 4),
    milestones
  };
}
