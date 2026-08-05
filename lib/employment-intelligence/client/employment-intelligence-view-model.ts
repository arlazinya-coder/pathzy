import { actionByCode } from "../actions";
import { mergeDuplicateEvidenceRecords } from "../domain/collection-invariants";
import { coreBarrierDefinitions, type BarrierControlClassification, type DetectedBarrier } from "../domain/barriers";
import { careerPlanHorizons, careerPlanStepStates, type CareerPlan, type CareerPlanHorizon, type CareerPlanStep } from "../domain/career-plan";
import type { ConfidenceAssessment } from "../domain/confidence";
import type { EvidenceRecord } from "../domain/evidence";
import type { NextBestAction } from "../domain/next-best-action";
import type { ReadinessBand, ReadinessDimensionAssessment } from "../domain/readiness";

export type EmploymentIntelligenceLanguage = "en" | "fr";

export type EmploymentActionViewModel = {
  code: string;
  title: string;
  plainTitle: string;
  explanation: string;
  reason: string;
  whySentence: string;
  expectedOutcome: string;
  effort: string;
  impact: string;
  href: string;
  state: "ready" | "blocked" | "completed" | "skipped" | "in_progress" | "stale" | "updating" | "error" | "unavailable";
  stateLabel: string;
  blocker?: string;
  confidenceLabel: string;
  supportDestination: string;
  why: string[];
};

export type EmploymentHomeViewModel = {
  status: "not_generated" | "current" | "stale" | "recomputing" | "failed" | "unavailable";
  freshnessLabel: string;
  freshnessDescription: string;
  updatedAtLabel: string;
  primaryAction: EmploymentActionViewModel | null;
  secondaryActions: EmploymentActionViewModel[];
  position: {
    readinessBand: string;
    confidenceLabel: string;
    strongestAssets: string[];
    barriers: BarrierViewModel[];
    suitablePathway: string;
    supportIntensity: string;
  };
  careerPlan: CareerPlanPreviewViewModel | null;
  dimensions: ReadinessDimensionViewModel[];
  highGuidance: boolean;
};

export type BarrierViewModel = {
  code: string;
  title: string;
  explanation: string;
  controlLabel: string;
  route: string;
  severity: string;
};

export type ReadinessDimensionViewModel = {
  key: string;
  name: string;
  band: string;
  explanation: string;
  confidenceLabel: string;
  missingInformation: string[];
  recommendedAction?: string;
};

export type CareerPlanPreviewViewModel = {
  horizon: string;
  progressLabel: string;
  completedSteps: number;
  totalSteps: number;
  nextSteps: Array<{
    id: string;
    title: string;
    explanation: string;
    state: string;
    horizon: string;
    href: string;
    dependency?: string;
  }>;
  immediateGoal: string;
  longTermGoal: string;
};

export type DetailedEmploymentIntelligence = {
  status?: string;
  safeError?: {
    code?: string;
    message?: string;
    retryable?: boolean;
    status?: number;
  };
  intelligence?: {
    overallReadiness?: {
      readinessBand?: ReadinessBand;
      recommendedPathway?: string;
      supportIntensity?: string;
      confidence?: { overall?: number; level?: string };
    };
    supportIntensity?: string;
    strengths?: EvidenceRecord[];
    barriers?: DetectedBarrier[];
    readinessDimensions?: ReadinessDimensionAssessment[];
    nextBestAction?: NextBestAction;
    secondaryActions?: NextBestAction[];
  };
  actions?: unknown;
  careerPlan?: unknown;
  updatedAt?: string;
};

const readinessLabels: Record<EmploymentIntelligenceLanguage, Record<string, string>> = {
  en: {
    NOT_ASSESSED: "Not yet assessed",
    NEEDS_FOUNDATION: "Needs foundation",
    DEVELOPING: "Developing",
    READY_WITH_SUPPORT: "Ready with support",
    READY: "Ready",
    STRONG: "Strong"
  },
  fr: {
    NOT_ASSESSED: "Pas encore évalué",
    NEEDS_FOUNDATION: "Base à consolider",
    DEVELOPING: "En développement",
    READY_WITH_SUPPORT: "Prêt avec soutien",
    READY: "Prêt",
    STRONG: "Solide"
  }
};

const actionStateLabels: Record<EmploymentIntelligenceLanguage, Record<string, string>> = {
  en: { ready: "Ready to start", blocked: "Waiting for another step", completed: "Completed", skipped: "Skipped", in_progress: "In progress", stale: "Needs update", updating: "Updating", error: "Needs retry", unavailable: "Unavailable", NOT_STARTED: "Ready to start", IN_PROGRESS: "In progress", BLOCKED: "Waiting for another step", COMPLETED: "Completed", SKIPPED: "Skipped" },
  fr: { ready: "Prêt à commencer", blocked: "En attente d'une autre étape", completed: "Terminé", skipped: "Ignoré", in_progress: "En cours", stale: "À mettre à jour", updating: "Mise à jour", error: "À réessayer", unavailable: "Indisponible", NOT_STARTED: "Prêt à commencer", IN_PROGRESS: "En cours", BLOCKED: "En attente d'une autre étape", COMPLETED: "Terminé", SKIPPED: "Ignoré" }
};

const horizonLabels: Record<EmploymentIntelligenceLanguage, Record<CareerPlanHorizon | string, string>> = {
  en: { TODAY: "Today", THIS_WEEK: "This week", THIS_MONTH: "This month", NEXT_3_MONTHS: "Next 3 months", LONGER_TERM: "Longer-term" },
  fr: { TODAY: "Aujourd'hui", THIS_WEEK: "Cette semaine", THIS_MONTH: "Ce mois-ci", NEXT_3_MONTHS: "Les 3 prochains mois", LONGER_TERM: "Plus long terme" }
};

const controlLabels: Record<EmploymentIntelligenceLanguage, Record<BarrierControlClassification, string>> = {
  en: { USER_CONTROLLED: "You can act on this", PARTLY_CONTROLLED: "You can partly influence this", EXTERNAL: "External factor" },
  fr: { USER_CONTROLLED: "Vous pouvez agir dessus", PARTLY_CONTROLLED: "Vous pouvez l'influencer en partie", EXTERNAL: "Facteur externe" }
};

const supportIntensityLabels: Record<EmploymentIntelligenceLanguage, Record<string, string>> = {
  en: { STANDARD: "Standard guidance", STRUCTURED_GUIDANCE: "Step-by-step guidance", HIGH_SUPPORT: "Extra guidance", HUMAN_SUPPORT_RECOMMENDED: "Human support recommended", HIGH_GUIDANCE: "Extra guidance", ASSISTED: "Assisted guidance" },
  fr: { STANDARD: "Guidage standard", STRUCTURED_GUIDANCE: "Guidage étape par étape", HIGH_SUPPORT: "Soutien renforcé", HUMAN_SUPPORT_RECOMMENDED: "Soutien humain recommandé", HIGH_GUIDANCE: "Soutien renforcé", ASSISTED: "Guidage accompagné" }
};

const pathwayLabels: Record<EmploymentIntelligenceLanguage, Record<string, string>> = {
  en: {
    SKILLED_EMPLOYMENT: "Skilled employment pathway",
    PROFESSIONAL_EMPLOYMENT: "Professional employment pathway",
    ENTRY_LEVEL_EMPLOYMENT: "Entry-level employment pathway",
    TEMPORARY_WORK: "Temporary work pathway",
    PART_TIME_WORK: "Part-time work pathway",
    INTERNSHIP: "Internship pathway",
    LEARNERSHIP: "Learnership pathway",
    GRADUATE_PROGRAMME: "Graduate programme pathway",
    SKILLS_FIRST_TRANSITION: "Skills-first transition pathway",
    CAREER_CHANGE: "Career-change pathway",
    QUALIFICATION_RECOGNITION: "Qualification recognition pathway",
    LICENCE_OR_CERTIFICATE: "Licence or certificate pathway",
    INFORMAL_OR_COMMUNITY_WORK: "Informal or community work pathway",
    FREELANCE_WORK: "Freelance work pathway"
  },
  fr: {
    SKILLED_EMPLOYMENT: "Parcours d'emploi qualifié",
    PROFESSIONAL_EMPLOYMENT: "Parcours professionnel",
    ENTRY_LEVEL_EMPLOYMENT: "Parcours d'entrée dans l'emploi",
    TEMPORARY_WORK: "Parcours de travail temporaire",
    PART_TIME_WORK: "Parcours de travail à temps partiel",
    INTERNSHIP: "Parcours de stage",
    LEARNERSHIP: "Parcours d'apprentissage",
    GRADUATE_PROGRAMME: "Parcours jeune diplômé",
    SKILLS_FIRST_TRANSITION: "Parcours de transition par les compétences",
    CAREER_CHANGE: "Parcours de reconversion",
    QUALIFICATION_RECOGNITION: "Parcours de reconnaissance des qualifications",
    LICENCE_OR_CERTIFICATE: "Parcours de licence ou certification",
    INFORMAL_OR_COMMUNITY_WORK: "Parcours d'expérience informelle ou communautaire",
    FREELANCE_WORK: "Parcours indépendant"
  }
};

const actionPresentationOverrides: Record<EmploymentIntelligenceLanguage, Record<string, { title?: string; explanation?: string; why: string }>> = {
  en: {
    PLAN_PRACTICAL_ACCESS: {
      title: "Plan around practical constraints",
      explanation: "Choose steps that fit your transport, internet, device or schedule.",
      why: "PATHZY recommends this because practical access may affect which opportunities are realistic right now."
    },
    CLARIFY_WORK_ELIGIBILITY: {
      title: "Clarify your work eligibility",
      explanation: "Confirm whether you currently have permission and documents to work.",
      why: "This helps PATHZY avoid recommending opportunities that may require eligibility you have not confirmed."
    },
    COMPLETE_PROFESSIONAL_IDENTITY: {
      title: "Complete your Professional Identity",
      explanation: "Add the remaining core information so PATHZY can guide you more accurately.",
      why: "Your recommendations become more reliable when your professional information is complete."
    }
  },
  fr: {
    PLAN_PRACTICAL_ACCESS: {
      title: "Planifier selon vos contraintes pratiques",
      explanation: "Choisissez des étapes adaptées à votre transport, internet, appareil ou emploi du temps.",
      why: "PATHZY recommande cela parce que l'accès pratique peut influencer les opportunités réalistes pour le moment."
    },
    CLARIFY_WORK_ELIGIBILITY: {
      title: "Clarifier votre autorisation de travail",
      explanation: "Confirmez si vous avez actuellement l'autorisation et les documents nécessaires pour travailler.",
      why: "Cela aide PATHZY à éviter de recommander des opportunités qui exigent une éligibilité non confirmée."
    },
    COMPLETE_PROFESSIONAL_IDENTITY: {
      title: "Compléter votre Identité Professionnelle",
      explanation: "Ajoutez les informations essentielles restantes afin que PATHZY puisse mieux vous guider.",
      why: "Vos recommandations deviennent plus fiables lorsque vos informations professionnelles sont complètes."
    }
  }
};

const reasonPresentation: Record<EmploymentIntelligenceLanguage, Record<string, string>> = {
  en: {
    "identity.incomplete": "Your recommendations become more reliable when your professional information is complete.",
    "source_of_truth.required": "PATHZY uses your Professional Identity as the source of truth for guidance.",
    "work_eligibility.uncertain": "This helps PATHZY avoid recommending opportunities that may require eligibility you have not confirmed.",
    "practical_constraints.support_not_judgement": "PATHZY recommends this because practical access may affect which opportunities are realistic right now.",
    access_shapes_workflow: "PATHZY can adapt your next steps to the access you have available."
  },
  fr: {
    "identity.incomplete": "Vos recommandations deviennent plus fiables lorsque vos informations professionnelles sont complètes.",
    "source_of_truth.required": "PATHZY utilise votre Identité Professionnelle comme source fiable pour vous guider.",
    "work_eligibility.uncertain": "Cela aide PATHZY à éviter de recommander des opportunités qui exigent une éligibilité non confirmée.",
    "practical_constraints.support_not_judgement": "PATHZY recommande cela parce que l'accès pratique peut influencer les opportunités réalistes pour le moment.",
    access_shapes_workflow: "PATHZY peut adapter vos prochaines étapes à l'accès dont vous disposez."
  }
};

function label(language: EmploymentIntelligenceLanguage, table: Record<EmploymentIntelligenceLanguage, Record<string, string>>, key?: string | null, fallback = "") {
  if (!key) return fallback;
  return table[language][key] ?? table.en[key] ?? (fallback || key.replaceAll("_", " ").toLowerCase());
}

function readableCode(value: string | null | undefined) {
  const clean = String(value ?? "").trim();
  if (!clean) return "";
  return clean
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function confidenceLabel(language: EmploymentIntelligenceLanguage, confidence?: { overall?: number; level?: string } | null) {
  const level = confidence?.level;
  if (level) return language === "fr" ? `Confiance ${level.toLowerCase()}` : `${level.toLowerCase()} confidence`;
  if (typeof confidence?.overall === "number") {
    if (confidence.overall >= 0.75) return language === "fr" ? "confiance solide" : "strong confidence";
    if (confidence.overall >= 0.45) return language === "fr" ? "confiance modérée" : "moderate confidence";
  }
  return language === "fr" ? "confiance à confirmer" : "confidence still being confirmed";
}

function appendActionQuery(route: string, action?: string) {
  if (!action) return route;
  const separator = route.includes("?") ? "&" : "?";
  return `${route}${separator}${action}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];
}

function actionPresentation(actionCode: string, language: EmploymentIntelligenceLanguage, reasonCodes: string[]) {
  const override = actionPresentationOverrides[language][actionCode] ?? actionPresentationOverrides.en[actionCode];
  const firstPresentedReason = reasonCodes.map((code) => reasonPresentation[language][code] ?? reasonPresentation.en[code]).find(Boolean);
  return {
    title: override?.title,
    explanation: override?.explanation,
    why: override?.why ?? firstPresentedReason ?? (language === "fr"
      ? "PATHZY recommande cette étape parce qu'elle soutient votre prochaine action utile."
      : "PATHZY recommends this because it supports your next useful step.")
  };
}

function safeEvidenceArray(value: unknown): EvidenceRecord[] {
  return Array.isArray(value) ? mergeDuplicateEvidenceRecords(value.filter((item): item is EvidenceRecord => isRecord(item))) : [];
}

function safeNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

const fallbackConfidence: ConfidenceAssessment = {
  level: "LOW",
  rationale: ["career_plan.safe_view_model_fallback"],
  inputCompleteness: 0,
  evidenceQuality: 0,
  ruleCertainty: 0,
  countryContextQuality: 0,
  recency: 0,
  conflictingInformation: []
};

function safeCareerPlanDiagnostic(reason: string, detail?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "development") return;
  console.warn("[employment-intelligence] career plan render fallback used", { reason, ...detail });
}

function actionStateFor(action: NextBestAction | null): EmploymentActionViewModel["state"] {
  if (!action) return "unavailable";
  const blockedBy = safeStringArray((action as { blockedBy?: unknown }).blockedBy);
  if (action.state === "BLOCKED" || blockedBy.length > 0) return "blocked";
  if (action.state === "ALREADY_COMPLETED") return "completed";
  if (action.state === "DEFERRED") return "skipped";
  return "ready";
}

function uniqueByCode<T>(items: T[] = [], keyFor: (item: T) => string | null | undefined) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = String(keyFor(item) ?? "").trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildEmploymentActionViewModel(action: NextBestAction | null | undefined, language: EmploymentIntelligenceLanguage): EmploymentActionViewModel | null {
  if (!action) return null;
  const actionCode = safeString((action as { actionCode?: unknown }).actionCode);
  if (!actionCode) return null;
  const registryAction = actionByCode(actionCode);
  const destination = isRecord((action as { destination?: unknown }).destination) ? (action as { destination: { route?: unknown; action?: unknown } }).destination : null;
  const route = safeString(destination?.route, registryAction?.destination.route ?? registryAction?.route ?? "/employment-center");
  const actionQuery = safeString(destination?.action, registryAction?.destination.action ?? undefined);
  const blockedBy = safeStringArray((action as { blockedBy?: unknown }).blockedBy);
  const supportingEvidence = safeEvidenceArray((action as { supportingEvidence?: unknown }).supportingEvidence);
  const reasonCodes = safeStringArray((action as { reasonCodes?: unknown }).reasonCodes);
  const state = actionStateFor(action);
  const presentation = actionPresentation(actionCode, language, reasonCodes);
  const title = presentation.title ?? safeString((action as { title?: unknown }).title, registryAction?.title ?? actionCode.replaceAll("_", " ").toLowerCase());
  const explanation = presentation.explanation ?? safeString((action as { plainLanguageExplanation?: unknown }).plainLanguageExplanation, registryAction?.plainLanguageExplanation ?? "");
  return {
    code: actionCode,
    title,
    plainTitle: title,
    explanation,
    reason: safeString((action as { reason?: unknown }).reason, registryAction?.plainLanguageExplanation ?? ""),
    whySentence: presentation.why,
    expectedOutcome: safeString((action as { expectedImpact?: unknown }).expectedImpact, registryAction?.completionCriteria?.[0] ?? ""),
    effort: safeString((action as { estimatedEffort?: unknown }).estimatedEffort, registryAction?.effort ?? "MEDIUM").replaceAll("_", " ").toLowerCase(),
    impact: safeString((action as { impact?: unknown }).impact, registryAction?.impact ?? "MEDIUM"),
    href: appendActionQuery(route, actionQuery),
    state,
    stateLabel: label(language, actionStateLabels, state, state),
    blocker: blockedBy[0],
    confidenceLabel: confidenceLabel(language, action.confidence),
    supportDestination: registryAction?.destination.route ?? route,
    why: [...reasonCodes, ...supportingEvidence.map((item) => item.subject || item.supportingField || item.id).filter(Boolean)]
      .map(readableCode)
      .filter(Boolean)
      .slice(0, 4)
  };
}

function normalizeCareerPlanStep(value: unknown, index: number): CareerPlanStep | null {
  if (!isRecord(value)) return null;
  const actionCode = safeString(value.actionCode);
  const registryAction = actionCode ? actionByCode(actionCode) : null;
  const id = safeString(value.id, safeString(value.stepId, actionCode || `legacy-career-plan-step-${index + 1}`));
  const title = safeString(value.title, safeString(value.action, registryAction?.title ?? "Review Career Plan step"));
  const reason = safeString(value.reason, registryAction?.plainLanguageExplanation ?? "PATHZY could not read every detail of this saved step. You can still review it safely.");
  const horizon = careerPlanHorizons.includes(value.horizon as CareerPlanHorizon) ? (value.horizon as CareerPlanHorizon) : "THIS_WEEK";
  const state = careerPlanStepStates.includes(value.state as CareerPlanStep["state"]) ? (value.state as CareerPlanStep["state"]) : "NOT_STARTED";
  const confidence = isRecord(value.confidence) ? (value.confidence as ConfidenceAssessment) : (registryAction?.confidence ?? fallbackConfidence);
  const supportRoute = safeString(value.supportRoute, registryAction?.destination.route ?? "/employment-center");
  if (!Array.isArray(value.evidence)) safeCareerPlanDiagnostic("missing_step_evidence", { stepId: id });
  return {
    id,
    stepId: safeString(value.stepId, id),
    actionCode: actionCode || undefined,
    horizon,
    action: safeString(value.action, title),
    title,
    titleKey: safeString(value.titleKey) || undefined,
    explanationKey: safeString(value.explanationKey) || undefined,
    reason,
    reasonCodes: safeStringArray(value.reasonCodes),
    pathzySupportFeature: safeString(value.pathzySupportFeature, supportRoute),
    dependency: safeString(value.dependency) || undefined,
    dependencies: safeStringArray(value.dependencies),
    dependencyCodes: safeStringArray(value.dependencyCodes),
    measurableOutcome: safeString(value.measurableOutcome, safeString(value.expectedOutcome, registryAction?.completionCriteria?.[0] ?? "Review this step.")),
    expectedOutcome: safeString(value.expectedOutcome, safeString(value.measurableOutcome, registryAction?.completionCriteria?.[0] ?? "Review this step.")),
    completionCriteria: safeStringArray(value.completionCriteria),
    supportRoute,
    state,
    urgency: safeString(value.urgency, registryAction?.urgency ?? "MEDIUM") as CareerPlanStep["urgency"],
    effort: safeString(value.effort, registryAction?.effort ?? "MEDIUM") as CareerPlanStep["effort"],
    evidence: safeEvidenceArray(value.evidence),
    confidence,
    sourceEngineVersion: safeString(value.sourceEngineVersion) || undefined
  };
}

export function normalizeCareerPlanForRendering(plan: unknown): CareerPlan | null {
  if (!isRecord(plan)) return null;
  const rawSteps = Array.isArray(plan.steps) ? plan.steps : [];
  if (!Array.isArray(plan.steps)) safeCareerPlanDiagnostic("missing_steps_array");
  const steps = uniqueByCode(
    rawSteps.map((step, index) => normalizeCareerPlanStep(step, index)).filter((step): step is CareerPlanStep => Boolean(step)),
    (step) => step.stepId ?? step.id ?? step.actionCode
  );
  const rawProgress = isRecord(plan.progress) ? plan.progress : null;
  const completedSteps = rawProgress ? safeNumber(rawProgress.completedSteps, steps.filter((step) => step.state === "COMPLETED").length) : steps.filter((step) => step.state === "COMPLETED").length;
  const totalSteps = rawProgress ? safeNumber(rawProgress.totalSteps, steps.length) : steps.length;
  return {
    ...(plan as Partial<CareerPlan>),
    generatedAt: safeString(plan.generatedAt, new Date(0).toISOString()),
    engineVersion: safeString(plan.engineVersion, "unknown"),
    supportIntensity: safeString(plan.supportIntensity, "STANDARD"),
    progress: { completedSteps, totalSteps },
    steps
  };
}

function barrierViewModels(barriers: DetectedBarrier[] = [], language: EmploymentIntelligenceLanguage): BarrierViewModel[] {
  return uniqueByCode(barriers, (barrier) => barrier.definitionCode).slice(0, 2).map((barrier) => {
    const definition = coreBarrierDefinitions.find((item) => item.code === barrier.definitionCode);
    return {
      code: barrier.definitionCode,
      title: definition?.title ?? barrier.definitionCode.replaceAll("_", " "),
      explanation: definition?.supportiveUserFacingWording ?? (language === "fr" ? "PATHZY vous aide à traiter ce point avec soutien." : "PATHZY will help you work through this supportively."),
      controlLabel: controlLabels[language][definition?.controlClassification ?? "PARTLY_CONTROLLED"],
      route: definition?.pathzySupportRoute ?? "/employment-center",
      severity: barrier.severity.toLowerCase()
    };
  });
}

function strengthLabels(strengths: EvidenceRecord[] = []) {
  return mergeDuplicateEvidenceRecords(strengths)
    .filter((item) => item.verifiedStatus !== "UNKNOWN")
    .map((item) => item.subject || item.id)
    .filter(Boolean)
    .slice(0, 3)
    .map((item) => readableCode(item));
}

function dimensionViewModels(dimensions: ReadinessDimensionAssessment[] = [], language: EmploymentIntelligenceLanguage): ReadinessDimensionViewModel[] {
  return uniqueByCode(dimensions, (dimension) => dimension.key).slice(0, 14).map((dimension) => ({
    key: dimension.key,
      name: readableCode(dimension.key),
    band: label(language, readinessLabels, dimension.band),
    explanation: dimension.explainabilityMessage,
    confidenceLabel: confidenceLabel(language, dimension.confidence),
    missingInformation: dimension.missingInformation.slice(0, 3),
      recommendedAction: dimension.recommendedActions[0] ? readableCode(dimension.recommendedActions[0]) : undefined
  }));
}

function careerPlanPreview(plan: unknown, language: EmploymentIntelligenceLanguage): CareerPlanPreviewViewModel | null {
  const normalizedPlan = normalizeCareerPlanForRendering(plan);
  if (!normalizedPlan) return null;
  const totalSteps = normalizedPlan.progress?.totalSteps ?? normalizedPlan.steps.length;
  const completedSteps = normalizedPlan.progress?.completedSteps ?? normalizedPlan.steps.filter((step) => step.state === "COMPLETED").length;
  const nextSteps = uniqueByCode(
    normalizedPlan.steps.filter((step) => step.state !== "COMPLETED" && step.state !== "SKIPPED"),
    (step) => step.stepId ?? step.id ?? step.actionCode
  )
    .slice(0, 3)
    .map((step: CareerPlanStep) => ({
      id: step.id,
      title: step.title ?? step.action,
      explanation: step.reason,
      state: label(language, actionStateLabels, step.state, readableCode(step.state)),
      horizon: horizonLabels[language][step.horizon] ?? step.horizon,
      href: step.supportRoute ?? actionByCode(step.actionCode ?? "")?.destination.route ?? "/employment-center",
      dependency: step.dependency ?? step.dependencies?.[0]
    }));
  const currentHorizon = nextSteps[0]?.horizon ?? horizonLabels[language].TODAY;
  return {
    horizon: currentHorizon,
    progressLabel: `${completedSteps}/${totalSteps}`,
    completedSteps,
    totalSteps,
    nextSteps,
    immediateGoal: normalizedPlan.immediateGoal ?? (language === "fr" ? "Terminer la prochaine action utile." : "Complete the next useful action."),
    longTermGoal: normalizedPlan.longTermGoal ?? (language === "fr" ? "Avancer vers un emploi durable." : "Move toward sustainable employment.")
  };
}

export function buildEmploymentHomeViewModel(detail: DetailedEmploymentIntelligence, language: EmploymentIntelligenceLanguage): EmploymentHomeViewModel {
  const intelligence = detail.intelligence;
  const actionSet = detail.actions as { primary?: NextBestAction; secondary?: NextBestAction[] } | null | undefined;
  const plan = detail.careerPlan;
  const primaryAction = buildEmploymentActionViewModel(actionSet?.primary ?? intelligence?.nextBestAction, language);
  const secondaryActions = uniqueByCode(actionSet?.secondary ?? intelligence?.secondaryActions ?? [], (action) => action.actionCode)
    .filter((action) => action.actionCode !== primaryAction?.code)
    .map((action) => buildEmploymentActionViewModel(action, language))
    .filter((action): action is EmploymentActionViewModel => Boolean(action))
    .slice(0, 3);
  const status = (detail.status as EmploymentHomeViewModel["status"]) ?? "not_generated";
  const readinessBand = intelligence?.overallReadiness?.readinessBand ?? "NOT_ASSESSED";
  const highGuidance = primaryAction?.code === "PRACTISE_WITH_COACH" || intelligence?.supportIntensity === "HIGH_GUIDANCE" || intelligence?.supportIntensity === "ASSISTED";
  return {
    status,
    freshnessLabel: status === "current"
      ? (language === "fr" ? "À jour" : "Up to date")
      : status === "stale"
        ? (language === "fr" ? "À mettre à jour" : "Needs update")
        : status === "unavailable"
          ? (language === "fr" ? "Configuration requise" : "Setup required")
          : status === "failed"
            ? (language === "fr" ? "À réessayer" : "Needs retry")
            : status === "recomputing"
              ? (language === "fr" ? "Mise à jour" : "Updating")
              : (language === "fr" ? "Pas encore généré" : "Not generated yet"),
    freshnessDescription: status === "stale"
      ? (language === "fr" ? "Votre profil a changé. PATHZY peut mettre à jour vos informations d'emploi." : "Your profile changed. PATHZY can update your employment insights.")
      : status === "unavailable"
        ? (language === "fr" ? "PATHZY ne peut pas encore charger les informations d'emploi sauvegardées. Aucune donnée personnelle n'a été perdue." : "PATHZY cannot load saved employment insights yet. No personal data has been lost.")
        : status === "failed"
          ? (language === "fr" ? "PATHZY n'a pas pu mettre à jour vos informations. Vos résultats précédents restent disponibles s'ils existent." : "PATHZY could not update your insights. Previous results remain available where they exist.")
          : status === "recomputing"
            ? (language === "fr" ? "PATHZY met à jour vos informations d'emploi. Les résultats précédents restent disponibles." : "PATHZY is updating your employment insights. Previous results remain available.")
      : status === "not_generated"
        ? (language === "fr" ? "Terminez le diagnostic pour générer vos informations d'emploi." : "Complete the diagnosis to generate your employment insights.")
        : (language === "fr" ? "Vos informations d'emploi sont disponibles." : "Your employment insights are available."),
    updatedAtLabel: detail.updatedAt ? new Date(detail.updatedAt).toLocaleString(language === "fr" ? "fr-FR" : "en-US") : "",
    primaryAction,
    secondaryActions,
    position: {
      readinessBand: label(language, readinessLabels, readinessBand),
      confidenceLabel: confidenceLabel(language, intelligence?.overallReadiness?.confidence),
      strongestAssets: strengthLabels(intelligence?.strengths),
      barriers: barrierViewModels(intelligence?.barriers, language),
      suitablePathway: intelligence?.overallReadiness?.recommendedPathway
        ? label(language, pathwayLabels, intelligence.overallReadiness.recommendedPathway, readableCode(intelligence.overallReadiness.recommendedPathway))
        : (language === "fr" ? "Parcours à confirmer" : "Pathway still being confirmed"),
      supportIntensity: label(language, supportIntensityLabels, String(intelligence?.supportIntensity ?? intelligence?.overallReadiness?.supportIntensity ?? "STANDARD"))
    },
    careerPlan: careerPlanPreview(plan, language),
    dimensions: dimensionViewModels(intelligence?.readinessDimensions, language),
    highGuidance
  };
}
