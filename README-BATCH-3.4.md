# Batch 3.4 — Residual Dead-CSS Cleanup

## Objective
Part of the mandatory Phase 1 reconciliation for this session: confirm Batch 3.3's cleanup
was actually complete before moving on to new work. It wasn't — two small fragments were
missed. This batch closes that out. It is not new scope; it's finishing what Batch 3.3
already committed to.

## Pre-implementation findings
Reconciled repo against the Batch 3.3 delivered state: About fix, Contact fix, `.nav-icon-btn`
rename, and the `sendForm()` removal were all confirmed intact. Clean build before any edits:
157 pages, 0 errors/warnings.

To directly answer this session's instruction to check for "any remaining genuinely dead CSS,"
ran a systematic scan: every class selector in `assets/css/main.css` cross-referenced against
every `layouts/**/*.html` file and `static/js/main.js`. Found 9 candidates. Manually verified
each before touching anything:

- **6 false positives** — `.card-thumb--p0` through `--p5` are real, live, palette-variant
  classes. They don't appear as literal strings in template source because they're built
  dynamically: `layouts/partials/card-thumb.html` line 28 constructs
  `card-thumb--gradient card-thumb--p{{ $palette }}` at render time. Confirmed live in
  compiled output (`public/projects/index.html`, `public/blog/index.html` both contain them).
  **Not touched.**
- **3 genuine leftovers** — `.contact-grid` (a mobile-breakpoint override at a different
  location in the file than the base rule Batch 3.3 removed) and `.contact-link` /
  `.contact-link-icon` (a duplicate `:hover` declaration, separate from the block already
  removed). Both are remnants of the same legacy two-column contact layout Batch 3.3 already
  eliminated — just missed because they lived in different parts of the 1700-line file
  (one inside a `@media` block, one under a later "TARGETED REFINEMENTS" comment section)
  rather than adjacent to the rules already removed.

Also noticed while reviewing `static/js/main.js`: the comment header above the live contact
handler still referenced `sendForm()` by name ("does not touch or depend on sendForm()") —
accurate when written, but that function no longer exists after Batch 3.3 removed it. Purely
a documentation-accuracy issue with zero functional effect, but worth correcting since it's
now describing a relationship to code that isn't there.

## Files changed: 2
- `assets/css/main.css` — removed the 3 leftover dead rules
- `static/js/main.js` — corrected one stale comment (no logic changed)

## Implementation
**`assets/css/main.css`:**
- Removed `.contact-grid { grid-template-columns: 1fr; gap: 48px; }` from the `@media (max-width: 768px)` block
- Removed the duplicate `.contact-link:hover .contact-link-icon { ... }` rule under "TARGETED REFINEMENTS"

**`static/js/main.js`:**
- Rewrote the 4-line comment above the dedicated contact-form handler to remove the now-inaccurate `sendForm()` reference. No code logic touched.

## Validation

**Build:** clean, 0 errors, 0 warnings, 0 path warnings, 157 pages (unchanged). CSS brace count balanced (348/348, down from 350/350 — 2 fewer rule blocks, consistent).

**Automated re-scan:** re-ran the same class-reference scan after the fix — 0 remaining unreferenced classes (excluding the confirmed-live dynamic `card-thumb--p*` set).

**Real browser (Chromium/Playwright):**
| Check | Result |
|---|---|
| Mobile contact form (390px viewport) | visible, correctly sized (343px, matches other nav elements' established mobile width) |
| Homepage loads | title renders correctly |
| `card-thumb--p*` palette classes render in production HTML | confirmed present in `/projects/` and `/blog/` listings (4 each) |
| Page errors | none |

Did not re-run the full 14-route sweep from Batch 3.3 since this touched 2 rules total, both
already verified dead in Batch 3.3's own testing, in a file already fully regression-tested
that session — re-confirmed the specific breakpoint and page types most likely to be affected
(mobile contact form, card thumbnails) instead of repeating the entire suite.

## Regression
No unrelated files touched. No URLs, content, or functionality changed.

## Known limitations / deferred
None introduced by this batch.

## Recommended next batch
See the separate note in this response regarding Frozen Decision #15 (PDF download/export) —
that's the next substantive item, and it requires your input before implementation, detailed separately.
