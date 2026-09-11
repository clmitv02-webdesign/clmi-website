import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {execFileSync} from 'node:child_process';

const root=new URL('../',import.meta.url);
const cases=[
  ['ZOO PARK OUTREACH','copy-of-katutura-street-evangelism','Zoo Park Outreach Gallery',872],
  ['KATUTURA STREET EVAGENLISM','copy-of-zimababwe-shona-bibles','Katutura Street Evangelism',403],
  ['KILIMANJARO OUTREACH','copy-of-donations-to-the-orphange','Kilimanjaro Outreach',1858],
  ['CHURCH OUTREACH WALVIS BAY','copy-of-christmas-day-at-orphanage','Church Outreach · Walvis Bay',1342],
  ['DONATION TO THE ORPHANAGE','copy-of-community-police','Donations to the Orphanage',3239],
  ['CHRISTMAS DAY AT THE ORPHANAGE','1','Christmas Day at the Orphanage',2738],
  ['DONATING SHONA BIBLES IN ZIMBABWE','copy-of-kilimanjaro-outreach','Shona Bibles in Zimbabwe',2302],
];
const html=await readFile(new URL('public/community-outreach/index.html',root),'utf8');
const cards=[...html.matchAll(/<article class="event-card">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
test('seven outreach cards link to their own named photo story',async()=>{
  assert.equal(cards.length,7);
  for(const [heading,slug,title] of cases){
    const card=cards.find(c=>c.includes(`>${heading}</h2>`));
    assert.ok(card,heading);
    assert.ok(card.includes(`href="/${slug}">View ${title}</a>`),heading);
    const dest=await readFile(new URL(`public/${slug}/index.html`,root),'utf8');
    assert.ok(dest.includes(`<h1>${title}</h1>`),`${heading}: actual destination title`);
    assert.match(dest,/<div class="photo-grid">/);
  }
});
test('legacy position-matched generator data uses the corrected destinations',async()=>{
  const links=JSON.parse(await readFile(new URL('tools/button-links.json',root),'utf8'))['community-outreach'];
  for(const [heading,slug,,y] of cases){
    const button=links.find(b=>b.t==='View Gallery'&&b.y===y);
    assert.equal(button?.href,`/${slug}`,heading);
  }
});
test('historical migration generates the corrected seven card links without writing pages',()=>{
  const output=execFileSync('python3',['-B','-c',`import importlib.util
spec=importlib.util.spec_from_file_location('rebuild','tools/rebuild-inner-pages.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
source=(m.DEFAULT_BACKUP/'public/community-outreach/index.html').read_text()
print(m.migrate('community-outreach',source,'')[0])`],{cwd:root,encoding:'utf8'});
  const generated=[...output.matchAll(/<article class="event-card">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
  assert.equal(generated.length,7);
  for(const [heading,slug,title] of cases)
    assert.ok(generated.find(c=>c.includes(`>${heading}</h2>`))?.includes(`href="/${slug}">View ${title}</a>`),heading);
});
test('card photos, headings, descriptions and surrounding page are unchanged',()=>{
  const before=execFileSync('git',['show','HEAD:public/community-outreach/index.html'],{cwd:root,encoding:'utf8'});
  const withoutCardButtons=s=>s.replace(/<article class="event-card">[\s\S]*?<\/article>/g,c=>c.replace(/<a class="button-link"[^>]*>[^<]*<\/a>/,'BUTTON'));
  assert.equal(withoutCardButtons(html),withoutCardButtons(before));
});
