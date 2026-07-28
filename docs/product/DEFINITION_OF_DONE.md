# PATHZY Definition of Done

Status: Active for PATHZY V1
Created: 2026-07-28

A feature must not be called complete merely because the page renders, typecheck passes, or the build succeeds.

## 1. Product Behaviour

Done means:

- the feature supports PATHZY as an Employment Operating System
- Professional Identity remains the source of truth
- the user has one clear next action
- the feature does what the user expects in the full journey
- no accepted workflow is removed or silently changed

## 2. UX

Done means every major screen answers:

1. Where am I?
2. Why does this matter?
3. What do I do next?
4. What happens if I do it?

No major screen may be a dead end.

## 3. Mobile Responsiveness

Done means:

- mobile, tablet, and desktop use the same workflow and routes
- presentation may adapt without changing destinations
- no horizontal overflow
- no clipped CTA
- no hover-only essential action
- no scroll trap
- important actions remain reachable

## 4. Accessibility

Done means:

- buttons and links are keyboard accessible
- labels are clear
- focus states are usable
- contrast is readable
- form errors are understandable
- visual hierarchy works without relying only on colour

## 5. Data Persistence

Done means:

- user work is saved or recoverable
- autosave and manual save states are clear where applicable
- refresh does not lose important work
- documents remain linked to Professional Identity where required
- expired access does not delete user documents

## 6. Validation

Done means:

- input is validated on the client where helpful
- server-side validation protects real data
- missing data creates useful guidance, not crashes
- malformed uploaded or generated content fails safely

## 7. Authorization

Done means:

- protected routes require authentication
- server actions and API routes verify the user
- one user cannot access another user's data
- entitlement checks are centralized where available
- membership changes action availability, not main routes

## 8. Security

Done means:

- no secrets are printed or committed
- uploads are validated
- output is sanitized
- logs avoid sensitive profile and document content
- RLS expectations are known for user-data tables
- high-impact AI and employment actions are user-approved
- prompt-injection boundaries are considered for AI flows

## 9. Error Handling

Done means:

- raw Supabase or provider error objects are not rendered to users
- failures show useful recovery actions
- loading states do not get stuck after success or failure
- provider timeouts degrade safely

## 10. Loading States

Done means:

- long actions show progress
- buttons communicate disabled/running state
- success state includes the next action
- failure state preserves user work

## 11. Empty States

Done means:

- empty data does not render broken UI or empty document headings
- empty states explain what to do next
- empty states do not invent user facts

## 12. Tests

Done means the relevant checks pass for the change scope.

Common commands:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm run test:regression`
- `pnpm run build`
- `git diff --check`

Documentation-only changes require at minimum a formatting check such as `git diff --check`, unless the task asks for broader validation.

## 13. Internationalisation

Done means:

- user-facing copy is ready for English/French expansion
- interface, document, Coach, interview, and notification language boundaries are respected
- document language is not silently changed based on a vacancy
- language selectors use names or codes, not flags alone

## 14. Documentation

Done means architecture-impacting changes update the relevant docs:

- Constitution
- Decision Register
- Target Architecture
- Domain Glossary
- Route and Flow Map
- Risk Register
- Definition of Done
- Current-to-Target Gap Map

## 15. Analytics

Done means:

- important journey events can be measured where analytics architecture exists
- analytics do not expose sensitive document/profile contents
- metrics support product improvement, not hidden high-impact decisions

## 16. Audit Logging

Done means important events can be audited where required:

- consent
- document export
- application package approval
- status change
- follow-up approval
- admin or founder access changes
- security-sensitive actions

## 17. Performance

Done means:

- the page remains responsive
- heavy document, PDF, OCR, or AI work is not run unnecessarily during render
- server/client boundaries are respected
- mobile layouts do not become unusable under load

## 18. PDF and A4 Rendering

Done means:

- A4 preview and exported PDF match closely
- content is not clipped
- text does not overlap
- headings stay with content where practical
- empty sections are hidden
- ATS compatibility does not destroy visual quality
- exported files do not include internal PATHZY guidance

## 19. Git Commits

Done means:

- changes are scoped
- unrelated dirty files are preserved
- generated artifacts are excluded unless intentionally required
- commit message is clear when a commit is requested
- backup branches exist before risky structural work

## 20. Deployment Verification

Done means before deployment:

- production build passes
- required environment variables are documented by name, without printing secrets
- required database schema is verified
- RLS and policies are checked for user-data tables
- no known launch-blocking security or migration issue remains

## 21. Stop Conditions

Stop and report when:

- schema state is unknown and runtime depends on it
- a change would overwrite unrelated work
- a migration is potentially destructive
- a test fails outside the requested scope
- a secret could be exposed
- a task would require unapproved architecture
- product acceptance cannot be met
