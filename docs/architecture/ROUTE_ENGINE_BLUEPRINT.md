# PATHZY Route Engine Blueprint

Status: Phase 1.5 blueprint
Created: 2026-07-28

## 1. Purpose

The Route Engine is the authoritative route registry and navigation decision service for PATHZY.

It prevents duplicated page-level navigation logic and ensures every CTA has one intended destination.

## 2. Locked Journey

The Route Engine must enforce:

```text
Authentication
  -> Interface language
  -> Professional Identity guided setup
  -> Review My Information
  -> Finish Setup
  -> Employment Diagnosis
  -> Personalised Home
  -> PATHZY ecosystem
```

Continue must resume the next incomplete Professional Identity section during setup. It must never redirect to Cover Letter merely because a document milestone is incomplete.

## 3. Route Ownership

The route registry owns:

- public routes
- authentication routes
- onboarding routes
- Professional Identity routes
- Review My Information route/state
- Finish Setup route/action
- Employment Diagnosis route/state
- Personalised Home route
- Employment Center routes
- Opportunities
- Saved Jobs
- Applications
- Interview Preparation
- Career Growth
- Settings
- Billing
- Admin

## 4. Route Constant Groups

Recommended grouping:

```text
publicRoutes
authRoutes
setupRoutes
homeRoutes
employmentCenterRoutes
opportunityRoutes
successCenterRoutes
growthRoutes
accountRoutes
adminRoutes
legacyAliases
```

## 5. Typed Route Builders

Route builders should own query-string handling.

Examples:

- `professionalIdentitySection(sectionId)`
- `professionalIdentityReview()`
- `employmentDiagnosis(reason)`
- `cvWorkspace(intent, documentId)`
- `coverLetterWorkspace(applicationId, jobId)`
- `jobMatch(jobId)`
- `applicationDetail(applicationId)`
- `interviewPreparation(applicationId, type)`
- `coachContext(contextType, entityId)`

No page should hand-build complex query strings when a builder exists.

## 6. Route Guards

Guard types:

| Guard | Purpose |
| --- | --- |
| public | Available without auth |
| auth-only | Login, signup, password reset |
| protected | Requires authenticated user |
| setup-required | Requires Professional Identity setup state |
| setup-complete | Requires sufficiently completed Professional Identity |
| entitlement-action | Same route, action gated by permission |
| admin-only | Server-side admin authorization required |

Client-side checks may improve UX, but server-side checks are authoritative.

## 7. Onboarding State Transitions

| State | Destination |
| --- | --- |
| unauthenticated | Login or Signup |
| authenticated, no interface language | Interface language selection |
| language selected, identity incomplete | Next incomplete Professional Identity section |
| identity complete, not reviewed | Review My Information |
| reviewed, not finished | Finish Setup |
| finished, no diagnosis | Employment Diagnosis |
| diagnosis complete | Personalised Home |
| ecosystem route requested and allowed | Requested route |

## 8. Fallback Behaviour

Fallback rules:

- unauthenticated protected request -> login with safe return destination
- authenticated unknown state -> Professional Identity, not legacy dashboard
- invalid setup section -> first incomplete valid Professional Identity section
- unsafe redirect target -> Personalised Home or Professional Identity depending on setup state
- missing entity route parameter -> parent hub
- premium action without access -> same page with upgrade explanation at action point

## 9. Invalid-State Handling

Invalid states should not crash.

Examples:

- user has diagnosis but missing identity record -> route to Professional Identity repair path
- document route requested without document -> open workspace empty state
- application detail missing -> Applications list with warning
- stale job match -> Opportunities/job match refresh action

## 10. Migration Away From Hardcoded Links

Phase 0 found literal internal paths in several files.

Migration plan:

1. Keep `lib/navigation/routes.ts` as current route source.
2. Add typed builders for query-string routes.
3. Replace literal internal links by subsystem.
4. Add tests for each main CTA and legacy alias.
5. Keep legacy aliases until analytics and redirects are verified.

## 11. Tests

Required tests:

- locked onboarding journey order
- logged-out protected route returns to intended safe route
- incomplete identity Continue resumes identity setup
- complete identity Continue can use ecosystem next action
- Employment Center opens `/employment-center`
- Applications are not used as Employment Center fallback
- legacy aliases redirect to canonical routes
- invalid redirect targets are rejected
- premium gates do not fork routes

## 12. Non-Goals for V1

- no separate mobile route implementation
- no membership-specific route forks
- no deletion of legacy aliases before verification
- no route decisions inside template or document renderers
