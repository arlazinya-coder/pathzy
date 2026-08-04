import type { EmploymentIntelligenceInput } from "../../../domain/employment-intelligence-input";
import type { EvidenceRecord, ProvenancedValue } from "../../../domain/evidence";
import { buildSouthAfricaEmploymentContext } from "./south-africa-context";
import { createConfidenceAssessment } from "../../../engine/calculate-confidence";

const assessedAt = "2026-08-04T00:00:00.000Z";
const zaContext = buildSouthAfricaEmploymentContext({ countryCode: "ZA", regionCode: "GP", asOfDate: assessedAt }).context;

function confidence(evidence = 0.55) {
  return createConfidenceAssessment({ completeness: evidence, evidence, ruleCertainty: 0.72, countryContext: 0.62, rationale: ["za.fixture.synthetic"] });
}

function evidence(id: string, field: string): EvidenceRecord {
  return {
    id,
    subject: field,
    evidenceType: "SELF_REPORTED",
    sourceReference: `za-fixture:${id}`,
    supportingField: field,
    confidence: confidence(),
    verifiedStatus: "KNOWN",
    timestamp: assessedAt,
    engineVersion: "3C.fixture"
  };
}

function value<T>(data: T | null, field: string, withEvidence = Boolean(data)): ProvenancedValue<T> {
  return {
    value: data,
    provenance: data === null ? "UNKNOWN" : "KNOWN",
    evidence: withEvidence && data !== null ? [evidence(`ev-${field}`, field)] : [],
    confidence: confidence(data === null ? 0.1 : 0.6)
  };
}

function baseZaInput(name: string, regionCode = "GP", overrides: Partial<EmploymentIntelligenceInput["professionalIdentity"]> = {}, diagnosis: Partial<EmploymentIntelligenceInput["employmentDiagnosis"]> = {}): EmploymentIntelligenceInput {
  return {
    userId: `za-fixture-${name}`,
    inputSnapshotVersion: `za-${name}.v1`,
    countryContext: buildSouthAfricaEmploymentContext({ countryCode: "ZA", regionCode, asOfDate: assessedAt }).context,
    professionalIdentity: {
      currentSituation: value("unemployed", "currentSituation"),
      profileCompletionMetadata: value({ completion: 70 }, "profileCompletionMetadata"),
      location: value({ countryCode: "ZA", provinceCode: regionCode }, "location"),
      nationality: value("not_used_for_authorisation", "nationality", false),
      workAuthorisation: value({ status: "UNKNOWN", verified: false }, "workAuthorisation", false),
      careerGoal: value("employment", "careerGoal"),
      summary: value("", "summary", false),
      education: value([], "education", false),
      experience: value([], "experience", false),
      skills: value([], "skills", false),
      projects: value([], "projects", false),
      achievements: value([], "achievements", false),
      certificates: value([], "certificates", false),
      licences: value([], "licences", false),
      languages: value(["English"], "languages"),
      references: value([], "references", false),
      portfolio: value([], "portfolio", false),
      socialProfiles: value([], "socialProfiles", false),
      employmentPreferences: value({ countryCode: "ZA" }, "employmentPreferences"),
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

export const phase3cSouthAfricaEmploymentFixtures: Record<string, EmploymentIntelligenceInput> = {
  gautengGraduateIctNoExperience: baseZaInput("gauteng-graduate-ict", "GP", {
    careerGoal: value("ICT graduate role", "careerGoal"),
    education: value([{ type: "degree", field: "ICT", localQualification: true }], "education"),
    projects: value([{ title: "Student systems project", stack: ["JavaScript", "database"] }], "projects"),
    skills: value(["software support", "databases", "communication"], "skills")
  }),
  foreignQualifiedProfessionalRecognitionUnknown: baseZaInput("foreign-qualified-professional", "WC", {
    careerGoal: value("professional role", "careerGoal"),
    education: value([{ type: "foreign", field: "engineering", recognitionStatus: "UNKNOWN" }], "education"),
    experience: value([{ role: "Engineer", duties: ["design", "project coordination"] }], "experience")
  }),
  cleanerInformalReference: baseZaInput("cleaner-informal-reference", "KZN", {
    careerGoal: value("cleaner", "careerGoal"),
    experience: value([{ role: "Cleaner", type: "informal", duties: ["cleaning", "hygiene standards"] }], "experience"),
    references: value([{ type: "informal", relationship: "household reference" }], "references"),
    skills: value(["cleaning", "reliability", "time management"], "skills")
  }),
  securityRegistrationUnknown: baseZaInput("security-registration-unknown", "GP", {
    careerGoal: value("security officer", "careerGoal"),
    experience: value([{ role: "Security assistant", duties: ["patrol", "access control"] }], "experience"),
    licences: value([{ name: "security registration", status: "UNKNOWN" }], "licences")
  }),
  retailCashHandling: baseZaInput("retail-cash-handling", "EC", {
    careerGoal: value("retail assistant", "careerGoal"),
    experience: value([{ role: "Cashier", duties: ["cash handling", "stock handling", "customer service"] }], "experience"),
    skills: value(["cash handling", "customer service"], "skills")
  }),
  artisanTradeCandidate: baseZaInput("artisan-trade-candidate", "FS", {
    careerGoal: value("artisan pathway", "careerGoal"),
    education: value([{ type: "trade", status: "in_progress" }], "education"),
    skills: value(["mechanical repair", "tools", "safety"], "skills")
  }),
  ruralTransportLimitations: baseZaInput("rural-transport-limitations", "LP", {}, {
    transportAccess: value("limited rural public transport", "transportAccess"),
    mobility: value("local only", "mobility")
  }),
  smartphoneOnlyLimitedData: baseZaInput("smartphone-only-limited-data", "NW", {}, {
    deviceInternetAccess: value("smartphone only with limited data", "deviceInternetAccess"),
    digitalConfidence: value("medium", "digitalConfidence")
  }),
  longTermUnemployedImmediateIncome: baseZaInput("long-term-unemployed-immediate-income", "MP", {}, {
    unemploymentDuration: value("more than 12 months", "unemploymentDuration"),
    incomeUrgency: value("urgent immediate income", "incomeUrgency")
  }),
  returningCaregiver: baseZaInput("returning-caregiver", "NC", {
    currentSituation: value("returning_to_work", "currentSituation"),
    experience: value([{ role: "Office support", duties: ["records", "communication"] }], "experience")
  }, {
    careResponsibilities: value("care responsibilities affect hours", "careResponsibilities")
  }),
  technicalProjectsCertificates: baseZaInput("technical-projects-certificates", "GP", {
    careerGoal: value("IT support technician", "careerGoal"),
    projects: value([{ title: "Home network setup", stack: ["networking", "hardware"] }], "projects"),
    certificates: value([{ name: "Technical certificate" }], "certificates"),
    skills: value(["IT support", "troubleshooting", "customer service"], "skills")
  }),
  professionalRegistrationEvidence: baseZaInput("professional-registration-evidence", "WC", {
    careerGoal: value("healthcare professional", "careerGoal"),
    education: value([{ type: "degree", field: "healthcare" }], "education"),
    certificates: value([{ name: "registration evidence", status: "UNKNOWN" }], "certificates")
  }),
  nonMatricSkillsFirst: baseZaInput("non-matric-skills-first", "EC", {
    careerGoal: value("warehouse worker", "careerGoal"),
    education: value([{ type: "matric_incomplete" }], "education"),
    experience: value([{ role: "Warehouse helper", duties: ["packing", "stock movement"] }], "experience"),
    skills: value(["stock handling", "reliability"], "skills")
  }),
  tvetOccupationalPathway: baseZaInput("tvet-occupational-pathway", "FS", {
    careerGoal: value("technician", "careerGoal"),
    education: value([{ type: "tvet", field: "technical" }], "education"),
    skills: value(["equipment maintenance"], "skills")
  }),
  entrepreneurMicroEnterprise: baseZaInput("entrepreneur-micro-enterprise", "KZN", {
    careerGoal: value("micro enterprise owner", "careerGoal"),
    experience: value([{ role: "Family business helper", duties: ["sales", "stock", "customers"] }], "experience"),
    employmentPreferences: value({ workType: "self-employment", countryCode: "ZA" }, "employmentPreferences")
  }),
  unknownWorkAuthorisation: baseZaInput("unknown-work-authorisation", "GP", {
    workAuthorisation: value({ status: "UNKNOWN", verified: false }, "workAuthorisation", false)
  }),
  provinceRelocation: baseZaInput("province-relocation", "EC", {
    careerGoal: value("administrator", "careerGoal"),
    experience: value([{ role: "Administrator", duties: ["records", "email"] }], "experience")
  }, {
    mobility: value("willing to relocate to another province", "mobility")
  }),
  strongInformalNoFormalReferences: baseZaInput("strong-informal-no-formal-references", "LP", {
    careerGoal: value("service role", "careerGoal"),
    experience: value([{ role: "Informal service worker", duties: ["customers", "cleaning", "stock"] }], "experience"),
    skills: value(["customer service", "cleaning", "stock handling"], "skills"),
    references: value([], "references", false)
  })
};

export const defaultSouthAfricaFixtureContext = zaContext;
