# Phase 3 Employment Intelligence

Status: Phase 3A contract locked
Date: 2026-08-04
Code contracts: `lib/employment-intelligence/domain/`

## Definition

PATHZY Employment Intelligence is a structured, evidence-aware interpretation of the user's Professional Identity, Employment Diagnosis, and country context. It helps PATHZY determine current employment position, readiness across several dimensions, strongest assets, evidence gaps, barriers, suitable opportunity pathways, support intensity, next best action, Career Plan, uncertainty, and missing information.

Employment Intelligence must not determine a person's worth, declare someone unemployable, make employer hiring decisions, claim unverified facts are verified, punish poverty or structural barriers, infer sensitive personal attributes, or replace human judgement in high-impact decisions.

## Locked boundaries

- Professional Identity remains the canonical source of user-supplied professional facts.
- Employment Diagnosis remains a separate diagnostic source.
- Derived intelligence must not overwrite Professional Identity.
- Consumers may read Employment Intelligence but must not independently recalculate it.
- Numerical scoring is secondary to evidence, explanation, missing information, and next action.
- Career Plan is the user-facing term; Roadmap is legacy language.

## Phase 3A deliverables

- Authoritative architecture and domain documentation.
- Typed domain contracts for inputs, evidence, readiness, barriers, pathways, support intensity, next actions, Career Plan, explainability, country context, stale status, and derived profile.
- Contract tests that protect canonical codes and language-independent behavior.

## Not included in Phase 3A

- No dashboard cards.
- No UI redesign.
- No live job matching changes.
- No salary data integration.
- No generative AI calls.
- No database migration.
- No live South Africa facts.
