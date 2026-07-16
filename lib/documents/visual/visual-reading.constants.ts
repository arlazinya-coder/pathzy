export const VISUAL_READING_LIMITS = {
  maxPagesPerRun: 12,
  renderWidth: 1240,
  renderHeight: 1754,
  lowConfidence: 0.72,
  manualReviewConfidence: 0.6,
  maxRegionsPerPage: 120
} as const;

export const VISUAL_CONFIDENCE_WEIGHTS = {
  layout: 0.25,
  hierarchy: 0.2,
  readingOrder: 0.2,
  tables: 0.1,
  timelines: 0.1,
  imageClassification: 0.05,
  iconInterpretation: 0.1
} as const;

export const VISUAL_READING_COPY = {
  en: {
    progressTitle: "Understanding your document layout",
    steps: ["Identifying headings", "Reading columns", "Detecting timelines and dates", "Understanding tables", "Connecting icons and labels", "Building the correct reading order"],
    completeTitle: "Visual Reading Complete",
    ready: "Ready for information extraction"
  },
  fr: {
    progressTitle: "Analyse de la mise en page",
    steps: ["Identification des titres", "Lecture des colonnes", "Detection des chronologies et des dates", "Analyse des tableaux", "Association des icones et des informations", "Creation de l'ordre de lecture"],
    completeTitle: "Lecture visuelle terminee",
    ready: "Pret pour l'extraction des informations"
  }
} as const;
