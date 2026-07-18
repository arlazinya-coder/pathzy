import type { JobIntelligenceLanguage, JobSuitability } from "./job-intelligence.types";

export const jobIntelligenceCopy: Record<JobIntelligenceLanguage, {
  title: string;
  subtitle: string;
  suitability: Record<JobSuitability, string>;
  strengths: string;
  gaps: string;
  uncertain: string;
  prepareCv: string;
}> = {
  en: {
    title: "Job Intelligence",
    subtitle: "PATHZY compares this opportunity with your confirmed professional identity before you apply.",
    suitability: {
      strong_fit: "Strong fit",
      potential_fit: "Potential fit",
      stretch: "Stretch role",
      not_enough_information: "Needs more profile evidence",
      not_recommended_yet: "Prepare before applying"
    },
    strengths: "Evidence found",
    gaps: "Gaps to address",
    uncertain: "Needs review",
    prepareCv: "Prepare truthful CV"
  },
  fr: {
    title: "Analyse de l'offre",
    subtitle: "PATHZY compare cette opportunite avec votre identite professionnelle confirmee avant de postuler.",
    suitability: {
      strong_fit: "Bon alignement",
      potential_fit: "Alignement possible",
      stretch: "Poste ambitieux",
      not_enough_information: "Profil a completer",
      not_recommended_yet: "Preparez-vous avant de postuler"
    },
    strengths: "Preuves trouvees",
    gaps: "Ecarts a traiter",
    uncertain: "A verifier",
    prepareCv: "Preparer un CV honnete"
  }
};

export const jobImportCopy = {
  en: {
    title: "Inspect a job advert",
    subtitle: "Paste or upload a job advert. PATHZY extracts the job basics first, then you review them before matching your profile.",
    review: "Review imported job",
    save: "Save Job Review",
    fallback: "Paste the job description here."
  },
  fr: {
    title: "Analyser une offre d'emploi",
    subtitle: "Collez ou importez une offre. PATHZY extrait d'abord les informations principales, puis vous les verifiez avant la comparaison avec votre profil.",
    review: "Verifier l'offre importee",
    save: "Enregistrer la verification",
    fallback: "Collez la description du poste ici."
  }
} as const;

export const jobUnderstandingCopy = {
  en: {
    title: "Job Analysis",
    responsibilities: "Responsibilities",
    mandatoryRequirements: "Mandatory Requirements",
    preferredRequirements: "Preferred Requirements",
    optionalRequirements: "Optional Requirements",
    applicationDetails: "Application Details",
    reviewAnalysis: "Review Analysis",
    confirmAnalysis: "Confirm Job Analysis"
  },
  fr: {
    title: "Analyse du poste",
    responsibilities: "ResponsabilitÃ©s",
    mandatoryRequirements: "Exigences obligatoires",
    preferredRequirements: "Exigences souhaitÃ©es",
    optionalRequirements: "Exigences facultatives",
    applicationDetails: "Informations de candidature",
    reviewAnalysis: "VÃ©rifier l'analyse",
    confirmAnalysis: "Confirmer l'analyse du poste"
  }
} as const;

export const profileJobMatchCopy = {
  en: {
    title: "Job Match",
    fitScore: "Fit Score",
    analysisConfidence: "Analysis Confidence",
    strongMatches: "Strong Matches",
    partialMatches: "Partial Matches",
    missingRequirements: "Missing Requirements",
    informationNeeded: "Information Needed",
    potentialBlockers: "Potential Blockers",
    recommendedNextSteps: "Recommended Next Steps",
    prepareTargetedApplication: "Prepare Targeted Application"
  },
  fr: {
    title: "Correspondance avec le poste",
    fitScore: "Score de compatibilitÃ©",
    analysisConfidence: "FiabilitÃ© de l'analyse",
    strongMatches: "Points forts",
    partialMatches: "Correspondances partielles",
    missingRequirements: "Exigences manquantes",
    informationNeeded: "Informations nÃ©cessaires",
    potentialBlockers: "Obstacles potentiels",
    recommendedNextSteps: "Prochaines Ã©tapes recommandÃ©es",
    prepareTargetedApplication: "PrÃ©parer une candidature ciblÃ©e"
  }
} as const;

export const targetedDocumentsCopy = {
  en: {
    title: "Prepare Targeted Documents",
    targetedCv: "Targeted CV",
    coverLetter: "Tailored Cover Letter",
    applicationEmail: "Application Email",
    linkedInMessage: "LinkedIn Message",
    recruiterMessage: "Recruiter Message",
    reviewRequired: "Review Required",
    approved: "Approved",
    createNewVersion: "Create New Version",
    strategy: "Strategy",
    review: "Review",
    prepare: "Prepare Targeted Documents",
    noAutoSend: "Nothing is sent automatically. You review and approve every document."
  },
  fr: {
    title: "Preparer les documents cibles",
    targetedCv: "CV cible",
    coverLetter: "Lettre de motivation personnalisee",
    applicationEmail: "E-mail de candidature",
    linkedInMessage: "Message LinkedIn",
    recruiterMessage: "Message recruteur",
    reviewRequired: "Verification necessaire",
    approved: "Approuve",
    createNewVersion: "Creer une nouvelle version",
    strategy: "Strategie",
    review: "Verification",
    prepare: "Preparer les documents cibles",
    noAutoSend: "Rien n'est envoye automatiquement. Vous verifiez et approuvez chaque document."
  }
} as const;

export const smartApplicationCopy = {
  en: {
    prepareApplication: "Prepare Application",
    workspace: "Application Workspace",
    package: "Application Package",
    readyToApply: "Ready to Apply",
    reviewRequired: "Review Required",
    supportingDocuments: "Supporting Documents",
    approvePackage: "Approve Package"
  },
  fr: {
    prepareApplication: "Preparer la candidature",
    workspace: "Espace de candidature",
    package: "Dossier de candidature",
    readyToApply: "Pret a postuler",
    reviewRequired: "Verification necessaire",
    supportingDocuments: "Documents justificatifs",
    approvePackage: "Approuver le dossier"
  }
} as const;

export const applicationTrackerCopy = {
  en: {
    title: "Applications",
    preparing: "Preparing",
    readyToApply: "Ready to Apply",
    applied: "Applied",
    interviews: "Interviews",
    offers: "Offers",
    followUpNeeded: "Follow-Up Needed",
    closed: "Closed",
    nextAction: "Next Action",
    addNote: "Add Note",
    updateStatus: "Update Status"
  },
  fr: {
    title: "Candidatures",
    preparing: "En préparation",
    readyToApply: "Prêt à postuler",
    applied: "Envoyées",
    interviews: "Entretiens",
    offers: "Offres",
    followUpNeeded: "Relance nécessaire",
    closed: "Clôturées",
    nextAction: "Prochaine action",
    addNote: "Ajouter une note",
    updateStatus: "Mettre à jour le statut"
  }
} as const;

export const interviewPreparationCopy = {
  en: {
    title: "Interview Preparation",
    practiceQuestions: "Practice Questions",
    starStories: "STAR Stories",
    questionsForEmployer: "Questions for the Employer",
    practiceAnswer: "Practice Answer",
    feedback: "Feedback",
    evidenceToUse: "Evidence to Use",
    claimsToAvoid: "Claims to Avoid"
  },
  fr: {
    title: "Préparation à l’entretien",
    practiceQuestions: "Questions d’entraînement",
    starStories: "Exemples STAR",
    questionsForEmployer: "Questions à poser à l’employeur",
    practiceAnswer: "Réponse d’entraînement",
    feedback: "Commentaires",
    evidenceToUse: "Éléments à utiliser",
    claimsToAvoid: "Affirmations à éviter"
  }
} as const;

export const followUpCopy = {
  en: {
    title: "Follow-Up",
    followUpDue: "Follow-Up Due",
    prepareFollowUp: "Prepare Follow-Up",
    schedule: "Schedule",
    approve: "Approve",
    markAsSent: "Mark as Sent",
    dismiss: "Dismiss"
  },
  fr: {
    title: "Relance",
    followUpDue: "Relance a effectuer",
    prepareFollowUp: "Preparer la relance",
    schedule: "Planifier",
    approve: "Approuver",
    markAsSent: "Marquer comme envoyee",
    dismiss: "Ignorer"
  }
} as const;

export const careerAnalyticsCopy = {
  en: {
    title: "Career Analytics",
    applicationFunnel: "Application Funnel",
    responseRate: "Response Rate",
    interviewRate: "Interview Rate",
    offerRate: "Offer Rate",
    applicationsByRole: "Applications by Role",
    applicationsBySource: "Applications by Source",
    recurringGaps: "Recurring Gaps",
    recommendedActions: "Recommended Actions",
    notEnoughDataYet: "Not Enough Data Yet",
    earlySignal: "Early Signal"
  },
  fr: {
    title: "Analyse de carriere",
    applicationFunnel: "Parcours des candidatures",
    responseRate: "Taux de reponse",
    interviewRate: "Taux d'entretien",
    offerRate: "Taux d'offre",
    applicationsByRole: "Candidatures par poste",
    applicationsBySource: "Candidatures par source",
    recurringGaps: "Lacunes recurrentes",
    recommendedActions: "Actions recommandees",
    notEnoughDataYet: "Pas encore assez de donnees",
    earlySignal: "Premiere tendance"
  }
} as const;
