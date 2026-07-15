#!/usr/bin/env node
/**
 * Page generator for the CLMI static site.
 * Reads the page specs extracted from the original site (tools/spec/*.json)
 * and emits one folder per page under public/, each with an index.html that
 * reproduces the original layout on a fixed 1512px canvas.
 *
 * Usage: node tools/generate.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SPEC = path.join(__dirname, 'spec');
const PUB = path.join(ROOT, 'public');
const png2jpg = JSON.parse(fs.readFileSync(path.join(__dirname, 'png2jpg.json'), 'utf8'));

const SITE = 'https://www.christloveministriesinternational.org';
const HEADER_H = 135;
const FOOTER_H = 72;

/* Pages built by hand, not generated */
const SKIP = new Set(['home', 'donations']);

/* Wix custom-code embeds -> direct equivalents */
const EMBED_MAP = {
  '682560_348aa41e2aff6253a5fa7a01db86dde1': 'https://www.youtube.com/embed/videoseries?list=PLe7ztWaNnz_DJlGdSTyLnHgIXZwOwd2N0',
  '682560_e40f8386d8a6f5036b3bf1286f44826c': 'https://www.youtube.com/embed/videoseries?list=PLe7ztWaNnz_Cwa2Ziil-bO37a76pjl3FK',
  '682560_9a0bb1c172f32894560d5fd1a0766ba7': 'https://www.youtube.com/embed/videoseries?list=PLe7ztWaNnz_AWHNPynyTKY-3DnPx4amrE',
  '682560_f9bf7dd5bfafd07a8dae451820c08d4f': 'https://www.youtube.com/embed/live_stream?channel=UCqkrpCvbRCLEjc9v-jU67MQ',
};

const FONTS = {
  'helvetica-w01-roman': "'Helvetica Neue', Helvetica, Arial, sans-serif",
  'helvetica-w01-light': "'Helvetica Neue', Helvetica, Arial, sans-serif",
  'helvetica-w01-bold': "'Helvetica Neue', Helvetica, Arial, sans-serif",
  'adobe-caslon-w01-smbd': "Georgia, 'Times New Roman', serif",
  'avenir-lt-w01_85-heavy1475544': "'Avenir Next', 'Segoe UI', Arial, sans-serif",
  'din-next-w01-light': "'Helvetica Neue', Helvetica, Arial, sans-serif",
};
const fontStack = (f) => {
  const clean = (f || '').replace(/"/g, "'");
  return FONTS[f] || (clean.startsWith('helvetica') ? FONTS['helvetica-w01-roman'] : `${clean ? clean + ', ' : ''}'Helvetica Neue', Helvetica, Arial, sans-serif`);
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* wixstatic media URL -> local asset path */
function localMedia(src) {
  const m = (src || '').match(/static\.wixstatic\.com\/media\/([^/?#]+)/);
  if (!m) return null;
  let f = decodeURIComponent(m[1]);
  if (png2jpg[f]) f = png2jpg[f];
  return '/assets/media/' + f;
}

function localHref(href) {
  if (!href) return null;
  if (href.startsWith(SITE)) {
    const p = href.slice(SITE.length) || '/';
    return p === '' ? '/' : p;
  }
  return href;
}

function rewriteIframe(src) {
  const m = (src || '').match(/filesusr\.com\/html\/([a-z0-9_]+)\.html/i);
  if (m && EMBED_MAP[m[1]]) return EMBED_MAP[m[1]];
  if (src.includes('cerulean-sherbet-cee885.netlify.app')) return '/convention-2026/';
  if (src.includes('googleMap')) return 'https://maps.google.com/maps?q=34%2F36%20John%20Simms%20Street%2C%20Windhoek&z=16&output=embed';
  return src;
}

/* nav model */
const NAV = [
  { t: 'HOME', h: '/' },
  { t: 'CHURCH OUTREACH', h: '/church-outreach', sub: [
    { t: 'PRISON OUTREACH', h: '/prison-outreach' },
    { t: 'HOSPITAL OUTREACH', h: '/hospital-outreach' },
    { t: 'COMMUNITY OUTREACH', h: '/community-outreach' },
  ]},
  { t: 'EVENTS', h: '/events' },
  { t: 'LIVE STREAMS', h: '/livestream' },
  { t: 'DONATIONS', h: '/donations' },
  { t: 'ABOUT US', h: '/about-us' },
  { t: 'PUBLICATION', h: '/publication' },
  { t: 'CONTACT US', h: '/about-1', sub: [
    { t: 'BRANCHES', h: '/branches' },
  ]},
];

function headerHtml(activePath) {
  const items = NAV.map((n) => {
    const active = n.h === activePath || (n.sub || []).some((s) => s.h === activePath);
    const sub = n.sub
      ? `<div class="dropdown">${n.sub.map((s) => `<a href="${s.h}">${s.t}</a>`).join('')}</div>`
      : '';
    return `<div class="nav-item${active ? ' active' : ''}"><a href="${n.h}">${n.t}</a>${sub}</div>`;
  }).join('\n      ');
  return `<header class="site-header">
    <a class="brand" href="/">
      <img src="/assets/media/682560_46f604bec7654c0291de0cd1cc5ae5cc~mv2.png" alt="CLMI logo">
      <span>Christ's Love Ministries International</span>
    </a>
    <nav class="main-nav">
      ${items}
    </nav>
    <a class="go-live" href="/copy-of-live-streams">Go Live <img src="/assets/media/682560_dcf5511bbe7348f98a48568279e39108~mv2.png" alt=""></a>
    <div class="socials">
      <a href="https://www.youtube.com/@BishopArowoloCLMItv" target="_blank" rel="noopener"><img src="/assets/media/682560_dcf5511bbe7348f98a48568279e39108~mv2.png" alt="YouTube"></a>
      <a href="https://www.facebook.com/CLMItv-122166180865270/" target="_blank" rel="noopener"><img src="/assets/media/682560_9ac04de1b55049e2871e7aaacd5d37e3~mv2.png" alt="Facebook"></a>
      <a href="https://www.instagram.com/clmitv/" target="_blank" rel="noopener"><img src="/assets/media/682560_62555820ace941a68a7c70857fb574fd~mv2.png" alt="Instagram"></a>
      <a href="https://www.tiktok.com/@clmitv" target="_blank" rel="noopener"><img src="/assets/media/11062b_69d309d6dbde492fae325fb0deca6556~mv2.png" alt="TikTok"></a>
    </div>
  </header>`;
}

function footerHtml() {
  return `<footer class="site-footer">
    <div class="inner">Copyright © 2023 by<b>Christ's Love Ministries International</b>All rights reserved.</div>
  </footer>
  <a class="wa-bubble" href="https://wa.me/264816195335" target="_blank" rel="noopener" aria-label="WhatsApp chat">
    <svg viewBox="0 0 32 32"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-1.5c1.2.6 2.5.9 3.8.9 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 22c-1.2 0-2.4-.3-3.5-.8l-.7-.4-4.9.9 1-4.7-.4-.7C6.5 17.9 6 16.5 6 15c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10zm5.5-7.5c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.6-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4z"/></svg>
  </a>`;
}

function renderItem(it) {
  const st = (extra) => `left:${it.x}px;top:${it.y - HEADER_H}px;width:${it.w}px;${it.h ? `height:${it.h}px;` : ''}${extra || ''}`;
  switch (it.t) {
    case 'bg':
      return `<div class="el" style="${st(`background:${it.bg};${it.br && it.br !== '0px' ? `border-radius:${it.br};` : ''}`)}"></div>`;
    case 'box':
      return `<div class="el" style="${st(`z-index:5;border-top:${it.bt};border-left:${it.bl};border-right:${it.br2};border-bottom:${it.bb};${it.rad && it.rad !== '0px' ? `border-radius:${it.rad};` : ''}pointer-events:none;`)}"></div>`;
    case 'grad':
      return `<div class="el" style="${st(`background:${it.g};`)}"></div>`;
    case 'bgimg': {
      const src = localMedia(it.src);
      if (!src) return '';
      return `<div class="el" style="${st(`background:url('${src}') center/cover no-repeat;`)}"></div>`;
    }
    case 'img': {
      const src = localMedia(it.src);
      if (!src) return '';
      const img = `<img class="el" loading="lazy" src="${esc(src)}" alt="${esc(it.alt || '')}" style="${st(`${it.fit && it.fit !== 'cover' ? `object-fit:${it.fit};` : ''}${it.br && it.br !== '0px' ? `border-radius:${it.br};` : ''}`)}">`;
      const href = localHref(it.link);
      return href ? `<a href="${esc(href)}">${img}</a>` : img;
    }
    case 'video': {
      const m = (it.src || '').match(/video\/([^/]+)\//);
      if (!m) return '';
      /* the Kilimanjaro video is a click-to-play player on the original; the rest are looping background strips */
      if (m[1] === '682560_12ee8f9bf9864568951b727b93c9789c') {
        return `<video class="el" controls playsinline preload="metadata" poster="/assets/media/${m[1]}f003.jpg" src="/assets/video/${m[1]}.mp4" style="${st()}"></video>`;
      }
      return `<video class="el lazy-video" muted loop playsinline preload="none" data-src="/assets/video/${m[1]}.mp4" style="${st()}"></video>`;
    }
    case 'iframe': {
      const src = rewriteIframe(it.src);
      return `<iframe class="el" loading="lazy" src="${esc(src)}" title="Embedded content" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen style="${st()}"></iframe>`;
    }
    case 'txt': {
      if (it.text === 'Skip to Main Content') return '';
      const href = localHref(it.href);
      const px = parseFloat(it.size) || 15;
      const oneLine = !it.html && it.h && it.h < px * 1.75;
      const style = st(
        `font-family:${fontStack(it.font)};font-size:${it.size};font-weight:${it.weight};color:${it.color};text-align:${it.align === 'start' ? 'left' : it.align};line-height:1.2;${oneLine ? 'white-space:nowrap;' : ''}${it.bg ? `background:${it.bg};` : ''}${it.br && it.br !== '0px' ? `border-radius:${it.br};` : ''}`
      );
      const inner = it.html || esc(it.text);
      return href
        ? `<a class="el txt" href="${esc(href)}" style="z-index:6;${style}">${inner}</a>`
        : `<div class="el txt" style="z-index:6;${style}">${inner}</div>`;
    }
    default:
      return '';
  }
}

function pageHtml(spec, slug) {
  const activePath = slug === 'home' ? '/' : '/' + slug.replace(/__/g, '/');

  /* the footer sits wherever the original put it (mid-page on short pages) */
  const copyrightTxt = spec.items.find((it) => it.t === 'txt' && /^Copyright ©/.test(it.text || ''));
  const footY = copyrightTxt ? copyrightTxt.y - 26 : spec.h - FOOTER_H;
  const bodyH = footY - HEADER_H;
  const fillerH = spec.h - footY - FOOTER_H;

  /* content items only (exclude header + footer bands) */
  let items = spec.items.filter((it) => (it.y + (it.h || 0)) > HEADER_H + 40 && it.y < footY - 5);

  /* drop full-page white background rectangles (body is already white) */
  items = items.filter((it) => !(it.t === 'bg' && it.h > spec.h * 0.9));

  /* merge inline runs captured as separate spans at the same origin
     (bold lead-in + flowing remainder) into one wrapping text block */
  const groups = new Map();
  for (const t of items) {
    if (t.t !== 'txt') continue;
    const k = `${t.x},${t.y}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(t);
  }
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    g.sort((a, b) => (a.h - b.h) || (a.w - b.w));
    const rem = g[g.length - 1];
    const leads = g.slice(0, -1);
    rem.html = leads.map((l) => `<span style="font-weight:${l.weight};color:${l.color};font-size:${l.size}">${esc(l.text)}</span>`).join('') + esc(rem.text);
    for (const l of leads) l.drop = true;
  }
  items = items.filter((it) => !it.drop && !(it.t === 'txt' && it.w <= 2));

  /* de-duplicate: same position+type keep the last occurrence (hi-res) */
  const byKey = new Map();
  for (const it of items) {
    const key = `${it.t}:${it.x},${it.y},${it.w},${it.h}${it.t === 'txt' ? ':' + it.text : ''}`;
    byKey.set(key, it);
  }
  items = [...byKey.values()];

  const body = items.map(renderItem).filter(Boolean).join('\n    ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1512">
<title>${esc(spec.title || 'Christ\'s Love Ministries International')}</title>
${spec.desc ? `<meta name="description" content="${esc(spec.desc)}">` : ''}
<link rel="icon" href="/assets/media/682560_46f604bec7654c0291de0cd1cc5ae5cc~mv2.png">
<link rel="stylesheet" href="/assets/site.css">
</head>
<body>
<div class="canvas-wrap">
  ${headerHtml(activePath)}
  <main class="pg" style="height:${Math.max(bodyH, 200)}px">
    ${body}
  </main>
  ${footerHtml()}
  ${fillerH > 10 ? `<div style="width:1512px;height:${fillerH}px;margin:0 auto;background:rgba(232,230,230,0.72)"></div>` : ''}
</div>
<script>
  (function () {
    var vids = document.querySelectorAll('video.lazy-video');
    if (!vids.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var v = e.target;
        if (!v.src) { v.src = v.dataset.src; v.play().catch(function () {}); }
        io.unobserve(v);
      });
    }, { rootMargin: '200px' });
    vids.forEach(function (v) { io.observe(v); });
  })();
</script>
</body>
</html>
`;
}

/* ---------- run ---------- */
let count = 0;
for (const f of fs.readdirSync(SPEC)) {
  if (!f.endsWith('.json') || f.startsWith('deep-')) continue;
  const slug = f.replace(/\.json$/, '');
  if (SKIP.has(slug)) continue;
  const spec = JSON.parse(fs.readFileSync(path.join(SPEC, f), 'utf8'));
  const dir = path.join(PUB, slug.replace(/__/g, '/'));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), pageHtml(spec, slug));
  count++;
}
console.log(`generated ${count} pages`);
