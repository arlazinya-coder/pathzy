# PATHZY Sync Engine Blueprint

Status: Phase 1.5 blueprint
Created: 2026-07-28

## 1. Purpose

The Sync Engine defines how Professional Identity changes affect downstream modules.

It does not automatically regenerate paid or AI-generated content after every edit. Its default behaviour is to mark dependent content outdated, recalculate deterministic signals where safe, and ask for user-approved regeneration when content changes require AI or premium document updates.

## 2. Sync Action Types

| Action | Meaning |
| --- | --- |
| Refresh completeness | Recalculate Professional Identity setup progress |
| Refresh diagnosis | Mark Employment Diagnosis stale or request deterministic refresh |
| Refresh readiness | Recalculate readiness where deterministic |
| Mark CV outdated | CV needs review because source identity changed |
| Mark cover letter outdated | Cover Letter needs review because source identity or job context changed |
| Mark LinkedIn outdated | LinkedIn content needs review |
| Recalculate matches | Non-AI match/readiness scores can refresh |
| Refresh Career Passport | Career Passport needs refresh or stale mark |
| Refresh Home | Personalised Home next action may change |
| Notify Coach context | Coach context cache should update or be marked stale |
| No downstream action | Change has no immediate downstream effect |

## 3. Automatic vs User-Approved Work

| Work type | Default rule |
| --- | --- |
| Marking content outdated | Automatic |
| Deterministic completeness and readiness recalculation | Automatic |
| Deterministic stale badge or sync status | Automatic |
| AI text regeneration | User-approved |
| Premium document regeneration | User-approved |
| PDF export regeneration | User action |
| Job-specific application package rewrite | User-approved |

## 4. Professional Identity Dependency Matrix

| Section | Completeness | Diagnosis | Readiness | CV | Cover Letter | LinkedIn | Job Matches | Career Passport | Home | Coach | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Profile | Refresh | Refresh | Refresh | Mark outdated | Mark outdated | Mark outdated | Recalculate | Refresh | Refresh | Notify | Core identity metadata affects most modules. |
| Photo | Refresh | No action | No action | Mark outdated if template uses photo | No action | No action | No action | Refresh if included | No action | No action | Do not require photo for readiness unless product policy says so. |
| Personal Information | Refresh | Refresh | Refresh | Mark outdated | Mark outdated | Mark outdated | Recalculate if contact/location relevant | Refresh | Refresh | Notify | Contact and name changes affect documents. |
| Location | Refresh | Refresh | Refresh | Mark outdated | Mark outdated | Mark outdated | Recalculate | Refresh | Refresh | Notify | Location affects suitability and work arrangement. |
| Nationality | Refresh | Refresh | Refresh | No action by default | No action by default | No action | Recalculate if work authorization rules need it | Refresh if included | Refresh | Notify | Sensitive; use only where user-approved and legally relevant. |
| Work Authorization | Refresh | Refresh | Refresh | Mark outdated if included | Mark outdated if relevant | No action | Recalculate | Refresh | Refresh | Notify | Hard constraint for some jobs. |
| Career Goal | Refresh | Refresh | Refresh | Mark outdated | Mark outdated | Mark outdated | Recalculate | Refresh | Refresh | Notify | High-impact source for targeting. |
| Professional Summary | Refresh | Refresh | Refresh | Mark outdated | Mark outdated | Mark outdated | Recalculate | Refresh | Refresh | Notify | Must not be copied into headers incorrectly. |
| Education | Refresh | Refresh | Refresh | Mark outdated | Mark outdated | Mark outdated | Recalculate | Refresh | Refresh | Notify | Affects graduate roles and requirements. |
| Experience | Refresh | Refresh | Refresh | Mark outdated | Mark outdated | Mark outdated | Recalculate | Refresh | Refresh | Notify | Strong evidence source. |
| Skills | Refresh | Refresh | Refresh | Mark outdated | Mark outdated | Mark outdated | Recalculate | Refresh | Refresh | Notify | High job-match dependency. |
| Projects | Refresh | Refresh | Refresh | Mark outdated | Mark outdated | Mark outdated | Recalculate | Refresh | Refresh | Notify | Important for technical, graduate, and portfolio roles. |
| Achievements | Refresh | Refresh | Refresh | Mark outdated | Mark outdated | Mark outdated | Recalculate | Refresh | Refresh | Notify | Evidence for document bullets and interviews. |
| Certificates | Refresh | Refresh | Refresh | Mark outdated | Mark outdated | Mark outdated if relevant | Recalculate | Refresh | Refresh | Notify | May be mandatory evidence. |
| Licences | Refresh | Refresh | Refresh | Mark outdated | Mark outdated | No action by default | Recalculate | Refresh | Refresh | Notify | Often a hard constraint. |
| Languages | Refresh | Refresh | Refresh | Mark outdated | Mark outdated if relevant | Mark outdated if relevant | Recalculate | Refresh | Refresh | Notify | Job-specific relevance varies. |
| References | Refresh | No action | No action | Mark outdated if included | No action by default | No action | No action | Refresh if included | No action | No action | Keep private; do not expose without approval. |
| Portfolio | Refresh | Refresh | Refresh | Mark outdated | Mark outdated | Mark outdated | Recalculate | Refresh | Refresh | Notify | Important for creative, technical, and project roles. |
| Social Profiles | Refresh | Refresh | No action | Mark outdated | Mark outdated | Mark outdated | No action by default | Refresh | No action | Notify | LinkedIn and website links affect documents. |
| Preferences | Refresh | Refresh | Refresh | No action | No action | No action | Recalculate if job filters use it | No action | Refresh | Notify | Drives guidance more than documents. |
| Employment Preferences | Refresh | Refresh | Refresh | No action by default | Mark outdated if job-specific | No action | Recalculate | Refresh | Refresh | Notify | Location, work type, and role preferences affect matching. |
| Salary Expectations | Refresh | Refresh | Refresh | No action | No action | No action | Recalculate if salary known | No action | Refresh | Notify | Sensitive; do not place in documents by default. |
| Availability | Refresh | Refresh | Refresh | Mark outdated if included | Mark outdated if relevant | No action | Recalculate | Refresh | Refresh | Notify | Affects applications and interviews. |

## 5. Downstream Behaviour Rules

### Documents

- Small identity changes mark affected documents outdated.
- User decides whether to regenerate.
- Manual overrides remain explicit.
- Template switching remains presentation-only.

### Job Matches

- Deterministic matching can recalculate when evidence or preferences change.
- AI-generated explanations can be marked stale and regenerated with approval.

### Personalised Home

- Home next action can refresh after completeness, diagnosis, readiness, document, or application state changes.
- During setup, Continue must resume the next incomplete Professional Identity section, not a document milestone.

### Career Coach

- Coach context may be refreshed or marked stale.
- Do not send full sensitive document contents unless required and approved by the feature contract.

## 6. Idempotency

Every sync operation should use a source version:

```text
Sync:{userId}:{sourceDomain}:{sourceVersion}:{targetDomain}
```

This prevents repeated stale flags and duplicate timeline events.

## 7. Stop Conditions

Stop implementation if:

- a small edit triggers automatic paid/AI regeneration
- sync hides manual overrides
- sync changes source identity from a downstream document
- sync requires deleting legacy data before cutover
