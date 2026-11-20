// ── THEME TOGGLE ────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}


// Per-browser card order shared between archive pages and homepage previews.
// A static GitHub Pages deployment cannot write anonymous visitor changes back
// to the repository; this keeps each visitor's arrangement across reloads.
window.PortfolioCardOrder = window.PortfolioCardOrder || (() => {
  const prefix = 'portfolio:card-order:v1:';
  const read = family => {
    try {
      const value = JSON.parse(localStorage.getItem(prefix + family) || '[]');
      return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
    } catch (_) { return []; }
  };
  const save = (family, keys) => {
    try {
      // Preserve sibling collections that share a family (e.g. university,
      // college, and certificates all use the education order namespace).
      const previous = read(family);
      const currentSet = new Set(keys);
      const merged = [];
      let nextIndex = 0;
      previous.forEach(key => {
        if (currentSet.has(key)) {
          if (nextIndex < keys.length) merged.push(keys[nextIndex++]);
        } else if (!merged.includes(key)) {
          merged.push(key);
        }
      });
      while (nextIndex < keys.length) merged.push(keys[nextIndex++]);
      localStorage.setItem(prefix + family, JSON.stringify(merged));
      return true;
    } catch (_) { return false; }
  };
  const apply = (container, selector, family) => {
    if (!container || !family) return;
    const stored = read(family);
    if (!stored.length) return;
    const priority = new Map(stored.map((key, index) => [key, index]));
    const nodes = Array.from(container.querySelectorAll(selector));
    nodes.sort((a, b) => {
      const ak = a.dataset.orderKey || a.dataset.contentFile || '';
      const bk = b.dataset.orderKey || b.dataset.contentFile || '';
      const ai = priority.has(ak) ? priority.get(ak) : Number.MAX_SAFE_INTEGER;
      const bi = priority.has(bk) ? priority.get(bk) : Number.MAX_SAFE_INTEGER;
      return ai - bi;
    });
    nodes.forEach(node => container.appendChild(node));
  };
  return { read, save, apply };
})();

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
    dd.classList.remove('is-open');
    menu.hidden = true;
    menu.setAttribute('aria-hidden', 'true');
  }

  function openDropdown(dd) {
    dropdowns.forEach(other => { if (other !== dd) closeDropdown(other); });
    const trigger = dd.querySelector('.nav-dropdown-trigger');
    const menu    = dd.querySelector('.nav-dropdown-menu');
    if (!trigger || !menu) return;
    trigger.setAttribute('aria-expanded', 'true');
    dd.classList.add('is-open');
    menu.hidden = false;
    menu.setAttribute('aria-hidden', 'false');
  }

  function isOpen(dd) {
    const trigger = dd.querySelector('.nav-dropdown-trigger');
    return trigger && trigger.getAttribute('aria-expanded') === 'true';
  }

  dropdowns.forEach(dd => {
    const trigger = dd.querySelector('.nav-dropdown-trigger');
    const menu = dd.querySelector('.nav-dropdown-menu');
    if (!trigger || !menu) return;

    // Always start with closed menus, even if a previous script or cached DOM
    // state left an inconsistent aria-expanded/hidden combination.
    trigger.setAttribute('aria-expanded', 'false');
    dd.classList.remove('is-open');
    menu.hidden = true;
    menu.setAttribute('aria-hidden', 'true');

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

// ── SITE-WIDE CONTACT FORM (homepage and /contact/) ─────────────────────
// Shared handler for the classified-inquiry form. Reuses
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

  // Buttons intentionally remain position-stable; no magnetic pointer transforms.

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
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const wrap = canvas.parentElement;
  let W = 0, H = 0, pixelRatio = 1;
  let mouse = { x: -999, y: -999 };

  // Theme-aware colors — recomputed on every theme change
  function getColors() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return isDark ? {
      node: [167, 139, 250],  nodeAlpha: 0.78,
      line: [56, 189, 248],   lineAlpha: 0.30,
      glow: [244, 114, 182],  glowAlpha: 0.13,
    } : {
      node: [124, 58, 237],   nodeAlpha: 0.40,
      line: [2, 132, 199],    lineAlpha: 0.17,
      glow: [219, 39, 119],   glowAlpha: 0.075,
    };
  }

  let COLORS = getColors();
  new MutationObserver(() => { COLORS = getColors(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const NODE_COUNT  = 55;
  const MAX_DIST    = 150;
  const MOUSE_R     = 140;

  function resize() {
    const rect = wrap.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * pixelRatio);
    canvas.height = Math.round(H * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }
  resize();
  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(wrap);
  } else {
    window.addEventListener('resize', resize, { passive: true });
  }

  const nodes = Array.from({ length: NODE_COUNT }, () => ({
    x:  Math.random() * W,
    y:  Math.random() * H,
    vx: (Math.random() - 0.5) * 1.10,
    vy: (Math.random() - 0.5) * 1.10,
    // Node radius is now one-third of the previously enlarged size.
    r:  Math.random() * 0.6 + 3.17,
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
        const f = (1 - d / MOUSE_R) * 0.028;
        n.vx += dx / d * f;
        n.vy += dy / d * f;
      }
      n.vx *= 0.988; n.vy *= 0.988;
      // Keep nodes always moving — enforce minimum speed
      const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (spd < 0.64) {
        const boost = (0.64 - spd) * 0.06;
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
      ctx.arc(n.x, n.y, n.r + glow * 0.43, 0, Math.PI * 2);
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

  // The owner explicitly requests this subtle ambient network animation.
  // Keep it moving continuously; the node velocity is intentionally restrained.
  draw();
}());

// ── MATCHED-SPEED, SEAMLESS TECHNOLOGY MARQUEES ─────────────────────────
(function initTechMarquees() {
  const tracks = Array.from(document.querySelectorAll('.tech-stack-track'));
  if (!tracks.length) return;

  const updateTrack = track => {
    const group = track.querySelector('.tech-stack-group:not([aria-hidden="true"])');
    if (!group) return;
    const width = group.getBoundingClientRect().width;
    const speed = Math.max(24, Number(track.dataset.marqueeSpeed) || 38);
    if (width > 0) track.style.setProperty('--marquee-duration', `${width / speed}s`);
  };

  const updateAll = () => tracks.forEach(updateTrack);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const track = entry.target.closest('.tech-stack-track');
        if (track) updateTrack(track);
      });
    });
    tracks.forEach(track => {
      const group = track.querySelector('.tech-stack-group:not([aria-hidden="true"])');
      if (group) observer.observe(group);
    });
  }
  window.addEventListener('resize', updateAll, { passive: true });
  requestAnimationFrame(updateAll);
}());

// Buttons remain position-stable on hover. No magnetic pointer transforms are used.

// ── HOMEPAGE PREVIEW CAROUSELS ──────────────────────────────────────────
(function initHomePreviewCarousels() {
  const carousels = Array.from(document.querySelectorAll('[data-home-carousel]'));
  if (!carousels.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intervalMs = 6200;

  carousels.forEach(root => {
    const viewport = root.querySelector('.home-preview-viewport');
    const track = root.querySelector('[data-home-carousel-track]');
    const progress = root.querySelector('[data-home-progress]');
    const prevButton = root.querySelector('[data-home-prev]');
    const nextButton = root.querySelector('[data-home-next]');
    const pauseButton = root.querySelector('[data-home-pause]');
    if (!viewport || !track) return;

    const family = root.dataset.orderFamily || '';
    const originals = Array.from(track.children).filter(node => !node.dataset.homeClone);
    if (originals.length > 1 && window.PortfolioCardOrder) {
      window.PortfolioCardOrder.apply(track, '[data-home-item]', family);
    }
    const cards = Array.from(track.children).filter(node => !node.dataset.homeClone);
    if (cards.length < 2) {
      if (root.querySelector('.home-carousel-footer')) root.querySelector('.home-carousel-footer').hidden = true;
      return;
    }

    const gap = () => parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16;
    let visibleCount = 1;
    let step = 0;
    let current = 0;
    let transitionLocked = false;
    let pendingReset = false;
    let paused = prefersReducedMotion;
    let hovered = false;
    let focused = false;
    let inView = true;
    let hidden = document.hidden;
    let elapsed = 0;
    let lastTime = 0;
    let raf = 0;
    let resizeFrame = 0;

    const originalsCount = cards.length;
    const removeClones = () => track.querySelectorAll('[data-home-clone="true"]').forEach(node => node.remove());
    const makeClone = node => {
      const clone = node.cloneNode(true);
      clone.dataset.homeClone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      clone.tabIndex = -1;
      clone.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(control => control.setAttribute('tabindex', '-1'));
      clone.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
      return clone;
    };

    const setPosition = (position, animate = true) => {
      track.style.transition = animate && !prefersReducedMotion
        ? 'transform 620ms cubic-bezier(.22,.72,.2,1)'
        : 'none';
      track.style.transform = `translate3d(${-position * step}px, 0, 0)`;
    };

    const prepare = () => {
      const savedCurrent = current;
      transitionLocked = false;
      pendingReset = false;
      removeClones();
      const width = viewport.clientWidth;
      if (!width) return;
      const desired = width < 620 ? 1 : width < 1020 ? 2 : 3;
      visibleCount = Math.max(1, Math.min(desired, originalsCount));
      track.style.setProperty('--home-visible-count', visibleCount);
      const cardWidth = (width - gap() * (visibleCount - 1)) / visibleCount;
      track.style.setProperty('--home-card-basis', `${cardWidth}px`);
      step = cardWidth + gap();
      const leadingClones = document.createDocumentFragment();
      cards.slice(-visibleCount).forEach(card => leadingClones.appendChild(makeClone(card)));
      track.insertBefore(leadingClones, track.firstChild);
      cards.slice(0, visibleCount).forEach(card => track.appendChild(makeClone(card)));
      current = ((savedCurrent % originalsCount) + originalsCount) % originalsCount;
      setPosition(visibleCount + current, false);
      elapsed = 0;
      updateProgress();
    };

    const updateProgress = () => {
      if (!progress) return;
      const value = Math.max(0, Math.min(100, (elapsed / intervalMs) * 100));
      progress.style.transform = `scaleX(${value / 100})`;
      const bar = progress.parentElement;
      if (bar) bar.setAttribute('aria-valuenow', String(Math.round(value)));
    };

    const finishTransition = () => {
      if (pendingReset) {
        pendingReset = false;
        if (current >= originalsCount) current = 0;
        if (current < 0) current = originalsCount - 1;
        setPosition(visibleCount + current, false);
      }
      transitionLocked = false;
    };
    track.addEventListener('transitionend', event => {
      if (event.target === track && event.propertyName === 'transform') finishTransition();
    });

    const move = direction => {
      if (transitionLocked) return;
      elapsed = 0;
      transitionLocked = true;
      current += direction;
      pendingReset = current >= originalsCount || current < 0;
      setPosition(visibleCount + current, true);
      updateProgress();
      if (prefersReducedMotion) finishTransition();
    };

    const setPaused = value => {
      paused = value || prefersReducedMotion;
      if (pauseButton) {
        pauseButton.setAttribute('aria-pressed', String(paused));
        pauseButton.setAttribute('aria-label', paused ? 'Resume automatic carousel' : 'Pause automatic carousel');
        pauseButton.textContent = paused ? 'Play' : 'Pause';
      }
    };

    prevButton?.addEventListener('click', () => move(-1));
    nextButton?.addEventListener('click', () => move(1));
    pauseButton?.addEventListener('click', () => setPaused(!paused));
    root.addEventListener('mouseenter', () => { hovered = true; });
    root.addEventListener('mouseleave', () => { hovered = false; });
    root.addEventListener('focusin', () => { focused = true; });
    root.addEventListener('focusout', event => {
      if (!root.contains(event.relatedTarget)) focused = false;
    });
    document.addEventListener('visibilitychange', () => { hidden = document.hidden; });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { inView = entry.isIntersecting; });
      }, { threshold: 0.15 });
      observer.observe(root);
    }

    const animate = time => {
      const delta = lastTime ? Math.min(time - lastTime, 80) : 0;
      lastTime = time;
      if (!paused && !hovered && !focused && inView && !hidden && !transitionLocked) {
        elapsed += delta;
        if (elapsed >= intervalMs) move(1);
        else updateProgress();
      }
      raf = window.requestAnimationFrame(animate);
    };

    prepare();
    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(prepare);
    }) : null;
    if (resizeObserver) resizeObserver.observe(viewport);
    else window.addEventListener('resize', prepare, { passive: true });
    setPaused(prefersReducedMotion);
    if (prefersReducedMotion && pauseButton) pauseButton.hidden = true;
    raf = window.requestAnimationFrame(animate);
    window.addEventListener('pagehide', () => {
      cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
    }, { once: true });
  });
}());

// ── PUBLIC DRAG-TO-REORDER ARCHIVES ─────────────────────────────────────
(function initArchiveControls() {
  const grids = Array.from(document.querySelectorAll('[data-archive-grid]'));
  if (!grids.length) return;

  const copyText = async value => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
    const field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand('copy');
    field.remove();
    return ok;
  };

  grids.forEach(grid => {
    const family = grid.dataset.orderFamily || grid.dataset.archiveSection || '';
    const cards = () => Array.from(grid.querySelectorAll(':scope > [data-archive-item]'));
    if (window.PortfolioCardOrder) window.PortfolioCardOrder.apply(grid, ':scope > [data-archive-item]', family);
    const allCards = cards();
    if (!allCards.length) return;

    const initialCount = Math.max(1, Number(grid.dataset.initialCount) || 9);
    const olderCards = allCards.slice(initialCount);
    olderCards.forEach(card => { card.hidden = true; });

    const toolbar = document.createElement('div');
    toolbar.className = 'archive-toolbar';
    toolbar.setAttribute('aria-label', 'Archive display controls');

    let expandButton = null;
    if (olderCards.length) {
      expandButton = document.createElement('button');
      expandButton.type = 'button';
      expandButton.className = 'archive-expand-toggle';
      expandButton.setAttribute('aria-expanded', 'false');
      expandButton.innerHTML = `Show older cards (${olderCards.length}) <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 7 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }

    const status = document.createElement('p');
    status.className = 'archive-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.hidden = true;

    if (expandButton) toolbar.appendChild(expandButton);
    toolbar.appendChild(status);
    const adminOrderMode = new URLSearchParams(window.location.search).get('edit-order') === '1';
    let exportButton = null;
    if (adminOrderMode) {
      exportButton = document.createElement('button');
      exportButton.type = 'button';
      exportButton.className = 'archive-copy-order';
      exportButton.textContent = 'Copy shared Markdown order';
      toolbar.appendChild(exportButton);
    }
    if (expandButton || allCards.length > 1 || adminOrderMode) grid.parentElement.insertBefore(toolbar, grid);

    const updateExpandLabel = expanded => {
      if (!expandButton) return;
      expandButton.setAttribute('aria-expanded', String(expanded));
      expandButton.innerHTML = expanded
        ? `Show fewer cards <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 7 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        : `Show older cards (${olderCards.length}) <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 7 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    };
    const revealAll = () => {
      olderCards.forEach(card => { card.hidden = false; card.classList.add('visible'); });
      updateExpandLabel(true);
    };
    const collapseOlder = () => {
      cards().slice(initialCount).forEach(card => { card.hidden = true; });
      updateExpandLabel(false);
    };
    expandButton?.addEventListener('click', () => {
      const expanded = expandButton.getAttribute('aria-expanded') === 'true';
      expanded ? collapseOlder() : revealAll();
    });

    const persist = () => {
      const keys = cards().map(card => card.dataset.orderKey || card.dataset.contentFile || '').filter(Boolean);
      const saved = window.PortfolioCardOrder?.save(family, keys);
      status.hidden = false;
      status.textContent = saved
        ? 'Your card order is saved in this browser and will also be used by the homepage on this device. Shared ordering for all visitors requires a server-side database.'
        : 'This browser could not save the order. Enable site storage and try again.';
      grid.dispatchEvent(new CustomEvent('portfolio:card-order-changed', { bubbles: true, detail: { family, keys } }));
    };

    exportButton?.addEventListener('click', async () => {
      const manifest = cards().map((card, index) => {
        const file = card.dataset.contentFile || card.dataset.orderKey || 'UNKNOWN.md';
        return `# content/${file}\nweight: ${(index + 1) * 10}`;
      }).join('\n\n');
      try {
        const copied = await copyText(manifest);
        status.hidden = false;
        status.textContent = copied
          ? 'Shared order manifest copied. Apply each weight to its Markdown file and deploy to publish this order for everyone.'
          : 'Clipboard unavailable. Use HTTPS or copy the order manually.';
      } catch (_) {
        status.hidden = false;
        status.textContent = 'Clipboard unavailable. Use HTTPS or copy the order manually.';
      }
    });

    allCards.forEach(card => {
      const handle = document.createElement('button');
      handle.type = 'button';
      handle.className = 'archive-drag-handle';
      handle.setAttribute('aria-label', `Reorder ${card.querySelector('h3')?.textContent?.trim() || 'card'}. Use the up and down arrow keys to move it.`);
      handle.title = 'Drag to reorder; use arrow keys when focused';
      handle.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor"><circle cx="7" cy="5" r="1.35"/><circle cx="13" cy="5" r="1.35"/><circle cx="7" cy="10" r="1.35"/><circle cx="13" cy="10" r="1.35"/><circle cx="7" cy="15" r="1.35"/><circle cx="13" cy="15" r="1.35"/></svg>';
      card.appendChild(handle);
    });

    // Pointer-based sorting works with mouse and touch. The drag grip is the
    // only touch-action:none surface, so normal page scrolling remains intact.
    let active = null;
    let didDrag = false;
    const clearDrag = () => {
      if (!active) return;
      active.card.classList.remove('dragging');
      grid.classList.remove('is-reordering');
      document.body.classList.remove('is-card-dragging');
      active = null;
      if (didDrag) persist();
      window.setTimeout(() => { didDrag = false; }, 0);
    };

    grid.addEventListener('pointerdown', event => {
      const handle = event.target.closest('.archive-drag-handle');
      if (!handle || !grid.contains(handle) || event.button !== 0) return;
      const card = handle.closest('[data-archive-item]');
      if (!card) return;
      event.preventDefault();
      handle.focus({ preventScroll: true });
      active = { card, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, started: false };
      try { handle.setPointerCapture(event.pointerId); } catch (_) {}
    });

    grid.addEventListener('pointermove', event => {
      if (!active || event.pointerId !== active.pointerId) return;
      const dx = event.clientX - active.startX;
      const dy = event.clientY - active.startY;
      if (!active.started && Math.hypot(dx, dy) < 5) return;
      active.started = true;
      didDrag = true;
      active.card.classList.add('dragging');
      grid.classList.add('is-reordering');
      document.body.classList.add('is-card-dragging');
      const hit = document.elementFromPoint(event.clientX, event.clientY);
      const target = hit?.closest('[data-archive-item]');
      if (target && target !== active.card && grid.contains(target)) {
        const rect = target.getBoundingClientRect();
        const sameRow = Math.abs(event.clientY - (rect.top + rect.height / 2)) < rect.height * 0.32;
        const after = sameRow
          ? event.clientX > rect.left + rect.width / 2
          : event.clientY > rect.top + rect.height / 2;
        const reference = after ? target.nextElementSibling : target;
        if (reference !== active.card && reference !== active.card.nextElementSibling) grid.insertBefore(active.card, reference);
      }
      const edge = 76;
      if (event.clientY < edge) window.scrollBy({ top: -Math.ceil((edge - event.clientY) * 0.16), behavior: 'auto' });
      else if (event.clientY > window.innerHeight - edge) window.scrollBy({ top: Math.ceil((event.clientY - (window.innerHeight - edge)) * 0.16), behavior: 'auto' });
    });

    grid.addEventListener('pointerup', event => {
      if (!active || event.pointerId !== active.pointerId) return;
      if (active.started) event.preventDefault();
      clearDrag();
    });
    grid.addEventListener('pointercancel', clearDrag);
    grid.addEventListener('lostpointercapture', clearDrag);

    grid.addEventListener('click', event => {
      if (!didDrag) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);

    grid.addEventListener('keydown', event => {
      const handle = event.target.closest('.archive-drag-handle');
      if (!handle || !['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      const card = handle.closest('[data-archive-item]');
      if (!card) return;
      const list = cards();
      const index = list.indexOf(card);
      let next = index;
      if (event.key === 'ArrowUp') next = Math.max(0, index - 1);
      if (event.key === 'ArrowDown') next = Math.min(list.length - 1, index + 1);
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = list.length - 1;
      if (next === index) return;
      event.preventDefault();
      const reference = list[next];
      grid.insertBefore(card, next > index ? reference.nextElementSibling : reference);
      persist();
      handle.focus({ preventScroll: true });
    });
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
