# PATHZY Target Architecture

Status: Target architecture for PATHZY V1
Created: 2026-07-28
Evidence:
- `docs/audits/CURRENT_STATE_AUDIT.md`
- `docs/audits/ROUTE_AND_FLOW_MAP.md`
- `docs/audits/RISK_REGISTER.md`
- `docs/constitution/PATHZY_PRODUCT_EMPLOYMENT_CONSTITUTION.md`
- `docs/decisions/DECISION_REGISTER.md`

## 1. Current Architecture Summary

Phase 0 identified the current implementation as:

- Frontend: Next.js App Router 15.5.20 with React 19
- Backend: Next.js route handlers and server components
- Language: TypeScript
- Database: Supabase Postgres
- Authentication: Supabase Auth with SSR middleware/session handling
- ORM: none; Supabase query builder is used directly
- Styling: Tailwind CSS, `app/globals.css`, shared `components/ui.tsx`
- Internationalisation: partial English/French modules, no complete i18n framework
- Testing: `tests/regression.test.mjs`, TypeScript, ESLint
- Documents: custom professional document, import, preview, and export services using PDF/DOCX parsing libraries
- Deployment: Vercel-compatible Next.js build

The current application already contains strong product areas: Authentication, Professional Identity, CV, Cover Letter, LinkedIn, Opportunities, Applications, Interview Preparation, Career Growth, Coach, Analytics, Supabase migrations, and route centralization work.

The main architectural risk is hybrid source-of-truth drift across `user_profiles`, `professional_identity`, canonical profile tables, legacy document tables, `user_documents`, and `professional_documents`.

## 2. Target Architecture Objective

PATHZY must become one Employment Operating System with Professional Identity as its data foundation.

Target flow:

```text
Authentication
  -> Preferred interface language
  -> Professional Identity guided setup
  -> Review My Information
  -> Finish Setup
  -> Employment Diagnosis
  -> Personalised Home
  -> PATHZY ecosystem
```

The ecosystem is organised into the seven pillars:

1. Professional Identity
2. Career Intelligence
3. Employment Intelligence
4. Employment Center
5. Opportunities
6. Success Center
7. Career Growth

## 3. Domain Boundaries

### Professional Identity Boundary

Owns:

- authoritative user profile and employment identity
- canonical profile entities
- readiness inputs
- preferences
- employment constraints
- evidence sources

Does not own:

- template-specific document presentation
- job-specific application variants as separate identities
- payment state

Primary evidence:

- `app/professional-identity/page.tsx`
- `components/professional-identity/profile-action-editor.tsx`
- `lib/canonical-profile/canonical-profile-service.ts`
- `lib/professional-identity/professional-identity-service.ts`

### Career Intelligence Boundary

Owns:

- readiness interpretation
- career goal reasoning
- transferable skill interpretation
- missing information guidance
- next-step reasoning before and after diagnosis

Does not own:

- job-ad parsing
- application state
- PDF rendering

Evidence:

- `lib/progress/next-action-engine.ts`
- `lib/progress/journey-router.ts`
- `lib/analytics/career-analytics-service.ts`

### Employment Intelligence Boundary

Owns:

- job advertisement understanding
- requirement classification
- evidence-grounded matching
- gaps, risks, and suitability
- targeted preparation signals

Does not own:

- canonical identity editing
- application submission
- payment access decisions

Evidence:

- `lib/job-intelligence/job-match-engine.ts`
- `components/opportunities/opportunities-hub.tsx`

### Employment Center Boundary

Owns:

- entry point for employment preparation tools
- CV, Cover Letter, LinkedIn, My Documents navigation
- professional asset workflows

Does not own:

- Applications as the default destination
- Opportunity search as a replacement for Professional Identity

Evidence:

- `app/employment-center/page.tsx`
- `app/professional-identity/cv/page.tsx`
- `app/professional-identity/cover-letter/page.tsx`
- `app/professional-identity/linkedin/page.tsx`
- `app/professional-identity/documents/page.tsx`

### Opportunities Boundary

Owns:

- opportunity discovery
- saved jobs
- job import handoff
- job match display

Does not own:

- application tracker state after an application is created
- Professional Identity edits

Evidence:

- `app/opportunities/page.tsx`
- `components/opportunities/opportunities-hub.tsx`

### Success Center Boundary

Owns:

- applications
- application package state
- timeline events
- notes
- contacts
- interview preparation
- follow-up preparation

Does not own:

- silent job applications
- automatic sending
- canonical identity changes without user approval

Evidence:

- `app/applications/page.tsx`
- `components/interview/interview-prep-client.tsx`

### Career Growth Boundary

Owns:

- growth recommendations
- skill development
- Coach guidance
- analytics
- long-term readiness improvement

Does not own:

- raw document generation
- application status history

Evidence:

- `app/skills/page.tsx`
- `components/mentor/floating-mentor-button.tsx`
- `lib/analytics/career-analytics-service.ts`

## 4. Shared-Service Boundaries

Shared services should live under `lib/**` and be consumed by pages and components.

Required shared services:

- routes and redirects: `lib/navigation/**`
- Supabase client/server/session handling: `lib/supabase/**`
- Professional Identity and canonical profile: `lib/canonical-profile/**`, `lib/professional-identity/**`
- next action and journey routing: `lib/progress/**`
- document engines: professional document services and renderers
- job and match intelligence: `lib/job-intelligence/**`
- applications, interview, follow-up, analytics: current Phase 9 service modules
- access and entitlements: a central future service, not page-level bypasses
- language preferences and translations: a central future service, not page-local copy

Pages should orchestrate these services, not duplicate their rules.

## 5. Data Ownership

Professional Identity owns the user's employment identity.

Compatibility tables may remain active while migration is incomplete:

- `user_profiles`
- `professional_identity`
- canonical profile tables
- legacy document tables
- `user_documents`
- `professional_documents`

Target data direction:

```text
Legacy and imported data
  -> compatibility adapters
  -> Canonical Professional Identity
  -> shared engines
  -> documents, matches, applications, interviews, analytics
```

New features must not introduce another profile source of truth.

## 6. Route Ownership

Route constants belong in `lib/navigation/routes.ts`.

Redirect and post-auth decisions belong in:

- `lib/navigation/redirects.ts`
- `lib/navigation/auth-routing.ts`
- `lib/supabase/middleware.ts`
- `middleware.ts`

Rules:

- one CTA has one intended destination
- legacy aliases redirect safely
- protected routes use central coverage
- membership does not fork main routes
- Applications are accessed from Applications or after application actions
- Employment Center opens the Employment Center hub, never Applications

## 7. State Ownership

State should be owned by the smallest stable source:

- identity data: Professional Identity and canonical profile services
- document content: document model linked to Professional Identity
- document presentation: template/version metadata
- job understanding: structured job analysis records
- application tracking: application and timeline tables
- UI-only state: local component state
- access state: central entitlement/access service

Local component state must not become persistent source-of-truth data accidentally.

## 8. Document-Engine Boundary

The document engine owns:

- document models
- versions
- templates
- sync status with Professional Identity
- manual overrides
- A4 preview
- PDF export
- premium template quality

It does not own:

- Professional Identity facts
- job matching
- billing logic
- user authentication

Rules:

- identity data stays separate from templates
- template switching does not erase content
- job-specific variants stay linked to base identity
- manual overrides are explicit
- AI claims are traceable and user-approved
- preview and PDF match closely

## 9. Employment-Intelligence Boundary

Employment Intelligence owns:

- job import
- job parsing
- requirement classification
- responsibility separation
- match evidence
- missing and uncertain requirement handling

It does not own:

- canonical profile editing
- automatic applications
- outbound communication

## 10. Matching-Engine Boundary

The matching engine compares structured jobs with canonical evidence.

Required output:

- requirements
- matching evidence
- missing evidence
- uncertainty
- risks
- questions for the user
- targeted document handoff

Rejected output:

- unexplained score only
- invented fit claims
- unsupported target-CV claims

## 11. Career Coach Boundary

The Career Coach provides guidance based on Professional Identity, readiness, applications, and career growth state.

It must not:

- override user decisions
- submit applications
- expose private documents unnecessarily
- make hidden high-impact decisions

Coach language should be configurable separately from interface language.

## 12. Internationalisation Boundary

Language preferences must support:

1. Interface language
2. Career Coach conversation language
3. Professional document language
4. Interview-practice language
5. Notification and email language

Rules:

- no flag-only selectors
- use standard names or codes
- detect supported browser language on public pages
- default to English when unsupported
- always show language selection
- ask document language separately during setup
- never silently change document language based on a vacancy

## 13. Entitlement and Subscription Boundary

Entitlements own premium access decisions.

Rules:

- free and paid users use the same routes
- premium status changes action availability, not implementation
- value is shown before upgrade
- template previews may be available before payment
- founder user access is enhanced but must remain centrally managed
- final commercial rules remain subject to business confirmation

## 14. Security and Audit Boundary

Security owns:

- server-side authorization
- RLS requirements
- upload validation
- input validation
- output sanitisation
- audit events
- consent records
- secret handling
- prompt-injection boundaries

Rules:

- no secrets in source or reports
- no unnecessary personal data sent to AI providers
- no user content mixed with system instructions
- security review required before public launch

## 15. File Upload Boundary

File uploads must handle:

- supported types
- size limits
- secure storage
- ownership
- extraction status
- failure states
- malicious or malformed content
- user consent where documents are used by AI

Uploaded documents may enrich Professional Identity but must not silently replace it.

## 16. Notification Boundary

Notifications and emails must be:

- user-controlled
- timezone-aware
- language-aware
- consent-aware
- tied to application or journey events

PATHZY may suggest and draft. It must not silently send.

## 17. External Integration Boundary

External integrations include AI providers, Supabase, email providers, job sources, billing providers, analytics, and future application platforms.

Rules:

- provider contracts must be isolated behind services
- secrets stay outside source code
- failures must degrade safely
- high-impact outbound actions require approval
- user data sent externally must be minimized

## 18. Incremental Migration Plan

The current application can migrate without destroying working features:

1. Preserve current working code and recovery branches.
2. Freeze product rules in this architecture documentation.
3. Keep legacy routes and compatibility tables until replacements are verified.
4. Centralize remaining hardcoded routes.
5. Define the canonical Professional Identity contract.
6. Adapt document, job, application, interview, Coach, and analytics modules to canonical identity.
7. Add current-runtime database verification.
8. Classify old tables and components as canonical, compatibility, or removable.
9. Remove legacy code only after tests and user-data migration prove it is safe.

No phase should replace a working feature before preserving and understanding it.
