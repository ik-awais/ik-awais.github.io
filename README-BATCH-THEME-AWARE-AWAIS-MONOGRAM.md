# Batch — Theme-Aware Awais Monogram

## Changes

- Replaced the previous geometric A/pebble mark with a circular A/W monogram based on the supplied reference image.
- Kept the navbar and footer mark as a shared inline SVG so its strokes inherit CSS custom properties from the active site theme.
- Tuned the dark-theme mark to the portfolio's lavender, cyan, and teal accents; tuned the light-theme mark to deeper violet, blue, and green tones for contrast.
- Added dark and light SVG, ICO, PNG, and Apple touch icon variants. The theme toggle now swaps browser icon assets and the browser theme-color metadata along with the page theme.
- Preserved legacy favicon filenames as dark-theme fallbacks and extended the GitHub Pages asset validation to check the light/dark assets.

## Files changed

- `layouts/partials/awais-mark.html`
- `layouts/_default/baseof.html`
- `assets/css/main.css`
- `static/js/main.js`
- `static/favicon.svg` and `static/favicon-{dark,light}.svg`
- `static/favicon-{dark,light}-apple.svg`
- `static/images/branding/awais-mark.svg`
- `.github/workflows/deploy.yml`
- `PORTFOLIO_CONTEXT.md`

## Validation

- SVG source and all theme-specific color references checked.
- JavaScript syntax and CSS parse validation are included in the release checks.
- Raster favicon dimensions and ICO multi-resolution entries are validated after generation.
- A full Hugo production build should be run with the repository's pinned Hugo Extended `0.154.5` toolchain before deployment.
