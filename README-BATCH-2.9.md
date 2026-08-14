# Batch 2.9 — Site Search (labeled "2.8" in the brief; renumbered to avoid colliding with the already-delivered AI GenMat Batch 2.8)

## Mandatory pre-implementation inspection — findings
Full reconciliation: every file from Sprint 1 and 2.1–2.8 confirmed byte-identical against durable storage. Clean build: 159 pages, zero warnings, before any change. Existing nav/dropdown JS inspected in full before writing anything new (see Code Reuse section below).

## Apply these changes
**Add:** `layouts/index.searchindex.json` (the index template).
**Replace:** `hugo.toml`, `layouts/_default/baseof.html`, `assets/css/main.css`, `static/js/main.js`.
**Not touched:** everything else.

## Technical implementation summary

**Index generation (Hugo-native, zero JS build step):** a custom Hugo output format (`SearchIndex`, added to the Homepage's outputs alongside the existing HTML+RSS) renders `layouts/index.searchindex.json` at build time into `/search-index.json`. It includes every `site.RegularPages` entry site-wide — Projects, Blog, About, Contact, AI GenMat today; Articles/Publications/Activities/Education/Experience/Achievements automatically the moment real content exists there, with zero further template work. Fields: title, summary (reusing the same resolution already established for meta descriptions — no duplicated logic), type, section, tags, date, permalink. Verified the exact Hugo template-naming convention for this (`layouts/index.searchindex.json`) empirically in an isolated test site before touching the real repo, and confirmed `.Type` (not `.Section`, which is empty for top-level pages like About/Contact) is the reliable field for category display — also verified empirically, not assumed.

**Search UI:** one trigger button, placed inside the existing `#navLinks` container — meaning it automatically appears correctly in both the desktop row and the mobile accordion panel via the *already-existing* responsive CSS, no separate mobile-specific markup needed. The overlay (backdrop + panel + input + results) lives once in `baseof.html`, shared site-wide.

**Search behavior:** vanilla JS, no dependencies. Lazy-loaded — `/search-index.json` is fetched only inside `openSearch()`, never on page load (verified: it's the only `fetch()` call in the file not tied to a form submit). Debounced (150ms) client-side filtering, scored title (3) > tags (2) > summary (1), matching the required priority order exactly, case-insensitive, de-duplicated by permalink. Keyboard: Arrow Up/Down move a visual selection (via `aria-activedescendant`, not real focus movement — the standard accessible combobox pattern), Enter navigates, Escape closes, Tab is intercepted for a focus trap cycling within the panel's real focusable elements (input → close button → result links). Focus is restored to whatever was focused before opening. Body scroll locks while open, reusing the exact same mechanism the mobile menu already uses.

**Code reuse, not duplication:** the search input reuses `.form-input` directly (`class="search-input form-input"`); the trigger button reuses `.theme-toggle` directly (`class="search-trigger theme-toggle"`) for its icon-button chrome. Rather than duplicating the mobile menu's "close on interaction" logic for the new search trigger, I extended the *existing* one-line selector in the nav module (`querySelectorAll('a')` → `querySelectorAll('a, #searchTrigger')`) — the only change made to already-working nav code.

**New CSS, kept to what's genuinely structural:** overlay positioning, panel layout, and result-card layout have no existing 1:1 analog, so these are new — but every value inside them is an existing token (`var(--bg)`, `--card`, `--border`, `--accent`, `--muted`, `--text-secondary`, `--shadow`, `--nav-scrolled`), and easing/timing matches what's used everywhere else in the file. Confirmed zero hardcoded hex/rgb colors in the new block.

## Files added
- `layouts/index.searchindex.json`

## Files modified
- `hugo.toml` — additive `[outputFormats.SearchIndex]` + `[outputs]` block (RSS explicitly preserved alongside it).
- `layouts/_default/baseof.html` — search trigger button + overlay markup only.
- `assets/css/main.css` — one new, isolated CSS section.
- `static/js/main.js` — one existing line extended (mobile-close selector), one new self-contained module appended at the end.

## Validation report
- Build: succeeded, 159 → 160 pages, zero warnings throughout every rebuild in this batch.
- **Index generation verified**: confirmed `/search-index.json` is generated, is valid parseable JSON (loaded and inspected programmatically), contains exactly 11 real entries matching the current live content (4 Projects, 4 Blog, About, Contact, AI GenMat) — the correct current count, with Works/Education/Experience/Achievements correctly contributing nothing since they're still genuinely empty.
- **Search logic proven functional, not assumed**: extracted the exact scoring/filtering logic and ran it in Node against the real generated index — confirmed title matches rank above tag matches, which rank above summary matches; confirmed case-insensitivity (`RAG` and `rag` produce identical results); confirmed a query with no matches returns an empty result set correctly.
- JS syntax validated (`node --check`) — no syntax errors.
- ARIA wiring confirmed on the built HTML: `aria-haspopup`, `aria-expanded`, `aria-controls` on the trigger; `role="dialog"` + `aria-modal` on the panel; `role="combobox"` + `aria-autocomplete` on the input; `role="listbox"` on results — all present and correctly cross-referenced.
- Overlay confirmed `hidden` by default — no layout shift, nothing visible until opened.
- Zero duplicate IDs confirmed on the Homepage after adding the new markup (search elements + all pre-existing IDs checked together).
- Confirmed the search overlay markup is present identically on Contact, About, and Projects pages (shared via `baseof.html`, as required by "accessible from the navbar" sitewide).
- Zero new hardcoded colors confirmed by scanning the new CSS block specifically.
- z-index confirmed correctly layered (9000 — above the nav at 1000, below only the skip-link at 10000, which is intentional).
- SEO: confirmed the search overlay doesn't alter the page's own meta description or introduce any `noindex`; the JSON index itself isn't a page GitHub Pages/search engines would treat as duplicate content (it's a data file, not an HTML page).

## Regression report
Full sweep against durable storage: every file outside the four listed above confirmed byte-identical. `hugo.toml`'s diff shows exactly the intended additive block (RSS explicitly preserved). `baseof.html`'s diff shows exactly the search markup, nothing else. `main.js`'s diff shows exactly the one-line selector extension plus the new module appended at the end — nothing in the pre-existing 687 lines besides that one line changed. All Blog and Project content confirmed checksum-unchanged.

One transient false-positive occurred during the automated reconciliation script (flagged `timeline-list.html` as mismatched) — independently re-verified via direct `diff` and `md5sum`, confirmed genuinely byte-identical; same class of one-off check glitch encountered once before in this project, not a real discrepancy.

## Remaining architecture
- Education's "Courses" (still deliberately disabled).
- No content exists yet in Articles, Publications, Activities, Education, Experience, or Achievements — search will automatically surface it the moment any is added, with zero further code changes.

## Recommended next batch
With Home/Education/Experience/Projects/Works/Achievements/Contact/Search/Theme Toggle — the Constitution's entire originally-frozen navbar — now fully built, the architecture phase is essentially complete. The natural next step is a **content batch** rather than another architecture batch: populating any of the now-empty collections (Projects' `featured` selection is still your open decision from early in Sprint 2, and would be the lowest-risk starting point since the mechanism has been tested and ready since Batch 2.2).
