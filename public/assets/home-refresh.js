/* Bounded scroll depth; the content is fully visible before enhancement. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const staticReview = new URLSearchParams(location.search).get('motion') === 'off';
  const motionOff = () => reduce.matches || staticReview;
  document.body.classList.toggle('motion-off', motionOff());
  const video = document.querySelector('.social-platform-video');
  let visible = false;
  let autoStarted = false;
  let userPaused = false;
  let programmaticPause = false;

  function playback() {
    if (!video) return;
    const shouldPlay = visible && !document.hidden && !motionOff() && !userPaused;
    if (shouldPlay && video.paused) {
      autoStarted = true;
      video.play().catch(() => {}); // Native controls remain usable if autoplay is denied.
    } else if (!shouldPlay && !video.paused) {
      programmaticPause = true;
      video.pause();
    }
  }
  if (video) {
    video.addEventListener('pause', () => {
      if (!programmaticPause && autoStarted && visible) userPaused = true;
      programmaticPause = false;
    });
    video.addEventListener('play', () => { userPaused = false; });
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      playback();
    }, { threshold: .12 }).observe(video);
    document.addEventListener('visibilitychange', playback);
    reduce.addEventListener('change', playback);
    if (motionOff()) {
      video.autoplay = false;
      if (!video.paused) { programmaticPause = true; video.pause(); }
    }
  }

  if (window.ScrollCraft && !motionOff()) {
    ScrollCraft.mount(document.querySelector('.canvas-wrap'));
    document.body.classList.add('motion-ready');
  }
  reduce.addEventListener('change', () => {
    document.body.classList.toggle('motion-off', motionOff());
    document.body.classList.toggle('motion-ready', !motionOff() && !!window.ScrollCraft?.instances.length);
  });
  let queued = false;
  function updateHeader() {
    document.body.classList.toggle('is-scrolled', window.scrollY > 160);
    queued = false;
  }
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(updateHeader); }
  }, { passive: true });
  updateHeader();
})();
