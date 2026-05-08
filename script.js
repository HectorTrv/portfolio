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
  // Body class drives CSS visibility of .lang-fr / .lang-en blocks
  document.body.classList.toggle('lang-en', lang === 'en');

  // Short strings: elements with data-fr / data-en attributes
  document.querySelectorAll('[data-fr][data-en]').forEach(el => {
    el.textContent = el.dataset[lang];
  });

  // Toggle button label shows the *other* language
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = lang === 'fr' ? 'EN' : 'FR';

  // Update <html lang>
  document.documentElement.lang = lang;

  localStorage.setItem('portfolio-lang', lang);
}

const savedLang = localStorage.getItem('portfolio-lang') || 'fr';
applyLang(savedLang);

document.getElementById('lang-toggle')?.addEventListener('click', () => {
  const current = document.body.classList.contains('lang-en') ? 'en' : 'fr';
  applyLang(current === 'fr' ? 'en' : 'fr');
});
