# Employment Diagnosis Architecture

The active diagnosis architecture lives in `lib/employment-intelligence/diagnosis`.

## Runtime Flow

1. `/discovery` renders `components/discovery/discovery-flow.tsx`.
2. The client loads `/api/generate-roadmap?language=...`.
3. The API loads the authenticated user's Professional Identity read model.
4. The API resolves country context through `resolveCountryEmploymentContext`.
5. `loadOrCreateDiagnosisSession` resumes or creates a diagnosis-marked session.
6. `selectNextDiagnosisQuestion` returns the next deterministic question.
7. Each answer is saved through `saveDiagnosisSession`.
8. Completion builds an `EmploymentDiagnosisResult`.
9. The result is mapped into the Phase 3B engine input and a deterministic intelligence draft is refreshed.
10. Completion redirects to authenticated Home.

## Data Boundary

Diagnosis data is stored under:

- `employment_diagnosis_session`
- `employment_diagnosis_result`
- `employment_diagnosis_status`

These fields are inside a diagnosis-marked `discovery_responses.answers` payload. Professional Identity rows remain separate.
