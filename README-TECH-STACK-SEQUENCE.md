# Homepage Tech Stack Sequence Adjustment

## Change
Moved the existing technology marquee section so it renders immediately after the expandable About Me card and before the homepage's collection previews (Projects, Experience, Education, Certificates, Blog, Articles, Publications, Achievements, and Activities).

## File changed
- `layouts/index.html`

## Intentionally unchanged
- Tech stack markup, icons, image URLs, and animation structure
- About card content and behavior
- Homepage preview sections and their ordering
- Navbar, pagination, stylesheets, scripts, content files, and Hugo configuration

## Apply
From the repository root, extract the changed-files ZIP and allow it to overwrite `layouts/index.html`, or replace that file with the supplied standalone copy.

## Validation
Static source checks confirmed that the tech stack section occurs exactly once and appears after the About section and before the Projects preview. A full Hugo build was not run in this environment.
