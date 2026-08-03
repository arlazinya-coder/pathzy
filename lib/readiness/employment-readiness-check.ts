import type { SupportedLanguageCode } from "@/lib/language/language-preferences";

export type EmploymentReadinessAnswerKey =
  | "current_situation"
  | "main_support_needed"
  | "existing_cv_status"
  | "immediate_employment_goal"
  | "current_readiness";

export type EmploymentReadinessAnswers = Record<EmploymentReadinessAnswerKey, string>;

export type EmploymentReadinessStep = {
  key: EmploymentReadinessAnswerKey;
  title: string;
  prompt: string;
  options: string[];
};

export const employmentReadinessAnswerKeys: EmploymentReadinessAnswerKey[] = [
  "current_situation",
  "main_support_needed",
  "existing_cv_status",
  "immediate_employment_goal",
  "current_readiness"
];

export const employmentReadinessSteps: Record<SupportedLanguageCode, EmploymentReadinessStep[]> = {
  en: [
    {
      key: "current_situation",
      title: "Current situation",
      prompt: "Which option best describes where you are starting from?",
      options: ["First-time job seeker", "Unemployed and actively searching", "Employed and exploring new opportunities", "Student or recent graduate", "Self-employed or freelancing", "Returning to work"]
    },
    {
      key: "main_support_needed",
      title: "Main support needed",
      prompt: "What would help you most right now?",
      options: ["Career direction", "Professional profile", "CV and cover letter", "Suitable opportunities", "Interview preparation", "Skills development"]
    },
    {
      key: "existing_cv_status",
      title: "Existing CV status",
      prompt: "Do you already have a CV?",
      options: ["Yes", "No", "Yes, but it needs improvement"]
    },
    {
      key: "immediate_employment_goal",
      title: "Immediate employment goal",
      prompt: "What are you trying to do next?",
      options: ["Find a job", "Change career", "Find an internship or learnership", "Build work experience", "Find freelance or income opportunities"]
    },
    {
      key: "current_readiness",
      title: "Current readiness",
      prompt: "How ready do you feel today?",
      options: ["I do not know where to begin", "I have some information but need guidance", "I am mostly ready and need stronger applications", "I am actively applying and need better results"]
    }
  ],
  fr: [
    {
      key: "current_situation",
      title: "Situation actuelle",
      prompt: "Quelle option decrit le mieux votre point de depart ?",
      options: ["Premiere recherche d'emploi", "Sans emploi et en recherche active", "En emploi et ouvert a de nouvelles opportunites", "Etudiant ou jeune diplome", "Independant ou freelance", "Retour au travail"]
    },
    {
      key: "main_support_needed",
      title: "Aide principale",
      prompt: "Qu'est-ce qui vous aiderait le plus maintenant ?",
      options: ["Direction professionnelle", "Profil professionnel", "CV et lettre de motivation", "Opportunites adaptees", "Preparation aux entretiens", "Developpement des competences"]
    },
    {
      key: "existing_cv_status",
      title: "Etat du CV",
      prompt: "Avez-vous deja un CV ?",
      options: ["Oui", "Non", "Oui, mais il doit etre ameliore"]
    },
    {
      key: "immediate_employment_goal",
      title: "Objectif immediat",
      prompt: "Quelle est votre prochaine etape ?",
      options: ["Trouver un emploi", "Changer de carriere", "Trouver un stage ou une alternance", "Acquerir de l'experience", "Trouver des opportunites freelance ou de revenu"]
    },
    {
      key: "current_readiness",
      title: "Preparation actuelle",
      prompt: "A quel point vous sentez-vous pret aujourd'hui ?",
      options: ["Je ne sais pas par ou commencer", "J'ai quelques informations mais j'ai besoin d'etre guide", "Je suis presque pret et j'ai besoin de candidatures plus solides", "Je postule deja et j'ai besoin de meilleurs resultats"]
    }
  ]
};

export function emptyEmploymentReadinessAnswers(): EmploymentReadinessAnswers {
  return Object.fromEntries(employmentReadinessAnswerKeys.map((key) => [key, ""])) as EmploymentReadinessAnswers;
}

export function normalizeEmploymentReadinessAnswers(value: unknown): EmploymentReadinessAnswers {
  const source = value && typeof value === "object" ? (value as Partial<Record<EmploymentReadinessAnswerKey, unknown>>) : {};
  return Object.fromEntries(employmentReadinessAnswerKeys.map((key) => [key, typeof source[key] === "string" ? source[key] : ""])) as EmploymentReadinessAnswers;
}

export function isEmploymentReadinessComplete(value: unknown): boolean {
  const answers = normalizeEmploymentReadinessAnswers(value);
  return employmentReadinessAnswerKeys.every((key) => answers[key].trim().length > 0);
}

export function employmentReadinessObservation(language: SupportedLanguageCode, answers: EmploymentReadinessAnswers): string[] {
  const observations: string[] = [];
  const firstOpportunity = ["First-time job seeker", "Student or recent graduate", "Premiere recherche d'emploi", "Etudiant ou jeune diplome"].includes(answers.current_situation);
  const careerChange = ["Change career", "Changer de carriere"].includes(answers.immediate_employment_goal);
  const hasCv = ["Yes", "Yes, but it needs improvement", "Oui", "Oui, mais il doit etre ameliore"].includes(answers.existing_cv_status);

  if (language === "fr") {
    if (firstOpportunity) observations.push("Vous cherchez une premiere opportunite, donc PATHZY vous aidera a valoriser votre formation, vos competences et vos projets.");
    if (careerChange) observations.push("Vous changez de direction, donc nous vous aiderons a reperer les competences transferables.");
    if (hasCv) observations.push("Vous avez deja un CV, donc PATHZY pourra ensuite vous aider a le verifier et a le renforcer.");
    return observations.slice(0, 2);
  }

  if (firstOpportunity) observations.push("You are looking for an early opportunity, so PATHZY will help you highlight your education, skills and projects.");
  if (careerChange) observations.push("You are changing direction, so PATHZY will help you identify transferable strengths.");
  if (hasCv) observations.push("You already have a CV, so later PATHZY can help you review and strengthen it.");
  return observations.slice(0, 2);
}
