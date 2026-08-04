export const southAfricaRecruitmentConventions = {
  conventionStates: ["COMMON", "SOMETIMES_USED", "ROLE_DEPENDENT", "EMPLOYER_DEPENDENT", "VERIFIED_REQUIREMENT", "UNKNOWN"],
  fields: ["cv_length_context", "photo_inclusion_preferences", "reference_practices", "certificate_or_licence_evidence", "online_applications", "email_applications", "application_forms", "interview_formats", "background_checks", "professional_registration_evidence", "language_expectations"],
  defaultState: "UNKNOWN",
  rules: [
    "Recruitment conventions are not absolute rules.",
    "Photo guidance requires user consent and role/country context.",
    "Employer requirements override generic conventions only when verified from the opportunity."
  ]
};

export const southAfricaSalaryDataContract = {
  currency: "ZAR",
  fields: ["role_family", "job_level", "province_or_region", "annual_monthly_hourly_basis", "gross_net_marker", "source", "effective_date", "sample_size", "confidence", "percentile_bands", "unavailable_state"],
  defaultState: "UNAVAILABLE",
  values: [],
  rule: "The engine must never invent salary estimates."
};
