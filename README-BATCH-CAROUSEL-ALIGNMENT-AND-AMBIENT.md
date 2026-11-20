# Batch — Carousel Reliability, Card Alignment, Ambient Background, Contact CTA

## Changes

- Reworked homepage carousel state handling so progress continues after Pause/Play and arrow controls. The controls no longer keep the carousel paused through the card hover/focus state.
- Added a transition watchdog to release the slide lock if `transitionend` is not fired. Rapid arrow presses safely finish an interrupted transition first.
- `prefers-reduced-motion` starts autoplay paused, but the Play control remains available as an explicit user opt-in.
- Moved the same canvas pebble/constellation animation into the global base template so it appears across the homepage and every interior page, using the existing node radius, movement, connection distance, and theme-aware colors. It is fixed to the viewport and does not intercept pointer input.
- Standardized all archive card collections through the shared `.project-grid[data-archive-grid]` rules. Cards align row-by-row, stretch consistently, and use responsive `auto-fit` columns. Browser zoom naturally reduces/increases the number of columns as the CSS viewport changes.
- Replaced the long homepage contact form preview with a compact CTA and email link. The full form and contact details remain on `/contact/`.
- No cursor rules or pointer style were changed.

## Files changed

- `static/js/main.js`
- `layouts/_default/baseof.html`
- `layouts/index.html`
- `assets/css/main.css`

## Validation

- JavaScript syntax checked with Node.js.
- CSS parsed with tinycss2.
- Hugo build was not run because the Hugo executable is not installed in the environment.
- Chromium navigation was blocked by the execution environment, so interactive browser verification could not be completed. The included local checks are static rather than a full browser test.

## Local verification

```bash
hugo server -D --disableFastRender
```

Check carousel arrows, Pause/Play, progress restart, all archive routes at multiple browser zoom levels, and the compact homepage contact CTA. The dedicated `/contact/` page is unchanged.
