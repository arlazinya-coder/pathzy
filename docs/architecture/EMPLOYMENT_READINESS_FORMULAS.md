# Employment Readiness Formulas

Status: Phase 3B deterministic formulas.

The engine assesses all 14 canonical dimensions from `lib/employment-intelligence/domain/readiness.ts`.

## Dimension Score Shape

Each dimension:

1. Selects relevant extracted signals.
2. Counts known signals.
3. Counts positive supporting signals.
4. Applies missing-information penalties only to affected dimensions.
5. Applies barrier penalties only where the barrier is relevant.
6. Converts the bounded score to a canonical readiness band.

Formula shape:

`bounded(28 + positiveSignals * 18 + knownSignals * 8 - missingImpact * 10 - barrierImpact * 14)`

If no required signal is known, the dimension becomes `NOT_ASSESSED`.

## Overall Readiness

Overall readiness is dependency-aware:

- It uses assessed dimensions only.
- It withholds a broad conclusion when too many dimensions are unknown.
- It caps overall readiness when critical uncertainty exists.
- It stores methodology notes explaining that the band is not a simple average.

## Guardrails

- Missing information lowers confidence.
- Barriers affect relevant dimensions only.
- Work authorization uncertainty caps conclusions but does not classify the user as unsuitable for all employment.
- Transport and device constraints affect practical and digital access, not skills.
