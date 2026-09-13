import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';

const source = new URL('../public/assets/live-stream.js', import.meta.url);
// YouTube is external; exercise our controller against its documented events.
async function setup(service={videoId:'LiveNow0001',kind:'live',title:'Sunday live service'}) {
  const status = {textContent: ''};
  const frame = {src: 'https://www.youtube.com/embed/live_stream?channel=UCqkrpCvbRCLEjc9v-jU67MQ', setAttribute(k,v) { this[k]=v; }};
  const root = {dataset: {replayId:'AdHCkko5Cmc', replayTitle:'Youth Sunday Service · 13 September 2026'}, querySelector: s => s==='iframe' ? frame : status};
  const calls = [];
  let events;
  const player = {mute:()=>calls.push('mute'),playVideo:()=>calls.push('play'),loadVideoById:id=>calls.push(['load',id])};
  const window = {location:{origin:'http://127.0.0.1:8123'},YT:{Player:class {constructor(f,options){events=options.events;return player;}}}};
  const document = {querySelector:()=>root, createElement:()=>({}),head:{append:()=>{}}};
  await vm.runInNewContext(existsSync(source)?readFileSync(source,'utf8'):'', {window,document,URL,console,AbortSignal,fetch:async()=>({ok:!!service,json:async()=>service}),setTimeout:()=>0,clearTimeout:()=>{}});
  return {frame,status,root,calls,player,get events(){return events;}};
}

test('loading the live page requests the resolved video with inline autoplay and a valid referrer',async()=>{
  const s=await setup(), url=new URL(s.frame.src);
  assert.equal(url.pathname,'/embed/LiveNow0001');
  assert.equal(url.searchParams.get('autoplay'),'1');
  assert.equal(url.searchParams.get('mute'),'1');
  assert.equal(url.searchParams.get('playsinline'),'1');
  assert.equal(url.searchParams.get('origin'),'http://127.0.0.1:8123');
  assert.equal(s.frame.referrerpolicy,'strict-origin-when-cross-origin');
});
test('player readiness starts muted playback automatically',async()=>{
  const s=await setup(); assert.ok(s.events,'controller connects to the YouTube API');
  s.events.onReady({target:s.player});
  assert.deepEqual(s.calls,['mute','play']);
});
test('unavailable live stream automatically plays the dated replay and never labels it live',async()=>{
  const s=await setup(); assert.ok(s.events);
  s.events.onError({data:100,target:s.player});
  assert.deepEqual(s.calls,['mute',['load','AdHCkko5Cmc']]);
  s.events.onStateChange({data:1,target:s.player});
  assert.match(s.status.textContent,/replay/i);
  assert.match(s.status.textContent,/13 September 2026/);
  assert.equal(s.root.dataset.playback,'replay');
});
test('a failed replay reports failure without looping or pretending playback succeeded',async()=>{
  const s=await setup(); assert.ok(s.events);
  s.events.onError({data:100,target:s.player});
  s.events.onError({data:101,target:s.player});
  assert.equal(s.calls.filter(x=>Array.isArray(x)).length,1);
  assert.equal(s.root.dataset.playback,'error');
  assert.match(s.status.textContent,/YouTube/i);
});
test('autoplay blocking gets one muted retry, then clear browser guidance',async()=>{
  const s=await setup(); assert.ok(s.events);
  s.events.onAutoplayBlocked({target:s.player});
  s.events.onAutoplayBlocked({target:s.player});
  assert.deepEqual(s.calls,['mute','play']);
  assert.match(s.status.textContent,/browser/i);
});
test('off-air uses the returned replay directly without trying an invalid channel video first',async()=>{
  const s=await setup({videoId:'AdHCkko5Cmc',kind:'replay',title:'Today’s service'});
  assert.equal(new URL(s.frame.src).pathname,'/embed/AdHCkko5Cmc');
  s.events.onStateChange({data:1,target:s.player});
  assert.equal(s.root.dataset.playback,'replay');
  assert.match(s.status.textContent,/Today’s service/);
});
test('lookup failure cannot claim to be live and uses the verified dated replay',async()=>{
  const s=await setup(null);
  assert.equal(new URL(s.frame.src).pathname,'/embed/AdHCkko5Cmc');
  s.events.onStateChange({data:1,target:s.player});
  assert.equal(s.root.dataset.playback,'replay');
  assert.match(s.status.textContent,/status unavailable/i);
});
