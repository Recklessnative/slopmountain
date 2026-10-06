/* ================= three setup ================= */
const COL = { bg: 0x1c1915, fill: 0x2a2420, deep: 0x2a2420, chalk: 0xe6dfcf, ground: 0x3a3733, mount: 0x4e4740 };
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
$('#game').appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(COL.bg);
scene.fog = new THREE.Fog(COL.bg, 24, 160);
const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 500);
scene.add(new THREE.HemisphereLight(0xb4b0a6, 0x2a241f, 0.62));
const sun = new THREE.DirectionalLight(0xd8d4c8, 0.32); sun.position.set(40, 80, 30); scene.add(sun);
// Harry Mason's flashlight, more or less
scene.add(camera);
const flash = new THREE.SpotLight(0xfff0d0, 1.3, 30, .5, .6, 1.1); flash.position.set(.25, -.25, 0); camera.add(flash);
const flashTarget = new THREE.Object3D(); flashTarget.position.set(0, -.4, -6); camera.add(flashTarget); flash.target = flashTarget;
/* PS1 look: low-res render, snapped vertices, dither, 15-bit colour, grain, thick fog */
let ps1 = true;
const LOW_H = 240;
const snapU = { value: new THREE.Vector2(160, 120) }, snapOnU = { value: 1 };
const rt = new THREE.WebGLRenderTarget(320, 240, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const postMat = new THREE.ShaderMaterial({
  uniforms: { tDiffuse: { value: rt.texture }, res: { value: new THREE.Vector2(320, 240) }, time: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform vec2 res; uniform float time; varying vec2 vUv;
    float b2(vec2 q){ return mod(q.x * 2. + q.y * 3., 4.); }
    float bayer(vec2 p){ p = floor(mod(p, 4.)); return (4. * b2(mod(p, 2.)) + b2(floor(p / 2.))) / 16.; }
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec2 px = floor(vUv * res);
      vec3 c = texture2D(tDiffuse, (px + .5) / res).rgb;
      float l = dot(c, vec3(.299, .587, .114));
      c = mix(c, vec3(l), .22);
      c += (bayer(px) - .5) / 22.;
      c = floor(c * 31. + .5) / 31.;
      c += (hash(px + floor(time * 24.)) - .5) * .05;
      vec2 d = vUv - .5; c *= 1. - .55 * dot(d, d) * 2.;
      gl_FragColor = vec4(c, 1.);
    }`,
  depthTest: false, depthWrite: false
});
const postScene = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));
function ps1ify(mat) {
  if (!mat || mat.userData.ps1) return; mat.userData.ps1 = true;
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    sh.uniforms.uSnap = snapU; sh.uniforms.uSnapOn = snapOnU;
    sh.vertexShader = 'uniform vec2 uSnap;\nuniform float uSnapOn;\n' + sh.vertexShader.replace('#include <project_vertex>',
      '#include <project_vertex>\n  gl_Position.xy = mix(gl_Position.xy, floor(gl_Position.xy / gl_Position.w * uSnap + .5) / uSnap * gl_Position.w, uSnapOn);');
  };
  mat.needsUpdate = true;
}
function ps1Sweep() { scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(ps1ify); }); }
const FOG = { clean: [0x1c1915, 8, 60], ps1: [0x1c1915, 3, 28] };
const DAWN = new THREE.Color(0xc9ab84), SUN_WARM = new THREE.Color(0xffd29a), FOG_IN = new THREE.Color(0x1c1915), FOG_OUT = new THREE.Color(0x8d8a82), _fogC = new THREE.Color();
function applyLook() {
  snapOnU.value = ps1 ? 1 : 0;
  const f = ps1 ? FOG.ps1 : FOG.clean; scene.fog.near = f[1]; scene.fog.far = f[2];
  try { localStorage.setItem('slop-ps1', ps1 ? '1' : '0'); } catch (e) {}
}
function resize() {
  renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  const h = LOW_H, w = Math.round(h * innerWidth / innerHeight); rt.setSize(w, h); postMat.uniforms.res.value.set(w, h); snapU.value.set(w / 2, h / 2);
}
addEventListener('resize', resize); resize();

const CHALK = new THREE.LineBasicMaterial({ color: COL.chalk });
const FILL = new THREE.MeshBasicMaterial({ color: COL.fill, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
function chalkBox(w, h, d, x, y, z, parent, fill = true) {
  const g = new THREE.Group(); g.position.set(x, y, z);
  const geo = new THREE.BoxGeometry(w, h, d);
  if (fill) g.add(new THREE.Mesh(geo, FILL));
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), CHALK));
  parent.add(g); return g;
}
function line(pts, parent) { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(...p))), CHALK); parent.add(l); return l; }
function ring(r, cx, cy, parent, seg = 28, start = 0, end = Math.PI * 2) {
  const pts = []; for (let i = 0; i <= seg; i++) { const a = start + (end - start) * i / seg; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0]); }
  return line(pts, parent);
}
function textCanvas(text, { font = 'IM Fell English', size = 80, color = '#f7ede2', maxW = 900, weight = '400', bg = null, pad = 20 } = {}) {
  const c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently: true });
  const f = `${weight} ${size}px "${font}", Georgia, serif`; x.font = f;
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (x.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  lines.push(cur);
  const lh = size * 1.12, W = Math.ceil(Math.min(maxW, Math.max(...lines.map(l => x.measureText(l).width))) + pad * 2), H = Math.ceil(lines.length * lh + pad * 2);
  c.width = W; c.height = H;
  if (bg) { x.fillStyle = bg; x.fillRect(0, 0, W, H); }
  x.font = f; x.fillStyle = color; x.textBaseline = 'middle'; x.textAlign = 'center';
  lines.forEach((l, i) => x.fillText(l, W / 2, pad + lh * (i + .5)));
  return c;
}
function label(text, height, opts = {}) {
  const c = textCanvas(text, opts); const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
  return new THREE.Mesh(new THREE.PlaneGeometry(height * c.width / c.height, height),
    opts.lit ? lam({ map: tex }) : new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
}
const billboards = [];
function stickFigure(parent, { x = 0, z = 0, pose = 'stand', tie = false, face = 'smile' } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const head = new THREE.Mesh(new THREE.CircleGeometry(.19, 24), FILL); head.position.set(0, 1.56, -0.01); g.add(head);
  ring(.19, 0, 1.56, g); line([[0, 1.37, 0], [0, .82, 0]], g); line([[-.2, 0, 0], [0, .82, 0], [.2, 0, 0]], g);
  if (pose === 'phone') line([[-.32, .92, 0], [0, 1.25, 0], [.18, 1.05, 0], [.12, 1.4, 0]], g);
  else line([[-.32, .92, 0], [0, 1.25, 0], [.32, .92, 0]], g);
  line([[-.07, 1.6, .01], [-.06, 1.6, .01]], g); line([[.06, 1.6, .01], [.07, 1.6, .01]], g);
  if (face === 'smile') ring(.08, 0, 1.53, g, 10, Math.PI * 1.15, Math.PI * 1.85);
  else if (face === 'sad') ring(.08, 0, 1.4, g, 10, Math.PI * .2, Math.PI * .8);
  else line([[-.06, 1.48, .01], [.06, 1.48, .01]], g);
  if (tie) line([[0, 1.36, .01], [-.04, 1.2, .01], [0, 1.1, .01], [.04, 1.2, .01], [0, 1.36, .01]], g);
  g.userData.ground = true; parent.add(g); billboards.push(g); return g;
}
/* ---- PS1 Silent Hill materials: small nearest-filtered canvas textures, Gouraud-lit ---- */
function cnv(w, h, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d', { willReadFrequently: true }), w, h);
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  if (rx !== 1 || ry !== 1) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); }
  return t;
}
function speckle(x, w, h, amt) { const d = x.getImageData(0, 0, w, h); for (let i = 0; i < d.data.length; i += 4) { const n = (Math.random() - .5) * amt; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n; } x.putImageData(d, 0, 0); }
function blotches(x, w, h, n, col, aMax, rMax) { x.fillStyle = col; for (let i = 0; i < n; i++) { x.globalAlpha = Math.random() * aMax; const r = 1 + Math.random() * rMax; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, r, r * (.4 + Math.random()), Math.random() * 3, 0, 7); x.fill(); } x.globalAlpha = 1; }
const TEX = {};
function makeTextures() {
  TEX.floor = cnv(64, 64, (x, w, h) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { x.fillStyle = (i + j) % 2 ? '#5d5547' : '#7a7262'; x.fillRect(i * 32, j * 32, 32, 32); } blotches(x, w, h, 40, '#2a241c', .25, 6); speckle(x, w, h, 22); x.fillStyle = 'rgba(20,16,12,.5)'; x.fillRect(0, 0, 64, 1); x.fillRect(0, 32, 64, 1); x.fillRect(0, 0, 1, 64); x.fillRect(32, 0, 1, 64); }, 10, 10);
  TEX.wall = cnv(64, 128, (x, w, h) => {
    x.fillStyle = '#77745c'; x.fillRect(0, 0, w, 84); for (let i = 0; i < w; i += 8) { x.fillStyle = 'rgba(40,38,26,.18)'; x.fillRect(i, 0, 3, 84); }
    for (let i = 0; i < 5; i++) { const sx = Math.random() * w, len = 20 + Math.random() * 50; const g = x.createLinearGradient(0, 0, 0, len); g.addColorStop(0, 'rgba(70,52,30,.45)'); g.addColorStop(1, 'rgba(70,52,30,0)'); x.fillStyle = g; x.fillRect(sx, 0, 3 + Math.random() * 6, len); }
    x.fillStyle = '#3f3226'; x.fillRect(0, 84, w, 44); x.fillStyle = '#2a2018'; x.fillRect(0, 82, w, 4); for (let i = 0; i < w; i += 16) { x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(i, 86, 1, 42); }
    blotches(x, w, h, 30, '#1e1810', .2, 5); speckle(x, w, h, 18);
  }, 10, 1);
  TEX.ceil = cnv(64, 64, (x, w, h) => { x.fillStyle = '#8b887d'; x.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { x.fillStyle = 'rgba(40,38,32,.35)'; x.fillRect(Math.random() * w, Math.random() * h, 1, 1); } blotches(x, w, h, 4, '#5e4a2c', .35, 12); x.fillStyle = '#4e4b43'; x.fillRect(0, 0, w, 2); x.fillRect(0, 0, 2, h); speckle(x, w, h, 12); }, 10, 10);
  TEX.wood = cnv(64, 32, (x, w, h) => { x.fillStyle = '#5b3f29'; x.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { x.strokeStyle = `rgba(30,18,10,${.2 + Math.random() * .3})`; x.beginPath(); const y = Math.random() * h; x.moveTo(0, y); x.bezierCurveTo(20, y + 3, 40, y - 3, 64, y + 1); x.stroke(); } speckle(x, w, h, 14); });
  TEX.fabric = cnv(32, 32, (x, w, h) => { x.fillStyle = '#4a525a'; x.fillRect(0, 0, w, h); speckle(x, w, h, 26); blotches(x, w, h, 6, '#2a2620', .3, 5); }, 2, 1);
  TEX.metal = cnv(32, 64, (x, w, h) => { x.fillStyle = '#6a6c66'; x.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { x.fillStyle = '#4a4c48'; x.fillRect(2, 2 + i * 16, w - 4, 1); x.fillRect(2, 15 + i * 16, w - 4, 1); x.fillStyle = '#2e2f2c'; x.fillRect(12, 7 + i * 16, 8, 2); } blotches(x, w, h, 10, '#5a3a20', .3, 3); speckle(x, w, h, 16); });
  TEX.paper = cnv(32, 40, (x, w, h) => { x.fillStyle = '#ddd6c4'; x.fillRect(0, 0, w, h); x.fillStyle = '#6a665d'; x.fillRect(4, 4, 16, 3); for (let i = 0; i < 9; i++) x.fillRect(4, 10 + i * 3, 18 + Math.random() * 6, 1); x.fillStyle = 'rgba(80,70,50,.25)'; x.fillRect(0, 0, w, 1); x.fillRect(w - 1, 0, 1, h); blotches(x, w, h, 3, '#8a7a50', .25, 4); x.fillStyle = '#bdb5a2'; x.beginPath(); x.moveTo(w - 7, 0); x.lineTo(w, 7); x.lineTo(w, 0); x.fill(); });
  TEX.binder = cnv(32, 40, (x, w, h) => { x.fillStyle = '#d0ccc4'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, 0, 4, h); x.fillStyle = '#efeadf'; x.fillRect(10, 8, 16, 10); x.fillStyle = '#555'; x.fillRect(12, 11, 12, 1); x.fillRect(12, 14, 9, 1); speckle(x, w, h, 20); });
  TEX.terrain = cnv(64, 64, (x, w, h) => { x.fillStyle = '#4b453e'; x.fillRect(0, 0, w, h); blotches(x, w, h, 60, '#2b2621', .35, 6); blotches(x, w, h, 30, '#6d665b', .25, 4); speckle(x, w, h, 28); }, 30, 30);
  TEX.ground = cnv(64, 64, (x, w, h) => { x.fillStyle = '#3c3a36'; x.fillRect(0, 0, w, h); speckle(x, w, h, 30); x.strokeStyle = 'rgba(12,11,10,.7)'; for (let i = 0; i < 4; i++) { x.beginPath(); let px = Math.random() * w, py = Math.random() * h; x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += (Math.random() - .5) * 20; py += (Math.random() - .5) * 20; x.lineTo(px, py); } x.stroke(); } }, 70, 70);
  TEX.door = cnv(32, 64, (x, w, h) => { x.fillStyle = '#4e3826'; x.fillRect(0, 0, w, h); x.fillStyle = '#9a968c'; x.fillRect(8, 8, 16, 18); x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(6, 32, 20, 24); x.fillStyle = '#b8a060'; x.fillRect(24, 34, 3, 2); speckle(x, w, h, 14); });
  TEX.keys = cnv(32, 16, (x, w, h) => { x.fillStyle = '#a69d86'; x.fillRect(0, 0, w, h); x.fillStyle = '#7d7562'; for (let r = 0; r < 4; r++) for (let c = 0; c < 15; c++) x.fillRect(1 + c * 2, 2 + r * 3, 1, 2); });
}
const MAT = {};
function lam(opts) { return new THREE.MeshLambertMaterial(opts); }
function makeMaterials() {
  MAT.floor = lam({ map: TEX.floor }); MAT.wall = lam({ map: TEX.wall }); MAT.ceil = lam({ map: TEX.ceil }); MAT.wood = lam({ map: TEX.wood });
  MAT.fabric = lam({ map: TEX.fabric }); MAT.metal = lam({ map: TEX.metal }); MAT.metalPlain = lam({ color: 0x5c5e59 }); MAT.beige = lam({ color: 0xa79e86 });
  MAT.black = lam({ color: 0x1c1b19 }); MAT.door = lam({ map: TEX.door }); MAT.keys = lam({ map: TEX.keys }); MAT.tube = new THREE.MeshBasicMaterial({ color: 0xe4ead8 });
}
function box(w, h, d, x, y, z, parent, mat) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m; }
function screenTex(text, glow = '#9fd39a') {
  return cnv(128, 96, (x, w, h) => {
    x.fillStyle = '#0d1a14'; x.fillRect(0, 0, w, h); x.fillStyle = glow; x.font = '11px "JetBrains Mono", monospace'; x.textBaseline = 'top';
    const words = text.split(' '); let line = '', y = 10; for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (x.measureText(t).width > w - 16) { x.fillText(line, 8, y); y += 14; line = wd; } else line = t; } x.fillText(line, 8, y);
    for (let i = 0; i < h; i += 2) { x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, i, w, 1); }
  });
}
/* faces and clothes, painted onto 32px textures like the PS1 did */
function faceTex(skin, hair, { glasses = false, long = false, beard = false } = {}, shut = false) {
  return cnv(64, 64, (x, w, h) => {
    x.fillStyle = skin; x.fillRect(0, 0, w, h);
    const g = x.createRadialGradient(32, 34, 6, 32, 34, 40); g.addColorStop(0, 'rgba(255,235,215,.10)'); g.addColorStop(1, 'rgba(40,20,10,.28)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(60,30,20,.16)'; x.fillRect(0, 52, w, 12); x.fillRect(0, 0, 5, h); x.fillRect(59, 0, 5, h);
    x.fillStyle = 'rgba(170,70,60,.10)'; x.fillRect(12, 36, 10, 6); x.fillRect(42, 36, 10, 6);
    x.fillStyle = hair; x.fillRect(0, 0, w, 13); for (let k = 0; k < w; k += 3) x.fillRect(k, 13, 3, (k * 7) % 5);
    x.fillRect(0, 0, 6, long ? 64 : 28); x.fillRect(58, 0, 6, long ? 64 : 28); if (long) x.fillRect(6, 13, 9, 5);
    x.fillStyle = 'rgba(25,15,10,.85)'; x.fillRect(13, 21, 12, 2); x.fillRect(39, 21, 12, 2); x.fillRect(12, 22, 2, 1); x.fillRect(50, 22, 2, 1);
    x.fillStyle = 'rgba(60,30,25,.22)'; x.fillRect(14, 31, 10, 2); x.fillRect(40, 31, 10, 2);
    if (shut) { x.fillStyle = 'rgba(30,18,12,.8)'; x.fillRect(15, 28, 9, 1); x.fillRect(40, 28, 9, 1); }
    else {
      x.fillStyle = '#ebe5d9'; x.fillRect(15, 26, 9, 4); x.fillRect(40, 26, 9, 4);
      x.fillStyle = '#4a3222'; x.fillRect(19, 26, 4, 4); x.fillRect(41, 26, 4, 4);
      x.fillStyle = '#100c0a'; x.fillRect(20, 27, 2, 2); x.fillRect(42, 27, 2, 2);
      x.fillStyle = 'rgba(255,255,255,.8)'; x.fillRect(20, 26, 1, 1); x.fillRect(42, 26, 1, 1);
      x.fillStyle = 'rgba(25,15,10,.7)'; x.fillRect(15, 25, 9, 1); x.fillRect(40, 25, 9, 1);
    }
    x.fillStyle = 'rgba(70,35,25,.25)'; x.fillRect(29, 28, 2, 12); x.fillStyle = 'rgba(255,240,225,.12)'; x.fillRect(32, 28, 2, 11);
    x.fillStyle = 'rgba(50,25,20,.45)'; x.fillRect(27, 40, 3, 2); x.fillRect(34, 40, 3, 2);
    x.fillStyle = '#7a3c32'; x.fillRect(24, 47, 16, 2); x.fillStyle = '#9a5446'; x.fillRect(26, 49, 12, 2); x.fillStyle = 'rgba(40,20,15,.35)'; x.fillRect(27, 53, 10, 1);
    if (beard) { x.fillStyle = hair; x.globalAlpha = .75; x.fillRect(10, 42, 44, 18); x.fillRect(22, 44, 20, 3); x.globalAlpha = 1; x.fillStyle = '#7a3c32'; x.fillRect(25, 48, 14, 2); }
    if (glasses) { x.strokeStyle = '#141010'; x.lineWidth = 2; x.strokeRect(13, 23, 14, 10); x.strokeRect(37, 23, 14, 10); x.fillStyle = '#141010'; x.fillRect(27, 26, 10, 2); x.fillStyle = 'rgba(200,220,230,.12)'; x.fillRect(14, 24, 12, 8); x.fillRect(38, 24, 12, 8); }
    speckle(x, w, h, 8);
  });
}
function torsoTex(shirt, jacket, tie) {
  return cnv(32, 32, (x, w, h) => {
    x.fillStyle = shirt; x.fillRect(0, 0, w, h);
    if (jacket) { x.fillStyle = jacket; x.fillRect(0, 0, 11, h); x.fillRect(21, 0, 11, h); x.beginPath(); x.moveTo(11, 0); x.lineTo(16, 16); x.lineTo(11, 32); x.fill(); x.beginPath(); x.moveTo(21, 0); x.lineTo(16, 16); x.lineTo(21, 32); x.fill(); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(10, 0, 1, h); x.fillRect(21, 0, 1, h); }
    if (tie) { x.fillStyle = tie; x.fillRect(15, 1, 3, 3); x.beginPath(); x.moveTo(14, 4); x.lineTo(19, 4); x.lineTo(18, 20); x.lineTo(16.5, 22); x.lineTo(15, 20); x.fill(); }
    else if (!jacket) { x.fillStyle = 'rgba(0,0,0,.3)'; for (let i = 0; i < 4; i++) x.fillRect(16, 5 + i * 6, 1, 1); }
    x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, 28, w, 4); speckle(x, w, h, 10);
  });
}
/* soft things the PS1 faked with sprites: contact shadows, light cones, halos, fog wisps */
const radialTex = (inner, outer) => cnv(64, 64, (x, w, h) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, inner); g.addColorStop(1, outer); x.fillStyle = g; x.fillRect(0, 0, w, h); });
const BLOB_GEO = new THREE.PlaneGeometry(1, 1);
const BLOB_MAT = new THREE.MeshBasicMaterial({ map: radialTex('rgba(0,0,0,.62)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
function blob(parent, w, d, x, z, y = .012) { const m = new THREE.Mesh(BLOB_GEO, BLOB_MAT); m.rotation.x = -Math.PI / 2; m.scale.set(w, d, 1); m.position.set(x, y, z); parent.add(m); return m; }
const HALO_TEX = radialTex('rgba(255,250,235,.9)', 'rgba(255,250,235,0)');
function halo(parent, color, sx, sy, x, y, z, op = .5) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: HALO_TEX, color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.set(sx, sy, 1); sp.position.set(x, y, z); parent.add(sp); return sp; }
const CONE_TEX = cnv(8, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
function cone(parent, color, rTop, rBot, hgt, x, yTop, z, op) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, hgt, 12, 1, true), new THREE.MeshBasicMaterial({ map: CONE_TEX, color, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); m.position.set(x, yTop - hgt / 2, z); parent.add(m); return m; }
/* baked vertex lighting: PS1 games painted shadow into the vertices; we do the same once at load */
const VC_MATS = new Map(), _bv = new THREE.Vector3(), _bakedGeo = new Set();
function vh(v) { const n = Math.sin(v.x * 12.9898 + v.y * 78.233 + v.z * 37.719) * 43758.5453; return n - Math.floor(n); }
function bake(root, fn) {
  root.updateMatrixWorld(true);
  root.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || Array.isArray(o.material) || !o.material.isMeshLambertMaterial) return;
    for (let q = o; q; q = q.parent) if (q.userData && (q.userData.head || q.userData.noBake)) return;
    if (_bakedGeo.has(o.geometry)) o.geometry = o.geometry.clone(); _bakedGeo.add(o.geometry);
    const pos = o.geometry.attributes.position, col = new Float32Array(pos.count * 3);
    const flat = o.geometry.type === 'PlaneGeometry' && Math.abs(Math.abs(o.rotation.x) - Math.PI / 2) < .01;
    for (let i = 0; i < pos.count; i++) {
      _bv.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
      const k = fn(_bv, flat) * (.95 + vh(_bv) * .1), warm = Math.min(1, Math.max(0, 1 - k)) * .06;
      col[i * 3] = k * (1 + warm * .4); col[i * 3 + 1] = k; col[i * 3 + 2] = k * (1 - warm);
    }
    o.geometry.setAttribute('color', new THREE.BufferAttribute(col, 3));
    let c = VC_MATS.get(o.material); if (!c) { c = o.material.clone(); c.vertexColors = true; delete c.userData.ps1; VC_MATS.set(o.material, c); } o.material = c;
  });
}
const TUBES = [[-5, -7], [5, -7], [-5, -1], [5, -1], [-5, 5], [5, 5], [0, -4], [0, 2]];
function officeAO(v, flat) {
  const d = [v.x + 10, 10 - v.x, v.z + 11.5, 8.5 - v.z].map(a => Math.max(0, a)).sort((a, b) => a - b), dW = d[0] < .06 ? d[1] : d[0];
  let k = 1 - .42 * Math.exp(-dW / .9);
  if (!flat) k *= 1 - .45 * Math.exp(-Math.max(0, v.y) / .32);
  k *= 1 - .32 * Math.exp(-Math.max(0, 3.1 - v.y) / .35);
  let pool = 0; for (const [x, z] of TUBES) pool += Math.exp(-((v.x - x) ** 2 + (v.z - z) ** 2) / 7);
  return k * (.74 + .34 * Math.min(1, pool));
}
const LAMPS = [[0, 9.4], [-6.15, 14.2], [7.85, 14.2], [-13.15, 23.8]];
function streetAO(v, flat) {
  let k = 1;
  if (flat) { if (v.z < 14.5) k *= 1 - .38 * Math.exp(-Math.abs(v.z - 8.56) / 1.1); }
  else k *= (1 - .42 * Math.exp(-Math.max(0, v.y) / .5)) * (.82 + .18 * Math.min(1, v.y / 8));
  let pool = 0; for (const [x, z] of LAMPS) pool += Math.exp(-((v.x - x) ** 2 + (v.z - z) ** 2) / 14);
  return k * (.82 + .3 * Math.min(1, pool));
}
const people = [];
function person({ skin = '#c49a7e', hair = '#2a1d14', shirt = '#cfcabd', jacket = null, pants = '#2c2c30', tie = null, long = false, glasses = false, beard = false, phone = false, who = null } = {}) {
  const g = new THREE.Group(), top = jacket || shirt;
  const L = c => lam({ color: c });
  const M = (geo, mat, x, y, z, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const legGeo = new THREE.BoxGeometry(.17, .8, .19), shoeGeo = new THREE.BoxGeometry(.17, .08, .28);
  M(legGeo, L(pants), -.11, .46, 0); M(legGeo, L(pants), .11, .46, 0); M(shoeGeo, L('#171513'), -.11, .04, .04); M(shoeGeo, L('#171513'), .11, .04, .04);
  M(new THREE.BoxGeometry(.42, .14, .24), L(pants), 0, .88, 0);
  const tg = new THREE.BoxGeometry(.46, .6, .26), tp = tg.attributes.position; for (let i = 0; i < tp.count; i++) if (tp.getY(i) < 0) { tp.setX(i, tp.getX(i) * .84); tp.setZ(i, tp.getZ(i) * .9); }
  const tm = L(top), torso = M(tg, [tm, tm, tm, tm, lam({ map: torsoTex(shirt, jacket, tie) }), tm], 0, 1.24, 0);
  M(new THREE.BoxGeometry(.5, .08, .27), tm, 0, 1.5, 0);
  M(new THREE.BoxGeometry(.1, .08, .1), L(skin), 0, 1.57, 0);
  const head = new THREE.Group(); head.position.set(0, 1.6, 0); g.add(head);
  const sk = L(skin), hr = L(hair);
  const fo = { glasses, long, beard }, faceMat = lam({ map: faceTex(skin, hair, fo) }), faceShut = faceTex(skin, hair, fo, true);
  M(new THREE.BoxGeometry(.23, .27, .24), [sk, sk, hr, sk, faceMat, hr], 0, .14, 0, head);
  M(new THREE.BoxGeometry(.034, .055, .035), sk, 0, .11, .13, head); [-1, 1].forEach(sd => M(new THREE.BoxGeometry(.025, .07, .05), sk, sd * .125, .13, 0, head));
  M(new THREE.BoxGeometry(.25, .07, .26), hr, 0, .29, -.01, head);
  M(new THREE.BoxGeometry(.25, long ? .4 : .2, .06), hr, 0, long ? .06 : .17, -.12, head);
  const arm = side => {
    const pv = new THREE.Group(); pv.position.set(side * .3, 1.5, 0); g.add(pv); M(new THREE.BoxGeometry(.13, .3, .15), L(top), 0, -.15, 0, pv);
    const el = new THREE.Group(); el.position.set(0, -.29, 0); pv.add(el); el.rotation.x = -.12; M(new THREE.BoxGeometry(.12, .28, .13), L(top), 0, -.14, 0, el);
    M(new THREE.BoxGeometry(.09, .11, .1), L(skin), 0, -.33, .01, el); M(new THREE.BoxGeometry(.03, .06, .04), L(skin), side * -.05, -.3, .04, el);
    pv.userData.el = el; return pv;
  };
  const armL = arm(-1), armR = arm(1);
  const sh = new THREE.Mesh(BLOB_GEO, BLOB_MAT); sh.rotation.x = -Math.PI / 2; sh.scale.set(.75, .55, 1); sh.position.y = .018; g.add(sh);
  if (phone) {
    armR.rotation.x = -.45; armR.rotation.z = .2; armR.userData.el.rotation.x = -1.35; head.rotation.x = .38;
    const ph = M(new THREE.BoxGeometry(.07, .12, .02), L('#1a1a1a'), 0, -.36, .07, armR.userData.el); ph.rotation.x = .3;
    M(new THREE.PlaneGeometry(.05, .08), new THREE.MeshBasicMaterial({ color: 0x9cc8d8 }), 0, 0, .011, ph);
  }
  g.userData = { head, armL, armR, torso, who, ground: true, phase: Math.random() * 6, phone, face: { mat: faceMat, open: faceMat.map, shut: faceShut, t: 1 + Math.random() * 4 } };
  people.push(g); return g;
}
const STYLES = [
  { skin: '#c49a7e', hair: '#3a2a1c', shirt: '#cfcabd', jacket: '#4a4d52', pants: '#3a3c40', tie: '#5a2424' },
  { skin: '#a8765a', hair: '#1e1612', shirt: '#7a5e6a', jacket: '#6d5a4a', pants: '#2c2a2a', long: true },
  { skin: '#d1ae94', hair: '#6a6258', shirt: '#d8d4cb', jacket: '#25262a', pants: '#25262a', tie: '#2c3a52', glasses: true },
  { skin: '#b88466', hair: '#2a1d14', shirt: '#6e86a8', pants: '#4a463e', tie: '#a8742a', beard: true },
  { skin: '#cfa58a', hair: '#8a6a3a', shirt: '#ebe6dc', jacket: '#1d1d20', pants: '#1d1d20', long: true },
  { skin: '#8e6248', hair: '#141110', shirt: '#4f6a4a', pants: '#3b3a36' }
];
const PAPER_GEO = new THREE.PlaneGeometry(.85, 1.08);
makeTextures(); makeMaterials();
const PAPER_MAT = lam({ map: TEX.paper, side: THREE.DoubleSide });
const BINDER_GEO = new THREE.BoxGeometry(.34, .06, .42), BINDER_MAT = lam({ map: TEX.binder });
