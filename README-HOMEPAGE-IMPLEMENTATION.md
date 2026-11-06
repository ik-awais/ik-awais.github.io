# Homepage Architecture v2 — Implementation Notes

**Scope:** Homepage architecture and content previews. No framework or JavaScript dependency was introduced.

## What changed

- Rebuilt `layouts/index.html` around an expanded homepage with an expandable About panel and compact horizontal previews for Projects, Experience, Education, Certificates, Blog, Articles, Publications, Achievements, and Activities.
- Added `layouts/partials/home-preview-section.html` as the shared renderer for homepage collection previews.
- Added homepage-specific responsive styles to the end of `assets/css/main.css`.
- Updated `data/status.yaml` to show the current Operations Associate role, SES R&D leadership, and current Software Engineering education.
- Added featured-item and thumbnail fields to all content archetypes.
- Re-ranked Experience page `weight` values so the homepage fallback can use the repository's explicit newest-to-oldest chronology. This also keeps the Experience timeline ordering coherent.
- Added the Certificates & Courses section index and list/detail templates under `content/education/certificates/` and `layouts/education/certificates/`.
- Linked Courses & Certificates from the Education navigation dropdown.
- Updated the LinkedIn URL and default SEO description in `hugo.toml`; the navbar now uses the configured LinkedIn URL.
- Updated the Person structured-data job title and footer identity copy.
- Removed a stray single-character `s` from `content/about.md`.
- Replaced the broken `.gitignore` contents with standard Hugo/local exclusions.

## Homepage selection rules

Each homepage collection has a preview limit:

| Collection | Maximum preview items |
|---|---:|
| Projects | 4 |
| Experience | 4 |
| Education | 3 |
| Certificates & Courses | 3 |
| Blog | 3 |
| Articles | 3 |
| Publications | 3 |
| Achievements | 3 |
| Activities | 3 |

Selection logic:

1. Pages with `featured: true` are selected first.
2. Featured pages are ordered by `featuredOrder` ascending.
3. Remaining slots are filled from the newest non-featured pages by Hugo's `Date` field.
4. Experience uses its existing `weight` field for fallback ordering because its human-readable `startDate` values are not uniform machine-readable dates. The weights have been made unique across the Experience entries.
5. If a collection has no published entries, its homepage section displays a compact empty state and retains the collection link.

Featured pages beyond the section limit are not displayed on the homepage, but remain available in their full archive.

## How to feature an item

Add these fields to the front matter of the relevant Markdown file:

```yaml
featured: true
featuredOrder: 1
```

Use unique order values within the same collection. Lower values appear first. Example: `1`, `2`, `3`.

To return an item to automatic selection, set `featured: false` or remove the field. The page will then be eligible for the date-based fallback.

## How to add a thumbnail

Place the image in the relevant static folder, for example:

```text
static/images/projects/lecturelens.webp
static/images/blog/hugo-guide.webp
static/images/certificates/aspire-leaders.webp
```

Then set the page front matter:

```yaml
thumbnail: "/images/projects/lecturelens.webp"
```

The existing shared `card-thumb.html` partial reads `thumbnail` first and `image` as a fallback. It is reused by the existing project/works/timeline cards and the new homepage preview cards. When no image is supplied, the existing deterministic gradient thumbnail remains as the visual fallback.

## About disclosure behaviour

The About preview uses native HTML `<details>` and `<summary>` elements:

- Clicking the row or chevron expands the preview inline.
- The expanded state displays a compact profile summary and current roles.
- The final icon link opens `/about/` for the complete profile.
- It works without JavaScript and supports keyboard interaction.

## Certificates archive

The existing `content/education/certificates/` directory is preserved. A section `_index.md`, plus matching list and single templates, make `/education/certificates/` a navigable archive and give each credential a consistent detail page.

## Files changed

- `.gitignore`
- `README-HOMEPAGE-IMPLEMENTATION.md` (new)
- `archetypes/achievements.md`
- `archetypes/activities.md`
- `archetypes/articles.md`
- `archetypes/blog.md`
- `archetypes/education.md`
- `archetypes/experience.md`
- `archetypes/projects.md`
- `archetypes/publications.md`
- `assets/css/main.css`
- `content/about.md`
- `content/education/certificates/_index.md` (new)
- `content/experience/aigenmat/human-resources-assistant.md`
- `content/experience/aigenmat/managing-director.md`
- `content/experience/aigenmat/operations-associate.md`
- `content/experience/other/codealpha-python-internship.md`
- `content/experience/other/fast-book-club.md`
- `content/experience/other/hayatabad-medical-complex.md`
- `content/experience/other/ieee-professional-writer.md`
- `content/experience/other/pjri-general-member.md`
- `content/experience/other/pjri-hr-membership-intern.md`
- `content/experience/other/pjri-summer-legal-intern.md`
- `content/experience/other/ses-head-rd.md`
- `data/status.yaml`
- `hugo.toml`
- `layouts/_default/baseof.html`
- `layouts/education/certificates/list.html` (new)
- `layouts/education/certificates/single.html` (new)
- `layouts/index.html`
- `layouts/partials/home-preview-section.html` (new)
- `layouts/partials/seo-meta.html`

## Validation status

- Source file and front matter checks completed.
- Changed Go HTML templates pass a syntax parse check.
- Content front matter passes YAML parsing, and `hugo.toml` passes TOML parsing.
- Verified that the homepage collection queries target the existing content sections and that the Certificates route is backed by a new Hugo section index and templates.
- Verified that all current Experience entries have unique weights for chronology fallback.
- Hugo build and browser rendering were **not run in this environment** because the Hugo executable is unavailable here. Run the repository's configured Hugo version locally before deployment:

```bash
hugo --cleanDestinationDir
hugo server -D --disableFastRender
```

Check the homepage at `/`, the Certificates archive at `/education/certificates/`, and one certificate detail page. Test the About disclosure with mouse, keyboard, dark mode, and light mode.

## Deployment workflow

The existing `.github/workflows/deploy.yml` was preserved. No CI/CD workflow replacement was made in this batch.
