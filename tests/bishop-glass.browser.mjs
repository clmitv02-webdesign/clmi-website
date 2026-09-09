import assert from 'node:assert/strict';
import { chromium } from '/Users/ob/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs';
import sharp from '/Users/ob/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.cjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  if(process.env.GLASS_BASELINE==='old') {
    const old=await readFile('/Users/ob/Documents/Claude/clmi-site-backups/bishop-intro-before-soft-glass-20260909.js','utf8');
    await page.route('**/bishop-intro.js?*',r=>r.fulfill({contentType:'text/javascript',body:old}));
  }
  await page.route(/https:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
  await page.goto('http://127.0.0.1:8123/');
  await page.waitForFunction(()=>document.querySelector('#bishopIntro').classList.contains('is-painted'));
  await page.evaluate(()=>scrollTo(0,(document.querySelector('#bishopIntro').offsetHeight-innerHeight)*.92));
  await page.waitForFunction(()=>document.querySelector('#bishopIntro').dataset.state==='revealed');
  // Compare the same renderer with the pointer far away, avoiding unrelated
  // browser video-vs-WebGL resampling differences in fine source typography.
  await page.mouse.move(790,700);
  await page.waitForTimeout(600);
  const before=await page.screenshot();
  const mouse={x:790,y:190};
  await page.mouse.move(mouse.x,mouse.y);
  await page.waitForTimeout(700);
  const after=await page.screenshot();
  const a=await sharp(before).removeAlpha().raw().toBuffer();
  const b=await sharp(after).removeAlpha().raw().toBuffer();
  let inner=0,outer=0,ni=0,no=0;
  for(let y=25;y<355;y++)for(let x=625;x<955;x++) {
    const r=Math.hypot(x-mouse.x,y-mouse.y),i=(y*1440+x)*3;
    const d=(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]))/3;
    if(r>15&&r<60){inner+=d;ni++;}
    if(r>105&&r<155){outer+=d;no++;}
  }
  const result={localChange:inner/ni,outsideSmallFootprintChange:outer/no};
  await mkdir('docs/evidence/bishop-intro',{recursive:true});
  await writeFile('docs/evidence/bishop-intro/glass-before.png',before);
  await writeFile('docs/evidence/bishop-intro/glass-after.png',after);
  console.log(result);
  assert.ok(result.localChange>.2,'pointer should visibly refract the lettering');
  assert.ok(result.outsideSmallFootprintChange<1.5,'no large circular lens or rim outside the small local glass area');
  assert.notEqual(await page.locator('.bishop-intro-art').evaluate(e=>getComputedStyle(e).cursor),'none','keep native pointer visible');
  await writeFile('docs/evidence/bishop-intro/glass-report.json',JSON.stringify(result,null,2));
} finally {await browser.close();}
