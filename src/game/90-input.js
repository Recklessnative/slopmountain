/* ================= input ================= */
const keys = {};
function actionKey() {
  if (phase === 'peak' && S.ringing) return answerPhone();
  if (phase === 'drive') return exitCar();
  if (phase === 'lms') return lmsAction();
  if (phase === 'desk' && nearDesk()) return dive();
  if (phase === 'screen') return genClick();
  if (phase === 'tool' || phase === 'super') generate();
  else if (phase === 'talk') talk();
}
/* keyboard layouts: AZERTY walks with Z Q S D. Physical key positions always work too. */
const LAYOUTS = { qwerty: { f: 'w', l: 'a', b: 's', r: 'd' }, azerty: { f: 'z', l: 'q', b: 's', r: 'd' } };
let layout = 'qwerty';
function setLayout(v, save) {
  layout = LAYOUTS[v] ? v : 'qwerty'; const L = LAYOUTS[layout];
  $('#kbMove').textContent = [L.f, L.l, L.b, L.r].join(' ').toUpperCase(); promptMemo = null;
  document.querySelectorAll('input[name="kb"]').forEach(i => i.checked = i.value === layout);
  if (save) try { localStorage.setItem('slop-kb', layout); } catch (e) {}
}
(() => {
  let saved = null; try { saved = localStorage.getItem('slop-kb'); } catch (e) {}
  if (saved) return setLayout(saved);
  const lang = (navigator.language || '').toLowerCase();
  setLayout(lang.startsWith('fr') || lang === 'nl-be' ? 'azerty' : 'qwerty');
  if (navigator.keyboard && navigator.keyboard.getLayoutMap) navigator.keyboard.getLayoutMap().then(m => { const q = m.get('KeyQ'); if (q === 'a') setLayout('azerty'); else if (q === 'q') setLayout('qwerty'); }).catch(() => {});
})();
document.querySelectorAll('input[name="kb"]').forEach(i => i.addEventListener('change', () => setLayout(i.value, true)));
const codes = {};
addEventListener('keydown', e => {
  if (!$('#title').hidden || !$('#ending').hidden) return;
  const k = e.key.toLowerCase(), dk = /^(?:Digit|Numpad)(\d)$/.exec(e.code || '');
  codes[e.code] = true;
  const ck = choiceKeys && (choiceKeys[k] || (dk && choiceKeys[dk[1]]));
  if (ck) { e.preventDefault(); ck(); return; }
  if ((k === ' ' || k === 'enter') && skipLine) { e.preventDefault(); skipLine(); return; }
  if (k === 'e' && !e.repeat) actionKey();
  keys[k] = true; S.idleT = 0;
  if (k === 'm' && phase === 'screen') { focusWin(S.win === 'mail' ? 'craft' : 'mail'); return; }
  if (k === 'n') { setMusic(!musicOn); return; }
  if (k === 'c' && phase === 'lms' && !frozen && !e.repeat) { L.crouch = !L.crouch; noise(.08, 300, .03); return; }
  if (k === 'f' && phase === 'lms' && !e.repeat) { closePop(); return; }
  if (k === 'g') { ps1 = !ps1; $('#ps1').checked = ps1; applyLook(); }
  if (k === 'v') { voiceOn = !voiceOn; $('#voice').checked = voiceOn; if (!voiceOn && synth) synth.cancel(); }
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; codes[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; for (const c in codes) codes[c] = false; });
const cv = renderer.domElement; let dragging = false;
function lock() { if (!isTouch && !frozen && !document.pointerLockElement && cv.requestPointerLock) { try { const p = cv.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} } }
cv.addEventListener('mousedown', () => { dragging = true; lock(); });
addEventListener('mouseup', () => dragging = false);
addEventListener('mousemove', e => { if (!frozen && (document.pointerLockElement === cv || dragging)) look(e.movementX, e.movementY, .0024); });
function look(dx, dy, s) { player.yaw -= dx * s; player.pitch = Math.max(-1.35, Math.min(1.35, player.pitch - dy * s)); }
const touch = { move: null, look: null, mx: 0, my: 0 };
if (isTouch) {
  $('#touch').hidden = false;
  cv.addEventListener('touchstart', e => { for (const t of e.changedTouches) { if (t.clientX < innerWidth / 2 && !touch.move) touch.move = { id: t.identifier, x: t.clientX, y: t.clientY }; else if (!touch.look) touch.look = { id: t.identifier, x: t.clientX, y: t.clientY }; } S.idleT = 0; e.preventDefault(); }, { passive: false });
  cv.addEventListener('touchmove', e => { for (const t of e.changedTouches) {
    if (touch.move && t.identifier === touch.move.id) { touch.mx = Math.max(-1, Math.min(1, (t.clientX - touch.move.x) / 45)); touch.my = Math.max(-1, Math.min(1, (t.clientY - touch.move.y) / 45)); }
    if (touch.look && t.identifier === touch.look.id) { if (!frozen) look(t.clientX - touch.look.x, t.clientY - touch.look.y, .005); touch.look.x = t.clientX; touch.look.y = t.clientY; }
  } e.preventDefault(); }, { passive: false });
  const end = e => { for (const t of e.changedTouches) { if (touch.move && t.identifier === touch.move.id) { touch.move = null; touch.mx = touch.my = 0; } if (touch.look && t.identifier === touch.look.id) touch.look = null; } };
  cv.addEventListener('touchend', end); cv.addEventListener('touchcancel', end);
  const tg = $('#tGen');
  tg.addEventListener('pointerdown', e => { e.preventDefault(); keys.e = true; S.idleT = 0; actionKey(); });
  $('#tCrouch').addEventListener('pointerdown', e => { e.preventDefault(); if (phase === 'lms' && !frozen) L.crouch = !L.crouch; });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => tg.addEventListener(ev, () => keys.e = false));
}
function refreshPrompt() {
  let p = '', btn = '';
  const K = s => isTouch ? '' : `<kbd>${s}</kbd>`;
  if ((frozen && !(phase === 'peak' && S.ringing)) || S.ended) p = '';
  else if (phase === 'drive') { if (S.parked && !S.exitT) { p = `${K('E')}get out of the car`; btn = 'Get out'; } }
  else if (phase === 'street') p = S.listening ? '' : (isTouch ? 'Walk to the office door' : `${K(LAYOUTS[layout].f.toUpperCase())}walk to the office door`);
  else if (phase === 'desk') { if (nearDesk()) { p = `${K('E')}sit down and work`; btn = 'Work'; } else p = S.said.screen ? 'Walk back to the desk' : 'Walk to Kim’s desk, straight ahead'; }
  else if (phase === 'screen') p = '';
  else if (phase === 'tool') { p = `${K('E')}generate with AI`; btn = 'Generate'; }
  else if (phase === 'super') { p = `auto-generating · ${K('E')}even more`; btn = 'Generate'; }
  else if (phase === 'lms') {
    const n = nearNote(), c = L.qs.length && nearComp(), sc = nearScreen(), hid = lmsHidden();
    if (n) { p = `${K('E')}pick up the note`; btn = 'Pick up'; }
    else if (c) { p = `${K('E')}ask it a real question`; btn = 'Ask'; }
    else if (sc) { p = `${K('E')}switch off the screen`; btn = 'Switch off'; }
    else p = hid ? 'hidden under the desk' : L.crouch ? `crouching · ${K('C')}stand up` : `${K('C')}crouch · ${K('Shift')}run`;
    if (L.pops.length) p += ` · ${K('F')}close the pop-up`;
  }
  else if (phase === 'peak' && S.ringing) { p = `${K('E')}answer the phone`; btn = 'Answer'; }
  else if (phase === 'talk' && talker) { if (nearTalker()) { p = `${K('E')}talk to ${TALKS[S.talkIdx].who}`; btn = 'Talk'; } else p = `Walk over to ${TALKS[S.talkIdx].who}`; }
  setPrompt(p);
  $('#skip').hidden = !skipLine || !$('#ending').hidden;
  const tg = $('#tGen'); tg.hidden = !(isTouch && btn); if (btn && tg.textContent !== btn) tg.textContent = btn;
}
