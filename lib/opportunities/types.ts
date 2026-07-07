export type OpportunityCategory =
  | "Recommended jobs"
  | "Internships"
  | "Learnerships"
  | "Apprenticeships"
  | "Scholarships"
  | "Free online courses"
  | "Certifications";

export type Opportunity = {
  id: string;
  title: string;
  provider: string;
  category: OpportunityCategory;
  country: string;
  mode: "Remote" | "Hybrid" | "On-site" | "Online";
  level: "Beginner" | "Early career" | "Intermediate";
  deadline: string;
  careerTags: string[];
  skillTags: string[];
  description: string;
  outcome: string;
  fitReason: string;
};

export type OpportunityAction = {
  opportunity_id: string;
  saved: boolean;
  applied: boolean;
  completed: boolean;
  hidden: boolean;
};

export type PersonalizedOpportunity = Opportunity & {
  fit: number;
  reasons: string[];
  action: OpportunityAction;
};

export type OpportunityStats = {
  saved: number;
  applied: number;
  completed: number;
  visible: number;
  progress: number;
};
