# Batch 1.6 — Default Cursor Cleanup (Final Sprint 1 Batch)

## Apply these changes
Replace `layouts/_default/baseof.html` with the file here. Nothing else changes.

## What changed
Removed the two remaining dead elements:
```html
<div class="cursor" id="cursor"></div>
<div class="cursor-ring" id="cursorRing"></div>
```
That's the entire change. Repository-wide inspection (HTML, CSS, JS, partials, templates, assets, static, doc comments) found this was the **only** remaining trace anywhere in the build-relevant codebase:
- No `.cursor` / `.cursor-ring` CSS rules existed (confirmed in Batch 1.1's original inspection and re-confirmed here).
- No JavaScript ever referenced `cursor`/`cursorRing` — no `getElementById`, no `querySelector`, no mousemove tracking, in `static/js/main.js` (520 lines, fully unchanged this entire sprint).
- The four `cursor: pointer;` CSS declarations elsewhere in the stylesheet are the standard pointer-affordance property on buttons/links — an unrelated, shared interaction pattern. Confirmed untouched.

**Out of scope, flagged only:** `PORTFOLIO_CONTEXT.md` and one line in `README.md` still describe a custom cursor in prose. These are documentation files, not part of the Hugo build — outside "remove dead HTML/CSS/JS" scope. Let me know if you'd like those updated separately.

## Validation performed
- Hugo build: succeeded, 136 pages, no errors.
- Repository-wide re-scan for `class=cursor`, `id=cursor`, `cursorRing`: **zero matches** anywhere in `layouts/`, `static/`, `assets/`.
- Confirmed all 4 legitimate `cursor: pointer` rules untouched.
- Confirmed the skip-link (Batch 1.3) is now the literal first `<body>` element, ahead of even where the cursor markup used to sit.
- Confirmed unrelated hover/interaction systems intact: nav-link hover, project-card hover, theme-toggle hover all still present.
- **Re-scanned all 71 built HTML pages: zero cursor artifacts anywhere in the output.**
- `hugo --printPathWarnings`: zero warnings, zero errors.
- CSS confirmed byte-identical to Batch 1 (untouched this batch). `static/js/main.js` confirmed unmodified across the entirety of Sprint 1 (same checksum throughout).
- Full cross-batch regression sweep: robots.txt, favicon links, CSP, meta description, skip-link, and all 36 tech-icon dimension attributes all confirmed still present and correct.
- Default OS cursor now applies everywhere — no residual markup, styling, or script left to override it.
