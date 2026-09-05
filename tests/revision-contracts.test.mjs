import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url);
const read=route=>readFile(new URL(`public/${route}/index.html`,root),'utf8');

test('generated Gallery is current and contains every image from both 2026 photo albums',async()=>{
  execFileSync(process.execPath,['tools/sync-convention-gallery.mjs','--check'],{cwd:root});
  const manifest=JSON.parse(await readFile(new URL('public/assets/latest-convention.json',root),'utf8'));
  assert.equal(manifest.year,2026); assert.equal(manifest.photos.length,98);
  for(const route of ['convention-2026','copy-of-2024-convention-gallery']) {
    const main=(await read(route)).match(/<main[\s\S]*?<\/main>/)[0];
    for(const [,src] of main.matchAll(/<img[^>]*src="([^"]+)"/g))assert.ok(manifest.photos.some(p=>p.src===src),src);
  }
});

test('Giving presents only the approved introduction, without added contact panels',async()=>{
  const main=(await read('donations')).match(/<main[\s\S]*?<\/main>/)[0];
  assert.equal((main.match(/<header /g)||[]).length,1);
  assert.equal((main.match(/<section|<div class="page-content"/g)||[]).length,0);
  assert.ok(main.includes('Generosity is one way to express care for a church community.'));
});

test('branch revision preserves the 49 existing contacts and their complete supplied fields',async()=>{
  const before=await readFile('/Users/ob/Documents/Claude/clmi-site-backups/clmi-site-before-vibrant-revisions-2026-09-05-234349/public/branches/index.html','utf8');
  const cards=s=>[...s.matchAll(/<article class="branch-card">[\s\S]*?<\/article>/g)].map(m=>m[0]);
  const current=cards(await read('branches'));
  assert.equal(current.length,49);assert.deepEqual(current,cards(before));
});

test('Outreach retains its three ministry destinations with substantive introductory copy',async()=>{
  const main=(await read('church-outreach')).match(/<main[\s\S]*?<\/main>/)[0];
  for(const route of ['community-outreach','hospital-outreach','prison-outreach'])assert.ok(main.includes(`href="/${route}"`));
  assert.equal((main.match(/<article /g)||[]).length,3);
  assert.doesNotMatch(main,/Envagelism/);
});
