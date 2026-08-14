# Batch 3.5 — PDF / Document Download & Protection (Frozen Decision #15)

## Objective
Implement PDF downloads for Blog/Article content with an embedded CONFIDENTIAL header,
a "Muhammad Awais" watermark, and a reuse-restriction notice — all as real, extractable
content inside the generated PDF file itself, not a screen/print overlay.

## Governing requirements used
- **Constitution Frozen Decision #15**: "PDF downloads for Blogs/Articles with watermark
  and license notice; Publications link to their official source instead."
- User-supplied protection spec (this batch's brief): exact watermark text "Muhammad Awais",
  a "CONFIDENTIAL" header, and a concise, non-fabricated reuse-restriction notice — all
  embedded in the actual PDF, verifiable programmatically, not merely a CSS/print artifact.

## Pre-implementation findings

**Reconciliation:** confirmed Batches 3.3/3.4 fully intact before starting (`.nav-icon-btn`,
`sendForm()` removal, `.contact-grid`/`.contact-link` cleanup all present). Clean baseline
build: 157 pages, 0 errors/warnings.

**Content-type verification** (as explicitly requested): Blog and Articles are genuinely
distinct Hugo sections (`content/blog/`, `content/articles/`), but **both render through
the same shared partial**, `layouts/partials/works-single.html` — there is no dedicated
`layouts/blog/` directory, so Blog single pages fall through Hugo's default template lookup
to `layouts/_default/single.html` → `works-single.html`, the same partial Articles,
Publications, and Activities all use. This meant the feature could be implemented in exactly
one place, gated by `.Section`, and it would correctly cover both Blog and Articles while
excluding Publications/Activities/Achievements (which don't have PDF-eligible content types)
and Projects (which has its own separate `layouts/projects/single.html`, never touched).

**Architecture decision — CDN vs. self-hosted library:** The brief called for "the existing
project's established dependency conventions." Inspection of `layouts/_default/baseof.html`
found a strict CSP: `script-src 'self' 'unsafe-inline'` — **no external script origins are
whitelisted at all** (unlike `img-src`, which already permits `cdn.jsdelivr.net`). Loading a
PDF library from any CDN would have been silently blocked by this policy. Rather than loosen
the CSP to trust a new external origin for executable code — a real, meaningful security
posture change — I vendored jsPDF 4.2.1's prebuilt UMD bundle directly into the repo as a
static file (`static/js/vendor/jspdf.umd.min.js`, fetched from the npm registry, not via a
build step). This requires zero CSP changes, adds zero third-party runtime requests, and
still involves no Node.js/build pipeline in the actual Hugo site — it's a one-time vendoring
of a pre-built file, the same category of thing as any other static asset already in the repo.

**Generation mechanism — why not a print stylesheet:** The brief was explicit that a CSS
print-overlay wouldn't satisfy the requirement ("not merely a transient browser overlay" /
"not merely printing the webpage") and that validation would inspect the PDF
programmatically. This ruled out `window.print()` + `@media print` styling. It also ruled
out `html2canvas`-based approaches (e.g. html2pdf.js) — those rasterize the page into images
per PDF page, which would make "CONFIDENTIAL" and "Muhammad Awais" unextractable as text
(defeating the explicit validation requirement to confirm their presence programmatically).
**jsPDF's native vector-text API was used instead** — every word in the output PDF is real,
selectable, extractable text.

## Implementation

### Files changed: 4 (well under the 10-file limit)
- `layouts/partials/works-single.html` — **modified**: added the Download PDF button and an
  embedded JSON data block, both gated on `{{ if or (eq .Section "blog") (eq .Section "articles") }}`
- `assets/css/main.css` — **modified**: button styling (reuses `.btn-ghost`, no new colors/fonts)
- `static/js/pdf-export.js` — **new**: the PDF-generation module
- `static/js/vendor/jspdf.umd.min.js` — **new**: vendored jsPDF 4.2.1 library (420KB)

### How it works
1. On a Blog or Article single page, Hugo embeds a `<script type="application/json">` block
   containing the page's title, formatted date, `.Params.author` (only if the post actually
   has one — never fabricated), a filename-safe slug, and `.RawContent` (the raw Markdown
   source — chosen over `.Plain` because it preserves headings, lists, code fences, and
   tables, which a flat plain-text dump would lose).
2. The "Download PDF" button is inert until clicked — `pdf-export.js` lazy-loads the 420KB
   vendored library only at that point, not on every page load, keeping normal article page
   weight unaffected.
3. A lightweight Markdown-aware parser (not a full CommonMark implementation — just enough
   structure for readable output) walks the raw content and classifies each block: heading,
   paragraph, list item, blockquote, code fence, table, or horizontal rule.
4. jsPDF lays these out with real pagination: page-break detection (`ensureRoom`), a redrawn
   CONFIDENTIAL header + watermark on every new page, and a closing "Usage & Distribution"
   section with the reuse notice.
5. `doc.save(filename)` triggers a genuine browser file download (`<slug>-muhammad-awais.pdf`).

### Protection mechanism detail
- **CONFIDENTIAL header** — bold red-brown text, top-left of every page, above a hairline rule.
- **Watermark** — "Muhammad Awais", 34pt bold, 7% opacity, rotated 35°, repeated 4 times per
  page (diagonal tile pattern). This is real vector text drawn into the PDF content stream,
  confirmed extractable via `pypdf` — not a screen overlay, not a raster image.
- **Reuse notice** (exact wording, appears once, at the end of the document):
  > *"This document is confidential and is the property of Muhammad Awais. It may not be
  > reused, reproduced, redistributed, republished, or otherwise used, in whole or in part,
  > without prior consent from Muhammad Awais."*
  No copyright year, registration number, or company name was invented, per the brief.
- Every page footer also carries a smaller "© Muhammad Awais — Confidential" line + page number.

### Scope enforcement
- Publications and Activities: no PDF-eligible content exists yet in either (both empty
  collections), and the gating logic explicitly excludes them by section name regardless.
- Achievements, Projects, About, Contact, AI GenMat, Education, Experience: none received
  the button — confirmed by direct inspection of each generated page.

### Accessibility
- Real `<button>` element — natively keyboard-focusable and Enter/Space-activatable, no
  custom ARIA needed beyond the descriptive `aria-label`.
- Status text (`role="status" aria-live="polite"`) announces "Preparing PDF…" / "Downloaded."
  / error states to screen readers without needing focus to move.
- No new animations or transitions were introduced, so there was nothing new to gate behind
  `prefers-reduced-motion` — the existing site-wide reduced-motion policy is untouched.

## Two real bugs found during validation and fixed before shipping

Both were caught by actually generating and inspecting PDFs — not assumed away:

1. **Double-JSON-encoding.** Hugo's `html/template` contextually escapes `jsonify` output
   placed inside a `<script>` block, producing an escaped JSON *string* instead of a raw
   object. `JSON.parse()` on that yields a JS string, not an object — every field read back
   as `undefined`, silently falling back to a generic "article" filename with no real title
   or body. Fixed with `| safeJS` in the template. Confirmed fixed: the JSON now parses
   directly into a proper object with the correct title, slug, and full content.

2. **Text-state leak across page breaks.** The CONFIDENTIAL header (bold, red) and watermark
   drawing routine changed the PDF's active font/color state; when a paragraph split across
   a page boundary, jsPDF's `restoreGraphicsState()` didn't revert those settings, so the
   continuing text after a page break rendered in the header's bold red instead of normal
   body styling — visibly confirmed via rendered page screenshots. Fixed by re-applying
   font/size/color on every individual line drawn, not once per paragraph, making it immune
   to a page break landing mid-block. Re-verified visually: page-break continuations now
   render as normal body text.

A third issue (not a regression, a completeness gap) was also found and fixed: Markdown
tables in the source content were rendering as raw, broken pipe-delimited text. Added basic
table detection/rendering (clean "Label: value" rows) rather than shipping visibly broken
output for content that actually exists in two of the four real blog posts.

## Validation

### Build
Clean, 0 errors, 0 warnings, 0 path warnings, 157 pages (unchanged — no routing/content added).

### Content-type scoping (checked directly in generated HTML)
| Content type | PDF button present |
|---|---|
| Blog (4 posts) | Yes — confirmed on all 4 |
| Articles | Template-ready (correctly gated; no live article content exists yet) |
| Publications / Activities | No (empty collections; also explicitly excluded by section) |
| Projects, About, Contact, AI GenMat, Education, Experience, Achievements | No — confirmed |

### Real browser (Chromium/Playwright) — actual downloads, not print dialogs
Tested against all 4 real blog posts (2,811–4,893 words — genuinely long-form content;
there is no short post in the real dataset, so "short" testing used the shortest real post
rather than fabricated content):

| Article | Pages generated | File size |
|---|---|---|
| Operating Systems Explained (longest, 4,053 words) | 12 | 68KB |
| Portfolio Development Guide (shortest, 2,811 words) | 6 | 39KB |

### PDF content inspection (programmatic, via `pypdf` text extraction)
| Check | Result |
|---|---|
| Valid PDF structure, opens correctly | Yes |
| "CONFIDENTIAL" present as extractable text | Yes — once per page (12/12, 6/6) |
| "Muhammad Awais" present as extractable text | Yes — 63× (12-page doc), 33× (6-page doc) |
| Reuse notice text present | Yes, exact wording confirmed |
| Correct title/date present | Yes |
| No blank/empty document | Confirmed — full article text present and readable |
| Multi-page pagination | Confirmed working (6 and 12 pages respectively) |
| Watermark is real embedded text, not an image/overlay | Confirmed via text extraction + visual inspection |

### Visual inspection (rendered PDF pages, included in `validation-samples/`)
Page 1 (title, metadata, CONFIDENTIAL header, watermark) and page 3 (page-break continuation,
table rendering) were rendered to PNG and visually reviewed — this is how both bugs above
were actually caught, not just assumed fixed from code review.

### Mobile
390px viewport: button visible, correctly sized (182×44px, comfortable tap target), download
completes successfully (39KB file, same as desktop).

### Theme
Button visible and correctly styled in both dark and light themes (uses existing `--muted`/
`--accent` tokens, no hardcoded colors).

### Keyboard accessibility
Button reachable via `.focus()`, activates via Enter key exactly like a native button (no
custom keydown handling needed).

### Cross-batch regression
Search overlay open/close, dropdown hover→click (Batch 3.1), theme toggle, Contact form
presence (Batch 3.2), About routing (`/about/` → real content, Batch 3.3), project single
page `.project-back` link (Batch 3.3 cleanup) — all reconfirmed working. All 14 core routes
return 200. Zero page/console errors across the full sweep.

## Known limitations
- The Markdown parser handles the constructs actually present in this project's real content
  (headings, paragraphs, lists, blockquotes, fenced code, 2-column tables) — it is not a full
  CommonMark implementation. Constructs not present anywhere in current content (nested lists,
  wider tables, inline HTML) are untested and may not render ideally if used in future posts.
- If a single fenced code block is long enough to span a page break, the gray background box
  is only drawn for the portion on the first page (the code text itself still renders
  correctly on both pages — this is a cosmetic background-box limitation only). None of the
  4 real posts have a code block long enough to trigger this.
- The vendored jsPDF file (420KB) is a real payload addition, though it only loads on
  Blog/Article pages and only after the Download button is actually clicked — it adds zero
  weight to initial page load anywhere on the site, including on the article pages themselves.

## Applying these files locally
Copy all 4 files into your repository at the exact paths shown (creating the new
`static/js/vendor/` directory). No files need to be deleted for this batch. Run a clean
`hugo` build to regenerate `public/`.

`validation-samples/` contains 2 real generated PDFs and 2 screenshots for your own
inspection — not part of the site itself, just evidence.
