# PATHZY Route and Flow Map

Audit date: 2026-07-28

## Central Route Definitions

Primary route source: `lib/navigation/routes.ts`.

Canonical routes currently defined:

- Landing: `/`
- Login: `/login`
- Signup: `/signup`
- Auth callback: `/auth/callback`
- Forgot password: `/auth/reset-password`
- Reset password: `/auth/update-password`
- Professional Identity: `/professional-identity`
- Home / My Employment Journey technical route: `/roadmap`
- Employment Center: `/employment-center`
- CV Builder: `/professional-identity/cv`
- Cover Letter: `/professional-identity/cover-letter`
- LinkedIn Optimizer: `/professional-identity/linkedin`
- My Documents: `/professional-identity/documents`
- Opportunities: `/opportunities`
- Applications: `/applications`
- Interview Preparation: `/interview`
- Career Analytics: `/applications#career-analytics`
- Coach: `/mentor`
- Skills & Career Growth: `/skills`
- Billing: `/billing`
- Settings: `/settings`

Legacy aliases still present:

- `/dashboard`
- `/cv-builder`
- `/employment-tracker`
- `/progress`
- `/pricing`
- `/register`

Evidence:

- Route constants: `lib/navigation/routes.ts`
- Redirect pages: `app/dashboard/page.tsx`, `app/cv-builder/page.tsx`, `app/employment-tracker/page.tsx`, `app/progress/page.tsx`, `app/profile/page.tsx`, `app/register/page.tsx`

## Protection and Auth Flow

- Middleware entry: `middleware.ts`
- Session update and protected-route redirect: `lib/supabase/middleware.ts`
- Server auth guard: `lib/supabase/server.ts`
- Post-auth routing helper: `lib/navigation/auth-routing.ts`

Observed flow:

1. Logged-out protected route request redirects to `/login?redirectTo=...`.
2. Auth pages redirect logged-in users through `getPostAuthDestination`.
3. Incomplete Professional Identity users are routed to `/professional-identity?section=...`.
4. Users with required Professional Identity complete but not confirmed are routed to `/professional-identity?review=1`.
5. Completed users route to Home at `/roadmap` unless a safe requested destination exists.

## Home Flow

Home route: `app/roadmap/page.tsx`.

Four cards currently implemented:

1. Continue Your Employment Journey
   - Primary CTA: `Continue`
   - Destination: `nextAction.destinationRoute`
   - Source: `lib/progress/next-action-engine.ts`
2. Employment Center
   - Primary CTA: `Open Employment Center`
   - Destination: `appRoutes.employmentCenter`
   - Current route value: `/employment-center`
   - Secondary CTA: `Open Documents`
   - Destination: `appRoutes.documents`
3. Opportunities
   - Primary CTA: `Find Opportunities`
   - Destination: `appRoutes.opportunities`
   - No direct Applications shortcut observed in current Home file.
4. Insights & Coach
   - Primary CTA: `Ask Coach`
   - Destination: `appRoutes.mentor`
   - Secondary CTA: `View Insights`
   - Destination: `appRoutes.careerAnalytics`

Known navigation-defect status:

- "Continue incorrectly opening Build My Cover Letter": current logic can legitimately route to Cover Letter if CV exists and cover letter is the next incomplete milestone. For incomplete Professional Identity, current code routes to `profileResumeRoute(...)` instead. Evidence: `lib/progress/next-action-engine.ts`.
- "Open Employment Center incorrectly opening Track My Application": current route map sets `EMPLOYMENT_CENTER` to `/employment-center`, not `/applications`. Evidence: `lib/navigation/routes.ts`, `app/employment-center/page.tsx`, `app/roadmap/page.tsx`.

## Employment Center

Route: `/employment-center`

Files:

- `app/employment-center/layout.tsx`
- `app/employment-center/page.tsx`

Current hub links:

- My Professional Profile -> `appRoutes.professionalIdentity`
- CV Builder -> `appRoutes.professionalIdentityCv`
- Cover Letter -> `appRoutes.professionalIdentityCoverLetter`
- LinkedIn -> `appRoutes.professionalIdentityLinkedin`
- My Documents -> `appRoutes.documents`
- Career Passport -> `appRoutes.professionalIdentityCareerPassport`

This route is protected through `protectedRoutes` in `lib/navigation/routes.ts`.

## Applications Access

Applications canonical route: `/applications`

Intended access points currently observed:

- Main operating-system navigation: `lib/operating-system/employment-operating-system.ts`
- Applications page: `app/applications/page.tsx`
- Legacy employment tracker redirect: `app/employment-tracker/page.tsx`
- Opportunity flow after applied action: `components/opportunities/opportunities-hub.tsx`
- Smart application workspace ready state: `components/opportunities/opportunities-hub.tsx`
- Interview prep "Go to Applications": `components/interview/interview-prep-client.tsx`
- Analytics follow-up action: `lib/analytics/career-analytics-service.ts`
- Job match action: `lib/job-intelligence/job-match-engine.ts`

Potential issue:

- `lib/progress/progress-engine.ts` still has an `applications` milestone with `primaryRoute` from `getJourneyRoute("applications")`. This is acceptable only when the next-action engine determines the user is at the application stage.

## Hardcoded Link Findings

Centralized route use is improving but not complete.

Examples of remaining literal internal paths:

- `components/auth/logout-button.tsx` uses `"/login"`.
- `components/upgrade/premium-upgrade-card.tsx` uses `"/billing"`.
- `components/roadmap/select-career-button.tsx` falls back to `"/missions"`.
- `components/professional-identity/my-documents-client.tsx` links to `"/professional-identity/cv"`.
- `components/opportunities/opportunities-hub.tsx` contains literal document/interview routes with query strings.
- `app/progress/page.tsx` has literal `/missions` and `/professional-identity/cv` CTAs.
- Public landing `app/page.tsx` uses anchor links and literal legal-page links.
- QA page `app/qa-pathzy-journey/page.tsx` contains literal test links.

Recommendation:

- Keep `lib/navigation/routes.ts` as canonical route source.
- Add route builder helpers for routes with query strings, especially CV, cover letter, interview, applications, and mentor contexts.
- Do not delete legacy routes until their redirects and analytics are verified.

## Phase 2B Route Foundation Update

Implementation date: 2026-07-28

Canonical route registry location:

- `lib/navigation/routes.ts`

Route ownership added:

- `routeGroups.public`
- `routeGroups.authentication`
- `routeGroups.onboarding`
- `routeGroups.application`
- `routeGroups.admin`
- `routeGroups.legacyAliases`

Typed route builders added:

- `routeBuilders.login(returnTo)`
- `routeBuilders.professionalIdentitySection(sectionId, returnTo)`
- `routeBuilders.professionalIdentityReview(returnTo)`
- `routeBuilders.professionalIdentityFinish(returnTo)`
- `routeBuilders.employmentDiagnosis(reason)`
- `routeBuilders.cvWorkspace({ intent, documentId, returnTo })`
- `routeBuilders.coverLetterWorkspace({ applicationId, jobId, documentId, returnTo })`
- `routeBuilders.linkedinWorkspace(documentId)`
- `routeBuilders.jobMatch(jobId, returnTo)`
- `routeBuilders.applicationDetail(applicationId, returnTo)`
- `routeBuilders.interviewPreparation(applicationId, type)`
- `routeBuilders.coachContext(contextType, entityId)`
- `routeBuilders.withReturnTo(pathname, returnTo)`
- `safeRedirectDestination(target, fallback)`

Onboarding state source:

- `lib/navigation/auth-routing.ts`

Implemented onboarding states:

- `unauthenticated`
- `authenticated_language_pending`
- `identity_not_started`
- `identity_in_progress`
- `identity_review_pending`
- `identity_finish_pending`
- `diagnosis_pending`
- `diagnosis_complete`
- `home_ready`

Compatibility notes:

- Final interface-language persistence is not yet present in the current runtime schema. Phase 2B therefore treats language as selected unless an explicit resolver fact says `interfaceLanguageSelected: false`. This avoids trapping existing users while keeping the state model testable.
- Final Employment Diagnosis persistence is not yet present everywhere. Phase 2B therefore treats completed legacy setup as diagnosis complete unless an explicit resolver fact says `diagnosisComplete: false`.
- `/roadmap` remains the technical route for Personalised Home during compatibility. User-facing language should be Home, Personalised Home, or My Employment Journey depending on context, not a permanent product name of "Roadmap".
- The current Professional Identity UI has fewer renderer steps than the 23 canonical sections. Phase 2B maps canonical section IDs such as `personal_information`, `work_authorization`, `career_goal`, and `employment_preferences` to the existing guided editor renderers instead of creating a second editor.

Known defects addressed:

- `Continue` now resolves setup states through `resolvePathzyNextRoute`.
- Document milestones such as Cover Letter no longer make Home's `Continue` destination a Cover Letter route; document milestones route through Employment Center.
- `Open Employment Center` remains `/employment-center`.
- Applications remain `/applications` and are not used as the Employment Center fallback.
- Unsafe external return URLs and auth-route return URLs are rejected by the route registry.

Remaining hardcoded route issues:

- Some lower-priority component and public-page links still contain literal routes. They are documented as compatibility debt and should be migrated incrementally after Phase 2B without changing product behaviour.

## Local Route Structure

Routes observed from the production build include:

- `/`
- `/roadmap`
- `/professional-identity`
- `/employment-center`
- `/professional-identity/cv`
- `/professional-identity/cover-letter`
- `/professional-identity/linkedin`
- `/professional-identity/documents`
- `/opportunities`
- `/applications`
- `/interview`
- `/skills`
- `/billing`
- `/settings`
- `/mentor`
- `/missions`
- `/achievements`
- `/discovery`
- Legacy redirects: `/dashboard`, `/cv-builder`, `/employment-tracker`, `/progress`, `/profile`, `/register`

Smoke check:

- `/` returned 200.
- Protected routes returned 307 while logged out.
