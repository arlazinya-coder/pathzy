import type { QualificationContextRecord } from "../../country-employment-context";

export const southAfricaRecognitionStates = ["NOT_REQUIRED", "RECOGNISED", "RECOGNITION_REQUIRED", "IN_PROGRESS", "NOT_RECOGNISED", "UNKNOWN", "NOT_APPLICABLE"] as const;

export const southAfricaQualificationContexts: QualificationContextRecord[] = [
  { qualificationType: "school_level", nqfLevel: null, institutionType: "school", localQualification: "UNKNOWN", foreignQualification: "UNKNOWN", recognitionStatus: "UNKNOWN", recognitionRequired: "UNKNOWN", verificationEvidenceStatus: "EVIDENCE_REQUIRED", pathwayImplications: ["ENTRY_LEVEL_EMPLOYMENT", "BRIDGING_EDUCATION"], explanationKeys: ["za.qualification.school_level.unknown_mapping"] },
  { qualificationType: "matric_completed", nqfLevel: null, institutionType: "school", localQualification: "UNKNOWN", foreignQualification: false, recognitionStatus: "UNKNOWN", recognitionRequired: "UNKNOWN", verificationEvidenceStatus: "EVIDENCE_REQUIRED", pathwayImplications: ["ENTRY_LEVEL_EMPLOYMENT", "LEARNERSHIP", "BRIDGING_EDUCATION"], explanationKeys: ["za.qualification.matric.evidence_required"] },
  { qualificationType: "matric_incomplete", nqfLevel: null, institutionType: "school", localQualification: "UNKNOWN", foreignQualification: false, recognitionStatus: "NOT_APPLICABLE", recognitionRequired: false, verificationEvidenceStatus: "SELF_REPORTED", pathwayImplications: ["ENTRY_LEVEL_EMPLOYMENT", "SKILLS_FIRST_TRANSITION", "BRIDGING_EDUCATION", "INFORMAL_OR_COMMUNITY_WORK"], explanationKeys: ["za.qualification.non_matric.pathways_remain"] },
  { qualificationType: "tvet", nqfLevel: null, institutionType: "tvet", localQualification: "UNKNOWN", foreignQualification: false, recognitionStatus: "UNKNOWN", recognitionRequired: "UNKNOWN", verificationEvidenceStatus: "EVIDENCE_REQUIRED", pathwayImplications: ["APPRENTICESHIP", "SKILLED_EMPLOYMENT", "SKILLS_FIRST_TRANSITION"], explanationKeys: ["za.qualification.tvet.context"] },
  { qualificationType: "certificate", nqfLevel: null, institutionType: "unknown", localQualification: "UNKNOWN", foreignQualification: "UNKNOWN", recognitionStatus: "UNKNOWN", recognitionRequired: "UNKNOWN", verificationEvidenceStatus: "EVIDENCE_REQUIRED", pathwayImplications: ["LICENCE_OR_CERTIFICATE", "SKILLED_EMPLOYMENT"], explanationKeys: ["za.qualification.certificate.verify"] },
  { qualificationType: "diploma", nqfLevel: null, institutionType: "unknown", localQualification: "UNKNOWN", foreignQualification: "UNKNOWN", recognitionStatus: "UNKNOWN", recognitionRequired: "UNKNOWN", verificationEvidenceStatus: "EVIDENCE_REQUIRED", pathwayImplications: ["GRADUATE_PROGRAMME", "PROFESSIONAL_EMPLOYMENT"], explanationKeys: ["za.qualification.diploma.verify"] },
  { qualificationType: "degree", nqfLevel: null, institutionType: "unknown", localQualification: "UNKNOWN", foreignQualification: "UNKNOWN", recognitionStatus: "UNKNOWN", recognitionRequired: "UNKNOWN", verificationEvidenceStatus: "EVIDENCE_REQUIRED", pathwayImplications: ["GRADUATE_PROGRAMME", "PROFESSIONAL_EMPLOYMENT"], explanationKeys: ["za.qualification.degree.verify"] },
  { qualificationType: "postgraduate", nqfLevel: null, institutionType: "unknown", localQualification: "UNKNOWN", foreignQualification: "UNKNOWN", recognitionStatus: "UNKNOWN", recognitionRequired: "UNKNOWN", verificationEvidenceStatus: "EVIDENCE_REQUIRED", pathwayImplications: ["PROFESSIONAL_EMPLOYMENT", "DIRECT_EMPLOYMENT"], explanationKeys: ["za.qualification.postgraduate.verify"] },
  { qualificationType: "occupational", nqfLevel: null, institutionType: "occupational", localQualification: "UNKNOWN", foreignQualification: "UNKNOWN", recognitionStatus: "UNKNOWN", recognitionRequired: "UNKNOWN", verificationEvidenceStatus: "EVIDENCE_REQUIRED", pathwayImplications: ["APPRENTICESHIP", "SKILLED_EMPLOYMENT", "LICENCE_OR_CERTIFICATE"], explanationKeys: ["za.qualification.occupational.verify"] },
  { qualificationType: "trade", nqfLevel: null, institutionType: "trade", localQualification: "UNKNOWN", foreignQualification: "UNKNOWN", recognitionStatus: "UNKNOWN", recognitionRequired: "UNKNOWN", verificationEvidenceStatus: "EVIDENCE_REQUIRED", pathwayImplications: ["APPRENTICESHIP", "SKILLED_EMPLOYMENT", "LICENCE_OR_CERTIFICATE"], explanationKeys: ["za.qualification.trade.verify"] },
  { qualificationType: "foreign", nqfLevel: null, institutionType: "foreign", localQualification: false, foreignQualification: true, recognitionStatus: "UNKNOWN", recognitionRequired: "UNKNOWN", verificationEvidenceStatus: "EVIDENCE_REQUIRED", pathwayImplications: ["QUALIFICATION_RECOGNITION", "PROFESSIONAL_EMPLOYMENT", "BRIDGING_EDUCATION"], explanationKeys: ["za.qualification.foreign.recognition_unknown"] },
  { qualificationType: "incomplete", nqfLevel: null, institutionType: "unknown", localQualification: "UNKNOWN", foreignQualification: "UNKNOWN", recognitionStatus: "NOT_APPLICABLE", recognitionRequired: false, verificationEvidenceStatus: "SELF_REPORTED", pathwayImplications: ["ENTRY_LEVEL_EMPLOYMENT", "SKILLS_FIRST_TRANSITION", "BRIDGING_EDUCATION"], explanationKeys: ["za.qualification.incomplete.pathways_remain"] }
];

export const southAfricaMatricNonMatricContext = {
  signals: ["matric_completed", "matric_incomplete", "equivalent_school_qualification", "unknown_school_status", "adult_education_need", "skills_first_pathway", "vocational_or_occupational_pathway", "entry_level_pathway", "bridging_pathway"],
  rules: [
    "Missing matric must not block all employment pathways.",
    "Some pathways may depend on matric or equivalent evidence.",
    "Non-matric users retain service, operational, artisan, informal, entrepreneurial, and skills-first routes where supported by evidence."
  ]
};

export const southAfricaTvetTradeContext = {
  relevance: ["tvet_pathway", "occupational_qualification", "trade_pathway", "apprenticeship", "artisan_pathway", "trade_test", "work_based_learning", "recognition_of_prior_learning"],
  eligibilityStates: ["ELIGIBILITY_KNOWN", "ELIGIBILITY_UNCERTAIN", "EVIDENCE_REQUIRED", "PROGRAMME_DATA_UNAVAILABLE", "LOCAL_PATHWAY_POTENTIALLY_RELEVANT"]
};
