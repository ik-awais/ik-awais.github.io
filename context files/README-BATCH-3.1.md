# Batch 3.1 — Production Hardening: Regression Fixes + SEO Foundation

## Mandatory pre-implementation protocol
Working directory confirmed present. Every file reconciled against durable storage for all approved batches through the search-overlay fix — all confirmed byte-identical. Clean build confirmed: 160 pages, zero warnings/errors/path warnings, before any change. Each of the 5 targeted Batch 3.0 findings was individually re-verified against the current tree (not assumed from the report) — all 5 confirmed still present exactly as audited. No drift found.

## 1. Files added/modified (7 total, within the 10-file limit)

**Modified (2):**
- `layouts/_default/baseof.html` — dropdown-close-selector fix inherited from title/description consolidation, plus the `seo-meta.html` partial call
- `static/js/main.js` — the dropdown hover/click fix only

**Added (5):**
- `layouts/partials/seo-meta.html` — canonical/OG/Twitter/structured-data, single shared source
- `layouts/_default/rss.xml` — RSS override with the zero-date fix
- `layouts/404.html` — production 404 page
- `archetypes/projects.md`, `archetypes/blog.md` — schema-accurate authoring scaffolds

## 2. Root cause and fix — A: dropdown hover/click regression

**Root cause:** the click handler unconditionally toggled (`isOpen ? close : open`). Since arriving at the trigger with a mouse necessarily fires `mouseenter` (opening it) *before* `click` fires, a click immediately following a hover-open saw the menu already open and closed it.

**Fix:** track `openedByHover` per dropdown, set only when `mouseenter` opens it. The click handler now checks: if the menu is open *because of* the hover that just happened, treat this click as a no-op (consume the flag, leave it open) instead of closing it. A genuine second click — or any click when `openedByHover` is false (touch, keyboard, or a deliberate re-click) — still toggles exactly as before. Nothing else about the dropdown architecture changed; no markup duplicated.

**Verified in real Chromium, not assumed** — 9 separate interaction scenarios, all passing:
1. Hover → click (the exact bug) → **stays open** ✅
2. A genuine second click after that → **closes** (explicit toggle preserved) ✅
3. Hover then mouse away (no click) → closes normally after the existing 200ms grace period ✅
4. Pure click, no prior hover → opens correctly ✅
5. Pure click again → closes correctly (touch-equivalent toggle preserved) ✅
6. Keyboard focus + Enter → opens ✅
7. Escape → closes ✅
8. Focus restored to trigger after Escape ✅
9. Click outside → closes ✅

## 3. SEO implementation summary — B

One shared partial (`seo-meta.html`), called once from `baseof.html`, used by every page type — title/description are computed once by the caller and passed in, not recomputed.

- **Canonical:** `.Permalink` (Hugo's own absolute-URL machinery, respects `baseURL` automatically) — never hardcoded.
- **OpenGraph:** `og:type` is `"article"` only for individual Blog/Project pages (`Kind=page`), `"website"` everywhere else including their own list/archive pages — this distinction required a real fix (see caught bugs below).
- **Twitter Card:** `summary` type (not `summary_large_image`, since no image exists).
- **No image properties anywhere, confirmed by direct scan** — no real photo/screenshot asset exists in this site for any page; the card-thumb SVGs are decorative UI, not shareable previews. Per your explicit instruction, omitted rather than fabricated.
- **No Twitter handle anywhere in site data** — `twitter:site`/`twitter:creator` correctly omitted, not invented.
- **Structured data**, only where content genuinely supports it: `WebSite` + `Person` (Homepage only — name, jobTitle "AI Engineer", `sameAs` linking real GitHub/LinkedIn URLs, all already-grounded); `BlogPosting` (individual Blog posts only); `CreativeWork` (individual Projects only). No ratings, no organization/employment schema, no awards, no fabricated dates — every field traces directly to existing front matter.

**Two real bugs I introduced and then caught and fixed during my own validation, not before delivery:**
- Structured data and `og:type=article` were initially leaking onto the Blog *and* Project **list pages** too (since `.Section` matches both a list page and its individual entries) — fixed with an explicit `Kind=page` guard, verified afterward that list pages correctly get `website`/no schema and individual pages correctly get `article`/their schema.
- All structured-data fields were initially **double-JSON-encoded** — nested escaped quotes that would fail any real schema validator — caused by Go's `html/template` re-escaping content inside `<script>` tags even though `jsonify` had already produced valid JSON. Fixed using the correct Hugo pattern: build a `dict`, `jsonify` the whole object once, then `| safeJS`. Verified by actually parsing the rendered output back through a JSON parser and confirming clean, correctly-typed values — not just checking it "looked right."

**Validated on every required page type** (Homepage, Blog listing, a Blog post, Project listing, a Project, About, Contact, AI GenMat, an Education collection, Achievements): exactly one canonical, one `og:title`, one `og:description`, one `twitter:card` each — zero duplicates anywhere, zero malformed URLs.

## 4. RSS fix summary — C

**Root cause:** Hugo's built-in RSS template has no guard against pages with no `date` front matter (About, Contact, AI GenMat), so it rendered Hugo's zero-value date (`0001-01-01`) as their `pubDate`.

**Two additional bugs found and fixed while building the override**, both confirmed via isolated reproduction before touching the real file:
- `.RegularPages` returns empty in this specific template context (confirmed empirically — `len site.RegularPages` returns the correct count where `len .RegularPages` returns 0); fixed by using `site.RegularPages` instead.
- The XML declaration (`<?xml version="1.0"...?>`) was being HTML-escaped to `&lt;?xml...`; fixed with `| safeHTML`.

**Final behavior:** pages without a real date are excluded from `<item>` entries entirely — no fabricated fallback date, exactly as instructed. Verified: 8 items (all 4 Blog + all 4 Projects, every one with its real, valid date), 0 items with a zero-date, and the output was parsed with a real XML parser to confirm it's valid, well-formed XML.

## 5. 404 implementation summary — D

`layouts/404.html` — confirmed via an isolated test that this alone is sufficient for Hugo to emit `/404.html` (no content file needed; `.Title` defaults to "404 Page not found" automatically). Reuses `.list-section`/`.list-header`/`.section-title`/`.btn-primary`/`.btn-ghost` — zero new CSS. Clear heading (`<h1>`), plain-text explanation, three real navigation links (Home, Projects, Contact) that work with JavaScript fully disabled. Rendered in Chromium and screenshotted — visually confirmed on-brand and correctly laid out.

## 6. Archetype schema summary — E

Derived from inspecting **every** real Project and Blog file's front matter directly, not assumed:
- **Projects** (`archetypes/projects.md`): all 4 real project files share the *exact same* 9 fields with zero variation — `title`, `date`, `lastmod`, `tags`, `github`, `demo`, `summary`, `status`, `keywords`. The archetype matches this exactly. `status` defaults to `"in-progress"` — a real, already-observed value (2 of 4 projects use it), not an invented one.
- **Blog** (`archetypes/blog.md`): only `title`, `date`, `tags`, `summary` appear in *all four* real posts. `author`, `series`, `slug`, and `draft` each appear in only one post apiece — genuine one-off exceptions, not the standard schema, so per your explicit "do not invent fields simply because they might be useful," they were deliberately left out of the base scaffold.

No existing Blog or Project content was modified.

## 7. Build result and page count

160 → 161 pages (+1, the new `/404.html` — fully explainable, nothing else added or removed). Zero errors, zero warnings, zero path warnings, confirmed on every rebuild throughout this batch.

## 8. Browser validation results (Chromium via Playwright — real rendering, not DOM inspection alone)

- All 9 dropdown interaction scenarios (§2) — pass.
- Mobile: hamburger opens, accordion dropdown opens inside it — pass, screenshot confirmed.
- Theme toggle: still switches themes correctly — pass.
- Search: overlay still opens, a real query ("hugo") still returns results, still closes correctly — **confirmed zero regression to Batch 2.9's search**.
- 404 page: loads, correct heading, working links — pass, screenshot confirmed.

## 9. Accessibility validation results

- 404 page: single `<h1>`, all links keyboard-reachable, no JS required for any of them to function.
- Dropdown fix: keyboard Enter/Escape/focus-restoration all reconfirmed working identically to before — the fix only touches mouse-driven state, keyboard activation never sets `openedByHover`, so it's structurally unaffected by this change.
- ARIA: `aria-expanded` state confirmed correctly synchronized with actual visibility in every one of the 9 tested scenarios.

## 10. Regression results

Full sweep: every file not explicitly listed in §1 confirmed byte-identical to durable storage (`layouts/index.html`, both data files, all Contact/About/AI GenMat/Works/Timeline files, `layouts/index.searchindex.json`). **`assets/css/main.css` confirmed completely untouched** — Part F (dead CSS) was correctly deferred, zero unrelated cleanup performed. All Blog and Project content confirmed checksum-identical, and their URLs confirmed unchanged in the build output.

## 11. Batch 3.0 findings intentionally deferred

- Dead CSS cleanup (~5%, 14 rule blocks) — explicitly out of scope per this batch's Part F.
- Stale `.theme-toggle` class shared by the search trigger — cosmetic/naming-clarity only, not requested.
- Font `rel="preload"` — flagged as unverified/optional in the audit, not requested here.

## 12. This README
This document.

---

Stopping here as instructed — awaiting your approval before Batch 3.2.
