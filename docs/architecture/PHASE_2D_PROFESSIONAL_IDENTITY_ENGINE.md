# Phase 2D Professional Identity Engine

Phase 2D connects the guided Professional Identity setup to PATHZY's Foundation architecture without changing document generation, Employment Diagnosis intelligence, Opportunities, Applications, Interview Intelligence, or Coach intelligence.

## User Journey

The locked first-time journey is:

Authentication -> Welcome to PATHZY -> Interface Language Selection -> Professional Document Language Selection -> Career Coach Introduction -> Professional Identity Guided Setup -> Review My Information -> Finish Setup -> Employment Diagnosis -> Personalised Home.

The Professional Identity page now supports the pre-identity orientation stages in the same guided editor surface that handles identity sections. Returning users resume the requested or next unfinished section through centralized route helpers.

## Professional Identity Sections

The guided setup preserves the authoritative 23-section order:

1. Profile
2. Photo
3. Personal Information
4. Location
5. Nationality
6. Work Authorization
7. Career Goal
8. Professional Summary
9. Education
10. Experience
11. Skills
12. Projects
13. Achievements
14. Certificates
15. Licences
16. Languages
17. References
18. Portfolio
19. Social Profiles
20. Preferences
21. Employment Preferences
22. Salary Expectations
23. Availability

These sections remain compatible with the Phase 2A canonical model while saving through current legacy-compatible storage until an approved canonical cutover is complete.

## Save And Resume

Section edits use delayed autosave plus save-on-continue. The active section is stored locally for resume, while confirmed section data is persisted through `/api/professional-profile`. Preferences are saved as a section through the same endpoint so language choices do not become page-local state.

## Language Behaviour

Interface language and professional document language are independent.

- Interface language currently persists through `user_profiles.language` for compatibility.
- Professional document language persists through `discovery_responses.answers.professional_document_language` until a dedicated preference table is approved.
- The authenticated shell exposes a permanent language selector.
- Changing interface language does not regenerate documents and does not silently change document language.

## Review And Finish Setup

Review My Information summarizes required, recommended, and optional Professional Identity sections without exposing raw database field names. Finish Setup validates required sections, records review/setup state in compatibility storage, and routes to Employment Diagnosis. It must not route directly to CV, Cover Letter, Applications, Employment Center, or Home.

## Sync Invalidation

Phase 2D keeps deterministic save/update boundaries. Professional Identity changes may mark downstream work stale in future Sync Engine work, but this phase does not automatically regenerate AI content, documents, matches, or paid outputs.

## Design Foundation

Phase 2D introduces shared PATHZY tokens for ink, navy, red accent, ivory, mist, slate, borders, status colours, radius, shadow, and typography stacks in `app/globals.css`. The phase applies those tokens to the authenticated shell, primary action treatment, form focus states, language selector, and guided Professional Identity surfaces.
