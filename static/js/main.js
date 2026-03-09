// ── THEME TOGGLE ────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// ── CURSOR ──────────────────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

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

// ── NAVBAR SCROLL ───────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// ── SCROLL REVEAL ───────────────────────────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });

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
  }, { threshold: 0.5 }).observe(statsBar);
}

// ── CONTACT FORM ────────────────────────────────────────────────────────
async function sendForm(FORMSPREE_ID) {
  const name    = document.getElementById('f-name').value.trim();
  const email   = document.getElementById('f-email').value.trim();
  const message = document.getElementById('f-message').value.trim();
  const status  = document.getElementById('formStatus');
  const btn     = document.getElementById('submitBtn');

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

  btn.disabled = true;
  btn.textContent = 'Sending...';
  status.textContent = 'Sending your message...';
  status.className = 'form-status loading';

  if (!FORMSPREE_ID || FORMSPREE_ID === 'YOUR_FORM_ID') {
    setTimeout(() => {
      status.textContent = '✓ [Demo mode] Set up Formspree to enable real sending.';
      status.className = 'form-status success';
      btn.textContent = 'Message Sent ✓';
      btn.style.background = 'var(--accent3)';
    }, 1200);
    return;
  }

  try {
    const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    if (res.ok) {
      status.textContent = "✓ Message sent! I'll get back to you soon.";
      status.className = 'form-status success';
      btn.textContent = 'Message Sent ✓';
      btn.style.background = 'var(--accent3)';
      document.getElementById('f-name').value    = '';
      document.getElementById('f-email').value   = '';
      document.getElementById('f-message').value = '';
    } else {
      throw new Error();
    }
  } catch {
    status.textContent = '✗ Something went wrong. Please email me directly.';
    status.className = 'form-status error';
    btn.disabled = false;
    btn.textContent = 'Send Message →';
  }
}

document.querySelectorAll('#f-name, #f-email').forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const id = document.getElementById('submitBtn')?.dataset.formspree || '';
      sendForm(id);
    }
  });
});
