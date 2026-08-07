# Batch 2.6 — Education & Experience Architecture

## Mandatory pre-implementation inspection — findings

1. **Full reconciliation:** every file from Sprint 1 and 2.1–2.5 re-verified byte-identical against durable storage.
2. **Clean build confirmed:** 144 pages, zero warnings, before any change was made.
3. **Discovered, not fixed (out of scope):** the Works dropdown still shows "Soon" on Articles/Publications/Activities despite their real architecture existing since Batch 2.5. Left exactly as-is — confirmed unchanged in final regression sweep.
4. **Discovered and resolved via empirical testing before writing real code:** nesting collections under `content/education/` and `content/experience/` causes Hugo to auto-synthesize unwanted `/education/` and `/experience/` landing pages, contradicting the "dropdown-only, not a landing page" principle already established for Works. I built an isolated throwaway test site, confirmed the problem, then confirmed the fix (`build: {render: never, list: never}` on the parent `_index.md`) works correctly — verified in the sandbox before touching this repo at all.
5. **Also empirically verified, not assumed:** Hugo's nested-section template lookup (`layouts/education/university/list.html` for `content/education/university/`) and `.Parent.Title` resolution (works correctly even though the parent page is render-suppressed) — both tested in isolation first.

## Apply these changes
**Add:** 8 `_index.md` files, 2 archetypes, 12 wrapper templates, 2 shared partials (`timeline-list.html`, `timeline-single.html`).
**Replace:** `layouts/_default/baseof.html` (nav dropdowns updated only).
**Not touched:** `assets/css/main.css`, `static/js/main.js` — genuinely zero changes needed to either; every visual element reuses Works/Projects CSS tokens exactly, and the dropdown JS built in Batch 2.4 already handles any number of real `<a>` items with zero modification.

## Design decisions
- **One shared partial pair for both families**, not four separate ones: Education and Experience's real schemas are close enough (organization / title / date range / location / summary / tags) to share cleanly, unlike Works' Publication-specific fields which didn't fit. The partial accepts either `institution` (Education) or `company` (Experience) as the organization field — same rendering either way.
- **Family name (Education vs Experience) and collection name are derived from `.Parent.Title`**, not hardcoded — so the one partial pair is correct for all 6 collections without branching on section name.
- **Courses left disabled, deliberately:** this batch's own Education section and Navbar section both list only University/College/School — "Courses" isn't mentioned anywhere in this batch's scope, so I left it exactly as "Soon" rather than assume it should be activated too.
- **No landing pages** at `/education/` or `/experience/`, consistent with the existing Works precedent — verified empirically, not just asserted.

## Field schemas (derived and documented, since none existed before)
- **Education:** `title`, `institution`, `startDate`, `endDate` (optional — omitted renders as "Present"), `location` (optional), `summary`, `tags`.
- **Experience:** identical shape, `company` instead of `institution`.

## Files added (24)
8 `_index.md`, 2 archetypes, 12 wrapper templates, 2 shared partials.

## Files modified (1)
`layouts/_default/baseof.html` — Education (University/College/School only) and Experience (all 3) dropdown items converted from disabled spans to real links; Courses and everything in Works/Achievements left untouched.

## Validation results
- Build: succeeded, 144 → 156 pages (6 new collections + their pagination page/1 aliases), zero warnings throughout every rebuild during this batch.
- **`/education/` and `/experience/` confirmed absent** from build output and from `sitemap.xml` — landing-page suppression verified working in the real repo, not just the test sandbox.
- **All 6 empty states confirmed rendering the correct, distinct message** ("Education records will appear here." vs "Professional experience will appear here.") — no placeholder entries anywhere.
- **Nav confirmed correctly activated**: real `href`s present for all 6 intended items; Courses/Works/Achievements confirmed still showing "Soon," unchanged.
- **Shared partial proven functional end-to-end**, not assumed: temporarily added one Education entry (with `institution`, a closed date range) and one Experience entry (with `company`, an open-ended date range), rebuilt, and confirmed: organization field renders, date-range formatting is correct in both the closed and "…–Present" cases, breadcrumbs correctly read "Education / University" and "Experience / AI GenMat" (proving `.Parent`/`.Parent.Parent` resolution is correct) — then fully removed both test files and rebuilt again to confirm a clean return to the empty-state baseline.
- Accessibility: zero duplicate IDs confirmed across all 6 new pages.
- SEO: dynamic meta descriptions confirmed working on all 6, sourced automatically from each `_index.md`'s `summary` — zero new template code, same system as every prior batch.
- ARIA: `aria-controls` on the Education/Experience dropdown triggers confirmed still correctly matching their (unchanged) menu IDs.

## Regression report
Full sweep against durable storage: `layouts/index.html`, both data files, the entire Contact and About page sets, and every Works file confirmed byte-identical. **`assets/css/main.css` and `static/js/main.js` confirmed to need zero changes at all** — the existing dropdown JS and Works-established CSS tokens fully supported this batch's requirements without modification. All Blog and Project content confirmed checksum-unchanged.

## Remaining architecture
- Achievements, Search, AI GenMat dedicated page, and "Courses" under Education all remain.
- The Works dropdown's stale "Soon" badges on Articles/Publications/Activities (flagged in Batch 2.4, reconfirmed present and unaddressed here).
- No content exists yet in any of the 6 new collections — expected, correct, and entirely your call via `hugo new education/university/your-entry.md` etc. (worth double-checking archetype auto-selection works for the nested paths the first time you use it, since Hugo's archetype-matching for deeply nested sections wasn't verified with the same rigor as the template-lookup — the field structure is documented above regardless as a manual fallback).

## Recommendation for next batch
Retiring the Works dropdown's stale "Soon" badges is the smallest, lowest-risk item outstanding (a 3-line nav change, no new architecture). Beyond that, Achievements is the next-largest structural gap — a single new collection, not a 3-way family like this batch, so likely the next-cheapest real feature to bring online.

---
Stopping here as instructed. Awaiting your review and approval before any further batch begins.
