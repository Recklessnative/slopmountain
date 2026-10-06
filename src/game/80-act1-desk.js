/* ================= choices ================= */
let choiceKeys = null;
function choose(opts) {
  frozen = true; if (document.pointerLockElement) document.exitPointerLock();
  const box = $('#choices'); box.innerHTML = ''; box.hidden = false; choiceKeys = {};
  opts.forEach((o, i) => {
    const k = o.key || String(i + 1); const b = document.createElement('button'); b.className = 'choice'; b.type = 'button';
    b.innerHTML = `<kbd>${k}</kbd>`; b.appendChild(document.createTextNode(o.label));
    const run = () => { box.hidden = true; choiceKeys = null; frozen = false; o.fn(); };
    b.onclick = run; choiceKeys[k.toLowerCase()] = run; box.appendChild(b);
  });
  if (!isTouch) setTimeout(() => box.querySelector('button')?.focus({ preventScroll: true }), 50);
}
function ending(id) {
  if (S.ended) return; S.ended = true; soundtrack({ better: 'hope', more: 'super', completion: 'peak', mandatory: 'peak' }[id] || 'office'); frozen = true; sayToken++; if (synth) synth.cancel(); voStop();
  if (document.pointerLockElement) document.exitPointerLock();
  found.add(id); store.set('slop-endings-v2', [...found]);
  const E = ENDINGS[id];
  $('#eNum').textContent = `Ending ${ORDER.indexOf(id) + 1} of ${ORDER.length} · ${found.size} found`;
  $('#eTitle').textContent = E.title; $('#eText').textContent = E.text.replace('{n}', (coursesShown + 1).toLocaleString('en-GB'));
  $('#eLesson').textContent = E.lesson; renderFound($('#eFound')); droneTo(0, 55);
  setTimeout(() => {
    $('#ending').hidden = false; ['#cross', '#dash', '#inbox', '#tGen', '#craft', '#pc', '#guide', '#att', '#rq', '#vig', '#mvid', '#tCrouch'].forEach(s => $(s).hidden = true); L.pops.forEach(p => p.el.remove()); L.pops = []; subs.style.filter = '';
    $('#retry').hidden = id !== 'completion' && id !== 'mandatory'; $('#summit').hidden = !S.reachedFork; subs.classList.remove('boxed');
    $('#big').classList.remove('on'); setPrompt(''); subs.style.opacity = 0; $('#again').focus({ preventScroll: true });
  }, 900);
}

/* ================= act 1: the desk and the laptop ================= */
const TAGS = { receipts: 'receipts', mileage: 'mileage claims', price: 'price objections', opening: 'call openings', fb: 'hard feedback', meetings: 'running meetings' };
const PUZZLES = [
  { from: 'Finance', sender: 'Priya Desai', short: 'Expense claims course', subj: 'Expense claims keep bouncing',
    mail: ['Hi Kim,', 'Half the expense claims we get are rejected, and it is nearly always the receipt: wrong date, no VAT number, or a photo of a photo.', 'Mileage claims are fine, please leave those alone.', 'People will give this 12 minutes, tops.', 'Oh, and our CFO would love to record a welcome video. Your call.', 'Priya'],
    sol: ['Hi Kim,', 'We need a course on the new expense tool. Every screen, narrated, and a welcome video from our CFO.', 'Priya'],
    qs: [['What goes wrong with the claims today?', 'real'], ['How long should the course be?', 'plaus', 'Twelve minutes, tops. So, every screen?'], ['Shall I narrate every screen of the tool?', 'sol', 'Yes please! When can you start?']],
    ask: 'People keep getting their expense claims rejected.', topic: 'receipts', budget: 12, time: 150, result: 'Twelve people tried it. Rejected claims halved.',
    slots: [
      { name: 'Hook', opts: [['CFO welcome video', 6, 'fluff'], ['Story: Jan lost €40 to a missing receipt', 2, 'receipts'], ['Story: Ana’s mileage claim', 2, 'mileage']] },
      { name: 'Explain', opts: [['Every screen of the tool, narrated', 9, 'receipts'], ['History of the expense policy since 1998', 7, 'fluff'], ['The 3 receipt fields that get claims rejected', 3, 'receipts']] },
      { name: 'Practice', opts: [['File a test claim with a receipt', 5, 'receipts'], ['Calculate a mileage claim', 4, 'mileage'], ['Drag and drop: match the logos', 3, 'fluff']] },
      { name: 'Feedback', opts: [['Certificate of completion', 1, 'fluff'], ['See why your test claim would bounce', 2, 'any'], ['Happy sheet: rate this course 1 to 5', 1, 'fluff']] }] },
  { from: 'Sales', sender: 'Marco Bianchi', short: 'Price objections course', subj: 'New reps freeze on price',
    mail: ['Kim,', 'Our new reps open calls just fine. Where they go silent is the moment a customer says “that’s too expensive”.', 'They need something to say back, and they need to have said it out loud at least once before it happens for real.', 'They have 10 minutes between calls. Please, no catalogue tour. They hate it.', 'Marco'],
    sol: ['Kim,', 'The new reps need a sales course. The full product catalogue, start to finish.', 'Marco'],
    qs: [['Where exactly do the new reps get stuck?', 'real'], ['How much time do the reps have?', 'plaus', 'Ten minutes between calls. So, the catalogue?'], ['One catalogue module, or several?', 'sol', 'Several! Lots of modules.']],
    ask: 'New reps freeze when a customer says it’s too expensive.', topic: 'price', budget: 10, time: 110, result: 'Reps used the reply on real calls. Two stalled deals moved.',
    slots: [
      { name: 'Hook', opts: [['Sales VP keynote recording', 7, 'fluff'], ['Clip: a real call where price comes up', 2, 'price'], ['Clip: a great cold-call opening', 2, 'opening']] },
      { name: 'Explain', opts: [['How to open a call', 3, 'opening'], ['The 3-step reply to a price objection', 3, 'price'], ['Full product catalogue walkthrough', 9, 'fluff']] },
      { name: 'Practice', opts: [['Full-day price objection workshop', 8, 'price'], ['Role-play: “that’s too expensive”', 4, 'price'], ['Word search: sales vocabulary', 2, 'fluff']] },
      { name: 'Feedback', opts: [['Leaderboard of quiz scores', 1, 'fluff'], ['Manager listens in and gives one tip', 1, 'any'], ['Badge: Objection Ninja', 1, 'fluff']] }] },
  { from: 'HR', sender: 'Lotte Visser', short: 'Feedback course for team leads', subj: 'Team leads dodge the hard sentence',
    mail: ['Hi Kim,', 'Our new team leads run decent meetings. The trouble is one-on-ones: when feedback gets uncomfortable, they start talking about the weather.', 'We can free up 14 minutes in the leadership track.', 'Last year people loved the colour personality quiz. Maybe use that again?', 'Lotte'],
    sol: ['Hi Kim,', 'Our new team leads need a leadership course. Last year’s colour personality quiz was a hit. Start there?', 'Lotte'],
    qs: [['What do the team leads avoid, exactly?', 'real'], ['How many minutes can we have?', 'plaus', 'We can free up 14. So, the colour quiz?'], ['Which colour quiz did people like?', 'sol', 'The one with the animals! You’ll find it.']],
    ask: 'New team leads avoid the hard part of feedback in one-on-ones.', topic: 'fb', budget: 14, time: 90, result: 'Most team leads used the script in their next one-on-one.',
    slots: [
      { name: 'Hook', opts: [['Clip: a one-on-one that drifts into weather talk', 2, 'fb'], ['HR policy overview', 6, 'fluff'], ['Icebreaker game', 3, 'fluff']] },
      { name: 'Explain', opts: [['12 leadership models, compared', 12, 'fluff'], ['How to run a team meeting', 4, 'meetings'], ['A 4-line script for the hard sentence', 3, 'fb']] },
      { name: 'Practice', opts: [['Practise running a meeting', 6, 'meetings'], ['Personality quiz: what colour are you?', 3, 'fluff'], ['Practise the script with a peer', 6, 'fb']] },
      { name: 'Feedback', opts: [['Peer gives one “keep” and one “change”', 2, 'any'], ['Badge: Feedback Hero', 1, 'fluff'], ['Happy sheet: rate this course 1 to 5', 1, 'fluff']] }] }
];
const GEN_REVIEWS = [
  ['Priya Desai · Finance', 'Re: generated course #1', 'This has nothing to do with receipts. Also, a certificate? For expenses?'],
  ['Marco Bianchi · Sales', 'Re: generated course #2', 'The “engaging intro video” is eight minutes. My reps have ten. In total.'],
  ['Lotte Visser · HR', 'Re: generated course #3', 'Who asked for an AI summary of leadership? Nobody read it. I checked.'],
  ['Jan Peeters · Accounts payable', 'Re: generated course #4', 'I clicked Complete without reading it. Is that okay? Everyone did.']
];
const GENERATED = [['✦ Engaging intro video', 8], ['✦ Key concepts (AI summary)', 14], ['✦ Knowledge check quiz', 6], ['✦ Certificate of completion', 1]];
const POPUPS = [
  ['Course_final_v2_FINAL.scorm', 'Published to 4,000 learners.'], ['Translating…', 'Now in 14 languages, none checked.'], ['LMS', 'New learning path created: “Paths”.'],
  ['Analytics', 'Your course has 0 views. Generate a reminder?'], ['CourseGen', 'Shorter version generated. Also a longer one.'], ['Notifications (99+)', 'You have been assigned 3 courses you made.'],
  ['Podcast.mp3', 'AI voice reading the slides aloud.'], ['Quiz bank', '1,200 new questions. Answer: C.'], ['Calendar', 'Workshop: “Why is nobody learning?”'], ['CourseGen', 'Did you mean: more?']
];
function coldOpen() {
  phase = 'drive'; street.visible = true; frontDoor.rotation.y = 0; S.listening = true; S.doorT = 0; S.driveT = 0; S.parked = false; S.exitT = 0;
  const c = street.userData.car; c.userData.radio.intensity = .35; c.position.x = DRIVE_FROM; c.userData.door.rotation.y = 0;
  Object.assign(player, { yaw: -Math.PI / 2, pitch: -.1 }); driveCam(0);
  soundtrack('drive'); radioOn(); droneTo(0, 55);
  const radio = (t, fx) => ({ t, who: 'Car radio', fx });
  say([
    'This is the story of a learning designer named Kim.',
    'Every morning Kim drove to work through the fog. Every morning, the fog got there first.',
    radio('…and that fog is staying with us all week. Drive carefully out there.', staticBurst),
    radio('In business news: a start-up says its new AI tool can build a complete training course in eleven seconds.', staticBurst),
    radio('It’s called CourseGen. Companies can expect it any day now.'),
    radio('One analyst called it the end of boring training. Another simply called it the end of training.', staticBurst),
    { t: 'Kim switched off the radio. Eleven seconds. Her last course had taken three weeks.', fx: radioOff },
    'She didn’t think about it again. Not for a while.'
  ], () => { S.listening = false; });
}
function driveCam(dt) {
  const car = street.userData.car, u = car.userData, t = performance.now() / 1000;
  if (!S.parked) {
    S.driveT = Math.min(1, S.driveT + dt / 34 * (S.listening ? 1 : 3.5));
    car.position.x = DRIVE_FROM + (PARK_X - DRIVE_FROM) * (1 - Math.pow(1 - S.driveT, 2.2));
    if (S.driveT >= 1 && !S.listening) park();
  }
  u.wipers.forEach((w, i) => w.rotation.x = Math.PI / 2 - (S.parked ? 0 : (Math.sin(t * 1.7 + i * .2) * .5 + .5) * 1.25));
  const bob = S.parked ? 0 : Math.sin(t * 9) * .005 + Math.sin(t * 2.3) * .008;
  const sx = car.position.x - .15, sy = car.position.y + 1.28 + bob, sz = car.position.z - .38;
  if (S.exitT > 0) {
    S.exitT = Math.min(1, S.exitT + dt / 1.7); const k = S.exitT * S.exitT * (3 - 2 * S.exitT);
    u.door.rotation.y = -1.1 * Math.min(1, S.exitT * 3, (1 - S.exitT) * 5);
    player.x = sx + (EXIT.x - sx) * k; player.z = sz + (EXIT.z - sz) * k; player.y = sy + (1.7 - sy) * k;
    let dy = Math.atan2(-(0 - EXIT.x), -(8.5 - EXIT.z)) - player.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); player.yaw += dy * Math.min(1, dt * 2.5);
    if (S.exitT >= 1) { u.door.rotation.y = 0; noise(.35, 140, .16); phase = 'street'; player.y = 1.7; }
  } else { player.x = sx; player.y = sy; player.z = sz; }
}
function park() {
  if (S.parked) return; S.parked = true; noise(.8, 90, .1);
  say(['Kim parked where she always parked. Eight fifty-two, on the dot.']);
}
function exitCar() { if (phase !== 'drive' || !S.parked || S.exitT) return; S.exitT = .0001; noise(.3, 600, .07); blip(220, .08, .04); }
function enterOffice() {
  phase = 'desk'; S.doorShut = true; soundtrack('office'); noise(.5, 120, .14); setTimeout(() => { street.visible = false; }, 1200);
  intro();
}
function intro() {
  say([
    'Kim’s job was simple. When someone in the organisation had a problem, Kim made a course about it.',
    isTouch ? 'Tap Work at the desk to help Kim do the work.' : 'Press E at the desk to help Kim do the work.'
  ], () => { S.introDone = true; });
  droneTo(.02, 55); $('#dash').hidden = false; inboxEl.hidden = false; addRequest();
}
function nearDesk() { return Math.hypot(player.x - C.x, player.z - C.z) < 2.6; }
function dive() {
  if (phase !== 'desk' || frozen || S.dive) return;
  frozen = true; S.dive = .0001; noise(.6, 900, .05);
  if (document.pointerLockElement) document.exitPointerLock();
}
function enterScreen() {
  phase = 'screen'; S.dive = 0; ['#dash', '#inbox', '#cross', '#tGen'].forEach(q => $(q).hidden = true);
  const pc = $('#pc'); pc.classList.remove('out'); pc.hidden = false; $('#pcFrame').className = 'pc-frame'; $('#pcWins').innerHTML = '';
  $('#publish').hidden = false; $('#publish').disabled = false; $('#gen').hidden = !S.toolShown; $('#icoGen').hidden = !S.toolShown; subs.classList.add('boxed');
  trust(0); focusWin('mail');
  if (!S.said.itMail) { S.said.itMail = 1; mail({ from: 'IT Service Desk', subj: 'That AI course tool from the radio', kind: 'it', body: ['Hi all,', 'A few of you have asked about CourseGen, the tool from this morning’s radio. It is not approved yet.', 'Please don’t install anything. We will let you know.', 'IT Service Desk'] }, true); }
  if (!S.said.target) { S.said.target = 1; mail({ from: BOSS, subj: 'Q4: 40 courses', kind: 'it', body: ['Morning team,', `A reminder of where we stand. The target for this quarter is ${TARGET} courses. Kim, you are on ${coursesShown}.`, 'Every request has a due time. Our internal customers watch those closely, and so do I.', 'Performance reviews are on Friday.', 'Ruth'] }, true); }
  loadPuzzle(S.crafted % PUZZLES.length); frozen = false;
  if (!S.said.screen) { S.said.screen = 1; say(['Kim opened her mail first. Kim always opened her mail first.', 'Read the request, then build the course in CourseCraft. Switch between them on the taskbar.',
    'Every request arrived with its solution already attached. Kim could reply with a question first. Questions take time. So does building the wrong thing.', 'Kim could publish anything she liked. Her colleagues would let her know what they thought.', 'Every request came with a deadline. The clock in the corner only went one way.']); }
}
function loadPuzzle(i) {
  S.pz = i; S.sel = [null, null, null, null]; S.fails = 0;
  const P = PUZZLES[i];
  S.briefRead = false; S.budgetKnown = false; S.pending = false; S.openMail = null;
  if (S.briefFor !== i) {
    S.briefFor = i; S.dueStart = S.clock; S.due = S.clock + P.time; S.late = 0;
    const by = `I need it live by ${hhmm(S.due)}.`;
    mail({ from: `${P.sender} · ${P.from}`, subj: P.short, body: [...P.sol.slice(0, -1), by, P.sol[P.sol.length - 1]], full: [...P.mail.slice(0, -1), by, P.mail[P.mail.length - 1]], kind: 'brief', brief: i, qs: shuffle(P.qs.slice()) });
  }
  $('#due').hidden = false; renderDue();
  refreshBrief();
  $('#check').className = 'check'; $('#check').textContent = ''; $('#pcHint').textContent = isTouch ? 'Ask about the brief in Mail. Pick one card per column.' : 'Ask about the brief in Mail. Pick one card per column. M switches windows.';
  renderSlots(); renderReader();
}
/* one question back to the requester, twenty minutes each: the real one gets the whole story */
function askBrief(m, q) {
  if (S.pending || S.toolTaken || m.asking) return;
  const P = PUZZLES[m.brief], [text, kind, reply] = q; m.asking = true; m.qs = m.qs.filter(x => x !== q);
  S.clock += 20; renderDue(); blip(700, .08, .04);
  setTimeout(() => {
    m.asking = false; if (S.ended || phase !== 'screen') return;
    if (kind === 'real') { m.body = m.full; m.qs = []; m.asked = text; S.briefRead = true; asked(); sticky(text); }
    else { m.body = [...m.body, `You asked: “${text}”`, reply]; if (kind === 'plaus') S.budgetKnown = true; }
    m.unread = true; blip(1180, .08, .04); refreshBrief(); renderSlots(); renderReader(); renderPcInbox();
    if (kind === 'real' && !S.said.realQ) { S.said.realQ = 1; say(['There it was. The actual problem, hiding behind the solution. It usually is.']); }
    if (kind === 'sol' && !S.said.solQ) { S.said.solQ = 1; say(['Kim had asked about the solution. The solution was delighted. Twenty minutes, gone.']); }
  }, 900);
}
// every real question Kim asks gets counted, and the first ones end up stuck to her monitor
function asked() { S.questions++; const d = $('#dAsked'); if (d) d.textContent = S.questions; }
function sticky(text) { const b = $('#stickies'); if (!b || b.children.length >= 3) return; const n = document.createElement('div'); n.className = 'sticky'; n.textContent = text; n.style.transform = `rotate(${(Math.random() * 6 - 3).toFixed(1)}deg)`; b.appendChild(n); }
function refreshBrief() {
  const P = PUZZLES[S.pz];
  $('#briefFrom').textContent = 'Request from ' + P.from + ' · ' + P.sender; $('#briefText').textContent = P.short;
  $('#briefMeta').innerHTML = S.briefRead ? `Learner time, from the brief: <em>${P.budget} min</em>. The rest is in the email.` : S.budgetKnown ? `Learner time: <em>${P.budget} min</em>. The problem itself? <em>Nobody has said.</em>` : 'The request is a solution. <em>Reply with a question in Mail.</em>';
}
function renderSlots() {
  const P = PUZZLES[S.pz], box = $('#slots'); box.innerHTML = '';
  P.slots.forEach((sl, i) => {
    const col = document.createElement('div'); col.className = 'slot'; col.innerHTML = `<h5>${sl.name}</h5>`;
    sl.opts.forEach((o, j) => {
      const b = document.createElement('button'); b.type = 'button'; b.id = `card-${i}-${j}`; b.className = 'card' + (S.sel[i] === j ? ' on' : ''); b.setAttribute('aria-pressed', S.sel[i] === j);
      const t = document.createElement('span'); t.textContent = o[0]; const m = document.createElement('small'); m.textContent = `${o[1]} min`; b.append(t, m);
      b.onclick = () => { if (S.generating || S.toolTaken) return; S.sel[i] = S.sel[i] === j ? null : j; blip(620 + i * 90, .06, .03); renderSlots(); };
      col.appendChild(b);
    });
    box.appendChild(col);
  });
  const sum = S.sel.reduce((a, j, i) => a + (j === null ? 0 : P.slots[i].opts[j][1]), 0);
  setMeter(sum, S.briefRead || S.budgetKnown ? P.budget : null);
}
function setMeter(sum, budget) {
  if (budget == null) { $('#meterBar').style.width = Math.min(100, sum / 30 * 100) + '%'; $('#meter').classList.remove('over'); $('#meterTxt').textContent = `${sum} min learner time · budget in the brief`; return; }
  $('#meterBar').style.width = Math.min(100, sum / budget * 100) + '%';
  $('#meter').classList.toggle('over', sum > budget);
  $('#meterTxt').textContent = `${sum} of ${budget} min learner time`;
}
function publish() {
  if (phase !== 'screen' || S.generating || S.toolTaken || S.pending) return;
  const P = PUZZLES[S.pz], ck = $('#check'), who = P.sender.split(' ')[0], issues = [];
  if (S.sel.some(j => j === null)) { ck.className = 'check bad'; ck.innerHTML = '<b>CourseCraft</b>Every column needs a card before you can publish.'; noise(.15, 260, .04); return; }
  let sum = 0;
  P.slots.forEach((sl, i) => {
    const [t, m, tag] = sl.opts[S.sel[i]]; sum += m;
    if (tag === 'fluff') issues.push(`Everyone skipped “${t}”. Every single person.`);
    else if (tag !== 'any' && tag !== P.topic) issues.push(`“${t}” is about ${TAGS[tag]}. Our problem is ${TAGS[P.topic]}.`);
  });
  if (sum > P.budget) issues.push(`It takes ${sum} minutes. People have ${P.budget}.`);
  S.pending = true; $('#publish').disabled = true; blip(520, .12, .04);
  ck.className = 'check'; ck.innerHTML = '<b>Published to a pilot group · 20 min</b>Waiting to hear back from ' + who + '…';
  const t0 = S.clock, wasLate = S.clock > S.due, t1 = performance.now(), adv = () => { const k = Math.min(1, (performance.now() - t1) / 1500); S.clock = t0 + 20 * k; renderDue(); if (k < 1 && S.pending) requestAnimationFrame(adv); };
  requestAnimationFrame(adv);
  setTimeout(() => {
    if (S.ended || phase !== 'screen' || !S.pending) return;
    S.pending = false;
    if (issues.length) {
      S.fails++; const d = -5 * issues.length; trust(d); if (!wasLate && S.clock > S.due) setTimeout(() => { if (phase === 'screen' && !S.toolTaken) overdue(0); }, 2500);
      mail({ from: `${P.sender} · ${P.from}`, subj: 'Re: ' + P.subj, kind: 'bad', delta: d, body: ['Hi Kim,', 'We tried it with a few people. Honestly? Not yet.', issues, 'Can you have another go?', who] });
      ck.className = 'check bad'; ck.innerHTML = `<b>Pushback from ${who} · trust −${-d}</b>`; ck.appendChild(document.createTextNode('Read the reply in Mail, fix the course and publish again.'));
      $('#publish').disabled = false; noise(.25, 260, .06);
      if (!S.said.push) { S.said.push = 1; say(['The course came back. People had opinions. People usually do.']); }
      else if (S.fails >= 3 && !S.said.hint) { S.said.hint = 1; say(['The narrator would like to remind Kim that learners are busy people, and that practice beats pages.']); }
      return;
    }
    const onTime = !wasLate, gain = onTime ? 10 : 4; trust(gain); $('#due').hidden = true; $('#pcFrame').classList.remove('crunch');
    mail({ from: `${P.sender} · ${P.from}`, subj: 'Re: ' + P.subj, kind: 'good', delta: gain, body: onTime ? ['Kim,', P.result, 'This is exactly what we needed. And on time. Thank you.', who] : ['Kim,', P.result, 'It works. It was also late, and people noticed.', who] });
    ck.className = 'check good'; ck.innerHTML = `<b>${who} is happy · ${onTime ? 'on time' : 'late'} · trust +${gain}</b>`; ck.appendChild(document.createTextNode(P.result));
    blip(660, .2, .05); setTimeout(() => blip(990, .35, .05), 140);
    craftDone();
  }, 1700);
}
/* deadlines: the KimOS clock runs about one minute per second while Kim works */
const CLOCK_RATE = 1;
function renderDue() {
  const d = $('#due'), left = S.due - S.clock, total = S.due - S.dueStart || 1;
  d.className = 'due' + (left < 0 ? ' late' : left <= 12 ? ' crit' : left <= 35 ? ' soon' : '');
  const span = m => { m = Math.max(0, Math.ceil(m)); return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min` : `${m} min`; };
  $('#dueTxt').textContent = left < 0 ? `Overdue · ${span(-left)} late` : `Due ${hhmm(S.due)} · ${span(left)} left`;
  $('#dueBar').style.width = Math.max(0, Math.min(100, left / total * 100)) + '%';
  $('#pcFrame').classList.toggle('crunch', left <= 12 && !S.toolTaken);
  $('#pcClock').textContent = pcClock();
}
function dueTick(dt) {
  const before = S.due - S.clock; S.clock += dt * CLOCK_RATE; const left = S.due - S.clock;
  if (left <= 12 && left > 0) { S.tickT -= dt; if (S.tickT <= 0) { S.tickT = left <= 5 ? .5 : 1; blip(left <= 5 ? 2100 : 1800, .025, .02); } }
  if (before > 12 && left <= 12 && !S.said.crunch) { S.said.crunch = 1; say(['Twelve minutes left. The narrator is not panicking. The narrator would like that noted.']); }
  if (before >= 0 && left < 0) overdue(0);
  else if (left < 0) { const k = Math.floor(-left / 30); if (k > S.late) overdue(k); }
  renderDue();
}
function overdue(k) {
  S.late = k; const P = PUZZLES[S.pz], who = P.sender.split(' ')[0];
  if (k === 0) {
    S.missed++; trust(-5); noise(.3, 200, .07);
    mail({ from: `${P.sender} · ${P.from}`, subj: 'Re: ' + P.subj + ' · it’s ' + hhmm(S.clock), kind: 'bad', delta: -5, body: ['Kim,', `You said ${hhmm(S.due)}. It is ${hhmm(S.clock)}. My team is sitting here waiting.`, 'Any news?', who] });
    if (!S.said.late) { S.said.late = 1; say(['The deadline passed. Deadlines do that. Somewhere, a spreadsheet turned red.']); }
  } else if (k === 1 && !S.said.bossLate) {
    S.said.bossLate = 1; trust(-5);
    mail({ from: BOSS, subj: 'Turnaround times', kind: 'bad', delta: -5, body: ['Kim,', `${P.sender} has been on the phone. Twice.`, `We are at ${coursesShown} of ${TARGET} courses for the quarter. We can’t afford to be the team that’s always late.`, 'Let’s talk about it at your review on Friday.', 'Ruth'] });
  } else {
    trust(-3); toast(`${P.sender} · ${P.from}`, k % 2 ? 'Still waiting…' : 'Hello??');
  }
}
function laptopPos() { return new THREE.Vector3(C.x, 1.05, C.z + .05); }
function craftDone() {
  S.crafted++; clearRequest(); updateDash(); renderPcInbox(); $('#publish').disabled = true;
  for (let i = 0; i < 3; i++) launchSheet('land', laptopPos());
  const next = () => { $('#publish').disabled = false; loadPuzzle(S.crafted % PUZZLES.length); };
  if (S.refused && S.crafted >= 3) { say(['Kim kept building by hand. Every course was excellent. The inbox, meanwhile, reached the ceiling.'], () => ending('dinosaur')); return; }
  if (S.crafted === 1) say(['Shipped. In real life that took Kim three weeks. The narrator has compressed it, out of kindness.', 'The next request was already waiting.'], next);
  else if (S.crafted === 2) say(['Two good courses. Meanwhile the inbox had grown, the way inboxes do.'], showTool);
  else say(['Another good one. The inbox did not care.'], next);
}
function showTool() {
  if (S.toolShown) return; S.toolShown = true; tool.visible = true; $('#gen').hidden = false; $('#icoGen').hidden = false; focusWin('craft'); blip(1560, .4, .05);
  const m = { from: 'IT Service Desk', subj: '✦ CourseGen is now available to everyone', kind: 'it', body: ['Good news, everyone!', 'After a thorough review (eleven seconds), CourseGen is approved for all staff. You’ll find it on your desktop.', 'Make a course about anything. Instantly.', 'Happy generating!', 'IT Service Desk'] };
  mail(m); openMail(m); $('#due').hidden = true;
  setTimeout(() => { if (S.toolTaken || S.ended) return; mail(S.missed ? { from: BOSS, subj: 'Re: Turnaround times', kind: 'bad', body: ['Kim,', `Two courses in a morning, and late ones. We need ${TARGET - coursesShown} more by December.`, 'Look at the CourseGen email from IT. That’s not a suggestion.', 'Ruth'] } : { from: BOSS, subj: 'Nice work this morning', kind: 'good', body: ['Kim,', `Two good courses, both on time. Lovely. Only ${TARGET - coursesShown} to go.`, 'Have you seen the CourseGen email from IT? Just saying.', 'Ruth'] }); }, 2600);
  say(['And then the email came. The tool from the radio had arrived.', 'It promised a finished course in eleven seconds. It had sparkles on it.'], offerTool);
}
function offerTool() {
  choose([
    { label: 'Click Generate. Just once.', fn: takeTool },
    { label: 'Keep building by hand.', fn: () => { S.refused = true; $('#publish').disabled = false; loadPuzzle(2); say(['Kim ignored the button. The button did not take it personally. It stayed right there, sparkling.']); } }
  ]);
}
function takeTool() {
  soundtrack('gen');
  if (S.toolTaken) return;
  S.toolTaken = true; tool.visible = false; S.reqT = 2; droneTo(.04, 55);
  $('#publish').hidden = true; $('#due').hidden = true; $('#pcFrame').classList.remove('crunch'); $('#pcWins').innerHTML = ''; $('#pcHint').textContent = isTouch ? 'Tap Generate.' : 'Click Generate, or press E.';
  say(['Kim clicked it once. Just to see.']);
  genClick();
}
function popup(m, x, y) {
  const w = document.createElement('div'); w.className = 'win';
  w.style.left = (x ?? 5 + Math.random() * 70) + '%'; w.style.top = (y ?? 5 + Math.random() * 70) + '%';
  const h = document.createElement('header'); h.textContent = m[0]; const pp = document.createElement('p'); pp.textContent = m[1]; w.append(h, pp);
  const wins = $('#pcWins'); wins.appendChild(w); while (wins.children.length > 14) wins.firstChild.remove();
}
function genClick() {
  if (phase !== 'screen' || !S.toolTaken || S.generating || S.ended) return;
  S.generating = true; if (S.win !== 'craft') focusWin('craft');
  const r = S.inbox[0] || REQUESTS[S.reqIdx % REQUESTS.length];
  $('#briefFrom').textContent = 'Request from ' + r[0]; $('#briefText').textContent = r[1];
  const budget = 10 + (S.generated % 5); $('#briefMeta').innerHTML = `The problem: <em>unclear</em> · Learner time: <em>${budget} min</em>`;
  const box = $('#slots'); box.innerHTML = '';
  ['Hook', 'Explain', 'Practice', 'Feedback'].forEach((n, i) => {
    const col = document.createElement('div'); col.className = 'slot'; col.innerHTML = `<h5>${n}</h5>`;
    const c = document.createElement('div'); c.className = 'card gen on'; c.style.animationDelay = (i * .08) + 's';
    const t = document.createElement('span'); t.textContent = GENERATED[i][0]; const m = document.createElement('small'); m.textContent = `${GENERATED[i][1]} min`; c.append(t, m); col.appendChild(c); box.appendChild(col);
  });
  setMeter(29, budget);
  const ck = $('#check'); ck.className = 'check bad'; ck.innerHTML = '<b>Learner check: skipped</b>'; ck.appendChild(document.createTextNode('There was no time. Published anyway ✓'));
  noise(.25, 3200, .05);
  setTimeout(() => { S.generating = false; generate(); }, 650);
}
function haywire() {
  if (S.haywire) return; S.haywire = true; S.auto = false;
  $('#pcFrame').className = 'pc-frame haywire'; for (let i = 0; i < 8; i++) setTimeout(() => popup(POPUPS[Math.floor(Math.random() * POPUPS.length)]), i * 120);
  noise(1.6, 500, .18); droneTo(.08, 90);
  say(['Kim looked up from the screen. Something was wrong.'], exitScreen);
}
function exitScreen() {
  const pc = $('#pc'); pc.classList.add('out'); subs.classList.remove('boxed');
  setTimeout(() => {
    pc.hidden = true; phase = 'tool'; frozen = false; S.fountain = 1; S.auto = true; S.autoT = .3;
    Object.assign(player, { x: C.x, z: C.z + 2.6, yaw: 0, pitch: -.12 });
    $('#dash').hidden = false; inboxEl.hidden = false; $('#cross').hidden = isTouch; renderInbox();
    noise(1.2, 1800, .14);
    say(['The floor had disappeared under paper.', 'And the laptop was not stopping.']);
  }, 480);
}
