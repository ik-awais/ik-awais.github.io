# Batch 3.10 — JS Cache-Busting via Hugo Pipes (PAAR PERF-01 completion)

## Objective
Reconcile against the actual governing roadmap (not memory) and address whatever the
genuinely next-open item turns out to be.

## Baseline reconciliation
Confirmed Batch 3.9's `ScholarlyArticle` JSON-LD addition intact. Clean baseline build:
181 pages, 0 errors/warnings.

## Audit — this batch's real work

The brief explicitly said not to guess scope from memory, so rather than repeat the
"reserved item already done" pattern a fourth time, I went to the source: the **PAAR
(Performance & Accessibility Baseline Audit)** document, which has a full 17-row findings
register I had never systematically cross-checked item-by-item against current state. I
verified every single row empirically against the actual repository — not by re-reading the
document's claims, since it was written early in the project and several findings are now
stale.

| ID | PAAR claim | Actual current state | Status |
|---|---|---|---|
| A11Y-01 (High) | Skip-link CSS exists, unused | `<a href="#main-content" class="skip-link">` present in `baseof.html`, target `<main id="main-content" tabindex="-1">` confirmed | **Already resolved** |
| SEC-01 (High) | Meta-tag CSP not implemented | Full CSP meta tag present and correct | **Already resolved** |
| PERF-02 | `assets/css/main.css` orphaned/dead | It's the actively-used, Pipes-processed stylesheet — the PAAR predates the Pipes migration | **Stale finding, moot** |
| PERF-04 / A11Y-07 | Tech-icon images missing width/height | All have `width="128" height="128"` | **Already resolved** |
| PERF-06 | `favicon.ico` is 0 bytes | 4,517 bytes, real file | **Already resolved** |
| SEO-01 | `robots.txt` absent | `layouts/robots.txt` exists, generates correctly | **Already resolved** |
| SEO-02 | Meta description is static site-wide | Dynamic per-page `$metaDescription` confirmed throughout | **Already resolved** |
| SEO-03 | OG/structured data absent | Comprehensive (Batches 3.1, 3.9) | **Already resolved** |
| A11Y-05 | Form validation ARIA wiring unconfirmed | `role="status" aria-live="polite"` present and functioning | **Already resolved** |
| **PERF-01** | **No CSS/JS fingerprinting/cache-busting** | **CSS is fingerprinted (Hugo Pipes); JS (`main.js`, `pdf-export.js`) is not — served as plain, unversioned static files** | **Genuinely still open — this batch's scope** |
| PERF-03 | Fonts loaded from Google Fonts CDN | Confirmed still CDN-loaded, not self-hosted | **Genuinely still open — see Known Limitations, blocked** |
| PERF-05 | No pagination on Blog/Projects | Still true; explicitly Low priority, "grows with content volume" (currently 4 items each) | Deferred, correctly low-priority |

Two genuinely open findings emerged. I implemented the one that's actually achievable in
this environment and I'm explicit about the one that isn't.

## Why PERF-03 (font self-hosting) was NOT attempted
This is a real environmental constraint, not a scope decision: self-hosting requires
downloading the actual `.woff2` font files from `fonts.gstatic.com`, and that domain is not
reachable from this environment's network egress (allowed domains are limited to package
registries — npm, PyPI, GitHub — none of which mirror Google Fonts). I won't fabricate font
files or guess at their binary contents. This is flagged as deferred/blocked below rather
than silently skipped.

## Implementation — PERF-01 (JS fingerprinting), completing what Batch 3.1 already started for CSS

**Files changed: 4**
- `assets/js/main.js` — **moved** from `static/js/main.js` (content unchanged)
- `assets/js/pdf-export.js` — **moved** from `static/js/pdf-export.js` (content unchanged)
- `layouts/_default/baseof.html` — **modified**: `main.js` now loaded via Hugo Pipes
- `layouts/partials/works-single.html` — **modified**: `pdf-export.js` now loaded via Hugo Pipes

Hugo Pipes (`resources.Get`) only operates on files under `assets/`, so both scripts had to
move out of `static/js/` — verified first that exactly two places in the codebase reference
these paths (one each), so nothing was missed. Both now follow the **exact same pattern**
already established for CSS: `resources.Get | minify | fingerprint`, with the resulting
`<script>` tag carrying both a content-hashed filename and a Subresource Integrity (SRI)
`integrity` attribute — identical treatment, same as `assets/css/main.css`.

**The vendored `static/js/vendor/jspdf.umd.min.js` was deliberately left untouched.** It's
loaded via a hardcoded path string inside `pdf-export.js`'s runtime lazy-loading logic
(`s.src = '/js/vendor/jspdf.umd.min.js'`), not through a Hugo template tag — bringing it
into the Pipes pattern would mean making `pdf-export.js` itself template-generated so the
fingerprinted URL could be injected as a variable, which is a meaningfully bigger,
more invasive change for a third-party library file that only changes when deliberately
re-vendored (not on every site edit, unlike the site's own JS). Noting this as a deliberate
scope boundary, not an oversight.

## Design/architecture rationale
No new dependency, no new build tooling — Hugo Pipes is native to Hugo itself, the exact
same mechanism the CSS pipeline has used since Batch 3.1. This closes the last gap between
how CSS and JS are delivered.

## SEO implications
None directly — this is a delivery-mechanism change, not a content or metadata change.
Indirectly: correct cache invalidation on redeploy means updated JS reaches search-engine
crawlers and users reliably rather than risking a stale cached version.

## Accessibility implications
None — no DOM, ARIA, or interaction changes. All JS-driven interactive behavior (theme
toggle, search, dropdown, contact form validation, PDF export) was re-verified working
identically post-minification.

## Responsive implications
None — same JS, same behavior, verified on both desktop and a 390px mobile viewport
(hamburger nav confirmed working, which is main.js-driven).

## Security/CSP implications
None required. Fingerprinted URLs remain same-origin (`/js/main.<hash>.js`), fully covered
by the existing `script-src 'self'` — no CSP change needed. The added SRI `integrity`
attribute is a genuine security improvement: if the served file content and Hugo's expected
hash at build time ever mismatch, the browser refuses to execute it.

## Date-factuality considerations
Not applicable to this batch — no dates were touched, added, or displayed differently.
Explicitly re-verified as part of regression (see below) that nothing regressed here either.

## Validation

### Build
Clean, 0 errors, 0 warnings, 0 path warnings. 181 pages (unchanged). Static file count
dropped from 5 to 3 in the build log — correctly reflecting that `main.js`/`pdf-export.js`
are no longer static passthrough files (only `jspdf.umd.min.js`, `favicon.ico`,
`favicon.svg` remain as static).

### Fingerprinting confirmed in output
- `main.js` → `main.min.3e9c7824...c.js`, with SRI `integrity="sha256-Ppx4JA..."`
- `pdf-export.js` → `pdf-export.min.26fac42c...d.js`, with a matching SRI hash

### Real browser (Chromium/Playwright) — functional regression on minified JS
The actual risk with this change is minification breaking behavior — verified directly,
not assumed:
| Feature (JS-dependent) | Result |
|---|---|
| Theme toggle | Works (dark → light confirmed) |
| Search overlay | Opens/closes correctly |
| Dropdown hover→click (Batch 3.1 fix) | Still correct (`aria-expanded` stays true) |
| Contact form validation (disposable-email check) | Fires correctly with the exact expected message |
| PDF export (the more complex module — lazy-loads vendored jsPDF, builds the document) | Real download completes, correct filename |
| Mobile hamburger nav | Opens correctly on 390px viewport |
| Console/page errors | None |

Implicit confirmation of SRI correctness: if the hash Hugo computed didn't match the served
bytes, the browser would refuse to execute the script entirely — since every JS-dependent
feature above worked, both scripts loaded and ran successfully under SRI enforcement.

### Full regression (19 routes)
Home, About, Contact, AI GenMat, Projects, Blog, Articles, Publications, Achievements, all 3
Education, all 3 Experience, Article single, Publication single, Project single, 404 — all
200. RSS re-confirmed valid XML with 10 items, zero zero-date artifacts. Canonical tags
re-confirmed present. JSON-LD on both the Article and Publication pages re-parsed and
confirmed valid. Factual dates re-confirmed unchanged (e.g., "May 1, 2026 · 18 min read").
Publication's official-source link re-confirmed correct.

## Known limitations
- PERF-03 (font self-hosting) remains open — genuinely blocked by this environment's network
  access, not deferred by choice. Implementable in an environment with access to
  `fonts.gstatic.com`; the correct next step would be fetching the actual `.woff2` files
  (Space Grotesk 500/600/700, Inter 400/500/600, JetBrains Mono 400/500) and following the
  same self-hosting pattern already used for jsPDF in Batch 3.5.
- The vendored jsPDF library is intentionally not fingerprinted (see rationale above).

## Deferred work
- PERF-05 (pagination) — correctly still Low priority; current content volume (4 items per
  list) doesn't yet warrant it.
- PERF-03 (fonts) — blocked, not deferred by choice; see above.

## Files inspected but NOT changed
`layouts/404.html`, `layouts/robots.txt`, `layouts/partials/contact-form.html`,
`assets/css/main.css`, `layouts/index.html` (tech-icon markup), `static/favicon.ico` — all
reviewed as part of the PAAR audit sweep; all already correct, none required modification.

## Applying these files locally
1. Delete `static/js/main.js` and `static/js/pdf-export.js` (see `DELETE-THESE-FILES.txt`)
2. Add the two files in this package at `assets/js/main.js` and `assets/js/pdf-export.js`
3. Overwrite `layouts/_default/baseof.html` and `layouts/partials/works-single.html` with
   the versions in this package
4. Run a clean `hugo` build to regenerate `public/`

---

### Batch 3.10 — COMPLETE

**Changed files:**
- `assets/js/main.js` (moved from `static/js/main.js`)
- `assets/js/pdf-export.js` (moved from `static/js/pdf-export.js`)
- `layouts/_default/baseof.html` (modified)
- `layouts/partials/works-single.html` (modified)

**Validation:**
- Build: PASS (0 errors, 0 warnings, 181 pages)
- Browser: PASS (19/19 routes, zero console errors)
- Mobile: PASS (hamburger nav confirmed on 390px viewport)
- Accessibility: PASS (no change to any ARIA/interaction surface; re-verified unaffected)
- Regression: PASS (theme, search, dropdown, contact validation, PDF export, RSS, canonical, JSON-LD, factual dates, Publication link — all reconfirmed)

**Deliverables:** ZIP, README, and all 4 changed files individually — provided below.
