// ── THEME TOGGLE ────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// ── CURSOR (desktop only) ───────────────────────────────────────────────
const isTouchDevice = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

if (!isTouchDevice() && cursor && ring) {
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX - 6 + 'px';
    cursor.style.top  = mouseY - 6 + 'px';
  });
  function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX - 18 + 'px';
    ring.style.top  = ringY - 18 + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
  document.querySelectorAll('a, button, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'scale(2.5)';
      ring.style.transform   = 'scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'scale(1)';
      ring.style.transform   = 'scale(1)';
    });
  });
} else {
  if (cursor) cursor.style.display = 'none';
  if (ring)   ring.style.display   = 'none';
  document.body.style.cursor = 'auto';
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

// ── COUNTER ANIMATION ───────────────────────────────────────────────────
let countersRan = false;
function animateCounters() {
  if (countersRan) return;
  countersRan = true;
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    let count = 0;
    const step = Math.ceil(target / 30);
    const interval = setInterval(() => {
      count = Math.min(count + step, target);
      el.textContent = count + '+';
      if (count >= target) clearInterval(interval);
    }, 40);
  });
}
const statsBar = document.querySelector('.stats-bar');
if (statsBar) {
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) animateCounters();
  }, { threshold: 0.4 }).observe(statsBar);
}

// ── EMAIL VALIDATION ────────────────────────────────────────────────────
// Disposable/throwaway email domain blocklist
const BLOCKED_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','tempmail.com','throwam.com',
  'sharklasers.com','guerrillamailblock.com','grr.la','guerrillamail.info',
  'spam4.me','trashmail.com','trashmail.me','trashmail.net','trashmail.at',
  'trashmail.io','yopmail.com','yopmail.fr','cool.fr.nf','jetable.fr.nf',
  'nospam.ze.tc','nomail.xl.cx','mega.zik.dj','speed.1s.fr','courriel.fr.nf',
  'moncourrier.fr.nf','monemail.fr.nf','monmail.fr.nf','dispostable.com',
  'mailnull.com','maildrop.cc','discard.email','spamgourmet.com',
  'spamgourmet.net','spamgourmet.org','spamspot.com','spamthis.co.uk',
  'tempinbox.com','filzmail.com','throwam.com','getairmail.com',
  'fakeinbox.com','mailnesia.com','mailnull.com','spamfree24.org',
  'spamfree24.de','spamfree24.eu','spamfree24.info','spamfree24.net',
  'spamfree.eu','spamhole.com','spaml.com','tempail.com','tempemail.net',
  'tempr.email','tempomail.fr','temporarily.de','thanksnospam.info',
  'throwam.com','trbvm.com','trashdevil.com','trashdevil.de',
]);

function validateEmail(email) {
  // Must have exactly one @
  const parts = email.split('@');
  if (parts.length !== 2) return { valid: false, reason: 'Email must contain exactly one @ symbol.' };

  const [local, domain] = parts;

  // Local part checks
  if (local.length < 1)  return { valid: false, reason: 'Email address is incomplete.' };
  if (local.length > 64) return { valid: false, reason: 'Email local part is too long.' };

  // Domain checks
  if (!domain.includes('.')) return { valid: false, reason: 'Email domain must contain a dot (e.g. gmail.com).' };

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (tld.length < 2)  return { valid: false, reason: 'Email has an invalid domain extension.' };
  if (tld.length > 12) return { valid: false, reason: 'Email has an unusually long domain extension.' };

  // Each domain part must have at least 1 character
  if (domainParts.some(p => p.length === 0)) {
    return { valid: false, reason: 'Email domain format is invalid.' };
  }

  // Domain must be at least 3 chars before the dot (e.g. "a.co" is suspicious, "gmail.com" is fine)
  if (domain.length < 4) return { valid: false, reason: 'Email domain is too short to be valid.' };

  // Block disposable domains
  const domainLower = domain.toLowerCase();
  if (BLOCKED_DOMAINS.has(domainLower)) {
    return { valid: false, reason: 'Disposable email addresses are not accepted.' };
  }

  // RFC-ish local part: only allow valid characters
  const localRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  if (!localRegex.test(local)) {
    return { valid: false, reason: 'Email contains invalid characters.' };
  }

  // No consecutive dots
  if (local.includes('..') || domain.includes('..')) {
    return { valid: false, reason: 'Email contains consecutive dots which is invalid.' };
  }

  // Local part cannot start or end with a dot
  if (local.startsWith('.') || local.endsWith('.')) {
    return { valid: false, reason: 'Email local part cannot start or end with a dot.' };
  }

  return { valid: true };
}

// ── RATE LIMITING (client-side) ─────────────────────────────────────────
// Prevent rapid repeated submissions from the same session
const RATE_LIMIT_MS  = 60000; // 1 minute between submissions
const MAX_ATTEMPTS   = 3;     // max 3 attempts per session
let lastSubmitTime   = 0;
let submitAttempts   = 0;

function checkRateLimit() {
  const now = Date.now();
  if (submitAttempts >= MAX_ATTEMPTS) {
    return { allowed: false, reason: `Maximum ${MAX_ATTEMPTS} messages per session reached. Please email me directly.` };
  }
  if (now - lastSubmitTime < RATE_LIMIT_MS && lastSubmitTime !== 0) {
    const wait = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000);
    return { allowed: false, reason: `Please wait ${wait}s before sending another message.` };
  }
  return { allowed: true };
}

// ── CONTACT FORM ────────────────────────────────────────────────────────
async function sendForm(FORMSPREE_ID) {
  const nameEl      = document.getElementById('f-name');
  const emailEl     = document.getElementById('f-email');
  const messageEl   = document.getElementById('f-message');
  const honeypotEl  = document.getElementById('f-honeypot');
  const status      = document.getElementById('formStatus');
  const btn         = document.getElementById('submitBtn');

  // Reset
  status.className   = 'form-status';
  status.textContent = '';

  // Honeypot — bots fill this, humans don't see it
  if (honeypotEl && honeypotEl.value !== '') {
    // Silently pretend success to confuse bots
    status.textContent = '✓ Message sent!';
    status.className   = 'form-status success';
    return;
  }

  const name    = nameEl.value.trim();
  const email   = emailEl.value.trim();
  const message = messageEl.value.trim();

  // Field presence
  if (!name || !email || !message) {
    status.textContent = '⚠ Please fill in all fields.';
    status.className   = 'form-status error';
    return;
  }

  // Name sanity
  if (name.length < 2) {
    status.textContent = '⚠ Please enter your full name.';
    status.className   = 'form-status error';
    return;
  }

  // Deep email validation
  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) {
    status.textContent = `⚠ ${emailCheck.reason}`;
    status.className   = 'form-status error';
    emailEl.focus();
    return;
  }

  // Message length
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

  // Rate limit check
  const rateCheck = checkRateLimit();
  if (!rateCheck.allowed) {
    status.textContent = `⚠ ${rateCheck.reason}`;
    status.className   = 'form-status error';
    return;
  }

  // Loading
  btn.disabled       = true;
  btn.textContent    = 'Sending...';
  status.textContent = 'Sending your message...';
  status.className   = 'form-status loading';

  if (!FORMSPREE_ID || FORMSPREE_ID === 'YOUR_FORM_ID' || FORMSPREE_ID === '') {
    setTimeout(() => {
      status.textContent = '✓ [Demo mode] Add Formspree ID to hugo.toml to enable sending.';
      status.className   = 'form-status success';
      btn.disabled       = false;
      btn.textContent    = 'Send Message →';
    }, 800);
    return;
  }

  try {
    const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify({ name, email, message })
    });

    if (res.ok) {
      // Track submission
      lastSubmitTime = Date.now();
      submitAttempts++;

      // Success state
      status.textContent   = '✓ Message sent! I\'ll get back to you soon.';
      status.className     = 'form-status success';
      btn.textContent      = '✓ Sent';
      btn.style.background = 'var(--accent3)';
      btn.style.color      = '#fff';

      // Clear fields
      nameEl.value    = '';
      emailEl.value   = '';
      messageEl.value = '';

      // Reset button after 5s
      setTimeout(() => {
        btn.disabled         = false;
        btn.textContent      = 'Send Message →';
        btn.style.background = '';
        btn.style.color      = '';
        status.textContent   = '';
        status.className     = 'form-status';
      }, 5000);

    } else {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `Server responded with ${res.status}`);
    }

  } catch (err) {
    console.error('Form error:', err);
    status.textContent = '✗ Failed to send. Please email me directly at mawaisqq@gmail.com';
    status.className   = 'form-status error';
    btn.disabled       = false;
    btn.textContent    = 'Send Message →';
  }
}

// Enter key on name/email
document.querySelectorAll('#f-name, #f-email').forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const btn = document.getElementById('submitBtn');
      if (btn) btn.click();
    }
  });
});
