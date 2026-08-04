export const southAfricaPracticalAccessContext = {
  digitalAccessStates: ["smartphone_only", "shared_device", "computer_access", "stable_internet", "limited_data", "intermittent_connectivity", "email_access", "document_upload_ability", "online_application_ability", "digital_confidence", "assisted_completion_preference"],
  transportStates: ["local_travel_radius", "public_transport_access", "own_transport", "shift_travel_constraints", "relocation_willingness", "remote_work_preference", "province_city_mismatch", "rural_urban_township_context", "transport_cost_concern", "user_reported_safety_concern"],
  rules: [
    "Limited access affects Digital and Practical Access readiness only.",
    "Do not infer poverty.",
    "Do not infer unsafe areas.",
    "Unknown transport data lowers confidence.",
    "Do not claim commute times or costs without verified data."
  ],
  lowLiteracySupport: {
    states: ["reading_comfort", "writing_comfort", "spoken_guidance_preferred", "assisted_completion_preferred"],
    rule: "Low literacy or communication support increases guidance intensity and must not become stigma."
  },
  immediateIncomeContext: {
    influences: ["pathway_ordering", "action_urgency", "support_intensity", "document_speed", "temporary_or_part_time_suitability"],
    prohibitedEffects: ["lower_person_readiness_unfairly", "erase_long_term_goals", "recommend_unsafe_or_unlawful_work", "pressure_user_into_unsuitable_roles"]
  }
};

export const southAfricaFormalInformalEmploymentContext = {
  supportedModes: ["formal_employment", "informal_employment", "community_work", "family_business", "casual_work", "micro_enterprise", "freelance", "self_employment", "temporary_work", "contract_work"],
  evidenceMappings: ["self_reported_informal_work", "customer_evidence", "reference_evidence", "portfolio_or_photo_evidence", "voluntary_transaction_or_business_evidence", "skill_demonstration"],
  rule: "Informal evidence can become structured employability evidence without being falsely described as verified formal employment."
};
