# Batch — Portrait Favicon, Inertial Pebbles, Archive Drag & Drop, and CI/CD

## Changes

- Removed cursor-following radial color glow and card pointer-follow glow handlers. No custom cursor CSS or JavaScript was introduced; the operating-system cursor remains unchanged.
- Reworked the ambient pebble field to maintain a normalized, frame-rate-independent movement pace. The constellation follows cursor movement through a smoothed pointer anchor and inertial steering, while nodes continue at the same base speed when the pointer is idle or outside the page.
- Replaced the prior in-flow pointer sorting with a floating drag ghost and a live placeholder. The card follows the pointer; the other cards reflow around the placeholder; the actual order is committed only on pointer release. Pointer cancellation restores the original position.
- Kept keyboard reordering via the drag grip and retained per-browser order persistence / homepage synchronization. `?edit-order=1` still exposes the shared Markdown weight export.
- Changed the navbar and footer brand text from `MA.` to `Muhammad Awais`; updated the Hugo site title and browser title suffix to use the same name. The desktop navbar switches to its responsive menu at 1180px so the full wordmark does not collide with navigation links.
- Generated favicon assets from the supplied transparent portrait: ICO, 16px/32px PNG, 512px PNG, and 180px Apple touch icon. The original portrait is preserved at `static/images/branding/muhammad-awais.png`.
- Updated GitHub Pages actions to Node 24-compatible major versions: checkout v7.0.1, configure-pages v6.0.0, upload-pages-artifact v5.0.0, and deploy-pages v5.0.1. Added checks for the expected Hugo routes, profile/favicons, JavaScript/vendor assets, and fingerprinted CSS before upload. The checkout step does not persist a repository write credential because this workflow only builds and deploys. Hugo remains pinned to 0.154.5 Extended.

## Important behavior

A static GitHub Pages site cannot accept anonymous public writes to Git content. Drag ordering remains visitor-local in `localStorage`, and the homepage reads the same order on that browser. To publish a default order for everyone, use the Markdown weight export and commit the changes.

## Validation

- JavaScript syntax: validated with Node.js.
- CSS parsing: validated with `tinycss2`.
- Workflow YAML syntax: validated. The action refs are pinned to the current release tags verified on GitHub.
- Favicon files: generated and dimensions checked.
- ZIP integrity: checked.
- Public GitHub Actions history: the latest available run before this change was run #101, commit `c311017`, and completed successfully, but emitted Node.js 20 deprecation warnings for first-party actions. This batch upgrades those action versions.
- Full Hugo build: not run in this environment because the Hugo binary is unavailable. Push this batch to `main` to verify the updated hosted workflow end to end.

## Files changed

- `assets/css/main.css`
- `static/js/main.js`
- `layouts/_default/baseof.html`
- `hugo.toml`
- `.github/workflows/deploy.yml`
- `static/favicon.ico`
- `static/favicon-16x16.png`
- `static/favicon-32x32.png`
- `static/favicon-512.png`
- `static/apple-touch-icon.png`
- `static/images/branding/muhammad-awais.png`
- `README-BATCH-PORTRAIT-CURSOR-DRAG-CICD.md`
- `DELETE-FILES.txt` (removal instruction for an older `static/favicon.svg`)
- Deleted obsolete `static/favicon.svg`
