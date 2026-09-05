import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve('public');
async function walk(dir) {
  const result = [];
  for (const e of await readdir(dir, { withFileTypes:true })) {
    const f = path.join(dir,e.name);
    if (e.isDirectory()) result.push(...await walk(f));
    else result.push(f);
  }
  return result;
}
const pages = (await walk(root)).filter(f=>f.endsWith('.html'));
const refs = new Set();
for (const file of pages) {
  const html = await readFile(file,'utf8');
  for (const m of html.matchAll(/(?:src|href|poster|data-src)=["'](\/[^"']*)["']/g)) refs.add(m[1].split(/[?#]/)[0]);
  for (const m of html.matchAll(/url\(["']?(\/[^\s)'"?]+)["']?\)/g)) refs.add(m[1]);
}
const failures=[];
for (const ref of refs) {
  const f=path.join(root,decodeURIComponent(ref));
  try {
    const s=await stat(f);
    if(s.isDirectory()) await stat(path.join(f,'index.html'));
    const response=await fetch('http://127.0.0.1:8123'+ref,{method:'HEAD'});
    if(!response.ok) failures.push({ref,status:response.status});
  } catch(error) { failures.push({ref,error:error.message}); }
}
const home=await readFile(path.join(root,'index.html'),'utf8');
const backup=process.argv[2];
if(backup) {
  const original=await readFile(path.join(backup,'public/index.html'),'utf8');
  const playlistIds=h=>[...h.matchAll(/youtube\.com\/embed\/videoseries\?list=([^"']+)/g)].map(m=>m[1]);
  const artwork=h=>[...h.matchAll(/(?:src|data-src|poster)="(\/assets\/(?:media|video)\/[^"']+)"/g)].map(m=>m[1]);
  const destinations=h=>[...h.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(playlistIds(home),playlistIds(original),'playlist identities/order changed');
  assert.deepEqual(artwork(home),artwork(original),'approved artwork/video references changed');
  assert.deepEqual(destinations(home),destinations(original),'visitor link destinations changed');
}
console.log(JSON.stringify({htmlRoutes:pages.length,uniqueLocalReferences:refs.size,failures,backupContentPreserved:!!backup},null,2));
assert.equal(failures.length,0,'broken local references');
