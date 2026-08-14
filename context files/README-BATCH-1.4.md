# Batch 1.4 — Dynamic Per-Page Meta Description (PAAR SEO-02)

## Apply these changes
1. Replace `hugo.toml` with the file here (one addition: `defaultDescription` under `[params]`).
2. Replace `layouts/_default/baseof.html` with the file here (meta description line made dynamic; nothing else touched).

## What changed
Single point of logic, in `baseof.html` only — every page type routes through this one base template, so no duplication anywhere:

```
{{ $metaDescription := .Params.description | default .Params.summary | default site.Params.defaultDescription }}
<meta name="description" content="{{ $metaDescription | plainify }}">
```

Priority order exactly as specified:
1. **`.Params.description`** — an optional per-page override. Note: this is **not** a Content Model v1.0-defined field; no existing content uses it. It's a forward-looking extensibility hook, additive only — every page today falls through it silently to tier 2. Flagging for transparency, not as a scope violation.
2. **`.Params.summary`** — the CMS-governed field already assigned as "SEO meta description source" (CMS §3/§4). This is what drives every existing Project and Blog page today.
3. **`site.Params.defaultDescription`** — the old hardcoded string, moved into `hugo.toml` as a real site parameter (TAS §22 classifies meta-tag strings as Configuration Architecture) rather than left baked into the template. Used by Homepage, Project list, Blog list, and all taxonomy/tag pages — none of which have a `summary`.

`plainify` strips any stray HTML/markdown and normalizes whitespace — a safety measure for future content types, not a behavior change for current plain-text summaries.

**Extensibility, as required:** Education, Experience, Works siblings, and Achievements automatically inherit this exact behavior the moment their content carries a `summary` (or `description`) field — zero template duplication needed, because the logic lives once in `baseof.html`, which every future page type will also extend.

**Out of scope, untouched as instructed:** `keywords` meta tag, Open Graph, Twitter Cards, structured data, canonicals, `robots.txt`.

## Validation performed
- Hugo build: succeeded, 135 pages, no errors.
- Homepage → site-level fallback description confirmed (no page-level summary exists for home).
- Project list, Blog list, and spot-checked taxonomy/tag pages → correctly fall back to the site default (still non-empty, still valid).
- **All 4 Project pages and all 4 Blog pages** → confirmed unique, rendered description exactly matches that page's front-matter `summary`, one by one.
- **Global scan of all 71 built HTML pages: zero pages with a missing or empty meta description.**
- **Tier-1 override proven functional**, not just assumed: temporarily added a `description` field to one project's front matter, rebuilt, confirmed it won the priority order over `summary` — then reverted the content file and rebuilt again, confirmed diff-clean restoration and correct fallback to `summary`.
- Regression check: skip-link (Batch 1.3), CSP (Batch 1.2), and CSS (Batch 1) all confirmed still intact and byte-identical where expected. `keywords` meta confirmed untouched.
- No template duplication introduced — one conditional, one location.
