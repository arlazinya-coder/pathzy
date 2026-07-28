# PATHZY Current State Audit

Audit date: 2026-07-28
Repository: `C:\Users\DELL\Documents\Codex\2026-07-03\create-a-modern-mobile-first-web`
Branch audited: `feature/pathzy-v1-foundation`
Backup branch created: `backup/pathzy-safety-2026-07-28-v1-foundation`

## Repository Safety

- Current branch is `feature/pathzy-v1-foundation`.
- Current commit is `8229cf08 repair user opportunity actions database contract`.
- Remote exists: `origin` points to `https://github.com/arlazinya-coder/pathzy.git`.
- Working tree was already dirty before this audit. Modified files include auth, Professional Identity, routing, Home, application tracker, Supabase middleware, and regression test files.
- Untracked files before audit:
  - `app/employment-center/layout.tsx`
  - `app/employment-center/page.tsx`
  - `lib/navigation/auth-routing.ts`
- Audit validation generated a local `tsconfig.tsbuildinfo` modification. This is validation output, not product logic.
- No reset, destructive checkout, delete, install, upgrade, merge, rebase, or deploy was performed.

## Current Stack

- Frontend framework: Next.js App Router 15.5.20 with React 19. Evidence: `package.json`, `app/**/page.tsx`, `app/**/layout.tsx`.
- Backend architecture: Next.js route handlers and server components. Evidence: `app/api/**/route.ts`, `lib/supabase/server.ts`.
- Package manager: pnpm. Evidence: `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `package.json` scripts.
- Database: Supabase/Postgres. Evidence: `@supabase/supabase-js`, `@supabase/ssr`, `supabase/migrations/*.sql`, `.from(...)` calls across `app`, `components`, and `lib`.
- ORM: No ORM found. Supabase query builder is used directly.
- Authentication: Supabase Auth with SSR middleware/session handling. Evidence: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/middleware.ts`, `middleware.ts`, `components/auth/*`.
- Styling: Tailwind CSS plus shared CSS classes in `app/globals.css`; shared UI primitives in `components/ui.tsx`.
- Internationalisation: Partial bilingual copy modules exist, not a full i18n framework. Evidence: `lib/canonical-profile/canonical-profile-translations.ts`, `lib/job-intelligence/job-intelligence-translations.ts`.
- Testing: Node regression script plus TypeScript and ESLint. Evidence: `tests/regression.test.mjs`, `package.json`.
- PDF/document libraries: `pdf-parse`, `mammoth`, custom document render/export helpers. Evidence: `package.json`, `lib/professional-identity/cv-import.ts`, `components/professional-identity/document-downloads.ts`.
- Deployment: Next.js build configuration with Vercel-compatible App Router output. Evidence: `next.config.ts`, `package.json`.

## Environment Variables

Environment variable names are documented in `.env.example`; secret values were not printed.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_AUTH_GOOGLE_CLIENT_ID`
- `SUPABASE_AUTH_GOOGLE_SECRET`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `POSTHOG_KEY`

Runtime references:
- Supabase config: `lib/supabase/config.ts`
- OpenAI mentor/discovery: `lib/ai/mentor.ts`, `lib/discovery/openai-generator.ts`
- Launch/founder production checks: `app/founding-members/page.tsx`, `app/api/launch-membership/route.ts`

## Health Check Results

Commands run:

- `pnpm typecheck`: blocked by PowerShell script policy when invoked as `pnpm`; rerun as `pnpm.cmd typecheck`.
- `pnpm.cmd typecheck`: passed.
- `pnpm.cmd lint`: passed with 77 warnings and 0 errors.
- `pnpm.cmd run test:regression`: passed.
- `pnpm.cmd run build`: passed. Next.js compiled successfully and generated 63 static pages.
- Temporary dev server: started on `http://localhost:3120`, smoke checked, then stopped.

Smoke checks:

- `/` returned `200`.
- Protected routes returned `307` while logged out:
  - `/roadmap`
  - `/professional-identity`
  - `/employment-center`
  - `/applications`
  - `/opportunities`
  - `/professional-identity/cv`
  - `/professional-identity/cover-letter`
  - `/interview`
  - `/skills`

Warnings to address later:

- Many `@typescript-eslint/no-explicit-any` warnings across API and service layers.
- Several unused variables in document, canonical profile, and tracker modules.
- React hook dependency warnings in onboarding and professional document components.
- Public legal pages still include "launch placeholder" language.

## Product Flow Snapshot

- Public landing: `app/page.tsx`.
- Auth pages: `app/login/page.tsx`, `app/signup/page.tsx`, `components/auth/*`.
- Auth callback and post-auth routing: `app/auth/callback/route.ts`, `lib/navigation/auth-routing.ts`, `lib/supabase/middleware.ts`.
- Professional Identity: `app/professional-identity/page.tsx`, `components/professional-identity/profile-action-editor.tsx`.
- Review My Information: `app/professional-identity/page.tsx` renders review state and `ProfessionalIdentityReviewActions`.
- Finish Setup: `components/professional-identity/profile-action-editor.tsx` PATCHes `/api/professional-profile` with `action: "finishSetup"`.
- Personalised Home: `app/roadmap/page.tsx` uses `getPathzyNextAction`.
- Employment Center: `app/employment-center/page.tsx` is present in the working tree and routes to profile/document tools.
- CV: `app/professional-identity/cv/page.tsx` uses `ProfessionalIdentityTool`.
- Cover Letter: `app/professional-identity/cover-letter/page.tsx` uses `ProfessionalIdentityTool`.
- LinkedIn: `app/professional-identity/linkedin/page.tsx` uses `ProfessionalIdentityTool`.
- Opportunities: `app/opportunities/page.tsx`, `components/opportunities/opportunities-hub.tsx`.
- Applications: `app/applications/page.tsx` delegates to `EmploymentTrackerPage`.
- Interview Preparation: `app/interview/page.tsx`, `components/interview/interview-prep-client.tsx`.
- Career Growth: `app/skills/page.tsx` delegates to `ProgressPageContent`.

## Data Architecture Findings

Professional Identity is the intended source of truth, but the implementation is currently hybrid.

Current profile/document models:

- Legacy profile: `user_profiles`
- Discovery answers: `discovery_responses`
- Operational Professional Identity status: `professional_identity`
- Canonical profile: `canonical_professional_profiles`, `canonical_employments`, `canonical_education`, `canonical_skills`, `canonical_timeline_events`
- Legacy/generated document tables: `cv_documents`, `cover_letters`, `linkedin_profiles`, `recruiter_messages`, `follow_up_emails`, `career_passport_summaries`
- Unified uploads/documents: `user_documents`
- Professional document engine: `professional_documents`, `professional_document_fields`, `professional_document_exports`

Evidence:

- `lib/professional-identity/professional-identity-service.ts` reads and writes both legacy document tables and `user_documents`.
- `lib/canonical-profile/canonical-profile-service.ts` builds a canonical profile from `user_profiles`.
- `components/professional-identity/profile-action-editor.tsx` saves Professional Identity fields through `/api/professional-profile`.
- `lib/progress/next-action-engine.ts` calculates next action using `user_profiles`, `discovery_responses`, Professional Identity context, opportunity actions, applications, and interview preps.

## Security and Privacy Observations

- Protected routes are centralized in `lib/navigation/routes.ts` and enforced by `lib/supabase/middleware.ts`.
- Server-side auth is enforced with `requireAuthenticatedUser` in protected pages.
- Most Supabase reads/writes include `eq("user_id", user.id)` ownership checks.
- RLS depends on migrations in `supabase/migrations`; this audit did not connect to or mutate the database.
- Private data appears in Professional Identity, documents, applications, interview prep, follow-ups, and mentor contexts. These flows should avoid logs containing document contents.
- Risk: some modules still use broad `any` and direct Supabase rows, which makes privacy regressions easier to introduce.
