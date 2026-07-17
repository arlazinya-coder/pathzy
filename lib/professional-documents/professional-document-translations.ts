export type ProfessionalDocumentLocale = "en" | "fr";

export const professionalDocumentTranslations = {
  en: {
    cvStudio: "CV Studio",
    purpose: "Purpose",
    content: "Content",
    design: "Design",
    review: "Review",
    export: "Export",
    qualityCheck: "CV quality check",
    strongFoundation: "Strong foundation",
    importantImprovements: "{count} important improvements",
    optionalRefinements: "{count} optional refinements",
    profileChanged: "Your Professional Identity has changed since this CV was created.",
    reviewUpdates: "Review updates",
    keepThisVersion: "Keep this version",
    createUpdatedCopy: "Create updated copy",
    createFirstCv: "Create your first professional CV",
    emptyStateBody: "PATHZY will use your Professional Identity to prepare the content. You remain in control of what appears and how it is presented.",
    atsConscious: "ATS-conscious",
    downloadPdf: "Download PDF"
  },
  fr: {
    cvStudio: "Studio CV",
    purpose: "Objectif",
    content: "Contenu",
    design: "Design",
    review: "Verification",
    export: "Exporter",
    qualityCheck: "Verification de qualite du CV",
    strongFoundation: "Base solide",
    importantImprovements: "{count} ameliorations importantes",
    optionalRefinements: "{count} ameliorations facultatives",
    profileChanged: "Votre identite professionnelle a change depuis la creation de ce CV.",
    reviewUpdates: "Verifier les mises a jour",
    keepThisVersion: "Garder cette version",
    createUpdatedCopy: "Creer une copie mise a jour",
    createFirstCv: "Creez votre premier CV professionnel",
    emptyStateBody: "PATHZY utilisera votre identite professionnelle pour preparer le contenu. Vous gardez le controle de ce qui apparait et de la presentation.",
    atsConscious: "Compatible ATS",
    downloadPdf: "Telecharger le PDF"
  }
} as const;

export function professionalDocumentText(locale: ProfessionalDocumentLocale, key: keyof typeof professionalDocumentTranslations.en, values: Record<string, string | number> = {}) {
  const text = professionalDocumentTranslations[locale]?.[key] ?? professionalDocumentTranslations.en[key];
  return Object.entries(values).reduce<string>((output, [name, value]) => output.replace(`{${name}}`, String(value)), String(text));
}

