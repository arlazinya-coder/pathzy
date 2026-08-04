# Employment Diagnosis Question Taxonomy

The authoritative taxonomy is implemented in `question-types.ts` and `question-registry.ts`.

Categories include employment situation, job-search activity, application quality, interview history, immediate income need, practical access, digital access, communication and literacy, documentation, work eligibility clarification, mobility and location, care responsibilities, confidence and support, learning and development, pathway preferences, barriers, evidence, career change or return, informal experience, and country-context clarification.

Each question records:

- canonical `questionId`
- category
- purpose
- prompt/help keys
- English/French presentation
- structured answer type
- canonical options
- requiredness
- sensitivity
- eligibility, skip, and branch rules
- affected readiness dimensions, barriers, pathways, and country dependencies
- literacy level
- effort and version

Canonical answer values are language-independent.
