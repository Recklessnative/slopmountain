/* ================= act 2: more, faster ================= */
function generate() {
  if (S.ended) return;
  if (phase !== 'tool' && phase !== 'super' && phase !== 'forever' && phase !== 'screen') return;
  S.generated++; clearRequest();
  const g = S.generated;
  if (phase === 'tool' || phase === 'screen') {
    H = Math.min(2.4, g * .085); R = 7 + Math.min(2, g * .06);
    for (let i = 0; i < 7; i++) launchSheet('land', laptopPos());
    for (let i = 0; i < 6; i++) { const [x, z] = randomSpot(R); addPaper(x, z); }
  } else {
    H = Math.min(44, 2.4 + (g - 30) * .7); R = Math.min(48, 9 + (g - 30) * .66);
    for (let i = 0; i < 10; i++) launchSheet('land');
    for (let i = 0; i < 85; i++) { const [x, z] = randomSpot(R); addPaper(x, z); }
  }
  updateTerrain(); updatePapers(); updateDash();
  noise(.3, 2400, .07); droneTo(.04 + Math.min(.07, g * .0015), 55 + g * .9);
  const lines = { 40: 'Kim could make a course about anything now. So Kim made a course about making courses.', 70: 'The completion rate stayed at one hundred percent. The narrator has questions about that number.', 82: 'Somewhere far below, a learner sighed. It was much too far away for Kim to hear.', 1: 'Eleven seconds. Kim felt something unfamiliar. Productivity.', 5: 'The narrator would like Kim to look at the floor. Kim did not look at the floor.', 10: 'Ten courses before lunch. The dashboard turned green. Nobody asked what it measured.', 22: 'Learners started skipping the videos, so Kim generated shorter videos. They skipped those too, but faster.', 55: 'From up here the requests looked tiny. So did the learners.' };
  if (phase !== 'forever' && lines[g]) say([lines[g]]);
  if (phase === 'screen') {
    if (g <= 4) { const [f, sj, t] = GEN_REVIEWS[g - 1]; trust(-6); mail({ from: f, subj: sj, kind: 'bad', delta: -6, body: ['Kim,', t] }, g > 2); }
    else mail({ from: 'LMS · automatic', subj: `Auto-approved: generated course #${g}`, kind: 'auto', body: ['Approved automatically. Nobody looked at it.'] }, true);
    if (g === 4) setTimeout(() => { mail({ from: 'Jordan Mills · Quality', subj: 'I give up', kind: 'bad', body: ['Kim,', 'I can’t review this many courses. Nobody can.', 'From now on I’m approving everything.', 'Jordan'] }); S.trustGone = true; trust(0); }, 500);
    if (g === 3) say(['The pushback piled up in Kim’s mail. Kim stopped opening it.']);
    renderPcInbox();
    if (g === 6 && !S.auto) { S.auto = true; S.autoT = 1.3; say(['Then Kim stopped clicking. The button clicked itself.']); }
    if (g >= 7) { popup(POPUPS[g % POPUPS.length]); $('#pcFrame').className = 'pc-frame shaky'; $('#pcFrame').style.setProperty('--j', Math.min(6, (g - 6) * .7).toFixed(1)); }
    if (g === 15) haywire();
  }
  if (g === 30 && phase === 'tool') otherworld();
  if (g === 92 && phase === 'super') peak();
}
function superpowers() {
  soundtrack('super');
  phase = 'super'; for (let i = 0; i < 40; i++) launchSheet('storm'); S.dissolve = .0001; S.reqT = .5;
  noise(2, 300, .2); droneTo(.09, 110);
  $('#big').textContent = 'MORE. FASTER.'; $('#big').classList.add('on'); setTimeout(() => $('#big').classList.remove('on'), 2600);
  say(['And then something strange happened. The office could no longer contain Kim’s output.', 'The desk was gone. The walls were gone. Kim had become pure throughput.', 'Kim rose with the mountain. Every course lifted Kim a little higher. It felt exactly like progress.']);
}
