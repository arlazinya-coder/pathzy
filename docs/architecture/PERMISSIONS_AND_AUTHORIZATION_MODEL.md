# PATHZY Permissions and Authorization Model

Status: Phase 1.5 blueprint
Created: 2026-07-28

## 1. Principle

Do not rely on client-side role checks.

Authorization must be enforced server-side through:

- Supabase Auth
- server route/action checks
- Supabase Row-Level Security
- centralized permission helpers
- audit events for sensitive actions

## 2. Roles

| Role | Description |
| --- | --- |
| User | Standard authenticated PATHZY user |
| Founder user | Early user with enhanced access during founder/private beta period |
| Support | Limited operational support role |
| Admin | Administrative user with approved management capabilities |
| Super Admin | Highest operational authority, tightly restricted |
| Service role/background process | Server-only process for trusted internal jobs |

Roles are not the same as subscription entitlements. A paid user may still be a User role.

## 3. Allowed and Prohibited Actions

| Role | Allowed | Prohibited |
| --- | --- | --- |
| User | Own profile, own documents, own jobs, own applications, own interviews, own downloads if entitled | Access other users, admin lists, raw system logs, service operations |
| Founder user | User actions plus enhanced feature access | Admin data access unless separately admin-authorized |
| Support | Account lookup, safe status review, limited troubleshooting metadata | Reading document bodies by default, modifying user identity without consent, billing secrets |
| Admin | User management workflows, beta/founder management, policy-reviewed operational actions | Silent impersonation, unrestricted document browsing, bypassing audit |
| Super Admin | Restricted emergency and platform operations | Routine support use, unaudited data access |
| Service role/background process | Internal scheduled jobs and trusted server tasks | Client exposure, user-initiated unapproved external sends |

## 4. Row Ownership

Every user-data table should include ownership or access controls.

Expected pattern:

- records include `user_id` where owner-scoped
- RLS allows authenticated users to access their own records
- server routes also filter by `user_id`
- service-role processes must validate intended ownership before acting

## 5. Supabase RLS Responsibilities

RLS should protect:

- Professional Identity
- canonical profile entities
- documents
- uploads
- job imports
- saved opportunities
- applications
- timeline events
- notes
- contacts
- interview preparation
- follow-ups
- analytics
- Coach memory or context

RLS is not optional for user-data tables.

## 6. Server-Side Authorization

Server-side checks must enforce:

- authenticated user
- record ownership
- role or entitlement
- action-specific permission
- requested route safety
- file ownership
- admin scope

Client-side checks may hide buttons but cannot be trusted.

## 7. Audit Requirements

Audit events are required for:

- admin or support user lookup
- role or entitlement changes
- document export
- application package approval
- application stage changes
- outbound message approval
- follow-up mark sent
- data export
- account deletion
- security-sensitive failures

Audit events should avoid storing full document bodies or private notes.

## 8. Support Access

Support access must be least-privilege:

- show account metadata needed for troubleshooting
- show high-level completion and status signals
- mask sensitive fields by default
- require elevated approval to inspect sensitive data
- record all access

Support must not see raw CVs, cover letters, private notes, uploaded documents, or AI prompts by default.

## 9. Admin Access

Admin access may include:

- invite tester
- grant or revoke beta/founder access
- extend expiry
- view status and high-level completion
- manage operational flags

Admin access must not become a general bypass for user privacy.

## 10. Account Lookup

Account lookup should use:

- user ID
- email search with masking where possible
- status filters

Avoid exposing:

- full document content
- private notes
- raw uploads
- sensitive application details

## 11. Billing Access

Billing access should expose only:

- entitlement status
- plan type
- billing provider customer reference
- action availability
- expiry where relevant

Do not expose payment method details beyond what the billing provider safely returns.

## 12. Document Access

Document bodies are sensitive.

Rules:

- owner can access own documents
- generated exports require entitlement where gated
- support/admin access requires explicit scope and audit
- document previews must not leak between users
- uploaded files must be validated and owner-scoped

## 13. Impersonation Policy

Default: no silent impersonation.

If future impersonation is implemented:

- require Super Admin or approved support workflow
- show visible impersonation banner
- audit start and stop
- block sensitive actions such as payments, exports, and sends unless explicitly allowed

## 14. Sensitive-Data Masking

Mask or omit:

- private document bodies
- raw CV import text
- private notes
- phone numbers where not needed
- exact address where not needed
- uploaded file contents
- AI prompts containing personal data
- tokens and secrets

## 15. Permission Helper Direction

Future helper shape:

```text
canAccessFeature(actor, feature, resourceContext)
canPerformAction(actor, action, resourceContext)
assertServerPermission(actor, action, resourceContext)
```

The helper should return:

- allowed
- reason
- safe user-facing message
- audit requirement

## 16. Stop Conditions

Stop implementation if:

- a client-side role check is the only protection
- a service role is exposed to the browser
- admin can read documents without audit
- one user can query another user's data
- premium gates fork the route implementation
