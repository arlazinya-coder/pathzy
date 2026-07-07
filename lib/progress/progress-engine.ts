import { getJourneyRoute, type JourneyStepKey } from "@/lib/progress/journey-router";

export type ProgressInputs = {
  profileComplete: boolean;
  discoveryComplete: boolean;
  careerGoalSelected: boolean;
  cvComplete: boolean;
  coverLetterComplete: boolean;
  linkedinComplete: boolean;
  careerPassportComplete: boolean;
  opportunitiesSaved: number;
  trackerEntries: number;
  applicationsSent: number;
  activeApplicationTracked: boolean;
  interviewPrepComplete: boolean;
  offerReceived: boolean;
  employed: boolean;
  employmentReadinessScore: number;
};

export type ProgressMilestone = {
  key: JourneyStepKey;
  title: string;
  href: string;
  time: string;
  difficulty: "Beginner" | "Intermediate";
  gain: number;
  why: string;
  complete: boolean;
};

export type JourneyActionStatus = "recommended" | "available" | "completed" | "locked";

export type JourneyAction = {
  key: JourneyStepKey;
  title: string;
  status: JourneyActionStatus;
  estimatedTime: string;
  impactScore: number;
  reason: string;
  primaryRoute: string;
  alternativeRoute?: string;
  recommendation?: string;
};

const milestones: Array<Omit<ProgressMilestone, "complete"> & { complete: (inputs: ProgressInputs) => boolean }> = [
  {
    key: "profile",
    title: "Complete Profile",
    href: getJourneyRoute("profile"),
    time: "10 minutes",
    difficulty: "Beginner",
    gain: 6,
    why: "PATHZY needs your basic details to personalize your career plan and coach guidance.",
    complete: (inputs) => inputs.profileComplete
  },
  {
    key: "discovery",
    title: "Complete Career Discovery",
    href: getJourneyRoute("discovery"),
    time: "15 minutes",
    difficulty: "Beginner",
    gain: 10,
    why: "Your answers unlock clearer career matches, better next steps, and stronger guidance.",
    complete: (inputs) => inputs.discoveryComplete
  },
  {
    key: "choose_career",
    title: "Choose Career Direction",
    href: getJourneyRoute("choose_career"),
    time: "10 minutes",
    difficulty: "Beginner",
    gain: 7,
    why: "Choosing one direction makes your CV, cover letter, LinkedIn profile, and applications more focused.",
    complete: (inputs) => inputs.careerGoalSelected
  },
  {
    key: "cv",
    title: "Build CV",
    href: getJourneyRoute("cv"),
    time: "20 minutes",
    difficulty: "Beginner",
    gain: 8,
    why: "A clear CV is the first document you need before applying with confidence.",
    complete: (inputs) => inputs.cvComplete
  },
  {
    key: "cover_letter",
    title: "Build Cover Letter",
    href: getJourneyRoute("cover_letter"),
    time: "20 minutes",
    difficulty: "Beginner",
    gain: 6,
    why: "A focused cover letter helps you explain why you fit a real opportunity.",
    complete: (inputs) => inputs.coverLetterComplete
  },
  {
    key: "linkedin",
    title: "Optimize LinkedIn",
    href: getJourneyRoute("linkedin"),
    time: "20 minutes",
    difficulty: "Beginner",
    gain: 6,
    why: "A clearer LinkedIn profile improves how recruiters and employers understand your direction.",
    complete: (inputs) => inputs.linkedinComplete
  },
  {
    key: "career_passport",
    title: "Create Career Passport",
    href: getJourneyRoute("career_passport"),
    time: "25 minutes",
    difficulty: "Beginner",
    gain: 6,
    why: "Your Career Passport brings your goal, readiness, strengths, skills, and next action into one simple summary.",
    complete: (inputs) => inputs.careerPassportComplete
  },
  {
    key: "opportunities",
    title: "Find Opportunities",
    href: getJourneyRoute("opportunities"),
    time: "12 minutes",
    difficulty: "Beginner",
    gain: 5,
    why: "Saving one target gives your learning, documents, and next actions a real destination.",
    complete: (inputs) => inputs.opportunitiesSaved > 0
  },
  {
    key: "applications",
    title: "Apply",
    href: getJourneyRoute("applications"),
    time: "15 minutes",
    difficulty: "Beginner",
    gain: 5,
    why: "Preparing one application turns a saved opportunity into a real next step.",
    complete: (inputs) => inputs.applicationsSent > 0
  },
  {
    key: "interview_prep",
    title: "Interview Preparation",
    href: getJourneyRoute("interview_prep"),
    time: "25 minutes",
    difficulty: "Intermediate",
    gain: 7,
    why: "Interview practice helps you explain your skills, story, and goals with confidence.",
    complete: (inputs) => inputs.interviewPrepComplete
  },
  {
    key: "employment",
    title: "Employment",
    href: getJourneyRoute("employment"),
    time: "Ongoing",
    difficulty: "Intermediate",
    gain: 10,
    why: "Employment is the goal of the PATHZY journey.",
    complete: (inputs) => inputs.employed
  },
];

const actionGuidance: Partial<Record<JourneyStepKey, { recommendation?: string; alternativeRoute?: string }>> = {
  cv: {
    recommendation: "You can build your CV now. Completing Career Discovery first may help PATHZY create a stronger CV.",
    alternativeRoute: getJourneyRoute("discovery")
  },
  cover_letter: {
    recommendation: "You can create a cover letter now. Building your CV first usually makes the cover letter sharper.",
    alternativeRoute: getJourneyRoute("cv")
  },
  linkedin: {
    recommendation: "You can improve LinkedIn now. A clear career direction helps PATHZY suggest stronger wording.",
    alternativeRoute: getJourneyRoute("choose_career")
  },
  opportunities: {
    recommendation: "You can explore opportunities now and keep improving your skills at the same time.",
    alternativeRoute: getJourneyRoute("skills")
  },
  applications: {
    recommendation: "You can apply now. Saving an opportunity first helps PATHZY keep your tracker organized.",
    alternativeRoute: getJourneyRoute("opportunities")
  },
  interview_prep: {
    recommendation: "You can practice interviews anytime. It becomes even more useful once you have a target role.",
    alternativeRoute: getJourneyRoute("applications")
  }
};

export function getProgressMilestones(inputs: ProgressInputs): ProgressMilestone[] {
  return milestones.map((milestone) => ({ ...milestone, complete: milestone.complete(inputs) }));
}

export function getNextMilestone(inputs: ProgressInputs): ProgressMilestone {
  return getProgressMilestones(inputs).find((milestone) => !milestone.complete) ?? getProgressMilestones(inputs)[getProgressMilestones(inputs).length - 1];
}

export function getProgressPercent(inputs: ProgressInputs) {
  const progress = getProgressMilestones(inputs);
  return Math.round((progress.filter((milestone) => milestone.complete).length / progress.length) * 100);
}

export function getJourneyActions(inputs: ProgressInputs): JourneyAction[] {
  const progress = getProgressMilestones(inputs);
  const recommended = progress.find((milestone) => !milestone.complete);

  const actions = progress.map((milestone) => {
    const guidance = actionGuidance[milestone.key];
    const status: JourneyActionStatus = milestone.complete ? "completed" : recommended?.key === milestone.key ? "recommended" : "available";

    return {
      key: milestone.key,
      title: milestone.title,
      status,
      estimatedTime: milestone.time,
      impactScore: milestone.gain,
      reason: milestone.why,
      primaryRoute: milestone.href,
      alternativeRoute: guidance?.alternativeRoute,
      recommendation: guidance?.recommendation
    };
  });

  const skillAction: JourneyAction = {
    key: "skills",
    title: "Improve Skills",
    status: inputs.employmentReadinessScore >= 80 ? "completed" : recommended?.key ? "available" : "recommended",
    estimatedTime: "15 minutes",
    impactScore: 8,
    reason: "You can start your CV now and improve key skills at the same time.",
    primaryRoute: getJourneyRoute("skills"),
    alternativeRoute: getJourneyRoute("cv"),
    recommendation: "Improve skills first, build your CV now, or do both in parallel."
  };

  return [...actions, skillAction];
}

export function getRecommendedJourneyAction(inputs: ProgressInputs): JourneyAction {
  return getJourneyActions(inputs).find((action) => action.status === "recommended") ?? getJourneyActions(inputs)[0];
}
