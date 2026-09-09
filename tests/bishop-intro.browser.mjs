import assert from 'node:assert/strict';
import { chromium } from '/Users/ob/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const out = 'docs/evidence/bishop-intro';
await mkdir(out, { recursive: true });
const results = [];
try {
  const cold = await browser.newPage();
  let releaseScript;
  const holdScript = new Promise(resolve=>{releaseScript=resolve;});
  await cold.route('**/bishop-intro.js?*',async route=>{await holdScript;await route.continue();});
  await cold.goto('http://127.0.0.1:8123/',{waitUntil:'commit'});
  await cold.locator('.bishop-intro-poster').waitFor({state:'attached'});
  const earlyVisibility=await cold.locator('.bishop-intro-poster').evaluate(e=>getComputedStyle(e).visibility);
  releaseScript();
  assert.equal(earlyVisibility,'hidden','completed portrait must not flash before enhancement loads');
  await cold.close();
  results.push({name:'cold-load',earlyPortrait:'hidden'});
  for (const [name, viewport, reducedMotion] of [
    ['desktop', {width:1440,height:900}, 'no-preference'],
    ['desktop-narrow', {width:1111,height:912}, 'no-preference'],
    ['phone', {width:390,height:844}, 'no-preference'],
    ['reduced', {width:390,height:844}, 'reduce'],
  ]) {
    const page = await browser.newPage({ viewport, reducedMotion, isMobile:name==='phone', hasTouch:name==='phone' });
    const errors = []; const media = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (r.url().includes('bishop-intro-') && r.url().endsWith('.mp4')) media.push(r.url()); });
    // Third-party embeds aren't the feature under test. Never interact with forms.
    await page.route(/https:\/\/(?!127\.0\.0\.1)/, route => route.abort());
    await page.goto('http://127.0.0.1:8123/', {waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('#bishopIntro').count(), 1, 'homepage must have its scroll opening');
    assert.equal(await page.locator('#bishopIntro a').count(),0,'intro must not show the rejected entry link');
    assert.equal(await page.locator('#bishopIntro h1').innerText(),'Welcome to CLMI','arrival has the requested welcome');
    if (reducedMotion === 'reduce') {
      await page.waitForTimeout(600);
      assert.equal(media.length, 0, 'reduced motion must not fetch reveal videos');
      assert.ok(await page.locator('#bishopIntro').evaluate(e=>e.offsetHeight) <= viewport.height, 'reduced motion must not pin');
      await page.screenshot({path:`${out}/${name}.png`});
    } else {
      await page.waitForFunction(() => document.querySelector('#bishopIntro').dataset.state === 'scrubbing');
      const travel = await page.locator('#bishopIntro').evaluate(e => e.offsetHeight - innerHeight);
      const revealTravel = travel * .9;
      await page.waitForTimeout(1100);
      assert.ok(await page.locator('.bishop-intro-welcome').evaluate(e=>Number(getComputedStyle(e).opacity))>.99,'welcome is visible on arrival');
      assert.equal(await page.locator('.bishop-intro-art').evaluate(e=>e.getBoundingClientRect().height),viewport.height,'art stage fills the viewport without caption bands');
      await page.screenshot({path:`${out}/${name}-start.png`});
      // Decode a real painted frame at ten points; a moving playhead alone can
      // hide a frozen poster or a decoder that never produces new image data.
      let previousPixels=null;
      const frameDeltas=[];
      for(let n=0;n<=10;n++) {
        const seconds=n*.75;
        await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),revealTravel*n/10);
        await page.waitForFunction(t=>{const v=document.querySelector('#bishopIntro video');return !v.seeking&&Math.abs(v.currentTime-t)<.035;},seconds);
        const pixels=await page.locator('#bishopIntro video').evaluate(v=>{
          const c=document.createElement('canvas');c.width=64;c.height=36;
          const x=c.getContext('2d');x.drawImage(v,0,0,64,36);
          return Array.from(x.getImageData(0,0,64,36).data);
        });
        if(previousPixels) {
          const delta=pixels.reduce((sum,p,i)=>sum+Math.abs(p-previousPixels[i]),0)/pixels.length;
          assert.ok(delta>.015,`decoded frame must change at scroll step ${n}, received ${delta}`);
          frameDeltas.push(Number(delta.toFixed(4)));
        }
        previousPixels=pixels;
      }
      results.push({name:`${name}-decoded-sweep`,frameDeltas});
      await page.evaluate(y=>scrollTo(0,y), revealTravel * .5);
      await page.waitForFunction(() => { const v=document.querySelector('#bishopIntro video'); return v && !v.seeking && v.currentTime > 3.3 && v.currentTime < 4.2; });
      await page.screenshot({path:`${out}/${name}-middle.png`});
      assert.equal(await page.locator('.bishop-intro-welcome').evaluate(e=>Number(getComputedStyle(e).opacity)),0,'welcome clears the portrait when scrolling');
      if(name.startsWith('desktop')) {
        await page.mouse.move(viewport.width*.52,viewport.height*.5);
        await page.waitForTimeout(450);
        assert.ok(await page.locator('#bishopIntro').evaluate(e=>Number(e.dataset.reaction)>.9),'magnifier must work mid-reveal, not require final-frame timing');
        await page.screenshot({path:`${out}/${name}-mid-lens.png`});
        await page.mouse.wheel(0,100);
        await page.waitForTimeout(450);
        assert.ok(await page.locator('#bishopIntro').evaluate(e=>Number(e.dataset.reaction)>.9),'wheel scrolling must not reset the lens under a stationary pointer');
      }
      await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}), revealTravel);
      await page.waitForFunction(()=>document.querySelector('#bishopIntro').dataset.state==='revealed');
      assert.ok(travel-revealTravel>60 && travel-revealTravel<viewport.height*.25,'completed portrait has a short scroll hold');
      const join=await page.evaluate(()=>{
        const r=document.querySelector('#bishopIntro video').getBoundingClientRect();
        return {portraitBottom:r.top+r.height*.97,stageBottom:document.querySelector('.bishop-intro-stage').getBoundingClientRect().bottom};
      });
      assert.ok(Math.abs(join.portraitBottom-join.stageBottom)<4,'portrait lower edge sits flush with stage, including narrow screens');
      await page.evaluate(y=>scrollTo(0,y), travel);
      await page.waitForFunction(() => document.querySelector('#bishopIntro').dataset.state === 'revealed');
      await page.mouse.move(viewport.width *.52, viewport.height *.50);
      await page.waitForTimeout(600);
      if (name.startsWith('desktop')) {
        assert.ok(await page.locator('#bishopIntro').evaluate(e=>Number(e.dataset.reaction)>0.2), 'formed portrait responds under pointer');
        assert.equal(await page.locator('#bishopIntro canvas').evaluate(e=>getComputedStyle(e).visibility),'visible','reaction actually paints');
      } else {
        assert.equal(await page.locator('#bishopIntro canvas').count(),0,'touch-only phone does not allocate a hover renderer');
      }
      await page.screenshot({path:`${out}/${name}-revealed.png`});
      await page.mouse.move(2,2);
      await page.waitForTimeout(900);
      assert.ok(await page.locator('#bishopIntro').evaluate(e=>Number(e.dataset.reaction)<0.02), 'reaction settles after leaving portrait');
      await page.screenshot({path:`${out}/${name}-rest.png`});
      if(name==='phone') {
        await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),travel+200);
        await page.waitForTimeout(100);
        assert.equal(await page.locator('.m-header').evaluate(e=>getComputedStyle(e).visibility),'visible','mobile header appears as soon as it follows the portrait, not as an empty band');
        await page.screenshot({path:`${out}/phone-join.png`});
      }
      await page.evaluate(y=>scrollTo(0,y), revealTravel*.25);
      await page.waitForFunction(() => { const v=document.querySelector('#bishopIntro video'); return !v.seeking && v.currentTime>1.5 && v.currentTime<2.2; });
      assert.equal(await page.locator('#bishopIntro').getAttribute('data-state'),'scrubbing','scrolling back reverses the video');
      await page.screenshot({path:`${out}/${name}-reverse.png`});
      await page.evaluate(()=>scrollTo({top:document.querySelector('#clmiHome').offsetTop,behavior:'instant'}));
      // The existing site has smooth anchor scrolling; wait for its destination,
      // not an arbitrary half-second that races the browser's native animation.
      await page.waitForFunction(()=>Math.abs(document.querySelector('#clmiHome').getBoundingClientRect().top)<2);
      const header=page.locator(name==='phone'?'.m-header':'.site-header');
      assert.ok(await header.evaluate(e => e.getBoundingClientRect().top < 150), 'scroll reaches original header');
      assert.equal(await page.locator('.playlists iframe').count(),3,'three existing YouTube embeds retained');
      assert.equal(await page.locator('.ministry-grid .card').count(),8,'eight existing ministry cards retained');
      await page.screenshot({path:`${out}/${name}-site.png`});
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth),false,'no horizontal overflow');
    assert.deepEqual(errors,[],'no page errors');
    results.push({name,errors,videoRequests:media.length});
    await page.close();
  }
  const nojs = await browser.newPage({ javaScriptEnabled:false, viewport:{width:390,height:844} });
  await nojs.goto('http://127.0.0.1:8123/');
  assert.ok(await nojs.locator('#bishopIntro').evaluate(e=>e.offsetHeight)<=844,'no-JS intro stays compact');
  await nojs.mouse.wheel(0,844);
  await nojs.waitForTimeout(500);
  assert.ok(await nojs.locator('.m-header').evaluate(e=>e.getBoundingClientRect().top)<150,'no-JS native scroll reaches the site');
  results.push({name:'no-js',nativeScroll:true});
  const fail = await browser.newPage({viewport:{width:390,height:844}});
  await fail.route('**/bishop-intro-*.mp4',route=>route.abort());
  await fail.goto('http://127.0.0.1:8123/');
  await fail.waitForFunction(()=>document.querySelector('#bishopIntro').dataset.state==='static');
  assert.ok(await fail.locator('#bishopIntro').evaluate(e=>e.offsetHeight)<=844,'video failure cannot trap visitors');
  results.push({name:'media-failure',static:true});
  await writeFile(`${out}/report.json`,JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
} finally { await browser.close(); }
