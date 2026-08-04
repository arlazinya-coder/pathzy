# PATHZY Phase 3 Release-Closure Pass

Date: 2026-08-04
Branch: feature/phase-3-employment-intelligence
Closure baseline: 7973bc4, docs(phase3): publish Employment Intelligence release gate

## Blocking Matrix

### A. Release Blockers

| ID | Severity | Requirement not passed | Type | Affected files or infrastructure | Evidence available | Evidence still required |
| --- | --- | --- | --- | --- | --- | --- |
| P3H-BLOCKER-001 | RELEASE BLOCKER | Phase 3 persistence schema must exist in the connected development Supabase project. | Migration/configuration requirement | Connected Supabase project `tibcegsglqfnnaardxck`; `supabase/migrations/20260804120000_create_employment_intelligence_persistence.sql` | Sanitized Supabase anon probe returned `PGRST205` for all five Phase 3 tables and `PGRST202` for `finalize_employment_intelligence_current`. | Founder must apply the Phase 3 persistence migration manually and run validation SQL. |
| P3H-BLOCKER-002 | RELEASE BLOCKER | Authenticated Phase 3 persistence/API QA must pass. | Missing authenticated browser evidence blocked by missing schema | `app/api/employment-intelligence/route.ts`, `lib/employment-intelligence/application/*`, `lib/employment-intelligence/repositories/*` | Automated source tests pass; live schema is missing, so authenticated API persistence cannot pass yet. | Authenticated QA after migration: generation, refresh, logout/login, action history and Career Plan persistence. |
| P3H-BLOCKER-003 | RELEASE BLOCKER | Account isolation must be proven with two authenticated users. | Missing authenticated browser evidence | Supabase RLS policies in Phase 3 migration and same-origin API calls | Source-level owner checks and RLS definitions exist; no live User A/User B test was executed. | User A/User B browser/API evidence after migration. |
| P3H-BLOCKER-004 | RELEASE BLOCKER | Founder acceptance must pass for key user journeys. | Missing authenticated browser evidence | Home, Diagnosis Results, Career Plan, action completion, language switching | Automated validation passes; no founder browser QA was executed in this pass. | Short founder QA sequence in this document. |

### B. Critical Issues

No code-level critical issue was found in this closure pass. The active critical path is infrastructure and authenticated evidence.

### C. Major Issues

| ID | Severity | Issue | Type | Status |
| --- | --- | --- | --- | --- |
| P3H-MAJOR-001 | MAJOR | Automated browser/accessibility/performance suites are not available as project scripts. | Test gap | Documented; founder/manual QA required. |

### D. Tests Not Run

| Test | Reason | Release importance | Can Codex complete now? | Founder/manual action |
| --- | --- | --- | --- | --- |
| Authenticated persistence QA | Phase 3 persistence tables are missing in connected dev DB. | Release blocker | No | Apply migration, then test. |
| Account switching QA | Requires two authenticated browser sessions/test accounts. | Release blocker | No | Required. |
| Founder acceptance journeys | Requires browser and fictional accounts. | Release blocker | No | Required. |
| Live RLS write/read verification | Requires migration application and authenticated users. | Release blocker | No | Required. |
| Automated accessibility runner | No dedicated script exists. | Major | No | Manual keyboard/screen-reader checks. |
| E2E browser suite | No dedicated script exists. | Major | No | Manual browser QA. |

### E. Founder QA Not Completed

Founder QA remains required for:

- Intelligence generation after completed Identity and Diagnosis.
- Persistence after refresh and logout/login.
- Primary and secondary actions.
- Career Plan persistence.
- Action completion persistence.
- Meaningful Identity change to stale result to recomputation.
- Failed recomputation preserving previous valid result.
- English/French switching without recomputation or data loss.
- Account switching isolation.
- Lower-literacy/high-guidance presentation.
- Immediate-income pathway behaviour.
- Diverse employment-level outputs.

### F. Migrations/Configuration Not Applied

Required migration:

1. `supabase/migrations/20260804120000_create_employment_intelligence_persistence.sql`

This migration creates the Phase 3 persistence runtime contract. It depends on `auth.users`, `pgcrypto`, and a database where prior Phase 2/Phase 3D application tables already support the user journey. It does not depend on another unapplied Employment Intelligence persistence migration.

### G. Acceptable Minor Deferrals

| ID | Severity | Issue | Reason |
| --- | --- | --- | --- |
| P3H-MINOR-001 | MINOR | 74 existing ESLint warnings. | Existing baseline; lint exits successfully. |
| P3H-MINOR-002 | MINOR | `/roadmap` remains a compatibility route. | User-facing copy can remain Home/Career Plan while route aliases are preserved. |

## Migration Requirement

The incomplete verdict is currently caused by unapplied Phase 3 persistence infrastructure and missing authenticated release evidence. Authenticated Phase 3 persistence and API QA cannot function until the migration is applied to the connected development Supabase project.

### Safe Manual Application Order

Apply this file in the Supabase SQL Editor for the connected development project:

1. `supabase/migrations/20260804120000_create_employment_intelligence_persistence.sql`

Do not apply to production during this release-closure pass.

### Post-Application Validation SQL

Run this read-only validation SQL after applying the migration:

```sql
with expected_tables(table_name) as (
  values
    ('employment_intelligence_profiles'),
    ('employment_action_recommendations'),
    ('employment_career_plans'),
    ('employment_action_history'),
    ('employment_intelligence_recompute_attempts')
),
table_checks as (
  select
    'table' as object_type,
    e.table_name as object_name,
    case when c.relname is not null then 'PASS' else 'FAIL' end as status,
    case
      when c.relname is null then 'missing table'
      when c.relrowsecurity is not true then 'RLS disabled'
      else 'exists with RLS enabled'
    end as details
  from expected_tables e
  left join pg_class c
    on c.relname = e.table_name
   and c.relnamespace = 'public'::regnamespace
   and c.relkind = 'r'
),
policy_checks as (
  select
    'policy_count' as object_type,
    e.table_name as object_name,
    case when count(p.polname) >= 3 then 'PASS' else 'FAIL' end as status,
    count(p.polname)::text || ' policies found' as details
  from expected_tables e
  left join pg_class c
    on c.relname = e.table_name
   and c.relnamespace = 'public'::regnamespace
  left join pg_policy p
    on p.polrelid = c.oid
  group by e.table_name
),
index_checks(index_name) as (
  values
    ('employment_intelligence_one_current_idx'),
    ('employment_intelligence_input_version_idx'),
    ('employment_action_recommendations_current_idx'),
    ('employment_career_plans_current_idx'),
    ('employment_action_history_user_action_idx'),
    ('employment_intelligence_user_status_idx'),
    ('employment_intelligence_user_stale_idx'),
    ('employment_action_recommendations_user_status_idx'),
    ('employment_career_plans_user_status_idx'),
    ('employment_action_history_user_state_idx')
),
index_results as (
  select
    'index' as object_type,
    i.index_name as object_name,
    case when c.relname is not null then 'PASS' else 'FAIL' end as status,
    case when c.relname is not null then 'exists' else 'missing index' end as details
  from index_checks i
  left join pg_class c
    on c.relname = i.index_name
   and c.relnamespace = 'public'::regnamespace
   and c.relkind = 'i'
),
function_results as (
  select
    'function' as object_type,
    'finalize_employment_intelligence_current' as object_name,
    case when p.proname is not null then 'PASS' else 'FAIL' end as status,
    case when p.proname is not null then 'exists' else 'missing function' end as details
  from (select 1) marker
  left join pg_proc p
    on p.proname = 'finalize_employment_intelligence_current'
   and p.pronamespace = 'public'::regnamespace
)
select *
from (
  select * from table_checks
  union all
  select * from policy_checks
  union all
  select * from index_results
  union all
  select * from function_results
) checks
where status = 'FAIL'
union all
select
  'summary' as object_type,
  'phase_3_persistence' as object_name,
  case when exists (
    select 1
    from (
      select * from table_checks
      union all
      select * from policy_checks
      union all
      select * from index_results
      union all
      select * from function_results
    ) all_checks
    where status = 'FAIL'
  ) then 'FAIL' else 'PASS' end as status,
  'Run authenticated API QA only when this summary is PASS.' as details;
```

### Rollback Guidance

Do not rollback by dropping tables after authenticated QA has begun, because the tables may contain user-derived intelligence, action history and Career Plan progress. If application fails immediately before user data is written, the founder may choose to remove only the newly created Phase 3 objects in a controlled maintenance window. Otherwise prefer a forward repair migration.

## Short Founder QA Sequence

| Test | Setup | Action | Expected result | PASS evidence | Failure evidence |
| --- | --- | --- | --- | --- | --- |
| Intelligence generation | Fictional user with complete Professional Identity and completed Diagnosis | Finish Diagnosis or trigger recompute | Current intelligence, primary action and Career Plan exist | Screenshot/API result showing Home + Diagnosis Results | Error, spinner, missing tables, missing action |
| Refresh persistence | Same user after generation | Refresh Home and Career Plan | Same intelligence and plan reload | Screenshots before/after refresh | State disappears or resets |
| Logout/login persistence | Same user | Logout, close browser, login | Intelligence, plan and progress remain | Screenshots after login | Onboarding restarts or data missing |
| Action completion | Same user | Complete one primary/plan action | Action history updates; completed action does not return as primary | Before/after action screenshot | Completed action repeats |
| Identity stale/recompute | Same user | Edit meaningful Identity field, recompute | Existing result remains while stale; new version appears after recompute | Stale state and recomputed state evidence | Prior valid result disappears |
| Failed recompute recovery | Same user/test environment | Simulate server/database failure where safe | Previous valid intelligence remains | Error state with prior result visible | Partial current state or data loss |
| Language switching | Same user | Switch EN/FR repeatedly | No recompute, no data loss, labels translate | Screenshots and no new version evidence | Data loss, mixed language, recompute |
| Account switching | User A and User B | Login A, complete action, logout, login B, then A | B never sees A data; A progress remains | A/B screenshots without sensitive data | Any cross-account leakage |
| Lower-literacy/high-guidance | Fictional lower-literacy profile | Run Diagnosis and view plan | Shorter, clearer guidance; no capability penalty | Screenshots | Dense or stigmatizing output |
| Immediate-income | Fictional immediate-income profile | Run Diagnosis and view Home/Plan | Urgent practical action plus longer-term pathway | Screenshots | Unsafe or one-size-fits-all output |
| Diverse employment levels | Fictional profiles across service, retail, security, graduate, professional, manager | Generate intelligence | Respectful, relevant primary action and pathways | Profile/output matrix | Generic or demeaning results |

## Closure Decision

Code-level and automated work available in Codex is complete for this pass. Manual migration application and authenticated founder QA remain required.
