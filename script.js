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

// ── Page transitions ─────────────────────────────────────────────────────────

document.querySelectorAll('.pcard').forEach(card => {
  card.addEventListener('click', () => sessionStorage.setItem('vt', 'open'));
});

document.querySelector('.proj-close')?.addEventListener('click', () => {
  sessionStorage.setItem('vt', 'close');
});

// ── Tab switching ────────────────────────────────────────────────────────────

function moveIndicator(activeBtn) {
  const container = activeBtn.closest('.h-segmented');
  const indicator = container.querySelector('.h-segmented__indicator');
  indicator.style.width = activeBtn.offsetWidth + 'px';
  indicator.style.transform = `translateX(${activeBtn.offsetLeft - 3}px)`;
}

document.querySelectorAll('.h-segmented__btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.h-segmented__btn').forEach(b => {
      b.classList.remove('h-segmented__btn--active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('h-segmented__btn--active');
    btn.setAttribute('aria-selected', 'true');
    moveIndicator(btn);

    document.querySelectorAll('.h-tab-content').forEach(c => {
      c.hidden = true;
      c.classList.remove('is-entering');
    });

    const target = document.getElementById(btn.dataset.tab);
    target.hidden = false;
    void target.offsetWidth;
    target.classList.add('is-entering');
  });
});

// Init indicator on first active button
const initialActive = document.querySelector('.h-segmented__btn--active');
if (initialActive) moveIndicator(initialActive);

// ── GitHub hover card ────────────────────────────────────────────────────────

async function loadGitHubGraph() {
  try {
    const [userRes, contribRes] = await Promise.all([
      fetch('https://api.github.com/users/HectorTrv'),
      fetch('https://github-contributions-api.jogruber.de/v4/HectorTrv?y=last')
    ]);
    if (!userRes.ok || !contribRes.ok) throw new Error();

    const [user, { contributions }] = await Promise.all([
      userRes.json(),
      contribRes.json()
    ]);

    // Avatar
    const avatarEl = document.getElementById('gh-avatar');
    if (avatarEl) { avatarEl.src = user.avatar_url; avatarEl.alt = user.name || user.login; }

    // Nom
    const nameEl = document.getElementById('gh-name');
    if (nameEl) nameEl.textContent = user.name || user.login;

    // Stats
    const reposEl = document.getElementById('gh-repos');
    if (reposEl) reposEl.textContent = user.public_repos;

    const followersEl = document.getElementById('gh-followers');
    if (followersEl) followersEl.textContent = user.followers;

    renderGhGraph(contributions);
  } catch {
    document.querySelector('.gh-card')?.remove();
  }
}

function renderGhGraph(contributions) {
  const container = document.getElementById('gh-graph');
  if (!container) return;

  const COLORS = ['#181818', '#0e4429', '#006d32', '#26a641', '#39d353'];
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const CELL = 9, GAP = 2, STEP = 11;
  const WEEKS = 25; // 25 × 11 = 275px ≤ 270 content (300 - 30px padding)
  const LABEL_H = 15;

  const data = contributions.slice(-(WEEKS * 7));
  const firstDOW = new Date(data[0].date).getDay();
  const padded = Array(firstDOW).fill(null).concat(data);

  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  const svgW = weeks.length * STEP;
  const svgH = LABEL_H + 7 * STEP - GAP;
  const NS = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', svgW);
  svg.setAttribute('height', svgH);
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  // Labels de mois
  let prevMonth = -1;
  weeks.forEach((week, wi) => {
    const first = week.find(d => d);
    if (!first) return;
    const m = new Date(first.date).getMonth();
    if (m === prevMonth) return;
    prevMonth = m;
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', wi * STEP);
    t.setAttribute('y', LABEL_H - 4);
    t.setAttribute('font-size', '8.5');
    t.setAttribute('fill', 'rgba(255,255,255,0.35)');
    t.setAttribute('font-family', "'Geist', system-ui, sans-serif");
    t.textContent = MONTHS[m];
    svg.appendChild(t);
  });

  // Cellules — rendues opaques à 0 pour l'animation au hover
  weeks.forEach((week, wi) => {
    const full = week.length < 7 ? week.concat(Array(7 - week.length).fill(null)) : week;
    full.forEach((day, di) => {
      const rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('x', wi * STEP);
      rect.setAttribute('y', LABEL_H + di * STEP);
      rect.setAttribute('width', CELL);
      rect.setAttribute('height', CELL);
      rect.setAttribute('rx', 2);
      rect.setAttribute('fill', day ? COLORS[day.level] : COLORS[0]);
      rect.setAttribute('opacity', '0');
      rect.dataset.wi = wi;
      svg.appendChild(rect);
    });
  });

  container.appendChild(svg);
}

// Animation staggered des cellules au premier hover
let ghAnimated = false;
document.querySelector('.gh-wrap')?.addEventListener('mouseenter', () => {
  if (ghAnimated) return;
  ghAnimated = true;
  document.querySelectorAll('#gh-graph rect').forEach(rect => {
    const wi = parseInt(rect.dataset.wi, 10);
    rect.style.animation = `cellReveal 280ms cubic-bezier(0.22,1,0.36,1) ${wi * 14}ms forwards`;
  });
});

loadGitHubGraph();

// ── Lightbox ─────────────────────────────────────────────────────────────────

(function () {
  const images = Array.from(document.querySelectorAll('#tab-design .h-placeholder img'));
  if (!images.length) return;

  // Build DOM
  const overlay = document.createElement('div');
  overlay.className = 'lb-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  const imgWrap = document.createElement('div');
  imgWrap.className = 'lb-img-wrap';
  const img = document.createElement('img');
  imgWrap.appendChild(img);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'lb-close';
  closeBtn.setAttribute('aria-label', 'Fermer');
  closeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/></svg>`;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'lb-nav lb-prev';
  prevBtn.setAttribute('aria-label', 'Précédent');
  prevBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="10,3 5,8 10,13"/></svg>`;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'lb-nav lb-next';
  nextBtn.setAttribute('aria-label', 'Suivant');
  nextBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,3 11,8 6,13"/></svg>`;

  const counter = document.createElement('div');
  counter.className = 'lb-counter';

  overlay.append(imgWrap, closeBtn, prevBtn, nextBtn, counter);
  document.body.appendChild(overlay);

  let current = 0;

  function show(index) {
    current = index;
    img.src = images[current].src;
    img.alt = images[current].alt;
    counter.textContent = `${current + 1} / ${images.length}`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === images.length - 1;
  }

  function open(index) {
    show(index);
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  images.forEach((el, i) => el.addEventListener('click', () => open(i)));

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(current - 1));
  nextBtn.addEventListener('click', () => show(current + 1));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft' && current > 0) show(current - 1);
    if (e.key === 'ArrowRight' && current < images.length - 1) show(current + 1);
  });
})();

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

  // Page title
  document.title = lang === 'fr'
    ? 'Hector Travaillé — Designer Produit'
    : 'Hector Travaillé — Product Designer';

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
