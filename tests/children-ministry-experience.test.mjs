import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('public/children-s-ministries/index.html', root), 'utf8');

test('Children’s Ministry presents a complete visitor journey instead of a blank page', () => {
  assert.match(html, /<main class="children-experience"/);
  assert.match(html, /A place to know Jesus, grow in faith, and belong\./);
  assert.match(html, /Every child has a place here\./);
  assert.match(html, /aria-label="Children’s Ministry programs"/);
});

test('three accessible program tabs own three matching panels', () => {
  const tabs = [...html.matchAll(/<button\b[^>]*role="tab"[^>]*>/g)].map((match) => match[0]);
  const panels = [...html.matchAll(/<article\b[^>]*role="tabpanel"[^>]*>/g)].map((match) => match[0]);

  assert.equal(tabs.length, 3);
  assert.equal(panels.length, 3);
  assert.equal(tabs.filter((tab) => /aria-selected="true"/.test(tab)).length, 1);
  assert.equal(panels.filter((panel) => !/\shidden(?:\s|>)/.test(panel)).length, 1);

  for (const program of ['sunday-school', 'children-evangelism', 'christmas-gift']) {
    assert.match(html, new RegExp(`id="tab-${program}"[^>]+aria-controls="panel-${program}"`));
    assert.match(html, new RegExp(`id="panel-${program}"[^>]+aria-labelledby="tab-${program}"`));
  }
});

test('program panels stay information-only and rely on the single global WhatsApp bubble', () => {
  const section = html.match(/<section class="children-programs"[\s\S]*?<\/section>/)?.[0] ?? '';
  const invitation = html.match(/<section class="children-invitation"[\s\S]*?<\/section>/)?.[0] ?? '';
  const globalBubbles = [...html.matchAll(/<a\b[^>]*class="wa-bubble"[^>]*href="([^"]+)"/g)].map((match) => match[1]);

  assert.doesNotMatch(section, /class="program-whatsapp"/);
  assert.doesNotMatch(invitation, /class="children-main-whatsapp"/);
  assert.deepEqual(globalBubbles, ['https://wa.me/264816195335']);
  assert.doesNotMatch(section, /<form\b/i);
});

test('tab interaction supports clicks, keyboard navigation, deep links and reduced motion', () => {
  assert.match(html, /addEventListener\('click'/);
  for (const key of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) {
    assert.match(html, new RegExp(`'${key}'`));
  }
  assert.match(html, /history\.replaceState/);
  assert.match(html, /location\.hash/);
  assert.match(html, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test('Sunday School and Children Evangelism use the approved swapped photographs', () => {
  const sundayPanel = html.match(/<article class="children-panel" id="panel-sunday-school"[\s\S]*?<\/article>/)?.[0] ?? '';
  const evangelismPanel = html.match(/<article class="children-panel" id="panel-children-evangelism"[\s\S]*?<\/article>/)?.[0] ?? '';

  assert.match(sundayPanel, /class="program-image" src="\/assets\/media\/682560_2834a0ead0e3489f8302041bf71e3bc9~mv2\.jpg"/);
  assert.match(evangelismPanel, /class="program-image" src="\/assets\/media\/682560_5404089964f4458187c4a939418d3d8e~mv2\.jpg"/);
});

test('program photographs have no numbered overlay badges', () => {
  assert.doesNotMatch(html, /class="program-number"/);
});

test('program visuals are optimized for initial and deferred loading', () => {
  const heroImage = html.match(/<img\b[^>]*class="children-hero-image"[^>]*src="([^"]+)"[^>]*>/)?.[1] ?? '';
  const images = [...html.matchAll(/<img\b[^>]*class="program-image"[^>]*>/g)].map((match) => match[0]);
  const sundaySchoolImage = images[0]?.match(/\bsrc="([^"]+)"/)?.[1] ?? '';

  assert.equal(images.length, 3);
  assert.notEqual(sundaySchoolImage, heroImage);
  assert.match(images[0], /loading="eager"/);
  assert.match(images[0], /fetchpriority="high"/);
  for (const image of images.slice(1)) assert.match(image, /loading="lazy"/);
  for (const image of images) {
    assert.match(image, /decoding="async"/);
    assert.match(image, /width="\d+"/);
    assert.match(image, /height="\d+"/);
    assert.match(image, /alt="[^"]+"/);
  }
});
