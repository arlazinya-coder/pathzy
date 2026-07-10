import { normalizeDocumentTemplate } from "@/lib/professional-identity/document-template-engine";
import type { PremiumDocumentTemplate } from "@/lib/professional-identity/document-template-engine";

export type CvTemplateName = PremiumDocumentTemplate;

export type CvSection = {
  title: string;
  items: string[];
};

export type CvModel = {
  fullName: string;
  targetRole: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  linkedIn: string;
  portfolio: string;
  github: string;
  website: string;
  professionalSummary: string;
  coreSkills: string[];
  technicalSkills: string[];
  professionalSkills: string[];
  professionalExperience: Array<{
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    achievements: string[];
  }>;
  projects: Array<{
    projectName: string;
    role: string;
    tools: string[];
    description: string;
    impact: string;
  }>;
  education: Array<{
    qualification: string;
    institution: string;
    fieldOfStudy: string;
    year: string;
    status: string;
  }>;
  certifications: Array<{
    name: string;
    provider: string;
    year: string;
    credentialUrl: string;
  }>;
  achievements: string[];
  languages: Array<{
    language: string;
    level: string;
  }>;
  references: {
    availableUponRequest: boolean;
    items: string[];
  };
  optionalSections: {
    volunteerExperience: string[];
    awards: string[];
    publications: string[];
    conferences: string[];
    professionalMemberships: string[];
    interests: string[];
    portfolioLinks: string[];
    qrCodePlaceholder: string;
  };
};

export type CoverLetterData = {
  fullName: string;
  phone: string;
  email: string;
  linkedIn: string;
  city: string;
  country: string;
  companyName: string;
  hiringManager: string;
  jobTitle: string;
  companyAddress: string;
  date: string;
  greeting: string;
  openingParagraph: string;
  bodyParagraphs: string[];
  closingParagraph: string;
  signature: string;
  tone: string;
  designSystem: CvTemplateName;
};

export type ParsedCv = CvModel & {
  missing: string[];
};

type CvRenderModel = {
  name: string;
  targetRole: string;
  contact: string[];
  sections: CvSection[];
};

type Rgb = [number, number, number];

type TextElement = {
  kind: "text";
  x: number;
  y: number;
  width: number;
  text: string;
  size: number;
  color: string;
  weight?: "regular" | "bold";
  uppercase?: boolean;
  letterSpacing?: number;
};

type RectElement = {
  kind: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

type LineElement = {
  kind: "line";
  x: number;
  y: number;
  width: number;
  color: string;
  thickness?: number;
  orientation?: "horizontal" | "vertical";
};

type CircleElement = {
  kind: "circle";
  x: number;
  y: number;
  radius: number;
  color: string;
};

type RoundedElement = {
  kind: "rounded";
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  color: string;
  borderColor?: string;
  className?: string;
  sectionId?: string;
};

type LayoutElement = TextElement | RectElement | LineElement | CircleElement | RoundedElement;

type LayoutPage = {
  elements: LayoutElement[];
};

type CvLayout = {
  width: number;
  height: number;
  pages: LayoutPage[];
};

const page = { width: 794, height: 1123 };
const pageBottom = page.height - 70;
const continuedPageTop = 116;

type CvDesignSystem = {
  name: CvTemplateName;
  identity: "ats" | "modern" | "professional" | "graduate" | "executive" | "consulting" | "creative" | "healthcare" | "engineering" | "international";
  ink: string;
  muted: string;
  navy: string;
  navyAlt: string;
  blue: string;
  sky: string;
  line: string;
  paper: string;
  sidebar: string;
  sidebarInk: string;
  card: string;
  cardBorder: string;
  cream: string;
  success: string;
  amber: string;
  heroText: string;
  heroMuted: string;
  headerHeight: number;
  sidebarWidth: number;
  columnGap: number;
  nameSize: number;
  roleSize: number;
  summarySize: number;
  sectionTitleSize: number;
  bodySize: number;
  bodyLineHeight: number;
  sideBodySize: number;
  sideLineHeight: number;
  cardRadius: number;
  chipRadius: number;
  titleLetterSpacing: number;
  dividerWeight: number;
  showHeroOrnaments: boolean;
};

const pathzyEliteDesignSystem: Record<CvTemplateName, CvDesignSystem> = {
  "Modern ATS": {
    name: "Modern ATS",
    identity: "ats",
    ink: "#1f2937",
    muted: "#667085",
    navy: "#ffffff",
    navyAlt: "#f8fafc",
    blue: "#1f4f82",
    sky: "#edf4fb",
    line: "#d8dee8",
    paper: "#ffffff",
    sidebar: "#f8fafc",
    sidebarInk: "#253347",
    card: "#ffffff",
    cardBorder: "#dfe5ef",
    cream: "#fbfdff",
    success: "#166534",
    amber: "#a16207",
    heroText: "#111827",
    heroMuted: "#344054",
    headerHeight: 178,
    sidebarWidth: 216,
    columnGap: 38,
    nameSize: 35,
    roleSize: 14,
    summarySize: 9.5,
    sectionTitleSize: 10,
    bodySize: 10.2,
    bodyLineHeight: 15.4,
    sideBodySize: 8.9,
    sideLineHeight: 11.4,
    cardRadius: 8,
    chipRadius: 8,
    titleLetterSpacing: 1.1,
    dividerWeight: 1,
    showHeroOrnaments: false
  },
  "Google Style": {
    name: "Google Style",
    identity: "modern",
    ink: "#182235",
    muted: "#667085",
    navy: "#0d2342",
    navyAlt: "#102b52",
    blue: "#2f80ed",
    sky: "#eaf3ff",
    line: "#d8e5f5",
    paper: "#ffffff",
    sidebar: "#f5f9ff",
    sidebarInk: "#20324f",
    card: "#ffffff",
    cardBorder: "#e4ecf7",
    cream: "#f8fbff",
    success: "#16a34a",
    amber: "#d99a2b",
    heroText: "#ffffff",
    heroMuted: "#dbeafe",
    headerHeight: 198,
    sidebarWidth: 218,
    columnGap: 38,
    nameSize: 38,
    roleSize: 15,
    summarySize: 9.4,
    sectionTitleSize: 10.5,
    bodySize: 10.6,
    bodyLineHeight: 15.5,
    sideBodySize: 9.2,
    sideLineHeight: 12,
    cardRadius: 12,
    chipRadius: 999,
    titleLetterSpacing: 1.4,
    dividerWeight: 1,
    showHeroOrnaments: true
  },
  "Healthcare Professional": {
    name: "Healthcare Professional",
    identity: "healthcare",
    ink: "#17231d",
    muted: "#66756d",
    navy: "#10231c",
    navyAlt: "#163528",
    blue: "#25745a",
    sky: "#eaf6f1",
    line: "#d7e8df",
    paper: "#ffffff",
    sidebar: "#f4faf7",
    sidebarInk: "#20372d",
    card: "#ffffff",
    cardBorder: "#dbece4",
    cream: "#fbfefc",
    success: "#15803d",
    amber: "#9a6a1d",
    heroText: "#ffffff",
    heroMuted: "#d8f3e7",
    headerHeight: 188,
    sidebarWidth: 206,
    columnGap: 42,
    nameSize: 36,
    roleSize: 14.5,
    summarySize: 9.3,
    sectionTitleSize: 10.2,
    bodySize: 10.4,
    bodyLineHeight: 15.8,
    sideBodySize: 9,
    sideLineHeight: 12,
    cardRadius: 10,
    chipRadius: 12,
    titleLetterSpacing: 1.2,
    dividerWeight: 1,
    showHeroOrnaments: false
  },
  "Graduate Elite": {
    name: "Graduate Elite",
    identity: "graduate",
    ink: "#1f2440",
    muted: "#667085",
    navy: "#202248",
    navyAlt: "#2f3167",
    blue: "#6366f1",
    sky: "#eef0ff",
    line: "#dde1ff",
    paper: "#ffffff",
    sidebar: "#f6f7ff",
    sidebarInk: "#2f335b",
    card: "#ffffff",
    cardBorder: "#e2e5ff",
    cream: "#fbfbff",
    success: "#16a34a",
    amber: "#b7791f",
    heroText: "#ffffff",
    heroMuted: "#e5e7ff",
    headerHeight: 206,
    sidebarWidth: 224,
    columnGap: 34,
    nameSize: 37,
    roleSize: 15,
    summarySize: 9.7,
    sectionTitleSize: 10.4,
    bodySize: 10.5,
    bodyLineHeight: 16,
    sideBodySize: 9.1,
    sideLineHeight: 12.2,
    cardRadius: 16,
    chipRadius: 999,
    titleLetterSpacing: 1.3,
    dividerWeight: 1,
    showHeroOrnaments: true
  },
  "Executive Black": {
    name: "Executive Black",
    identity: "executive",
    ink: "#201f1d",
    muted: "#6c665f",
    navy: "#171513",
    navyAlt: "#24211e",
    blue: "#9b7a3c",
    sky: "#f7f1e6",
    line: "#e4d8c3",
    paper: "#fffdfa",
    sidebar: "#fbf7ef",
    sidebarInk: "#302a22",
    card: "#fffdfa",
    cardBorder: "#e7dcc8",
    cream: "#fffbf4",
    success: "#166534",
    amber: "#9b7a3c",
    heroText: "#fffdfa",
    heroMuted: "#f2e5cf",
    headerHeight: 214,
    sidebarWidth: 204,
    columnGap: 46,
    nameSize: 40,
    roleSize: 14,
    summarySize: 9.6,
    sectionTitleSize: 10,
    bodySize: 10.4,
    bodyLineHeight: 16.2,
    sideBodySize: 8.9,
    sideLineHeight: 12,
    cardRadius: 6,
    chipRadius: 6,
    titleLetterSpacing: 1.8,
    dividerWeight: 1.2,
    showHeroOrnaments: false
  },
  "Microsoft Professional": {
    name: "Microsoft Professional",
    identity: "professional",
    ink: "#1f2937",
    muted: "#64748b",
    navy: "#102a56",
    navyAlt: "#1e3a8a",
    blue: "#2563eb",
    sky: "#eff6ff",
    line: "#dbe7fb",
    paper: "#ffffff",
    sidebar: "#f5f9ff",
    sidebarInk: "#26364f",
    card: "#ffffff",
    cardBorder: "#dbe7fb",
    cream: "#f8fbff",
    success: "#166534",
    amber: "#b7791f",
    heroText: "#ffffff",
    heroMuted: "#dbeafe",
    headerHeight: 184,
    sidebarWidth: 190,
    columnGap: 42,
    nameSize: 36,
    roleSize: 14,
    summarySize: 9.6,
    sectionTitleSize: 10.3,
    bodySize: 10.5,
    bodyLineHeight: 15.8,
    sideBodySize: 9,
    sideLineHeight: 12,
    cardRadius: 8,
    chipRadius: 6,
    titleLetterSpacing: 1,
    dividerWeight: 1.1,
    showHeroOrnaments: false
  },
  "Deloitte Consulting": {
    name: "Deloitte Consulting",
    identity: "consulting",
    ink: "#152012",
    muted: "#5f6f5c",
    navy: "#0f1d0f",
    navyAlt: "#193016",
    blue: "#86bc25",
    sky: "#f2f9e8",
    line: "#dcebc9",
    paper: "#ffffff",
    sidebar: "#f8fff2",
    sidebarInk: "#20321a",
    card: "#ffffff",
    cardBorder: "#dcebc9",
    cream: "#fbfff7",
    success: "#3f7d20",
    amber: "#8a6a16",
    heroText: "#ffffff",
    heroMuted: "#e8f7d5",
    headerHeight: 176,
    sidebarWidth: 188,
    columnGap: 46,
    nameSize: 35,
    roleSize: 13.5,
    summarySize: 9.2,
    sectionTitleSize: 9.8,
    bodySize: 10,
    bodyLineHeight: 14.8,
    sideBodySize: 8.7,
    sideLineHeight: 11.2,
    cardRadius: 4,
    chipRadius: 4,
    titleLetterSpacing: 1.6,
    dividerWeight: 1.4,
    showHeroOrnaments: false
  },
  "Creative Premium": {
    name: "Creative Premium",
    identity: "creative",
    ink: "#2b211c",
    muted: "#75685f",
    navy: "#321b13",
    navyAlt: "#5a2d1e",
    blue: "#f97316",
    sky: "#fff1e8",
    line: "#f2d6c4",
    paper: "#fffaf6",
    sidebar: "#fff3eb",
    sidebarInk: "#3b261c",
    card: "#fffdfa",
    cardBorder: "#f2d6c4",
    cream: "#fff8f2",
    success: "#166534",
    amber: "#f59e0b",
    heroText: "#fffaf6",
    heroMuted: "#ffedd5",
    headerHeight: 206,
    sidebarWidth: 236,
    columnGap: 30,
    nameSize: 39,
    roleSize: 15.2,
    summarySize: 9.7,
    sectionTitleSize: 10.8,
    bodySize: 10.4,
    bodyLineHeight: 16.1,
    sideBodySize: 9,
    sideLineHeight: 12.1,
    cardRadius: 20,
    chipRadius: 999,
    titleLetterSpacing: 1.1,
    dividerWeight: 1,
    showHeroOrnaments: true
  },
  "Engineering": {
    name: "Engineering",
    identity: "engineering",
    ink: "#17212b",
    muted: "#667085",
    navy: "#0f172a",
    navyAlt: "#1e293b",
    blue: "#0f766e",
    sky: "#ecfdfb",
    line: "#d5e7e5",
    paper: "#ffffff",
    sidebar: "#f8fafc",
    sidebarInk: "#1f2937",
    card: "#ffffff",
    cardBorder: "#d9e2e8",
    cream: "#fbfefd",
    success: "#0f766e",
    amber: "#a16207",
    heroText: "#ffffff",
    heroMuted: "#ccfbf1",
    headerHeight: 182,
    sidebarWidth: 230,
    columnGap: 34,
    nameSize: 34,
    roleSize: 13.8,
    summarySize: 9.2,
    sectionTitleSize: 10,
    bodySize: 10.1,
    bodyLineHeight: 15.1,
    sideBodySize: 8.8,
    sideLineHeight: 11.6,
    cardRadius: 6,
    chipRadius: 5,
    titleLetterSpacing: 1.4,
    dividerWeight: 1.2,
    showHeroOrnaments: false
  },
  "International Standard": {
    name: "International Standard",
    identity: "international",
    ink: "#1f2937",
    muted: "#667085",
    navy: "#ffffff",
    navyAlt: "#f8fafc",
    blue: "#334155",
    sky: "#f8fafc",
    line: "#d7dde6",
    paper: "#ffffff",
    sidebar: "#ffffff",
    sidebarInk: "#1f2937",
    card: "#ffffff",
    cardBorder: "#d7dde6",
    cream: "#ffffff",
    success: "#166534",
    amber: "#92400e",
    heroText: "#111827",
    heroMuted: "#475467",
    headerHeight: 168,
    sidebarWidth: 186,
    columnGap: 42,
    nameSize: 33,
    roleSize: 13.5,
    summarySize: 9.4,
    sectionTitleSize: 9.8,
    bodySize: 10.2,
    bodyLineHeight: 15.6,
    sideBodySize: 8.9,
    sideLineHeight: 11.8,
    cardRadius: 2,
    chipRadius: 2,
    titleLetterSpacing: 1.2,
    dividerWeight: 1,
    showHeroOrnaments: false
  }
};

let premiumTemplate = pathzyEliteDesignSystem["Google Style"];

function resolveCvTemplateDesign(templateName?: string): CvDesignSystem {
  return pathzyEliteDesignSystem[normalizeDocumentTemplate(templateName)] ?? pathzyEliteDesignSystem["Modern ATS"];
}

type CoverLetterDesign = {
  headerStyle: "minimal" | "band" | "accented" | "executive" | "fresh";
  marginX: number;
  firstPageTop: number;
  continuedTop: number;
  bottom: number;
  nameSize: number;
  contactSize: number;
  metaSize: number;
  bodySize: number;
  lineHeight: number;
  paragraphSpacing: number;
  blockSpacing: number;
  signatureSpacing: number;
  headerHeight: number;
  accentWidth: number;
  recipientInset: number;
};

function resolveCoverLetterDesign(templateName?: string): CoverLetterDesign {
  const template = resolveCvTemplateDesign(templateName);
  if (template.identity === "ats") {
    return {
      headerStyle: "minimal",
      marginX: 78,
      firstPageTop: 74,
      continuedTop: 92,
      bottom: page.height - 78,
      nameSize: 24,
      contactSize: 9.4,
      metaSize: 10,
      bodySize: 10.8,
      lineHeight: 16.4,
      paragraphSpacing: 17,
      blockSpacing: 8,
      signatureSpacing: 30,
      headerHeight: 86,
      accentWidth: 1.4,
      recipientInset: 0
    };
  }
  if (template.identity === "professional") {
    return {
      headerStyle: "accented",
      marginX: 72,
      firstPageTop: 78,
      continuedTop: 104,
      bottom: page.height - 78,
      nameSize: 27,
      contactSize: 9.5,
      metaSize: 10.2,
      bodySize: 11,
      lineHeight: 17,
      paragraphSpacing: 19,
      blockSpacing: 9,
      signatureSpacing: 34,
      headerHeight: 112,
      accentWidth: 7,
      recipientInset: 20
    };
  }
  if (template.identity === "executive") {
    return {
      headerStyle: "executive",
      marginX: 84,
      firstPageTop: 94,
      continuedTop: 116,
      bottom: page.height - 86,
      nameSize: 30,
      contactSize: 9.2,
      metaSize: 10.1,
      bodySize: 11.2,
      lineHeight: 18,
      paragraphSpacing: 21,
      blockSpacing: 11,
      signatureSpacing: 38,
      headerHeight: 132,
      accentWidth: 4,
      recipientInset: 24
    };
  }
  if (template.identity === "graduate") {
    return {
      headerStyle: "fresh",
      marginX: 70,
      firstPageTop: 76,
      continuedTop: 104,
      bottom: page.height - 76,
      nameSize: 28,
      contactSize: 9.4,
      metaSize: 10,
      bodySize: 10.8,
      lineHeight: 16.8,
      paragraphSpacing: 18,
      blockSpacing: 9,
      signatureSpacing: 32,
      headerHeight: 112,
      accentWidth: 10,
      recipientInset: 18
    };
  }
  return {
    headerStyle: "band",
    marginX: 74,
    firstPageTop: 82,
    continuedTop: 108,
    bottom: page.height - 80,
    nameSize: 28,
    contactSize: 9.4,
    metaSize: 10.1,
    bodySize: 10.9,
    lineHeight: 17,
    paragraphSpacing: 19,
    blockSpacing: 9,
    signatureSpacing: 34,
    headerHeight: 118,
    accentWidth: 6,
    recipientInset: 20
  };
}

const headings = new Map([
  ["PROFILE SUMMARY", "Professional Summary"],
  ["PROFESSIONAL SUMMARY", "Professional Summary"],
  ["RESUME PROFESSIONNEL", "Professional Summary"],
  ["CAREER GOAL", "Career Goal"],
  ["OBJECTIF DE CARRIERE", "Career Goal"],
  ["KEY SKILLS", "Key Skills"],
  ["SKILLS", "Key Skills"],
  ["COMPETENCES", "Key Skills"],
  ["CORE COMPETENCIES / SKILLS", "Core Competencies / Skills"],
  ["CORE COMPETENCIES", "Core Competencies / Skills"],
  ["CORE SKILLS", "Core Skills"],
  ["TECHNICAL SKILLS", "Technical Skills"],
  ["PROFESSIONAL SKILLS", "Professional Skills"],
  ["EXPERIENCE", "Experience"],
  ["WORK EXPERIENCE", "Work Experience"],
  ["PROFESSIONAL EXPERIENCE", "Professional Experience"],
  ["INTERNSHIP", "Internships"],
  ["INTERNSHIPS", "Internships"],
  ["FREELANCE EXPERIENCE", "Freelance Work"],
  ["FREELANCE WORK", "Freelance Work"],
  ["PROJECTS", "Projects"],
  ["PROJETS", "Projects"],
  ["EDUCATION", "Education"],
  ["FORMATION", "Education"],
  ["CERTIFICATIONS", "Certifications"],
  ["ACHIEVEMENTS", "Achievements"],
  ["REALISATIONS", "Achievements"],
  ["LANGUAGES", "Languages"],
  ["LANGUES", "Languages"],
  ["REFERENCES", "References"],
  ["PORTFOLIO", "Portfolio / LinkedIn / GitHub / Website"],
  ["PORTFOLIO LINKS", "Portfolio Links"],
  ["LINKEDIN", "Portfolio / LinkedIn / GitHub / Website"],
  ["GITHUB", "Portfolio / LinkedIn / GitHub / Website"],
  ["WEBSITE", "Portfolio / LinkedIn / GitHub / Website"],
  ["PORTFOLIO / LINKEDIN / GITHUB / WEBSITE", "Portfolio / LinkedIn / GitHub / Website"],
  ["VOLUNTEER EXPERIENCE", "Volunteer Experience"],
  ["AWARDS", "Awards"],
  ["PUBLICATIONS", "Publications"],
  ["CONFERENCES", "Conferences"],
  ["PROFESSIONAL MEMBERSHIPS", "Professional Memberships"],
  ["INTERESTS", "Interests"],
  ["PREVIOUS CV DETAILS", "Previous CV Details"],
  ["ADDITIONAL DETAILS FROM PREVIOUS CV", "Previous CV Details"]
]);

const forbiddenOutputPatterns = [
  /pathzy/i,
  /\bAI\b.*(generated|builder|support)/i,
  /generated by/i,
  /^trust note/i,
  /^style:/i,
  /^template:/i,
  /^note de confiance/i,
  /will not invent/i,
  /ne doit pas inventer/i,
  /replace empty sections/i,
  /remplacez les sections/i,
  /add your/i,
  /ajoutez/i,
  /editor instruction/i,
  /old cv details to review/i,
  /informations extraites/i,
  /available on request/i,
  /to be completed/i
];

export function slugifyDocumentName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "cv";
}

function escapeHtml(value: string) {
  return value.replace(/[<>&"]/g, (match) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[match] ?? match);
}

function escapePdfText(value: string) {
  return value.replace(/[^\x20-\x7e]/g, "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function professionalizeLine(value: string) {
  return value
    .replace(/\bexcel\b/gi, "Excel")
    .replace(/\bmicrosoft\s+microsoft\s+word\b/gi, "Microsoft Word")
    .replace(/\bms word\b/gi, "Microsoft Word")
    .replace(/\bmicrosoft word\b/gi, "Microsoft Word")
    .replace(/(^|[^a-z])word\b/gi, "$1Microsoft Word")
    .replace(/\bsql\b/gi, "SQL")
    .replace(/\bjavascript\b/gi, "JavaScript")
    .replace(/\bpowerpoint\b/gi, "PowerPoint")
    .replace(/\benglish\b/gi, "English")
    .replace(/\bfrench\b/gi, "French")
    .replace(/\bmicrosoft\s+microsoft\s+word\b/gi, "Microsoft Word")
    .replace(/[ \t]{2,}/g, " ");
}

function cleanFinalLine(line: string) {
  const withoutBullet = line.replace(/^[-*•]\s*/, "");
  const trimmed = withoutBullet.trim();
  if (!trimmed) return "";
  if (forbiddenOutputPatterns.some((pattern) => pattern.test(trimmed))) return "";
  return professionalizeLine(trimmed);
}

function isContactLine(line: string) {
  return /@|phone|tel|linkedin|portfolio|http|www\.|,/.test(line.toLowerCase());
}

function emptyCvModel(): CvModel {
  return {
    fullName: "",
    targetRole: "",
    phone: "",
    email: "",
    city: "",
    country: "",
    linkedIn: "",
    portfolio: "",
    github: "",
    website: "",
    professionalSummary: "",
    coreSkills: [],
    technicalSkills: [],
    professionalSkills: [],
    professionalExperience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
    languages: [],
    references: { availableUponRequest: false, items: [] },
    optionalSections: {
      volunteerExperience: [],
      awards: [],
      publications: [],
      conferences: [],
      professionalMemberships: [],
      interests: [],
      portfolioLinks: [],
      qrCodePlaceholder: ""
    }
  };
}

function emptyCoverLetterData(): CoverLetterData {
  return {
    fullName: "",
    phone: "",
    email: "",
    linkedIn: "",
    city: "",
    country: "",
    companyName: "",
    hiringManager: "",
    jobTitle: "",
    companyAddress: "",
    date: "",
    greeting: "",
    openingParagraph: "",
    bodyParagraphs: [],
    closingParagraph: "",
    signature: "",
    tone: "professional",
    designSystem: "Modern ATS"
  };
}

function cleanItems(items: string[]) {
  const seen = new Set<string>();
  const clean: string[] = [];
  for (const item of items) {
    const next = cleanFinalLine(item);
    if (!next) continue;
    const key = next.toLowerCase().replace(/[^a-z0-9+#]+/g, "");
    if (seen.has(key)) continue;
    seen.add(key);
    clean.push(next);
  }
  return clean;
}

function normalizeCoverLetterData(data: CoverLetterData): CoverLetterData {
  return {
    fullName: cleanFinalLine(data.fullName),
    phone: cleanFinalLine(data.phone),
    email: cleanFinalLine(data.email),
    linkedIn: cleanFinalLine(data.linkedIn),
    city: cleanFinalLine(data.city),
    country: cleanFinalLine(data.country),
    companyName: cleanFinalLine(data.companyName),
    hiringManager: cleanFinalLine(data.hiringManager),
    jobTitle: cleanFinalLine(data.jobTitle),
    companyAddress: cleanFinalLine(data.companyAddress),
    date: cleanFinalLine(data.date),
    greeting: cleanFinalLine(data.greeting),
    openingParagraph: cleanFinalLine(data.openingParagraph),
    bodyParagraphs: cleanItems(data.bodyParagraphs),
    closingParagraph: cleanFinalLine(data.closingParagraph),
    signature: cleanFinalLine(data.signature),
    tone: cleanFinalLine(data.tone) || "professional",
    designSystem: normalizeDocumentTemplate(data.designSystem)
  };
}

export function coverLetterDataFromUnknown(value: unknown, fallbackContent = ""): CoverLetterData {
  const base = emptyCoverLetterData();
  if (value && typeof value === "object") {
    const candidate = value as Partial<CoverLetterData>;
    return normalizeCoverLetterData({
      ...base,
      ...candidate,
      linkedIn: typeof candidate.linkedIn === "string" ? candidate.linkedIn : "",
      bodyParagraphs: Array.isArray(candidate.bodyParagraphs) ? candidate.bodyParagraphs.filter((item): item is string => typeof item === "string") : [],
      designSystem: candidate.designSystem ?? base.designSystem
    });
  }
  const lines = fallbackContent.split(/\r?\n/).map(cleanFinalLine).filter(Boolean);
  const greetingIndex = lines.findIndex((line) => /^(hello|dear|bonjour)/i.test(line));
  const signature = lines.at(-1) ?? "";
  const paragraphs = lines.slice(greetingIndex > -1 ? greetingIndex + 1 : 0, signature ? -1 : undefined);
  return normalizeCoverLetterData({
    ...base,
    greeting: greetingIndex > -1 ? lines[greetingIndex] : "Dear Hiring Manager,",
    openingParagraph: paragraphs[0] ?? "",
    bodyParagraphs: paragraphs.slice(1, -1),
    closingParagraph: paragraphs.at(-1) ?? "",
    signature
  });
}

export function normalizeCoverLetterDataForExport(data: CoverLetterData): CoverLetterData {
  return normalizeCoverLetterData(data);
}

function missingForCv(cv: CvModel) {
  return [
    !cv.fullName.trim() ? "Full name" : "",
    !cv.targetRole.trim() ? "Target role" : "",
    !cv.email.trim() ? "Email" : "",
    ![cv.phone, cv.email, cv.city, cv.country, cv.linkedIn, cv.portfolio, cv.github, cv.website].some((line) => line.trim()) ? "Contact details" : ""
  ].filter(Boolean);
}

function normalizeCvModel(cv: CvModel): CvModel {
  return {
    ...cv,
    fullName: cleanFinalLine(cv.fullName),
    targetRole: cleanFinalLine(cv.targetRole),
    phone: cleanFinalLine(cv.phone),
    email: cleanFinalLine(cv.email),
    city: cleanFinalLine(cv.city),
    country: cleanFinalLine(cv.country),
    linkedIn: cleanFinalLine(cv.linkedIn),
    portfolio: cleanFinalLine(cv.portfolio),
    github: cleanFinalLine(cv.github),
    website: cleanFinalLine(cv.website),
    professionalSummary: cleanFinalLine(cv.professionalSummary),
    coreSkills: cleanItems(cv.coreSkills),
    technicalSkills: cleanItems(cv.technicalSkills),
    professionalSkills: cleanItems(cv.professionalSkills),
    professionalExperience: cv.professionalExperience.map((item) => ({
      role: cleanFinalLine(item.role),
      company: cleanFinalLine(item.company),
      location: cleanFinalLine(item.location),
      startDate: cleanFinalLine(item.startDate),
      endDate: cleanFinalLine(item.endDate),
      current: Boolean(item.current),
      achievements: cleanItems(item.achievements)
    })),
    projects: cv.projects.map((item) => ({
      projectName: cleanFinalLine(item.projectName),
      role: cleanFinalLine(item.role),
      tools: cleanItems(item.tools),
      description: cleanFinalLine(item.description),
      impact: cleanFinalLine(item.impact)
    })),
    education: cv.education.map((item) => ({
      qualification: cleanFinalLine(item.qualification),
      institution: cleanFinalLine(item.institution),
      fieldOfStudy: cleanFinalLine(item.fieldOfStudy),
      year: cleanFinalLine(item.year),
      status: cleanFinalLine(item.status)
    })),
    certifications: cv.certifications.map((item) => ({
      name: cleanFinalLine(item.name),
      provider: cleanFinalLine(item.provider),
      year: cleanFinalLine(item.year),
      credentialUrl: cleanFinalLine(item.credentialUrl)
    })),
    achievements: cleanItems(cv.achievements),
    languages: cv.languages.map((item) => ({ language: cleanFinalLine(item.language), level: cleanFinalLine(item.level) })),
    references: { availableUponRequest: Boolean(cv.references.availableUponRequest), items: cleanItems(cv.references.items) },
    optionalSections: {
      volunteerExperience: cleanItems(cv.optionalSections.volunteerExperience),
      awards: cleanItems(cv.optionalSections.awards),
      publications: cleanItems(cv.optionalSections.publications),
      conferences: cleanItems(cv.optionalSections.conferences),
      professionalMemberships: cleanItems(cv.optionalSections.professionalMemberships),
      interests: cleanItems(cv.optionalSections.interests),
      portfolioLinks: cleanItems(cv.optionalSections.portfolioLinks),
      qrCodePlaceholder: cleanFinalLine(cv.optionalSections.qrCodePlaceholder)
    }
  };
}

export function normalizeCvModelForExport(cv: CvModel): CvModel {
  return normalizeCvModel(cv);
}

function parseLegacyCvContent(content: string): CvRenderModel {
  const rawLines = content.split(/\r?\n/).filter((line) => line.trim());
  const lines = rawLines.map(cleanFinalLine).filter(Boolean);
  const firstHeading = lines.findIndex((line) => headings.has(line.toUpperCase()));
  const header = firstHeading > -1 ? lines.slice(0, firstHeading) : lines.slice(0, 5);
  const nameLine = header.find((line) => /^FULL NAME:/i.test(line));
  const roleLine = header.find((line) => /^TARGET ROLE:/i.test(line));
  const unlabeledHeader = header.filter((line) => !/^FULL NAME:|^TARGET ROLE:/i.test(line));
  const name = nameLine ? nameLine.replace(/^FULL NAME:\s*/i, "") : unlabeledHeader[0] && !headings.has(unlabeledHeader[0].toUpperCase()) ? unlabeledHeader[0] : "";
  const targetRole = roleLine ? roleLine.replace(/^TARGET ROLE:\s*/i, "") : unlabeledHeader[1] && !headings.has(unlabeledHeader[1].toUpperCase()) ? unlabeledHeader[1] : "";
  const contact = (nameLine || roleLine ? unlabeledHeader : header.slice(2)).filter(isContactLine).slice(0, 6);
  const body = firstHeading > -1 ? lines.slice(firstHeading) : lines.slice(5);
  const sections: CvSection[] = [];
  let current: CvSection | null = null;

  for (const line of body) {
    const heading = headings.get(line.toUpperCase());
    if (heading) {
      current = sections.find((section) => section.title === heading) ?? { title: heading, items: [] };
      if (!sections.includes(current)) sections.push(current);
    } else if (current) {
      current.items.push(line);
    }
  }

  const cleanSections = sections
    .map((section) => ({
      title: section.title,
      items: Array.from(new Set(section.items.map(cleanFinalLine).filter(Boolean))).slice(0, 14)
    }))
    .filter((section) => section.title);

  return {
    name,
    targetRole,
    contact,
    sections: cleanSections
  };
}

export function cvModelFromContent(content: string): CvModel {
  const legacy = parseLegacyCvContent(content);
  return cvModelFromLegacy(legacy);
}

function sectionItems(legacy: CvRenderModel, title: string) {
  return legacy.sections.find((section) => section.title === title)?.items ?? [];
}

function cvModelFromLegacy(legacy: CvRenderModel): CvModel {
  const cv = emptyCvModel();
  cv.fullName = legacy.name;
  cv.targetRole = legacy.targetRole;
  cv.email = legacy.contact.find((line) => line.includes("@")) ?? "";
  cv.phone = legacy.contact.find((line) => /phone|tel|\+?\d[\d\s().-]{5,}/i.test(line) && !line.includes("@")) ?? "";
  cv.linkedIn = legacy.contact.find((line) => /linkedin/i.test(line)) ?? "";
  cv.portfolio = legacy.contact.find((line) => /portfolio/i.test(line)) ?? "";
  cv.github = legacy.contact.find((line) => /github/i.test(line)) ?? "";
  cv.website = legacy.contact.find((line) => /www\.|https?:\/\//i.test(line) && !/linkedin|github|portfolio/i.test(line)) ?? "";
  const location = legacy.contact.find((line) => line.includes(",") && !line.includes("@")) ?? "";
  if (location) {
    const [city = "", country = ""] = location.split(",").map((part) => part.trim());
    cv.city = city;
    cv.country = country;
  }
  cv.professionalSummary = sectionItems(legacy, "Professional Summary")[0] ?? "";
  cv.coreSkills = cleanItems([...sectionItems(legacy, "Core Competencies / Skills"), ...sectionItems(legacy, "Core Skills"), ...sectionItems(legacy, "Key Skills")]);
  cv.technicalSkills = cleanItems(sectionItems(legacy, "Technical Skills"));
  cv.professionalSkills = cleanItems(sectionItems(legacy, "Professional Skills"));
  cv.professionalExperience = cleanItems([...sectionItems(legacy, "Professional Experience"), ...sectionItems(legacy, "Work Experience"), ...sectionItems(legacy, "Experience")]).map((item) => ({ role: item, company: "", location: "", startDate: "", endDate: "", current: false, achievements: [] }));
  cv.projects = cleanItems(sectionItems(legacy, "Projects")).map((item) => ({ projectName: item, role: "", tools: [], description: "", impact: "" }));
  cv.education = cleanItems(sectionItems(legacy, "Education")).map((item) => ({ qualification: item, institution: "", fieldOfStudy: "", year: "", status: "" }));
  cv.certifications = cleanItems(sectionItems(legacy, "Certifications")).map((item) => ({ name: item, provider: "", year: "", credentialUrl: "" }));
  cv.achievements = cleanItems(sectionItems(legacy, "Achievements"));
  cv.languages = cleanItems(sectionItems(legacy, "Languages")).map((item) => ({ language: item, level: "" }));
  const references = cleanItems(sectionItems(legacy, "References"));
  cv.references = { availableUponRequest: references.some((item) => /available/i.test(item)), items: references.filter((item) => !/available/i.test(item)) };
  cv.optionalSections.volunteerExperience = cleanItems(sectionItems(legacy, "Volunteer Experience"));
  cv.optionalSections.awards = cleanItems(sectionItems(legacy, "Awards"));
  cv.optionalSections.publications = cleanItems(sectionItems(legacy, "Publications"));
  cv.optionalSections.conferences = cleanItems(sectionItems(legacy, "Conferences"));
  cv.optionalSections.professionalMemberships = cleanItems(sectionItems(legacy, "Professional Memberships"));
  cv.optionalSections.interests = cleanItems(sectionItems(legacy, "Interests"));
  cv.optionalSections.portfolioLinks = cleanItems(sectionItems(legacy, "Portfolio Links"));
  return cv;
}

export function cvModelWithMissing(cv: CvModel): ParsedCv {
  return { ...cv, missing: missingForCv(cv) };
}

export function cvModelFromUnknown(value: unknown, fallbackContent = ""): CvModel {
  if (value && typeof value === "object") {
    const candidate = value as Partial<CvModel> & { name?: string; contact?: string[]; sections?: CvSection[] };
    if (typeof candidate.fullName === "string") return { ...emptyCvModel(), ...candidate } as CvModel;
    if (typeof candidate.name === "string" || Array.isArray(candidate.sections)) return cvModelFromLegacy({
      name: typeof candidate.name === "string" ? candidate.name : "",
      targetRole: typeof candidate.targetRole === "string" ? candidate.targetRole : "",
      contact: Array.isArray(candidate.contact) ? candidate.contact.filter((item): item is string => typeof item === "string") : [],
      sections: Array.isArray(candidate.sections)
        ? candidate.sections.filter((section): section is CvSection => Boolean(section) && typeof section.title === "string" && Array.isArray(section.items)).map((section) => ({ title: section.title, items: section.items.filter((item): item is string => typeof item === "string") }))
        : []
    });
  }
  return cvModelFromContent(fallbackContent);
}

function contactLines(cv: CvModel) {
  return [
    cv.email,
    cv.phone,
    [cv.city, cv.country].filter(Boolean).join(", "),
    cv.linkedIn ? `LinkedIn: ${cv.linkedIn}` : "",
    cv.portfolio ? `Portfolio: ${cv.portfolio}` : "",
    cv.github ? `GitHub: ${cv.github}` : "",
    cv.website ? `Website: ${cv.website}` : ""
  ].filter((line) => line.trim());
}

function compactLine(parts: string[]) {
  return parts.filter((part) => part.trim()).join(" | ");
}

function cvModelToRenderModel(input: CvModel): CvRenderModel {
  const cv = normalizeCvModel(input);
  const sections: CvSection[] = [];
  const push = (title: string, items: string[]) => {
    const clean = cleanItems(items);
    if (clean.length) sections.push({ title, items: clean });
  };
  push("Professional Summary", [cv.professionalSummary]);
  push("Core Competencies / Skills", cv.coreSkills);
  push("Technical Skills", cv.technicalSkills);
  push("Professional Skills", cv.professionalSkills);
  push("Professional Experience", cv.professionalExperience.map((item) => compactLine([
    item.role,
    item.company,
    item.location,
    compactLine([item.startDate, item.current ? "Present" : item.endDate]),
    ...item.achievements
  ])));
  push("Projects", cv.projects.map((item) => compactLine([item.projectName, item.role, item.tools.join(", "), item.description, item.impact])));
  push("Education", cv.education.map((item) => compactLine([item.qualification, item.institution, item.fieldOfStudy, item.year, item.status])));
  push("Certifications", cv.certifications.map((item) => compactLine([item.name, item.provider, item.year, item.credentialUrl])));
  push("Achievements", cv.achievements);
  push("Languages", cv.languages.map((item) => compactLine([item.language, item.level])));
  push("References", [...cv.references.items, cv.references.availableUponRequest ? "Available upon request" : ""]);
  push("Volunteer Experience", cv.optionalSections.volunteerExperience);
  push("Awards", cv.optionalSections.awards);
  push("Publications", cv.optionalSections.publications);
  push("Conferences", cv.optionalSections.conferences);
  push("Professional Memberships", cv.optionalSections.professionalMemberships);
  push("Interests", cv.optionalSections.interests);
  push("Portfolio Links", cv.optionalSections.portfolioLinks);
  return { name: cv.fullName, targetRole: cv.targetRole, contact: contactLines(cv), sections };
}

export function parseCvContent(content: string): ParsedCv {
  return cvModelWithMissing(cvModelFromContent(content));
}

function section(cv: CvRenderModel, title: string) {
  return cv.sections.find((item) => item.title === title);
}

function mainSections(cv: CvRenderModel) {
  const order = ["Career Goal", "Professional Experience", "Work Experience", "Experience", "Internships", "Freelance Work", "Projects", "Volunteer Experience", "Education", "Certifications", "Achievements", "Awards", "Publications", "Conferences", "Professional Memberships", "Interests", "References"];
  return order.map((title) => section(cv, title)).filter((item) => item?.items.length) as CvSection[];
}

function sideSections(cv: CvRenderModel) {
  const order = ["Core Competencies / Skills", "Core Skills", "Technical Skills", "Professional Skills", "Key Skills", "Portfolio Links", "GitHub", "Website", "Portfolio / LinkedIn / GitHub / Website", "Languages"];
  return order.map((title) => section(cv, title)).filter((item) => item?.items.length) as CvSection[];
}

function serializeRenderModel(cv: CvRenderModel) {
  const cleanSections = cv.sections.map((section) => ({ ...section, items: cleanItems(section.items) })).filter((section) => section.title);
  return [
    `FULL NAME: ${professionalizeLine(cv.name)}`,
    `TARGET ROLE: ${professionalizeLine(cv.targetRole)}`,
    ...cv.contact.map((line) => professionalizeLine(line)).filter((line) => line.trim()),
    "",
    ...cleanSections.flatMap((section) => [section.title.toUpperCase(), ...section.items.map((item) => `- ${item}`), ""])
  ].filter((line, index, lines) => line || lines[index - 1]).join("\n").trim();
}

export function serializeCvContent(cv: ParsedCv) {
  return serializeRenderModel(cvModelToRenderModel(cv));
}

export function serializeCvModel(cv: CvModel) {
  return serializeRenderModel(cvModelToRenderModel(cv));
}

function sectionIcon(title: string) {
  if (title === "Professional Summary") return "01";
  if (title === "Career Goal") return "02";
  if (title === "Experience" || title === "Work Experience" || title === "Professional Experience") return "03";
  if (title === "Internships") return "IT";
  if (title === "Freelance Work") return "FR";
  if (title === "Projects") return "04";
  if (title === "Education") return "05";
  if (title === "Achievements") return "06";
  if (title === "Key Skills" || title === "Core Competencies / Skills" || title === "Core Skills" || title === "Technical Skills" || title === "Professional Skills") return "SK";
  if (title === "Certifications") return "CE";
  if (title === "Languages") return "LA";
  return "IN";
}

function skillGroupLabel(skill: string) {
  const lower = skill.toLowerCase().replace(/microsoft\s+microsoft\s+word/g, "microsoft word");
  if (/excel|sql|data|python|analytics|figma|design|javascript|react|cloud|software|microsoft|powerpoint/.test(lower)) return "Technical";
  if (/communication|leadership|team|customer|sales|writing|presentation|planning/.test(lower)) return "Professional";
  if (/english|french|spanish|language/.test(lower)) return "Languages";
  return "Core";
}

function groupedSkills(items: string[]) {
  const groups = new Map<string, string[]>();
  for (const item of items) {
    const label = skillGroupLabel(item);
    groups.set(label, [...(groups.get(label) ?? []), item]);
  }
  return Array.from(groups.entries()).map(([label, skills]) => ({ label, skills }));
}

function estimateTextWidth(text: string, size: number) {
  return text.length * size * 0.48;
}

function splitLongWord(word: string, width: number, size: number) {
  if (estimateTextWidth(word, size) <= width) return [word];
  const charsPerLine = Math.max(8, Math.floor(width / (size * 0.52)));
  const parts: string[] = [];
  for (let index = 0; index < word.length; index += charsPerLine) parts.push(word.slice(index, index + charsPerLine));
  return parts;
}

function wrapText(text: string, width: number, size: number) {
  const words = text.split(/\s+/).filter(Boolean).flatMap((word) => splitLongWord(word, width, size));
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = `${current} ${word}`.trim();
    if (estimateTextWidth(next, size) > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function hexToRgb(hex: string): Rgb {
  const clean = hex.replace("#", "");
  return [
    Number.parseInt(clean.slice(0, 2), 16) / 255,
    Number.parseInt(clean.slice(2, 4), 16) / 255,
    Number.parseInt(clean.slice(4, 6), 16) / 255
  ];
}

function pushWrappedText(elements: LayoutElement[], text: string, x: number, y: number, width: number, size: number, color: string, lineHeight: number, weight: "regular" | "bold" = "regular") {
  const lines = wrapText(text, width, size);
  lines.forEach((line, index) => {
    elements.push({ kind: "text", x, y: y + index * lineHeight, width, text: line, size, color, weight });
  });
  return y + lines.length * lineHeight;
}

function addPage(layout: CvLayout, continuedName = "") {
  const elements: LayoutElement[] = [
    { kind: "rect", x: 0, y: 0, width: page.width, height: page.height, color: premiumTemplate.paper }
  ];
  if (continuedName) {
    elements.push({ kind: "text", x: 58, y: 54, width: 430, text: `${continuedName} - continued`, size: 11, color: premiumTemplate.blue, weight: "bold", uppercase: true, letterSpacing: 1.4 });
    elements.push({ kind: "line", x: 58, y: 78, width: 678, color: premiumTemplate.line, thickness: 1 });
  }
  const pageEntry = { elements };
  layout.pages.push(pageEntry);
  return pageEntry;
}

function isActiveCvSection(activeSection: string | undefined, title: string) {
  if (!activeSection) return false;
  if (activeSection === title) return true;
  if (title === "Professional Header") return ["Header", "GitHub", "Website", "LinkedIn", "Portfolio"].includes(activeSection);
  if (title === "Header") return activeSection === "Professional Header";
  return false;
}

function drawSectionTitle(elements: LayoutElement[], title: string, x: number, y: number, width: number, activeSection?: string) {
  if (isActiveCvSection(activeSection, title)) elements.push({ kind: "rounded", x: x - 12, y: y - 15, width: width + 24, height: 48, radius: 14, color: "#edf6ff", borderColor: premiumTemplate.blue, className: "cv-active-section", sectionId: "cv-section-active" });
  elements.push({ kind: "rounded", x, y: y - 6, width: 24, height: 24, radius: premiumTemplate.cardRadius, color: premiumTemplate.sky, borderColor: premiumTemplate.line });
  elements.push({ kind: "text", x: x + 5, y: y + 1, width: 20, text: sectionIcon(title), size: 7, color: premiumTemplate.blue, weight: "bold" });
  elements.push({ kind: "text", x: x + 34, y, width: width - 34, text: title, size: premiumTemplate.sectionTitleSize, color: premiumTemplate.identity === "ats" ? premiumTemplate.ink : premiumTemplate.navy, weight: "bold", uppercase: true, letterSpacing: premiumTemplate.titleLetterSpacing });
  elements.push({ kind: "line", x: x + 34, y: y + 20, width: width - 34, color: premiumTemplate.line, thickness: premiumTemplate.dividerWeight });
  return y + 42;
}

function timelineSection(title: string) {
  return ["Experience", "Work Experience", "Professional Experience", "Internships", "Freelance Work", "Projects", "Education", "Volunteer Experience"].includes(title);
}

function skillSection(title: string) {
  return title === "Key Skills" || title === "Core Competencies / Skills" || title === "Technical Skills" || title === "Professional Skills";
}

function estimateMainItemHeight(title: string, item: string, width: number) {
  if (timelineSection(title)) return Math.max(46, wrapText(item, width - 44, premiumTemplate.bodySize - 0.3).length * (premiumTemplate.bodyLineHeight - 1.5) + 24) + 14;
  return wrapText(item, width - 14, premiumTemplate.bodySize).length * premiumTemplate.bodyLineHeight + 27;
}

function chunkLines(lines: string[], maxLines: number) {
  const chunks: string[][] = [];
  for (let index = 0; index < lines.length; index += Math.max(1, maxLines)) chunks.push(lines.slice(index, index + Math.max(1, maxLines)));
  return chunks;
}

function drawMainSection(layout: CvLayout, pageEntry: LayoutPage, cursor: number, cv: CvRenderModel, sectionData: CvSection, x: number, width: number, activeSection?: string) {
  let currentPage = pageEntry;
  let y = cursor;
  const ensure = (needed = 80) => {
    if (y + needed <= pageBottom) return;
    currentPage = addPage(layout, cv.name || "CV");
    y = continuedPageTop;
  };
  const firstItemHeight = sectionData.items[0] ? estimateMainItemHeight(sectionData.title, sectionData.items[0], width) : 0;
  ensure(42 + Math.min(firstItemHeight, pageBottom - continuedPageTop - 42));
  y = drawSectionTitle(currentPage.elements, sectionData.title, x, y, width, activeSection);
  const timeline = timelineSection(sectionData.title);
  for (const item of sectionData.items) {
    if (timeline) {
      const itemSize = premiumTemplate.bodySize - 0.3;
      const itemLineHeight = premiumTemplate.bodyLineHeight - 1.5;
      const lines = wrapText(item, width - 44, itemSize);
      const maxLinesPerCard = Math.max(1, Math.floor((pageBottom - continuedPageTop - 42) / itemLineHeight));
      for (const [chunkIndex, chunk] of chunkLines(lines, maxLinesPerCard).entries()) {
        const cardHeight = Math.max(46, chunk.length * itemLineHeight + 24);
        ensure(cardHeight + 18);
        currentPage.elements.push({ kind: "line", x: x + 11, y: y + 12, width: cardHeight - 8, color: premiumTemplate.line, thickness: 1, orientation: "vertical" });
        currentPage.elements.push({ kind: "circle", x: x + 11, y: y + 12, radius: 5, color: premiumTemplate.blue });
        currentPage.elements.push({ kind: "rounded", x: x + 30, y: y - 6, width: width - 30, height: cardHeight, radius: premiumTemplate.cardRadius, color: premiumTemplate.card, borderColor: premiumTemplate.cardBorder });
        chunk.forEach((line, index) => {
          currentPage.elements.push({ kind: "text", x: x + 46, y: y + 10 + index * itemLineHeight, width: width - 62, text: line, size: itemSize, color: premiumTemplate.ink, weight: chunkIndex === 0 && index === 0 ? "bold" : "regular" });
        });
        y += cardHeight + 14;
      }
    } else {
      const lines = wrapText(item, width - 14, premiumTemplate.bodySize);
      const maxLinesPerBlock = Math.max(1, Math.floor((pageBottom - continuedPageTop - 18) / premiumTemplate.bodyLineHeight));
      for (const chunk of chunkLines(lines, maxLinesPerBlock)) {
        ensure(chunk.length * premiumTemplate.bodyLineHeight + 18);
        currentPage.elements.push({ kind: "circle", x, y: y + 7, radius: 2.4, color: premiumTemplate.blue });
        chunk.forEach((line, index) => {
          currentPage.elements.push({ kind: "text", x: x + 14, y: y + index * premiumTemplate.bodyLineHeight, width: width - 14, text: line, size: premiumTemplate.bodySize, color: premiumTemplate.ink });
        });
        y += chunk.length * premiumTemplate.bodyLineHeight + 9;
      }
    }
  }
  return { pageEntry: currentPage, y: y + 8 };
}

function estimateSideSectionHeight(sectionData: CvSection, width: number) {
  let height = 42;
  if (skillSection(sectionData.title)) {
    for (const group of groupedSkills(sectionData.items)) {
      height += 26;
      for (const skill of group.skills) height += Math.max(24, wrapText(skill, width - 28, premiumTemplate.sideBodySize - 0.2).length * 11 + 10) + 7;
      height += 8;
    }
    return height + 4;
  }
  for (const item of sectionData.items) height += Math.max(26, wrapText(item, width - 26, premiumTemplate.sideBodySize).length * premiumTemplate.sideLineHeight + 12) + 8;
  return height + 8;
}

function splitSideSectionToFit(sectionData: CvSection, width: number, availableHeight: number) {
  if (estimateSideSectionHeight(sectionData, width) <= availableHeight) return { fit: sectionData, overflow: null };
  let fitCount = 0;
  for (let count = 1; count <= sectionData.items.length; count++) {
    const candidate = { title: sectionData.title, items: sectionData.items.slice(0, count) };
    if (estimateSideSectionHeight(candidate, width) > availableHeight) break;
    fitCount = count;
  }
  if (!fitCount) return { fit: null, overflow: sectionData };
  const fit = { title: sectionData.title, items: sectionData.items.slice(0, fitCount) };
  const overflowItems = sectionData.items.slice(fitCount);
  return { fit, overflow: overflowItems.length ? { title: sectionData.title, items: overflowItems } : null };
}

function drawSideSection(elements: LayoutElement[], sectionData: CvSection, x: number, y: number, width: number, activeSection?: string) {
  let cursor = drawSectionTitle(elements, sectionData.title, x, y, width, activeSection);
  if (skillSection(sectionData.title)) {
    for (const group of groupedSkills(sectionData.items)) {
      elements.push({ kind: "text", x, y: cursor, width, text: group.label, size: 8.5, color: premiumTemplate.muted, weight: "bold", uppercase: true, letterSpacing: 1 });
      cursor += 18;
      for (const skill of group.skills) {
        const lines = wrapText(skill, width - 28, premiumTemplate.sideBodySize - 0.2);
        const height = Math.max(24, lines.length * 11 + 10);
        elements.push({ kind: "rounded", x, y: cursor - 3, width, height, radius: premiumTemplate.chipRadius, color: "#ffffff", borderColor: premiumTemplate.cardBorder });
        lines.forEach((line, index) => elements.push({ kind: "text", x: x + 14, y: cursor + index * 11 + 3, width: width - 28, text: line, size: premiumTemplate.sideBodySize - 0.2, color: premiumTemplate.sidebarInk, weight: "bold" }));
        cursor += height + 7;
      }
      cursor += 8;
    }
    return cursor + 4;
  }
  for (const item of sectionData.items) {
    const lines = wrapText(item, width - 26, premiumTemplate.sideBodySize);
    const height = Math.max(26, lines.length * premiumTemplate.sideLineHeight + 12);
    elements.push({ kind: "rounded", x, y: cursor - 4, width, height, radius: premiumTemplate.cardRadius, color: "#ffffff", borderColor: premiumTemplate.cardBorder });
    elements.push({ kind: "circle", x: x + 12, y: cursor + 6, radius: 3.2, color: premiumTemplate.blue });
    lines.forEach((line, index) => {
      elements.push({ kind: "text", x: x + 24, y: cursor + index * premiumTemplate.sideLineHeight, width: width - 30, text: line, size: premiumTemplate.sideBodySize, color: premiumTemplate.sidebarInk });
    });
    cursor += height + 8;
  }
  return cursor + 8;
}

function buildCvLayoutFromModel(cvInput: CvModel, templateName?: string, activeSection?: string): CvLayout {
  const previousTemplate = premiumTemplate;
  premiumTemplate = resolveCvTemplateDesign(templateName);
  try {
    return buildCvLayoutFromModelWithDesign(cvInput, activeSection);
  } finally {
    premiumTemplate = previousTemplate;
  }
}

function buildCvLayoutFromModelWithDesign(cvInput: CvModel, activeSection?: string): CvLayout {
  const cv = cvModelToRenderModel(cvInput);
  const layout: CvLayout = { width: page.width, height: page.height, pages: [] };
  const first = addPage(layout);
  const sidebarX = 52;
  const sidebarW = premiumTemplate.sidebarWidth;
  const mainX = sidebarX + sidebarW + premiumTemplate.columnGap;
  const mainW = page.width - mainX - 58;
  const headerHeight = premiumTemplate.headerHeight;

  first.elements.push({ kind: "rect", x: 0, y: 0, width: page.width, height: headerHeight, color: premiumTemplate.navy });
  if (premiumTemplate.identity !== "ats") first.elements.push({ kind: "rect", x: 0, y: 0, width: sidebarW + 62, height: headerHeight, color: premiumTemplate.navyAlt });
  if (premiumTemplate.showHeroOrnaments) {
    first.elements.push({ kind: "circle", x: 642, y: 32, radius: 56, color: premiumTemplate.identity === "graduate" ? "#373a8a" : "#173c70" });
    first.elements.push({ kind: "circle", x: 704, y: 78, radius: 28, color: premiumTemplate.identity === "graduate" ? "#4f46e5" : "#255b9b" });
  }
  first.elements.push({ kind: "rect", x: 0, y: headerHeight - 8, width: page.width, height: premiumTemplate.identity === "ats" ? 4 : 8, color: premiumTemplate.blue });
  first.elements.push({ kind: "rounded", x: 38, y: headerHeight + 32, width: sidebarW + 34, height: page.height - headerHeight - 95, radius: premiumTemplate.identity === "executive" ? 8 : 18, color: premiumTemplate.sidebar, borderColor: premiumTemplate.cardBorder });
  if (isActiveCvSection(activeSection, "Professional Header")) first.elements.push({ kind: "rounded", x: 42, y: 32, width: 512, height: 136, radius: premiumTemplate.cardRadius + 6, color: premiumTemplate.identity === "ats" ? "#f8fafc" : premiumTemplate.navyAlt, borderColor: premiumTemplate.blue, className: "cv-active-section", sectionId: "cv-section-active" });
  first.elements.push({ kind: "text", x: 52, y: 42, width: 500, text: cv.name || "", size: premiumTemplate.nameSize, color: premiumTemplate.heroText, weight: "bold" });
  if (cv.targetRole) first.elements.push({ kind: "text", x: 54, y: 96, width: 480, text: cv.targetRole, size: premiumTemplate.roleSize, color: premiumTemplate.heroMuted, weight: "bold" });
  first.elements.push({ kind: "line", x: 54, y: 128, width: premiumTemplate.identity === "executive" ? 190 : 138, color: premiumTemplate.blue, thickness: premiumTemplate.identity === "executive" ? 2 : 4 });
  const heroSummary = section(cv, "Professional Summary")?.items[0];
  if (heroSummary) pushWrappedText(first.elements, heroSummary, 54, 148, 470, premiumTemplate.summarySize, premiumTemplate.heroMuted, premiumTemplate.summarySize + 3.1);

  let contactY = 54;
  cv.contact.forEach((item) => {
    first.elements.push({ kind: "rounded", x: 552, y: contactY - 6, width: 18, height: 18, radius: 6, color: premiumTemplate.blue });
    contactY = pushWrappedText(first.elements, item, 580, contactY, 156, 8.8, premiumTemplate.heroMuted, 12);
    contactY += 8;
  });

  let sideY = headerHeight + 68;
  const sideOverflow: CvSection[] = [];
  for (const side of sideSections(cv)) {
    const split = splitSideSectionToFit(side, sidebarW, 1038 - sideY);
    if (split.fit) sideY = drawSideSection(first.elements, split.fit, sidebarX, sideY, sidebarW, activeSection);
    if (split.overflow) sideOverflow.push(split.overflow);
  }

  let currentPage = first;
  let mainY = headerHeight + 50;
  for (const main of [...mainSections(cv), ...sideOverflow]) {
    const result = drawMainSection(layout, currentPage, mainY, cv, main, mainX, mainW, activeSection);
    currentPage = result.pageEntry;
    mainY = result.y;
  }

  layout.pages.forEach((pageEntry, index) => {
    pageEntry.elements.push({ kind: "text", x: 700, y: 1084, width: 40, text: String(index + 1), size: 8, color: "#98a2b3" });
  });

  return layout;
}

function buildCvLayout(content: string, templateName?: string, activeSection?: string): CvLayout {
  return buildCvLayoutFromModel(cvModelFromContent(content), templateName, activeSection);
}

function elementHtml(element: LayoutElement) {
  if (element.kind === "rect") return `<div class="cv-el" style="left:${element.x}px;top:${element.y}px;width:${element.width}px;height:${element.height}px;background:${element.color};"></div>`;
  if (element.kind === "rounded") {
    const id = element.sectionId ? ` id="${escapeHtml(element.sectionId)}"` : "";
    const className = `cv-el${element.className ? ` ${escapeHtml(element.className)}` : ""}`;
    return `<div${id} class="${className}" style="left:${element.x}px;top:${element.y}px;width:${element.width}px;height:${element.height}px;border-radius:${element.radius}px;background:${element.color};${element.borderColor ? `border:1px solid ${element.borderColor};` : ""}"></div>`;
  }
  if (element.kind === "line") return `<div class="cv-el" style="left:${element.x}px;top:${element.y}px;width:${element.orientation === "vertical" ? element.thickness ?? 1 : element.width}px;height:${element.orientation === "vertical" ? element.width : element.thickness ?? 1}px;background:${element.color};"></div>`;
  if (element.kind === "circle") return `<div class="cv-el" style="left:${element.x - element.radius}px;top:${element.y - element.radius}px;width:${element.radius * 2}px;height:${element.radius * 2}px;border-radius:999px;background:${element.color};"></div>`;
  const text = element.uppercase ? element.text.toUpperCase() : element.text;
  return `<div class="cv-el cv-text" style="left:${element.x}px;top:${element.y}px;width:${element.width}px;font-size:${element.size}px;color:${element.color};font-weight:${element.weight === "bold" ? 800 : 450};letter-spacing:${element.letterSpacing ?? 0}px;">${escapeHtml(text)}</div>`;
}

export function renderCvHtml(content: string, templateName?: string, activeSection?: string) {
  const layout = buildCvLayout(content, templateName, activeSection);
  return renderCvLayoutHtml(layout);
}

export function renderCvHtmlFromModel(cv: CvModel, templateName?: string, activeSection?: string) {
  return renderCvLayoutHtml(buildCvLayoutFromModel(cv, templateName, activeSection));
}

function renderCvLayoutHtml(layout: CvLayout) {
  return `
    <div class="cv-render-shell">
      ${layout.pages.map((layoutPage) => `<article class="cv-render-page">${layoutPage.elements.map(elementHtml).join("")}</article>`).join("")}
    </div>
    <style>
      .cv-render-shell{display:grid;gap:24px;justify-items:center;background:#e8edf5;padding:18px;border-radius:18px}
      .cv-render-page{position:relative;width:${layout.width}px;height:${layout.height}px;background:#fff;box-shadow:0 28px 90px rgba(15,23,42,.20);overflow:hidden;font-family:Inter,Arial,Helvetica,sans-serif;transform-origin:top center}
      .cv-el{position:absolute;box-sizing:border-box}
      .cv-text{line-height:1.25;white-space:normal}
      .cv-active-section{box-shadow:0 0 0 3px rgba(47,128,237,.28),0 18px 46px rgba(47,128,237,.18);animation:cvSectionPulse 1.15s ease-out 1}
      @keyframes cvSectionPulse{0%{transform:scale(.985);opacity:.74}55%{transform:scale(1.01);opacity:1}100%{transform:scale(1);opacity:1}}
      @media(max-width:920px){.cv-render-shell{padding:8px}.cv-render-page{width:${layout.width}px;height:${layout.height}px;transform:scale(min(1,calc((100vw - 48px)/${layout.width})));margin-bottom:calc(${layout.height}px * (min(1,calc((100vw - 48px)/${layout.width})) - 1));}}
      @media print{.cv-render-shell{padding:0;background:#fff}.cv-render-page{box-shadow:none;page-break-after:always}}
    </style>
  `;
}

export function renderCvPlainText(content: string) {
  const cv = cvModelToRenderModel(cvModelFromContent(content));
  return [
    cv.name,
    cv.targetRole,
    ...cv.contact,
    "",
    ...cv.sections.flatMap((section) => [section.title, ...section.items.map((item) => `- ${item}`), ""])
  ].filter(Boolean).join("\n").trim();
}

function coverLetterContactLines(data: CoverLetterData) {
  return [
    data.phone,
    data.email,
    data.linkedIn,
    [data.city, data.country].filter(Boolean).join(", ")
  ].filter(Boolean);
}

export function serializeCoverLetterData(data: CoverLetterData) {
  const cover = normalizeCoverLetterData(data);
  return [
    cover.fullName,
    ...coverLetterContactLines(cover),
    cover.date,
    "",
    cover.companyName,
    cover.hiringManager,
    cover.jobTitle,
    cover.companyAddress,
    "",
    cover.greeting,
    "",
    cover.openingParagraph,
    ...cover.bodyParagraphs,
    cover.closingParagraph,
    "",
    cover.signature || cover.fullName
  ].filter((line) => line !== undefined && line !== null).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function coverLetterParagraphs(data: CoverLetterData) {
  return [
    data.openingParagraph,
    ...data.bodyParagraphs,
    data.closingParagraph
  ].filter((line) => line.trim());
}

function buildCoverLetterLayoutFromData(input: CoverLetterData): CvLayout {
  const previousTemplate = premiumTemplate;
  const cover = normalizeCoverLetterData(input);
  premiumTemplate = resolveCvTemplateDesign(cover.designSystem);
  const coverDesign = resolveCoverLetterDesign(cover.designSystem);
  try {
    const layout: CvLayout = { width: page.width, height: page.height, pages: [] };
    const marginX = coverDesign.marginX;
    const contentW = page.width - marginX * 2;
    const bodyWidth = coverDesign.headerStyle === "executive" ? contentW - 6 : contentW;
    let currentPage = addPage(layout);
    let y = coverDesign.firstPageTop;

    const addContinuationPage = () => {
      currentPage = addPage(layout);
      currentPage.elements.push({ kind: "rect", x: 0, y: 0, width: page.width, height: 18, color: premiumTemplate.cream });
      currentPage.elements.push({ kind: "line", x: marginX, y: coverDesign.continuedTop - 24, width: contentW, orientation: "horizontal", color: premiumTemplate.line, thickness: 1 });
      if (cover.fullName) currentPage.elements.push({ kind: "text", x: marginX, y: coverDesign.continuedTop - 48, width: contentW, text: cover.fullName, size: 10, color: premiumTemplate.muted, weight: "bold" });
      y = coverDesign.continuedTop;
    };

    const ensure = (needed = 44) => {
      if (y + needed <= coverDesign.bottom) return;
      addContinuationPage();
    };

    const pushTextLines = (text: string, x: number, width: number, size: number, lineHeight: number, color = premiumTemplate.ink, weight?: TextElement["weight"]) => {
      const lines = wrapText(text, width, size);
      lines.forEach((line, index) => currentPage.elements.push({ kind: "text", x, y: y + index * lineHeight, width, text: line, size, color, weight }));
      y += lines.length * lineHeight;
      return lines.length;
    };

    const pushParagraph = (text: string, spacing = coverDesign.paragraphSpacing) => {
      const lines = wrapText(text, bodyWidth, coverDesign.bodySize);
      ensure(lines.length * coverDesign.lineHeight + spacing);
      pushTextLines(text, marginX, bodyWidth, coverDesign.bodySize, coverDesign.lineHeight);
      y += spacing;
    };

    const drawHeader = () => {
      const contacts = coverLetterContactLines(cover).join("  |  ");
      if (coverDesign.headerStyle === "minimal") {
        currentPage.elements.push({ kind: "line", x: marginX, y: 48, width: contentW, orientation: "horizontal", color: premiumTemplate.blue, thickness: coverDesign.accentWidth });
        currentPage.elements.push({ kind: "text", x: marginX, y, width: contentW, text: cover.fullName, size: coverDesign.nameSize, color: premiumTemplate.heroText, weight: "bold" });
        if (contacts) currentPage.elements.push({ kind: "text", x: marginX, y: y + 32, width: contentW, text: contacts, size: coverDesign.contactSize, color: premiumTemplate.muted });
        y += contacts ? coverDesign.headerHeight : coverDesign.headerHeight - 18;
        currentPage.elements.push({ kind: "line", x: marginX, y: y - 28, width: contentW, orientation: "horizontal", color: premiumTemplate.line, thickness: 1 });
        return;
      }

      if (coverDesign.headerStyle === "accented") {
        currentPage.elements.push({ kind: "rounded", x: marginX - 16, y: 46, width: contentW + 32, height: 88, radius: 18, color: premiumTemplate.sky, borderColor: premiumTemplate.line });
        currentPage.elements.push({ kind: "rect", x: marginX - 16, y: 46, width: coverDesign.accentWidth, height: 88, color: premiumTemplate.blue });
        currentPage.elements.push({ kind: "text", x: marginX + 10, y: 72, width: contentW - 20, text: cover.fullName, size: coverDesign.nameSize, color: premiumTemplate.navy, weight: "bold" });
        if (contacts) currentPage.elements.push({ kind: "text", x: marginX + 10, y: 108, width: contentW - 20, text: contacts, size: coverDesign.contactSize, color: premiumTemplate.muted });
        y = 162;
        return;
      }

      if (coverDesign.headerStyle === "executive") {
        currentPage.elements.push({ kind: "rect", x: 0, y: 0, width: page.width, height: coverDesign.headerHeight, color: premiumTemplate.navy });
        currentPage.elements.push({ kind: "rect", x: 0, y: coverDesign.headerHeight - 7, width: page.width, height: 7, color: premiumTemplate.amber });
        currentPage.elements.push({ kind: "line", x: marginX, y: 45, width: 74, orientation: "horizontal", color: premiumTemplate.amber, thickness: 2 });
        currentPage.elements.push({ kind: "text", x: marginX, y: 66, width: contentW, text: cover.fullName, size: coverDesign.nameSize, color: premiumTemplate.heroText, weight: "bold" });
        if (contacts) currentPage.elements.push({ kind: "text", x: marginX, y: 106, width: contentW, text: contacts, size: coverDesign.contactSize, color: premiumTemplate.heroMuted });
        y = 172;
        return;
      }

      if (coverDesign.headerStyle === "fresh") {
        currentPage.elements.push({ kind: "rounded", x: marginX - 10, y: 44, width: contentW + 20, height: 92, radius: 24, color: premiumTemplate.sky });
        currentPage.elements.push({ kind: "circle", x: page.width - marginX - 38, y: 78, radius: 24, color: premiumTemplate.blue });
        currentPage.elements.push({ kind: "text", x: marginX + 8, y: 70, width: contentW - 78, text: cover.fullName, size: coverDesign.nameSize, color: premiumTemplate.navy, weight: "bold" });
        if (contacts) currentPage.elements.push({ kind: "text", x: marginX + 8, y: 106, width: contentW - 78, text: contacts, size: coverDesign.contactSize, color: premiumTemplate.muted });
        y = 162;
        return;
      }

      currentPage.elements.push({ kind: "rect", x: 0, y: 0, width: page.width, height: 76, color: premiumTemplate.navy });
      currentPage.elements.push({ kind: "rect", x: 0, y: 76, width: page.width, height: coverDesign.accentWidth, color: premiumTemplate.blue });
      currentPage.elements.push({ kind: "text", x: marginX, y: 36, width: contentW, text: cover.fullName, size: coverDesign.nameSize, color: premiumTemplate.heroText, weight: "bold" });
      if (contacts) currentPage.elements.push({ kind: "text", x: marginX, y: 88, width: contentW, text: contacts, size: coverDesign.contactSize, color: premiumTemplate.muted });
      y = 142;
    };

    const pushMetaLine = (text: string, spacing = coverDesign.blockSpacing) => {
      const lines = wrapText(text, bodyWidth, coverDesign.metaSize);
      ensure(lines.length * (coverDesign.lineHeight - 1) + spacing);
      pushTextLines(text, marginX, bodyWidth, coverDesign.metaSize, coverDesign.lineHeight - 1, premiumTemplate.muted);
      y += spacing;
    };

    const pushRecipientBlock = (lines: string[]) => {
      if (!lines.length) return;
      const blockHeight = lines.length * 15 + coverDesign.blockSpacing * 2;
      ensure(blockHeight + 12);
      if (coverDesign.headerStyle === "accented" || coverDesign.headerStyle === "executive") {
        currentPage.elements.push({ kind: "rounded", x: marginX - 2, y: y - 9, width: bodyWidth + 4, height: blockHeight, radius: coverDesign.headerStyle === "executive" ? 4 : 12, color: premiumTemplate.cream, borderColor: premiumTemplate.line });
        currentPage.elements.push({ kind: "rect", x: marginX - 2, y: y - 9, width: coverDesign.accentWidth, height: blockHeight, color: premiumTemplate.blue });
        const savedY = y;
        y += coverDesign.blockSpacing;
        lines.forEach((line) => {
          currentPage.elements.push({ kind: "text", x: marginX + coverDesign.recipientInset, y, width: bodyWidth - coverDesign.recipientInset, text: line, size: coverDesign.metaSize, color: premiumTemplate.ink });
          y += 15;
        });
        y = savedY + blockHeight + 16;
        return;
      }
      lines.forEach((line) => pushMetaLine(line, 3));
      y += 14;
    };

    drawHeader();
    if (cover.date) pushMetaLine(cover.date, 13);
    pushRecipientBlock([cover.hiringManager, cover.companyName, cover.companyAddress].filter(Boolean));
    if (cover.greeting) pushParagraph(cover.greeting, coverDesign.paragraphSpacing - 2);
    coverLetterParagraphs(cover).forEach((paragraph) => pushParagraph(paragraph));
    const signature = cover.signature || cover.fullName;
    if (signature) {
      ensure(coverDesign.signatureSpacing + 42);
      y += coverDesign.signatureSpacing - 20;
      currentPage.elements.push({ kind: "text", x: marginX, y, width: bodyWidth, text: "Kind regards,", size: coverDesign.bodySize, color: premiumTemplate.ink });
      y += 30;
      currentPage.elements.push({ kind: "text", x: marginX, y, width: bodyWidth, text: signature, size: coverDesign.bodySize + 1.5, color: premiumTemplate.navy, weight: "bold" });
    }

    layout.pages.forEach((pageEntry, index) => {
      pageEntry.elements.push({ kind: "line", x: marginX, y: 1071, width: contentW, orientation: "horizontal", color: premiumTemplate.line, thickness: 0.8 });
      pageEntry.elements.push({ kind: "text", x: 700, y: 1084, width: 40, text: String(index + 1), size: 8, color: "#98a2b3" });
    });
    return layout;
  } finally {
    premiumTemplate = previousTemplate;
  }
}

export function renderCoverLetterHtmlFromData(data: CoverLetterData) {
  return renderCvLayoutHtml(buildCoverLetterLayoutFromData(data));
}

export function htmlDocument(title: string, content: string, templateName?: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body>${renderCvHtml(content, templateName)}</body></html>`;
}

function pdfColor(hex: string, stroke = false) {
  const [r, g, b] = hexToRgb(hex);
  return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} ${stroke ? "RG" : "rg"}`;
}

function pdfText(element: TextElement, fontId: "F1" | "F2") {
  const text = element.uppercase ? element.text.toUpperCase() : element.text;
  const y = page.height - element.y - element.size;
  return `${pdfColor(element.color)} BT /${fontId} ${element.size} Tf ${element.x} ${y} Td (${escapePdfText(text)}) Tj ET`;
}

function roundedRectPath(x: number, topY: number, width: number, height: number, radius: number) {
  const y = page.height - topY - height;
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  if (!r) return `${x} ${y} ${width} ${height} re`;
  const c = r * 0.5522847498;
  const right = x + width;
  const top = y + height;
  return [
    `${x + r} ${y} m`,
    `${right - r} ${y} l`,
    `${right - r + c} ${y} ${right} ${y + r - c} ${right} ${y + r} c`,
    `${right} ${top - r} l`,
    `${right} ${top - r + c} ${right - r + c} ${top} ${right - r} ${top} c`,
    `${x + r} ${top} l`,
    `${x + r - c} ${top} ${x} ${top - r + c} ${x} ${top - r} c`,
    `${x} ${y + r} l`,
    `${x} ${y + r - c} ${x + r - c} ${y} ${x + r} ${y} c`,
    "h"
  ].join(" ");
}

function circlePath(x: number, y: number, radius: number) {
  const pdfY = page.height - y;
  const c = radius * 0.5522847498;
  return [
    `${x + radius} ${pdfY} m`,
    `${x + radius} ${pdfY + c} ${x + c} ${pdfY + radius} ${x} ${pdfY + radius} c`,
    `${x - c} ${pdfY + radius} ${x - radius} ${pdfY + c} ${x - radius} ${pdfY} c`,
    `${x - radius} ${pdfY - c} ${x - c} ${pdfY - radius} ${x} ${pdfY - radius} c`,
    `${x + c} ${pdfY - radius} ${x + radius} ${pdfY - c} ${x + radius} ${pdfY} c`,
    "h"
  ].join(" ");
}

function pdfElement(element: LayoutElement) {
  if (element.kind === "rect") return `${pdfColor(element.color)} ${element.x} ${page.height - element.y - element.height} ${element.width} ${element.height} re f`;
  if (element.kind === "rounded") {
    const path = roundedRectPath(element.x, element.y, element.width, element.height, element.radius);
    const fill = `${pdfColor(element.color)} ${path} f`;
    const stroke = element.borderColor ? `\n${pdfColor(element.borderColor, true)} 1 w ${path} S` : "";
    return fill + stroke;
  }
  if (element.kind === "line") {
    const endX = element.orientation === "vertical" ? element.x : element.x + element.width;
    const endY = element.orientation === "vertical" ? page.height - element.y - element.width : page.height - element.y;
    return `${pdfColor(element.color, true)} ${element.thickness ?? 1} w ${element.x} ${page.height - element.y} m ${endX} ${endY} l S`;
  }
  if (element.kind === "circle") return `${pdfColor(element.color)} ${circlePath(element.x, element.y, element.radius)} f`;
  return pdfText(element, element.weight === "bold" ? "F2" : "F1");
}

export function simplePdfDocument(title: string, content: string, templateName?: string, forceCvLayout = false) {
  const parsed = parseCvContent(content);
  if (!forceCvLayout && !cvModelToRenderModel(parsed).sections.length) return simpleTextPdfDocument(title, content);
  return pdfFromLayout(buildCvLayoutFromModel(parsed, templateName));
}

export function simplePdfDocumentFromModel(title: string, cv: CvModel, templateName?: string) {
  return pdfFromLayout(buildCvLayoutFromModel(cv, templateName));
}

export function simpleCoverLetterPdfDocument(data: CoverLetterData) {
  return pdfFromLayout(buildCoverLetterLayoutFromData(data));
}

function pdfFromLayout(layout: CvLayout) {
  const objects: string[] = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "3 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj"
  ];
  const pageIds: number[] = [];
  let nextId = 5;

  for (const layoutPage of layout.pages) {
    const pageId = nextId++;
    const contentId = nextId++;
    pageIds.push(pageId);
    const stream = layoutPage.elements.map(pdfElement).join("\n");
    objects.push(`${pageId} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${layout.width} ${layout.height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >> endobj`);
    objects.push(`${contentId} 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`);
  }

  objects.splice(1, 0, `2 0 obj << /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >> endobj`);
  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(body.length);
    body += `${object}\n`;
  }
  const xrefOffset = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return body;
}

function simpleTextPdfDocument(title: string, content: string) {
  const lines = [title, "", ...content.split(/\r?\n/)]
    .flatMap((line) => wrapPdfLine(line, 92))
    .slice(0, 62);
  const stream = lines
    .map((line, index) => `${pdfColor(index === 0 ? premiumTemplate.navy : premiumTemplate.ink)} BT /F1 ${index === 0 ? 16 : 9} Tf 48 ${760 - index * 12} Td (${escapePdfText(line)}) Tj ET`)
    .join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj`,
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(body.length);
    body += `${object}\n`;
  }
  const xrefOffset = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return body;
}

function wrapPdfLine(value: string, max: number) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = `${current} ${word}`.trim();
    if (next.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function crc32(bytes: Uint8Array) {
  let crc = -1;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}

function u16(value: number) {
  return [value & 255, (value >>> 8) & 255];
}

function u32(value: number) {
  return [value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255];
}

function encode(value: string) {
  return new TextEncoder().encode(value);
}

export function createDocxDocument(title: string, content: string, templateName?: string) {
  const cv = cvModelToRenderModel(cvModelFromContent(content));
  const xmlEscape = (value: string) => escapeHtml(value).replace(/'/g, "&apos;");
  const paragraph = (text: string, bold = false, color = "182235", size = 22, spacing = 120) =>
    `<w:p><w:pPr><w:spacing w:after="${spacing}"/></w:pPr><w:r><w:rPr>${bold ? "<w:b/>" : ""}<w:color w:val="${color}"/><w:sz w:val="${size}"/></w:rPr><w:t>${xmlEscape(text)}</w:t></w:r></w:p>`;
  const bullet = (text: string) =>
    `<w:p><w:pPr><w:spacing w:after="90"/><w:ind w:left="360" w:hanging="180"/></w:pPr><w:r><w:rPr><w:color w:val="182235"/><w:sz w:val="20"/></w:rPr><w:t>- ${xmlEscape(text)}</w:t></w:r></w:p>`;
  const body = [
    cv.name ? paragraph(cv.name, true, "0D2342", 42, 70) : "",
    cv.targetRole ? paragraph(cv.targetRole, true, "2F80ED", 24, 160) : "",
    ...cv.contact.map((line) => paragraph(line, false, "475467", 18, 70)),
    ...cv.sections.flatMap((section) => [paragraph(section.title.toUpperCase(), true, "2F80ED", 22, 100), ...section.items.map((item) => bullet(item))])
  ].join("");
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="850" w:right="850" w:bottom="850" w:left="850"/></w:sectPr></w:body></w:document>`;
  const files = [
    ["[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`],
    ["_rels/.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`],
    ["word/document.xml", documentXml]
  ] as const;
  const chunks: number[] = [];
  const central: number[] = [];
  let offset = 0;
  const push = (target: number[], values: number[] | Uint8Array) => target.push(...Array.from(values));

  for (const [name, text] of files) {
    const nameBytes = encode(name);
    const data = encode(text);
    const crc = crc32(data);
    const localOffset = offset;
    const local: number[] = [];
    push(local, u32(0x04034b50)); push(local, u16(20)); push(local, u16(0)); push(local, u16(0)); push(local, u16(0)); push(local, u16(0)); push(local, u32(crc)); push(local, u32(data.length)); push(local, u32(data.length)); push(local, u16(nameBytes.length)); push(local, u16(0)); push(local, nameBytes); push(local, data);
    chunks.push(...local);
    offset += local.length;
    push(central, u32(0x02014b50)); push(central, u16(20)); push(central, u16(20)); push(central, u16(0)); push(central, u16(0)); push(central, u16(0)); push(central, u16(0)); push(central, u32(crc)); push(central, u32(data.length)); push(central, u32(data.length)); push(central, u16(nameBytes.length)); push(central, u16(0)); push(central, u16(0)); push(central, u16(0)); push(central, u16(0)); push(central, u32(0)); push(central, u32(localOffset)); push(central, nameBytes);
  }

  const centralOffset = chunks.length;
  chunks.push(...central);
  push(chunks, u32(0x06054b50)); push(chunks, u16(0)); push(chunks, u16(0)); push(chunks, u16(files.length)); push(chunks, u16(files.length)); push(chunks, u32(central.length)); push(chunks, u32(centralOffset)); push(chunks, u16(0));
  return new Uint8Array(chunks);
}

export function downloadBlob(filename: string, type: string, content: BlobPart) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function pathzyFilename(kind: string, title: string, extension: "pdf" | "docx") {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "_");
  return `PATHZY_${kind}_${slugifyDocumentName(title)}_${stamp}.${extension}`;
}

export function coverLetterPdfFilename(data: CoverLetterData) {
  const cover = normalizeCoverLetterDataForExport(data);
  const company = slugifyDocumentName(cover.companyName || "company").replace(/-/g, "_");
  const jobTitle = slugifyDocumentName(cover.jobTitle || "jobtitle").replace(/-/g, "_");
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `PATHZY_Cover_Letter_${company}_${jobTitle}_${stamp}.pdf`;
}

