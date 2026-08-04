# Phase 3F Migration and Rollback Guide

Migration:

- `20260804120000_create_employment_intelligence_persistence.sql`

Apply only after founder approval.

The migration is additive:

- creates new derived-data tables
- creates indexes
- enables RLS
- creates scoped policies
- creates update triggers
- creates `finalize_employment_intelligence_current`

It does not drop existing tables, delete user data, modify Professional Identity or modify Employment Diagnosis storage.

Rollback guidance:

1. Stop API writes to `/api/employment-intelligence`.
2. Archive or export rows if needed.
3. Drop the Phase 3F tables and function only after confirming no dependent release uses them.
4. Do not delete Professional Identity, diagnosis, documents or applications.
