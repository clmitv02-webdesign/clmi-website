import assert from 'node:assert/strict';
import {readFile, readdir, stat} from 'node:fs/promises';
import test from 'node:test';
import {createHash} from 'node:crypto';

const root = new URL('../', import.meta.url);
const routes = (await readdir(new URL('public/', root), {withFileTypes:true})).filter(x=>x.isDirectory());
const pages = [];
for (const route of routes) {
  try { pages.push([route.name, await readFile(new URL(`public/${route.name}/index.html`,root),'utf8')]); } catch {}
}
test('38 inner routes each provide one responsive semantic page',()=>{
  assert.equal(pages.length,38);
  for (const [route,html] of pages) {
    assert.equal((html.match(/<main\b/g)||[]).length,1,route);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,route);
    assert.match(html,/<body[^>]*class="[^"]*clmi-inner/,route);
    assert.ok(html.includes('/assets/inner-pages.css'),route);
    assert.match(html,/<script defer src="\/assets\/inner-pages.js/,route);
    assert.doesNotMatch(html,/document\.body\.style\.zoom/,route);
  }
});
test('backup-derived ledger retains text, content media and link destinations',async()=>{
  const ledger=JSON.parse(await readFile(new URL('docs/inner-content-ledger.json',root),'utf8'));
  assert.equal(ledger.routes.length,38);
  const decode=s=>s.replace(/&amp;/g,'&').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  for (const entry of ledger.routes) {
    const source=await readFile(`${ledger.backup}/public/${entry.route}/index.html`,'utf8');
    assert.equal(createHash('sha256').update(source).digest('hex'),entry.sourceSha256,`${entry.route}: ledger source identity`);
    const html=pages.find(([r])=>r===entry.route)[1];
    const text=decode(html.replace(/<script\b[\s\S]*?<\/script>/g,'').replace(/<style\b[\s\S]*?<\/style>/g,'').replace(/<[^>]*>/g,' '));
    for(const value of entry.text) assert.ok(text.includes(decode(value)),`${entry.route}: text ${value}`);
    for(const src of entry.images) assert.ok(decode(html).includes(src),`${entry.route}: image ${src}`);
    for(const href of entry.links) assert.ok(decode(html).includes(`href="${href}"`),`${entry.route}: link ${href}`);
    for(const src of entry.media) assert.ok(decode(html).includes(src),`${entry.route}: media ${src}`);
    // Re-extract links and images from backup independently of the migration's inventory.
    for(const [,href] of source.matchAll(/<a\b[^>]*href="([^"]+)"/g)) assert.ok(decode(html).includes(`href="${decode(href)}"`),`${entry.route}: original destination ${href}`);
    const sourceMains=[...source.matchAll(/<main\b[\s\S]*?<\/main>/g)].map(m=>m[0]).join('');
    for(const [,src] of sourceMains.matchAll(/<img\b[^>]*src="([^"]+)"/g)) assert.ok(decode(html).includes(decode(src)),`${entry.route}: original content image ${src}`);
  }
});
test('four sparse pages include useful honest text and a contact pathway',()=>{
  for(const route of ['hospital-outreach','marriage-seminars','leadership-seminars','donations']) {
    const main=pages.find(([r])=>r===route)[1].match(/<main\b[\s\S]*?<\/main>/)?.[0]||'';
    assert.ok(main.replace(/<[^>]+>/g,'').trim().length>150,route);
    assert.match(main,/href="\/about-1"/,route);
    assert.doesNotMatch(main,/bank account|donate now|payment processor/i,route);
  }
});
test('Youth Movement names its six destination programs',()=>{
  const html=pages.find(([r])=>r==='youth-movement')[1];
  for(const title of ['Youth Service','Spiritual Growth','Community Building','Creative Expression','Outreach and Evangelism','Fun and Recreation']) assert.ok(html.includes(title),title);
  assert.equal((html.match(/class="story-card"/g)||[]).length,6);
});
test('inner route local images exist, including relative gallery references',async()=>{
  for(const [route,html] of pages) {
    for(const [,src] of html.matchAll(/<img\b[^>]*src="([^"]+)"/g)) {
      if(/^(https?:|data:)/.test(src))continue;
      const target=src.startsWith('/')?new URL(`public${src}`,root):new URL(src,new URL(`public/${route}/`,root));
      assert.ok((await stat(target)).isFile(),`${route}: ${src}`);
    }
  }
});
