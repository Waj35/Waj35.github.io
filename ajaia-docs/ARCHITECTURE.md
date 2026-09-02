# Architecture and product decisions

## Product slice

The core bet is that reviewers should be able to understand the product within seconds and complete the entire create→edit→save→share→reopen loop without setup. I therefore prioritized:

1. A calm, usable editing surface with clear autosave feedback.
2. Sharing behavior that is visible and testable, including owner-only access controls.
3. Durable formatting and permissions after refresh.
4. A relevant import path rather than a decorative upload control.
5. Reviewer affordances: seeded content, user switching, counts, filters, and an explicit two-minute test path.

## Structure

```text
index.html       semantic UI and dialogs
styles.css       responsive application layout and visual system
app.js           UI orchestration, autosave, import, and editor commands
store.js         domain model, validation, visibility, and sharing rules
store.test.js    access-control and persisted-state tests
```

The domain rules are kept out of the DOM layer, so ownership and visibility can be tested independently and moved behind an API later. Persisted state has a versioned key and is normalized before use; malformed documents are discarded instead of breaking the workspace.

## Security and data integrity

- Document visibility is derived from `ownerId` and `sharedWith`, not just UI filters.
- Only the owner can grant or revoke access; the domain functions enforce this even if called outside the modal.
- User-supplied titles and plain-text imports are escaped before HTML insertion.
- Upload type and size are validated in the browser.
- Saved state is validated on load.

This is still a prototype security model. Seeded user switching is intentionally not authentication, and `localStorage` is not an authorization boundary.

## Deliberate tradeoffs

The assignment asks for a full-stack application, but a real multi-user backend plus authentication would consume much of the timebox and add deployment credentials or paid-service risk. I chose a fully deployable static product with an explicit repository/domain layer and simulated accounts. This demonstrates the complete access logic and UX honestly, while keeping the review path frictionless.

I also chose the native content-editing API over a large editor dependency. It covers the requested formatting reliably in current browsers and keeps the build dependency-free, but a production editor needs a structured document model, stronger paste handling, and deterministic cross-browser behavior.

## Next 2–4 hours

1. Add a small hosted API (Supabase or a serverless function + Postgres) with magic-link authentication and row-level document permissions.
2. Replace browser editing commands with Lexical or TipTap and sanitize saved rich text with DOMPurify.
3. Add share links, permission roles (`viewer` / `editor`), and optimistic conflict handling.
4. Add Playwright coverage for the full cross-user sharing flow and import edge cases.

Real-time cursors, comments, version history, and `.docx` import remain after the core multi-user persistence path is productionized.
