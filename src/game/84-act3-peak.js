/* ================= act 3: peak slop ================= */
function peak() {
  soundtrack('peak');
  phase = 'peak'; S.auto = false; frozen = true; S.toPeak = true;
  for (let i = paperCount - 1; i >= 0; i--) if (Math.hypot(pd.x[i] - C.x, pd.z[i] - C.z) < 4.5) { const j = paperCount - 1; for (const k in pd) pd[k][i] = pd[k][j]; paperCount--; }
  updatePapers();
  for (let i = 0; i < 200; i++) launchSheet('storm');
  noise(2.5, 600, .25); droneTo(.1, 160);
  $('#big').textContent = '“Oh God. Everything is crappy.”'; $('#big').classList.add('on');
  setTimeout(() => $('#big').classList.remove('on'), 3600);
  setTimeout(() => {
    flying.forEach(f => { if (f.mode === 'storm') { f.mode = 'land'; f.s.set(camera.position.x + Math.cos(f.ang) * f.rad, camera.position.y + f.hh, camera.position.z + Math.sin(f.ang) * f.rad); f.t = 0; f.dur = 2.5 + Math.random() * 2; } });
    droneTo(.03, 44); frozen = false;
    S.inbox.length = 0; renderInbox(); inboxEl.hidden = true;
    say([
      'Peak Slop.',
      'Five hundred and sixty-six courses. Nine hundred and six hours of content.'
    ], () => {
      showLearners(); $('#dTimeRow').hidden = false;
      say([
        'And down at the bottom, the people it was all for.',
        'They had about twelve minutes a week to learn anything. They spent most of it looking for the one course that mattered.',
        'Nobody had time to watch it. Nobody had time to even find it.'
      ], ringPhone);
    });
  }, 3800);
}
function showLearners() {
  buildLearners(); learners.visible = true;
  learners.children.forEach((f, i) => { f.scale.setScalar(.001); setTimeout(() => { f.userData.pop = true; blip(420 + i * 55, .18, .035); }, 300 + i * 420); });
}
function ringPhone() {
  S.ringing = true; phone.visible = true; $('#call').hidden = false; $('#callHint').textContent = isTouch ? 'tap Answer' : 'press E to answer';
  const r = () => { blip(440, .3, .06); setTimeout(() => blip(480, .3, .06), 380); noise(1.4, 1700, .05); };
  r(); S.ringIv = setInterval(r, 2000);
  say(['And then, from somewhere under all those courses, Kim’s phone rang.']);
  S.ringNag = setTimeout(() => { if (S.ringing) say(['The phone kept ringing. It was the only thing on the mountain that wanted something real.']); }, 14000);
}
function answerPhone() {
  if (!S.ringing) return;
  S.ringing = false; clearInterval(S.ringIv); clearTimeout(S.ringNag); phone.visible = false; $('#call').hidden = true; blip(880, .12, .05);
  const sam = t => ({ t, who: 'Sam, night shift' });
  say([
    sam('Hi, is this L&D? I’m Sam. I run the night shift at the warehouse.'),
    kim('Hi Sam. How can I help?'),
    sam('I’ve been assigned forty-seven courses. I’m not complaining. I just have one question nobody has answered.'),
    kim('Go on.'),
    sam('My new starters keep stacking pallets wrong on their first night. Is there a course for that? Because I couldn’t find it.'),
    kim('Could I come and watch a shift?'),
    sam('You’d do that? Nobody from head office has ever just asked.'),
    'Kim hung up and looked at the mountain. Not one of those courses would have helped Sam. One phone call had.'
  ], unlockTool);
}
function unlockTool() {
  $('#unlock').hidden = false; blip(660, .25, .05); setTimeout(() => blip(990, .5, .05), 160); setTimeout(() => blip(1320, .7, .04), 320);
  say(['Kim had stumbled on a new tool. It had no logo and no subscription. It checks whether something should be made, before anyone makes it.'], () => {
    $('#unlock').hidden = true; fork();
  });
}
/* the choice is a place, not a menu: someone waiting further down, a hole into the mountain, and the laptop */
let hole = null, peakLaptop = null, Rpeak = 7;
const forkFx = new THREE.Group(); world.add(forkFx);
function fork(back) {
  phase = 'fork'; frozen = true; S.reachedFork = true; S.forkT = 0; S.forkLive = false; S.forkWarned = false; S.turnTo = null;
  Hpeak = H; Ppeak = paperCount; Rpeak = R; S.peakCourses = coursesShown;
  S.talkSkip = []; S.shrunk = 0; S.talkIdx = 0; S.unresolved = 0; S.grown = 0;
  const yaw = player.yaw, px = player.x, pz = player.z, at = (a, d) => [px - Math.sin(yaw + a) * d, pz - Math.cos(yaw + a) * d];
  spawnTalker();
  // the hole: a dark gap in the paper, with the Learning Pathway glowing down into it and the chime coming up
  const [hx, hz] = at(1.1, 2.8); hole = { x: hx, z: hz };
  const pit = new THREE.Mesh(new THREE.CircleGeometry(1.15, 18), new THREE.MeshBasicMaterial({ color: 0x050302 })); pit.rotation.x = -Math.PI / 2; pit.position.set(hx, hAt(hx, hz) + .25, hz); forkFx.add(pit);
  halo(forkFx, 0x3fc8b0, 3.2, 3.2, hx, hAt(hx, hz) + .5, hz, .4);
  for (let i = 0; i < 8; i++) {
    const x0 = px + (hx - px) * i / 8, z0 = pz + (hz - pz) * i / 8, x1 = px + (hx - px) * (i + 1) / 8, z1 = pz + (hz - pz) * (i + 1) / 8, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    const seg = new THREE.Mesh(new THREE.PlaneGeometry(.22, Math.hypot(x1 - x0, z1 - z0) + .05), L.pathMat); seg.rotation.set(-Math.PI / 2, 0, Math.atan2(x1 - x0, z1 - z0)); seg.position.set(mx, hAt(mx, mz) + .3, mz); forkFx.add(seg);
  }
  // the laptop, still open, still sparkling
  const [lx, lz] = at(-1.2, 2.4); peakLaptop = { x: lx, z: lz };
  const lap = new THREE.Group(); lap.position.set(lx, hAt(lx, lz) + .3, lz); lap.rotation.y = Math.atan2(px - lx, pz - lz); forkFx.add(lap);
  box(.5, .03, .36, 0, 0, 0, lap, lam({ color: 0x2a2a30 }));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(.48, .32), new THREE.MeshBasicMaterial({ map: screenTex('✦ CourseGen ✦ Generate more? ✦', '#d8b8ff') })); scr.position.set(0, .17, -.17); scr.rotation.x = -.25; lap.add(scr);
  halo(lap, 0xd8b8ff, 1.4, 1.4, 0, .25, 0, .45);
  // name them, so the choice reads at a glance through the fog
  for (const [x, z, t] of [[hx, hz, 'A hole in the mountain'], [lx, lz, 'CourseGen, still open']]) { const o = new THREE.Object3D(); o.position.set(x, hAt(x, z), z); forkFx.add(o); addTag(o, t, 1.4); }
  const lines = back ? ['Kim was back on the summit. The narrator remembers this part. The narrator has been here before.']
    : ['There were two ways off a mountain like this.', 'Kim could walk down it, one person at a time. Or she could find out what it was made of.', 'The laptop was still open, too. It always is.'];
  say(lines, () => { frozen = false; S.forkLive = true; S.turnTo = Math.atan2(-(hx - player.x), -(hz - player.z)); S.turnPitch = Math.atan2(hAt(hx, hz) + .4 - player.y, Math.hypot(hx - player.x, hz - player.z)) * .8; lock(); });
}
function nearHole() { return hole && Math.hypot(player.x - hole.x, player.z - hole.z) < 2; }
function nearLaptop() { return peakLaptop && Math.hypot(player.x - peakLaptop.x, player.z - peakLaptop.z) < 1.8; }
function clearFork() { removeTags(t => forkFx.children.includes(t.obj)); while (forkFx.children.length) forkFx.remove(forkFx.children[0]); hole = null; peakLaptop = null; S.forkLive = false; S.turnTo = null; }
function forkAction() {
  if (frozen || !S.forkLive) return;
  if (nearTalker()) { clearFork(); learners.visible = false; soundtrack('hope'); phase = 'talk'; $('#tGen').textContent = 'Ask'; return talk(); }
  if (nearHole()) return intoHole();
  if (nearLaptop()) { clearFork(); removeTalker(); forever(['Kim opened the laptop. Just to check something.']); }
}
function intoHole() {
  clearFork(); removeTalker(); learners.visible = false; frozen = true; S.viaLMS = true;
  say([
    'Kim walked down the mountain, towards the person who was waiting—',
    'No. Kim climbed into the mountain. To see how deep it went.',
    'The narrator has read the brochure. There is no bottom.'
  ], () => {
    chimeSwell(4); $('#fade').classList.add('on');
    setTimeout(() => { enterLMS(); $('#fade').classList.remove('on'); }, 1400);
  });
}
// the idle timer starts once the narrator stops: a warning at 30 seconds, the laptop decides at 45
function updateFork(dt, moving) {
  if (phase !== 'fork' || !S.forkLive) return;
  if (S.turnTo != null) { let d = S.turnTo - player.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); player.yaw += d * Math.min(1, dt * 2.5); player.pitch += (S.turnPitch - player.pitch) * Math.min(1, dt * 2.5); if (Math.abs(d) < .02) S.turnTo = null; }
  if (frozen || talking) return;
  S.forkT = moving ? 0 : S.forkT + dt;
  if (S.forkT > 30 && !S.forkWarned) { S.forkWarned = true; say(['The laptop was still open. It would decide for her, if she let it.']); }
  if (S.forkT > 45) { clearFork(); removeTalker(); forever(['Kim didn’t choose. The laptop took that as a yes.']); }
}
/* every ending after the peak can come back here, so nobody misses the other road */
function returnToSummit() {
  $('#ending').hidden = true; S.ended = false; Object.assign(S, { dawn: 0, crane: 0, toDesk: false, lineDone: false, sparksDone: false, crowned: false, viaLMS: false });
  for (const q of sparks) world.remove(q.sp); sparks.length = 0;
  while (crowd.children.length) { const c = crowd.children[0]; removeTags(x => x.obj === c); const k = people.indexOf(c); if (k >= 0) people.splice(k, 1); crowd.remove(c); }
  bulb.visible = false; bulbLight.intensity = 0; deskG.visible = false; officeFloor.visible = false; $('#big').classList.remove('on');
  clearWalkers(); removeTalker(); clearFork(); resetLMS(); lms.visible = false; world.visible = true;
  hemi.intensity = .62; sun.intensity = .32; sun.color.setHex(0xd8d4c8); applyLook(); radioOff(); flash.distance = 30; $('#fade').style.background = ''; subs.style.filter = '';
  H = Hpeak; R = Rpeak; paperCount = 0; for (let i = 0; i < Ppeak; i++) { const [x, z] = randomSpot(R); addPaper(x, z); } updateTerrain(); updatePapers(); updateDash(S.peakCourses);
  Object.assign(player, { x: C.x, z: C.z + .4, yaw: 0, pitch: -.3, y: H + 1.7 }); learners.visible = true;
  $('#dash').hidden = false; $('#cross').hidden = isTouch; soundtrack('peak');
  fork(true);
}
function forever(pre) {
  soundtrack('super');
  phase = 'forever'; frozen = true; learners.visible = false;
  say([...(pre || []), 'Of course. Just a few more.']);
  let n = 0; const iv = setInterval(() => { S.generated += 3; H = Math.min(70, H + 1.6); R = Math.min(58, R + .6); for (let i = 0; i < 12; i++) launchSheet('storm'); for (let i = 0; i < 80; i++) { const [x, z] = randomSpot(R); addPaper(x, z); } updateTerrain(); updatePapers(); updateDash(); noise(.3, 2400, .08);
    if (++n > 16) { clearInterval(iv); setTimeout(() => ending('more'), 900); } }, 330);
}
