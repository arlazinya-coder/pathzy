import type { ProfessionalPhotoTemplateCapability } from "@/lib/professional-identity/professional-photo";

export type PremiumDocumentTemplate = string;

export type AtsTemplateClassification = "ATS HIGH" | "ATS BALANCED" | "VISUAL / RECRUITER-FIRST";

export type DocumentTemplatePalette = {
  id: string;
  name: string;
  description: string;
  paper: string;
  surface: string;
  sidebar: string;
  accent: string;
  ink: string;
  muted: string;
  line: string;
  hero: string;
  heroMuted: string;
};

export type DocumentTemplateLayout =
  | "signature"
  | "single"
  | "sidebar"
  | "consulting"
  | "creative"
  | "technical"
  | "executive"
  | "enterprise"
  | "healthcare"
  | "graduate"
  | "international";

export type DocumentTemplateMetadata = {
  name: PremiumDocumentTemplate;
  designKey: string;
  family: string;
  description: string;
  bestFor: string;
  atsClassification: AtsTemplateClassification;
  atsCharacteristic: string;
  recruiterCharacteristic: string;
  thumbnail: {
    background: string;
    accent: string;
    layout: DocumentTemplateLayout;
  };
  palettes: [DocumentTemplatePalette, DocumentTemplatePalette, DocumentTemplatePalette, DocumentTemplatePalette];
  photoCapability: ProfessionalPhotoTemplateCapability;
};

const noPhoto: ProfessionalPhotoTemplateCapability = { photoMode: "none", supportedAspects: [], fallbackLayout: "text-only-header" };
const optionalPhoto: ProfessionalPhotoTemplateCapability = { photoMode: "optional", supportedAspects: ["portrait", "square"], fallbackLayout: "balanced-header" };
const portraitPhoto: ProfessionalPhotoTemplateCapability = { photoMode: "optional", supportedAspects: ["portrait", "circle-safe"], fallbackLayout: "balanced-header" };
const creativePhoto: ProfessionalPhotoTemplateCapability = { photoMode: "recommended", supportedAspects: ["portrait", "square", "circle-safe"], fallbackLayout: "balanced-header" };

export const MAX_TEMPLATE_VARIANTS_PER_DESIGN = 1;

const familyPaletteDirections: Record<string, Array<Omit<DocumentTemplatePalette, "id">>> = {
  Executive: [
    { name: "Midnight Brass", description: "Deep executive authority with ivory paper and muted brass detail.", paper: "#fffdfa", surface: "#fbf6ed", sidebar: "#f2eadc", accent: "#b0893f", ink: "#191714", muted: "#625b51", line: "#dfd1bb", hero: "#fffdfa", heroMuted: "#f2e6d2" },
    { name: "Oxblood Charcoal", description: "Charcoal structure with restrained oxblood emphasis.", paper: "#fffdf8", surface: "#f6f1ea", sidebar: "#eee5dc", accent: "#7f1d1d", ink: "#171717", muted: "#645b57", line: "#ded2c9", hero: "#fffaf0", heroMuted: "#edd9cf" },
    { name: "Graphite Champagne", description: "Graphite hierarchy with warm champagne rules.", paper: "#ffffff", surface: "#f8f5ee", sidebar: "#efe9dc", accent: "#a68a5b", ink: "#18181b", muted: "#5f5b53", line: "#d8ccba", hero: "#fffdfa", heroMuted: "#efe5d1" },
    { name: "Forest Copper", description: "Deep forest structure with copper leadership detail.", paper: "#fffdf7", surface: "#f5f2e8", sidebar: "#e9e2d2", accent: "#8a4b23", ink: "#151713", muted: "#5d6057", line: "#d8cbb5", hero: "#fffaf1", heroMuted: "#eadcc5" }
  ],
  Technical: [
    { name: "Ink Teal", description: "Precise technical contrast with a controlled teal signal.", paper: "#ffffff", surface: "#f7faf9", sidebar: "#eef7f5", accent: "#0f766e", ink: "#111827", muted: "#4b5563", line: "#cfe3df", hero: "#f8fffd", heroMuted: "#d7f0ec" },
    { name: "Graphite Circuit", description: "Graphite text with quiet system-blue grey structure.", paper: "#ffffff", surface: "#f8fafc", sidebar: "#eef2f7", accent: "#334155", ink: "#111827", muted: "#475569", line: "#d7dee8", hero: "#f8fafc", heroMuted: "#dbe3ee" },
    { name: "Forest Console", description: "Dark forest accent with readable warm white paper.", paper: "#fffefa", surface: "#f4f7f2", sidebar: "#ebf2e8", accent: "#166534", ink: "#111827", muted: "#4b5a4b", line: "#d5e3d1", hero: "#fafff7", heroMuted: "#dbead5" },
    { name: "Oxide Grid", description: "Warm technical palette with oxide accent and precise neutral lines.", paper: "#fffdfa", surface: "#f7f4ef", sidebar: "#eee7de", accent: "#9a3412", ink: "#111827", muted: "#57534e", line: "#ded4c8", hero: "#fff9f1", heroMuted: "#eadccc" }
  ],
  Creative: [
    { name: "Editorial Copper", description: "Warm editorial palette with copper accents and premium paper.", paper: "#fffaf4", surface: "#fff3e8", sidebar: "#f7e4d6", accent: "#9a3412", ink: "#241c18", muted: "#6b5e55", line: "#ebd1bf", hero: "#fff8f0", heroMuted: "#f4dccb" },
    { name: "Plum Studio", description: "Muted plum for distinctive creative profiles without novelty colour.", paper: "#fffdfa", surface: "#f7f1f6", sidebar: "#efe3ee", accent: "#6b214f", ink: "#201923", muted: "#675c67", line: "#dfccd9", hero: "#fff6fb", heroMuted: "#ead5e4" },
    { name: "Charcoal Vermilion", description: "Strong charcoal with restrained red-orange editorial energy.", paper: "#ffffff", surface: "#fff7f2", sidebar: "#f4e6dd", accent: "#b23a24", ink: "#1c1917", muted: "#625750", line: "#e1cfc4", hero: "#fffaf6", heroMuted: "#edd8ce" },
    { name: "Ink Gallery", description: "Gallery-ready ink and parchment system with controlled burgundy detail.", paper: "#fffdf8", surface: "#f4eee5", sidebar: "#eadfcc", accent: "#7f1d1d", ink: "#1f1b18", muted: "#665d55", line: "#dccbb7", hero: "#fff8ef", heroMuted: "#ead8c2" }
  ],
  Graduate: [
    { name: "Fresh Burgundy", description: "Approachable early-career structure with confident PATHZY burgundy.", paper: "#ffffff", surface: "#fffafa", sidebar: "#f8eded", accent: "#7f1d1d", ink: "#111827", muted: "#5f6368", line: "#ead1d1", hero: "#fffafa", heroMuted: "#edd6d6" },
    { name: "Clear Slate", description: "Clean graduate readability with calm slate accents.", paper: "#ffffff", surface: "#f8fafc", sidebar: "#eef2f7", accent: "#475569", ink: "#111827", muted: "#4b5563", line: "#d8dee8", hero: "#f8fafc", heroMuted: "#dce3ee" },
    { name: "Warm Scholar", description: "Warm ivory tone that keeps limited experience credible and polished.", paper: "#fffdf8", surface: "#faf4ea", sidebar: "#f1e7d8", accent: "#a16207", ink: "#171717", muted: "#655d52", line: "#dfd0bc", hero: "#fff8ef", heroMuted: "#ecd9c1" },
    { name: "Ink Starter", description: "Confident entry-level contrast with soft paper and readable ink.", paper: "#fffdfa", surface: "#f5f2ed", sidebar: "#eae3d8", accent: "#1f2937", ink: "#111827", muted: "#5d6269", line: "#d8d0c5", hero: "#fffaf2", heroMuted: "#e9ddcc" }
  ],
  Formal: [
    { name: "Institutional Navy", description: "Formal ink-navy palette for conservative professional review.", paper: "#ffffff", surface: "#f8fafc", sidebar: "#f1f5f9", accent: "#1f2937", ink: "#111827", muted: "#4b5563", line: "#d9dee8", hero: "#f8fafc", heroMuted: "#dce2ec" },
    { name: "Stone Burgundy", description: "Warm institutional surface with restrained burgundy hierarchy.", paper: "#fffdfa", surface: "#f7f3ee", sidebar: "#eee7df", accent: "#7f1d1d", ink: "#171717", muted: "#5f5a54", line: "#ded3c8", hero: "#fffaf4", heroMuted: "#eadbd0" },
    { name: "Government Slate", description: "Public-sector conservative contrast with dependable slate rules.", paper: "#ffffff", surface: "#f7f8f6", sidebar: "#edf0eb", accent: "#475569", ink: "#111827", muted: "#525b64", line: "#d7ddd7", hero: "#f8fafc", heroMuted: "#dce3e6" },
    { name: "Ivory Seal", description: "Institutional ivory with seal-like burgundy authority and gentle rules.", paper: "#fffdf7", surface: "#f5f0e7", sidebar: "#ebe2d4", accent: "#8f2525", ink: "#171717", muted: "#625b53", line: "#dacdbb", hero: "#fff7ee", heroMuted: "#ead8c0" }
  ],
  Operational: [
    { name: "Practical Charcoal", description: "Direct, durable palette for operational and service roles.", paper: "#ffffff", surface: "#f8f8f6", sidebar: "#eeeeea", accent: "#374151", ink: "#111827", muted: "#4b5563", line: "#d9d9d4", hero: "#f8f8f6", heroMuted: "#deded8" },
    { name: "Worksite Forest", description: "Reliable forest accent with strong printed readability.", paper: "#ffffff", surface: "#f6faf5", sidebar: "#eaf3e7", accent: "#166534", ink: "#111827", muted: "#4b5b4d", line: "#d3e2cf", hero: "#f9fff7", heroMuted: "#dcebd7" },
    { name: "Service Burgundy", description: "Confident service-role palette with controlled burgundy emphasis.", paper: "#fffefa", surface: "#fff5f2", sidebar: "#f4e5df", accent: "#8f2525", ink: "#171717", muted: "#605856", line: "#e1ccc6", hero: "#fff8f5", heroMuted: "#ead5cf" },
    { name: "Industrial Bronze", description: "Grounded operational palette with bronze accent and practical contrast.", paper: "#fffdf8", surface: "#f5f1e9", sidebar: "#ebe3d6", accent: "#92400e", ink: "#171717", muted: "#5f5b52", line: "#d9ccb9", hero: "#fff8ef", heroMuted: "#ead8c0" }
  ]
};

function paletteFamilyKey(family: string, layout: DocumentTemplateLayout) {
  if (/executive|leadership|finance/i.test(family) || layout === "executive") return "Executive";
  if (/technical|engineering|data|science|cyber/i.test(family) || layout === "technical") return "Technical";
  if (/creative|marketing|portfolio|editorial/i.test(family) || layout === "creative") return "Creative";
  if (/graduate|emerging|internship|career change|skills/i.test(family) || layout === "graduate") return "Graduate";
  if (/public|academic|legal|health|international|government/i.test(family) || layout === "international" || layout === "healthcare") return "Formal";
  if (/retail|service|trade|facilities|operations|hospitality|logistics|security/i.test(family)) return "Operational";
  return "Formal";
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function curateTemplatePalettes(name: string, family: string, background: string, accent: string, layout: DocumentTemplateLayout): [DocumentTemplatePalette, DocumentTemplatePalette, DocumentTemplatePalette, DocumentTemplatePalette] {
  const direction = familyPaletteDirections[paletteFamilyKey(family, layout)] ?? familyPaletteDirections.Formal;
  return direction.map((palette, index) => ({
    ...palette,
    id: `${slug(name)}-${slug(palette.name)}`,
    accent: index === 0 ? accent : palette.accent,
    paper: index === 0 ? background : palette.paper,
    surface: index === 0 ? background : palette.surface,
    sidebar: index === 0 ? background : palette.sidebar
  })) as [DocumentTemplatePalette, DocumentTemplatePalette, DocumentTemplatePalette, DocumentTemplatePalette];
}

function template(
  name: PremiumDocumentTemplate,
  family: string,
  description: string,
  bestFor: string,
  atsClassification: AtsTemplateClassification,
  atsCharacteristic: string,
  recruiterCharacteristic: string,
  background: string,
  accent: string,
  layout: DocumentTemplateLayout,
  photoCapability: ProfessionalPhotoTemplateCapability = optionalPhoto,
  designKey = name
): DocumentTemplateMetadata {
  return {
    name,
    designKey,
    family,
    description,
    bestFor,
    atsClassification,
    atsCharacteristic,
    recruiterCharacteristic,
    thumbnail: { background, accent, layout },
    palettes: curateTemplatePalettes(name, family, background, accent, layout),
    photoCapability
  };
}

const archivedDocumentTemplateGallery: DocumentTemplateMetadata[] = [
  template("PATHZY Signature Professional", "Modern Professional", "Reference PATHZY CV architecture with structured experience, disciplined A4 flow, and recruiter-ready hierarchy.", "General professional applications, imported CV repair, recruiter review", "ATS BALANCED", "Structured ATS", "Signature Professional", "#fffdfa", "#1f2937", "signature", noPhoto),
  template("Executive Black", "Executive", "High-contrast executive layout with refined spacing and boardroom-level hierarchy.", "Senior professionals, managers, founders, consultants", "ATS BALANCED", "Executive Layout", "Leadership Focused", "#111111", "#c9a35b", "executive", portraitPhoto),
  template("Modern ATS", "ATS Essential", "Clean one-column structure optimized for ATS parsing and recruiter scanning.", "Online applications, corporate roles, high-volume hiring", "ATS HIGH", "Single-Column ATS", "Fast Scanner Friendly", "#ffffff", "#1f2937", "single", noPhoto),
  template("Google Style", "Modern Professional", "Minimal, product-minded layout with crisp structure and practical hierarchy.", "Tech, product, operations, data, modern startups", "ATS BALANCED", "ATS Friendly", "Product Focused", "#f8fafc", "#1d4ed8", "sidebar", noPhoto),
  template("Microsoft Professional", "Corporate", "Polished enterprise layout with calm structure and strong document discipline.", "Enterprise, administration, finance, IT support", "ATS BALANCED", "ATS Optimized", "Enterprise Ready", "#f8fafc", "#1e3a8a", "enterprise", optionalPhoto),
  template("Deloitte Consulting", "Consulting", "Consulting-style layout with sharp sections, evidence-first bullets, and compact density.", "Consulting, strategy, business analysis, graduate programs", "ATS BALANCED", "ATS Friendly", "Consulting Style", "#f8fff8", "#4d7c0f", "consulting", noPhoto),
  template("Creative Premium", "Creative Professional", "Premium creative layout with expressive sidebar rhythm while preserving readable text.", "Design, marketing, content, portfolio-led careers", "VISUAL / RECRUITER-FIRST", "Portfolio Friendly", "Creative Impact", "#fff7ed", "#b45309", "creative", creativePhoto),
  template("Healthcare Professional", "Healthcare", "Trustworthy clinical layout with calm accents and credential-forward structure.", "Healthcare, care work, public service, education support", "ATS BALANCED", "ATS Friendly", "Credential Focused", "#f4faf7", "#0f766e", "healthcare", optionalPhoto),
  template("Graduate Elite", "Graduate", "Fresh early-career layout that elevates projects, education, skills, and potential.", "Students, graduates, internships, first jobs", "ATS BALANCED", "Graduate Friendly", "Potential Focused", "#f6f7ff", "#7f1d1d", "graduate", optionalPhoto),
  template("Engineering", "Engineering", "Technical layout with skills architecture, project proof, and structured experience blocks.", "Engineering, software, data, technical support", "ATS BALANCED", "Technical ATS", "Project Focused", "#f8fafc", "#0f766e", "technical", noPhoto),
  template("International Standard", "International", "Globally familiar CV layout with conservative spacing and international readability.", "International applications, NGOs, remote roles, relocation", "ATS HIGH", "International Format", "Conservative Layout", "#ffffff", "#334155", "international", portraitPhoto),

  template("Executive Gold", "Executive", "Premium leadership CV with a strong title band, restrained gold accents, and compact proof blocks.", "Directors, executives, senior managers", "ATS BALANCED", "Executive Layout", "Boardroom Presence", "#fffaf2", "#b0893f", "executive", portraitPhoto),
  template("Board Director", "Executive", "Governance-focused structure with high-level summary, mandates, leadership scope, and credentials.", "Board roles, trustees, advisory appointments", "ATS BALANCED", "Board-Level Structure", "Governance Focused", "#fbf7ef", "#7c5c20", "executive", portraitPhoto),
  template("C-Suite Compact", "Executive", "Dense senior profile with compact achievement hierarchy and space-efficient executive storytelling.", "C-suite, operations leaders, transformation roles", "ATS BALANCED", "Compact Executive", "Achievement Led", "#fffdfa", "#8a5a1f", "consulting", noPhoto),
  template("Leadership Ledger", "Leadership", "Leadership-first composition with scope, outcomes, and operating rhythm clearly separated.", "Team leaders, department heads, programme managers", "ATS BALANCED", "Leadership Balanced", "Scope Focused", "#f8fafc", "#7f1d1d", "enterprise", optionalPhoto),
  template("Founder Narrative", "Executive", "Founder-friendly layout that balances vision, proof, operating experience, and portfolio evidence.", "Founders, entrepreneurs, fractional leaders", "VISUAL / RECRUITER-FIRST", "Narrative Balanced", "Founder Story", "#fff7ed", "#9a3412", "creative", creativePhoto),

  template("ATS Essential", "ATS Essential", "Strict parser-friendly single-column CV with plain hierarchy and no decorative sidebar.", "Job boards, enterprise ATS, government portals", "ATS HIGH", "Single-Column ATS", "Parser Safe", "#ffffff", "#111827", "single", noPhoto),
  template("ATS Compact", "ATS Essential", "Space-efficient ATS CV for candidates with longer histories and many role entries.", "Long career history, dense applications, experienced professionals", "ATS HIGH", "Dense ATS", "Fast Scan", "#ffffff", "#374151", "single", noPhoto),
  template("ATS Technical", "ATS Essential", "ATS-safe technical CV that keeps tools, stack, projects, and experience machine-readable.", "Software, IT, data, cybersecurity", "ATS HIGH", "Technical ATS", "Stack Readable", "#ffffff", "#0f766e", "single", noPhoto),
  template("ATS Legal", "ATS Essential", "Conservative ATS CV with formal spacing and credentials-friendly section flow.", "Legal, compliance, administration, public sector", "ATS HIGH", "Formal ATS", "Compliance Friendly", "#ffffff", "#3f3f46", "single", noPhoto),
  template("ATS Longform", "ATS Essential", "Longform ATS layout with reliable pagination for two to three page edge cases.", "Senior candidates, academic-adjacent profiles, long histories", "ATS HIGH", "Longform ATS", "Pagination Friendly", "#ffffff", "#27272a", "single", noPhoto),

  template("Corporate Slate", "Corporate", "Quiet corporate layout with slate accents, disciplined cards, and a practical hierarchy.", "Operations, administration, business support", "ATS BALANCED", "Corporate Balanced", "Business Ready", "#f8fafc", "#475569", "enterprise", optionalPhoto),
  template("Corporate Redline", "Corporate", "PATHZY-red corporate design with confident section rules and concise evidence rhythm.", "Private sector, sales, management, client-facing roles", "ATS BALANCED", "Corporate ATS", "Recruiter Focused", "#fffafa", "#b4232a", "enterprise", optionalPhoto),
  template("Corporate Classic", "Corporate", "Traditional business CV with formal header treatment and steady spacing.", "Finance, HR, operations, general management", "ATS BALANCED", "Classic Corporate", "Traditional Readability", "#ffffff", "#1f2937", "enterprise", optionalPhoto),
  template("Enterprise Grid", "Corporate", "Information-grid layout that separates evidence, credentials, and skills for enterprise review.", "Enterprise IT, business analysts, programme support", "ATS BALANCED", "Grid Balanced", "Enterprise Scanner", "#f9fafb", "#334155", "enterprise", optionalPhoto),
  template("Public Sector Professional", "Corporate", "Conservative public-sector layout with clear requirements, credentials, and experience flow.", "Government, NGOs, education administration", "ATS BALANCED", "Public-Sector Friendly", "Credential Readable", "#ffffff", "#475569", "international", optionalPhoto),

  template("Modern Professional", "Modern Professional", "Balanced modern CV with generous whitespace and achievement-first section rhythm.", "General professional roles, modern employers", "ATS BALANCED", "Modern ATS", "Achievement Focused", "#ffffff", "#7f1d1d", "sidebar", optionalPhoto),
  template("Modern Compact", "Modern Professional", "Compact modern layout for candidates needing density without visual clutter.", "Experienced professionals, two-page CVs", "ATS BALANCED", "Compact Modern", "Dense But Readable", "#f9fafb", "#374151", "enterprise", noPhoto),
  template("Modern Warm", "Modern Professional", "Warm neutral modern design with softer spacing and human-readable hierarchy.", "People roles, support roles, customer-facing careers", "ATS BALANCED", "Modern Balanced", "Approachable Tone", "#fffaf4", "#a16207", "sidebar", optionalPhoto),
  template("Modern Portfolio", "Modern Professional", "Portfolio-aware layout that brings projects and links forward without sacrificing structure.", "Product, design, marketing, content, engineering", "VISUAL / RECRUITER-FIRST", "Portfolio Balanced", "Project Proof", "#fff7ed", "#9a3412", "creative", creativePhoto),
  template("Product Leadership", "Leadership", "Product and delivery layout with achievement blocks, projects, and stakeholder evidence prioritized.", "Product managers, delivery leads, tech managers", "ATS BALANCED", "Product Balanced", "Outcome Focused", "#f8fafc", "#7f1d1d", "consulting", noPhoto),

  template("Minimal Ivory", "Minimal", "Elegant minimal CV with warm paper, quiet rules, and restrained typographic hierarchy.", "Professional applications needing subtle polish", "ATS BALANCED", "Minimal ATS", "Quiet Premium", "#fffdf8", "#7f1d1d", "single", noPhoto),
  template("Minimal Mono", "Minimal", "Monoline-inspired minimal structure with disciplined spacing and compact headings.", "Technical, operations, finance, legal", "ATS HIGH", "Minimal Single Column", "No-Nonsense Scan", "#ffffff", "#27272a", "single", noPhoto),
  template("Minimal Dense", "Minimal", "Highly space-efficient minimal layout for profiles with many roles or credentials.", "Long histories, consulting, finance, engineering", "ATS HIGH", "Dense Single Column", "Space Efficient", "#ffffff", "#3f3f46", "single", noPhoto),
  template("Minimal Graduate", "Graduate", "Simple early-career layout with education, projects, and transferable skills made prominent.", "Graduates, internships, entry-level applications", "ATS HIGH", "Graduate ATS", "Early-Career Clear", "#ffffff", "#7f1d1d", "single", noPhoto),
  template("Minimal Legal", "Minimal", "Formal minimal layout with conservative spacing for compliance-heavy applications.", "Legal, compliance, risk, public administration", "ATS HIGH", "Formal Single Column", "Conservative Review", "#ffffff", "#1f2937", "international", noPhoto),

  template("Editorial Serif", "Editorial", "Editorial composition with an elegant sidebar and strong narrative rhythm.", "Communications, policy, consulting, senior professionals", "VISUAL / RECRUITER-FIRST", "Editorial Balanced", "Narrative Premium", "#fffaf4", "#7c2d12", "creative", creativePhoto),
  template("Editorial Column", "Editorial", "Asymmetric editorial layout that separates profile, proof, and portfolio-style evidence.", "Writers, strategists, creatives, portfolio roles", "VISUAL / RECRUITER-FIRST", "Editorial Visual", "Portfolio Narrative", "#fff7ed", "#9a3412", "creative", creativePhoto),
  template("Elegant Classic", "Elegant", "Classic elegant CV with formal hierarchy, calm spacing, and restrained accent rules.", "Professional services, finance, consulting", "ATS BALANCED", "Elegant Balanced", "Classic Premium", "#fffdfa", "#7f1d1d", "enterprise", optionalPhoto),
  template("Elegant Stone", "Elegant", "Stone-toned professional layout with warm surfaces and mature recruiter readability.", "Experienced professionals, leadership, operations", "ATS BALANCED", "Elegant ATS", "Mature Tone", "#faf7f2", "#57534e", "enterprise", optionalPhoto),
  template("Luxury Consultant", "Consulting", "Premium consultant layout with compact evidence cards and refined executive spacing.", "Consultants, strategists, advisory roles", "VISUAL / RECRUITER-FIRST", "Consulting Balanced", "Premium Evidence", "#fffaf2", "#9a6a1d", "consulting", noPhoto),

  template("Technical Systems", "Technical / IT", "Systems-focused technical CV that elevates tools, architecture, and operational proof.", "Systems engineers, IT support, infrastructure", "ATS BALANCED", "Technical Balanced", "Systems Proof", "#f8fafc", "#0f766e", "technical", noPhoto),
  template("Technical Architect", "Technical / IT", "Architecture-led layout with technical stack, systems, and project scope near the top.", "Architects, senior engineers, platform leads", "ATS BALANCED", "Architecture Friendly", "Stack Focused", "#f8fafc", "#155e75", "technical", noPhoto),
  template("Software Engineer", "Technical / IT", "Software CV with projects, stack, impact, and experience structured for engineering review.", "Software engineers, developers, product engineers", "ATS BALANCED", "Engineering ATS", "Code & Project Proof", "#f8fafc", "#0f766e", "technical", noPhoto),
  template("Data Specialist", "Technical / IT", "Data-focused layout with tools, analytics evidence, projects, and measurable outcomes prioritized.", "Data analysts, BI, analytics, research roles", "ATS BALANCED", "Data ATS", "Analytics Focused", "#f8fafc", "#164e63", "technical", noPhoto),
  template("Cybersecurity", "Technical / IT", "Security-focused CV with certifications, tools, risk evidence, and operational experience upfront.", "Cybersecurity, risk, SOC, governance", "ATS BALANCED", "Security ATS", "Credential Focused", "#f8fafc", "#7f1d1d", "technical", noPhoto),
  template("Engineering Blueprint", "Engineering", "Engineering layout with project architecture, systems evidence, and technical skills hierarchy.", "Mechanical, civil, industrial, software engineering", "ATS BALANCED", "Project ATS", "Engineering Proof", "#f8fafc", "#334155", "technical", noPhoto),

  template("Finance Analyst", "Finance", "Analyst CV with compact achievements, tools, numbers, and commercial evidence prioritized.", "Analysts, accountants, finance operations", "ATS BALANCED", "Finance Balanced", "Numbers Focused", "#ffffff", "#1f2937", "consulting", noPhoto),
  template("Finance Executive", "Finance", "Senior finance layout with governance, leadership, controls, and commercial outcomes emphasized.", "Finance managers, CFO-track, audit leadership", "ATS BALANCED", "Executive Finance", "Control & Impact", "#fffdfa", "#7c5c20", "executive", portraitPhoto),
  template("Banking Professional", "Finance", "Conservative banking layout with compliance, service, and performance hierarchy.", "Banking, insurance, financial services", "ATS BALANCED", "Banking Friendly", "Trusted Structure", "#ffffff", "#334155", "enterprise", optionalPhoto),
  template("Healthcare Credential", "Healthcare", "Credential-led clinical layout with registration, training, and clinical evidence near the top.", "Nurses, clinicians, care professionals", "ATS BALANCED", "Credential ATS", "Clinical Readability", "#f4faf7", "#0f766e", "healthcare", optionalPhoto),
  template("Clinical Compact", "Healthcare", "Compact healthcare CV for candidates with many procedures, departments, and credentials.", "Healthcare professionals with dense records", "ATS BALANCED", "Clinical Compact", "Procedure Readable", "#ffffff", "#115e59", "healthcare", noPhoto),
  template("Academic Researcher", "Academic", "Academic-adjacent CV with education, publications, projects, and credentials organized cleanly.", "Researchers, lecturers, postgraduate applications", "ATS BALANCED", "Academic Balanced", "Research Focused", "#ffffff", "#4c1d95", "international", optionalPhoto),

  template("Graduate Scholar", "Graduate", "Education-first graduate CV with projects, modules, awards, and transferable skills prioritized.", "Students, graduates, academic internships", "ATS BALANCED", "Graduate Balanced", "Education First", "#fffafa", "#7f1d1d", "graduate", optionalPhoto),
  template("Emerging Talent", "Emerging Talent", "Early-career CV that turns limited experience into clear potential and credible proof.", "First jobs, internships, career starters", "ATS BALANCED", "Emerging Talent", "Potential Focused", "#fff7ed", "#9a3412", "graduate", optionalPhoto),
  template("Internship Ready", "Graduate", "Internship-focused CV with education, projects, availability, and practical skills in front.", "Internships, learnerships, apprenticeships", "ATS HIGH", "Internship ATS", "Entry-Level Scan", "#ffffff", "#7f1d1d", "single", noPhoto),
  template("Career Change Bridge", "Career Change", "Career-change layout that foregrounds transferable evidence and honest target-role alignment.", "Career changers, returners, cross-industry moves", "ATS BALANCED", "Transferable ATS", "Bridge Narrative", "#fffaf4", "#a16207", "sidebar", optionalPhoto),
  template("Return-to-Work", "Career Change", "Supportive layout for career breaks, return-to-work profiles, and fresh positioning.", "Career breaks, returning parents, renewed job search", "ATS BALANCED", "Returner Friendly", "Supportive Framing", "#fffdf8", "#7f1d1d", "enterprise", optionalPhoto),
  template("Skills First", "Skills-focused", "Skills-led CV that prioritizes capabilities before chronology while preserving recruiter clarity.", "Career changers, limited formal experience, portfolio careers", "ATS BALANCED", "Skills Balanced", "Capability Led", "#ffffff", "#4b5563", "sidebar", noPhoto),

  template("Project Portfolio", "Project-focused", "Project-forward layout with visible proof, tools, role, and impact before standard history.", "Project managers, engineers, creatives, consultants", "VISUAL / RECRUITER-FIRST", "Project Balanced", "Portfolio Proof", "#fff7ed", "#9a3412", "creative", creativePhoto),
  template("Achievement Led", "Achievement-focused", "Impact-first CV that organizes evidence around achievements and measurable outcomes.", "Sales, leadership, operations, consulting", "ATS BALANCED", "Achievement ATS", "Impact Focused", "#fffafa", "#b4232a", "consulting", noPhoto),
  template("International Executive", "International", "Conservative global executive CV with languages, location, leadership and relocation clarity.", "International leadership, relocation, global NGOs", "ATS BALANCED", "International Executive", "Global Readability", "#ffffff", "#1f2937", "international", portraitPhoto),
  template("Global NGO", "International", "Mission-oriented international CV with languages, projects, field experience, and public value.", "NGOs, development, social impact, international roles", "ATS BALANCED", "Global Balanced", "Mission Focused", "#f8fafc", "#166534", "international", optionalPhoto),
  template("ATS Balanced Sidebar", "ATS Modern", "Conservative sidebar design that remains recruiter-readable while keeping ATS-aware ordering.", "Modern applications where light visual polish is acceptable", "ATS BALANCED", "Balanced Sidebar", "Readable Polish", "#ffffff", "#334155", "sidebar", noPhoto),
  template("ATS Modern Professional", "ATS Modern", "Modern ATS-friendly layout with restrained structure and stronger visual hierarchy than plain ATS.", "Professional roles, hybrid applications, recruiter screening", "ATS HIGH", "Modern ATS", "Clean Hierarchy", "#ffffff", "#7f1d1d", "single", noPhoto),

  template("Administration Precision", "Administration", "Administrative CV with records, coordination, communication, and office workflows separated clearly.", "Administrators, office coordinators, reception, clerical support", "ATS BALANCED", "Admin Balanced", "Operations Clear", "#ffffff", "#4b5563", "enterprise", optionalPhoto),
  template("Administration Classic", "Administration", "Traditional office CV with conservative headings, compact duties, and service reliability up front.", "Administrative assistants, school offices, municipal support", "ATS HIGH", "Classic Admin ATS", "Reliable Structure", "#ffffff", "#1f2937", "single", noPhoto),
  template("HR People Partner", "Human Resources", "People-focused CV that balances employee relations, processes, compliance, and stakeholder support.", "HR officers, people partners, employee support roles", "ATS BALANCED", "HR Balanced", "People Operations", "#fffafa", "#7f1d1d", "sidebar", optionalPhoto),
  template("HR Talent Acquisition", "Human Resources", "Recruitment-focused layout with sourcing, screening, coordination, and hiring outcomes prioritized.", "Recruiters, talent coordinators, HR assistants", "ATS BALANCED", "Recruitment ATS", "Hiring Workflow", "#f8fafc", "#334155", "consulting", noPhoto),
  template("Sales Performance", "Sales", "Revenue-oriented CV with targets, territories, customer proof, and achievements made scannable.", "Sales representatives, account executives, retail sales", "ATS BALANCED", "Sales Balanced", "Performance Focused", "#fffafa", "#b4232a", "consulting", noPhoto),
  template("Sales Executive", "Sales", "Senior sales layout for commercial leadership, account growth, partnerships, and measurable outcomes.", "Sales managers, business development leaders, account directors", "ATS BALANCED", "Commercial Executive", "Revenue Leadership", "#fffdfa", "#7c5c20", "executive", portraitPhoto),
  template("Marketing Strategist", "Marketing", "Marketing CV with campaigns, audience insight, content, analytics, and channel evidence structured clearly.", "Marketing specialists, brand roles, growth teams", "ATS BALANCED", "Marketing Balanced", "Campaign Proof", "#fff7ed", "#9a3412", "creative", creativePhoto),
  template("Marketing Creative", "Marketing", "Editorial marketing layout that brings portfolio, campaigns, copy, and brand storytelling forward.", "Content, social, communications, creative marketing", "VISUAL / RECRUITER-FIRST", "Portfolio Friendly", "Brand Story", "#fffaf4", "#7c2d12", "creative", creativePhoto),
  template("Operations Manager", "Operations", "Operations CV with process, team coordination, service delivery, and improvement evidence prioritized.", "Operations managers, supervisors, service coordinators", "ATS BALANCED", "Operations ATS", "Delivery Focused", "#f8fafc", "#334155", "enterprise", optionalPhoto),
  template("Operations Lean", "Operations", "Improvement-led operations layout with workflows, controls, efficiency, and practical outcomes organized tightly.", "Process improvement, logistics, operations analysts", "ATS BALANCED", "Process Balanced", "Improvement Proof", "#ffffff", "#166534", "consulting", noPhoto),

  template("Project Manager", "Project-focused", "Project management CV with delivery scope, stakeholders, methods, risks, and outcomes clearly separated.", "Project managers, coordinators, delivery roles", "ATS BALANCED", "Project ATS", "Delivery Evidence", "#ffffff", "#7f1d1d", "consulting", noPhoto),
  template("PMO Executive", "Project-focused", "Governance-led PMO CV with portfolio oversight, reporting, controls, and leadership scope emphasized.", "PMO leads, programme managers, delivery executives", "ATS BALANCED", "PMO Balanced", "Governance Focused", "#fffdfa", "#7c5c20", "executive", portraitPhoto),
  template("Legal Counsel", "Legal", "Formal legal CV with credentials, jurisdictions, matters, advisory scope, and compliance evidence structured conservatively.", "Legal counsel, compliance lawyers, policy roles", "ATS BALANCED", "Legal Balanced", "Formal Review", "#ffffff", "#1f2937", "international", noPhoto),
  template("Legal Associate", "Legal", "Clean legal associate layout with education, matters, research, drafting, and professional memberships visible.", "Legal graduates, paralegals, junior associates", "ATS HIGH", "Legal ATS", "Credential Readable", "#ffffff", "#3f3f46", "single", noPhoto),
  template("Compliance Risk", "Risk & Compliance", "Risk-focused CV with controls, audits, regulatory exposure, and evidence of judgement prioritized.", "Compliance, risk, governance, audit support", "ATS BALANCED", "Compliance ATS", "Control Focused", "#f8fafc", "#475569", "enterprise", optionalPhoto),
  template("Government Service", "Public Sector", "Public-service CV with eligibility, service delivery, policy exposure, and community outcomes presented clearly.", "Government, municipal, public administration", "ATS BALANCED", "Public Service", "Service Readable", "#ffffff", "#475569", "international", optionalPhoto),
  template("Policy Analyst", "Public Sector", "Policy CV with research, analysis, stakeholder engagement, and written outputs in a disciplined hierarchy.", "Policy analysts, researchers, NGO policy roles", "ATS BALANCED", "Policy Balanced", "Analysis Focused", "#f8fafc", "#334155", "consulting", noPhoto),
  template("Public Administration", "Public Sector", "Conservative administrative layout for public institutions, records, compliance, and citizen support.", "Public administration, education offices, NGO operations", "ATS HIGH", "Public ATS", "Institutional Clarity", "#ffffff", "#1f2937", "single", noPhoto),
  template("Accounting Professional", "Finance", "Accounting CV with reconciliations, reporting, controls, systems, and month-end evidence prioritized.", "Accountants, bookkeepers, finance officers", "ATS BALANCED", "Accounting ATS", "Controls Readable", "#ffffff", "#334155", "enterprise", noPhoto),
  template("Audit Assurance", "Finance", "Audit layout with engagements, risk areas, evidence quality, standards, and client exposure organized compactly.", "Auditors, assurance associates, internal audit", "ATS BALANCED", "Audit Balanced", "Evidence Focused", "#ffffff", "#1f2937", "consulting", noPhoto),

  template("Tax Specialist", "Finance", "Tax CV with compliance cycles, advisory work, filing, controls, and legislation-aware experience structured cleanly.", "Tax consultants, finance specialists, compliance officers", "ATS BALANCED", "Tax ATS", "Compliance Proof", "#fffdfa", "#7c5c20", "enterprise", noPhoto),
  template("Treasury Analyst", "Finance", "Treasury and cash-management CV with reporting, controls, analysis, and stakeholder evidence prioritized.", "Treasury, finance operations, analysts", "ATS BALANCED", "Treasury Balanced", "Finance Operations", "#f8fafc", "#334155", "consulting", noPhoto),
  template("Investment Analyst", "Finance", "Investment layout with research, modelling, markets, risk, and portfolio evidence presented with concise hierarchy.", "Investment analysts, research analysts, asset management", "ATS BALANCED", "Investment Balanced", "Analytical Review", "#ffffff", "#1f2937", "consulting", noPhoto),
  template("Retail Supervisor", "Retail", "Retail leadership CV with team, store operations, customer experience, stock, and sales performance up front.", "Retail supervisors, store managers, team leaders", "ATS BALANCED", "Retail Balanced", "Store Leadership", "#fffafa", "#b4232a", "enterprise", optionalPhoto),
  template("Retail Associate", "Retail", "Entry and mid-level retail CV with customer service, cash handling, product knowledge, and reliability visible.", "Retail assistants, cashiers, sales associates", "ATS HIGH", "Retail ATS", "Customer Service", "#ffffff", "#7f1d1d", "single", noPhoto),
  template("Customer Service", "Customer Support", "Customer-support CV with service channels, issue resolution, empathy, systems, and quality evidence emphasized.", "Customer service, call centre, client support", "ATS BALANCED", "Support Balanced", "Service Proof", "#f8fafc", "#475569", "sidebar", optionalPhoto),
  template("Contact Centre", "Customer Support", "Contact-centre layout for volume, scripts, systems, customer outcomes, and quality monitoring.", "Contact centre agents, helpdesk, service desks", "ATS HIGH", "Contact Centre ATS", "Volume Ready", "#ffffff", "#334155", "single", noPhoto),
  template("Hospitality Service", "Hospitality", "Hospitality CV with guest service, operations, standards, shifts, and teamwork made easy to scan.", "Hospitality, restaurant, tourism, front desk", "ATS BALANCED", "Hospitality Balanced", "Guest Service", "#fff7ed", "#9a3412", "sidebar", optionalPhoto),
  template("Hotel Management", "Hospitality", "Hotel leadership CV with departments, guest experience, standards, revenue, and staff coordination prioritized.", "Hotel supervisors, managers, venue operations", "ATS BALANCED", "Hotel Leadership", "Service Operations", "#fffdfa", "#7c5c20", "executive", portraitPhoto),
  template("Logistics Coordinator", "Logistics", "Logistics CV with shipments, schedules, vendors, systems, and operational accuracy clearly separated.", "Logistics coordinators, dispatch, transport admin", "ATS BALANCED", "Logistics ATS", "Coordination Focused", "#f8fafc", "#334155", "enterprise", noPhoto),

  template("Supply Chain", "Logistics", "Supply-chain layout with planning, procurement, inventory, suppliers, and improvement evidence prioritized.", "Supply chain, procurement, inventory analysts", "ATS BALANCED", "Supply Chain", "Process Proof", "#ffffff", "#166534", "consulting", noPhoto),
  template("Warehouse Operations", "Logistics", "Warehouse CV with receiving, dispatch, stock control, safety, equipment, and team workflow visible.", "Warehouse staff, supervisors, stock controllers", "ATS HIGH", "Warehouse ATS", "Operations Scan", "#ffffff", "#475569", "single", noPhoto),
  template("Skilled Trades", "Skilled Trades", "Trade CV with tools, safety, licences, sites, equipment, and practical experience organized clearly.", "Tradespeople, artisans, technicians, maintenance", "ATS BALANCED", "Trade Balanced", "Practical Proof", "#f8fafc", "#334155", "technical", noPhoto),
  template("Trade Apprentice", "Skilled Trades", "Apprenticeship CV with training, practical exposure, safety awareness, and transferable skills up front.", "Apprentices, learnerships, entry-level trades", "ATS HIGH", "Apprentice ATS", "Training First", "#ffffff", "#7f1d1d", "graduate", noPhoto),
  template("Electrician Technical", "Skilled Trades", "Technical trade layout with equipment, safety procedures, sites, certifications, and fault-finding evidence.", "Electricians, maintenance technicians, technical trades", "ATS BALANCED", "Technical Trade", "Safety Focused", "#f8fafc", "#155e75", "technical", noPhoto),
  template("Construction Site", "Skilled Trades", "Construction CV with site roles, safety, equipment, projects, and teamwork organized for contractor review.", "Construction workers, site supervisors, foremen", "ATS BALANCED", "Construction ATS", "Site Ready", "#fffaf4", "#a16207", "technical", noPhoto),
  template("Security Officer", "Security", "Security CV with patrols, incident reporting, access control, training, and reliability made scannable.", "Security officers, guards, access control roles", "ATS HIGH", "Security ATS", "Trust Readable", "#ffffff", "#1f2937", "single", noPhoto),
  template("Security Supervisor", "Security", "Security leadership CV with teams, sites, procedures, incidents, and client coordination prioritized.", "Security supervisors, control-room leads, site managers", "ATS BALANCED", "Security Leadership", "Procedure Focused", "#f8fafc", "#334155", "enterprise", optionalPhoto),
  template("Education Professional", "Education", "Education CV with subjects, grades, learning support, curriculum, and outcomes structured professionally.", "Teachers, tutors, education support", "ATS BALANCED", "Education Balanced", "Learning Focused", "#fffdfa", "#7c5c20", "international", optionalPhoto),
  template("Teacher Portfolio", "Education", "Teacher portfolio CV that balances classroom evidence, activities, curriculum, and professional development.", "Teachers, lecturers, trainers, learning designers", "VISUAL / RECRUITER-FIRST", "Education Portfolio", "Teaching Story", "#fff7ed", "#9a3412", "creative", creativePhoto),

  template("Laboratory Scientist", "Science", "Laboratory CV with methods, quality, instruments, compliance, and evidence organized without raw inventory overload.", "Laboratory, science, quality, research support", "ATS BALANCED", "Science Balanced", "Method Focused", "#f4faf7", "#0f766e", "healthcare", noPhoto),
  template("Research Technician", "Science", "Research technician layout with protocols, data, lab support, projects, and technical skills clearly separated.", "Research technicians, lab assistants, field researchers", "ATS BALANCED", "Research ATS", "Technical Evidence", "#f8fafc", "#155e75", "technical", noPhoto),
  template("Science Graduate", "Science", "Science graduate CV with education, lab exposure, projects, methods, and transferable skills prioritized.", "Science graduates, internships, lab entry roles", "ATS HIGH", "Science Graduate", "Education First", "#ffffff", "#0f766e", "graduate", noPhoto),
  template("Cleaner Service", "Facilities", "Service CV with reliability, sites, cleaning standards, equipment, teamwork, and shift readiness visible.", "Cleaning, domestic work, facilities service", "ATS HIGH", "Service ATS", "Reliability Focused", "#ffffff", "#475569", "single", noPhoto),
  template("Facilities Support", "Facilities", "Facilities CV with maintenance support, site coordination, safety, vendors, and service operations structured clearly.", "Facilities assistants, caretakers, maintenance support", "ATS BALANCED", "Facilities Balanced", "Site Support", "#f8fafc", "#334155", "enterprise", optionalPhoto),
  template("No Experience Starter", "Emerging Talent", "First-job CV that turns education, volunteering, interests, and transferable strengths into credible evidence.", "No formal experience, first job seekers, school leavers", "ATS HIGH", "Starter ATS", "Potential Clear", "#ffffff", "#7f1d1d", "graduate", noPhoto),
  template("Community Volunteer", "Community", "Community-focused CV with volunteering, service, leadership, events, and practical contribution highlighted.", "Volunteers, NGO work, community roles, early career", "ATS BALANCED", "Community Balanced", "Service Proof", "#f8fafc", "#166534", "sidebar", optionalPhoto),
  template("Multilingual International", "International", "International CV that elevates languages, relocation readiness, cultural fluency, and globally readable structure.", "Multilingual candidates, relocation, remote international roles", "ATS BALANCED", "Language Friendly", "Global Mobility", "#ffffff", "#334155", "international", portraitPhoto),
  template("Remote Professional", "Modern Professional", "Remote-work CV with communication, tools, autonomy, delivery, and distributed collaboration evidence prioritized.", "Remote roles, hybrid roles, global teams", "ATS BALANCED", "Remote Balanced", "Distributed Work", "#f8fafc", "#7f1d1d", "sidebar", noPhoto),
  template("Contemporary Neutral", "Modern Professional", "Premium neutral CV with quiet spacing, balanced section flow, and strong readability across professions.", "General applications, professional services, career changes", "ATS BALANCED", "Neutral ATS", "Broadly Recruiter Ready", "#fffdf8", "#57534e", "enterprise", optionalPhoto)
];

export const documentTemplateGallery: DocumentTemplateMetadata[] = [
  template("Meridian Executive", "Executive & Leadership", "Executive header, high-level proof blocks, and restrained leadership hierarchy for senior profiles.", "Executives, founders, senior managers", "ATS BALANCED", "Executive structured", "Leadership presence", "#fffdfa", "#b0893f", "executive", portraitPhoto),
  template("Summit Leadership", "Executive & Leadership", "Leadership-first composition that foregrounds scope, teams, and outcomes before supporting detail.", "Directors, heads of function, programme leads", "ATS BALANCED", "Leadership balanced", "Scope focused", "#fffaf2", "#7f1d1d", "executive", portraitPhoto),
  template("Regent Boardroom", "Executive & Leadership", "Governance-oriented layout with formal authority, board-level spacing, and compact credentials.", "Board, advisory, trustee and governance roles", "ATS BALANCED", "Board structure", "Governance focused", "#fbf7ef", "#7c5c20", "executive", portraitPhoto),
  template("Keystone Director", "Executive & Leadership", "Consulting-density executive CV with operating scope and evidence-led achievements.", "Directors, transformation leads, consultants", "ATS BALANCED", "Compact leadership", "Evidence led", "#fffdfa", "#8a5a1f", "consulting", noPhoto),
  template("Atlas Executive", "Executive & Leadership", "Enterprise leadership system with strong profile band, readable proof, and disciplined spacing.", "Senior professionals with broad operational scope", "ATS BALANCED", "Enterprise executive", "Strategic scanner", "#f8fafc", "#7f1d1d", "enterprise", optionalPhoto),
  template("Vanguard Leadership", "Executive & Leadership", "Bold leadership hierarchy with a strong title zone and measured recruiter-first rhythm.", "Senior managers, commercial leaders, founders", "VISUAL / RECRUITER-FIRST", "Visual leadership", "Premium authority", "#fff7ed", "#9a3412", "executive", portraitPhoto),
  template("Sterling Principal", "Executive & Leadership", "Mature professional layout balancing expertise, scope, and credibility for principal-level roles.", "Principals, senior specialists, practice leads", "ATS BALANCED", "Principal balanced", "Mature hierarchy", "#fffdf8", "#57534e", "enterprise", optionalPhoto),
  template("Northstar Executive", "Executive & Leadership", "International executive composition with location, languages, leadership, and global context visible.", "International executives and relocation-ready leaders", "ATS BALANCED", "Global executive", "International readability", "#ffffff", "#1f2937", "international", portraitPhoto),

  template("Atlas Professional", "Corporate & Professional", "PATHZY's reference professional CV with clean hierarchy, structured experience, and durable A4 flow.", "General professional applications and imported CV repair", "ATS BALANCED", "Structured ATS", "Signature professional", "#fffdfa", "#1f2937", "signature", noPhoto),
  template("Regent Corporate", "Corporate & Professional", "Corporate enterprise layout with formal section rhythm and clear evidence ordering.", "Enterprise, administration, operations and finance", "ATS BALANCED", "Corporate balanced", "Enterprise ready", "#f8fafc", "#334155", "enterprise", optionalPhoto),
  template("Harbor Professional", "Corporate & Professional", "Modern sidebar composition that keeps contact, skills, and credentials tidy without crowding experience.", "Professional services, operations, HR and support roles", "ATS BALANCED", "Sidebar balanced", "Recruiter readable", "#ffffff", "#7f1d1d", "sidebar", optionalPhoto),
  template("Keystone Corporate", "Corporate & Professional", "Conservative business layout with compact headings, balanced whitespace, and predictable scanning.", "Finance, HR, legal support and office roles", "ATS BALANCED", "Classic corporate", "Traditional clarity", "#ffffff", "#1f2937", "enterprise", noPhoto),
  template("Meridian Professional", "Corporate & Professional", "Warm professional layout with approachable hierarchy for service and people-facing careers.", "Customer-facing, support, people and coordination roles", "ATS BALANCED", "Modern balanced", "Approachable polish", "#fffaf4", "#a16207", "sidebar", optionalPhoto),
  template("Forge Consultant", "Corporate & Professional", "Evidence-first consultant layout with sharp section rules and concise proof blocks.", "Consulting, strategy, analysis and advisory roles", "ATS BALANCED", "Consulting ATS", "Evidence focused", "#fffdfa", "#7f1d1d", "consulting", noPhoto),
  template("Crest Professional", "Corporate & Professional", "Quiet premium structure for broad professional use, with skills and history in clear proportion.", "General professional roles and career progression", "ATS BALANCED", "Neutral ATS", "Broadly recruiter-ready", "#fffdf8", "#57534e", "enterprise", optionalPhoto),
  template("Stonebridge Corporate", "Corporate & Professional", "Formal international corporate CV with conservative spacing and globally familiar reading order.", "Corporate, NGO, public-sector and international applications", "ATS HIGH", "International format", "Conservative layout", "#ffffff", "#334155", "international", noPhoto),

  template("Vanguard ATS", "ATS & Minimal", "Strict parser-friendly single-column CV with plain headings and no decorative sidebar.", "Job boards, enterprise ATS and government portals", "ATS HIGH", "Single-column ATS", "Parser safe", "#ffffff", "#111827", "single", noPhoto),
  template("Clarity ATS", "ATS & Minimal", "Clean ATS layout with enough visual polish for recruiter scanning while staying machine-readable.", "Online applications and high-volume hiring", "ATS HIGH", "Clean ATS", "Fast scanner friendly", "#ffffff", "#1f2937", "single", noPhoto),
  template("Plainspoken Minimal", "ATS & Minimal", "Minimal one-column CV with honest spacing and no visual noise.", "Conservative employers and simple applications", "ATS HIGH", "Minimal single column", "No-nonsense scan", "#ffffff", "#27272a", "single", noPhoto),
  template("Ledger Minimal", "ATS & Minimal", "Dense minimal layout for longer histories and credential-rich profiles.", "Experienced candidates and two-page CVs", "ATS HIGH", "Dense ATS", "Space efficient", "#ffffff", "#3f3f46", "single", noPhoto),
  template("Signal ATS", "ATS & Minimal", "Technical-safe ATS layout that keeps tools, projects, and experience in predictable order.", "Software, IT, data and technical support", "ATS HIGH", "Technical ATS", "Stack readable", "#ffffff", "#0f766e", "single", noPhoto),
  template("Linear Minimal", "ATS & Minimal", "Linear chronology-led CV for straightforward applications and reliable parsing.", "General applications, admin, operations and early career", "ATS HIGH", "Linear ATS", "Chronology clear", "#ffffff", "#475569", "single", noPhoto),
  template("Civic ATS", "ATS & Minimal", "Formal public-sector ATS layout with credentials, eligibility, and experience in conservative order.", "Public sector, compliance, education and legal support", "ATS HIGH", "Formal ATS", "Institutional clarity", "#ffffff", "#1f2937", "international", noPhoto),
  template("Essential One Page", "ATS & Minimal", "Compact one-page-biased template for short profiles without shrinking text dangerously.", "Graduates, concise professional profiles and direct applications", "ATS HIGH", "Compact ATS", "One-page ready", "#ffffff", "#7f1d1d", "single", noPhoto),

  template("Horizon Technical", "Technical / IT / Engineering", "Technical layout with skills architecture, project proof, and structured experience blocks.", "Engineering, software, data and technical support", "ATS BALANCED", "Technical ATS", "Project focused", "#f8fafc", "#0f766e", "technical", noPhoto),
  template("Nexus Engineer", "Technical / IT / Engineering", "Engineering blueprint layout with systems, projects, tools, and outcomes clearly separated.", "Engineers, architects and technical specialists", "ATS BALANCED", "Project ATS", "Engineering proof", "#f8fafc", "#334155", "technical", noPhoto),
  template("Circuit Systems", "Technical / IT / Engineering", "Systems-focused CV that elevates platforms, infrastructure, and operating evidence.", "Systems engineers, IT support and infrastructure roles", "ATS BALANCED", "Systems balanced", "Systems proof", "#f8fafc", "#0f766e", "technical", noPhoto),
  template("Gridline Technical", "Technical / IT / Engineering", "Grid-structured technical CV for candidates with stack-heavy evidence and projects.", "Developers, analysts and product engineers", "ATS BALANCED", "Engineering ATS", "Stack and project proof", "#f8fafc", "#155e75", "technical", noPhoto),
  template("Infrastructure Engineer", "Technical / IT / Engineering", "Operational technical layout for support, networks, platforms, and delivery reliability.", "Infrastructure, service desk, support and operations roles", "ATS BALANCED", "Infrastructure ATS", "Operational proof", "#ffffff", "#334155", "technical", noPhoto),
  template("Product Systems", "Technical / IT / Engineering", "Product-and-delivery layout with outcomes, projects, stakeholders, and technical capability prioritized.", "Product managers, delivery leads and technical consultants", "ATS BALANCED", "Product balanced", "Outcome focused", "#f8fafc", "#7f1d1d", "consulting", noPhoto),
  template("Data Platform", "Technical / IT / Engineering", "Data-focused CV with analytics, tools, projects, and measurable evidence near the top.", "Data analysts, BI, research and analytics roles", "ATS BALANCED", "Data ATS", "Analytics focused", "#f8fafc", "#164e63", "technical", noPhoto),

  template("Lumina Graduate", "Graduate / Early Career", "Education-first graduate CV that elevates projects, skills, and potential without exaggeration.", "Graduates, internships and first professional roles", "ATS BALANCED", "Graduate balanced", "Potential focused", "#fffafa", "#7f1d1d", "graduate", optionalPhoto),
  template("Launch Graduate", "Graduate / Early Career", "Fresh early-career layout that brings practical exposure, availability, and learning evidence forward.", "Internships, learnerships and apprenticeships", "ATS HIGH", "Internship ATS", "Entry-level scan", "#ffffff", "#7f1d1d", "graduate", noPhoto),
  template("First Step Professional", "Graduate / Early Career", "First-job CV that turns education, volunteering, interests, and transferable strengths into credible proof.", "No formal experience and school leavers", "ATS HIGH", "Starter ATS", "Potential clear", "#ffffff", "#7f1d1d", "single", noPhoto),
  template("Emerging Talent", "Graduate / Early Career", "Supportive early-career design with credible hierarchy for limited formal experience.", "Career starters, graduates and junior professionals", "ATS BALANCED", "Emerging talent", "Potential focused", "#fff7ed", "#9a3412", "graduate", optionalPhoto),
  template("Scholar Entry", "Graduate / Early Career", "Academic-leaning graduate layout with education, modules, projects, and awards up front.", "Students, graduates and academic internships", "ATS BALANCED", "Education first", "Scholar profile", "#fffdf8", "#a16207", "graduate", optionalPhoto),
  template("Campus Portfolio", "Graduate / Early Career", "Portfolio-aware graduate layout for projects, links, activities, and proof of initiative.", "Students with projects, portfolios and campus leadership", "VISUAL / RECRUITER-FIRST", "Portfolio friendly", "Project proof", "#fff7ed", "#9a3412", "creative", creativePhoto),

  template("Atelier Portfolio", "Creative / Product / Marketing", "Editorial creative CV with portfolio rhythm, strong section contrast, and recruiter-readable proof.", "Design, content, product and portfolio-led careers", "VISUAL / RECRUITER-FIRST", "Portfolio friendly", "Creative impact", "#fff7ed", "#9a3412", "creative", creativePhoto),
  template("Studio Product", "Creative / Product / Marketing", "Product-minded layout balancing portfolio evidence, outcomes, tools, and delivery context.", "Product, UX, delivery and creative technology roles", "VISUAL / RECRUITER-FIRST", "Product portfolio", "Project narrative", "#fffaf4", "#7c2d12", "creative", creativePhoto),
  template("Brand Strategist", "Creative / Product / Marketing", "Marketing strategy CV with campaigns, audience insight, and performance evidence structured clearly.", "Marketing, brand, communications and growth roles", "ATS BALANCED", "Marketing balanced", "Campaign proof", "#fff7ed", "#9a3412", "creative", creativePhoto),
  template("Editorial Creative", "Creative / Product / Marketing", "Asymmetric editorial layout for writers, strategists, and communications professionals.", "Writers, strategists, communications and policy roles", "VISUAL / RECRUITER-FIRST", "Editorial visual", "Narrative premium", "#fffaf4", "#7c2d12", "creative", creativePhoto),
  template("Campaign Portfolio", "Creative / Product / Marketing", "Campaign-led CV that makes projects, outputs, and audience impact easy to scan.", "Campaign, social, content and portfolio roles", "VISUAL / RECRUITER-FIRST", "Campaign portfolio", "Brand story", "#fffaf4", "#7f1d1d", "creative", creativePhoto),

  template("Keystone Public Service", "Academic / Public Sector / Healthcare", "Public-service CV with eligibility, credentials, service delivery, and community outcomes presented clearly.", "Government, municipal, NGO and public administration", "ATS BALANCED", "Public service", "Service readable", "#ffffff", "#475569", "international", optionalPhoto),
  template("Academic Dossier", "Academic / Public Sector / Healthcare", "Academic-adjacent CV with education, publications, research projects, and credentials organized cleanly.", "Researchers, lecturers and postgraduate applications", "ATS BALANCED", "Academic balanced", "Research focused", "#ffffff", "#4b5563", "international", noPhoto),
  template("Clinical Professional", "Academic / Public Sector / Healthcare", "Credential-led clinical layout with registration, training, and clinical evidence near the top.", "Healthcare, care work and clinical support", "ATS BALANCED", "Credential ATS", "Clinical readability", "#f4faf7", "#0f766e", "healthcare", optionalPhoto),
  template("Research Fellow", "Academic / Public Sector / Healthcare", "Research technician layout with protocols, data, projects, and technical skills clearly separated.", "Research technicians, lab assistants and scientific roles", "ATS BALANCED", "Research ATS", "Technical evidence", "#f8fafc", "#155e75", "technical", noPhoto),

  template("Nexus International", "International / NGO / Career Change", "Globally familiar CV layout with languages, location, mobility, and international readability.", "International applications, NGOs, relocation and remote roles", "ATS BALANCED", "Language friendly", "Global mobility", "#ffffff", "#334155", "international", portraitPhoto),
  template("Global Impact", "International / NGO / Career Change", "Mission-oriented international CV with public value, projects, languages, and field context.", "NGOs, development, social impact and public-interest roles", "ATS BALANCED", "Global balanced", "Mission focused", "#f8fafc", "#166534", "international", optionalPhoto),
  template("Bridge Career Change", "International / NGO / Career Change", "Career-change layout that foregrounds transferable evidence and honest target-role alignment.", "Career changers, returners and cross-industry moves", "ATS BALANCED", "Transferable ATS", "Bridge narrative", "#fffaf4", "#a16207", "sidebar", optionalPhoto),
  template("Mission Portfolio", "International / NGO / Career Change", "Portfolio-style mission CV balancing projects, volunteering, languages, and professional proof.", "Community, NGO, portfolio and purpose-led applications", "VISUAL / RECRUITER-FIRST", "Mission portfolio", "Service proof", "#f8fafc", "#166534", "creative", optionalPhoto)
];

export function templateVariantCounts(templates: DocumentTemplateMetadata[] = documentTemplateGallery) {
  return templates.reduce<Record<string, number>>((counts, item) => {
    counts[item.designKey] = (counts[item.designKey] ?? 0) + 1;
    return counts;
  }, {});
}

export function validateTemplateVariantLimit(templates: DocumentTemplateMetadata[] = documentTemplateGallery) {
  const overLimit = Object.entries(templateVariantCounts(templates)).filter(([, count]) => count > MAX_TEMPLATE_VARIANTS_PER_DESIGN);
  if (overLimit.length) {
    throw new Error(`CV template design variant limit exceeded: ${overLimit.map(([designKey, count]) => `${designKey} (${count})`).join(", ")}`);
  }
  return true;
}

validateTemplateVariantLimit();

export const cvTemplateNames = documentTemplateGallery.map((template) => template.name) as PremiumDocumentTemplate[];

export const legacyTemplateAliases: Record<string, PremiumDocumentTemplate> = {
  "ATS Friendly": "Clarity ATS",
  "Modern Blue": "Harbor Professional",
  "Professional Green": "Clinical Professional",
  "Graduate Fresh": "Lumina Graduate",
  "Executive Premium": "Meridian Executive",
  "Technical Engineer": "Horizon Technical",
  "Signature Professional": "Atlas Professional",
  "PATHZY Signature Professional": "Atlas Professional",
  "Executive Black": "Meridian Executive",
  "Modern ATS": "Clarity ATS",
  "Google Style": "Horizon Technical",
  "Microsoft Professional": "Regent Corporate",
  "Deloitte Consulting": "Forge Consultant",
  "Creative Premium": "Atelier Portfolio",
  "Healthcare Professional": "Clinical Professional",
  "Graduate Elite": "Lumina Graduate",
  "Engineering": "Horizon Technical",
  "International Standard": "Nexus International"
};

function legacyTemplateFallback(value: string): PremiumDocumentTemplate | undefined {
  const archived = archivedDocumentTemplateGallery.find((template) => template.name === value);
  if (!archived) return undefined;
  if (archived.atsClassification === "ATS HIGH" || /ATS|minimal/i.test(archived.family)) return "Vanguard ATS";
  if (/executive|leadership|finance/i.test(archived.family) || archived.thumbnail.layout === "executive") return "Meridian Executive";
  if (/technical|engineering|data|science|cyber/i.test(archived.family) || archived.thumbnail.layout === "technical") return "Horizon Technical";
  if (/graduate|emerging|internship|career change|skills/i.test(archived.family) || archived.thumbnail.layout === "graduate") return "Lumina Graduate";
  if (/creative|marketing|portfolio|editorial/i.test(archived.family) || archived.thumbnail.layout === "creative") return "Atelier Portfolio";
  if (/public|academic|legal|health|international|government|community/i.test(archived.family) || archived.thumbnail.layout === "international" || archived.thumbnail.layout === "healthcare") return "Nexus International";
  return "Atlas Professional";
}

export function normalizeDocumentTemplate(value: unknown): PremiumDocumentTemplate {
  if (typeof value !== "string") return "Atlas Professional";
  const trimmed = value.trim();
  if (cvTemplateNames.includes(trimmed)) return trimmed;
  return legacyTemplateAliases[trimmed] ?? legacyTemplateFallback(trimmed) ?? "Atlas Professional";
}

export function templateMetadata(name: unknown) {
  const normalized = normalizeDocumentTemplate(name);
  return documentTemplateGallery.find((template) => template.name === normalized) ?? documentTemplateGallery[0];
}

export function normalizeDocumentTemplatePalette(templateName: unknown, value: unknown) {
  const metadata = templateMetadata(templateName);
  if (typeof value === "string" && metadata.palettes.some((palette) => palette.id === value.trim())) return value.trim();
  return metadata.palettes[0].id;
}

export function templatePaletteMetadata(templateName: unknown, value: unknown) {
  const metadata = templateMetadata(templateName);
  const normalized = normalizeDocumentTemplatePalette(metadata.name, value);
  return metadata.palettes.find((palette) => palette.id === normalized) ?? metadata.palettes[0];
}
