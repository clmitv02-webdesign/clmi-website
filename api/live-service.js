// Resolve a real video ID before creating the player. The channel embed returns
// an error/offline screen when no broadcast is running. No credentials required.
const CHANNEL = 'UCqkrpCvbRCLEjc9v-jU67MQ';
const SOURCE = 'https://www.youtube.com/@BishopArowoloCLMItv/streams';

function selectService(data) {
  if (data.metadata?.channelMetadataRenderer?.externalId !== CHANNEL) throw new Error('Channel identity mismatch');
  const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs;
  const selected = tabs?.find(item => item.tabRenderer?.selected)?.tabRenderer;
  if (selected?.title !== 'Live') throw new Error('Stream list unavailable');
  const videos = [];
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    const video = node.videoRenderer;
    const lockup = node.lockupViewModel;
    if (video || lockup?.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO') {
      const videoId = video?.videoId || lockup.contentId;
      if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return;
      const title = video ? (video.title?.simpleText || video.title?.runs?.map(r=>r.text).join('')) : lockup.metadata?.lockupMetadataViewModel?.title?.content;
      const badges = JSON.stringify(video ? [video.badges, video.thumbnailOverlays] : lockup.contentImage?.thumbnailViewModel?.overlays);
      const live = /"(?:style|badgeStyle)":"(?:LIVE|BADGE_STYLE_TYPE_LIVE_NOW|THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE)"/.test(badges || '');
      const metadata = JSON.stringify(video?.publishedTimeText || lockup?.metadata?.lockupMetadataViewModel?.metadata);
      const completed = !video?.upcomingEventData && /Streamed\b/i.test(metadata || '');
      if (title && (live || completed)) videos.push({videoId,kind:live?'live':'replay',title});
      return;
    }
    Object.values(node).forEach(visit);
  }
  // Only the selected channel stream list, never sidebar recommendations.
  visit(selected.content);
  const service = videos.find(v=>v.kind==='live') || videos.find(v=>v.kind==='replay');
  if (!service) throw new Error('No playable stream found');
  return {...service,streamOrder:[...new Set(videos.map(v=>v.videoId))]};
}

async function resolveService() {
  const response = await fetch(SOURCE, {headers:{'Accept-Language':'en-US,en;q=0.9'},signal:AbortSignal.timeout(6000)});
  if (!response.ok) throw new Error(`YouTube response ${response.status}`);
  const html = await response.text();
  const match = html.match(/var ytInitialData\s*=\s*([\s\S]*?);<\/script>/);
  if (!match) {
    if (html.includes('ytInitialData')) throw new Error('YouTube data format changed');
    if (/Before you continue to YouTube|consent\.youtube\.com\/save/.test(html)) throw new Error('YouTube consent required');
    if (/Our systems have detected unusual traffic|\/sorry\/index/.test(html)) throw new Error('YouTube challenge required');
    throw new Error('YouTube stream data unavailable');
  }
  return selectService(JSON.parse(match[1]));
}

module.exports = async function handler(req,res) {
  if (!['GET','HEAD'].includes(req.method)) {res.setHeader('Allow','GET, HEAD');res.statusCode=405;return res.end();}
  res.setHeader('Content-Type','application/json; charset=utf-8');
  try {
    const service = await resolveService();
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=30');
    res.statusCode=200;
    res.end(req.method==='HEAD'?undefined:JSON.stringify(service));
  } catch (error) {
    console.error('CLMI stream lookup:',error.message);
    const codes = {'Channel identity mismatch':'CHANNEL_MISMATCH','Stream list unavailable':'STREAM_LIST_UNAVAILABLE','No playable stream found':'NO_PLAYABLE_STREAM','YouTube stream data unavailable':'SOURCE_DATA_UNAVAILABLE','YouTube data format changed':'SOURCE_FORMAT_CHANGED','YouTube consent required':'SOURCE_CONSENT_REQUIRED','YouTube challenge required':'SOURCE_CHALLENGE_REQUIRED'};
    const code = codes[error.message] || (error.name==='TimeoutError'?'SOURCE_TIMEOUT':/^YouTube response \d+$/.test(error.message)?'SOURCE_HTTP_ERROR':'LOOKUP_FAILED');
    res.setHeader('Cache-Control','no-store');
    res.statusCode=503;
    res.end(req.method==='HEAD'?undefined:JSON.stringify({error:'Live status is temporarily unavailable',code}));
  }
};
module.exports.selectService = selectService;
module.exports.resolveService = resolveService;
