export const coverLetterTones = [
  "Professional",
  "Confident",
  "Warm",
  "Executive",
  "Concise",
  "Graduate / Early Career",
  "Technical",
  "Healthcare",
  "Consulting"
] as const;

export type CoverLetterTone = (typeof coverLetterTones)[number];

export const coverLetterLanguages = ["English", "French"] as const;
export type CoverLetterLanguage = (typeof coverLetterLanguages)[number];

export const coverLetterTemplateNames = [
  "Classic Professional",
  "Executive Elite",
  "Modern ATS",
  "Corporate Blue",
  "Consulting Signature",
  "Graduate Fresh",
  "Technical Professional",
  "Healthcare Professional",
  "Creative Editorial",
  "International Standard"
] as const;

export type CoverLetterTemplateName = (typeof coverLetterTemplateNames)[number];

export type CoverLetterTemplateArchitecture =
  | "classic"
  | "executive"
  | "ats"
  | "corporate"
  | "consulting"
  | "graduate"
  | "technical"
  | "healthcare"
  | "creative"
  | "international";

export type CoverLetterTemplateMeta = {
  name: CoverLetterTemplateName;
  architecture: CoverLetterTemplateArchitecture;
  bestFor: string;
  visualDirection: string;
  atsCompatibility: string;
  accent: string;
  paper: string;
  recommendedSignals: string[];
  thumbnail: {
    layout: CoverLetterTemplateArchitecture;
    accent: string;
    blocks: string[];
  };
};

export type CoverLetterProfileFacts = {
  profileId: string;
  selectedCvId: string;
  selectedCvTitle: string;
  fullName: string;
  email: string;
  phone: string;
  linkedIn: string;
  portfolio: string;
  city: string;
  country: string;
  language: CoverLetterLanguage;
  careerGoal: string;
  education: string;
  fieldOfStudy: string;
  experience: string;
  skills: string[];
  projects: string[];
  certifications: string[];
  achievements: string[];
  languages: string[];
  selectedCareerDirection: string;
};

export type CoverLetterTargetJob = {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  hiringManager: string;
  hiringManagerTitle: string;
  companyAddress: string;
  jobLocation: string;
  jobReferenceNumber: string;
  applicationDeadline: string;
  companyNotes: string;
  tone: CoverLetterTone;
  language: CoverLetterLanguage;
  evidenceItems?: CoverLetterEvidenceItem[];
};

export type CoverLetterEvidenceItem = {
  id: string;
  source: "Profile" | "Selected CV" | "Education" | "Skills" | "Projects" | "Certifications" | "Achievements" | "Language";
  text: string;
  matchedReason: string;
  selected: boolean;
};

export type EliteCoverLetterData = {
  id?: string;
  userId?: string;
  language: CoverLetterLanguage;
  sourceProfileId: string;
  sourceCvId: string;
  sourceCvTitle: string;
  sourceOpportunityId: string;
  selectedTone: CoverLetterTone;
  selectedTemplate: CoverLetterTemplateName;
  status: "Draft" | "Generated" | "Edited" | "Ready for review" | "Ready";
  applicantName: string;
  applicantContact: {
    phone: string;
    email: string;
    linkedIn: string;
    portfolio: string;
    city: string;
    country: string;
  };
  documentDate: string;
  date: string;
  employerDetails: {
    hiringManager: string;
    hiringManagerTitle: string;
    companyName: string;
    companyAddress: string;
    jobLocation: string;
    jobReferenceNumber: string;
    applicationDeadline: string;
  };
  companyName: string;
  hiringManager: string;
  companyAddress: string;
  jobTitle: string;
  targetCompany: string;
  targetPosition: string;
  jobDescription: string;
  greeting: string;
  openingParagraph: string;
  relevantExperienceParagraph: string;
  relevanceParagraph: string;
  evidenceParagraph: string;
  whyCompanyParagraph: string;
  companyInterestParagraph: string;
  closingParagraph: string;
  signOff: string;
  signatureName: string;
  applicantSignatureName: string;
  selectedEvidence: CoverLetterEvidenceItem[];
  jobAnalysis: {
    keyResponsibilities: string[];
    requiredSkills: string[];
    preferredSkills: string[];
    qualifications: string[];
    tools: string[];
    experienceLevel: string[];
    industryTerms: string[];
    behaviouralExpectations: string[];
  };
  missingQualifications: string[];
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
  lastPreviewedAt: string | null;
  lastDownloadedAt: string | null;
};

export type EliteCoverLetterSavedDocument = {
  id: string;
  title: string;
  data: EliteCoverLetterData;
  templateName: CoverLetterTemplateName;
  updatedAt: string | null;
  lastDownloadedAt: string | null;
};

// Rule: must not invent employers, years, qualifications, certificates, metrics, licences, or achievements.
export const eliteCoverLetterTemplates: CoverLetterTemplateMeta[] = [
  {
    name: "Classic Professional",
    architecture: "classic",
    bestFor: "Most industries, administration, public service and general applications",
    visualDirection: "Black, white and restrained navy",
    atsCompatibility: "ATS Friendly",
    accent: "#1f3a5f",
    paper: "#ffffff",
    recommendedSignals: ["admin", "public", "general", "assistant", "service"],
    thumbnail: { layout: "classic", accent: "#1f3a5f", blocks: ["header-left", "date", "employer", "paragraphs"] }
  },
  {
    name: "Executive Elite",
    architecture: "executive",
    bestFor: "Senior professionals, managers, directors and consultants",
    visualDirection: "Charcoal and muted gold",
    atsCompatibility: "Recruiter Focused",
    accent: "#b79555",
    paper: "#fffdf8",
    recommendedSignals: ["executive", "manager", "director", "leadership", "consultant"],
    thumbnail: { layout: "executive", accent: "#b79555", blocks: ["dark-band", "gold-rule", "wide-greeting", "signature"] }
  },
  {
    name: "Modern ATS",
    architecture: "ats",
    bestFor: "Online corporate applications and applicant tracking systems",
    visualDirection: "Ink navy and cool blue",
    atsCompatibility: "Single-Column ATS",
    accent: "#2563eb",
    paper: "#ffffff",
    recommendedSignals: ["portal", "apply", "ats", "corporate", "online"],
    thumbnail: { layout: "ats", accent: "#2563eb", blocks: ["single-column", "thin-rules", "compact-body"] }
  },
  {
    name: "Corporate Blue",
    architecture: "corporate",
    bestFor: "Banking, finance, administration, HR and operations",
    visualDirection: "Midnight navy and Azure",
    atsCompatibility: "ATS Optimized",
    accent: "#1d4ed8",
    paper: "#f8fbff",
    recommendedSignals: ["finance", "banking", "operations", "hr", "corporate"],
    thumbnail: { layout: "corporate", accent: "#1d4ed8", blocks: ["blue-header", "recipient-card", "formal-body"] }
  },
  {
    name: "Consulting Signature",
    architecture: "consulting",
    bestFor: "Consulting, strategy, project management and business analysis",
    visualDirection: "Graphite and restrained green",
    atsCompatibility: "Evidence First",
    accent: "#4f7d2a",
    paper: "#fbfff7",
    recommendedSignals: ["consulting", "strategy", "project", "analysis", "business"],
    thumbnail: { layout: "consulting", accent: "#4f7d2a", blocks: ["compact-meta", "evidence-bars", "dense-body"] }
  },
  {
    name: "Graduate Fresh",
    architecture: "graduate",
    bestFor: "Graduates, internships, learnerships and first jobs",
    visualDirection: "Burgundy and warm grey",
    atsCompatibility: "Graduate Friendly",
    accent: "#8a1538",
    paper: "#fffafa",
    recommendedSignals: ["graduate", "intern", "learnership", "junior", "entry"],
    thumbnail: { layout: "graduate", accent: "#8a1538", blocks: ["friendly-header", "education-focus", "light-body"] }
  },
  {
    name: "Technical Professional",
    architecture: "technical",
    bestFor: "IT, software, data, cybersecurity, engineering and laboratory technical roles",
    visualDirection: "Slate and restrained cyan",
    atsCompatibility: "Technical ATS",
    accent: "#0891b2",
    paper: "#f8fafc",
    recommendedSignals: ["software", "data", "sql", "technical", "engineer", "lab", "cyber"],
    thumbnail: { layout: "technical", accent: "#0891b2", blocks: ["tech-rail", "tools-strip", "structured-body"] }
  },
  {
    name: "Healthcare Professional",
    architecture: "healthcare",
    bestFor: "Healthcare, laboratories, nursing, clinical work, care work and public health",
    visualDirection: "Deep teal and soft sage",
    atsCompatibility: "Credential Friendly",
    accent: "#0f766e",
    paper: "#f7fbf8",
    recommendedSignals: ["health", "clinical", "care", "patient", "nurse", "public health"],
    thumbnail: { layout: "healthcare", accent: "#0f766e", blocks: ["clinical-header", "credential-block", "calm-body"] }
  },
  {
    name: "Creative Editorial",
    architecture: "creative",
    bestFor: "Marketing, design, media, photography, fashion and creative careers",
    visualDirection: "Forest green and warm ivory",
    atsCompatibility: "Portfolio Friendly",
    accent: "#166534",
    paper: "#fffaf0",
    recommendedSignals: ["creative", "design", "media", "marketing", "portfolio", "brand"],
    thumbnail: { layout: "creative", accent: "#166534", blocks: ["asymmetric-rail", "editorial-title", "portfolio-body"] }
  },
  {
    name: "International Standard",
    architecture: "international",
    bestFor: "International applications, NGOs, global corporations and relocation",
    visualDirection: "Oxford blue and stone",
    atsCompatibility: "International Format",
    accent: "#243b53",
    paper: "#ffffff",
    recommendedSignals: ["international", "global", "ngo", "remote", "relocation"],
    thumbnail: { layout: "international", accent: "#243b53", blocks: ["global-contact", "formal-recipient", "balanced-body"] }
  }
];

function clean(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function cleanMultiline(value: unknown) {
  return typeof value === "string" ? value.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim() : "";
}

function unique(values: unknown[], limit = 8) {
  const seen = new Set<string>();
  const next: string[] = [];
  values.flatMap((value) => Array.isArray(value) ? value : String(value ?? "").split(/[,;\n]/)).forEach((value) => {
    const item = typeof value === "object" && value ? clean(Object.values(value as Record<string, unknown>).filter(Boolean).join(" ")) : clean(value);
    const key = item.toLowerCase();
    if (item && !seen.has(key)) {
      seen.add(key);
      next.push(item);
    }
  });
  return next.slice(0, limit);
}

export function normalizeCoverLetterTone(value: unknown): CoverLetterTone {
  const found = coverLetterTones.find((tone) => tone.toLowerCase() === clean(value).toLowerCase());
  return found ?? "Professional";
}

export function normalizeCoverLetterLanguage(value: unknown): CoverLetterLanguage {
  return clean(value).toLowerCase().startsWith("fr") ? "French" : "English";
}

export function normalizeCoverLetterTemplate(value: unknown): CoverLetterTemplateName {
  const aliases: Record<string, CoverLetterTemplateName> = {
    "Executive Letter": "Executive Elite",
    "ATS Classic": "Modern ATS",
    "Modern Professional": "Classic Professional",
    "Graduate Signature": "Graduate Fresh",
    "Technology Letter": "Technical Professional",
    "Creative Letter": "Creative Editorial",
    "Minimal Elegance": "Classic Professional"
  };
  const raw = clean(value);
  const found = coverLetterTemplateNames.find((template) => template.toLowerCase() === raw.toLowerCase());
  return found ?? aliases[raw] ?? "Classic Professional";
}

export function coverLetterTitle(companyName: string, jobTitle: string) {
  const company = clean(companyName) || "Target Company";
  const role = clean(jobTitle) || "Target Role";
  return `${company} - ${role}`;
}

export function coverLetterFileName(data: EliteCoverLetterData) {
  const stamp = new Date().toISOString().slice(0, 10);
  const safe = (value: string) => (clean(value) || "Cover Letter").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
  return `PATHZY_Cover_Letter_${safe(data.companyName)}_${safe(data.jobTitle)}_${stamp}.pdf`;
}

export function buildCoverLetterProfileFacts(profile: Record<string, unknown> | null, discovery: Record<string, unknown> | null, latestCv: Record<string, unknown> | null): CoverLetterProfileFacts {
  const cvModel = latestCv?.cvModel && typeof latestCv.cvModel === "object" ? latestCv.cvModel as Record<string, unknown> : null;
  return {
    profileId: clean(profile?.id ?? profile?.user_id),
    selectedCvId: clean(latestCv?.id ?? latestCv?.documentId),
    selectedCvTitle: clean(latestCv?.versionName ?? latestCv?.title ?? latestCv?.document_title) || "Latest saved CV",
    fullName: clean(profile?.full_name ?? cvModel?.fullName),
    email: clean(profile?.email ?? cvModel?.email),
    phone: clean(profile?.phone ?? cvModel?.phone),
    linkedIn: clean(profile?.linkedin_url ?? cvModel?.linkedIn),
    portfolio: clean(profile?.portfolio_url ?? cvModel?.portfolio ?? cvModel?.website),
    city: clean(profile?.city ?? cvModel?.city),
    country: clean(profile?.country ?? cvModel?.country),
    language: normalizeCoverLetterLanguage(profile?.language),
    careerGoal: clean(profile?.career_goal ?? discovery?.preferred_career_direction ?? cvModel?.targetRole),
    education: clean(profile?.highest_qualification ?? profile?.education),
    fieldOfStudy: clean(profile?.field_of_study),
    experience: clean(profile?.current_status ?? profile?.employment_status),
    skills: unique([cvModel?.coreSkills, cvModel?.technicalSkills, cvModel?.professionalSkills, discovery?.skills, discovery?.currentSkills], 12),
    projects: unique([cvModel?.projects, discovery?.projects], 6),
    certifications: unique([cvModel?.certifications, discovery?.certifications], 6),
    achievements: unique([cvModel?.achievements, discovery?.achievements], 6),
    languages: unique([cvModel?.languages, discovery?.languages], 5),
    selectedCareerDirection: clean(discovery?.preferred_career_direction ?? profile?.career_goal ?? cvModel?.targetRole)
  };
}

function includesAny(source: string, words: string[]) {
  return words.some((word) => source.includes(word));
}

export function analyzeJobDescription(target: CoverLetterTargetJob, facts: CoverLetterProfileFacts) {
  const description = cleanMultiline(target.jobDescription);
  const lower = `${target.jobTitle} ${description}`.toLowerCase();
  const keyResponsibilities = [
    includesAny(lower, ["data", "sql", "excel", "analytics", "dashboard", "report"]) ? "data, reporting, and evidence-based decision-making" : "",
    includesAny(lower, ["customer", "client", "support", "service"]) ? "customer support, communication, and service reliability" : "",
    includesAny(lower, ["design", "figma", "ux", "ui", "brand", "creative"]) ? "creative problem-solving and user-facing communication" : "",
    includesAny(lower, ["admin", "operation", "coordinat", "organis", "office"]) ? "coordination, organization, and dependable follow-through" : "",
    includesAny(lower, ["health", "patient", "clinical", "care"]) ? "care, accuracy, empathy, and professional responsibility" : "",
    includesAny(lower, ["software", "developer", "engineer", "technology", "it", "technical"]) ? "technical learning, problem-solving, and digital execution" : "",
    includesAny(lower, ["sales", "marketing", "social", "content", "growth"]) ? "clear communication, audience understanding, and commercial awareness" : ""
  ].filter(Boolean);
  const requiredSkills = facts.skills.filter((skill) => lower.includes(skill.toLowerCase())).slice(0, 5);
  const preferredSkills = facts.skills.filter((skill) => !requiredSkills.includes(skill)).slice(0, 4);
  const qualifications = [
    includesAny(lower, ["degree", "diploma", "qualification"]) ? "Formal qualification mentioned" : "",
    includesAny(lower, ["certificate", "certification", "licence", "license"]) ? "Certification or licence mentioned" : ""
  ].filter(Boolean);
  const tools = ["Excel", "SQL", "Python", "Power BI", "Figma", "React", "JavaScript", "Microsoft Word", "PowerPoint"].filter((tool) => lower.includes(tool.toLowerCase()));
  const experienceLevel = [
    includesAny(lower, ["graduate", "entry", "junior", "intern"]) ? "Early-career friendly" : "",
    includesAny(lower, ["senior", "manager", "lead"]) ? "Experienced or leadership-oriented" : ""
  ].filter(Boolean);
  const industryTerms = keyResponsibilities.length ? keyResponsibilities : ["role readiness and clear communication"];
  const behaviouralExpectations = [
    includesAny(lower, ["team", "collaborat"]) ? "team collaboration" : "",
    includesAny(lower, ["detail", "accur"]) ? "attention to detail" : "",
    includesAny(lower, ["deadline", "fast", "pressure"]) ? "dependability under deadlines" : "",
    includesAny(lower, ["learn", "training"]) ? "willingness to learn" : ""
  ].filter(Boolean);
  const missingQualifications = [
    qualifications.includes("Formal qualification mentioned") && !facts.education ? "The job description mentions formal education. Add your qualification only if you have one." : "",
    qualifications.includes("Certification or licence mentioned") && !facts.certifications.length ? "The job description mentions certifications or licences. Add only credentials you genuinely hold." : "",
    includesAny(lower, ["experience", "years"]) && !facts.experience ? "The job description may expect experience. PATHZY will avoid claiming years you have not provided." : ""
  ].filter(Boolean);
  const evidence = strongestEvidence(facts, { requiredSkills, preferredSkills, tools, behaviouralExpectations, keyResponsibilities });
  return {
    keyResponsibilities: keyResponsibilities.length ? keyResponsibilities.slice(0, 4) : ["reliability, role readiness, and clear communication"],
    requiredSkills,
    preferredSkills,
    qualifications,
    tools,
    experienceLevel,
    industryTerms,
    behaviouralExpectations: behaviouralExpectations.length ? behaviouralExpectations : ["professional communication", "dependable follow-through"],
    factMatches: evidence.filter((item) => item.selected).map((item) => `${item.source}: ${item.text}`),
    selectedEvidence: evidence,
    missingQualifications
  };
}

function strongestEvidence(facts: CoverLetterProfileFacts, analysis: { requiredSkills: string[]; preferredSkills: string[]; tools: string[]; behaviouralExpectations: string[]; keyResponsibilities: string[] }): CoverLetterEvidenceItem[] {
  const items: CoverLetterEvidenceItem[] = [];
  const push = (source: CoverLetterEvidenceItem["source"], text: string, matchedReason: string, selected = true) => {
    const cleanText = clean(text);
    if (!cleanText) return;
    items.push({ id: `${source}-${items.length + 1}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"), source, text: cleanText, matchedReason, selected });
  };
  push("Profile", facts.careerGoal || facts.selectedCareerDirection, "Career direction connected to the target role");
  push("Education", [facts.education, facts.fieldOfStudy].filter(Boolean).join(" in "), "Education or training evidence");
  facts.skills.slice(0, 5).forEach((skill) => push("Skills", skill, analysis.requiredSkills.includes(skill) ? "Direct skill match" : "Transferable skill"));
  facts.projects.slice(0, 3).forEach((project) => push("Projects", project, "Project or portfolio proof"));
  facts.certifications.slice(0, 3).forEach((cert) => push("Certifications", cert, "Credential evidence"));
  facts.achievements.slice(0, 3).forEach((achievement) => push("Achievements", achievement, "Supported achievement"));
  facts.languages.slice(0, 2).forEach((language) => push("Language", language, "Language capability where relevant", false));
  return items.slice(0, 9);
}

function tonePhrase(tone: CoverLetterTone) {
  if (tone === "Confident") return "confident and focused";
  if (tone === "Warm") return "thoughtful and people-centered";
  if (tone === "Executive") return "strategic and commercially aware";
  if (tone === "Concise") return "clear and direct";
  if (tone === "Graduate / Early Career") return "curious, prepared, and growth-minded";
  if (tone === "Technical") return "practical, analytical, and technically focused";
  if (tone === "Healthcare") return "careful, empathetic, and accountable";
  if (tone === "Consulting") return "structured, evidence-led, and outcome-focused";
  return "professional and reliable";
}

function greetingFor(target: CoverLetterTargetJob, language: CoverLetterLanguage) {
  const name = clean(target.hiringManager);
  if (language === "French") return name ? `Madame/Monsieur ${name},` : "Madame, Monsieur,";
  return name ? `Dear ${name},` : "Dear Hiring Manager,";
}

export function generateEliteCoverLetterData(facts: CoverLetterProfileFacts, target: CoverLetterTargetJob, selectedTemplate: CoverLetterTemplateName): EliteCoverLetterData {
  const now = new Date().toISOString();
  const language = target.language ?? facts.language ?? "English";
  const analysis = analyzeJobDescription(target, facts);
  const applicant = facts.fullName;
  const jobTitle = clean(target.jobTitle) || facts.careerGoal || "the role";
  const companyName = clean(target.companyName) || "your organization";
  const selectedEvidence = (target.evidenceItems?.length ? target.evidenceItems : analysis.selectedEvidence).filter((item) => item.selected).slice(0, 4);
  const evidenceList = selectedEvidence.map((item) => item.text).join("; ");
  const roleFocus = analysis.keyResponsibilities[0];
  const date = new Date().toLocaleDateString(language === "French" ? "fr-FR" : "en-ZA", { year: "numeric", month: "long", day: "numeric" });
  const english = language === "English";

  const openingParagraph = english
    ? `I am applying for the ${jobTitle} role at ${companyName} because the position calls for ${roleFocus}. My profile is developing around ${facts.selectedCareerDirection || facts.careerGoal || jobTitle}, and I would bring a ${tonePhrase(target.tone)} approach to the work.`
    : `Je souhaite présenter ma candidature pour le poste de ${jobTitle} chez ${companyName}. Le poste demande notamment ${roleFocus}, et mon parcours s'oriente vers ${facts.selectedCareerDirection || facts.careerGoal || jobTitle} avec une approche ${tonePhrase(target.tone)}.`;
  const relevantExperienceParagraph = english
    ? `Based on the information provided, I would focus on the responsibilities that match my real background: ${analysis.keyResponsibilities.join(", ")}. I can support this with truthful evidence from my profile rather than unsupported claims.`
    : `D'apres les informations fournies, je mettrais l'accent sur les responsabilites qui correspondent a mon parcours reel : ${analysis.keyResponsibilities.join(", ")}. Cette candidature reste fondee sur des elements verifiables de mon profil.`;
  const evidenceParagraph = evidenceList
    ? (english ? `The strongest evidence I can offer includes ${evidenceList}. These examples show how I can contribute while continuing to learn the specific systems and expectations of the team.` : `Les elements les plus pertinents de mon profil comprennent ${evidenceList}. Ils montrent comment je peux contribuer tout en apprenant les methodes et attentes specifiques de l'equipe.`)
    : (english ? "My direct evidence is still developing, so I would bring careful preparation, humility, strong follow-through, and a genuine willingness to learn the role properly." : "Mes preuves professionnelles sont encore en developpement. J'apporterais donc une preparation serieuse, de la rigueur et une vraie volonte d'apprendre le poste correctement.");
  const whyCompanyParagraph = clean(target.companyNotes)
    ? (english ? `What interests me about ${companyName} is ${clean(target.companyNotes)}. I would be motivated to contribute to that priority with consistency and professionalism.` : `Ce qui m'interesse chez ${companyName}, c'est ${clean(target.companyNotes)}. Je serais motive a contribuer a cette priorite avec constance et professionnalisme.`)
    : (english ? `What interests me about ${companyName} is the opportunity to contribute to the priorities described in the role while growing through meaningful responsibility.` : `Ce qui m'interesse chez ${companyName}, c'est l'occasion de contribuer aux priorites decrites dans l'offre tout en progressant avec des responsabilites utiles.`);
  const closingParagraph = english
    ? "I would welcome the opportunity to discuss how my background, motivation, and current skills could support your team."
    : "Je serais heureux d'echanger sur la maniere dont mon profil, ma motivation et mes competences actuelles pourraient soutenir votre equipe.";

  return {
    language,
    sourceProfileId: facts.profileId,
    sourceCvId: facts.selectedCvId,
    sourceCvTitle: facts.selectedCvTitle,
    sourceOpportunityId: "",
    selectedTone: target.tone,
    selectedTemplate,
    status: "Generated",
    applicantName: applicant,
    applicantContact: {
      phone: facts.phone,
      email: facts.email,
      linkedIn: facts.linkedIn,
      portfolio: facts.portfolio,
      city: facts.city,
      country: facts.country
    },
    documentDate: date,
    date,
    employerDetails: {
      hiringManager: clean(target.hiringManager),
      hiringManagerTitle: clean(target.hiringManagerTitle),
      companyName,
      companyAddress: cleanMultiline(target.companyAddress),
      jobLocation: clean(target.jobLocation),
      jobReferenceNumber: clean(target.jobReferenceNumber),
      applicationDeadline: clean(target.applicationDeadline)
    },
    companyName,
    hiringManager: clean(target.hiringManager),
    companyAddress: cleanMultiline(target.companyAddress),
    jobTitle,
    targetCompany: companyName,
    targetPosition: jobTitle,
    jobDescription: cleanMultiline(target.jobDescription),
    greeting: greetingFor(target, language),
    openingParagraph,
    relevantExperienceParagraph,
    relevanceParagraph: relevantExperienceParagraph,
    evidenceParagraph,
    whyCompanyParagraph,
    companyInterestParagraph: whyCompanyParagraph,
    closingParagraph,
    signOff: english ? "Kind regards," : "Cordialement,",
    signatureName: applicant,
    applicantSignatureName: applicant,
    selectedEvidence,
    jobAnalysis: {
      keyResponsibilities: analysis.keyResponsibilities,
      requiredSkills: analysis.requiredSkills,
      preferredSkills: analysis.preferredSkills,
      qualifications: analysis.qualifications,
      tools: analysis.tools,
      experienceLevel: analysis.experienceLevel,
      industryTerms: analysis.industryTerms,
      behaviouralExpectations: analysis.behaviouralExpectations
    },
    missingQualifications: analysis.missingQualifications,
    generatedAt: now,
    createdAt: now,
    updatedAt: now,
    lastPreviewedAt: now,
    lastDownloadedAt: null
  };
}

export function normalizeEliteCoverLetterData(data: EliteCoverLetterData): EliteCoverLetterData {
  const selectedTemplate = normalizeCoverLetterTemplate(data.selectedTemplate);
  const selectedTone = normalizeCoverLetterTone(data.selectedTone);
  const language = normalizeCoverLetterLanguage(data.language);
  return {
    ...data,
    language,
    selectedTemplate,
    selectedTone,
    date: data.documentDate || data.date,
    documentDate: data.documentDate || data.date,
    companyName: clean(data.companyName || data.targetCompany || data.employerDetails?.companyName),
    targetCompany: clean(data.targetCompany || data.companyName || data.employerDetails?.companyName),
    jobTitle: clean(data.jobTitle || data.targetPosition),
    targetPosition: clean(data.targetPosition || data.jobTitle),
    hiringManager: clean(data.hiringManager || data.employerDetails?.hiringManager),
    companyAddress: cleanMultiline(data.companyAddress || data.employerDetails?.companyAddress),
    relevanceParagraph: data.relevantExperienceParagraph || data.relevanceParagraph,
    relevantExperienceParagraph: data.relevantExperienceParagraph || data.relevanceParagraph,
    companyInterestParagraph: data.whyCompanyParagraph || data.companyInterestParagraph,
    whyCompanyParagraph: data.whyCompanyParagraph || data.companyInterestParagraph,
    signatureName: data.signatureName || data.applicantSignatureName,
    applicantSignatureName: data.applicantSignatureName || data.signatureName,
    selectedEvidence: data.selectedEvidence ?? [],
    status: data.status ?? "Draft",
    updatedAt: data.updatedAt || new Date().toISOString(),
    lastPreviewedAt: data.lastPreviewedAt ?? null,
    lastDownloadedAt: data.lastDownloadedAt ?? null
  };
}

export function serializeEliteCoverLetterData(input: EliteCoverLetterData) {
  const data = normalizeEliteCoverLetterData(input);
  return [
    data.applicantName,
    [data.applicantContact.phone, data.applicantContact.email, data.applicantContact.linkedIn, data.applicantContact.portfolio, data.applicantContact.city, data.applicantContact.country].filter(Boolean).join(" | "),
    data.documentDate,
    data.companyName,
    [data.hiringManager, data.employerDetails.hiringManagerTitle, data.companyAddress, data.employerDetails.jobLocation, data.employerDetails.jobReferenceNumber].filter(Boolean).join("\n"),
    data.greeting,
    data.openingParagraph,
    data.relevantExperienceParagraph,
    data.evidenceParagraph,
    data.whyCompanyParagraph,
    data.closingParagraph,
    data.signOff,
    data.signatureName
  ].filter(Boolean).join("\n\n");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char] ?? char));
}

function paragraphs(data: EliteCoverLetterData) {
  return [data.greeting, data.openingParagraph, data.relevantExperienceParagraph, data.evidenceParagraph, data.whyCompanyParagraph, data.closingParagraph].map(clean).filter(Boolean);
}

function contactLines(data: EliteCoverLetterData) {
  return [data.applicantContact.phone, data.applicantContact.email, data.applicantContact.linkedIn, data.applicantContact.portfolio, [data.applicantContact.city, data.applicantContact.country].filter(Boolean).join(", ")].filter(Boolean);
}

function employerLines(data: EliteCoverLetterData) {
  return [data.hiringManager, data.employerDetails.hiringManagerTitle, data.companyName, data.companyAddress, data.employerDetails.jobLocation, data.employerDetails.jobReferenceNumber ? `Reference: ${data.employerDetails.jobReferenceNumber}` : ""].filter(Boolean);
}

function templateCss(template: CoverLetterTemplateName) {
  const meta = eliteCoverLetterTemplates.find((item) => item.name === template) ?? eliteCoverLetterTemplates[0];
  const accent = meta.accent;
  const serif = ["Executive Elite", "Creative Editorial", "International Standard"].includes(template) ? "Georgia, 'Times New Roman', serif" : "Inter, Arial, sans-serif";
  const header = {
    classic: `border-bottom:1px solid #d8dee8;padding-bottom:22px;`,
    executive: `background:#171513;color:#fffdfa;margin:-64px -70px 36px;padding:54px 70px 34px;border-bottom:7px solid ${accent};`,
    ats: `border-bottom:2px solid ${accent};padding-bottom:18px;`,
    corporate: `background:#102a56;color:#fff;margin:-64px -70px 34px;padding:46px 70px 30px;border-bottom:6px solid ${accent};`,
    consulting: `border-left:8px solid ${accent};padding-left:24px;padding-bottom:14px;border-bottom:1px solid #dcebc9;`,
    graduate: `background:#fff5f7;border:1px solid #ead5dc;border-radius:20px;padding:24px;margin-bottom:30px;`,
    technical: `border-top:8px solid ${accent};padding-top:24px;border-bottom:1px solid #cbd5e1;padding-bottom:18px;`,
    healthcare: `background:#eef8f4;border-left:10px solid ${accent};padding:24px;border-radius:16px;margin-bottom:30px;`,
    creative: `display:grid;grid-template-columns:150px 1fr;gap:28px;border-left:14px solid ${accent};padding-left:24px;`,
    international: `border-bottom:1px solid #cbd5e1;padding-bottom:20px;text-align:left;`
  }[meta.architecture];
  return `
    .elite-letter-shell{display:grid;gap:24px;justify-items:center;background:linear-gradient(180deg,#edf3fb,#dfe7f3);padding:clamp(10px,2vw,24px);border-radius:22px;overflow:hidden}
    .elite-letter{width:794px;min-height:1123px;background:${meta.paper};color:#111827;font-family:${serif};padding:64px 70px;box-sizing:border-box;box-shadow:0 28px 80px rgba(0,0,0,.32)}
    .letter-header{${header}}
    .letter-name{font-size:${meta.architecture === "executive" ? "36px" : "31px"};line-height:1.05;font-weight:800;letter-spacing:0;color:${["executive","corporate"].includes(meta.architecture) ? "#ffffff" : accent};margin:0}
    .letter-role{font-size:13px;text-transform:uppercase;letter-spacing:.16em;color:${["executive","corporate"].includes(meta.architecture) ? "#e5e7eb" : "#4b5563"};margin-top:9px;font-weight:800}
    .letter-contact{font-size:12px;line-height:1.55;color:${["executive","corporate"].includes(meta.architecture) ? "#e5e7eb" : "#4b5563"};margin-top:14px;display:flex;flex-wrap:wrap;gap:7px 14px}
    .letter-meta{display:grid;grid-template-columns:${meta.architecture === "classic" || meta.architecture === "ats" || meta.architecture === "international" ? "1fr 1fr" : "1fr"};gap:22px;margin:0 0 30px;font-size:13px;line-height:1.65;color:#374151}
    .letter-accent{height:${meta.architecture === "consulting" ? "2px" : "4px"};width:${meta.architecture === "creative" ? "140px" : "88px"};background:${accent};margin:0 0 26px}
    .letter-content{font-size:14.5px;line-height:${meta.architecture === "executive" ? "1.74" : "1.68"};color:#1f2937;max-width:${meta.architecture === "ats" ? "100%" : "620px"}}
    .letter-content p{margin:0 0 18px}
    .letter-signature{margin-top:30px;color:#111827;font-weight:700}
    .plain-letter{white-space:pre-wrap;font:14px/1.65 Arial,sans-serif;color:#111827;background:#fff;padding:48px;border-radius:18px}
    @media(max-width:900px){.elite-letter{width:100%;min-height:auto;padding:42px 30px}.letter-header{margin-left:0!important;margin-right:0!important}.letter-meta{grid-template-columns:1fr}.letter-name{font-size:27px}}
    @media print{.elite-letter-shell{padding:0;background:#fff}.elite-letter{box-shadow:none}}
  `;
}

export function renderEliteCoverLetterHtml(input: EliteCoverLetterData) {
  const data = normalizeEliteCoverLetterData(input);
  const contact = contactLines(data);
  const companyLines = employerLines(data).map(escapeHtml).join("<br/>");
  return `
    <style>${templateCss(data.selectedTemplate)}</style>
    <div class="elite-letter-shell" data-a4-cover-letter-preview="true">
      <article class="elite-letter">
        <header class="letter-header">
          <h1 class="letter-name">${escapeHtml(data.applicantName || "Applicant")}</h1>
          <div class="letter-role">${escapeHtml(data.jobTitle)}</div>
          <div class="letter-contact">${contact.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
        </header>
        <div class="letter-accent"></div>
        <section class="letter-meta">
          <div>${escapeHtml(data.documentDate)}</div>
          <div>${companyLines}</div>
        </section>
        <section class="letter-content">
          ${paragraphs(data).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
          <p class="letter-signature">${escapeHtml(data.signOff)}<br/>${escapeHtml(data.signatureName || data.applicantName)}</p>
        </section>
      </article>
    </div>
  `;
}

export function renderEliteCoverLetterPlainText(data: EliteCoverLetterData) {
  return serializeEliteCoverLetterData(data);
}

function wrapPdfLine(text: string, max = 92) {
  const words = clean(text).split(" ");
  const lines: string[] = [];
  let line = "";
  words.forEach((word) => {
    const candidate = `${line} ${word}`.trim();
    if (candidate.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function eliteCoverLetterPdfDocument(input: EliteCoverLetterData) {
  const data = normalizeEliteCoverLetterData(input);
  const meta = eliteCoverLetterTemplates.find((item) => item.name === data.selectedTemplate) ?? eliteCoverLetterTemplates[0];
  const lines: string[] = [];
  const pdfParagraphs = [
    data.applicantName,
    contactLines(data).join(" | "),
    "",
    data.documentDate,
    ...employerLines(data),
    "",
    ...paragraphs(data),
    "",
    data.signOff,
    data.signatureName || data.applicantName
  ];
  pdfParagraphs.forEach((paragraph) => {
    if (!paragraph) {
      lines.push("");
      return;
    }
    wrapPdfLine(paragraph, 86).forEach((line) => lines.push(line));
    lines.push("");
  });

  const objects: string[] = [];
  const pages: string[] = [];
  const pageLineLimit = 42;
  for (let i = 0; i < lines.length; i += pageLineLimit) {
    const pageLines = lines.slice(i, i + pageLineLimit);
    const commands = ["BT", "/F1 11 Tf", "58 780 Td"];
    pageLines.forEach((line, index) => {
      if (index > 0) commands.push("0 -17 Td");
      commands.push(`(${pdfEscape(line)}) Tj`);
    });
    commands.push("ET");
    const accentCommand = `0.12 0.25 0.40 rg 58 806 138 4 re f % ${pdfEscape(meta.name)}`;
    const content = `${accentCommand}\n${commands.join("\n")}`;
    const contentId = objects.length + 1;
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const pageId = objects.length + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`);
    pages.push(`${pageId} 0 R`);
  }

  const allObjects = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [${pages.join(" ")}] /Count ${pages.length} >>`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
    ...objects
  ];
  const offsets: number[] = [];
  let pdf = "%PDF-1.4\n";
  allObjects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${allObjects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${allObjects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

export function coverLetterRecommendations(data: EliteCoverLetterData | null, facts: CoverLetterProfileFacts) {
  const items = [
    !facts.fullName ? "Add your full name so employers know who is applying." : "",
    !facts.email && !facts.phone ? "Add at least one contact method before downloading." : "",
    !facts.selectedCvId ? "Create or save a CV first so PATHZY can use your selected CV evidence." : "",
    data && !data.jobDescription ? "Paste a job description to make the letter more targeted." : "",
    data && data.selectedEvidence.filter((item) => item.selected).length < 2 ? "Select at least two truthful evidence items before final review." : "",
    data && data.missingQualifications.length ? data.missingQualifications[0] : ""
  ].filter(Boolean);
  return items.length ? items : ["Your letter has enough core information. Review the evidence and tailor one paragraph before sending."];
}
