/* ================= act 4: actual conversations ================= */
let Hpeak = 1, Ppeak = 1;
function startTalks() {
  soundtrack('hope');
  phase = 'talk'; Hpeak = H; Ppeak = paperCount; learners.visible = false; frozen = false;
  $('#tGen').textContent = 'Talk';
  say([isTouch ? 'Someone was waiting a little further down. Walk over and tap Talk.' : 'Someone was waiting a little further down. Walk over and press E to talk.'], () => {});
  spawnTalker();
}
function spawnTalker() {
  if (talker) { removeTalker(); }
  const T = TALKS[S.talkIdx];
  const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw);
  let x = player.x + fx * 7, z = player.z + fz * 7;
  const d = Math.hypot(x - C.x, z - C.z); if (d > R - 2 && R > 6) { x = C.x + (x - C.x) / d * (R - 2); z = C.z + (z - C.z) / d * (R - 2); }
  talker = person({ ...STYLES[S.talkIdx % STYLES.length], who: T.who }); talker.position.set(x, 0, z); world.add(talker);
  addTag(talker, T.who, 2.05, 'name');
  const mark = new THREE.Group(); mark.position.y = 2.6; talker.add(mark);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 30, 6, 1, true), new THREE.MeshBasicMaterial({ color: 0xd8a24a, transparent: true, opacity: .35, depthWrite: false, fog: false })); beam.position.y = 15; mark.add(beam);
  talker.userData.mark = mark;
}
function removeTalker() {
  if (!talker) return; const t = talker; removeTags(x => x.obj === t); const k = people.indexOf(t); if (k >= 0) people.splice(k, 1); t.parent && t.parent.remove(t); talker = null;
}
function nearTalker() { return talker && Math.hypot(player.x - talker.position.x, player.z - talker.position.z) < 2.8; }
function talk() {
  if (phase !== 'talk' || !nearTalker() || frozen || shrinkAnim) return;
  const T = TALKS[S.talkIdx]; frozen = true; S.wrong = 0;
  say([them(T.who, T.ask)], () => askChoice(T));
}
function askChoice(T) {
  choose([
    { label: T.q, fn: () => { frozen = true; say([kim(T.q), them(T.who, T.a), kim(T.k), them(T.who, T.r)], () => shrink(T)); } },
    { label: 'Sure, I’ll generate one.', fn: () => {
      frozen = true; S.wrong++; H += 1.5; for (let i = 0; i < 120; i++) { const [x, z] = randomSpot(R); addPaper(x, z); } for (let i = 0; i < 10; i++) launchSheet('land');
      updateTerrain(); updatePapers(); updateDash(coursesShown + 6); noise(.4, 2400, .08);
      say([S.wrong > 1 ? 'The narrator will wait.' : 'Old habits. The mountain grew a little.', them(T.who, T.ask)], () => askChoice(T));
    } }
  ]);
}
let shrinkAnim = null;
function shrink(T) {
  const steps = TALKS.length, k = S.talkIdx + 1, last = k === steps;
  const fromH = H, toH = last ? 0 : Hpeak * (1 - k / steps), fromP = paperCount, toP = last ? 0 : Math.round(Ppeak * Math.pow(1 - k / steps, 1.3));
  const fromC = coursesShown, toC = last ? 1 : Math.max(2, Math.round(fromC * (1 - 1 / (steps - S.talkIdx))));
  if (talker) talker.userData.mark.visible = false;
  noise(1.8, 900, .1); blip(660, .5, .04);
  shrinkAnim = { t: 0, dur: 3, fromH, toH, fromP, toP, fromC, toC, done: () => {
    S.talkIdx++;
    if (last) return finale();
    say([T.after], () => {}); spawnTalker(); frozen = false;
  } };
  frozen = false;
}
function finale() {
  frozen = true; H = 0; paperCount = 0; updateTerrain(); updatePapers();
  removeTalker(); $('#tGen').hidden = true;
  officeFloor.visible = true; deskG.visible = true; deskG.scale.set(1, 1, 1); screenOld.visible = false; screenNew.visible = true;
  S.toDesk = true;
  for (let i = 0; i < 90; i++) { const a = Math.random() * 6.28, r = 2 + Math.random() * 14; launchSheet('away', new THREE.Vector3(C.x + Math.cos(a) * r, .2, C.z + Math.sin(a) * r)); }
  say([
    'And this time, Kim made something.',
    'The mountain was gone. In its place stood one small desk, and one small thing worth making.',
    { t: 'For the first time all week, the fog lifted.', fx: () => { S.dawn = .0001; noise(2.5, 300, .05); } },
    { t: 'And Kim could finally see them. The people it had all been for.', fx: spawnCrowd },
    'Every one of them had the same twelve minutes a week. Nobody could make more. Kim could only decide what deserved them.',
    { t: 'That had always been the job. Not making courses. Guarding attention.', fx: sendSparks }
  ], () => { S.lineDone = true; maybeCrown(); });
}
/* the people at the foot of the mountain, finally visible */
const crowd = new THREE.Group(); world.add(crowd);
const RECLAIMED = ['Used it on Monday', 'Twelve minutes, well spent', 'Practised it twice', 'Finally, the right one', 'Asked a real question', 'Went home on time', 'Remembered it a month later', 'Didn’t need a course at all'];
function spawnCrowd() {
  for (let i = 0; i < 30; i++) {
    const a = i / 30 * 6.28 + Math.random() * .15, r = 5.5 + (i % 3) * 2.6 + Math.random() * 1.2;
    const p = person({ ...STYLES[i % STYLES.length], phone: i % 7 === 3 }); p.position.set(C.x + Math.sin(a) * r, 0, C.z - Math.cos(a) * r); p.scale.setScalar(.01);
    p.userData.popT = -i * .07; crowd.add(p);
    if (i % 4 === 0) addTag(p, RECLAIMED[(i / 4) % RECLAIMED.length], 2.15);
  }
  soundtrack('hope');
}
/* each person sends Kim a small light: their attention */
const sparks = [];
function sendSparks() {
  bulb.visible = true; bulbLight.intensity = 0; S.sparksLeft = crowd.children.length;
  crowd.children.forEach((p, i) => {
    const sp = halo(world, 0xffd98a, .5, .5, 0, 0, 0, .9); sp.material.fog = false;
    const from = p.position.clone(); from.y += 2;
    sparks.push({ sp, from, mid: new THREE.Vector3((from.x + C.x) / 2, 5 + Math.random() * 2, (from.z + C.z) / 2), t: -.4 - i * .11 });
  });
}
const _bq = new THREE.Vector3();
function updateFinale(dt) {
  for (const p of crowd.children) { const u = p.userData; if (u.popT < 1) { u.popT += dt * 1.6; const k = Math.max(0, Math.min(1, u.popT)); p.scale.setScalar(Math.max(.01, k * k * (3 - 2 * k))); } }
  for (let i = sparks.length - 1; i >= 0; i--) {
    const q = sparks[i]; q.t += dt / 2.4; if (q.t < 0) { q.sp.visible = false; continue; } q.sp.visible = true;
    const t = Math.min(1, q.t), u = 1 - t; _bq.set(C.x, 2.5, C.z);
    q.sp.position.set(u * u * q.from.x + 2 * u * t * q.mid.x + t * t * _bq.x, u * u * q.from.y + 2 * u * t * q.mid.y + t * t * _bq.y, u * u * q.from.z + 2 * u * t * q.mid.z + t * t * _bq.z);
    if (t >= 1) {
      world.remove(q.sp); sparks.splice(i, 1); S.sparksLeft--; bulbLight.intensity = Math.min(3, bulbLight.intensity + .1);
      blip([523, 587, 659, 784, 880, 1047][S.sparksLeft % 6] * (S.sparksLeft < 6 ? 2 : 1), .5, .025);
      if (!S.sparksLeft) { S.sparksDone = true; maybeCrown(); }
    }
  }
}
function maybeCrown() {
  if (!S.lineDone || !S.sparksDone || S.crowned) return; S.crowned = true;
  bulbLight.intensity = 3.2; blip(990, .9, .06); setTimeout(() => blip(1320, 1.1, .05), 200); setTimeout(() => blip(1980, 1.4, .04), 420);
  S.crane = .0001; $('#dash').hidden = true;
  setTimeout(() => { $('#big').textContent = 'Guardian of attention.'; $('#big').classList.add('on'); }, 1800);
  setTimeout(() => ending('better'), 7500);
}
