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
  var isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (isTouch) return;

  var dot  = document.getElementById('cursor');
  var ring = document.getElementById('cursorRing');
  if (!dot) return;

  // Inject GTA arrow
  // Theme-aware NeXTSTEP sweeping pointer
  function getCursorSVG() {
    var isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return isDark
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 28" fill="none"><path d="M2,2 L2,21 L6,16.5 L9,24.5 L11.5,23.5 L8.5,15.5 L16.5,15.5 Z" fill="#0a0014" stroke="#00d4ff" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 28" fill="none"><path d="M2,2 L2,21 L6,16.5 L9,24.5 L11.5,23.5 L8.5,15.5 L16.5,15.5 Z" fill="#1a0033" stroke="#f0f0f0" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  }
  function getDefaultStroke() {
    return document.documentElement.getAttribute('data-theme') !== 'light'
      ? '#00d4ff' : '#f0f0f0';
  }
  function getHoverStroke() {
    return document.documentElement.getAttribute('data-theme') !== 'light'
      ? '#9D6FFF' : '#7c3aed';
  }
  dot.innerHTML = getCursorSVG();
  // Re-render on theme switch
  new MutationObserver(function() {
    dot.innerHTML = getCursorSVG();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Create hourglass loading element
  var hg = document.createElement('div');
  hg.className = 'cursor-loading';
  hg.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none"><path d="M3 2h12M3 16h12M4 2c0 4 5 6 5 7s-5 3-5 7M14 2c0 4-5 6-5 7s5 3 5 7" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/><path d="M5.5 4.5h7M5.5 13.5h7" stroke="#9D6FFF" stroke-width="1" stroke-linecap="round"/></svg>';
  document.body.appendChild(hg);

  var mx = -200, my = -200;
  var visible = false;

  // Loading state
  var isLoading = document.readyState !== 'complete';
  function setLoading(on) {
    isLoading = on;
    dot.classList.toggle('loading', on);
    hg.classList.toggle('active', on);
  }
  if (isLoading) setLoading(true);
  window.addEventListener('load', function() { setLoading(false); }, { once: true });

  function positionAt(x, y) {
    dot.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    hg.style.transform  = 'translate(' + (x - 9) + 'px,' + (y - 9) + 'px)';
    if (ring) { ring.style.left = x + 'px'; ring.style.top = y + 'px'; }
  }

  document.addEventListener('mousemove', function(e) {
    mx = e.clientX; my = e.clientY;
    positionAt(mx, my);
    if (!visible) {
      visible = true;
      dot.classList.remove('hidden');
      hg.style.opacity = '';
    }
  }, { passive: true });

  document.addEventListener('mouseleave', function() {
    dot.classList.add('hidden');
    hg.style.opacity = '0';
    visible = false;
  });

  // Hover feedback — accent-color the arrow stroke on hover
  var HOVER = 'a, button, .project-card, .identity-card, .hero-tag, .scroll-track img, [role="button"], input, textarea, select, label';
  document.querySelectorAll(HOVER).forEach(function(el) {
    el.addEventListener('mouseenter', function() {
      var p=dot.querySelector('path');if(p)p.setAttribute('stroke',getHoverStroke());
    });
    el.addEventListener('mouseleave', function() {
      var p=dot.querySelector('path');if(p)p.setAttribute('stroke',getDefaultStroke());
    });
  });

  document.addEventListener('mousedown', function() {
    var p=dot.querySelector('path');if(p)p.setAttribute('stroke','#00C8FF');
  });
  document.addEventListener('mouseup', function() {
    var p=dot.querySelector('path');if(p)p.setAttribute('stroke',getDefaultStroke());
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

  const NODE_COUNT  = 34;
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
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    r:  Math.random() * 2.7 + 1.6,
    pulse:      Math.random() * Math.PI * 2,
    pulseSpeed: 0.008 + Math.random() * 0.012,
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