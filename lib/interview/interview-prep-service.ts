import type { SupabaseClient } from "@supabase/supabase-js";
import { getOrCreateCanonicalProfile, valueText } from "@/lib/canonical-profile";
import { loadProfessionalDocument } from "@/lib/professional-documents";
import type { CanonicalProfessionalIdentity } from "@/lib/canonical-profile";
import type { ProfileJobMatchAnalysis, ProfileMatchEvidence, SemanticJobUnderstanding, StructuredJobRequirement } from "@/lib/job-intelligence";
import type {
  EmployerQuestion,
  GapResponse,
  InterviewEvidenceReference,
  InterviewFeedback,
  InterviewPreparationProviderResult,
  InterviewPrepQuestion,
  InterviewPrepRecord,
  InterviewQuestionCategory,
  InterviewType,
  PracticeResponse,
  StarStory,
  VoicePracticeAdapter
} from "./interview-prep.types";

type Supabase = SupabaseClient;

export class InterviewPrepError extends Error {
  userMessage: string;
  status: number;

  constructor(message: string, userMessage = message, status = 400) {
    super(message);
    this.name = "InterviewPrepError";
    this.userMessage = userMessage;
    this.status = status;
  }
}

export const INTERVIEW_TYPES = ["screening", "behavioural", "technical", "panel", "case_study", "presentation", "final", "unknown"] as const satisfies readonly InterviewType[];

export const INTERVIEW_QUESTION_CATEGORIES = [
  "introduction",
  "motivation",
  "experience",
  "behavioural",
  "technical",
  "role_specific",
  "industry",
  "leadership",
  "problem_solving",
  "strengths",
  "development_area",
  "career_change",
  "employment_gap",
  "salary",
  "availability",
  "closing"
] as const satisfies readonly InterviewQuestionCategory[];

export const INTERVIEW_VOICE_FOUNDATION: VoicePracticeAdapter = {
  mode: "future_voice",
  acceptsAudio: false,
  feedbackScope: ["relevance", "clarity", "structure", "evidence_use", "conciseness", "completeness"],
  prohibitedAssessments: ["accent", "appearance", "protected_characteristics", "personality_stereotypes", "emotion_from_voice_or_video"]
};

export const INTERVIEW_PROVIDER_TIMEOUT_MS = 18000;

const protectedAnalysisPattern = /\b(accent|appearance|race|gender|religion|disability|age|marital|ethnicity|nationality|pregnan|emotion from voice|facial|attractiveness|personality stereotype)\b/i;
const stopWords = new Set(["and", "the", "for", "with", "that", "this", "your", "you", "role", "job", "must", "required", "preferred", "les", "des", "pour", "avec", "dans"]);

function clean(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export async function withInterviewProviderTimeout<T>(operation: Promise<T>, timeoutMs = INTERVIEW_PROVIDER_TIMEOUT_MS): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new InterviewPrepError("Interview provider timeout.", "Interview preparation took too long. Please try again.", 504)), timeoutMs);
  });
  try {
    return await Promise.race([operation, timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export function normalizeInterviewProviderOutput(output: unknown): InterviewPreparationProviderResult {
  if (!output || typeof output !== "object") return {};
  const record = output as Record<string, unknown>;
  return {
    questions: Array.isArray(record.questions) ? record.questions.filter((item) => item && typeof item === "object") as InterviewPrepQuestion[] : undefined,
    starStories: Array.isArray(record.starStories) ? record.starStories.filter((item) => item && typeof item === "object") as StarStory[] : undefined,
    gapResponses: Array.isArray(record.gapResponses) ? record.gapResponses.filter((item) => item && typeof item === "object") as GapResponse[] : undefined,
    employerQuestions: Array.isArray(record.employerQuestions) ? record.employerQuestions.filter((item) => item && typeof item === "object") as EmployerQuestion[] : undefined
  };
}

function words(value: string) {
  return clean(value).toLowerCase().split(/[^a-z0-9À-ÿ]+/i).filter((word) => word.length > 2 && !stopWords.has(word));
}

function overlap(left: string, right: string) {
  const tokens = new Set(words(left));
  if (!tokens.size) return 0;
  const rightTokens = new Set(words(right));
  return Array.from(tokens).filter((word) => rightTokens.has(word)).length / tokens.size;
}

function evidenceRef(item: ProfileMatchEvidence): InterviewEvidenceReference {
  return {
    canonicalEntityType: item.canonicalEntityType,
    canonicalEntityId: item.canonicalEntityId,
    label: item.label,
    evidenceText: item.evidenceText,
    confidence: item.confidence,
    reviewStatus: item.reviewStatus
  };
}

function profileFallbackEvidence(profile: CanonicalProfessionalIdentity): InterviewEvidenceReference[] {
  const items: InterviewEvidenceReference[] = [];
  const summary = valueText(profile.professionalProfile.professionalSummary) || valueText(profile.professionalProfile.headline);
  if (summary) items.push({ canonicalEntityType: "professional_profile", canonicalEntityId: "professional-summary", label: "Professional profile", evidenceText: summary, confidence: profile.confidence.overall, reviewStatus: "provisionally_accepted" });
  for (const skill of profile.skills.slice(0, 8)) {
    const text = valueText(skill.canonicalName);
    if (text && skill.status !== "archived") items.push({ canonicalEntityType: "skill", canonicalEntityId: skill.id, label: "Skill", evidenceText: text, confidence: skill.confidence, reviewStatus: skill.status });
  }
  for (const employment of profile.employment.slice(0, 4)) {
    const text = [
      valueText(employment.canonicalTitle),
      valueText(employment.employer),
      ...employment.responsibilities.map((item) => valueText(item.statement)),
      ...employment.achievements.map((item) => valueText(item.statement))
    ].filter(Boolean).join(" ");
    if (text && employment.status !== "archived") items.push({ canonicalEntityType: "employment", canonicalEntityId: employment.id, label: [valueText(employment.canonicalTitle), valueText(employment.employer)].filter(Boolean).join(" at ") || "Employment", evidenceText: text, confidence: employment.confidence, reviewStatus: employment.status });
  }
  return items.filter((item) => !protectedAnalysisPattern.test(item.evidenceText));
}

function evidenceFor(requirementText: string, match: ProfileJobMatchAnalysis, profile: CanonicalProfessionalIdentity) {
  const matched = match.requirements
    .flatMap((item) => item.evidence)
    .map(evidenceRef)
    .filter((item, index, list) => item.evidenceText && list.findIndex((other) => other.canonicalEntityId === item.canonicalEntityId) === index)
    .map((item) => ({ item, score: overlap(requirementText, item.evidenceText) * (item.confidence ?? 0.6) }))
    .filter((item) => item.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.item);
  return matched.length ? matched : profileFallbackEvidence(profile).slice(0, 3);
}

function categoryForRequirement(requirement: StructuredJobRequirement): InterviewQuestionCategory {
  if (requirement.type === "technical" || requirement.type === "skill" || requirement.type === "certification" || requirement.type === "licence") return "technical";
  if (requirement.type === "behavioural") return "behavioural";
  if (requirement.type === "industry") return "industry";
  if (requirement.type === "availability") return "availability";
  if (requirement.type === "experience") return "experience";
  return "role_specific";
}

function question(input: {
  id: string;
  category: InterviewQuestionCategory;
  question: string;
  source: InterviewPrepQuestion["source"];
  sourceId?: string;
  whyAsked: string;
  evidence: InterviewEvidenceReference[];
  claimsToAvoid?: string[];
}): InterviewPrepQuestion {
  return {
    id: input.id,
    category: input.category,
    question: input.question,
    source: input.source,
    sourceId: input.sourceId,
    whyAsked: input.whyAsked,
    evidenceToUse: input.evidence,
    answerStructure: ["Answer directly", "Use one confirmed example", "Explain your action", "End with relevance to this role"],
    pointsToInclude: input.evidence.slice(0, 3).map((item) => item.label),
    claimsToAvoid: input.claimsToAvoid ?? ["Do not claim experience that is not confirmed in your Professional Identity.", "Do not exaggerate seniority, dates, tools, qualifications, licences or outcomes."],
    practiceResponse: ""
  };
}

function targetedCvClaims(content: unknown) {
  const seen = new Set<string>();
  const results: string[] = [];
  const visit = (value: unknown) => {
    if (results.length >= 8) return;
    if (typeof value === "string") {
      const text = clean(value);
      if (text.length > 30 && !seen.has(text) && !protectedAnalysisPattern.test(text)) {
        seen.add(text);
        results.push(text);
      }
      return;
    }
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") Object.values(value).forEach(visit);
  };
  visit(content);
  return results;
}

export function buildInterviewQuestions(input: {
  job: SemanticJobUnderstanding;
  match: ProfileJobMatchAnalysis;
  profile: CanonicalProfessionalIdentity;
  targetedCvContent?: unknown;
  interviewType: InterviewType;
}) {
  const role = input.job.title || "this role";
  const organization = input.job.organization || "the organization";
  const questions: InterviewPrepQuestion[] = [
    question({
      id: "introduction-career-direction",
      category: "introduction",
      question: `Tell us about yourself and why your background fits ${role}.`,
      source: "application_stage",
      whyAsked: "Interviewers often start by checking whether your career story connects to the target role.",
      evidence: profileFallbackEvidence(input.profile).slice(0, 3)
    }),
    question({
      id: "motivation-organization-role",
      category: "motivation",
      question: `Why are you interested in ${role}${organization ? ` at ${organization}` : ""}?`,
      source: "application_stage",
      whyAsked: "This checks whether you understand the role and can explain a truthful motivation.",
      evidence: evidenceFor(input.job.summary, input.match, input.profile)
    })
  ];

  for (const responsibility of input.job.responsibilities.slice(0, 4)) {
    questions.push(question({
      id: `responsibility-${responsibility.id}`,
      category: "role_specific",
      question: `How would you approach this responsibility: ${responsibility.text}?`,
      source: "job_responsibility",
      sourceId: responsibility.id,
      whyAsked: "This responsibility appears in the job advert, so the interviewer may test how you would handle it.",
      evidence: evidenceFor(responsibility.text, input.match, input.profile)
    }));
  }

  for (const requirement of input.job.requirements.filter((item) => item.importance === "mandatory").slice(0, 5)) {
    questions.push(question({
      id: `mandatory-${requirement.id}`,
      category: categoryForRequirement(requirement),
      question: `What evidence can you give that you meet this requirement: ${requirement.sourceText}?`,
      source: "mandatory_requirement",
      sourceId: requirement.id,
      whyAsked: "This is a mandatory requirement, so your answer should use confirmed evidence only.",
      evidence: evidenceFor(requirement.sourceText, input.match, input.profile)
    }));
  }

  for (const requirement of input.job.requirements.filter((item) => item.importance === "preferred").slice(0, 3)) {
    questions.push(question({
      id: `preferred-${requirement.id}`,
      category: categoryForRequirement(requirement),
      question: `How close is your experience to this preferred requirement: ${requirement.sourceText}?`,
      source: "preferred_requirement",
      sourceId: requirement.id,
      whyAsked: "Preferred requirements can strengthen your interview if positioned honestly.",
      evidence: evidenceFor(requirement.sourceText, input.match, input.profile)
    }));
  }

  for (const gap of input.match.gaps.slice(0, 3)) {
    questions.push(question({
      id: `gap-${gap.id}`,
      category: "development_area",
      question: `How would you respond if asked about this gap: ${gap.title}?`,
      source: "gap",
      sourceId: gap.id,
      whyAsked: "PATHZY found a gap or unconfirmed requirement. Prepare an honest response before the interview.",
      evidence: profileFallbackEvidence(input.profile).slice(0, 2),
      claimsToAvoid: ["Do not say you already meet the requirement unless it is confirmed.", "Do not invent training, qualifications, projects or employer experience."]
    }));
  }

  targetedCvClaims(input.targetedCvContent).slice(0, 3).forEach((claim, index) => {
    questions.push(question({
      id: `targeted-cv-claim-${index + 1}`,
      category: "experience",
      question: `Your targeted CV mentions: "${claim}". Can you explain the real example behind it?`,
      source: "targeted_cv_claim",
      whyAsked: "Interviewers may ask you to expand on a claim from your CV.",
      evidence: evidenceFor(claim, input.match, input.profile)
    }));
  });

  if (input.interviewType === "technical") {
    questions.push(question({ id: "technical-problem-solving", category: "technical", question: "Walk through how you would solve a practical problem from this role.", source: "application_stage", whyAsked: "Technical interviews test your reasoning, not just memorized answers.", evidence: evidenceFor(input.job.requirements.map((item) => item.sourceText).join(" "), input.match, input.profile) }));
  }
  if (input.interviewType === "behavioural" || input.interviewType === "panel") {
    questions.push(question({ id: "behavioural-team-challenge", category: "behavioural", question: "Tell us about a time you handled a challenge with other people.", source: "application_stage", whyAsked: "Behavioural interviews test how you work, communicate and learn from situations.", evidence: profileFallbackEvidence(input.profile).slice(0, 3) }));
  }
  return questions.slice(0, 14);
}

export function buildStarStories(profile: CanonicalProfessionalIdentity, match: ProfileJobMatchAnalysis): StarStory[] {
  const evidence = profileFallbackEvidence(profile);
  const stories = profile.employment.slice(0, 4).flatMap((employment, index) => {
    const responsibility = employment.responsibilities.map((item) => valueText(item.statement)).find(Boolean);
    const achievement = employment.achievements.map((item) => valueText(item.statement)).find(Boolean);
    const role = valueText(employment.canonicalTitle) || "role";
    const employer = valueText(employment.employer) || "an employer";
    if (!responsibility && !achievement) return [];
    return [{
      id: `star-employment-${employment.id || index}`,
      title: `${role} at ${employer}`,
      sourceCanonicalEntityIds: [employment.id],
      situation: `In ${role}${employer ? ` at ${employer}` : ""}, describe the real context briefly.`,
      task: responsibility || "Explain the responsibility you were trusted with.",
      action: achievement || responsibility || "Explain the practical actions you personally took.",
      result: achievement ? "Share the honest outcome, learning, improvement, or measurable result." : "Share what changed, what you learned, or how the task was completed.",
      evidenceToUse: evidence.filter((item) => item.canonicalEntityId === employment.id || overlap(role, item.evidenceText) > 0.08).slice(0, 3),
      claimsToAvoid: ["Do not add outcomes that are not confirmed.", "Do not claim sole ownership of team results unless that is accurate."]
    }];
  });
  if (stories.length) return stories;
  return match.requirements.flatMap((requirement, index) => requirement.evidence[0] ? [{
    id: `star-evidence-${requirement.requirementId || index}`,
    title: requirement.evidence[0].label,
    sourceCanonicalEntityIds: [requirement.evidence[0].canonicalEntityId],
    situation: "Use the real context where this evidence happened.",
    task: `Connect the example to: ${requirement.requirementText}`,
    action: requirement.evidence[0].evidenceText,
    result: "Explain the honest result or learning without inventing metrics.",
    evidenceToUse: [evidenceRef(requirement.evidence[0])],
    claimsToAvoid: ["Do not turn transferable evidence into direct experience if it was not direct."]
  }] : []).slice(0, 3);
}

export function buildGapResponses(match: ProfileJobMatchAnalysis, profile: CanonicalProfessionalIdentity): GapResponse[] {
  const fallback = profileFallbackEvidence(profile).slice(0, 3);
  return [...match.gaps, ...match.blockers, ...match.uncertainties].slice(0, 8).map((gap, index) => ({
    id: `gap-response-${gap.id || index}`,
    type: gap.title.toLowerCase().includes("education") || gap.title.toLowerCase().includes("qualification") ? "qualification_uncertainty" : gap.title.toLowerCase().includes("experience") ? "limited_experience" : "missing_skill",
    gap: gap.title,
    honestPositioning: `Acknowledge this directly, then explain the closest confirmed evidence you do have. Do not claim the missing requirement as completed.`,
    transferableEvidence: fallback,
    claimsToAvoid: ["Do not hide the gap.", "Do not invent certificates, tools, years of experience, licences or direct industry exposure."]
  }));
}

export function buildEmployerQuestions(job: SemanticJobUnderstanding): EmployerQuestion[] {
  const topResponsibility = job.responsibilities[0]?.text;
  const topRequirement = job.requirements[0]?.sourceText;
  return [
    { id: "employer-priorities", category: "priorities", question: `What would be the most important priority for this role in the first 90 days?`, rationale: "This helps you understand what success looks like beyond the advert." },
    { id: "employer-team", category: "team", question: `Who would this role work with most closely day to day?`, rationale: "This clarifies team context without repeating the advert." },
    { id: "employer-success", category: "success_measures", question: `How will success be measured for this position?`, rationale: "This shows you are thinking about outcomes." },
    { id: "employer-systems", category: "systems", question: topRequirement ? `Which systems, tools or processes are most important for ${topRequirement}?` : "Which systems or tools would I use most often?", rationale: "This helps you prepare for practical expectations." },
    { id: "employer-development", category: "development", question: `What learning or development support is available for someone growing in this role?`, rationale: "This asks about growth without overpromising current ability." },
    { id: "employer-challenges", category: "challenges", question: topResponsibility ? `What usually makes ${topResponsibility} challenging in this team?` : "What are the main challenges someone in this role should prepare for?", rationale: "This uncovers realistic job context." },
    { id: "employer-next-steps", category: "next_steps", question: `What are the next steps after this interview?`, rationale: "This closes the interview professionally." }
  ];
}

function buildContent(prep: Pick<InterviewPrepRecord, "role" | "company" | "interviewType" | "questions" | "starStories" | "gapResponses" | "employerQuestions">) {
  return [
    `Interview Preparation: ${prep.role}${prep.company ? ` at ${prep.company}` : ""}`,
    `Interview type: ${prep.interviewType}`,
    "",
    "Practice Questions",
    ...prep.questions.map((item, index) => `${index + 1}. ${item.question}\nWhy: ${item.whyAsked}\nEvidence: ${item.evidenceToUse.map((evidence) => evidence.label).join(", ") || "Confirm evidence first."}`),
    "",
    "STAR Stories",
    ...prep.starStories.map((story) => `${story.title}\nS: ${story.situation}\nT: ${story.task}\nA: ${story.action}\nR: ${story.result}`),
    "",
    "Questions for the Employer",
    ...prep.employerQuestions.map((item) => `- ${item.question}`)
  ].join("\n");
}

function rowToPrep(row: any): InterviewPrepRecord {
  return {
    id: row.id,
    userId: row.user_id,
    applicationId: row.application_id ?? undefined,
    jobUnderstandingId: row.job_understanding_id ?? undefined,
    jobUnderstandingVersion: row.job_understanding_version ?? undefined,
    jobMatchAnalysisId: row.job_match_analysis_id ?? undefined,
    canonicalProfileId: row.canonical_profile_id ?? undefined,
    canonicalProfileVersion: row.canonical_profile_version ?? undefined,
    targetedCvDocumentId: row.targeted_cv_document_id ?? undefined,
    role: row.role,
    company: row.company ?? undefined,
    language: row.language ?? "english",
    interviewType: row.interview_type ?? "unknown",
    questions: row.questions_json ?? [],
    starStories: row.star_stories_json ?? [],
    gapResponses: row.gap_responses_json ?? [],
    employerQuestions: row.employer_questions_json ?? [],
    practiceResponses: row.practice_responses_json ?? [],
    feedback: row.feedback_json ?? [],
    status: row.status ?? (row.completed ? "completed" : "draft"),
    completed: Boolean(row.completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowToJobUnderstanding(row: any): SemanticJobUnderstanding {
  return {
    id: row.id,
    userId: row.user_id,
    jobImportId: row.job_import_id,
    versionNumber: row.version_number ?? 1,
    status: row.status,
    language: row.language,
    title: row.job_title,
    organization: row.organization ?? undefined,
    location: row.location ?? undefined,
    employmentType: row.employment_type ?? undefined,
    workArrangement: row.work_arrangement ?? undefined,
    summary: row.summary,
    responsibilities: row.responsibilities_json ?? [],
    requirements: row.requirements_json ?? [],
    applicationDetails: row.application_details_json ?? {},
    warnings: row.warnings_json ?? [],
    overallConfidence: Number(row.overall_confidence ?? 0),
    sourceEvidence: row.source_evidence_json ?? [],
    systemExtraction: row.system_extraction_json ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowToMatch(row: any): ProfileJobMatchAnalysis {
  return {
    id: row.id,
    userId: row.user_id,
    jobUnderstandingId: row.job_understanding_id,
    jobUnderstandingVersion: row.job_understanding_version,
    canonicalProfileId: row.canonical_profile_id,
    canonicalProfileVersion: row.canonical_profile_version,
    status: row.status,
    requirements: row.requirement_matches_json ?? [],
    strengths: row.strengths_json ?? [],
    partialMatches: row.partial_matches_json ?? [],
    gaps: row.gaps_json ?? [],
    uncertainties: row.uncertainties_json ?? [],
    blockers: row.blockers_json ?? [],
    fitScore: row.fit_score ?? undefined,
    fitBand: row.fit_band,
    analysisConfidence: Number(row.analysis_confidence ?? 0),
    readiness: row.readiness,
    scoreExplanation: row.score_explanation_json ?? { strongEvidence: [], concerns: [], methodology: "" },
    recommendations: row.recommendations_json ?? [],
    clarificationQuestions: row.clarification_questions_json ?? [],
    targetedCvRoute: row.targeted_cv_route,
    scoringVersion: row.scoring_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function loadApplicationContext(supabase: Supabase, userId: string, applicationId: string) {
  const { data: application, error } = await supabase.from("employment_applications").select("*").eq("id", applicationId).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!application) throw new InterviewPrepError("Application not found.", "We could not find this application for your account.", 404);
  if (!application.job_understanding_id || !application.job_match_analysis_id || !application.canonical_profile_id) {
    throw new InterviewPrepError("Application is not ready for job-specific prep.", "Prepare this application through Job Intelligence first, then create interview preparation.", 400);
  }
  const [{ data: jobRow }, { data: matchRow }, profile, targetedCv] = await Promise.all([
    supabase.from("job_understandings").select("*").eq("id", application.job_understanding_id).eq("user_id", userId).maybeSingle(),
    supabase.from("job_match_analyses").select("*").eq("id", application.job_match_analysis_id).eq("user_id", userId).maybeSingle(),
    getOrCreateCanonicalProfile(supabase, userId),
    application.targeted_cv_document_id ? loadProfessionalDocument(supabase, { userId, documentId: application.targeted_cv_document_id }) : Promise.resolve(null)
  ]);
  if (!jobRow || !matchRow) throw new InterviewPrepError("Job intelligence is missing.", "Refresh the job match before creating interview preparation.", 404);
  return { application, job: rowToJobUnderstanding(jobRow), match: rowToMatch(matchRow), profile, targetedCv };
}

export async function createApplicationInterviewPreparation(supabase: Supabase, userId: string, input: { applicationId: string; interviewType?: InterviewType; language?: "english" | "french" }) {
  const context = await loadApplicationContext(supabase, userId, input.applicationId);
  const interviewType = INTERVIEW_TYPES.includes(input.interviewType ?? "unknown") ? input.interviewType ?? "unknown" : "unknown";
  const questions = buildInterviewQuestions({ job: context.job, match: context.match, profile: context.profile, targetedCvContent: context.targetedCv?.content, interviewType });
  const starStories = buildStarStories(context.profile, context.match);
  const gapResponses = buildGapResponses(context.match, context.profile);
  const employerQuestions = buildEmployerQuestions(context.job);
  const now = new Date().toISOString();
  const content = buildContent({ role: context.application.role, company: context.application.company_name, interviewType, questions, starStories, gapResponses, employerQuestions });
  const { data, error } = await supabase
    .from("interview_preps")
    .insert({
      user_id: userId,
      application_id: context.application.id,
      job_understanding_id: context.job.id,
      job_understanding_version: context.job.versionNumber ?? context.match.jobUnderstandingVersion,
      job_match_analysis_id: context.match.id,
      canonical_profile_id: context.profile.id,
      canonical_profile_version: context.profile.version,
      targeted_cv_document_id: context.application.targeted_cv_document_id ?? null,
      role: context.application.role,
      company: context.application.company_name,
      language: input.language ?? (context.job.language === "fr" ? "french" : "english"),
      interview_type: interviewType,
      questions_json: questions,
      star_stories_json: starStories,
      gap_responses_json: gapResponses,
      employer_questions_json: employerQuestions,
      practice_responses_json: [],
      feedback_json: [],
      status: "draft",
      content,
      updated_at: now
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowToPrep(data);
}

export function assessPracticeAnswer(input: { question: InterviewPrepQuestion; answer: string; evidenceChecklist: string[] }): InterviewFeedback {
  const answer = clean(input.answer);
  const evidenceText = input.question.evidenceToUse.map((item) => item.evidenceText).join(" ");
  const unsupportedClaims = protectedAnalysisPattern.test(answer)
    ? ["Remove references to protected characteristics, accent, appearance, personality stereotypes or emotion from voice/video."]
    : input.question.claimsToAvoid.filter((claim) => overlap(claim, answer) > 0.12);
  const evidenceUse = input.evidenceChecklist.length ? Math.min(100, 45 + input.evidenceChecklist.length * 18) : Math.round(overlap(answer, evidenceText) * 100);
  return {
    questionId: input.question.id,
    relevance: Math.min(100, Math.max(20, Math.round(overlap(answer, input.question.question) * 80) + 20)),
    clarity: answer.length > 80 ? 78 : answer.length > 20 ? 62 : 35,
    structure: /situation|task|action|result|because|for example/i.test(answer) ? 82 : 48,
    evidenceUse,
    conciseness: answer.length <= 900 ? 84 : answer.length <= 1400 ? 62 : 35,
    completeness: input.question.pointsToInclude.filter((point) => answer.toLowerCase().includes(point.toLowerCase().split(" ")[0] ?? "")).length ? 76 : 52,
    unsupportedClaims,
    safeNotes: [
      "Feedback checks relevance, clarity, structure, evidence use, conciseness and completeness only.",
      "PATHZY does not assess accent, appearance, protected characteristics, personality stereotypes, or emotion from voice or video."
    ],
    updatedAt: new Date().toISOString()
  };
}

export async function updateInterviewPracticeResponse(supabase: Supabase, userId: string, input: { prepId: string; questionId: string; answer: string; notes?: string; selfRating?: number; evidenceChecklist?: string[] }) {
  const { data: existing, error } = await supabase.from("interview_preps").select("*").eq("id", input.prepId).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!existing) throw new InterviewPrepError("Interview prep not found.", "We could not find this interview preparation.", 404);
  const prep = rowToPrep(existing);
  const question = prep.questions.find((item) => item.id === input.questionId);
  if (!question) throw new InterviewPrepError("Question not found.", "We could not find that practice question.", 404);
  const response: PracticeResponse = {
    questionId: input.questionId,
    answer: clean(input.answer),
    notes: clean(input.notes),
    selfRating: Number.isFinite(input.selfRating ?? NaN) ? Math.max(1, Math.min(5, Number(input.selfRating))) : undefined,
    evidenceChecklist: Array.from(new Set((input.evidenceChecklist ?? []).map(clean).filter(Boolean))),
    updatedAt: new Date().toISOString()
  };
  const feedback = assessPracticeAnswer({ question, answer: response.answer, evidenceChecklist: response.evidenceChecklist });
  const practiceResponses = [...prep.practiceResponses.filter((item) => item.questionId !== input.questionId), response];
  const feedbackItems = [...prep.feedback.filter((item) => item.questionId !== input.questionId), feedback];
  const { data, error: updateError } = await supabase
    .from("interview_preps")
    .update({
      practice_responses_json: practiceResponses,
      feedback_json: feedbackItems,
      status: "in_progress",
      content: buildContent({ role: prep.role, company: prep.company, interviewType: prep.interviewType, questions: prep.questions, starStories: prep.starStories, gapResponses: prep.gapResponses, employerQuestions: prep.employerQuestions }),
      updated_at: new Date().toISOString()
    })
    .eq("id", input.prepId)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (updateError) throw updateError;
  return rowToPrep(data);
}

export async function listInterviewPrepApplications(supabase: Supabase, userId: string) {
  const { data, error } = await supabase
    .from("employment_applications")
    .select("id, company_name, role, status, job_understanding_id, job_match_analysis_id, targeted_cv_document_id, interview_date, updated_at")
    .eq("user_id", userId)
    .neq("status", "archived")
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}
