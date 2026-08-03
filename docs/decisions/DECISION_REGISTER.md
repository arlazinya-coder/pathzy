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

## DEC-023

Decision ID: DEC-023
Date: 2026-07-28
Title: Modular monolith instead of premature microservices
Status: Accepted
Context: PATHZY currently runs as a Next.js and Supabase application with multiple active domains but no operational need for distributed services.
Final decision: PATHZY V1 remains a modular monolith with clean domain boundaries.
Rejected alternatives: Microservices, distributed message brokers, separate service deployments, or premature workflow infrastructure.
Reason: The current priority is preserving working features while reducing duplicated page logic and source-of-truth drift.
Affected areas: Architecture, deployment, domain services, testing, observability.
Migration implications: Domain boundaries should be introduced inside the current repository before any service extraction is considered.
Lock status: Locked.
Review trigger: Review only if scaling, team structure, compliance, or operational constraints require service separation.

## DEC-024

Decision ID: DEC-024
Date: 2026-07-28
Title: Lightweight PATHZY Kernel
Status: Accepted
Context: Cross-domain workflows need coordination across Professional Identity, documents, diagnosis, jobs, applications, Coach, and Home.
Final decision: Introduce a lightweight Kernel concept as an orchestration and domain coordination layer.
Rejected alternatives: A monolithic god object; page-level orchestration everywhere; direct circular imports between domains.
Reason: The Kernel should coordinate events, idempotency, sync invalidation, and workflow decisions without owning domain internals.
Affected areas: `lib/**`, domain services, future event dispatcher, testing.
Migration implications: Implementation should be incremental and start with low-risk events.
Lock status: Locked.
Review trigger: Review if Kernel responsibilities begin duplicating domain logic.

## DEC-025

Decision ID: DEC-025
Date: 2026-07-28
Title: Domain events for cross-domain coordination
Status: Accepted
Context: Professional Identity, documents, matching, applications, diagnosis, Home, and Coach need consistent state propagation.
Final decision: Use typed domain events as the coordination contract for cross-domain side effects.
Rejected alternatives: Hidden page-level side effects; direct module-to-module mutation; immediate heavy infrastructure.
Reason: Domain events clarify producers, consumers, payloads, idempotency, retry, and failure behaviour.
Affected areas: Kernel, Sync Engine, Documents, Job Intelligence, Applications, Home, Coach.
Migration implications: V1 should start with in-process dispatch and add outbox persistence only where reliability requires it.
Lock status: Locked.
Review trigger: Review when adding persistent outbox or background jobs.

## DEC-026

Decision ID: DEC-026
Date: 2026-07-28
Title: Sync invalidation before automatic regeneration
Status: Accepted
Context: Professional Identity changes can affect documents, matches, diagnosis, Home, Career Passport, and Coach context.
Final decision: Default to marking downstream content outdated or refreshing deterministic state before regenerating AI or paid content.
Rejected alternatives: Automatically regenerate CVs, cover letters, LinkedIn content, or paid/AI outputs after every small edit.
Reason: Automatic regeneration risks cost, user confusion, overwritten manual overrides, and unapproved changes.
Affected areas: Sync Engine, Documents, Job Matching, Career Passport, Home, Coach.
Migration implications: Document sync states and manual override rules must be explicit.
Lock status: Locked.
Review trigger: Review if a deterministic generated asset can safely update without user approval.

## DEC-027

Decision ID: DEC-027
Date: 2026-07-28
Title: Central route ownership
Status: Accepted
Context: Phase 0 found central route definitions plus remaining hardcoded links.
Final decision: One Route Engine must own canonical route constants, typed route builders, guards, onboarding transitions, next-action resolution, and fallback behaviour.
Rejected alternatives: Individual components constructing their own route strings or query parameters.
Reason: Route centralization prevents Continue, Employment Center, Applications, and legacy alias regressions.
Affected areas: `lib/navigation/**`, Home, onboarding, Professional Identity, Employment Center, Opportunities, Applications.
Migration implications: Hardcoded links should migrate incrementally to route builders.
Lock status: Locked.
Review trigger: Review when adding a new top-level product route.

## DEC-028

Decision ID: DEC-028
Date: 2026-07-28
Title: Server-side authorization and RLS
Status: Accepted
Context: PATHZY stores sensitive employment, document, application, and profile data.
Final decision: Authorization must be enforced server-side with Supabase Auth, permission helpers, ownership checks, and RLS.
Rejected alternatives: Client-side role checks as primary protection; service-role shortcuts exposed to UI; page-level permission bypasses.
Reason: Client-side checks improve UX only and cannot protect data.
Affected areas: API routes, server components, Supabase policies, admin/support workflows, document access, billing actions.
Migration implications: Future permission helpers must centralize roles, entitlements, ownership, and audit requirements.
Lock status: Locked.
Review trigger: Review before public launch, admin features, or support access.

## DEC-029

Decision ID: DEC-029
Date: 2026-07-28
Title: Incremental canonical-data migration
Status: Accepted
Context: Phase 0 identified legacy, transitional, and canonical data models that are all still relevant.
Final decision: Migrate toward canonical Professional Identity through adapters, backfills, validation, and reversible cutovers.
Rejected alternatives: Delete legacy tables early; rewrite source-of-truth data in one large migration; ignore legacy user data.
Reason: Existing user data and working features must be preserved.
Affected areas: Professional Identity, canonical profile, documents, job intelligence, applications, migrations, tests.
Migration implications: Each table needs read path, write path, backfill, validation, rollback, deprecation, and removal criteria.
Lock status: Locked.
Review trigger: Review before any schema migration or read-path cutover.

## DEC-030

Decision ID: DEC-030
Date: 2026-07-28
Title: No destructive legacy-table deletion before verified cutover
Status: Accepted
Context: Legacy document and profile tables are still referenced by current runtime code.
Final decision: Do not delete legacy tables, fields, or compatibility code before verified canonical cutover.
Rejected alternatives: Drop historical tables because they appear outdated; remove compatibility code without runtime dependency audit.
Reason: Deleting legacy structures too early can destroy user data or break existing features.
Affected areas: Supabase migrations, Professional Identity, documents, user documents, application data, runtime verification.
Migration implications: Removal requires data validation, no active runtime dependency, backup/recovery point, and founder approval.
Lock status: Locked.
Review trigger: Review whenever a migration proposes dropping or archiving legacy data.

## DEC-031

Decision ID: DEC-031
Date: 2026-07-28
Title: Authentication, language and authorization foundations before UI redesign
Status: Accepted
Context: Phase 2C requires production-quality session, language preference and authorization boundaries without redesigning onboarding, Home, Professional Identity, documents, or Coach.
Final decision: PATHZY uses shared auth session-safety helpers, independent language preference layers, and centralized server-side authorization helpers before Phase 2D introduces premium onboarding/UI changes.
Rejected alternatives: Page-local auth decisions; one global language field controlling every product output; client-only role checks; premium/founder bypasses inside individual pages.
Reason: Authentication and authorization are platform foundations and must be stable before visual or onboarding redesign work.
Affected areas: Auth routes, Supabase session handling, Settings language preference, entitlement checks, API route ownership checks, future admin/support tooling.
Migration implications: No Phase 2C database migration is added. Current storage is documented through compatibility mappings until a future approved preference table or schema extension exists.
Lock status: Locked.
Review trigger: Review before adding admin/support UI, changing Supabase RLS, or introducing a dedicated language preference table.

## DEC-032

Decision ID: DEC-032
Date: 2026-07-28
Title: Welcome and language selection before Professional Identity fields
Status: Accepted
Context: Phase 2D requires first-time users to feel oriented before entering the full Professional Identity setup.
Final decision: PATHZY shows a Welcome step, dedicated interface-language choice, independent professional-document language choice, and Career Coach orientation before the 23 Professional Identity sections.
Rejected alternatives: Drop users directly into a large form; hide language in Settings; combine interface and document language into one value.
Reason: The journey must be calm, understandable, multilingual from day one, and source-of-truth aligned.
Affected areas: Professional Identity, language preferences, authenticated shell, route state.
Migration implications: No database migration is applied in Phase 2D; compatibility storage is used until approved preference tables exist.
Lock status: Locked.
Review trigger: Review before changing first-time setup order or adding a dedicated language preference table.

## DEC-033

Decision ID: DEC-033
Date: 2026-07-28
Title: Employment Diagnosis after Finish Setup
Status: Accepted
Context: Finish Setup previously risked sending users directly to Home or unrelated document flows.
Final decision: Finish Setup validates required Professional Identity fields, records review/setup state, and routes to Employment Diagnosis before Personalised Home.
Rejected alternatives: Route directly to Home; route to CV or Cover Letter; mark diagnosis complete without running diagnosis.
Reason: PATHZY is Professional Identity-first and must not skip the employment understanding step.
Affected areas: Professional Identity review, profile API, route engine, Employment Diagnosis.
Migration implications: Compatibility state is recorded in `discovery_responses.answers` until the future diagnosis state table is approved.
Lock status: Locked.
Review trigger: Review when the full Employment Diagnosis engine is implemented.

## DEC-034

Decision ID: DEC-034
Date: 2026-07-28
Title: Shared PATHZY design tokens before page-level redesign
Status: Accepted
Context: Phase 2D introduces a premium design foundation while preserving existing product modules.
Final decision: PATHZY centralizes brand colour, typography, radius, shadow, focus, surface, and status primitives in shared CSS tokens before broad page redesign work.
Rejected alternatives: One-off page styling; generic blue-purple AI gradients; uncontrolled theme changes across unrelated modules.
Reason: A stable visual foundation reduces regressions and keeps future UI work consistent.
Affected areas: Global CSS, shared UI primitives, authenticated shell, onboarding and Professional Identity surfaces.
Migration implications: No database migration.
Lock status: Locked.
Review trigger: Review before introducing external fonts, replacing Tailwind theme configuration, or redesigning unrelated modules.

## DEC-035

Decision ID: DEC-035
Date: 2026-08-03
Title: Canonical Professional Photo and private Profile Preview
Status: Accepted
Context: Professional Photo is one of the locked 23 Professional Identity sections, but the current implementation only stores a note and does not provide secure image lifecycle management.
Final decision: PATHZY will model Professional Photo as one canonical private asset owned by the authenticated user, with storage metadata, crop metadata, derivatives, consent, profile visibility, CV usage permission, and future public-sharing permission. The Professional Profile preview reads canonical Professional Identity only and does not become a second profile source.
Rejected alternatives: Store blob URLs or base64 images in profile records; upload separate photos inside CV templates; make photos publicly reachable by predictable URLs; clone LinkedIn or add social-network features; infer identity, attractiveness, protected traits, or personality from photos.
Reason: A professional photo can support profile and document presentation, but it is sensitive media and must be private, owner-scoped, optional, and reusable through approved downstream contracts.
Affected areas: Professional Identity, storage, Supabase policies, CV templates, Profile preview, privacy, documents.
Migration implications: A future additive migration and storage-policy setup are required for canonical photo assets and private object storage. Existing text-note photo data must not be destroyed.
Lock status: Locked.
Review trigger: Review before implementing photo uploads, storage policies, public profile sharing, or photo-enabled CV rendering.
