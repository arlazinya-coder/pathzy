import type { DocumentType } from "./inspection.types";
import { clampConfidence } from "./inspection.utils";

type TypeRule = {
  type: DocumentType;
  weight: number;
  patterns: RegExp[];
};

const rules: TypeRule[] = [
  { type: "cv", weight: 1.2, patterns: [/curriculum vitae|r[ée]sum[ée]/i, /work experience|employment history|exp[ée]rience professionnelle/i, /education|formation/i, /skills|comp[ée]tences/i] },
  { type: "cover_letter", weight: 1.15, patterns: [/dear hiring manager|dear recruiter|sincerely|kind regards/i, /application for|motivation letter|lettre de motivation|candidature/i] },
  { type: "certificate", weight: 1.05, patterns: [/certificate|certificat|attestation|awarded to|successfully completed/i] },
  { type: "academic_transcript", weight: 1.1, patterns: [/transcript|relev[ée] de notes|credits?|grades?|modules?|course result/i] },
  { type: "diploma", weight: 1, patterns: [/diploma|dipl[ôo]me|degree awarded|qualification awarded/i] },
  { type: "job_advertisement", weight: 1.1, patterns: [/responsibilities|requirements|qualifications|apply now|closing date|poste|responsabilit[ée]s|exigences/i] },
  { type: "recommendation_letter", weight: 1, patterns: [/recommendation|reference letter|to whom it may concern|recommande/i] },
  { type: "identity_document", weight: 1, patterns: [/identity document|national id|identity number|id number|document d'identit[ée]/i] },
  { type: "passport", weight: 1, patterns: [/passport|passeport|place of birth|nationality/i] },
  { type: "drivers_licence", weight: 1, patterns: [/driver'?s licence|driving licence|permis de conduire/i] },
  { type: "payslip", weight: 1, patterns: [/payslip|salary slip|net pay|gross pay|bulletin de paie/i] },
  { type: "employment_contract", weight: 1, patterns: [/employment contract|contract of employment|terms of employment|contrat de travail/i] },
  { type: "portfolio", weight: 0.95, patterns: [/portfolio|case study|selected projects|project gallery/i] }
];

export function detectDocumentType(input: { filename: string; text: string; mimeType: string }) {
  const haystack = `${input.filename}\n${input.text}`.toLowerCase();
  const scored = rules.map((rule) => {
    const hits = rule.patterns.filter((pattern) => pattern.test(haystack)).length;
    return { value: rule.type, score: hits * rule.weight, hits };
  }).filter((item) => item.hits > 0).sort((a, b) => b.score - a.score);

  if (!scored.length) {
    return {
      value: "unknown" as DocumentType,
      confidence: 0.42,
      alternatives: []
    };
  }

  const top = scored[0];
  const second = scored[1];
  const confidence = clampConfidence(Math.min(0.96, 0.48 + top.score * 0.16 + Math.max(0, top.score - (second?.score ?? 0)) * 0.08));
  return {
    value: confidence >= 0.5 ? top.value : "unknown" as DocumentType,
    confidence,
    alternatives: scored.slice(1, 4).map((item) => ({ value: item.value, confidence: clampConfidence(Math.min(0.86, 0.35 + item.score * 0.14)) }))
  };
}
