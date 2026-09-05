/* Extend the existing click menu with keyboard access and accurate state. */
(() => {
  const button = document.getElementById('mBurger');
  const nav = document.getElementById('mNav');
  if (!button || !nav) return;
  button.setAttribute('aria-controls', nav.id);
  const sync = () => button.setAttribute('aria-expanded', String(nav.classList.contains('open')));
  sync();
  new MutationObserver(sync).observe(nav, { attributes: true, attributeFilter: ['class'] });
  button.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); button.click(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open'); button.focus();
    }
  });
})();
