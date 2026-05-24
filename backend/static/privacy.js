function setLang(l) {
  document.documentElement.lang = l;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('on', b.textContent.trim() === (l === 'hi' ? 'हिंदी' : 'EN')));
  localStorage.setItem('daras-lang', l);
}
// Load saved language
const saved = localStorage.getItem('daras-lang') || 'hi';
setLang(saved);
