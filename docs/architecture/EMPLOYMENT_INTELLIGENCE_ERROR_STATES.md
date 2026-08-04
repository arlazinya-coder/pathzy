# Employment Intelligence Error States

Supported states:

- not generated;
- current;
- stale;
- updating;
- failed;
- unavailable.

Rules:

- Previous valid results remain visible during failed recomputation.
- Retry is offered when the service can retry.
- Raw database errors are not exposed.
- Empty states offer one next step.
- No fake success or fake completion is shown.
