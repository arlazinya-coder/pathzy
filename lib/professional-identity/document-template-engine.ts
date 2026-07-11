export const cvTemplateNames = [
  "Executive Black",
  "Modern ATS",
  "Google Style",
  "Microsoft Professional",
  "Deloitte Consulting",
  "Creative Premium",
  "Healthcare Professional",
  "Graduate Elite",
  "Engineering",
  "International Standard"
] as const;

export type PremiumDocumentTemplate = (typeof cvTemplateNames)[number];

export type DocumentTemplateMetadata = {
  name: PremiumDocumentTemplate;
  description: string;
  bestFor: string;
  atsCharacteristic: string;
  recruiterCharacteristic: string;
  thumbnail: {
    background: string;
    accent: string;
    layout: "single" | "sidebar" | "consulting" | "creative" | "technical" | "executive" | "enterprise" | "healthcare" | "graduate" | "international";
  };
};

export const legacyTemplateAliases: Record<string, PremiumDocumentTemplate> = {
  "ATS Friendly": "Modern ATS",
  "Modern Blue": "Google Style",
  "Professional Green": "Healthcare Professional",
  "Graduate Fresh": "Graduate Elite",
  "Executive Premium": "Executive Black"
};

export const documentTemplateGallery: DocumentTemplateMetadata[] = [
  {
    name: "Executive Black",
    description: "High-contrast executive layout with refined spacing and boardroom-level hierarchy.",
    bestFor: "Senior professionals, managers, founders, consultants",
    atsCharacteristic: "Executive Layout",
    recruiterCharacteristic: "Leadership Focused",
    thumbnail: { background: "#111111", accent: "#c9a35b", layout: "executive" }
  },
  {
    name: "Modern ATS",
    description: "Clean one-column structure optimized for ATS parsing and recruiter scanning.",
    bestFor: "Online applications, corporate roles, high-volume hiring",
    atsCharacteristic: "Single-Column ATS",
    recruiterCharacteristic: "Fast Scanner Friendly",
    thumbnail: { background: "#ffffff", accent: "#1f4f82", layout: "single" }
  },
  {
    name: "Google Style",
    description: "Minimal, bright, product-minded layout with crisp blue accents and practical hierarchy.",
    bestFor: "Tech, product, operations, data, modern startups",
    atsCharacteristic: "ATS Friendly",
    recruiterCharacteristic: "Product Focused",
    thumbnail: { background: "#f8fbff", accent: "#4285f4", layout: "sidebar" }
  },
  {
    name: "Microsoft Professional",
    description: "Polished enterprise layout with calm blue structure and strong document discipline.",
    bestFor: "Enterprise, administration, finance, IT support",
    atsCharacteristic: "ATS Optimized",
    recruiterCharacteristic: "Enterprise Ready",
    thumbnail: { background: "#f5f9ff", accent: "#2563eb", layout: "enterprise" }
  },
  {
    name: "Deloitte Consulting",
    description: "Consulting-style layout with sharp sections, evidence-first bullets, and compact density.",
    bestFor: "Consulting, strategy, business analysis, graduate programs",
    atsCharacteristic: "ATS Friendly",
    recruiterCharacteristic: "Consulting Style",
    thumbnail: { background: "#f8fff8", accent: "#86bc25", layout: "consulting" }
  },
  {
    name: "Creative Premium",
    description: "Premium creative layout with expressive sidebar rhythm while preserving ATS-friendly text.",
    bestFor: "Design, marketing, content, portfolio-led careers",
    atsCharacteristic: "Portfolio Friendly",
    recruiterCharacteristic: "Creative Impact",
    thumbnail: { background: "#fff7ed", accent: "#f97316", layout: "creative" }
  },
  {
    name: "Healthcare Professional",
    description: "Trustworthy clinical layout with calm green accents and credential-forward structure.",
    bestFor: "Healthcare, care work, public service, education support",
    atsCharacteristic: "ATS Friendly",
    recruiterCharacteristic: "Credential Focused",
    thumbnail: { background: "#f4faf7", accent: "#15803d", layout: "healthcare" }
  },
  {
    name: "Graduate Elite",
    description: "Fresh early-career layout that elevates projects, education, skills, and potential.",
    bestFor: "Students, graduates, internships, first jobs",
    atsCharacteristic: "Graduate Friendly",
    recruiterCharacteristic: "Potential Focused",
    thumbnail: { background: "#f6f7ff", accent: "#6366f1", layout: "graduate" }
  },
  {
    name: "Engineering",
    description: "Technical layout with skills architecture, project proof, and structured experience blocks.",
    bestFor: "Engineering, software, data, technical support",
    atsCharacteristic: "Technical ATS",
    recruiterCharacteristic: "Project Focused",
    thumbnail: { background: "#f8fafc", accent: "#0f766e", layout: "technical" }
  },
  {
    name: "International Standard",
    description: "Globally familiar CV layout with conservative spacing and international readability.",
    bestFor: "International applications, NGOs, remote roles, relocation",
    atsCharacteristic: "International Format",
    recruiterCharacteristic: "Conservative Layout",
    thumbnail: { background: "#ffffff", accent: "#334155", layout: "international" }
  }
];

export function normalizeDocumentTemplate(value: unknown): PremiumDocumentTemplate {
  if (typeof value !== "string") return "Modern ATS";
  if (cvTemplateNames.includes(value as PremiumDocumentTemplate)) return value as PremiumDocumentTemplate;
  return legacyTemplateAliases[value] ?? "Modern ATS";
}

export function templateMetadata(name: unknown) {
  const normalized = normalizeDocumentTemplate(name);
  return documentTemplateGallery.find((template) => template.name === normalized) ?? documentTemplateGallery[1];
}
