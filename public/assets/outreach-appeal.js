/* Outreach appeal: scroll linked banners, word by word fill and timed rises. */
(() => {
  const s = document.querySelector('.oa');
  if (!s) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  // Split the headline into word spans, keeping <em> emphasis intact.
  const fill = s.querySelector('.oa-fill');
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 1) return walk(n);
    if (n.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) return frag.append(part);
      const w = document.createElement('span');
      w.className = 'w'; w.textContent = part; frag.append(w);
    });
    n.replaceWith(frag);
  });
  if (fill) walk(fill);
  const words = fill ? [...fill.querySelectorAll('.w')] : [];
  const rises = [...s.querySelectorAll('.oa-rise')];
  const t1 = s.querySelector('.oa-tape--1 span'), t2 = s.querySelector('.oa-tape--2 span');
  const start = performance.now();
  let visible = false, queued = false;

  function frame() {
    queued = false;
    if (reduce.matches) {
      words.concat(rises).forEach(n => n.classList.add('on'));
      return;
    }
    const vh = innerHeight, r = s.getBoundingClientRect();
    const p = clamp((vh - r.top) / (vh + r.height * .55));
    s.style.setProperty('--oa-p', p.toFixed(4));
    const [a, b] = (fill?.dataset.window || '.2 .56').split(' ').map(Number);
    const n = Math.round(clamp((p - a) / (b - a)) * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < n));
    rises.forEach(el => { if (el.getBoundingClientRect().top < vh * .9) el.classList.add('on'); });
    // Banners travel with scroll in opposite directions, plus a slow drift.
    const t = p * 900 + (performance.now() - start) / 1000 * 22;
    const w1 = t1.scrollWidth / 2, w2 = t2.scrollWidth / 2;
    t1.style.setProperty('--oa-x', -(t % w1) + 'px');
    t2.style.setProperty('--oa-x', ((t % w2) - w2) + 'px');
    if (visible) tick();
  }
  function tick() { if (!queued) { queued = true; requestAnimationFrame(frame); } }

  new IntersectionObserver(e => { visible = e[0].isIntersecting; if (visible) tick(); }, { rootMargin: '200px 0px' }).observe(s);
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', tick);
  reduce.addEventListener('change', tick);
  frame();
})();
