# PATHZY Domain Glossary

Status: Active for PATHZY V1
Created: 2026-07-28

This glossary prevents ambiguous or overlapping definitions across product, engineering, AI, database, and UX work.

## Professional Identity

The authoritative source of truth for a PATHZY user. It includes profile data, employment evidence, preferences, readiness information, goals, documents, and constraints used by PATHZY's downstream systems.

## Career Passport

A portable summary of the user's confirmed Professional Identity, readiness, employability evidence, and career direction. It is an output of Professional Identity, not a separate profile.

## Career Intelligence

The intelligence layer that understands the user's career direction, readiness, gaps, transferable skills, development needs, and next steps.

## Employment Intelligence

The intelligence layer that understands opportunities, job requirements, suitability, gaps, risks, and targeted preparation.

## Employment Diagnosis

The structured explanation of the user's current employment readiness. It identifies what is complete, missing, risky, strong, uncertain, and recommended next.

## Readiness

The user's current ability to take a meaningful employment action, based on Professional Identity completeness, evidence quality, documents, job fit, application status, and preparation.

## Evidence

A confirmed or reviewable fact that supports a document, match, application, interview answer, or recommendation. Evidence may come from Professional Identity, imported documents, user-approved records, applications, or supporting documents.

## Opportunity

A job, role, contract, programme, or income pathway that may be evaluated by PATHZY.

## Job Match

An evidence-grounded comparison between a structured opportunity and the user's Canonical Professional Identity. A Job Match includes strengths, gaps, uncertainty, risks, and next actions.

## Hard Constraint

A requirement that strongly affects suitability, such as location, work authorization, required licence, mandatory qualification, availability, salary floor, or non-negotiable work arrangement.

## Transferable Skill

A skill or pattern of evidence from one context that can truthfully support another target role or industry.

## Saved Job

An opportunity saved by the user for later review, preparation, comparison, or application.

## Application

A tracked attempt or planned attempt to apply for an opportunity. It includes status, documents, notes, contacts, dates, timeline events, follow-ups, and interview preparation.

## Application Package

The set of user-approved materials prepared for one application, such as a targeted CV, cover letter, LinkedIn content, recruiter message, supporting documents, and notes.

## Success Center

The PATHZY pillar that manages applications, timeline, contacts, interview preparation, follow-up, and application outcomes.

## Career Growth

The PATHZY pillar that supports long-term employability through skills, readiness improvement, Coach guidance, analytics, and career development.

## Career Coach

The guidance layer that helps the user understand next steps, improve readiness, prepare for applications, and reflect on progress using Professional Identity and journey state.

## Document

A user-facing professional asset such as CV, Cover Letter, LinkedIn profile, Career Passport, recruiter message, follow-up email, thank-you email, references, or supporting document.

## Document Version

A saved version of a document, including content, design metadata, timestamps, export history, and sync state where relevant.

## Document Template

A presentation layout or design system applied to document content. A template must not own or overwrite identity data.

## Job-Specific Variant

A tailored document version prepared for a particular opportunity. It remains linked to the base Professional Identity and may include explicit user-approved overrides.

## Manual Override

A user-approved change that intentionally differs from the synced Professional Identity source. It must be visible and traceable.

## Sync State

The relationship between a document or variant and its Professional Identity source. Examples include synced, modified, needs review, outdated, or manually overridden.

## Recommendation

A PATHZY next step or suggestion. A recommendation must explain why it matters and what happens if the user acts.

## Entitlement

The access state that determines whether a user can perform an action, such as download, export, advanced AI improvement, premium templates, or advanced analytics.

## Founder User

An intended early user with enhanced access during the founder or private beta period. Founder access must be centrally managed and must not become page-level bypass logic.

## Audit Event

A recorded event for security, consent, application state, document export, important AI generation, or other high-value action.

## Interface Language

The language used for PATHZY navigation and UI.

## Professional Document Language

The language used for generated CVs, cover letters, LinkedIn content, or other professional documents. It may differ from the interface language.

## Interview-Practice Language

The language used for interview preparation and practice.

## Notification and Email Language

The language used for reminders, system emails, and notifications.

## Protected Route

A route requiring authentication and safe redirect handling.

## Legacy Alias

An old route kept temporarily for compatibility and redirected to a canonical destination.

## Compatibility Table

A database table kept temporarily because current runtime code or user data still depends on it while canonical migration is incomplete.

## Unacceptable Ambiguity

Avoid these overlaps:

- CV is not Professional Identity.
- Uploaded CV is not source of truth.
- Employment Center is not Applications.
- Career Coach is not automatic decision-maker.
- Premium template is not a separate user workflow.
- Job Match is not an unexplained score.
