# PATHZY Phase 3 Performance Report

## Measured During This Pass

| Command | Result |
| --- | --- |
| `pnpm.cmd run build` | Completed successfully. |
| Production compile time | 14.6s reported by Next.js. |
| Static page generation | 68 pages generated. |
| Shared first-load JS | 102 kB reported by Next.js. |
| `/api/employment-intelligence` first-load JS | 103 kB reported by Next.js route summary. |
| `/roadmap` first-load JS | 126 kB reported by Next.js route summary. |
| `/discovery/results` first-load JS | 126 kB reported by Next.js route summary. |
| `/roadmap/career-plan` first-load JS | 126 kB reported by Next.js route summary. |

## Not Measured

The following require browser instrumentation and authenticated test accounts:

- Authentication transition.
- Home summary load.
- Diagnosis start and question transition.
- Answer save.
- Diagnosis completion.
- Intelligence generation.
- Persisted summary reload.
- Career Plan load.
- Action state update.
- Stale marking.
- Recompute.
- Language switching.
- Mobile initial render.

## Status

Build performance evidence: PASS
Authenticated runtime performance evidence: REQUIRED BEFORE RELEASE TAG
