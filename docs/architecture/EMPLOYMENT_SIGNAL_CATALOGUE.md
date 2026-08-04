# Employment Signal Catalogue

Status: Phase 3B deterministic catalogue.

Signals are extracted in `lib/employment-intelligence/engine/extract-signals.ts`.

## Signal Families

- Identity: `IDENTITY_COMPLETENESS`, `CURRENT_SITUATION_KNOWN`, `LOCATION_KNOWN`
- Career direction: `CAREER_GOAL_PRESENT`, `CAREER_DIRECTION_SPECIFICITY`
- Eligibility: `WORK_AUTHORIZATION_KNOWN`
- Preparation: `SUMMARY_PRESENT`, `APPLICATION_ACTIVITY_KNOWN`, `INTERVIEW_ACTIVITY_KNOWN`
- Evidence: `EDUCATION_PRESENT`, `EXPERIENCE_PRESENT`, `PROJECT_EVIDENCE_PRESENT`, `ACHIEVEMENTS_PRESENT`, `SKILLS_PRESENT`, `CERTIFICATES_PRESENT`, `LICENCES_PRESENT`, `REFERENCES_AVAILABLE`, `PORTFOLIO_PRESENT`
- Access: `TRANSPORT_ACCESS`, `DEVICE_INTERNET_ACCESS`, `DIGITAL_CONFIDENCE`, `MOBILITY`, `CARE_RESPONSIBILITIES`
- Support: `LITERACY_COMMUNICATION_COMFORT`, `SUPPORT_NEEDS`, `WILLINGNESS_TO_LEARN`
- Urgency: `IMMEDIATE_INCOME_URGENCY`, `UNEMPLOYMENT_DURATION_KNOWN`

## Signal Contract

Each signal includes:

- canonical code
- value
- provenance
- confidence
- source references
- missing data
- conflicting data
- sensitivity

Presentation layers must translate display labels. Signal codes remain stable canonical identifiers.
