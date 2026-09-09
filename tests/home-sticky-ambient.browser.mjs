import assert from 'node:assert/strict';
import { chromium } from '/Users/ob/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const out='docs/evidence/bishop-intro';
await mkdir(out,{recursive:true});
try {
  for(const width of [1111,390]) {
    const page=await browser.newPage({viewport:{width,height:912},hasTouch:width===390,isMobile:width===390});
    await page.route(/https:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
    await page.goto('http://127.0.0.1:8123/');
    await page.waitForFunction(()=>document.querySelector('#bishopIntro').classList.contains('is-painted'));
    const top=await page.locator('#clmiHome').evaluate(e=>e.offsetTop);
    // A visitor can stop midway through formation, not just at the final frame.
    await page.evaluate(()=>scrollTo({top:(document.querySelector('#bishopIntro').offsetHeight-innerHeight)*.45,behavior:'instant'}));
    await page.waitForTimeout(600);
    assert.ok(Number(await page.locator('.bishop-ambient').evaluate(e=>getComputedStyle(e).opacity))>.5,'side particles are visible while the portrait is still forming');
    const positions=()=>page.locator('.bishop-ambient i').evaluateAll(nodes=>nodes.map(e=>({y:e.getBoundingClientRect().y,opacity:Number(getComputedStyle(e).opacity)})));
    const idleY=await page.evaluate(()=>scrollY);
    let previous=await positions();
    for(let sample=0;sample<3;sample++) {
      await page.waitForTimeout(800);
      const next=await positions();
      const moving=next.filter((p,i)=>p.opacity>.25&&previous[i].opacity>.25&&Math.abs(p.y-previous[i].y)>5);
      assert.ok(moving.length>=8,'clearly visible side dust keeps travelling during each idle interval');
      assert.equal(await page.evaluate(()=>scrollY),idleY,'idle check must not scroll');
      previous=next;
    }
    for(const y of [top,top+700,100000]) {
      await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);
      await page.waitForTimeout(350);
      const header=page.locator(width===390?'.m-header':'.site-header');
      const r=await header.boundingBox();
      assert.ok(r.y>=-1&&r.y<2,'entire header must remain at the top, not translate the brand row away');
      if(width>390) {
        assert.ok(await page.locator('.site-header .brand').evaluate(e=>e.getBoundingClientRect().top)>=0,'logo must remain visible');
        assert.ok(await page.locator('.site-header .socials').evaluate(e=>e.getBoundingClientRect().top)>=0,'social icons must remain visible');
      }
    }
    await page.screenshot({path:`${out}/sticky-${width}.png`});
    if(width>390)assert.match(await page.locator('.site-header').evaluate(e=>getComputedStyle(e).backdropFilter),/blur/,'scrolled header uses backdrop glass');
    await page.evaluate(()=>scrollTo({top:(document.querySelector('#bishopIntro').offsetHeight-innerHeight)*.92,behavior:'instant'}));
    await page.waitForFunction(()=>document.querySelector('#bishopIntro').dataset.state==='revealed');
    const dust=page.locator('.bishop-ambient i');
    assert.ok(await dust.count()>5,'resting portrait should have ambient particles');
    const first=await dust.first().evaluate(e=>getComputedStyle(e).transform);
    await page.waitForTimeout(800);
    assert.notEqual(await dust.first().evaluate(e=>getComputedStyle(e).transform),first,'particles move with no scroll or mouse input');
    const bounds=await page.evaluate(()=>{
      const v=document.querySelector('#bishopIntro video').getBoundingClientRect();
      return [...document.querySelectorAll('.bishop-ambient i')].every(e=>{
        const r=e.getBoundingClientRect();return r.right<v.left+v.width*.30 || r.left>v.left+v.width*.72;
      });
    });
    assert.ok(bounds,'particles stay in side margins, not over portrait');
    const visibleSides=await dust.evaluateAll(nodes=>{
      const visible=nodes.map(e=>e.getBoundingClientRect()).filter(r=>r.left>=0&&r.right<=innerWidth&&r.bottom>0&&r.top<innerHeight);
      return visible.some(r=>r.left<innerWidth/2)&&visible.some(r=>r.left>innerWidth/2);
    });
    assert.ok(visibleSides,'both side margins have visible particles, including on phone');
    await page.screenshot({path:`${out}/ambient-${width}.png`});
    await page.evaluate(y=>scrollTo(0,y),top+1000);
    await page.waitForTimeout(150);
    assert.equal(await dust.first().evaluate(e=>getComputedStyle(e).animationPlayState),'paused','offscreen ambient motion pauses');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForTimeout(100);
    assert.equal(await dust.first().evaluate(e=>getComputedStyle(e).animationName),'none','motion preference disables particle animation');
    assert.equal(await page.locator('.bishop-ambient').evaluate(e=>getComputedStyle(e).display),'none','motion preference hides decorative particles');
    await page.close();
  }
  await writeFile(`${out}/sticky-ambient-report.json`,JSON.stringify({widths:[1111,390],stickyHeader:true,ambientIdleMotion:true,sideMarginsOnly:true,offscreenAndReducedPause:true},null,2));
  console.log('Sticky header and idle side-particle checks passed at 1111px and 390px.');
} finally {await browser.close();}
