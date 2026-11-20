# Batch — Awais Monogram, Silent Reordering, and Inertial Pebble Tracking

## Changes

- Removed verbose visitor-facing archive status messages about local browser storage and repository commits. Reordering now saves silently; the optional order-export button gives short-lived button-level feedback only.
- Restored continuous cursor-following for the pebble field using document-level pointer tracking. The entire constellation follows a smoothed pointer anchor with inertia, while each pebble retains its normalized free-running velocity.
- Kept the background limited to the pebble and connection-line canvas. No cursor halo, radial highlight, spotlight, pointer trail glow, or custom cursor was added. The OS cursor remains the default cursor.
- Created a custom Awais monogram: a geometric `A` mark with a small orbit/pebble detail, in a violet-to-blue-to-cyan palette.
- Replaced the portrait-based favicon with the Awais monogram in SVG, ICO, 16px/32px/512px PNG, and 180px Apple touch icon formats.
- Reused the same monogram in the navbar and footer next to the full `Muhammad Awais` wordmark.
- Retained the portrait asset at `static/images/branding/muhammad-awais.png` for optional profile use; it is no longer used for the favicon.
- Updated GitHub Pages workflow artifact checks to require `public/favicon.svg` and `public/images/branding/awais-mark.svg`. Preserved the earlier fix that configures Hugo's cache in a step using `$RUNNER_TEMP`, avoiding the invalid job-level `runner.temp` context.
- Updated `DELETE-FILES.txt`, the previous batch README, and `PORTFOLIO_CONTEXT.md` to match the new branding and behavior.

## Files changed

- `.github/workflows/deploy.yml`
- `assets/css/main.css`
- `static/js/main.js`
- `layouts/_default/baseof.html`
- `layouts/partials/awais-mark.html` (new)
- `static/favicon.svg` (new/current)
- `static/favicon.ico`
- `static/favicon-16x16.png`
- `static/favicon-32x32.png`
- `static/favicon-512.png`
- `static/apple-touch-icon.png`
- `static/images/branding/awais-mark.svg` (new)
- `DELETE-FILES.txt`
- `README-BATCH-PORTRAIT-CURSOR-DRAG-CICD.md`
- `PORTFOLIO_CONTEXT.md`
- `README-BATCH-AWAIS-MONOGRAM-PEBBLE-TRACKING.md` (new)

## Validation

- JavaScript syntax checked with Node.js.
- CSS parsed with `tinycss2`; no parse errors.
- Workflow YAML parsed successfully; the former job-level `${{ runner.temp }}` expression is absent and the cache is configured through `$RUNNER_TEMP` in a step.
- Favicon PNG dimensions and ICO multi-resolution entries checked.
- Source checks confirm that the verbose browser-storage/repository-commit notices are absent from the runtime JS and that document-level pointer tracking is active.
- ZIP integrity checked after packaging.
- Full Hugo build and live GitHub Actions execution were not run in this environment because Hugo and `actionlint` are unavailable. Run a local Hugo build and push to `main` to verify the workflow end to end.

## Notes

- The visual redesign of the light theme is intentionally not part of this batch.
- GitHub Pages remains a static deployment. The order-export mechanism is unchanged; this batch only removes verbose visitor-facing explanation text.
