export type CanonicalProfileLocale = "en" | "fr";

export const canonicalProfileTranslations = {
  en: {
    professionalIdentity: "Professional Identity",
    reviewNeeded: "Review needed",
    confirmedBySources: "Confirmed by {count} sources",
    profileHistory: "Profile history",
    documentsAndEvidence: "Documents and evidence",
    preparingIdentity: "Preparing your professional identity",
    combiningInformation: "Combining confirmed career information",
    applyingDecisions: "Applying your decisions",
    buildingTimeline: "Building your career timeline",
    checkingConsistency: "Checking profile consistency",
    identityReady: "Professional identity ready",
    updateFailed: "Profile update failed",
    emptyProfileTitle: "Build your professional identity",
    emptyProfileBody: "Add your experience, education, and skills manually, or upload a document to help PATHZY prepare the information for review.",
    importedProfileBody: "PATHZY has prepared your professional information. Review the items below before they become part of your professional identity."
  },
  fr: {
    professionalIdentity: "Identite professionnelle",
    reviewNeeded: "Verification necessaire",
    confirmedBySources: "Confirme par {count} sources",
    profileHistory: "Historique du profil",
    documentsAndEvidence: "Documents et justificatifs",
    preparingIdentity: "Preparation de votre identite professionnelle",
    combiningInformation: "Regroupement des informations confirmees",
    applyingDecisions: "Application de vos decisions",
    buildingTimeline: "Creation de votre parcours professionnel",
    checkingConsistency: "Verification de la coherence",
    identityReady: "Identite professionnelle prete",
    updateFailed: "Echec de la mise a jour du profil",
    emptyProfileTitle: "Construisez votre identite professionnelle",
    emptyProfileBody: "Ajoutez votre experience, votre formation et vos competences manuellement, ou importez un document pour aider PATHZY a preparer les informations a verifier.",
    importedProfileBody: "PATHZY a prepare vos informations professionnelles. Verifiez les elements ci-dessous avant qu'ils deviennent votre identite professionnelle."
  }
} as const;

export function canonicalProfileText(locale: CanonicalProfileLocale, key: keyof typeof canonicalProfileTranslations.en, values: Record<string, string | number> = {}) {
  const text = canonicalProfileTranslations[locale]?.[key] ?? canonicalProfileTranslations.en[key];
  return Object.entries(values).reduce<string>((output, [name, value]) => output.replace(`{${name}}`, String(value)), String(text));
}
