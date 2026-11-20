# Pebble Motion Correction

## File changed
- `static/js/main.js`

## Behavior
- Pebbles now drift independently across the viewport at their existing high pace (approximately 0.64 CSS pixels per 60 Hz frame, with a small per-pebble variation).
- The cursor only adds local steering to pebbles within a 285 px influence radius. It does not translate the particle field or alter the page theme/background.
- A gentle orbital component and soft inner repulsion let the pebbles gather around the cursor without collapsing into one point.
- Pebble-to-pebble separation reduces overlap while preserving free movement.
- The existing pebble size and theme-specific pebble/line colors are unchanged.
- The default operating-system cursor is unchanged.

## Validation
- `node --check static/js/main.js` passed.
- A Node-based simulation test ran the field for 60 seconds: all 55 pebbles moved independently, average distance to the stationary pointer decreased substantially, and each pebble retained its configured speed (floating-point error below 1e-9).
- A full Hugo build and visual browser test were not run because Hugo is not installed in this environment.

## Apply
Copy `static/js/main.js` into the same path in the repository, then run `hugo server -D --disableFastRender` locally before committing.
