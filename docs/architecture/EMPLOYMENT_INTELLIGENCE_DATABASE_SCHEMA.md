# Employment Intelligence Database Schema

Migration: `supabase/migrations/20260804120000_create_employment_intelligence_persistence.sql`.

Tables:

- `employment_intelligence_profiles`
- `employment_action_recommendations`
- `employment_career_plans`
- `employment_action_history`
- `employment_intelligence_recompute_attempts`

Key constraints:

- one current intelligence profile per user
- one current recommendation set per intelligence profile
- one current Career Plan per intelligence profile
- unique action history row per user and action code
- idempotent recompute attempt key per user

All tables include ownership, timestamps, status, version or engine metadata, and JSON payloads for structured derived data.
