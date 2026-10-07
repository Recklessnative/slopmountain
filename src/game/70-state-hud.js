/* ================= state ================= */
const player = { x: 0, z: 1.1, yaw: 0, pitch: -.18, y: 1.7 };
let phase = 'title', frozen = true;
const S = {};
function resetState() {
  Object.assign(S, { idleT: 0, crafted: 0, craftProg: 0, toolShown: false, refused: false, generated: 0, inbox: [], reqT: 6, reqIdx: 0, auto: false, autoT: 0,
    said: {}, talkIdx: 0, wrong: 0, ended: false, dissolve: 0, fov: 70, toPeak: false, toDesk: false, dawn: 0, crane: 0, lineDone: false, sparksDone: false, crowned: false, sparksLeft: 0, deskStart: 0, toolT: 0, ringing: false, pz: 0, sel: [null, null, null, null], fails: 0, toolTaken: false, generating: false, dive: 0, fountain: 0, introDone: false, listening: false, doorT: 0, doorShut: false,
    mails: [], trust: 60, trustGone: false, bob: 0, bobAmt: 0, clock: 9 * 60 + 12, due: 0, dueStart: 0, late: 0, missed: 0, tickT: 0, briefRead: false, budgetKnown: false, pending: false, openMail: null, win: 'mail',
    lmsDeaths: 0, viaLMS: false, forkT: 0, forkLive: false, reachedFork: false, questions: 0, talkSkip: [], shrunk: 0, grown: 0, unresolved: 0, patience: 3, triedP: false });
}
resetState();
const found = new Set(store.get('slop-endings-v2', []));
function renderFound(el) { el.innerHTML = ORDER.map(k => `<li class="${found.has(k) ? 'got' : ''}">${found.has(k) ? ENDINGS[k].title : 'undiscovered'}</li>`).join(''); }
function titleFound() { $('#titleFound').textContent = found.size ? `Endings found so far: ${found.size} of ${ORDER.length}` : 'There are six endings. The narrator has a favourite.'; }
titleFound();

/* ================= HUD ================= */
let promptMemo = null;
function setPrompt(html) { if (html === promptMemo) return; promptMemo = html; $('#prompt').innerHTML = html || ''; }
function courses() { return 12 + S.crafted + S.generated * (phase === 'super' || S.generated > 30 ? 6 : 1); }
let coursesShown = 12;
function updateDash(n) { coursesShown = n ?? courses(); $('#dCourses').textContent = coursesShown.toLocaleString('en-GB'); $('#dHours').textContent = Math.round(coursesShown * 1.6).toLocaleString('en-GB');
  $('#dTarget').textContent = `${coursesShown.toLocaleString('en-GB')} / ${TARGET}`; $('#dTarget').className = coursesShown >= TARGET ? '' : 'muted'; $('#pcTarget').textContent = `${coursesShown.toLocaleString('en-GB')}/${TARGET}`; }
const inboxEl = $('#inbox');
function renderInbox() {
  $('#inCount').textContent = S.inbox.length; renderPcInbox();
  [...inboxEl.querySelectorAll('.req')].forEach(n => { if (!S.inbox.includes(n._req) && !n.classList.contains('out')) { n.classList.add('out'); setTimeout(() => n.remove(), 360); } });
  const shown = S.inbox.slice(0, 5);
  S.inbox.forEach(r => { if (r.el && !shown.includes(r)) { r.el.remove(); r.el = null; } });
  shown.forEach(r => { if (!r.el) { const d = document.createElement('div'); d.className = 'req'; d.innerHTML = `<small>${r[0]}</small>`; d.appendChild(document.createTextNode(r[1])); d._req = r; r.el = d; inboxEl.appendChild(d); } });
}
