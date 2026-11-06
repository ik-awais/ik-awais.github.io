# Navbar, Hero, and Pagination Refinement

**Scope:** Correct stray dropdown labels, refine the global navbar, remove the homepage eyebrow line, and prevent pagination from overlapping page content.

## Changes

### Navbar dropdown leakage
- Dropdown menus are `display: none` by default.
- A menu becomes visible only when its parent dropdown has the `is-open` class and the `hidden` attribute has been removed.
- The existing JavaScript now adds/removes `is-open` together with `hidden` and the ARIA state.
- Added a small hover bridge below each desktop trigger to prevent the menu closing while the pointer moves from the trigger to the menu.
- Existing destinations, labels, click handling, keyboard handling, and mobile menu behavior are retained.

### Navbar visual refinement
- Scoped fixed-header positioning to `#navbar`; generic `<nav>` elements are no longer treated as the site header.
- Introduced a consistent 74px desktop header with a subtle translucent background, blur, border, and refined spacing.
- Reduced navigation label sizing and spacing to keep the navigation on one line at desktop widths.
- Refined the AI GenMat brand link as a compact outlined badge.
- Added a mobile navigation breakpoint through 1000px and a compact tablet layout.
- Preserved the dark and light theme behavior.

### Homepage hero
- Removed the eyebrow line immediately above the name:
  `AI Engineer & Software Engineering Student · AI GenMat`.
- The name, description, skill tags, and CTAs remain unchanged.

### Pagination and table of contents
- The former global `nav { position: fixed; ... }` rule was affecting every `<nav>` element, including pagination and the article table of contents. It is now scoped to `#navbar`.
- Pagination now uses a three-column grid: previous link, centered page count, next link.
- Empty left/right slots remain reserved when a navigation direction is unavailable, keeping `Page X of Y` centered and clear of the buttons.
- The pagination status is marked with `aria-current="page"`.

## Files changed

- `assets/css/main.css`
- `layouts/_default/baseof.html`
- `layouts/index.html`
- `layouts/partials/timeline-list.html`
- `layouts/partials/works-list.html`
- `static/js/main.js`

## Validation

- `node --check static/js/main.js`: passed.
- CSS parsed using `tinycss2`: 378 top-level rules, zero parser errors.
- Confirmed all dropdown menus in the base template start with the `hidden` attribute.
- Confirmed the homepage hero no longer contains the eyebrow line.
- Confirmed no generic fixed `nav {}` / `nav.scrolled` rules remain in the stylesheet.
- Confirmed both pagination partials use the three-slot layout.
- Full Hugo build and browser visual regression were not run because Hugo is not installed in this execution environment and headless Chromium did not initialize successfully.

## Apply

Extract `navbar-hero-pagination-fix-changed-files.zip` into the repository root and allow the six source files to be overwritten. Then run:

```bash
hugo server -D --disableFastRender
```

Check the dropdowns on desktop and mobile, and check a paginated collection page such as Blog, Education, or Experience when it contains more than one page.
