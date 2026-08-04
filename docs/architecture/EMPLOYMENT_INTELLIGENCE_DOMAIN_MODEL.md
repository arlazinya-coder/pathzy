# Employment Intelligence Domain Model

Status: Phase 3A domain reference
Date: 2026-08-04
Primary code: `lib/employment-intelligence/domain/`

## Authoritative objects

- `EmploymentIntelligenceInput`
- `EvidenceRecord`
- `ReadinessDimensionAssessment`
- `OverallReadinessSummary`
- `DetectedBarrier`
- `PathwayRecommendation`
- `SupportIntensityLevel`
- `NextBestAction`
- `CareerPlan`
- `Explanation`
- `CountryEmploymentContext`
- `EmploymentIntelligenceProfile`

## Canonical principles

- Canonical codes are language-independent.
- Unknown is not false.
- Self-reported evidence is valid but not verified.
- Informal work, lived experience, volunteering, and community work may support capability.
- Derived intelligence does not mutate Professional Identity.
- Failed recomputation preserves the last valid profile.

## Persistence notes

Phase 3A defines repository contracts only. A future migration may persist the Employment Intelligence Profile, input snapshot references, engine versions, stale status, and audit metadata. No Phase 3A migration is included.

## Persisted versus computed fields

Persisted fields should include profile id, user id, profile version, engine version, generated timestamp, input snapshot version, country context reference, readiness dimensions, overall readiness, barriers, pathway recommendations, support intensity, next-best-action set, Career Plan, explanations, confidence, missing information, stale status and audit metadata.

Fields that may be computed at read time include presentation labels, localized explanation copy, safe summaries for Home, and consumer-specific display grouping.

Sensitive fields include raw diagnosis answers, practical-access constraints, documentation constraints and internal notes. These must not be duplicated unnecessarily or exposed to downstream documents.

## Stale and recomputation contract

Changes to career goal, current situation, education, experience, skills, work authorisation, location, availability, employment preferences, diagnosis answers, country context or engine version should mark intelligence stale. Theme, harmless UI preferences and non-employment notification preferences should not.

Previous valid intelligence remains available during recomputation. Failed recomputation must not erase the prior profile.

## Multilingual contract

Canonical codes remain language-independent. Interface language, intelligence explanation language, professional document language, Career Coach language, interview-practice language and notification language are presentation layers. Switching language must not recalculate or mutate canonical readiness, barrier, pathway, support-intensity or Career Plan state.

## Support intensity contract

Support intensity describes the level of guidance PATHZY should provide, not a user's ability or worth. It controls interface density, explanation style, Career Coach behavior and escalation conditions.
