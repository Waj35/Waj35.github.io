# AI workflow note

## Tools used

I used OpenAI Codex as a coding and review partner for implementation, test generation, and documentation. I retained product and architecture decisions: which slice to ship, the persistence tradeoff, the interaction model, and what not to build.

## Where AI materially helped

- Rapidly scaffolded the application surfaces and responsive visual system.
- Turned ownership/sharing requirements into small testable domain functions.
- Produced a first pass of reviewer documentation while implementation context was fresh.
- Accelerated edge-case review for malformed stored data, unauthorized sharing, unsupported uploads, empty titles, and mobile layout.

## Output changed or rejected

- Rejected replacing the existing portfolio at the repository root; the app is isolated at `/ajaia-docs/` so unrelated work is preserved.
- Rejected a heavyweight framework/editor stack because dependency setup did not improve the timeboxed reviewer path.
- Changed the initial broad feature ambition to a focused simulated-user model and documented the cross-device limitation explicitly.
- Kept destructive deletion behind confirmation and owner checks rather than accepting a purely visual control.

## Verification

- Ran the Node test suite for visibility, owner-only sharing/revocation, and malformed persisted state.
- Served the application locally to verify that static assets and ES modules resolve over HTTP.
- Reviewed the UI for keyboard labels, empty states, error messages, mobile breakpoints, save feedback, and unsupported upload handling.
- Kept access-control rules in a testable module rather than relying on hidden buttons.

The automated suite currently covers the highest-risk domain rule. A production follow-up would add browser-level tests and accessibility auditing before release.
