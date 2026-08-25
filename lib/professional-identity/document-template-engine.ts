import type { ProfessionalPhotoTemplateCapability } from "@/lib/professional-identity/professional-photo";

export type PremiumDocumentTemplate = string;

export type AtsTemplateClassification = "ATS HIGH" | "ATS BALANCED" | "VISUAL / RECRUITER-FIRST";

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
  photoCapability: ProfessionalPhotoTemplateCapability;
};

const noPhoto: ProfessionalPhotoTemplateCapability = { photoMode: "none", supportedAspects: [], fallbackLayout: "text-only-header" };
const optionalPhoto: ProfessionalPhotoTemplateCapability = { photoMode: "optional", supportedAspects: ["portrait", "square"], fallbackLayout: "balanced-header" };
const portraitPhoto: ProfessionalPhotoTemplateCapability = { photoMode: "optional", supportedAspects: ["portrait", "circle-safe"], fallbackLayout: "balanced-header" };
const creativePhoto: ProfessionalPhotoTemplateCapability = { photoMode: "recommended", supportedAspects: ["portrait", "square", "circle-safe"], fallbackLayout: "balanced-header" };

export const MAX_TEMPLATE_VARIANTS_PER_DESIGN = 2;

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
    photoCapability
  };
}

export const documentTemplateGallery: DocumentTemplateMetadata[] = [
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
  "ATS Friendly": "Modern ATS",
  "Modern Blue": "Google Style",
  "Professional Green": "Healthcare Professional",
  "Graduate Fresh": "Graduate Elite",
  "Executive Premium": "Executive Black",
  "Technical Engineer": "Engineering",
  "Signature Professional": "PATHZY Signature Professional"
};

export function normalizeDocumentTemplate(value: unknown): PremiumDocumentTemplate {
  if (typeof value !== "string") return "PATHZY Signature Professional";
  const trimmed = value.trim();
  if (cvTemplateNames.includes(trimmed)) return trimmed;
  return legacyTemplateAliases[trimmed] ?? "PATHZY Signature Professional";
}

export function templateMetadata(name: unknown) {
  const normalized = normalizeDocumentTemplate(name);
  return documentTemplateGallery.find((template) => template.name === normalized) ?? documentTemplateGallery[0];
}
