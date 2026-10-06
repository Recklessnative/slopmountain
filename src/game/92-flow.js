/* ================= start / restart ================= */
$('#voice').addEventListener('change', e => { voiceOn = e.target.checked; });
$('#ps1').addEventListener('change', e => { ps1 = e.target.checked; applyLook(); });
$('#music').checked = musicOn; $('#music').addEventListener('change', e => setMusic(e.target.checked));
try { if (localStorage.getItem('slop-ps1') === '0') { ps1 = false; $('#ps1').checked = false; } } catch (e) {}
function setupScene() {
  $('#pc').hidden = true; $('#pcWins').innerHTML = ''; $('#gen').hidden = true; $('#icoGen').hidden = true; $('#toast').hidden = true; S.briefFor = -1; $('#dTrust').textContent = '60'; $('#dTrust').className = ''; $('#pcTrust').textContent = '60'; $('#publish').hidden = false; subs.classList.remove('boxed'); $('#guide').hidden = true; S.haywire = false;
  clearInterval(S.ringIv); clearTimeout(S.ringNag); phone.visible = false; $('#call').hidden = true; $('#unlock').hidden = true;
  H = 0; R = 7; paperCount = 0; flying.length = 0; flyers.count = 0; updateTerrain(); updatePapers();
  officeFloor.visible = officeWalls.visible = deskG.visible = true; officeWalls.scale.set(1, 1, 1); deskG.scale.set(1, 1, 1);
  for (const q of sparks) world.remove(q.sp); sparks.length = 0; while (crowd.children.length) { const c = crowd.children[0]; removeTags(x => x.obj === c); const k = people.indexOf(c); if (k >= 0) people.splice(k, 1); crowd.remove(c); }
  sun.intensity = .32; sun.color.setHex(0xd8d4c8); scene.fog.near = (ps1 ? FOG.ps1 : FOG.clean)[1];
  tool.visible = false; bulb.visible = false; bulbLight.intensity = 0; screenOld.visible = true; screenNew.visible = false; learners.visible = false;
  removeTalker(); removeTags(() => true); learners.children.slice().forEach(c => { const k = people.indexOf(c); if (k >= 0) people.splice(k, 1); }); learners.clear();
  Object.assign(player, { x: 0, z: 1.1, yaw: 0, pitch: -.18, y: 1.7 }); musicStop(); radioOff(); street.visible = false; if (frontDoor) frontDoor.rotation.y = 0; S.doorShut = false;
  $('#stickies').innerHTML = ''; $('#dAsked').textContent = '0'; $('#dBehav').textContent = 'not tracked'; $('#dBehav').className = 'muted'; inboxEl.querySelectorAll('.req').forEach(n => n.remove()); S.inbox = []; renderInbox(); $('#dTimeRow').hidden = true;
  clearFork(); clearWalkers(); L.ckpt = null; resetLMS(); lms.visible = false; world.visible = true; hemi.intensity = .62; flash.distance = 30; subs.style.filter = ''; $('#fade').style.background = ''; $('#tCrouch').hidden = true;
}
function begin() {
  audioInit(); if (ac && ac.state === 'suspended') ac.resume(); if (voiceOn) warmVoice();
  $('#title').hidden = true; $('#cross').hidden = isTouch;
  setupScene(); frozen = false; lock(); updateDash(); coldOpen();
}
$('#begin').addEventListener('click', begin);
$('#publish').addEventListener('click', publish);
$('#tMail').addEventListener('click', () => focusWin('mail')); $('#tCraft').addEventListener('click', () => focusWin('craft'));
$('#icoMail').addEventListener('click', () => focusWin('mail')); $('#icoCraft').addEventListener('click', () => focusWin('craft'));
$('#icoGen').addEventListener('click', () => { focusWin('craft'); $('#gen').click(); });
$('#wMail').addEventListener('pointerdown', () => S.win !== 'mail' && focusWin('mail')); $('#wCraft').addEventListener('pointerdown', () => S.win !== 'craft' && focusWin('craft'));
document.querySelectorAll('.tbx').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); minWin(b.dataset.min); }));
$('#gen').addEventListener('click', () => { if (!S.toolTaken) { if (choiceKeys) { $('#choices').hidden = true; choiceKeys = null; } takeTool(); } else genClick(); });
$('#voiceTest').addEventListener('click', () => {
  const res = $('#voiceRes'); audioInit(); if (ac && ac.state === 'suspended') ac.resume();
  const rec = voLoad({ t: 'This is the narrator. Kim cannot hear me, but you can.' });
  if (rec) { res.textContent = 'Loading the narrator…'; rec.then(buf => { if (buf) { voStop(); voPlay(buf, '', () => { voSrc = null; }); res.textContent = 'Playing the narrator. Check your volume if you hear nothing.'; } else res.textContent = 'The recording didn’t load. The game still works with subtitles.'; }); return; }
  if (!synth) { res.textContent = 'This browser has no speech support.'; return; }
  warmVoice(); res.textContent = 'Listening…';
  const u = new SpeechSynthesisUtterance('This is the narrator. Kim cannot hear me, but you can.'); if (voice) { u.voice = voice; u.lang = voice.lang; } u.pitch = .8; u.rate = .95;
  let ok = false; u.onstart = () => { ok = true; voiceOK = true; res.textContent = voice ? `Playing: ${voice.name}` : 'Playing.'; };
  setTimeout(() => { try { synth.speak(u); } catch (e) {} }, 90);
  setTimeout(() => { if (!ok) res.textContent = 'No voice came through. The game still works with subtitles.'; }, 2800);
});
$('#skip').addEventListener('click', () => { if (skipLine) skipLine(); });
$('#retry').addEventListener('click', () => {
  // back to the start of the LMS, keeping everything that happened before it
  $('#ending').hidden = true; S.ended = false; $('#fade').classList.add('on');
  setTimeout(() => { $('#fade').style.background = ''; enterLMS(true); $('#fade').classList.remove('on'); }, 700);
});
$('#summit').addEventListener('click', () => {
  // every ending after the peak can go back and take the other road
  $('#fade').classList.add('on');
  setTimeout(() => { returnToSummit(); $('#fade').classList.remove('on'); }, 700);
});
$('#again').addEventListener('click', () => {
  $('#ending').hidden = true; resetState(); $('#fade').classList.add('on');
  setTimeout(() => { setupScene(); frozen = false; updateDash(); $('#fade').classList.remove('on'); $('#cross').hidden = isTouch; titleFound(); coldOpen(); }, 700);
});
