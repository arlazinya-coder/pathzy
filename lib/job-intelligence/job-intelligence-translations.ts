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

