import {readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

const [base,source='public']=process.argv.slice(2);
if(!base)throw Error('Usage: node tools/verify-deployment.mjs https://host [public-directory]');
const root=path.resolve(source), failures=[], refs=new Set();
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())out.push(...await walk(f));else out.push(f);}return out;}
async function pool(items,fn){let next=0;await Promise.all(Array.from({length:8},async()=>{while(next<items.length){const item=items[next++];try{await fn(item);}catch(e){failures.push({item,error:e.message});}}}));}
const pages=(await walk(root)).filter(f=>f.endsWith('.html'));
const hash=b=>createHash('sha256').update(b).digest('hex');
let matched=0, assetsOK=0;
await pool(pages,async file=>{
  const rel=path.relative(root,file).split(path.sep).join('/');
  const route='/'+rel.replace(/(^|\/)index\.html$/,'$1');
  const bytes=await readFile(file), html=bytes.toString();
  for(const m of html.matchAll(/(?:src|href|poster|data-src)=["'](\/[^"']*)["']/g))refs.add(m[1].split(/[?#]/)[0]);
  for(const m of html.matchAll(/url\(["']?(\/[^\s)'"?]+)["']?\)/g))refs.add(m[1]);
  const r=await fetch(new URL(route,base),{signal:AbortSignal.timeout(30000)});
  const actual=Buffer.from(await r.arrayBuffer());
  if(!r.ok||hash(bytes)!==hash(actual))failures.push({route,status:r.status,byteMatch:false});else matched++;
});
await pool([...refs],async ref=>{const r=await fetch(new URL(ref,base),{method:'HEAD',signal:AbortSignal.timeout(30000)});if(r.ok)assetsOK++;else failures.push({ref,status:r.status});});
console.log(JSON.stringify({base,source:root,htmlRoutes:pages.length,htmlByteMatches:matched,localReferences:refs.size,referencesOK:assetsOK,failures},null,2));
if(failures.length)process.exitCode=1;
