# Batch 1.3 — Skip Link (WCAG 2.4.1, PAAR A11Y-01)

## Apply these changes
Replace `layouts/_default/baseof.html` with the file here. No CSS file changes — zero CSS was added, edited, or duplicated; the pre-existing `.skip-link` / `.skip-link:focus` rules already in `assets/css/main.css` are reused as-is.

## What changed
Two additions, both in `baseof.html`, nothing else:
1. `<a href="#main-content" class="skip-link">Skip to main content</a>` — the very first element inside `<body>`, before even the (untouched, out-of-scope) cursor markup and nav.
2. `id="main-content" tabindex="-1"` added to the existing `<main>` element — `tabindex="-1"` makes it programmatically focusable so keyboard focus reliably lands inside main content after activation (not just a visual scroll), which is the standard, spec-recommended pattern for accessible skip links.

No other landmark, template, or layout change was made.

## Validation performed
- Hugo build: succeeded, 135 pages, no errors — identical page count to prior batches.
- Skip link confirmed as the literal first element in `<body>`, before `main-content`, on: Homepage, Projects list, a Project detail page, Blog list, a Blog post.
- `href="#main-content"` confirmed to match the `main` element's `id` exactly on every page type checked.
- `tabindex="-1"` confirmed present on `<main>` on every page type checked.
- **Universal coverage confirmed programmatically: all 71 built HTML pages contain the skip link** (expected, since every page type routes through `baseof.html`).
- **Zero duplicate `id="main-content"`** anywhere in the built output (checked all 71 pages).
- CSS file confirmed byte-identical to the version delivered in Batch 1 — no duplication, no edits.
- Visual behavior for mouse users unchanged: the reused `.skip-link` CSS keeps it positioned off-screen (`top: -100px`) until `:focus`, so nothing appears in normal mouse/visual use.
- SEO metadata (title, meta description, CSP from Batch 1.2) confirmed unchanged on spot-checked pages.

## Manual keyboard test (recommended on your end after merge)
Load any page → press Tab once → "Skip to main content" should appear top-left → press Enter → focus and viewport should jump directly to main content, skipping the nav.
