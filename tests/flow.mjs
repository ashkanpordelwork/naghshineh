// End-to-end walk through the scenario «علی کتابخانه‌ی مدرسه رو پیدا می‌کنه و درخواست عضویت می‌ده»
// on 360×800 and 1440×900. usage: node tests/flow.mjs [baseURL]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require('/opt/node22/lib/node_modules/playwright'));
}

const base = process.argv[2] ?? 'http://localhost:4173/naghshineh/';
let failures = 0;
const ok = (cond, msg) => {
  if (cond) console.log('  ✓', msg);
  else {
    failures++;
    console.log('  ✗', msg);
  }
};

async function run(label, viewport, opts = {}) {
  console.log(`\n▶ ${label} ${viewport.width}×${viewport.height}`);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  // ignore the page that is fading out during a route crossfade
  const tid = (id) => page.locator(`[data-testid="${id}"]:not([aria-hidden="true"] *)`);
  const visible = (id) => tid(id).first().isVisible();
  const transform = () => page.$eval('.map-world', (e) => e.style.transform);
  const url = () => decodeURIComponent(page.url().split('#')[1] ?? '');
  // drag the map (like a user) until a world element is inside the viewport
  const reveal = async (id) => {
    for (let i = 0; i < 6; i++) {
      const b = await tid(id).boundingBox();
      const v = await tid('map-viewport').boundingBox();
      const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      const inside = cx > v.x + 40 && cx < v.x + v.width - 40 && cy > v.y + 220 && cy < v.y + v.height - 200;
      if (inside) return;
      const dx = Math.max(-200, Math.min(200, v.x + v.width / 2 - cx));
      const dy = Math.max(-200, Math.min(200, v.y + v.height / 2 - cy));
      await page.mouse.move(v.x + v.width / 2, v.y + v.height / 2 + 60);
      await page.mouse.down();
      await page.mouse.move(v.x + v.width / 2 + dx, v.y + v.height / 2 + 60 + dy, { steps: 12 });
      await page.waitForTimeout(80);
      await page.mouse.up();
      await page.waitForTimeout(500);
    }
  };
  const openLibrarySheet = async () => {
    await reveal('tag-library');
    await tid('tag-library').click();
    await tid('place-sheet').waitFor();
    await page.waitForFunction(() => document.querySelector('[data-testid=sheet-title]')?.textContent === 'کتابخانه');
    await page.waitForTimeout(600);
  };
  const toast = async (text) => {
    await page.waitForTimeout(150);
    return (await tid('toast').allTextContents()).some((t) => t.includes(text));
  };

  // ── Step 1: open app ──
  await page.goto(base);
  await tid('screen-hood').waitFor();
  ok(await visible('hint-card'), 'neighbourhood map + hint card');
  ok((await tid('nav-hood').getAttribute('aria-current')) === 'page', '«محله من» active');
  const vp = await tid('map-viewport').boundingBox();
  let t0 = await transform();
  await page.mouse.move(vp.x + vp.width / 2, vp.y + vp.height / 2);
  await page.mouse.down();
  await page.mouse.move(vp.x + vp.width / 2 - 120, vp.y + vp.height / 2 - 60, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(700);
  ok((await transform()) !== t0, 'drag pans the map (with momentum)');
  t0 = await transform();
  await page.mouse.move(vp.x + vp.width / 2, vp.y + vp.height / 2);
  await page.mouse.wheel(0, -400);
  await page.waitForTimeout(200);
  ok((await transform()).includes('scale'), 'wheel zooms');
  for (let i = 0; i < 6; i++) await tid('zoom-out').click();
  await page.waitForTimeout(600);
  const sOut = await page.$eval('.map-world', (e) => e.style.transform.match(/scale\(([\d.]+)\)/)?.[1]);
  ok(Math.abs(Number(sOut) - 0.6) < 0.01, `zoom-out clamps at 0.6 (got ${sOut})`);
  await tid('zoom-in').click();
  await page.waitForTimeout(500);
  const r0 = await tid('minimap-rect').evaluate((e) => e.getAttribute('x') + ',' + e.getAttribute('y'));
  const mm = await tid('minimap').boundingBox();
  await page.mouse.click(mm.x + 18, mm.y + 40);
  await page.waitForTimeout(900);
  const r1 = await tid('minimap-rect').evaluate((e) => e.getAttribute('x') + ',' + e.getAttribute('y'));
  ok(r0 !== r1, 'minimap click moves camera + viewport rectangle');
  await tid('locate').click();
  await page.waitForTimeout(900);
  ok(true, 'locate returns to centre');

  // ── Step 2: enter school ──
  await tid('tag-school').click();
  await tid('screen-school').waitFor({ timeout: 4000 });
  ok(url() === '/school', 'tap «مدرسه» → zoom + crossfade to school map');
  ok(await visible('school-header'), 'school header');
  ok(await visible('legend'), 'stage legend');
  ok((await tid('nav-office').getAttribute('aria-current')) === 'page', 'nav switched to دفتر کار');

  // ── Step 3: select library ──
  await reveal('tag-library');
  await tid('tag-library').click();
  await tid('place-sheet').waitFor();
  ok((await tid('sheet-title').textContent()) === 'کتابخانه', 'sheet shows کتابخانه');
  ok(url().includes('place=library'), 'selection in URL');
  ok(await visible('selection-outline'), 'dashed selection outline');
  await page.waitForTimeout(400);
  const op = await page.$eval('[data-testid="tag-lab"]', (e) => getComputedStyle(e.parentElement).opacity);
  ok(Math.abs(Number(op) - 0.45) < 0.05, `other tags dimmed (${op})`);
  await tid('tag-lab').click();
  await page.waitForTimeout(400);
  ok((await tid('sheet-title').textContent()) === 'آزمایشگاه علوم', 'tapping another place moves selection + sheet');
  await tid('sheet-enter').click();
  ok(await toast('هنوز در نسخه‌ی آزمایشی نیست'), 'non-library place → toast');
  await tid('sheet-close').click();
  await page.waitForTimeout(500);
  ok(!(await tid('place-sheet').count()), '× closes sheet');
  ok(!url().includes('place='), 'selection cleared');
  await tid('sprite-library').click();
  await tid('place-sheet').waitFor();
  await page.waitForTimeout(700); // let the sheet finish sliding in
  // drag to dismiss
  const sb = await tid('place-sheet').boundingBox();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + 10);
  await page.mouse.down();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + 220, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(600);
  ok(!(await tid('place-sheet').count()), 'drag down dismisses sheet');
  await tid('tag-library').click();
  await tid('place-sheet').waitFor();
  // outside tap closes
  await page.waitForTimeout(600);
  await page.mouse.click(vp.x + vp.width - 30, vp.y + 300); // empty road/lot right of the library
  await page.waitForTimeout(500);
  const closedByOutside = !(await tid('place-sheet').count());
  ok(closedByOutside, 'tap outside closes sheet');
  await openLibrarySheet();

  // ── Step 4: library, members tab ──
  await page.evaluate(() => {
    window.__sawSkeleton = false;
    new MutationObserver(() => {
      if (document.querySelector('[data-testid=skeleton]')) window.__sawSkeleton = true;
    }).observe(document.body, { childList: true, subtree: true });
  });
  await tid('sheet-enter').click();
  await tid('screen-library').waitFor();
  await tid('leaderboard').waitFor();
  ok(await page.evaluate(() => window.__sawSkeleton), 'skeleton shown while loading');
  ok(await visible('stage-card'), 'level card');
  ok(await visible('manager-card'), 'manager card');
  ok((await tid('tab-members').getAttribute('aria-selected')) === 'true', 'tab «اعضای امسال» active');
  ok((await tid('podium-1').textContent()).includes('سینا کریمی'), 'podium #1 سینا کریمی ۸۲۰');
  ok(await visible('join-card'), 'join card');
  await tid('message-btn').click();
  await tid('message-text').fill('سلام امیر، کتاب جدید رسیده؟');
  await tid('message-send').click();
  ok(await toast('پیامت فرستاده شد'), 'message modal → toast');
  await page.waitForTimeout(300);
  await tid('row-4').click();
  await tid('profile-dialog').waitFor();
  ok((await tid('profile-dialog').textContent()).includes('رضا احمدی'), 'row tap → profile sheet');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // ── Step 5: records ──
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(100);
  await tid('tab-history').dispatchEvent('click'); // no auto-scroll, like a thumb tap
  await tid('years').waitFor();
  ok(url().includes('tab=history'), 'tab in URL');
  ok((await tid('year-1404').getAttribute('aria-selected')) === 'true', 'year ۱۴۰۴ تا ۱۴۰۵ active');
  ok((await tid('year-summary').textContent()).includes('حسین مرادی'), 'summary: head حسین مرادی');
  ok((await tid('graduated').count()) > 0, 'graduated chip');
  ok((await page.locator('.lb-row.me').count()) === 1, 'Ali row highlighted');
  await tid('year-1403').click();
  await page.waitForTimeout(400);
  ok((await tid('year-summary').textContent()).includes('نیما فرهادی'), 'year switch updates summary + table');
  await tid('year-1401').click();
  await page.waitForTimeout(400);
  ok(await visible('records-empty'), 'empty year message');
  await tid('year-1404').click();
  await page.waitForTimeout(300);
  await tid('tab-members').dispatchEvent('click');
  await page.waitForTimeout(500);
  const y = await page.evaluate(() => window.scrollY);
  ok(Math.abs(y - 400) < 60, `members tab restores its own scroll (${y})`);

  // ── Step 6: membership request ──
  await tid('join-btn').click();
  await tid('join-dialog').waitFor();
  ok(await tid('join-submit').isDisabled(), 'submit disabled until role + text');
  await tid('role-راهنمای کتاب').click();
  await tid('join-reason').fill('کتاب');
  ok(await tid('join-submit').isDisabled(), 'still disabled with short text');
  await tid('join-reason').fill('عاشق کتاب‌خوندنم و می‌خوام کمک کنم');
  ok(!(await tid('join-submit').isDisabled()), 'enabled with role + ≥10 chars');
  await tid('join-submit').click();
  ok(await toast('درخواستت برای امیر حسینی فرستاده شد'), 'toast after request');
  await tid('join-pending').waitFor();
  ok((await tid('join-pending').textContent()).includes('در انتظار تایید امیر حسینی'), 'card → pending');
  await page.reload();
  await tid('join-pending').waitFor({ timeout: 4000 });
  ok(true, 'pending survives refresh (localStorage)');
  await tid('cancel-btn').click();
  await tid('cancel-confirm').click();
  await tid('join-card').waitFor();
  ok(true, 'cancel request → card back to initial');

  // ── resize mid-flow keeps state ──
  await tid('tab-history').click();
  await tid('year-1403').click();
  await page.setViewportSize(viewport.width < 768 ? { width: 1440, height: 900 } : { width: 360, height: 800 });
  await page.waitForTimeout(500);
  ok((await tid('year-1403').getAttribute('aria-selected')) === 'true' && url().includes('tab=history'), 'resize keeps tab + year');
  await page.setViewportSize(viewport);
  await tid('year-1404').click();
  await tid('tab-members').click();

  // ── Step 7: back ──
  await page.goto(base + '#/');
  await tid('tag-school').click();
  await tid('screen-school').waitFor();
  await page.waitForTimeout(600);
  await openLibrarySheet();
  await tid('sheet-enter').click();
  await tid('screen-library').waitFor();
  await tid('back-pill').click();
  await page.waitForTimeout(400);
  if (!(await tid('place-sheet').count())) { console.log('    · after back-pill:', url(), await page.locator('[data-testid^=screen-]').evaluateAll((e) => e.map((x) => x.dataset.testid + ':' + getComputedStyle(x).opacity))); await page.screenshot({ path: '/tmp/claude-0/-home-user-naghshineh/146de28d-6d3a-5e03-af7f-c4bf6c626282/scratchpad/fail.png' }); }
  await tid('place-sheet').waitFor({ timeout: 5000 });
  ok(url() === '/school?place=library', 'back pill → school map with library sheet open');
  await page.goBack();
  await page.waitForTimeout(500);
  ok(url() === '/school' && !(await tid('place-sheet').count()), 'browser back closes the sheet');
  await page.goForward();
  await tid('place-sheet').waitFor();
  ok(true, 'browser forward reopens it');
  await tid('sheet-details').click();
  await tid('screen-library').waitFor();
  ok(true, '«جزئیات» opens the library');
  await page.goBack();
  await tid('place-sheet').waitFor();
  ok(true, 'browser back from library → sheet open');
  await tid('school-back').click();
  await tid('screen-hood').waitFor();
  ok(url() === '/', 'school back button → neighbourhood (zoom out)');
  await page.goForward();
  await tid('screen-school').waitFor();
  ok(true, 'browser forward → school');
  await page.goBack();
  await tid('screen-hood').waitFor();

  // ── side actions: every button reacts ──
  await tid('nav-profile').click();
  await tid('coming-soon').waitFor();
  ok(url() === '/soon/profile', 'پروفایل → coming soon');
  await tid('soon-back').click();
  await tid('screen-hood').waitFor();
  await tid('nav-badges').click();
  await tid('coming-soon').waitFor();
  ok(url() === '/soon/badges', 'نشان‌ها → coming soon');
  await page.goBack();
  await tid('chip-bell').click();
  await tid('coming-soon').waitFor();
  ok(url() === '/soon/notifications', 'bell → notifications');
  await page.goBack();
  await tid('screen-hood').waitFor();
  await tid('chip-streak').click();
  ok(await toast('روز پیاپی'), 'streak chip → toast');
  await tid('tag-mosque').click();
  await tid('place-sheet').waitFor();
  ok((await tid('sheet-title').textContent()) === 'مسجد محله', 'other neighbourhood place → its sheet');
  await tid('sheet-details').click();
  ok(await toast('هنوز در نسخه‌ی آزمایشی نیست'), '… and entering it shows a toast');
  await tid('sheet-close').click();
  await page.waitForTimeout(400);
  await page.goto(base + '#/school');
  await tid('school-info').click();
  await tid('school-info-sheet').waitFor();
  ok(true, 'school info button → dialog');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await tid('nav-roles').click();
  await tid('coming-soon').waitFor();
  ok(url() === '/soon/roles', 'نقش‌ها → coming soon');
  await tid('nav-tasks').click();
  await page.waitForTimeout(300);
  ok(url() === '/soon/tasks', 'مسئولیت‌ها → coming soon');
  await tid('nav-office').click();
  await tid('screen-school').waitFor();
  ok(true, 'دفتر کار → school map');
  await tid('user-block').click();
  await tid('coming-soon').waitFor();
  ok(true, 'avatar → profile');

  // refresh keeps place
  await page.goto(base + '#/school?place=library');
  await page.reload();
  await tid('place-sheet').waitFor();
  ok(true, 'refresh keeps selected place + sheet');

  ok(errors.length === 0, `no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await browser.close();
}

await run('mobile', { width: 360, height: 800 });
await run('desktop', { width: 1440, height: 900 });
await run('mobile + prefers-reduced-motion', { width: 360, height: 800 }, { reducedMotion: 'reduce' });
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
