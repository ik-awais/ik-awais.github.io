# Batch 2.5 — Works Architecture (Blogs, Articles, Publications, Activities)

## Pre-implementation re-inspection
Every file from Sprint 1 and 2.1–2.4 re-verified against durable storage before starting. One check flagged a transient false-positive on `data/credibility.yaml` — re-verified via `diff -q`, `cmp`, and `md5sum` independently, all confirming the file is genuinely byte-identical (a one-off glitch in that single check invocation, not a real discrepancy). Clean rebuild confirmed: 138 pages, zero warnings. Nav confirmed working exactly as delivered before any changes were made.

## Apply these changes
**Add:**
- `content/articles/_index.md`, `content/publications/_index.md`, `content/activities/_index.md`
- `archetypes/articles.md`, `archetypes/publications.md`, `archetypes/activities.md`
- `layouts/articles/{list,single}.html`, `layouts/publications/{list,single}.html`, `layouts/activities/{list,single}.html`
- `layouts/partials/works-list.html`, `layouts/partials/works-single.html`

**Replace:**
- `hugo.toml` (additive — one new `[pagination]` block)
- `assets/css/main.css` (additive — one new CSS section for Works)

**Nothing else changes.** `layouts/_default/list.html`, `layouts/_default/single.html`, and `layouts/partials/card-thumb.html` (what Blog still uses) are untouched, confirmed byte-identical to baseline.

## Design approach
Rather than three near-duplicate list templates and three near-duplicate single templates, all real rendering logic lives in two shared partials (`works-list.html`, `works-single.html`); each collection's actual `list.html`/`single.html` is a one-line wrapper. This gives every collection its own dedicated layout (required for Hugo's template lookup, and per your instruction) while keeping zero duplicated logic.

**Publications' distinct fields** (authors, venue, link, citation) render conditionally based on field *presence* in front matter, not on which section the page is in — so the same shared partial correctly handles Articles, Publications, and Activities without branching on section name. Reading time uses Hugo's native `.ReadingTime` (word-count based — no manual field, no fabrication) and is shown for any entry *without* an `authors` field, i.e. everything except Publications.

**One accepted, bounded duplication, flagged transparently:** the ~15-line table-of-contents highlighting script is duplicated between `_default/single.html` (Blog/Projects) and the new `works-single.html` partial, rather than extracted into a shared script partial. Extracting it would have required modifying `_default/single.html`, which this batch explicitly protects ("do not modify... unless explicitly required") — the DRY benefit didn't justify that risk to already-working Blog/Project pages.

## Field schemas (derived, documented here since none existed before)
- **Articles:** `title`, `date`, `summary`, `tags` — reading time computed automatically.
- **Publications:** `title`, `date`, `authors` (list), `venue`, `link`, `citation`, `summary` (used as abstract + meta description), `tags`.
- **Activities:** `title`, `date`, `summary`, `tags` — kept minimal since the batch gave no more specific field list; extensible later.

## Files modified
- `hugo.toml`
- `assets/css/main.css`

## Files added
- 3 `_index.md` files, 3 archetypes, 6 wrapper templates, 2 shared partials (15 files total)

## Hugo validation
Build succeeded, 138 → 144 pages (3 new collection list pages + their Hugo-generated `/page/1/` pagination aliases — standard, expected behavior even for a single page of results). Zero errors, zero `--printPathWarnings` output, before and after all testing.

## SEO validation
Dynamic meta descriptions confirmed working on all three new list pages, sourced automatically from each `_index.md`'s `summary` field via the existing Batch 1.4 system — zero new template code needed, confirming that system's extensibility exactly as designed. Descriptions are structural, not speculative ("Long-form articles by Muhammad Awais," etc.) — no claims about specific future content.

## Accessibility validation
Zero duplicate IDs confirmed on all three new list pages. Empty states are static text with an ARIA-hidden decorative glyph — no interactive dead ends, no focus traps. Pagination controls use `<nav aria-label="Pagination">` with real `<a>` elements (native keyboard support, no custom JS needed).

## Responsive validation
All new markup reuses existing responsive classes (`.project-grid`, `.single-wrapper`) unchanged; the two genuinely new pieces (`.empty-state`, `.works-pager`) each got a small, additive mobile rule inside the site's existing 768px breakpoint.

## Empty-state validation
Confirmed directly in the build output for all three collections: "No Articles yet," "No Publications yet," "No Activities yet" — no placeholder entries, no fake content, exactly matching the real current (empty) state of each collection.

## URL validation
- `content/blog/*.md` confirmed checksum-identical to baseline — zero content touched.
- `/blog/` permalink structure, and all 4 individual post URLs, confirmed unchanged and still resolving.
- Works → Blogs dropdown item confirmed still routing to `/blog/` in the rendered nav.
- No `/works/` landing page was created, consistent with the earlier explicit ruling that Works is nav-only.

## Pagination validation (proven functional, not assumed)
Temporarily added 3 test articles and reduced `pagerSize` to 2, rebuilt, and confirmed: page 1 correctly showed the 2 most recent test entries with "Page 1 of 2," page 2 correctly showed the remaining entry with a working "Newer" (prev) link. **All test content and the temporary config change were then fully removed and reverted** — confirmed by re-listing each collection directory (only the real `_index.md` remains in each) and re-checking `hugo.toml`'s `pagerSize` value.

## Publications field architecture (proven functional, not assumed)
Temporarily added one test publication with all fields populated, rebuilt, and confirmed: authors, venue, citation, and the "View Publication" link button all rendered correctly, **and reading time was correctly suppressed** (since `authors` was present). A parallel test Article confirmed the opposite: reading time shown, authors/citation blocks absent. Both test files fully removed afterward.

## Cross-batch regression validation
Full sweep confirmed byte-identical: `baseof.html` and `main.js` (Batch 2.4), `layouts/index.html` (Batch 2.2), `_default/list.html`/`_default/single.html`/`card-thumb.html` (original baseline, still what Blog/Projects use), `contact.md` (2.1), `about.md` (2.3). All Blog and Project content files confirmed checksum-unchanged.

## Remaining work
- No content exists yet in Articles, Publications, or Activities — that's expected and correct; authoring is entirely your call, using `hugo new articles/my-post.md` etc. with the archetypes now in place.
- Education, Experience, Achievements, Search, and the AI GenMat page all remain — each still needs its schema/URL work, as previously discussed.
- The footer's stale `/#contact` link (flagged in Batch 2.4, still unaddressed pending your decision).

## Recommended next batch
With Works now fully wired (3 of the 4 previously-disabled Works dropdown items are live architecture, not "Soon" placeholders anymore), the natural next candidates are **Achievements** (smallest remaining single-page item, would retire one more "Soon" tag) or **Education**/**Experience** (larger, each with their own multi-page dropdown structure like Works had). Your call on sequencing.
