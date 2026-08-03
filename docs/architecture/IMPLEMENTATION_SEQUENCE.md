# PATHZY Implementation Sequence

Status: Phase 1.5 blueprint
Created: 2026-07-28

This sequence recommends the safest order after Phase 1.5. It does not implement any feature.

## Stage 1. Canonical Ownership

Objective: Define the exact Professional Identity source-of-truth contract.

Likely affected files/modules:

- `lib/canonical-profile/**`
- `lib/professional-identity/**`
- `app/professional-identity/**`
- Supabase migrations or verification scripts

Migration risk: High.

Required tests:

- existing user profile loads
- new user profile setup
- canonical summary fallback
- cross-user access
- no document data loss

Rollback point: Branch before schema or read-path changes.

Definition of done:

- canonical fields and compatibility sources documented
- no duplicate write path added
- Professional Identity remains source of truth

Stop condition:

- live database schema is unknown or required canonical tables are missing.

## Stage 2. Route Centralisation

Objective: Move major CTA destinations and query-string routes into typed route builders.

Likely affected files/modules:

- `lib/navigation/routes.ts`
- `lib/navigation/redirects.ts`
- `lib/navigation/auth-routing.ts`
- route callers identified in `docs/audits/ROUTE_AND_FLOW_MAP.md`

Migration risk: Medium.

Required tests:

- locked onboarding route order
- Continue resumes identity setup
- Employment Center opens `/employment-center`
- Applications only from intended routes
- legacy aliases redirect

Rollback point: Commit before route-helper replacement.

Definition of done:

- all major CTAs use route helpers
- hardcoded links reduced or documented
- protected routes remain covered

Stop condition:

- a route change would alter product behaviour outside the scoped route contract.

## Stage 3. Authentication and Onboarding State

Objective: Stabilize auth, language selection, Professional Identity setup, review, finish setup, and diagnosis transitions.

Likely affected files/modules:

- `app/auth/callback/route.ts`
- `components/auth/**`
- `app/onboarding/page.tsx`
- `components/onboarding/onboarding-flow.tsx`
- `app/professional-identity/page.tsx`
- `lib/navigation/auth-routing.ts`

Migration risk: Medium.

Required tests:

- new user flow
- returning incomplete user
- returning complete user
- logged-out protected redirect
- no payment interception

Rollback point: Commit before auth redirect changes.

Definition of done:

- locked journey is enforced
- fallback does not use legacy dashboard
- language preference route/state is defined

Stop condition:

- email confirmation or session recovery regresses.

## Stage 4. Professional Identity Persistence

Objective: Make Professional Identity save, resume, review, and finish setup reliable.

Likely affected files/modules:

- `components/professional-identity/profile-action-editor.tsx`
- `app/api/professional-profile/route.ts`
- `lib/professional-identity/**`
- `lib/canonical-profile/**`

Migration risk: High.

Required tests:

- autosave/manual save
- each authoritative section
- review flow
- finish setup
- refresh and return
- RLS and ownership

Rollback point: Backup branch before persistence changes.

Definition of done:

- data survives refresh
- no raw Supabase errors in UI
- canonical profile remains consistent

Stop condition:

- schema mismatch appears and cannot be safely repaired within scope.

## Stage 5. Migration and Compatibility

Objective: Build adapters and current-runtime schema verification for legacy/transitional/canonical models.

Likely affected files/modules:

- `lib/professional-identity/professional-identity-service.ts`
- `lib/canonical-profile/canonical-profile-service.ts`
- `supabase/migrations/**`
- database verification scripts

Migration risk: High.

Required tests:

- existing user data preserved
- legacy document reads
- canonical profile reads
- cross-user denial
- rollback validation

Rollback point: Recovery branch and database backup plan.

Definition of done:

- read and write paths documented
- no destructive migration
- verification script checks current runtime schema

Stop condition:

- production database state is ambiguous.

## Stage 6. Employment Diagnosis

Objective: Add or stabilize diagnosis between Finish Setup and Personalised Home.

Likely affected files/modules:

- `lib/progress/**`
- `lib/analytics/**`
- `app/roadmap/page.tsx`
- diagnosis service modules

Migration risk: Medium.

Required tests:

- missing data diagnosis
- readiness changes
- diagnosis before Home
- no generic dashboard before user is understood

Rollback point: Commit before diagnosis route/state changes.

Definition of done:

- diagnosis explains readiness, gaps, risks, and next action
- Home consumes diagnosis state

Stop condition:

- diagnosis blocks users without a recovery action.

## Stage 7. Personalised Home

Objective: Make Home the calm command center driven by diagnosis and next action.

Likely affected files/modules:

- `app/roadmap/page.tsx`
- `lib/progress/next-action-engine.ts`
- `lib/operating-system/employment-operating-system.ts`

Migration risk: Medium.

Required tests:

- Continue destinations by state
- Employment Center card destination
- Opportunities card destination
- Insights and Coach destination
- mobile layout smoke

Rollback point: Commit before Home changes.

Definition of done:

- one obvious next action
- no CV-first route for incomplete identity
- no Applications route for Employment Center

Stop condition:

- Home becomes a generic dashboard again.

## Stage 8. Document Engine

Objective: Align CV, Cover Letter, LinkedIn, Career Passport, and document versions with Professional Identity.

Likely affected files/modules:

- `components/professional-identity/**`
- `app/professional-identity/**`
- document render/export helpers
- document tables and adapters

Migration risk: High.

Required tests:

- preview/export parity
- template switching without data loss
- sync status
- manual overrides
- no internal text in exports
- premium gate at action time

Rollback point: Backup branch before document-engine changes.

Definition of done:

- documents remain premium and identity-linked
- no duplicate content source per template

Stop condition:

- PDF or A4 output regresses.

## Stage 9. Opportunities

Objective: Stabilize job import, saved jobs, job analysis, and explainable matching.

Likely affected files/modules:

- `app/opportunities/page.tsx`
- `components/opportunities/opportunities-hub.tsx`
- `lib/job-intelligence/**`
- opportunity action tables

Migration risk: Medium.

Required tests:

- saved job
- job import
- requirement classification
- evidence match
- no unexplained score-only result
- RLS

Rollback point: Commit before matching changes.

Definition of done:

- job suitability is evidence-grounded and actionable

Stop condition:

- matching uses uploaded CV instead of Professional Identity.

## Stage 10. Success Workflows

Objective: Stabilize Applications, interview preparation, follow-up, timeline, analytics, and Coach integration.

Likely affected files/modules:

- `app/applications/page.tsx`
- `components/interview/interview-prep-client.tsx`
- Phase 9 application/follow-up/interview modules
- `lib/analytics/**`
- Coach modules

Migration risk: High.

Required tests:

- application status history
- timeline events
- private notes
- contacts
- interview prep
- follow-up approval
- no automatic sends
- analytics privacy

Rollback point: Backup branch before Success Center consolidation.

Definition of done:

- applications are operational, auditable, and user-controlled

Stop condition:

- any action sends or applies without explicit approval.
