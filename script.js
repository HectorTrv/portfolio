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
