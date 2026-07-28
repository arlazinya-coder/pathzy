# PATHZY Risk Register

Audit date: 2026-07-28

## High Priority

1. Hybrid Professional Identity models
   - Evidence: `lib/professional-identity/professional-identity-service.ts`, `lib/canonical-profile/canonical-profile-service.ts`, `app/professional-identity/page.tsx`.
   - Risk: `user_profiles`, `professional_identity`, canonical tables, legacy document tables, `user_documents`, and `professional_documents` are all active in different areas.
   - Impact: inconsistent source of truth, stale document generation, broken profile completion rules.
   - Recommendation: define a migration and adapter plan before Phase 1 product changes.

2. Legacy document tables still actively referenced
   - Evidence: `lib/professional-identity/professional-identity-service.ts`, `app/professional-identity/documents/page.tsx`.
   - Tables: `cv_documents`, `cover_letters`, `linkedin_profiles`, `recruiter_messages`, `follow_up_emails`, `career_passport_summaries`.
   - Risk: database verification may flag old tables as missing while newer document architecture exists.
   - Recommendation: decide which legacy tables remain launch-critical and which should become compatibility-only.

3. Route centralization incomplete
   - Evidence: `lib/navigation/routes.ts`, `components/opportunities/opportunities-hub.tsx`, `components/professional-identity/my-documents-client.tsx`, `components/upgrade/premium-upgrade-card.tsx`, `app/progress/page.tsx`.
   - Risk: future CTA changes require edits in multiple files.
   - Recommendation: add route builder helpers for query-string destinations.

4. Database/schema drift risk
   - Evidence: 36 migrations in `supabase/migrations`; manual SQL Editor migration process previously reported.
   - Risk: runtime errors if live Supabase is missing tables such as document inspection, canonical profile, job intelligence, or Phase 9 application tables.
   - Recommendation: maintain a current-runtime schema verification script and avoid broad historical migration comparisons.

## Medium Priority

5. Lint warning volume
   - Evidence: `pnpm.cmd lint` passed with 77 warnings.
   - Common warnings: `no-explicit-any`, unused variables, React hook dependency warnings.
   - Risk: real type and lifecycle issues can hide in warning noise.
   - Recommendation: reduce warnings by subsystem, starting with auth/profile/document services.

6. Console logging of sensitive contexts
   - Evidence: `lib/professional-identity/professional-identity-service.ts` logs save failures; `lib/canonical-profile/canonical-profile-service.ts` logs canonical profile initialization/fallback; `app/roadmap/page.tsx` logs query errors.
   - Risk: future logs may accidentally include profile/document content.
   - Recommendation: adopt sanitized server logging helpers.

7. Placeholder legal pages
   - Evidence: `app/privacy/page.tsx`, `app/terms/page.tsx`.
   - Risk: not launch-ready for a product storing employment, profile, document, and application data.
   - Recommendation: legal review before public launch.

8. Partial internationalisation
   - Evidence: `lib/canonical-profile/canonical-profile-translations.ts`, `lib/job-intelligence/job-intelligence-translations.ts`.
   - Risk: English/French coverage exists in pockets but not across all product flows.
   - Recommendation: centralize copy keys before expanding bilingual UX.

9. Development/build artifacts in working tree
   - Evidence: `tsconfig.tsbuildinfo` became modified after health checks.
   - Risk: generated files can pollute real implementation diffs.
   - Recommendation: exclude or restore generated validation artifacts before implementation commits.

## Low Priority

10. Route labels still reflect older architecture in some places
    - Evidence: `lib/progress/progress-engine.ts` uses milestone titles like "Complete Profile", "Build CV"; Home now frames PATHZY as Employment Operating System.
    - Risk: user experience may feel CV-first in some next-action states.
    - Recommendation: copy review after source-of-truth architecture is settled.

11. Public landing still includes "Track Applications" in feature copy
    - Evidence: `app/page.tsx`.
    - Risk: not necessarily wrong, but could confuse the distinction between Employment Center and Applications.
    - Recommendation: review in a separate landing-page copy pass.

12. Multiple "document" concepts
    - Evidence: `user_documents`, `professional_documents`, legacy `cv_documents` and `cover_letters`.
    - Risk: support/debug complexity.
    - Recommendation: produce a document data lineage diagram before removing anything.

## Actions Intentionally Not Taken

- No database migrations were executed.
- No application code was changed for product behavior.
- No dependency install, upgrade, or removal was performed.
- No reset, checkout, merge, rebase, stash, clean, delete, deploy, or push was performed.
- No secrets or `.env.local` values were printed.
