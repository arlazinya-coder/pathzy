export type JourneyStepKey =
  | "profile"
  | "discovery"
  | "choose_career"
  | "cv"
  | "cover_letter"
  | "linkedin"
  | "career_passport"
  | "opportunities"
  | "applications"
  | "interview_prep"
  | "skills"
  | "employment";

export const journeyStepRoutes: Record<JourneyStepKey, string> = {
  profile: "/onboarding",
  discovery: "/discovery",
  choose_career: "/roadmap",
  cv: "/professional-identity/cv",
  cover_letter: "/professional-identity/cover-letter",
  linkedin: "/professional-identity/linkedin",
  career_passport: "/professional-identity/career-passport",
  opportunities: "/opportunities",
  applications: "/employment-tracker",
  interview_prep: "/interview",
  skills: "/progress",
  employment: "/employment-tracker"
};

export function getJourneyRoute(step: JourneyStepKey) {
  return journeyStepRoutes[step];
}
