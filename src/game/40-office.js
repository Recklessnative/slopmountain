/* ================= office ================= */
const officeFloor = new THREE.Group(), officeWalls = new THREE.Group(), deskG = new THREE.Group();
world.add(officeFloor, officeWalls, deskG);
let screenOld, screenNew, tool, toolLabel, bulb, bulbRays, bulbLight, flicker, dust, wisps = [];
function buildOffice() {
  const HT = 3.1, cz = -1.5;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20, 20, 20), MAT.floor); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -.02, cz); officeFloor.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(20, 20, 16, 16), MAT.ceil); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, HT, cz); officeWalls.add(ceil);
  // back wall in three pieces around the front door (x -0.7 .. 0.7)
  [[-5.35, 9.3], [5.35, 9.3]].forEach(([x, w]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, HT, 9, 4), MAT.wall); m.position.set(x, HT / 2, 8.5); m.rotation.y = Math.PI; officeWalls.add(m); });
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, HT - 2.2), MAT.wall); m.position.set(0, 2.2 + (HT - 2.2) / 2, 8.5); m.rotation.y = Math.PI; officeWalls.add(m); }
  [[0, -11.5, 0], [-10, cz, Math.PI / 2], [10, cz, -Math.PI / 2]].forEach(([x, z, r]) => { const w = new THREE.Mesh(new THREE.PlaneGeometry(20, HT, 20, 4), MAT.wall); w.position.set(x, HT / 2, z); w.rotation.y = r; officeWalls.add(w); });
  // fluorescent tubes and their (slightly unreliable) light
  [[-5, -7], [5, -7], [-5, -1], [5, -1], [-5, 5], [5, 5], [0, -4], [0, 2]].forEach(([x, z]) => box(1.3, .05, .32, x, HT - .03, z, officeWalls, MAT.tube));
  TUBES.forEach(([x, z]) => { cone(officeWalls, 0xdfe8d4, .5, 1.9, HT - .05, x, HT - .06, z, .045); halo(officeWalls, 0xe8f0dc, 2.4, .9, x, HT - .12, z, .32); });
  dust = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xd6ccb2, size: 1.5, sizeAttenuation: false, transparent: true, opacity: .4, depthWrite: false }));
  { const n = 260, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - .5) * 19; a[i * 3 + 1] = .3 + Math.random() * 2.7; a[i * 3 + 2] = -11 + Math.random() * 19; } dust.geometry.setAttribute('position', new THREE.BufferAttribute(a, 3)); dust.userData.base = a.slice(); officeWalls.add(dust); }
  [[0, -1, .95], [-6, -7, .7], [6, 4, .7]].forEach(([x, z, i], k) => { const l = new THREE.PointLight(0xdfe8d4, i, 13, 1.6); l.position.set(x, HT - .4, z); officeWalls.add(l); if (k === 1) flicker = l; });
  // posters, a window full of fog, a door
  const poster = (t, sub, x, z, r, w) => { const m = label(t + (sub ? ' ' + sub : ''), .55, { font: 'IM Fell English', size: 60, maxW: w || 700, bg: '#1e2833', color: '#d9d2bf', lit: true, pad: 26 }); m.position.set(x, 1.9, z); m.rotation.y = r; officeWalls.add(m); };
  poster('LEARNING IS OUR #1 PRIORITY', '', 0, -11.47, 0, 900);
  poster('Completion rate: 100%', '', 9.97, -3, -Math.PI / 2);
  poster('Content is king', '', -9.97, -6, Math.PI / 2);
  box(2.6, 1.6, .08, -9.98, 1.75, 2, officeWalls, MAT.metalPlain);
  const fogWin = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.4), new THREE.MeshBasicMaterial({ color: 0x9a978f })); fogWin.position.set(-9.93, 1.75, 2); fogWin.rotation.y = Math.PI / 2; officeWalls.add(fogWin);
  for (let i = 0; i < 9; i++) box(.02, .05, 2.4, -9.9, 1.15 + i * .15, 2, officeWalls, MAT.beige);
  box(1.05, 2.15, .08, 6, 1.075, -11.45, officeWalls, MAT.door);
  // cubicles, filing cabinets, a dead plant, a water cooler
  [[-6, -5], [6, -5], [-6, 2], [6, 2]].forEach(([x, z]) => {
    box(3.2, 1.4, .08, x, .7, z - 1.2, officeWalls, MAT.fabric); box(.08, 1.4, 2.4, x + (x < 0 ? 1.6 : -1.6), .7, z, officeWalls, MAT.fabric);
    box(1.8, .05, .8, x, .74, z - .6, officeWalls, MAT.wood); box(.42, .36, .38, x, .95, z - .75, officeWalls, MAT.beige);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(.32, .24), new THREE.MeshBasicMaterial({ color: 0x1d2b26 })); scr.position.set(x, .97, z - .55); officeWalls.add(scr);
    box(.5, .5, .5, x + .2, .3, z + .2, officeWalls, MAT.black);
    blob(officeWalls, 2.4, 1.3, x, z - .6); blob(officeWalls, .8, .8, x + .2, z + .2);
  });
  [[-6, -5, 3], [6, 2, 0]].forEach(([x, z, k]) => { const c = person(STYLES[k]); c.position.set(x - .45, 0, z + .05); c.rotation.y = Math.PI; Object.assign(c.userData, { fixed: true, ground: false }); officeWalls.add(c); });
  [[-9.5, -9], [-9.5, -8.4], [9.5, 6]].forEach(([x, z]) => { box(.6, 1.3, .55, x, .65, z, officeWalls, MAT.metal); blob(officeWalls, .9, .85, x + .05, z); });
  blob(officeWalls, .6, .6, 8.8, -10.6); blob(officeWalls, .55, .55, -8.8, 6.5);
  box(.36, .4, .36, 8.8, .2, -10.6, officeWalls, lam({ color: 0x5a3a28 }));
  for (let i = 0; i < 5; i++) { const st = box(.03, .7 + Math.random() * .4, .03, 8.8 + (Math.random() - .5) * .2, .7, -10.6 + (Math.random() - .5) * .2, officeWalls, lam({ color: 0x4a3f2a })); st.rotation.set((Math.random() - .5) * .6, 0, (Math.random() - .5) * .6); }
  box(.34, .9, .34, -8.8, .45, 6.5, officeWalls, lam({ color: 0xc8c4b8 })); const jug = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, .42, 8), lam({ color: 0x8aa8b8, transparent: true, opacity: .75 })); jug.position.set(-8.8, 1.12, 6.5); officeWalls.add(jug);
  // Kim's desk, at the centre of everything that follows
  deskG.position.copy(C);
  box(2.4, .06, 1.1, 0, .74, 0, deskG, MAT.wood); blob(deskG, 3, 1.7, 0, 0);
  [[-1.12, -.5], [1.12, -.5], [-1.12, .5], [1.12, .5]].forEach(([x, z]) => box(.05, .72, .05, x, .36, z, deskG, MAT.metalPlain));
  box(.45, .6, 1, .9, .42, 0, deskG, MAT.wood);
  box(.5, .42, .44, 0, .98, -.22, deskG, MAT.beige); box(.36, .3, .26, 0, .98, -.52, deskG, MAT.beige); box(.24, .04, .2, 0, .79, -.22, deskG, MAT.beige);
  screenOld = new THREE.Mesh(new THREE.PlaneGeometry(.4, .3), new THREE.MeshBasicMaterial({ map: screenTex('C:\\COURSES> new_course.exe  chapter 1 of 9 ...  _') }));
  screenOld.position.set(0, .99, .005); deskG.add(screenOld);
  screenNew = new THREE.Mesh(new THREE.PlaneGeometry(.4, .3), new THREE.MeshBasicMaterial({ map: screenTex('What should people do differently on Monday?', '#e8d9a0') }));
  screenNew.position.copy(screenOld.position); screenNew.visible = false; deskG.add(screenNew);
  box(.46, .03, .17, 0, .785, .22, deskG, MAT.keys);
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(.045, .04, .1, 8), lam({ color: 0x8a3a2a })); mug.position.set(.55, .82, .15); deskG.add(mug);
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(PAPER_GEO, PAPER_MAT); m.scale.setScalar(.4); m.rotation.set(-Math.PI / 2, 0, (Math.random() - .5) * .4); m.position.set(-.75, .78 + i * .012, 0); deskG.add(m); }
  // the magic tool: a glowing install disc in a jewel case
  tool = new THREE.Group(); tool.position.set(.6, .95, -.1); deskG.add(tool);
  const disc = new THREE.Mesh(new THREE.BoxGeometry(.16, .16, .015), new THREE.MeshBasicMaterial({ map: cnv(32, 32, (x, w, h) => { const g = x.createRadialGradient(16, 16, 2, 16, 16, 16); g.addColorStop(0, '#fff3c0'); g.addColorStop(1, '#c08a2a'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = '#3a2a10'; x.font = 'bold 6px monospace'; x.fillText('CourseGen', 2, 28); }) }));
  tool.add(disc); const tl = new THREE.PointLight(0xffc860, .8, 3, 2); tool.add(tl); toolLabel = disc;
  tool.visible = false;
  // a single bare bulb for the very end
  bulb = new THREE.Group(); bulb.position.set(0, 2.5, 0); bulb.visible = false; deskG.add(bulb);
  box(.01, 1.2, .01, 0, .6, 0, bulb, MAT.black);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe6a8 })); bulb.add(glass);
  bulbLight = new THREE.PointLight(0xffd9a0, 0, 10, 1.4); bulb.add(bulbLight); bulbRays = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.CircleGeometry(400, 48), lam({ map: TEX.ground }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(C.x, -.7, C.z); world.add(ground);
}
