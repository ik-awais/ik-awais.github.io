// ── THEME TOGGLE ────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// ── NAVIGATION: DROPDOWNS & MOBILE MENU ─────────────────────────────────
(function () {
  const navToggle = document.getElementById('navToggle');
  const navLinks   = document.getElementById('navLinks');
  const dropdowns  = Array.from(document.querySelectorAll('.nav-dropdown'));

  function closeDropdown(dd) {
    const trigger = dd.querySelector('.nav-dropdown-trigger');
    const menu    = dd.querySelector('.nav-dropdown-menu');
    if (!trigger || !menu) return;
    trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  }

  function openDropdown(dd) {
    dropdowns.forEach(other => { if (other !== dd) closeDropdown(other); });
    const trigger = dd.querySelector('.nav-dropdown-trigger');
    const menu    = dd.querySelector('.nav-dropdown-menu');
    if (!trigger || !menu) return;
    trigger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
  }

  function isOpen(dd) {
    const trigger = dd.querySelector('.nav-dropdown-trigger');
    return trigger && trigger.getAttribute('aria-expanded') === 'true';
  }

  dropdowns.forEach(dd => {
    const trigger = dd.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;
    let openedByHover = false;

    // Click / keyboard activation (Enter, Space) toggles — works for touch too.
    // If this click immediately follows a hover-open (the mouse arriving at
    // the trigger necessarily fires mouseenter before click), treat it as a
    // no-op rather than closing the menu the user just saw open.
    trigger.addEventListener('click', () => {
      if (isOpen(dd) && openedByHover) {
        openedByHover = false;
        return;
      }
      isOpen(dd) ? closeDropdown(dd) : openDropdown(dd);
    });

    // Desktop hover-intent, with a short grace period so moving the mouse
    // from the trigger down into the menu doesn't cause a flicker-close.
    let closeTimer = null;
    dd.addEventListener('mouseenter', () => {
      if (window.matchMedia('(hover: hover)').matches) {
        clearTimeout(closeTimer);
        if (!isOpen(dd)) openedByHover = true;
        openDropdown(dd);
      }
    });
    dd.addEventListener('mouseleave', () => {
      if (window.matchMedia('(hover: hover)').matches) {
        closeTimer = setTimeout(() => { closeDropdown(dd); openedByHover = false; }, 200);
      }
    });

    // Tabbing focus away from this dropdown's own controls closes it.
    dd.addEventListener('focusout', (e) => {
      if (!dd.contains(e.relatedTarget)) { closeDropdown(dd); openedByHover = false; }
    });
  });

  // Escape closes any open dropdown and returns focus to its trigger.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openDd = dropdowns.find(isOpen);
    if (openDd) {
      closeDropdown(openDd);
      openDd.querySelector('.nav-dropdown-trigger').focus();
      return;
    }
    if (navToggle && navToggle.getAttribute('aria-expanded') === 'true') {
      closeMobileMenu();
      navToggle.focus();
    }
  });

  // Click outside any dropdown closes whichever one is open.
  document.addEventListener('click', (e) => {
    dropdowns.forEach(dd => {
      if (isOpen(dd) && !dd.contains(e.target)) closeDropdown(dd);
    });
  });

  // Mobile hamburger menu
  function openMobileMenu() {
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    navLinks.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
    dropdowns.forEach(closeDropdown);
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.getAttribute('aria-expanded') === 'true' ? closeMobileMenu() : openMobileMenu();
    });

    // Tapping a real link (or the search trigger) inside the mobile menu closes it.
    navLinks.querySelectorAll('a, #searchTrigger').forEach(link => {
      link.addEventListener('click', () => {
        if (navToggle.getAttribute('aria-expanded') === 'true') closeMobileMenu();
      });
    });
  }
})();

// ── NAVBAR SCROLL ───────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ── SCROLL REVEAL ───────────────────────────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── EMAIL VALIDATION ────────────────────────────────────────────────────
const BLOCKED_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','tempmail.com','throwam.com',
  'sharklasers.com','guerrillamailblock.com','grr.la','guerrillamail.info',
  'spam4.me','trashmail.com','trashmail.me','trashmail.net','trashmail.at',
  'trashmail.io','yopmail.com','yopmail.fr','cool.fr.nf','jetable.fr.nf',
  'nospam.ze.tc','nomail.xl.cx','mega.zik.dj','speed.1s.fr','courriel.fr.nf',
  'moncourrier.fr.nf','monemail.fr.nf','monmail.fr.nf','dispostable.com',
  'mailnull.com','maildrop.cc','discard.email','spamgourmet.com',
  'spamgourmet.net','spamgourmet.org','spamspot.com','spamthis.co.uk',
  'tempinbox.com','filzmail.com','getairmail.com','fakeinbox.com',
  'mailnesia.com','spamfree24.org','spamfree24.de','spamfree24.eu',
  'spamfree24.info','spamfree24.net','spamfree.eu','spamhole.com',
  'spaml.com','tempail.com','tempemail.net','tempr.email','tempomail.fr',
  'temporarily.de','thanksnospam.info','trbvm.com','trashdevil.com',
  'trashdevil.de',
]);

function validateEmail(email) {
  const parts = email.split('@');
  if (parts.length !== 2)
    return { valid: false, reason: 'Email must contain exactly one @ symbol.' };

  const [local, domain] = parts;

  if (local.length < 1)
    return { valid: false, reason: 'Email address is incomplete.' };
  if (local.length > 64)
    return { valid: false, reason: 'Email local part is too long.' };
  if (!domain.includes('.'))
    return { valid: false, reason: 'Email domain must contain a dot (e.g. gmail.com).' };

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (tld.length < 2)
    return { valid: false, reason: 'Email has an invalid domain extension.' };
  if (tld.length > 12)
    return { valid: false, reason: 'Email has an unusually long domain extension.' };
  if (domainParts.some(p => p.length === 0))
    return { valid: false, reason: 'Email domain format is invalid.' };
  if (domain.length < 4)
    return { valid: false, reason: 'Email domain is too short to be valid.' };
  if (BLOCKED_DOMAINS.has(domain.toLowerCase()))
    return { valid: false, reason: 'Disposable email addresses are not accepted.' };

  const localRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  if (!localRegex.test(local))
    return { valid: false, reason: 'Email contains invalid characters.' };
  if (local.includes('..') || domain.includes('..'))
    return { valid: false, reason: 'Email contains consecutive dots which is invalid.' };
  if (local.startsWith('.') || local.endsWith('.'))
    return { valid: false, reason: 'Email local part cannot start or end with a dot.' };

  return { valid: true };
}

// ── RATE LIMITING (client-side) ─────────────────────────────────────────
const RATE_LIMIT_MS = 60000;
const MAX_ATTEMPTS  = 3;
let lastSubmitTime  = 0;
let submitAttempts  = 0;

function checkRateLimit() {
  const now = Date.now();
  if (submitAttempts >= MAX_ATTEMPTS)
    return { allowed: false, reason: `Maximum ${MAX_ATTEMPTS} messages per session reached. Please email me directly.` };
  if (now - lastSubmitTime < RATE_LIMIT_MS && lastSubmitTime !== 0) {
    const wait = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000);
    return { allowed: false, reason: `Please wait ${wait}s before sending another message.` };
  }
  return { allowed: true };
}

// ── DEDICATED CONTACT PAGE FORM (/contact/) ─────────────────────────────
// Self-contained handler for the classified-inquiry form. Reuses
// validateEmail() and checkRateLimit() above. No-ops entirely on any
// page without #contactForm.
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const status = document.getElementById('contactFormStatus');
  const btn    = document.getElementById('contactSubmitBtn');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    status.className   = 'form-status';
    status.textContent = '';

    const honeypotEl = document.getElementById('cf-honeypot');
    if (honeypotEl && honeypotEl.value !== '') {
      status.textContent = '✓ Message sent!';
      status.className   = 'form-status success';
      form.reset();
      return;
    }

    const purpose    = document.getElementById('cf-purpose').value.trim();
    const name       = document.getElementById('cf-name').value.trim();
    const occupation = document.getElementById('cf-occupation').value.trim();
    const email      = document.getElementById('cf-email').value.trim();
    const subject    = document.getElementById('cf-subject').value.trim();
    const message    = document.getElementById('cf-message').value.trim();
    const company    = document.getElementById('cf-company').value.trim();
    const phone      = document.getElementById('cf-phone').value.trim();

    if (!purpose || !name || !occupation || !email || !subject || !message) {
      status.textContent = '⚠ Please fill in all required fields.';
      status.className   = 'form-status error';
      return;
    }
    if (name.length < 2) {
      status.textContent = '⚠ Please enter your full name.';
      status.className   = 'form-status error';
      return;
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      status.textContent = `⚠ ${emailCheck.reason}`;
      status.className   = 'form-status error';
      document.getElementById('cf-email').focus();
      return;
    }

    if (message.length < 10) {
      status.textContent = '⚠ Message is too short. Please tell me more.';
      status.className   = 'form-status error';
      return;
    }
    if (message.length > 2000) {
      status.textContent = '⚠ Message is too long (max 2000 characters).';
      status.className   = 'form-status error';
      return;
    }

    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      status.textContent = `⚠ ${rateCheck.reason}`;
      status.className   = 'form-status error';
      return;
    }

    const formspreeURL = form.action;
    if (!formspreeURL || formspreeURL.includes('YOUR_FORM_ID') || formspreeURL.endsWith('/f/')) {
      status.textContent = '✓ [Demo mode] Add Formspree ID to hugo.toml.';
      status.className   = 'form-status success';
      return;
    }

    btn.disabled       = true;
    btn.textContent    = 'Sending...';
    status.textContent = 'Sending your message...';
    status.className   = 'form-status loading';

    try {
      // Use FormData (not JSON) so Formspree's reCAPTCHA validation works,
      // matching the existing homepage form's approach.
      const formData = new FormData();
      formData.append('purpose',    purpose);
      formData.append('name',       name);
      formData.append('occupation', occupation);
      formData.append('email',      email);
      formData.append('subject',    subject);
      formData.append('message',    message);
      if (company) formData.append('company', company);
      if (phone)   formData.append('phone', phone);

      const res  = await fetch(formspreeURL, {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    formData
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        lastSubmitTime = Date.now();
        submitAttempts++;

        status.textContent   = "✓ Message sent! I'll get back to you soon.";
        status.className     = 'form-status success';
        btn.textContent      = '✓ Sent';
        btn.style.background = 'var(--accent3)';
        btn.style.color      = '#fff';

        form.reset();

        setTimeout(() => {
          btn.disabled         = false;
          btn.textContent      = 'Send Message →';
          btn.style.background = '';
          btn.style.color      = '';
          status.textContent   = '';
          status.className     = 'form-status';
        }, 5000);

      } else {
        const errMsg = data?.errors?.map(e => e.message).join(', ')
                    || data?.error
                    || `Error ${res.status}`;
        throw new Error(errMsg);
      }

    } catch (err) {
      console.error('Contact form error:', err);
      status.textContent = `✗ ${err.message || 'Failed to send. Please email me directly at m.awais@aigenmat.com'}`;
      status.className   = 'form-status error';
      btn.disabled       = false;
      btn.textContent    = 'Send Message →';
    }
  });
})();

// ── PREMIUM INTERACTIONS ────────────────────────────────────────────────
(function initInteractions() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (prefersReduced || isTouch) return;

  // Magnetic buttons — cached rect on mouseenter
  document.querySelectorAll('.btn-primary, .btn-ghost, .cta-btn-primary').forEach(el => {
    let r = null;
    el.addEventListener('mouseenter', () => { r = el.getBoundingClientRect(); });
    el.addEventListener('mousemove', e => {
      if (!r) return;
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.18;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.18;
      el.style.transform = `translate(${dx}px,${dy}px)`;
    });
    el.addEventListener('mouseleave', () => { r = null; el.style.transform = ''; });
  });

  // Hero orb parallax — passive, CSS var driven, no layout thrash
  const orb = document.querySelector('.hero-orb');
  if (orb) {
    document.addEventListener('mousemove', e => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 28;
      const ny = (e.clientY / window.innerHeight - 0.5) * 16;
      orb.style.transform = `translateY(calc(-50% + ${ny}px)) translateX(${nx}px)`;
    }, { passive: true });
  }

  // Card ambient glow follow
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
      const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1);
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
    card.addEventListener('mouseleave', () => {
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    });
  });
}());

// ── HERO CONSTELLATION CANVAS ───────────────────────────────────────────
(function initConstellation() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ctx = canvas.getContext('2d');
  let W, H;
  let mouse = { x: -999, y: -999 };

  // Theme-aware colors — recomputed on every theme change
  function getColors() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return isDark ? {
      node: [157, 111, 255],  nodeAlpha: 0.55,
      line: [0, 200, 255],    lineAlpha: 0.22,
      glow: [157, 111, 255],  glowAlpha: 0.08,
    } : {
      node: [90, 80, 140],    nodeAlpha: 0.18,
      line: [80, 90, 160],    lineAlpha: 0.07,
      glow: [100, 80, 180],   glowAlpha: 0.03,
    };
  }

  let COLORS = getColors();
  new MutationObserver(() => { COLORS = getColors(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const NODE_COUNT  = 55;
  const MAX_DIST    = 150;
  const MOUSE_R     = 140;

  function resize() {
    const wrap = canvas.parentElement;
    W = canvas.width  = wrap.offsetWidth;
    H = canvas.height = wrap.offsetHeight;
  }
  resize();
  new ResizeObserver(resize).observe(canvas.parentElement);

  const nodes = Array.from({ length: NODE_COUNT }, () => ({
    x:  Math.random() * W,
    y:  Math.random() * H,
    vx: (Math.random() - 0.5) * 0.38,
    vy: (Math.random() - 0.5) * 0.38,
    r:  Math.random() * 1.8 + 1.0,
    pulse:      Math.random() * Math.PI * 2,
    pulseSpeed: 0.01 + Math.random() * 0.018,
  }));

  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });
  canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  const rgb = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    nodes.forEach(n => {
      const dx = mouse.x - n.x, dy = mouse.y - n.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < MOUSE_R && d > 0) {
        const f = (1 - d / MOUSE_R) * 0.014;
        n.vx += dx / d * f;
        n.vy += dy / d * f;
      }
      n.vx *= 0.988; n.vy *= 0.988;
      // Keep nodes always moving — enforce minimum speed
      const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (spd < 0.18) {
        const boost = (0.18 - spd) * 0.06;
        n.vx += (Math.random() - 0.5) * boost;
        n.vy += (Math.random() - 0.5) * boost;
      }
      n.x += n.vx;   n.y += n.vy;
      n.pulse += n.pulseSpeed;
      if (n.x < -8) n.x = W + 8;
      if (n.x > W + 8) n.x = -8;
      if (n.y < -8) n.y = H + 8;
      if (n.y > H + 8) n.y = -8;
    });

    // Draw lines first (below nodes)
    ctx.lineWidth = 1.0;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const a = (1 - d / MAX_DIST) * COLORS.lineAlpha;
          ctx.strokeStyle = rgb(COLORS.line, a);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes — flat fill only, no per-node gradient
    nodes.forEach(n => {
      const glow = Math.sin(n.pulse) * 0.5 + 0.5;
      const a    = COLORS.nodeAlpha * (0.7 + glow * 0.3);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + glow * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = rgb(COLORS.node, a);
      ctx.fill();
    });

    // Single ambient glow at mouse — one gradient object
    if (mouse.x > 0 && mouse.x < W) {
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
      g.addColorStop(0, rgb(COLORS.glow, COLORS.glowAlpha * 2));
      g.addColorStop(1, rgb(COLORS.glow, 0));
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  if (prefersReduced) {
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = rgb(COLORS.node, COLORS.nodeAlpha * 0.6);
      ctx.fill();
    });
  } else {
    draw();
  }
}());

// ── MAGNETIC BUTTONS ────────────────────────────────────────────────────
(function initMagnetic() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (prefersReduced || isTouch) return;

  document.querySelectorAll('.btn-primary, .btn-ghost, .cta-btn-primary').forEach(el => {
    let r = null;
    el.addEventListener('mouseenter', () => { r = el.getBoundingClientRect(); });
    el.addEventListener('mousemove', e => {
      if (!r) return;
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.18;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.18;
      el.style.transform = `translate(${dx}px,${dy}px)`;
    });
    el.addEventListener('mouseleave', () => { r = null; el.style.transform = ''; });
  });
}());

// ── SITE SEARCH ──────────────────────────────────────────────────────────
// Lazy-loaded (fetched only when opened), vanilla JS, no dependencies.
// Reuses the existing mobile-menu body-scroll-lock pattern; the mobile
// close-on-interaction list (above) already includes #searchTrigger.
(function () {
  const trigger  = document.getElementById('searchTrigger');
  const overlay  = document.getElementById('searchOverlay');
  const backdrop = document.getElementById('searchBackdrop');
  const panel    = overlay ? overlay.querySelector('.search-panel') : null;
  const input    = document.getElementById('searchInput');
  const closeBtn = document.getElementById('searchClose');
  const results  = document.getElementById('searchResults');
  if (!trigger || !overlay || !panel || !input || !closeBtn || !results) return;

  let indexData    = null;
  let indexLoaded   = false;
  let indexLoading  = false;
  let lastFocused   = null;
  let activeIndex   = -1;
  let currentItems  = [];
  let debounceTimer = null;

  const TYPE_LABELS = {
    projects: 'Project', blog: 'Blog', articles: 'Article',
    publications: 'Publication', activities: 'Activity',
    achievements: 'Achievement', about: 'Page', contact: 'Page',
    aigenmat: 'Page'
  };
  function typeLabel(type) { return TYPE_LABELS[type] || type || 'Page'; }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  async function loadIndex() {
    if (indexLoaded || indexLoading) return;
    indexLoading = true;
    try {
      const res = await fetch('/search-index.json');
      indexData = await res.json();
      indexLoaded = true;
    } catch (err) {
      console.error('Search index failed to load:', err);
      indexData = [];
    }
    indexLoading = false;
  }

  // Title first, then tags, then summary — matches the required priority order.
  function scoreMatch(doc, q) {
    const title   = (doc.title || '').toLowerCase();
    const tags    = (doc.tags || []).join(' ').toLowerCase();
    const summary = (doc.summary || '').toLowerCase();
    if (title.includes(q))   return 3;
    if (tags.includes(q))    return 2;
    if (summary.includes(q)) return 1;
    return 0;
  }

  function runSearch(query) {
    const q = query.trim().toLowerCase();
    input.setAttribute('aria-expanded', q ? 'true' : 'false');

    if (!q) {
      currentItems = [];
      activeIndex  = -1;
      results.innerHTML = '<p class="search-hint">Start typing to search the site.</p>';
      input.removeAttribute('aria-activedescendant');
      return;
    }

    const scored = (indexData || [])
      .map(doc => ({ doc, score: scoreMatch(doc, q) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);

    // De-dupe by permalink defensively.
    const seen = new Set();
    currentItems = [];
    scored.forEach(x => {
      if (!seen.has(x.doc.permalink)) {
        seen.add(x.doc.permalink);
        currentItems.push(x.doc);
      }
    });

    activeIndex = currentItems.length ? 0 : -1;
    renderResults();
  }

  function renderResults() {
    if (!currentItems.length) {
      results.innerHTML = '<p class="search-empty">No results found.</p>';
      input.removeAttribute('aria-activedescendant');
      return;
    }
    results.innerHTML = currentItems.map((doc, i) => {
      const id      = 'search-result-' + i;
      const dateStr = doc.date ? `<span class="search-result-date">${escapeHtml(doc.date)}</span>` : '';
      const summary = doc.summary ? `<p class="search-result-summary">${escapeHtml(doc.summary)}</p>` : '';
      return `<a href="${escapeHtml(doc.permalink)}" class="search-result${i === activeIndex ? ' active' : ''}" id="${id}" role="option" aria-selected="${i === activeIndex}">
        <div class="search-result-top">
          <span class="search-result-type">${escapeHtml(typeLabel(doc.type))}</span>
          ${dateStr}
        </div>
        <p class="search-result-title">${escapeHtml(doc.title)}</p>
        ${summary}
      </a>`;
    }).join('');
    if (activeIndex >= 0) {
      input.setAttribute('aria-activedescendant', 'search-result-' + activeIndex);
    }
  }

  function moveActive(delta) {
    if (!currentItems.length) return;
    activeIndex = (activeIndex + delta + currentItems.length) % currentItems.length;
    renderResults();
    const el = document.getElementById('search-result-' + activeIndex);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }

  function getFocusable() {
    return Array.from(panel.querySelectorAll('input, button, a[href]'));
  }

  function trapFocus(e) {
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  async function openSearch() {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    results.innerHTML = '<p class="search-hint">Start typing to search the site.</p>';
    input.value = '';
    activeIndex = -1;
    input.focus();
    await loadIndex();
  }

  function closeSearch() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  trigger.addEventListener('click', openSearch);
  closeBtn.addEventListener('click', closeSearch);
  backdrop.addEventListener('click', closeSearch);

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const value = input.value;
    debounceTimer = setTimeout(() => runSearch(value), 150);
  });

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && currentItems[activeIndex]) {
        e.preventDefault();
        window.location.href = currentItems[activeIndex].permalink;
      }
    } else if (e.key === 'Tab') {
      trapFocus(e);
    }
  });
})();
