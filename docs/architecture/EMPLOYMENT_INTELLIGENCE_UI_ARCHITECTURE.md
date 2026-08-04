# Employment Intelligence UI Architecture

The UI depends on Phase 3F services and API routes.

Flow:

1. Authenticated server page loads Professional Identity language.
2. Server page loads current Employment Intelligence using the Phase 3F application service.
3. View model converts canonical codes into labels, routes and presentation groups.
4. Client action components call `/api/employment-intelligence` for recompute and action transitions.
5. Action History updates Career Plan progress server-side.

The view model may format labels and group content. It must not change action priority, readiness bands, barriers, strengths or plan steps.
