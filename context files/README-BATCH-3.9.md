# Batch 3.9 — Structured Data Coverage Gap (Articles + Publications)

## Objective
This batch's brief was deliberately open-ended: reconcile against the roadmap, determine
what Batch 3.9 actually needs to address, and prove it if the answer turns out to be
"already done" rather than inventing work. That's exactly what happened — but not entirely.

## Baseline reconciliation
Confirmed Batch 3.8 fully intact before touching anything: the 404 SEO Kind-guard and the
zero-date guards in `works-single.html` both present and correct. Clean baseline build:
181 pages, 0 errors/warnings.

## What Batch 3.9 was actually for, and what I found

The batch numbering plan referenced across recent sessions had reserved "Open Graph/Twitter
Cards" for this slot. Inspecting `seo-meta.html` directly (not trusting the plan) showed
OG and Twitter Card meta are already comprehensive and correct — `og:type`, `og:title`,
`og:description`, `og:url`, `og:site_name`, `article:published_time`, `article:tag`,
`twitter:card`, `twitter:title`, `twitter:description` — all present, all correctly using
real data, with a well-documented, deliberate rationale already in the file's own header
comment for why `og:image` and `twitter:site`/`twitter:creator` are correctly omitted (no
real photo asset or Twitter handle exists anywhere in the site — omitting is accurate,
fabricating either would not be). This is the same pattern as Batches 3.7 and 3.8: the
headline item was already done.

**Rather than stop there a third time, I looked one level deeper** — at the JSON-LD
structured-data block immediately below the OG/Twitter section, which is the natural place
a "reserved-for-3.9" gap might actually live. That's where I found a real, genuine,
previously-undetected coverage gap:

The `og:type` logic classifies **Blog, Projects, Articles, and Publications** together as
`"article"` (a single `in (slice "blog" "projects" "articles" "publications")` check). But
the JSON-LD generator only had branches for **Blog** (`BlogPosting`) and **Projects**
(`CreativeWork`) — added back in Batch 3.1, before Articles or Publications existed as
content types. Batch 3.6 added real Articles/Publications content but didn't touch this
partial (correctly, per that batch's own scope discipline), so the gap was never closed
until now. Verified directly in generated output before making any change: both the new
Article and Publication pages had `og:type="article"` but **zero** JSON-LD blocks.

This is a legitimate, narrowly-scoped, already-partially-built feature completion — not a
new feature invented for this batch.

## Implementation

**File changed: 1** — `layouts/partials/seo-meta.html` (13 lines added, nothing removed
or altered elsewhere in the file).

Added two new `else if` branches to the existing structured-data chain, following the exact
same pattern/style as the pre-existing BlogPosting and CreativeWork branches:

**Articles → `Article` schema.** Mirrors the BlogPosting branch's approach exactly:
`headline`, `description`, `url`, `author` (attributed to `site.Params.author`, i.e.
Muhammad Awais — accurate, since he genuinely is one of the paper's authors, and this
matches the same level of single-attribution precision the Blog branch has always used;
this is machine-readable supplementary metadata, not the visible page content, which
already lists all six co-authors in full), `datePublished` (guarded against zero-date, per
this batch's strict date policy), `keywords` from real tags.

**Publications → `ScholarlyArticle` schema — deliberately more complete, using data
Publications already has:**
- `author`: a real array of Person objects built from the actual `.Params.authors` list
  (all 6 real co-authors, via Hugo's `apply` collection function — tested and confirmed
  correct in the actual generated output, not assumed)
- `sameAs`: points to `.Params.link` — **the official external journal URL**, not the
  internal portfolio page. This directly encodes the Constitution's own architectural rule
  ("Publications link to their official source") into the structured data itself, which is
  more accurate than what Articles/Blog/Projects do (their JSON-LD doesn't need this, since
  those genuinely live on this site)
- `citation`: the real, already-verified formatted citation string from front matter
- `datePublished`, `keywords`: same treatment as Articles

Nothing was fabricated — every field pulls from front matter that was already fact-checked
against the source PDF in Batch 3.6.

## Date-factuality considerations
`datePublished` on both new branches is guarded with `{{ if not $p.Date.IsZero }}`,
consistent with Batch 3.8's zero-date policy — if a future undated Article/Publication is
ever added, this schema field is simply omitted rather than emitting a fabricated date.

## Accessibility considerations
None — this is head-only structured data, invisible to users, no DOM/interaction changes.

## SEO considerations
This is the entire point of the change: search engines and social platforms can now
correctly identify Articles and Publications as article-type content with real author
attribution, rather than treating them as generic untyped pages. For Publications
specifically, `sameAs` gives crawlers an explicit, correct signal about where the
authoritative version of the work lives, rather than risking any ambiguity about whether
this portfolio page is presenting itself as the canonical source.

## Responsive considerations
None applicable — head metadata only.

## Security/CSP considerations
None — no new scripts, no new external resources, no CSP changes. The JSON-LD is inline
`<script type="application/ld+json">`, identical in nature to the four blocks that already
existed and were already permitted under the existing CSP (`script-src 'self' 'unsafe-inline'`).

## Validation

### Build
Clean, 0 errors, 0 warnings, 0 path warnings. 181 pages (unchanged — no content/routing touched).

### JSON-LD correctness (verified in actual generated output, not assumed from template review)
| Page | @type | Notes |
|---|---|---|
| Homepage | WebSite + Person (×2 blocks) | Unchanged |
| Blog post | BlogPosting | Unchanged |
| Project | CreativeWork | Unchanged |
| **Article** | **Article** | **New** — valid JSON, correct author/date/keywords |
| **Publication** | **ScholarlyArticle** | **New** — valid JSON, all 6 real authors as Person objects, `sameAs` correctly points to the official journal URL, real citation string |
| About, Contact, AI GenMat, Achievements, Education, Experience, list pages, 404 | none | Unchanged — correctly no structured data |

Parsed every JSON-LD block with Python's `json.loads` (not just eyeballed) — all valid,
correct `@context`, correct `@type`, correct `url` domain.

### Real browser (Chromium/Playwright) — full regression, 20 routes
All of: home, about, contact, aigenmat, projects, blog, articles, publications,
achievements, 3× education, 3× experience, blog single, article single, publication single,
project single, 404 — all return 200.

Also re-confirmed working: PDF export (real download, correct filename), Publication's
"View Publication" link (still points to the exact official URL), Contact form present,
search overlay open/close, dropdown hover→click (Batch 3.1 fix), theme toggle, 404 page
content and recovery. Zero page/console errors across the entire sweep.

## Known limitations
- Article's JSON-LD attributes authorship solely to the site owner, matching the existing
  Blog pattern's level of precision — the visible page content (not the structured data)
  is where the complete 6-author list is presented to human readers. This is a deliberate,
  consistency-driven choice, not an oversight.

## Deferred work
Font `rel="preload"` remains the only item from the original Batch 3.0 audit not yet acted
on — still correctly withheld pending actual measured evidence rather than speculative
optimization, per that audit's own original guidance.

## Files inspected but NOT changed
`layouts/404.html`, `layouts/partials/works-single.html`, `layouts/_default/rss.xml`,
`hugo.toml`, `layouts/_default/baseof.html` — all reviewed to confirm no interaction with
this change; none required modification.

## Applying these files locally
One file, a modification — copy `layouts/partials/seo-meta.html` into your repository at
the path shown, overwriting the current version. No new files, no deletions. Run a clean
`hugo` build to regenerate `public/`.

---

### Batch 3.9 — COMPLETE

**Changed files:**
- `layouts/partials/seo-meta.html` (modified)

**Validation:**
- Build: PASS (0 errors, 0 warnings, 181 pages)
- Browser: PASS (20/20 routes, zero console errors)
- Mobile: N/A for this change (head-only metadata, no visual/DOM surface)
- Accessibility: N/A for this change (no visible content affected)
- Regression: PASS (PDF export, Publication link, Contact form, search, dropdown, theme, 404 all reconfirmed)
- JSON-LD validity: PASS (all blocks parsed and schema-checked programmatically)

**Deliverables:** ZIP, this README, and the individual changed file — all provided below.
