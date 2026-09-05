import test from 'node:test';
import assert from 'node:assert/strict';

test('newest dated convention supplies the slideshow, combining its albums and excluding older years',async()=>{
  const {latestConvention}=await import('../tools/gallery-model.mjs');
  const result=latestConvention([
    {year:2026,route:'/old/',photos:[{src:'/a.jpg'}]},
    {year:2027,route:'/new/',photos:[{src:'/b.jpg'},{src:'/c.jpg'}]},
    {year:2027,route:'/new-extra/',photos:[{src:'/c.jpg'},{src:'/d.jpg'}]},
  ]);
  assert.equal(result.year,2027);
  assert.deepEqual(result.photos.map(p=>p.src),['/b.jpg','/c.jpg','/d.jpg']);
  assert.deepEqual(result.sources,['/new/','/new-extra/']);
});

test('empty or undated albums cannot erase a usable convention selection',async()=>{
  const {latestConvention}=await import('../tools/gallery-model.mjs');
  assert.equal(latestConvention([{year:2026,route:'/ok/',photos:[{src:'/a.jpg'}]},{year:2028,route:'/empty/',photos:[]}]).year,2026);
  assert.throws(()=>latestConvention([]),/No convention photos/);
});
