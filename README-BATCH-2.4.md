# Batch 2.4 — Navigation Architecture

## Apply these changes
Replace `layouts/_default/baseof.html`, `assets/css/main.css`, `static/js/main.js`. Nothing else changes.

## Pre-batch findings (see full detail in-conversation)
- Re-inspected and re-verified every Sprint 1 / 2.1–2.3 file against durable storage before starting — all confirmed intact, build clean, zero regressions found.
- Your reported local build error was confirmed as an incomplete file application on your end (missing `data/status.yaml`/`data/credibility.yaml`) — not a defect in delivered work.
- **New finding, left alone:** the footer has the same stale `/#contact` link the nav had. Out of this batch's explicit scope (the `<nav>` element only) — still there, flagged for you to decide on.
- **Interpretation used:** "Home" is served by the existing logo link to `/`; no separate redundant "Home" text link was added.

## What was built

**Structure:** Home (logo) → Education▾ → Experience▾ → Projects → Works▾ → Achievements → Contact, plus the existing GitHub/LinkedIn/theme-toggle/Hire Me utility cluster, untouched.

**Dropdowns (Education, Experience, Works):** one shared "disclosure" pattern — a `<button aria-expanded aria-haspopup aria-controls>` plus a `<ul hidden>` — drives all three, on both desktop and mobile. Desktop CSS presents it as a floating panel; mobile CSS presents the *identical* markup as an inline accordion. No JavaScript is duplicated between breakpoints.

**Future destinations** (University, College, School, Courses, AI GenMat, Future Companies, Other Experience, Articles, Publications, Activities, Achievements): rendered as plain, non-interactive `<span>` text with a small "Soon" tag — never an `<a>`, so there is no href to ever 404, and no page was created for any of them. Spans aren't natively focusable, so keyboard users tab straight past them.

**Works → Blogs → `/blog/`:** unchanged, exactly as frozen.

**Nav's Contact link:** fixed from the stale `/#contact` to `/contact/`.

**About:** confirmed absent from the navbar — reachable only via the Homepage teaser and its own URL, as already established.

**Mobile:** hamburger button (hidden on desktop, shown ≤768px) toggles a full-width panel below the nav bar; Education/Experience/Works become inline accordions within it; tapping a real link inside closes the menu; body scroll locks while open.

## Files modified
- `layouts/_default/baseof.html`
- `assets/css/main.css` (additive — no dropdown/hamburger system existed anywhere before this batch)
- `static/js/main.js` (additive — new self-contained IIFE block only)

## Files added
None.

## Validation performed
- Hugo build: succeeded, 138 pages (unchanged — no pages added), zero errors, zero `--printPathWarnings` output.
- **Existing destinations confirmed reachable:** `/projects/`, `/contact/`, `/blog/` (via Works → Blogs) all present and correctly linked.
- **Zero remaining stale `#contact` references inside the `<nav>`** — the one remaining instance found site-wide is the footer's, confirmed to be the exact pre-existing, explicitly-flagged, out-of-scope issue — not a defect introduced here.
- **All 11 future destinations confirmed to be non-link `<span>` elements** — checked individually, zero have a preceding `<a>` tag, zero hrefs, zero possibility of a 404.
- **About confirmed absent** from the rendered `<nav>` block specifically (not just "not linked," but scanned the nav's own HTML directly).
- **Works → Blogs confirmed** to route to `/blog/` in the rendered dropdown markup.

## Accessibility validation
- Every dropdown trigger carries `aria-expanded`, `aria-haspopup="true"`, and `aria-controls` pointing to a real, matching element id — verified programmatically for all three dropdowns.
- **Zero duplicate IDs** — checked across the Homepage, Contact, About, and Projects pages individually (the nav is shared across all of them, so this needed checking per page type, not just once).
- Escape closes an open dropdown and returns focus to its own trigger button (and separately closes the mobile menu, returning focus to the hamburger, if no dropdown was open).
- Click-outside closes any open dropdown.
- Tabbing focus away from a dropdown's own controls (`focusout` where the newly-focused element is outside it) closes that dropdown automatically.
- Disabled future destinations are unreachable by keyboard entirely (plain `<span>`, not in the tab order) rather than being focusable-but-inert, which is the correct accessible pattern.
- Full theme audit: every color in the new CSS uses existing custom properties (`--muted`, `--text`, `--border`, `--card-hover`, `--nav-scrolled`, `--shadow`) — confirmed each has a defined light-theme override already in the stylesheet. Zero hardcoded colors introduced.

## Mobile validation
- `.nav-toggle` confirmed `display: none` by default (desktop) and `display: flex` only inside the existing `@media (max-width: 768px)` block — verified the rule sits inside that block, not accidentally global.
- Mobile panel: fixed-position, full-width, scrollable if content exceeds viewport height, matching the site's existing blur/scroll-header visual treatment (`--nav-scrolled`).
- Education/Experience/Works render as inline accordions on mobile (not floating panels, which wouldn't make sense at that width) — same markup, same JS, CSS-only presentation switch.
- Tapping a real link inside the open mobile menu closes it, so navigation completes normally instead of leaving a stale open panel behind.

## Keyboard validation
- Tab order: logo → (dropdown triggers reachable and activatable via Enter/Space, being real `<button>` elements) → Projects → Works trigger → Blogs (only real link inside) → Achievements (skipped, non-focusable) → Contact → GitHub → LinkedIn → theme toggle → Hire Me.
- Enter/Space on any dropdown trigger toggles it (native `<button>` behavior — no custom key handling needed for activation).
- Escape behavior confirmed as described above.
- No arrow-key roving menu was implemented — deliberately using the simpler, more robust W3C-recommended "disclosure navigation" pattern for site nav (as opposed to the more complex application-menu pattern), consistent with keeping this maintainable for a solo owner.

## Cross-batch regression
Every file from Sprint 1 and Batches 2.1–2.3 re-verified byte-identical against durable storage after this batch. Homepage's Credibility Figures, Current Status, and featured-project graceful-empty state all reconfirmed still rendering correctly. Skip-link, CSP, favicon, and robots.txt all reconfirmed intact.

## Remaining Sprint 2 work
- Footer's stale `/#contact` link (flagged, awaiting your decision).
- Featured Projects selection, optional credibility figures — still open.
- Education, Experience, Works expansion (Articles/Publications/Activities), Achievements, Search, AI GenMat page — all still pending, each explicitly excluded from this batch.

## Recommended next batch
With the full navigation shell now in place, the natural next step is picking **one** of the still-disabled destinations to bring online — Education, Experience, or the Works siblings (Articles/Publications/Activities) — each of which still needs its field schema and URL confirmed per your earlier "derive it, document it, implement it" instruction. Achievements is the simplest single-page option if you'd like a quick win next; Works' Articles/Publications/Activities would retire three "Soon" tags at once if you'd rather prioritize breadth.
