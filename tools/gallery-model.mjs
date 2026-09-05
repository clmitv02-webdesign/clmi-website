export function latestConvention(albums) {
  const usable=albums.filter(a=>Number.isInteger(a.year)&&a.photos.length);
  if(!usable.length) throw new Error('No convention photos');
  const year=Math.max(...usable.map(a=>a.year));
  const selected=usable.filter(a=>a.year===year);
  const seen=new Set();
  return {year,sources:selected.map(a=>a.route),photos:selected.flatMap(a=>a.photos).filter(p=>!seen.has(p.src)&&seen.add(p.src))};
}
