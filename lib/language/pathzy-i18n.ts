import { type SupportedLanguageCode } from "@/lib/language/language-preferences";

import type { DiscoveryAnswerKey } from "@/lib/discovery/discovery-answer-state";

export type PathzyTranslationKey =
  | "public.nav.home"
  | "public.nav.features"
  | "public.nav.how"
  | "public.nav.journey"
  | "public.nav.pricing"
  | "public.nav.testimonials"
  | "public.nav.faq"
  | "public.nav.start"
  | "public.nav.login"
  | "public.hero.eyebrow"
  | "public.hero.title"
  | "public.hero.body"
  | "public.hero.trust"
  | "public.features.eyebrow"
  | "public.features.title"
  | "public.features.body"
  | "auth.signup.eyebrow"
  | "auth.signup.title"
  | "auth.signup.body"
  | "auth.signup.fullName"
  | "auth.signup.fullNamePlaceholder"
  | "auth.signup.email"
  | "auth.signup.emailPlaceholder"
  | "auth.signup.password"
  | "auth.signup.passwordPlaceholder"
  | "auth.signup.loading"
  | "auth.signup.submit"
  | "auth.signup.confirmEmail"
  | "auth.signup.loginPrompt"
  | "auth.signup.loginLink"
  | "auth.login.eyebrow"
  | "auth.login.title"
  | "auth.login.body"
  | "auth.login.email"
  | "auth.login.emailPlaceholder"
  | "auth.login.password"
  | "auth.login.passwordPlaceholder"
  | "auth.login.loading"
  | "auth.login.submit"
  | "auth.login.google"
  | "auth.login.forgot"
  | "auth.login.signupPrompt"
  | "auth.login.signupLink"
  | "auth.login.sessionMissing"
  | "auth.login.setupError"
  | "onboarding.shell.progress"
  | "onboarding.shell.foundation"
  | "onboarding.shell.step"
  | "onboarding.shell.requiredComplete"
  | "onboarding.shell.requiredProgress"
  | "onboarding.save.ready"
  | "onboarding.save.unsaved"
  | "onboarding.save.saving"
  | "onboarding.save.stillSaving"
  | "onboarding.save.saved"
  | "onboarding.save.error"
  | "onboarding.save.retry"
  | "onboarding.welcome.title"
  | "onboarding.welcome.subheadline"
  | "onboarding.welcome.body"
  | "onboarding.welcome.reassurance"
  | "onboarding.welcome.reassurancePoints"
  | "onboarding.welcome.action"
  | "onboarding.interface.title"
  | "onboarding.interface.body"
  | "onboarding.interface.explanation"
  | "onboarding.interface.required"
  | "onboarding.interface.legend"
  | "onboarding.document.title"
  | "onboarding.document.body"
  | "onboarding.document.explanation"
  | "onboarding.document.examplePairs"
  | "onboarding.document.exampleInterface"
  | "onboarding.document.exampleDocuments"
  | "onboarding.document.required"
  | "onboarding.document.legend"
  | "onboarding.document.sameAsInterface"
  | "onboarding.coach.title"
  | "onboarding.coach.body"
  | "onboarding.coach.pause"
  | "onboarding.coach.support"
  | "onboarding.coach.supportAreas"
  | "onboarding.coach.action"
  | "onboarding.continue"
  | "onboarding.back"
  | "onboarding.review"
  | "identity.page.eyebrow"
  | "identity.page.title"
  | "identity.page.reviewTitle"
  | "identity.page.body"
  | "identity.page.reviewBody"
  | "identity.steps.title"
  | "identity.status.completed"
  | "identity.status.current"
  | "identity.status.available"
  | "identity.status.locked"
  | "identity.status.optional"
  | "identity.status.needsAttention"
  | "identity.locked.help";

const translations: Record<SupportedLanguageCode, Record<PathzyTranslationKey, string>> = {
  en: {
    "public.nav.home": "Home",
    "public.nav.features": "Features",
    "public.nav.how": "How PATHZY Works",
    "public.nav.journey": "Career Journey",
    "public.nav.pricing": "Pricing",
    "public.nav.testimonials": "Testimonials",
    "public.nav.faq": "FAQ",
    "public.nav.start": "Start Free",
    "public.nav.login": "Login",
    "public.hero.eyebrow": "The AI Employment Support System",
    "public.hero.title": "From Potential to Employment.",
    "public.hero.body": "PATHZY helps you define your direction, create professional documents, find suitable opportunities and prepare for interviews, step by step.",
    "public.hero.trust": "No credit card required. We guide you every step of the way.",
    "public.features.eyebrow": "Features",
    "public.features.title": "Everything points toward employability.",
    "public.features.body": "PATHZY brings the pieces of career support into one calm journey instead of scattered tools.",
    "auth.signup.eyebrow": "Sign Up",
    "auth.signup.title": "Start building your future today.",
    "auth.signup.body": "Create your account first. PATHZY will collect the rest inside your Professional Identity, one step at a time.",
    "auth.signup.fullName": "Full name",
    "auth.signup.fullNamePlaceholder": "Your name",
    "auth.signup.email": "Email",
    "auth.signup.emailPlaceholder": "you@example.com",
    "auth.signup.password": "Password",
    "auth.signup.passwordPlaceholder": "Create a password",
    "auth.signup.loading": "Creating...",
    "auth.signup.submit": "Create my account",
    "auth.signup.confirmEmail": "Check your email to confirm your account.",
    "auth.signup.loginPrompt": "Already have an account?",
    "auth.signup.loginLink": "Login",
    "auth.login.eyebrow": "Login",
    "auth.login.title": "Welcome back to PATHZY.",
    "auth.login.body": "Continue your employment journey, Professional Identity, documents, opportunities, and next steps.",
    "auth.login.email": "Email",
    "auth.login.emailPlaceholder": "you@example.com",
    "auth.login.password": "Password",
    "auth.login.passwordPlaceholder": "Your password",
    "auth.login.loading": "Logging in...",
    "auth.login.submit": "Login",
    "auth.login.google": "Continue with Google",
    "auth.login.forgot": "Forgot password?",
    "auth.login.signupPrompt": "New to PATHZY?",
    "auth.login.signupLink": "Create an account",
    "auth.login.sessionMissing": "Login succeeded, but PATHZY could not read your session yet. Please refresh and try again.",
    "auth.login.setupError": "PATHZY is still setting up your profile. Please refresh or try again.",
    "onboarding.shell.progress": "Progress",
    "onboarding.shell.foundation": "Foundation",
    "onboarding.shell.step": "Setup step",
    "onboarding.shell.requiredComplete": "Required setup complete",
    "onboarding.shell.requiredProgress": "Required setup in progress",
    "onboarding.save.ready": "Saved",
    "onboarding.save.unsaved": "Unsaved changes",
    "onboarding.save.saving": "Saving...",
    "onboarding.save.stillSaving": "Still saving...",
    "onboarding.save.saved": "Saved",
    "onboarding.save.error": "Could not save",
    "onboarding.save.retry": "Retry",
    "onboarding.welcome.title": "Welcome to PATHZY.",
    "onboarding.welcome.subheadline": "We're here to help you become visible, prepared, informed, protected and connected to the right employment opportunities.",
    "onboarding.welcome.body": "We'll guide you step by step as you build the professional foundation PATHZY will use throughout your employment journey.",
    "onboarding.welcome.reassurance": "Your progress is saved, and you stay in control.",
    "onboarding.welcome.reassurancePoints": "Your progress is saved.|You can continue at any time.|You remain in control of your information.",
    "onboarding.welcome.action": "Let's Begin",
    "onboarding.interface.title": "Choose your interface language.",
    "onboarding.interface.body": "This controls the language PATHZY uses to communicate with you.",
    "onboarding.interface.explanation": "Your interface language controls navigation, guidance and onboarding. You can change it later.",
    "onboarding.interface.required": "Choose the language PATHZY should use for navigation and guidance.",
    "onboarding.interface.legend": "Interface language",
    "onboarding.document.title": "Choose the language for your professional documents.",
    "onboarding.document.body": "Your CV, cover letters, LinkedIn profile and professional bio may use a different language from the PATHZY interface.",
    "onboarding.document.explanation": "Choose the language employers should see in the documents PATHZY helps you prepare.",
    "onboarding.document.examplePairs": "Interface: French|Documents: English",
    "onboarding.document.exampleInterface": "Interface = English",
    "onboarding.document.exampleDocuments": "Documents = English or French",
    "onboarding.document.required": "Choose the language PATHZY should use for professional documents.",
    "onboarding.document.legend": "Professional document language",
    "onboarding.document.sameAsInterface": "Same as interface language",
    "onboarding.coach.title": "Meet your Career Coach.",
    "onboarding.coach.body": "Your PATHZY Career Coach will guide you through your employment journey.",
    "onboarding.coach.pause": "PATHZY focuses on employment support while keeping you in control of every decision.",
    "onboarding.coach.support": "Ask for help, improve your documents and prepare for the next step whenever you need it.",
    "onboarding.coach.supportAreas": "career direction|Professional Identity|CV and cover-letter preparation|job decisions|interview preparation|encouragement and practical guidance",
    "onboarding.coach.action": "Continue",
    "onboarding.continue": "Continue",
    "onboarding.back": "Back",
    "onboarding.review": "Review My Information",
    "identity.page.eyebrow": "Professional Identity",
    "identity.page.title": "Let's build your Professional Identity",
    "identity.page.reviewTitle": "Review My Information",
    "identity.page.body": "This is the information PATHZY will use to support your employment journey. Your progress is saved automatically.",
    "identity.page.reviewBody": "Check the information PATHZY will use in your documents, job matching, applications, interview preparation, and career support.",
    "identity.steps.title": "Identity steps",
    "identity.status.completed": "Completed",
    "identity.status.current": "Current",
    "identity.status.available": "Available",
    "identity.status.locked": "Locked",
    "identity.status.optional": "Optional",
    "identity.status.needsAttention": "Needs attention",
    "identity.locked.help": "Complete the previous required step first."
  },
  fr: {
    "public.nav.home": "Accueil",
    "public.nav.features": "Fonctionnalités",
    "public.nav.how": "Comment PATHZY fonctionne",
    "public.nav.journey": "Parcours vers l'emploi",
    "public.nav.pricing": "Tarifs",
    "public.nav.testimonials": "Témoignages",
    "public.nav.faq": "FAQ",
    "public.nav.start": "Commencer",
    "public.nav.login": "Connexion",
    "public.hero.eyebrow": "Le système d'accompagnement vers l'emploi",
    "public.hero.title": "De votre potentiel à l'emploi.",
    "public.hero.body": "PATHZY vous aide à définir votre orientation, créer des documents professionnels, trouver des opportunités adaptées et vous préparer aux entretiens, étape par étape.",
    "public.hero.trust": "Aucune carte bancaire requise. Nous vous guidons à chaque étape.",
    "public.features.eyebrow": "Fonctionnalités",
    "public.features.title": "Tout est orienté vers l'employabilité.",
    "public.features.body": "PATHZY rassemble l'accompagnement professionnel dans un parcours clair, au lieu d'outils dispersés.",
    "auth.signup.eyebrow": "Inscription",
    "auth.signup.title": "Commencez à construire votre avenir.",
    "auth.signup.body": "Créez d'abord votre compte. PATHZY recueillera le reste dans votre Identité Professionnelle, étape par étape.",
    "auth.signup.fullName": "Nom complet",
    "auth.signup.fullNamePlaceholder": "Votre nom",
    "auth.signup.email": "E-mail",
    "auth.signup.emailPlaceholder": "vous@exemple.com",
    "auth.signup.password": "Mot de passe",
    "auth.signup.passwordPlaceholder": "Créer un mot de passe",
    "auth.signup.loading": "Création...",
    "auth.signup.submit": "Créer mon compte",
    "auth.signup.confirmEmail": "Consultez votre e-mail pour confirmer votre compte.",
    "auth.signup.loginPrompt": "Vous avez déjà un compte ?",
    "auth.signup.loginLink": "Connexion",
    "auth.login.eyebrow": "Connexion",
    "auth.login.title": "Bon retour sur PATHZY.",
    "auth.login.body": "Reprenez votre parcours vers l'emploi, votre Identité Professionnelle, vos documents, vos opportunités et vos prochaines étapes.",
    "auth.login.email": "E-mail",
    "auth.login.emailPlaceholder": "vous@exemple.com",
    "auth.login.password": "Mot de passe",
    "auth.login.passwordPlaceholder": "Votre mot de passe",
    "auth.login.loading": "Connexion...",
    "auth.login.submit": "Connexion",
    "auth.login.google": "Continuer avec Google",
    "auth.login.forgot": "Mot de passe oublié ?",
    "auth.login.signupPrompt": "Nouveau sur PATHZY ?",
    "auth.login.signupLink": "Créer un compte",
    "auth.login.sessionMissing": "La connexion a réussi, mais PATHZY ne peut pas encore lire votre session. Actualisez et réessayez.",
    "auth.login.setupError": "PATHZY configure encore votre profil. Actualisez ou réessayez.",
    "onboarding.shell.progress": "Progression",
    "onboarding.shell.foundation": "Fondation",
    "onboarding.shell.step": "Étape de configuration",
    "onboarding.shell.requiredComplete": "Configuration requise terminée",
    "onboarding.shell.requiredProgress": "Configuration requise en cours",
    "onboarding.save.ready": "Enregistré",
    "onboarding.save.unsaved": "Modifications non enregistrées",
    "onboarding.save.saving": "Enregistrement...",
    "onboarding.save.stillSaving": "Enregistrement en cours...",
    "onboarding.save.saved": "Enregistré",
    "onboarding.save.error": "Impossible d'enregistrer",
    "onboarding.save.retry": "Réessayer",
    "onboarding.welcome.title": "Bienvenue sur PATHZY.",
    "onboarding.welcome.subheadline": "Nous sommes là pour vous aider à devenir visible, préparé, informé, protégé et connecté aux bonnes opportunités d'emploi.",
    "onboarding.welcome.body": "Nous vous guidons étape par étape pendant que vous construisez la base professionnelle que PATHZY utilisera tout au long de votre parcours vers l'emploi.",
    "onboarding.welcome.reassurance": "Votre progression est enregistrée et vous gardez le contrôle.",
    "onboarding.welcome.reassurancePoints": "Votre progression est enregistrée.|Vous pouvez continuer plus tard.|Vous gardez le contrôle de vos informations.",
    "onboarding.welcome.action": "Commençons",
    "onboarding.interface.title": "Choisissez la langue de l'interface.",
    "onboarding.interface.body": "Ce choix contrôle la langue que PATHZY utilise pour communiquer avec vous.",
    "onboarding.interface.explanation": "La langue de l'interface contrôle la navigation, les conseils et l'accompagnement. Vous pourrez la modifier plus tard.",
    "onboarding.interface.required": "Choisissez la langue que PATHZY doit utiliser pour la navigation et les conseils.",
    "onboarding.interface.legend": "Langue de l'interface",
    "onboarding.document.title": "Choisissez la langue de vos documents professionnels.",
    "onboarding.document.body": "Votre CV, vos lettres de motivation, votre profil LinkedIn et votre bio professionnelle peuvent utiliser une langue différente de l'interface PATHZY.",
    "onboarding.document.explanation": "Choisissez la langue que les employeurs verront dans les documents que PATHZY vous aide à préparer.",
    "onboarding.document.examplePairs": "Interface : Français|Documents : English",
    "onboarding.document.exampleInterface": "Interface = Français",
    "onboarding.document.exampleDocuments": "Documents = English ou Français",
    "onboarding.document.required": "Choisissez la langue que PATHZY doit utiliser pour vos documents professionnels.",
    "onboarding.coach.title": "Découvrez votre Coach de carrière.",
    "onboarding.coach.body": "Votre Coach PATHZY vous guidera tout au long de votre parcours vers l'emploi.",
    "onboarding.coach.pause": "PATHZY se concentre sur l'accompagnement vers l'emploi tout en vous laissant le contrôle de chaque décision.",
    "onboarding.coach.support": "Demandez de l'aide, améliorez vos documents et préparez la prochaine étape quand vous en avez besoin.",
    "onboarding.coach.supportAreas": "orientation professionnelle|Identité Professionnelle|préparation du CV et de la lettre de motivation|décisions d'emploi|préparation aux entretiens|encouragement et conseils pratiques",
    "onboarding.coach.action": "Continuer",
    "onboarding.document.legend": "Langue des documents professionnels",
    "onboarding.document.sameAsInterface": "Même langue que l'interface",
    "onboarding.continue": "Continuer",
    "onboarding.back": "Retour",
    "onboarding.review": "Vérifier mes informations",
    "identity.page.eyebrow": "Identité Professionnelle",
    "identity.page.title": "Construisons votre Identité Professionnelle",
    "identity.page.reviewTitle": "Vérifier mes informations",
    "identity.page.body": "Ces informations aideront PATHZY à accompagner votre parcours vers l'emploi. Votre progression est enregistrée automatiquement.",
    "identity.page.reviewBody": "Vérifiez les informations que PATHZY utilisera pour vos documents, le matching d'emploi, les candidatures, les entretiens et l'accompagnement professionnel.",
    "identity.steps.title": "Étapes de l'identité",
    "identity.status.completed": "Terminée",
    "identity.status.current": "En cours",
    "identity.status.available": "Disponible",
    "identity.status.locked": "Verrouillée",
    "identity.status.optional": "Optionnelle",
    "identity.status.needsAttention": "À compléter",
    "identity.locked.help": "Complétez d'abord l'étape requise précédente."
  }
};

export const professionalIdentitySectionTranslations: Record<SupportedLanguageCode, Record<string, string>> = {
  en: {
    profile: "Profile",
    photo: "Photo",
    personal_information: "Personal Information",
    location: "Location",
    nationality: "Nationality",
    work_authorization: "Work Authorization",
    career_goal: "Career Goal",
    professional_summary: "Professional Summary",
    education: "Education",
    experience: "Experience",
    skills: "Skills",
    projects: "Projects",
    achievements: "Achievements",
    certificates: "Certificates",
    licences: "Licences",
    languages: "Languages",
    references: "References",
    portfolio: "Portfolio",
    social_profiles: "Social Profiles",
    preferences: "Preferences",
    employment_preferences: "Employment Preferences",
    salary_expectations: "Salary Expectations",
    availability: "Availability"
  },
  fr: {
    profile: "Profil",
    photo: "Photo",
    personal_information: "Informations personnelles",
    location: "Localisation",
    nationality: "Nationalité",
    work_authorization: "Autorisation de travail",
    career_goal: "Objectif professionnel",
    professional_summary: "Résumé professionnel",
    education: "Formation",
    experience: "Expérience",
    skills: "Compétences",
    projects: "Projets",
    achievements: "Réalisations",
    certificates: "Certificats",
    licences: "Licences professionnelles",
    languages: "Langues",
    references: "Références",
    portfolio: "Portfolio",
    social_profiles: "Profils sociaux",
    preferences: "Préférences",
    employment_preferences: "Préférences d'emploi",
    salary_expectations: "Prétentions salariales",
    availability: "Disponibilité"
  }
};

export const pathzyNavigationTranslations: Record<SupportedLanguageCode, Record<string, string>> = {
  en: {
    Home: "Home",
    "Professional Identity": "Professional Identity",
    "Employment Center": "Employment Center",
    Jobs: "Jobs",
    Applications: "Applications",
    "Interview Preparation": "Interview Preparation",
    "Career Plan": "Career Plan",
    "Career Analytics": "Career Analytics",
    Coach: "Coach",
    Settings: "Settings",
    Billing: "Billing",
    "Skills & Career Growth": "Skills & Career Growth"
  },
  fr: {
    Home: "Accueil",
    "Professional Identity": "Identité Professionnelle",
    "Employment Center": "Centre emploi",
    Jobs: "Opportunités",
    Applications: "Candidatures",
    "Interview Preparation": "Préparation à l'entretien",
    "Career Plan": "Plan de carrière",
    "Career Analytics": "Analyse de carrière",
    Coach: "Coach",
    Settings: "Paramètres",
    Billing: "Facturation",
    "Skills & Career Growth": "Compétences et évolution"
  }
};

export function pathzyNavigationLabel(language: SupportedLanguageCode, label: string) {
  return pathzyNavigationTranslations[language]?.[label] ?? label;
}

export function pathzyT(language: SupportedLanguageCode, key: PathzyTranslationKey) {
  return translations[language]?.[key] ?? translations.en[key];
}

export const publicLandingContent = {
  en: {
    features: [
      ["Career Discovery", "Understand your strengths, interests, lifestyle goals, and best next career direction."],
      ["Professional Documents", "Create a recruiter-ready CV, cover letter, LinkedIn profile, and Career Passport."],
      ["Opportunity Support", "Find roles, internships, scholarships, and practical next steps connected to your goal."],
      ["Interview Readiness", "Practice how to explain your story, projects, strengths, and growth areas with confidence."]
    ],
    steps: [
      ["1", "Discover your path", "Answer simple questions so PATHZY can understand where you are and what you want."],
      ["2", "Build your proof", "Create documents, portfolio signals, skills, and application materials that employers understand."],
      ["3", "Apply with focus", "Track opportunities, prepare interviews, and keep moving toward employment every week."]
    ],
    journey: ["Complete Profile", "Employment Diagnosis", "Choose Career Goal", "Create CV", "Create Cover Letter", "Find Opportunities", "Track Applications", "Interview Practice", "Employment"],
    pricing: [
      ["Free", "$0", "Start your employment journey with guidance, previews, and core journey steps."],
      ["Starter", "$9.99/month", "Unlock downloads, saves, and premium professional document actions."],
      ["Pro", "$24.99/month", "Add deeper coaching, application review, and interview preparation."],
      ["Premium", "$49.99/month", "For advanced career growth, executive positioning, and priority support."]
    ],
    testimonials: [
      ["Arlene", "PATHZY made the next step feel clear instead of overwhelming."],
      ["Junior applicant", "I finally understood what to fix before applying."],
      ["Career changer", "The journey helped me connect my skills to real opportunities."]
    ],
    faqs: [
      ["Is PATHZY only a CV builder?", "No. PATHZY is an employment support system. Documents are one part of the journey."],
      ["Can I start for free?", "Yes. You can begin with guidance, previews, and core journey steps."],
      ["What changes with Premium?", "Premium unlocks advanced actions such as exports, unlimited AI support, and premium templates."],
      ["Who is PATHZY for?", "Students, graduates, unemployed job seekers, career changers, and anyone building employability."]
    ],
    sectionHeaders: {
      how: ["How PATHZY Works", "A simple path from confusion to action.", "You always know where you are, why it matters, and what to do next."],
      journey: ["Career Journey", "Your journey stays visible.", "PATHZY keeps the employment path clear from first profile setup to interviews and employment."],
      pricing: ["Pricing", "Start free. Upgrade when action matters.", "Everyone gets one shared PATHZY workflow. Paid plans unlock premium actions, not a different product."],
      testimonials: ["Testimonials", "Built for people who need clarity.", "PATHZY should feel practical, encouraging, and useful from the first session."],
      faq: ["FAQ", "Questions before you begin.", "PATHZY is designed to feel simple even when your career situation feels complicated."]
    },
    stepLabel: "Step",
    footer: "PATHZY - The Employment Support System"
  },
  fr: {
    features: [
      ["Orientation professionnelle", "Clarifiez vos forces, vos intérêts, vos objectifs de vie et votre prochaine direction professionnelle."],
      ["Documents professionnels", "Créez un CV, une lettre de motivation, un profil LinkedIn et un Passeport Carrière prêts pour les recruteurs."],
      ["Soutien aux opportunités", "Trouvez des rôles, stages, bourses et prochaines étapes pratiques liés à votre objectif."],
      ["Préparation aux entretiens", "Entraînez-vous à expliquer votre parcours, vos projets, vos forces et vos axes de progrès avec confiance."]
    ],
    steps: [
      ["1", "Clarifiez votre direction", "Répondez à des questions simples pour que PATHZY comprenne votre situation et vos objectifs."],
      ["2", "Construisez vos preuves", "Créez les documents, signaux de portfolio, compétences et candidatures que les employeurs comprennent."],
      ["3", "Postulez avec méthode", "Suivez les opportunités, préparez les entretiens et avancez chaque semaine vers l'emploi."]
    ],
    journey: ["Compléter le profil", "Diagnostic d'employabilité", "Choisir l'objectif", "Créer le CV", "Créer la lettre", "Trouver des opportunités", "Suivre les candidatures", "Préparer l'entretien", "Emploi"],
    pricing: [
      ["Gratuit", "$0", "Commencez votre parcours vers l'emploi avec des conseils, des aperçus et les étapes essentielles."],
      ["Starter", "$9.99/mois", "Débloquez les téléchargements, sauvegardes et actions premium sur les documents."],
      ["Pro", "$24.99/mois", "Ajoutez un accompagnement plus approfondi, la revue de candidature et la préparation aux entretiens."],
      ["Premium", "$49.99/mois", "Pour la progression professionnelle avancée, le positionnement exécutif et le support prioritaire."]
    ],
    testimonials: [
      ["Arlene", "PATHZY a rendu la prochaine étape claire au lieu d'être écrasante."],
      ["Jeune candidat", "J'ai enfin compris ce que je devais améliorer avant de postuler."],
      ["Reconversion", "Le parcours m'a aidé à relier mes compétences à de vraies opportunités."]
    ],
    faqs: [
      ["PATHZY est-il seulement un créateur de CV ?", "Non. PATHZY est un système d'accompagnement vers l'emploi. Les documents ne sont qu'une partie du parcours."],
      ["Puis-je commencer gratuitement ?", "Oui. Vous pouvez commencer avec des conseils, des aperçus et les étapes essentielles."],
      ["Qu'apporte Premium ?", "Premium débloque des actions avancées comme les exports, l'IA illimitée et les modèles premium."],
      ["À qui s'adresse PATHZY ?", "Aux étudiants, diplômés, personnes sans emploi, personnes en reconversion et à toute personne qui construit son employabilité."]
    ],
    sectionHeaders: {
      how: ["Comment PATHZY fonctionne", "Un parcours simple de la confusion à l'action.", "Vous savez toujours où vous en êtes, pourquoi cela compte et quoi faire ensuite."],
      journey: ["Parcours vers l'emploi", "Votre parcours reste visible.", "PATHZY garde le chemin vers l'emploi clair, de la configuration du profil aux entretiens."],
      pricing: ["Tarifs", "Commencez gratuitement. Débloquez les actions quand elles comptent.", "Tout le monde utilise le même parcours PATHZY. Les offres payantes débloquent des actions premium, pas un autre produit."],
      testimonials: ["Témoignages", "Conçu pour les personnes qui ont besoin de clarté.", "PATHZY doit être pratique, encourageant et utile dès la première session."],
      faq: ["FAQ", "Questions avant de commencer.", "PATHZY est conçu pour rester simple même quand votre situation professionnelle semble compliquée."]
    },
    stepLabel: "Étape",
    footer: "PATHZY - Le système d'accompagnement vers l'emploi"
  }
} as const;

const phase2Translations = {
  en: {
    "language.selector.label": "Interface language",
    "language.selector.public": "Public language",
    "language.saving": "Saving language preference",
    "language.saved": "Language preference saved",
    "language.error": "Language preference could not be saved",
    "public.footer.privacy": "Privacy",
    "public.footer.terms": "Terms",
    "public.footer.contact": "Contact",
    "auth.notice.message": "Something needs a quick setup before accounts can be used. Please ask the PATHZY team to finish setup, then refresh and try again. See",
    "auth.notice.settings": "Settings",
    "auth.notice.after": "for setup guidance.",
    "auth.logout": "Logout",
    "auth.reset.eyebrow": "Password Reset",
    "auth.reset.title": "Get back into PATHZY.",
    "auth.reset.body": "Enter your email and PATHZY will send a secure link to reset your password.",
    "auth.reset.success": "Password reset link sent. Check your email.",
    "auth.reset.failure": "Unable to send reset link.",
    "auth.reset.sending": "Sending...",
    "auth.reset.submit": "Send Reset Link",
    "auth.reset.remembered": "Remembered it?",
    "auth.update.eyebrow": "New Password",
    "auth.update.title": "Choose a secure new password.",
    "auth.update.body": "After updating your password, PATHZY will take you back to Home.",
    "auth.update.password": "New password",
    "auth.update.placeholder": "Create a new password",
    "auth.update.failure": "Unable to update password.",
    "auth.update.saving": "Updating...",
    "auth.update.submit": "Update Password",
    "auth.error.network": "We couldn't connect to PATHZY right now. Check your connection and try again.",
    "auth.error.signup.exists": "This email already has a PATHZY account. Please log in instead.",
    "auth.error.signup.password": "Your password must be at least 8 characters.",
    "auth.error.signup.generic": "We could not create your account. Please try again.",
    "auth.error.login.confirmEmail": "Email not confirmed. Please open the confirmation email from PATHZY, then log in again.",
    "auth.error.login.invalid": "Wrong password or account not found. Check your email and password, then try again.",
    "auth.error.login.notFound": "Account not found. Create an account first, or check that the email is correct.",
    "auth.error.login.generic": "We could not log you in. Please try again.",
    "onboarding.welcome.reassurancePoints": "Your progress is saved.|You can continue at any time.|You remain in control of your information.",
    "onboarding.document.examplePairs": "Interface: French|Documents: English",
    "onboarding.coach.supportAreas": "career direction|Professional Identity|CV and cover-letter preparation|job decisions|interview preparation|encouragement and practical guidance",
    "identity.ui.setupEyebrow": "PATHZY setup",
    "identity.ui.foundationValue": "Professional Identity",
    "identity.intro.title": "Your Professional Identity.",
    "identity.intro.body": "Everything you enter here becomes the trusted foundation for your CVs, cover letters, LinkedIn, Professional Bio, job matching, interview preparation, career intelligence, employment opportunities and future updates.",
    "identity.intro.powers": "CVs|Cover Letters|LinkedIn|Professional Bio|Job Matching|Interview Preparation|Career Intelligence|Employment Opportunities",
    "identity.intro.reassurance": "Build it once. Update it whenever your career changes. PATHZY keeps connected areas aligned.",
    "identity.intro.action": "Build My Professional Identity",
    "identity.ui.progressAria": "Professional Identity progress",
    "identity.ui.estimatedTime": "Estimated time",
    "identity.ui.estimatedValue": "10-15 minutes",
    "identity.ui.automaticallySaved": "Automatically saved",
    "identity.ui.begin": "Let's Begin",
    "identity.ui.stepConnector": "of",
    "identity.ui.addItem": "Add item",
    "identity.ui.remove": "Remove",
    "identity.ui.emptyList": "Nothing added yet. Add one item when you are ready.",
    "identity.ui.addDetails": "Add details",
    "identity.ui.preferredRole": "Preferred role",
    "identity.ui.industry": "Industry",
    "identity.ui.progress": "Progress",
    "identity.ui.youStillNeed": "You still need:",
    "identity.ui.completePrefix": "Complete:",
    "identity.ui.missingPrefix": "Missing:",
    "identity.ui.continueWith": "Continue with",
    "identity.ui.requiredField": "Required field",
    "identity.sync.dependents": "CV · Cover Letter · LinkedIn · Job Matches · Interview Preparation",
    "identity.suggestions.skills": "Communication|Microsoft Excel|Microsoft Word|Customer service|Problem solving|Teamwork|SQL|Data analysis|Administration|Project coordination|Leadership|Research",
    "identity.importance.required": "Required",
    "identity.importance.recommended": "Recommended",
    "identity.importance.optional": "Optional",
    "identity.ui.readyForReview": "Ready for review",
    "identity.ui.requiredDetailsNeeded": "Required details needed",
    "identity.ui.reviewBeforeHome": "Review your information before Home.",
    "identity.ui.finishRequired": "Finish the required steps to continue.",
    "identity.ui.reviewExplanation": "Check the information PATHZY will use for documents, job matching, applications, interviews, and career support.",
    "identity.ui.requiredSectionsExplanation": "Required sections are marked in the step list. Recommended and optional sections can be improved later.",
    "identity.ui.uploadedDocuments": "Uploaded documents already connected to your profile:",
    "identity.ui.openDocuments": "Open Documents",
    "identity.photo.add": "Add a photo",
    "identity.photo.chooseDevice": "Choose from device",
    "identity.photo.replace": "Replace photo",
    "identity.photo.crop": "Reposition / Crop",
    "identity.photo.preview": "Preview",
    "identity.photo.previewAlt": "Professional photo preview",
    "identity.photo.remove": "Remove photo",
    "identity.photo.retry": "Retry",
    "identity.photo.continueWithout": "Continue without photo",
    "identity.photo.empty": "No professional photo saved yet.",
    "identity.photo.emptyTitle": "Add your professional photo",
    "identity.photo.emptyBody": "A photo is optional. If you add one, PATHZY keeps it private and uses it only where you allow it.",
    "identity.photo.uploadTitle": "Professional photo",
    "identity.photo.guidance": "Choose a clear head-and-shoulders portrait. You can replace or remove it later.",
    "identity.photo.accepted": "Accepted formats:",
    "identity.photo.preparing": "Preparing...",
    "identity.photo.uploading": "Uploading...",
    "identity.photo.processing": "Processing...",
    "identity.photo.saved": "Saved",
    "identity.photo.ready": "Professional photo saved.",
    "identity.photo.removing": "Removing photo...",
    "identity.photo.removed": "Photo removed.",
    "identity.photo.loadWarning": "We could not load the saved photo preview yet.",
    "identity.photo.waitForUpload": "Please wait while the photo upload finishes.",
    "identity.photo.error.unsupported_mime_type": "This file format is not supported. Please upload a JPEG, PNG, or WebP image.",
    "identity.photo.error.extension_mime_mismatch": "The file extension does not match the image type. Please choose the original image file.",
    "identity.photo.error.empty_file": "This image appears to be empty. Please choose another photo.",
    "identity.photo.error.file_too_large": "This photo is too large. Please upload an image smaller than 5MB.",
    "identity.photo.error.image_too_narrow": "This image is too small. Please choose a photo at least 256px wide.",
    "identity.photo.error.image_too_short": "This image is too small. Please choose a photo at least 256px tall.",
    "identity.photo.error.corrupted_image": "We could not read this image. Please choose another photo.",
    "identity.photo.error.storage_unavailable": "Photo storage is not ready yet. Please try again after PATHZY storage is configured.",
    "identity.photo.error.storage_bucket_missing": "Photo storage is not ready yet. PATHZY needs the professional photo storage bucket configured.",
    "identity.photo.error.storage_permission_denied": "Photo storage permissions are blocking this upload. Please ask PATHZY support to verify photo storage policies.",
    "identity.photo.error.upload_failed": "Upload failed - Retry",
    "identity.photo.error.upload_timeout": "Upload failed - Retry",
    "identity.photo.error.metadata_failed": "The photo uploaded, but PATHZY could not save the profile reference. Please retry.",
    "identity.photo.error.delete_failed": "We could not remove this photo yet. Please try again.",
    "identity.photo.error.session_expired": "Your session expired. Please log in again and retry.",
    "identity.photo.permissionsTitle": "Photo permissions",
    "identity.photo.profilePermission": "Show on my PATHZY Professional Profile",
    "identity.photo.cvPermission": "Allow use in CV templates that support photos",
    "identity.photo.publicPermission": "Allow future shared/public profile use",
    "identity.photo.repositionX": "Horizontal position",
    "identity.photo.repositionY": "Vertical position",
    "identity.overview.title": "Professional Identity Overview",
    "identity.overview.body": "Review, update, and keep your employment foundation ready for PATHZY tools.",
    "identity.overview.setupComplete": "Setup complete",
    "identity.overview.setupInProgress": "Setup in progress",
    "identity.overview.resumeSetup": "Resume setup",
    "identity.overview.sectionsTitle": "Your 23 Professional Identity sections",
    "identity.overview.sectionsBody": "Every section remains editable. Required gaps are shown by name, and optional sections can be improved later.",
    "identity.review.requiredComplete": "Required information complete",
    "identity.review.requiredNeedsAttention": "Required information needs attention",
    "identity.review.defaultName": "Your Professional Identity",
    "identity.review.defaultBody": "Review your information before finishing setup.",
    "identity.review.complete": "complete",
    "identity.review.required": "Required",
    "identity.review.recommendedMissing": "Recommended missing",
    "identity.review.optionalMissing": "Optional missing",
    "identity.review.missing": "missing",
    "identity.review.addRequired": "Add this before finishing setup.",
    "identity.review.improveLater": "You can improve this later.",
    "identity.review.edit": "Edit",
    "identity.review.editSection": "Edit section",
    "identity.review.saveReturn": "Save and return to Review",
    "identity.review.cancelReturn": "Cancel and return to Review",
    "identity.review.returnToIdentity": "Return to Professional Identity",
    "identity.review.missingRequiredInformation": "Missing required information",
    "identity.review.completeSection": "Complete section",
    "identity.review.lastUpdated": "Last updated",
    "identity.review.syncStatus": "Sync status",
    "identity.review.upToDate": "Up to date",
    "identity.review.updateAvailable": "Update available",
    "identity.review.notAvailable": "Not available yet",
    "identity.review.notComplete": "Required setup is not complete yet. Start with",
    "identity.review.highlightedSection": "the highlighted section",
    "identity.review.progressTitle": "Professional Identity Progress",
    "identity.review.keepGoing": "Keep going one step at a time.",
    "identity.review.why": "Why this matters",
    "identity.review.whyTitle": "Professional Identity builds the person. Employment Center builds the materials.",
    "identity.review.whyBody": "PATHZY will reuse this one canonical identity later for CVs, cover letters, LinkedIn, job matching, applications, interviews, analytics, and Coach.",
    "identity.save.continueWhenDone": "You can continue when saving finishes.",
    "identity.sync.changed": "Your Professional Identity changed.",
    "identity.sync.mayNeedUpdates": "Updates may be available for the tools that depend on this identity. PATHZY will not regenerate or overwrite approved documents automatically.",
    "identity.finish.saving": "Finishing setup...",
    "identity.finish.saved": "Your progress is saved automatically.",
    "identity.finish.edit": "Continue Editing",
    "identity.finish.submit": "Finish Setup",
    "identity.finish.failure": "We could not finish setup yet. Your information is still saved.",
    "readiness.title": "Employment Readiness Check",
    "readiness.body": "Before we build your Professional Identity, PATHZY needs a quick picture of where you are starting. This is short and situational, not the full Employment Diagnosis.",
    "readiness.required": "Choose one answer before continuing.",
    "readiness.transition.title": "Your Professional Identity.",
    "readiness.transition.body": "Everything you enter here becomes the trusted foundation for your CVs, Cover Letters, LinkedIn, Professional Bio, Job Matching, Interview Preparation, Career Intelligence, Employment Opportunities and future updates.",
    "readiness.transition.thanks": "Thank you. We understand where you are starting.",
    "readiness.transition.general": "Build it once, then PATHZY keeps the rest of your employment tools aligned.",
    "readiness.transition.next": "Professional Identity -> CV -> Cover Letter -> LinkedIn -> Job Matches -> Career Coach -> Interview Preparation.",
    "readiness.transition.action": "Let's Build My Professional Identity",
    "readiness.distinction": "Employment Readiness Check is short and happens before Professional Identity. The full Employment Diagnosis remains after setup and uses stronger evidence to identify readiness gaps and next actions.",
    "discovery.eyebrow": "Employment Diagnosis",
    "discovery.title": "Understand your employment readiness.",
    "discovery.body": "Answer a focused interview so PATHZY can understand your direction, readiness, gaps, and next employment actions.",
    "discovery.step": "Step",
    "discovery.complete": "complete",
    "discovery.back": "Back",
    "discovery.continue": "Continue",
    "discovery.submit": "Create My Employment Diagnosis",
    "discovery.saving": "Building your employment diagnosis...",
    "discovery.required": "Add a short answer before continuing.",
    "discovery.login": "Please log in before completing Employment Diagnosis.",
    "discovery.error": "We could not complete this action yet. Your progress is safe. Please try again.",
    "home.greeting.morning": "Good morning",
    "home.greeting.afternoon": "Good afternoon",
    "home.greeting.evening": "Good evening",
    "home.greeting.fallbackName": "there",
    "home.professionalDirectionFallback": "Professional direction in progress",
    "home.identityLabel": "Professional Identity",
    "home.complete": "complete",
    "home.aria": "PATHZY Home",
    "home.continue.eyebrow": "Continue",
    "home.continue.title": "Continue Your Employment Journey",
    "home.continue.primary": "Continue",
    "home.continue.secondary": "Review Profile",
    "home.continue.progress": "Journey progress",
    "home.employmentCenter.eyebrow": "Employment Center",
    "home.employmentCenter.title": "Employment Center",
    "home.employmentCenter.primary": "Open Employment Center",
    "home.employmentCenter.secondary": "Open Documents",
    "home.employmentCenter.body": "Build and manage the professional evidence employers see: your profile, CV, cover letter, LinkedIn content, and supporting documents.",
    "home.employmentCenter.tags": "Professional Identity|CV|Cover Letter|LinkedIn",
    "home.opportunities.eyebrow": "Jobs",
    "home.opportunities.title": "Opportunities",
    "home.opportunities.primary": "Find Opportunities",
    "home.opportunities.body": "Compare roles, understand what employers require, prepare applications, and keep every next action visible.",
    "home.opportunities.summary": "{active} active applications · {followUps} follow-ups due · {interviews} interviews",
    "home.guidance.eyebrow": "Guidance",
    "home.guidance.title": "Insights & Coach",
    "home.guidance.primary": "Ask Coach",
    "home.guidance.secondary": "View Insights",
    "home.guidance.body": "Get practical guidance based on your profile, documents, job matches, applications, interviews, and follow-ups.",
    "home.guidance.fallbackInsight": "Keep using PATHZY and your insights will become more specific over time.",
    "home.next.completeProfessionalIdentity": "Complete Professional Identity",
    "home.next.completeProfile": "Complete My Professional Profile",
    "home.next.openEmploymentCenter": "Open Employment Center",
    "home.next.trackApplication": "Track application",
    "home.next.startApplication": "Save or start an application",
    "home.next.prepareInterview": "Prepare for interview",
    "home.next.improveSkills": "Improve missing skills",
    "home.next.profileReason": "PATHZY needs your profile details before it can create stronger documents and guidance.",
    "home.next.centerReason": "Use Employment Center to manage CVs, cover letters, LinkedIn content, and other professional materials from one place."
  },
  fr: {
    "language.selector.label": "Langue de l'interface",
    "language.selector.public": "Langue publique",
    "language.saving": "Enregistrement de la langue",
    "language.saved": "Langue enregistrée",
    "language.error": "La langue n'a pas pu être enregistrée",
    "public.footer.privacy": "Confidentialité",
    "public.footer.terms": "Conditions",
    "public.footer.contact": "Contact",
    "auth.notice.message": "Une configuration rapide est nécessaire avant d'utiliser les comptes. Demandez à l'équipe PATHZY de terminer la configuration, puis actualisez et réessayez. Consultez",
    "auth.notice.settings": "Paramètres",
    "auth.notice.after": "pour les informations de configuration.",
    "auth.logout": "Déconnexion",
    "auth.reset.eyebrow": "Réinitialisation du mot de passe",
    "auth.reset.title": "Retrouvez l'accès à PATHZY.",
    "auth.reset.body": "Saisissez votre e-mail et PATHZY vous enverra un lien sécurisé pour réinitialiser votre mot de passe.",
    "auth.reset.success": "Lien de réinitialisation envoyé. Vérifiez votre e-mail.",
    "auth.reset.failure": "Impossible d'envoyer le lien de réinitialisation.",
    "auth.reset.sending": "Envoi...",
    "auth.reset.submit": "Envoyer le lien",
    "auth.reset.remembered": "Vous vous en souvenez ?",
    "auth.update.eyebrow": "Nouveau mot de passe",
    "auth.update.title": "Choisissez un nouveau mot de passe sécurisé.",
    "auth.update.body": "Après la mise à jour, PATHZY vous ramènera à l'accueil.",
    "auth.update.password": "Nouveau mot de passe",
    "auth.update.placeholder": "Créer un nouveau mot de passe",
    "auth.update.failure": "Impossible de mettre à jour le mot de passe.",
    "auth.update.saving": "Mise à jour...",
    "auth.update.submit": "Mettre à jour le mot de passe",
    "auth.error.network": "Nous ne pouvons pas connecter PATHZY pour le moment. Vérifiez votre connexion et réessayez.",
    "auth.error.signup.exists": "Cet e-mail possède déjà un compte PATHZY. Connectez-vous plutôt.",
    "auth.error.signup.password": "Votre mot de passe doit contenir au moins 8 caractères.",
    "auth.error.signup.generic": "Nous n'avons pas pu créer votre compte. Réessayez.",
    "auth.error.login.confirmEmail": "E-mail non confirmé. Ouvrez l'e-mail de confirmation de PATHZY, puis reconnectez-vous.",
    "auth.error.login.invalid": "Mot de passe incorrect ou compte introuvable. Vérifiez votre e-mail et votre mot de passe, puis réessayez.",
    "auth.error.login.notFound": "Compte introuvable. Créez d'abord un compte ou vérifiez l'e-mail.",
    "auth.error.login.generic": "Nous n'avons pas pu vous connecter. Réessayez.",
    "onboarding.welcome.reassurancePoints": "Votre progression est enregistrée.|Vous pouvez continuer plus tard.|Vous gardez le contrôle de vos informations.",
    "onboarding.document.examplePairs": "Interface : Français|Documents : English",
    "onboarding.coach.supportAreas": "orientation professionnelle|Identité Professionnelle|préparation du CV et de la lettre de motivation|décisions d'emploi|préparation aux entretiens|encouragement et conseils pratiques",
    "identity.ui.setupEyebrow": "Configuration PATHZY",
    "identity.ui.foundationValue": "Identité Professionnelle",
    "identity.intro.title": "Votre Identité Professionnelle.",
    "identity.intro.body": "Tout ce que vous saisissez ici devient la base fiable de vos CV, lettres de motivation, LinkedIn, bio professionnelle, matching d'emploi, préparation aux entretiens, intelligence carrière, opportunités d'emploi et futures mises à jour.",
    "identity.intro.powers": "CV|Lettres de motivation|LinkedIn|Bio professionnelle|Matching d'emploi|Préparation aux entretiens|Intelligence carrière|Opportunités d'emploi",
    "identity.intro.reassurance": "Construisez-la une fois. Mettez-la à jour quand votre carrière évolue. PATHZY garde les espaces connectés alignés.",
    "identity.intro.action": "Construire mon Identité Professionnelle",
    "identity.ui.progressAria": "Progression de l'Identité Professionnelle",
    "identity.ui.estimatedTime": "Temps estimé",
    "identity.ui.estimatedValue": "10 à 15 minutes",
    "identity.ui.automaticallySaved": "Enregistré automatiquement",
    "identity.ui.begin": "Commencer",
    "identity.ui.stepConnector": "sur",
    "identity.ui.addItem": "Ajouter un élément",
    "identity.ui.remove": "Supprimer",
    "identity.ui.emptyList": "Aucun élément ajouté. Ajoutez-en un quand vous êtes prêt.",
    "identity.ui.addDetails": "Ajouter des détails",
    "identity.ui.preferredRole": "Rôle souhaité",
    "identity.ui.industry": "Secteur",
    "identity.ui.progress": "Progression",
    "identity.ui.youStillNeed": "Il vous reste à compléter :",
    "identity.ui.completePrefix": "Terminé :",
    "identity.ui.missingPrefix": "Manquant :",
    "identity.ui.continueWith": "Continuer avec",
    "identity.ui.requiredField": "Champ obligatoire",
    "identity.sync.dependents": "CV · Lettre de motivation · LinkedIn · Matching d'emploi · Préparation aux entretiens",
    "identity.suggestions.skills": "Communication|Microsoft Excel|Microsoft Word|Service client|Résolution de problèmes|Travail d'équipe|SQL|Analyse de données|Administration|Coordination de projet|Leadership|Recherche",
    "identity.importance.required": "Obligatoire",
    "identity.importance.recommended": "Recommandé",
    "identity.importance.optional": "Facultatif",
    "identity.ui.readyForReview": "Prêt pour la vérification",
    "identity.ui.requiredDetailsNeeded": "Informations obligatoires à compléter",
    "identity.ui.reviewBeforeHome": "Vérifiez vos informations avant l'accueil.",
    "identity.ui.finishRequired": "Terminez les étapes obligatoires pour continuer.",
    "identity.ui.reviewExplanation": "Vérifiez les informations que PATHZY utilisera pour vos documents, le matching d'emploi, les candidatures, les entretiens et l'accompagnement professionnel.",
    "identity.ui.requiredSectionsExplanation": "Les sections obligatoires sont indiquées dans la liste. Les sections recommandées et facultatives pourront être améliorées plus tard.",
    "identity.ui.uploadedDocuments": "Documents déjà liés à votre profil :",
    "identity.ui.openDocuments": "Ouvrir les documents",
    "identity.photo.add": "Ajouter une photo",
    "identity.photo.chooseDevice": "Choisir depuis l'appareil",
    "identity.photo.replace": "Remplacer la photo",
    "identity.photo.crop": "Repositionner / Recadrer",
    "identity.photo.preview": "Aperçu",
    "identity.photo.previewAlt": "Aperçu de la photo professionnelle",
    "identity.photo.remove": "Supprimer la photo",
    "identity.photo.retry": "Réessayer",
    "identity.photo.continueWithout": "Continuer sans photo",
    "identity.photo.empty": "Aucune photo professionnelle enregistrée.",
    "identity.photo.emptyTitle": "Ajoutez votre photo professionnelle",
    "identity.photo.emptyBody": "La photo est facultative. Si vous en ajoutez une, PATHZY la garde privée et l'utilise seulement là où vous l'autorisez.",
    "identity.photo.uploadTitle": "Photo professionnelle",
    "identity.photo.guidance": "Choisissez un portrait clair. Vous pourrez le remplacer ou le supprimer plus tard.",
    "identity.photo.accepted": "Formats acceptés :",
    "identity.photo.preparing": "Préparation...",
    "identity.photo.uploading": "Téléversement...",
    "identity.photo.processing": "Traitement...",
    "identity.photo.saved": "Enregistré",
    "identity.photo.ready": "Photo professionnelle enregistrée.",
    "identity.photo.removing": "Suppression de la photo...",
    "identity.photo.removed": "Photo supprimée.",
    "identity.photo.loadWarning": "Nous n'avons pas pu charger l'aperçu de la photo enregistrée.",
    "identity.photo.waitForUpload": "Veuillez attendre la fin du téléversement de la photo.",
    "identity.photo.error.unsupported_mime_type": "Ce format n'est pas pris en charge. Téléversez une image JPEG, PNG ou WebP.",
    "identity.photo.error.extension_mime_mismatch": "L'extension du fichier ne correspond pas au type d'image. Choisissez le fichier original.",
    "identity.photo.error.empty_file": "Cette image semble vide. Choisissez une autre photo.",
    "identity.photo.error.file_too_large": "Cette photo est trop volumineuse. Téléversez une image de moins de 5 Mo.",
    "identity.photo.error.image_too_narrow": "Cette image est trop petite. Choisissez une photo d'au moins 256 px de large.",
    "identity.photo.error.image_too_short": "Cette image est trop petite. Choisissez une photo d'au moins 256 px de haut.",
    "identity.photo.error.corrupted_image": "Nous n'avons pas pu lire cette image. Choisissez une autre photo.",
    "identity.photo.error.storage_unavailable": "Le stockage des photos n'est pas encore prêt. Réessayez après la configuration du stockage PATHZY.",
    "identity.photo.error.storage_bucket_missing": "Le stockage des photos n'est pas encore configuré. PATHZY doit configurer le bucket des photos professionnelles.",
    "identity.photo.error.storage_permission_denied": "Les autorisations du stockage bloquent ce téléversement. Demandez à l'équipe PATHZY de vérifier les règles de stockage des photos.",
    "identity.photo.error.upload_failed": "Échec du téléversement — Réessayer",
    "identity.photo.error.upload_timeout": "Échec du téléversement — Réessayer",
    "identity.photo.error.metadata_failed": "La photo a été téléversée, mais PATHZY n'a pas pu enregistrer la référence du profil. Réessayez.",
    "identity.photo.error.delete_failed": "Nous ne pouvons pas encore supprimer cette photo. Réessayez.",
    "identity.photo.error.session_expired": "Votre session a expiré. Connectez-vous et réessayez.",
    "identity.photo.permissionsTitle": "Autorisations de la photo",
    "identity.photo.profilePermission": "Afficher sur mon profil professionnel PATHZY",
    "identity.photo.cvPermission": "Autoriser l'utilisation dans les modèles de CV avec photo",
    "identity.photo.publicPermission": "Autoriser une future utilisation sur un profil partagé/public",
    "identity.photo.repositionX": "Position horizontale",
    "identity.photo.repositionY": "Position verticale",
    "identity.overview.title": "Vue d'ensemble de l'Identité Professionnelle",
    "identity.overview.body": "Vérifiez, mettez à jour et gardez votre base professionnelle prête pour les outils PATHZY.",
    "identity.overview.setupComplete": "Configuration terminée",
    "identity.overview.setupInProgress": "Configuration en cours",
    "identity.overview.resumeSetup": "Reprendre la configuration",
    "identity.overview.sectionsTitle": "Vos 23 sections d'Identité Professionnelle",
    "identity.overview.sectionsBody": "Chaque section reste modifiable. Les informations obligatoires manquantes sont nommées, et les sections facultatives peuvent être améliorées plus tard.",
    "identity.review.requiredComplete": "Informations obligatoires complètes",
    "identity.review.requiredNeedsAttention": "Informations obligatoires à vérifier",
    "identity.review.defaultName": "Votre Identité Professionnelle",
    "identity.review.defaultBody": "Vérifiez vos informations avant de terminer la configuration.",
    "identity.review.complete": "terminé",
    "identity.review.required": "Obligatoire",
    "identity.review.recommendedMissing": "Recommandés manquants",
    "identity.review.optionalMissing": "Facultatifs manquants",
    "identity.review.missing": "manquant",
    "identity.review.addRequired": "Ajoutez cette information avant de terminer la configuration.",
    "identity.review.improveLater": "Vous pourrez l'améliorer plus tard.",
    "identity.review.edit": "Modifier",
    "identity.review.editSection": "Modifier la section",
    "identity.review.saveReturn": "Enregistrer et revenir à la vérification",
    "identity.review.cancelReturn": "Annuler et revenir à la vérification",
    "identity.review.returnToIdentity": "Revenir à l'Identité Professionnelle",
    "identity.review.missingRequiredInformation": "Informations obligatoires manquantes",
    "identity.review.completeSection": "Compléter la section",
    "identity.review.lastUpdated": "Dernière mise à jour",
    "identity.review.syncStatus": "Statut de synchronisation",
    "identity.review.upToDate": "À jour",
    "identity.review.updateAvailable": "Mise à jour disponible",
    "identity.review.notAvailable": "Pas encore disponible",
    "identity.review.notComplete": "La configuration obligatoire n'est pas encore terminée. Commencez par",
    "identity.review.highlightedSection": "la section indiquée",
    "identity.review.progressTitle": "Progression de l'Identité Professionnelle",
    "identity.review.keepGoing": "Continuez étape par étape.",
    "identity.review.why": "Pourquoi c'est important",
    "identity.review.whyTitle": "L'Identité Professionnelle construit la personne. Le Centre d'emploi construit les supports.",
    "identity.review.whyBody": "PATHZY réutilisera cette identité canonique pour les CV, lettres de motivation, LinkedIn, le matching d'emploi, les candidatures, les entretiens, les analyses et le Coach.",
    "identity.save.continueWhenDone": "Vous pourrez continuer une fois l'enregistrement terminé.",
    "identity.sync.changed": "Votre Identité Professionnelle a changé.",
    "identity.sync.mayNeedUpdates": "Des mises à jour peuvent être disponibles pour les outils qui dépendent de cette identité. PATHZY ne régénérera pas et n'écrasera pas automatiquement les documents approuvés.",
    "identity.finish.saving": "Configuration en cours...",
    "identity.finish.saved": "Votre progression est enregistrée automatiquement.",
    "identity.finish.edit": "Continuer la modification",
    "identity.finish.submit": "Terminer la configuration",
    "identity.finish.failure": "Nous n'avons pas pu terminer la configuration. Vos informations restent enregistrées.",
    "readiness.title": "Vérification d'employabilité",
    "readiness.body": "Avant de créer votre Identité Professionnelle, PATHZY a besoin d'une image rapide de votre point de départ. C'est court et situationnel, ce n'est pas le Diagnostic d'employabilité complet.",
    "readiness.required": "Choisissez une réponse avant de continuer.",
    "readiness.transition.title": "Votre Identité Professionnelle.",
    "readiness.transition.body": "Tout ce que vous saisissez ici devient la base fiable de vos CV, lettres de motivation, LinkedIn, bio professionnelle, matching d'emploi, préparation aux entretiens, intelligence carrière, opportunités d'emploi et futures mises à jour.",
    "readiness.transition.thanks": "Merci. Nous comprenons votre point de départ.",
    "readiness.transition.general": "Construisez-la une fois, puis PATHZY garde vos outils d'emploi alignés.",
    "readiness.transition.next": "Identité Professionnelle -> CV -> Lettre de motivation -> LinkedIn -> Matching d'emploi -> Coach de carrière -> Préparation aux entretiens.",
    "readiness.transition.action": "Construire mon Identité Professionnelle",
    "readiness.distinction": "La Vérification d'employabilité est courte et se déroule avant l'Identité Professionnelle. Le Diagnostic d'employabilité complet reste après la configuration et utilise des preuves plus solides pour identifier les écarts et les prochaines actions.",
    "discovery.eyebrow": "Diagnostic d'employabilité",
    "discovery.title": "Comprendre votre employabilité.",
    "discovery.body": "Répondez à un entretien ciblé pour que PATHZY comprenne votre direction, votre niveau de préparation, vos écarts et vos prochaines actions vers l'emploi.",
    "discovery.step": "Étape",
    "discovery.complete": "terminé",
    "discovery.back": "Retour",
    "discovery.continue": "Continuer",
    "discovery.submit": "Créer mon diagnostic d'employabilité",
    "discovery.saving": "Création de votre diagnostic d'employabilité...",
    "discovery.required": "Ajoutez une courte réponse avant de continuer.",
    "discovery.login": "Connectez-vous avant de terminer le Diagnostic d'employabilité.",
    "discovery.error": "Nous n'avons pas pu terminer cette action. Votre progression est conservée. Réessayez.",
    "home.greeting.morning": "Bonjour",
    "home.greeting.afternoon": "Bon après-midi",
    "home.greeting.evening": "Bonsoir",
    "home.greeting.fallbackName": "à vous",
    "home.professionalDirectionFallback": "Direction professionnelle en cours",
    "home.identityLabel": "Identité Professionnelle",
    "home.complete": "terminé",
    "home.aria": "Accueil PATHZY",
    "home.continue.eyebrow": "Continuer",
    "home.continue.title": "Continuer votre parcours vers l'emploi",
    "home.continue.primary": "Continuer",
    "home.continue.secondary": "Vérifier le profil",
    "home.continue.progress": "Progression du parcours",
    "home.employmentCenter.eyebrow": "Centre d'emploi",
    "home.employmentCenter.title": "Centre d'emploi",
    "home.employmentCenter.primary": "Ouvrir le Centre d'emploi",
    "home.employmentCenter.secondary": "Ouvrir les documents",
    "home.employmentCenter.body": "Construisez et gérez les preuves professionnelles que les employeurs verront : profil, CV, lettre de motivation, contenu LinkedIn et documents justificatifs.",
    "home.employmentCenter.tags": "Identité Professionnelle|CV|Lettre de motivation|LinkedIn",
    "home.opportunities.eyebrow": "Emplois",
    "home.opportunities.title": "Opportunités",
    "home.opportunities.primary": "Trouver des opportunités",
    "home.opportunities.body": "Comparez les rôles, comprenez ce que les employeurs demandent, préparez vos candidatures et gardez chaque prochaine action visible.",
    "home.opportunities.summary": "{active} candidatures actives · {followUps} relances à faire · {interviews} entretiens",
    "home.guidance.eyebrow": "Accompagnement",
    "home.guidance.title": "Analyses et Coach",
    "home.guidance.primary": "Demander au Coach",
    "home.guidance.secondary": "Voir les analyses",
    "home.guidance.body": "Recevez des conseils pratiques basés sur votre profil, vos documents, vos correspondances d'emploi, vos candidatures, vos entretiens et vos relances.",
    "home.guidance.fallbackInsight": "Continuez à utiliser PATHZY et vos analyses deviendront plus précises avec le temps.",
    "home.next.completeProfessionalIdentity": "Compléter mon Identité Professionnelle",
    "home.next.completeProfile": "Compléter mon Profil Professionnel",
    "home.next.openEmploymentCenter": "Ouvrir le Centre d'emploi",
    "home.next.trackApplication": "Suivre la candidature",
    "home.next.startApplication": "Enregistrer ou commencer une candidature",
    "home.next.prepareInterview": "Préparer un entretien",
    "home.next.improveSkills": "Améliorer les compétences manquantes",
    "home.next.profileReason": "PATHZY a besoin de vos informations de profil avant de créer des documents et conseils plus solides.",
    "home.next.centerReason": "Utilisez le Centre d'emploi pour gérer les CV, lettres de motivation, contenus LinkedIn et autres supports professionnels au même endroit."
  }
} as const;

export type Phase2TranslationKey = keyof typeof phase2Translations.en;

export function pathzyPhase2T(language: SupportedLanguageCode, key: Phase2TranslationKey) {
  return phase2Translations[language]?.[key] ?? phase2Translations.en[key];
}

export function pathzyPhase2List(language: SupportedLanguageCode, key: Phase2TranslationKey) {
  return pathzyPhase2T(language, key).split("|").map((item) => item.trim()).filter(Boolean);
}

const professionalTitleTranslations: Record<SupportedLanguageCode, Record<string, string>> = {
  en: {},
  fr: {
    "data analyst": "Analyste de données",
    "junior data analyst": "Analyste de données junior",
    "business analyst": "Analyste d'affaires",
    "it support": "Support informatique",
    "junior it support": "Support informatique junior",
    "project coordinator": "Coordinateur de projet",
    "customer service": "Service client",
    "administration": "Administration"
  }
};

export function localizedProfessionalTitle(language: SupportedLanguageCode, value: string, fallbackKey: Phase2TranslationKey = "home.professionalDirectionFallback") {
  const clean = value.trim();
  if (!clean) return pathzyPhase2T(language, fallbackKey);
  return professionalTitleTranslations[language]?.[clean.toLowerCase()] ?? clean;
}

export function formatPathzyStepCount(language: SupportedLanguageCode, current: number, total: number) {
  return `${pathzyT(language, "onboarding.shell.step")} ${current} ${pathzyPhase2T(language, "identity.ui.stepConnector")} ${total}`;
}

export const professionalIdentityFieldTranslations: Record<SupportedLanguageCode, Record<string, Partial<{ label: string; placeholder: string }>>> = {
  en: {},
  fr: {
    profilePhoto: { label: "Note de photo", placeholder: "Photo professionnelle prête, ou nouvelle photo à prévoir" },
    full_name: { label: "Nom complet", placeholder: "Nicka Candida" },
    email: { label: "E-mail", placeholder: "nom@exemple.com" },
    phone: { label: "Téléphone", placeholder: "+27 00 000 0000" },
    current_status: { label: "Situation actuelle", placeholder: "Diplômé, étudiant, salarié, en reconversion..." },
    city: { label: "Ville", placeholder: "Johannesburg" },
    country: { label: "Pays", placeholder: "Afrique du Sud" },
    nationality: { label: "Nationalité", placeholder: "Sud-africaine" },
    work_authorization: { label: "Autorisation de travail", placeholder: "Autorisé à travailler en Afrique du Sud" },
    career_goal: { label: "Objectif professionnel", placeholder: "Data Analyst, support informatique, coordination de projet..." },
    professional_summary: { label: "Résumé professionnel", placeholder: "Rédigez un court résumé de votre profil professionnel et de votre direction." },
    field_of_study: { label: "Domaine d'études", placeholder: "Technologies de l'information, commerce, santé..." },
    experience: { label: "Expérience", placeholder: "Décrivez honnêtement une expérience pertinente." },
    skills: { label: "Compétences", placeholder: "Excel, communication, service client, SQL" },
    projects: { label: "Projets", placeholder: "Décrivez un projet et ce qu'il prouve." },
    achievements: { label: "Réalisations", placeholder: "Prix, étapes importantes, résultats académiques, réussites communautaires..." },
    certificates: { label: "Certificats", placeholder: "Certificat Google Data Analytics, cours Excel..." },
    licences: { label: "Licences", placeholder: "Permis de conduire, inscription professionnelle, licence métier..." },
    languages: { label: "Langues", placeholder: "Anglais, français" },
    references: { label: "Références", placeholder: "Disponibles sur demande, ou ajoutez les détails des références." },
    linkedin_url: { label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
    github_url: { label: "GitHub", placeholder: "https://github.com/..." },
    portfolio_url: { label: "Portfolio", placeholder: "https://..." },
    website_url: { label: "Site web", placeholder: "https://..." },
    behance_url: { label: "Behance", placeholder: "https://behance.net/..." },
    employment_type: { label: "Type d'emploi", placeholder: "Temps plein, temps partiel, contrat, stage" },
    salary_expectations: { label: "Prétentions salariales", placeholder: "Facultatif" },
    availability: { label: "Disponibilité", placeholder: "Immédiatement, 2 semaines, après l'obtention du diplôme..." },
    work_type: { label: "Mode de travail", placeholder: "Télétravail, hybride, sur site" },
    relocation: { label: "Mobilité", placeholder: "Ouvert à la mobilité, non disponible, selon le rôle" },
    interface_language: { label: "Langue de l'interface" },
    professional_document_language: { label: "Langue des documents professionnels" }
  }
};

export const professionalIdentityStepTranslations: Record<SupportedLanguageCode, Record<string, Partial<{ title: string; description: string; guidance: string }>>> = {
  en: {},
  fr: {
    profile: { title: "Profil", description: "Définissez le contexte de départ de votre Identité Professionnelle.", guidance: "Une étape à la fois. Votre progression est enregistrée, et ce profil alimentera les documents, le matching, les candidatures, les entretiens et le Coach." },
    photo: { title: "Photo", description: "Indiquez si vous disposez d'une photo professionnelle.", guidance: "Cette étape est facultative. Vous pouvez continuer sans photo et ajouter des fichiers plus tard." },
    personal_information: { title: "Informations personnelles", description: "Confirmez les informations que les employeurs et documents utiliseront.", guidance: "Utilisez le nom, l'e-mail et le téléphone qui doivent apparaître dans vos supports professionnels." },
    location: { title: "Localisation", description: "Ajoutez la localisation que les employeurs doivent comprendre.", guidance: "Utilisez la ville et le pays que PATHZY doit utiliser pour les documents, le matching d'emploi et les prochaines actions pratiques." },
    nationality: { title: "Nationalité", description: "Gardez la nationalité séparée de l'autorisation de travail.", guidance: "Ajoutez uniquement ce qui est vrai et pertinent. PATHZY garde cette information séparée de l'éligibilité au travail." },
    work_authorization: { title: "Autorisation de travail", description: "Ajoutez des informations exactes sur votre droit au travail.", guidance: "Ne devinez pas. PATHZY l'utilisera plus tard pour éviter des conseils de candidature inadaptés." },
    career_goal: { title: "Objectif professionnel", description: "Choisissez la direction qui guidera PATHZY.", guidance: "Vous pourrez la changer plus tard. Une cible claire rend les documents, offres et conseils plus pertinents." },
    professional_summary: { title: "Résumé professionnel", description: "Rédigez une courte phrase de base avec vos propres mots.", guidance: "Expliquez brièvement votre parcours et vos objectifs. Vous pourrez l'améliorer plus tard." },
    education: { title: "Formation", description: "Ajoutez votre formation, vos modules ou preuves d'apprentissage.", guidance: "Ajoutez les études formelles, études incomplètes, cours courts, formation actuelle ou apprentissages pertinents." },
    experience: { title: "Expérience", description: "Notez l'expérience professionnelle et transférable.", guidance: "Pas encore d'expérience formelle ? Ce n'est pas un problème. PATHZY peut utiliser la formation, les projets, le bénévolat et les compétences transférables." },
    skills: { title: "Compétences", description: "Construisez une base de compétences que PATHZY pourra réutiliser.", guidance: "Sélectionnez les compétences que vous utilisez déjà ou ajoutez les vôtres. PATHZY supprimera les doublons avant l'enregistrement." },
    projects: { title: "Projets", description: "Ajoutez des preuves concrètes de ce que vous savez faire.", guidance: "Les projets peuvent venir des études, d'un portfolio, d'activités communautaires, de travaux personnels ou d'autoformation." },
    achievements: { title: "Réalisations", description: "Capturez des preuves d'effort, de progression et de résultats.", guidance: "Utilisez les réalisations issues des études, du travail, de la communauté, du sport, du bénévolat ou de votre progression personnelle." },
    certificates: { title: "Certificats", description: "Ajoutez les certificats ou cours terminés.", guidance: "La saisie manuelle suffit pour l'instant. Les justificatifs restent dans Mes documents si nécessaire." },
    licences: { title: "Licences", description: "Ajoutez les licences ou inscriptions professionnelles.", guidance: "Ajoutez uniquement les licences que vous détenez réellement ou que vous êtes en train d'obtenir." },
    languages: { title: "Langues", description: "Ajoutez les langues que vous pouvez utiliser professionnellement.", guidance: "Ajoutez la langue et le niveau si utile, par exemple anglais - professionnel, français - conversationnel." },
    references: { title: "Références", description: "Préparez vos références sans les exposer trop tôt.", guidance: "Vous pouvez écrire Disponible sur demande ou ajouter les personnes à contacter plus tard. Les notes privées restent dans PATHZY." },
    portfolio: { title: "Portfolio", description: "Ajoutez les liens qui soutiennent votre identité professionnelle.", guidance: "Utilisez des liens qui montrent votre travail, vos preuves, vos projets ou votre présence professionnelle." },
    social_profiles: { title: "Profils sociaux", description: "Ajoutez les liens sociaux professionnels séparément du portfolio.", guidance: "LinkedIn et GitHub sont utiles, mais ils restent séparés de vos faits d'identité essentiels." },
    preferences: { title: "Préférences", description: "Choisissez comment PATHZY doit vous accompagner.", guidance: "La langue de l'interface contrôle la navigation et les conseils. La langue des documents contrôle les CV, lettres de motivation, bios et documents professionnels." },
    employment_preferences: { title: "Préférences d'emploi", description: "Indiquez le type de travail que vous visez.", guidance: "Les rôles, secteurs, modes de travail et mobilité guident le matching futur. Ils ne vous enferment pas." },
    salary_expectations: { title: "Prétentions salariales", description: "Ajoutez vos attentes seulement si vous êtes à l'aise.", guidance: "Les prétentions salariales sont facultatives et ne sont pas insérées par défaut dans les documents." },
    availability: { title: "Disponibilité", description: "Indiquez quand vous pouvez réellement commencer.", guidance: "La disponibilité aide pour les candidatures et les entretiens. Une disponibilité immédiate ou future est acceptable." }
  }
};

export function professionalIdentityFieldText(language: SupportedLanguageCode, fieldName: string, key: "label" | "placeholder", fallback = "") {
  return professionalIdentityFieldTranslations[language]?.[fieldName]?.[key] ?? fallback;
}

export function professionalIdentityStepText(language: SupportedLanguageCode, stepKey: string, key: "title" | "description" | "guidance", fallback = "") {
  return professionalIdentityStepTranslations[language]?.[stepKey]?.[key] ?? fallback;
}

export function professionalIdentityImportanceLabel(language: SupportedLanguageCode, importance: "required" | "recommended" | "optional") {
  return pathzyPhase2T(language, `identity.importance.${importance}` as Phase2TranslationKey);
}

export const employmentDiagnosisSteps = {
  en: [
    ["personal_background", "Personal background", "Tell PATHZY a little about where you are in life right now.", "Example: I am 19, live in Cape Town, and I am trying to choose what to study next."],
    ["education", "Education", "What is your current education level and what have you studied so far?", "Example: I finished high school and I am taking online business courses."],
    ["interests", "Interests", "What topics, activities, industries, or problems naturally catch your attention?", "Example: Technology, design, social media, fashion, finance, helping people."],
    ["skills", "Skills", "What can you already do, even if you are still a beginner?", "Example: Writing, Excel, public speaking, Canva, basic coding, selling."],
    ["personality", "Personality", "How would friends describe your personality and strengths?", "Example: Curious, calm, creative, organized, confident, analytical."],
    ["work_style", "Work style", "How do you like to work when you are at your best?", "Example: Alone with focus, in a team, with structure, on fast creative projects."],
    ["dream_lifestyle", "Dream lifestyle", "What kind of life are you trying to build?", "Example: Remote work, financial stability, creative freedom, support my family."],
    ["income_goal", "Income goal", "What income goal would feel meaningful in the next 12 to 24 months?", "Example: $1,000 per month from a stable job or freelance clients."],
    ["biggest_challenge", "Biggest challenge", "What is blocking you most right now?", "Example: I do not know which career to choose or what skill to learn first."],
    ["preferred_career_direction", "Preferred career direction", "If you had to guess, which career direction feels most interesting today?", "Example: Tech, design, business, healthcare, entrepreneurship, data, education."]
  ],
  fr: [
    ["personal_background", "Situation personnelle", "Expliquez brièvement où vous en êtes aujourd'hui.", "Exemple : J'ai 19 ans, je vis à Cape Town et j'essaie de choisir quoi étudier ensuite."],
    ["education", "Formation", "Quel est votre niveau d'études actuel et qu'avez-vous étudié jusqu'ici ?", "Exemple : J'ai terminé le lycée et je suis des cours de commerce en ligne."],
    ["interests", "Centres d'intérêt", "Quels sujets, activités, secteurs ou problèmes attirent naturellement votre attention ?", "Exemple : Technologie, design, réseaux sociaux, mode, finance, aider les autres."],
    ["skills", "Compétences", "Que savez-vous déjà faire, même si vous débutez ?", "Exemple : Rédaction, Excel, prise de parole, Canva, bases du code, vente."],
    ["personality", "Personnalité", "Comment vos proches décriraient-ils votre personnalité et vos forces ?", "Exemple : Curieux, calme, créatif, organisé, confiant, analytique."],
    ["work_style", "Style de travail", "Comment aimez-vous travailler quand vous êtes à votre meilleur niveau ?", "Exemple : Seul avec concentration, en équipe, avec de la structure, sur des projets créatifs rapides."],
    ["dream_lifestyle", "Mode de vie visé", "Quel type de vie essayez-vous de construire ?", "Exemple : Télétravail, stabilité financière, liberté créative, soutenir ma famille."],
    ["income_goal", "Objectif de revenu", "Quel objectif de revenu serait important dans les 12 à 24 prochains mois ?", "Exemple : 1 000 $ par mois grâce à un emploi stable ou à des clients freelance."],
    ["biggest_challenge", "Principal obstacle", "Qu'est-ce qui vous bloque le plus aujourd'hui ?", "Exemple : Je ne sais pas quelle carrière choisir ni quelle compétence apprendre en premier."],
    ["preferred_career_direction", "Direction professionnelle préférée", "Si vous deviez choisir, quelle direction professionnelle vous intéresse le plus aujourd'hui ?", "Exemple : Technologie, design, commerce, santé, entrepreneuriat, data, éducation."]
  ]
} as const;

export type EmploymentDiagnosisStep = {
  key: DiscoveryAnswerKey;
  title: string;
  prompt: string;
  placeholder: string;
};

type EmploymentDiagnosisStepTuple = readonly [DiscoveryAnswerKey, string, string, string];

export function getEmploymentDiagnosisSteps(language: SupportedLanguageCode): EmploymentDiagnosisStep[] {
  const steps = employmentDiagnosisSteps[language] ?? employmentDiagnosisSteps.en;
  return steps.map(([key, title, prompt, placeholder]: EmploymentDiagnosisStepTuple) => ({
    key,
    title,
    prompt,
    placeholder
  }));
}
