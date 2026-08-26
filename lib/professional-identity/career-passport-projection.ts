import { appRoutes, routeBuilders } from "@/lib/navigation/routes";
import {
  normalizeProfessionalIdentityCompletionValues,
  type ProfessionalIdentityCompletionValues
} from "@/lib/professional-identity/professional-identity-completion";
import {
  experienceEntryDateLabel,
  selectCanonicalProfessionalIdentityExperiences,
  type ProfessionalIdentityExperienceEntry
} from "@/lib/professional-identity/professional-identity-experience";
import {
  isVaultDocumentType,
  vaultCategoryForDocumentType,
  vaultDocumentSourceForType,
  type VaultDocumentCategory,
} from "@/lib/professional-identity/document-vault";

export type CareerPassportReadinessStatus = "Ready" | "Ready to start" | "In progress" | "Needs strengthening" | "Not started";

export type CareerPassportDocumentSignal = {
  documentType: string;
  status?: string | null;
  category?: VaultDocumentCategory | string | null;
  updatedAt?: string | null;
};

export type CareerPassportProjectionInput = {
  values: ProfessionalIdentityCompletionValues;
  completion?: {
    percentage: number;
    requiredChecks?: Array<{ section: string; label: string; complete: boolean; missingFields?: string[] }>;
  };
  documents?: CareerPassportDocumentSignal[];
  updatedAt?: string | null;
};

export type CareerPassportProjection = {
  snapshot: {
    name: string;
    title: string;
    location: string;
    careerDirection: string;
  };
  going: {
    goal: string;
    primaryFocus: string;
    nearReachRoles: string[];
    longerTermDirection: string;
  };
  readiness: Array<{
    label: string;
    status: CareerPassportReadinessStatus;
    detail: string;
  }>;
  barrier: string;
  offer: {
    coreSkills: string[];
    emptyState: string | null;
  };
  strengths: Array<{
    title: string;
    evidence: string;
  }>;
  evidence: {
    experience: Array<Pick<ProfessionalIdentityExperienceEntry, "role" | "company" | "location" | "startDate" | "endDate"> & { dates: string }>;
    education: string[];
    projects: string[];
    achievements: string[];
    certificates: string[];
    licences: string[];
    portfolio: string[];
  };
  milestones: Array<{
    label: string;
    complete: boolean;
  }>;
  careerFocus: Array<{
    title: string;
    reason: string;
  }>;
  nextBestAction: {
    title: string;
    why: string;
    nextStep: string;
    href: string;
    label: string;
  };
  updatedAt: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function list(value: unknown) {
  const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(/\r?\n|[,;]/) : [];
  const seen = new Set<string>();
  const output: string[] = [];
  for (const item of source) {
    const clean = text(item);
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    output.push(clean);
  }
  return output;
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const clean = text(value);
    if (clean) return clean;
  }
  return "";
}

function titleCase(value: string) {
  return text(value)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function simpleRole(value: string) {
  const clean = text(value);
  if (!clean) return "";
  return clean.length > 70 ? `${clean.slice(0, 67).trim()}...` : clean;
}

function documentSignals(documents: CareerPassportDocumentSignal[] = []) {
  return documents
    .map((document) => {
      const type = isVaultDocumentType(document.documentType) ? document.documentType : null;
      if (!type) return null;
      return {
        documentType: document.documentType,
        type,
        source: vaultDocumentSourceForType(type),
        category: document.category ?? vaultCategoryForDocumentType(type),
        status: document.status ?? "draft",
        updatedAt: document.updatedAt ?? null
      };
    })
    .filter((document): document is NonNullable<typeof document> => Boolean(document));
}

function hasReadyCv(documents: ReturnType<typeof documentSignals>) {
  return documents.some((document) => (document.type === "cv" || document.type === "old_cv") && document.status !== "archived");
}

function hasCoverLetter(documents: ReturnType<typeof documentSignals>) {
  return documents.some((document) => document.type === "cover_letter" && document.status !== "archived");
}

function hasSupportingDocuments(documents: ReturnType<typeof documentSignals>) {
  return documents.some((document) => document.source === "uploaded" && document.status !== "archived");
}

function hasDocumentCategory(documents: ReturnType<typeof documentSignals>, category: VaultDocumentCategory) {
  return documents.some((document) => document.category === category && document.status !== "archived");
}

function readinessStatus(ready: boolean, inProgress: boolean, missingLabel = "Needs strengthening"): CareerPassportReadinessStatus {
  if (ready) return "Ready";
  if (inProgress) return missingLabel as CareerPassportReadinessStatus;
  return "Not started";
}

function selectCoreSkills(values: ProfessionalIdentityCompletionValues, primaryFocus: string) {
  const skills = list(values.skills);
  const focusWords = primaryFocus.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2);
  const ranked = [...skills].sort((a, b) => {
    const aScore = focusWords.some((word) => a.toLowerCase().includes(word)) ? 0 : 1;
    const bScore = focusWords.some((word) => b.toLowerCase().includes(word)) ? 0 : 1;
    return aScore - bScore;
  });
  return ranked.slice(0, 8);
}

function nearReachRoles(values: ProfessionalIdentityCompletionValues, primaryFocus: string) {
  const roles = list(values.preferred_roles).filter((role) => role.toLowerCase() !== primaryFocus.toLowerCase());
  const output = roles.slice(0, 3);
  if (!output.length && primaryFocus) {
    output.push(`Junior ${primaryFocus}`, `${primaryFocus} Assistant`, `${primaryFocus} Support`);
  }
  return output.slice(0, 3);
}

function buildStrengths(values: ProfessionalIdentityCompletionValues, experiences: ProfessionalIdentityExperienceEntry[]) {
  const strengths: CareerPassportProjection["strengths"] = [];
  const skills = list(values.skills);
  const projects = list(values.projects);
  const achievements = list(values.achievements);

  if (skills.some((skill) => /communicat|customer|client|service|support/i.test(skill))) {
    strengths.push({ title: "Communication", evidence: "Your skills show communication, service, or support evidence that can help in employment conversations." });
  }
  if (experiences.length || achievements.length) {
    strengths.push({ title: "Practical experience", evidence: "Your profile includes real experience or achievements PATHZY can use as evidence." });
  }
  if (projects.length) {
    strengths.push({ title: "Initiative", evidence: "Your project evidence shows that you can build, contribute, or complete work beyond a basic profile." });
  }
  if (skills.length >= 4) {
    strengths.push({ title: "Transferable skills", evidence: "You have several skills that may support more than one realistic employment direction." });
  }
  return strengths.slice(0, 4);
}

function buildEvidence(values: ProfessionalIdentityCompletionValues) {
  const experiences = selectCanonicalProfessionalIdentityExperiences(values.experience);
  return {
    experience: experiences.slice(0, 4).map((entry) => ({
      role: entry.role,
      company: entry.company,
      location: entry.location,
      startDate: entry.startDate,
      endDate: entry.endDate,
      dates: experienceEntryDateLabel(entry)
    })),
    education: list(values.education).slice(0, 4),
    projects: list(values.projects).slice(0, 4),
    achievements: list(values.achievements).slice(0, 4),
    certificates: list(values.certificates).slice(0, 4),
    licences: list(values.licences).slice(0, 4),
    portfolio: list([values.portfolio_url, values.website_url, values.github_url, values.behance_url].filter(Boolean)).slice(0, 4)
  };
}

function buildCareerFocus(values: ProfessionalIdentityCompletionValues, primaryFocus: string, skills: string[], experiences: ProfessionalIdentityExperienceEntry[]) {
  const focus: CareerPassportProjection["careerFocus"] = [];
  if (primaryFocus) {
    focus.push({
      title: primaryFocus,
      reason: experiences.length || skills.length ? "Strongest current direction based on your saved goal, skills, and evidence." : "Current direction from your saved career goal."
    });
  }
  for (const role of list(values.preferred_roles)) {
    if (focus.length >= 3) break;
    if (role.toLowerCase() === primaryFocus.toLowerCase()) continue;
    focus.push({ title: role, reason: "A near-reach direction from your saved employment preferences." });
  }
  for (const skill of skills) {
    if (focus.length >= 3) break;
    if (focus.some((item) => item.title.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(item.title.toLowerCase()))) continue;
    focus.push({ title: titleCase(skill), reason: "A possible focus area supported by your current skills." });
  }
  return focus.slice(0, 3);
}

function firstMissingRequired(input: CareerPassportProjectionInput) {
  return input.completion?.requiredChecks?.find((check) => !check.complete) ?? null;
}

function buildNextBestAction(input: CareerPassportProjectionInput, documents: ReturnType<typeof documentSignals>, values: ProfessionalIdentityCompletionValues, primaryFocus: string, evidenceStrengthReady: boolean) {
  const missing = firstMissingRequired(input);
  if (missing) {
    return {
      title: `Complete ${missing.label}.`,
      why: "PATHZY needs this core information before it can guide your employment journey reliably.",
      nextStep: missing.missingFields?.length ? `Add: ${missing.missingFields.join(", ")}.` : "Finish the missing Professional Identity section.",
      href: routeBuilders.professionalIdentitySection(missing.section as never, appRoutes.professionalIdentityCareerPassport),
      label: "Complete this section"
    };
  }
  if (!hasReadyCv(documents)) {
    return {
      title: "Prepare your professional CV.",
      why: "A current CV is one of the main documents you need before applying for opportunities.",
      nextStep: "Create or review your PATHZY CV.",
      href: appRoutes.professionalIdentityCv,
      label: "Open My CV"
    };
  }
  if (!hasSupportingDocuments(documents)) {
    return {
      title: "Add supporting documents.",
      why: "Certificates, references, licences, or portfolio evidence can make your applications stronger.",
      nextStep: "Upload the documents you may need for applications.",
      href: appRoutes.documents,
      label: "Open My Documents"
    };
  }
  if (!evidenceStrengthReady) {
    return {
      title: primaryFocus ? `Strengthen your ${primaryFocus} evidence.` : "Strengthen your employment evidence.",
      why: "Employers need proof that supports your target direction, not only a goal statement.",
      nextStep: "Add a project, achievement, certificate, or experience entry to your Professional Identity.",
      href: routeBuilders.professionalIdentitySection("projects", appRoutes.professionalIdentityCareerPassport),
      label: "Add evidence"
    };
  }
  return {
    title: "Review opportunities that match your direction.",
    why: "Your foundation is ready enough to start comparing real opportunities with your current evidence.",
    nextStep: "Open Opportunities and review jobs that fit your direction.",
    href: appRoutes.opportunities,
    label: "View opportunities"
  };
}

export function buildCareerPassportProjection(input: CareerPassportProjectionInput): CareerPassportProjection {
  const values = normalizeProfessionalIdentityCompletionValues(input.values);
  const documents = documentSignals(input.documents);
  const evidence = buildEvidence(values);
  const experiences = selectCanonicalProfessionalIdentityExperiences(values.experience);
  const name = firstText(values.full_name, "Your name");
  const primaryFocus = simpleRole(firstText(values.career_goal, list(values.preferred_roles)[0], values.current_status));
  const skills = selectCoreSkills(values, primaryFocus);
  const identityReady = input.completion?.requiredChecks?.every((check) => check.complete) ?? false;
  const cvReady = hasReadyCv(documents);
  const supportingReady = hasSupportingDocuments(documents);
  const evidenceStrengthReady = Boolean(experiences.length || evidence.projects.length || evidence.achievements.length || evidence.certificates.length || hasDocumentCategory(documents, "certificates") || hasDocumentCategory(documents, "portfolio"));
  const interviewReady = documents.some((document) => document.documentType === "interview_prep" && document.status !== "archived");
  const targetClarityReady = Boolean(primaryFocus);

  const readiness: CareerPassportProjection["readiness"] = [
    {
      label: "Professional Identity",
      status: identityReady ? "Ready" : "In progress",
      detail: identityReady ? "Core information is complete." : "Some required profile sections still need attention."
    },
    {
      label: "CV",
      status: cvReady ? "Ready" : "Not started",
      detail: cvReady ? "A PATHZY CV or uploaded CV is available." : "Create or upload a CV before applying."
    },
    {
      label: "Supporting documents",
      status: supportingReady ? "In progress" : "Not started",
      detail: supportingReady ? "You have supporting files saved in My Documents." : "Add certificates, references, or other evidence when available."
    },
    {
      label: "Skills evidence",
      status: readinessStatus(evidenceStrengthReady, Boolean(skills.length)),
      detail: evidenceStrengthReady ? "Your profile includes evidence beyond a skill list." : "Add projects, achievements, certificates, or work examples."
    },
    {
      label: "Job search readiness",
      status: identityReady && targetClarityReady && cvReady ? "Ready to start" : "Needs strengthening",
      detail: identityReady && targetClarityReady && cvReady ? "You can start reviewing realistic opportunities." : "PATHZY needs a clear direction and CV before job search is strong."
    },
    {
      label: "Interview preparation",
      status: interviewReady ? "In progress" : "Not started",
      detail: interviewReady ? "Interview preparation exists for an application." : "Prepare once you have a target opportunity or interview."
    }
  ];

  const barrier = !identityReady
    ? "Your Professional Identity still has required information missing. Completing it will make PATHZY guidance more reliable."
    : !primaryFocus
      ? "Your career direction is still being defined. Add a target role so PATHZY can focus your next steps."
      : !cvReady
        ? "You have a direction, but a current CV is not ready yet. Prepare your CV before applying."
        : !evidenceStrengthReady
          ? `You list ${primaryFocus} as your direction, but PATHZY has limited supporting evidence for it. Add projects, achievements, certificates, or experience that prove this direction.`
          : "No major blocker is visible right now. Keep your evidence current as you review opportunities.";

  const nearRoles = nearReachRoles(values, primaryFocus);
  const careerFocus = buildCareerFocus(values, primaryFocus, skills, experiences);

  return {
    snapshot: {
      name,
      title: primaryFocus || "Career direction in progress",
      location: [values.city, values.country].map(text).filter(Boolean).join(", ") || "Location not added yet",
      careerDirection: primaryFocus || "Your career direction is still being defined."
    },
    going: {
      goal: primaryFocus ? `Move toward ${primaryFocus}.` : "Your career goal is still being defined.",
      primaryFocus: primaryFocus || "Not defined yet",
      nearReachRoles: nearRoles.length ? nearRoles : ["Add preferred roles to see near-reach options."],
      longerTermDirection: primaryFocus && nearRoles.length ? `${primaryFocus} -> broader responsibility as your evidence grows` : "PATHZY will suggest a progression once your target role and evidence are clearer."
    },
    readiness,
    barrier,
    offer: {
      coreSkills: skills,
      emptyState: skills.length ? null : "No core skills added yet."
    },
    strengths: buildStrengths(values, experiences),
    evidence,
    milestones: [
      { label: "Professional Identity completed", complete: identityReady },
      { label: "Professional CV created", complete: cvReady },
      { label: "Cover Letter created", complete: hasCoverLetter(documents) },
      { label: "Career direction identified", complete: Boolean(primaryFocus) },
      { label: "Supporting documents added", complete: supportingReady },
      { label: "Evidence strengthened", complete: evidenceStrengthReady }
    ],
    careerFocus,
    nextBestAction: buildNextBestAction(input, documents, values, primaryFocus, evidenceStrengthReady),
    updatedAt: firstText(input.updatedAt, values.professional_photo_asset?.updatedAt, new Date().toISOString())
  };
}
