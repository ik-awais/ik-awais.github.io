# Batch 1.2 — Meta-Tag CSP (TAS §34, approved decision)

## Apply these changes
1. Replace `layouts/_default/baseof.html` with the file here.
2. Delete `static/_headers` from your repo — GitHub Pages does not serve custom header files at all (confirmed platform behavior), so it was giving a false impression of protection (PAAR SEC-01, High severity). The meta-tag CSP below is the real, enforced mechanism.

## What changed
Added two `<meta>` tags as early as possible in `<head>` (right after charset):
- `Content-Security-Policy` — ported directly from the old `_headers` file's policy string, with **one deliberate omission: `frame-ancestors`**. This directive is not supported via `<meta>` under the CSP spec (only via HTTP header) — browsers silently ignore it there. This is not a new gap; it falls under the same "header-only directive, accepted GitHub Pages limitation" category TAS §34 already settled for `X-Frame-Options`/HSTS.
- `referrer` meta — the one other `_headers` directive (`Referrer-Policy`) that *does* have a meta equivalent, so it's preserved.

**Note on the rest of the old `_headers` file** (`X-Frame-Options`, `X-Content-Type-Options`, `Permissions-Policy`, `X-XSS-Protection`): none of these have a `<meta>` equivalent — they are HTTP-header-only by spec, not a `<meta>` limitation specific to this implementation. This confirms and extends (doesn't contradict) TAS §34's already-accepted "header-only directives are an inherent GitHub Pages static-hosting limitation" — the affected set is larger than the two examples TAS named, but the governing principle already covers it. Flagging for your records, not blocking.

`'unsafe-inline'` was preserved for `script-src` and `style-src`, matching the original policy exactly — the site still has 2 inline `onclick` handlers (`baseof.html` theme toggle, `layouts/index.html` contact submit button) and 2 templates with inline `<script>` blocks (TOC logic in `_default/single.html` and `projects/single.html`). Removing `unsafe-inline` would require refactoring those to external listeners/nonces — out of scope for this batch per "do not redesign unrelated templates."

## Validation performed
- Hugo Extended 0.154.5 build: succeeded, 135 pages, no errors (identical page count to Batch 1 — nothing broken by removing `_headers`).
- Every external domain referenced anywhere in `layouts/` (`fonts.googleapis.com`, `fonts.gstatic.com`, `cdn.jsdelivr.net`, `upload.wikimedia.org`, `formspree.io`) cross-checked against the CSP allowlist — all covered under the correct directive. (`aigenmat.com`, `linkedin.com`, `upwork.com` are plain `<a href>` navigation links, not governed by these fetch directives — no CSP entry needed.)
- Spot-checked rendered output on Homepage, Projects list, a Project detail page, and a Blog post — CSP + referrer meta present and identical on all four.
- Confirmed no dangling reference to `_headers` anywhere in `layouts/` or `hugo.toml` after deletion.
