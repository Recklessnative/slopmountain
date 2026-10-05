/* ================= the pile (heightfield centred on Kim's desk) ================= */
const C = new THREE.Vector3(0, 0, -0.6);
let H = 0, R = 7;
function hAt(x, z) {
  if (H <= 0.001) return 0;
  const dx = x - C.x, dz = z - C.z, d = Math.hypot(dx, dz);
  if (d >= R) return 0;
  const u = 1 - d / R, a = Math.atan2(dz, dx);
  const wob = 1 + (.07 * Math.sin(a * 3 + 1) + .04 * Math.sin(a * 7)) * Math.min(1, (1 - u) * 3);
  return H * Math.pow(u, 1.5) * wob + Math.min(1, H / 10) * .5 * Math.sin(x * .6) * Math.sin(z * .5) * u * (1 - u) * 4;
}
const world = new THREE.Group(); scene.add(world);
const terrainGeo = new THREE.PlaneGeometry(120, 120, 110, 110); terrainGeo.rotateX(-Math.PI / 2);
const terrain = new THREE.Mesh(terrainGeo, lam({ map: TEX.terrain }));
terrain.position.copy(C); world.add(terrain);
function updateTerrain() {
  const p = terrainGeo.attributes.position;
  for (let i = 0; i < p.count; i++) { const h = hAt(p.getX(i) + C.x, p.getZ(i) + C.z); p.setY(i, h > 0.05 ? h - .3 : -1.6); }
  p.needsUpdate = true; terrainGeo.computeVertexNormals();
}
const CAP = 9000;
const papers = new THREE.InstancedMesh(PAPER_GEO, PAPER_MAT, CAP); papers.frustumCulled = false; papers.count = 0; world.add(papers);
const binders = new THREE.InstancedMesh(BINDER_GEO, BINDER_MAT, CAP); binders.frustumCulled = false; binders.count = 0; world.add(binders);
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
// r128 sizes instanceColor from .count, which is 0 here, so allocate it ourselves
[papers, binders].forEach(m => m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CAP * 3), 3));
{ const pc = [0xffffff, 0xf2ead2, 0xd9d4c8, 0xe8dcc0, 0xc8c2b4], bc = [0x3e4a5c, 0x6b2f2a, 0x4d5a3a, 0x2d2b29, 0x7a6a3a, 0x8a8478], col = new THREE.Color();
  for (let i = 0; i < CAP; i++) { papers.setColorAt(i, col.setHex(pc[i % pc.length])); binders.setColorAt(i, col.setHex(bc[(i * 7) % bc.length])); } }
const pd = { x: new Float32Array(CAP), z: new Float32Array(CAP), ry: new Float32Array(CAP), tx: new Float32Array(CAP), tz: new Float32Array(CAP), lift: new Float32Array(CAP) };
let paperCount = 0;
function seedPaper(i, x, z) { pd.x[i] = x; pd.z[i] = z; pd.ry[i] = Math.random() * 6.28; pd.tx[i] = (Math.random() - .5) * 1.1; pd.tz[i] = (Math.random() - .5) * 1.1; pd.lift[i] = .03 + Math.random() * .3; }
function randomSpot(rMax) { const r = rMax * Math.sqrt(Math.random()), a = Math.random() * 6.28; return [C.x + Math.cos(a) * r, C.z + Math.sin(a) * r]; }
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(0, 0, 0, 'YXZ'), _v = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);
function setPaper(i) {
  if (i % 6 === 0) _e.set(pd.tx[i] * .5, pd.ry[i], pd.tz[i] * .5, 'YXZ'); else _e.set(-Math.PI / 2 + pd.tx[i], pd.ry[i], pd.tz[i], 'YXZ'); _q.setFromEuler(_e);
  _v.set(pd.x[i], hAt(pd.x[i], pd.z[i]) + pd.lift[i], pd.z[i]); _m.compose(_v, _q, _s);
  if (i % 6 === 0) { binders.setMatrixAt(i, _m); papers.setMatrixAt(i, ZERO); } else { papers.setMatrixAt(i, _m); binders.setMatrixAt(i, ZERO); }
}
function updatePapers() { for (let i = 0; i < paperCount; i++) setPaper(i); papers.count = binders.count = paperCount; papers.instanceMatrix.needsUpdate = binders.instanceMatrix.needsUpdate = true; }
function addPaper(x, z) { const i = paperCount < CAP ? paperCount++ : Math.floor(Math.random() * CAP); seedPaper(i, x, z); setPaper(i); papers.count = binders.count = paperCount; papers.instanceMatrix.needsUpdate = binders.instanceMatrix.needsUpdate = true; }
function removePaper() { if (!paperCount) return; const i = Math.floor(Math.random() * paperCount), j = paperCount - 1; for (const k in pd) pd[k][i] = pd[k][j]; paperCount--; }

const flyers = new THREE.InstancedMesh(PAPER_GEO, PAPER_MAT, 600); flyers.frustumCulled = false; flyers.count = 0; scene.add(flyers);
flyers.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(600 * 3), 3);
{ const c = new THREE.Color(); for (let i = 0; i < 600; i++) flyers.setColorAt(i, c.setHex(i % 3 ? 0xffffff : 0xe8dcc0)); }
const flying = [];
function launchSheet(mode = 'land', from) {
  if (flying.length >= 600) return;
  const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw);
  const s = from ? from.clone() : new THREE.Vector3(player.x + fx * 2.4, player.y - .7, player.z + fz * 2.4);
  const [tx, tz] = randomSpot(Math.max(2.5, R * .95));
  flying.push({ s, tx, tz, t: 0, dur: (mode === 'land' ? .9 : 2.2) + Math.random() * .8, spin: (Math.random() - .5) * 12, arc: 1.5 + Math.random() * (R > 10 ? 10 : 2.5), mode,
    ang: Math.random() * 6.28, rad: 3 + Math.random() * 8, hh: Math.random() * 6 - 2, sp: .6 + Math.random() * 1.4,
    vx: (Math.random() - .5) * 6, vz: (Math.random() - .5) * 6 });
}
