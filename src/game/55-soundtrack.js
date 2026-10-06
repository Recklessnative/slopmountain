/* ---- soundtrack: a tiny WebAudio sequencer, one theme per act ---- */
let musicOn = true; try { if (localStorage.getItem('slop-music') === '0') musicOn = false; } catch (e) {}
const ST = { cur: null, gain: null, step: 0, next: 0, iv: 0, master: null, verb: null, nb: null };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const THEMES = {
  // the drive in: minor, trip-hop, a tremolo guitar somewhere in the fog
  drive: { bpm: 76, vol: .55, chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [52, 56, 59]], pad: .045, arp: [0, -1, 2, -1, 1, -1, 2, -1, 0, -1, 2, -1, 1, -1, 2, -1], arpOct: 12, arpVol: .07, bass: [0, 8], kick: 'x.....x...x.....', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', hatVol: .014, trem: .028 },
  // the office: slow, sparse, a clock somewhere
  office: { bpm: 58, vol: .42, chords: [[50, 53, 57, 60], [46, 50, 53, 57], [43, 50, 53, 58], [45, 49, 52, 57]], pad: .04, arp: [0, -1, -1, -1, -1, -1, 2, -1, -1, -1, -1, 3, -1, -1, -1, -1], arpOct: 12, arpVol: .05, bass: [0], hat: 'x...x...x...x...', hatVol: .006 },
  // CourseGen: busy, bright, pleased with itself
  gen: { bpm: 112, vol: .45, chords: [[57, 60, 64], [57, 60, 64], [53, 57, 60], [55, 59, 62]], pad: .025, arp: [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1], arpOct: 12, arpVol: .045, bass: [0, 3, 6, 8, 11, 14], kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.', hatVol: .02 },
  // superpowers: everything, faster
  super: { bpm: 132, vol: .5, chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], pad: .035, arp: [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 2, 1, 3], arpOct: 24, arpVol: .04, bass: [0, 2, 4, 6, 8, 10, 12, 14], kick: 'x...x...x...x...', snare: '....x.......x..x', hat: 'xxxxxxxxxxxxxxxx', hatVol: .012, trem: .018 },
  // peak slop: the music stops having ideas
  peak: { bpm: 44, vol: .38, chords: [[45, 52, 59, 60]], pad: .055 },
  // the LMS: two chords a semitone apart, and a bell that never resolves
  lms: { bpm: 46, vol: .4, chords: [[40, 46, 51], [41, 47, 52], [40, 46, 51], [39, 45, 50]], pad: .05, arp: [0, -1, -1, -1, -1, -1, -1, -1, 2, -1, -1, -1, -1, -1, -1, -1], arpOct: 24, arpVol: .022, hat: 'x...............', hatVol: .008 },
  // actual conversations: warm, major, unhurried
  hope: { bpm: 70, vol: .48, chords: [[48, 52, 55, 60], [47, 50, 55, 59], [45, 48, 52, 57], [41, 45, 48, 53]], pad: .04, arp: [0, -1, 1, -1, 2, -1, 3, -1, 2, -1, 1, -1, 2, -1, 3, -1], arpOct: 12, arpVol: .06, bass: [0] }
};
function stInit() {
  if (ST.master || !ac) return;
  ST.master = ac.createGain(); ST.master.gain.value = 0; ST.master.connect(ac.destination);
  ST.verb = ac.createConvolver(); const len = Math.floor(ac.sampleRate * 2.4), ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  ST.verb.buffer = ir; const vg = ac.createGain(); vg.gain.value = .55; ST.verb.connect(vg); vg.connect(ST.master);
  ST.nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const nd = ST.nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  ST.iv = setInterval(stTick, 40);
}
function soundtrack(name) {
  if (!ac) return; stInit(); if (ST.cur === name) return;
  const t = ac.currentTime;
  if (ST.gain) { const g = ST.gain; g.gain.setTargetAtTime(0, t, .9); setTimeout(() => g.disconnect(), 6000); }
  ST.cur = name; ST.gain = null; if (!THEMES[name]) return;
  const g = ac.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(THEMES[name].vol, t + .05, 1.4); g.connect(ST.master);
  const send = ac.createGain(); send.gain.value = .4; g.connect(send); send.connect(ST.verb);
  ST.gain = g; ST.step = 0; ST.next = t + .12;
}
function stTick() {
  if (!ac || !ST.master) return;
  ST.master.gain.setTargetAtTime(musicOn ? (talking ? .6 : .95) : 0, ac.currentTime, .4);
  const T = THEMES[ST.cur]; if (!T || !ST.gain) return;
  const sp = 60 / T.bpm / 4;
  if (ST.next < ac.currentTime - 1) ST.next = ac.currentTime + .05; // tab was asleep
  while (ST.next < ac.currentTime + .2) { stStep(T, ST.step, ST.next, sp); ST.step++; ST.next += sp; }
}
function stStep(T, i, t, sp) {
  const s = i % 16, ch = T.chords[Math.floor(i / 16) % T.chords.length], out = ST.gain;
  if (s === 0 && T.pad) ch.forEach(n => stPad(mtof(n), t, sp * 16, T.pad, out));
  if (s === 0 && T.trem) stTrem(mtof(ch[ch.length - 1] + 12), t, sp * 16, T.trem, out);
  if (T.arp) { const k = T.arp[s]; if (k >= 0) stPluck(mtof(ch[k % ch.length] + T.arpOct + (k >= ch.length ? 12 : 0)), t, T.arpVol, out); }
  if (T.bass && T.bass.includes(s)) stBass(mtof(ch[0] - 12), t, T.bass.length > 2 ? sp * 2 : sp * 12, out);
  if (T.kick && T.kick[s] === 'x') stKick(t, out);
  if (T.snare && T.snare[s] === 'x') stNoise(t, .16, 1800, 'bandpass', .09, out);
  if (T.hat && T.hat[s] === 'x') stNoise(t, .04, 8000, 'highpass', T.hatVol || .02, out);
}
function stEnv(g, t, a, peak, d) { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); }
function stPluck(f, t, v, out) { const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 2600; stEnv(g, t, .005, v, .9); o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + 1); }
function stPad(f, t, dur, v, out) {
  const lp = ac.createBiquadFilter(), g = ac.createGain(); lp.type = 'lowpass'; lp.frequency.value = 900;
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + dur * .35); g.gain.linearRampToValueAtTime(.0001, t + dur * 1.05); lp.connect(g); g.connect(out);
  [-7, 7].forEach(c => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = c; o.connect(lp); o.start(t); o.stop(t + dur * 1.1); });
}
function stTrem(f, t, dur, v, out) {
  const o = ac.createOscillator(), g = ac.createGain(), am = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(), lp = ac.createBiquadFilter();
  o.type = 'sawtooth'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 1500; lfo.frequency.value = 6.5; lg.gain.value = .5; am.gain.value = .5; lfo.connect(lg); lg.connect(am.gain);
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + .4); g.gain.linearRampToValueAtTime(.0001, t + dur);
  o.connect(lp); lp.connect(am); am.connect(g); g.connect(out); o.start(t); lfo.start(t); o.stop(t + dur + .1); lfo.stop(t + dur + .1);
}
function stBass(f, t, dur, out) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f; stEnv(g, t, .01, .22, dur); o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .1); }
function stKick(t, out) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + .12); stEnv(g, t, .003, .5, .3); o.connect(g); g.connect(out); o.start(t); o.stop(t + .35); }
function stNoise(t, d, f, type, v, out) { const sN = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); sN.buffer = ST.nb; fl.type = type; fl.frequency.value = f; stEnv(g, t, .002, v, d); sN.connect(fl); fl.connect(g); g.connect(out); sN.start(t, Math.random() * .5); sN.stop(t + d + .05); }
function setMusic(on) { musicOn = on; $('#music').checked = on; try { localStorage.setItem('slop-music', on ? '1' : '0'); } catch (e) {} }
function droneTo(vol, pitch) { if (!drone) return; const t = ac.currentTime; drone.g.gain.setTargetAtTime(vol, t, 1.2); drone.o1.frequency.setTargetAtTime(pitch, t, 2); drone.o2.frequency.setTargetAtTime(pitch * 1.012, t, 2); }
