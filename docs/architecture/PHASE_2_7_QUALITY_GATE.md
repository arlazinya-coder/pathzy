# PATHZY Phase 2.7 Foundation Quality Gate

Status: INCOMPLETE - DO NOT START PHASE 3
Date: 2026-08-03
Branch audited: feature/pathzy-v1-foundation
Safety branch created: backup/before-phase-2.7-quality-gate

## Locked Product Rules

- PATHZY is an Employment Operating System.
- Professional Identity is the source of truth.
- Locked setup flow: Public page -> Sign up or Login -> Professional Identity guided setup -> Review My Information -> Finish Setup -> Employment Diagnosis -> Personalised Home -> PATHZY ecosystem.
- Review My Information is a review mode, not a second profile.
- Employment Diagnosis must not overwrite or mask Professional Identity.
- One completion engine, one save pipeline, one read model, and one route-state resolver must control the foundation.
- English and French must not mix unintentionally.
- Interface language and Professional Document Language are separate preferences.
- Phase 3 must not begin until authenticated browser QA, persistence proof, diagnosis round-trip, account isolation, and founder acceptance pass.

## Worktree Classification

Phase 2.7 QA/report work:
- docs/architecture/PHASE_2_7_QUALITY_GATE.md
- .codex-phase27-dev.out.log
- .codex-phase27-dev.err.log

Phase 2.7 blocker fix already present in working tree:
- app/roadmap/page.tsx
- app/professional-identity/page.tsx
- components/professional-identity/profile-action-editor.tsx
- lib/language/pathzy-i18n.ts
- tests/regression.test.mjs

Phase 2.6 or earlier foundation work still mixed in the working tree:
- app/api/generate-roadmap/route.ts
- app/api/professional-profile/route.ts
- components/app-shell.tsx
- components/discovery/discovery-flow.tsx
- components/language/language-selector.tsx
- lib/navigation/auth-routing.ts
- lib/professional-identity/professional-identity-completion.ts
- lib/professional-identity/professional-identity-discovery-compatibility.ts
- lib/professional-identity/professional-identity-read-service.ts
- lib/professional-identity/professional-identity-sync.ts
- lib/professional-identity/professional-identity-write-service.ts
- lib/professional-identity/use-professional-identity-autosave.ts
- lib/readiness/

Older Phase 2 or adjacent application work still mixed in the working tree:
- app/applications/page.tsx
- app/billing/page.tsx
- app/pricing/page.tsx
- app/employment-center/
- app/pricing/pricing-content.tsx
- app/professional-identity/review/
- app/professional-identity/section/
- components/interview/interview-prep-client.tsx
- components/mentor/floating-mentor-button.tsx
- components/opportunities/opportunities-hub.tsx
- components/public/landing-content.tsx
- docs/decisions/DECISION_REGISTER.md
- docs/architecture/CANONICAL_DATA_MIGRATION_BLUEPRINT.md
- docs/architecture/EVENT_CATALOGUE.md
- docs/architecture/IMPLEMENTATION_SEQUENCE.md
- docs/architecture/PATHZY_DESIGN_SYSTEM_FOUNDATION.md
- docs/architecture/PATHZY_KERNEL_ARCHITECTURE.md
- docs/architecture/PERMISSIONS_AND_AUTHORIZATION_MODEL.md
- docs/architecture/PHASE_2D_PROFESSIONAL_IDENTITY_ENGINE.md
- docs/architecture/PHASE_2_6_CORE_PLATFORM_STABILIZATION.md
- docs/architecture/PLATFORM_DEPENDENCY_MAP.md
- docs/architecture/ROUTE_ENGINE_BLUEPRINT.md
- docs/architecture/SYNC_ENGINE_BLUEPRINT.md
- lib/analytics/career-analytics-service.ts
- lib/job-intelligence/job-match-engine.ts
- lib/operating-system/employment-operating-system.ts
- lib/professional-identity/cv-import.ts
- lib/progress/journey-router.ts
- lib/progress/next-action-engine.ts
- lib/supabase/client.ts
- lib/supabase/config.ts
- next.config.ts

Generated or log files to exclude from commits:
- .codex-phase2b-dev.err.log
- .codex-phase2b-dev.out.log
- .codex-phase2c-dev.err.log
- .codex-phase2c-dev.out.log
- .codex-phase27-dev.err.log
- .codex-phase27-dev.out.log
- tsconfig.tsbuildinfo

## Automated Gate Results

| Check | Result | Evidence |
| --- | --- | --- |
| git status precheck | PASS | Mixed dirty tree identified before edits. |
| safety branch | PASS | backup/before-phase-2.7-quality-gate created without checkout. |
| pnpm typecheck | PASS | `tsc --noEmit` completed. |
| pnpm run test:regression | PASS | PATHZY journey and export standard regression tests passed. |
| pnpm run lint | PASS WITH WARNINGS | 74 existing warnings, 0 errors. |
| pnpm run build | PASS WITH WARNINGS | Next.js 15.5.20 production build completed. |
| git diff --check | PASS | No whitespace errors. |
| conflict marker scan | PASS | No conflict markers found in app, components, lib, tests, docs. |
| local dev server | BLOCKED | PowerShell Start-Process failed due duplicate Path/PATH environment key; cmd fallback did not leave a listener on port 3000. |
| authenticated browser QA | NOT VERIFIED | No authenticated browser session or test accounts were exercised in this run. |
| founder acceptance | NOT VERIFIED | Founder manual test results not provided. |

## Quality Gate Matrix

| Checkpoint | Status | Notes |
| --- | --- | --- |
| A. Public page and authentication | PARTIAL | Build and route tests pass. Real signup, email confirmation, password reset, logout, account switching, and protected-route browser checks are not verified. |
| B. Professional Identity data integrity | PARTIAL | Shared read/write/completion architecture is present. Full 23-section persistence across refresh/logout/login is not browser-verified. |
| C. Autosave reliability and speed | PARTIAL | Shared autosave hook includes 700 ms debounce, stale-save protection, aborts, duplicate suppression, Retry, and performance logging. Actual browser timings are not measured. |
| D. Completion consistency | PASS AUTOMATED, PARTIAL MANUAL | Regression asserts shared 23-section completion engine across editor, review, Home, shell, route resolver. Browser comparison is not verified. |
| E. Review My Information | PASS AUTOMATED, PARTIAL MANUAL | Regression covers review route/resume behavior. Browser loop test is not verified. |
| F. Finish Setup and Employment Diagnosis | PASS AUTOMATED, PARTIAL MANUAL | Diagnosis writes separate diagnosis-marked records in tests. Round-trip browser evidence is not verified. |
| G. Personalised Home | PASS AUTOMATED, PARTIAL MANUAL | Home uses canonical read model and localized copy. Real authenticated Home state is not browser-verified. |
| H. Multilingual integrity | PASS AUTOMATED, PARTIAL MANUAL | French Home/Profile leaks from QA were fixed with regression coverage. Full journey screenshots are not captured. |
| I. Employment Center current state | PARTIAL | Routes/build compile. Browser route audit is not complete. |
| J. Responsive and visual quality | NOT VERIFIED | No viewport screenshots captured. |
| K. Accessibility | PARTIAL | Source has labels/aria-live/progress semantics in key areas. Keyboard/screen-reader audit not performed. |
| L. Error recovery | PARTIAL | Autosave error/Retry path exists. Offline/server-failure browser simulation not performed. |
| M. Security and ownership | PARTIAL | Source uses `eq("user_id", user.id)` and safe route helpers in key paths. RLS/live database and cross-user browser tests not performed. |
| N. Performance | PARTIAL | Build sizes captured; autosave logs instrument request duration. Runtime measurements not captured. |
| O. Automated validation | PASS | Typecheck, lint, regression, build, diff check, conflict scan completed. |
| P. Architecture conformance | PASS AUTOMATED, PARTIAL MANUAL | Shared services and tests exist. Transitional compatibility layers remain documented below. |

## Route-State Matrix

| State | Destination | Source |
| --- | --- | --- |
| unauthenticated | Login or Signup with safe redirect | lib/navigation/auth-routing.ts |
| welcome_pending | /professional-identity?stage=welcome | lib/navigation/auth-routing.ts |
| interface_language_pending | /professional-identity?stage=interfaceLanguage | lib/navigation/auth-routing.ts |
| document_language_pending | /professional-identity?stage=documentLanguage | lib/navigation/auth-routing.ts |
| coach_intro_pending | /professional-identity?stage=careerCoach | lib/navigation/auth-routing.ts |
| professional_identity_intro_pending | /professional-identity?stage=professionalIdentityIntroduction | lib/navigation/auth-routing.ts |
| identity_not_started | /professional-identity?section=profile | lib/navigation/auth-routing.ts |
| identity_in_progress | /professional-identity?section={firstMissingRequiredSection} | lib/navigation/auth-routing.ts |
| identity_review_pending | /professional-identity?review=1 | lib/navigation/auth-routing.ts |
| identity_finish_pending | /professional-identity?finish=1 | lib/navigation/auth-routing.ts |
| diagnosis_pending | /discovery?reason=setup-complete | lib/navigation/auth-routing.ts |
| diagnosis_complete / home_ready | /roadmap or safe intended route | lib/navigation/auth-routing.ts |

## Multilingual Architecture Rules

- Server and client must use the same initial interface-language source.
- Browser detection may suggest a language only before explicit user choice.
- Interface language must not silently mutate Professional Document Language.
- Suggested skills and generated professional content must use Professional Document Language where available.
- French UI must not render hard-coded English fallbacks in the core journey.
- English UI must not render French strings unless the user selected French content.
- Language selectors must use EN/FR or names, not country flags.

## Identity Persistence Architecture

- Read boundary: lib/professional-identity/professional-identity-read-service.ts.
- Write boundary: lib/professional-identity/professional-identity-write-service.ts.
- Client save pipeline: lib/professional-identity/use-professional-identity-autosave.ts.
- Completion engine: lib/professional-identity/professional-identity-completion.ts.
- Route resolver: lib/navigation/auth-routing.ts.
- Compatibility layer: lib/professional-identity/professional-identity-discovery-compatibility.ts.
- Review page: app/professional-identity/page.tsx reads the shared model and does not own persistence.
- Diagnosis completion: app/api/generate-roadmap/route.ts delegates diagnosis persistence to the Professional Identity write service.

## Known Risks

- BLOCKER: Authenticated browser QA is not completed.
- BLOCKER: Founder acceptance is not completed.
- BLOCKER: Professional Photo now has an upload UI/API and a private-storage migration file, but the connected Supabase storage bucket/policies have not been verified and authenticated persistence QA has not passed.
- CRITICAL: Full persistence proof across refresh, logout/login, browser close/reopen, rapid edit ordering, failed-save Retry, and account switching is not available from this run.
- MAJOR: Local dev server could not be started through PowerShell due duplicate Path/PATH environment handling.
- MAJOR: Working tree contains mixed uncommitted work from Phase 2.6 and older phases; selective staging is mandatory before any commit.
- MINOR: Lint warning baseline remains at 74 warnings.

## Professional Photo and Profile Presentation Gate

Current implementation:

- The Photo section exists as one of the locked 23 Professional Identity sections.
- The visible editor now provides a real Professional Photo file input, preview, replace, crop/reposition, remove, and retry flow.
- The dedicated route `app/api/professional-identity/photo/route.ts` uploads the binary to Supabase Storage before persisting canonical metadata.
- The canonical reference is stored in `discovery_responses.answers.professional_photo_asset`; temporary object URLs and base64 images are not persisted.
- The private storage bucket and owner-scoped policies are defined in `supabase/migrations/20260803120000_create_professional_photo_storage.sql`, but must be applied and verified in the connected Supabase project.
- CV templates now declare whether they can use the canonical photo asset.

Contract added:

- `lib/professional-identity/professional-photo.ts` defines the canonical professional-photo asset, upload validation boundary, temporary URL guard, private-storage contract, crop metadata, derivatives, and consent/visibility fields.
- `lib/professional-identity/document-template-engine.ts` now requires every CV template to declare `photoCapability`.
- Regression tests lock the canonical photo contract and verify all 10 CV templates declare a photo capability.

Gate decision:

- The architecture contract is present.
- The production lifecycle is not complete until the storage migration is applied in the connected environment and authenticated QA proves upload, refresh, logout/login persistence, replacement, removal, and cross-user isolation.
- The photo/profile presentation gate is blocked until secure storage, upload, replacement, deletion, profile preview, CV permission handling, and authenticated cross-user QA are verified.

## Release Readiness Checklist

- [x] Safety branch created.
- [x] Typecheck passed.
- [x] Regression tests passed.
- [x] Lint passed with warnings.
- [x] Production build passed.
- [x] Diff whitespace check passed.
- [x] Conflict marker scan passed.
- [ ] Local dev server verified.
- [ ] New French account browser journey verified.
- [ ] Returning English user browser journey verified.
- [ ] Account-switching isolation verified.
- [ ] Autosave timing measured in authenticated browser conditions.
- [ ] Offline/save-failure Retry tested.
- [ ] Employment Diagnosis round-trip verified.
- [ ] Responsive viewport screenshots captured.
- [ ] Accessibility keyboard pass completed.
- [ ] Founder acceptance completed.
- [ ] Phase 2.7 commits created.
- [ ] pathzy-v0.2.7-foundation-ready tag created.

## Founder Acceptance Test

Account A - New French user:
1. Open public page.
2. Select French.
3. Create account.
4. Confirm French remains selected.
5. Complete required Professional Identity sections.
6. Confirm suggestions are French.
7. Observe Saving -> Saved.
8. Refresh.
9. Review information.
10. Return to identity without loop.
11. Finish setup.
12. Complete Employment Diagnosis.
13. Reach Personalised Home.
14. Confirm Home is French and percentages match.
15. Open Employment Center.
16. Logout.
17. Close browser.
18. Login again.
19. Confirm data, language and workflow state remain.

Account B - Returning English user:
1. Login.
2. Confirm Home opens.
3. Confirm English UI.
4. Edit identity.
5. Confirm persistence.
6. Confirm Review and Home percentage match.
7. Confirm no onboarding restart.

Account C - Account switching:
1. Login as A.
2. Logout.
3. Login as B.
4. Confirm no A data appears.

## Final Verdict

PHASE 2.7 INCOMPLETE - DO NOT START PHASE 3
