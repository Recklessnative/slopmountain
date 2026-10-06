/* ================= the LMS otherworld ================= */
// Every course Kim publishes has to live somewhere. Thirty courses in, the notification chime swells like
// Silent Hill's siren and the LMS shows itself for two seconds. At the peak Kim can climb into it: identical
// module rooms in rust and wet paper, walked by the Completions. Kim can't fight them. She can hide, keep hold
// of her attention, and ask them a real question, which turns them back into people. A sticky note is a
// question she keeps (a real question works again and again); three people freed open the exit, which comes
// out at the foot of the mountain. Attention is shown as the same twelve minutes the learners have.
const LT = 2, ROOM = 5, LCELL = ROOM + 1, LW = 4 * LCELL + 1, WALL_H = 3.2;
const LMS_O = new THREE.Vector3(260, 0, -40);
const lms = new THREE.Group(); lms.visible = false; scene.add(lms);
const hemi = scene.children.find(o => o.isHemisphereLight);

/* the level, as data: a 4 x 4 grid of module rooms, [row, col], row 0 is north */
const LMS_ROOMS = [
  { at: [3, 1], name: 'Module 30 · Your Learning', doors: 'new', start: true, items: [['kimdesk', 1, 2, 0], ['poster', 's', -2.6, 'LEARNING IS OUR #1 PRIORITY']] },
  { at: [3, 0], name: 'Module 7 · Compliance Refresher Refresher', doors: 'en', items: [['desk', 1, 1], ['desk', 3, 3], ['screen', 'w', 0], ['chairs', 3]] },
  { at: [3, 2], name: 'Module 12 · The Mindset of Growth Mindsets', doors: 'we', items: [['chairs', 1], ['chairs', 3], ['screen', 'n', 0], ['desk', 1, 4], ['comp', 2, 2]] },
  { at: [3, 3], name: 'Module 4 · The Expense Tool, Every Screen', doors: 'wn', items: [['desk', 3, 3], ['desk', 1, 1], ['screen', 'e', 1.5], ['screen', 's', -2], ['poster', 'w', 2, 'Completion rate: 100%', 'red']] },
  { at: [2, 0], name: 'Module 19 · Microlearning, Part 1 of 40', doors: 'sne', items: [['chairs', 3], ['screen', 'w', -1.5], ['desk', 1, 0], ['comp', 2, 1]] },
  { at: [2, 1], name: 'Module 2 · Welcome to the Welcome', doors: 'snwe', items: [['screen', 'w', 2.4], ['screen', 'e', -2.4], ['desk', 0, 4], ['desk', 4, 0]] },
  { at: [2, 2], name: 'Module 23 · Engagement', doors: 'wn', items: [['desk', 1, 1], ['desk', 3, 1], ['desk', 1, 3], ['desk', 3, 3], ['poster', 'e', 0, 'Content is king', 'red']] },
  { at: [2, 3], name: 'Module 15 · The Podcast Version', doors: 'sn', items: [['screen', 'w', -2], ['screen', 'w', 2], ['screen', 'e', 0], ['chairs', 2], ['comp', 1, 3]] },
  { at: [1, 0], name: 'Module 8 · Onboarding, 40 of 40', doors: 'se', items: [['desk', 1, 1, 1], ['desk', 3, 1], ['desk', 1, 3], ['screen', 'n', 0], ['comp', 3, 3]] },
  { at: [1, 1], name: 'Module 1 · Start Here', doors: 'snwe', items: [['poster', 'n', 3.2, 'Completion rate: 100%', 'red'], ['desk', 0, 0], ['desk', 4, 4]] },
  { at: [1, 2], name: 'Module 27 · Certificate of Completion', doors: 'we', items: [['chairs', 1], ['chairs', 3], ['screen', 'n', 0], ['comp', 2, 2], ['desk', 4, 4]] },
  { at: [1, 3], name: 'Module 31 · Exit Survey', doors: 'swn', items: [['desk', 1, 3], ['desk', 3, 3], ['screen', 'e', 1]] },
  { at: [0, 1], name: 'MANDATORY TRAINING', doors: 's', mandatory: true, items: [['chairs', 2], ['chairs', 3], ['desk', 0, 1, 2]] },
  { at: [0, 3], name: '', doors: 's', exit: true, items: [] }
];
const QUESTIONS = ['What goes wrong today?', 'Which ones do new hires actually use?', 'Mandatory by law, or by habit?'];
// the first three belong to the stakeholders Kim would otherwise have to talk round: Finance, HR, Legal
const FREED = [
  { who: 'Jan, accounts payable', t: 'Oh. Hello. I only ever needed to know which form to use.' },
  { who: 'Tom, new starter', t: 'Is it Monday? I’ve been onboarding since March.' },
  { who: 'Noor, compliance', t: 'Thank you. I’d forgotten I was allowed to ask that.' },
  { who: 'Ana, night shift', t: 'I did all forty-seven modules. Nobody asked me a single thing until now.' },
  { who: 'Marco, sales', t: 'Wait, you’re from L&D? And you asked what I need?' },
  { who: 'Fleur, team lead', t: 'I clicked Complete so many times I forgot what it was for.' }
];
// what a freed person tells Kim next, depending on which note is still out there
const DIRECTIONS = {
  0: 'There’s a yellow note on your own desk. Back where you started.',
  1: 'There’s another yellow note in Onboarding. North-west. Nobody comes back from onboarding.',
  2: 'The last note is in Mandatory Training, where the pathway ends. Don’t stay for the video.',
  pocket: 'There are more of us in here. Ask them too.'
};
// attention runs on the learners' clock: 100 points are twelve minutes, so one displayed second is 100 / 720
const SEC = 100 / 720;
const LMS_POPS = ['You have 3 overdue modules.', 'Reminder: Module 4 is still in progress.', 'New! 12 courses recommended for you.', 'Your certificate is ready. And another one.', 'Don’t forget: learning is your #1 priority.', 'Rate this experience: ★★★★★', 'You were assigned Module 31. And 32.', 'Your streak is at risk!'];

/* tiles: 0 solid, 1 floor, 2 mandatory door, 3 exit door */
const lgrid = new Uint8Array(LW * LW);
const tileX = x => Math.floor((x - LMS_O.x) / LT), tileZ = z => Math.floor((z - LMS_O.z) / LT);
const tileC = (i, o) => o + (i + .5) * LT;
const roomCentre = (r, c) => [LMS_O.x + (c * LCELL + 1 + ROOM / 2) * LT, LMS_O.z + (r * LCELL + 1 + ROOM / 2) * LT];
const roomAt = (tx, tz) => (tx % LCELL && tz % LCELL) ? LMS_ROOMS.find(R => R.at[0] === Math.floor(tz / LCELL) && R.at[1] === Math.floor(tx / LCELL)) : null;
function lwalk(tx, tz) {
  if (tx < 0 || tz < 0 || tx >= LW || tz >= LW) return false;
  const v = lgrid[tz * LW + tx];
  return v === 1 || (v === 2 && !L.mShut) || (v === 3 && L.exitOpen);
}
function lsolidSight(tx, tz) { if (tx < 0 || tz < 0 || tx >= LW || tz >= LW) return true; const v = lgrid[tz * LW + tx]; return v === 0 || (v === 2 && L.mShut) || (v === 3 && !L.exitOpen); }
function lmsLOS(x0, z0, x1, z1) {
  const d = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(d / .4);
  for (let i = 1; i < n; i++) { const t = i / n; if (lsolidSight(tileX(x0 + (x1 - x0) * t), tileZ(z0 + (z1 - z0) * t))) return false; }
  return true;
}
// breadth-first search over the tile grid; Completions don't need anything cleverer
const _bfsPrev = new Int16Array(LW * LW), _bfsDist = new Int16Array(LW * LW), _bfsQ = new Int16Array(LW * LW);
function bfs(sx, sz) {
  _bfsDist.fill(-1); let h = 0, t = 0; const s = sz * LW + sx; _bfsDist[s] = 0; _bfsPrev[s] = -1; _bfsQ[t++] = s;
  while (h < t) {
    const i = _bfsQ[h++], x = i % LW, z = (i / LW) | 0;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, nz = z + dz, j = nz * LW + nx; if (lwalk(nx, nz) && _bfsDist[j] < 0) { _bfsDist[j] = _bfsDist[i] + 1; _bfsPrev[j] = i; _bfsQ[t++] = j; } }
  }
}
function pathTo(sx, sz, gx, gz) {
  if (!lwalk(gx, gz)) return null; bfs(sx, sz); let j = gz * LW + gx; if (_bfsDist[j] < 0) return null;
  const out = []; while (j >= 0 && j !== sz * LW + sx) { out.push([j % LW, (j / LW) | 0]); j = _bfsPrev[j]; } return out.reverse();
}

/* textures: rust, a metal grate floor, wet paper skin for the Completions */
function lmsTextures() {
  TEX.rust = cnv(64, 128, (x, w, h) => {
    x.fillStyle = '#4b2d1f'; x.fillRect(0, 0, w, h); blotches(x, w, h, 70, '#2a160e', .45, 7); blotches(x, w, h, 40, '#7a3e1e', .35, 5);
    for (let i = 0; i < 9; i++) { const sx = Math.random() * w, len = 30 + Math.random() * 90, g = x.createLinearGradient(0, 0, 0, len); g.addColorStop(0, 'rgba(20,8,4,.7)'); g.addColorStop(1, 'rgba(20,8,4,0)'); x.fillStyle = g; x.fillRect(sx, Math.random() * 30, 2 + Math.random() * 4, len); }
    x.fillStyle = 'rgba(12,6,4,.55)'; x.fillRect(0, 104, w, 24); for (let i = 0; i < w; i += 16) { x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(i, 0, 1, h); }
    speckle(x, w, h, 26);
  }, 1, 1);
  TEX.grate = cnv(64, 64, (x, w, h) => {
    x.fillStyle = '#1d1714'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 8) for (let j = 0; j < h; j += 8) { x.fillStyle = '#3c302a'; x.fillRect(i, j, 7, 7); x.fillStyle = '#0a0706'; x.fillRect(i + 2, j + 2, 3, 3); }
    blotches(x, w, h, 25, '#5a2c16', .4, 7); speckle(x, w, h, 22);
  }, 26, 26);
  TEX.paperSkin = cnv(32, 32, (x, w, h) => { x.fillStyle = '#d9d2c0'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(70,64,55,.35)'; for (let i = 0; i < 8; i++) x.fillRect(3, 3 + i * 3.6, 14 + Math.random() * 12, 1); blotches(x, w, h, 5, '#7a6a48', .3, 4); speckle(x, w, h, 16); });
  TEX.paperFace = cnv(32, 32, (x, w, h) => {
    x.fillStyle = '#e2dccb'; x.fillRect(0, 0, w, h); blotches(x, w, h, 3, '#8a7a58', .2, 4);
    x.strokeStyle = 'rgba(60,40,30,.75)'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(9, 17); x.lineTo(14, 22); x.lineTo(24, 9); x.stroke(); speckle(x, w, h, 12);
  });
}
/* the video every screen in the LMS is playing, all at once */
const VID_SLIDES = [['Module 4.2', 'Did you know?'], ['KEY TAKEAWAY', 'Learning is important.'], ['✓', 'Complete'], ['Quiz', 'Answer: C'], ['Module 4.3', 'Recap of the recap'], ['Well done!', 'You watched this.']];
let vidTex = null, mandTex = null;
function drawVid(x, w, h, k) {
  const [a, b] = VID_SLIDES[k % VID_SLIDES.length];
  x.fillStyle = k % 2 ? '#1c3a4a' : '#3a1c2a'; x.fillRect(0, 0, w, h); x.fillStyle = '#f0e8d0'; x.textAlign = 'center';
  x.font = 'bold 14px "JetBrains Mono", monospace'; x.fillText(a, w / 2, h * .42); x.font = '10px "JetBrains Mono", monospace'; x.fillText(b, w / 2, h * .62);
  x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(0, h - 8, w, 8); x.fillStyle = '#c25a3c'; x.fillRect(0, h - 7, w * ((k * .17) % 1), 6);
  for (let i = 0; i < h; i += 2) { x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, i, w, 1); }
}
function drawMand(x, w, h, t) {
  x.fillStyle = '#101418'; x.fillRect(0, 0, w, h); x.textAlign = 'center'; x.fillStyle = '#e8e2d0';
  if (L.mandSolved) {
    x.font = 'bold 13px "JetBrains Mono", monospace'; x.fillText('INFORMATION SECURITY', w / 2, 34);
    x.font = '10px "JetBrains Mono", monospace'; x.fillText('1. Lock your screen.  2. Report odd emails.', w / 2, 62); x.fillText('Sign here: ________   ✓ signed', w / 2, 86);
    x.fillStyle = '#7ac08a'; x.fillText('One page. Done.', w / 2, 118); return;
  }
  if (L.heist > 0) {
    // the countdown: the same video, restarted, running to its end
    const k = 1 - L.heist / 20; x.font = 'bold 13px "JetBrains Mono", monospace'; x.fillText('MANDATORY · RESTARTED', w / 2, 30);
    x.font = '10px "JetBrains Mono", monospace'; x.fillText('Watch to the end to unlock the door', w / 2, 52);
    x.fillStyle = '#2a2e34'; x.fillRect(20, 100, w - 40, 8); x.fillStyle = '#c25a3c'; x.fillRect(20, 100, (w - 40) * k, 8);
    x.fillStyle = '#e8b0a0'; x.fillText(`Ends in 0:${String(Math.ceil(L.heist)).padStart(2, '0')}`, w / 2, 126);
    for (let i = 0; i < h; i += 2) { x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(0, i, w, 1); }
    return;
  }
  x.font = 'bold 13px "JetBrains Mono", monospace'; x.fillText('MANDATORY', w / 2, 30);
  x.font = '10px "JetBrains Mono", monospace'; x.fillText('Information Security Awareness 2026', w / 2, 50); x.fillText('Module 1 of 1 · Skip: disabled', w / 2, 66);
  const total = 47 * 60 + 12, pos = t < 24 ? t * 9 : Math.max(0, 24 * 9 - (t - 24) * 14), mm = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  x.fillStyle = '#2a2e34'; x.fillRect(20, 100, w - 40, 8); x.fillStyle = '#c25a3c'; x.fillRect(20, 100, (w - 40) * pos / total, 8);
  x.fillStyle = '#b8b0a0'; x.fillText(`${mm(pos)} / ${mm(total + (t > 24 ? (t - 24) * 40 : 0))}`, w / 2, 126);
  for (let i = 0; i < h; i += 2) { x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(0, i, w, 1); }
}

/* state */
const L = { att: 100, qs: [], used: 0, ckpt: null, scriptT: 0, comps: [], freed: [], screens: [], notes: [], desks: [], pops: [], mShut: false, exitOpen: false, built: false, said: {}, path: [], pathSet: new Set(),
  noiseT: 0, popT: 60, quietT: 0, heist: 0, mandSolved: false, mandT: 0, inMand: false, catching: 0, grace: 0, busy: false, crouch: false, vidK: 0, vidT: 0, clickT: 0, shiftT: 0, exitSign: null, mDoor: null, xDoor: null, exitLight: null, freedN: 0 };
const PAPER_FIG = { skin: '#d9d2c0', hair: '#d9d2c0', shirt: '#d9d2c0', pants: '#cfc8b6' };

function buildLMS() {
  lmsTextures();
  const rust = lam({ map: TEX.rust }), grate = lam({ map: TEX.grate }), ceil = lam({ map: TEX.ceil, color: 0x5a463a }), wood = lam({ map: TEX.wood, color: 0x8a6a58 }), dark = lam({ color: 0x1a1412 }), metal = lam({ map: TEX.metal, color: 0x8a6a5a });
  // carve rooms and doors into the grid
  const door = (R, side) => {
    const [r, c] = R.at, mid = 1 + Math.floor(ROOM / 2);
    if (side === 'n') return [c * LCELL + mid, r * LCELL]; if (side === 's') return [c * LCELL + mid, (r + 1) * LCELL];
    if (side === 'w') return [c * LCELL, r * LCELL + mid]; return [(c + 1) * LCELL, r * LCELL + mid];
  };
  for (const R of LMS_ROOMS) {
    const [r, c] = R.at; for (let i = 1; i <= ROOM; i++) for (let j = 1; j <= ROOM; j++) lgrid[(r * LCELL + i) * LW + c * LCELL + j] = 1;
    for (const sd of R.doors) { const [tx, tz] = door(R, sd); lgrid[tz * LW + tx] = R.mandatory ? 2 : R.exit ? 3 : lgrid[tz * LW + tx] || 1; }
  }
  // walls: one instanced block per solid tile that touches a walkable one
  const wallTiles = [];
  for (let z = 0; z < LW; z++) for (let x = 0; x < LW; x++) {
    if (lgrid[z * LW + x]) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].some(([dx, dz]) => { const nx = x + dx, nz = z + dz; return nx >= 0 && nz >= 0 && nx < LW && nz < LW && lgrid[nz * LW + nx]; })) wallTiles.push([x, z]);
  }
  const walls = new THREE.InstancedMesh(new THREE.BoxGeometry(LT, WALL_H, LT), rust, wallTiles.length);
  wallTiles.forEach(([x, z], i) => { _m.makeTranslation(tileC(x, LMS_O.x), WALL_H / 2, tileC(z, LMS_O.z)); walls.setMatrixAt(i, _m); }); walls.frustumCulled = false; lms.add(walls);
  const span = LW * LT, mid = [LMS_O.x + span / 2, LMS_O.z + span / 2];
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(span, span, 25, 25), grate); floor.rotation.x = -Math.PI / 2; floor.position.set(mid[0], 0, mid[1]); lms.add(floor);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(span, span, 12, 12), ceil); top.rotation.x = Math.PI / 2; top.position.set(mid[0], WALL_H, mid[1]); lms.add(top);
  // wet paper underfoot, cables overhead
  const floorTiles = []; for (let z = 0; z < LW; z++) for (let x = 0; x < LW; x++) if (lgrid[z * LW + x] === 1) floorTiles.push([x, z]);
  const wet = new THREE.InstancedMesh(PAPER_GEO, lam({ map: TEX.paper, color: 0x7d7262, side: THREE.DoubleSide }), 420);
  for (let i = 0; i < 420; i++) { const [x, z] = floorTiles[(Math.random() * floorTiles.length) | 0]; _e.set(-Math.PI / 2 + (Math.random() - .5) * .2, Math.random() * 6.3, 0, 'YXZ'); _q.setFromEuler(_e); _v.set(tileC(x, LMS_O.x) + (Math.random() - .5) * 1.8, .01 + Math.random() * .02, tileC(z, LMS_O.z) + (Math.random() - .5) * 1.8); _m.compose(_v, _q, _s); wet.setMatrixAt(i, _m); }
  wet.frustumCulled = false; lms.add(wet);
  for (let i = 0; i < 46; i++) { const [x, z] = floorTiles[(Math.random() * floorTiles.length) | 0], len = .6 + Math.random() * 1.6; const cb = box(.035, len, .035, tileC(x, LMS_O.x) + (Math.random() - .5) * 1.6, WALL_H - len / 2, tileC(z, LMS_O.z) + (Math.random() - .5) * 1.6, lms, dark); cb.rotation.set((Math.random() - .5) * .5, 0, (Math.random() - .5) * .5); }
  // the Learning Pathway: from Kim's desk to the mandatory training, the safe and boring route
  const start = LMS_ROOMS.find(R => R.start), mand = LMS_ROOMS.find(R => R.mandatory);
  const s0 = [start.at[1] * LCELL + 3, start.at[0] * LCELL + 4], m0 = door(mand, 's');
  L.mShut = false; const pth = pathTo(s0[0], s0[1], m0[0], m0[1] - 1) || [];
  L.path = [s0, ...pth]; L.path.forEach(([x, z]) => L.pathSet.add(z * LW + x));
  const pathMat = new THREE.MeshBasicMaterial({ color: 0x3fc8b0, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let i = 0; i < L.path.length - 1; i++) {
    const [ax, az] = L.path[i], [bx, bz] = L.path[i + 1], x0 = tileC(ax, LMS_O.x), z0 = tileC(az, LMS_O.z), x1 = tileC(bx, LMS_O.x), z1 = tileC(bz, LMS_O.z);
    const seg = new THREE.Mesh(new THREE.PlaneGeometry(.22, Math.hypot(x1 - x0, z1 - z0) + .22), pathMat); seg.rotation.set(-Math.PI / 2, 0, Math.atan2(x1 - x0, z1 - z0)); seg.position.set((x0 + x1) / 2, .025, (z0 + z1) / 2); lms.add(seg);
  }
  L.pathMat = pathMat;
  // rooms: a sign, an emergency light, and whatever the data puts in them
  vidTex = cnv(128, 72, (x, w, h) => drawVid(x, w, h, 0)); mandTex = cnv(256, 144, (x, w, h) => drawMand(x, w, h, 0));
  for (const R of LMS_ROOMS) {
    const [r, c] = R.at, [cx, cz] = roomCentre(r, c), half = ROOM * LT / 2;
    const onWall = (side, off, y, obj, depth = .02) => {
      if (side === 'n') { obj.position.set(cx + off, y, cz - half + depth); obj.rotation.y = 0; }
      else if (side === 's') { obj.position.set(cx - off, y, cz + half - depth); obj.rotation.y = Math.PI; }
      else if (side === 'w') { obj.position.set(cx - half + depth, y, cz - off); obj.rotation.y = Math.PI / 2; }
      else { obj.position.set(cx + half - depth, y, cz + off); obj.rotation.y = -Math.PI / 2; }
      lms.add(obj); return obj;
    };
    const at = (lx, lz) => [cx + (lx - 2) * LT, cz + (lz - 2) * LT];
    if (R.name && !R.mandatory) {
      const side = ['n', 'w', 'e', 's'].find(sd => !R.doors.includes(sd)) || 'n', off = R.doors.includes(side) ? -3 : 0;
      onWall(side, off, 2.35, label(R.name, .48, { font: 'IM Fell English', size: 54, maxW: 640, bg: '#1d1310', color: '#bfae94', lit: true, pad: 22 }));
    }
    if (!R.exit) { const lamp = box(.3, .08, .14, cx, WALL_H - .05, cz, lms, new THREE.MeshBasicMaterial({ color: 0x9a2a1a })); halo(lms, 0xb03a20, 1.6, 1.6, cx, WALL_H - .2, cz, .35); lamp.userData.room = R; }
    for (const it of R.items) {
      const k = it[0];
      if (k === 'desk' || k === 'kimdesk') {
        const [x, z] = at(it[1], it[2]); const g = new THREE.Group(); g.position.set(x, 0, z); lms.add(g);
        box(1.6, .06, .8, 0, .74, 0, g, wood); [[-.74, -.34], [.74, -.34], [-.74, .34], [.74, .34]].forEach(([a, b]) => box(.05, .72, .05, a, .36, b, g, metal)); box(1.5, .4, .03, 0, .5, -.36, g, wood);
        blob(g, 2, 1.2, 0, 0);
        if (k === 'kimdesk') {
          box(.46, .38, .4, 0, .96, -.15, g, metal); const scr = new THREE.Mesh(new THREE.PlaneGeometry(.36, .27), new THREE.MeshBasicMaterial({ map: screenTex('Module 30 of 30  ✓ COMPLETE  ✓ COMPLETE  ✓', '#e07a5a') })); scr.position.set(0, .97, .055); g.add(scr);
          halo(g, 0xe07a5a, .9, .7, 0, .97, .2, .25);
        } else if (Math.random() < .5) box(.4, .32, .34, (Math.random() - .5) * .8, .93, -.1, g, metal);
        L.desks.push({ x, z, g });
        if (it[3] != null) addNote(it[3], x + .3, .79, z + .1);
      } else if (k === 'chairs') {
        const lz = it[1]; for (let i = 0; i < 4; i++) { const [x, z] = at(.5 + i, lz); const g = new THREE.Group(); g.position.set(x, 0, z); lms.add(g); box(.44, .05, .42, 0, .46, 0, g, metal); box(.44, .45, .04, 0, .7, .2, g, metal); [[-.2, -.18], [.2, -.18], [-.2, .18], [.2, .18]].forEach(([a, b]) => box(.03, .46, .03, a, .23, b, g, dark)); if (Math.random() < .3) g.rotation.z = (Math.random() - .5) * .5; g.rotation.y = (Math.random() - .5) * .3; }
      } else if (k === 'screen') {
        const g = new THREE.Group(); box(1.5, .9, .1, 0, 0, -.05, g, dark);
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.36, .77), new THREE.MeshBasicMaterial({ map: vidTex })); pl.position.z = .01; g.add(pl);
        const gl = halo(g, 0x9ab8d0, 2.6, 1.6, 0, 0, .4, .22);
        onWall(it[1], it[2], 1.9, g, .1); g.updateMatrixWorld(true);
        const front = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion);
        L.screens.push({ g, pl, gl, on: true, x: g.position.x + front.x * 1.2, z: g.position.z + front.z * 1.2 });
      } else if (k === 'poster') {
        onWall(it[1], it[2], 1.7, label(it[3], .5, { font: 'IM Fell English', size: 60, maxW: 640, bg: it[4] === 'red' ? '#4a1410' : '#1e2833', color: it[4] === 'red' ? '#e8b0a0' : '#d9d2bf', lit: true, pad: 24 }));
      } else if (k === 'comp') { const [x, z] = at(it[1], it[2]); R.spawns = R.spawns || []; R.spawns.push([x, z]); }
    }
    if (R.mandatory) {
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.25), new THREE.MeshBasicMaterial({ map: mandTex })); onWall('n', 0, 1.75, scr, .05);
      halo(lms, 0xa8c0e0, 7, 4, cx, 1.75, cz - half + .6, .3);
      const ml = new THREE.PointLight(0xa8c0e0, .9, 11, 1.4); ml.position.set(cx, 1.8, cz - half + 1.8); lms.add(ml);
    }
    if (R.start) { const sl = new THREE.PointLight(0xc0503a, .7, 11, 1.5); sl.position.set(cx, WALL_H - .4, cz); lms.add(sl); }
    if (R.exit) { L.exitLight = new THREE.PointLight(0xffe2b0, 0, 14, 1.2); L.exitLight.position.set(cx, 1.6, cz + 2); lms.add(L.exitLight); }
  }
  // the two special doors, and the signs above them
  const mk = (R, txt, col) => {
    const [tx, tz] = door(R, 's'), x = tileC(tx, LMS_O.x), z = tileC(tz, LMS_O.z) + LT / 2;
    const sign = label(txt, .36, { font: 'IM Fell English', size: 56, maxW: 900, bg: col, color: '#efe4d0', lit: false, pad: 18 }); sign.position.set(x, 2.55, z + .03); lms.add(sign);
    const pv = new THREE.Group(); pv.position.set(x - LT / 2, 0, z - .1); lms.add(pv); box(LT, 2.3, .1, LT / 2, 1.15, 0, pv, lam({ map: TEX.door, color: col === '#5a1410' ? 0xb07060 : 0x8a8a7a }));
    box(LT, WALL_H - 2.3, .3, x, 2.3 + (WALL_H - 2.3) / 2, z - .1, lms, rust);
    return { pv, sign, x, z };
  };
  L.mDoor = mk(mand, 'MANDATORY TRAINING', '#5a1410'); L.mDoor.pv.rotation.y = 1.45;
  L.xDoor = mk(LMS_ROOMS.find(R => R.exit), 'EXIT COURSE · 0 of 3 learners freed', '#26302a');
  L.built = true;
}
function addNote(i, x, y, z) {
  const g = new THREE.Group(); g.position.set(x, y, z); lms.add(g);
  const tex = new THREE.CanvasTexture(textCanvas(QUESTIONS[i], { font: 'Special Elite', size: 40, maxW: 300, bg: '#e8cf5a', color: '#2a2018', pad: 18 }));
  const note = new THREE.Mesh(new THREE.PlaneGeometry(.3, .3), new THREE.MeshBasicMaterial({ map: tex })); note.rotation.x = -Math.PI / 2 + .25; note.position.y = .01; g.add(note);
  const hl = halo(g, 0xffe08a, .9, .9, 0, .15, 0, .55);
  L.notes.push({ i, g, hl, x, z, taken: false });
}
function setExitSign() {
  const n = L.freedN, s = L.xDoor.sign, txt = n >= 3 ? 'EXIT COURSE · open' : `EXIT COURSE · ${n} of 3 learners freed`;
  const c = textCanvas(txt, { font: 'IM Fell English', size: 56, maxW: 900, bg: n >= 3 ? '#2a5a3a' : '#26302a', color: '#efe4d0', pad: 18 });
  s.material.map.dispose(); s.material.map = new THREE.CanvasTexture(c); s.geometry.dispose(); s.geometry = new THREE.PlaneGeometry(.36 * c.width / c.height, .36);
}

/* Completions: hollow paper people who click Complete */
function makeCompletion(x, z) {
  // a faint glow, so they read through the fog before they can see Kim
  const g = person(PAPER_FIG), u = g.userData, skin = lam({ map: TEX.paperSkin, emissive: 0x26231d }), face = lam({ map: TEX.paperFace, emissive: 0x26231d });
  g.traverse(o => { if (o.isMesh && o.material !== BLOB_MAT) o.material = skin; });
  u.head.children[0].material = [skin, skin, skin, skin, face, skin];
  Object.assign(u, { fixed: true, phone: true });
  u.armR.rotation.x = -.9; u.armR.userData.el.rotation.x = -.6; u.armL.rotation.x = .05; u.head.rotation.z = .25;
  g.scale.set(.94, 1.1, .94); g.position.set(x, 0, z); lms.add(g);
  return { g, x, z, yaw: Math.random() * 6.3, state: 'wander', path: null, t: 0, rep: 0, lost: 0, last: null, sated: 0, tap: Math.random() * 3, seen: false };
}
// keep = start again from the last checkpoint: notes found and people freed stay done
function resetLMS(keep) {
  const ck = keep ? L.ckpt : null;
  L.comps.forEach(c => { const k = people.indexOf(c.g); if (k >= 0) people.splice(k, 1); if (c.g.parent) c.g.parent.remove(c.g); });
  L.freed.forEach(p => { removeTags(t => t.obj === p); const k = people.indexOf(p); if (k >= 0) people.splice(k, 1); lms.remove(p); });
  L.pops.forEach(p => p.el.remove());
  Object.assign(L, { att: 100, qs: [], ckpt: ck, scriptT: 0, comps: [], freed: [], pops: [], mShut: false, exitOpen: false, said: {}, noiseT: 0, popT: ck ? 30 : 60, quietT: 0, mandT: 0, inMand: false, catching: 0, grace: 0, busy: false, crouch: false, shiftT: 0, freedN: 0, extra: false, mandDone: false, clockTxt: '', heist: 0, mandSolved: false });
  if (!L.built) return;
  trail.clear();
  L.notes.forEach(n => { n.taken = false; n.g.visible = true; });
  L.screens.forEach(s => { s.on = true; s.pl.material.map = vidTex; s.pl.material.color.setHex(0xffffff); s.gl.visible = true; });
  L.mDoor.pv.rotation.y = 1.45; L.xDoor.pv.rotation.y = 0; L.exitLight.intensity = 0;
  for (const R of LMS_ROOMS) (R.spawns || []).forEach(([x, z]) => L.comps.push(makeCompletion(x, z)));
  if (ck) {
    L.qs = ck.qs.slice(); L.freedN = ck.freedN; L.mandSolved = ck.mandSolved;
    L.notes.forEach(n => { if (L.qs.includes(n.i)) { n.taken = true; n.g.visible = false; } });
    L.comps.splice(0, ck.freedN).forEach(c => { const k = people.indexOf(c.g); if (k >= 0) people.splice(k, 1); lms.remove(c.g); });
    if (L.freedN >= 3) openExit(true);
  }
  setExitSign();
  ['#att', '#rq', '#vig', '#mvid'].forEach(s => $(s).hidden = true); renderRQ();
}

/* the shift: the chime swells, the lights die, and the office peels away */
function chime(vol = .05, p = 1, when = 0) {
  if (!ac) return; const t = ac.currentTime + when;
  [[1318.5, 0], [1760, .09]].forEach(([f, d]) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f * p; g.gain.setValueAtTime(.0001, t + d); g.gain.exponentialRampToValueAtTime(vol, t + d + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d + .6); o.connect(g); g.connect(ac.destination); o.start(t + d); o.stop(t + d + .65); });
}
function chimeSwell(dur) {
  if (!ac) return; const t = ac.currentTime;
  let at = 0, gap = 1.1, n = 0; while (at < dur) { chime(.025 + .05 * at / dur, 1 - .35 * (at / dur) * Math.random(), at); at += gap; gap = Math.max(.07, gap * .82); n++; }
  const o = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain(); o.type = 'sawtooth'; lp.type = 'lowpass'; lp.frequency.value = 700;
  o.frequency.setValueAtTime(140, t); o.frequency.linearRampToValueAtTime(420, t + dur * .55); o.frequency.linearRampToValueAtTime(260, t + dur);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.09, t + dur * .9); g.gain.exponentialRampToValueAtTime(.0001, t + dur + 1.2);
  o.connect(lp); lp.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 1.3);
}
/* thirty courses in, the LMS shows itself for two seconds, then lets Kim pretend she didn't see it */
function glimpse() {
  phase = 'shift'; S.auto = false; frozen = true; S.fountain = 0; L.shiftT = 0;
  if (document.pointerLockElement) document.exitPointerLock();
  droneTo(.06, 46);
  say([
    'Thirty courses. Kim had never once looked inside one of them.',
    { t: 'Then Kim heard it. The notification chime. Not one notification. All of them.', fx: () => { chimeSwell(6); L.shiftT = .0001; } }
  ], () => {
    // a Completion, standing right there at the desk
    const c = makeCompletion(player.x - Math.sin(player.yaw) * 2.4, player.z - Math.cos(player.yaw) * 2.4); world.add(c.g);
    c.g.rotation.y = Math.atan2(player.x - c.x, player.z - c.z); noise(.6, 220, .14); blip(98, .9, .07);
    setTimeout(() => {
      const k = people.indexOf(c.g); if (k >= 0) people.splice(k, 1); world.remove(c.g);
      phase = 'tool'; L.shiftT = 0; hemi.intensity = .62; scene.fog.color.copy(FOG_IN); scene.background.copy(FOG_IN);
      noise(1.2, 900, .2); blip(1320, .05, .05);
      say(['Kim decided she hadn’t seen that. It was easier than the alternative.'], () => { frozen = false; S.auto = true; S.autoT = .5; superpowers(); });
    }, 2200);
  });
}
function enterLMS(retry) {
  phase = 'lms'; S.listening = false; world.visible = false; lms.visible = true; flying.length = 0; flyers.count = 0;
  inboxEl.hidden = true; $('#dash').hidden = true; $('#guide').hidden = true;
  if (retry || !L.comps.length) resetLMS(retry);
  hemi.intensity = .11; sun.intensity = 0;
  const st = L.path[0]; Object.assign(player, { x: tileC(st[0], LMS_O.x), z: tileC(st[1], LMS_O.z) - .2, yaw: 0, pitch: -.1 });
  ['#att', '#rq', '#vig'].forEach(s => $(s).hidden = false); renderRQ(); $('#cross').hidden = isTouch;
  radioOn(); if (radioHiss) radioHiss.g.gain.value = .004; soundtrack('lms'); droneTo(.05, 48);
  frozen = false; lock(); L.shiftT = 0;
  if (retry) {
    say([S.lmsDeaths > 1 ? 'Kim opened her eyes in the LMS. Again. The Completions seemed a little slower this time. The narrator will not say why.' : 'Again, Kim opened her eyes in the LMS. The narrator will pretend not to have noticed.']);
    return;
  }
  // the LMS states the goal itself, the way an LMS would
  lmsPopup('Welcome back, Kim! To complete this course, free 3 learners with real questions. Estimated time: 12 minutes.', true);
  say([
    'When Kim opened her eyes, she was inside the mountain. Every course she had ever published had to live somewhere.',
    'This was the LMS. Somewhere in here was the course Sam couldn’t find.',
    'Kim had twelve minutes of attention left. Same as everyone else.',
    'A Learning Pathway glowed on the floor. The narrator recommends it. The narrator has not been told where it goes.'
  ], () => { L.scriptT = 3; });
}
/* the first scare is also the tutorial: a Completion crosses the next room, too far away to notice Kim */
function crossing() {
  const c = makeCompletion(tileC(7, LMS_O.x), tileC(15, LMS_O.z)); c.state = 'sated'; c.sated = 14; c.yaw = Math.PI / 2; c.path = pathTo(7, 15, 11, 15); L.comps.push(c);
  L.said.saw = 1; noise(.5, 220, .1); blip(98, .9, .06);
  say(['Something was walking between the modules. It had been a learner once. Now it was a completion.', 'Kim did not want to be seen. Under a desk seemed sensible. It usually does.', 'They never ran. They didn’t need to. But Kim could always walk away.']);
}
/* the yellow trail: the freed people's directions, the human counterpart to the teal Learning Pathway */
const trail = new THREE.Group(); lms.add(trail);
const trailGeo = new THREE.PlaneGeometry(.26, .26), trailMat = new THREE.MeshBasicMaterial({ color: 0xe8cf5a, transparent: true, opacity: .85, depthWrite: false });
function drawTrail() {
  trail.clear();
  const next = L.notes.find(n => !n.taken), goal = L.exitOpen ? [tileX(L.xDoor.x), tileZ(L.xDoor.z)] : next ? [tileX(next.x), tileZ(next.z)] : null;
  const p = goal && pathTo(tileX(player.x), tileZ(player.z), goal[0], goal[1]); if (!p) return;
  p.forEach(([x, z], i) => {
    if (i % 2) return;
    const m = new THREE.Mesh(trailGeo, trailMat); m.rotation.set(-Math.PI / 2, 0, Math.random() * .8 - .4);
    m.position.set(tileC(x, LMS_O.x) + (Math.random() - .5) * .3, .03, tileC(z, LMS_O.z) + (Math.random() - .5) * .3); trail.add(m);
  });
}
/* out at the foot of the mountain, at dusk, with the people Kim freed */
const lmsWalkers = [];
function clearWalkers() { lmsWalkers.forEach(p => { removeTags(t => t.obj === p); const k = people.indexOf(p); if (k >= 0) people.splice(k, 1); world.remove(p); }); lmsWalkers.length = 0; }
function exitLMS() {
  if (phase !== 'lms') return; phase = 'shift'; frozen = true; L.busy = true;
  chime(.06, 1); setTimeout(() => chime(.05, .8), 300);
  $('#fade').classList.add('on');
  setTimeout(() => {
    lms.visible = false; world.visible = true; hemi.intensity = .62; sun.intensity = .32; applyLook(); radioOff(); flash.distance = 30; subs.style.filter = '';
    ['#att', '#rq', '#vig', '#mvid', '#tCrouch'].forEach(s => $(s).hidden = true); L.pops.forEach(p => p.el.remove()); L.pops = [];
    removeTags(t => L.freed.includes(t.obj)); L.crouch = false;
    // each question Kim carried out is a conversation that already happened: Jan, Tom and Noor did the talking
    const held = [0, 1, 2].filter(i => L.qs.includes(i)), n = held.length;
    S.talkSkip = held.slice(); S.shrunk = n; S.talkIdx = 0;
    const left = 1 - n / TALKS.length, toP = Math.round(Ppeak * Math.pow(left, 1.3));
    H = Hpeak * left; while (paperCount > toP) removePaper(); updateTerrain(); updatePapers(); updateDash(Math.max(2, Math.round(coursesShown * left)));
    phase = 'talk'; soundtrack('hope'); $('#tGen').textContent = 'Ask';
    const z = C.z + Math.max(6, R * .8); Object.assign(player, { x: C.x, z, yaw: 0, pitch: -.05, y: hAt(C.x, z) + 1.7 });
    FREED.slice(0, 3).forEach((F, i) => { const p = person({ ...STYLES[(i + 1) % STYLES.length], who: F.who }); p.position.set(C.x + (i - 1) * 1.7, 0, z + 2.4 + (i % 2) * .7); world.add(p); addTag(p, F.who, 2.05, 'name'); lmsWalkers.push(p); });
    $('#fade').classList.remove('on'); $('#dash').hidden = false;
    const told = [them('Finance', 'Jan told me. We don’t need a course.'), them('HR', 'Tom says a buddy beats forty modules. Fine.'), them('Legal', 'Noor read the actual law. One page and a signature.')];
    say([
      'Kim climbed out at the foot of the mountain. It was getting dark. Three people walked out behind her.',
      ...held.map(i => told[i]),
      ['', 'A slice of the mountain was already gone. One conversation had happened without her.', 'Some of the mountain was already gone. Two conversations had happened without her.', 'Half the mountain was already gone. Three conversations had happened without her. That was the idea.'][n],
      'The rest were still waiting.'
    ], () => { frozen = false; L.busy = false; spawnTalker(); });
  }, 1200);
}

/* the HUD bits */
// the sticky notes in Kim's pocket, used ones ticked off, and one line that always says what to do next
function renderRQ() {
  const ol = $('#rqList'); ol.innerHTML = '';
  for (let i = 0; i < 3; i++) { const li = document.createElement('li'), q = L.qs[i]; li.textContent = q == null ? '?' : QUESTIONS[q]; li.className = q == null ? '' : 'got'; ol.appendChild(li); }
  $('#obj').textContent = L.exitOpen ? 'The exit is open · north-east' : L.qs.length ? `Ask a Completion a real question · ${L.freedN} of 3 freed` : `Find a yellow note · ${L.freedN} of 3 freed`;
}
function lmsPopup(text, welcome) {
  if (L.pops.length >= 3) return;
  const el = document.createElement('button'); el.type = 'button'; el.className = 'lpop' + (welcome ? ' welcome' : '');
  el.innerHTML = `<small>LMS · ${welcome ? 'welcome' : 'notification'}</small>`; el.appendChild(document.createTextNode(text));
  if (!welcome) { el.style.left = (12 + Math.random() * 56) + '%'; el.style.top = (24 + Math.random() * 40) + '%'; }
  const p = { el }; el.addEventListener('click', () => closePop(p)); $('#lmsPops').appendChild(el); L.pops.push(p);
  chime(.05, 1);
}
function closePop(p) {
  p = p || L.pops[0]; if (!p) return; const k = L.pops.indexOf(p); if (k < 0) return;
  L.pops.splice(k, 1); p.el.classList.add('out'); setTimeout(() => p.el.remove(), 250); gain(20 * SEC); blip(520, .08, .04);
  if (!L.said.pop) { L.said.pop = 1; say(['Kim closed the notification. It felt like putting something down.']); }
}
function gain(d) { L.att = Math.max(0, Math.min(100, L.att + d)); if (Math.abs(d) >= 2) attDelta(d); }
const clockOf = a => { const s = Math.round(Math.abs(a) * 7.2); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
// attention is twelve minutes, like everyone else's: show each gain or loss as time
function attDelta(d) { const el = document.createElement('b'); el.className = 'attd' + (d < 0 ? ' neg' : ''); el.textContent = (d < 0 ? '−' : '+') + clockOf(d); $('#att').appendChild(el); setTimeout(() => el.remove(), 1700); }

/* the action key */
function nearNote() { return L.notes.find(n => !n.taken && Math.hypot(player.x - n.x, player.z - n.z) < 1.7); }
function nearScreen() { return L.screens.find(s => s.on && Math.hypot(player.x - s.x, player.z - s.z) < 1.9); }
function nearComp() {
  let best = null, bd = 4;
  for (const c of L.comps) { if (c.state === 'asked') continue; const d = Math.hypot(player.x - c.x, player.z - c.z); if (d < bd && lmsLOS(player.x, player.z, c.x, c.z)) { const a = Math.atan2(-(c.x - player.x), -(c.z - player.z)) - player.yaw; if (Math.cos(a) > .3 || d < 1.6) { best = c; bd = d; } } }
  return best;
}
function lmsAction() {
  if (frozen || L.busy || L.catching) return;
  if (canAskScreen()) return askScreen();
  const n = nearNote(); if (n) return takeNote(n);
  const c = L.qs.length && nearComp(); if (c) return ask(c);
  const s = nearScreen(); if (s) return screenOff(s);
}
function takeNote(n) {
  n.taken = true; n.g.visible = false; L.qs.push(n.i); renderRQ(); setExitSign(); gain(60 * SEC); trail.clear(); saveCkpt();
  blip(660, .2, .05); setTimeout(() => blip(880, .3, .05), 140);
  const k = L.qs.length;
  const lines = [
    ['A sticky note, in Kim’s own handwriting. From before CourseGen. Before everything.', `It said: ${QUESTIONS[n.i]} Kim had forgotten she used to ask that.`, 'A real question. If Kim got close enough to one of them, she could ask it.'],
    [`Another one. ${QUESTIONS[n.i]} Nobody had asked the LMS that in years.`],
    [`${QUESTIONS[n.i]} Kim put it in her pocket, next to the others.`]
  ][k - 1];
  // the note in Mandatory Training is the bait: taking it shuts the door, and the video starts again
  if (n.i === 2 && L.inMand && !L.mandSolved) {
    L.heist = 20; L.mShut = true; L.mDoor.pv.rotation.y = 0; noise(.5, 120, .2); blip(70, .5, .08);
    lines.push('The door closed politely behind her. The video started again, from the beginning.');
  }
  say(lines);
}
const saveCkpt = () => { L.ckpt = { qs: L.qs.slice(), freedN: L.freedN, mandSolved: L.mandSolved }; };
function canAskScreen() { return L.heist > 0 && L.heist < 17 && L.inMand && !talking; }
function askScreen() {
  L.heist = 0; L.busy = true; frozen = true;
  say([kim('Mandatory by law, or by habit?'),
    { t: 'The video thought about it. Then it showed one page, and a place to sign.', fx: () => { L.mandSolved = true; saveCkpt(); } },
    { t: 'Kim signed. The door opened. The LMS had never seen that before.', fx: () => { L.mShut = false; L.mDoor.pv.rotation.y = 1.45; noise(.4, 300, .06); gain(90 * SEC); } }
  ], () => { L.busy = false; frozen = false; });
}
function openExit(quiet) {
  L.exitOpen = true; L.xDoor.pv.rotation.y = -1.4; L.exitLight.intensity = 1.1; setExitSign(); renderRQ();
  if (quiet) return;
  noise(1.2, 160, .14); chimeSwell(4);
  const [cx, cz] = roomCentre(2, 2); const c = makeCompletion(cx, cz); c.state = 'hear'; c.last = { x: player.x, z: player.z }; c.path = pathTo(tileX(c.x), tileZ(c.z), tileX(player.x), tileZ(player.z)); L.comps.push(c); L.extra = true;
}
function screenOff(s) {
  s.on = false; s.pl.material.map = null; s.pl.material.color.setHex(0x050505); s.pl.material.needsUpdate = true; s.gl.visible = false; gain(45 * SEC); noise(.12, 3000, .05); blip(180, .1, .04);
  if (!L.said.screen) { L.said.screen = 1; say(['Kim switched it off. The quiet was almost shocking.']); }
}
function ask(c) {
  L.busy = true; frozen = true; c.state = 'asked'; c.path = null;
  // a real question works on anyone; Kim asks the one that fits the person underneath, if she has it
  const fi = L.freedN % FREED.length, F = FREED[fi], q = QUESTIONS[L.qs.includes(fi) ? fi : L.qs[L.freedN % L.qs.length]]; L.freedN++; renderRQ();
  const first = !L.said.freed, n = L.freedN; L.said.freed = 1;
  say([kim(q)], () => {
    // the paper falls away, and there is a person underneath
    for (let i = 0; i < 12; i++) launchSheet('away', new THREE.Vector3(c.x + (Math.random() - .5) * .4, .6 + Math.random() * 1.4, c.z + (Math.random() - .5) * .4));
    noise(1.2, 900, .1); blip(523, .4, .04); setTimeout(() => blip(784, .6, .04), 180);
    const k = people.indexOf(c.g); if (k >= 0) people.splice(k, 1); lms.remove(c.g); L.comps.splice(L.comps.indexOf(c), 1);
    const p = person({ ...STYLES[L.freedN % STYLES.length], who: F.who }); p.position.set(c.x, 0, c.z); lms.add(p); L.freed.push(p);
    const tg = addTag(p, F.who, 2.05, 'name'); tg.los = true;
    gain(90 * SEC); setExitSign(); renderRQ(); saveCkpt();
    const lines = [them(F.who, F.t)];
    if (first) lines.push('The paper fell away. Underneath was a person. There had always been a person.');
    if (n === 3) lines.push({ t: 'Three people. Somewhere, a door unlocked. The LMS did not like that at all.', fx: () => openExit() }, { t: 'North-east, past the Exit Survey. Of course the way out was through the exit survey.', fx: drawTrail });
    else if (n < 3) { const next = L.notes.find(x => !x.taken); lines.push({ ...them(F.who, next ? DIRECTIONS[next.i] : DIRECTIONS.pocket), fx: drawTrail }); }
    say(lines, () => { L.busy = false; frozen = false; });
  });
}

/* the frame update */
const vig = $('#vig');
function lmsHidden() { return L.crouch && L.desks.some(d => Math.abs(player.x - d.x) < 1 && Math.abs(player.z - d.z) < .65); }
// crouching next to a desk puts Kim under it, so hiding doesn't need pixel-perfect walking
function crouch() {
  L.crouch = !L.crouch; noise(.08, 300, .03);
  if (!L.crouch) return;
  const d = L.desks.find(k => Math.hypot(player.x - k.x, player.z - k.z) < 1.2); if (d) { player.x = d.x; player.z = d.z; }
}
function lmsCollide() {
  const r = .3, tx = tileX(player.x), tz = tileZ(player.z);
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
    const x = tx + dx, z = tz + dz; if (lwalk(x, z)) continue;
    const x0 = LMS_O.x + x * LT, z0 = LMS_O.z + z * LT, nx = Math.max(x0, Math.min(x0 + LT, player.x)), nz = Math.max(z0, Math.min(z0 + LT, player.z));
    const ddx = player.x - nx, ddz = player.z - nz, d = Math.hypot(ddx, ddz);
    if (d < r) { if (d > 1e-4) { player.x = nx + ddx / d * r; player.z = nz + ddz / d * r; } else player.z = z0 + LT + r; }
  }
  if (!L.crouch) for (const k of L.desks) {
    const lx = player.x - k.x, lz = player.z - k.z, hx = .8 + r, hz = .4 + r;
    if (Math.abs(lx) < hx && Math.abs(lz) < hz) { if (hx - Math.abs(lx) < hz - Math.abs(lz)) player.x = k.x + Math.sign(lx || 1) * hx; else player.z = k.z + Math.sign(lz || 1) * hz; }
  }
}
function clickAt(x, z, vol) {
  if (!ac) return; const rel = Math.atan2(-(x - player.x), -(z - player.z)) - player.yaw, pan = Math.max(-1, Math.min(1, -Math.sin(rel)));
  const n = Math.floor(ac.sampleRate * .02), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 6);
  const s = ac.createBufferSource(); s.buffer = b; const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2400; const g = ac.createGain(); g.gain.value = vol;
  const p = ac.createStereoPanner ? ac.createStereoPanner() : null; s.connect(f); f.connect(g); if (p) { p.pan.value = pan; g.connect(p); p.connect(ac.destination); } else g.connect(ac.destination); s.start();
}
function moveComp(c, speed, dt) {
  let tx, tz;
  if (c.path && c.path.length) { const [a, b] = c.path[0]; tx = tileC(a, LMS_O.x); tz = tileC(b, LMS_O.z); if (Math.hypot(tx - c.x, tz - c.z) < .25) { c.path.shift(); if (!c.path.length) c.path = null; } }
  if (c.direct) { tx = c.direct.x; tz = c.direct.z; }
  if (tx == null) return false;
  const dx = tx - c.x, dz = tz - c.z, d = Math.hypot(dx, dz); if (d < .05) return false;
  const st = Math.min(d, speed * dt); c.x += dx / d * st; c.z += dz / d * st;
  let dy = Math.atan2(dx, dz) - c.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); c.yaw += dy * Math.min(1, dt * 5);
  return true;
}
function wanderTarget(c) {
  bfs(tileX(c.x), tileZ(c.z)); const opts = [];
  // they never wander into Mandatory Training or the exit: those rooms belong to Kim
  for (let i = 0; i < LW * LW; i++) if (_bfsDist[i] >= 3 && _bfsDist[i] <= 9 && lgrid[i] === 1) { const R = roomAt(i % LW, (i / LW) | 0); if (!R || (!R.mandatory && !R.exit)) opts.push(i); }
  if (!opts.length) return; const j = opts[(Math.random() * opts.length) | 0]; c.path = pathTo(tileX(c.x), tileZ(c.z), j % LW, (j / LW) | 0);
}
function catchKim(c) {
  // a catch costs a flat two minutes; then the Completion, satisfied, walks off
  L.catching = 3; frozen = true; c.state = 'sated'; c.sated = 9; c.path = null; c.direct = null; c.t = 0; gain(-120 * SEC);
  const mv = $('#mvid'); mv.hidden = false; $('#mvidBar').style.width = '0%';
  noise(.6, 300, .16); blip(110, .8, .08); chime(.07, .7);
  if (!L.said.caught) { L.said.caught = 1; say(['It showed Kim a mandatory video. There was no skip button. There is never a skip button.']); }
}
function updateLMS(dt) {
  if (S.ended) return;
  const t = performance.now() / 1000, hidden = lmsHidden();
  lmsCollide();
  // the screens all play the same video
  L.vidT += dt; if (L.vidT > .9) { L.vidT = 0; L.vidK++; const c = vidTex.image, x = c.getContext('2d'); drawVid(x, c.width, c.height, L.vidK); vidTex.needsUpdate = true; }
  L.pathMat.opacity = .38 + Math.sin(t * 2.2) * .12 + (Math.random() < .02 ? -.3 : 0);
  for (const n of L.notes) if (!n.taken) n.hl.material.opacity = .4 + Math.sin(t * 3 + n.i) * .15;
  // where is Kim
  const tx = tileX(player.x), tz = tileZ(player.z), R = roomAt(tx, tz);
  if (!L.said.offPath && !L.pathSet.has(tz * LW + tx) && ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => L.pathSet.has((tz + b) * LW + tx + a)) && !talking) {
    L.said.offPath = 1; say(['Kim stepped off the Learning Pathway. The narrator would like to point out that the pathway was designed by experts.']);
  }
  if (R && R.exit && L.exitOpen) return exitLMS();
  updateMandatory(dt, R && R.mandatory);
  if (!L.exitOpen && !L.said.locked && Math.hypot(player.x - L.xDoor.x, player.z - L.xDoor.z) < 3 && !talking) { L.said.locked = 1; say(['The exit was locked. The sign wanted three learners, freed. Kim had not freed them yet.']); }
  // noise Kim makes, and who hears it
  const moving = S.bobAmt > .3, running = moving && keys.shift && !L.crouch;
  L.noiseT -= dt;
  if (L.noiseT <= 0 && moving) {
    L.noiseT = .5; const rad = running ? 13 : L.crouch ? 1.6 : 5;
    for (const c of L.comps) { if (c.state === 'stalk' || c.state === 'sated' || c.state === 'asked') continue; const d = Math.hypot(c.x - player.x, c.z - player.z), los = lmsLOS(c.x, c.z, player.x, player.z); if (d < (los ? rad : rad * .6)) { c.state = 'hear'; c.last = { x: player.x, z: player.z }; c.path = pathTo(tileX(c.x), tileZ(c.z), tx, tz); c.direct = null; } }
  }
  // the Completions
  let nearest = 99, stalking = false;
  if (L.grace > 0) L.grace -= dt;
  for (const m of trail.children) if (m.visible && Math.hypot(m.position.x - player.x, m.position.z - player.z) < 1.1) m.visible = false;
  const sightR = Math.min(Math.max(6, 7 - (S.lmsDeaths || 0)), scene.fog.far * .7), stalkV = Math.max(1.6, 2.1 - .2 * (S.lmsDeaths || 0));
  const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw);
  if (L.scriptT > 0) { L.scriptT -= dt; if (L.scriptT <= 0 && !L.said.saw) crossing(); }
  for (const c of L.comps) {
    const d = Math.hypot(c.x - player.x, c.z - player.z); nearest = Math.min(nearest, d);
    const u = c.g.userData;
    if (c.state === 'asked') { let dy = Math.atan2(player.x - c.x, player.z - c.z) - c.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); c.yaw += dy * Math.min(1, dt * 4); c.g.rotation.y = c.yaw; continue; }
    const fwd = Math.cos(Math.atan2(player.x - c.x, player.z - c.z) - c.yaw);
    const sees = c.state !== 'sated' && !hidden && d < sightR && (fwd > .5 || d < 1.8) && lmsLOS(c.x, c.z, player.x, player.z);
    if (sees) {
      if (c.state !== 'stalk') { c.rep = 0; if (!c.seen) { c.seen = true; noise(.5, 220, .1); blip(98, .9, .06); } }
      c.state = 'stalk'; c.lost = 0; c.last = { x: player.x, z: player.z };
      if (!L.said.saw) { L.said.saw = 1; say(['Something was walking between the modules. It had been a learner once. Now it was a completion.', 'Kim did not want to be seen. Under a desk seemed sensible. It usually does.']); }
    }
    if (c.state === 'stalk') {
      stalking = true;
      if (!sees) { c.lost += dt; if (c.lost > 1.2) { c.state = 'search'; c.t = 5; c.path = pathTo(tileX(c.x), tileZ(c.z), tileX(c.last.x), tileZ(c.last.z)); c.direct = null; } }
      c.rep -= dt; if (c.rep <= 0 && sees) { c.rep = .4; if (tileX(c.x) === tx && tileZ(c.z) === tz || d < 2) { c.path = null; c.direct = { x: player.x, z: player.z }; } else { c.direct = null; c.path = pathTo(tileX(c.x), tileZ(c.z), tx, tz); } }
      if (c.direct) c.direct = { x: player.x, z: player.z };
      // attention given slows them down: facing one with a question in hand makes it hesitate
      const facing = L.qs.length && d < 4 && ((c.x - player.x) * fx + (c.z - player.z) * fz) / (d || 1) > .7;
      moveComp(c, (running ? stalkV + .4 : stalkV) * (facing ? .5 : 1), dt);
      if (d < .95 && !hidden && !L.catching && !L.busy && L.grace <= 0 && sees) catchKim(c);
    } else if (c.state === 'hear' || c.state === 'search') {
      if (!c.path && !c.direct) { c.t -= dt; if (c.state === 'hear') { c.state = 'search'; c.t = 3; } if (c.t <= 0) { c.state = 'wander'; c.last = null; } }
      else moveComp(c, c.state === 'hear' ? 1.6 : 1.2, dt);
    } else {
      if (c.state === 'sated') { c.sated -= dt; if (c.sated <= 0) c.state = 'wander'; }
      if (!c.path) { c.t -= dt; if (c.t <= 0) { c.t = 1 + Math.random() * 3; wanderTarget(c); } }
      else moveComp(c, .85, dt);
    }
    c.g.position.set(c.x, 0, c.z); c.g.rotation.y = c.yaw;
    // the twitch, and the tapping finger that clicks Complete
    c.tap += dt; u.armR.rotation.x = -.9 + (c.tap % 1.3 < .12 ? .25 : 0); u.head.rotation.z = .25 + (Math.sin(t * 17 + c.tap) > .97 ? .3 : 0); u.head.rotation.x = Math.sin(t * .7 + c.tap) * .08;
    if (c.tap % 1.3 < dt && d < 14) clickAt(c.x, c.z, .08 * (1 - d / 14));
  }
  // the radio hiss rises as they get close, like Harry Mason's radio
  if (radioHiss) radioHiss.g.gain.setTargetAtTime(.004 + .09 * Math.max(0, 1 - nearest / 12), ac.currentTime, .15);
  droneTo(stalking ? .1 : .05, stalking ? 62 : 48);
  // attention: drains slowly, fast near Completions, screens and notifications; quiet brings it back
  // in displayed seconds per real second: the clock always ticks, faster near Completions, screens and pop-ups
  let drain = 1 + Math.max(0, (7 - nearest) / 7) * 4 + L.pops.length;
  for (const s of L.screens) if (s.on) { const d = Math.hypot(player.x - s.x, player.z - s.z); if (d < 4.5) drain += 2 * (1 - d / 4.5); }
  if (L.catching) {
    drain = 0; L.catching -= dt; $('#mvidBar').style.width = Math.min(100, (1 - L.catching / 3) * 100) + '%';
    if (L.catching <= 0) {
      L.catching = 0; L.grace = 4; $('#mvid').hidden = true; if (!L.busy) frozen = false;
      if (!L.said.cost && L.att > 0) { L.said.cost = 1; say(['That cost her two minutes. It didn’t cost her everything.']); }
    }
  }
  const quiet = !moving && nearest > 9 && !L.pops.length && !L.screens.some(s => s.on && Math.hypot(player.x - s.x, player.z - s.z) < 5);
  L.quietT = quiet ? L.quietT + dt : 0;
  if (L.quietT > 1.2) drain -= 4;
  drain *= SEC;
  if (!L.busy && !L.inMand) gain(-drain * dt);
  if (L.att < 35 && !L.said.low && !talking) { L.said.low = 1; say(['Kim’s attention was running low. Somewhere quiet, standing still, it might come back.']); }
  if (L.att <= 0 && !L.busy) return becomeCompletion();
  // notifications keep arriving
  if (!talking && !L.busy) { L.popT -= dt; if (L.popT <= 0) { L.popT = 16 + Math.random() * 14; lmsPopup(LMS_POPS[(Math.random() * LMS_POPS.length) | 0]); } }
  // what low attention looks like: dimmer torch, darker edges, a quieter narrator (the subtitles stay sharp)
  const a = L.att / 100;
  $('#attBar').style.width = L.att.toFixed(1) + '%'; $('#att').className = 'hud' + (a < .3 ? ' low' : '') + (L.quietT > 1.2 && a < 1 ? ' quiet' : '');
  const ct = `Kim’s attention · ${clockOf(L.att)}`; if (ct !== L.clockTxt) { L.clockTxt = ct; $('#attLbl').textContent = ct; }
  vig.style.opacity = Math.max(0, Math.min(1, (1 - a) * 1.4 - .15)).toFixed(2);
  if (isTouch) $('#tCrouch').hidden = false;
}
function updateMandatory(dt, inside) {
  if (inside && !L.inMand) {
    L.inMand = true; L.mandT = 0;
    if (!L.said.mandIn) {
      L.said.mandIn = 1;
      say(['Kim followed the Learning Pathway all the way to the end. It ended here. Of course it did.', 'Mandatory training. Forty-seven minutes. The door stood open. Leaving was optional. Technically.']);
    }
  } else if (!inside && L.inMand) {
    L.inMand = false;
    if (L.mandT > 3 && !L.said.mandOut && !L.mandDone && !L.mandSolved) { L.said.mandOut = 1; say(['Kim walked out of mandatory training. The system marked her as in progress. It would remind her. Forever.']); }
    L.mandT = 0;
  }
  if (L.inMand) {
    if (!talking && !L.heist && !L.mandSolved) L.mandT += dt;
    const c = mandTex.image; drawMand(c.getContext('2d'), c.width, c.height, L.mandT); mandTex.needsUpdate = true;
    if (L.heist > 0 && !talking && !L.busy) {
      L.heist -= dt;
      if (L.heist <= 0 && !L.mandDone) { L.heist = 0; L.mandDone = true; frozen = true; L.busy = true; say(['The video ended. Another one began. Kim, being a professional, kept watching.'], () => ending('mandatory')); }
    }
    if (L.mandT > 18 && !L.said.mandWorry) { L.said.mandWorry = 1; say(['Kim kept watching. The narrator is starting to worry about Kim.']); }
    if (L.mandT > 34 && !L.mandDone) {
      L.mandDone = true; frozen = true; L.busy = true;
      say(['The video ended. Another one began. Kim, being a professional, kept watching.'], () => ending('mandatory'));
    }
  }
}
function becomeCompletion() {
  L.busy = true; frozen = true; L.att = 0; S.lmsDeaths = (S.lmsDeaths || 0) + 1; noise(2, 400, .15); chimeSwell(4);
  $('#fade').style.background = '#e2dccb'; $('#fade').classList.add('on');
  say(['Kim’s attention ran out somewhere between two modules.', 'She clicked Complete. It felt like nothing. That was how she knew it had worked.'], () => ending('completion'));
}
/* the look of the LMS: rust-black fog that closes in as attention drops */
const FOG_LMS = new THREE.Color(0x140a07), FOG_RED = new THREE.Color(0x3a0c08);
function lmsLook(dt) {
  if (phase === 'shift' && L.shiftT) {
    L.shiftT += dt; const k = Math.min(1, L.shiftT / 6);
    scene.fog.color.lerp(FOG_RED, Math.min(1, dt * 1.5)); scene.background.copy(scene.fog.color); scene.fog.far = 30 - 22 * k;
    if (flicker) flicker.intensity = Math.random() < .3 + k * .5 ? 0 : .7; hemi.intensity = .62 * (1 - k * .8);
    camera.position.x += (Math.random() - .5) * .02 * k; camera.position.y += (Math.random() - .5) * .02 * k;
    return;
  }
  if (phase !== 'lms') return;
  const a = L.att / 100;
  scene.fog.color.copy(FOG_LMS).lerp(FOG_RED, (1 - a) * .6 + (L.inMand ? 0 : 0)); scene.background.copy(scene.fog.color);
  scene.fog.near = .5; scene.fog.far = (ps1 ? 9 : 13) + (ps1 ? 9 : 12) * a;
  flash.intensity = (.35 + 1.15 * a) * (Math.random() < (1 - a) * .08 ? .2 : 1); flash.distance = 7 + 16 * a;
}
