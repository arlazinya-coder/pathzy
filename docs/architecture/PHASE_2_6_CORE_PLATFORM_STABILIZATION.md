# PATHZY Phase 2.6 Core Platform Stabilization

Status: in progress
Created: 2026-08-03

## Purpose

Phase 2.6 stabilizes Professional Identity before any Phase 3 employment intelligence work begins. The architectural rule is:

Professional Identity is the source of truth for employment-related user information. Review, Employment Diagnosis, Home, documents, matching, applications, interviews, Coach and future modules must consume Professional Identity rather than becoming competing profile systems.

## Current Sources

The current production-compatible storage boundary is transitional:

- `public.user_profiles` stores account/profile fields, setup flags and document status fields.
- `public.discovery_responses.answers` stores guided setup answers, Employment Readiness Check state, Employment Diagnosis state and several Professional Identity section values.
- `public.canonical_professional_profiles` and related canonical tables exist as the Phase 2A target model and are used by later document/job intelligence services.

No Phase 2.6 migration has been applied. The compatibility source remains `user_profiles` plus explicitly selected owned `discovery_responses` compatibility rows until a non-destructive migration cutover is explicitly approved.

## Stabilized Read Flow

The server-side Professional Identity read boundary is:

- `lib/professional-identity/professional-identity-read-service.ts`

It loads the owned compatibility rows, builds `ProfessionalIdentityCompletionValues`, calculates completion once, and exposes required checks. These consumers now use that read model:

- `app/professional-identity/page.tsx`
- `app/roadmap/page.tsx`
- `components/app-shell.tsx`
- `lib/navigation/auth-routing.ts`
- `lib/progress/next-action-engine.ts`

Legacy `discovery_responses` reads are filtered through:

- `lib/professional-identity/professional-identity-discovery-compatibility.ts`

Professional Identity rows are selected by compatibility score and record marker. Employment Diagnosis rows are excluded from identity hydration, except for diagnosis workflow flags that are safe to merge into routing state.

## Stabilized Write Flow

The server-side write boundary is:

- `lib/professional-identity/professional-identity-write-service.ts`

The API controller is thin:

- `app/api/professional-profile/route.ts`

The route delegates section writes, onboarding progress, Employment Readiness Check, Finish Setup and Employment Diagnosis completion to the write service. It then calls:

- `lib/professional-identity/professional-identity-sync.ts`

UI components must not write directly to `user_profiles` or `discovery_responses`.

## Completion Engine

The authoritative 23-section completion engine is:

- `lib/professional-identity/professional-identity-completion.ts`

The formula is:

```text
completed sections / 23, rounded to a whole percentage
```

Required checks are separate from total identity completion. Profile quality, CV health, document quality and readiness must not be mixed into this percentage.

## Workflow Resolver

The workflow-state resolver is:

- `lib/navigation/auth-routing.ts`

Locked flow:

```text
Authentication
-> Professional Identity guided setup
-> Review My Information
-> Finish Setup
-> Employment Diagnosis
-> Personalised Home
-> PATHZY ecosystem
```

Pages should not infer setup state independently.

## Employment Diagnosis Separation

Employment Diagnosis may read Professional Identity and write diagnosis answers, readiness findings, recommendations and diagnosis status. It must not overwrite Professional Identity fields unless the user explicitly confirms an identity update.

Current diagnosis completion is persisted through:

- `saveCompletedEmploymentDiagnosis` in `lib/professional-identity/professional-identity-write-service.ts`

New diagnosis completion writes are marked as Employment Diagnosis records and must not replace or become the selected Professional Identity compatibility row.

## Autosave Contract

The shared client save pipeline is:

- `lib/professional-identity/use-professional-identity-autosave.ts`

The guided editor consumes this hook instead of owning request sequencing directly. The hook implements:

- 700ms debounce
- request signatures to suppress identical saves
- aborting obsolete requests
- server timing headers
- terminal error state with Retry
- no save before hydration
- navigation saves before section transition

`components/professional-identity/profile-action-editor.tsx` still owns the local form field state and passes section payloads into the hook. A future provider can lift hydrated identity state higher if multiple mounted editors need to share live client state.

## Known Remaining Risks

- `discovery_responses` compatibility is now score/marker based, but still relies on JSON markers rather than a schema-backed discriminator column. A future migration should introduce an explicit record purpose column or complete the canonical cutover.
- Several non-setup modules still read legacy profile/discovery tables for feature-specific context.
- Authenticated browser QA is still required for refresh, logout/login, diagnosis round-trip, rapid-edit ordering and failed-save recovery.

## Future-Contributor Rules

- Do not add a second Professional Identity profile model.
- Do not calculate Professional Identity completion outside the shared completion engine.
- Do not write directly from UI components to persistence tables.
- Do not allow Employment Diagnosis to mask or overwrite identity data.
- Do not route completed users back into setup unless canonical required data is genuinely missing.
- Do not start Phase 3 employment intelligence until Phase 2.6 validation is complete.
