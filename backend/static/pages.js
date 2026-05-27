/* DARAS — 3-language toggle for standalone pages */
function setLang(l) {
  const root = document.documentElement;
  root.classList.remove('lang-hi', 'lang-bn', 'lang-en');
  root.classList.add('lang-' + l);
  root.lang = l;
  document.querySelectorAll('.lang-btn').forEach(b => {
    const bl = b.dataset.lang || b.textContent.trim();
    b.classList.toggle('on', bl === l);
  });
  localStorage.setItem('daras-lang', l);
}
const saved = localStorage.getItem('daras-lang') || 'hi';
setLang(saved);

/* Scheme accordion */
document.querySelectorAll('.scheme-header').forEach(h => {
  h.addEventListener('click', () => {
    h.closest('.scheme-card').classList.toggle('open');
  });
});
