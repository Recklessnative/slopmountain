/* ================= narrator ================= */
let voiceOn = true, sayToken = 0, voice = null;
const synth = window.speechSynthesis;
function pickVoice() {
  if (!synth) return; const vs = synth.getVoices();
  voice = vs.find(v => /en-GB/i.test(v.lang) && /Daniel|Arthur|Oliver|George|Male/i.test(v.name)) || vs.find(v => /en-GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
}
if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }
const subs = $('#subs'); let subsHide = 0, typeTimer = 0;
function showLine(L) {
  speakingWho = L.who || null;
  clearTimeout(subsHide); clearInterval(typeTimer);
  subs.className = 'hud' + (L.who ? ' stake' : '') + (phase === 'screen' ? ' boxed' : ''); subs.style.opacity = 1; subs.innerHTML = '';
  if (L.fx) L.fx();
  if (L.who) { const w = document.createElement('span'); w.className = 'who'; w.textContent = L.who; subs.appendChild(w); }
  const span = document.createElement('span'); subs.appendChild(span);
  let i = 0; typeTimer = setInterval(() => { i += 2; span.textContent = L.t.slice(0, i); if (i >= L.t.length) clearInterval(typeTimer); }, 22);
}
let talking = false, voiceOK = false, voiceWarned = false;
function voiceMissing() { if (voiceWarned || !voiceOn) return; voiceWarned = true; const n = $('#voiceNote'); n.hidden = false; setTimeout(() => n.hidden = true, 9000); }
function warmVoice() { if (!synth) return; try { synth.cancel(); pickVoice(); const w = new SpeechSynthesisUtterance(' '); w.volume = 0; synth.speak(w); synth.resume(); } catch (e) {} }
/* recorded voices (neural TTS, rendered offline); the browser's own voice is only a fallback */
const VO = /*VO*/{}/*VO*/;
const voCache = {}; let voSrc = null;
const voLine = l => typeof l === 'string' ? { t: l } : l;
function voFile(L) { return VO[(L.who || '') + '|' + L.t]; }
function voLoad(L) {
  const f = voFile(L); if (!f || !ac) return null;
  if (!voCache[f]) voCache[f] = fetch(f).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(b => new Promise((res, rej) => ac.decodeAudioData(b, res, rej))).catch(() => null);
  return voCache[f];
}
function voStop() { if (voSrc) { try { voSrc.onended = null; voSrc.stop(); } catch (e) {} voSrc = null; } }
function voPlay(buf, who, onend) {
  const src = ac.createBufferSource(); src.buffer = buf; let out = ac.destination;
  if (who === 'Car radio' || who === 'Sam, night shift') { const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = who === 'Car radio' ? 1700 : 1400; bp.Q.value = who === 'Car radio' ? .8 : .5; const g = ac.createGain(); g.gain.value = 1.6; bp.connect(g); g.connect(ac.destination); out = bp; }
  src.connect(out); src.onended = onend; src.start(); voSrc = src;
}
let skipLine = null;
function say(lines, then) {
  const token = ++sayToken; if (synth && (synth.speaking || synth.pending)) synth.cancel(); voStop(); talking = true;
  if (voiceOn) lines.forEach(l => voLoad(voLine(l)));
  let i = 0;
  const next = () => {
    if (token !== sayToken) return;
    if (i >= lines.length) { talking = false; speakingWho = null; subsHide = setTimeout(() => subs.style.opacity = 0, 1600); if (then) then(); return; }
    const L = typeof lines[i] === 'string' ? { t: lines[i] } : lines[i]; i++;
    showLine(L);
    const dur = Math.max(2300, L.t.split(' ').length * 340 + 1000);
    let done = false; const fin = () => { if (done) return; done = true; skipLine = null; setTimeout(next, 320); };
    skipLine = () => { clearInterval(typeTimer); if (synth) synth.cancel(); voStop(); fin(); };
    const rec = voiceOn && ac ? voLoad(L) : null;
    if (rec) {
      let playing = false, gaveUp = false;
      const slow = setTimeout(() => { if (!playing) { gaveUp = true; setTimeout(fin, Math.max(0, dur - 2500)); } }, 2500);
      rec.then(buf => {
        if (token !== sayToken || done) return;
        if (!buf) { clearTimeout(slow); setTimeout(fin, dur); return; }
        if (playing || gaveUp) return; playing = true; clearTimeout(slow); voiceOK = true;
        voPlay(buf, L.who, () => { voSrc = null; fin(); });
      });
    } else if (voiceOn && synth) {
      const u = new SpeechSynthesisUtterance(L.t.replace(/[“”✦]/g, ''));
      if (!voice) pickVoice();
      if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-GB';
      u.rate = L.who === 'Car radio' ? 1.12 : L.who ? 1.06 : .95; u.pitch = L.who === 'Car radio' ? 1.05 : L.who === 'Kim' ? 1.15 : L.who ? 1.4 : .8; u.volume = L.who === 'Car radio' ? .75 : 1;
      let started = false;
      u.onstart = () => { started = true; voiceOK = true; };
      u.onend = fin; u.onerror = () => setTimeout(fin, started ? 300 : dur);
      setTimeout(() => { if (token !== sayToken || done) return; try { synth.resume(); synth.speak(u); } catch (e) { setTimeout(fin, dur); } }, 90);
      // if the browser never starts speaking, fall back to subtitle timing and say so once
      setTimeout(() => { if (started || done) return; setTimeout(fin, Math.max(0, dur - 2600)); if (!voiceOK) voiceMissing(); }, 2600);
      setTimeout(fin, dur * 2.6 + 2000);
    } else setTimeout(fin, dur);
  };
  next();
}
const kim = t => ({ t, who: 'Kim' }), them = (who, t) => ({ t, who });
