# Batch 2.7 — Navigation Consistency & Achievements Architecture

## Mandatory pre-implementation inspection — findings
Full reconciliation: every file from Sprint 1 and 2.1–2.6 confirmed byte-identical against durable storage. Clean build: 156 pages, zero warnings, before any change. `/articles/`, `/publications/`, `/activities/` routes explicitly re-verified to exist before removing their nav badges, per your instruction. Footer's stale `/#contact` confirmed still present exactly as flagged in Batch 2.4.

**Partial-reuse assessment (Part B):** evaluated `works-list.html`/`works-single.html` and `timeline-list.html`/`timeline-single.html` before writing anything. Works' card grid is already fully generic and reusable as-is for Achievements (single `date` field, title/summary/tags/optional link — matches Achievements' needs exactly). Timeline's date-*range* concept doesn't fit a point-in-time achievement, so it was ruled out. Two things in the Works partials were Works-specific and needed small, targeted fixes to correctly generalize: a hardcoded "Works" breadcrumb (wrong for Achievements, which isn't nested under Works) and Works-specific empty-state wording.

## Apply these changes
**Add:** `content/achievements/_index.md`, `archetypes/achievements.md`, `layouts/achievements/{list,single}.html`.
**Replace:** `layouts/partials/works-list.html`, `layouts/partials/works-single.html` (two small, section-conditional edits each — see exact diffs below), `layouts/_default/baseof.html` (nav badges + footer link).
**Not touched:** everything else — `assets/css/main.css`, `static/js/main.js`, `hugo.toml`, `layouts/index.html`, all Timeline files, all content.

## Part A — Navigation Consistency
- Articles, Publications, Activities: "Soon" badges removed, converted to real `<a>` links — confirmed their routes existed first, exactly as instructed.
- Achievements: activated as a real top-level link.
- Education's "Courses" badge deliberately **left untouched** (still "Soon") — outside this batch's explicit scope, exactly as it was outside Batch 2.6's.
- Footer's `/#contact` fixed to `/contact/`. No other footer change made.

## Part B — Achievements
Reuses `works-list.html`/`works-single.html` via thin wrapper templates, with two minimal, section-conditional edits to those shared partials (exact diffs, nothing else changed):

```
works-list.html:
-     <p class="hero-label" ...>Works</p>
+     {{ if ne .Section "achievements" }}<p class="hero-label" ...>Works</p>{{ end }}
      (and an empty-state message conditional: Achievements gets "Verified
       achievements will appear here."; everything else keeps its exact
       original wording)

works-single.html:
-     <p class="hero-label" ...>Works / {{ .Section | title }}</p>
+     <p class="hero-label" ...>{{ if ne .Section "achievements" }}Works / {{ end }}{{ .Section | title }}</p>
```

Both edits are additive conditionals keyed on `.Section == "achievements"` — verified below that Articles/Publications/Activities are completely unaffected.

**One thing deliberately left alone:** `works-single.html`'s detail-page button reads "View Publication →," slightly Publication-specific wording. It has zero visible effect right now since no Achievement content exists yet with a `link` field — not fixing it to avoid touching Publications' rendered text for no current benefit. Worth revisiting once real Achievement entries exist.

## Files added
- `content/achievements/_index.md`
- `archetypes/achievements.md`
- `layouts/achievements/list.html`, `layouts/achievements/single.html`

## Files modified
- `layouts/partials/works-list.html`, `layouts/partials/works-single.html` (both minimal, shown in full above)
- `layouts/_default/baseof.html` (nav badges + footer link only)

## Validation report
- Build: succeeded, 156 → 158 pages, zero warnings throughout every rebuild in this batch.
- **Routes confirmed:** `/articles/`, `/publications/`, `/activities/`, `/achievements/` all present in build output.
- **Nav confirmed:** zero "Soon" badges remain on these four; all four have real, correct hrefs; Education's Courses confirmed still correctly disabled (untouched).
- **Footer confirmed:** zero remaining `/#contact` references; both the nav and footer Contact links now correctly point to `/contact/`.
- **Breadcrumb correctness proven, not assumed:** checked programmatically that Articles/Publications/Activities still show "Works," and Achievements shows none — then added a temporary test Achievement entry and confirmed its single-page breadcrumb reads exactly "Achievements" (no "Works /" prefix) — then fully removed the test file and rebuilt clean.
- **Empty-state wording confirmed distinct and correct** for all four collections individually.
- Accessibility: zero duplicate IDs confirmed on Achievements, Articles, and the Homepage (nav is shared everywhere).
- SEO: dynamic meta description confirmed working on Achievements, sourced from its `_index.md` summary.

## Regression report
Full sweep against durable storage: `assets/css/main.css`, `static/js/main.js`, `hugo.toml`, `layouts/index.html`, both Timeline partials, and representative Education/Experience/Contact/About files all confirmed byte-identical. The `baseof.html` diff against Batch 2.6 shows **exactly** the four intended nav/footer line changes and nothing else. Articles/Publications/Activities confirmed still correctly rendering their empty-state (0 cards — expected, since no content was ever added to them). All Blog and Project content confirmed checksum-unchanged.

## Remaining architecture
- Education's "Courses" (still disabled — no scope for it in this or the prior batch).
- Search, AI GenMat dedicated page.
- No content exists yet in any Works, Education, Experience, or Achievements collection — all correctly empty, entirely your call to populate via `hugo new`.
- The Achievements button-label nuance noted above, for whenever real content exists.

## Recommended next batch
With every currently-planned nav destination now either live or a deliberately-scoped exception (Courses), the navigation shell is essentially complete. The next natural candidates are **Search** (the one remaining nav-listed feature never built) or **the AI GenMat dedicated page** (referenced by the Constitution but not yet built) — both are net-new features rather than more plumbing, so worth a decision on sequencing rather than a default.
