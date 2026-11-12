# Homepage Visual Refinement

## Scope

This update refines the existing Hugo portfolio without changing its architecture, routes, content collections, or deployment workflow.

## Changes

### 1. Clean global page background
- Removed the full-viewport grid overlay and noise overlay that created the graph-paper appearance.
- Replaced the purple-black background palette with a restrained slate/ink dark theme and a clean off-white light theme.
- Updated the navbar's base tint to match the new palette.
- Kept existing card and thumbnail treatments intact.

### 2. Moving hero constellation
- Removed the reduced-motion branch that rendered the hero canvas as a static image.
- The constellation now animates continuously with slightly more visible but still restrained node movement.
- Added high-DPI canvas sizing and a safe 2D-context check.

### 3. Tech stack cards and marquee
- Replaced bare technology logos with consistently sized, labeled cards.
- Added a section heading and short explanatory line.
- Created two duplicated content groups per row so the marquee loops seamlessly.
- The two rows travel in opposite directions.
- JavaScript calculates each row's duration from its measured content width and a shared target velocity of 38 CSS pixels per second. This keeps the visual pace consistent even though the rows contain different numbers of cards.
- Mobile card dimensions are reduced while preserving equal sizing within each row.

## Files changed

- `assets/css/main.css`
- `layouts/index.html`
- `static/js/main.js`

## Validation

Passed:
- `node --check static/js/main.js`
- CSS parsing with `tinycss2` (zero parse errors)
- Homepage section-order assertions (About → Tech Stack → homepage content previews)
- Two marquee rows detected; each has two identical groups (8 and 10 cards respectively)
- Reduced-motion stylesheet no longer disables the requested tech marquee
- Hero canvas now calls its animation loop unconditionally
- ZIP archive integrity check

Not completed:
- A full Hugo build could not be run because Hugo is not installed in the execution environment.
- A browser screenshot check was blocked by the environment's browser navigation restrictions.

## Apply

The changed-files ZIP contains repository-relative paths. Extract it into the root of your existing repository and allow the three files to be overwritten.

Then validate locally:

```bash
hugo server -D --disableFastRender
```

The existing `.github/workflows/deploy.yml` and GitHub Pages deployment configuration are unchanged.
