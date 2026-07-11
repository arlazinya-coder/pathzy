export const coverLetterTones = ["Professional", "Confident", "Warm", "Executive", "Concise"] as const;

export type CoverLetterTone = (typeof coverLetterTones)[number];

export const coverLetterTemplateNames = [
  "Executive Letter",
  "ATS Classic",
  "Modern Professional",
  "Graduate Signature",
  "Technology Letter",
  "Healthcare Professional",
  "Corporate Blue",
  "Creative Letter",
  "International Standard",
  "Minimal Elegance"
] as const;

export type CoverLetterTemplateName = (typeof coverLetterTemplateNames)[number];

export type CoverLetterTemplateMeta = {
  name: CoverLetterTemplateName;
  bestFor: string;
  atsCompatibility: string;
  thumbnail: string;
  accent: string;
  recommendedSignals: string[];
};

export type CoverLetterProfileFacts = {
  fullName: string;
  email: string;
  phone: string;
  linkedIn: string;
  city: string;
  country: string;
  careerGoal: string;
  education: string;
  fieldOfStudy: string;
  experience: string;
  skills: string[];
  projects: string[];
  certifications: string[];
  selectedCareerDirection: string;
};

export type CoverLetterTargetJob = {
  jobTitle: string;
  companyName: string;
  hiringManager: string;
  companyAddress: string;
  jobDescription: string;
  tone: CoverLetterTone;
};

export type EliteCoverLetterData = {
  applicantName: string;
  applicantContact: {
    phone: string;
    email: string;
    linkedIn: string;
    city: string;
    country: string;
  };
  date: string;
  companyName: string;
  hiringManager: string;
  companyAddress: string;
  jobTitle: string;
  greeting: string;
  openingParagraph: string;
  relevanceParagraph: string;
  evidenceParagraph: string;
  companyInterestParagraph: string;
  closingParagraph: string;
  signOff: string;
  applicantSignatureName: string;
  selectedTone: CoverLetterTone;
  selectedTemplate: CoverLetterTemplateName;
  sourceJobDescription: string;
  emphasis: string[];
  missingQualifications: string[];
  generatedAt: string;
  updatedAt: string;
};

export type EliteCoverLetterSavedDocument = {
  id: string;
  title: string;
  data: EliteCoverLetterData;
  templateName: CoverLetterTemplateName;
  updatedAt: string | null;
  lastDownloadedAt: string | null;
};

const templateAccents: Record<CoverLetterTemplateName, string> = {
  "Executive Letter": "#111827",
  "ATS Classic": "#1f2937",
  "Modern Professional": "#315cff",
  "Graduate Signature": "#6d5dfc",
  "Technology Letter": "#0f766e",
  "Healthcare Professional": "#087f8c",
  "Corporate Blue": "#1d4ed8",
  "Creative Letter": "#a855f7",
  "International Standard": "#374151",
  "Minimal Elegance": "#0f172a"
};

// Rule: must not invent employers, years, qualifications, certificates, metrics, licences, or achievements.
export const eliteCoverLetterTemplates: CoverLetterTemplateMeta[] = coverLetterTemplateNames.map((name) => {
  const config: Record<CoverLetterTemplateName, Omit<CoverLetterTemplateMeta, "name" | "accent" | "thumbnail">> = {
    "Executive Letter": { bestFor: "Senior, leadership, consulting, and board-facing roles", atsCompatibility: "Strong", recommendedSignals: ["executive", "manager", "lead", "director", "consulting"] },
    "ATS Classic": { bestFor: "Applicant tracking systems and formal applications", atsCompatibility: "Excellent", recommendedSignals: ["apply", "portal", "formal", "graduate"] },
    "Modern Professional": { bestFor: "Business, operations, customer, and early-career roles", atsCompatibility: "Strong", recommendedSignals: ["operations", "customer", "admin", "professional"] },
    "Graduate Signature": { bestFor: "Students, graduates, internships, and first jobs", atsCompatibility: "Strong", recommendedSignals: ["graduate", "intern", "junior", "entry", "learnership"] },
    "Technology Letter": { bestFor: "IT, data, engineering, product, and digital roles", atsCompatibility: "Strong", recommendedSignals: ["software", "data", "sql", "engineer", "technology", "it"] },
    "Healthcare Professional": { bestFor: "Healthcare, care, wellness, and clinical support roles", atsCompatibility: "Strong", recommendedSignals: ["health", "care", "nurse", "clinical", "patient"] },
    "Corporate Blue": { bestFor: "Finance, corporate, banking, and professional services", atsCompatibility: "Strong", recommendedSignals: ["finance", "bank", "corporate", "analyst"] },
    "Creative Letter": { bestFor: "Design, marketing, content, and creative roles", atsCompatibility: "Good", recommendedSignals: ["design", "creative", "content", "marketing", "brand"] },
    "International Standard": { bestFor: "Global, remote, NGO, and cross-border applications", atsCompatibility: "Excellent", recommendedSignals: ["remote", "international", "global", "ngo"] },
    "Minimal Elegance": { bestFor: "Clean, understated applications across industries", atsCompatibility: "Excellent", recommendedSignals: ["minimal", "general", "assistant"] }
  };
  return {
    name,
    ...config[name],
    accent: templateAccents[name],
    thumbnail: `${name.split(" ").map((word) => word[0]).join("").slice(0, 3)}`
  };
});

function clean(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function cleanMultiline(value: unknown) {
  return typeof value === "string" ? value.replace(/\r/g, "").trim() : "";
}

function unique(values: unknown[], limit = 8) {
  const seen = new Set<string>();
  const next: string[] = [];
  values.flatMap((value) => Array.isArray(value) ? value : String(value ?? "").split(/[,;\n]/)).forEach((value) => {
    const item = clean(value);
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

export function normalizeCoverLetterTemplate(value: unknown): CoverLetterTemplateName {
  const found = coverLetterTemplateNames.find((template) => template.toLowerCase() === clean(value).toLowerCase());
  return found ?? "Modern Professional";
}

export function coverLetterTitle(companyName: string, jobTitle: string) {
  const company = clean(companyName) || "Target Company";
  const role = clean(jobTitle) || "Target Role";
  return `${company} — ${role}`;
}

export function coverLetterFileName(data: EliteCoverLetterData) {
  const stamp = new Date().toISOString().slice(0, 10);
  const safe = (value: string) => (clean(value) || "Cover Letter").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
  return `PATHZY_Cover_Letter_${safe(data.companyName)}_${safe(data.jobTitle)}_${stamp}.pdf`;
}

export function buildCoverLetterProfileFacts(profile: Record<string, unknown> | null, discovery: Record<string, unknown> | null, latestCv: Record<string, unknown> | null): CoverLetterProfileFacts {
  const cvModel = latestCv?.cvModel && typeof latestCv.cvModel === "object" ? latestCv.cvModel as Record<string, unknown> : null;
  return {
    fullName: clean(profile?.full_name ?? cvModel?.fullName),
    email: clean(profile?.email ?? cvModel?.email),
    phone: clean(profile?.phone ?? cvModel?.phone),
    linkedIn: clean(profile?.linkedin_url ?? cvModel?.linkedIn),
    city: clean(profile?.city ?? cvModel?.city),
    country: clean(profile?.country ?? cvModel?.country),
    careerGoal: clean(profile?.career_goal ?? discovery?.preferred_career_direction ?? cvModel?.targetRole),
    education: clean(profile?.highest_qualification ?? profile?.education),
    fieldOfStudy: clean(profile?.field_of_study),
    experience: clean(profile?.current_status ?? profile?.employment_status),
    skills: unique([cvModel?.coreSkills, cvModel?.technicalSkills, cvModel?.professionalSkills, discovery?.skills, discovery?.currentSkills], 10),
    projects: unique([cvModel?.projects, discovery?.projects], 4),
    certifications: unique([cvModel?.certifications, discovery?.certifications], 4),
    selectedCareerDirection: clean(discovery?.preferred_career_direction ?? profile?.career_goal ?? cvModel?.targetRole)
  };
}

export function analyzeJobDescription(target: CoverLetterTargetJob, facts: CoverLetterProfileFacts) {
  const description = cleanMultiline(target.jobDescription);
  const lower = `${target.jobTitle} ${description}`.toLowerCase();
  const responsibilities = [
    /data|sql|excel|analytics|dashboard|report/.test(lower) ? "data, reporting, and evidence-based decision-making" : "",
    /customer|client|support|service/.test(lower) ? "customer support, communication, and service reliability" : "",
    /design|figma|ux|ui|brand|creative/.test(lower) ? "creative problem-solving and user-facing communication" : "",
    /admin|operation|coordinat|organis|office/.test(lower) ? "coordination, organization, and dependable follow-through" : "",
    /health|patient|clinical|care/.test(lower) ? "care, accuracy, empathy, and professional responsibility" : "",
    /software|developer|engineer|technology|it|technical/.test(lower) ? "technical learning, problem-solving, and digital execution" : "",
    /sales|marketing|social|content|growth/.test(lower) ? "clear communication, audience understanding, and commercial awareness" : ""
  ].filter(Boolean);
  const factMatches = [
    ...facts.skills.slice(0, 5).map((skill) => `Skill match: ${skill}`),
    facts.education ? `Education: ${facts.education}${facts.fieldOfStudy ? ` in ${facts.fieldOfStudy}` : ""}` : "",
    facts.careerGoal ? `Career direction: ${facts.careerGoal}` : ""
  ].filter(Boolean);
  const missingQualifications = [
    /degree|diploma|qualification/.test(lower) && !facts.education ? "The job description mentions formal education. Add your qualification if you have one." : "",
    /certificate|certification|licen[cs]e/.test(lower) && !facts.certifications.length ? "The job description mentions certifications. Add only certificates you genuinely hold." : "",
    /experience|years/.test(lower) && !facts.experience ? "The job description may expect experience. PATHZY will avoid claiming years you have not provided." : ""
  ].filter(Boolean);
  return {
    responsibilities: responsibilities.length ? responsibilities.slice(0, 3) : ["reliability, role readiness, and clear communication"],
    factMatches: factMatches.length ? factMatches.slice(0, 6) : ["Your cover letter will stay honest and focus on motivation, learning, and available profile facts."],
    missingQualifications
  };
}

function tonePhrase(tone: CoverLetterTone) {
  if (tone === "Confident") return "confident and focused";
  if (tone === "Warm") return "thoughtful and people-centered";
  if (tone === "Executive") return "strategic and commercially aware";
  if (tone === "Concise") return "clear and direct";
  return "professional and reliable";
}

export function generateEliteCoverLetterData(facts: CoverLetterProfileFacts, target: CoverLetterTargetJob, selectedTemplate: CoverLetterTemplateName): EliteCoverLetterData {
  const now = new Date().toISOString();
  const analysis = analyzeJobDescription(target, facts);
  const applicant = facts.fullName;
  const jobTitle = clean(target.jobTitle) || facts.careerGoal || "the role";
  const companyName = clean(target.companyName) || "your organization";
  const skills = facts.skills.slice(0, 4).join(", ") || "communication, reliability, and fast learning";
  const education = [facts.education, facts.fieldOfStudy].filter(Boolean).join(" in ");
  const roleFocus = analysis.responsibilities[0];
  const evidence = [
    education ? `my education in ${education}` : "",
    facts.skills.length ? `practical strengths in ${skills}` : "",
    facts.selectedCareerDirection ? `my career direction toward ${facts.selectedCareerDirection}` : facts.careerGoal ? `my career direction toward ${facts.careerGoal}` : ""
  ].filter(Boolean).join(", ");

  return {
    applicantName: applicant,
    applicantContact: {
      phone: facts.phone,
      email: facts.email,
      linkedIn: facts.linkedIn,
      city: facts.city,
      country: facts.country
    },
    date: new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" }),
    companyName,
    hiringManager: clean(target.hiringManager),
    companyAddress: cleanMultiline(target.companyAddress),
    jobTitle,
    greeting: clean(target.hiringManager) ? `Dear ${clean(target.hiringManager)},` : "Dear Hiring Manager,",
    openingParagraph: `I am applying for the ${jobTitle} role at ${companyName}. I am interested in this opportunity because it aligns with my career direction and gives me a meaningful chance to contribute with a ${tonePhrase(target.tone)} approach.`,
    relevanceParagraph: `From the role information provided, I understand that the position values ${roleFocus}. This matches the way I am building my professional profile: with clear communication, dependable follow-through, and a focus on doing useful work.`,
    evidenceParagraph: evidence
      ? `My current background gives me a truthful foundation for this application, including ${evidence}. I would bring these strengths honestly while continuing to learn the specific systems, processes, and expectations of the team.`
      : "My direct experience is still developing, so I would bring careful preparation, humility, strong follow-through, and a genuine willingness to learn the role properly.",
    companyInterestParagraph: `What stands out to me about ${companyName} is the opportunity to apply my abilities in a real working environment and grow through meaningful responsibility. I am especially motivated by roles where consistency, learning, and service to the team matter.`,
    closingParagraph: "Thank you for your time and consideration. I would welcome the opportunity to discuss how my background, motivation, and current skills could support your team.",
    signOff: "Kind regards,",
    applicantSignatureName: applicant,
    selectedTone: target.tone,
    selectedTemplate,
    sourceJobDescription: cleanMultiline(target.jobDescription),
    emphasis: analysis.factMatches,
    missingQualifications: analysis.missingQualifications,
    generatedAt: now,
    updatedAt: now
  };
}

export function serializeEliteCoverLetterData(data: EliteCoverLetterData) {
  return [
    data.applicantName,
    [data.applicantContact.phone, data.applicantContact.email, data.applicantContact.linkedIn, data.applicantContact.city, data.applicantContact.country].filter(Boolean).join(" | "),
    data.date,
    data.companyName,
    data.companyAddress,
    data.greeting,
    data.openingParagraph,
    data.relevanceParagraph,
    data.evidenceParagraph,
    data.companyInterestParagraph,
    data.closingParagraph,
    data.signOff,
    data.applicantSignatureName
  ].filter(Boolean).join("\n\n");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char] ?? char));
}

function templateCss(template: CoverLetterTemplateName) {
  const accent = templateAccents[template];
  const isExecutive = template === "Executive Letter";
  const isAts = template === "ATS Classic" || template === "International Standard" || template === "Minimal Elegance";
  const serif = isExecutive ? "Georgia, 'Times New Roman', serif" : "Inter, Arial, sans-serif";
  const headerBorder = isAts ? `border-bottom:1px solid #d6dbe5;` : `border-left:8px solid ${accent}; padding-left:24px;`;
  return `
    .elite-letter{width:794px;min-height:1123px;background:#fff;color:#111827;font-family:${serif};padding:${isAts ? "58px 64px" : "64px 70px"};box-sizing:border-box;box-shadow:0 28px 80px rgba(0,0,0,.32)}
    .letter-header{${headerBorder}padding-bottom:22px;margin-bottom:34px}
    .letter-name{font-size:${isExecutive ? "34px" : "31px"};line-height:1.05;font-weight:800;letter-spacing:0;color:${isAts ? "#111827" : accent};margin:0}
    .letter-role{font-size:13px;text-transform:uppercase;letter-spacing:.16em;color:#4b5563;margin-top:9px;font-weight:800}
    .letter-contact{font-size:12px;line-height:1.55;color:#4b5563;margin-top:14px;display:flex;flex-wrap:wrap;gap:7px 14px}
    .letter-meta{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin:0 0 30px;font-size:13px;line-height:1.65;color:#374151}
    .letter-content{font-size:14.5px;line-height:${isExecutive ? "1.72" : "1.68"};color:#1f2937}
    .letter-content p{margin:0 0 ${isAts ? "17px" : "18px"}}
    .letter-signature{margin-top:30px;color:#111827;font-weight:700}
    .letter-accent{height:4px;width:88px;background:${accent};margin:0 0 26px}
    @media(max-width:900px){.elite-letter{width:100%;min-height:auto;padding:42px 30px}.letter-meta{grid-template-columns:1fr}.letter-name{font-size:27px}}
  `;
}

export function renderEliteCoverLetterHtml(data: EliteCoverLetterData) {
  const contact = [data.applicantContact.phone, data.applicantContact.email, data.applicantContact.linkedIn, data.applicantContact.city, data.applicantContact.country].map(clean).filter(Boolean);
  const companyLines = [data.companyName, data.companyAddress].filter(Boolean).join("<br/>");
  const paragraphs = [data.openingParagraph, data.relevanceParagraph, data.evidenceParagraph, data.companyInterestParagraph, data.closingParagraph].map(clean).filter(Boolean);
  return `
    <style>${templateCss(data.selectedTemplate)}</style>
    <article class="elite-letter">
      <header class="letter-header">
        <h1 class="letter-name">${escapeHtml(data.applicantName || "Applicant")}</h1>
        <div class="letter-role">${escapeHtml(data.jobTitle)}</div>
        <div class="letter-contact">${contact.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      </header>
      <div class="letter-accent"></div>
      <section class="letter-meta">
        <div>${escapeHtml(data.date)}</div>
        <div>${companyLines}</div>
      </section>
      <section class="letter-content">
        <p>${escapeHtml(data.greeting)}</p>
        ${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        <p class="letter-signature">${escapeHtml(data.signOff)}<br/>${escapeHtml(data.applicantSignatureName || data.applicantName)}</p>
      </section>
    </article>
  `;
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

export function eliteCoverLetterPdfDocument(data: EliteCoverLetterData) {
  const lines: string[] = [];
  const paragraphs = [
    data.applicantName,
    [data.applicantContact.phone, data.applicantContact.email, data.applicantContact.linkedIn, data.applicantContact.city, data.applicantContact.country].filter(Boolean).join(" | "),
    "",
    data.date,
    data.companyName,
    data.companyAddress,
    "",
    data.greeting,
    data.openingParagraph,
    data.relevanceParagraph,
    data.evidenceParagraph,
    data.companyInterestParagraph,
    data.closingParagraph,
    "",
    data.signOff,
    data.applicantSignatureName || data.applicantName
  ];
  paragraphs.forEach((paragraph) => {
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
    const content = commands.join("\n");
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
    !facts.skills.length ? "Add a few real skills from your profile so the letter feels specific." : "",
    data && !data.sourceJobDescription ? "Paste a job description to make the letter more targeted." : "",
    data && data.missingQualifications.length ? data.missingQualifications[0] : ""
  ].filter(Boolean);
  return items.length ? items : ["Your letter has enough core information. Tailor one paragraph to the exact job before sending."];
}
