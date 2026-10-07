/* The card art, one composition per brand, drawn from each brand's current
   identity: its palette, its graphic motifs, its texture. Each returns a full
   face of SVG in spec px; prepare.ts rasterizes it once at the face
   texture's size. Art may be transparent where the print color should show
   (and, with a spot gloss art treatment, the opaque parts are the varnish). */

import { blob, blur, CHIP_AT, f1, FACE, face, grain, placeGlyph, rng } from './svg';

const L = FACE.landscape;
const P = FACE.portrait;

/* ── Fintech ──────────────────────────────────────────────────────────────── */

/** Feather (an investing app): the gold-card idea. Near-black lacquer, a
 *  low gold glow off the bottom-right, and the feather's own curve swept
 *  across the face as fine gold contour lines. */
export function featherArt() {
  const g = grain('fg', 0.05);
  const lines = Array.from({ length: 22 }, (_, i) => {
    const o = i * 26;
    return `<path d="M ${-120 + o} ${L.h + 40} C ${380 + o * 0.6} ${700 - o * 0.4}, ${700 + o * 0.3} ${180 - o * 0.2}, ${L.w + 120} ${-60 + o * 0.5}" fill="none" stroke="url(#gold)" stroke-width="${i % 5 === 0 ? 2.4 : 1.1}" opacity="${0.18 + (i % 5 === 0 ? 0.3 : 0.12)}"/>`;
  }).join('');
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#0b0a08"/>
     <rect width="${L.w}" height="${L.h}" fill="url(#glow)"/>
     ${lines}
     ${g.layer(L.w, L.h)}`,
    `<radialGradient id="glow" cx="1.02" cy="1.05" r="0.95"><stop offset="0" stop-color="#d9a441" stop-opacity="0.55"/><stop offset="0.45" stop-color="#7a5418" stop-opacity="0.22"/><stop offset="1" stop-color="#0b0a08" stop-opacity="0"/></radialGradient>
     <linearGradient id="gold" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#8a6420"/><stop offset="0.5" stop-color="#f3d38a"/><stop offset="1" stop-color="#b8862e"/></linearGradient>${g.defs}`,
  );
}

/** Cash: the green, and the $ blown up past the edge in a deeper green,
 *  tilted, with a second ghost of it offset behind. */
export function cashArt() {
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#00d64f"/>
     ${placeGlyph('cashapp', { x: 1090, y: 500, h: 1500, fill: '#00a83e', center: true, rotate: 14, opacity: 0.5 })}
     ${placeGlyph('cashapp', { x: 1180, y: 560, h: 1500, fill: '#00b947', center: true, rotate: 14 })}
     ${placeGlyph('cashapp', { x: 1180, y: 560, h: 1500, fill: 'url(#sheen)', center: true, rotate: 14 })}`,
    `<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3dff86" stop-opacity="0.45"/><stop offset="0.6" stop-color="#3dff86" stop-opacity="0"/></linearGradient>`,
  );
}

/** Wallet (a budgeting app): mint to emerald, the wallet's cards fanned up
 *  out of the bottom edge as frosted layers. */
export function walletArt() {
  const cards = [
    { x: 560, y: 470, r: -10, c: '#d9fff0', o: 0.22 },
    { x: 760, y: 400, r: -3, c: '#c8ffe6', o: 0.3 },
    { x: 960, y: 350, r: 5, c: '#ffffff', o: 0.38 },
    { x: 1140, y: 330, r: 13, c: '#ffffff', o: 0.5 },
  ]
    .map(
      (k) =>
        `<g transform="rotate(${k.r} ${k.x + 330} ${k.y + 210})"><rect x="${k.x}" y="${k.y}" width="660" height="420" rx="46" fill="${k.c}" opacity="${k.o}"/><rect x="${k.x + 52}" y="${k.y + 66}" width="130" height="96" rx="16" fill="#ffffff" opacity="${k.o + 0.2}"/><rect x="${k.x + 52}" y="${k.y + 300}" width="300" height="22" rx="11" fill="#ffffff" opacity="${k.o + 0.1}"/></g>`,
    )
    .join('');
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="url(#bg)"/>${cards}
     <rect y="${L.h - 210}" width="${L.w}" height="210" fill="url(#pocket)"/>`,
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5ff0a6"/><stop offset="1" stop-color="#079a5c"/></linearGradient>
     <linearGradient id="pocket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b8f56" stop-opacity="0.0"/><stop offset="0.35" stop-color="#0b8f56" stop-opacity="0.9"/><stop offset="1" stop-color="#067a48"/></linearGradient>`,
  );
}

/** Base: pure blue, a field of circles growing across the face, the
 *  onchain grid as a halftone. */
export function baseArt() {
  const step = 64;
  let dots = '';
  for (let y = step / 2; y < L.h + step; y += step) {
    for (let x = step / 2; x < L.w + step; x += step) {
      const t = Math.min(1, Math.max(0, (x / L.w) * 0.75 + (1 - y / L.h) * 0.4 - 0.1));
      const r = 2 + t * 27;
      dots += `<circle cx="${x}" cy="${y}" r="${f1(r)}" fill="#2b2bff"/>`;
    }
  }
  return face('landscape', `<rect width="${L.w}" height="${L.h}" fill="#0000ff"/>${dots}`);
}

/** Coin (an exchange): its blue, the mark's square-with-a-bite repeated
 *  outward as contour lines, as if the mark were a topography. */
export function coinArt() {
  const cx = 1180;
  const cy = 480;
  let rings = '';
  for (let i = 1; i <= 16; i++) {
    const s = 60 + i * 70;
    const bite = s * 0.48;
    const r = s * 0.24;
    const x = cx - s / 2;
    const y = cy - s / 2;
    rings += `<path d="M ${x + r} ${y} H ${x + s - r} Q ${x + s} ${y} ${x + s} ${y + r} V ${cy - bite / 4} M ${x + s} ${cy + bite / 4} V ${y + s - r} Q ${x + s} ${y + s} ${x + s - r} ${y + s} H ${x + r} Q ${x} ${y + s} ${x} ${y + s - r} V ${y + r} Q ${x} ${y} ${x + r} ${y}" fill="none" stroke="#ffffff" stroke-opacity="${0.05 + i * 0.008}" stroke-width="3"/>`;
  }
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="url(#bg)"/>${rings}`,
    `<radialGradient id="bg" cx="0.77" cy="0.5" r="0.9"><stop offset="0" stop-color="#2f6bff"/><stop offset="1" stop-color="#0041d9"/></radialGradient>`,
  );
}

/** Kalshi-like (a prediction market): yes and no, the face split on a
 *  diagonal into mint and black, with a fine probability grid over the mint. */
export function kalshiArt() {
  let grid = '';
  for (let x = 0; x <= L.w; x += 48) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${L.h}" stroke="#003d2a" stroke-opacity="0.12" stroke-width="2"/>`;
  for (let y = 0; y <= L.h; y += 48) grid += `<line x1="0" y1="${y}" x2="${L.w}" y2="${y}" stroke="#003d2a" stroke-opacity="0.12" stroke-width="2"/>`;
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#09d68f"/>${grid}
     <path d="M 980 0 H ${L.w} V ${L.h} H 560 Z" fill="#0a0d0c"/>
     <path d="M 980 0 L 560 ${L.h}" stroke="#ffffff" stroke-width="6" stroke-opacity="0.85"/>`,
  );
}

/** Venmo-like: its blue, and a confetti of the small things people split,
 *  drawn as simple shapes (hearts, pizza slices, sparks, coins). */
export function venmoArt() {
  const r = rng(11);
  const shapes = [
    (x: number, y: number, s: number) => `<path d="M ${x} ${y + s * 0.3} C ${x} ${y - s * 0.2}, ${x - s * 0.7} ${y - s * 0.2}, ${x - s * 0.7} ${y + s * 0.25} C ${x - s * 0.7} ${y + s * 0.6}, ${x} ${y + s * 0.85}, ${x} ${y + s} C ${x} ${y + s * 0.85}, ${x + s * 0.7} ${y + s * 0.6}, ${x + s * 0.7} ${y + s * 0.25} C ${x + s * 0.7} ${y - s * 0.2}, ${x} ${y - s * 0.2}, ${x} ${y + s * 0.3} Z"/>`,
    (x: number, y: number, s: number) => `<path d="M ${x - s * 0.55} ${y} Q ${x} ${y - s * 0.25} ${x + s * 0.55} ${y} L ${x} ${y + s} Z"/>`,
    (x: number, y: number, s: number) => `<path d="M ${x} ${y - s * 0.5} L ${x + s * 0.14} ${y - s * 0.14} L ${x + s * 0.5} ${y} L ${x + s * 0.14} ${y + s * 0.14} L ${x} ${y + s * 0.5} L ${x - s * 0.14} ${y + s * 0.14} L ${x - s * 0.5} ${y} L ${x - s * 0.14} ${y - s * 0.14} Z"/>`,
    (x: number, y: number, s: number) => `<circle cx="${x}" cy="${y}" r="${s * 0.42}"/><circle cx="${x}" cy="${y}" r="${s * 0.26}" fill="#008cff"/>`,
  ];
  let body = '';
  for (let i = 0; i < 90; i++) {
    const x = r() * L.w;
    const y = r() * L.h;
    const nearChip = x > 120 && x < 420 && y > 290 && y < 530;
    if (nearChip) continue;
    const s = 26 + r() * 34;
    const rot = r() * 360;
    const shade = r() > 0.7 ? '#9ed2ff' : '#3aa6ff';
    body += `<g fill="${shade}" transform="rotate(${f1(rot)} ${f1(x)} ${f1(y)})">${shapes[i % shapes.length](x, y, s)}</g>`;
  }
  return face('landscape', `<rect width="${L.w}" height="${L.h}" fill="#008cff"/>${body}`);
}

/** Poly (a prediction market): white, a faint grid, and the odds as a blue
 *  line climbing across with the area under it shaded, ending on a dot. */
export function polyArt() {
  const r = rng(8);
  const pts: Array<[number, number]> = [];
  let y = 700;
  for (let x = 80; x <= L.w - 140; x += 24) {
    y += (r() - 0.6) * 46;
    y = Math.max(220, Math.min(820, y));
    pts.push([x, y]);
  }
  const line = pts.map(([x, py], i) => `${i ? 'L' : 'M'} ${x} ${f1(py)}`).join(' ');
  const [ex, ey] = pts[pts.length - 1];
  let grid = '';
  for (let gy = 140; gy < L.h; gy += 140) grid += `<line x1="0" y1="${gy}" x2="${L.w}" y2="${gy}" stroke="#2e5cff" stroke-opacity="0.08" stroke-width="2"/>`;
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#ffffff"/>${grid}
     <path d="${line} L ${ex} ${L.h} L 80 ${L.h} Z" fill="url(#area)"/>
     <path d="${line}" fill="none" stroke="#2e5cff" stroke-width="8" stroke-linejoin="round"/>
     <circle cx="${ex}" cy="${f1(ey)}" r="26" fill="#2e5cff"/><circle cx="${ex}" cy="${f1(ey)}" r="52" fill="#2e5cff" opacity="0.18"/>`,
    `<linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e5cff" stop-opacity="0.22"/><stop offset="1" stop-color="#2e5cff" stop-opacity="0"/></linearGradient>`,
  );
}

/** Pay (two circles): black gloss, the two circles as a large Venn in two
 *  blues with the overlap a brighter third. */
export function payArt() {
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#05070d"/>
     <circle cx="900" cy="480" r="420" fill="#0a2a8f"/>
     <circle cx="1240" cy="480" r="420" fill="#0064e0"/>
     <path d="M 1070 99.6 A 420 420 0 0 1 1070 860.4 A 420 420 0 0 1 1070 99.6 Z" fill="#3d9bff"/>
     <rect width="${L.w}" height="${L.h}" fill="url(#shade)"/>`,
    `<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></linearGradient>`,
  );
}

/** Bread (a savings app): a slice of toast. A golden crust running the
 *  card's edge, the crumb speckled inside, browned toward the middle. */
export function breadArt() {
  const r = rng(5);
  let crumb = '';
  for (let i = 0; i < 1400; i++) {
    const x = 60 + r() * (L.w - 120);
    const y = 60 + r() * (L.h - 120);
    const s = 1.5 + r() * 5;
    crumb += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(s)}" ry="${f1(s * (0.5 + r() * 0.6))}" fill="${r() > 0.5 ? '#c98a45' : '#f6dcaa'}" opacity="${f1(0.25 + r() * 0.4)}"/>`;
  }
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#8a4a18"/>
     <rect x="34" y="34" width="${L.w - 68}" height="${L.h - 68}" rx="72" fill="url(#crust)"/>
     <rect x="64" y="64" width="${L.w - 128}" height="${L.h - 128}" rx="52" fill="url(#crumb)"/>
     <g filter="url(#soft)">${crumb}</g>
     <rect x="64" y="64" width="${L.w - 128}" height="${L.h - 128}" rx="52" fill="url(#toast)"/>`,
    `<linearGradient id="crust" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c8792f"/><stop offset="1" stop-color="#a65b1e"/></linearGradient>
     <radialGradient id="crumb" cx="0.5" cy="0.5" r="0.7"><stop offset="0" stop-color="#f7dfae"/><stop offset="1" stop-color="#eec88a"/></radialGradient>
     <radialGradient id="toast" cx="0.55" cy="0.52" r="0.55"><stop offset="0" stop-color="#d79a52" stop-opacity="0.55"/><stop offset="1" stop-color="#d79a52" stop-opacity="0"/></radialGradient>
     ${blur('soft', 0.6)}`,
  );
}

/** Fomo (a social trading app): black, a run of candlesticks climbing
 *  across, printed as clear gloss (the art's alpha is the varnish). */
export function fomoArt() {
  const r = rng(3);
  let bars = '';
  let y = 700;
  for (let i = 0; i < 34; i++) {
    const x = 70 + i * 43;
    const up = r() > 0.32;
    const len = 30 + r() * 110;
    const top = up ? y - len : y;
    const bottom = up ? y : y + len;
    if (!(x > 140 && x < 400 && bottom > 300 && top < 520)) {
      const c = up ? '#2c2c33' : '#1c1c22';
      bars += `<line x1="${x + 11}" y1="${f1(top - 20 - r() * 40)}" x2="${x + 11}" y2="${f1(bottom + 20 + r() * 30)}" stroke="${c}" stroke-width="4"/><rect x="${x}" y="${f1(top)}" width="22" height="${f1(bottom - top)}" rx="3" fill="${c}"/>`;
    }
    y += up ? -len * 0.72 : len * 0.5;
    y = Math.max(140, Math.min(860, y));
  }
  return face('landscape', bars);
}

/* ── Creators and media ───────────────────────────────────────────────────── */

/** Video (a play button): a black screen with a faint vignette and
 *  scanlines, and the player's red progress bar across the bottom with its
 *  scrubber, a third of the way in. */
export function videoArt() {
  let scan = '';
  for (let y = 0; y < L.h; y += 6) scan += `<rect y="${y}" width="${L.w}" height="2" fill="#fff" opacity="0.018"/>`;
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#0f0f0f"/>
     <rect width="${L.w}" height="${L.h}" fill="url(#vig)"/>${scan}
     <rect x="96" y="${L.h - 132}" width="${L.w - 192}" height="10" rx="5" fill="#ffffff" opacity="0.22"/>
     <rect x="96" y="${L.h - 132}" width="${(L.w - 192) * 0.36}" height="10" rx="5" fill="url(#bar)"/>
     <circle cx="${96 + (L.w - 192) * 0.36}" cy="${L.h - 127}" r="22" fill="#ff0033"/>`,
    `<radialGradient id="vig" cx="0.62" cy="0.4" r="0.85"><stop offset="0" stop-color="#2a2a2a"/><stop offset="1" stop-color="#050505"/></radialGradient>
     <linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="#ff0033"/><stop offset="1" stop-color="#ff2a6d"/></linearGradient>`,
  );
}

/** Sound (a cloud): the orange gradient, a full-width waveform in white
 *  at low alpha, the played part brighter. */
export function soundArt() {
  const r = rng(9);
  const n = 118;
  const w = (L.w - 120) / n;
  let wave = '';
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const env = 0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, t * 1.15)) ** 0.7;
    const h = (60 + r() * 280) * env;
    const x = 60 + i * w;
    const played = t < 0.42;
    wave += `<rect x="${f1(x)}" y="${f1(640 - h)}" width="${f1(w * 0.62)}" height="${f1(h)}" fill="#fff" opacity="${played ? 0.85 : 0.35}"/>`;
    wave += `<rect x="${f1(x)}" y="644" width="${f1(w * 0.62)}" height="${f1(h * 0.42)}" fill="#fff" opacity="${played ? 0.4 : 0.16}"/>`;
  }
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="url(#bg)"/>${wave}`,
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7a00"/><stop offset="1" stop-color="#ff3300"/></linearGradient>`,
  );
}

/** Patron (a membership platform), upright: the editorial look. Warm paper,
 *  the mark blown up and cropped off the top-right in black, a coral disc
 *  tucked under it, fine grain. */
export function patronArt() {
  const g = grain('pg', 0.06);
  return face(
    'portrait',
    `<rect width="${P.w}" height="${P.h}" fill="#f2eee6"/>
     <circle cx="230" cy="1150" r="180" fill="#ff5a4e"/>
     ${placeGlyph('patreon', { x: 690, y: 700, h: 1150, fill: '#141414', center: true })}
     ${g.layer(P.w, P.h)}`,
    g.defs,
  );
}

/** Ghost (a crypto wallet), upright: lavender with soft blobs of its
 *  pastels, a dreamy mesh. */
export function ghostArt() {
  return face(
    'portrait',
    `<rect width="${P.w}" height="${P.h}" fill="#ab9ff2"/>
     ${blob(140, 260, 360, 300, '#e2dffe', 'b')}
     ${blob(860, 520, 320, 380, '#ffdadc', 'b', 0.85)}
     ${blob(220, 1240, 420, 360, '#7d6ff0', 'b')}
     ${blob(780, 1400, 300, 260, '#b9f5d8', 'b', 0.6)}`,
    blur('b', 120),
  );
}

/** Equalizer (an audio app), upright: black, with rounded level bars
 *  rising from the bottom in its green, lime, and a pink. */
export function eqArt() {
  const cols = ['#1ed760', '#b8f24a', '#ffb3e1', '#1ed760', '#5ce38a', '#ffd23f', '#1ed760', '#b8f24a'];
  const heights = [520, 760, 430, 980, 650, 820, 560, 700];
  const w = 92;
  const gap = (P.w - 80 - cols.length * w) / (cols.length - 1);
  const bars = cols
    .map((c, i) => {
      const x = 40 + i * (w + gap);
      const h = heights[i];
      return `<rect x="${f1(x)}" y="${P.h - h}" width="${w}" height="${h + 60}" rx="46" fill="${c}"/>`;
    })
    .join('');
  return face('portrait', `<rect width="${P.w}" height="${P.h}" fill="#121212"/>${bars}<rect width="${P.w}" height="${P.h}" fill="url(#fade)"/>`, `<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stop-color="#121212"/><stop offset="0.75" stop-color="#121212" stop-opacity="0"/></linearGradient>`);
}

/** Note (a short-video app), upright: black, with a few horizontal glitch
 *  bands in its cyan and red. */
export function noteArt() {
  const r = rng(21);
  let bands = '';
  for (let i = 0; i < 14; i++) {
    const y = r() * P.h;
    const h = 4 + r() * 22;
    const x = r() * P.w * 0.6;
    const w = 120 + r() * 600;
    bands += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${i % 2 ? '#25f4ee' : '#fe2c55'}" opacity="${f1(0.35 + r() * 0.4)}"/>`;
  }
  return face('portrait', `<rect width="${P.w}" height="${P.h}" fill="#010101"/><rect width="${P.w}" height="${P.h}" fill="url(#v)"/>${bands}`, `<radialGradient id="v" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stop-color="#1b1b1f"/><stop offset="1" stop-color="#010101"/></radialGradient>`);
}

/** Camera (a photo app), upright: the sunset gradient, yellow and orange
 *  rising from the bottom-left into magenta and violet, the camera body's
 *  rounded square drawn around where the lens will sit. */
export function cameraArt() {
  return face(
    'portrait',
    `<rect width="${P.w}" height="${P.h}" fill="url(#ig)"/>
     <rect x="140" y="560" width="${P.w - 280}" height="${P.w - 280}" rx="190" fill="none" stroke="#fff" stroke-width="46"/>`,
    `<radialGradient id="ig" cx="0.1" cy="1.02" r="1.35"><stop offset="0" stop-color="#ffd600"/><stop offset="0.22" stop-color="#ff7a00"/><stop offset="0.48" stop-color="#ff0069"/><stop offset="0.75" stop-color="#d300c5"/><stop offset="1" stop-color="#7638fa"/></radialGradient>`,
  );
}

/** Live (a livestream marketplace): black, a comic sunburst of its yellow
 *  radiating from behind the mark. */
export function liveArt() {
  const cx = 1150;
  const cy = 400;
  let rays = '';
  const n = 28;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = a0 + (Math.PI * 2) / n / 2;
    const R = 1700;
    rays += `<path d="M ${cx} ${cy} L ${f1(cx + Math.cos(a0) * R)} ${f1(cy + Math.sin(a0) * R)} L ${f1(cx + Math.cos(a1) * R)} ${f1(cy + Math.sin(a1) * R)} Z" fill="#ffe14d"/>`;
  }
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#0d0d0d"/><g opacity="0.92">${rays}</g>
     <rect width="${L.w}" height="${L.h}" fill="url(#vig)"/>`,
    `<radialGradient id="vig" cx="0.75" cy="0.42" r="0.75"><stop offset="0.25" stop-color="#0d0d0d" stop-opacity="0"/><stop offset="1" stop-color="#0d0d0d" stop-opacity="0.92"/></radialGradient>`,
  );
}

/** Kraken-like (an exchange), upright: deep violet, the tentacles curling
 *  up from below in lighter purples. */
export function tentacleArt() {
  const arms = [
    { d: `M 120 ${P.h + 40} C 60 1180, 360 1040, 300 860 C 250 720, 90 760, 140 640`, w: 120, c: '#8d5cff' },
    { d: `M 520 ${P.h + 40} C 560 1200, 820 1180, 800 980 C 780 820, 600 860, 640 740`, w: 140, c: '#a07bff' },
    { d: `M 900 ${P.h + 40} C 960 1300, 760 1300, 720 1180`, w: 90, c: '#6a35f0' },
    { d: `M -40 1100 C 140 1080, 180 1260, 340 1220`, w: 70, c: '#6a35f0' },
  ]
    .map(
      (a) =>
        `<path d="${a.d}" fill="none" stroke="${a.c}" stroke-width="${a.w}" stroke-linecap="round"/>` +
        `<path d="${a.d}" fill="none" stroke="#d8c8ff" stroke-opacity="0.55" stroke-width="${f1(a.w * 0.26)}" stroke-dasharray="0.1 ${f1(a.w * 0.5)}" stroke-linecap="round" transform="translate(${f1(a.w * 0.18)} 0)"/>`,
    )
    .join('');
  return face(
    'portrait',
    `<rect width="${P.w}" height="${P.h}" fill="url(#bg)"/>${arms}`,
    `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0f7a"/><stop offset="1" stop-color="#5a24e8"/></linearGradient>`,
  );
}

/* ── Commerce ─────────────────────────────────────────────────────────────── */

/** Market (a social marketplace): its blue, a scalloped awning in white
 *  stripes along the top edge like a storefront. */
export function marketArt() {
  const n = 12;
  const w = L.w / n;
  let awning = '';
  for (let i = 0; i < n; i++) {
    const x = i * w;
    const fill = i % 2 ? '#ffffff' : '#0a55d6';
    awning += `<path d="M ${f1(x)} 0 H ${f1(x + w)} V 170 A ${f1(w / 2)} ${f1(w / 2)} 0 0 1 ${f1(x)} 170 Z" fill="${fill}"/>`;
  }
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#0866ff"/>
     <rect width="${L.w}" height="${L.h}" fill="url(#light)"/>
     <g filter="url(#drop)">${awning}</g>`,
    `<radialGradient id="light" cx="0.5" cy="0.15" r="0.9"><stop offset="0" stop-color="#4d91ff"/><stop offset="1" stop-color="#0757e0" stop-opacity="0"/></radialGradient>
     <filter id="drop" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#002a80" flood-opacity="0.35"/></filter>`,
  );
}

/** Parcel (an auction marketplace): white, a faint isometric grid, and a
 *  few parcels stacked in its four colors. */
export function parcelArt() {
  const box = (x: number, y: number, s: number, top: string, left: string, right: string) => {
    const h = s * 0.58;
    return `<path d="M ${x} ${y} L ${x + s} ${y - h} L ${x + 2 * s} ${y} L ${x + s} ${y + h} Z" fill="${top}"/><path d="M ${x} ${y} L ${x + s} ${y + h} L ${x + s} ${y + h + s * 1.1} L ${x} ${y + s * 1.1} Z" fill="${left}"/><path d="M ${x + 2 * s} ${y} L ${x + s} ${y + h} L ${x + s} ${y + h + s * 1.1} L ${x + 2 * s} ${y + s * 1.1} Z" fill="${right}"/>`;
  };
  let grid = '';
  for (let i = -20; i < 40; i++) {
    grid += `<line x1="${i * 80}" y1="0" x2="${i * 80 + L.h * 1.72}" y2="${L.h}" stroke="#d8dbe3" stroke-width="2"/>`;
    grid += `<line x1="${i * 80}" y1="0" x2="${i * 80 - L.h * 1.72}" y2="${L.h}" stroke="#d8dbe3" stroke-width="2"/>`;
  }
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#fbfbfd"/>${grid}
     ${box(860, 640, 150, '#ffd166', '#f5af02', '#d99a00')}
     ${box(1150, 640, 150, '#ff6b6e', '#e53238', '#c2262c')}
     ${box(1005, 470, 150, '#4f9bff', '#0064d2', '#0052ad')}
     ${box(1150, 300, 120, '#b5e15a', '#86b817', '#6f9a10')}`,
  );
}

/** Thread (a handmade marketplace): kraft paper, a stitched border inset
 *  like a sewn label, a few cross-stitches in the corner. */
export function threadArt() {
  const g = grain('tg', 0.09, 0.7);
  const inset = 58;
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#efe4cf"/>
     <rect width="${L.w}" height="${L.h}" fill="url(#k)"/>
     ${g.layer(L.w, L.h)}
     <rect x="${inset}" y="${inset}" width="${L.w - inset * 2}" height="${L.h - inset * 2}" rx="46" fill="none" stroke="#f1641e" stroke-width="7" stroke-dasharray="26 18" stroke-linecap="round"/>
     <g stroke="#f1641e" stroke-width="7" stroke-linecap="round">${Array.from({ length: 5 }, (_, i) => `<path d="M ${1250 + i * 42} 760 l 26 26 M ${1276 + i * 42} 760 l -26 26"/>`).join('')}</g>`,
    `<radialGradient id="k" cx="0.3" cy="0.3" r="1"><stop offset="0" stop-color="#f6ecd9"/><stop offset="1" stop-color="#e2d2b2"/></radialGradient>${g.defs}`,
  );
}

/** Pop (a resale app), upright: its red with heavy grain, like a
 *  risograph print. */
export function popArt() {
  const g = grain('pg', 0.12, 0.65);
  return face('portrait', `<rect width="${P.w}" height="${P.h}" fill="#ff2300"/><rect width="${P.w}" height="${P.h}" fill="url(#d)"/>${g.layer(P.w, P.h)}`, `<linearGradient id="d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4a1f"/><stop offset="1" stop-color="#e01600"/></linearGradient>${g.defs}`);
}

/** Cross (a sneaker exchange): a monogram of small X's, tone on tone, as a
 *  clear varnish over the matte green (the art's alpha is the gloss). */
export function crossArt() {
  const s = 54;
  let marks = '';
  for (let row = 0, y = 30; y < L.h + s; y += s * 0.9, row++) {
    for (let x = row % 2 ? s / 2 : 0; x < L.w + s; x += s) {
      marks += `<path d="M ${f1(x - 12)} ${f1(y - 15)} L ${f1(x + 12)} ${f1(y + 15)} M ${f1(x + 12)} ${f1(y - 15)} L ${f1(x - 12)} ${f1(y + 15)}" stroke="#0a7048" stroke-width="7" stroke-linecap="round"/>`;
    }
  }
  return face('landscape', marks);
}

/** Denim (a menswear marketplace): indigo twill, a fine diagonal weave,
 *  with a line of orange top-stitching across. */
export function denimArt() {
  const r = rng(14);
  let twill = '';
  for (let i = -L.h; i < L.w; i += 7) {
    twill += `<line x1="${i}" y1="${L.h}" x2="${i + L.h}" y2="0" stroke="${r() > 0.5 ? '#3b5a8f' : '#22385f'}" stroke-width="${f1(2 + r() * 2)}" opacity="${f1(0.4 + r() * 0.4)}"/>`;
  }
  const stitch = (y: number) => `<line x1="0" y1="${y}" x2="${L.w}" y2="${y}" stroke="#e8a33a" stroke-width="6" stroke-dasharray="22 14"/>`;
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#1a2b4c"/>${twill}
     <rect width="${L.w}" height="${L.h}" fill="url(#fade)"/>
     ${stitch(112)}${stitch(136)}`,
    `<radialGradient id="fade" cx="0.6" cy="0.4" r="0.8"><stop offset="0" stop-color="#5d7fb8" stop-opacity="0.35"/><stop offset="1" stop-color="#0e1a33" stop-opacity="0.45"/></radialGradient>`,
  );
}

/** Speed (a creator storefront): orange, the mark's three bars carried
 *  across the face as long diagonal stripes. */
export function speedArt() {
  const stripes = [
    { x: 520, w: 120, o: 0.16 },
    { x: 760, w: 220, o: 0.22 },
    { x: 1080, w: 360, o: 0.3 },
  ]
    .map((s) => `<rect x="${s.x}" y="-600" width="${s.w}" height="2400" fill="#fff" opacity="${s.o}" transform="rotate(45 ${s.x} 480)"/>`)
    .join('');
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="url(#bg)"/>${stripes}`,
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff7a45"/><stop offset="1" stop-color="#fa4616"/></linearGradient>`,
  );
}

/** Box (a store): corrugated kraft, a strip of packing tape across, and a
 *  white shipping label with a barcode where the mark is printed. */
export function boxArt() {
  const g = grain('bg', 0.1, 0.55);
  const r = rng(23);
  let flutes = '';
  for (let x = 0; x < L.w; x += 18) flutes += `<rect x="${x}" width="9" height="${L.h}" fill="#000" opacity="0.035"/>`;
  let code = '';
  for (let x = 0; x < 300; ) {
    const w = 3 + Math.floor(r() * 4) * 3;
    code += `<rect x="${1040 + x}" y="300" width="${w}" height="110" fill="#232f3e"/>`;
    x += w + 3 + Math.floor(r() * 3) * 3;
  }
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#c9965b"/>${flutes}
     ${g.layer(L.w, L.h)}
     <rect x="0" y="600" width="${L.w}" height="170" fill="#e8c48a" opacity="0.55" transform="rotate(-4 768 685)"/>
     <rect x="0" y="600" width="${L.w}" height="170" fill="url(#shine)" transform="rotate(-4 768 685)"/>
     <g transform="rotate(3 1200 300)">
       <rect x="1000" y="90" width="390" height="360" rx="14" fill="#000" opacity="0.15" transform="translate(6 10)"/>
       <rect x="1000" y="90" width="390" height="360" rx="14" fill="#fbfaf6"/>
       <rect x="1040" y="250" width="310" height="4" fill="#232f3e" opacity="0.25"/>
       <rect x="1180" y="130" width="170" height="14" rx="7" fill="#232f3e" opacity="0.3"/>
       <rect x="1180" y="162" width="120" height="14" rx="7" fill="#232f3e" opacity="0.3"/>
       <rect x="1180" y="194" width="150" height="14" rx="7" fill="#232f3e" opacity="0.3"/>
       ${code}
     </g>`,
    `<linearGradient id="shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="0.3" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0.15"/></linearGradient>${g.defs}`,
  );
}

/* ── Delivery and travel ──────────────────────────────────────────────────── */

/** Road (a rideshare app): its pink, a dark road sweeping through with a
 *  dashed center line. */
export function roadArt() {
  const d = `M -120 900 C 300 860, 520 560, 820 520 S 1300 300, 1700 120`;
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="url(#bg)"/>
     <path d="${d}" fill="none" stroke="#2b0a3d" stroke-width="210" stroke-linecap="round"/>
     <path d="${d}" fill="none" stroke="#ffffff" stroke-width="10" stroke-dasharray="46 40"/>`,
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff3ec9"/><stop offset="1" stop-color="#e2009f"/></linearGradient>`,
  );
}

/** Courier (a delivery app): white, a city's streets in black hairlines,
 *  and a dotted route with a pin. */
export function mapArt() {
  const r = rng(31);
  let streets = '';
  for (let x = 40; x < L.w; x += 70 + r() * 70) {
    streets += `<line x1="${f1(x)}" y1="0" x2="${f1(x + 60)}" y2="${L.h}" stroke="#111" stroke-width="${r() > 0.82 ? 9 : 3}" opacity="0.22"/>`;
  }
  for (let y = 30; y < L.h; y += 60 + r() * 60) {
    streets += `<line x1="0" y1="${f1(y)}" x2="${L.w}" y2="${f1(y - 50)}" stroke="#111" stroke-width="${r() > 0.82 ? 9 : 3}" opacity="0.22"/>`;
  }
  streets += `<path d="M -40 ${L.h - 80} L ${L.w + 40} 120" stroke="#111" stroke-width="16" opacity="0.18"/>`;
  streets += `<rect x="700" y="120" width="220" height="150" rx="10" fill="#111" opacity="0.06" transform="rotate(-2 810 195)"/>`;
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#f4f4f2"/>${streets}
     <rect width="${L.w}" height="${L.h}" fill="url(#fade)"/>
     <path d="M 520 820 C 760 760, 760 560, 980 540 S 1240 300, 1330 260" fill="none" stroke="#111" stroke-width="12" stroke-dasharray="2 26" stroke-linecap="round"/>
     <circle cx="1330" cy="260" r="34" fill="#111"/><circle cx="1330" cy="260" r="13" fill="#f4f4f2"/>`,
    `<radialGradient id="fade" cx="0.2" cy="0.45" r="0.6"><stop offset="0" stop-color="#f4f4f2"/><stop offset="1" stop-color="#f4f4f2" stop-opacity="0"/></radialGradient>`,
  );
}

/** Dash (a delivery app): its red, motion streaks running off to the left. */
export function dashArt() {
  const r = rng(17);
  let streaks = '';
  for (let i = 0; i < 26; i++) {
    const y = 80 + r() * (L.h - 160);
    const x = 500 + r() * 800;
    const w = 200 + r() * 700;
    streaks += `<rect x="${f1(x - w)}" y="${f1(y)}" width="${f1(w)}" height="${f1(6 + r() * 16)}" rx="10" fill="url(#streak)" opacity="${f1(0.25 + r() * 0.45)}"/>`;
  }
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#ff3008"/>${streaks}`,
    `<linearGradient id="streak" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#ffd2c4"/></linearGradient>`,
  );
}

/** Table (a food delivery app), upright: an orange gingham tablecloth and a
 *  white plate where the mark sits. */
export function ginghamArt() {
  const s = 96;
  let check = '';
  for (let x = 0; x < P.w; x += s * 2) check += `<rect x="${x}" width="${s}" height="${P.h}" fill="#ff8000" opacity="0.55"/>`;
  for (let y = 0; y < P.h; y += s * 2) check += `<rect y="${y}" width="${P.w}" height="${s}" fill="#ff8000" opacity="0.55"/>`;
  return face(
    'portrait',
    `<rect width="${P.w}" height="${P.h}" fill="#fff4e8"/>${check}
     <circle cx="${P.w / 2}" cy="900" r="330" fill="#000" opacity="0.12" transform="translate(0 18)"/>
     <circle cx="${P.w / 2}" cy="900" r="330" fill="#ffffff"/>
     <circle cx="${P.w / 2}" cy="900" r="268" fill="none" stroke="#f1ece4" stroke-width="10"/>`,
  );
}

/* ── AI ───────────────────────────────────────────────────────────────────── */

/** Claw (an AI agent), upright: deep navy sea, rising bubbles in teal, a
 *  glow where the claw sits. */
export function clawArt() {
  const r = rng(41);
  let bubbles = '';
  for (let i = 0; i < 60; i++) {
    const x = r() * P.w;
    const y = r() * P.h;
    const rad = 4 + r() ** 2 * 36;
    if (x > CHIP_AT.portrait.x - 30 && x < CHIP_AT.portrait.x + 180 && y < 400) continue;
    bubbles += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rad)}" fill="none" stroke="#3ee6c8" stroke-width="${f1(2 + rad / 10)}" opacity="${f1(0.15 + r() * 0.4)}"/>`;
  }
  return face(
    'portrait',
    `<rect width="${P.w}" height="${P.h}" fill="url(#sea)"/>
     ${blob(P.w / 2, 860, 380, 380, '#e5484d', 'g', 0.28)}${bubbles}`,
    `<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262c66"/><stop offset="1" stop-color="#11143a"/></linearGradient>${blur('g', 110)}`,
  );
}

/** Spark (an AI assistant): warm cream paper, a terracotta sunburst of
 *  fine rays from below the right edge. */
export function sparkArt() {
  const g = grain('sg', 0.05);
  const cx = 1240;
  const cy = 1080;
  let rays = '';
  for (let i = 0; i < 64; i++) {
    const a = Math.PI + (i / 63) * Math.PI;
    rays += `<line x1="${cx}" y1="${cy}" x2="${f1(cx + Math.cos(a) * 1500)}" y2="${f1(cy + Math.sin(a) * 1500)}" stroke="#d97757" stroke-width="${i % 4 === 0 ? 4 : 1.6}" opacity="${i % 4 === 0 ? 0.55 : 0.3}"/>`;
  }
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#f0eee6"/>${rays}
     <circle cx="${cx}" cy="${cy}" r="300" fill="#f0eee6"/>
     ${g.layer(L.w, L.h)}`,
    g.defs,
  );
}

/** Field (a sportsbook): black, a pitch's lines in its green, and a band of
 *  green across the bottom. */
export function fieldArt() {
  const c = '#53d337';
  return face(
    'landscape',
    `<rect width="${L.w}" height="${L.h}" fill="#0c0f0b"/>
     <g fill="none" stroke="${c}" stroke-width="5" opacity="0.4">
       <rect x="560" y="70" width="${L.w - 620}" height="${L.h - 140}"/>
       <line x1="1048" y1="70" x2="1048" y2="${L.h - 70}"/>
       <circle cx="1048" cy="${L.h / 2}" r="150"/>
       <rect x="${L.w - 300}" y="${L.h / 2 - 210}" width="240" height="420"/>
       <rect x="${L.w - 160}" y="${L.h / 2 - 110}" width="100" height="220"/>
       <path d="M ${L.w - 300} ${L.h / 2 - 110} A 160 160 0 0 0 ${L.w - 300} ${L.h / 2 + 110}"/>
     </g>
     <path d="M 0 ${L.h - 200} L ${L.w} ${L.h - 440} L ${L.w} ${L.h - 390} L 0 ${L.h - 150} Z" fill="${c}"/>`,
  );
}
