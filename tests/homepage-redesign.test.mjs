import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('public/index.html', root), 'utf8');
const galleryHtml = await readFile(new URL('public/publication/index.html', root), 'utf8');
const galleryScript = await readFile(new URL('public/assets/convention-gallery.js', root), 'utf8');
const css = await readFile(new URL('public/assets/site.css', root), 'utf8');

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
    if (entry.isDirectory()) files.push(...await htmlFiles(child));
    if (entry.isFile() && entry.name.endsWith('.html')) files.push(child);
  }
  return files;
}

test('desktop brand keeps the complete logo inside the visible canvas', () => {
  assert.match(css, /\.site-header \.brand\s*\{[^}]*left:\s*(?:0|[1-9]\d*)px/s);
  assert.match(css, /\.site-header \.brand img\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(css, /\.site-header \.brand span\s*\{[^}]*font-family:\s*var\(--helv\)/s);
});

test('Go Live is presented as a polished pill with a live indicator', () => {
  assert.match(css, /\.go-live\s*\{[^}]*border-radius:\s*999px/s);
  assert.match(html, /class="live-pulse"[^>]+aria-hidden="true"/);
  assert.match(html, /class="live-label">Go Live<\/span>/);
});

test('hero artwork is fully visible instead of being cropped', () => {
  assert.match(html, /\.hero \.slide img\s*\{[^}]*object-fit:\s*contain/s);
  assert.doesNotMatch(html, /\.hero \.slide img\s*\{[^}]*object-fit:\s*cover/s);
});

test('old convention and poster blocks stay removed while the approved social film remains', () => {
  assert.doesNotMatch(html, /class="convention"/);
  assert.doesNotMatch(html, /class="poster"/);
  const videos = [...html.matchAll(/<video\b[^>]*>/gi)].map((match) => match[0]);
  assert.equal(videos.length, 1);
  assert.match(videos[0], /class="social-platform-video"/);
});

test('the three YouTube playlist embeds are restored and lazy-loaded', () => {
  assert.match(html, /class="playlists"/);
  const playlists = [...html.matchAll(/<iframe\b[^>]*src="https:\/\/www\.youtube\.com\/embed\/videoseries\?list=[^"]+"[^>]*>/g)].map((match) => match[0]);
  assert.equal(playlists.length, 3);
  for (const playlist of playlists) assert.match(playlist, /loading="lazy"/);
  assert.match(html, />Conventions<\/div>/);
  assert.match(html, />Testimony Sundays<\/div>/);
  assert.match(html, />Outreach<\/div>/);
});

test('the Publications tab is renamed Gallery across every published page without changing its route', async () => {
  const files = await htmlFiles(new URL('public/', root));
  assert.equal(files.length, 39);
  for (const file of files) {
    const page = await readFile(file, 'utf8');
    assert.doesNotMatch(page, /<a href="\/publication">PUBLICATION<\/a>/);
    if (page.includes('href="/publication"')) assert.match(page, /<a href="\/publication">GALLERY<\/a>/);
  }
});

test('Gallery page owns the lightweight accessible photo showcase', () => {
  assert.doesNotMatch(html, /id="galleryShowcase"/);
  assert.match(galleryHtml, /<title>GALLERY \| Clminternational<\/title>/);
  assert.match(galleryHtml, /<section[^>]+id="galleryShowcase"[^>]+aria-label="CLMI photo highlights"/);
  assert.match(galleryHtml, /class="gallery-track"/);
  assert.match(galleryHtml, /class="gallery-arrow gallery-prev"[^>]+aria-label="Previous photos"/);
  assert.match(galleryHtml, /class="gallery-arrow gallery-next"[^>]+aria-label="Next photos"/);
  assert.match(galleryHtml, /class="gallery-viewport"[^>]+tabindex="0"/);
  const section = galleryHtml.match(/<section[^>]+id="galleryShowcase"[\s\S]*?<\/section>/)[0];
  assert.equal((section.match(/<button/g)||[]).length,2);
  assert.doesNotMatch(section,/<select|class="gallery-pause"|class="gallery-dots"/);
});

test('photo showcase displays one large image at a time without promotional text', () => {
  assert.match(galleryHtml, /\.gallery-card\s*\{[^}]*flex:\s*0 0 100%/s);
  const section = galleryHtml.match(/<section[^>]+id="galleryShowcase"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.doesNotMatch(section, /gallery-heading|gallery-kicker|Faith in every moment|Life at CLMI/i);
  assert.match(galleryScript, /card.classList.toggle\('is-active',i===page\)/);
});

test('Gallery showcase remains full bleed', () => {
  assert.match(galleryHtml, /\.gallery-showcase\s*\{[^}]*padding:\s*0(?:px)?;/s);
  assert.match(galleryHtml, /\.gallery-viewport\s*\{[^}]*width:\s*100%[^}]*max-width:\s*none[^}]*border-radius:\s*0/s);
});

test('Home replaces the carousel with the approved looping social-platform video', async () => {
  assert.match(html, /<section class="social-video-showcase"[^>]+aria-label="CLMI social media platforms"/);
  assert.match(html, /<video[^>]+class="social-platform-video"[^>]+autoplay[^>]+muted[^>]+loop[^>]+playsinline[^>]+preload="metadata"[^>]+controls/);
  assert.match(html, /src="\/assets\/video\/clmi-social-platforms-loop\.mp4"/);
  assert.match(html, /poster="\/assets\/video\/clmi-social-platforms-poster\.jpg"/);
  const videoIndex = html.indexOf('<section class="social-video-showcase"');
  const ministriesIndex = html.indexOf('<section class="ministries"');
  assert.ok(videoIndex >= 0 && videoIndex < ministriesIndex, 'social video must occupy the former carousel position');

  const videoUrl = new URL('public/assets/video/clmi-social-platforms-loop.mp4', root);
  const videoStat = await stat(videoUrl);
  assert.ok(videoStat.size > 1_000_000 && videoStat.size < 30_000_000, `expected an optimized web video, received ${videoStat.size} bytes`);
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', videoUrl.pathname], { encoding: 'utf8' });
  assert.equal(probe.status, 0, probe.stderr);
  assert.match(probe.stdout, /^1280x720/m);
});

test('Home meets the ministries area with a thin but visible divider', () => {
  assert.match(html, /\.ministries\s*\{[^}]*background:\s*linear-gradient\(180deg,\s*#f0f0f0/s);
  assert.match(html, /\.ministries\s*\{[^}]*border-top:\s*2px solid rgba\(46,90,62,0\.28\)/s);
  assert.match(html, /@media\s*\(max-width:\s*768px\)[\s\S]*\.ministries\s*\{[^}]*border-top-width:\s*1px/s);
});

test('photo showcase uses lightweight retention motion and direct manipulation', () => {
  assert.match(galleryHtml, /@keyframes\s+galleryDrift/);
  assert.match(galleryHtml, /\.gallery-card\.is-active img\s*\{[^}]*animation:\s*galleryDrift/s);
  assert.match(galleryHtml, /\.gallery-progress\.is-running\s+span\s*\{[^}]*animation:\s*galleryProgress/s);
  assert.match(galleryScript, /addEventListener\('pointerdown'/);
  assert.match(galleryScript, /addEventListener\('pointerup'/);
  assert.match(galleryScript, /const AUTOPLAY_MS=7200;/);
});

test('photo showcase prioritizes the opening image and defers the remaining photos', () => {
  const section = galleryHtml.match(/<section[^>]+id="galleryShowcase"[\s\S]*?<\/section>/)?.[0] ?? '';
  const images = [...section.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);

  assert.ok(images.length >= 6, `expected at least 6 showcase images, found ${images.length}`);
  assert.match(images[0], /loading="eager"/);
  assert.match(images[0], /fetchpriority="high"/);
  for (const image of images.slice(1)) {
    assert.match(image, /loading="lazy"/);
  }
  for (const image of images) {
    assert.match(image, /decoding="async"/);
    assert.match(image, /width="\d+"/);
    assert.match(image, /height="\d+"/);
    assert.match(image, /alt="[^"]+"/);
  }
});

test('photo showcase respects reduced-motion preferences', () => {
  assert.match(galleryHtml, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(galleryScript, /if\(!motionOff\(\)&&!paused&&!focused&&visible&&!document.hidden\)/);
  assert.match(galleryHtml, /prefers-reduced-motion:[^)]+\)[\s\S]*\.gallery-card\.is-active img[^{]*\{[^}]*animation:\s*none/s);
});
