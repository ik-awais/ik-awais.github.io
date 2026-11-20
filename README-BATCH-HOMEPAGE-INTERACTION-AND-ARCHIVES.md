# Homepage, Theme, Interaction, and Archive Update

## Implemented

- Increased hero-network particle radius by approximately 2.25 mm (about 8.5 CSS px) relative to the previous radius.
- Doubled the initial particle velocity, minimum drift speed, and mouse-attraction force.
- Updated dark and light palettes to a brighter violet / sky-blue / teal system with a restrained pink highlight.
- Kept the overall page background flat; no grid or tiled texture was introduced.
- Removed magnetic button motion and removed hover translation/scale from clickable controls, cards, and decorative card icons.
- Added Asana, ClickUp, and Slack to the homepage Technology Stack. Simple Icons is allowed by the page CSP.
- Converted every homepage content preview into an automatically moving horizontal marquee. Duplicate cards are aria-hidden and removed from keyboard navigation; movement pauses while hovered/focused and respects reduced-motion preferences.
- Embedded the actual contact form at the bottom of the homepage while retaining the dedicated `/contact/` page.
- Removed pagination from Projects, Works, Education, Experience, Achievements, and Certificates archives. Every record is rendered on one route; cards after the first nine are folded behind an expand/collapse control.
- Added a hidden-by-default browser drag-and-drop reorder mode. Open an archive URL with `?edit-order=1` to reveal reorder/export controls; ordinary visitors see only the older-card expander. This query flag is a visibility convenience, not authentication.
- Added a **Copy Markdown weights** action in edit mode. It copies `weight` assignments using the resulting drag order.

## Static-site persistence limitation

A public Hugo/GitHub Pages website cannot write changes back into repository Markdown files. Drag-and-drop therefore changes the order in the current browser preview only. To publish that order for every visitor:

1. Open the relevant archive page with `?edit-order=1` appended to its URL (for example, `/projects/?edit-order=1`).
2. Select **Reorder cards**.
3. Drag cards into the intended order.
4. Select **Copy Markdown weights**.
5. Paste each generated `weight` value into the matching `content/.../*.md` front matter.
6. Commit and push the Markdown updates.

Hugo uses its native page ordering: explicit `weight` values ascending, then date descending for equal/default weights.

## Changed source files

- `assets/css/main.css`
- `layouts/index.html`
- `layouts/partials/works-list.html`
- `layouts/partials/timeline-list.html`
- `layouts/projects/list.html`
- `layouts/_default/baseof.html`
- `static/js/main.js`
- `hugo.toml`

## Validation

- JavaScript syntax checked with `node --check`.
- CSS parsed with `tinycss2`; zero syntax errors.
- A static assertion pass verified the nine homepage preview sections, contact-form inclusion, new Asana / ClickUp / Slack entries, archive controls, and removal of pagination calls.
- Changed Hugo templates passed block-delimiter balance checks.
- A full Hugo build could not be run because the Hugo binary is not installed in this environment.
- A Chromium interaction test was attempted, but the environment blocks browser navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`; live visual/interaction verification remains pending on the owner's machine.

Run locally:

```bash
hugo server -D --disableFastRender
```

The Simple Icons endpoint requires network access to `cdn.simpleicons.org`; if offline, the Asana / ClickUp / Slack images will not load until cached locally.
