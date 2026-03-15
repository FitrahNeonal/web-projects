// ── HAMBURGER MENU ──
const hamburger     = document.getElementById('hamburger');
const mobileMenu    = document.getElementById('mobile-menu');
const mobileOverlay = document.getElementById('mobile-overlay');
const mobileLinks   = document.querySelectorAll('.mobile-menu a');

function toggleMenu(force) {
  const isOpen = force !== undefined ? force : !mobileMenu.classList.contains('open');
  mobileMenu.classList.toggle('open', isOpen);
  mobileOverlay.classList.toggle('open', isOpen);
  hamburger.classList.toggle('open', isOpen);
}

hamburger.addEventListener('click', () => toggleMenu());
mobileOverlay.addEventListener('click', () => toggleMenu(false));
mobileLinks.forEach(a => a.addEventListener('click', () => toggleMenu(false)));



// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal, .reveal-group');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObs.observe(el));

// ── SECTION LABEL LINE DRAW ──
const labels = document.querySelectorAll('.section-label');
const lineObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('line-visible');
      lineObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

labels.forEach(el => lineObs.observe(el));

// ── NAV: SHRINK ON SCROLL + ACTIVE SECTION HIGHLIGHT ──
const nav      = document.querySelector('nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('main section[id]');

window.addEventListener('scroll', () => {
  // Shrink nav saat scroll
  nav.classList.toggle('scrolled', window.scrollY > 40);

  // Tandai nav link yang aktif sesuai section yang terlihat
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 80) current = sec.id;
  });

  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}, { passive: true });



// ── GUESTBOOK ──
const SUPABASE_URL      = 'https://lsrhamzjytrspztkywxu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcmhhbXpqeXRyc3B6dGt5d3h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MjQzMjUsImV4cCI6MjA4OTEwMDMyNX0.lyo7UDC_Hz9_IVdKO0cNx4THpev_IDgyUhqAtKXIuZU';
const SB_HEADERS = {
  'Content-Type':  'application/json',
  'apikey':        SUPABASE_ANON_KEY,
  'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
};

async function gbLoad() {
  const el = document.getElementById('gb-entries');
  try {
    const res  = await fetch(`${SUPABASE_URL}/rest/v1/guestbook?select=*&order=created_at.desc&limit=20`, { headers: SB_HEADERS });
    const data = await res.json();
    if (!data.length) {
      el.innerHTML = '<div class="gb-loading">belum ada pesan. jadilah yang pertama! 👋</div>';
      return;
    }
    el.innerHTML = data.map(e => `
      <div class="gb-entry">
        <div class="gb-entry-header">
          <span class="gb-entry-name">${escape(e.name)}</span>
          <span class="gb-entry-date">${formatDate(e.created_at)}</span>
        </div>
        <div class="gb-entry-message">${escape(e.message)}</div>
      </div>`).join('');
  } catch {
    el.innerHTML = '<div class="gb-loading">gagal memuat pesan.</div>';
  }
}

async function gbSubmit() {
  const name    = document.getElementById('gb-name').value.trim();
  const message = document.getElementById('gb-message').value.trim();
  const status  = document.getElementById('gb-status');
  const btn     = document.getElementById('gb-submit');

  if (!name || !message) { status.textContent = 'nama dan pesan wajib diisi ya.'; return; }

  btn.disabled     = true;
  btn.textContent  = 'mengirim...';
  status.textContent = '';

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/guestbook`, {
      method:  'POST',
      headers: { ...SB_HEADERS, 'Prefer': 'return=minimal' },
      body:    JSON.stringify({ name, message })
    });
    if (!res.ok) throw new Error();
    document.getElementById('gb-name').value    = '';
    document.getElementById('gb-message').value = '';
    document.getElementById('gb-char').textContent = '280 karakter tersisa';
    status.textContent = 'pesan terkirim, terima kasih! 🎉';
    gbLoad();
  } catch {
    status.textContent = 'ada yang salah, coba lagi ya.';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'kirim →';
  }
}

function escape(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
}

// char counter
document.getElementById('gb-message').addEventListener('input', function() {
  const left = 280 - this.value.length;
  document.getElementById('gb-char').textContent = left + ' karakter tersisa';
});

document.getElementById('gb-submit').addEventListener('click', gbSubmit);

gbLoad();



// ── LAST UPDATED ──
// Ganti tanggal di bawah setiap kamu update website
const LAST_UPDATED = '2026-03-15';

const d = new Date(LAST_UPDATED);
document.getElementById('last-updated').textContent =
  d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });



// ── DARK MODE TOGGLE ──
const skyBtn = document.getElementById('sky-toggle');
const body   = document.body;

// ingat preferensi user
if (localStorage.getItem('dark') === 'true') body.classList.add('dark');

skyBtn.addEventListener('click', () => {
  const isDark = body.classList.contains('dark');

  if (!isDark) {
    // siang → malam: animasi tiup dulu
    skyBtn.classList.add('blowing');
    setTimeout(() => {
      skyBtn.classList.remove('blowing');
      body.classList.add('dark');
      localStorage.setItem('dark', 'true');
    }, 420);
  } else {
    // malam → siang: langsung
    body.classList.remove('dark');
    localStorage.setItem('dark', 'false');
  }
});