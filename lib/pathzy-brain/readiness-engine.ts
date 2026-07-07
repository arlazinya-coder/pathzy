import type { ReadinessInputs, ReadinessLabel, ReadinessResult, SkillGap } from "@/lib/pathzy-brain/types";

function clamp(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(value)));
}

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
  return inputs.roadmap?.career_paths?.[0]?.title || inputs.discoveryAnswers?.preferred_career_direction || "Career starter";
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

export function calculateReadiness(inputs: ReadinessInputs): ReadinessResult {
  const answers = inputs.discoveryAnswers;
  const completedMissions = inputs.dailyMissions.filter((mission) => mission.completed).length + (inputs.weeklyGoal?.completed ? 1 : 0);
  const roadmap = inputs.roadmap;
  const opportunities = inputs.opportunities;
  const achievements = inputs.achievements;
  const level = inputs.level;
  const skillGaps = calculateSkillGaps(inputs);

  const careerClarity = clamp(
    (hasText(answers?.preferred_career_direction) ? 5 : 0) +
      (roadmap?.career_paths?.length ? 6 : 0) +
      (hasText(answers?.dream_lifestyle) ? 2 : 0) +
      (hasText(answers?.income_goal) ? 2 : 0),
    15
  );

  const skillsReadiness = clamp(
    (hasText(answers?.skills) ? 6 : 0) +
      Math.min(6, allRoadmapSkills(inputs).length) +
      (level ? Math.min(4, level.level) : 0) +
      (achievements.length ? 4 : 0),
    20
  );

  const cvReadiness = clamp(
    (achievements.some((achievement) => achievement.achievement_key === "cv_master") ? 8 : 0) +
      (inputs.dailyMissions.some((mission) => mission.category === "CV" && mission.completed) ? 4 : 0) +
      (completedMissions ? 3 : 0),
    15
  );

  const opportunityReadiness = clamp(
    Math.min(6, opportunities.filter((opportunity) => opportunity.action.saved).length * 2) +
      Math.min(6, opportunities.filter((opportunity) => opportunity.action.applied).length * 3) +
      (opportunities.length ? 3 : 0),
    15
  );

  const interviewReadiness = clamp(
    (achievements.some((achievement) => achievement.achievement_key === "interview_ready") ? 8 : 0) +
      (inputs.mentorMessagesCount > 2 ? 4 : 0) +
      (completedMissions > 3 ? 3 : 0),
    15
  );

  const consistency = clamp(
    Math.min(5, completedMissions * 2) +
      (level ? Math.min(5, level.daily_streak + level.weekly_streak) : 0),
    10
  );

  const digitalProfessionalism = clamp(
    (inputs.profile?.full_name ? 2 : 0) +
      (inputs.profile?.country ? 1 : 0) +
      (hasText(answers?.personality) ? 2 : 0) +
      (hasText(answers?.work_style) ? 2 : 0) +
      (inputs.mentorMessagesCount ? 3 : 0),
    10
  );

  const categoryScores = {
    career_clarity_score: careerClarity,
    skills_readiness_score: skillsReadiness,
    cv_readiness_score: cvReadiness,
    opportunity_readiness_score: opportunityReadiness,
    interview_readiness_score: interviewReadiness,
    consistency_score: consistency,
    digital_professionalism_score: digitalProfessionalism
  };

  const totalScore = Object.values(categoryScores).reduce((sum, value) => sum + value, 0);
  const strengths = [
    careerClarity >= 10 ? "Clear career direction" : "",
    skillsReadiness >= 12 ? "Growing skill base" : "",
    opportunityReadiness >= 8 ? "Opportunity momentum" : "",
    consistency >= 6 ? "Consistent daily action" : "",
    digitalProfessionalism >= 6 ? "Professional self-awareness" : ""
  ].filter(Boolean);

  const weaknesses = [
    careerClarity < 8 ? "Career clarity needs more focus" : "",
    skillsReadiness < 10 ? "Skill gaps are blocking readiness" : "",
    cvReadiness < 8 ? "CV and proof-of-work need strengthening" : "",
    opportunityReadiness < 8 ? "More applications or saved opportunities needed" : "",
    interviewReadiness < 8 ? "Interview preparation is still early" : "",
    consistency < 5 ? "Consistency needs a stronger daily rhythm" : ""
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
