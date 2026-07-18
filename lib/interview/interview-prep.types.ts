import type { ProfileMatchEvidence } from "@/lib/job-intelligence";

export type InterviewType = "screening" | "behavioural" | "technical" | "panel" | "case_study" | "presentation" | "final" | "unknown";

export type InterviewQuestionCategory =
  | "introduction"
  | "motivation"
  | "experience"
  | "behavioural"
  | "technical"
  | "role_specific"
  | "industry"
  | "leadership"
  | "problem_solving"
  | "strengths"
  | "development_area"
  | "career_change"
  | "employment_gap"
  | "salary"
  | "availability"
  | "closing";

export type GapResponseType =
  | "missing_skill"
  | "limited_experience"
  | "career_change"
  | "employment_gap"
  | "short_role_duration"
  | "qualification_uncertainty"
  | "no_direct_industry_experience";

export type InterviewEvidenceReference = {
  canonicalEntityType?: ProfileMatchEvidence["canonicalEntityType"];
  canonicalEntityId: string;
  label: string;
  evidenceText: string;
  confidence?: number;
  reviewStatus?: string;
};

export type InterviewPrepQuestion = {
  id: string;
  category: InterviewQuestionCategory;
  question: string;
  source: "job_responsibility" | "mandatory_requirement" | "preferred_requirement" | "gap" | "targeted_cv_claim" | "application_stage";
  sourceId?: string;
  whyAsked: string;
  evidenceToUse: InterviewEvidenceReference[];
  answerStructure: string[];
  pointsToInclude: string[];
  claimsToAvoid: string[];
  practiceResponse: string;
};

export type StarStory = {
  id: string;
  title: string;
  sourceCanonicalEntityIds: string[];
  situation: string;
  task: string;
  action: string;
  result: string;
  evidenceToUse: InterviewEvidenceReference[];
  claimsToAvoid: string[];
};

export type GapResponse = {
  id: string;
  type: GapResponseType;
  gap: string;
  honestPositioning: string;
  transferableEvidence: InterviewEvidenceReference[];
  claimsToAvoid: string[];
};

export type EmployerQuestion = {
  id: string;
  category: "priorities" | "team" | "success_measures" | "systems" | "development" | "challenges" | "next_steps";
  question: string;
  rationale: string;
};

export type PracticeResponse = {
  questionId: string;
  answer: string;
  notes: string;
  selfRating?: number;
  evidenceChecklist: string[];
  updatedAt: string;
};

export type InterviewFeedback = {
  questionId: string;
  relevance: number;
  clarity: number;
  structure: number;
  evidenceUse: number;
  conciseness: number;
  completeness: number;
  unsupportedClaims: string[];
  safeNotes: string[];
  updatedAt: string;
};

export type InterviewPrepRecord = {
  id: string;
  userId: string;
  applicationId?: string;
  jobUnderstandingId?: string;
  jobUnderstandingVersion?: number;
  jobMatchAnalysisId?: string;
  canonicalProfileId?: string;
  canonicalProfileVersion?: number;
  targetedCvDocumentId?: string;
  role: string;
  company?: string;
  language: "english" | "french";
  interviewType: InterviewType;
  questions: InterviewPrepQuestion[];
  starStories: StarStory[];
  gapResponses: GapResponse[];
  employerQuestions: EmployerQuestion[];
  practiceResponses: PracticeResponse[];
  feedback: InterviewFeedback[];
  status: "draft" | "in_progress" | "completed" | "archived";
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VoicePracticeAdapter = {
  mode: "future_voice";
  acceptsAudio: false;
  feedbackScope: Array<"relevance" | "clarity" | "structure" | "evidence_use" | "conciseness" | "completeness">;
  prohibitedAssessments: Array<"accent" | "appearance" | "protected_characteristics" | "personality_stereotypes" | "emotion_from_voice_or_video">;
};

export type InterviewPreparationProviderResult = Partial<Pick<InterviewPrepRecord, "questions" | "starStories" | "gapResponses" | "employerQuestions">>;

export type InterviewPreparationProvider = {
  providerName: string;
  timeoutMs: number;
  createApplicationPreparation(input: {
    applicationId: string;
    interviewType: InterviewType;
    language: "english" | "french";
  }): Promise<InterviewPreparationProviderResult>;
};
