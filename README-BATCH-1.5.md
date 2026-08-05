# Batch 1.5 — robots.txt, Favicon, Tech-Icon Image Dimensions

## Apply these changes
1. Replace `hugo.toml` (added `enableRobotsTXT = true`).
2. Add `layouts/robots.txt` (new file — custom robots.txt template).
3. Replace `layouts/_default/baseof.html` (added two favicon `<link>` tags only).
4. Replace `layouts/index.html` (added `width`/`height` to all 36 tech-icon `<img>` tags — nothing else changed).
5. Replace `static/favicon.ico` and add `static/favicon.svg`.

---

## Task 1 — robots.txt
Used Hugo's native mechanism (`enableRobotsTXT = true` + `layouts/robots.txt`) instead of a static file, specifically because a static file can't derive the Sitemap URL from config — it would have to hardcode the domain, which was explicitly disallowed.

```
User-agent: *
Allow: /

Sitemap: {{ "sitemap.xml" | absURL }}
```

`absURL` resolves against whatever `baseURL` is configured in `hugo.toml` at build time — zero hardcoded domain. Output confirmed: `Sitemap: https://ik-awais.github.io/sitemap.xml`. No `Disallow` lines — every public page, and all CSS/JS/image assets, remain indexable.

## Task 2 — Favicon
No branded favicon asset exists anywhere in the project files, and designing a new brand mark isn't my call to make. So rather than inventing one, I derived a minimal favicon directly from what's **already live and approved**: the exact "MA." wordmark and exact colors (`--bg: #03001E`, `--text: #F5F7FF`, `--accent: #9D6FFF`) already used in the nav logo today. This is a mechanical derivation, not a new design decision.

- `static/favicon.svg` — the primary, scalable, modern-browser icon.
- `static/favicon.ico` — real multi-resolution (16/32/48px) fallback, replacing the previous 0-byte placeholder, for the small number of contexts that still request `/favicon.ico` by convention regardless of `<link>` tags.
- Two `<link>` tags added to `baseof.html`:
  ```html
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  ```
No manifest, no apple-touch-icon, no PNG size set — kept to the minimal modern-browser pair, per "lightweight" and "no unnecessary variants."

**This is explicitly a placeholder, isolated by design:** once a real branded favicon exists, it's a pure asset swap — replace these same two files (`static/favicon.svg`, `static/favicon.ico`) and nothing in any template needs to change again.

## Task 3 — Tech-icon image dimensions (PAAR CLS finding)
Only `layouts/index.html` touched — the only template containing tech icons. `layouts/partials/card-thumb.html` (a different, unrelated image) was left untouched, as instructed.

Before assigning `width`/`height`, I verified the **actual intrinsic dimensions of every real source file** rather than guessing or assuming square:
- All 17 devicon icons confirmed **128×128** (fetched and checked each `viewBox` directly from the devicon source repo).
- The AWS logo (the one non-devicon, Wikimedia-hosted icon) confirmed **512×307** — not square, verified via its Wikimedia Commons file page.

Every one of the 36 `<img>` tags (18 unique icons × 2, for the seamless marquee loop) now carries its real, verified intrinsic `width`/`height`. This does not conflict with or override the existing CSS (`.scroll-track img { height: 36px }`, width left auto) — that rule is untouched and still governs the actual rendered size for every visitor. The HTML attributes only inform the browser's pre-load aspect-ratio reservation, which is exactly the CLS fix, with no distortion risk since I used each image's real ratio rather than an assumed one.

---

## Validation performed
- Hugo build: succeeded, 136 pages (135 + robots.txt itself, expected), no errors.
- `robots.txt` output inspected directly: correct `Allow: /`, correct dynamically-resolved `Sitemap:` line, no domain hardcoded in source.
- `sitemap.xml` confirmed still generated (unaffected).
- Both favicon files confirmed present in build output; both `<link>` tags confirmed rendered on the homepage.
- All 36 tech-icon `<img>` tags confirmed present (none lost) and confirmed carrying the correct, verified `width`/`height` pair (128×128 or 512×307).
- `hugo --printPathWarnings`: zero warnings, zero errors — no broken references introduced.
- Regression sweep: CSS confirmed byte-identical to Batch 1 (untouched), skip-link (Batch 1.3) and CSP + meta description (Batch 1.2/1.4) confirmed still intact on the homepage, total page count (71 HTML pages) unchanged.
