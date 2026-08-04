# Next-Best-Action Engine

The authoritative function is `determineNextBestActions`.

Inputs:

- Employment Intelligence profile context
- optional Employment Diagnosis result
- document/application/interview state
- action history

Processing:

1. Load the action registry.
2. Evaluate completion and repeatability.
3. Resolve dependencies and blockers.
4. Apply deterministic eligibility rules.
5. Score with documented priority weights.
6. Select one primary action.
7. Select up to three complementary secondary actions.
8. Return structured explanations, confidence and presentation metadata.

The engine is pure. It does not write to Supabase, mutate Professional Identity, call AI, fetch live jobs, navigate, trust client user IDs or store translated canonical values.
