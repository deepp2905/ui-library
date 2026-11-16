/* Generates every raster brand asset from source, using the `sharp`
   already installed with Next.js (no extra dependencies).

     node scripts/brand-assets.mjs            icons only
     node scripts/brand-assets.mjs --capture  icons + social images
                                              (needs `npm run dev` running)

   Icons   src/app/icon.svg → src/app/favicon.ico (16/32/48),
           src/app/apple-icon.png (180, opaque), public/icon-192.png,
           public/icon-512.png, public/icon-maskable-512.png
   Social  /og-capture rendered in headless Edge/Chrome at 2x, then
           downscaled → public/og.png (1200×630, also the README hero)
           and .github/social-preview.png (1280×640). */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const p = (...parts) => join(root, ...parts);
const BG = '#fafafa'; // --color-bg; keep in sync with site.themeColor

const iconSvg = readFileSync(p('src/app/icon.svg'));

/* Transparent icon at an exact size. Rendered from the SVG at high
   density so small sizes are anti-aliased from vector, not upscaled. */
const renderIcon = (size) =>
  sharp(iconSvg, { density: Math.max(72, (size / 64) * 72 * 4) })
    .resize(size, size)
    .png()
    .toBuffer();

/* The eyes on an opaque tile. `scale` is the mark's width as a share of
   the canvas: iOS rounds the corners itself; maskable icons must keep
   the mark inside the central 80% safe circle. */
async function tile(size, scale) {
  const mark = await renderIcon(Math.round(size * scale));
  return sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: mark, gravity: 'center' }])
    .flatten({ background: BG })
    .png()
    .toBuffer();
}

/* Minimal ICO writer: PNG-compressed entries (supported since Vista). */
function toIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const dir = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...dir, ...pngs.map((x) => x.data)]);
}

async function icons() {
  const icoSizes = [16, 32, 48];
  const pngs = await Promise.all(icoSizes.map(async (size) => ({ size, data: await renderIcon(size) })));
  writeFileSync(p('src/app/favicon.ico'), toIco(pngs));
  writeFileSync(p('src/app/apple-icon.png'), await tile(180, 0.72));
  writeFileSync(p('public/icon-192.png'), await tile(192, 0.72));
  writeFileSync(p('public/icon-512.png'), await tile(512, 0.72));
  writeFileSync(p('public/icon-maskable-512.png'), await tile(512, 0.56));
  console.log('icons: favicon.ico, apple-icon.png, icon-192/512, icon-maskable-512');
}

function findBrowser() {
  const candidates = [
    process.env.BROWSER_PATH,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);
  const found = candidates.find((c) => existsSync(c));
  if (!found) throw new Error('No Chrome/Edge found; set BROWSER_PATH.');
  return found;
}

/* Render the capture page at 2x device pixels, then downscale with
   Lanczos so text and edges stay crisp at the final size. */
async function capture(browser, base, width, height, out) {
  const dir = mkdtempSync(join(tmpdir(), 'og-'));
  const shot = join(dir, 'shot.png');
  try {
    execFileSync(browser, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      `--user-data-dir=${join(dir, 'profile')}`,
      '--force-device-scale-factor=2',
      `--window-size=${width},${height}`,
      '--virtual-time-budget=6000',
      `--screenshot=${shot}`,
      `${base}/og-capture`,
    ], { stdio: 'ignore', timeout: 60_000 });
    const meta = await sharp(shot).metadata();
    if (meta.width !== width * 2) {
      console.warn(`warning: captured ${meta.width}×${meta.height}, expected ${width * 2}×${height * 2}`);
    }
    await sharp(shot)
      .extract({ left: 0, top: 0, width: width * 2, height: height * 2 })
      .resize(width, height, { kernel: 'lanczos3' })
      .flatten({ background: BG })
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`social: ${out.replace(root, '')} (${width}×${height})`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

await icons();
if (process.argv.includes('--capture')) {
  const base = process.env.CAPTURE_URL ?? 'http://localhost:3000';
  const browser = findBrowser();
  mkdirSync(p('.github'), { recursive: true });
  await capture(browser, base, 1200, 630, p('public/og.png'));
  await capture(browser, base, 1280, 640, p('.github/social-preview.png'));
}
