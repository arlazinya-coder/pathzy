# PATHZY Kernel Architecture

Status: Phase 1.5 blueprint
Created: 2026-07-28
Evidence:
- `docs/constitution/PATHZY_PRODUCT_EMPLOYMENT_CONSTITUTION.md`
- `docs/architecture/TARGET_ARCHITECTURE.md`
- `docs/architecture/CURRENT_TO_TARGET_GAP_MAP.md`
- `docs/audits/CURRENT_STATE_AUDIT.md`
- `docs/audits/RISK_REGISTER.md`

## 1. Purpose

The PATHZY Kernel is a lightweight orchestration and domain coordination layer for the modular monolith.

It must coordinate domain modules without becoming a monolithic god object. It should not contain UI rendering, Supabase query details, AI prompts, PDF layout logic, billing-provider calls, or page-specific business rules.

PATHZY currently needs a modular monolith with clean boundaries, not microservices.

## 2. Domains Coordinated by the Kernel

The Kernel coordinates:

- Professional Identity
- Employment Diagnosis
- Readiness
- Documents
- Opportunities
- Applications
- Career Coach
- Career Passport
- Notifications
- Personalised Home
- Career Growth

## 3. What Belongs Inside the Kernel

The Kernel owns orchestration concerns:

- domain-event dispatch
- cross-domain dependency decisions
- sync invalidation routing
- next-action coordination
- idempotency coordination
- request correlation IDs
- safe fallback decisions
- cross-domain error envelopes
- observability conventions
- high-level workflow state transitions

Examples:

- Professional Identity section updated -> decide which modules should be marked stale.
- Job match recalculated -> notify Personalised Home and Success Center of updated next-action context.
- Application stage changed -> record timeline event and update follow-up recommendations.

## 4. What Remains Inside Domain Modules

Domain modules own their own rules and persistence.

| Domain | Owns |
| --- | --- |
| Professional Identity | Identity sections, canonical profile, evidence, profile completeness, user-approved facts |
| Employment Diagnosis | Diagnosis calculation, readiness interpretation, missing information guidance |
| Documents | Document data, versions, templates, preview, PDF export, sync status |
| Opportunities | Saved jobs, opportunity records, job import handoff |
| Employment Intelligence | Job parsing, requirement classification, match evidence |
| Applications | Tracker, status, timeline, notes, contacts, application packages |
| Career Coach | Conversation context and advice boundaries |
| Career Passport | Portable summary from Professional Identity and readiness |
| Notifications | User-controlled reminders and message scheduling |
| Career Growth | Skills, development recommendations, analytics |

## 5. Module Communication

V1 should use in-process module calls and a typed domain-event dispatcher.

Preferred direction:

```text
Page or API route
  -> domain service
  -> Kernel event dispatcher
  -> interested domain handlers
  -> persistence or invalidation updates
```

The Kernel must not directly mutate every domain table. It should call domain handlers with typed event payloads.

## 6. Dependency Rules

Allowed:

- pages call domain services
- API routes call domain services
- domain services emit events through the Kernel
- domain handlers call their own repositories
- shared services provide types, routes, permissions, logging, and validation

Avoid:

- domain module importing page components
- route layer importing document renderer internals
- document engine importing application tracker internals
- Coach directly querying raw document tables
- circular imports between domain modules
- UI state becoming persistent source of truth

## 7. Circular Dependency Prevention

Rules:

1. Domain modules communicate through events or stable shared contracts.
2. Shared contracts live below domain implementations.
3. Event payloads contain IDs and safe summaries, not full sensitive records.
4. Domain handlers are registered at the Kernel layer.
5. A domain may consume another domain through a read model or service interface, not by reaching into private implementation files.

## 8. Error Handling

Errors should be returned as structured envelopes:

```text
{
  ok: false,
  code,
  safeMessage,
  retryable,
  correlationId
}
```

Rules:

- do not render raw Supabase errors to the browser
- do not log sensitive profile or document contents
- fallback states must be explicit
- retryable failures must not duplicate records
- high-impact workflows must fail closed

## 9. Idempotency

Kernel-coordinated workflows must use idempotency keys for repeatable actions.

Examples:

- `ProfessionalIdentitySectionUpdated:{userId}:{section}:{version}`
- `DocumentGenerationRequested:{userId}:{documentType}:{sourceVersion}`
- `JobMatchCalculated:{userId}:{jobId}:{profileVersion}`
- `ApplicationStageChanged:{applicationId}:{from}:{to}:{timestampBucket}`

Idempotency must prevent duplicate timeline events, duplicate follow-up drafts, duplicate document invalidations, and repeated application actions.

## 10. Observability

Kernel events should support:

- correlation ID
- event name
- producer
- handler name
- user ID hash or internal ID where safe
- elapsed time
- retry count
- safe failure code

Sensitive fields must not be logged:

- document bodies
- raw CV text
- cover-letter text
- private notes
- uploaded files
- secrets
- full AI prompts

## 11. V1 Event Strategy

Recommended staged approach:

1. In-process dispatcher for synchronous V1 coordination.
2. Persistent database outbox only for events requiring reliable retry or cross-request recovery.
3. Background jobs later for heavy tasks such as OCR, PDF rendering, AI regeneration, email reminders, and analytics aggregation.

Do not introduce message brokers or microservice infrastructure for V1.

## 12. Testing Strategy

Test the Kernel through:

- event contract tests
- handler registration tests
- idempotency tests
- no-circular-dependency import tests where practical
- domain-handler unit tests
- route/workflow regression tests
- failure and retry tests

Minimum regression examples:

- updating Professional Identity marks CV outdated but does not regenerate it automatically
- completing Professional Identity enables diagnosis
- diagnosis completion updates Home next action
- application stage change creates one timeline event
- failed handler does not corrupt the producer action

## 13. Incremental Implementation in Current Stack

Implementation can be incremental:

1. Add shared type contracts under `lib/kernel` or equivalent.
2. Add an in-process event dispatcher.
3. Register handlers for one low-risk event.
4. Add idempotency and sanitized logging.
5. Move existing page-level cross-domain effects into handlers gradually.
6. Add outbox persistence only for events requiring reliable retry.

No runtime implementation is part of Phase 1.5.

## 14. Stop Conditions

Stop Kernel implementation if:

- it starts owning domain persistence directly
- it duplicates domain logic
- it requires microservices to function
- it makes Professional Identity less authoritative
- it introduces circular imports
- it changes user routes or behaviour without tests
