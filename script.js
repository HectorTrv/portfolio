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

// ── Cursor-following image preview ──────────────────────────────────────────
// Previews are moved to <body> so they escape the animation stacking context
// created by each .headline-link (CSS animations isolate z-index).

document.querySelectorAll('.headline-link').forEach(link => {
  const preview = link.querySelector('.headline-link__preview');
  if (!preview) return;

  // Move out of .headline-link to avoid its animation stacking context
  document.body.appendChild(preview);

  // Tight offset: preview sits 10px to the right, 10px above cursor tip
  const GAP = 10;

  function movePreview(e) {
    const pw = preview.offsetWidth;
    const ph = preview.offsetHeight;
    let x = e.clientX + GAP;
    let y = e.clientY - ph - GAP;

    // Clamp to viewport edges
    if (x + pw > window.innerWidth - 4)  x = e.clientX - pw - GAP;
    if (y < 4)                            y = e.clientY + GAP;

    preview.style.left = x + 'px';
    preview.style.top  = y + 'px';
  }

  link.addEventListener('mouseenter', e => {
    movePreview(e);
    preview.classList.add('is-visible');
  });

  link.addEventListener('mousemove', movePreview);

  link.addEventListener('mouseleave', () => {
    preview.classList.remove('is-visible');
  });
});

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
