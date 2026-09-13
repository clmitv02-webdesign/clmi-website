import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {existsSync} from 'node:fs';
const require=createRequire(import.meta.url);
const path=new URL('../api/live-service.js',import.meta.url);
const parse=existsSync(path)?require(path.pathname).selectService:()=>null;
const card=(id,badge='2:24:15',text='Streamed 1 hour ago')=>({richItemRenderer:{content:{lockupViewModel:{
  contentId:id,contentType:'LOCKUP_CONTENT_TYPE_VIDEO',
  contentImage:{thumbnailViewModel:{overlays:[{thumbnailBottomOverlayViewModel:{badges:[{thumbnailBadgeViewModel:{text:badge,badgeStyle:badge==='LIVE'?'THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE':'THUMBNAIL_OVERLAY_BADGE_STYLE_DEFAULT'}}]}}]}},
  metadata:{lockupMetadataViewModel:{title:{content:'CLMI service'},metadata:{contentMetadataViewModel:{metadataRows:[{metadataParts:[{text:{content:text}}]}]}}}}
}}}});
const page=cards=>({metadata:{channelMetadataRenderer:{externalId:'UCqkrpCvbRCLEjc9v-jU67MQ'}},contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{selected:true,title:'Live',content:{richGridRenderer:{contents:cards}}}}]}}});
test('active broadcast is preferred to an earlier upcoming item or replay',()=>{
  const p=page([card('Upcoming001','UPCOMING','Premieres tomorrow'),card('Replay00001'),card('LiveNow0001','LIVE','14 watching')]);
  assert.deepEqual(parse(p),{videoId:'LiveNow0001',kind:'live',title:'CLMI service',streamOrder:['Replay00001','LiveNow0001']});
});
test('off-air selects the first completed stream, never a scheduled event',()=>{
  assert.deepEqual(parse(page([card('Upcoming001','UPCOMING','Premieres tomorrow'),card('AdHCkko5Cmc') ])),{videoId:'AdHCkko5Cmc',kind:'replay',title:'CLMI service',streamOrder:['AdHCkko5Cmc']});
});
test('unknown metadata, empty channel, or another channel cannot be advertised as live',()=>{
  assert.throws(()=>parse(page([])));
  assert.throws(()=>parse(page([card('Unknown0001','','Some words')])));
  const wrong=page([card('LiveNow0001','LIVE')]);wrong.metadata.channelMetadataRenderer.externalId='other';
  assert.throws(()=>parse(wrong));
});
test('classic YouTube stream cards are supported without treating past broadcasts as live',()=>{
  const old={richItemRenderer:{content:{videoRenderer:{videoId:'AdHCkko5Cmc',title:{runs:[{text:'Sunday service'}]},publishedTimeText:{simpleText:'Streamed 1 hour ago'},lengthText:{simpleText:'2:24:15'}}}}};
  assert.deepEqual(parse(page([old])),{videoId:'AdHCkko5Cmc',kind:'replay',title:'Sunday service',streamOrder:['AdHCkko5Cmc']});
});
test('lookup failures expose a safe diagnostic code without upstream page content',async()=>{
  const original=globalThis.fetch;
  const originalError=console.error;
  globalThis.fetch=async()=>({ok:true,text:async()=>'<html>upstream unavailable</html>'});
  console.error=()=>{};
  let payload;
  const response={setHeader(){},end(body){payload=JSON.parse(body);}};
  try {
    await require(path.pathname)({method:'GET'},response);
    assert.equal(response.statusCode,503);
    assert.equal(payload.code,'SOURCE_DATA_UNAVAILABLE');
    assert.equal(payload.error,'Live status is temporarily unavailable');
  } finally {globalThis.fetch=original;console.error=originalError;}
});
test('a changed embedded-data format is distinguished from a missing upstream page',async()=>{
  const original=globalThis.fetch;
  globalThis.fetch=async()=>({ok:true,text:async()=>'<script>window["ytInitialData"] = {};</script>'});
  try {await assert.rejects(require(path.pathname).resolveService(),/YouTube data format changed/);}
  finally {globalThis.fetch=original;}
});
