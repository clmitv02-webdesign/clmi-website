import test from 'node:test';
import assert from 'node:assert/strict';
test('scroll timeline clamps before and after the youth story', async () => {
  const { sceneState } = await import('../public/assets/youth-scene-model.mjs');
  assert.deepEqual(sceneState(1000, 2000, 800, 24), { progress:0, time:0, drift:0 });
  assert.deepEqual(sceneState(-2400, 2000, 800, 24), { progress:1, time:23.9, drift:28 });
});
test('scrolling halfway through the story moves the media and text halfway', async () => {
  const { sceneState } = await import('../public/assets/youth-scene-model.mjs');
  const state = sceneState(-600, 2000, 800, 24);
  assert.equal(state.progress,.5);
  assert.equal(state.time,11.95);
  assert.equal(state.drift,14);
});
test('unloaded video duration never yields an invalid seek', async () => {
  const { sceneState } = await import('../public/assets/youth-scene-model.mjs');
  assert.equal(sceneState(-600,2000,800,NaN).time,0);
});
