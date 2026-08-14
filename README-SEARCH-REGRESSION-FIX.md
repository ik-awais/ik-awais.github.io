# Search Regression — Root Cause Analysis & Fix

## Mandatory workflow followed
1. **Reconciled** every search-related file against the approved Batch 2.9 package — all confirmed byte-identical. The bug was present in my original delivery itself; nothing drifted afterward.
2. **Clean build confirmed** before touching anything: zero warnings.
3. **Inspected in order**, exactly as instructed:
   - `baseof.html` — source markup correct: `<div class="search-overlay" id="searchOverlay" hidden>`.
   - `assets/css/main.css` — **found the bug here** (below).
   - `static/js/main.js` — confirmed not the cause: `overlay.hidden = false` exists exactly once, only inside `openSearch()`, which only runs from the trigger's click handler. No code path touches it on page load.

## Root cause #1 — overlay visible on load

```css
.search-overlay {
  position: fixed; inset: 0;
  display: flex; align-items: flex-start; justify-content: center;   /* ← unconditional */
  padding: 12vh 6vw 24px;
}
```

`display: flex` was applied to `.search-overlay` **unconditionally**, with no regard for the `hidden` attribute. Author CSS class rules take precedence over the browser's built-in `[hidden] { display: none }` default at equal specificity, so this rule silently overrode `hidden` on every page load — confirmed both by CSS inspection and, definitively, by rendering the actual built page in a real Chromium instance and reading the computed style (`display: none` before the fix would have shown `flex`).

The telling detail: this exact problem already exists elsewhere in the same file for the nav dropdowns, and was solved correctly there:
```css
.nav-dropdown-menu:not([hidden]) { opacity: 1; ... }
```
I didn't apply that same guard to `.search-overlay` — that inconsistency is the entire bug.

**Fix:**
```css
.search-overlay {
  position: fixed; inset: 0;
  z-index: 9000;
  padding: 12vh 6vw 24px;
}
.search-overlay:not([hidden]) { display: flex; align-items: flex-start; justify-content: center; }
```

## Root cause #2 — giant search icon, found during validation of fix #1

Confirmed by rendering the *opened* overlay in a real browser after fixing #1: the search-input icon filled the entire panel edge-to-edge, matching the "giant search icon" half of the original report. The SVG had a `viewBox` but no `width`/`height` — and `.search-input-icon` had no size rule either:
```css
.search-input-icon { color: var(--muted); flex-shrink: 0; }
```
With no sizing information anywhere, the browser falls back to its default replaced-element size (why it rendered enormous). This is the other half of the exact symptom you reported — not a separate issue, and not a redesign, just a missing size constraint.

**Fix:**
```css
.search-input-icon { width: 16px; height: 16px; color: var(--muted); flex-shrink: 0; }
```

## Why both are reported together as one fix
Both bugs combine to produce exactly the symptom described: "giant search icon inside a large white panel immediately on page load." Fixing only #1 would have left the icon still broken every time a user actually opened search — which would have meant the feature was still visibly broken, just one click later. Both are minimal, one-line CSS constraints; neither touches markup, JS, scoring, JSON generation, or accessibility.

## Files modified
- `assets/css/main.css` — exactly 2 lines changed (diff below). Nothing else.

```diff
- .search-overlay {
-   position: fixed; inset: 0;
-   z-index: 9000;
-   display: flex; align-items: flex-start; justify-content: center;
-   padding: 12vh 6vw 24px;
- }
+ .search-overlay {
+   position: fixed; inset: 0;
+   z-index: 9000;
+   padding: 12vh 6vw 24px;
+ }
+ .search-overlay:not([hidden]) { display: flex; align-items: flex-start; justify-content: center; }

- .search-input-icon { color: var(--muted); flex-shrink: 0; }
+ .search-input-icon { width: 16px; height: 16px; color: var(--muted); flex-shrink: 0; }
```

## Validation — performed in a real rendered browser (Playwright + Chromium), not just by reading code
- **Clean Hugo build, zero warnings** — confirmed before and after the fix.
- **Overlay absent on load**: `getComputedStyle(overlay).display` → `none`; Playwright's `is_visible()` → `False`. Screenshot confirms a completely normal homepage.
- **Opens only after clicking the trigger**: confirmed visible immediately after `#searchTrigger.click()`; icon now measures exactly 16×16px instead of filling the panel. Screenshot confirms a correctly-proportioned, properly laid-out panel.
- **Real search query works end-to-end**: typed "rag," got back correctly-ranked, correctly-rendered result cards (LectureLens → Document Q&A → AI Research Agent → About), confirming the fix didn't disturb scoring or rendering.
- **Escape closes it**: confirmed `is_visible()` → `False` after `Escape`, focus returned to the trigger.
- **Backdrop click closes it**: confirmed independently in a fresh open/close cycle.
- **Body scroll lock/restore verified precisely**: `hidden` while open; after closing, `overflow-x: hidden` (a pre-existing, unrelated base body rule) with `overflow-y: auto` — confirmed this is the correct original baseline, not a leftover lock, by checking the base `body` CSS rule directly.
- **Mobile verified**: tapping Search inside the open mobile menu correctly closes the mobile panel and opens the overlay at a legible, correctly-sized layout — screenshot confirmed.
- **Both themes verified**: light theme screenshot confirmed correct contrast and styling via the existing CSS custom properties — zero hardcoded colors were touched by this fix.

## Regression sweep
Every other file (`baseof.html`, `main.js`, `hugo.toml`, `layouts/index.searchindex.json`, and representative files from every earlier batch) reconfirmed byte-identical to their approved versions. Only `assets/css/main.css` changed, by exactly the two lines shown above. All Blog and Project content confirmed checksum-unchanged.

## Scope discipline
No redesign. No scoring changes. No JSON index changes. No keyboard-handling changes. No accessibility changes. No unrelated files touched. Two lines of CSS, both root-cause-targeted, both matching a pattern already established elsewhere in the same file.
