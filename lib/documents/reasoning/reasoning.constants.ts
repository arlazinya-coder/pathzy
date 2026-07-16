export const REASONING_ENGINE_VERSION = "phase-5";
export const REASONING_TAXONOMY_VERSION = "pathzy-career-reasoning-v1";

export const REASONING_THRESHOLDS = {
  veryHighConfidence: 0.9,
  highConfidence: 0.78,
  mediumConfidence: 0.58,
  lowConfidence: 0.36,
  contradiction: 0.45,
  staleEvidence: 0.5
};

export const EMPLOYMENT_MATCH_WEIGHTS = {
  organisation: 0.25,
  dates: 0.2,
  titleMeaning: 0.15,
  responsibilities: 0.15,
  location: 0.05,
  skills: 0.05,
  independentConfirmation: 0.1,
  sourceReliability: 0.05
};

export const EMPLOYMENT_CONTRADICTION_WEIGHTS = {
  incompatibleEmployer: -0.4,
  incompatibleDates: -0.3,
  incompatibleLocation: -0.1,
  incompatibleSeniority: -0.1,
  conflictingExplicitStatement: -0.25
};

export const SOURCE_RELIABILITY_WEIGHTS = {
  user_confirmed_profile: 1,
  official_employment_document: 0.94,
  reference_letter: 0.9,
  academic_transcript: 0.9,
  certificate: 0.88,
  cv: 0.72,
  linkedin: 0.68,
  portfolio: 0.64,
  manual_entry: 0.62,
  cover_letter: 0.42,
  unknown: 0.35
} as const;

export const REASONING_STATUS_COPY = {
  english: {
    title: "Career Information Check",
    matches: "possible matches",
    conflicts: "information conflicts",
    questions: "questions need your confirmation",
    ready: "PATHZY has found career facts to review. Your profile has not been changed automatically.",
    empty: "No career information checks are waiting right now."
  },
  french: {
    title: "Vérification du parcours",
    matches: "correspondances possibles",
    conflicts: "conflits d’information",
    questions: "questions nécessitent votre confirmation",
    ready: "PATHZY a trouvé des informations à vérifier. Votre profil n’a pas été modifié automatiquement.",
    empty: "Aucune vérification du parcours n’est en attente pour le moment."
  }
};
