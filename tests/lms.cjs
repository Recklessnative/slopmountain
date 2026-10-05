// Headless run through the LMS otherworld: the three real questions, asking a Completion, the exit,
// and both new endings (Mandatory, The Completion). Screenshots land in tests/out/. Exits non-zero on any page error.
const { chromium } = require('playwright');
const fs = require('fs'), http = require('http'), path = require('path');
(async () => {
  const dist = path.join(__dirname, '..', 'dist'), out = path.join(__dirname, 'out'); fs.mkdirSync(out, { recursive: true });
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.mp3': 'audio/mpeg' };
  const srv = http.createServer((q, r) => { const f = path.join(dist, decodeURIComponent(q.url.split('?')[0]).replace(/\.\./g, '')); const g = f.endsWith('/') ? f + 'index.html' : f; fs.readFile(g, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(g)] || 'application/octet-stream' }); r.end(d); }); }).listen(0);
  const url = `http://localhost:${srv.address().port}/`, shot = n => path.join(out, `lms-${n}.png`);
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1100, height: 700 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const skip = async n => { for (let i = 0; i < n; i++) { await p.keyboard.press(' '); await p.waitForTimeout(250); } };
  const quiet = () => p.waitForFunction(() => !__slop.talking, null, { timeout: 30000 }).catch(() => {});
  const st = () => p.evaluate(() => ({ ph: __slop.phase, att: Math.round(__slop.L.att), qs: __slop.L.qs.slice(), comps: __slop.L.comps.map(c => c.state), freed: __slop.L.freed.length, end: !document.querySelector('#ending').hidden, title: document.querySelector('#eTitle').textContent }));
  // stand on a tile next to something and face it
  const goTo = (x, z, yaw = 0) => p.evaluate(([x, z, yaw]) => { Object.assign(__slop.player, { x, z, yaw, pitch: -.25 }); }, [x, z, yaw]);
  await p.goto(url); await p.waitForTimeout(3000);
  await p.click('#begin'); await p.waitForTimeout(800);
  // jump straight to the end of act 3: thirty generated courses, then the shift
  await p.evaluate(() => { __slop.S.generated = 30; __slop.phase = 'tool'; __slop.otherworld(); });
  await p.waitForTimeout(1500); await p.screenshot({ path: shot('shift') }); await skip(3);
  await p.waitForFunction(() => __slop.phase === 'lms', null, { timeout: 30000 }); await p.waitForTimeout(1500);
  await p.screenshot({ path: shot('start') }); await skip(4);
  console.log('enter', JSON.stringify(await st()));
  // keep Kim alive while the test walks around
  await p.evaluate(() => { __slop.L.popT = 999; });
  const notes = await p.evaluate(() => __slop.L.notes.map(n => ({ i: n.i, x: n.x, z: n.z })));
  for (const n of notes.sort((a, b) => a.i - b.i)) {
    await goTo(n.x, n.z + 1.1, 0); await p.waitForTimeout(400); await quiet();
    await p.screenshot({ path: shot(`note${n.i}`) });
    await p.keyboard.press('e'); await p.waitForTimeout(600); await skip(3); await quiet();
    if (n.i === 2) { // the note sits inside the mandatory room: leave before the video ends
      await skip(4); await quiet(); await p.screenshot({ path: shot('mandatory-room') });
      await goTo(n.x + 2, n.z + 6, 0); await p.waitForTimeout(500); await skip(2); await quiet();
    }
    console.log('note', n.i, JSON.stringify(await st()));
  }
  // ask the nearest Completion a real question
  console.log('before ask', JSON.stringify(await p.evaluate(() => ({ frozen: __slop.frozen, busy: __slop.L.busy, catching: __slop.L.catching, talking: __slop.talking }))));
  // put a Completion in the middle of Kim's start room, two metres ahead of her
  await p.evaluate(() => { const c = __slop.L.comps[0], st = __slop.L.path[2], x = __slop.tileC(st[0], __slop.LMS_O.x), z = __slop.tileC(st[1], __slop.LMS_O.z); Object.assign(c, { x, z, state: 'sated', sated: 99, path: null, direct: null }); Object.assign(__slop.player, { x, z: z + 2, yaw: 0, pitch: -.05 }); });
  await p.waitForTimeout(500); await p.screenshot({ path: shot('completion') });
  await p.keyboard.press('e'); await p.waitForTimeout(1200); await skip(1); await p.waitForTimeout(1500); await p.screenshot({ path: shot('freed') }); await skip(3); await quiet();
  console.log('asked', JSON.stringify(await st()));
  // a Completion that sees Kim plays her the video
  await p.evaluate(() => { const c = __slop.L.comps[1]; c.state = 'wander'; c.yaw = 0; Object.assign(__slop.player, { x: c.x, z: c.z + 1.5, yaw: 0 }); __slop.L.grace = 0; });
  await p.waitForFunction(() => __slop.L.catching > 0, null, { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(600); await p.screenshot({ path: shot('caught') });
  console.log('caught', JSON.stringify(await st()), await p.evaluate(() => !document.querySelector('#mvid').hidden));
  await p.waitForFunction(() => !__slop.L.catching, null, { timeout: 60000 }).catch(() => {}); await skip(2); await quiet();
  // low attention look
  await p.evaluate(() => { __slop.L.att = 18; }); await p.waitForTimeout(800); await p.screenshot({ path: shot('low') }); await skip(2);
  await p.evaluate(() => { __slop.L.att = 100; });
  // the exit
  await p.evaluate(() => { const d = __slop.L.xDoor; Object.assign(__slop.player, { x: d.x, z: d.z + 2.5, yaw: 0, pitch: 0 }); __slop.L.comps.forEach(c => { c.state = 'sated'; c.sated = 99; }); });
  await p.waitForTimeout(800); await p.screenshot({ path: shot('exit') });
  await p.keyboard.down('w'); await p.waitForFunction(() => __slop.phase !== 'lms', null, { timeout: 60000 }).catch(() => {}); await p.keyboard.up('w');
  await skip(4); await p.waitForFunction(() => __slop.phase === 'super', null, { timeout: 90000 }).catch(() => {});
  await p.waitForTimeout(2000); await p.screenshot({ path: shot('super') });
  console.log('after exit', JSON.stringify(await st()));
  // ending: The Completion
  await p.evaluate(() => __slop.enterLMS(true)); await p.waitForTimeout(1500); await skip(1);
  await p.evaluate(() => { __slop.L.att = 0; }); await p.waitForTimeout(800); await skip(3);
  await p.waitForFunction(() => !document.querySelector('#ending').hidden, null, { timeout: 90000 }).catch(() => {});
  await p.waitForTimeout(600); await p.screenshot({ path: shot('end-completion') }); console.log('ending', JSON.stringify(await st()));
  // ending: Mandatory, via the retry button
  await p.click('#retry'); await p.waitForTimeout(1600); await skip(1);
  await p.evaluate(() => { const d = __slop.L.mDoor; __slop.L.comps.forEach(c => { c.state = 'sated'; c.sated = 999; }); Object.assign(__slop.player, { x: d.x, z: d.z - 4, yaw: 0, pitch: 0 }); });
  for (let i = 0; i < 16; i++) { await skip(2); await p.waitForTimeout(500); }
  await p.evaluate(() => { __slop.L.mandT = 33; }); await skip(2); await p.waitForTimeout(800); await p.screenshot({ path: shot('mandatory-video') }); await skip(3);
  await p.waitForFunction(() => !document.querySelector('#ending').hidden, null, { timeout: 90000 }).catch(() => {});
  await p.waitForTimeout(600); await p.screenshot({ path: shot('end-mandatory') }); console.log('ending', JSON.stringify(await st()));
  console.log(errs.join('\n') || 'no errors'); await b.close(); srv.close(); if (errs.length) process.exitCode = 1;
})();
