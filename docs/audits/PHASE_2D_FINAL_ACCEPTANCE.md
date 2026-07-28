# PATHZY Phase 2D Final Acceptance Notes

Date: 2026-07-28
Branch: feature/pathzy-v1-foundation

## Translation Architecture

Phase 2 journey copy is centralized in `lib/language/pathzy-i18n.ts`.

- `pathzyT()` covers locked base keys for public, auth, onboarding, and Professional Identity shell copy.
- `pathzyPhase2T()` covers Phase 2 acceptance copy that should not expand the original union on every small UI label.
- `publicLandingContent` contains the public landing content, including sections, FAQ, pricing, testimonials, and footer copy.
- `professionalIdentityFieldText()`, `professionalIdentityStepText()`, and `professionalIdentityImportanceLabel()` localize field labels, placeholders, step descriptions, guidance, and required/recommended/optional states.
- `employmentDiagnosisSteps` localizes the `/discovery` compatibility route as Employment Diagnosis / Diagnostic d'employabilite.

## Translation Inventory

Covered in this acceptance pass:

- Public landing navigation, hero, feature labels, pricing, testimonials, FAQ, footer, and language selector.
- Signup/login language selectors and auth form errors.
- Password reset and password update page headers, labels, placeholders, loading, success, and failure text.
- Account setup warning and logout label.
- Onboarding welcome, interface-language, document-language, Career Coach, progress, buttons, and save states.
- Professional Identity step names, visible field labels, placeholders, repeatable actions, locked-state labels, guidance, review state, and finish setup actions.
- Employment Diagnosis transition route copy, progress, buttons, validation, login failure, and general failure text.
- Navigation labels already flow through `pathzyNavigationLabel()`.

Later-module scope not completed by Phase 2D:

- Deep post-setup modules such as CV Studio, Cover Letter Studio, LinkedIn Studio, applications, interviews, analytics, billing, and mentor require later full-module translation passes.

## Language Persistence Rules

- Public language selection persists through localStorage and the `pathzy_interface_language` cookie.
- Authenticated selector changes update `user_profiles` where Supabase is configured.
- Interface language and professional document language remain separate fields.
- HTML `lang` is updated client-side by the language selector.
- No country flags are used.

## Step Locking Rules

- Brand-new users enter the Welcome stage.
- Completed steps can be reopened.
- The current step and next valid step are accessible.
- Future required steps are disabled and include explanatory text.
- Optional sections do not permanently block setup.
- Review is available only after required setup is complete.

## Save And Resume Behaviour

- Step changes autosave through `/api/professional-profile`.
- Continue/Back/Review wait for persistence and stop on save failure.
- Failed saves preserve typed values on screen and show a translated retry state.
- The active guided step is stored locally to support resume.
- Auth routing resumes incomplete Professional Identity sections from centralized route decisions.

## Review And Finish

- Review My Information / Verifier mes informations shows required, recommended, and optional information separately.
- Missing required information prevents Finish Setup.
- Finish Setup writes completion flags and routes to `/discovery?reason=setup-complete`.
- `/discovery` remains a legacy technical alias but displays Employment Diagnosis / Diagnostic d'employabilite.

## Automated Validation

- `pnpm typecheck`: PASS
- `pnpm run test:regression`: PASS
- `pnpm run lint`: PASS with pre-existing warnings only
- `pnpm run build`: PASS
- `git diff --check`: PASS
- Conflict marker scan over source/docs/tests: PASS
- Secret-pattern scan over source/docs/tests: PASS; only placeholders/test regex/CSS mask keyword were reported after excluding env files

## Browser QA Status

Real signed-in English and French journeys still require live local browser execution with safe local test accounts.

Phase 2D must not be marked final PASS until:

- English signed-in onboarding, save/resume, Review, Finish Setup, and Employment Diagnosis transition are completed.
- French signed-in onboarding, save/resume, Review, Finish Setup, and Diagnostic d'employabilite transition are completed.
- Desktop and mobile browser layouts are checked for the accepted Phase 2 journey.
