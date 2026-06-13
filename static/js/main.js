// ── THEME TOGGLE ────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

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

// ── CONTACT FORM ────────────────────────────────────────────────────────
async function sendForm(FORMSPREE_ID) {
  const nameEl     = document.getElementById('f-name');
  const emailEl    = document.getElementById('f-email');
  const messageEl  = document.getElementById('f-message');
  const honeypotEl = document.getElementById('f-honeypot');
  const status     = document.getElementById('formStatus');
  const btn        = document.getElementById('submitBtn');

  status.className   = 'form-status';
  status.textContent = '';

  // Honeypot — silently discard bot submissions
  if (honeypotEl && honeypotEl.value !== '') {
    status.textContent = '✓ Message sent!';
    status.className   = 'form-status success';
    return;
  }

  const name    = nameEl.value.trim();
  const email   = emailEl.value.trim();
  const message = messageEl.value.trim();

  if (!name || !email || !message) {
    status.textContent = '⚠ Please fill in all fields.';
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
    emailEl.focus();
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

  if (!FORMSPREE_ID || FORMSPREE_ID === 'YOUR_FORM_ID' || FORMSPREE_ID === '') {
    status.textContent = '✓ [Demo mode] Add Formspree ID to hugo.toml.';
    status.className   = 'form-status success';
    return;
  }

  btn.disabled       = true;
  btn.textContent    = 'Sending...';
  status.textContent = 'Sending your message...';
  status.className   = 'form-status loading';

  try {
    // Use FormData (not JSON) so Formspree's reCAPTCHA validation works.
    // Formspree's reCAPTCHA runs server-side when it receives multipart/form-data.
    // JSON submissions bypass the reCAPTCHA pipeline entirely.
    const formData = new FormData();
    formData.append('name',    name);
    formData.append('email',   email);
    formData.append('message', message);

    const res  = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
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

      nameEl.value    = '';
      emailEl.value   = '';
      messageEl.value = '';

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
    console.error('Form error:', err);
    status.textContent = `✗ ${err.message || 'Failed to send. Please email me directly at m.awais@aigenmat.com'}`;
    status.className   = 'form-status error';
    btn.disabled       = false;
    btn.textContent    = 'Send Message →';
  }
}

// Enter key on name/email fields
document.querySelectorAll('#f-name, #f-email').forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const btn = document.getElementById('submitBtn');
      if (btn) btn.click();
    }
  });
});

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

// ── PREMIUM CURSOR ──────────────────────────────────────────────────────
(function initCursor() {
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (isTouch) return;

  const dot   = document.getElementById('cursor');
  const ring  = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  // Add inner white dot for depth
  const innerDot = document.createElement('div');
  innerDot.className = 'cursor-dot';
  innerDot.id = 'cursorDot';
  document.body.appendChild(innerDot);

  // Physics state
  let mx = -200, my = -200;       // raw mouse
  let rx = -200, ry = -200;       // ring lerp target
  let isHovering = false;
  let isClicking = false;
  let isVisible  = false;

  const lerp = (a, b, n) => a + (b - a) * n;

  // Mouse tracking
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    if (!isVisible) {
      rx = mx; ry = my;
      isVisible = true;
      dot.classList.remove('hidden');
      ring.classList.remove('hidden');
      innerDot.classList.remove('hidden');
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    dot.classList.add('hidden');
    ring.classList.add('hidden');
    innerDot.classList.add('hidden');
    isVisible = false;
  });

  // Click states
  document.addEventListener('mousedown', () => {
    isClicking = true;
    dot.classList.add('clicking');
    ring.classList.add('clicking');
  });
  document.addEventListener('mouseup', () => {
    isClicking = false;
    dot.classList.remove('clicking');
    ring.classList.remove('clicking');
  });

  // Hover targets — context-aware expansion
  const HOVER_SELECTOR = [
    'a', 'button', '[role="button"]',
    '.project-card', '.identity-card',
    '.hero-tag', '.btn-primary', '.btn-ghost',
    '.cta-btn', '.cta-btn-primary',
    '.contact-link', '.theme-toggle',
    '.nav-logo', '.nav-logo-badge',
    '.footer-brand-logo', '.footer-brand-email',
    '.scroll-track img'
  ].join(', ');

  document.querySelectorAll(HOVER_SELECTOR).forEach(el => {
    el.addEventListener('mouseenter', () => {
      isHovering = true;
      dot.classList.add('hovering');
      ring.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      isHovering = false;
      dot.classList.remove('hovering');
      ring.classList.remove('hovering');
    });
  });

  // RAF loop — dot snaps, ring follows with spring physics
  let prevRx = rx, prevRy = ry;

  (function tick() {
    // Dot snaps directly to mouse
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';

    // Inner dot snaps instantly (acts as precision center)
    innerDot.style.left = mx + 'px';
    innerDot.style.top  = my + 'px';

    // Ring follows with soft spring (0.1 = smooth lag)
    rx = lerp(rx, mx, 0.1);
    ry = lerp(ry, my, 0.1);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';

    prevRx = rx;
    prevRy = ry;

    requestAnimationFrame(tick);
  }());
}());

// ── HERO CONSTELLATION CANVAS ───────────────────────────────────────────
(function initConstellation() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ctx = canvas.getContext('2d');
  let W, H, animId;
  let mouse = { x: -999, y: -999 };

  const COLORS = { node: 'rgba(157,111,255,', line: 'rgba(0,200,255,', pulse: 'rgba(157,111,255,' };
  const NODE_COUNT = 52;
  const MAX_DIST   = 130;
  const MOUSE_RADIUS = 160;

  function resize() {
    const wrap = canvas.parentElement;
    W = canvas.width  = wrap.offsetWidth;
    H = canvas.height = wrap.offsetHeight;
  }
  resize();
  new ResizeObserver(resize).observe(canvas.parentElement);

  // Nodes
  const nodes = Array.from({ length: NODE_COUNT }, () => ({
    x:  Math.random() * W,
    y:  Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r:  Math.random() * 1.6 + 0.8,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.012 + Math.random() * 0.018,
  }));

  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });
  canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    nodes.forEach(n => {
      // Mouse gravity
      const dx = mouse.x - n.x;
      const dy = mouse.y - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (1 - dist / MOUSE_RADIUS) * 0.018;
        n.vx += dx / dist * force;
        n.vy += dy / dist * force;
      }

      // Damping + drift
      n.vx *= 0.985;
      n.vy *= 0.985;
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += n.pulseSpeed;

      // Wrap edges
      if (n.x < -10) n.x = W + 10;
      if (n.x > W + 10) n.x = -10;
      if (n.y < -10) n.y = H + 10;
      if (n.y > H + 10) n.y = -10;
    });

    // Lines
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.35;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = COLORS.line + alpha + ')';
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    // Nodes
    nodes.forEach(n => {
      const glow = (Math.sin(n.pulse) * 0.5 + 0.5);
      const alpha = 0.55 + glow * 0.45;
      const radius = n.r + glow * 0.8;

      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius * 3.5);
      grad.addColorStop(0, COLORS.node + alpha + ')');
      grad.addColorStop(1, COLORS.node + '0)');

      ctx.beginPath();
      ctx.arc(n.x, n.y, radius * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.node + alpha + ')';
      ctx.fill();
    });

    // Mouse node — glowing ring at cursor position
    if (mouse.x > 0) {
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 40);
      grad.addColorStop(0, 'rgba(0,200,255,0.15)');
      grad.addColorStop(1, 'rgba(0,200,255,0)');
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 40, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  if (!prefersReduced) {
    draw();
  } else {
    // Static render for reduced-motion
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.node + '0.4)';
      ctx.fill();
    });
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
