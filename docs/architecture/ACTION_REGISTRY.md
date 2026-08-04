# Action Registry

The action registry lives in `lib/employment-intelligence/actions/action-registry.ts`.

Each action is language-independent and contains:

- action code
- category
- title and presentation keys
- explanation key
- reason codes
- urgency, impact and effort
- prerequisites and blockers
- supported pathways
- addressed barriers
- destination route
- completion criteria
- repeatability
- eligibility metadata
- contraindications
- country-context requirements
- evidence references
- confidence
- engine version

The registry includes identity, diagnosis, evidence, document, opportunity, application, interview, practical support, immediate-income, skill and human-support actions.

No action contains live programme names, salary figures, vacancies, automatic application behavior or hard-coded protected-attribute assumptions.
