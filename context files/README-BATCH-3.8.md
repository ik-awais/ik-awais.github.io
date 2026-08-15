# Batch 3.8 — Custom 404 SEO Hardening + Date-Accuracy Guard

## Objective
Implement the custom branded 404 page and perform the required date-accuracy audit.

## Pre-implementation findings — the premise needed correcting again

Same situation as Batch 3.7: reconciliation found the primary deliverable already exists.
`layouts/404.html` was already present, already using the site's real design system
(`.list-section`, `.list-header`, `.section-title`, `.btn-primary`, `.btn-ghost` — no new
CSS needed), with three genuine, real, non-fabricated recovery links (Home, Projects,
Contact), inheriting the full header/nav/search/theme from `baseof.html` automatically. It
generates correctly to `public/404.html` — the exact filename GitHub Pages requires to serve
a custom 404.

Rather than stop the batch again, I inspected further (as instructed: "verify SEO/indexing
behavior... does not accidentally receive misleading metadata") and found a real, scoped
defect worth fixing, plus one genuinely relevant issue from the date-accuracy audit. Both are
documented below.

## Finding 1 — 404 page was emitting full indexable-content SEO metadata

Inspecting the generated `public/404.html`, the page carried a complete canonical/OpenGraph/
Twitter Card suite — `<link rel="canonical">`, `og:type`, `og:title`, `og:description`,
`og:url`, `twitter:card`, `twitter:title`, `twitter:description` — identical in kind to what
every real content page receives. This is exactly what the batch brief warns against: an
error page shouldn't carry canonical/social-share metadata as if it were indexable content.
(Structured data/JSON-LD was already correctly absent — no fix needed there.)

**Root cause:** `seo-meta.html`, the single shared partial that emits all of this, had no
special case for the 404 page — it unconditionally ran for every page passed to it.

**Fix:** confirmed empirically (via a temporary debug probe, removed before the real fix)
that Hugo 0.154.5 assigns `.Kind = "404"` specifically to this page — distinct from `"page"`
or `"section"`. Wrapped the canonical/OG/Twitter block in `{{ if ne $p.Kind "404" }}`. The
JSON-LD block needed no change — it was already conditioned on `$p.IsHome` / specific
sections, which the 404 page never matches.

## Finding 2 — latent zero-date defect in the Works template (date-accuracy audit)

The date-accuracy audit (required by this batch) found no fabricated or placeholder dates
anywhere in current rendered output — verified by scanning every generated HTML file for
`0001` and confirming only About/Contact/AI GenMat lack a `date:` field (correct — they're
evergreen pages, and their templates never reference `.Date` at all).

However, `works-single.html` — the shared template for Blog/Articles/Publications/Activities
— called `.Date.Format(...)` **unconditionally**, with no guard for Hugo's zero-date default.
This causes zero visible problem today, because every live entry in every one of those
sections currently has a real `date:` field. But it's a real, latent defect: the moment
anyone adds a future Works-family entry without a confirmed date (an Activity, a Publication
whose date isn't yet finalized, etc.), this template would silently display a fabricated
**"January 1, 1"** — exactly the class of defect this batch's Date Accuracy Requirement
exists to prevent, just not yet triggered by any content that exists. The same unconditional
`.Date.Format` also appeared in the PDF-export data block for Blog/Articles.

This is not a broad date rewrite — no existing date, on any existing page, changes at all.
It's a defensive guard against the one directly-relevant class of defect the audit is
required to check for.

**Fix:**
- The visible `<p class="single-meta">` date/reading-time line now checks `.Date.IsZero`
  first. If a date exists, it displays exactly as before. If not, the date is simply omitted
  (reading time still shows for non-Publication entries; the whole line is omitted entirely
  for an undated Publication, rather than rendering an empty paragraph).
- The PDF-export JSON data block now passes an empty string instead of a formatted zero-date
  when `.Date.IsZero` — `pdf-export.js` (from Batch 3.5) already had a truthiness check on
  this field (`if (data.date) metaParts.push(data.date)`), so it already gracefully omits
  the date line in the exported PDF with no JS changes needed.

## Files changed: 2
- `layouts/partials/seo-meta.html` — modified (404 Kind guard)
- `layouts/partials/works-single.html` — modified (two zero-date guards)

`layouts/404.html` itself was **not modified** — it was already correct.

## Validation

### Build
Clean, 0 errors, 0 warnings, 0 path warnings. 181 pages (unchanged — no content/routing touched).

### 404 SEO/indexing behavior
| Check | Result |
|---|---|
| `public/404.html` generated at correct root path | Confirmed |
| Present in sitemap.xml | No (correct) |
| Present in search-index.json | No (correct) |
| Present in RSS feed | No (correct) |
| Canonical tag | Removed (was pointing to `/404.html` itself before the fix) |
| OG tags | Removed |
| Twitter Card tags | Removed |
| JSON-LD | Absent (already correct, unchanged) |
| Title/meta description | Still present — "404 Page not found \| MA-Portfolio" + the site's generic description as fallback; this is accurate, not misleading, so intentionally left as-is |
| Every other page type (home, about, blog list/single, contact) | Canonical/OG/Twitter all confirmed still present, unaffected |

### Date-accuracy audit
- Scanned every generated HTML file for `0001` / zero-date artifacts: zero found
- Confirmed About/Contact/AI GenMat correctly have no `date:` field and their templates
  never reference `.Date`
- Confirmed all real Blog/Article/Publication dates render exactly as before the fix:
  - Blog post: "May 1, 2026 · 18 min read"
  - Publication: "March 30, 2026" (no reading time — correct, `authors` is set)
  - Article: "March 30, 2026 · 3 min read"
  - PDF-export data for the Blog post: `date: "May 1, 2026"` — unchanged

### Real browser (Chromium/Playwright)
| Check | Result |
|---|---|
| Title / H1 | "404 Page not found \| MA-Portfolio" / "Page Not Found." |
| Recovery links present | Home, Projects, Contact — all 3, all real destinations |
| "Back to Home" actually navigates | Confirmed, lands on `/` |
| Header/nav/search/theme toggle present on 404 | All present (inherited from baseof.html) |
| Search overlay opens from 404 page | Yes |
| Theme toggle works from 404 page | Yes (dark → light confirmed) |
| Mobile viewport (390px) | H1 and recovery buttons visible, hamburger nav opens |
| `prefers-reduced-motion: reduce` | Page loads and renders normally (no motion-dependent content to break) |
| Page/console errors | None |

### Local hosting-behavior caveat
GitHub Pages has special server-side logic: any unmatched path returns the repo's
`404.html` with an actual HTTP 404 status. A plain local static file server (what's
available in this environment) doesn't replicate that routing — it serves its own generic
404 for unmatched paths. I want to be upfront about this rather than imply it was fully
verified: `/404.html` was confirmed to load correctly and function fully when requested
directly, which validates the page itself completely, but the GitHub-Pages-specific
"any broken link falls through to this page automatically" behavior is a hosting-platform
guarantee, not something locally testable, and wasn't newly introduced or changed by this
batch (the file was already correctly named and placed for that mechanism to work).

### Cross-batch regression
All 12 core routes tested return 200 (home, about, contact, aigenmat, projects, blog list,
articles list, publications list, achievements, blog single, article single, publication
single). PDF export re-confirmed working (`operating-systems-explained-muhammad-awais.pdf`
downloads correctly). Publication's official-source link re-confirmed correct. Contact form
present. Search overlay and dropdown hover→click both re-confirmed working. Zero page errors
across the full sweep.

## Remaining roadmap items
- Font `rel="preload"` — still not recommended without measured Lighthouse evidence (per
  Batch 3.0's own original guidance).
- No other date-accuracy defects were found; no further date work is indicated.
- No other outstanding audit findings remain open.

## Applying these files locally
Both files are modifications to existing files — copy them into your repository at the
paths shown, overwriting the current versions. No new files, no deletions. Run a clean
`hugo` build to regenerate `public/`.
