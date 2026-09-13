import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/assets/live-stream.js', import.meta.url),'utf8');
const live = {videoId:'LiveNow0001',kind:'live',title:'Sunday live service'};
const replay = {videoId:'Replay00001',kind:'replay',title:'Latest Sunday service'};
const flush = async()=>{for(let i=0;i<12;i++) await Promise.resolve();};
// Real controller; only the external YouTube API, network and clock are doubles.
async function setup(initial=replay) {
  const status={textContent:''}, frame={src:'',setAttribute(k,v){this[k]=v;}};
  const root={dataset:{replayId:'AdHCkko5Cmc',replayTitle:'Obsolete fallback'},querySelector:s=>s==='iframe'?frame:status};
  const calls=[], timers=new Map(); let next=initial, events, id='', clock=0, serial=0, requests=0;
  const player={mute:()=>calls.push('mute'),playVideo:()=>calls.push('play'),getVideoUrl:()=>`https://www.youtube.com/watch?v=${id}`,
    loadVideoById:(videoId,start)=>{id=videoId;calls.push(['load',videoId,start]);}};
  const window={location:{origin:'http://127.0.0.1:8123'},YT:{Player:class{constructor(f,o){id=new URL(f.src).pathname.split('/').pop();events=o.events;return player;}}}};
  const document={querySelector:()=>root,createElement:()=>({}),head:{append(){}},addEventListener(){}};
  const timer=(fn,delay)=>{const key=++serial;timers.set(key,{fn,at:clock+delay});return key;};
  vm.runInNewContext(source,{window,document,URL,console,AbortSignal,fetch:async()=>{
    requests++; const result=typeof next==='function'?await next():next;return {ok:!!result,json:async()=>result};
  },setTimeout:timer,clearTimeout:key=>timers.delete(key)});
  await flush();
  return {frame,status,root,calls,player,get events(){return events;},get requests(){return requests;},
    respond(value){next=value;},event(data){events.onStateChange({data,target:player});},wrongVideo(value){id=value;},
    async advance(ms){clock+=ms;const due=[...timers].filter(([,v])=>v.at<=clock);for(const [key,v] of due){timers.delete(key);v.fn();await flush();}},
    async ready(){events.onReady({target:player});await flush();}};
}

test('resolved video starts with muted inline autoplay and a valid referrer',async()=>{
  const s=await setup(live),url=new URL(s.frame.src);
  assert.equal(url.pathname,'/embed/LiveNow0001');
  for(const p of ['autoplay','mute','playsinline'])assert.equal(url.searchParams.get(p),'1');
  assert.equal(url.searchParams.get('origin'),'http://127.0.0.1:8123');
  assert.equal(s.frame.referrerpolicy,'strict-origin-when-cross-origin');
  await s.ready();assert.deepEqual(s.calls,['mute','play']);
});
test('each replay end restarts only that same stream at zero without remuting the viewer',async()=>{
  const s=await setup();await s.ready();s.calls.length=0;
  s.event(0);s.event(1);s.event(0);
  assert.deepEqual(s.calls,[['load','Replay00001',0],['load','Replay00001',0]]);
});
test('polling leaves an unchanged replay running and switches once to a new live broadcast',async()=>{
  const s=await setup();await s.ready();s.calls.length=0;
  await s.advance(30000);assert.deepEqual(s.calls,[]);
  s.respond(live);await s.advance(30000);
  assert.deepEqual(s.calls,[['load','LiveNow0001',0]]);
  s.event(1);assert.equal(s.root.dataset.playback,'live');
  await s.advance(30000);assert.equal(s.calls.length,1);
});
test('ended live broadcast becomes its own looping replay, never an earlier service',async()=>{
  const s=await setup(live);await s.ready();s.calls.length=0;s.event(0);
  s.respond(replay);await s.advance(30000);s.event(1);s.event(0);
  assert.deepEqual(s.calls,[['load','LiveNow0001',0],['load','LiveNow0001',0]]);
});
test('same broadcast marked completed by resolver changes to replay once',async()=>{
  const s=await setup(live);await s.ready();s.calls.length=0;
  s.respond({...live,kind:'replay'});await s.advance(30000);s.event(1);
  assert.equal(s.root.dataset.playback,'replay');assert.deepEqual(s.calls,[['load','LiveNow0001',0]]);
  await s.advance(30000);assert.equal(s.calls.length,1);
});
test('a stale live result cannot turn the just-ended broadcast back into live',async()=>{
  const s=await setup(live);await s.ready();s.event(0);s.calls.length=0;
  await s.advance(30000);s.event(1);
  assert.equal(s.root.dataset.playback,'replay');assert.deepEqual(s.calls,[]);
});
test('lookup or playback errors retain the chosen broadcast instead of loading hardcoded fallback',async()=>{
  const s=await setup(live);await s.ready();s.calls.length=0;s.respond(null);
  s.events.onError({data:100,target:s.player});await flush();
  assert.equal(s.root.dataset.playback,'error');assert.deepEqual(s.calls,[]);
  await s.advance(30000);
  assert.ok(s.calls.filter(Array.isArray).every(c=>c[1]==='LiveNow0001'));
  assert.ok(s.calls.filter(Array.isArray).length>0,'retry selected service, not another video');
});
test('initial lookup failure waits without choosing an old video and recovers on retry',async()=>{
  const s=await setup(null);assert.equal(s.frame.src,'');assert.match(s.status.textContent,/retry|checking|connect/i);
  s.respond(replay);await s.advance(30000);
  assert.equal(new URL(s.frame.src).pathname,'/embed/Replay00001');
});
test('only a replay ranked ahead of current may replace it after a missed live broadcast',async()=>{
  const s=await setup();await s.ready();s.calls.length=0;
  s.respond({...live,kind:'replay',streamOrder:['LiveNow0001','Replay00001']});await s.advance(30000);
  assert.deepEqual(s.calls,[['load','LiveNow0001',0]]);
  s.respond({...replay,streamOrder:['Replay00001','LiveNow0001']});await s.advance(30000);
  assert.equal(s.calls.length,1,'a retired broadcast cannot return from a stale result');
});
test('unexpected YouTube video selection is returned to the selected service',async()=>{
  const s=await setup();await s.ready();s.calls.length=0;s.wrongVideo('OtherVideo1');s.event(1);
  assert.deepEqual(s.calls,[['load','Replay00001',0]]);
});
test('autoplay blocking has one muted retry and then honest browser guidance',async()=>{
  const s=await setup();s.events.onAutoplayBlocked({target:s.player});s.events.onAutoplayBlocked({target:s.player});
  assert.deepEqual(s.calls,['mute','play']);assert.match(s.status.textContent,/browser/i);
});
test('in-flight lookup cannot undo an end event and polls do not overlap',async()=>{
  const s=await setup(live);await s.ready();s.calls.length=0;let finish;
  s.respond(()=>new Promise(resolve=>{finish=resolve;}));await s.advance(30000);
  s.event(0);await s.advance(30000);assert.equal(s.requests,2);
  finish(live);await flush();s.event(1);
  assert.equal(s.root.dataset.playback,'replay');assert.deepEqual(s.calls,[['load','LiveNow0001',0]]);
});
test('a retired live result cannot replace a newer broadcast',async()=>{
  const s=await setup(live);await s.ready();s.calls.length=0;
  s.respond({videoId:'NewLive0001',kind:'live',title:'New live service'});await s.advance(30000);
  s.respond(live);await s.advance(30000);
  assert.deepEqual(s.calls,[['load','NewLive0001',0]]);
});
test('player readiness uses a newer service discovered while the iframe was still connecting',async()=>{
  const s=await setup();s.respond(live);await s.advance(30000);await s.ready();
  assert.deepEqual(s.calls,['mute',['load','LiveNow0001',0]]);
});
test('malformed resolver responses never replace a verified stream',async()=>{
  const s=await setup();await s.ready();s.calls.length=0;
  for(const response of [{videoId:'bad',kind:'live',title:'No'},{...live,kind:'upcoming'},null]) {
    s.respond(response);await s.advance(30000);
  }
  assert.deepEqual(s.calls,[]);
});
