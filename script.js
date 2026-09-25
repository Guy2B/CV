
// Google Calendar Appointment Schedule → Google Meet
const BOOKING_URL = 'https://calendar.app.google/Pu8LTb2HCJGzw26Z6';

document.querySelectorAll('[data-booking-link]').forEach((link) => {
  if (BOOKING_URL) {
    link.href = BOOKING_URL;
    link.target = '_blank';
    link.rel = 'noopener';
  }
});

const root = document.documentElement;
const langButtons = [...document.querySelectorAll('.lang-option')];
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const header = document.querySelector('.site-header');
const progress = document.getElementById('scrollProgress');
const glow = document.querySelector('.cursor-glow');
let lang = 'en';

function setLanguage(next) {
  lang = ['en', 'fr', 'de'].includes(next) ? next : 'en';
  root.lang = lang;
  try { localStorage.setItem('gbLang', lang); } catch (e) {}

  document.querySelectorAll('[data-en]').forEach((el) => {
    const value = el.dataset[lang];
    if (value !== undefined) el.textContent = value;
  });

  langButtons.forEach((button) => {
    const active = button.dataset.lang === lang;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  const menu = document.getElementById('menuToggle');
  if (menu) {
    const ariaMap = {
      en: menu.dataset.enAriaLabel,
      fr: menu.dataset.frAriaLabel,
      de: menu.dataset.deAriaLabel
    };
    if (ariaMap[lang]) menu.setAttribute('aria-label', ariaMap[lang]);
  }

  const titles = {
    en: 'Guy Beaho — Executive Sales & Growth Leadership',
    fr: 'Guy Beaho — Direction commerciale, technologie & croissance',
    de: 'Guy Beaho — Executive Leadership, Vertrieb & Wachstum'
  };
  const descriptions = {
    en: 'Guy Beaho — international executive in sales, growth, industrial sensing, precision measurement and engineered B2B solutions.',
    fr: 'Guy Beaho — dirigeant international en ventes, croissance, technologies de capteurs, mesure de précision et solutions B2B industrielles.',
    de: 'Guy Beaho — internationaler Executive für Vertrieb, Wachstum, Sensorik, Präzisionsmesstechnik und technisch anspruchsvolle B2B-Lösungen.'
  };
  document.title = titles[lang];
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) metaDescription.setAttribute('content', descriptions[lang]);
}

langButtons.forEach((button) => {
  button.addEventListener('click', () => setLanguage(button.dataset.lang));
});

// English remains the default language for first-time visitors.
let storedLanguage = 'en';
try {
  const saved = localStorage.getItem('gbLang');
  if (['en','fr','de'].includes(saved)) storedLanguage = saved;
} catch (e) {}
setLanguage(storedLanguage);

document.getElementById('year').textContent = new Date().getFullYear();

function closeMenu() {
  menuToggle?.setAttribute('aria-expanded', 'false');
  mobileMenu?.classList.remove('open');
  mobileMenu?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
}
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  if (open) {
    closeMenu();
  } else {
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
  }
});
mobileMenu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -7% 0px' });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const sections = [
  { id: 'top', el: document.querySelector('.hero') },
  { id: 'impact', el: document.getElementById('impact') },
  { id: 'cases', el: document.getElementById('cases') },
  { id: 'experience', el: document.getElementById('experience') },
  { id: 'expertise', el: document.getElementById('expertise') },
  { id: 'education', el: document.getElementById('education') },
  { id: 'ventures', el: document.getElementById('ventures') },
  { id: 'contact', el: document.getElementById('contact') }
].filter((x) => x.el);

const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const railLinks = [...document.querySelectorAll('.section-rail a')];

const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;

  const current = sections.find((s) => s.el === visible.target)?.id;
  if (!current) return;

  navLinks.forEach((a) => {
    const href = a.getAttribute('href')?.slice(1);
    a.classList.toggle('active', href === current);
  });
  railLinks.forEach((a) => {
    a.classList.toggle('active', a.dataset.rail === current);
  });
}, { threshold: [0.2, 0.45, 0.65], rootMargin: '-18% 0px -45% 0px' });

sections.forEach((s) => sectionObserver.observe(s.el));

function updateScrollUI() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.min(1, y / max) : 0;
  if (progress) progress.style.width = `${pct * 100}%`;
  header?.classList.toggle('scrolled', y > 18);
}
updateScrollUI();
window.addEventListener('scroll', updateScrollUI, { passive: true });

const finePointer = window.matchMedia('(pointer:fine)').matches;
if (finePointer) {
  window.addEventListener('pointermove', (e) => {
    if (glow) {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    }
  }, { passive: true });

  document.querySelectorAll('.venture-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  const visual = document.querySelector('.hero-visual');
  const portrait = document.querySelector('.portrait-frame');
  if (visual && portrait && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    visual.addEventListener('pointermove', (e) => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      portrait.style.transform = `rotateY(${x * 2.4}deg) rotateX(${-y * 2.2}deg)`;
    });
    visual.addEventListener('pointerleave', () => {
      portrait.style.transform = '';
    });
  }
}


// ===== V19 premium interactions =====
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.button, .header-cta').forEach((button) => {
    button.addEventListener('pointermove', (e) => {
      const r = button.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .08;
      const y = (e.clientY - r.top - r.height / 2) * .08;
      button.style.transform = `translate(${x}px, ${y}px)`;
    });
    button.addEventListener('pointerleave', () => {
      button.style.transform = '';
    });
  });

  document.querySelectorAll('.venture-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `translateY(-5px) rotateX(${-py * 1.2}deg) rotateY(${px * 1.2}deg)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

// Gentle header hide/reveal only after hero; improves reading without feeling app-like.
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const movingDown = y > lastY;
  const pastHero = y > window.innerHeight * .72;

  if (header && pastHero && movingDown && y - lastY > 2) {
    header.style.transform = 'translateY(-102%)';
  } else if (header) {
    header.style.transform = '';
  }
  lastY = y;
}, { passive:true });
