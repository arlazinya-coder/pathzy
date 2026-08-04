export const EMPLOYMENT_DIAGNOSIS_ENGINE_VERSION_3D = "3D.1";
export const EMPLOYMENT_DIAGNOSIS_RESULT_VERSION_3D = "3D.result.v1";
export const EMPLOYMENT_DIAGNOSIS_SCHEMA_VERSION_3D = "3D.schema.v1";

export const employmentDiagnosisVersionRules = [
  "question_taxonomy_changes",
  "branching_rule_changes",
  "result_mapping_changes",
  "country_context_dependency_changes",
  "identity_suggestion_contract_changes"
] as const;
