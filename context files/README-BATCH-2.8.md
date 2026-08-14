# Batch 2.8 — AI GenMat Dedicated Page

## Mandatory pre-implementation inspection — findings
Full reconciliation: every file from Sprint 1 and 2.1–2.7 confirmed byte-identical. Clean build: 158 pages, zero warnings, before any change.

**Complete grounded-content inventory** (every AI GenMat mention anywhere in the repo was located and reviewed before writing anything): identity + "family-owned AI services company" (About page, the only place this descriptor exists) + Managing Director relationship (stated identically in 4 places) + the footer's "production AI systems, agentic pipelines, applied LLM infrastructure" framing + the same expertise tags used everywhere + contact channel. **Confirmed zero projects or blog posts are attributed to AI GenMat anywhere** — nothing here presents any project as "AI GenMat's work."

**Navigation decision, explained per your instruction:** kept `Experience → AI GenMat` pointing at `/experience/aigenmat/`, unchanged. The Constitution's earlier correction names *both* an "Experience page" (the timeline collection) and a "separate company page" as distinct, coexisting destinations, not alternatives — replacing the nav link would erase that distinction. Instead, added a small, targeted cross-link *from* that collection to the new page.

## Apply these changes
**Add:** `content/aigenmat.md`, `layouts/aigenmat/single.html`.
**Replace:** `layouts/partials/timeline-list.html` (3 added lines only — see exact diff below).
**Not touched:** navbar, footer, CSS, JS, everything else.

## A bug caught and fixed during validation, not before delivery
My first attempt at the cross-link used `{{ if eq .Section "aigenmat" }}` — this is wrong and I caught it via testing, not by assumption: for a *nested* section like `content/experience/aigenmat/`, Hugo's `.Section` resolves to the top-level ancestor ("experience"), not "aigenmat" — a fact I'd actually already empirically proven in Batch 2.6 for the same nested-section family, and should have applied here directly instead of re-assuming `.Section` would behave like it does for the flat Works/Achievements sections. Caught it via the same validation discipline as every batch (checked the link actually appeared before considering it done — it didn't), diagnosed with a temporary debug line, fixed using `.Path` instead (which correctly and uniquely identifies `/experience/aigenmat`), removed the debug line, and re-validated. Final diff below reflects only the corrected version.

## Files added
- `content/aigenmat.md`
- `layouts/aigenmat/single.html`

## Files modified
- `layouts/partials/timeline-list.html` — exact diff:
```
+    {{ if eq .Path "/experience/aigenmat" }}
+    <a href="/aigenmat/" class="btn-ghost">About AI GenMat &rarr;</a>
+    {{ end }}
```

## Page content (grounded only — nothing invented)
- **Hero:** identity label (reused verbatim from Homepage/About) + heading + one bounded overview sentence combining only already-approved facts.
- **Technical Focus:** the same 7 expertise-area chips already shown on the Homepage and About page.
- **Current Areas:** the footer's existing tagline phrase, reused as prose (deliberately distinct source/wording from the chips above, so the two sections aren't just the same list twice).
- **Contact CTA:** the same minimal Hire Me / Book a Call → `/contact/` pattern already used on About and the Homepage Final CTA.

**Zero new CSS** — every class used already existed (`.list-section`, `.list-header`, `.section-title`, `.hero-label`, `.contact-desc`, `.hero-tag`, `.btn-primary`, `.btn-ghost`), confirmed by re-diffing `assets/css/main.css` against Batch 2.5's version afterward — byte-identical.

## Validation report
- Build: succeeded, 158 → 159 pages, zero warnings throughout every rebuild in this batch.
- `/aigenmat/` confirmed rendering all required sections.
- **Experience nav link confirmed unchanged** — still routes to `/experience/aigenmat/`.
- **Cross-link confirmed correctly scoped**: present only on `/experience/aigenmat/`, confirmed absent on all 5 sibling collections (Future Companies, Other Experience, University, College, School) individually.
- **Zero forbidden content confirmed** by direct scan: no mention of founding, employee count, clients, partners, case studies, testimonials, awards, certifications, headquarters, mission/vision statements, or roadmap anywhere on the page.
- SEO: dynamic meta description confirmed sourced from the page's own `summary` field.
- Accessibility: zero duplicate IDs confirmed on both the new page and the Experience/AI GenMat collection; skip-link confirmed present.

## Regression report
Full sweep: `layouts/_default/baseof.html` (nav/footer) confirmed byte-identical to Batch 2.7 — **nothing about navigation or the footer changed in this batch**. `static/js/main.js`, `hugo.toml`, `layouts/index.html`, both Contact page files, both About page files, `works-list.html`, `timeline-single.html`, and `content/achievements/_index.md` all confirmed byte-identical. All Blog and Project content confirmed checksum-unchanged.

## Remaining architecture
- Education's "Courses" (still disabled, no scope assigned to it yet).
- Search — the last nav-adjacent feature never built.
- No content exists yet in any Works, Education, Experience, or Achievements collection — all still correctly empty.

## Recommended next batch
**Search** is now the only remaining piece of the originally-frozen navbar (Home/Education/Experience/Projects/Works/Achievements/Contact/Search/Theme Toggle) that hasn't been built at all. With every content destination now either live or a deliberately-scoped exception, Search is the natural closing piece of the navigation system.
