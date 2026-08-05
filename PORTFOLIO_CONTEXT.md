# Muhammad Awais — Portfolio Complete Reference
> Full context for any AI assistant to continue work on this portfolio without starting from scratch.
> Last updated: June 2026

---

## 1. Personal Info

| Field | Value |
|-------|-------|
| Name | Muhammad Awais |
| Role | AI Engineer & Developer |
| Location | Pakistan |
| Email | mawaisqq@gmail.com |
| GitHub | https://github.com/ik-awais |
| LinkedIn | https://www.linkedin.com/in/muhammad-awais-ai-engineer/ |
| Instagram | https://instagram.com/ik_.awais |
| Codeforces | https://codeforces.com/profile/ik._awais |
| Upwork | https://www.upwork.com/freelancers/~018a2d0e2f88ac4838 |
| Portfolio URL | https://ik-awais.github.io |

---

## 2. Portfolio Tech Stack

| Layer | Tool |
|-------|------|
| Static Site Generator | Hugo v0.154.5 extended |
| Templating | Hugo (Go templates) |
| Styling | Vanilla CSS (custom, no framework) |
| Scripting | Vanilla JavaScript (no framework) |
| Fonts | Space Grotesk 500/600/700 (headings/footer/logo), Inter 400/500/600 (body/UI), JetBrains Mono 400/500 (mono/code/footer) via Google Fonts |
| Form Backend | Formspree (FormData POST, reCAPTCHA disabled) |
| Deployment | GitHub Pages via GitHub Actions |
| Source Repo | https://github.com/ik-awais/ik-awais.github.io (branch: portfolio) |
| Profile README Repo | https://github.com/ik-awais/ik-awais |

---

## 2.1 Complete Technology Inventory

### Frontend Technologies
- **HTML5** - Markup structure
- **CSS3** - Styling with custom properties (variables)
- **Vanilla JavaScript** - No frameworks, no dependencies
- **CSS Grid & Flexbox** - Layout systems
- **CSS Animations** - Keyframe animations for hero rings, scrolling tech stack
- **CSS Custom Properties** - Dark/light theme implementation
- **Intersection Observer API** - Scroll reveal animations, counter animations
- **LocalStorage API** - Theme persistence
- **FormData API** - Contact form submission
- **Fetch API** - AJAX requests to Formspree

### Typography & Icons
- **Syne** (Google Fonts) - Display/headings font (weights: 400, 700, 800)
- **JetBrains Mono** (Google Fonts) - Body/code font (weights: 300, 400, 500)
- **Devicon CDN** - Technology stack icons (https://cdn.jsdelivr.net/gh/devicons/devicon/icons/)

### Backend & Services
- **Formspree** - Contact form backend (ID: xvzwzlre)
- **GitHub Actions** - CI/CD automation
- **GitHub Pages** - Static hosting
- **Git** - Version control

### Development Tools
- **Hugo Extended v0.154.5** - Static site generator
- **Go Templates** - Hugo templating language
- **Markdown** - Content authoring
- **VS Code** - Development environment (mentioned in README)

### Security
- **Content Security Policy (CSP)** - Via static/_headers
- **X-Frame-Options: DENY** - Clickjacking protection
- **X-Content-Type-Options: nosniff** - MIME type sniffing protection
- **Referrer-Policy: strict-origin-when-cross-origin** - Referrer control
- **Permissions-Policy** - Camera, microphone, geolocation disabled
- **X-XSS-Protection: 1; mode=block** - XSS protection

### Technologies Mentioned in Content

**From Blog Posts:**
- **KVM/QEMU** - Virtualization (hypervisors-kvm-qemu-complete-guide.md)
- **libvirt** - Virtualization API
- **virt-manager** - GUI for KVM/QEMU
- **OVMF** - UEFI firmware for VMs
- **VirtIO** - Paravirtualization standard
- **Ubuntu 24.04 LTS** - Linux distribution
- **Windows 11** - Guest OS
- **Kali Linux** - Penetration testing OS
- **Parrot OS** - Security OS
- **Docker** - Containerization (tech-survival-guide-2026.md)
- **Python** - Programming language
- **Bash** - Shell scripting
- **Git/GitHub** - Version control
- **AWS/Cloud** - Cloud computing
- **Networking concepts** - DNS, HTTP/HTTPS, IP addresses, ports
- **Security concepts** - SSH keys, file permissions, backups
- **APIs** - REST APIs, authentication
- **AI/LLM** - Large language models, prompt engineering

**From Projects:**
- **LangChain** - LLM framework (ai-research-agent.md, document-qa-system.md)
- **FAISS** - Vector similarity search (document-qa-system.md)
- **Streamlit** - Python web app framework (ai-research-agent.md, document-qa-system.md)
- **OpenAI** - AI API (mentioned in context)
- **FastAPI** - Python web framework (mediscan-ai.md)
- **PyTorch** - Deep learning framework (mediscan-ai.md)
- **Hugging Face** - ML models/datasets (mediscan-ai.md)
- **OpenCV** - Computer vision library (mediscan-ai.md)
- **Scikit-learn** - Machine learning library (mediscan-ai.md)
- **NLTK** - Natural language toolkit (mediscan-ai.md)
- **LLaMA 3.1** - Meta's LLM (mediscan-ai.md)
- **NVIDIA API** - GPU/cloud API (mediscan-ai.md)
- **ResNet-18** - CNN architecture (mediscan-ai.md)
- **Vision Transformer (ViT)** - Transformer for vision (mediscan-ai.md)
- **IsolationForest** - Anomaly detection algorithm (mediscan-ai.md)

### Tech Stack Icons Displayed on Homepage
**Row 1 (scrolling left):**
- Python, TensorFlow, PyTorch, OpenCV, Pandas, JavaScript, C, C++

**Row 2 (scrolling right):**
- Docker, React, Django, Flask, MongoDB, MySQL, Git, Linux, AWS, Azure

---

## 2.2 CSS Implementation Details (static/css/main.css)

**File size:** 1600+ lines
**Architecture:** Single-file CSS with CSS custom properties for theming

**Key CSS Sections:**
1. **CSS Variables (lines 4-42)** - Dark mode (default) and light mode color palettes
2. **Reset & Base (lines 47-57)** - Box-sizing, scroll behavior, cursor hiding
3. **Custom Cursor (lines 62-90)** - Desktop-only cursor with touch device detection
4. **Background Overlays (lines 95-114)** - Noise texture and grid pattern
5. **Navigation (lines 119-176)** - Fixed navbar, scroll detection, theme toggle
6. **Hero Section (lines 180-287)** - Animated orbital rings, typography, CTA buttons
7. **Stats Bar (lines 292-305)** - Counter display styling
8. **Tech Stack Scroll (lines 310-342)** - Infinite scrolling animation
9. **Projects Section (lines 347-404)** - Card grid, hover effects, tags
10. **Contact Section (lines 409-469)** - Form styling, validation feedback
11. **Footer (lines 474-483)** - Simple footer with links
12. **Scroll Reveal (lines 488-489)** - Animation classes
13. **List Page (lines 494-495)** - Archive page styling
14. **Single Page Layout (lines 500-715)** - Article + ToC sidebar, blog prose styling
15. **Keyframes (lines 720-727)** - Animation definitions
16. **Responsive (lines 732-829)** - 3 breakpoints (1024px, 768px, 400px)
17. **Hugo Native ToC Structure (lines 750-807)** - ToC link styling
18. **Honeypot (lines 832-840)** - Hidden bot trap field

**CSS Animation Details:**
- `fadeUp` - Hero content entrance (0.8s with staggered delays)
- `fadeIn` - Hero visual fade-in (1.5s)
- `rotate` - Orbital rings rotation (15s, 20s, 30s with reverse directions)
- `scrollLeft` - Tech stack row 1 (40s linear infinite)
- `scrollRight` - Tech stack row 2 (35s linear infinite)

**Special CSS Techniques:**
- `-webkit-text-stroke` for outline text effect on "Awais."
- `mix-blend-mode: screen` (dark) / `multiply` (light) for cursor
- `backdrop-filter: blur(20px)` for scrolled navbar
- SVG data URI for noise texture background
- Linear gradient for grid pattern background
- CSS Grid with `minmax(320px, 1fr)` for responsive project cards

---

## 2.3 JavaScript Implementation Details (static/js/main.js)

**File size:** 520+ lines
**Architecture:** Vanilla JavaScript with modular functions

**Key JavaScript Functions:**

1. **Theme Toggle (lines 1-10)**
   - Reads from localStorage on load
   - Toggles `data-theme` attribute on `<html>`
   - Persists choice to localStorage

2. **Custom Cursor (lines 12-47)**
   - Touch device detection via media query
   - Dot follows mouse instantly
   - Ring follows with 0.12 lerp factor (spring animation)
   - Magnetic hover effect on interactive elements
   - `requestAnimationFrame` for smooth animation loop

3. **Navbar Scroll (lines 49-53)**
   - Adds `.scrolled` class after 50px scroll
   - Triggers background blur and border appearance

4. **Scroll Reveal (lines 55-59)**
   - IntersectionObserver with 0.12 threshold
   - Adds `.visible` class to `.reveal` elements

5. **Counter Animation (lines 61-82)**
   - IntersectionObserver on stats bar
   - Animates from 0 to target value
   - 30 steps over 40ms intervals
   - Prevents re-running with `countersRan` flag

6. **Email Validation (lines 84-139)**
   - RFC 5321 format checking
   - TLD length validation (2-12 chars)
   - Domain segment validation
   - Consecutive dots detection
   - Local part character validation
   - 50+ disposable email domains blocked

7. **Rate Limiting (lines 141-156)**
   - Max 3 submissions per session
   - 60 second cooldown between sends
   - Tracks `lastSubmitTime` and `submitAttempts`

8. **Contact Form (lines 158-283)**
   - Honeypot field check (silent discard)
   - Field validation (name, email, message)
   - Email validation with detailed error messages
   - Rate limit checking
   - FormData POST to Formspree
   - Success/error feedback
   - Button state management
   - Form clearing after success
   - 5-second button reset after success

9. **Enter Key Handler (lines 285-293)**
   - Allows Enter key to submit form from name/email fields

**Blocked Email Domains (50+):**
mailinator.com, guerrillamail.com, tempmail.com, throwam.com, sharklasers.com, guerrillamailblock.com, grr.la, guerrillamail.info, spam4.me, trashmail.com, trashmail.me, trashmail.net, trashmail.at, trashmail.io, yopmail.com, yopmail.fr, cool.fr.nf, jetable.fr.nf, nospam.ze.tc, nomail.xl.cx, mega.zik.dj, speed.1s.fr, courriel.fr.nf, moncourrier.fr.nf, monemail.fr.nf, monmail.fr.nf, dispostable.com, mailnull.com, maildrop.cc, discard.email, spamgourmet.com, spamgourmet.net, spamgourmet.org, spamspot.com, spamthis.co.uk, tempinbox.com, filzmail.com, getairmail.com, fakeinbox.com, mailnesia.com, spamfree24.org, spamfree24.de, spamfree24.eu, spamfree24.info, spamfree24.net, spamfree.eu, spamhole.com, spaml.com, tempail.com, tempemail.net, tempr.email, tempomail.fr, temporarily.de, thanksnospam.info, trbvm.com, trashdevil.com, trashdevil.de

---

## 2.4 Layout Templates

### baseof.html (layouts/_default/baseof.html)
**Purpose:** Base template for all pages
**Lines:** 47

**Structure:**
- `<head>`: Meta tags, title, Google Fonts (Syne + JetBrains Mono), CSS link
- `<body>`: Custom cursor elements, navbar, main content block, footer, script tag
- **Navbar:** Logo (MA.), Projects, Blog, Contact, GitHub, LinkedIn, theme toggle, Hire Me button
- **Footer:** Copyright, GitHub, LinkedIn, Email links
- **Block system:** `{{ block "main" . }}{{ end }}` for child templates

### list.html (layouts/_default/list.html)
**Purpose:** List pages for /blog/ and /projects/
**Lines:** 25

**Features:**
- Section header with title
- Project grid with `.reveal` animation
- Date formatting: `Jan 2006`
- Tags display
- GitHub/Demo/Read More links
- Uses Hugo's `.Pages` to iterate through content

### single.html (layouts/_default/single.html)
**Purpose:** Individual blog post and project pages
**Lines:** 76

**Features:**
- Single header with title, date, tags
- GitHub/Demo buttons if present
- Content body (`.single-body`)
- Back to section link
- Sticky ToC sidebar (conditional on `.TableOfContents` existence)
- Inline JavaScript for active ToC highlighting on scroll
- IntersectionObserver-based heading tracking

### index.html (layouts/index.html)
**Purpose:** Homepage
**Lines:** 155

**Sections:**
1. **Hero:** Name, subtitle, hero tags, orbital rings animation, CTA buttons
2. **Stats:** 2+ AI Projects, 3+ Years Experience, 10+ Tools & Frameworks
3. **Tech Stack:** Two-row infinite scrolling icon strip (18 technologies)
4. **Featured Projects:** Latest 2 projects from `content/projects/`
5. **Contact:** Contact info left, Formspree form right with honeypot

**Tech Stack Icons (Row 1):** Python, TensorFlow, PyTorch, OpenCV, Pandas, JavaScript, C, C++
**Tech Stack Icons (Row 2):** Docker, React, Django, Flask, MongoDB, MySQL, Git, Linux, AWS, Azure

---

## 3. Directory Structure

```
~/Work/portfolio/
├── hugo.toml                              ← site config
├── .github/
│   └── workflows/
│       └── deploy.yml                     ← GitHub Actions CI/CD
├── content/
│   ├── blog/
│   │   ├── hypervisors-kvm-qemu-complete-guide.md
│   │   ├── operating-systems-explained.md
│   │   ├── portfolio-development-guide.md
│   │   └── tech-survival-guide-2026.md
│   └── projects/
│       ├── lecturelens.md
│       ├── ai-research-agent.md
│       ├── document-qa-system.md
│       └── mediscan-ai.md
├── layouts/
│   ├── _default/
│   │   ├── baseof.html                    ← base template, nav, fonts, cursor, scripts
│   │   ├── list.html                      ← /blog/ and /projects/ index pages
│   │   └── single.html                    ← individual post pages (has ToC sidebar)
│   └── index.html                         ← homepage
└── static/
    ├── css/
    │   └── main.css                       ← all styles (840 lines)
    ├── js/
    │   └── main.js                        ← all scripts (294 lines)
    ├── _headers                           ← CSP security headers
    └── favicon.ico
├── archetypes/
│   └── default.md                        ← Hugo content template
├── assets/                               ← empty directory
├── data/                                 ← empty directory
├── i18n/                                 ← empty directory
├── public/                               ← gitignored (build output)
├── .hugo_build.lock                      ← gitignored (Hugo lock file)
├── .gitignore
├── README.md
└── PORTFOLIO_CONTEXT.md                  ← this file
```

---

## 4. GitHub Actions CI/CD Workflow (.github/workflows/deploy.yml)

**File size:** 49 lines
**Trigger:** Push to `portfolio` branch

**Workflow Structure:**
```yaml
name: Deploy Hugo to GitHub Pages

on:
  push:
    branches:
      - portfolio

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: '0.154.5'
          extended: true
      - name: Build
        run: hugo --minify
        env:
          HUGO_PARAMS_FORMSPREEEID: ${{ secrets.FORMSPREE_ID }}
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Key Details:**
- Hugo version: 0.154.5 extended
- Build command: `hugo --minify`
- Output directory: `./public`
- Environment: `github-pages`
- Deployment time: ~90 seconds
- Formspree ID injection via GitHub Secrets (note: case mismatch in env var name - FORMSPREEEID vs formspreeID)

---

## 5. Security Headers (static/_headers)

**File size:** 8 lines
**Purpose:** Content Security Policy and security headers for deployment

**Headers:**
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://cdn.jsdelivr.net https://upload.wikimedia.org; connect-src 'self' https://formspree.io; frame-ancestors 'none';
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-XSS-Protection: 1; mode=block
```

**Note:** GitHub Pages does not natively apply `_headers` files (that's a Netlify/Cloudflare Pages feature). The file is included for portability if the site moves to Netlify or Cloudflare Pages.

---

## 6. Hugo Archetype Template (archetypes/default.md)

**File size:** 6 lines
**Purpose:** Default template for new Hugo content

**Template:**
```toml
+++
date = '{{ .Date }}'
draft = true
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
+++
```

**Usage:** When running `hugo new blog/post-name.md`, Hugo uses this template to generate frontmatter with:
- Current date
- Draft status set to true
- Title auto-generated from filename (kebab-case to Title Case)

---

## 7. Hugo Config (hugo.toml)

```toml
baseURL = "https://ik-awais.github.io/"
languageCode = "en-us"
title = "Muhammad Awais — AI Developer"

[markup]
  [markup.tableOfContents]
    startLevel = 2
    endLevel   = 3
    ordered    = false
  [markup.goldmark.renderer]
    unsafe = true

[params]
  author      = "Muhammad Awais"
  email       = "mawaisqq@gmail.com"
  github      = "https://github.com/ik-awais"
  linkedin    = "https://www.linkedin.com/in/muhammad-awais-ai-engineer/"
  formspreeID = "xvzwzlre"

[taxonomies]
  tag = "tags"
```

---

## 8. Design System

### Color Palette

**Dark mode (default):**
```css
--bg:             #060610
--card:           #0f0f22
--card-hover:     #14142a
--border:         #1e1e38
--accent:         #00d4ff    /* cyan */
--accent2:        #7c3aed    /* purple */
--accent3:        #06bb7a    /* green */
--text:           #e8e8f0
--text-secondary: #b0b0c8
--muted:          #6b6b8a
--code-bg:        #08081a
--code-text:      #a8d8ea
--nav-scrolled:   rgba(6,6,16,0.93)
```

**Light mode (`[data-theme="light"]`) — GitHub/VS Code style:**
```css
--bg:             #f0f2f5
--card:           #ffffff
--card-hover:     #f3f4f6
--border:         #c8cdd6
--accent:         #0070a8
--accent2:        #5b21b6
--accent3:        #065f46
--text:           #111827
--text-secondary: #374151
--muted:          #6b7280
--code-bg:        #1e1e2e    /* stays dark even in light mode — intentional */
--code-text:      #cdd6f4
--nav-scrolled:   rgba(240,242,245,0.95)
```

### Fonts
- **Syne 800** — hero name, section titles, logo
- **JetBrains Mono 300/400/500** — all body text, nav, code

### Responsive Breakpoints
| Breakpoint | Behaviour |
|------------|-----------|
| 1024px | Hide ToC sidebar on blog posts |
| 768px | Full mobile layout — single column, compressed padding, full-width buttons |
| 400px | Very small phones — hide nav text links, keep CTA and theme toggle only |

---

## 9. Navigation (baseof.html)

```
Logo (MA.)  |  Projects  |  Blog  |  Contact  |  GitHub ↗  |  LinkedIn  |  ☽/☀  |  Hire Me
```

- **LinkedIn button** → https://www.linkedin.com/in/muhammad-awais-ai-engineer/
- **Hire Me button** → https://www.upwork.com/freelancers/~018a2d0e2f88ac4838
- Both open in new tab
- Mobile nav has same buttons (line 27 in baseof.html)
- Theme toggle persists via localStorage

---

## 10. Homepage Sections (layouts/index.html)

1. **Hero** — Name "Muhammad Awais.", animated orbital rings, hero tags (Gen AI, Agentic AI, NLP, Computer Vision, LangChain, RAG), two CTA buttons (View Projects, Get in Touch)
2. **Stats bar** — 2+ AI Projects, 3+ Years Experience, 10+ Tools & Frameworks (counter animates on scroll)
3. **Tech Stack** — infinite scrolling two-row icon strip
4. **Selected Work** — 2 project cards pulled from `content/projects/`
5. **Get in Touch** — contact info left, Formspree form right

**Removed from homepage:** All `//` section labels (Tech Stack, Selected Work, Get in Touch, AI Engineer & Developer hero label)

---

## 11. Features

| Feature | Implementation |
|---------|---------------|
| Custom cursor | Dot + lagging ring, JS, desktop only |
| Card-thumb geometric icons | 8 deterministic SVG glyphs (triangle, bullseye, grid, hex, diamond, crosshair, spoke, ringed triangle) — index = (title_len + tag_count) mod 8 |
| Card-thumb on homepage | `card-thumb.html` partial now included in `index.html` project grid, matches list page cards |
| Footer link colors | `.footer-right a` and `.footer-brand-email` explicitly set to `#00d4ff` natural, `#9B59FF` on hover — mirrors nav-logo-badge pattern |
| Constellation motion | Nodes: 55 count (was 34), radius reduced by 2px (0.6–2.1 range), velocity boosted to 0.38 |
| Touch device detection | `(hover: none) and (pointer: coarse)` media query — hides cursor |
| Animated hero | CSS orbital rings, staggered fadeUp animations |
| Outline text | "Awais." uses `-webkit-text-stroke` |
| Tech stack scroll | Two rows, infinite CSS animation, grayscale→color on hover |
| Stat counters | IntersectionObserver, animate 0→target on scroll |
| Scroll reveal | `.reveal` class + IntersectionObserver → adds `.visible` |
| Sticky navbar | Transparent → blurred background after 50px scroll |
| Light/dark toggle | `data-theme` attribute on `<html>`, localStorage |
| Blog ToC | Hugo native `.TableOfContents` (h2+h3), sticky sidebar, JS active highlight |
| Contact form | Formspree via `FormData` POST, full validation, honeypot, rate limiting |
| CSP headers | `static/_headers` file |
| Mobile responsive | 3 breakpoints, single column, touch-friendly |

---

## 12. Contact Form Security Stack

- **Email validation** — RFC checks: one @, valid local part chars, no consecutive dots, TLD 2–12 chars, domain has real segments
- **Disposable domain blocklist** — 50+ domains blocked (Mailinator, YOPmail, Guerrilla Mail, TrashMail, etc.)
- **Honeypot field** — `id="f-honeypot"`, hidden via CSS (`position:absolute`, zero size, `pointer-events:none`), bots fill it and get silently discarded
- **Rate limiting** — max 3 submissions per session, min 60 seconds between sends
- **Formspree reCAPTCHA** — DISABLED (incompatible with AJAX/FormData submissions)
- **Submission method** — `FormData` POST with `Accept: application/json` header

### Form HTML IDs
```
f-name, f-email, f-message, f-honeypot, formStatus, submitBtn
```

---

## 10. Blog Posts

### Hypervisors, KVM & QEMU Complete Guide
**File:** `content/blog/hypervisors-kvm-qemu-complete-guide.md`
**Date:** 2025-10-10
**Tags:** KVM, QEMU, Virtualization, Linux, Windows 11, Kali Linux, Parrot OS, virt-manager, Hypervisors
**Summary:** A deep-dive guide from theory to practice — setting up virt-manager on Ubuntu 24.04 LTS, installing Windows 11, Kali Linux, and Parrot OS as virtual machines, passing GPU drivers, defeating Secure Boot, and fixing every error along the way.

**Structure:**
- Part I — Theory (hypervisor types, KVM, QEMU, libvirt, VirtIO, Secure Boot)
- Part II — Ubuntu 24.04 LTS host setup
- Part III — Kali Linux VM (primary walkthrough)
- Part IV — Windows 11 VM (TPM, OVMF UEFI, VirtIO drivers, Secure Boot + NVIDIA fix)
- Part V — Parrot OS VM
- Part VI — Management (snapshots, cloning, shared folders, disk resize)
- Quick reference table with direct ISO/driver download links

**Personal experience documented:**
- Windows 11 Secure Boot bypass for NVIDIA driver:
  ```cmd
  bcdedit /set {current} nointegritychecks on
  bcdedit /set {current} testsigning on
  ```
  Registry: `HKLM\SYSTEM\CurrentControlSet\Control\SecureBoot\State` → `UEFISecureBootEnabled = 1`

### How I Built My Portfolio Website with Hugo from Scratch
**File:** `content/blog/portfolio-development-guide.md`
**Date:** 2026-03-17
**Tags:** Hugo, Web Development, CSS, GitHub Pages, CI/CD, Portfolio
**Summary:** A honest, detailed account of how I built my personal portfolio website from a single HTML file to a full Hugo-powered site with a blog, dark/light theme, animated UI, and automated deployment.

**Key sections:**
- Where It All Started (single HTML file evolution)
- Why I Chose Hugo (speed, Markdown content, clean separation)
- Setting Up the Project (content/layout/static structure)
- First Problem: CSS/JS not loading (baseURL issue)
- Building the Design (dark theme, Syne + JetBrains Mono fonts, animated orbital rings)
- Dark and Light Mode (CSS variables, localStorage persistence)
- Blog and Table of Contents (Hugo native .TableOfContents vs JS approach)
- Contact Form (Formspree, honeypot, email validation, rate limiting)
- Deploying with GitHub Actions (workflow configuration, branch protection)
- What I Learned (content/presentation separation, build-time solutions, CSS variables)

### You Don't Need to Be a Programmer to Be a Tech Person
**File:** `content/blog/tech-survival-guide-2026.md`
**Date:** 2026-04-12
**Tags:** Linux, CLI, Networking, Docker, Git, Python, Security, Cloud, AI, Career
**Summary:** The real tech skills that put you in the top 10% of your environment — no CS degree required.

**12 Technical Fundamentals Covered:**
1. Know Your Operating System (Windows 11, Linux fundamentals)
2. The Command Line Is Not Scary (basic commands, package managers, process control)
3. Networking: How the Internet Actually Works (IP addresses, DNS, HTTP/HTTPS, ports, firewalls)
4. Docker: Shipping Software in a Box (images, containers, volumes, Docker Compose)
5. Git: Never Lose Your Work Again (version control, GitHub, .gitignore)
6. Scripting: Make the Computer Do the Boring Work (Python, Bash)
7. Data: JSON, CSV, and Parsing (data formats, parsing techniques)
8. APIs: Talking to Services (REST APIs, auth tokens, rate limits, Postman)
9. Security: The Basics That Most People Skip (SSH keys, file permissions, updates, backups, password hygiene)
10. Cloud: Where Everything Actually Runs (virtual machines, storage, deployment, free tiers)
11. Debugging: Finding What's Wrong (logs, stack traces, system monitoring, debugging mindset)
12. AI: Using It Like a Pro, Not Like a Tourist (prompt design, prompt chaining, tool chaining, validating outputs)

**90-day learning path suggested for beginners**

### Operating Systems Explained for Normal People
**File:** `content/blog/operating-systems-explained.md`
**Date:** 2026-05-01
**Slug:** `operating-systems-explained`
**URL:** `https://ik-awais.github.io/blog/operating-systems-explained/`
**Tags:** Operating Systems, Windows 11, macOS, Linux, Computer Basics, Tech Skills, Beginner, Ubuntu, Security
**Series:** Tech Survival Series (parent article #2)
**Summary:** What an operating system actually is, why it matters, and how to use Windows, macOS, and Linux like someone who knows what they are doing — no programming required.

**Series Context:**
- Sequel/follow-up to: `tech-survival-guide-2026.md`
- Explicit series label: Part of the Tech Survival Series
- Links back to tech-survival-guide-2026 multiple times
- Planned child articles (not yet created): Windows 11 Power User Guide, macOS Power User Guide, Linux Fundamentals for Beginners, Ubuntu in VirtualBox Beginner Guide, Windows Keyboard Shortcuts, macOS Shortcuts, Task Manager Explained, Safe Software Installation Guide, Password Managers & Digital Security Basics, Linux Terminal Basics

**Major Sections (H2 headings — all appear in Hugo ToC):**
1. Part of the Tech Survival Series
2. What an Operating System Actually Is
3. Why Understanding Your OS Matters
4. Core Habits That Make You Good With Computers
5. Windows 11: How to Use It Like a Power User
6. macOS: How to Actually Understand Your Mac
7. Linux: Enough to Not Be Lost
8. Cross-Platform Tools and Habits
9. A Practical Challenge List
10. Where to Go Next
11. Related Reading

**Key content covered:**
- OS definition and role: Windows 11 (~72% PC share), macOS (Apple hardware), Linux (96% of top web servers, Android kernel)
- Windows: filesystem paths, %AppData%, File Explorer tips, 12 keyboard shortcuts incl. Win+V clipboard history, Task Manager all tabs, winget package manager, VirusTotal
- macOS: Unix foundation, ~/Library hidden path, Cmd+Q vs red X, Homebrew, Gatekeeper, Activity Monitor
- Linux: filesystem hierarchy (/etc/, /var/log/, /proc/), Ubuntu Desktop, terminal basics, apt package manager, chmod permissions (600/755)
- Cross-platform: Browser DevTools (F12), Bitwarden, 2FA (authenticator vs SMS), BitLocker/FileVault/LUKS, VPN (Mullvad/ProtonVPN), 3-2-1 backup rule (Backblaze)
- 10-item practical challenge list
- Continue Learning sections at end of each OS section linking to planned child articles

**Related Reading links (all internal Hugo paths):**
- /blog/tech-survival-guide-2026/
- /blog/hypervisors-kvm-qemu-complete-guide/
- /blog/portfolio-development-guide/

**SEO target keywords:** operating systems explained, what is an operating system, Windows 11 guide, macOS guide, Linux for beginners, computer basics, operating system fundamentals, beginner tech skills

---

## 11. Projects

### LectureLens — RAG Lecture Q&A System
**File:** `content/projects/lecturelens.md`
**Date:** 2026-06-15
**Tags:** RAG, Flask, ChromaDB, HuggingFace, SQLite, NLP, Python
**GitHub:** https://github.com/ik-awais/lecturelens
**Status:** in-progress
**Summary:** Full RAG system for querying lecture content — Flask backend, ChromaDB vector store, BAAI/bge-small-en-v1.5 embeddings, SQLite FTS5 hybrid search, dark Chat UI with sidebar + subject dropdown + citation tags + session persistence, and a complete admin dashboard (overview, documents, subjects, health sections with password auth and cascade delete).

**Architecture:**
- Ingestion: lecture documents → chunked → BAAI/bge embeddings → ChromaDB
- Retrieval: semantic (ChromaDB) + keyword (SQLite FTS5) hybrid
- Chat UI: two-panel vanilla JS SPA, subject dropdown, citation tags, session history
- Admin: password-protected dashboard with document/subject management + health monitoring
- API: Flask REST endpoints for chat, ingestion, admin CRUD

### AI Research Assistant Agent
**File:** `content/projects/ai-research-agent.md`
**Date:** 2025-01-01
**Tags:** AI Agents, LLM, Web Search, Automation, Streamlit
**GitHub:** https://github.com/ik-awais/ai-research-agent
**Status:** in-progress
**Summary:** Autonomous AI research agent that searches the web, extracts sources, and generates structured research reports.

**Capabilities:**
- Autonomous multi-step reasoning
- Real-time web search integration
- Multi-source extraction and deduplication
- AI summarization with citations
- Structured report generation
- Export to PDF or TXT

**Architecture:** Query → Web Search → Content Extraction → LLM Summaries → Structured Report

### Document Q&A System
**File:** `content/projects/document-qa-system.md`
**Date:** 2025-02-01
**Tags:** LangChain, FAISS, Streamlit, LLM, NLP
**GitHub:** https://github.com/ik-awais/doc-qa-system
**Status:** in-progress
**Summary:** Production-ready RAG system for uploading documents and asking natural language questions with source citations.

**Capabilities:**
- Document ingestion and chunking
- Semantic search via FAISS vector store
- LLM-powered Q&A with citations
- Multi-document support
- Streamlit interface

**Architecture:** Upload → Parse → Chunk → Embed → FAISS Index → Query → LLM → Answer + Sources

### MediScan AI — Medical Image & Report Assistant
**File:** `content/projects/mediscan-ai.md`
**Date:** 2026-03-30
**Tags:** AI, Computer Vision, LLaMA, FastAPI, PyTorch, Hugging Face, Medical AI
**GitHub:** https://github.com/ik-awais/mediscan-ai
**Status:** in-progress
**Summary:** End-to-end pipeline that classifies medical scans with a fine-tuned Vision Transformer, scores anomalies with IsolationForest, and generates structured radiology reports using LLaMA 3.1 — served via FastAPI.

**What It Does:**
POST a scan (JPEG or PNG), API responds with:
1. Classification results — top-k labels from ViT fine-tuned on chest X-ray data
2. Anomaly assessment — risk level (low/medium/high) via IsolationForest
3. Structured radiology report — generated by LLaMA 3.1 70B with FINDINGS, IMPRESSION, RECOMMENDATION sections

**Architecture (5 stages):**
1. OpenCV Preprocessing — CLAHE, non-local means denoising
2. Hugging Face + PyTorch Feature Extraction — ViT fine-tuned model + ResNet-18 backbone
3. Scikit-learn Anomaly Scoring — IsolationForest on normal scan embeddings
4. NLTK Prompt Construction — deduplication and structured prompt assembly
5. LLaMA 3.1 Report Generation — NVIDIA OpenAI-compatible endpoint at temperature 0.3

**FastAPI Endpoints:**
- GET /health → status, device, model name
- POST /analyze → multipart: file + scan_type → JSON report

**Clinical Disclaimer:** Research prototype, not a medical device, requires qualified radiologist review

### Content Frontmatter Format
```yaml
---
title: "Project Name"
date: 2025-01-01
summary: "One line summary shown on cards"
tags: ["Tag1", "Tag2"]
github: "https://github.com/ik-awais/repo"
demo: ""                    ← leave empty if no live demo
---
```

---

## 15. Deployment

**Platform:** GitHub Pages
**Source repo:** https://github.com/ik-awais/ik-awais.github.io
**Deploy branch:** `main`
**Method:** GitHub Actions

**Workflow file:** `.github/workflows/deploy.yml`
- Trigger: push to `main` branch
- Hugo version: 0.154.5 extended
- Build: `hugo --minify`
- Pages source: set to "GitHub Actions" in repo Settings → Pages

**After every change:**
```bash
cd ~/Work/portfolio
git add .
git commit -m "describe change"
git push
# GitHub Actions deploys automatically in ~90 seconds
```

---

## 16. GitHub Profile README

**Repo:** https://github.com/ik-awais/ik-awais
**File:** `README.md`

**Sections:**
1. Name + title (centered)
2. Badge links — LinkedIn, Portfolio, Gmail, Instagram, Codeforces (all `target="_blank"`)
3. Profile view counter (komarev.com)
4. Python class "About Me"
5. Featured projects table
6. Tech stack badges (4 categories)
7. GitHub stats card + top languages card
8. Streak stats
9. Activity graph
10. Footer — open to collaboration + portfolio link

**Style decisions:**
- No wave headers (capsule-render was unreliable)
- No typing animations at top (caused rendering issues)
- Photo removed from header (didn't fit layout)
- All badge links use `<a target="_blank">` HTML tags
- Color scheme matches portfolio: `#060610`, `#7c3aed`, `#00d4ff`, `#06bb7a`

---

## 17. Known Decisions & Gotchas

| Decision | Reason |
|----------|--------|
| No `//` section labels anywhere | Removed — user preference |
| `.single-body` must NOT have `.reveal` class | Causes content to stay invisible if IntersectionObserver misfires |
| Hugo native `.TableOfContents` for ToC | JS DOM scraping was unreliable — `DOMContentLoaded` fired too early |
| Code blocks stay dark in light mode | Intentional design decision |
| Tech stack icons full opacity in light mode | Was 0.6 grayscale — looked washed out |
| FormData POST (not JSON) to Formspree | JSON bypasses Formspree's processing pipeline |
| Formspree reCAPTCHA disabled | Blocks all AJAX submissions on free plan |
| Formspree ID in hugo.toml directly | Not sensitive — ends up in page HTML anyway |
| `public/` gitignored | GitHub Actions builds it; never commit it manually |
| Never edit on GitHub web UI + locally simultaneously | Causes merge conflicts |
| Project cards show date not word count | `{{ .Date.Format "Jan 2006" }}` not `{{ printf "%02d" .WordCount }}` |
| Footer icon links need explicit color | `.footer-right a` and `.footer-brand-email` require `!important` override — global cursor reset at line 60–75 was setting `color` implicitly; mirror the `.nav-logo-badge` fix pattern |
| Card-thumb SVG glyph index | `(len .Title + len .Params.tags) mod 8` — deterministic, no randomness at render time |
| Homepage cards needed card-thumb partial | `index.html` now includes `{{ partial "card-thumb.html" . }}` + `.project-card-body` wrapper to match list page structure |
| Constellation node sizing | Original radius 1.6–4.3px; reduced by 2px to 0.6–2.1px; count 34→55; velocity 0.22→0.38 |

---

## 18. Useful Commands

```bash
# Local development
cd ~/Work/portfolio
hugo server -D                          # live preview at localhost:1313

# Build
hugo                                    # outputs to /public

# New content
hugo new blog/post-name.md
hugo new projects/project-name.md

# Deploy
git add .
git commit -m "message"
git push                                # auto-deploys via GitHub Actions

# Profile README
cd ~/Work/ik-awais
git add README.md
git commit -m "message"
git push
```

---

## 19. CSS Classes Reference

| Class | Purpose |
|-------|---------|
| `.reveal` | Fade+slide up on scroll (do NOT put on `.single-body`) |
| `.visible` | Added by IntersectionObserver to trigger reveal |
| `.single-wrapper` | Blog post grid: `1fr 260px` (article + ToC) |
| `.single-body` | Blog post content — always `opacity:1 !important` |
| `.toc-sidebar` | Sticky ToC — hidden below 1024px |
| `.toc-nav` | Hugo native ToC container |
| `.toc-link` | ToC anchor links |
| `.toc-link.active` | Current section highlight |
| `.project-card` | Project cards on homepage + list page |
| `.section-label` | `//` labels — ALL REMOVED from templates |
| `.f-honeypot` | Hidden bot trap field |
| `.card-thumb` | Thumbnail container (180px, flex-shrink:0) |
| `.card-thumb--gradient` | Gradient fallback (6 palettes, p0–p5) |
| `.card-thumb--image` | Real image variant with zoom-on-hover |
| `.card-thumb-icon` | SVG glyph container (52×52px, rotates on card hover) |
| `.card-thumb-noise` | Noise texture overlay (opacity 0.045) |
| `.project-card-body` | Padded content wrapper inside cards with thumb |
| `.form-status` | Form feedback message |
| `.cta-btn` | Nav CTA button (LinkedIn + Hire Me) |
| `.hero-label` | REMOVED — was showing "AI Engineer & Developer" |
| `.scroll-track` | Infinite scrolling tech stack row |
