import type { GeneratedRoadmap } from "@/lib/discovery/types";
import type { PathzyBrainRecord, ReadinessResult, SkillGap } from "@/lib/pathzy-brain/types";

export type ProfessionalLanguage = "english" | "french";
export type ProfessionalStatus = "not_started" | "draft" | "improving" | "ready";
export type ProfessionalIdentityLabel = "Not Started" | "Needs Work" | "Improving" | "Recruiter Ready" | "Strong Professional Identity";
export type PremiumDocumentTemplate = "ATS Friendly" | "Modern Blue" | "Professional Green" | "Graduate Fresh" | "Executive Premium";

export type ProfessionalIdentityRecord = {
  id?: string;
  user_id: string;
  language: ProfessionalLanguage;
  professional_identity_score: number;
  cv_status: ProfessionalStatus;
  cover_letter_status: ProfessionalStatus;
  linkedin_status: ProfessionalStatus;
  portfolio_status: ProfessionalStatus;
  career_passport_status: ProfessionalStatus;
  next_action: string;
  created_at?: string;
  updated_at?: string;
};

export type ProfessionalIdentityScore = {
  totalScore: number;
  label: ProfessionalIdentityLabel;
  strengths: string[];
  weaknesses: string[];
  nextRecommendedAction: string;
  categoryScores: {
    cv_readiness: number;
    cover_letter_readiness: number;
    linkedin_readiness: number;
    skills_presentation: number;
    career_clarity: number;
    application_readiness: number;
    professional_tone: number;
  };
};

export type ProfessionalIdentityContext = {
  identity: ProfessionalIdentityRecord;
  score: ProfessionalIdentityScore;
  latest_cv: { title: string; score: number; status: string; content: string } | null;
  latest_cover_letter: { title: string; company: string | null; role: string | null; status: string; content: string } | null;
  linkedin_profile: { headline: string; optimization_score: number; skills: string[] } | null;
  latest_recruiter_message: { company: string | null; role: string | null; status: string; message: string } | null;
  latest_follow_up_email: { company: string | null; role: string | null; status: string; email_content: string; follow_up_date: string | null } | null;
  career_passport: { summary: string; strengths: string[]; skills: string[]; career_goal: string | null } | null;
};

export type ProfessionalIdentityInputs = {
  profile: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    country?: string | null;
    city?: string | null;
    age?: number | null;
    education?: string | null;
    field_of_study?: string | null;
    highest_qualification?: string | null;
    current_status?: string | null;
    plan?: string | null;
    premium_status?: string | null;
    linkedin_url?: string | null;
    portfolio_url?: string | null;
  } | null;
  discoveryAnswers: Record<string, unknown> | null;
  roadmap: GeneratedRoadmap | null;
  brain: PathzyBrainRecord | null;
  readiness: ReadinessResult | null;
  skillGaps: SkillGap[];
};

export type GenerateOptions = {
  language?: ProfessionalLanguage;
  cvType?: string;
  templateName?: PremiumDocumentTemplate;
  company?: string;
  role?: string;
  jobDescription?: string;
  tone?: string;
  recruiterName?: string;
  platform?: string;
  applicationDate?: string;
  oldCvText?: string;
};

export type GeneratedProfessionalDocument = {
  id?: string;
  tool: "cv" | "cover-letter" | "linkedin" | "recruiter-message" | "follow-up" | "career-passport";
  title: string;
  content: string;
  contentJson?: Record<string, unknown> | null;
  template_name?: string | null;
  version_number?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  last_downloaded_at?: string | null;
  score?: number;
  followUpDate?: string | null;
  fields?: Record<string, string | string[] | number | null>;
};
