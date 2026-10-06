/* ---- the street outside, for the cold open ---- */
const street = new THREE.Group(); street.visible = false; scene.add(street);
let frontDoor, streetLamps = [];
const PARK_X = -3.2, DRIVE_FROM = -150, EXIT = { x: -2.9, z: 16.05 };
function buildStreet() {
  const facadeTex = cnv(64, 64, (x, w, h) => {
    x.fillStyle = '#6f6a60'; x.fillRect(0, 0, w, h); speckle(x, w, h, 24);
    x.fillStyle = '#1c1f22'; x.fillRect(10, 14, 18, 22); x.fillRect(38, 14, 18, 22);
    x.fillStyle = 'rgba(160,170,160,.25)'; x.fillRect(11, 15, 7, 20); x.fillRect(39, 15, 7, 20);
    x.fillStyle = '#4a463e'; x.fillRect(8, 36, 22, 3); x.fillRect(36, 36, 22, 3);
    for (let i = 0; i < 4; i++) { const sx = Math.random() * w, g = x.createLinearGradient(0, 38, 0, 64); g.addColorStop(0, 'rgba(40,30,20,.5)'); g.addColorStop(1, 'rgba(40,30,20,0)'); x.fillStyle = g; x.fillRect(sx, 38, 3, 26); }
  }, 6, 3);
  const plainFacade = cnv(32, 32, (x, w, h) => { x.fillStyle = '#625d54'; x.fillRect(0, 0, w, h); speckle(x, w, h, 22); blotches(x, w, h, 6, '#3a3128', .3, 5); }, 6, 3);
  const fac = lam({ map: facadeTex }), side = lam({ map: plainFacade }), FH = 9;
  // front facade, facing the street, with a gap for the door
  [[-5.35, 9.3], [5.35, 9.3]].forEach(([x, w]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, FH, 6, 6), fac); m.position.set(x, FH / 2, 8.56); street.add(m); });
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, FH - 2.2), side); m.position.set(0, 2.2 + (FH - 2.2) / 2, 8.56); street.add(m); }
  [-10.06, 10.06].forEach(x => { const m = new THREE.Mesh(new THREE.PlaneGeometry(20, FH, 10, 6), side); m.position.set(x, FH / 2, -1.5); m.rotation.y = x < 0 ? -Math.PI / 2 : Math.PI / 2; street.add(m); });
  box(1.7, .12, .5, 0, 2.3, 8.75, street, MAT.black); box(.12, 2.3, .14, -.76, 1.15, 8.6, street, MAT.black); box(.12, 2.3, .14, .76, 1.15, 8.6, street, MAT.black);
  const sign = label('Building C  ·  Learning & Development', .34, { font: 'IM Fell English', size: 50, maxW: 1100, bg: '#20262b', color: '#cfc8b4', lit: true, pad: 18 }); sign.position.set(0, 2.75, 8.6); street.add(sign);
  const lampOver = new THREE.PointLight(0xffd9a0, .9, 7, 1.6); lampOver.position.set(0, 2.6, 9.4); street.add(lampOver);
  box(.25, .1, .25, 0, 2.5, 8.75, street, new THREE.MeshBasicMaterial({ color: 0xffe2a8 })); halo(street, 0xffd9a0, 1.6, 1.6, 0, 2.45, 8.9, .55); cone(street, 0xffd9a0, .15, 1.6, 2.5, 0, 2.48, 9.1, .05);
  // pavement, kerb, road, far pavement
  const pave = cnv(32, 32, (x, w, h) => { x.fillStyle = '#77736a'; x.fillRect(0, 0, w, h); speckle(x, w, h, 20); x.fillStyle = 'rgba(30,28,24,.6)'; x.fillRect(0, 0, w, 1); x.fillRect(0, 0, 1, h); }, 40, 4);
  const road = cnv(64, 64, (x, w, h) => { x.fillStyle = '#34322f'; x.fillRect(0, 0, w, h); speckle(x, w, h, 26); blotches(x, w, h, 12, '#1d1c1a', .4, 8); }, 30, 3);
  const plane = (w, d, x, y, z, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d, 20, 4), mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); street.add(m); return m; };
  pave.repeat.set(160, 4); road.repeat.set(120, 3);
  plane(320, 6, -120, -.005, 11.5, lam({ map: pave })); box(320, .14, .2, -120, .02, 14.5, street, MAT.beige);
  plane(320, 9, -120, -.12, 19, lam({ map: road }));
  const dash = lam({ color: 0xbdb8a4 }); for (let x = -276; x <= 36; x += 4.5) box(1.8, .01, .14, x, -.11, 19, street, dash);
  plane(320, 6, -120, -.005, 26.5, lam({ map: pave })); box(320, .14, .2, -120, .02, 23.5, street, MAT.beige);
  // the rest of the business park, mostly fog
  const headM = new THREE.MeshBasicMaterial({ color: 0xffd38a }), bark = lam({ color: 0x2a2520 });
  for (let x = -250; x < -12; x += 24) {
    box(.12, 4.4, .12, x, 2.2, 14.2, street, MAT.metalPlain); box(.4, .12, .26, x + .45, 4.28, 14.2, street, headM);
    box(.12, 4.4, .12, x + 12, 2.2, 23.8, street, MAT.metalPlain); box(.4, .12, .26, x + 11.55, 4.28, 23.8, street, headM);
  }
  let rnd = 7; const R01 = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;
  for (let x = -262; x < -14;) {
    const w = 12 + R01() * 14, h = 5 + R01() * 10; const b = box(w, h, 12, x + w / 2, h / 2, 1, street, side); b.material = R01() < .5 ? fac : side; x += w + 4 + R01() * 10;
  }
  for (let x = -270; x < 40;) {
    const w = 10 + R01() * 16, h = 4 + R01() * 9; box(w, h, 12, x + w / 2, h / 2, 37, street, R01() < .5 ? fac : side); x += w + 6 + R01() * 12;
  }
  for (let x = -255; x < 30; x += 9 + R01() * 10) [12.6, 25.4].forEach(z => {
    if (Math.abs(x) < 12 && z < 20) return;
    const tr = new THREE.Group(); tr.position.set(x + R01() * 3, 0, z); street.add(tr);
    box(.18, 3.6, .18, 0, 1.8, 0, tr, bark);
    for (let k = 0; k < 4; k++) { const br = box(.07, 1.3, .07, 0, 2.4 + k * .35, 0, tr, bark); br.rotation.set((R01() - .5) * 1.6, R01() * 6, (R01() - .5) * 1.6); }
  });
  // drifting fog, Silent Hill's best trick
  const wispTex = cnv(64, 32, (x, w, h) => { for (let i = 0; i < 14; i++) { const cx = 10 + Math.random() * 44, cy = 10 + Math.random() * 12, r = 6 + Math.random() * 10, g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); } });
  for (let i = 0; i < 46; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(14 + Math.random() * 10, 4 + Math.random() * 3), new THREE.MeshBasicMaterial({ map: wispTex, color: 0xb9b5aa, transparent: true, opacity: .16 + Math.random() * .14, depthWrite: false }));
    m.position.set(-165 + Math.random() * 185, .8 + Math.random() * 2.6, 10.5 + Math.random() * 22); m.userData.v = .25 + Math.random() * .5; street.add(m); wisps.push(m);
  }
  // street lamps
  [[-7, 14.2], [7, 14.2], [-14, 23.8]].forEach(([x, z]) => {
    box(.12, 4.4, .12, x, 2.2, z, street, MAT.metalPlain); box(.9, .08, .12, x + .4, 4.35, z, street, MAT.metalPlain);
    box(.4, .12, .26, x + .85, 4.28, z, street, new THREE.MeshBasicMaterial({ color: 0xffd38a }));
    const l = new THREE.PointLight(0xffc878, .8, 11, 1.4); l.position.set(x + .85, 4, z); street.add(l); streetLamps.push(l);
    halo(street, 0xffc878, 2.6, 2.6, x + .85, 4.2, z, .5); cone(street, 0xffc878, .2, 2.4, 4.2, x + .85, 4.2, z, .045);
  });
  // Kim's car, still warm, radio still on
  const car = new THREE.Group(); car.position.set(PARK_X, -.12, 17.6); street.add(car); car.userData.noBake = true; blob(car, 5, 2.5, 0, 0, .02);
  const paint = lam({ color: 0x4d5a5e }), glassM = lam({ color: 0x1c2224 });
  box(4.2, .7, 1.75, 0, .55, 0, car, paint); box(2.3, .66, 1.6, -.2, 1.2, 0, car, glassM); box(2.2, .06, 1.62, -.2, 1.55, 0, car, paint);
  [[-1.35, .82], [1.35, .82], [-1.35, -.82], [1.35, -.82]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(.33, .33, .22, 10), MAT.black); w.rotation.x = Math.PI / 2; w.position.set(x, .33, z); car.add(w); });
  [-.55, .55].forEach(z => { box(.06, .14, .32, 2.11, .66, z, car, new THREE.MeshBasicMaterial({ color: 0xfff1c8 })); halo(car, 0xfff1c8, 1.2, .8, 2.25, .66, z, .6); });
  [-.6, .6].forEach(z => box(.04, .12, .28, -2.11, .66, z, car, new THREE.MeshBasicMaterial({ color: 0x8a1c14 })));
  // inside: dashboard, wheel, radio, pillars, mirror, wipers, seats
  const plastic = lam({ map: cnv(32, 32, (x, w, h) => { x.fillStyle = '#34312d'; x.fillRect(0, 0, w, h); speckle(x, w, h, 14); }) }), dark = lam({ color: 0x2a2724 }), trim = lam({ color: 0x4a453f });
  box(.62, .42, 1.62, .76, .77, 0, car, plastic); box(.2, .12, .4, .55, 1.02, -.38, car, plastic); box(1.8, .02, 1.6, -.45, .915, 0, car, dark);
  [-.72, .22, .5].forEach(z => box(.01, .05, .12, .447, .93, z, car, MAT.black));
  const headliner = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 1.58), new THREE.MeshBasicMaterial({ color: 0x2e2b27, fog: false })); headliner.rotation.x = Math.PI / 2; headliner.position.set(-.2, 1.49, 0); car.add(headliner);
  const gauges = new THREE.Mesh(new THREE.PlaneGeometry(.26, .09), new THREE.MeshBasicMaterial({ map: cnv(32, 12, (x, w, h) => { x.fillStyle = '#120e08'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e0a040'; x.beginPath(); x.arc(8, 8, 5, Math.PI, 0); x.stroke(); x.beginPath(); x.arc(24, 8, 5, Math.PI, 0); x.stroke(); x.fillStyle = '#e0a040'; x.fillRect(7, 5, 1, 3); x.fillRect(25, 4, 1, 4); }) }));
  gauges.position.set(.447, 1.02, -.38); gauges.rotation.y = -Math.PI / 2; car.add(gauges);
  const radioFace = new THREE.Mesh(new THREE.PlaneGeometry(.2, .06), new THREE.MeshBasicMaterial({ map: cnv(48, 14, (x, w, h) => { x.fillStyle = '#0e1a0c'; x.fillRect(0, 0, w, h); x.fillStyle = '#8fd08a'; x.font = 'bold 9px monospace'; x.fillText('FM 94.3', 4, 10); }) }));
  radioFace.position.set(.447, .87, .02); radioFace.rotation.y = -Math.PI / 2; car.add(radioFace);
  const wheelG = new THREE.Group(); wheelG.position.set(.42, .93, -.38); wheelG.rotation.z = -.5; car.add(wheelG);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(.155, .02, 6, 16), trim); wheel.rotation.y = Math.PI / 2; wheelG.add(wheel);
  box(.04, .04, .3, 0, 0, 0, wheelG, trim); box(.2, .05, .05, .1, -.03, 0, wheelG, trim);
  [-.79, .79].forEach(z => { const pl = box(.045, .8, .045, .68, 1.22, z, car, trim); pl.rotation.z = .7; });
  box(.05, .04, 1.6, .42, 1.465, 0, car, trim); box(.02, .06, .02, .44, 1.47, -.08, car, dark); box(.025, .065, .22, .45, 1.42, -.08, car, dark);
  const mirror = new THREE.Mesh(new THREE.PlaneGeometry(.2, .05), new THREE.MeshBasicMaterial({ color: 0x77736b })); mirror.position.set(.436, 1.42, -.08); mirror.rotation.y = -Math.PI / 2 + .25; car.add(mirror);
  box(.5, .55, .5, -.45, .62, -.38, car, trim); box(.12, .6, .5, -.68, 1.0, -.38, car, trim);
  box(.5, .55, .5, -.45, .62, .38, car, trim); box(.12, .6, .5, -.68, 1.0, .38, car, trim);
  const wipers = [];
  // the driver's door, hinged at the front, on the building side
  const door = new THREE.Group(); door.position.set(.4, 0, -.9); car.add(door); box(1.1, .62, .05, -.55, .58, 0, door, paint);
  car.userData.door = door; car.userData.wipers = wipers;
  const beam = new THREE.SpotLight(0xfff1c8, 1.1, 18, .5, .6, 1.2); beam.position.set(2.2, .7, 0); car.add(beam); const bt = new THREE.Object3D(); bt.position.set(8, 0, 0); car.add(bt); beam.target = bt;
  const radioGlow = new THREE.PointLight(0x8fd08a, .35, 2.2, 2); radioGlow.position.set(.4, 1, 0); car.add(radioGlow); car.userData.radio = radioGlow;
  street.userData.car = car;
  // vertex snapping wrecks geometry this close to the eye, so the car keeps its own unsnapped materials
  const own = new Map(); car.traverse(o => { if (!o.material || Array.isArray(o.material)) return; let m = own.get(o.material); if (!m) { m = o.material.clone(); m.userData.ps1 = true; own.set(o.material, m); } o.material = m; });
  // bins, a bench, a bollard or two
  box(1.6, 1.2, .9, 7.2, .6, 9.3, street, lam({ color: 0x3d4a3a })); box(1.7, .08, 1, 7.2, 1.24, 9.3, street, MAT.black);
  box(1.6, .08, .4, -6, .45, 13, street, MAT.wood); box(.08, .45, .4, -6.7, .22, 13, street, MAT.metalPlain); box(.08, .45, .4, -5.3, .22, 13, street, MAT.metalPlain);
  [-2.2, 2.2].forEach(x => box(.18, .8, .18, x, .4, 13.6, street, MAT.metalPlain));
  // the front door, hinged on the left
  frontDoor = new THREE.Group(); frontDoor.position.set(-.68, 0, 8.53); officeFloor.add(frontDoor);
  box(1.36, 2.18, .05, .68, 1.09, 0, frontDoor, MAT.door);
}
let peakSign, learners = new THREE.Group(), talker = null;
const phone = new THREE.Group(); phone.visible = false; scene.add(phone);
function buildPhone() {
  const face = new THREE.MeshBasicMaterial({ map: cnv(32, 64, (x, w, h) => { x.fillStyle = '#2a2b2a'; x.fillRect(0, 0, w, h); x.fillStyle = '#8fb86a'; x.fillRect(4, 6, 24, 16); x.fillStyle = '#26381a'; x.font = 'bold 7px monospace'; x.fillText('SAM', 6, 14); x.fillText('CALL', 6, 20); x.fillStyle = '#4a4b48'; for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) x.fillRect(5 + c * 8, 28 + r * 8, 6, 5); }) });
  const dark = lam({ color: 0x232423 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(.13, .28, .045), [dark, dark, dark, dark, face, dark]); body.rotation.z = .18; phone.add(body);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(.008, .01, .1, 6), dark); ant.position.set(.04, .18, 0); body.add(ant);
}
world.add(learners);
const LEARNER_SCALE = 3;
function buildLearners() {
  removeTags(t => learners.children.includes(t.obj));
  learners.children.slice().forEach(c => { const k = people.indexOf(c); if (k >= 0) people.splice(k, 1); });
  learners.clear();
  LEARNERS.forEach((t, i) => {
    const a = i / LEARNERS.length * Math.PI * 2 + .3, r = R * .72;
    const f = person({ ...STYLES[i % STYLES.length], phone: true }); f.position.set(C.x + Math.sin(a) * r, 0, C.z + Math.cos(a) * r); f.scale.setScalar(LEARNER_SCALE); learners.add(f);
    addTag(f, t, 2.15);
  });
}
/* names and quotes float above people as HTML, so they stay readable at PS1 resolution */
const tags = [];
function addTag(obj, text, y, cls = '') { const d = document.createElement('div'); d.className = 'tag ' + cls; d.textContent = text; d.style.display = 'none'; $('#tags').appendChild(d); const t = { obj, d, y }; tags.push(t); return t; }
function removeTags(fn) { for (let i = tags.length - 1; i >= 0; i--) if (fn(tags[i])) { tags[i].d.remove(); tags.splice(i, 1); } }
function shown(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
function updateTags() {
  for (const t of tags) {
    if (!shown(t.obj) || S.ended || phase === 'screen' || (t.los && !lmsLOS(camera.position.x, camera.position.z, t.obj.position.x, t.obj.position.z))) { t.d.style.display = 'none'; continue; }
    _v.set(0, t.y, 0); t.obj.localToWorld(_v); const dist = _v.distanceTo(camera.position); _v.project(camera);
    if (_v.z > 1 || _v.z < -1 || dist > 120) { t.d.style.display = 'none'; continue; }
    t.d.style.display = 'block'; t.d.style.opacity = Math.max(.25, Math.min(1, 1.4 - dist / 90)).toFixed(2);
    t.d.style.transform = `translate(${((_v.x * .5 + .5) * innerWidth).toFixed(1)}px, ${((-_v.y * .5 + .5) * innerHeight).toFixed(1)}px) translate(-50%, -100%)`;
  }
}
let speakingWho = null;
const _yawTmp = new THREE.Vector3();
function updatePeople(dt) {
  const now = performance.now() / 1000;
  for (const p of people) {
    if (!p.parent) continue; const u = p.userData, t = now + u.phase;
    if (u.ground) p.position.y = hAt(p.position.x, p.position.z);
    if (!u.fixed) {
    p.getWorldPosition(_yawTmp);
    let want = Math.atan2(camera.position.x - _yawTmp.x, camera.position.z - _yawTmp.z), d = want - p.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
    p.rotation.y += d * Math.min(1, dt * (u.phone ? .3 : 2.2));
    }
    u.torso.scale.y = 1 + Math.sin(t * 1.7) * .012;
    const talkNow = u.who && speakingWho === u.who;
    if (!u.phone) {
      u.armL.rotation.x = Math.sin(t * .9) * .05 + (talkNow ? -.35 - Math.sin(t * 5) * .2 : 0);
      u.armR.rotation.x = Math.sin(t * .9 + 1) * .05 + (talkNow ? -.15 - Math.sin(t * 4 + 1) * .25 : 0);
      u.armL.userData.el.rotation.x = -.12 - Math.sin(t * .7) * .04 + (talkNow ? -.7 - Math.sin(t * 5 + .6) * .3 : 0);
      u.armR.userData.el.rotation.x = -.12 - Math.sin(t * .7 + 2) * .04 + (talkNow ? -.4 - Math.sin(t * 4 + 1.6) * .35 : 0);
      p.rotation.z = Math.sin(t * .37) * .012;
      u.head.rotation.y = Math.sin(t * .45) * .18; u.head.rotation.x = talkNow ? Math.sin(t * 8) * .05 : Math.sin(t * .3) * .04;
    } else u.head.rotation.y = Math.sin(t * .2) * .08;
    const f = u.face; f.t -= dt; if (f.t < 0 && f.mat.map !== f.shut) f.mat.map = f.shut; if (f.t < -.13) { f.mat.map = f.open; f.t = 1.5 + Math.random() * 4.5; }
  }
}
