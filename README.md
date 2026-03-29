# Muhammad Awais — Portfolio Website

A modern, high-performance personal portfolio and blog built from scratch with Hugo, featuring a custom dark/light theme, working contact form, blog with sticky Table of Contents, and automated CI/CD deployment via GitHub Actions.

**Live Site:** [https://ik-awais.github.io](https://ik-awais.github.io)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Design System](#design-system)
- [Development Journey](#development-journey)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Content Management](#content-management)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Overview

This portfolio started as a single static HTML file and evolved into a full Hugo-based site with blog support, custom theming, animated UI elements, and production-grade form handling. The entire design, architecture, and codebase were built iteratively — solving real problems at each stage including broken contact forms, CSS conflicts, Hugo template rendering issues, and deployment pipeline configuration.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Static Site Generator** | [Hugo](https://gohugo.io/) v0.154.5 (extended) |
| **Markup** | HTML5, Hugo Templating (Go templates) |
| **Styling** | Custom CSS3 with CSS Variables (dark/light theme) |
| **Typography** | [Syne](https://fonts.google.com/specimen/Syne) (display) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (body/code) |
| **JavaScript** | Vanilla JS — no frameworks, no dependencies |
| **Contact Form** | [Formspree](https://formspree.io/) (free tier, AJAX via FormData) |
| **Icons** | [Devicon](https://devicon.dev/) CDN for tech stack logos |
| **Deployment** | GitHub Pages via GitHub Actions |
| **Version Control** | Git + GitHub |
| **CI/CD** | GitHub Actions workflow (auto-build + deploy on push) |
| **OS / Dev Environment** | Ubuntu 24.04 LTS, VS Code |

---

## Project Structure

```
portfolio/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions CI/CD pipeline
├── archetypes/
│   └── default.md              ← Hugo default content template
├── content/
│   ├── blog/
│   │   └── hypervisors-kvm-qemu-complete-guide.md
│   └── projects/
│       ├── ai-research-agent.md
│       └── document-qa-system.md
├── layouts/
│   ├── _default/
│   │   ├── baseof.html         ← Base template (nav, footer, head, scripts)
│   │   ├── list.html           ← List pages (/projects/, /blog/)
│   │   └── single.html         ← Individual post/project pages + sticky ToC
│   └── index.html              ← Homepage template
├── static/
│   ├── css/
│   │   └── main.css            ← All styles (dark/light theme, responsive)
│   ├── js/
│   │   └── main.js             ← Cursor, animations, form handling, theme toggle
│   ├── _headers                ← CSP security headers
│   └── favicon.ico
└── hugo.toml                   ← Site configuration
```

### Template Hierarchy

```
baseof.html  (nav + footer + head + scripts)
├── index.html    → Homepage (hero, stats, tech stack, projects, contact)
├── list.html     → /projects/ and /blog/ archive pages
└── single.html   → Individual project detail or blog post + sticky ToC
```

Hugo renders Markdown content files through these layout templates at build time, producing a fully static `public/` directory that gets deployed.

---

## Features

### Homepage
- **Hero section** with animated orbital rings and floating center dot
- **Scrolling tech stack** — dual-row infinite scroll with hover scale effect (Devicon CDN)
- **Animated stat counters** — count up on scroll with IntersectionObserver
- **Featured project cards** — pulled dynamically from `content/projects/` via Hugo's `range` function
- **Working contact form** — Formspree integration via AJAX (FormData), with full validation

### Dark / Light Theme
- **Toggle button** in navbar (☽ / ☀ icons)
- **CSS Variables** swap the entire palette — no duplicate stylesheets
- **LocalStorage persistence** — theme choice survives page reloads and navigation
- Dark: `#060610` background, `#7c3aed` accent, `#e0e0ec` text
- Light: `#f0f2f5` background (cool grey, GitHub-style), `#7c3aed` accent, `#111827` text
- All elements adapt: cards, nav, code blocks, form inputs, borders, footer

### Custom Cursor
- Small dot follows mouse position instantly
- Larger ring follows with spring-lag animation (`0.12` lerp factor)
- **Magnetic hover effect** on interactive elements (buttons, links, cards)
- **Automatically hidden on touch devices** via `(hover: none)` and `(pointer: coarse)` media queries

### Blog
- **Hugo-native Table of Contents** — auto-generated from `## h2` and `### h3` headings at build time via `{{ .TableOfContents }}`
- **Sticky ToC sidebar** — fixed on the right side, scrolls with the reader
- **Active section highlighting** — JS IntersectionObserver tracks which heading is in view and highlights the corresponding ToC link
- **Responsive** — ToC hides on screens < 1024px
- **Prose styling** — `h2` with bottom borders, `h3` in accent color, code blocks with dark background in both themes, styled blockquotes with left accent border

### Contact Form Security
- **Deep email validation** — RFC 5321 format checking, blocks consecutive dots, validates TLD length (2–12 chars), requires real domain segments
- **Disposable email blocking** — rejects 50+ known throwaway services (Mailinator, Guerrilla Mail, YOPmail, TrashMail, etc.)
- **Honeypot field** — hidden input invisible to real users (`position: absolute`, zero size, `pointer-events: none`), catches bots that auto-fill all fields
- **Client-side rate limiting** — max 3 submissions per session, minimum 60 seconds between sends
- **Form UX** — inputs clear after successful send, button shows "✓ Sent" in green, resets after 4 seconds

### Responsive Design
- **3 breakpoints**: 1024px (hide ToC), 768px (mobile layout), 400px (very small phones)
- Mobile: single column, compressed padding, full-width buttons
- Nav collapses appropriately per breakpoint

### Navigation
- **Scroll-aware navbar** — background becomes solid on scroll via `scrollY > 50` detection
- **LinkedIn button** — links to LinkedIn profile
- **Hire Me button** — links to Upwork freelancer profile
- **Theme toggle** integrated into nav

---

## Design System

### Color Palette

| Token | Dark Mode | Light Mode |
|---|---|---|
| `--bg` | `#060610` | `#f0f2f5` |
| `--card` | `#0f0f22` | `#ffffff` |
| `--border` | `#1e1e38` | `#c8cdd6` |
| `--text` | `#e8e8f0` | `#111827` |
| `--text-secondary` | `#b0b0c8` | `#374151` |
| `--accent` | `#00d4ff` | `#0070a8` |
| `--accent2` | `#7c3aed` | `#5b21b6` |
| `--accent3` | `#06bb7a` | `#065f46` |

### Typography

| Usage | Font | Weights |
|---|---|---|
| Headings / Display | Syne | 400, 700, 800 |
| Body / Code / UI | JetBrains Mono | 300, 400, 500 |

### Animations

| Animation | Technique |
|---|---|
| Scroll reveal | IntersectionObserver + CSS `opacity` / `translateY` transition |
| Stat counters | JS counter incrementing on scroll intersection |
| Tech stack scroll | CSS `@keyframes` infinite `translateX` (forward + reverse rows) |
| Cursor ring | `requestAnimationFrame` lerp loop |
| Hero orbital rings | CSS `@keyframes rotate` with staggered delays |
| Theme transition | CSS `transition: background 0.4s, color 0.4s` on `body` |

---

## Development Journey

This project went through significant iteration. Key technical problems solved along the way:

1. **Migrated from raw HTML to Hugo** — the original site was a single `index.html` with no source structure. Rebuilt with proper Hugo content/layout separation to support a blog.

2. **Fixed Hugo template directory** — `layouts/default/` → `layouts/_default/` (missing underscore caused Hugo to not find any templates).

3. **Resolved CSS/JS not loading** — `baseURL` in `hugo.toml` was set to a placeholder production URL, causing asset paths to resolve incorrectly in local dev. Fixed by setting `baseURL = "/"`.

4. **Blog content invisibility bug** — `.single-body` had the `.reveal` CSS class which sets `opacity: 0` by default. The IntersectionObserver was supposed to add `.visible` to trigger `opacity: 1`, but on blog pages the content was already in the viewport on load, so the observer sometimes missed the trigger. Fix: removed `.reveal` from `.single-body` entirely and added `opacity: 1 !important` as a hard guarantee.

5. **Table of Contents — JS approach failed** — initial implementation used `DOMContentLoaded` + `querySelectorAll('h2, h3')` to build the ToC dynamically. Failed because `DOMContentLoaded` had already fired by the time the inline `<script>` registered its listener (since `main.js` loads first via `baseof.html`). Solution: switched to Hugo's built-in `{{ .TableOfContents }}` which generates the ToC as HTML at build time — zero JS DOM scraping needed.

6. **Formspree reCAPTCHA conflict** — enabling reCAPTCHA on Formspree blocked all AJAX submissions (both `application/json` and `multipart/form-data`) on the free plan. Resolution: disabled Formspree reCAPTCHA and relied on the custom-built honeypot + email validation + rate limiting stack instead.

7. **Formspree environment variable injection** — attempted to pass the Formspree ID via GitHub Secrets → `HUGO_PARAMS_FORMSPREEEID` env var at build time. Hugo's case-sensitive param mapping caused a mismatch. Since Formspree IDs are public (visible in page source HTML anyway), the ID is stored directly in `hugo.toml`.

8. **GitHub Pages deployment branch protection** — GitHub Actions failed to deploy because the `portfolio` branch wasn't authorized in the `github-pages` environment protection rules. Fixed by adding `portfolio` as an allowed deployment branch in repo Settings → Environments → github-pages.

9. **Light theme readability** — initial light mode used `#f5f5ef` (warm off-white) with opacity-based text dimming. Text was washed out and muddy. Rebuilt to a cool grey `#f0f2f5` palette with explicit color values (no opacity hacks), matching GitHub/VS Code light theme conventions.

10. **Word count displayed instead of dates** — homepage project cards used `{{ printf "%02d" .WordCount }}` which showed "70" and "69" instead of meaningful info. Replaced with `{{ .Date.Format "Jan 2006" }}`.

---

## Local Development

### Prerequisites

- [Hugo Extended](https://gohugo.io/installation/) v0.100+ (v0.154.5 used in production)
- Git

### Install & Run

```bash
git clone https://github.com/ik-awais/ik-awais.github.io.git
cd ik-awais.github.io
git checkout portfolio
hugo server -D
```

Site will be available at `http://localhost:1313/`

### Build for Production

```bash
hugo --minify
```

Output goes to `public/` — this is what gets deployed.

---

## Deployment

Deployment is fully automated via GitHub Actions.

### How It Works

1. Push to the `portfolio` branch
2. GitHub Actions triggers `.github/workflows/deploy.yml`
3. Workflow installs Hugo v0.154.5 extended, runs `hugo --minify`
4. Uploads `public/` as a GitHub Pages artifact
5. Deploys to GitHub Pages
6. Live at [https://ik-awais.github.io/](https://ik-awais.github.io/) within ~90 seconds

### Configuration Required

- GitHub repo **Settings → Pages → Source**: set to `GitHub Actions`
- GitHub repo **Settings → Environments → github-pages**: add `portfolio` branch to allowed deployment branches
- **Formspree**: sign up at [formspree.io](https://formspree.io), create a form, put the form ID in `hugo.toml` under `formspreeID`

---

## Content Management

### Adding a Blog Post

```bash
hugo new blog/my-post-title.md
```

Edit the file in `content/blog/`. Frontmatter template:

```yaml
---
title: "Your Post Title"
date: 2025-03-17
tags: ["Tag1", "Tag2", "Tag3"]
summary: "Brief description shown on the blog list page."
draft: false
---

Your Markdown content here. Use ## and ### headings — they
automatically appear in the sticky Table of Contents sidebar.
```

### Adding a Project

Create a new `.md` file in `content/projects/`:

```yaml
---
title: "Project Name"
date: 2025-01-01
tags: ["Tech1", "Tech2"]
github: "https://github.com/ik-awais/repo-name"
demo: "https://live-demo-url.com"
summary: "One-line project description."
status: "in-progress"
---

Detailed project description in Markdown.
```

### Updating Navigation Links

Edit `layouts/_default/baseof.html` — the nav links, LinkedIn URL, and Upwork URL are all hardcoded there.

### Updating Site Metadata

Edit `hugo.toml` — author name, email, GitHub URL, LinkedIn URL, Formspree ID, and base URL.

---

## Security

| Layer | Implementation |
|---|---|
| Email validation | RFC 5321 format, TLD check, domain segment validation |
| Disposable email blocking | 50+ providers blacklisted (Mailinator, YOPmail, etc.) |
| Bot honeypot | Hidden form field, invisible to humans, caught by auto-fill bots |
| Rate limiting | 3 submissions/session, 60s cooldown between sends |
| CSP headers | `static/_headers` with Content-Security-Policy, X-Frame-Options, X-Content-Type-Options |
| Source protection | Static site — no server, no database, no attack surface. Secured via GitHub 2FA + branch protection |

> **Note:** GitHub Pages does not natively apply `_headers` files (that's a Netlify/Cloudflare Pages feature). The file is included for portability — if the site moves to Netlify or Cloudflare Pages, headers activate automatically.

---

## Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| CSS/JS not loading locally | `baseURL` in `hugo.toml` set to production URL | Set `baseURL = "/"` |
| Blog content invisible | `.reveal` class on `.single-body` sets `opacity: 0` | Remove `.reveal` from content wrapper |
| ToC sidebar empty | JS ran before DOM ready | Use Hugo's native `{{ .TableOfContents }}` |
| Formspree form rejected | reCAPTCHA enabled on free plan blocks AJAX | Disable reCAPTCHA on Formspree dashboard |
| Deploy fails on GitHub Actions | Branch not allowed in environment protection rules | Add branch in Settings → Environments → github-pages |
| Old content still showing after push | GitHub Pages cache | `git commit --allow-empty -m "force rebuild" && git push` |
| Theme toggle not persisting | localStorage key mismatch | Check `main.js` uses `theme` as the key |

---

<div align="center">

Built with Hugo · Styled from scratch · Deployed on GitHub Pages

[Live Site](https://ik-awais.github.io) · [GitHub](https://github.com/ik-awais) · [LinkedIn](https://www.linkedin.com/in/muhammad-awais-ai-engineer/) · [Upwork](https://www.upwork.com/freelancers/~018a2d0e2f88ac4838)

</div>
