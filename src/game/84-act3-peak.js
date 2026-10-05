/* ================= act 3: peak slop ================= */
function peak() {
  soundtrack('peak');
  phase = 'peak'; S.auto = false; frozen = true; S.toPeak = true;
  for (let i = paperCount - 1; i >= 0; i--) if (Math.hypot(pd.x[i] - C.x, pd.z[i] - C.z) < 4.5) { const j = paperCount - 1; for (const k in pd) pd[k][i] = pd[k][j]; paperCount--; }
  updatePapers();
  for (let i = 0; i < 200; i++) launchSheet('storm');
  noise(2.5, 600, .25); droneTo(.1, 160);
  $('#big').textContent = '“Oh God. Everything is crappy.”'; $('#big').classList.add('on');
  setTimeout(() => $('#big').classList.remove('on'), 3600);
  setTimeout(() => {
    flying.forEach(f => { if (f.mode === 'storm') { f.mode = 'land'; f.s.set(camera.position.x + Math.cos(f.ang) * f.rad, camera.position.y + f.hh, camera.position.z + Math.sin(f.ang) * f.rad); f.t = 0; f.dur = 2.5 + Math.random() * 2; } });
    droneTo(.03, 44); frozen = false;
    S.inbox.length = 0; renderInbox(); inboxEl.hidden = true;
    say([
      'Peak Slop.',
      'Five hundred and sixty-six courses. Nine hundred and six hours of content.'
    ], () => {
      showLearners(); $('#dTimeRow').hidden = false;
      say([
        'And down at the bottom, the people it was all for.',
        'They had about twelve minutes a week to learn anything. They spent most of it looking for the one course that mattered.',
        'Nobody had time to watch it. Nobody had time to even find it.'
      ], ringPhone);
    });
  }, 3800);
}
function showLearners() {
  buildLearners(); learners.visible = true;
  learners.children.forEach((f, i) => { f.scale.setScalar(.001); setTimeout(() => { f.userData.pop = true; blip(420 + i * 55, .18, .035); }, 300 + i * 420); });
}
function ringPhone() {
  S.ringing = true; phone.visible = true; $('#call').hidden = false; $('#callHint').textContent = isTouch ? 'tap Answer' : 'press E to answer';
  const r = () => { blip(440, .3, .06); setTimeout(() => blip(480, .3, .06), 380); noise(1.4, 1700, .05); };
  r(); S.ringIv = setInterval(r, 2000);
  say(['And then, from somewhere under all those courses, Kim’s phone rang.']);
  S.ringNag = setTimeout(() => { if (S.ringing) say(['The phone kept ringing. It was the only thing on the mountain that wanted something real.']); }, 14000);
}
function answerPhone() {
  if (!S.ringing) return;
  S.ringing = false; clearInterval(S.ringIv); clearTimeout(S.ringNag); phone.visible = false; $('#call').hidden = true; blip(880, .12, .05);
  const sam = t => ({ t, who: 'Sam, night shift' });
  say([
    sam('Hi, is this L&D? I’m Sam. I run the night shift at the warehouse.'),
    kim('Hi Sam. How can I help?'),
    sam('I’ve been assigned forty-seven courses. I’m not complaining. I just have one question nobody has answered.'),
    kim('Go on.'),
    sam('My new starters keep stacking pallets wrong on their first night. Is there a course for that? Because I couldn’t find it.'),
    kim('Could I come and watch a shift?'),
    sam('You’d do that? Nobody from head office has ever just asked.'),
    'Kim hung up and looked at the mountain. Not one of those courses would have helped Sam. One phone call had.'
  ], unlockTool);
}
function unlockTool() {
  $('#unlock').hidden = false; blip(660, .25, .05); setTimeout(() => blip(990, .5, .05), 160); setTimeout(() => blip(1320, .7, .04), 320);
  say(['Kim had stumbled on a new tool. It had no logo and no subscription. It checks whether something should be made, before anyone makes it.'], () => {
    $('#unlock').hidden = true;
    choose([
      { label: 'Use Actual Conversations', key: 'E', fn: startTalks },
      { label: 'Ignore it and keep generating', key: 'Q', fn: forever }
    ]);
  });
}
function forever() {
  soundtrack('super');
  phase = 'forever'; frozen = true; learners.visible = false;
  say(['Of course. Just a few more.']);
  let n = 0; const iv = setInterval(() => { S.generated += 3; H = Math.min(70, H + 1.6); R = Math.min(58, R + .6); for (let i = 0; i < 12; i++) launchSheet('storm'); for (let i = 0; i < 80; i++) { const [x, z] = randomSpot(R); addPaper(x, z); } updateTerrain(); updatePapers(); updateDash(); noise(.3, 2400, .08);
    if (++n > 16) { clearInterval(iv); setTimeout(() => ending('more'), 900); } }, 330);
}
