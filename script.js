// Year stamp
document.getElementById('year').textContent = new Date().getFullYear();

// Staggered entrance for headline links
document.querySelectorAll('.headline-link').forEach((el, i) => {
  el.style.setProperty('--stagger', `${180 + i * 110}ms`);
});

// Scroll reveal
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// ── Language toggle ─────────────────────────────────────────────────────────

function applyLang(lang) {
  // Toggle hidden attribute on lang-fr / lang-en blocks
  document.querySelectorAll('.lang-fr, .lang-en').forEach(el => {
    el.hidden = !el.classList.contains('lang-' + lang);
  });

  // Short strings: swap text via data-fr / data-en
  document.querySelectorAll('[data-fr][data-en]').forEach(el => {
    el.textContent = el.dataset[lang];
  });

  // Toggle button shows the other language
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = lang === 'fr' ? 'EN' : 'FR';

  document.documentElement.lang = lang;
  localStorage.setItem('portfolio-lang', lang);
}

const savedLang = localStorage.getItem('portfolio-lang') || 'fr';
applyLang(savedLang);

document.getElementById('lang-toggle')?.addEventListener('click', () => {
  const current = document.documentElement.lang === 'en' ? 'en' : 'fr';
  applyLang(current === 'fr' ? 'en' : 'fr');
});
