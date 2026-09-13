/* Go Live is the only launch action. YouTube remains the video player. */
(async () => {
  const root = document.querySelector('[data-live-player]');
  if (!root) return;
  const frame = root.querySelector('iframe');
  const status = root.querySelector('[role="status"]');
  let service;
  let lookupFailed = false;
  try {
    const response = await fetch('/api/live-service', {signal: AbortSignal.timeout(8000)});
    if (!response.ok) throw new Error('Service lookup unavailable');
    service = await response.json();
    if (!/^[A-Za-z0-9_-]{11}$/.test(service.videoId) || !['live','replay'].includes(service.kind) || typeof service.title !== 'string') throw new Error('Invalid service');
  } catch {
    lookupFailed = true;
    service = {videoId:root.dataset.replayId,kind:'replay',title:root.dataset.replayTitle};
  }
  const src = new URL(`https://www.youtube.com/embed/${service.videoId}`);
  for (const [key, value] of Object.entries({autoplay: '1', mute: '1', playsinline: '1', enablejsapi: '1', rel: '0', origin: window.location.origin})) {
    src.searchParams.set(key, value);
  }
  frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  frame.src = src.href;
  let replay = service.kind === 'replay';
  let retriedAutoplay = false;
  const report = (state, message) => {
    root.dataset.playback = state;
    status.textContent = message;
  };
  report('connecting', replay ? 'Starting a recent service replay…' : 'Connecting to the live service…');
  const apiTimeout = setTimeout(() => report('error', 'The YouTube player is taking longer to connect. You can also watch on YouTube below.'), 20000);
  function connect() {
    new window.YT.Player(frame, {
      events: {
        onReady(event) {
          clearTimeout(apiTimeout);
          event.target.mute();
          event.target.playVideo();
        },
        onStateChange(event) {
          if (event.data !== 1) return;
          report(replay ? 'replay' : 'live', replay
            ? `${lookupFailed ? 'Live status unavailable · ' : ''}Recent service replay · ${service.title}`
            : 'Live service');
        },
        onError(event) {
          if (!replay) {
            replay = true;
            service = {videoId:root.dataset.replayId,kind:'replay',title:root.dataset.replayTitle};
            report('connecting', 'The live stream is unavailable. Starting a recent service replay…');
            event.target.mute();
            event.target.loadVideoById(root.dataset.replayId);
          } else {
            report('error', 'YouTube could not play this service here. Please use the YouTube link below.');
          }
        },
        onAutoplayBlocked(event) {
          if (!retriedAutoplay) {
            retriedAutoplay = true;
            event.target.mute();
            event.target.playVideo();
          } else {
            report('blocked', 'Your browser has blocked automatic playback. Use the video’s play control to begin.');
          }
        }
      }
    });
  }
  if (window.YT?.Player) connect();
  else {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previous?.(); connect(); };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => {
      clearTimeout(apiTimeout);
      report('error', 'The YouTube connection is unavailable. You can watch on YouTube below.');
    };
    document.head.append(script);
  }
})();
