# PATHZY Platform Dependency Map

Status: Phase 1.5 blueprint
Created: 2026-07-28

These diagrams describe architecture direction only. They do not add runtime dependencies.

## 1. Current Architecture

```mermaid
flowchart TD
  Public["Public Landing"] --> Auth["Supabase Auth"]
  Auth --> Middleware["Next Middleware"]
  Middleware --> Pages["Next App Router Pages"]
  Pages --> Supabase["Supabase Query Builder"]
  Pages --> Components["React Components"]
  Components --> ProfileService["Professional Identity Service"]
  Components --> DocTools["CV Cover Letter LinkedIn Tools"]
  Components --> OppHub["Opportunities Hub"]
  Components --> Apps["Applications and Interview UI"]
  ProfileService --> LegacyProfile["user_profiles"]
  ProfileService --> ProfessionalIdentity["professional_identity"]
  ProfileService --> CanonicalProfile["canonical_* tables"]
  DocTools --> LegacyDocs["cv_documents cover_letters linkedin_profiles"]
  DocTools --> UserDocs["user_documents"]
  DocTools --> ProfessionalDocs["professional_documents"]
  OppHub --> JobIntel["Job Intelligence"]
  Apps --> Phase9["Application Timeline Interview Follow-Up"]
```

## 2. Target Modular Architecture

```mermaid
flowchart TD
  UI["Next.js UI and API Routes"] --> RouteEngine["Route Engine"]
  UI --> Kernel["PATHZY Kernel"]
  Kernel --> PI["Professional Identity"]
  Kernel --> CareerIntel["Career Intelligence"]
  Kernel --> EmploymentIntel["Employment Intelligence"]
  Kernel --> EmploymentCenter["Employment Center"]
  Kernel --> Opportunities["Opportunities"]
  Kernel --> SuccessCenter["Success Center"]
  Kernel --> CareerGrowth["Career Growth"]
  PI --> Canonical["Canonical Professional Identity"]
  EmploymentCenter --> Docs["Professional Document Engine"]
  EmploymentIntel --> Match["Matching Engine"]
  SuccessCenter --> Timeline["Application Timeline"]
  CareerGrowth --> Coach["Career Coach"]
  Kernel --> Events["Domain Events"]
  Kernel --> Permissions["Authorization Model"]
  Permissions --> RLS["Supabase RLS"]
```

## 3. Current Data Flow

```mermaid
flowchart LR
  User["User Input"] --> Pages["Pages and Components"]
  Pages --> UserProfiles["user_profiles"]
  Pages --> ProfessionalIdentity["professional_identity"]
  Pages --> CanonicalTables["canonical_*"]
  Pages --> LegacyDocs["legacy document tables"]
  Pages --> UserDocuments["user_documents"]
  Pages --> ProfessionalDocuments["professional_documents"]
  LegacyDocs --> Tools["Document Tools"]
  CanonicalTables --> JobMatch["Job Match"]
  UserProfiles --> NextAction["Next Action Engine"]
```

## 4. Target Professional Identity Update Flow

```mermaid
flowchart TD
  Edit["User edits Professional Identity section"] --> Validate["Validate input"]
  Validate --> Save["Save canonical section"]
  Save --> Version["Create identity version"]
  Version --> Event["ProfessionalIdentitySectionUpdated"]
  Event --> Sync["Sync Engine"]
  Sync --> Complete["Refresh completeness"]
  Sync --> Diagnosis["Mark diagnosis stale"]
  Sync --> Docs["Mark affected documents outdated"]
  Sync --> Matches["Recalculate deterministic matches"]
  Sync --> Home["Refresh Personalised Home next action"]
  Sync --> Coach["Refresh Coach context"]
```

## 5. Onboarding Route State Machine

```mermaid
stateDiagram-v2
  [*] --> Unauthenticated
  Unauthenticated --> Authentication: sign up or sign in
  Authentication --> InterfaceLanguage: authenticated
  InterfaceLanguage --> ProfessionalIdentitySetup: language selected
  ProfessionalIdentitySetup --> ReviewMyInformation: required sections complete
  ReviewMyInformation --> FinishSetup: user confirms
  FinishSetup --> EmploymentDiagnosis: setup finished
  EmploymentDiagnosis --> PersonalisedHome: diagnosis complete
  PersonalisedHome --> Ecosystem: user chooses next action
  ProfessionalIdentitySetup --> ProfessionalIdentitySetup: Continue resumes next incomplete section
```

## 6. Document Synchronization Flow

```mermaid
flowchart TD
  PIChange["Professional Identity changed"] --> SyncEngine["Sync Engine"]
  SyncEngine --> CV["Mark CV outdated"]
  SyncEngine --> CL["Mark Cover Letter outdated"]
  SyncEngine --> LI["Mark LinkedIn outdated"]
  SyncEngine --> Passport["Refresh Career Passport state"]
  CV --> UserReview["User reviews sync status"]
  CL --> UserReview
  LI --> UserReview
  UserReview --> Approve["User approves regeneration"]
  Approve --> Regenerate["Document Engine regenerates"]
  Regenerate --> Export["Preview and PDF remain aligned"]
```

## 7. Job-to-Application Workflow

```mermaid
flowchart TD
  Job["Job advert"] --> Import["Job Imported"]
  Import --> Analyse["Job Analysed"]
  Analyse --> Match["Job Match Calculated"]
  Match --> Review["User reviews strengths gaps risks"]
  Review --> Package["Prepare application package"]
  Package --> Approve["User approval"]
  Approve --> Application["Application Created"]
  Application --> Timeline["Timeline Event"]
  Application --> Interview["Interview Preparation"]
  Application --> FollowUp["Follow-Up Recommendation"]
```

## 8. Authorization Boundaries

```mermaid
flowchart TD
  Browser["Browser"] --> Server["Next Server/API"]
  Server --> Auth["Supabase Auth Session"]
  Server --> Permission["Server Permission Helper"]
  Permission --> Entitlement["Entitlement Check"]
  Permission --> Ownership["Ownership Check"]
  Ownership --> RLS["Supabase RLS Policies"]
  Entitlement --> Action["Allowed Action"]
  RLS --> Data["Owner-Scoped Data"]
  Server --> Audit["Audit Event for Sensitive Actions"]
  Browser -. "UI hints only" .-> ClientCheck["Client-Side Checks"]
```

## Diagram Assumptions

- Mermaid is rendered by GitHub Markdown; no runtime dependency is required.
- Diagrams describe intended architecture, not current implementation guarantees.
- Current architecture diagrams are simplified from Phase 0 evidence.
