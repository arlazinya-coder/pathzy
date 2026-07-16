import type { SemanticEntityType, SkillCategory } from "./semantic.types";
import { cleanSemanticText } from "./semantic-utils";

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phonePattern = /(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?){2,5}\d{2,4}/;
const urlPattern = /https?:\/\/|www\.|linkedin\.com|github\.com/i;
const datePattern = /\b(?:19|20)\d{2}\b|\b(present|current|expected|depuis|à ce jour|a ce jour|prévue|prevue)\b/i;
const qualificationPattern = /\b(bachelor|btech|b\.?\s?tech|bsc|b\.?\s?sc|diploma|degree|master|msc|mba|phd|doctorate|licence|licenci[eé]|brevet|certificat|qualification)\b/i;
const institutionPattern = /\b(university|college|school|institute|academy|universit[eé]|institut|coll[eè]ge|technikon)\b/i;
const certificationPattern = /\b(certified|certification|certificate|licence|license|accreditation|credential|issued|issuer|certifi[eé]|attestation)\b/i;
const achievementPattern = /\b(increased|reduced|improved|saved|grew|launched|delivered|achieved|exceeded|awarded|won|\d+%|\d+\s*(x|times)|revenue|cost|efficiency)\b/i;
const responsibilityPattern = /\b(managed|maintained|processed|supported|assisted|coordinated|performed|monitored|prepared|developed|created|implemented|analysed|analyzed|served|led|supervised)\b/i;
const languageTerms = new Set(["english", "french", "français", "francais", "kiswahili", "swahili", "zulu", "xhosa", "afrikaans", "spanish", "portuguese", "lingala"]);
const programmingTerms = new Set(["javascript", "typescript", "python", "java", "c#", "c++", "sql", "html", "css", "php", "ruby", "go", "rust", "react", "node.js", "next.js"]);

export function semanticSectionFor(title: string | null | undefined) {
  const clean = cleanSemanticText(title ?? "").toLowerCase();
  if (/summary|profile|objective|profil/.test(clean)) return "professional_profile";
  if (/experience|employment|work|expérience|parcours|stage|internship/.test(clean)) return "employment";
  if (/education|formation|academic|qualification|dipl[oô]me/.test(clean)) return "education";
  if (/certification|certificate|licen[cs]e|registration|certificat/.test(clean)) return "certification";
  if (/skill|competenc|compétence|technology|tools/.test(clean)) return "skills";
  if (/language|langue/.test(clean)) return "languages";
  if (/project|portfolio|projet/.test(clean)) return "projects";
  if (/reference|referee|référence/.test(clean)) return "references";
  if (/award|achievement|accomplishment/.test(clean)) return "awards";
  if (/membership|association/.test(clean)) return "memberships";
  if (/publication/.test(clean)) return "publications";
  if (/volunteer|community/.test(clean)) return "volunteering";
  return "unknown";
}

export function entityTypeForText(text: string, section: string): SemanticEntityType {
  const clean = cleanSemanticText(text);
  if (emailPattern.test(clean)) return "email";
  if (phonePattern.test(clean)) return "phone_number";
  if (/linkedin\.com/i.test(clean)) return "linkedin_url";
  if (/github\.com/i.test(clean)) return "github_url";
  if (urlPattern.test(clean)) return "website";
  if (datePattern.test(clean)) return section === "employment" ? "date_range" : "date";
  if (section === "education" && qualificationPattern.test(clean)) return "qualification";
  if (section === "education" && institutionPattern.test(clean)) return "education_institution";
  if (section === "certification" && certificationPattern.test(clean)) return "certification_name";
  if (section === "languages") return "language";
  if (section === "skills") return skillTypeFor(clean);
  if (section === "employment" && achievementPattern.test(clean)) return "achievement";
  if (section === "employment" && responsibilityPattern.test(clean)) return "responsibility";
  if (section === "employment") return "job_title";
  if (section === "professional_profile" && clean.length < 90) return "professional_headline";
  if (section === "professional_profile") return "professional_summary";
  if (section === "projects") return "project_description";
  if (section === "references") return "reference_entry";
  return "unknown";
}

export function skillTypeFor(text: string): SemanticEntityType {
  const clean = cleanSemanticText(text).toLowerCase();
  if (programmingTerms.has(clean)) return "technology";
  if (/\b(excel|word|powerpoint|figma|photoshop|sap|salesforce|jira|git|docker|azure|aws)\b/i.test(clean)) return "tool";
  if (/\b(communication|teamwork|leadership|problem solving|adaptability|collaboration)\b/i.test(clean)) return "soft_skill";
  return "skill";
}

export function skillCategoryFor(text: string): SkillCategory {
  const clean = cleanSemanticText(text).toLowerCase();
  if (programmingTerms.has(clean)) return "programming_language";
  if (/\b(react|next|node|django|laravel|spring)\b/i.test(clean)) return "framework";
  if (/\b(aws|azure|gcp|salesforce|sap)\b/i.test(clean)) return "platform";
  if (/\b(excel|word|powerpoint|figma|photoshop|jira|git|docker)\b/i.test(clean)) return "tool";
  if (/\b(leadership|supervision|team management)\b/i.test(clean)) return "leadership";
  if (/\b(communication|collaboration|teamwork|presentation)\b/i.test(clean)) return "communication";
  if (/\b(laboratory|clinical|specimen|sample|quality control)\b/i.test(clean)) return "laboratory";
  return "unknown";
}

export function isHumanLanguage(text: string) {
  const first = cleanSemanticText(text).split(/[-—:,(]/)[0]?.trim().toLowerCase();
  return languageTerms.has(first);
}

export function normalizeLanguageProficiency(text: string): "native" | "fluent" | "advanced" | "intermediate" | "basic" | "unknown" {
  if (/\b(native|mother tongue|langue maternelle)\b/i.test(text)) return "native";
  if (/\b(fluent|courant|professional)\b/i.test(text)) return "fluent";
  if (/\b(advanced|avancé|avance)\b/i.test(text)) return "advanced";
  if (/\b(intermediate|intermédiaire|intermediaire)\b/i.test(text)) return "intermediate";
  if (/\b(basic|beginner|débutant|debutant)\b/i.test(text)) return "basic";
  return "unknown";
}

export function degreeLevelFor(text: string) {
  if (/\b(phd|doctorate|doctorat)\b/i.test(text)) return "Doctorate";
  if (/\b(master|msc|mba|maitrise|maîtrise)\b/i.test(text)) return "Master";
  if (/\b(bachelor|btech|b\.?\s?tech|bsc|b\.?\s?sc|licence|licenci[eé])\b/i.test(text)) return "Bachelor";
  if (/\b(diploma|diplôme|diplome)\b/i.test(text)) return "Diploma";
  if (/\b(certificate|certificat)\b/i.test(text)) return "Certificate";
  return undefined;
}

export function careerFieldFor(text: string) {
  if (/\bsoftware|developer|engineer|programmer|data analyst|web\b/i.test(text)) return "Technology";
  if (/\blaboratory|clinical|biomedical|nurse|health|medical\b/i.test(text)) return "Healthcare";
  if (/\bteacher|education|lecturer|tutor\b/i.test(text)) return "Education";
  if (/\bsales|account executive|business development\b/i.test(text)) return "Sales";
  if (/\badministrator|office|records|assistant\b/i.test(text)) return "Administration";
  return undefined;
}
