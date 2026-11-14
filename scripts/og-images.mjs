#!/usr/bin/env node
// Regenerates the docs' social preview (OG) images and points every page at
// its image. Run from the repo root with `make og`.
//
// - Homepage (index.mdx): the centered "lightspark API docs" lockup, with the
//   tagline at the top and the URL at the bottom.
// - Every page in a docs.json tab: the lockup on the left and the tab name
//   (gray) over the page title on the right, on the tab's photo or the plain
//   dark surface (og/config.json).
// - images/og/api-reference.png: "API reference" alone. docs.json uses it as
//   the site-wide og:image, so API endpoint pages and any page added without
//   rerunning this script still get a Lightspark image.
//
// Pages in `keep` and pages outside the navigation are left as they are.
// The designs come from the og-studio repo (github.com/patcapulong/og-studio).

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = dirname(fileURLToPath(import.meta.url));
const MINT = join(HERE, '../mintlify');
const OG = join(HERE, 'og');
const config = JSON.parse(readFileSync(join(OG, 'config.json'), 'utf8'));

const PAGES_DIR = 'images/og/pages';
const HOME_IMAGE = 'images/og/home.png';
const SHARED_IMAGE = 'images/og/api-reference.png';

// ---------------------------------------------------------------------------
// Pages

/** docs.json page path -> the tab it's listed under (first listing wins). */
function tabsByPage() {
  const docs = JSON.parse(readFileSync(join(MINT, 'docs.json'), 'utf8'));
  const tabOf = new Map();
  const walk = (node, tab) => {
    if (typeof node === 'string') {
      if (!tabOf.has(node)) tabOf.set(node, tab);
    } else if (Array.isArray(node)) {
      node.forEach((n) => walk(n, tab));
    } else if (node) {
      for (const key of ['groups', 'pages']) if (node[key]) walk(node[key], tab);
    }
  };
  for (const t of docs.navigation.tabs) walk(t.groups, t.tab);
  return tabOf;
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---/;

function frontmatterField(fm, key) {
  const m = fm.match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'm'));
  return m ? m[1].trim().replace(/^(["'])(.*)\1$/, '$2') : '';
}

/** The page source with its `"og:image"` line set to `url`. */
function withOgImage(src, url) {
  const m = src.match(FRONTMATTER);
  if (!m) throw new Error('page has no frontmatter');
  const line = `"og:image": "${url}"`;
  const fm = /^["']?og:image["']?:.*$/m.test(m[1]) ? m[1].replace(/^["']?og:image["']?:.*$/m, line) : `${m[1]}\n${line}`;
  return `---\n${fm}\n---${src.slice(m[0].length)}`;
}

// ---------------------------------------------------------------------------
// Templates (ported from og-studio: Brand, EdgeLabels, InternalInlineLockup,
// RootMinimalLabeled). Coordinates are in the 1200x630 frame.

const TONES = {
  dark: { primary: '#f8f8f7', secondary: '#989898' },
  photo: { primary: '#ffffff', secondary: 'rgba(255,255,255,0.72)' },
};

const WORDMARK_PATHS = [
  'M114.715 5.23998L109.027 11.6288V6.09956e-06H105.692V20.3154H109.027V15.748L110.876 13.7584L115.416 20.3154H119.395L113.146 11.3206L118.75 5.23998H114.715Z',
  'M103.985 5.15589C101.94 5.21193 100.511 6.22069 99.7823 7.95801V5.23995H96.5318V20.3154H99.8664V12.5535C99.8664 9.58324 101.043 8.46239 103.341 8.46239C103.761 8.46239 104.154 8.49041 104.714 8.57448V5.18391C104.462 5.15589 104.21 5.15589 103.985 5.15589Z',
  'M86.3454 4.95972C88.447 4.95972 90.2123 5.88442 91.137 7.48164V5.23993H94.4995V20.3154H91.137V18.1297C90.2123 19.7549 88.447 20.6796 86.3454 20.6796C82.7306 20.6796 79.8444 17.7654 79.8444 12.8057C79.8444 7.87393 82.7306 4.95972 86.3454 4.95972ZM87.2981 17.9616C89.3997 17.9616 91.3051 16.4484 91.3051 12.8057C91.3051 9.16291 89.3997 7.67778 87.2981 7.67778C85.0003 7.67778 83.4031 9.52719 83.4031 12.8057C83.4031 16.1122 85.0003 17.9616 87.2981 17.9616Z',
  'M67.7673 24.6909L64.4327 25.2191V5.23993H67.7673V7.48164C68.72 5.88442 70.4573 4.95972 72.5869 4.95972C76.2017 4.95972 79.1159 7.87393 79.1159 12.8057C79.1159 17.7654 76.2017 20.6796 72.5869 20.6796C70.4573 20.6796 68.72 19.7549 67.7673 18.1297V24.6909ZM71.6062 17.9616C73.9319 17.9616 75.5572 16.1122 75.5572 12.8057C75.5572 9.52719 73.9319 7.67778 71.6062 7.67778C69.5046 7.67778 67.6272 9.16291 67.6272 12.8057C67.6272 16.4484 69.5046 17.9616 71.6062 17.9616Z',
  'M55.5722 10.9283L57.954 11.3766C61.0644 11.9651 63.194 13.0299 63.194 15.832C63.194 18.9704 60.3358 20.6797 56.609 20.6797C52.658 20.6797 50.1641 18.4099 49.7998 15.4397H53.1063C53.4986 17.177 54.6755 18.0737 56.665 18.0737C58.4864 18.0737 59.9155 17.3732 59.9155 16.1682C59.9155 14.9633 58.7946 14.4029 57.1134 14.0947L54.7035 13.6463C52.3497 13.198 50.1921 12.0771 50.1921 9.41512C50.1921 6.52894 53.0783 4.9037 56.5529 4.9037C59.8594 4.9037 62.4374 6.58498 62.9418 9.6393H59.6633C59.299 8.09813 57.982 7.5377 56.3288 7.5377C54.8436 7.5377 53.4426 8.0701 53.4426 9.27502C53.4426 10.1997 54.1711 10.6761 55.5722 10.9283Z',
  'M33.9736 7.67783C31.7039 7.67783 30.443 9.24702 30.443 12.3013V20.3154H27.1084V0.5281L30.443 6.862e-06V7.39761C31.2276 6.08062 32.7687 4.95977 35.2346 4.95977C38.9614 4.95977 40.2504 7.28553 40.2504 10.9563V20.3154H36.9159V11.881C36.9159 9.6113 36.6357 7.67783 33.9736 7.67783Z',
  'M16.8498 4.95975C18.9514 4.95975 20.6327 5.88445 21.5854 7.48166V5.23996H24.8919V18.6341C24.8919 23.5098 22.0898 25.5834 17.8586 25.5834C14.1318 25.5834 11.75 23.8461 11.1895 20.8758H14.5241C14.9444 22.1648 15.8691 22.9494 17.8586 22.9494C20.1283 22.9494 21.5854 21.8846 21.5854 19.1665V17.4292C20.6327 19.0544 18.9514 19.9511 16.8498 19.9511C13.2911 19.9511 10.3489 17.2891 10.3489 12.4414C10.3489 7.64979 13.2911 4.95975 16.8498 4.95975ZM17.8026 17.2611C19.9041 17.2611 21.7255 15.9441 21.7255 12.4414C21.7255 8.96679 19.9041 7.67781 17.8026 7.67781C15.5609 7.67781 13.9076 9.33106 13.9076 12.4414C13.9076 15.6078 15.5609 17.2611 17.8026 17.2611Z',
  'M43.0569 16.3644C43.0569 19.6429 43.9535 20.3154 47.1479 20.3154H50.1527L49.0049 17.7374H48.1287C46.6436 17.7374 46.3914 17.3731 46.3914 15.86V7.76185H49.4177V5.23994H46.3914V1.31696H43.0569V5.23994H40.3083L41.4312 7.76186L43.0569 7.76185V16.3644Z',
  'M5.67975 5.23997V20.3154H9.01428V5.23997H5.67975Z',
  'M5.67975 0V3.30651H9.01428V0H5.67975Z',
  'M0 20.3154V6.09956e-06H3.33453V20.3154H0Z',
];

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Suisse Intl VF at 28px in a 32px line box: the text baseline sits 26px below
// the box top. The wordmark draws its 120x26 viewBox into a 119x26 box; the
// flat bottom of its letters sits at 20.3154 in the viewBox.
const TEXT_BASELINE = 26;
const WORDMARK_SCALE = 119 / 120;
const WORDMARK_BASELINE = 20.3154 * WORDMARK_SCALE + (26 - 26 * WORDMARK_SCALE) / 2;

/** "lightspark API docs" lockup; (x, y) is the top-left of its 32px text box at scale 1. */
function brand(x, y, tone, s) {
  const top = y + 16 - 16 * s;
  const svgTop = top + (TEXT_BASELINE - WORDMARK_BASELINE) * s;
  return (
    `<svg viewBox="0 0 120 26" fill="${tone.primary}" style="position:absolute;left:${x}px;top:${svgTop}px;width:${119 * s}px;height:${26 * s}px">` +
    WORDMARK_PATHS.map((d) => `<path fill-rule="evenodd" d="${d}"/>`).join('') +
    `</svg>` +
    `<div class="t" style="left:${x + 124 * s}px;top:${top}px;font-size:${28 * s}px;line-height:${32 * s}px;letter-spacing:-0.06em;color:${tone.secondary}">API docs</div>`
  );
}

/** Small tagline at the top edge and URL at the bottom, centered. */
function edgeLabels(tone) {
  const style = `left:0;right:0;text-align:center;font-size:${10 * config.labelScale}px;color:${tone.secondary}`;
  return `<div class="t" style="${style};top:48px">${escapeHtml(config.tagline)}</div><div class="t" style="${style};bottom:48px">${escapeHtml(config.url)}</div>`;
}

function background(look) {
  if (!look.photo) return '';
  const origin = `${look.posX ?? 50}% ${look.posY ?? 50}%`;
  const zoom = look.zoom ?? 1;
  return (
    `<img class="photo" src="/photos/${look.photo}" style="object-position:${origin};transform-origin:${origin};${zoom !== 1 ? `transform:scale(${zoom})` : ''}">` +
    `<div class="fill" style="background:rgba(0,0,0,${look.scrim ?? 0})"></div>`
  );
}

function frame(look, body) {
  return `<!doctype html><html><head><style>
    @font-face { font-family: 'Suisse Intl VF'; src: url('/SuisseIntlVF.woff2') format('woff2'); font-weight: 100 900; }
    html, body { margin: 0; }
    .og { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #1a1a1a; font-family: 'Suisse Intl VF', sans-serif; font-weight: 400; -webkit-font-smoothing: antialiased; }
    .photo, .fill { position: absolute; inset: 0; width: 100%; height: 100%; }
    .photo { object-fit: cover; }
    .t { position: absolute; white-space: nowrap; line-height: 1.15; }
  </style></head><body><div class="og">${background(look)}${body}</div></body></html>`;
}

/** Lockup on the left, tab name over the page title on the right (Figma 3164:27172). */
function pageImage(section, title, look) {
  const s = config.textScale;
  const tone = look.photo ? TONES.photo : TONES.dark;
  const tab = section !== title ? `<div style="color:${tone.secondary}">${escapeHtml(section)}</div>` : '';
  const right =
    `<div class="t" style="right:60px;top:315px;transform:translateY(-50%);max-width:${560 * Math.max(1, s)}px;white-space:normal;text-align:right;` +
    `font-size:${28 * s}px;line-height:${36 * s}px;letter-spacing:-0.05em">${tab}<div style="color:${tone.primary}">${escapeHtml(title)}</div></div>`;
  return frame(look, edgeLabels(tone) + brand(60, 299, tone, s) + right);
}

/** The lockup centered, tagline at the top, URL at the bottom. */
function homeImage() {
  const s = config.textScale;
  return frame({}, edgeLabels(TONES.dark) + brand(600 - 115 * s, 299, TONES.dark, s));
}

// ---------------------------------------------------------------------------
// Render

/** Playwright screenshots only as PNG or JPEG, so the browser re-encodes photo pages as WebP. */
async function toWebp(page, png) {
  const webp = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    return canvas.toDataURL('image/webp', 0.85).split(',')[1];
  }, png.toString('base64'));
  return Buffer.from(webp, 'base64');
}

async function main() {
  const tabOf = tabsByPage();
  const keep = new Set(config.keep);
  const jobs = [
    { out: HOME_IMAGE, html: homeImage(), page: 'index' },
    { out: SHARED_IMAGE, html: pageImage(config.sharedTitle, config.sharedTitle, {}) },
  ];
  for (const [page, tab] of tabOf) {
    if (page === 'index' || keep.has(page)) continue;
    const look = config.tabs[tab];
    if (!look) throw new Error(`No look for tab "${tab}" in og/config.json`);
    const fm = readFileSync(join(MINT, `${page}.mdx`), 'utf8').match(FRONTMATTER)?.[1] ?? '';
    const title = frontmatterField(fm, 'title') || frontmatterField(fm, 'sidebarTitle');
    const ext = look.photo ? 'webp' : 'png';
    jobs.push({ out: `${PAGES_DIR}/${page}.${ext}`, html: pageImage(tab, title, look), page });
  }

  rmSync(join(MINT, PAGES_DIR), { recursive: true, force: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
  let html = '';
  await page.route('http://og.local/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/') return route.fulfill({ contentType: 'text/html', body: html });
    return route.fulfill({ path: join(OG, decodeURIComponent(path)) });
  });

  for (const job of jobs) {
    html = job.html;
    await page.goto('http://og.local/');
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
    });
    const png = await page.locator('.og').screenshot({ type: 'png' });
    const file = join(MINT, job.out);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, job.out.endsWith('.webp') ? await toWebp(page, png) : png);
    if (job.page) {
      const mdx = join(MINT, `${job.page}.mdx`);
      writeFileSync(mdx, withOgImage(readFileSync(mdx, 'utf8'), `/${job.out}`));
    }
  }
  await browser.close();
  console.log(`Wrote ${jobs.length} OG images (${jobs.filter((j) => j.page).length} pages updated).`);
}

await main();
