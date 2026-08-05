# Batch 2.1 — Dedicated Contact Page Architecture

## Apply these changes
1. Add `content/contact.md`
2. Add `layouts/contact/single.html`
3. Add `layouts/partials/contact-form.html`
4. Replace `static/js/main.js` with the file here — **only an addition** (a new block appended after the existing "Enter key" section). Nothing before that point was touched.

## What was built
`/contact/` — a real Hugo page (`type: "contact"` → `layouts/contact/single.html`) with:
- Hero/intro reusing the exact already-approved copy from the homepage's contact description (no invented claims), rendered via the page's front-matter `summary`.
- All 5 required channels: personal email, work email, LinkedIn, GitHub, Upwork.
- A real `<form>` (semantic HTML, unlike the homepage's div-based version) with all 8 required fields: Purpose (select: Hire Me / Book a Call / Other — classification only, no Calendly/automation), Name, Occupation, Email, Subject, Message required; Company, Phone optional.

**Zero new CSS.** Every class used (`.contact-grid`, `.contact-left`, `.contact-links`, `.contact-link`, `.form-group`, `.form-input`, `.form-status`, `.list-section`, `.list-header`) already existed and is already theme-aware — confirmed no inline colors or new styles were introduced.

**Formspree:** the form's `action` attribute is templated directly from `site.Params.formspreeID` (already in `hugo.toml`), and posts via the identical `FormData` + `fetch` + `Accept: application/json` pattern the homepage form already uses — same integration, same reCAPTCHA-compatible approach. It's also a genuine progressive-enhancement improvement: as a real `<form>` with `action`/`method`, it still works via native POST if JavaScript fails, unlike the homepage's div-based version which requires JS to function at all.

**JavaScript — additive only:** `sendForm()` (the homepage's 3-field handler) was not touched, not read, not called. The new form gets its own self-contained, guarded handler that no-ops immediately (`if (!form) return;`) on every page that doesn't have `#contactForm` — meaning every other page on the site, including the homepage, loads and executes exactly as before. It reuses the two genuinely shared, already-standalone helpers (`validateEmail()`, `checkRateLimit()`) rather than duplicating that logic.

**Why a partial, not inline HTML:** so that when the homepage's contact section is migrated in Batch 2.2, there's already one canonical form to point to instead of a second copy being created and then needing to be reconciled.

## Files modified
- `static/js/main.js` — additive only (new handler appended)

## Files added
- `content/contact.md`
- `layouts/contact/single.html`
- `layouts/partials/contact-form.html`

## Validation performed
- Hugo build: succeeded, 137 pages (136 + the new Contact page), zero errors, zero `--printPathWarnings` output.
- **Homepage template (`layouts/index.html`) confirmed byte-for-byte untouched** — checksum identical before and after this batch.
- Homepage's build output confirmed to still contain its original 3-field form (`f-name`, `f-email`, `f-message`, `submitBtn`, `formStatus`) exactly as before.
- **My JS edit used an exact-match `str_replace`,** which mechanically guarantees everything before the insertion point — including the entirety of `sendForm()` — is unmodified; only new code was appended after it.
- Confirmed exactly one `#contactForm` and one usage of the `contact-form.html` partial exist in the entire codebase — no duplicate contact-form implementation. The homepage's own (untouched, different) `.contact-form` div still exists separately, as required.
- All 8 form fields present and verified individually: the 6 required fields (Purpose, Name, Occupation, Email, Subject, Message) carry `required`; the 2 optional fields (Company, Phone) do not.
- Formspree `action` resolved correctly to `https://formspree.io/f/xvzwzlre`.
- All 5 contact channels confirmed present and correctly linked.
- Accessibility: skip-link present; zero duplicate IDs anywhere on the page; every `<label for>` verified to point to an existing field ID; accessible `aria-live="polite"` status region for submit feedback.
- SEO: meta description correctly and automatically sourced from the page's `summary` front matter, via Batch 1.4's existing dynamic-description system — no extra template work needed, confirming that system's extensibility as designed.
- Responsive: `.contact-grid` class present, inheriting the already-existing mobile breakpoint (collapses to one column under 768px).
- Theme: zero inline colors or new CSS introduced — fully inherits dark/light theme via existing CSS custom properties.
- No regressions found anywhere in Sprint 1 deliverables.

## Remaining Sprint 2 work
- **Batch 2.2** — Homepage restructure to the 7-section model (Credibility figures, About teaser, Education preview, Final CTA), retire the homepage's duplicate contact section/form now that `/contact/` exists, and apply the Projects `featured` filter. Blocked on your Featured Projects selection and credibility-figures content decisions.
- **Batch 2.3** — Navigation rebuild to the full 7-item dropdown structure (deferred until Education/Experience/Works/Achievements pages exist to link to).
- Sprints 4–7 — Education, Experience, Works expansion, Achievements (each blocked on their field-schema definition, per your Sprint 0 removal instruction: "derive the required content model, document it, implement it" — I'll do that at the start of each respective batch).

## Recommended next batch (not implemented)
**Batch 2.2 — Homepage restructure**, but only the parts that don't depend on your open decisions: retiring the homepage's duplicate contact section (now redundant — pure risk reduction, zero new content needed) and wiring the Projects section's `featured` filter mechanism (the *mechanism*, not which projects are featured — that still needs your selection). The Credibility-figures and About-teaser sections would follow once those inputs are available.
