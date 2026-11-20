# Batch: Homepage Carousels, Smaller Hero Nodes, and Persistent Card Ordering

## Summary

This batch refines the existing Hugo portfolio without changing the framework, routes, content, or cursor behavior.

### 1. Hero constellation nodes

- Reduced the particle radius to one-third of the enlarged previous value.
- Reduced the pulse expansion proportionally.
- Preserved the current node velocity, pointer interaction, line drawing, density, and color system.
- No custom cursor or drag cursor was introduced.

### 2. Homepage preview carousels

- Replaced continuous horizontal auto-scrolling with a timed carousel for every homepage content preview.
- Each section now has a progress bar that fills before the carousel advances by one card.
- Added previous, next, and pause/play controls.
- The carousel shows up to three cards on wide screens, two at medium widths, and one on narrow screens. It adapts to the number of available cards.
- The loop uses leading/trailing clones to avoid a visible jump at the end.
- Rotation pauses while the user hovers, focuses controls, switches tabs, or the section is outside the viewport.
- `prefers-reduced-motion` disables automatic motion; manual previous/next controls remain available.

### 3. Archive drag ordering

- Added a compact drag grip to every archive card in Projects, Works, Achievements, Articles, Publications, Blog, Activities, Education, and Experience archives.
- Dragging reorders the actual card within the grid; it is not limited to the former hidden `?edit-order=1` mode.
- Dragging supports pointer input (mouse, pen, and touch through the grip).
- Keyboard users can focus a card grip and use Arrow Up, Arrow Down, Home, and End.
- The existing “Show older cards” control remains intact. Expand older cards before trying to move them.

### 4. Persistence and the GitHub Pages constraint

The portfolio is a static Hugo/GitHub Pages site. A visitor's browser cannot write anonymous changes back into the GitHub repository. Therefore:

- Every visitor can reorder cards on the live site.
- Each visitor's arrangement is saved in that visitor's own browser `localStorage` and survives reloads on the same browser/device.
- The homepage reads the same saved collection order, so the visitor's archive arrangement is reflected in the homepage preview on that device.
- This does **not** alter the shared order for other visitors.

To publish a shared order for everyone:

1. Arrange the cards in the live archive on the browser where the preferred order is saved.
2. Open the same archive URL with `?edit-order=1` appended (for example, `/projects/?edit-order=1`).
3. Use **Copy shared Markdown order**.
4. Apply the generated `weight` values to the corresponding Markdown files in the repository.
5. Commit and push; Hugo rebuilds the site and visitors receive the shared order.

A genuinely shared, live order writable by all visitors would require an external backend/database and abuse controls. That backend has not been added or configured in this batch.

### 5. Homepage and archive consistency

- Homepage preview sections and archive grids use shared order-family names (`projects`, `experience`, `education`, `blog`, `articles`, `publications`, `achievements`, and `activities`).
- The local saved order is reused by the matching homepage preview.
- Markdown `weight` values are respected by homepage previews when present, so committed order can also flow into the homepage after deployment.
- Sibling archives in Education and Experience preserve their saved order keys when a visitor reorders one subsection.

## Files changed

- `static/js/main.js`
- `assets/css/main.css`
- `layouts/partials/home-preview-section.html`
- `layouts/index.html`
- `layouts/projects/list.html`
- `layouts/partials/works-list.html`
- `layouts/partials/timeline-list.html`

## Validation

Passed:

- `node --check static/js/main.js`
- CSS parsing with `tinycss2` (zero parse errors)
- Card-order storage/merge unit check for sibling archive families
- Static assertions for carousel controls, order-family wiring, node-radius reduction, and absence of grab/custom cursor styles
- Hugo template delimiter balance checks
- ZIP integrity checks

Not completed:

- A Hugo build could not be run because Hugo is not installed in the execution environment and external network access timed out when attempting to install the pinned version.
- Chromium headless stalled before producing a DOM dump, so browser-level visual and pointer interaction verification remains outstanding.

## Local verification

From the repository root:

```bash
hugo server -D --disableFastRender
```

Check at minimum:

1. Header nodes are one-third their prior enlarged radius; movement remains unchanged.
2. Each homepage preview's progress bar fills, then advances one card.
3. Previous, next, pause/play controls work.
4. Automatic rotation pauses on hover/focus and when reduced motion is enabled.
5. Drag handles reorder cards on each archive page.
6. Reordered cards remain in place after reload on the same browser.
7. The matching homepage preview follows that browser's saved ordering.
8. `?edit-order=1` exposes the Markdown-weight export control.
9. Cursor remains the browser's normal OS cursor; no custom/drag cursor is introduced.
