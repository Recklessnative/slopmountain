/* ---- KimOS: windows, mail, trust ---- */
function focusWin(name) {
  S.win = name;
  [['mail', '#wMail', '#tMail'], ['craft', '#wCraft', '#tCraft']].forEach(([n, w, t]) => {
    $(w).classList.toggle('front', n === name); if (n === name) $(w).classList.remove('min'); $(t).classList.toggle('on', n === name && !$(w).classList.contains('min'));
  });
}
function minWin(name) { $(name === 'mail' ? '#wMail' : '#wCraft').classList.add('min'); $(name === 'mail' ? '#tMail' : '#tCraft').classList.remove('on'); }
function hhmm(t) { const m = Math.floor(t) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
function pcClock() { return hhmm(S.clock + S.generated * 4); }
const TARGET = 40, BOSS = 'Ruth Jansen · Head of L&D';
function renderPcInbox() {
  $('#pcClock').textContent = pcClock();
  const unread = S.mails.filter(m => m.unread).length + S.inbox.filter(r => !r.read).length, u = unread > 99 ? '99+' : String(unread);
  $('#pcCount').textContent = u; $('#mailBadge').textContent = u; $('#mailBadge').hidden = !unread;
  const list = $('#mailList'); if (!list) return; list.innerHTML = '';
  const reqs = S.inbox.slice(0, 14).map(r => (r.mail = r.mail || { from: r[0], subj: r[1], body: ['Hi Kim,', r[1], 'Could you make a course on this? Thanks!'], kind: 'req', req: r }));
  [...S.mails.slice(0, 40), ...reqs].forEach(m => {
    const li = document.createElement('li'), b = document.createElement('button'); b.type = 'button';
    const unreadM = m.req ? !m.req.read : m.unread;
    b.className = `mi ${m.kind || ''}${unreadM ? ' unread' : ''}${S.openMail === m ? ' sel' : ''}`;
    const f = document.createElement('span'); f.className = 'mf'; f.textContent = m.from; const sj = document.createElement('span'); sj.className = 'ms'; sj.textContent = m.subj;
    b.append(f, sj); b.onclick = () => openMail(m); li.appendChild(b); list.appendChild(li);
  });
}
function openMail(m) {
  if (m.req) m.req.read = true; else m.unread = false;
  S.openMail = m; focusWin('mail'); blip(880, .04, .02);
  renderReader(); renderPcInbox();
}
function renderReader() {
  const a = $('#mailRead'), m = S.openMail; a.innerHTML = '';
  if (!m) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'Select a message to read it.'; a.appendChild(p); return; }
  const h = document.createElement('header'), t = document.createElement('b'); t.textContent = m.subj; h.append(t, document.createTextNode('From: ' + m.from)); a.appendChild(h);
  m.body.forEach(x => {
    if (Array.isArray(x)) { const ul = document.createElement('ul'); x.forEach(i => { const li = document.createElement('li'); li.textContent = i; ul.appendChild(li); }); a.appendChild(ul); }
    else { const p = document.createElement('p'); p.textContent = x; a.appendChild(p); }
  });
  if (m.kind === 'brief' && m.brief === S.pz && m.qs && m.qs.length && !S.toolTaken) {
    const bar = document.createElement('div'); bar.className = 'askbar'; const h = document.createElement('b'); h.textContent = m.asking ? 'Waiting for a reply…' : 'Reply with one question · 20 min'; bar.appendChild(h);
    if (!m.asking) m.qs.forEach(q => { const b = document.createElement('button'); b.type = 'button'; b.className = 'ask'; b.textContent = q[0]; b.onclick = () => { askBrief(m, q); renderReader(); }; bar.appendChild(b); });
    a.appendChild(bar);
  }
  if (m.delta) { const d = document.createElement('p'); d.className = 'delta' + (m.delta > 0 ? ' up' : ''); d.textContent = `Colleague trust ${m.delta > 0 ? '+' : '−'}${Math.abs(m.delta)}`; a.appendChild(d); }
}
function toast(title, text, m) {
  const t = $('#toast'); t.innerHTML = ''; const b = document.createElement('b'); b.textContent = title; t.append(b, document.createTextNode(text)); t.hidden = false;
  t.onclick = () => { t.hidden = true; if (m) openMail(m); else focusWin('mail'); };
  clearTimeout(S.toastT); S.toastT = setTimeout(() => t.hidden = true, 4200);
}
function mail(m, quiet) {
  m.unread = true; S.mails.unshift(m); if (S.mails.length > 120) S.mails.length = 120;
  if (!quiet) { toast('New mail · ' + m.from.split(' · ')[0], m.subj, m); blip(1180, .08, .04); setTimeout(() => blip(1480, .1, .03), 80); }
  renderPcInbox();
}
function trust(d) {
  if (S.trustGone) { $('#pcTrust').textContent = '?'; $('#dTrust').textContent = 'not tracked'; $('#dTrust').className = 'muted'; return; }
  S.trust = Math.max(0, Math.min(100, S.trust + d)); $('#pcTrust').textContent = S.trust; $('#dTrust').textContent = S.trust; $('#dTrust').className = '';
  if (d) { const f = document.createElement('span'); f.className = 'fl' + (d > 0 ? ' up' : ''); f.textContent = (d > 0 ? '+' : '−') + Math.abs(d); $('#tray').appendChild(f); setTimeout(() => f.remove(), 1900); }
}
function addRequest() { const b = REQUESTS[S.reqIdx++ % REQUESTS.length]; S.inbox.push([b[0], b[1]]); renderInbox(); blip(1040, .1, .04); setTimeout(() => blip(1320, .1, .03), 90); }
function clearRequest() { if (S.inbox.length) { S.inbox.shift(); renderInbox(); } }
