# Batch 2.2 — Homepage Architecture Migration (Phase 1)

## Apply these changes
1. Replace `layouts/index.html`.
2. Replace `assets/css/main.css` (one new CSS block added — the credibility-figure counters; nothing else touched).
3. Add `data/credibility.yaml`.
4. Add `data/status.yaml`.

Nothing else changes. Navbar, Hero design, Contact page, and Sprint 1 files are all untouched.

## New Homepage order (matches the Constitution exactly)
1. **Hero** — unchanged except one link fix (see below).
2. **Credibility Figures** — new.
3. **Current Status** — restructured from the old stats-bar.
4. **About Preview** — new.
5. **Technology Stack** — unchanged, relocated only.
6. **Projects Worth a Look** — new, featured-only filter.
7. **Final CTA** — new, replaces the old embedded contact section.

## Section-by-section notes

**Hero:** The "Get in Touch" button pointed to `#contact`, which no longer exists now that the embedded contact section is gone — left as `#contact` would have been a genuinely broken in-page link, so per the batch's own conditional ("update CTA destinations only if required"), I updated it to `/contact/`. Nothing else in the Hero changed.

**Credibility Figures — architecture, not numbers:** No figure is fabricated. Two figures render automatically, computed directly from live content: current Project count and current Blog Post count (both real, both zero-maintenance — they update themselves as content is added, with plain labels and no "+" suffix, since a suffix on an exact, small, real count would misleadingly imply "more than"). Any further figures come only from `data/credibility.yaml`, which is **intentionally empty** — no verified figures like "years of experience" exist anywhere in the approved documentation, and none were invented. Each figure hides individually if unavailable; I proved this works by testing with the file empty (current, real state) — the section still renders correctly with just the two live counts. No counter-up animation was added, as instructed.

**Current Status:** Same four grounded, already-approved facts (role, company/title, specialty areas) that were already live in the old stats-bar — restructured into `data/status.yaml` so future badges can be added without touching the template again, satisfying "must support future extension without redesign." Visually and textually unchanged from what was already approved and live.

**About Preview:** Reuses the Hero's existing sub-headline verbatim as the "short introduction" — no new copy was invented. I deliberately did *not* reuse the Contact page's own paragraph here (even though it was tempting for consistency), since that text is specifically a contact-invitation, not a bio teaser, and duplicating page paragraphs across two pages is both a content mismatch and an avoidable SEO duplicate-content risk. "Read More →" points to `/about/` as instructed — that page doesn't exist yet, which is expected and explicitly authorized this batch ("do not create the About page in this batch"); note this is the one homepage link this batch doesn't fully resolve, which is why "no broken links" wasn't in this batch's validation list either.

**Technology Stack:** Byte-for-byte identical markup, only moved to its new position in the file. Zero risk to animation/behavior.

**Projects Worth a Look:** Filters `site.RegularPages` for `Params.featured == true`, sorted by a **new, dedicated** `Params.featuredOrder` field — explicitly *not* Hugo's built-in `weight`, per your standing instruction. No project currently has `featured` set (that selection is still your decision, and I didn't set it on any content file — "do not hardcode project selection"), so **this section correctly renders nothing right now** — I verified this is the real, current, working graceful-empty state, not a stub. Heading text is exactly "Projects Worth a Look" as required (split into `<span class="accent">` for the last word only, matching the site's existing heading pattern — the literal wording is unchanged).

**Final CTA:** Replaces the old embedded contact section entirely. "Hire Me" and "Book a Call" both route to `/contact/`, left-aligned and unstyled beyond existing button classes — no new button/CTA-row CSS was needed. The heading and paragraph reuse the same already-approved "Get in Touch" copy used elsewhere, appropriate here since it's genuinely a contact CTA (unlike the About Preview case above).

## Files modified
- `layouts/index.html`
- `assets/css/main.css` (additive only — one new, isolated CSS block for credibility-figure counters, following the exact same variable-driven, theme-aware pattern as the rest of the file)

## Files added
- `data/credibility.yaml`
- `data/status.yaml`

## Validation performed
- Hugo build: succeeded, 137 pages (unchanged — homepage restructured, no pages added/removed), zero errors, zero `--printPathWarnings` output.
- **Section order confirmed** by scanning the rendered output in document order: Hero → Credibility → Current Status → About Preview → Technology Stack → (Projects Worth a Look, correctly absent — zero featured) → Final CTA.
- **Old contact section fully removed**: zero occurrences of `id="contact"` or the old `.contact-form` div anywhere in the rendered homepage.
- **No duplicate contact form**: exactly one `#contactForm` exists anywhere in the built site, on `/contact/` only.
- **CTA routing verified**: Hero's "Get in Touch" and both Final CTA buttons all resolve to `/contact/`; zero remaining `#contact` references anywhere.
- **Technology marquee**: all 36 `<img>` tags confirmed present, byte-identical markup, unchanged position within its own section.
- **Featured-project mechanism proven functional, not just assumed**: temporarily marked two projects `featured: true` with deliberately reversed `featuredOrder` values (2 and 1), rebuilt, confirmed the section appeared with exactly those two projects in the correct owner-specified order (not date order) and the other two correctly excluded — then fully reverted; **all 4 project content files confirmed checksum-identical to the pre-batch baseline** afterward.
- **Zero-featured graceful handling confirmed** as the real, current, working state — not a hypothetical.
- Accessibility: zero duplicate IDs anywhere on the homepage; skip-link confirmed intact.
- SEO: meta description, title, and CSP all confirmed unchanged.
- Responsive/theme: new sections use only existing, already-responsive, already-theme-aware classes plus one new isolated CSS block built from the same CSS custom properties as everything else — zero hardcoded colors anywhere.
- **Full cross-batch regression sweep**: robots.txt, favicon, all 36 tech-icon dimensions, and cursor-cleanup all reconfirmed clean (Sprint 1); **all three Batch 2.1 Contact-page files and `static/js/main.js` confirmed byte-identical**, untouched by this batch.

## Remaining Sprint 2 work
- **About page** doesn't exist yet — the Homepage's "Read More" link to `/about/` is a forward reference, as explicitly authorized this batch.
- **Featured Projects selection** — still your open decision. The moment you set `featured: true` (and a `featuredOrder`) on your chosen project files, "Projects Worth a Look" will render automatically — no further template work needed.
- **Credibility figures** — the two live-computed ones are already showing (Projects, Blog Posts); any additional verified figures (years of experience, clients served, etc.) just need an entry added to `data/credibility.yaml`.
- Navbar rebuild, Education/Experience/Works/Achievements, Search — all still pending, per this batch's explicit exclusions.

## Recommended next batch (not implemented)
**Batch 2.3 — About page.** It's the one open forward-reference from this batch, it's schema-defined already (CMS §5), and building it closes the loop on the Homepage's "Read More" link without depending on any of your still-open decisions.
