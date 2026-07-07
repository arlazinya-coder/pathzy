import { appRoutes } from "@/lib/navigation/routes";

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
  profile: appRoutes.onboarding,
  discovery: appRoutes.discovery,
  choose_career: appRoutes.roadmap,
  cv: appRoutes.professionalIdentityCv,
  cover_letter: appRoutes.professionalIdentityCoverLetter,
  linkedin: appRoutes.professionalIdentityLinkedin,
  career_passport: appRoutes.professionalIdentityCareerPassport,
  opportunities: appRoutes.opportunities,
  applications: appRoutes.applications,
  interview_prep: appRoutes.interview,
  skills: appRoutes.skills,
  employment: appRoutes.applications
};

export function getJourneyRoute(step: JourneyStepKey) {
  return journeyStepRoutes[step];
}
