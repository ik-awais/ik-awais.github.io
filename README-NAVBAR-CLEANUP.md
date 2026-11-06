# Navbar Dropdown Text Cleanup

## Problem
The deployed navbar screenshot showed submenu labels such as `University`, `College`, and `Other Experience` appearing as stray text around the main navigation row. These are existing dropdown entries, not new navigation labels.

## Changes

- `assets/css/main.css`: explicitly forces `.nav-dropdown-menu[hidden]` to `display: none !important`, hidden visibility, and no pointer interaction. Open menus are displayed only after the `hidden` attribute is removed.
- `static/js/main.js`: initializes each dropdown in a closed, ARIA-consistent state; updates `aria-hidden` alongside the native `hidden` property when opening/closing.

No navigation destinations, labels, page routes, homepage layout, typography, or visual theme were redesigned. Existing dropdown functionality is retained.

## Validation

- JavaScript syntax: `node --check static/js/main.js`
- CSS parsed successfully with a CSS parser.
- Confirmed all three dropdowns start with the `hidden` attribute in `layouts/_default/baseof.html`.
- Full Hugo build/browser verification was not run in this environment.

## Apply

Extract the changed-files ZIP into the repository root, preserving the `assets/` and `static/` paths and allowing these two files to be overwritten.
