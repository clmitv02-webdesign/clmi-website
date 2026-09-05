/* Progressive enhancement: page content and links do not depend on this file. */
(() => {
  document.body.classList.add('has-js');
  const menuButton = document.getElementById('mBurger');
  const mobileNav = document.getElementById('mNav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => mobileNav.classList.toggle('open'));
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const staticReview = new URLSearchParams(location.search).get('motion') === 'off';
  function syncMotion() {
    const off = reduce.matches || staticReview;
    document.body.classList.toggle('motion-off', off);
    document.body.classList.toggle('motion-ready', !off && !!window.ScrollCraft);
  }
  if (window.ScrollCraft) ScrollCraft.mount(document.querySelector('main'));
  syncMotion();
  reduce.addEventListener('change', syncMotion);
  let queued = false;
  function update() {
    document.body.classList.toggle('is-scrolled', scrollY > 160);
    queued = false;
  }
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, {passive:true});
  update();
})();
