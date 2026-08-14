# Batch 3.6 — New Publication/Article + Blog Title Roadmap Fix

## Objective
1. Add a new peer-reviewed publication to both the Articles and Publications sections,
   correctly differentiated per the Constitution's architecture.
2. Implement the one remaining fully-specified, no-decision-needed roadmap item flagged
   in the Batch 3.4 report: the `/blog/` "Blogs Archive" title pluralization issue.

## Source research
Official article: https://policyjournalofms.com/index.php/6/article/view/2496

Fetched and extracted directly from the publisher's page (Open Journal Systems / PKP
platform metadata + rendered page content). Nothing below was inferred or paraphrased from
a secondary source.

| Field | Value |
|---|---|
| Title | Decolonizing Gendered Subjectivities in Mohammed Hanif's Rebel English Academy: A Postcolonial Feminist Analysis of Language, Power, and Identity |
| Authors | Anees Fatima, Muhammad Awais, Shazeen Khalid Raja, Noor ul Ain Shah, Nooriman, Muhammad Abdullah Butt |
| Muhammad Awais's listed affiliation | National University of Computer and Emerging Sciences, Bachelors of AI, Department of Computer Science |
| Journal | Social Science Review Archives (ISSN Online 3006-4708 / Print 3006-4694) |
| Volume / Issue | 4 / 1 (2026) |
| Pages | 6246–6269 |
| DOI | 10.70670/sra.v4i1.2496 |
| Published | 30-03-2026 |
| Official URL | https://policyjournalofms.com/index.php/6/article/view/2496 |
| Official PDF | https://policyjournalofms.com/index.php/6/article/download/2496/2419 |
| Publisher | DIVINE KNOWLEDGE INSTITUTE |
| Keywords | **Not listed on the source page** — no fabricated keyword list was added anywhere. The `tags` field on both new entries is the *site's own* topical categorization (same convention every other Blog/Article/Project entry already uses), independently derived from the actual abstract content — not presented anywhere as sourced/official keywords. |

Full abstract reproduced below is included in both entries — this is standard, expected
practice for an author presenting their own published work in a professional portfolio
(the same thing Google Scholar, ORCID, and university profile pages do), not third-party
content reproduction.

## Pre-implementation findings

**Reconciled against Batch 3.5:** confirmed `pdf-export.js`, the vendored jsPDF library, and
the PDF button gating in `works-single.html` all intact. Clean baseline build: 157 pages,
0 errors/warnings.

**Content-type architecture (inspected before writing anything):** Blog and Articles both
render through the shared `works-single.html`/`works-list.html` partials, confirmed in
Batch 3.5. Critically, **the Publications schema is already fully built** — the
`archetypes/publications.md` archetype (pre-existing, from before this session) already
defines exactly the right fields: `authors`, `venue`, `link`, `citation`, `summary`, `tags`.
`works-single.html` already conditionally renders an author list, a venue line, an external
"View Publication ↗" button (only `.Params.link` needs to be set), and a formatted citation
block — and already suppresses the "X min read" label whenever `.Params.authors` is present.
The PDF-download button is already scoped to `{{ if or (eq .Section "blog") (eq .Section "articles") }}`,
which automatically and correctly excludes Publications with zero additional logic.

**This meant no template, CSS, or JS changes were needed at all** — the architecture built
in earlier batches was already exactly right for this task. The only work was writing the
three content files correctly, respecting the front-matter convention that makes each
render as its intended type:
- **Publications entry**: sets `authors`/`venue`/`link`/`citation` → triggers the
  external-link/bibliographic-record rendering, no PDF button.
- **Articles entry**: deliberately does *not* set those fields → renders as a normal
  article (reading time shown, PDF button shown), with all the bibliographic detail placed
  in the body content instead, where it belongs for a readable article.

## Roadmap item

**Blog title fix.** `/blog/` had no `content/blog/_index.md`, so Hugo auto-generated the
section title via its default pluralization, rendering "Blogs Archive." — the same
underlying mechanism (not the same bug) that caused the original About routing defect back
in an earlier batch. Fixed the same way Articles/Achievements already were: added
`content/blog/_index.md` with an explicit `title: "Blog"`. No other outstanding roadmap
items were implementation-ready without a decision (font preload was previously recommended
against without Lighthouse evidence; the About narrative gap needs client-authored content).

## Files changed: 3 (all new, all content — no template/CSS/JS touched)
- `content/blog/_index.md` — **new**
- `content/articles/decolonizing-gendered-subjectivities.md` — **new**
- `content/publications/decolonizing-gendered-subjectivities.md` — **new**

## Validation

### Build
Clean, 0 errors, 0 warnings, 0 path warnings. 169 pages (up from 157 — 2 real content pages
plus new tag-taxonomy pages for the 4 new tags, all expected).

### Content-type differentiation (verified directly in generated HTML)
| Check | Publications entry | Articles entry |
|---|---|---|
| "View Publication ↗" external link | Present, `href` = official URL, `target="_blank"` | Absent (correct) |
| Author list rendered | Present | Absent (correct — authors are in the body instead) |
| Reading time shown | No (correct — suppressed when `authors` is set) | Yes |
| PDF download button | Absent (correct) | Present and functional |

### Blog title fix
`<title>Blog \| MA-Portfolio</title>`, `<h1>Blog Archive.</h1>` — confirmed, no more "Blogs."

### PDF generation for the new Article (real download + programmatic inspection, same
methodology as Batch 3.5)
- Real file download via Chromium: `decolonizing-gendered-subjectivities-muhammad-awais.pdf`, 2 pages, 12.6KB
- `pypdf` text extraction confirms: "CONFIDENTIAL" ×2 (once per page), "Muhammad Awais" ×16,
  reuse notice present, correct title, abstract content, and DOI all present as real
  extractable text
- Sample included in `validation-samples/`

### SEO / routing
- Distinct canonical URLs: `/articles/decolonizing-gendered-subjectivities/` and
  `/publications/decolonizing-gendered-subjectivities/` — no duplicate-content collision,
  each is its own real page
- Both present in `sitemap.xml`
- Both present in `search-index.json`, correctly typed (`"type": "articles"` /
  `"type": "publications"`)
- Publications list page (`/publications/`) empty-state correctly gone now that real content
  exists; Articles list page shows the new card alongside existing entries

### Official link verification
`/publications/.../` "View Publication" button `href` confirmed to be exactly
`https://policyjournalofms.com/index.php/6/article/view/2496` (the official source), opening
in a new tab (`target="_blank"`, `rel="noopener noreferrer"` already part of the existing
template — unchanged).

### Regression (full sweep, same routes as prior batches plus the two new ones)
All 16 routes tested return 200. Existing blog post PDF download (Batch 3.5,
`operating-systems-explained`) re-verified still working after the content additions.
Search overlay, dropdown hover→click, theme toggle, Contact form, About routing — all
reconfirmed. Zero page/console errors across the full sweep.

## Known limitations / remaining items
- No further fully-specified, decision-free roadmap items remain. Font preload and the
  About narrative content gap are still open but were already flagged as not
  implementation-ready (the former needs measured evidence before it's worth doing; the
  latter needs client-authored content, not engineering work).
- Muhammad Awais is one of six co-authors on this paper, not the sole or corresponding
  author — both entries represent this accurately (full author list shown in both; no
  implication of sole authorship anywhere).

## Applying these files locally
All 3 files are new — copy them into your repository at the paths shown, creating
`content/publications/` if it doesn't already exist locally. No deletions needed. Run a
clean `hugo` build to regenerate `public/`.
