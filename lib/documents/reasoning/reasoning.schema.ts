import type { ReasoningCase, ReasoningDecision, ReasoningSignal } from "./reasoning.types";

export class CareerReasoningError extends Error {
  code: string;
  userMessage: string;

  constructor(code: string, message: string, userMessage = "PATHZY could not complete this career information check yet. Your documents are safe.") {
    super(message);
    this.name = "CareerReasoningError";
    this.code = code;
    this.userMessage = userMessage;
  }
}

function validConfidence(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

export function validateReasoningSignal(signal: ReasoningSignal) {
  if (!signal.type || !signal.direction || !signal.description) throw new CareerReasoningError("invalid_signal", "Reasoning signal is incomplete.");
  if (!validConfidence(signal.confidence)) throw new CareerReasoningError("invalid_confidence", "Reasoning signal confidence is invalid.");
  return signal;
}

export function validateReasoningDecision(decision: ReasoningDecision) {
  if (!decision.id || !decision.caseId || !decision.conclusion || !decision.recommendation) throw new CareerReasoningError("invalid_decision", "Reasoning decision is incomplete.");
  if (!validConfidence(decision.confidence)) throw new CareerReasoningError("invalid_confidence", "Reasoning decision confidence is invalid.");
  if (decision.reversible !== true) throw new CareerReasoningError("irreversible_decision", "Reasoning decisions must be reversible.");
  return decision;
}

export function validateReasoningCase(reasoningCase: ReasoningCase) {
  if (!reasoningCase.id || !reasoningCase.userId || !reasoningCase.type || !reasoningCase.fingerprint) throw new CareerReasoningError("invalid_case", "Reasoning case is incomplete.");
  if (!reasoningCase.candidateGroups.length) throw new CareerReasoningError("empty_candidate_group", "Reasoning case has no candidates.");
  if (!validConfidence(reasoningCase.confidence)) throw new CareerReasoningError("invalid_confidence", "Reasoning case confidence is invalid.");
  for (const group of reasoningCase.candidateGroups) {
    [...group.blockingSignals, ...group.matchingSignals, ...group.conflictingSignals].forEach(validateReasoningSignal);
  }
  if (reasoningCase.decision) validateReasoningDecision(reasoningCase.decision);
  return reasoningCase;
}
