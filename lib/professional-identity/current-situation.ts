import { normalizeSupportedLanguage, type SupportedLanguageCode } from "@/lib/language/language-preferences";

export const currentSituationValues = [
  "employed",
  "unemployed",
  "student",
  "self_employed",
  "career_break",
  "career_transition",
  "graduate",
  "first_time_job_seeker",
  "other"
] as const;

export type CurrentSituationValue = (typeof currentSituationValues)[number];

export const currentSituationLabels: Record<SupportedLanguageCode, Record<CurrentSituationValue, string>> = {
  en: {
    employed: "Employed",
    unemployed: "Unemployed",
    student: "Student",
    self_employed: "Self-employed",
    career_break: "Career break",
    career_transition: "Career transition",
    graduate: "Graduate",
    first_time_job_seeker: "First-time job seeker",
    other: "Other"
  },
  fr: {
    employed: "Salarié",
    unemployed: "Sans emploi",
    student: "Étudiant",
    self_employed: "Indépendant",
    career_break: "Pause professionnelle",
    career_transition: "En reconversion",
    graduate: "Diplômé",
    first_time_job_seeker: "Première recherche d'emploi",
    other: "Autre"
  }
};

const aliases: Record<string, CurrentSituationValue> = {
  employed: "employed",
  employee: "employed",
  salarié: "employed",
  salarie: "employed",
  "déjà en poste": "employed",
  "deja en poste": "employed",
  unemployed: "unemployed",
  "unemployed and actively searching": "unemployed",
  "sans emploi": "unemployed",
  student: "student",
  étudiant: "student",
  etudiant: "student",
  "student or recent graduate": "student",
  "étudiant ou jeune diplômé": "student",
  "etudiant ou jeune diplome": "student",
  self_employed: "self_employed",
  "self-employed": "self_employed",
  "self-employed or freelancing": "self_employed",
  entrepreneur: "self_employed",
  indépendant: "self_employed",
  independant: "self_employed",
  freelance: "self_employed",
  career_break: "career_break",
  "career break": "career_break",
  "returning to work": "career_break",
  "pause professionnelle": "career_break",
  "retour à l'emploi": "career_break",
  "retour a l'emploi": "career_break",
  career_transition: "career_transition",
  "career transition": "career_transition",
  "career changer": "career_transition",
  career_changer: "career_transition",
  reconversion: "career_transition",
  "en reconversion": "career_transition",
  graduate: "graduate",
  diplômé: "graduate",
  diplome: "graduate",
  first_time_job_seeker: "first_time_job_seeker",
  looking_first_job: "first_time_job_seeker",
  "first-time job seeker": "first_time_job_seeker",
  "first time job seeker": "first_time_job_seeker",
  "première recherche d'emploi": "first_time_job_seeker",
  "premiere recherche d'emploi": "first_time_job_seeker",
  other: "other",
  autre: "other"
};

export function normalizeCurrentSituation(value: unknown): CurrentSituationValue | "" {
  if (typeof value !== "string") return "";
  const clean = value.trim();
  if (!clean) return "";
  const key = clean.toLowerCase().replace(/\s+/g, " ");
  if ((currentSituationValues as readonly string[]).includes(key)) return key as CurrentSituationValue;
  return aliases[key] ?? "";
}

export function currentSituationDisplayLabel(language: string | null | undefined, value: unknown, fallbackLanguage?: string | null) {
  const resolvedLanguage = normalizeSupportedLanguage(language, fallbackLanguage);
  const normalized = normalizeCurrentSituation(value);
  if (!normalized) return typeof value === "string" ? value.trim() : "";
  return currentSituationLabels[resolvedLanguage]?.[normalized] ?? currentSituationLabels.en[normalized] ?? normalized;
}
