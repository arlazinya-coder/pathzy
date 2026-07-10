import type { ReadinessInputs, ReadinessLabel, ReadinessResult, SkillGap } from "@/lib/pathzy-brain/types";

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function getLabel(score: number): ReadinessLabel {
  if (score <= 0) return "Needs Setup";
  if (score <= 30) return "Not Ready Yet";
  if (score <= 50) return "Needs Preparation";
  if (score <= 70) return "Getting Ready";
  if (score <= 85) return "Interview Ready";
  return "Employment Ready";
}

function firstCareer(inputs: ReadinessInputs) {
  return inputs.profile?.career_goal || inputs.roadmap?.career_paths?.[0]?.title || inputs.discoveryAnswers?.preferred_career_direction || "Career starter";
}

function allRoadmapSkills(inputs: ReadinessInputs) {
  return inputs.roadmap?.career_paths?.flatMap((path) => path.skills) ?? [];
}

function userSkillText(inputs: ReadinessInputs) {
  return `${inputs.discoveryAnswers?.skills ?? ""}`.toLowerCase();
}

function calculateSkillGaps(inputs: ReadinessInputs): SkillGap[] {
  const known = userSkillText(inputs);
  const targetCareer = firstCareer(inputs);
  const missing = allRoadmapSkills(inputs)
    .filter((skill) => !known.includes(skill.toLowerCase()))
    .slice(0, 4);

  if (!missing.length) {
    return [
      {
        target_career: targetCareer,
        missing_skill: "Portfolio proof",
        priority: "medium",
        estimated_time_to_learn: "1-2 weeks",
        recommended_action: "Create one small project that proves your strongest career skill."
      }
    ];
  }

  return missing.map((skill, index) => ({
    target_career: targetCareer,
    missing_skill: skill,
    priority: index === 0 ? "high" : index === 1 ? "medium" : "low",
    estimated_time_to_learn: index === 0 ? "2-4 weeks" : "1-3 weeks",
    recommended_action: `Complete one focused lesson and create one proof-of-work example for ${skill}.`
  }));
}

function confidence(score: number) {
  if (score >= 75) return "High";
  if (score >= 50) return "Medium";
  return "Early";
}

function statusCompleted(status: unknown) {
  return typeof status === "string" && status !== "not_started" && status.trim().length > 0;
}

function profileCompleted(inputs: ReadinessInputs) {
  const profile = inputs.profile;
  if (!profile) return false;

  return Boolean(
    hasText(profile.full_name) &&
      hasText(profile.country) &&
      (hasText(profile.education) || hasText(profile.highest_qualification)) &&
      hasText(profile.current_status) &&
      (hasText(profile.career_goal) || hasText(inputs.discoveryAnswers?.preferred_career_direction))
  );
}

export function calculateReadiness(inputs: ReadinessInputs): ReadinessResult {
  const answers = inputs.discoveryAnswers;
  const roadmap = inputs.roadmap;
  const opportunities = inputs.opportunities;
  const skillGaps = calculateSkillGaps(inputs);

  const onboardingCompleted = Boolean(inputs.profile?.onboarding_completed || roadmap?.career_paths?.length || hasText(answers?.preferred_career_direction));
  const profileComplete = profileCompleted(inputs);
  const cvComplete = statusCompleted(inputs.professionalIdentity?.cv_status) || inputs.achievements.some((achievement) => achievement.achievement_key === "cv_master");
  const coverLetterComplete = statusCompleted(inputs.professionalIdentity?.cover_letter_status);
  const linkedinComplete = statusCompleted(inputs.professionalIdentity?.linkedin_status) || hasText(inputs.profile?.linkedin_url);
  const opportunityStarted = opportunities.some((opportunity) => opportunity.action.saved || opportunity.action.applied);
  const interviewComplete = inputs.interviewPrepCompleted || inputs.achievements.some((achievement) => achievement.achievement_key === "interview_ready");

  const onboardingScore = onboardingCompleted ? 10 : 0;
  const professionalProfileScore = profileComplete ? 25 : 0;
  const cvScore = cvComplete ? 25 : 0;
  const coverLetterScore = coverLetterComplete ? 15 : 0;
  const linkedinScore = linkedinComplete ? 10 : 0;
  const opportunityScore = opportunityStarted ? 10 : 0;
  const interviewScore = interviewComplete ? 5 : 0;

  const categoryScores = {
    career_clarity_score: onboardingScore,
    skills_readiness_score: 0,
    cv_readiness_score: cvScore + coverLetterScore,
    opportunity_readiness_score: opportunityScore,
    interview_readiness_score: interviewScore,
    consistency_score: 0,
    digital_professionalism_score: professionalProfileScore + linkedinScore
  };

  const totalScore = Object.values(categoryScores).reduce((sum, value) => sum + value, 0);
  const strengths = [
    onboardingCompleted ? "Onboarding completed" : "",
    profileComplete ? "Professional profile completed" : "",
    cvComplete ? "CV completed" : "",
    coverLetterComplete ? "Cover letter completed" : "",
    linkedinComplete ? "LinkedIn profile improved" : "",
    opportunityStarted ? "Opportunity action started" : "",
    interviewComplete ? "Interview preparation completed" : ""
  ].filter(Boolean);

  const weaknesses = [
    !onboardingCompleted ? "Complete onboarding" : "",
    !profileComplete ? "Complete My Professional Profile" : "",
    !cvComplete ? "Build your CV" : "",
    !coverLetterComplete ? "Build your cover letter" : "",
    !linkedinComplete ? "Improve your LinkedIn profile" : "",
    !opportunityStarted ? "Save or apply to your first opportunity" : "",
    !interviewComplete ? "Complete interview preparation" : ""
  ].filter(Boolean);

  const topWeakness = weaknesses[0] ?? "Keep building proof of employability";
  const todayPriority =
    inputs.dailyMissions.find((mission) => !mission.completed)?.title ||
    inputs.weeklyGoal?.title ||
    skillGaps[0]?.recommended_action ||
    "Review your career plan and complete one employment-focused action.";

  const nextActions = [
    skillGaps[0]?.recommended_action,
    opportunities.find((opportunity) => !opportunity.action.applied)?.title ? `Apply or prepare for ${opportunities.find((opportunity) => !opportunity.action.applied)?.title}.` : "",
    inputs.dailyMissions.find((mission) => !mission.completed)?.description || "Ask your PATHZY Mentor for one focused next step."
  ].filter(Boolean).slice(0, 3);

  return {
    totalScore,
    label: getLabel(totalScore),
    categoryScores,
    careerGoal: firstCareer(inputs),
    topStrengths: strengths.length ? strengths.slice(0, 3) : ["Willingness to start"],
    topWeaknesses: weaknesses.length ? weaknesses.slice(0, 3) : ["Needs more completed employment actions"],
    nextActions: nextActions.length ? nextActions : ["Complete Discovery", "Generate your career plan", "Finish one daily mission"],
    todayPriority,
    skillGaps,
    careerDna: {
      strongestCareerDirection: firstCareer(inputs),
      topStrengths: strengths.length ? strengths.slice(0, 3) : ["Curiosity", "Adaptability", "Motivation"],
      workStyle: answers?.work_style || "Still discovering",
      preferredWorkEnvironment: answers?.dream_lifestyle || "Still discovering",
      recommendedCareers: roadmap?.career_paths?.map((path) => path.title).slice(0, 3) ?? [firstCareer(inputs)],
      confidenceLevel: confidence(totalScore),
      firstCareerFocus: roadmap?.career_paths?.[0]?.skills?.[0] || skillGaps[0]?.missing_skill || "Career fundamentals"
    }
  };
}
