// Screenshots of each Figma frame state at 360×800 and 1440×900.
// usage: node tests/shots.mjs [baseURL] [outDir]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const base = process.argv[2] ?? 'http://localhost:4173/naghshineh/';
const out = process.argv[3] ?? 'shots';
const sizes = { mobile: { width: 360, height: 800 }, desktop: { width: 1440, height: 900 } };
const states = [
  ['1-hood', '#/'],
  ['2-school', '#/school'],
  ['3-selected', '#/school?place=library'],
  ['4-members', '#/school/library'],
  ['5-records', '#/school/library?tab=history'],
];
const browser = await chromium.launch();
for (const [name, vp] of Object.entries(sizes)) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
  for (const [id, hash] of states) {
    await page.goto(base + hash);
    await page.reload();
    await page.waitForTimeout(1200);
    const full = id.startsWith('4') || id.startsWith('5');
    await page.screenshot({ path: `${out}/${name}-${id}.png`, fullPage: full });
  }
  await ctx.close();
}
await browser.close();
console.log('ok');
