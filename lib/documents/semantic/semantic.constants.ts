export const SEMANTIC_TAXONOMY_VERSION = "pathzy-career-ontology-v1";
export const SEMANTIC_PROCESSING_VERSION = "phase-4";
export const SEMANTIC_CONFIDENCE_WEIGHTS = {
  sourceText: 0.15,
  visualContext: 0.2,
  sectionContext: 0.15,
  relationshipContext: 0.15,
  deterministicValidation: 0.15,
  modelInterpretation: 0.15,
  crossSignalAgreement: 0.05
};
export const SEMANTIC_THRESHOLDS = {
  autoAccept: 0.92,
  reviewRecommended: 0.75,
  manualReviewRequired: 0.6,
  alternativeDifference: 0.08
};
export const SEMANTIC_STATUS_COPY = {
  english: {
    waiting: "Waiting for visual reading",
    processing: "Understanding your career information",
    identity: "Identifying your profession",
    employment: "Understanding your work experience",
    education: "Recognising your education",
    skills: "Identifying skills and qualifications",
    relationships: "Connecting dates, employers, and roles",
    completed: "Semantic Understanding Complete",
    review: "Ready for review",
    failed: "Semantic understanding failed"
  },
  french: {
    waiting: "En attente de la lecture visuelle",
    processing: "Compréhension de votre parcours",
    identity: "Identification de votre profession",
    employment: "Analyse de votre expérience professionnelle",
    education: "Reconnaissance de votre formation",
    skills: "Identification de vos compétences et qualifications",
    relationships: "Association des dates, employeurs et fonctions",
    completed: "Compréhension sémantique terminée",
    review: "Prêt pour vérification",
    failed: "Échec de l’analyse sémantique"
  }
};
