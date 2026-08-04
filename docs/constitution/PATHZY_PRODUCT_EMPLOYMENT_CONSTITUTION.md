# PATHZY Product and Employment Constitution

Status: Locked for PATHZY V1
Created: 2026-07-28
Primary evidence:
- `docs/audits/CURRENT_STATE_AUDIT.md`
- `docs/audits/ROUTE_AND_FLOW_MAP.md`
- `docs/audits/RISK_REGISTER.md`

This constitution is the primary reference before significant PATHZY coding work. If a product, architecture, data, AI, routing, monetisation, security, or document decision conflicts with this file, the conflict must be recorded in `docs/decisions/DECISION_REGISTER.md` before implementation.

## 1. Mission

PATHZY helps people become visible, prepared, informed, protected, and connected to suitable employment or income pathways.

PATHZY exists to reduce confusion and fear in the employment journey. It turns a user's Professional Identity into clear readiness, stronger documents, better job understanding, safer applications, interview preparation, follow-up guidance, and long-term career growth.

## 2. Public Promise

PATHZY helps people send better applications with confidence.

This promise means:

- users know what to do next
- users understand why an action matters
- users can trust that their information is preserved
- users can create professional employment documents
- users can evaluate opportunities truthfully
- users remain in control of important employment actions

## 3. Product Identity

PATHZY is an Employment Operating System.

PATHZY is not:

- a CV builder as the main product
- a generic job board
- a disconnected set of AI tools
- a dashboard before the user is understood
- an automatic application bot

CV, Cover Letter, LinkedIn, Professional Bio, Opportunities, Applications, Interview Preparation, Career Coach, and Career Growth are capabilities inside one employment system.

## 4. Source of Truth

Professional Identity is the authoritative source of truth across PATHZY.

Generated documents, uploaded CVs, imported files, page-local forms, AI drafts, and job-specific variants may enrich or reference Professional Identity. They must not become separate competing profiles.

Documents and employment tools must use Professional Identity rather than maintaining independent profile models for each tool.

## 5. Locked User Journey

The required user journey is:

1. Authentication
2. Preferred interface language
3. Professional Identity guided setup
4. Review My Information
5. Finish Setup
6. Employment Diagnosis
7. Personalised Home
8. PATHZY ecosystem

PATHZY explicitly rejects:

- CV-first onboarding
- Build My CV as the first user journey
- sending users directly to Cover Letter
- sending users directly to Application Tracking
- generic dashboards before the user is understood

Phase 3B adds a locked implementation rule: Employment Intelligence conclusions must be produced by a deterministic, explainable engine before any AI enhancement or presentation layer may act on them. AI may assist later, but must not own readiness, eligibility, ownership, or barrier conclusions.

Phase 3C adds the country-adapter rule: country context may inform Employment Intelligence, but it must not overwrite Professional Identity, infer work authorisation from nationality, invent salary or market data, make legal conclusions, or hide unavailable data.

Returning users with incomplete Professional Identity must resume the correct unfinished section. Returning users with sufficiently complete Professional Identity may proceed to Personalised Home.

## 6. Authoritative Professional Identity Sections

Professional Identity must support these authoritative sections:

1. Profile
2. Photo
3. Personal Information
4. Location
5. Nationality
6. Work Authorization
7. Career Goal
8. Professional Summary
9. Education
10. Experience
11. Skills
12. Projects
13. Achievements
14. Certificates
15. Licences
16. Languages
17. References
18. Portfolio
19. Social Profiles
20. Preferences
21. Employment Preferences
22. Salary Expectations
23. Availability

Document engines, matching engines, application workflows, interview preparation, and Coach features must consume these sections through canonical Professional Identity services or approved compatibility adapters.

## 7. Seven-Pillar Product Architecture

### 1. Professional Identity

Responsibility:

- capture and preserve the user's verified employment identity
- store profile, evidence, preferences, readiness inputs, and employment constraints
- act as the source of truth for downstream systems

Boundary:

- does not generate job-specific claims without user review
- does not become a CV-only profile

### 2. Career Intelligence

Responsibility:

- understand the user's career direction, readiness, goals, strengths, gaps, transferable skills, and development needs
- support Employment Diagnosis and Career Growth

Boundary:

- does not replace the user with automated high-impact decisions
- does not present unexplained AI conclusions

### 3. Employment Intelligence

Responsibility:

- inspect opportunities
- understand job requirements
- compare jobs with Professional Identity
- explain suitability, gaps, risks, and next actions

Boundary:

- does not auto-apply
- does not invent qualifications or experience

### 4. Employment Center

Responsibility:

- organise professional tools, documents, and preparation workflows
- include CV, Cover Letter, LinkedIn, Professional Bio, My Documents, and related employment assets

Boundary:

- does not maintain separate profiles per tool
- does not let template choice overwrite identity data

### 5. Opportunities

Responsibility:

- help users find, save, understand, compare, and prepare for suitable jobs or income pathways

Boundary:

- Applications must only be reached through the Applications section or after a real application action, not as a mistaken Employment Center destination

### 6. Success Center

Responsibility:

- manage applications, targeted application packages, interview preparation, follow-up, timeline events, contacts, and status history

Boundary:

- requires user approval before any application or outbound communication
- private notes must not leak into generated documents

### 7. Career Growth

Responsibility:

- support skill growth, readiness improvement, Coach guidance, analytics, and long-term employability

Boundary:

- must use evidence and readiness data, not generic motivational content alone

## 8. Intelligence-First Development

PATHZY intelligence must be structured, explainable, and evidence-grounded.

Every major intelligent recommendation should identify:

- the source data used
- confirmed facts
- inferred meaning
- missing information
- uncertain information
- risks
- recommended next action
- expected effect of the action

Unexplained AI scores, raw profile dumps, copied CV paragraphs, unsupported claims, and hidden high-impact decisions are unacceptable.

### Phase 3 Employment Intelligence Lock

Employment Intelligence is the single derived interpretation layer that reads Professional Identity, Employment Diagnosis and country context. It may produce readiness dimensions, evidence gaps, barriers, pathway recommendations, support intensity, Next-Best-Action, Career Plan, explanations, confidence and missing information.

Employment Intelligence must not:

- replace Professional Identity as the source of truth
- overwrite Employment Diagnosis
- become a single employability score
- make employer hiring decisions
- declare anyone unemployable
- blame users for poverty, unemployment duration, low literacy, disability, nationality, lack of formal evidence or other structural barriers
- infer protected attributes
- use generative AI to determine identity completion, ownership, route state, work eligibility, evidence verification, hard eligibility or legal conclusions

Consumers such as Home, Career Coach, documents, opportunities, applications and interview preparation may read Employment Intelligence. They must not independently recalculate it.

Canonical intelligence codes are language-independent. English and French are presentation layers and must never change stored readiness, barrier, pathway or support-intensity values.

## 9. System-Level Fixes Before Page-Level Patches

When a defect appears in one screen, inspect the shared system first.

Examples:

- a broken button may indicate route centralization drift
- a document field in the wrong place may indicate template-engine mapping drift
- a loading state stuck after a successful response may indicate shared frontend completion logic
- a Supabase object error may indicate schema drift rather than a page bug

Fix root causes across shared services when the problem can occur in more than one place.

## 10. Premium CV and Cover-Letter Standards

PATHZY CVs and cover letters must meet premium international quality.

Non-negotiable document rules:

- identity data must be separate from templates
- template switching must never destroy content
- documents must show sync status with Professional Identity
- job-specific variants must remain linked to the base identity
- manual overrides must be explicit
- AI-generated claims must be traceable and user-approved
- A4 preview and exported PDF must match closely
- ATS compatibility must not destroy visual quality
- preview and export must not include internal PATHZY notes, placeholders, prompt text, debug text, or empty sections

The standard is not "the page renders." The standard is that a user can trust PATHZY for recruiter-ready employment documents.

## 11. Explainable Employment Intelligence

Job matching, opportunity suitability, interview preparation, and targeted document recommendations must be explainable.

PATHZY must show:

- what the job requires
- how the user's confirmed evidence supports the match
- what is missing
- what is uncertain
- which claims are safe to use
- what the user should do next

PATHZY rejects unexplained AI match percentages as the primary answer.

## 12. Multilingual Architecture From Day One

PATHZY must support separate language preference layers:

1. Interface language
2. Career Coach conversation language
3. Professional document language
4. Interview-practice language
5. Notification and email language

Rules:

- do not use flags as language selectors
- use standard language names or codes
- detect supported browser language on the public website
- default to English when unsupported
- always show a visible language selector
- ask document language separately during Professional Identity setup
- do not silently change document language based on a vacancy

English and French support must be architected through shared copy and language boundaries rather than retrofitted page by page.

## 13. Security, Privacy, and AI Safety

PATHZY handles sensitive employment, identity, document, job, application, and career data.

Required principles:

- least-privilege access
- server-side authorization
- owner-scoped user data
- Row-Level Security on user-data tables
- secure uploads
- input validation
- output sanitisation
- secrets outside source code
- audit logging for important actions
- data export and account deletion paths before public launch
- consent records for high-impact actions
- prompt-injection protection
- separation of user content from system instructions
- no silent job applications
- no hidden high-impact decisions
- no unnecessary personal data sent to AI providers
- user approval for important generated content
- independent senior engineering and security review before launch

PATHZY must not analyze or score protected characteristics, appearance, accent, or personality stereotypes.

## 14. Professional Photo and Profile Presentation

Professional Photo is part of canonical Professional Identity, but it is optional unless a future explicit policy changes that rule.

Required principles:

- one canonical professional photo asset per user identity context
- image binaries live in protected object storage, not profile records
- profile records store references, metadata, consent, visibility, and usage decisions
- temporary browser URLs and large base64 images must never be persisted
- photo, profile visibility, CV usage, and future public sharing are separate user decisions
- public sharing defaults to off
- CV templates must not own independent profile-photo uploads
- photo-disabled CV templates must remain complete and premium
- PATHZY must not perform face recognition or infer sensitive personal traits from a photo

The Professional Profile preview is a private representation of Professional Identity. It is not a second profile, a social network, a public directory, or a LinkedIn clone.

## 14. Human Approval

PATHZY may prepare documents, messages, follow-ups, recommendations, application packages, and interview answers.

PATHZY must not:

- submit an application without user approval
- send an email without user approval
- send a recruiter message without user approval
- mark an application state as viewed, rejected, or advanced without reliable user or employer evidence
- use unsupported claims in generated documents

The user remains in control.

## 15. Value Before Paywall

Monetisation principle:

Show value first, earn trust, and let users upgrade because they want more, not because PATHZY has blocked their journey.

Free should support the core employment-readiness journey.

Pro may add:

- advanced intelligence
- acceleration
- specialised guidance
- premium template collections
- greater tailoring
- advanced analytics
- greater automation
- career mastery tools

The first 20 users are intended founder users with enhanced access. Final commercial rules remain subject to business confirmation.

Paywalls may restrict premium actions such as downloads, exports, advanced AI improvement, advanced templates, and unlimited usage. Paywalls must not block the user's ability to understand PATHZY's core value.

## 16. Accessibility and International Usability

PATHZY must be usable across desktop, tablet, mobile, languages, slow connections, and varied employment backgrounds.

Required direction:

- clear hierarchy
- visible next action
- keyboard-accessible controls
- readable contrast
- mobile-safe layouts
- no essential actions hidden behind hover-only behaviour
- no scroll traps
- no clipped CTAs
- language and locale awareness
- plain language for ordinary job seekers

## 17. Unacceptable Regressions

The following are unacceptable regressions:

- losing user work
- deleting or overwriting accepted features
- breaking authentication or protected-route redirect logic
- sending authenticated users to the wrong main workflow
- CV-first onboarding replacing Professional Identity-first onboarding
- route aliases silently diverging from canonical routes
- documents losing sync with Professional Identity
- preview and PDF export using different content logic
- internal PATHZY instructions leaking into generated documents
- empty document sections rendering as headings
- one user accessing another user's data
- premium gates changing route implementations instead of action availability
- silent job applications or messages
- English-only architecture blocking French support
- build artifacts or secrets included in commits
- Employment Diagnosis overwriting Professional Identity automatically
- diagnosis answers being stored as duplicate identity facts
- static one-size-fits-all diagnosis replacing adaptive, evidence-aware questioning
- sensitive diagnosis answers being used without purpose, opt-out or privacy boundary

## 18. Progress Preservation and Git Safety

PATHZY development must preserve the current working tree and accepted history.

Rules:

- inspect before changing
- treat local Git history and working tree as the technical source of truth
- create backup branches before risky structural changes
- do not reset, revert, delete, clean, rebase, merge, or overwrite unless explicitly requested
- do not deploy without explicit approval
- do not push unless the task explicitly asks for it
- keep phase work scoped
- preserve user data and migrations
- document intentionally unsafe or deferred actions

## 19. Rules for Changing Locked Decisions

A locked decision may change only when:

1. The current decision is named.
2. The conflict is explained.
3. The rejected and proposed alternatives are documented.
4. Migration implications are stated.
5. User-data preservation is addressed.
6. Security and privacy impact is reviewed.
7. The Decision Register is updated.
8. The change passes the Definition of Done.

No locked decision may be bypassed silently inside a page, component, route handler, database migration, or AI prompt.

## 20. Employment Diagnosis Boundary

Employment Diagnosis is a separate diagnostic process. It may read Professional Identity and produce structured findings, barriers, support needs, country-context clarifications and explicit Professional Identity suggestions.

Employment Diagnosis must not:

- own canonical identity facts
- overwrite Professional Identity automatically
- store translated labels as answer values
- force every user through the same long questionnaire
- use generative AI for hard eligibility or legal conclusions
- produce final Career Plans before the approved Career Plan phase

Diagnosis must be deterministic, adaptive, explainable, multilingual, privacy-aware and resumable.
