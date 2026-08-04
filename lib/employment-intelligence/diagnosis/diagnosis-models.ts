import type { SupportedLanguageCode } from "@/lib/language/language-preferences";
import type { CountryEmploymentContext } from "../domain/country-context";
import type { ReadinessDimensionKey } from "../domain/readiness";
import type { PathwayCode } from "../domain/pathways";
import type {
  DiagnosisAnswerState,
  DiagnosisPresentationMode,
  DiagnosisQuestionCategory,
  DiagnosisQuestionType,
  DiagnosisRequiredness,
  DiagnosisSensitivityLevel,
  DiagnosisSessionStatus
} from "./question-types";

export type DiagnosisOption = {
  code: string;
  label: Record<SupportedLanguageCode, string>;
  plainLabel?: Record<SupportedLanguageCode, string>;
  answerState?: DiagnosisAnswerState;
  iconKey?: string;
};

export type DiagnosisRuleReference = {
  ruleId: string;
  reason: string;
};

export type DiagnosisQuestionDefinition = {
  questionId: string;
  category: DiagnosisQuestionCategory;
  purpose: string;
  promptKey: string;
  helpTextKey: string;
  title: Record<SupportedLanguageCode, string>;
  prompt: Record<SupportedLanguageCode, string>;
  helpText: Record<SupportedLanguageCode, string>;
  whyAsked: Record<SupportedLanguageCode, string>;
  answerType: DiagnosisQuestionType;
  options: DiagnosisOption[];
  requiredness: DiagnosisRequiredness;
  sensitivity: DiagnosisSensitivityLevel;
  eligibilityRules: DiagnosisRuleReference[];
  skipRules: DiagnosisRuleReference[];
  branchRules: DiagnosisRuleReference[];
  affectedIntelligenceDimensions: ReadinessDimensionKey[];
  affectedBarriers: string[];
  affectedPathways: PathwayCode[];
  countryContextDependencies: string[];
  literacyLevel: DiagnosisPresentationMode;
  expectedEffort: "LOW" | "MEDIUM" | "HIGH";
  maximumDisplayLength: number;
  version: string;
  priority: number;
};

export type EmploymentDiagnosisAnswer = {
  questionId: string;
  state: DiagnosisAnswerState;
  value: string | string[] | number | boolean | null;
  answeredAt: string;
  source: "USER" | "SYSTEM_DEFAULT";
  questionVersion: string;
  branchDecisionId?: string;
};

export type DiagnosisBranchDecision = {
  id: string;
  questionId: string;
  decision: "ASK" | "SKIP_KNOWN_IDENTITY" | "SKIP_NOT_RELEVANT" | "DEFER_OPTIONAL" | "COMPLETE";
  reason: string;
  createdAt: string;
};

export type EmploymentDiagnosisSession = {
  id: string;
  userId: string;
  version: string;
  status: DiagnosisSessionStatus;
  startedAt: string;
  updatedAt: string;
  completedAt?: string | null;
  currentQuestionId?: string | null;
  answeredQuestionIds: string[];
  skippedQuestionIds: string[];
  answers: Record<string, EmploymentDiagnosisAnswer>;
  branchHistory: DiagnosisBranchDecision[];
  inputSnapshotVersion: string;
  countryContextVersion: string;
  engineVersion: string;
  interfaceLanguage: SupportedLanguageCode;
  explanationLanguage: SupportedLanguageCode;
  presentationMode: DiagnosisPresentationMode;
  resultVersion?: string | null;
  staleStatus: "CURRENT" | "STALE" | "NEEDS_REVIEW";
};

export type DiagnosisProgress = {
  stage: string;
  answeredHighPriorityTopics: string[];
  unresolvedHighPriorityTopics: string[];
  estimatedRemainingQuestions: number;
  completionConfidence: number;
  canComplete: boolean;
  explanation: string;
};

export type DiagnosisQuestionContext = {
  userId: string;
  professionalIdentity: Record<string, unknown>;
  session: EmploymentDiagnosisSession;
  countryContext: CountryEmploymentContext;
  missingInformationCodes: string[];
  detectedBarrierCodes: string[];
  readinessProfile?: Record<string, unknown> | null;
  interfaceLanguage: SupportedLanguageCode;
  supportIntensity?: string | null;
};

export type DiagnosisFinding = {
  code: string;
  severity: "INFO" | "SUPPORT" | "IMPORTANT" | "BLOCKER";
  category: DiagnosisQuestionCategory;
  explanation: string;
  evidenceQuestionIds: string[];
  sensitive: boolean;
};

export type DiagnosisSuggestion = {
  suggestionId: string;
  targetProfessionalIdentityField: string;
  proposedCanonicalValue: unknown;
  reason: string;
  sourceDiagnosisAnswerId: string;
  confidence: number;
  userFacingExplanation: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  source: "EMPLOYMENT_DIAGNOSIS";
};

export type EmploymentDiagnosisResult = {
  summaryCodes: string[];
  diagnosisStatus: "ENOUGH_FOR_INTELLIGENCE" | "NEEDS_REVIEW" | "PARTIAL";
  primaryEmploymentSituation?: string | null;
  strongestSignals: string[];
  majorBarriers: DiagnosisFinding[];
  practicalConstraints: string[];
  immediateNeeds: string[];
  workEligibilityUncertainty: boolean;
  digitalAccessNeeds: string[];
  supportNeeds: string[];
  preferredPathwaySignals: string[];
  evidenceGaps: string[];
  unansweredImportantQuestions: string[];
  identitySuggestions: DiagnosisSuggestion[];
  readinessImpactReferences: ReadinessDimensionKey[];
  countryContextReferences: string[];
  confidence: number;
  explanationFacts: string[];
  diagnosisVersion: string;
  generatedAt: string;
};

export type AdaptiveQuestionEngineResult = {
  nextQuestion: DiagnosisQuestionDefinition | null;
  reasonForAsking: string;
  branchDecision: DiagnosisBranchDecision;
  estimatedRemainingQuestions: number;
  progress: DiagnosisProgress;
  canComplete: boolean;
  unresolvedHighValueQuestions: string[];
};
