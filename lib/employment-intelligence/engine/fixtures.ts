import type { EmploymentIntelligenceInput } from "../domain/employment-intelligence-input";
import type { EvidenceRecord, ProvenancedValue } from "../domain/evidence";
import { genericCountryEmploymentContext } from "../domain/country-context";
import { createConfidenceAssessment } from "./calculate-confidence";

const assessedAt = "2026-08-04T00:00:00.000Z";

function confidence(evidence = 0.5) {
  return createConfidenceAssessment({
    completeness: evidence,
    evidence,
    ruleCertainty: 0.7,
    countryContext: 0.3,
    rationale: ["fixture.synthetic"]
  });
}

function evidence(id: string, subject: string, field: string): EvidenceRecord {
  return {
    id,
    subject,
    evidenceType: "SELF_REPORTED",
    sourceReference: `fixture:${id}`,
    supportingField: field,
    confidence: confidence(0.55),
    verifiedStatus: "KNOWN",
    timestamp: assessedAt,
    engineVersion: "3B.fixture"
  };
}

function value<T>(data: T | null, field: string, withEvidence = Boolean(data)): ProvenancedValue<T> {
  return {
    value: data,
    provenance: data === null ? "UNKNOWN" : "KNOWN",
    evidence: withEvidence && data !== null ? [evidence(`ev-${field}`, field, field)] : [],
    confidence: confidence(data === null ? 0.1 : 0.6)
  };
}

function baseInput(name: string, overrides: Partial<EmploymentIntelligenceInput["professionalIdentity"]> = {}, diagnosis: Partial<EmploymentIntelligenceInput["employmentDiagnosis"]> = {}): EmploymentIntelligenceInput {
  return {
    userId: `fixture-${name}`,
    inputSnapshotVersion: `${name}.v1`,
    countryContext: genericCountryEmploymentContext,
    professionalIdentity: {
      currentSituation: value("unemployed", "currentSituation"),
      profileCompletionMetadata: value({ completion: 65 }, "profileCompletionMetadata"),
      location: value({ city: "Generic City", country: "GENERIC" }, "location"),
      nationality: value("not_specified", "nationality", false),
      workAuthorisation: value({ status: "unknown" }, "workAuthorisation", false),
      careerGoal: value("employment", "careerGoal"),
      summary: value("", "summary", false),
      education: value([], "education", false),
      experience: value([], "experience", false),
      skills: value([], "skills", false),
      projects: value([], "projects", false),
      achievements: value([], "achievements", false),
      certificates: value([], "certificates", false),
      licences: value([], "licences", false),
      languages: value([], "languages", false),
      references: value([], "references", false),
      portfolio: value([], "portfolio", false),
      socialProfiles: value([], "socialProfiles", false),
      employmentPreferences: value({ workType: "any" }, "employmentPreferences"),
      salaryExpectations: value({}, "salaryExpectations", false),
      availability: value({ notice: "immediate" }, "availability"),
      evidenceMetadata: value({}, "evidenceMetadata", false),
      ...overrides
    },
    employmentDiagnosis: {
      unemploymentDuration: value("unknown", "unemploymentDuration", false),
      applicationActivity: value({ applications: 0 }, "applicationActivity"),
      interviewHistory: value({ interviews: 0 }, "interviewHistory"),
      barriers: value([], "diagnosisBarriers", false),
      transportAccess: value("unknown", "transportAccess", false),
      deviceInternetAccess: value("unknown", "deviceInternetAccess", false),
      incomeUrgency: value("medium", "incomeUrgency"),
      careResponsibilities: value("none", "careResponsibilities"),
      workAuthorisationConstraints: value("unknown", "workAuthorisationConstraints", false),
      documentationAvailability: value("unknown", "documentationAvailability", false),
      digitalConfidence: value("medium", "digitalConfidence"),
      literacyCommunicationComfort: value("comfortable", "literacyCommunicationComfort"),
      preferredWorkType: value("any", "preferredWorkType"),
      mobility: value("local", "mobility"),
      willingnessToLearn: value("yes", "willingnessToLearn"),
      supportNeeds: value([], "supportNeeds", false),
      userConfidence: value("medium", "userConfidence"),
      immediateGoals: value([], "immediateGoals", false),
      longTermGoals: value([], "longTermGoals", false),
      ...diagnosis
    },
    opportunityLabourContext: {}
  };
}

export const phase3bEmploymentIntelligenceFixtures: Record<string, EmploymentIntelligenceInput> = {
  emptyProfile: baseInput("empty-profile", {
    currentSituation: value<string>(null, "currentSituation", false),
    careerGoal: value<string>(null, "careerGoal", false),
    location: value<Record<string, unknown>>(null, "location", false),
    workAuthorisation: value<Record<string, unknown>>(null, "workAuthorisation", false),
    availability: value<Record<string, unknown>>(null, "availability", false)
  }),
  graduateNoExperience: baseInput("graduate-no-experience", {
    careerGoal: value("graduate analyst", "careerGoal"),
    education: value([{ qualification: "Diploma", field: "Business" }], "education"),
    projects: value([{ title: "Research project", description: "Analysed customer data and presented findings." }], "projects"),
    skills: value(["research", "presentation", "spreadsheet analysis"], "skills")
  }),
  technicalProjects: baseInput("technical-projects", {
    careerGoal: value("software developer", "careerGoal"),
    skills: value(["TypeScript", "cloud deployment", "database design"], "skills"),
    projects: value([{ title: "Inventory app", stack: ["TypeScript", "SQL"], outcome: "Built tracked stock flow." }], "projects"),
    portfolio: value([{ url: "https://example.invalid/portfolio" }], "portfolio")
  }),
  cleanerInformalExperience: baseInput("cleaner-informal-experience", {
    careerGoal: value("cleaner or facility support", "careerGoal"),
    experience: value([{ role: "Cleaner", type: "informal", duties: ["cleaning", "stocking supplies", "opening rooms"] }], "experience"),
    skills: value(["cleaning", "reliability", "customer service"], "skills")
  }),
  securityWorker: baseInput("security-worker", {
    careerGoal: value("security officer", "careerGoal"),
    experience: value([{ role: "Security guard", duties: ["access control", "patrol", "incident reporting"] }], "experience"),
    licences: value([{ name: "Security registration", status: "unknown" }], "licences")
  }),
  domesticWorker: baseInput("domestic-worker", {
    careerGoal: value("domestic worker", "careerGoal"),
    experience: value([{ role: "Domestic worker", duties: ["cleaning", "childcare", "meal preparation"] }], "experience"),
    references: value([{ relationship: "Previous employer" }], "references")
  }),
  retailWorker: baseInput("retail-worker", {
    careerGoal: value("retail assistant", "careerGoal"),
    experience: value([{ role: "Shop assistant", duties: ["cashier", "stock", "customer service"] }], "experience"),
    skills: value(["customer service", "cash handling", "stock control"], "skills")
  }),
  driver: baseInput("driver", {
    careerGoal: value("driver", "careerGoal"),
    experience: value([{ role: "Delivery driver", duties: ["routes", "customer delivery", "vehicle checks"] }], "experience"),
    licences: value([{ name: "Driver licence" }], "licences")
  }),
  administrator: baseInput("administrator", {
    careerGoal: value("administrator", "careerGoal"),
    experience: value([{ role: "Office administrator", duties: ["records", "email", "scheduling", "filing"] }], "experience"),
    skills: value(["records", "communication", "office software"], "skills")
  }),
  technician: baseInput("technician", {
    careerGoal: value("technician", "careerGoal"),
    experience: value([{ role: "Technician", duties: ["equipment maintenance", "fault finding"] }], "experience"),
    certificates: value([{ name: "Technical certificate" }], "certificates")
  }),
  careerChanger: baseInput("career-changer", {
    currentSituation: value("career_change", "currentSituation"),
    careerGoal: value("project coordinator", "careerGoal"),
    experience: value([{ role: "Teacher", duties: ["planning", "communication", "assessment"] }], "experience"),
    skills: value(["planning", "stakeholder communication", "coordination"], "skills")
  }),
  returnToWork: baseInput("return-to-work", {
    currentSituation: value("returning_to_work", "currentSituation"),
    careerGoal: value("office support", "careerGoal"),
    experience: value([{ role: "Receptionist", duties: ["phone", "appointments", "records"] }], "experience")
  }, {
    unemploymentDuration: value("extended period", "unemploymentDuration")
  }),
  limitedInternet: baseInput("limited-internet", {}, {
    deviceInternetAccess: value("limited shared phone and unreliable data", "deviceInternetAccess"),
    digitalConfidence: value("low", "digitalConfidence")
  }),
  transportConstraint: baseInput("transport-constraint", {}, {
    transportAccess: value("limited public transport", "transportAccess")
  }),
  lowLiteracySupport: baseInput("low-literacy-support", {}, {
    literacyCommunicationComfort: value("needs help with reading and writing", "literacyCommunicationComfort"),
    supportNeeds: value(["plain language", "one step at a time"], "supportNeeds")
  }),
  immediateIncomeNeed: baseInput("immediate-income-need", {}, {
    incomeUrgency: value("urgent immediate income", "incomeUrgency")
  }),
  frenchLanguageCandidate: baseInput("french-language-candidate", {
    careerGoal: value("assistant administratif", "careerGoal"),
    summary: value("Candidat francophone avec expérience en administration et communication.", "summary"),
    skills: value(["communication", "organisation", "service client"], "skills"),
    experience: value([{ role: "Assistant administratif", duties: ["dossiers", "accueil", "coordination"] }], "experience"),
    languages: value(["français", "anglais"], "languages")
  }),
  seniorExecutive: baseInput("senior-executive", {
    currentSituation: value("employed", "currentSituation"),
    careerGoal: value("operations executive", "careerGoal"),
    experience: value([{ role: "Operations director", duties: ["strategy", "teams", "delivery", "improving operations"] }], "experience"),
    achievements: value([{ impact: "Led multi-team delivery improvement" }], "achievements"),
    skills: value(["leadership", "strategy", "operations"], "skills")
  })
};
