# Employment Pathway Taxonomy

Status: Phase 3A contract
Code: `lib/employment-intelligence/domain/pathways.ts`

## Pathways

The canonical pathway list includes direct employment, entry-level employment, skilled employment, professional employment, graduate programmes, internships, learnerships, apprenticeships, temporary work, contract work, part-time work, informal or community work, self-employment, micro-enterprise, freelance work, skills-first transition, return to work, career change, qualification recognition, bridging education, licence or certificate, public employment programme, and supported employment.

## Rules

- Do not create separate engines for different social classes.
- Use one engine with adaptable rules and presentation.
- Country adapters may provide localized eligibility details, but canonical pathway codes remain stable.
- Do not hard-code live programme names without source metadata, effective dates, confidence, and update policy.
