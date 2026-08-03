# PATHZY Event Catalogue

Status: Phase 1.5 blueprint
Created: 2026-07-28

## 1. V1 Event Model

PATHZY V1 should use a staged event model:

1. In-process event dispatcher for synchronous domain coordination.
2. Database outbox for events that must survive request failure or need retry.
3. Background jobs later for heavy or delayed work.

This avoids premature infrastructure while creating clear contracts.

## 2. Standard Event Envelope

Every event should include:

| Field | Requirement |
| --- | --- |
| `eventName` | Stable event name |
| `eventId` | Unique ID for this event occurrence |
| `idempotencyKey` | Stable key preventing duplicate side effects |
| `occurredAt` | Server timestamp |
| `producer` | Domain or service that emitted the event |
| `userId` | User ID when owner-scoped; omit for unauthenticated public events |
| `correlationId` | Request/workflow correlation ID |
| `payload` | Minimal safe payload |
| `schemaVersion` | Event payload version |

Sensitive payloads should reference record IDs, not include full private content.

## 3. Persistence Guidance

| Persistence level | Use when |
| --- | --- |
| In-process only | UI-safe coordination, stale flags, deterministic recalculation inside one request |
| Outbox recommended | timeline events, document-generation requests, notification scheduling, AI jobs |
| Durable audit required | consent, application approval, sent messages, admin access, billing-sensitive actions |

## 4. Event Catalogue

| Event | Trigger | Producer | Consumers | Minimum payload | Must not include | Idempotency key | Persistence | Retry | Failure | V1 execution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UserRegistered | User account created | Auth | Route Engine, Professional Identity, Audit | `userId`, `createdAt` | password, token, provider secrets | `UserRegistered:{userId}` | Outbox recommended | Retry setup handlers | User remains registered; setup can resume | Sync plus outbox |
| InterfaceLanguageSelected | User chooses interface language | Language Preferences | Route Engine, Professional Identity, Coach | `userId`, `languageCode` | inferred ethnicity, raw browser header | `InterfaceLanguageSelected:{userId}:{languageCode}` | In-process | No retry needed | Keep previous/default language | Sync |
| ProfessionalIdentityCreated | First identity record created | Professional Identity | Diagnosis, Home, Audit | `userId`, `identityId`, `version` | full profile content | `ProfessionalIdentityCreated:{userId}:{identityId}` | Outbox recommended | Retry downstream setup | Identity exists; downstream stale | Sync plus outbox |
| ProfessionalIdentitySectionUpdated | Any of 23 sections changes | Professional Identity | Sync Engine, Diagnosis, Documents, Home, Coach | `userId`, `section`, `identityVersion` | raw section data unless handler is authorized | `PISectionUpdated:{userId}:{section}:{identityVersion}` | Outbox for important sections | Retry invalidation | Mark sync uncertain | Sync plus outbox |
| ProfessionalIdentityCompleted | Required setup reaches completion | Professional Identity | Diagnosis, Route Engine, Home | `userId`, `identityVersion`, `completedAt` | raw profile content | `PICompleted:{userId}:{identityVersion}` | Outbox recommended | Retry diagnosis trigger | User can retry Finish Setup | Sync plus outbox |
| ProfessionalIdentityReviewed | User confirms review | Professional Identity | Diagnosis, Audit | `userId`, `identityVersion`, `reviewedAt` | full profile snapshot | `PIReviewed:{userId}:{identityVersion}` | Audit required | Retry audit | Review state remains pending if audit fails | Sync plus audit |
| ProfessionalIdentityVersionCreated | Canonical version created | Canonical Profile | Documents, Matches, Career Passport | `userId`, `profileVersion` | raw profile JSON | `PIVersion:{userId}:{profileVersion}` | Outbox recommended | Retry consumers | Consumers stay on previous version | Async-capable |
| EmploymentDiagnosisRequested | User or system requests diagnosis | Career Intelligence | Diagnosis Engine | `userId`, `identityVersion`, `reason` | private free-text notes | `DiagnosisRequested:{userId}:{identityVersion}:{reason}` | Outbox if AI/heavy | Retry if retryable | Show retry state | Async-capable |
| EmploymentDiagnosisCompleted | Diagnosis available | Career Intelligence | Home, Coach, Career Growth | `userId`, `diagnosisId`, `readinessScoreVersion` | raw AI prompt | `DiagnosisCompleted:{userId}:{diagnosisId}` | Outbox recommended | Retry consumers | Diagnosis remains saved; Home may stale | Sync plus outbox |
| ReadinessChanged | Readiness state changes | Career Intelligence | Home, Coach, Analytics | `userId`, `from`, `to`, `reason`, `version` | sensitive profile details | `ReadinessChanged:{userId}:{version}` | Outbox recommended | Retry consumers | Show last known readiness | Sync |
| DocumentGenerationRequested | User requests document | Documents | Document Engine, Permissions, Audit | `userId`, `documentType`, `sourceVersion` | full document text | `DocGenRequested:{userId}:{documentType}:{sourceVersion}` | Outbox recommended | Retry generation | Show failed generation state | Async-capable |
| DocumentGenerated | Document created | Documents | Home, Career Passport, Audit | `userId`, `documentId`, `documentType`, `sourceVersion` | document body | `DocumentGenerated:{documentId}` | Outbox recommended | Retry consumers | Document remains saved | Sync plus outbox |
| DocumentBecameOutdated | Source identity changed | Sync Engine | Documents, Home | `userId`, `documentId`, `reason`, `sourceVersion` | changed field values | `DocumentOutdated:{documentId}:{sourceVersion}` | In-process or outbox | Retry stale flag | Sync state unknown | Sync |
| DocumentRegenerated | User approves regeneration | Documents | Home, Audit | `userId`, `documentId`, `sourceVersion` | generated text | `DocumentRegenerated:{documentId}:{sourceVersion}` | Outbox recommended | Retry consumers | Keep previous version | Async-capable |
| CareerGoalChanged | Career Goal section changes | Professional Identity | Diagnosis, Documents, Matches, Coach | `userId`, `identityVersion` | full goal text unless authorized | `CareerGoalChanged:{userId}:{identityVersion}` | Outbox recommended | Retry invalidation | Mark affected areas stale | Sync |
| JobImported | User imports or pastes job | Opportunities | Job Intelligence | `userId`, `jobImportId`, `sourceType` | raw advert body in event | `JobImported:{jobImportId}` | Outbox recommended | Retry analysis | Job remains pending analysis | Async-capable |
| JobAnalysed | Job requirements structured | Employment Intelligence | Match Engine, Opportunities | `userId`, `jobId`, `analysisVersion` | raw advert body | `JobAnalysed:{jobId}:{analysisVersion}` | Outbox recommended | Retry matching | Show analysis only | Async-capable |
| JobSaved | User saves job | Opportunities | Home, Analytics | `userId`, `opportunityId` | private notes | `JobSaved:{userId}:{opportunityId}` | In-process | No retry unless DB write failed | User can retry save | Sync |
| JobMatchCalculated | Match generated | Employment Intelligence | Opportunities, Documents, Home | `userId`, `jobId`, `matchId`, `profileVersion` | full evidence text | `JobMatch:{jobId}:{profileVersion}` | Outbox recommended | Retry consumers | Show stale/no match | Async-capable |
| ApplicationCreated | User creates application | Success Center | Timeline, Documents, Home | `userId`, `applicationId`, `jobId` | private notes | `ApplicationCreated:{applicationId}` | Audit recommended | Retry timeline | Application exists; timeline can backfill | Sync plus outbox |
| ApplicationStageChanged | Status changes | Success Center | Timeline, Follow-Up, Analytics | `userId`, `applicationId`, `from`, `to` | private notes unless note event | `ApplicationStage:{applicationId}:{from}:{to}:{timestamp}` | Audit required | Retry timeline/follow-up | Keep status; flag event sync | Sync plus outbox |
| InterviewScheduled | Interview date added | Success Center | Interview Prep, Notifications, Timeline | `userId`, `applicationId`, `interviewAt`, `type` | interviewer private notes | `InterviewScheduled:{applicationId}:{interviewAt}` | Outbox recommended | Retry reminders/prep | Show manual prep action | Async-capable |
| OfferReceived | Offer recorded | Success Center | Timeline, Follow-Up, Coach | `userId`, `applicationId`, `offerId` | compensation details unless authorized | `OfferReceived:{applicationId}:{offerId}` | Audit recommended | Retry consumers | Offer remains; guidance can retry | Sync plus outbox |
| EmploymentStarted | User records employment start | Success Center | Career Growth, Analytics, Coach | `userId`, `applicationId`, `startDate` | contract details | `EmploymentStarted:{userId}:{applicationId}` | Audit recommended | Retry consumers | Manual retry available | Sync |
| CareerMilestoneRecorded | Growth milestone added | Career Growth | Home, Coach, Analytics | `userId`, `milestoneId`, `type` | private journal content | `CareerMilestone:{milestoneId}` | In-process or outbox | Retry consumers | Milestone remains saved | Sync |

## 5. Retry Behaviour

V1 retry rules:

- deterministic stale flags may retry immediately
- timeline/audit events should use outbox retry
- AI, OCR, PDF, and notification work should become async-capable
- user-visible actions must not duplicate records on retry

## 6. Failure Behaviour

Failure should be safe:

- producer action remains valid if its own write succeeded
- downstream consumers may be stale
- user sees a retry or "needs refresh" state
- sensitive error details stay server-side and sanitized

## 7. Explicit Non-Goals for V1

Do not add:

- distributed message broker
- microservice event bus
- cross-service saga framework
- automatic application submission
- hidden notification sending
