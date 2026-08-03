# PATHZY Canonical Data Migration Blueprint

Status: Phase 1.5 blueprint
Created: 2026-07-28
Evidence:
- `docs/audits/CURRENT_STATE_AUDIT.md`
- `docs/audits/RISK_REGISTER.md`
- `docs/architecture/CURRENT_TO_TARGET_GAP_MAP.md`

## 1. Principle

The migration to canonical Professional Identity must be incremental, backward compatible where necessary, reversible where practical, tested, observable, and safe for existing users.

Do not delete legacy tables before data validation and cutover are complete.

## 2. Architecture Classes

| Class | Meaning |
| --- | --- |
| Legacy | Historical table or model still referenced by current code |
| Transitional | Bridge model used while canonical architecture matures |
| Canonical | Target source-of-truth model |
| Compatibility | Read/write adapter preserving old data during migration |

## 3. Table Mapping

| Table/model | Current responsibility | Target responsibility | Data ownership | Migration mapping | Duplicate-data risks | Conflict resolution | Read path during migration | Write path during migration | Backfill strategy | Validation strategy | Rollback strategy | Deprecation criteria | Removal criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `user_profiles` | Legacy profile and auth-adjacent user data | Compatibility source feeding canonical identity | User-owned | Map name, contact, goal, summary, skills where reliable | Conflicts with `professional_identity` and canonical profile | Prefer latest user-confirmed Professional Identity value | Canonical first, fallback to user profile | Write through compatibility only until cutover | Batch per user with version markers | Compare canonical summary to source fields | Keep old reads available | No runtime read dependency | Exported and validated data retained elsewhere |
| `discovery_responses` | Historical discovery/onboarding answers | Evidence source for diagnosis where still useful | User-owned | Map responses to diagnosis inputs or evidence notes | Old answers may conflict with current identity | Current Professional Identity wins | Read only as supplemental | Avoid new writes unless still active | Backfill only useful structured answers | Spot-check diagnosis changes | Ignore supplemental import | Diagnosis no longer reads it | No active user-value dependency |
| `professional_identity` | Operational setup/progress state | Transitional setup state or canonical metadata | User-owned | Map completion, review, setup sections to canonical state | Completion may diverge from canonical entity completeness | Canonical completeness calculation wins | Read with canonical services | Write setup status and canonical updates together | Per-user setup status migration | Verify onboarding route state | Preserve existing status | Canonical setup service owns flow | No route depends on legacy status |
| `canonical_professional_profiles` | Canonical profile summary | Canonical identity root | User-owned | Remains canonical root | Can diverge from entity tables if not versioned | Versioned canonical update wins | Primary read | Primary write through canonical service | Initialize from legacy/transitional | Compare against identity sections | Roll back to previous profile version | Already canonical | Not removable |
| `canonical_employments` | Canonical experience entity | Canonical entity | User-owned | Map experience records from identity/imports | Duplicated imported roles | User-confirmed record wins | Primary read | Primary write | Entity-level backfill | Count and semantic comparison | Keep old source | Already canonical | Not removable |
| `canonical_education` | Canonical education entity | Canonical entity | User-owned | Map education records | Combined strings may split poorly | Flag uncertain fields for review | Primary read | Primary write | Entity-level backfill | User review and field validation | Keep source | Already canonical | Not removable |
| `canonical_skills` | Canonical skill entity | Canonical entity | User-owned | Deduplicate skills by normalized label/category | Duplicate skill inventories | Merge duplicates, keep provenance | Primary read | Primary write | Normalize and dedupe | Duplicate and category checks | Keep source lists | Already canonical | Not removable |
| `canonical_timeline_events` | Profile/career evidence events | Canonical audit/evidence timeline | User-owned | Map important milestones | Missing provenance | Preserve source reference | Primary read where available | Append-only write | Generate from known events | Event count and source checks | Events can be replayed | Already canonical | Not removable |
| `cv_documents` | Legacy CV records | Compatibility or migrated document records | User-owned | Map to `professional_documents` and document versions | Duplicate CV content vs newer engine | Preserve latest downloaded and latest edited versions | Read compatibility until migrated | Prefer professional document write | Per-document migration | Preview/export parity checks | Keep legacy row | No current read dependency | Validated migration and exports |
| `cover_letters` | Legacy cover-letter records | Compatibility or migrated document records | User-owned | Map to professional documents | Duplicate cover-letter studio records | Preserve latest edited and job-linked version | Read compatibility until migrated | Prefer professional document write | Per-document migration | Content and job-link checks | Keep legacy row | No current read dependency | Validated migration and exports |
| `linkedin_profiles` | Legacy LinkedIn content | Compatibility or migrated professional document | User-owned | Map LinkedIn sections to document fields | CV preview reuse risks | LinkedIn-specific sections win | Read compatibility until migrated | Prefer LinkedIn document model | Per-user section mapping | Section completeness checks | Keep legacy row | No current read dependency | Validated migration |
| `recruiter_messages` | Legacy generated recruiter messages | Professional document/message type | User-owned | Map message body and metadata | Generated content may be stale | Mark needs review | Read compatibility | Write new records to canonical document/message model | Per-message migration | Owner and content checks | Keep legacy row | No active read dependency | Validated migration |
| `follow_up_emails` | Legacy follow-up drafts | Success Center follow-up records | User-owned | Map to application follow-up when application link exists | Duplicate with Phase 9 follow-ups | Application-linked record wins | Read compatibility if needed | Write to follow-up engine | Match by application/contact/date | No duplicate draft check | Keep legacy row | Follow-up engine owns reads | No active read dependency |
| `career_passport_summaries` | Legacy Career Passport summary | Career Passport output from canonical identity | User-owned | Regenerate or map summary as prior output | Stale summary after identity changes | Mark outdated | Read as previous version | Write new passport versions | Map latest summary | Sync-state validation | Keep previous summary | Career Passport engine owns output | No active read dependency |
| `user_documents` | Unified uploads/documents | Supporting documents and compatibility document storage | User-owned | Link uploaded files to canonical evidence and documents | Overlap with professional documents | Use type/source metadata | Read for uploads and existing docs | Continue for supporting documents | Backfill metadata | File ownership and type checks | Keep records | Still needed for uploads | Not removable until storage redesign |
| `professional_documents` | Newer professional document root | Canonical document root | User-owned | Remains canonical document root | Overlap with legacy tables | Canonical document wins after migration | Primary read for document engine | Primary write | Import legacy records | Version/export checks | Keep legacy fallback | Already canonical | Not removable |
| `professional_document_fields` | Structured document fields | Canonical document content/version fields | User-owned | Remains canonical | Field conflicts with identity sync | Manual override rules | Primary read | Primary write | Generate from migrated docs | Field-level validation | Previous version restore | Already canonical | Not removable |
| `professional_document_exports` | Export history | Canonical export record | User-owned | Remains canonical | Duplicate download status in legacy | Latest export record wins | Primary read for exports | Append on export | Import legacy download timestamps if valuable | Export audit checks | Keep legacy status | Already canonical | Not removable |
| `user_opportunity_actions` | Saved/applied/completed/hidden opportunity flags | Opportunity action state | User-owned | Keep as current runtime table | Conflict if opportunity IDs change | User action wins | Primary read for opportunities | Primary write | Create repair if missing | Runtime contract verification | No data loss if table absent | Active schema verified | Not removable |
| Phase 9 application tables | Tracker, timeline, prep, follow-up, analytics | Success Center canonical operational records | User-owned | Remain Success Center records | Legacy tracker duplicates | Latest tracker event and timeline wins | Primary read | Primary write | Backfill from legacy applications if needed | Timeline and RLS checks | Preserve source | Already canonical for Success Center | Not removable |

## 4. Conflict-Resolution Rules

1. User-confirmed Professional Identity values win over imported CV values.
2. Newer confirmed data wins over older inferred data.
3. Manual overrides stay local to a document unless user applies them to Professional Identity.
4. AI-generated claims require traceability and user approval.
5. Uncertain imported fragments are flagged for review, not silently promoted.
6. Legacy values are preserved until canonical migration is validated.

## 5. Backfill Strategy

Backfill should run in stages:

1. Dry-run analysis by user.
2. Create canonical profile root if absent.
3. Map high-confidence fields.
4. Store provenance and source references.
5. Mark uncertain fields for review.
6. Validate counts, required fields, and RLS.
7. Enable canonical reads with legacy fallback.
8. Cut over writes.
9. Monitor errors and mismatches.

## 6. Validation Strategy

Validate:

- row ownership
- required columns
- RLS and policies
- entity counts before/after
- document preview/export parity
- duplicate skill and experience detection
- route flow for existing and new users
- cross-user access denial
- rollback path

## 7. Rollback Strategy

Rollback should:

- preserve legacy tables
- disable canonical reads if needed
- keep migrated data with version markers
- avoid destructive deletes
- restore previous route/read path
- document affected users and records

## 8. Deprecation and Removal Criteria

A legacy table or model can be removed only after:

- no current runtime reads or writes remain
- all user data is migrated or intentionally archived
- validation passes
- recovery point exists
- founder approval is recorded
- rollback plan is no longer needed
