import { actionByCode } from "../actions";
import { coreBarrierDefinitions, type BarrierControlClassification, type DetectedBarrier } from "../domain/barriers";
import type { CareerPlan, CareerPlanHorizon, CareerPlanStep } from "../domain/career-plan";
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
  expectedOutcome: string;
  effort: string;
  impact: string;
  href: string;
  state: "ready" | "blocked" | "completed" | "skipped" | "in_progress" | "stale" | "updating" | "error" | "unavailable";
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
  en: { ready: "Ready", blocked: "Blocked", completed: "Completed", skipped: "Skipped", in_progress: "In progress", stale: "Needs update", updating: "Updating", error: "Needs retry", unavailable: "Unavailable" },
  fr: { ready: "Prêt", blocked: "Bloqué", completed: "Terminé", skipped: "Ignoré", in_progress: "En cours", stale: "À mettre à jour", updating: "Mise à jour", error: "À réessayer", unavailable: "Indisponible" }
};

const horizonLabels: Record<EmploymentIntelligenceLanguage, Record<CareerPlanHorizon | string, string>> = {
  en: { TODAY: "Today", THIS_WEEK: "This week", THIS_MONTH: "This month", NEXT_3_MONTHS: "Next 3 months", LONGER_TERM: "Longer-term" },
  fr: { TODAY: "Aujourd'hui", THIS_WEEK: "Cette semaine", THIS_MONTH: "Ce mois-ci", NEXT_3_MONTHS: "Les 3 prochains mois", LONGER_TERM: "Plus long terme" }
};

const controlLabels: Record<EmploymentIntelligenceLanguage, Record<BarrierControlClassification, string>> = {
  en: { USER_CONTROLLED: "You can act on this", PARTLY_CONTROLLED: "You can partly influence this", EXTERNAL: "External factor" },
  fr: { USER_CONTROLLED: "Vous pouvez agir dessus", PARTLY_CONTROLLED: "Vous pouvez l'influencer en partie", EXTERNAL: "Facteur externe" }
};

function label(language: EmploymentIntelligenceLanguage, table: Record<EmploymentIntelligenceLanguage, Record<string, string>>, key?: string | null, fallback = "") {
  if (!key) return fallback;
  return table[language][key] ?? table.en[key] ?? (fallback || key.replaceAll("_", " ").toLowerCase());
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

function actionStateFor(action: NextBestAction | null): EmploymentActionViewModel["state"] {
  if (!action) return "unavailable";
  if (action.state === "BLOCKED" || action.blockedBy.length > 0) return "blocked";
  if (action.state === "ALREADY_COMPLETED") return "completed";
  if (action.state === "DEFERRED") return "skipped";
  return "ready";
}

export function buildEmploymentActionViewModel(action: NextBestAction | null | undefined, language: EmploymentIntelligenceLanguage): EmploymentActionViewModel | null {
  if (!action) return null;
  const registryAction = actionByCode(action.actionCode);
  const route = action.destination?.route ?? registryAction?.destination.route ?? registryAction?.route ?? "/employment-center";
  const actionQuery = action.destination?.action ?? registryAction?.destination.action;
  const state = actionStateFor(action);
  return {
    code: action.actionCode,
    title: action.title,
    plainTitle: action.presentationMode === "HIGH_GUIDANCE" || action.presentationMode === "ASSISTED" ? action.title : action.title,
    explanation: action.plainLanguageExplanation,
    reason: action.reason,
    expectedOutcome: action.expectedImpact,
    effort: action.estimatedEffort.replaceAll("_", " ").toLowerCase(),
    impact: action.impact ?? "MEDIUM",
    href: appendActionQuery(route, actionQuery),
    state,
    blocker: action.blockedBy[0],
    confidenceLabel: confidenceLabel(language, action.confidence),
    supportDestination: registryAction?.destination.route ?? route,
    why: [...(action.reasonCodes ?? []), ...action.supportingEvidence.map((item) => item.id)].slice(0, 4)
  };
}

function barrierViewModels(barriers: DetectedBarrier[] = [], language: EmploymentIntelligenceLanguage): BarrierViewModel[] {
  return barriers.slice(0, 2).map((barrier) => {
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

function strengthLabels(strengths: EvidenceRecord[] = [], language: EmploymentIntelligenceLanguage) {
  return strengths
    .filter((item) => item.verifiedStatus !== "UNKNOWN")
    .map((item) => item.subject || item.id)
    .filter(Boolean)
    .slice(0, 3)
    .map((item) => (language === "fr" ? item : item));
}

function dimensionViewModels(dimensions: ReadinessDimensionAssessment[] = [], language: EmploymentIntelligenceLanguage): ReadinessDimensionViewModel[] {
  return dimensions.slice(0, 14).map((dimension) => ({
    key: dimension.key,
    name: dimension.key.replaceAll("_", " ").toLowerCase(),
    band: label(language, readinessLabels, dimension.band),
    explanation: dimension.explainabilityMessage,
    confidenceLabel: confidenceLabel(language, dimension.confidence),
    missingInformation: dimension.missingInformation.slice(0, 3),
    recommendedAction: dimension.recommendedActions[0]
  }));
}

function careerPlanPreview(plan: CareerPlan | null | undefined, language: EmploymentIntelligenceLanguage): CareerPlanPreviewViewModel | null {
  if (!plan) return null;
  const totalSteps = plan.progress?.totalSteps ?? plan.steps.length;
  const completedSteps = plan.progress?.completedSteps ?? plan.steps.filter((step) => step.state === "COMPLETED").length;
  const nextSteps = plan.steps
    .filter((step) => step.state !== "COMPLETED" && step.state !== "SKIPPED")
    .slice(0, 3)
    .map((step: CareerPlanStep) => ({
      id: step.id,
      title: step.title ?? step.action,
      explanation: step.reason,
      state: label(language, actionStateLabels, step.state.toLowerCase(), step.state),
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
    immediateGoal: plan.immediateGoal ?? (language === "fr" ? "Terminer la prochaine action utile." : "Complete the next useful action."),
    longTermGoal: plan.longTermGoal ?? (language === "fr" ? "Avancer vers un emploi durable." : "Move toward sustainable employment.")
  };
}

export function buildEmploymentHomeViewModel(detail: DetailedEmploymentIntelligence, language: EmploymentIntelligenceLanguage): EmploymentHomeViewModel {
  const intelligence = detail.intelligence;
  const actionSet = detail.actions as { primary?: NextBestAction; secondary?: NextBestAction[] } | null | undefined;
  const plan = detail.careerPlan as CareerPlan | null | undefined;
  const primaryAction = buildEmploymentActionViewModel(actionSet?.primary ?? intelligence?.nextBestAction, language);
  const secondaryActions = (actionSet?.secondary ?? intelligence?.secondaryActions ?? [])
    .map((action) => buildEmploymentActionViewModel(action, language))
    .filter((action): action is EmploymentActionViewModel => Boolean(action))
    .slice(0, 3);
  const status = (detail.status as EmploymentHomeViewModel["status"]) ?? "not_generated";
  const readinessBand = intelligence?.overallReadiness?.readinessBand ?? "NOT_ASSESSED";
  const highGuidance = primaryAction?.code === "PRACTISE_WITH_COACH" || intelligence?.supportIntensity === "HIGH_GUIDANCE" || intelligence?.supportIntensity === "ASSISTED";
  return {
    status,
    freshnessLabel: status === "current" ? (language === "fr" ? "À jour" : "Up to date") : status === "stale" ? (language === "fr" ? "À mettre à jour" : "Needs update") : (language === "fr" ? "Pas encore généré" : "Not generated yet"),
    freshnessDescription: status === "stale"
      ? (language === "fr" ? "Votre profil a changé. PATHZY peut mettre à jour vos informations d'emploi." : "Your profile changed. PATHZY can update your employment insights.")
      : status === "not_generated"
        ? (language === "fr" ? "Terminez le diagnostic pour générer vos informations d'emploi." : "Complete the diagnosis to generate your employment insights.")
        : (language === "fr" ? "Vos informations d'emploi sont disponibles." : "Your employment insights are available."),
    updatedAtLabel: detail.updatedAt ? new Date(detail.updatedAt).toLocaleString(language === "fr" ? "fr-FR" : "en-US") : "",
    primaryAction,
    secondaryActions,
    position: {
      readinessBand: label(language, readinessLabels, readinessBand),
      confidenceLabel: confidenceLabel(language, intelligence?.overallReadiness?.confidence),
      strongestAssets: strengthLabels(intelligence?.strengths, language),
      barriers: barrierViewModels(intelligence?.barriers, language),
      suitablePathway: intelligence?.overallReadiness?.recommendedPathway ?? (language === "fr" ? "Parcours à confirmer" : "Pathway still being confirmed"),
      supportIntensity: String(intelligence?.supportIntensity ?? intelligence?.overallReadiness?.supportIntensity ?? "STANDARD").replaceAll("_", " ").toLowerCase()
    },
    careerPlan: careerPlanPreview(plan, language),
    dimensions: dimensionViewModels(intelligence?.readinessDimensions, language),
    highGuidance
  };
}
