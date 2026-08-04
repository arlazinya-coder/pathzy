import type { EmploymentIntelligenceInput } from "../domain/employment-intelligence-input";
import type { EvidenceRecord, ProvenancedValue } from "../domain/evidence";
import { createConfidenceAssessment } from "../engine/calculate-confidence";
import { resolveCountryEmploymentContext } from "../country";
import type { EmploymentDiagnosisResult, EmploymentDiagnosisSession } from "./diagnosis-models";

const timestamp = "2026-08-04T00:00:00.000Z";

function confidence(evidence = 0.55) {
  return createConfidenceAssessment({
    completeness: evidence,
    evidence,
    ruleCertainty: 0.75,
    countryContext: 0.55,
    rationale: ["diagnosis.phase3d.mapper"]
  });
}

function evidenceRecord(id: string, field: string): EvidenceRecord {
  return {
    id,
    subject: "employment_diagnosis",
    evidenceType: "SELF_REPORTED",
    sourceReference: `employment_diagnosis:${field}`,
    supportingField: field,
    confidence: confidence(0.58),
    verifiedStatus: "KNOWN",
    timestamp,
    engineVersion: "3D.mapper"
  };
}

function value<T>(data: T | null, field: string, known = data !== null): ProvenancedValue<T> {
  return {
    value: data,
    provenance: known ? "KNOWN" : "UNKNOWN",
    evidence: known ? [evidenceRecord(`diagnosis-${field}`, field)] : [],
    confidence: confidence(known ? 0.62 : 0.18)
  };
}

function answer(session: EmploymentDiagnosisSession, questionId: string) {
  return session.answers[questionId]?.value ?? null;
}

export function mapDiagnosisToEmploymentIntelligenceInput(args: {
  userId: string;
  professionalIdentity: Record<string, unknown>;
  session: EmploymentDiagnosisSession;
  result: EmploymentDiagnosisResult;
  countryCode?: string | null;
}): EmploymentIntelligenceInput {
  const countryContext = resolveCountryEmploymentContext({ countryCode: args.countryCode ?? String(args.professionalIdentity.country ?? "GENERIC") }).context;
  const identity = args.professionalIdentity;
  return {
    userId: args.userId,
    inputSnapshotVersion: args.session.inputSnapshotVersion,
    countryContext,
    professionalIdentity: {
      currentSituation: value(String(identity.currentSituation ?? identity.current_status ?? identity.employment_status ?? "") || null, "currentSituation"),
      profileCompletionMetadata: value((identity.profileCompletionMetadata as Record<string, unknown>) ?? {}, "profileCompletionMetadata"),
      location: value({ city: identity.city ?? null, country: identity.country ?? null }, "location"),
      nationality: value(String(identity.nationality ?? "") || null, "nationality", false),
      workAuthorisation: value((identity.workAuthorisation as Record<string, unknown>) ?? { status: identity.work_authorization ?? "unknown" }, "workAuthorisation", Boolean(identity.workAuthorisation ?? identity.work_authorization)),
      careerGoal: value(String(identity.careerGoal ?? identity.career_goal ?? "") || null, "careerGoal"),
      summary: value(String(identity.summary ?? identity.professional_summary ?? "") || null, "summary"),
      education: value(Array.isArray(identity.education) ? identity.education : identity.education ? [identity.education] : [], "education"),
      experience: value(Array.isArray(identity.experience) ? identity.experience : [], "experience"),
      skills: value(Array.isArray(identity.skills) ? identity.skills : [], "skills"),
      projects: value(Array.isArray(identity.projects) ? identity.projects : [], "projects"),
      achievements: value(Array.isArray(identity.achievements) ? identity.achievements : [], "achievements"),
      certificates: value(Array.isArray(identity.certificates) ? identity.certificates : [], "certificates"),
      licences: value(Array.isArray(identity.licences) ? identity.licences : [], "licences"),
      languages: value(Array.isArray(identity.languages) ? identity.languages : [], "languages"),
      references: value(Array.isArray(identity.references) ? identity.references : [], "references"),
      portfolio: value(Array.isArray(identity.portfolio) ? identity.portfolio : [], "portfolio"),
      socialProfiles: value(Array.isArray(identity.socialProfiles) ? identity.socialProfiles : [], "socialProfiles"),
      employmentPreferences: value((identity.employmentPreferences as Record<string, unknown>) ?? {}, "employmentPreferences"),
      salaryExpectations: value((identity.salaryExpectations as Record<string, unknown>) ?? {}, "salaryExpectations", false),
      availability: value((identity.availability as Record<string, unknown>) ?? {}, "availability"),
      evidenceMetadata: value({ diagnosisResultVersion: args.result.diagnosisVersion }, "evidenceMetadata")
    },
    employmentDiagnosis: {
      unemploymentDuration: value("", "unemploymentDuration", false),
      applicationActivity: value({ recentActivity: answer(args.session, "job_search_activity_recent") }, "applicationActivity"),
      interviewHistory: value({ recentInterview: answer(args.session, "interview_history_recent") }, "interviewHistory"),
      barriers: value(args.result.majorBarriers.map((barrier) => barrier.code), "barriers"),
      transportAccess: value(String(answer(args.session, "transport_shift_access") ?? ""), "transportAccess"),
      deviceInternetAccess: value(String(answer(args.session, "device_internet_access") ?? ""), "deviceInternetAccess"),
      incomeUrgency: value(String(answer(args.session, "immediate_income_need") ?? ""), "incomeUrgency"),
      careResponsibilities: value(String(answer(args.session, "care_responsibilities") ?? ""), "careResponsibilities"),
      workAuthorisationConstraints: value(String(answer(args.session, "work_authorisation_clarification") ?? ""), "workAuthorisationConstraints"),
      documentationAvailability: value(String(answer(args.session, "documentation_availability") ?? ""), "documentationAvailability"),
      digitalConfidence: value(String(answer(args.session, "device_internet_access") ?? ""), "digitalConfidence"),
      literacyCommunicationComfort: value(String(answer(args.session, "reading_writing_comfort") ?? ""), "literacyCommunicationComfort"),
      preferredWorkType: value(String(answer(args.session, "pathway_preference_signal") ?? ""), "preferredWorkType"),
      mobility: value(String(answer(args.session, "mobility_radius") ?? ""), "mobility"),
      willingnessToLearn: value(String(answer(args.session, "learning_development_willingness") ?? ""), "willingnessToLearn"),
      supportNeeds: value(args.result.supportNeeds, "supportNeeds"),
      userConfidence: value(String(answer(args.session, "confidence_support_need") ?? ""), "userConfidence"),
      immediateGoals: value(args.result.immediateNeeds, "immediateGoals"),
      longTermGoals: value(args.result.preferredPathwaySignals, "longTermGoals")
    },
    opportunityLabourContext: {}
  };
}
