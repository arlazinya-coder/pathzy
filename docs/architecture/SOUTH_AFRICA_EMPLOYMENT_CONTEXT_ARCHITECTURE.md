# South Africa Employment Context Architecture

The adapter follows this dependency direction:

Employment Intelligence Engine -> CountryEmploymentContext -> SouthAfricaEmploymentContext adapter -> versioned source-aware configuration

Main files:

- `country-employment-context.ts`: shared country adapter types.
- `resolve-country-context.ts`: safe country resolution.
- `south-africa-context.ts`: ZA context assembly.
- `source-registry.ts`: source and unavailable-data contracts.
- `fixtures.ts`: fictional ZA fixture corpus.

## Resolver Behaviour

- `ZA` resolves to the South Africa adapter.
- unsupported countries resolve to generic context.
- missing country resolves to generic context.
- invalid ZA province keeps country context and marks region unavailable.
- adapter failure must fall back to generic context in future service boundaries.

## Engine Integration

The Phase 3B engine reads country context for:

- missing-information additions
- qualification recognition uncertainty
- work-authorisation readiness
- practical-access support
- pathway dependencies
- barrier confidence and explanations

It does not mutate user data.
