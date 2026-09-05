export function sceneState(top, height, viewportHeight, duration) {
  const progress = Math.max(0, Math.min(1, (viewportHeight - top) / Math.max(1, height + viewportHeight)));
  return { progress, time: progress * (Number.isFinite(duration) ? Math.max(0,duration-.1) : 0), drift:progress*28 };
}
