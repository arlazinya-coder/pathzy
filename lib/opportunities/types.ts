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
  source: string;
  externalId: string;
  sourceUrl: string;
  applicationUrl: string;
  title: string;
  employer: string;
  employerLogo?: string;
  provider: string;
  description: string;
  category: OpportunityCategory;
  country: string;
  location: string;
  remoteType: "REMOTE" | "HYBRID" | "ON_SITE" | "UNKNOWN";
  mode: "Remote" | "Hybrid" | "On-site" | "Online";
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  postedAt?: string;
  closingAt?: string;
  lastVerifiedAt: string;
  responsibilities: string[];
  requirements: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  requiredEducation: string[];
  preferredEducation: string[];
  requiredExperience?: string;
  preferredExperience?: string;
  licences: string[];
  certifications: string[];
  languages: string[];
  workAuthorizationRequirement?: string;
  status: "ACTIVE" | "CLOSING_SOON" | "EXPIRED" | "UNKNOWN";
  level: "Beginner" | "Early career" | "Intermediate";
  deadline: string;
  careerTags: string[];
  skillTags: string[];
  outcome: string;
  fitReason: string;
};

export type NormalizedOpportunity = Opportunity;

export type OpportunityRequirementImportance = "MANDATORY" | "PREFERRED" | "ADVANTAGEOUS" | "UNKNOWN";

export type OpportunityEligibilityStatus = "COMPATIBLE" | "CHECK_NEEDED" | "BLOCKED" | "UNKNOWN";

export type OpportunitySuitabilityLabel = "STRONG_MATCH" | "GOOD_MATCH" | "POSSIBLE_MATCH" | "STRETCH_OPPORTUNITY";

export type OpportunityMatchExplanation = {
  suitabilityScore: number;
  suitabilityLabel: OpportunitySuitabilityLabel;
  eligibilityStatus: OpportunityEligibilityStatus;
  reasons: string[];
  gaps: string[];
  unknowns: string[];
  recommendation: "WORTH_APPLYING" | "APPLY_AFTER_CHECKING" | "PREPARE_FIRST" | "DO_NOT_RECOMMEND_NOW";
};

export type JobProviderStatus =
  | { status: "available"; provider: string; message?: string }
  | { status: "provider_unavailable"; provider: string; message: string }
  | { status: "no_jobs_found"; provider: string; message: string }
  | { status: "invalid_provider_response"; provider: string; message: string };

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
  match: OpportunityMatchExplanation;
};

export type OpportunityStats = {
  saved: number;
  applied: number;
  completed: number;
  visible: number;
  progress: number;
};
