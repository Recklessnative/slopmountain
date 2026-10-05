/* ================= audio ================= */
let ac = null, drone = null;
function audioInit() {
  if (ac) return; try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  const g = ac.createGain(); g.gain.value = 0; g.connect(ac.destination);
  const o1 = ac.createOscillator(), o2 = ac.createOscillator(); o1.type = 'sine'; o2.type = 'triangle'; o1.frequency.value = 55; o2.frequency.value = 55.6;
  const g2 = ac.createGain(); g2.gain.value = .5; o2.connect(g2); o1.connect(g); g2.connect(g); o1.start(); o2.start(); drone = { g, o1, o2 };
}
function noise(dur, freq, vol) {
  if (!ac) return; const n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
  const s = ac.createBufferSource(); s.buffer = b; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = .8;
  const g = ac.createGain(); g.gain.value = vol; s.connect(f); f.connect(g); g.connect(ac.destination); s.start();
}
function blip(freq = 880, dur = .12, vol = .05) {
  if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = freq;
  g.gain.setValueAtTime(vol, ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + dur); o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + dur);
}
let music = null, radioHiss = null;
function musicStart() {
  if (!ac || music) return;
  const g = ac.createGain(); g.gain.value = 0; g.connect(ac.destination);
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380; lp.Q.value = 2; lp.connect(g);
  const lfo = ac.createOscillator(), lfoG = ac.createGain(); lfo.frequency.value = .07; lfoG.gain.value = 180; lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start();
  const oscs = [[43.65, 'sawtooth', .22], [46.25, 'sawtooth', .16], [87.3, 'triangle', .12], [130.8, 'sine', .05]].map(([f, t, v]) => { const o = ac.createOscillator(), og = ac.createGain(); o.type = t; o.frequency.value = f; og.gain.value = v; o.connect(og); og.connect(lp); o.start(); return o; });
  g.gain.setTargetAtTime(.32, ac.currentTime, 2.5);
  // a distant bell, out of tune with everything
  const bell = () => { if (!music || music.off) return; [196, 207.6, 392.5].forEach((f, i) => { const o = ac.createOscillator(), bg = ac.createGain(); o.frequency.value = f; o.type = 'sine'; bg.gain.setValueAtTime(.0001, ac.currentTime); bg.gain.exponentialRampToValueAtTime(.05 / (i + 1), ac.currentTime + .02); bg.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + 4.5); o.connect(bg); bg.connect(ac.destination); o.start(); o.stop(ac.currentTime + 4.6); }); music.bellT = setTimeout(bell, 5200 + Math.random() * 3000); };
  music = { g, oscs, lfo, off: false }; music.bellT = setTimeout(bell, 1800);
  music.clangT = setInterval(() => { if (Math.random() < .5) noise(1.2, 140 + Math.random() * 90, .05); }, 6500);
}
function musicStop() {
  if (!music) return; const m = music; music = null; m.off = true; clearTimeout(m.bellT); clearInterval(m.clangT);
  m.g.gain.setTargetAtTime(0, ac.currentTime, 1.2); setTimeout(() => { m.oscs.forEach(o => o.stop()); m.lfo.stop(); }, 5000);
}
function radioOn() {
  if (!ac || radioHiss) return; const n = ac.sampleRate * 2, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(); src.buffer = b; src.loop = true; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = .6;
  const g = ac.createGain(); g.gain.value = .018; src.connect(f); f.connect(g); g.connect(ac.destination); src.start(); radioHiss = { src, g };
}
function radioOff() { if (!radioHiss) return; blip(180, .05, .05); radioHiss.g.gain.setTargetAtTime(0, ac.currentTime, .05); const r = radioHiss; radioHiss = null; setTimeout(() => r.src.stop(), 400); const c = street.userData.car; if (c) c.userData.radio.intensity = 0; }
function staticBurst() { noise(.45, 2600, .07); }
