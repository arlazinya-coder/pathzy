# PATHZY Current-to-Target Gap Map

Status: Initial Phase 1 gap map
Created: 2026-07-28
Evidence:
- `docs/audits/CURRENT_STATE_AUDIT.md`
- `docs/audits/ROUTE_AND_FLOW_MAP.md`
- `docs/audits/RISK_REGISTER.md`
- `docs/architecture/TARGET_ARCHITECTURE.md`

Classifications:

- Existing and aligned
- Existing but incomplete
- Existing but architecturally conflicting
- Missing
- Requires migration
- High risk

## Summary Table

| Area | Classification | Evidence | Gap |
| --- | --- | --- | --- |
| Authentication | Existing but incomplete | `app/login/page.tsx`, `app/signup/page.tsx`, `components/auth/*`, `app/auth/callback/route.ts`, `lib/supabase/middleware.ts`, `lib/navigation/auth-routing.ts` | Auth exists and protected redirects work in smoke tests, but redirect and Professional Identity resume logic must remain centralized and tested. |
| Languages | Existing but incomplete | `lib/canonical-profile/canonical-profile-translations.ts`, `lib/job-intelligence/job-intelligence-translations.ts` | Partial English/French modules exist, but there is no full language preference model for interface, documents, Coach, interviews, and notifications. |
| Professional Identity | Requires migration | `app/professional-identity/page.tsx`, `components/professional-identity/profile-action-editor.tsx`, `lib/professional-identity/professional-identity-service.ts`, `lib/canonical-profile/canonical-profile-service.ts` | Professional Identity is intended source of truth, but legacy, transitional, and canonical data models are active. |
| Review My Information | Existing but incomplete | `app/professional-identity/page.tsx`, `components/professional-identity/profile-action-editor.tsx` | Review flow exists, but it must remain tied to Professional Identity completion and diagnosis readiness. |
| Finish Setup | Existing but incomplete | `components/professional-identity/profile-action-editor.tsx`, `app/api/professional-profile/route.ts` | Finish action exists through profile API, but schema and canonical integration must be verified. |
| Employment Diagnosis | Existing but incomplete | `lib/progress/next-action-engine.ts`, `lib/progress/journey-router.ts`, `lib/analytics/career-analytics-service.ts` | Readiness and next action logic exists, but a clear diagnosis layer must precede Personalised Home. |
| Personalised Home | Existing and aligned | `app/roadmap/page.tsx`, `lib/progress/next-action-engine.ts` | Home exists and uses next-action logic. User-facing naming and route centralization should continue to improve. |
| Employment Center | Existing but incomplete | `app/employment-center/page.tsx`, `app/employment-center/layout.tsx` | Hub exists in working tree and points to document tools, but must remain distinct from Applications. |
| CV | Existing but incomplete | `app/professional-identity/cv/page.tsx`, `components/professional-identity/professional-identity-tool.tsx`, `lib/professional-identity/cv-import.ts` | Strong CV work exists, but must remain an output of Professional Identity and not become onboarding source of truth. |
| Cover Letter | Existing but incomplete | `app/professional-identity/cover-letter/page.tsx`, `components/professional-identity/professional-identity-tool.tsx` | Cover Letter exists, but must remain linked to Professional Identity and job context. |
| LinkedIn | Existing but incomplete | `app/professional-identity/linkedin/page.tsx`, `components/professional-identity/professional-identity-tool.tsx` | LinkedIn tool exists, but must stay document-specific and not reuse CV preview logic incorrectly. |
| Professional Bio | Missing | No confirmed dedicated route found in Phase 0 audit | Needs product definition and route decision before implementation. |
| Opportunities | Existing but incomplete | `app/opportunities/page.tsx`, `components/opportunities/opportunities-hub.tsx`, `lib/job-intelligence/job-match-engine.ts` | Opportunities exist, but job intelligence and matching must stay explainable and identity-grounded. |
| Saved Jobs | Existing but incomplete | `components/opportunities/opportunities-hub.tsx`, `public.user_opportunity_actions` repair context | Saved actions require verified runtime schema and central route behaviour. |
| Applications | Existing but incomplete | `app/applications/page.tsx`, Phase 9 tracker modules in working tree | Tracker exists, but must remain Success Center operational view and not be confused with Employment Center. |
| Interview Preparation | Existing but incomplete | `app/interview/page.tsx`, `components/interview/interview-prep-client.tsx` | Interview prep exists, but must remain job-specific and evidence-grounded. |
| Career Coach | Existing but incomplete | `components/mentor/floating-mentor-button.tsx`, `lib/ai/mentor.ts` | Coach exists, but language preference, evidence boundaries, and privacy rules need centralization. |
| Career Growth | Existing but incomplete | `app/skills/page.tsx`, `lib/analytics/career-analytics-service.ts` | Skills/growth route exists, but Career Growth pillar needs clearer domain boundaries. |
| Payments | Existing but incomplete | `app/billing/page.tsx`, `components/upgrade/premium-upgrade-card.tsx`, launch membership API references | Premium gates exist, but value-before-paywall and central entitlement service must remain enforced. |
| Security | High risk | `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `supabase/migrations/*.sql`, RLS audit findings | Schema drift and RLS verification remain launch-critical. Logs must remain sanitized. |
| Admin | Missing | No full admin beta/founder management interface confirmed in Phase 0 audit | Founder access rules are documented, but implementation requires separate scope. |
| Analytics | Existing but incomplete | `lib/analytics/career-analytics-service.ts`, `app/applications/page.tsx` | Analytics exist, but privacy-safe measurement and audit boundaries need strengthening. |
| File uploads | Existing but incomplete | `lib/professional-identity/cv-import.ts`, document import API routes | Upload/import exists, but secure upload boundary and schema verification remain important. |
| PDF generation | Existing but incomplete | document download/render helpers, CV/Cover Letter tools | PDF generation exists, but preview/export parity and A4 rendering standards remain product-critical. |

## High-Risk Migration Areas

### 1. Hybrid Professional Identity Models

Classification: High risk

Evidence:

- `lib/professional-identity/professional-identity-service.ts`
- `lib/canonical-profile/canonical-profile-service.ts`
- `app/professional-identity/page.tsx`

Current issue:

`user_profiles`, `professional_identity`, canonical tables, legacy document tables, `user_documents`, and `professional_documents` all remain relevant in different areas.

Target:

Professional Identity and canonical profile services become the authoritative identity layer, with compatibility adapters for legacy records.

### 2. Legacy Document Tables

Classification: Requires migration

Evidence:

- `cv_documents`
- `cover_letters`
- `linkedin_profiles`
- `recruiter_messages`
- `follow_up_emails`
- `career_passport_summaries`
- `professional_documents`
- `user_documents`

Current issue:

Historical document tables and newer professional document architecture overlap.

Target:

Document storage, versions, sync status, and export records must be classified as canonical, compatibility, or removable.

### 3. Route Centralization

Classification: Existing but incomplete

Evidence:

- `lib/navigation/routes.ts`
- remaining literal links noted in `docs/audits/ROUTE_AND_FLOW_MAP.md`

Current issue:

Route constants exist, but some CTAs still use hardcoded internal paths.

Target:

All major CTAs use route helpers, and query-string route builders exist where needed.

### 4. Manual Supabase Migration Process

Classification: High risk

Evidence:

- `supabase/migrations/*.sql`
- Phase 0 Risk Register database/schema drift finding

Current issue:

The project relies on manual SQL Editor migrations and current-runtime schema verification.

Target:

Database verification should check only current production-critical runtime dependencies, RLS, policies, indexes, triggers, and functions.

### 5. Internationalisation

Classification: Existing but incomplete

Evidence:

- `lib/canonical-profile/canonical-profile-translations.ts`
- `lib/job-intelligence/job-intelligence-translations.ts`

Current issue:

Partial bilingual architecture exists but does not cover interface, documents, Coach, interview practice, and notifications as separate preference layers.

Target:

Central language preferences and translation boundaries.

## Recommended Migration Order

1. Preserve current working tree and backup branches.
2. Freeze architecture decisions and definitions.
3. Stabilize canonical routes and CTA ownership.
4. Complete Professional Identity source-of-truth contract.
5. Build Employment Diagnosis as the bridge to Personalised Home.
6. Classify document tables and engines.
7. Verify current runtime database schema.
8. Move job, application, interview, follow-up, Coach, and analytics services onto canonical identity contracts.
9. Add full multilingual preference model.
10. Review security, RLS, uploads, AI boundaries, and audit logging before launch.
