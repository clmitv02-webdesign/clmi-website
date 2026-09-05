/* Generate Gallery's latest-convention slides from dated photo archive pages.
 * --patch emits an apply_patch document; --check is read-only; --build updates
 * generated content at build time so a newer convention automatically takes over.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {latestConvention} from './gallery-model.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const publicDir=path.join(root,'public');
const albums=[];
const attr=(html,name)=>html.match(new RegExp(name+'="([^"]+)"'))?.[1];
for(const entry of await fs.readdir(publicDir,{withFileTypes:true})) {
  if(!entry.isDirectory()||entry.name==='publication')continue;
  let html; try{html=await fs.readFile(path.join(publicDir,entry.name,'index.html'),'utf8');}catch{continue;}
  const title=html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]||'';
  if(!/convention/i.test(title))continue;
  const year=Number(title.match(/20\d{2}/)?.[0]);
  const photos=(html.match(/<div class="photo-grid">([\s\S]*?)(?:<nav|<\/main>)/)?.[1]||'');
  const images=[...photos.matchAll(/<img\b[^>]+>/g)].map(([tag])=>({src:attr(tag,'src'),width:attr(tag,'width'),height:attr(tag,'height')}));
  if(year&&images.length)albums.push({year,route:'/'+entry.name,photos:images});
}
albums.sort((a,b)=>a.route.startsWith('/convention-')?-1:b.route.startsWith('/convention-')?1:a.route.localeCompare(b.route));
const latest=latestConvention(albums);
for(const p of latest.photos)await fs.access(path.join(publicDir,p.src));
const generated=latest.photos.map((p,i)=>`        <figure class="gallery-card"><img loading="${i?'lazy':'eager'}" ${i?'':'fetchpriority="high" '}decoding="async" width="${p.width}" height="${p.height}" src="${p.src}" alt="CLMI Convention ${latest.year} — photograph ${i+1}"></figure>`).join('\n');
const filename=path.join(publicDir,'publication/index.html');
const before=await fs.readFile(filename,'utf8');
const start='<!-- LATEST-CONVENTION:START -->',end='<!-- LATEST-CONVENTION:END -->';
if(!before.includes(start)||!before.includes(end))throw Error('Gallery generation markers missing');
const after=before.slice(0,before.indexOf(start)+start.length)+'\n'+generated+'\n        '+before.slice(before.indexOf(end));
const manifest=JSON.stringify(latest,null,2)+'\n';
const manifestPath=path.join(publicDir,'assets/latest-convention.json');
if(process.argv.includes('--build')) {await fs.writeFile(filename,after);await fs.writeFile(manifestPath,manifest);console.log(`Gallery: ${latest.year}, ${latest.photos.length} photos from ${latest.sources.length} albums`);}
else if(process.argv.includes('--patch')) {
  let patch='*** Begin Patch\n*** Update File: '+filename+'\n@@\n';
  const old=before.slice(before.indexOf(start),before.indexOf(end)+end.length),updated=after.slice(after.indexOf(start),after.indexOf(end)+end.length);
  patch+=old.split('\n').map(l=>'-'+l).join('\n')+'\n'+updated.split('\n').map(l=>'+'+l).join('\n')+'\n';
  try{const oldManifest=await fs.readFile(manifestPath,'utf8');patch+='*** Update File: '+manifestPath+'\n@@\n'+oldManifest.trimEnd().split('\n').map(l=>'-'+l).join('\n')+'\n';}catch{patch+='*** Add File: '+manifestPath+'\n';}
  patch+=manifest.trimEnd().split('\n').map(l=>'+'+l).join('\n')+'\n*** End Patch';console.log(JSON.stringify(patch));
} else {
  if(before!==after||await fs.readFile(manifestPath,'utf8')!==manifest)throw Error('Gallery is stale; regenerate before serving/publishing');
  console.log(`Gallery verified: ${latest.year}, ${latest.photos.length} photos from ${latest.sources.length} albums`);
}
