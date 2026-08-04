# Phase 3F Employment Intelligence Persistence

Phase 3F persists derived Employment Intelligence separately from Professional Identity and Employment Diagnosis.

Ownership rules:

- Professional Identity remains canonical user-supplied professional facts.
- Employment Diagnosis remains a diagnostic input.
- Employment Intelligence is derived.
- Next-Best-Actions and Career Plans are derived from a specific intelligence version.
- Action History records user progress and feedback, not identity facts.

Implemented source:

- `lib/employment-intelligence/application/`
- `lib/employment-intelligence/repositories/`
- `lib/employment-intelligence/persistence/`
- `lib/employment-intelligence/api/`
- `app/api/employment-intelligence/route.ts`
- `supabase/migrations/20260804120000_create_employment_intelligence_persistence.sql`

Phase 3F does not add Home redesign, Career Coach conversations, live job matching, salary values, live programme data or generative AI.
