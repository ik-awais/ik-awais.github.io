# Batch 1 — Hugo Pipes CSS Migration

## Apply these changes
1. Replace `assets/css/main.css` in your repo with the file here (this is the full, real stylesheet — was previously a dead 46-line stub).
2. Replace `layouts/_default/baseof.html` with the file here (only change: the `<link>` tag now uses `resources.Get | minify | fingerprint`).
3. Delete `static/css/main.css` from your repo — it is no longer referenced anywhere.

## What changed
- CSS is now served fingerprinted + minified (e.g. `/css/main.min.<hash>.css`) instead of an unversioned static path — resolves PAAR PERF-01 (cache-busting) and PERF-02 (dead stub file).
- Zero visual/behavioral change. No CSS rule was added, removed, or edited.

## Validation performed
- Built with Hugo Extended v0.154.5 (matches your CI workflow exactly).
- Build succeeded: 135 pages, no errors/warnings.
- Selector-rule count identical before/after (333 = 333) — nothing dropped by minification.
- Spot-checked critical selectors survive: `.skip-link`, `.theme-toggle`, `.project-card`, `.contact-form`, `prefers-reduced-motion`, `:focus-visible` — all present.
- `.cursor` rule confirmed absent in both baseline and migrated CSS (pre-existing, not a regression — ties to the flagged cursor markup issue, untouched in this batch).
- Confirmed the fingerprinted link + `integrity` (SRI) hash render correctly on homepage, a Project page, and a Blog page.
