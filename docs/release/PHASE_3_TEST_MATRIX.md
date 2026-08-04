# PATHZY Phase 3 Test Matrix

Automated test file: `tests/regression.test.mjs`

## Automated Coverage

| Area | Evidence |
| --- | --- |
| Phase 3A contracts | Canonical codes, evidence states, AI boundary and consumer dependency assertions. |
| Phase 3B engine | Determinism, fixture breadth, unknown handling, readiness, barriers, pathways and non-mutation assertions. |
| Phase 3C South Africa adapter | Adapter version, source registry, unavailable salary/programme markers, work-authorisation boundaries and fairness assertions. |
| Phase 3D diagnosis | Adaptive question ordering, persistence, no duplicate Identity questions, routing and no generative AI assertions. |
| Phase 3E action/Career Plan | Action registry, dependency graph, priority model, one primary action, three secondary actions, Career Plan horizons and accessibility modes. |
| Phase 3F persistence | Tables, RLS, transactional finalize RPC, previous-valid preservation, idempotency, stale fields and owner-derived API assertions. |
| Phase 3G UI | Persisted service reads, no page-level recalculation, action updates through API, Career Plan route, English/French presentation and accessibility primitives. |

## Automated Commands

| Command | Result |
| --- | --- |
| `pnpm.cmd typecheck` | PASS |
| `pnpm.cmd run test:regression` | PASS |
| `pnpm.cmd run lint` | PASS with 74 warnings |
| `pnpm.cmd run build` | PASS with 74 warnings |
| `git diff --check` | PASS |

## Gaps

- No Playwright or browser-driven authenticated journey was available in this pass.
- No live Supabase SQL verification was executed in this pass.
- No automated accessibility runner beyond source-level regression assertions was available.
- No measured production performance profile was captured.
