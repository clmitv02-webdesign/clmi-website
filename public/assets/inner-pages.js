/* Progressive enhancement: page content and links do not depend on this file. */
(() => {
  document.body.classList.add('has-js');
  const branchSearch = document.getElementById('branch-search');
  if (branchSearch) {
    const contacts = [...document.querySelectorAll('.branch-card')];
    const count = document.getElementById('branch-count');
    branchSearch.addEventListener('input', () => {
      const query = branchSearch.value.trim().toLocaleLowerCase();
      let visible = 0;
      contacts.forEach(card => {
        card.hidden = !card.textContent.toLocaleLowerCase().includes(query);
        if (!card.hidden) visible++;
      });
      count.textContent = visible + ' of ' + contacts.length + ' branch contacts';
    });
  }
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
