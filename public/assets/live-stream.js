/* Keep this player on the newest verified CLMI broadcast, live or looping replay. */
(() => {
  const root = document.querySelector('[data-live-player]');
  if (!root) return;
  const frame = root.querySelector('iframe');
  const status = root.querySelector('[role="status"]');
  const retired = new Set();
  let service, player, ready = false, playbackFailed = false;
  let retriedAutoplay = false, checking = false, pollTimer;
  const report = (state, message) => {
    root.dataset.playback = state;
    status.textContent = message;
  };
  function loadSelected() {
    if (!ready) return;
    playbackFailed = false;
    report('connecting', service.kind === 'live' ? 'Connecting to the live service…' : 'Starting the latest service replay…');
    // No playlist, older fallback, or mute reset when a replay restarts.
    player.loadVideoById(service.videoId, 0);
  }
  function accept(candidate) {
    if (!service) {
      service = candidate;
      startPlayer();
      return;
    }
    if (candidate.videoId === service.videoId) {
      // A stale LIVE badge must not undo an end event or a completed-stream result.
      if (service.kind === 'live' && candidate.kind === 'replay') {
        service = candidate;
        loadSelected();
      }
      return;
    }
    if (retired.has(candidate.videoId)) return;
    const order = Array.isArray(candidate.streamOrder) ? candidate.streamOrder : [];
    const currentRank = order.indexOf(service.videoId);
    const nextRank = order.indexOf(candidate.videoId);
    // A different replay is only newer if the channel explicitly ranks it ahead
    // of this stream. Missing/lagging archives cannot send us to an older service.
    if (candidate.kind !== 'live' && !(nextRank >= 0 && currentRank > nextRank)) return;
    retired.add(service.videoId);
    service = candidate;
    retriedAutoplay = false;
    loadSelected();
  }
  async function checkService() {
    if (checking) return;
    checking = true;
    clearTimeout(pollTimer);
    try {
      const response = await fetch('/api/live-service', {cache:'no-store',signal:AbortSignal.timeout(8000)});
      if (!response.ok) throw new Error('Service lookup unavailable');
      const candidate = await response.json();
      if (!/^[A-Za-z0-9_-]{11}$/.test(candidate?.videoId) || !['live','replay'].includes(candidate.kind) || typeof candidate.title !== 'string') throw new Error('Invalid service');
      accept(candidate);
    } catch {
      if (!service) report('connecting', 'Checking for CLMI’s latest service. Retrying automatically…');
      // With a selected service, leave both the playback and its identity alone.
    } finally {
      if (playbackFailed) loadSelected();
      checking = false;
      pollTimer = setTimeout(checkService, 30000);
    }
  }
  function startPlayer() {
    const src = new URL(`https://www.youtube.com/embed/${service.videoId}`);
    for (const [key,value] of Object.entries({autoplay:'1',mute:'1',playsinline:'1',enablejsapi:'1',rel:'0',origin:window.location.origin})) src.searchParams.set(key,value);
    frame.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
    frame.src = src.href;
    report('connecting', service.kind === 'live' ? 'Connecting to the live service…' : 'Starting the latest service replay…');
    const apiTimeout = setTimeout(() => report('error','The YouTube player is taking longer to connect. You can also watch on YouTube below.'),20000);
    function connect() {
      player = new window.YT.Player(frame, {events:{
        onReady(event) {
          clearTimeout(apiTimeout);
          player = event.target;
          ready = true;
          player.mute();
          // A newer service may have appeared while the iframe was connecting.
          if (new URL(frame.src).pathname !== `/embed/${service.videoId}`) loadSelected();
          else player.playVideo();
        },
        onStateChange(event) {
          if (!ready) return;
          const videoUrl = event.target.getVideoUrl();
          const playingId = videoUrl ? new URL(videoUrl).searchParams.get('v') : null;
          if (playingId && playingId !== service.videoId) {
            if (event.data === 1 || event.data === 5) loadSelected();
            return;
          }
          if (event.data === 0) {
            service = {...service,kind:'replay'};
            loadSelected();
          } else if (event.data === 1) {
            playbackFailed = false;
            report(service.kind, service.kind === 'live' ? `Live service · ${service.title}` : `Latest service replay · ${service.title}`);
          }
        },
        onError() {
          playbackFailed = true;
          report('error','This service is temporarily unavailable on YouTube. Retrying this same service automatically; no older video will be substituted.');
        },
        onAutoplayBlocked(event) {
          if (!retriedAutoplay) {
            retriedAutoplay = true;
            event.target.mute();
            event.target.playVideo();
          } else report('blocked','Your browser has blocked automatic playback. Use the video’s play control to begin.');
        }
      }});
    }
    if (window.YT?.Player) connect();
    else {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {previous?.();connect();};
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = () => {
        clearTimeout(apiTimeout);
        report('error','The YouTube connection is unavailable. You can watch on YouTube below.');
      };
      document.head.append(script);
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) checkService();
  });
  checkService();
})();
