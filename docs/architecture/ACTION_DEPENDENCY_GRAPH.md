# Action Dependency Graph

Dependencies are modelled in `action-dependencies.ts`.

The graph exposes:

- `dependencyGraph`
- `findDependencyCycles`
- `unmetActionDependencies`

Rules:

- Create CV depends on sufficient Professional Identity.
- Cover letter depends on CV.
- Opportunity review depends on a usable CV.
- Application package depends on job analysis and CV.
- Tracking follows user-approved application preparation.
- Interview preparation follows application/interview context.

Blocked actions may appear as secondary context, but the primary action should resolve the blocker unless it is directly executable.
