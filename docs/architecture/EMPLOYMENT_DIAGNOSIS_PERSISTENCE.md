# Employment Diagnosis Persistence

Phase 3D uses the existing `discovery_responses` table without adding a migration.

Persistence rules:

- Server derives `userId` from Supabase authentication.
- Diagnosis records use `_pathzy_record_type = "employment_diagnosis"`.
- The latest diagnosis row is updated when possible.
- Professional Identity compatibility rows are not overwritten.
- Session state includes answer IDs, skipped IDs, branch history, engine version, country-context version, current question, result version, and stale state.
- Completion stores a structured result and workflow completion flags.

This keeps Phase 2 identity persistence stable while allowing Phase 3D adaptive resume.
