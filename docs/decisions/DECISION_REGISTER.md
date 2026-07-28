# PATHZY Decision Register

Status: Active
Created: 2026-07-28
Evidence:
- `docs/audits/CURRENT_STATE_AUDIT.md`
- `docs/audits/ROUTE_AND_FLOW_MAP.md`
- `docs/audits/RISK_REGISTER.md`
- `docs/constitution/PATHZY_PRODUCT_EMPLOYMENT_CONSTITUTION.md`

Each decision uses the same format:

- Decision ID
- Date
- Title
- Status
- Context
- Final decision
- Rejected alternatives
- Reason
- Affected areas
- Migration implications
- Lock status
- Review trigger

## DEC-001

Decision ID: DEC-001
Date: 2026-07-28
Title: Professional Identity-first onboarding
Status: Accepted
Context: PATHZY must understand the user before routing them into documents, applications, or generic dashboards.
Final decision: The user journey starts with Authentication, preferred interface language, Professional Identity guided setup, Review My Information, Finish Setup, Employment Diagnosis, Personalised Home, then PATHZY ecosystem.
Rejected alternatives: CV-first onboarding; direct Cover Letter start; direct Application Tracking start; generic dashboard before the user is understood.
Reason: Professional Identity is the source of truth and must exist before reliable documents, matching, or application preparation.
Affected areas: Auth, onboarding, Professional Identity, redirects, Home, Employment Center.
Migration implications: Legacy routes may redirect to the correct Professional Identity or Home state while compatibility remains.
Lock status: Locked.
Review trigger: Only revisit if the constitution changes the source-of-truth model.

## DEC-002

Decision ID: DEC-002
Date: 2026-07-28
Title: Rejection of CV-first onboarding
Status: Accepted
Context: Earlier product work created strong CV features, but PATHZY is an Employment Operating System.
Final decision: Build My CV must not be the first required user journey.
Rejected alternatives: CV creation as the primary initial path; uploaded CV as the initial authoritative profile.
Reason: CVs are outputs of Professional Identity, not the system foundation.
Affected areas: Landing, signup, onboarding, Professional Identity, CV Studio.
Migration implications: Existing CV routes remain available after the user enters the ecosystem.
Lock status: Locked.
Review trigger: Review only if Professional Identity is no longer the source of truth.

## DEC-003

Decision ID: DEC-003
Date: 2026-07-28
Title: Professional Identity as single source of truth
Status: Accepted
Context: Phase 0 found `user_profiles`, `professional_identity`, canonical tables, legacy document tables, `user_documents`, and `professional_documents` active in different areas.
Final decision: Professional Identity and canonical profile services are the authoritative identity layer.
Rejected alternatives: Separate profiles for CV, Cover Letter, LinkedIn, matching, applications, interview prep, and Coach.
Reason: Separate profiles create stale data, duplicate edits, inconsistent matches, and user confusion.
Affected areas: Profile, documents, job intelligence, applications, interviews, analytics, Coach.
Migration implications: Compatibility adapters may bridge legacy tables until a safe migration is completed.
Lock status: Locked.
Review trigger: Review when canonical profile consolidation is designed.

## DEC-004

Decision ID: DEC-004
Date: 2026-07-28
Title: Rejection of separate profiles for each tool
Status: Accepted
Context: Multiple document and profile tables exist for historical reasons.
Final decision: New product logic must not create independent per-tool profiles.
Rejected alternatives: CV profile, cover-letter profile, LinkedIn profile, and interview profile as separate sources.
Reason: Tools should render, adapt, or tailor Professional Identity, not replace it.
Affected areas: Document engine, Professional Identity, application packages, AI generation.
Migration implications: Legacy document tables must be classified as compatibility or migrated.
Lock status: Locked.
Review trigger: Review if a tool requires data that cannot fit Professional Identity.

## DEC-005

Decision ID: DEC-005
Date: 2026-07-28
Title: Employment Diagnosis before Personalised Home
Status: Accepted
Context: Home is only useful when PATHZY understands the user's readiness and next step.
Final decision: Employment Diagnosis comes before Personalised Home in the locked journey.
Rejected alternatives: Send the user directly to Home after signup; show generic dashboard cards before diagnosis.
Reason: Diagnosis explains what is complete, missing, risky, and recommended.
Affected areas: Onboarding, diagnosis, Home, next-action engine.
Migration implications: Existing Home remains but must use diagnosis and readiness data as it matures.
Lock status: Locked.
Review trigger: Review when diagnosis data model changes.

## DEC-006

Decision ID: DEC-006
Date: 2026-07-28
Title: Seven-pillar product architecture
Status: Accepted
Context: PATHZY contains many features that need product boundaries.
Final decision: PATHZY V1 is organised into Professional Identity, Career Intelligence, Employment Intelligence, Employment Center, Opportunities, Success Center, and Career Growth.
Rejected alternatives: Feature list navigation without domain boundaries; CV, jobs, applications, and coach as unrelated products.
Reason: Pillars clarify ownership, reduce duplication, and keep the employment journey coherent.
Affected areas: Navigation, architecture, docs, planning, future implementation.
Migration implications: Existing modules should be mapped to one pillar before refactoring.
Lock status: Locked.
Review trigger: Review only during major product architecture revision.

## DEC-007

Decision ID: DEC-007
Date: 2026-07-28
Title: Intelligence-first architecture
Status: Accepted
Context: PATHZY's value depends on understanding identity, jobs, documents, applications, and readiness.
Final decision: Intelligence features must use structured inputs, evidence, explainability, and safe output boundaries.
Rejected alternatives: Raw text generation pasted into pages; opaque recommendations; prompt-only architecture.
Reason: Employment guidance affects real decisions and must be trustworthy.
Affected areas: AI services, job intelligence, document generation, Coach, interview prep, analytics.
Migration implications: Existing AI flows should migrate toward structured contracts.
Lock status: Locked.
Review trigger: Review when new AI providers or high-impact automation are introduced.

## DEC-008

Decision ID: DEC-008
Date: 2026-07-28
Title: Shared engines instead of duplicated page logic
Status: Accepted
Context: Phase 0 found route and data logic in multiple files.
Final decision: Use shared engines and services for routing, documents, job intelligence, applications, access, and translations.
Rejected alternatives: Rebuild similar logic inside each page or component.
Reason: Shared engines reduce drift, regressions, and inconsistent user experiences.
Affected areas: Components, lib services, routes, tests.
Migration implications: Existing page logic should be wrapped or moved incrementally.
Lock status: Locked.
Review trigger: Review when a shared engine blocks a proven product requirement.

## DEC-009

Decision ID: DEC-009
Date: 2026-07-28
Title: System-level routing fixes instead of individual button patches
Status: Accepted
Context: Navigation defects included Continue and Employment Center routing concerns.
Final decision: Route defects must be fixed through central route and next-action logic when possible.
Rejected alternatives: Patch individual buttons with hardcoded strings.
Reason: One CTA must have one intended destination, and future route changes should not require hunting through pages.
Affected areas: `lib/navigation/routes.ts`, `lib/navigation/redirects.ts`, `lib/progress/next-action-engine.ts`, UI CTAs.
Migration implications: Literal internal paths should move to route helpers over time.
Lock status: Locked.
Review trigger: Review when route ownership changes.

## DEC-010

Decision ID: DEC-010
Date: 2026-07-28
Title: Explainable matching instead of unexplained AI scores
Status: Accepted
Context: Users need to understand why a job is suitable or risky.
Final decision: Job matching must show requirements, evidence, gaps, uncertainty, risks, and next steps.
Rejected alternatives: Return only a percentage score or generic "good match" statement.
Reason: Employment decisions require trust and transparency.
Affected areas: Job intelligence, match engine, targeted CV handoff, Coach, analytics.
Migration implications: Existing match score displays must be paired with explanation.
Lock status: Locked.
Review trigger: Review when scoring methodology becomes formalised.

## DEC-011

Decision ID: DEC-011
Date: 2026-07-28
Title: Human approval before applying for a job
Status: Accepted
Context: Applications and messages affect real employment outcomes.
Final decision: PATHZY may prepare application packages, drafts, and recommendations, but user approval is required before applying or sending.
Rejected alternatives: Silent auto-apply; automatic recruiter outreach; automatic follow-up sending.
Reason: The user must remain in control of high-impact actions.
Affected areas: Applications, follow-up, notifications, external integrations, AI.
Migration implications: Future integrations must include approval records.
Lock status: Locked.
Review trigger: Review before any external application or email integration launches.

## DEC-012

Decision ID: DEC-012
Date: 2026-07-28
Title: Multilingual-from-day-one architecture
Status: Accepted
Context: Phase 0 found partial English/French translation modules but no complete i18n framework.
Final decision: New product flows must be designed for multilingual expansion from the beginning.
Rejected alternatives: English-first product logic with translations retrofitted later.
Reason: Language affects onboarding, documents, interviews, notifications, and Coach behaviour.
Affected areas: UI copy, documents, Coach, interviews, notifications, job intelligence.
Migration implications: Existing hardcoded copy should be replaced incrementally.
Lock status: Locked.
Review trigger: Review when full i18n framework is selected.

## DEC-013

Decision ID: DEC-013
Date: 2026-07-28
Title: Separate language preference layers
Status: Accepted
Context: A user may want the interface, documents, Coach, interview practice, and notifications in different languages.
Final decision: PATHZY must distinguish interface language, Coach conversation language, professional document language, interview-practice language, and notification/email language.
Rejected alternatives: One global language setting controlling every output silently.
Reason: Job applications often require a document language different from the user's interface language.
Affected areas: Professional Identity, documents, Coach, interviews, notifications.
Migration implications: Professional Identity setup must ask document language separately.
Lock status: Locked.
Review trigger: Review when language preferences are implemented in the database.

## DEC-014

Decision ID: DEC-014
Date: 2026-07-28
Title: Premium international CV and cover-letter quality
Status: Accepted
Context: PATHZY must compete with professional document platforms and career coaches.
Final decision: CV and Cover Letter output must be premium, recruiter-ready, ATS-aware, and internationally credible.
Rejected alternatives: Plain generated text; generic templates; preview/export mismatch.
Reason: Documents are high-trust employment artifacts.
Affected areas: CV Studio, Cover Letter Studio, document engine, PDF export, templates.
Migration implications: Template engines must separate identity data from presentation.
Lock status: Locked.
Review trigger: Review when introducing new document families.

## DEC-015

Decision ID: DEC-015
Date: 2026-07-28
Title: Template switching without data loss
Status: Accepted
Context: Users may create multiple design versions from one content source.
Final decision: Template choice changes presentation only and must never destroy content.
Rejected alternatives: Store separate duplicated user content for every template; overwrite data during template switching.
Reason: Identity data must remain stable while designs change.
Affected areas: CV Studio, Cover Letter Studio, document versions, PDF export.
Migration implications: Version metadata and content source links must remain clear.
Lock status: Locked.
Review trigger: Review when changing document-version architecture.

## DEC-016

Decision ID: DEC-016
Date: 2026-07-28
Title: Free core employment-readiness journey
Status: Accepted
Context: PATHZY must demonstrate value before asking for upgrade.
Final decision: Free users should access the core employment-readiness journey.
Rejected alternatives: Block Professional Identity, diagnosis, Home, basic previews, or early preparation behind payment.
Reason: Users need to trust PATHZY before paying.
Affected areas: Access, billing, Professional Identity, Home, documents, opportunities.
Migration implications: Entitlements should gate premium actions, not route implementations.
Lock status: Locked.
Review trigger: Review when final pricing is confirmed.

## DEC-017

Decision ID: DEC-017
Date: 2026-07-28
Title: Value demonstrated before upgrade
Status: Accepted
Context: Monetisation must support trust, not frustration.
Final decision: Show value first, then offer Pro features for acceleration, premium templates, advanced intelligence, greater tailoring, analytics, and automation.
Rejected alternatives: Early blocking paywall; upgrade prompts before product value is clear.
Reason: PATHZY serves people seeking employment and must avoid unnecessary friction.
Affected areas: Billing, entitlements, document downloads, premium AI, templates.
Migration implications: Premium gates should call one shared access decision service.
Lock status: Locked.
Review trigger: Review during commercial pricing design.

## DEC-018

Decision ID: DEC-018
Date: 2026-07-28
Title: Rejection of an early blocking paywall
Status: Accepted
Context: Payment must not interrupt signup, Professional Identity, diagnosis, Home, or core previews.
Final decision: Do not route users to billing merely because setup is incomplete.
Rejected alternatives: Founder Premium or billing intercept before the user reaches core value.
Reason: The core employment-readiness journey must stay accessible.
Affected areas: Auth, onboarding, Professional Identity, Billing, middleware, entitlements.
Migration implications: Existing founder-premium loops must remain removed or centrally controlled.
Lock status: Locked.
Review trigger: Review only with final commercial strategy.

## DEC-019

Decision ID: DEC-019
Date: 2026-07-28
Title: Pro template previews before payment
Status: Accepted
Context: Users should understand premium document value before upgrading.
Final decision: Users may preview premium templates where technically safe, while premium actions such as download or export can remain gated.
Rejected alternatives: Hide all premium templates until payment; label every button with "(Premium)".
Reason: Value-before-paywall increases trust and product clarity.
Affected areas: CV templates, Cover Letter templates, billing, entitlement messaging.
Migration implications: Template availability and export permission should be separate checks.
Lock status: Locked.
Review trigger: Review when template licensing or commercial packaging changes.

## DEC-020

Decision ID: DEC-020
Date: 2026-07-28
Title: Git history and current working tree as technical source of truth
Status: Accepted
Context: PATHZY has valuable local work and recovery branches.
Final decision: Local Git history and the current working tree are the technical source of truth during active development.
Rejected alternatives: Rebuild from memory; reset to remote; overwrite dirty work.
Reason: Accepted features and recovery points may exist locally before deployment.
Affected areas: All development workflow.
Migration implications: Phase work must inspect status and preserve dirty files before changes.
Lock status: Locked.
Review trigger: Review if repository ownership or branching model changes.

## DEC-021

Decision ID: DEC-021
Date: 2026-07-28
Title: Backup branches before risky structural changes
Status: Accepted
Context: Phase 0 created `backup/pathzy-safety-2026-07-28-v1-foundation`.
Final decision: Risky structural work requires a backup branch or recovery point before implementation.
Rejected alternatives: Modify architecture without a recovery reference.
Reason: PATHZY has a long history of valuable feature work that must not be lost.
Affected areas: Git workflow, migrations, routing, document engine, Professional Identity.
Migration implications: Future structural phases must report the backup branch.
Lock status: Locked.
Review trigger: Review when automated release process is adopted.

## DEC-022

Decision ID: DEC-022
Date: 2026-07-28
Title: Security review before public launch
Status: Accepted
Context: PATHZY stores sensitive identity, employment, document, application, and AI-generated data.
Final decision: Independent senior engineering and security review is required before public launch.
Rejected alternatives: Ship publicly based only on local build and regression tests.
Reason: RLS, uploads, AI, billing, admin, and employment data create real privacy and safety obligations.
Affected areas: Supabase schema, RLS, storage, AI providers, auth, billing, admin, logs.
Migration implications: Launch checklist must include database and security verification.
Lock status: Locked.
Review trigger: Review before any production public launch or major data-model migration.
