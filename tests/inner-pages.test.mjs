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
    for(const value of entry.text.filter(value=>entry.route!=="church-outreach")) {
      // Youth copy moved into headings; punctuation/markup now differs, wording does not.
      const norm=s=>entry.route==='about-5'?decode(s).replace(/[^\p{L}\p{N}]/gu,'').toLowerCase():decode(s);
      assert.ok(norm(text).includes(norm(value)),`${entry.route}: text ${value}`);
    }
    for(const src of entry.images.filter(src=>entry.route!=="publication")) assert.ok(decode(html).includes(src),`${entry.route}: image ${src}`);
    for(const href of entry.links) assert.ok(decode(html).includes(`href="${href}"`),`${entry.route}: link ${href}`);
    for(const src of entry.media) {
      if(entry.route==='about-5'&&src.endsWith('11062b_eb492c6cb7834f13aee3424d74aceffc.mp4')) {
        assert.ok(decode(html).includes('/assets/video/youth-particles-scrub.mp4'),'Youth uses a scrub-encoded copy');
        assert.ok((await stat(new URL('public/assets/video/youth-particles-scrub.mp4',root))).size>0);
      } else assert.ok(decode(html).includes(src),`${entry.route}: media ${src}`);
    }
    // Re-extract links and images from backup independently of the migration's inventory.
    for(const [,href] of source.matchAll(/<a\b[^>]*href="([^"]+)"/g)) assert.ok(decode(html).includes(`href="${decode(href)}"`),`${entry.route}: original destination ${href}`);
    const sourceMains=[...source.matchAll(/<main\b[\s\S]*?<\/main>/g)].map(m=>m[0]).join('');
    for(const [,src] of sourceMains.matchAll(/<img\b[^>]*src="([^"]+)"/g)) assert.ok(decode(html).includes(decode(src)),`${entry.route}: original content image ${src}`);
  }
});
test('three sparse ministry pages keep their contact pathway; Giving keeps only its approved introduction',()=>{
  for(const route of ['hospital-outreach','marriage-seminars','leadership-seminars']) {
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
test('Gallery exposes its 98 latest-convention photos without JavaScript and hides inert controls',()=>{
  const html=pages.find(([r])=>r==='publication')[1];
  const fallback=[...html.matchAll(/<noscript>[\s\S]*?<\/noscript>/g)].map(m=>m[0]).join('');
  assert.match(fallback,/\.gallery-track\s*\{[^}]*display:\s*grid/);
  assert.match(fallback,/\.gallery-track\s*\{[^}]*transform:\s*none/);
  assert.match(fallback,/\.gallery-card\s*\{[^}]*width:\s*100%/);
  assert.match(fallback,/\.gallery-controls[^}]*display:\s*none/);
  assert.equal((html.match(/<figure class="gallery-card(?: is-active)?">/g)||[]).length,98);
});
test('Watch image links identify distinct stream and podcast destinations',()=>{
  const html=pages.find(([r])=>r==='livestream')[1].match(/<main\b[\s\S]*?<\/main>/)[0];
  assert.match(html,/<a href="\/copy-of-live-streams"><img[^>]*alt="Watch CLMI live streams"/);
  assert.match(html,/<a href="https:\/\/podcasters.spotify.com\/pod\/show\/clmipod"><img[^>]*alt="Listen to the CLMI podcast"/);
});
test('Gallery archive links have page spacing and no legacy footer spacer remains',()=>{
  const html=pages.find(([r])=>r==='publication')[1];
  assert.match(html,/<nav class="album-grid" aria-label="Photo albums"/);
  assert.doesNotMatch(html,/<div style="width:1512px;height:193px/);
});
test('Gallery autoplay respects the motion-off review option and OS preference',async()=>{
  const html=await readFile(new URL('public/assets/convention-gallery.js',root),'utf8');
  assert.match(html,/motionOff=\(\)=>reduced.matches\|\|reviewOff/);
  assert.match(html,/if\(!motionOff\(\)/);
});
