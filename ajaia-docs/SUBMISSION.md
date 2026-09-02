# Submission contents

## Included

- Complete source code for the Draftly collaborative editor.
- `README.md` with local setup, reviewer flow, supported file types, and limitations.
- `ARCHITECTURE.md` with priorities, design, tradeoffs, and next steps.
- `AI_WORKFLOW.md` describing AI usage and verification.
- `store.test.js` with three automated domain tests.
- `WALKTHROUGH_URL.txt` placeholder for the required 3–5 minute video URL.
- Responsive product UI suitable for screenshots or a short GIF.

## Product URL

`https://waj35.github.io/ajaia-docs/`

This URL becomes available when the containing repository is pushed and GitHub Pages serves the branch.

## Demo access

No password is required. Use the in-product **Viewing as** control to switch between Maya Chen, Jonah Reed, and Priya Shah and demonstrate sharing.

## Working

- Create, rename, edit, autosave, reopen, search, filter, duplicate, and delete documents.
- Bold, italic, underline, three heading levels, ordered/unordered lists, undo, and redo.
- Import `.txt` and a documented subset of `.md` up to 1 MB.
- Grant and revoke access as the owner; view owned/shared distinction as each seeded user.
- Persist rich HTML content and sharing state across refreshes in the same browser.

## Incomplete / external steps

- The walkthrough video must be recorded and its public URL pasted into `WALKTHROUGH_URL.txt`.
- The source folder must be uploaded to Google Drive and its share URL supplied by the candidate.
- Deployment depends on pushing this repository to the GitHub Pages branch.
- Persistence is browser-local, not a remote database; see `ARCHITECTURE.md` for the planned production path.
