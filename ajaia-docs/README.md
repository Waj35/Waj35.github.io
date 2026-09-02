# Draftly

Draftly is a focused, browser-based collaborative document editor built for the Ajaia product-engineering exercise. It prioritizes a coherent end-to-end slice over feature breadth: create, format, autosave, reopen, import, share, switch users, and clearly understand who owns what.

## Live product

When this repository is published with GitHub Pages, open:

`https://waj35.github.io/ajaia-docs/`

No credentials are required. Use the **Viewing as** switcher in the lower-left corner to demo the seeded users:

- Maya Chen (default)
- Jonah Reed
- Priya Shah

## Run locally

Requirements: Node.js 20+ and a modern Chromium, Firefox, or Safari browser.

```bash
cd ajaia-docs
npx serve .
```

Open the URL printed by `serve`. Because the app uses ES modules, opening `index.html` directly from the filesystem is not supported.

Run the automated tests:

```bash
npm test
```

## Reviewer path (about 2 minutes)

1. As Maya, create a document and rename it.
2. Select text and try headings, bold, italic, underline, and lists.
3. Return to the dashboard and reopen it; content and formatting remain.
4. Open the document, choose **Share**, and grant Priya access.
5. Switch to Priya. The document appears under **Shared with me** and remains editable.
6. Choose **Import file** to turn a `.txt` or `.md` file into a document.

## Supported import formats

- `.txt`: paragraphs and line breaks are preserved.
- `.md`: headings, paragraphs, unordered lists, bold, and italic are converted.
- Maximum file size: 1 MB.

Unsupported types are rejected with an in-product error. `.docx` was intentionally excluded to avoid a heavy parser for this timeboxed build.

## Persistence and reset

Documents, formatted HTML, ownership, and sharing rules are stored under `draftly.workspace.v1` in browser `localStorage`. This makes the GitHub Pages deployment zero-cost and immediately reviewable. Data persists through refreshes in the same browser/profile, but does not sync across devices. To reset the demo, clear site data for the page.

## Known scope limits

- Sharing is demonstrated between three seeded users in one browser; there is no production authentication or server database.
- Collaboration is asynchronous, not live multiplayer.
- Imported Markdown intentionally supports a small, documented subset.
- Rich-text editing uses the browser editing API for a small dependency-free build; a production version would use a maintained editor framework.

See [ARCHITECTURE.md](ARCHITECTURE.md) for decisions and next steps.
