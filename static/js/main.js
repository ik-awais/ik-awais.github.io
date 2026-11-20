// ── THEME TOGGLE ────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

function syncThemeBranding(theme) {
  const selectedTheme = theme === 'light' ? 'light' : 'dark';
  document.querySelectorAll('link[data-theme-dark][data-theme-light]').forEach(link => {
    const target = selectedTheme === 'light' ? link.dataset.themeLight : link.dataset.themeDark;
    if (target && link.getAttribute('href') !== target) link.setAttribute('href', target);
  });

  const themeColor = document.getElementById('site-theme-color');
  if (themeColor) themeColor.setAttribute('content', selectedTheme === 'light' ? '#F6F5FF' : '#101026');
}

syncThemeBranding(savedTheme);

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  syncThemeBranding(next);
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

// Pointer-following color halos are intentionally disabled.
// The operating-system cursor remains the only cursor.

// ── FREE-ROAMING PEBBLES WITH LOCAL CURSOR ATTRACTION ────────────────────
(function initConstellation() {
  const canvas = document.getElementById('heroCanvas') || document.getElementById('siteAmbientCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isSiteAmbient = canvas.id === 'siteAmbientCanvas';
  const wrap = isSiteAmbient ? document.body : canvas.parentElement;
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let lastFrame = 0;
  const pointer = { x: 0, y: 0, active: false };

  function getColors() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return isDark ? {
      node: [167, 139, 250], nodeAlpha: 0.78,
      line: [56, 189, 248], lineAlpha: 0.30,
    } : {
      node: [124, 58, 237], nodeAlpha: 0.40,
      line: [2, 132, 199], lineAlpha: 0.17,
    };
  }

  let colors = getColors();
  new MutationObserver(() => { colors = getColors(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const NODE_COUNT = 55;
  const MAX_DISTANCE = 150;

  // Keep the established fast drift. Pointer attraction changes only each pebble's
  // heading; it never translates the canvas, field, page, or theme.
  const BASE_SPEED = 0.64; // CSS pixels per 60 Hz frame (approximately 38 px/s)
  const SPEED_VARIATION = 0.13;
  const WANDER_STRENGTH = 0.010;
  const POINTER_RADIUS = 285;
  const POINTER_ATTRACTION = 0.030;
  const POINTER_ORBIT = 0.012;
  const POINTER_SOFT_CORE = 43;
  const POINTER_REPULSION = 0.046;
  const NODE_SEPARATION_RADIUS = 19;
  const NODE_SEPARATION_STRENGTH = 0.014;

  const nodes = [];

  function resize() {
    const rect = isSiteAmbient ? null : wrap.getBoundingClientRect();
    width = Math.max(1, isSiteAmbient ? window.innerWidth : rect.width);
    height = Math.max(1, isSiteAmbient ? window.innerHeight : rect.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  resize();

  if (!isSiteAmbient && 'ResizeObserver' in window) {
    new ResizeObserver(resize).observe(wrap);
  } else {
    window.addEventListener('resize', resize, { passive: true });
  }

  for (let i = 0; i < NODE_COUNT; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = BASE_SPEED * (1 + (Math.random() * 2 - 1) * SPEED_VARIATION);
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed,
      r: Math.random() * 0.6 + 3.17,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.018,
      orbitDirection: Math.random() < 0.5 ? -1 : 1,
    });
  }

  // Track the pointer, but do not move the particle field as a single object.
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const bounds = isSiteAmbient
      ? { left: 0, top: 0 }
      : canvas.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
    pointer.active = true;
  }, { passive: true });

  window.addEventListener('blur', () => { pointer.active = false; }, { passive: true });
  document.addEventListener('mouseleave', () => { pointer.active = false; }, { passive: true });

  const rgba = (rgb, alpha) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;

  function draw(timestamp = 0) {
    // Delta-time scaling preserves the same physical pace on high-refresh displays
    // and after short frames, while preventing large jumps after a delayed frame.
    const frameScale = lastFrame
      ? Math.min(2.5, Math.max(0.25, (timestamp - lastFrame) / 16.6667))
      : 1;
    lastFrame = timestamp;
    ctx.clearRect(0, 0, width, height);

    nodes.forEach((node, index) => {
      let ax = (Math.random() - 0.5) * WANDER_STRENGTH;
      let ay = (Math.random() - 0.5) * WANDER_STRENGTH;

      // A soft local attraction makes nearby pebbles turn toward the cursor.
      // A small orbit component and soft inner repulsion keep them gathering
      // around the pointer instead of collapsing into one dot.
      if (pointer.active) {
        const dx = pointer.x - node.x;
        const dy = pointer.y - node.y;
        const distance = Math.hypot(dx, dy) || 0.001;

        if (distance < POINTER_RADIUS) {
          const proximity = 1 - distance / POINTER_RADIUS;
          const attraction = POINTER_ATTRACTION * proximity * proximity;
          const nx = dx / distance;
          const ny = dy / distance;
          ax += nx * attraction;
          ay += ny * attraction;

          const orbit = POINTER_ORBIT * proximity;
          ax += -ny * orbit * node.orbitDirection;
          ay += nx * orbit * node.orbitDirection;
        }

        if (distance < POINTER_SOFT_CORE) {
          const core = 1 - distance / POINTER_SOFT_CORE;
          const repel = POINTER_REPULSION * core * core;
          ax -= (dx / distance) * repel;
          ay -= (dy / distance) * repel;
        }
      }

      // Gentle particle-to-particle separation prevents dense overlaps in the
      // cursor cluster without creating a rigid grid or fixed anchor positions.
      for (let j = 0; j < nodes.length; j += 1) {
        if (j === index) continue;
        const other = nodes[j];
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const distance = Math.hypot(dx, dy) || 0.001;
        if (distance < NODE_SEPARATION_RADIUS) {
          const pressure = 1 - distance / NODE_SEPARATION_RADIUS;
          const force = NODE_SEPARATION_STRENGTH * pressure;
          ax += (dx / distance) * force;
          ay += (dy / distance) * force;
        }
      }

      // Apply steering to the current velocity, then preserve each pebble's
      // established cruising speed. Motion remains continuous and independent.
      node.vx += ax * frameScale;
      node.vy += ay * frameScale;
      const currentSpeed = Math.hypot(node.vx, node.vy) || node.speed;
      node.vx = (node.vx / currentSpeed) * node.speed;
      node.vy = (node.vy / currentSpeed) * node.speed;

      node.x += node.vx * frameScale;
      node.y += node.vy * frameScale;
      node.pulse += node.pulseSpeed * frameScale;

      // Wrap at viewport edges so the field continuously roams everywhere.
      if (node.x < -8) node.x = width + 8;
      if (node.x > width + 8) node.x = -8;
      if (node.y < -8) node.y = height + 8;
      if (node.y > height + 8) node.y = -8;
    });

    // The cursor has no visual layer of its own: only the pebble field responds.
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.hypot(dx, dy);
        if (distance < MAX_DISTANCE) {
          const alpha = (1 - distance / MAX_DISTANCE) * colors.lineAlpha;
          ctx.strokeStyle = rgba(colors.line, alpha);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach(node => {
      const pulse = Math.sin(node.pulse) * 0.5 + 0.5;
      const alpha = colors.nodeAlpha * (0.7 + pulse * 0.3);
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r + pulse * 0.43, 0, Math.PI * 2);
      ctx.fillStyle = rgba(colors.node, alpha);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
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

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const intervalMs = 6200;
  const transitionMs = 620;

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
      const footer = root.querySelector('.home-carousel-footer');
      if (footer) footer.hidden = true;
      return;
    }

    const gap = () => parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16;
    let visibleCount = 1;
    let step = 0;
    let current = 0;
    let transitionLocked = false;
    let pendingReset = false;
    let paused = motionPreference.matches;
    let pointerOverCards = false;
    let cardHasFocus = false;
    let inView = true;
    let hidden = document.hidden;
    let elapsed = 0;
    let lastTime = 0;
    let raf = 0;
    let resizeFrame = 0;
    let transitionTimer = 0;

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
      track.style.transition = animate && !motionPreference.matches
        ? `transform ${transitionMs}ms cubic-bezier(.22,.72,.2,1)`
        : 'none';
      track.style.transform = `translate3d(${-position * step}px, 0, 0)`;
    };

    const updateProgress = () => {
      if (!progress) return;
      const value = Math.max(0, Math.min(100, (elapsed / intervalMs) * 100));
      progress.style.transform = `scaleX(${value / 100})`;
      const bar = progress.parentElement;
      if (bar) bar.setAttribute('aria-valuenow', String(Math.round(value)));
    };

    const prepare = () => {
      const savedCurrent = current;
      window.clearTimeout(transitionTimer);
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
      lastTime = 0;
      updateProgress();
    };

    const finishTransition = () => {
      window.clearTimeout(transitionTimer);
      transitionTimer = 0;
      if (pendingReset) {
        pendingReset = false;
        if (current >= originalsCount) current = 0;
        if (current < 0) current = originalsCount - 1;
        setPosition(visibleCount + current, false);
      }
      transitionLocked = false;
      lastTime = 0;
    };

    track.addEventListener('transitionend', event => {
      if (event.target === track && event.propertyName === 'transform') finishTransition();
    });

    const move = direction => {
      // Finish an interrupted transition before accepting another manual action.
      if (transitionLocked) finishTransition();
      elapsed = 0;
      transitionLocked = true;
      current += direction;
      pendingReset = current >= originalsCount || current < 0;
      setPosition(visibleCount + current, true);
      updateProgress();

      if (motionPreference.matches) {
        finishTransition();
      } else {
        // transitionend is not guaranteed (e.g. hidden tabs, interrupted CSS); this
        // watchdog always releases the lock so the progress cycle can resume.
        window.clearTimeout(transitionTimer);
        transitionTimer = window.setTimeout(finishTransition, transitionMs + 140);
      }
    };

    const setPaused = value => {
      paused = Boolean(value);
      lastTime = 0;
      if (pauseButton) {
        pauseButton.setAttribute('aria-pressed', String(paused));
        pauseButton.setAttribute('aria-label', paused ? 'Resume automatic carousel' : 'Pause automatic carousel');
        pauseButton.textContent = paused ? 'Play' : 'Pause';
      }
      updateProgress();
    };

    prevButton?.addEventListener('click', () => move(-1));
    nextButton?.addEventListener('click', () => move(1));
    pauseButton?.addEventListener('click', () => setPaused(!paused));

    // Only pointer/focus interaction with the cards pauses rotation. The footer
    // controls are outside this viewport, so using Pause/Play or arrows cannot
    // leave the carousel stuck in a hover/focus-paused state.
    viewport.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') pointerOverCards = true;
    });
    viewport.addEventListener('pointerleave', () => { pointerOverCards = false; });
    viewport.addEventListener('focusin', () => { cardHasFocus = true; });
    viewport.addEventListener('focusout', event => {
      if (!viewport.contains(event.relatedTarget)) cardHasFocus = false;
    });
    document.addEventListener('visibilitychange', () => {
      hidden = document.hidden;
      lastTime = 0;
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { inView = entry.isIntersecting; });
      }, { threshold: 0.15 });
      observer.observe(root);
    }

    const animate = time => {
      const delta = lastTime ? Math.min(time - lastTime, 80) : 0;
      lastTime = time;
      if (!paused && !pointerOverCards && !cardHasFocus && inView && !hidden && !transitionLocked) {
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

    setPaused(motionPreference.matches);
    // Reduced-motion preference starts paused, but the explicit Play control
    // remains available as a user-initiated opt-in.
    raf = window.requestAnimationFrame(animate);
    window.addEventListener('pagehide', () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeFrame);
      window.clearTimeout(transitionTimer);
      resizeObserver?.disconnect();
    }, { once: true });
  });
}());

// ── FLOATING-GHOST ARCHIVE DRAG & DROP ──────────────────────────────────
(function initArchiveOrdering() {
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
    window.PortfolioCardOrder?.apply(grid, ':scope > [data-archive-item]', family);
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
    }

    if (expandButton) toolbar.appendChild(expandButton);

    const adminOrderMode = new URLSearchParams(window.location.search).get('edit-order') === '1';
    let exportButton = null;
    if (adminOrderMode) {
      exportButton = document.createElement('button');
      exportButton.type = 'button';
      exportButton.className = 'archive-copy-order';
      exportButton.textContent = 'Copy order';
      toolbar.appendChild(exportButton);
    }
    if (expandButton || allCards.length > 1 || adminOrderMode) grid.parentElement.insertBefore(toolbar, grid);

    const setExpandLabel = expanded => {
      if (!expandButton) return;
      expandButton.setAttribute('aria-expanded', String(expanded));
      expandButton.innerHTML = expanded
        ? 'Show fewer cards <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 7 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : `Show older cards (${olderCards.length}) <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 7 6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    };
    if (olderCards.length) setExpandLabel(false);
    expandButton?.addEventListener('click', () => {
      const expanded = expandButton.getAttribute('aria-expanded') === 'true';
      cards().slice(initialCount).forEach(card => { card.hidden = expanded; });
      setExpandLabel(!expanded);
    });

    const persist = () => {
      const keys = cards().map(card => card.dataset.orderKey || card.dataset.contentFile || '').filter(Boolean);
      const saved = window.PortfolioCardOrder?.save(family, keys) === true;
      grid.dispatchEvent(new CustomEvent('portfolio:card-order-changed', {
        bubbles: true, detail: { family, keys, saved }
      }));
    };

    exportButton?.addEventListener('click', async () => {
      const originalLabel = exportButton.textContent;
      const manifest = cards().map((card, index) => {
        const file = card.dataset.contentFile || card.dataset.orderKey || 'UNKNOWN.md';
        return `# content/${file}\nweight: ${(index + 1) * 10}`;
      }).join('\n\n');
      let copied = false;
      try { copied = await copyText(manifest); } catch (_) { copied = false; }
      exportButton.textContent = copied ? 'Copied' : 'Retry copy';
      window.setTimeout(() => {
        if (exportButton.isConnected) exportButton.textContent = originalLabel;
      }, 1400);
    });

    allCards.forEach(card => {
      if (card.querySelector(':scope > .archive-drag-handle')) return;
      const handle = document.createElement('button');
      handle.type = 'button';
      handle.className = 'archive-drag-handle';
      handle.setAttribute('aria-label', `Drag to reorder ${card.querySelector('h3')?.textContent?.trim() || 'card'}`);
      handle.title = 'Drag this card to any position in the grid';
      handle.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor"><circle cx="7" cy="5" r="1.35"/><circle cx="13" cy="5" r="1.35"/><circle cx="7" cy="10" r="1.35"/><circle cx="13" cy="10" r="1.35"/><circle cx="7" cy="15" r="1.35"/><circle cx="13" cy="15" r="1.35"/></svg>';
      card.appendChild(handle);
    });

    let active = null;
    let didDrag = false;

    const createGhost = (card, rect) => {
      const ghost = card.cloneNode(true);
      ghost.classList.remove('reveal', 'dragging');
      ghost.classList.add('archive-drag-ghost');
      ghost.removeAttribute('data-archive-item');
      ghost.removeAttribute('data-content-file');
      ghost.removeAttribute('data-order-key');
      ghost.setAttribute('aria-hidden', 'true');
      ghost.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
      ghost.querySelectorAll('a,button,input,select,textarea').forEach(element => {
        element.setAttribute('tabindex', '-1');
      });
      Object.assign(ghost.style, {
        position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`,
        width: `${rect.width}px`, height: `${rect.height}px`, margin: '0',
        zIndex: '5000', pointerEvents: 'none', opacity: '0.96', transform: 'none',
      });
      document.body.appendChild(ghost);
      return ghost;
    };

    const beginDrag = event => {
      const { card } = active;
      const rect = card.getBoundingClientRect();
      const placeholder = document.createElement('div');
      placeholder.className = 'project-card-placeholder';
      placeholder.setAttribute('aria-hidden', 'true');
      placeholder.style.height = `${rect.height}px`;
      placeholder.style.minHeight = `${rect.height}px`;
      placeholder.style.width = '100%';
      placeholder.style.gridColumn = 'span 1';
      grid.insertBefore(placeholder, card);
      const ghost = createGhost(card, rect);
      card.remove();
      active.placeholder = placeholder;
      active.ghost = ghost;
      active.started = true;
      didDrag = true;
      grid.classList.add('is-reordering');
      document.body.classList.add('is-card-dragging');
      updateDragPosition(event);
    };

    const positionPlaceholder = (x, y) => {
      if (!active?.placeholder) return;
      const candidates = Array.from(grid.querySelectorAll(':scope > [data-archive-item]:not([hidden])'));
      if (!candidates.length) {
        grid.appendChild(active.placeholder);
        return;
      }
      const bounds = grid.getBoundingClientRect();
      if (y <= bounds.top + 3) {
        grid.insertBefore(active.placeholder, candidates[0]);
        return;
      }
      if (y >= bounds.bottom - 3) {
        grid.appendChild(active.placeholder);
        return;
      }

      let nearest = null;
      let nearestDistance = Infinity;
      candidates.forEach(card => {
        const rect = card.getBoundingClientRect();
        const dx = Math.max(rect.left - x, 0, x - rect.right);
        const dy = Math.max(rect.top - y, 0, y - rect.bottom);
        const distance = dx * dx + dy * dy;
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = { card, rect };
        }
      });
      if (!nearest) return;

      const after = x > nearest.rect.left + nearest.rect.width / 2;
      const reference = after ? nearest.card.nextSibling : nearest.card;
      if (reference !== active.placeholder && reference !== active.placeholder.nextSibling) {
        grid.insertBefore(active.placeholder, reference);
      }
    };

    const updateDragPosition = event => {
      if (!active?.started) return;
      active.ghost.style.left = `${event.clientX - active.offsetX}px`;
      active.ghost.style.top = `${event.clientY - active.offsetY}px`;
      positionPlaceholder(event.clientX, event.clientY);

      const edge = 72;
      if (event.clientY < edge) {
        window.scrollBy({ top: -Math.max(2, Math.ceil((edge - event.clientY) * 0.18)), behavior: 'auto' });
      } else if (event.clientY > window.innerHeight - edge) {
        window.scrollBy({ top: Math.max(2, Math.ceil((event.clientY - (window.innerHeight - edge)) * 0.18)), behavior: 'auto' });
      }
    };

    const finishDrag = (cancelled = false) => {
      if (!active) return;
      const state = active;
      if (state.started) {
        const reference = cancelled ? state.originalNextSibling : state.placeholder;
        const safeReference = reference && reference.parentNode === grid ? reference : null;
        grid.insertBefore(state.card, safeReference);
        state.placeholder?.remove();
        state.ghost?.remove();
        grid.classList.remove('is-reordering');
        document.body.classList.remove('is-card-dragging');
        if (!cancelled) persist();
      }
      active = null;
      if (state.handle?.isConnected) state.handle.focus({ preventScroll: true });
      window.setTimeout(() => { didDrag = false; }, 0);
    };

    grid.addEventListener('pointerdown', event => {
      const handle = event.target.closest('.archive-drag-handle');
      const card = handle?.closest('[data-archive-item]') || event.target.closest('[data-archive-item]');
      if (!card || !grid.contains(card) || event.button !== 0 || event.isPrimary === false) return;
      if (event.pointerType === 'touch' && !handle) return;
      if (event.target.closest('.project-card-actions, .card-actions, input, textarea, select')) return;
      const rect = card.getBoundingClientRect();
      active = {
        card, handle: handle || card.querySelector('.archive-drag-handle'),
        pointerId: event.pointerId, startX: event.clientX, startY: event.clientY,
        offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top,
        originalNextSibling: card.nextSibling, started: false,
      };
      try { grid.setPointerCapture(event.pointerId); } catch (_) {}
    });

    grid.addEventListener('pointermove', event => {
      if (!active || event.pointerId !== active.pointerId) return;
      const distance = Math.hypot(event.clientX - active.startX, event.clientY - active.startY);
      if (!active.started && distance < 6) return;
      if (!active.started) {
        event.preventDefault();
        beginDrag(event);
      } else {
        event.preventDefault();
        updateDragPosition(event);
      }
    });

    grid.addEventListener('pointerup', event => {
      if (!active || event.pointerId !== active.pointerId) return;
      if (active.started) event.preventDefault();
      finishDrag(false);
    });
    grid.addEventListener('pointercancel', () => finishDrag(true));
    grid.addEventListener('lostpointercapture', () => {
      if (active?.started) finishDrag(true);
      else active = null;
    });

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
