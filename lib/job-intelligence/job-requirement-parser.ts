import type { InspectJobAdvertisementInput, JobIntelligenceLanguage, JobRequirement, JobRequirementCategory, JobRequirementImportance, StructuredJobOpportunity } from "./job-intelligence.types";

const mandatorySignals = [
  "required",
  "requirement",
  "must",
  "minimum",
  "essential",
  "need to have",
  "you have",
  "obligatoire",
  "exige",
  "exigé",
  "indispensable"
];

const preferredSignals = [
  "preferred",
  "advantage",
  "nice to have",
  "bonus",
  "desirable",
  "ideally",
  "plus",
  "souhaité",
  "souhaitee",
  "souhaitée",
  "atout"
];

const responsibilitySignals = ["responsibilities", "duties", "what you will do", "role includes", "missions", "responsabilités", "taches", "tâches"];
const benefitSignals = ["benefits", "we offer", "salary", "culture", "about us", "avantages", "nous offrons", "salaire"];

function clean(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function normalize(value: string) {
  return clean(value).toLowerCase();
}

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return `job_${Math.abs(hash).toString(36)}`;
}

function detectLanguage(text: string): JobIntelligenceLanguage {
  const lower = normalize(text);
  const frenchSignals = ["vous", "poste", "emploi", "compétences", "competences", "expérience", "experience", "formation", "candidature"];
  const frenchHits = frenchSignals.filter((signal) => lower.includes(signal)).length;
  return frenchHits >= 3 ? "fr" : "en";
}

function splitLines(rawText: string) {
  return rawText
    .split(/\r?\n|•|\u2022| - |\t/g)
    .map((line) => clean(line.replace(/^[*\-–—:;,. ]+/, "")))
    .filter((line) => line.length > 2);
}

function inferImportance(text: string): JobRequirementImportance {
  const lower = normalize(text);
  if (preferredSignals.some((signal) => lower.includes(signal))) return "preferred";
  if (mandatorySignals.some((signal) => lower.includes(signal))) return "mandatory";
  return "context";
}

function inferCategory(text: string): JobRequirementCategory {
  const lower = normalize(text);
  if (/(degree|diploma|bachelor|master|qualification|education|graduate|formation|licence universitaire|diplôme|diplome)/.test(lower)) return "education";
  if (/(certificate|certification|certified|credential|certificat|attestation)/.test(lower)) return "certification";
  if (/(licence|license|registration|registered|permit|permis|inscription professionnelle)/.test(lower)) return "licence";
  if (/(english|french|spanish|language|bilingual|anglais|français|francais|langue)/.test(lower)) return "language";
  if (/(remote|hybrid|on-site|onsite|location|relocat|country|city|visa|work authorization|autorisation)/.test(lower)) return "location";
  if (/(year|experience|background|track record|worked|expérience|experience)/.test(lower)) return "experience";
  if (/(javascript|typescript|python|sql|excel|figma|salesforce|sap|azure|aws|react|node|tool|software|platform|system|outil|logiciel)/.test(lower)) return "technology";
  if (/(communicat|leadership|team|analysis|problem|planning|organis|organize|manage|skill|compétence|competence)/.test(lower)) return "skill";
  if (/(responsible|deliver|support|prepare|coordinate|manage|build|maintain|report|assist|responsable|préparer|coordonner)/.test(lower)) return "responsibility";
  return "unknown";
}

function isRequirementLike(line: string) {
  const lower = normalize(line);
  return (
    mandatorySignals.some((signal) => lower.includes(signal)) ||
    preferredSignals.some((signal) => lower.includes(signal)) ||
    /(experience|skills?|knowledge|ability|degree|diploma|certificate|licen[cs]e|language|must|responsible|proficient|familiar|compétence|experience|formation)/.test(lower)
  );
}

function makeRequirement(line: string, index: number, defaultImportance: JobRequirementImportance): JobRequirement {
  const importance = inferImportance(line);
  return {
    id: `req-${index + 1}`,
    text: clean(line),
    normalizedText: normalize(line),
    category: inferCategory(line),
    importance: importance === "context" ? defaultImportance : importance,
    sourceLine: line,
    confidence: isRequirementLike(line) ? 0.78 : 0.52
  };
}

function extractTitle(rawText: string, fallback?: string) {
  if (fallback) return clean(fallback);
  const titleLine = splitLines(rawText).find((line) => /^(job title|role|poste|titre)\s*[:\-]/i.test(line));
  return titleLine ? clean(titleLine.replace(/^(job title|role|poste|titre)\s*[:\-]/i, "")) : undefined;
}

function extractCompany(rawText: string, fallback?: string) {
  if (fallback) return clean(fallback);
  const companyLine = splitLines(rawText).find((line) => /^(company|organisation|organization|employer|entreprise|société|societe)\s*[:\-]/i.test(line));
  return companyLine ? clean(companyLine.replace(/^(company|organisation|organization|employer|entreprise|société|societe)\s*[:\-]/i, "")) : undefined;
}

export function inspectJobAdvertisement(input: InspectJobAdvertisementInput): StructuredJobOpportunity {
  const rawText = typeof input.rawText === "string" ? input.rawText.trim() : "";
  const language = input.language ?? detectLanguage(rawText);
  const lines = splitLines(rawText);
  const requirements: JobRequirement[] = [];
  const responsibilities: JobRequirement[] = [];
  const benefitsOrContext: JobRequirement[] = [];

  let currentBucket: "requirements" | "responsibilities" | "context" = "requirements";
  lines.forEach((line, index) => {
    const lower = normalize(line);
    if (responsibilitySignals.some((signal) => lower.includes(signal))) {
      currentBucket = "responsibilities";
      return;
    }
    if (benefitSignals.some((signal) => lower.includes(signal))) {
      currentBucket = "context";
      return;
    }
    if (currentBucket === "responsibilities") {
      responsibilities.push(makeRequirement(line, index, "context"));
      return;
    }
    if (currentBucket === "context") {
      benefitsOrContext.push(makeRequirement(line, index, "context"));
      return;
    }
    if (isRequirementLike(line)) requirements.push(makeRequirement(line, index, inferImportance(line)));
  });

  const fallbackRequirementLines = requirements.length ? [] : lines.filter((line) => line.length > 8).slice(0, 6);
  fallbackRequirementLines.forEach((line, index) => requirements.push(makeRequirement(line, index, "context")));

  return {
    id: input.sourceOpportunityId ? `job-${input.sourceOpportunityId}` : hashText(rawText),
    sourceType: input.sourceType ?? "manual",
    sourceOpportunityId: input.sourceOpportunityId,
    title: extractTitle(rawText, input.title),
    company: extractCompany(rawText, input.company),
    location: clean(input.location) || undefined,
    employmentType: clean(input.employmentType) || undefined,
    language,
    rawTextHash: hashText(rawText),
    summary: lines.slice(0, 4).join(" ").slice(0, 420),
    requirements: requirements.slice(0, 18),
    responsibilities: responsibilities.slice(0, 12),
    benefitsOrContext: benefitsOrContext.slice(0, 8),
    extractedAt: new Date().toISOString()
  };
}
