import type { ConfidenceAssessment } from "./confidence";

export const inputProvenanceStates = ["KNOWN", "UNKNOWN", "NOT_APPLICABLE", "USER_DECLINED", "INFERRED", "VERIFIED"] as const;

export type InputProvenanceState = (typeof inputProvenanceStates)[number];

export const evidenceTypes = [
  "SELF_REPORTED",
  "DOCUMENT_SUPPORTED",
  "REFERENCE_SUPPORTED",
  "PORTFOLIO_SUPPORTED",
  "VERIFIED_CREDENTIAL",
  "SYSTEM_DERIVED",
  "EXTERNAL_DATA",
  "UNKNOWN"
] as const;

export type EvidenceType = (typeof evidenceTypes)[number];

export type EvidenceRecord = {
  id: string;
  subject: string;
  evidenceType: EvidenceType;
  sourceReference: string;
  supportingField?: string;
  supportingAssetId?: string;
  confidence: ConfidenceAssessment;
  verifiedStatus: InputProvenanceState;
  timestamp: string;
  engineVersion: string;
  missingEvidence?: string[];
  internalNotes?: string[];
};

export type ProvenancedValue<T> = {
  value: T | null;
  provenance: InputProvenanceState;
  evidence: EvidenceRecord[];
  confidence: ConfidenceAssessment;
};

export const evidenceRules = [
  "SELF_REPORTED_IS_VALID_NOT_VERIFIED",
  "INFORMAL_WORK_COUNTS_AS_EVIDENCE",
  "LACK_OF_FORMAL_EVIDENCE_DOES_NOT_ERASE_CAPABILITY",
  "VERIFICATION_IS_NEVER_ASSUMED",
  "EVIDENCE_CONFIDENCE_IS_NOT_USER_WORTH"
] as const;
