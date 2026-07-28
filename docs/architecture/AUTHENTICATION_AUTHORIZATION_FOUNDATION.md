# PATHZY Authentication, Language and Authorization Foundation

Status: Phase 2C foundation
Created: 2026-07-28

## Scope

Phase 2C adds shared contracts for authentication safety, independent language preferences, role-aware authorization, and owner access checks. It does not redesign screens, modify database schema, or change document/job/application feature behaviour.

## Authentication

Current runtime entry points remain:

- `components/auth/login-form.tsx`
- `components/auth/register-form.tsx`
- `components/auth/logout-button.tsx`
- `components/auth/reset-password-form.tsx`
- `components/auth/update-password-form.tsx`
- `app/auth/callback/route.ts`
- `app/api/auth/bootstrap/route.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`

Shared session-safety helpers live in `lib/auth/session-safety.ts`.

They define:

- safe authentication statuses
- friendly authentication messages
- expired-session detection
- centralized login redirect decisions
- safe destination preservation through the existing Route Engine

## Language Preferences

PATHZY supports five independent language preference layers:

1. Interface language
2. Professional document language
3. Career Coach language
4. Interview practice language
5. Notification/email language

The shared model lives in `lib/language/language-preferences.ts`.

Current storage remains unchanged. The compatibility map documents current and future storage:

- interface: `user_profiles.language`
- professional documents: `professional_identity.language`, `professional_documents.language`
- Coach: `pathzy_brain.language`
- interview practice: `interview_preps.language`
- notification/email: future preference storage

Changing the interface language must not automatically mutate document, Coach, interview, or notification languages.

## Authorization

Server-side authorization helpers live in `lib/access/authorization.ts`.

Supported roles:

- User
- Founder User
- Support
- Admin
- Super Admin
- Background Service

Roles remain separate from subscriptions, entitlements, account state, and founder status.

The helper provides:

- `normalizePathzyRole`
- `authorizeOwnerAccess`
- `authorizeFeatureAccess`
- `assertAuthorized`

Client-side checks may hide actions, but server-side routes and Supabase RLS remain authoritative.

## Future Onboarding Insertion Points

The route/auth foundation supports this future flow without changing route architecture:

```text
Welcome
  -> Interface Language
  -> Document Language
  -> Career Coach Language
  -> Interview Practice Language
  -> Notification Language
  -> Professional Identity
```

Those screens are intentionally not built in Phase 2C.
