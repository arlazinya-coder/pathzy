export type DiscoveryAnswers = {
  personal_background: string;
  education: string;
  interests: string;
  skills: string;
  personality: string;
  work_style: string;
  dream_lifestyle: string;
  income_goal: string;
  biggest_challenge: string;
  preferred_career_direction: string;
};

export type CareerPathResult = {
  title: string;
  fit_percentage: number;
  match: string;
  why: string;
  skills: string[];
};

export type GeneratedRoadmap = {
  career_paths: CareerPathResult[];
  roadmap_90_days: string[];
  today_first_mission: string;
};
