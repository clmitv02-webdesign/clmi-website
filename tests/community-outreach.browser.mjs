import assert from 'node:assert/strict';
import {chromium} from '/Users/ob/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const titles=['Zoo Park Outreach Gallery','Katutura Street Evangelism','Kilimanjaro Outreach','Church Outreach · Walvis Bay','Donations to the Orphanage','Christmas Day at the Orphanage','Shona Bibles in Zimbabwe'];
const base=process.env.CLMI_BASE_URL||'http://127.0.0.1:8123';
const evidence=process.env.CLMI_EVIDENCE_DIR||'docs/evidence/community-outreach';
const browser=await chromium.launch({channel:'chrome',headless:true});
const report=[];
try {
  for(const width of [1111,390]) {
    const page=await browser.newPage({viewport:{width,height:912},hasTouch:width===390,isMobile:width===390});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
    for(let i=0;i<titles.length;i++) {
      await page.goto(`${base}/community-outreach/`);
      const card=page.locator('.event-card').nth(i);
      const heading=await card.locator('h2').innerText();
      await card.getByRole('link',{name:`View ${titles[i]}`,exact:true}).click();
      await page.waitForURL(url=>url.pathname!=='/community-outreach/');
      assert.equal(await page.locator('h1').innerText(),titles[i]);
      const photo=page.locator('.photo-grid img').first();
      await photo.scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>{const img=document.querySelector('.photo-grid img');return img?.complete&&img.naturalWidth>0;});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      report.push({width,heading,button:`View ${titles[i]}`,url:page.url(),destination:titles[i],photoLoaded:true});
    }
    await page.goto(`${base}/church-outreach/`);
    for(const [href,title] of [['/community-outreach','Community Outreach'],['/hospital-outreach','Hospital Outreach'],['/prison-outreach','Prison Outreach']]) {
      assert.equal(await page.locator(`main a[href="${href}"]`).count(),1);
      const response=await page.request.get(`${base}${href}/`);
      assert.equal(response.status(),200);assert.ok((await response.text()).includes(`<h1>${title}</h1>`));
    }
    await page.goto(`${base}/community-outreach/`);
    await mkdir(evidence,{recursive:true});
    await page.screenshot({path:`evidence}/${width}.png`,fullPage:true});
    assert.deepEqual(errors,[]);await page.close();
  }
  await writeFile(`${evidence}/report.json`,JSON.stringify(report,null,2));
  console.log(`Verified ${report.length} card navigations: seven at desktop and seven at mobile; destination headings and loaded photos; three parent outreach links at both widths.`);
} finally {await browser.close();}
