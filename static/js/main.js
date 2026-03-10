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
  // Touch device — hide custom cursor, restore default
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

// ── CONTACT FORM ────────────────────────────────────────────────────────
async function sendForm(FORMSPREE_ID) {
  const nameEl    = document.getElementById('f-name');
  const emailEl   = document.getElementById('f-email');
  const messageEl = document.getElementById('f-message');
  const status    = document.getElementById('formStatus');
  const btn       = document.getElementById('submitBtn');

  const name    = nameEl.value.trim();
  const email   = emailEl.value.trim();
  const message = messageEl.value.trim();

  // Reset status
  status.className = 'form-status';
  status.textContent = '';

  if (!name || !email || !message) {
    status.textContent = '⚠ Please fill in all fields.';
    status.className = 'form-status error';
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    status.textContent = '⚠ Please enter a valid email address.';
    status.className = 'form-status error';
    return;
  }

  // Loading state
  btn.disabled = true;
  btn.textContent = 'Sending...';
  status.textContent = 'Sending your message...';
  status.className = 'form-status loading';

  if (!FORMSPREE_ID || FORMSPREE_ID === 'YOUR_FORM_ID' || FORMSPREE_ID === '') {
    setTimeout(() => {
      status.textContent = '✓ [Demo mode] Formspree ID not set yet.';
      status.className = 'form-status success';
      btn.disabled = false;
      btn.textContent = 'Send Message →';
    }, 800);
    return;
  }

  try {
    const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    if (res.ok) {
      // Success — clear form, update button
      status.textContent = '✓ Message sent! I\'ll get back to you soon.';
      status.className = 'form-status success';
      btn.textContent = '✓ Sent';
      btn.style.background = 'var(--accent3)';
      btn.style.color = '#fff';

      nameEl.value    = '';
      emailEl.value   = '';
      messageEl.value = '';

      // Reset button after 4 seconds
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Send Message →';
        btn.style.background = '';
        btn.style.color = '';
        status.textContent = '';
        status.className = 'form-status';
      }, 4000);

    } else {
      const data = await res.json();
      throw new Error(data?.error || 'Form submission failed');
    }
  } catch (err) {
    status.textContent = '✗ Something went wrong. Email me directly at mawaisqq@gmail.com';
    status.className = 'form-status error';
    btn.disabled = false;
    btn.textContent = 'Send Message →';
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
