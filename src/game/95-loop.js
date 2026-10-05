/* ================= loop ================= */
const clock = new THREE.Clock(), _dir = new THREE.Vector3(); let frameN = 0;
function step(dt) {
  if (phase === 'title') { const t = performance.now() / 9000; camera.position.set(Math.sin(t) * 6, 2.4, C.z + Math.cos(t) * 6); camera.lookAt(C.x, .9, C.z); return; }
  let mx = 0, mz = 0;
  if (!frozen && phase !== 'peak' && phase !== 'drive' && !S.listening) {
    const L = LAYOUTS[layout];
    if (keys[L.f] || codes.KeyW || keys.arrowup) mz -= 1; if (keys[L.b] || codes.KeyS || keys.arrowdown) mz += 1; if (keys[L.l] || codes.KeyA || keys.arrowleft) mx -= 1; if (keys[L.r] || codes.KeyD || keys.arrowright) mx += 1;
    mx += touch.mx; mz += touch.my;
  }
  const len = Math.hypot(mx, mz);
  let speed = phase === 'desk' || phase === 'tool' ? 3.4 : phase === 'street' ? 2.6 : 6.5; if (keys.shift) speed *= 1.6;
  if (len > .05) {
    mx /= Math.max(1, len); mz /= Math.max(1, len);
    const sin = Math.sin(player.yaw), cos = Math.cos(player.yaw);
    let dx = (mx * cos + mz * sin) * speed * dt, dz = (-mx * sin + mz * cos) * speed * dt;
    const h0 = hAt(player.x, player.z), h1 = hAt(player.x + dx, player.z + dz), slope = (h1 - h0) / (Math.hypot(dx, dz) || 1);
    if (slope > 0) { const f = 1 / (1 + slope * .5); dx *= f; dz *= f; }
    player.x += dx; player.z += dz; S.idleT = 0;
    const st = Math.floor(S.bob / Math.PI); S.bob += Math.hypot(dx, dz) * 2.3; S.bobAmt = Math.min(1, S.bobAmt + dt * 4);
    if (Math.floor(S.bob / Math.PI) !== st && phase !== 'drive' && phase !== 'screen') noise(.07, phase === 'street' ? 520 : 380, .035);
  } else S.bobAmt = Math.max(0, S.bobAmt - dt * 3);
  // act 1: idle ending, then the dive into the laptop
  if (phase === 'desk' && !frozen && S.introDone) { S.idleT += dt; if (S.idleT > 45) { frozen = true; say(['Kim did nothing at all. Someone else would, eventually.'], () => ending('idle')); } }
  if (S.dive > 0) {
    S.dive = Math.min(1, S.dive + dt / 1.5); const k = Math.min(1, dt * 3.2);
    player.x += (C.x - player.x) * k; player.z += (C.z + .85 - player.z) * k; player.yaw += (0 - player.yaw) * k; player.pitch += (-.2 - player.pitch) * k;
    if (S.dive >= 1) enterScreen();
  }
  if (S.fountain && deskG.visible && Math.random() < .5) launchSheet('land', laptopPos());
  // requests
  if ((phase === 'desk' && S.introDone) || phase === 'screen' || phase === 'tool' || phase === 'super') {
    S.reqT -= dt;
    if (S.reqT <= 0) { addRequest(); S.reqT = phase === 'desk' || (phase === 'screen' && !S.toolTaken) ? 9 : phase === 'tool' || phase === 'screen' ? Math.max(1.2, 4 - S.generated * .15) : .45; }
  }
  if (phase === 'screen' && !S.toolTaken && S.due && !frozen && !talking && !S.pending && !S.ended) dueTick(dt);
  if (phase === 'screen' && S.toolTaken && !S.auto && !S.haywire) { S.toolT += dt; if (S.toolT > 25) { S.auto = true; S.autoT = 0; say(['Then Kim stopped clicking. The button clicked itself.']); } }
  if (S.auto && (phase === 'tool' || phase === 'super' || phase === 'screen')) { S.autoT -= dt; if (S.autoT <= 0) { S.autoT = phase === 'super' ? 1.15 : phase === 'screen' ? 1.3 : 1.5; if (phase === 'screen') genClick(); else generate(); } }
  // superpowers: the office dissolves
  if (S.dissolve > 0 && S.dissolve < 1) {
    S.dissolve = Math.min(1, S.dissolve + dt / 2.6); const k = 1 - S.dissolve;
    officeWalls.scale.y = Math.max(.001, k); deskG.scale.set(Math.max(.001, k), Math.max(.001, k), Math.max(.001, k));
    if (S.dissolve >= 1) { S.fountain = 0; officeWalls.visible = false; deskG.visible = false; officeFloor.visible = false; }
  }
  const fovT = phase === 'super' ? 84 : (S.dive > 0 || phase === 'screen') ? 34 : 70; S.fov += (fovT - S.fov) * Math.min(1, dt * 1.5);
  if (Math.abs(camera.fov - S.fov) > .05) { camera.fov = S.fov; camera.updateProjectionMatrix(); }
  // the front door: it opens as Kim walks up, and closes behind her
  if (phase === 'street') {
    const atDoor = Math.abs(player.x) < 1.3 && player.z < 10.6;
    if (atDoor && S.doorT === 0) { S.doorT = .0001; noise(1.1, 420, .08); blip(140, .6, .04); }
    if (S.doorT > 0) S.doorT = Math.min(1, S.doorT + dt / 1.6);
    frontDoor.rotation.y = -1.45 * (S.doorT * S.doorT * (3 - 2 * S.doorT));
    player.x = Math.max(-9.4, Math.min(9.4, player.x)); player.z = Math.min(29, player.z);
    if (player.z < 9.2) { if (S.doorT < .7 || Math.abs(player.x) > .45) player.z = 9.2; }
    if (player.z < 8.1) enterOffice();
  } else if (S.doorShut && frontDoor.rotation.y < 0) frontDoor.rotation.y = Math.min(0, frontDoor.rotation.y + dt * 1.8);
  // bounds
  if (phase === 'street' || phase === 'drive') {}
  else if (officeWalls.visible) { player.x = Math.max(-9.5, Math.min(9.5, player.x)); player.z = Math.max(-11, Math.min(8, player.z)); }
  else { const dx = player.x - C.x, dz = player.z - C.z, d = Math.hypot(dx, dz), m = Math.max(12, R + 14); if (d > m) { player.x = C.x + dx / d * m; player.z = C.z + dz / d * m; } }
  if (deskG.visible && deskG.scale.x > .5 && !S.toDesk) { const lx = player.x - C.x, lz = player.z - C.z; if (Math.abs(lx) < 1.5 && Math.abs(lz) < .8) { if (Math.abs(lz) / .8 > Math.abs(lx) / 1.5) player.z = C.z + Math.sign(lz || 1) * .8; else player.x = C.x + Math.sign(lx || 1) * 1.5; } }
  if (S.toPeak) { player.pitch += (-.42 - player.pitch) * Math.min(1, dt * .8); player.x += (C.x - player.x) * Math.min(1, dt * .8); player.z += (C.z + .4 - player.z) * Math.min(1, dt * .8); if (Math.hypot(player.x - C.x, player.z - C.z - .4) < .1) S.toPeak = false; }
  if (S.toDesk) { player.x += (C.x - player.x) * Math.min(1, dt); player.z += (C.z + 1.7 - player.z) * Math.min(1, dt); player.yaw += (0 - player.yaw) * Math.min(1, dt); player.pitch += (-.2 - player.pitch) * Math.min(1, dt); }
  // shrinking animation
  if (shrinkAnim) {
    const a = shrinkAnim; a.t = Math.min(1, a.t + dt / a.dur); const e = a.t * a.t * (3 - 2 * a.t);
    H = a.fromH + (a.toH - a.fromH) * e;
    const targetP = Math.round(a.fromP + (a.toP - a.fromP) * e);
    while (paperCount > targetP) removePaper();
    for (let i = 0; i < 3; i++) if (paperCount) { const j = Math.floor(Math.random() * paperCount); launchSheet('away', new THREE.Vector3(pd.x[j], hAt(pd.x[j], pd.z[j]) + .3, pd.z[j])); }
    updateTerrain(); updatePapers(); updateDash(Math.round(a.fromC + (a.toC - a.fromC) * e));
    if (a.t >= 1) { shrinkAnim = null; a.done(); }
  }
  const h = hAt(player.x, player.z) + (phase === 'peak' ? 3 : 0), eye = (S.dive > 0 || phase === 'screen') ? 1.25 - 1.7 : 0;
  player.y += ((h + 1.7 + eye) - player.y) * Math.min(1, dt * 6);
  // a guide arrow towards whoever is waiting to talk
  const g = $('#guide');
  if (phase === 'talk' && talker && !frozen && !nearTalker() && !S.ended) {
    const dx = talker.position.x - player.x, dz = talker.position.z - player.z;
    let rel = Math.atan2(-dx, -dz) - player.yaw; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
    g.hidden = false; $('#guideArrow').style.transform = `rotate(${(-rel).toFixed(3)}rad)`;
    const t = `${TALKS[S.talkIdx].who} · ${Math.round(Math.hypot(dx, dz))} m`; if ($('#guideTxt').textContent !== t) $('#guideTxt').textContent = t;
  } else if (!g.hidden) g.hidden = true;
  if (phase === 'drive') driveCam(dt);
  const bobOn = phase !== 'drive' && phase !== 'screen' && !S.dive;
  camera.position.set(player.x, player.y + (bobOn ? (Math.abs(Math.sin(S.bob)) - .5) * .05 * S.bobAmt : 0), player.z);
  // in conversation, look the person in the face
  if (phase === 'talk' && talker && frozen && !shrinkAnim && nearTalker()) {
    const dx = talker.position.x - player.x, dz = talker.position.z - player.z, dy = talker.position.y + 1.72 - player.y, k = Math.min(1, dt * 2.5);
    let dyaw = Math.atan2(-dx, -dz) - player.yaw; dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw));
    player.yaw += dyaw * k; player.pitch += (Math.atan2(dy, Math.hypot(dx, dz)) - player.pitch) * k;
  }
  camera.rotation.set(player.pitch, player.yaw, Math.sin(S.bob) * .007 * S.bobAmt, 'YXZ');
  if (S.crane) {
    S.crane += dt; const t = Math.min(1, S.crane / 7), e = t * t * (3 - 2 * t), a = e * 1.3, r = 1.7 + e * 15;
    camera.position.set(C.x + Math.sin(a) * r, 1.7 + e * 11, C.z + Math.cos(a) * r); camera.lookAt(C.x, .9 - e * .6, C.z);
  }
  refreshPrompt();
}
function animate() {
  const dt = Math.min(.05, clock.getDelta());
  step(dt);
  if (tool.visible) { tool.position.y = .95 + Math.sin(performance.now() / 400) * .04; tool.rotation.y += dt; }
  for (let i = flying.length - 1; i >= 0; i--) {
    const f = flying[i];
    if (f.mode === 'storm') {
      f.ang += dt * f.sp; f.t += dt;
      _v.set(camera.position.x + Math.cos(f.ang) * f.rad, camera.position.y + f.hh + Math.sin(f.t * 2 + f.ang) * .6, camera.position.z + Math.sin(f.ang) * f.rad);
    } else if (f.mode === 'away') {
      f.t += dt / f.dur; if (f.t >= 1) { flying.splice(i, 1); continue; }
      _v.set(f.s.x + f.vx * f.t, f.s.y + f.t * f.t * 14, f.s.z + f.vz * f.t);
    } else {
      f.t += dt / f.dur;
      if (f.t >= 1) { if (phase !== 'title' && !S.ended && phase !== 'peak') addPaper(f.tx, f.tz); flying.splice(i, 1); continue; }
      const t = f.t, ty = hAt(f.tx, f.tz) + .2;
      _v.set(f.s.x + (f.tx - f.s.x) * t, f.s.y + (ty - f.s.y) * t + Math.sin(Math.PI * t) * f.arc, f.s.z + (f.tz - f.s.z) * t);
    }
    _e.set(f.t * f.spin, f.t * f.spin * .7, f.t * f.spin * .3, 'XYZ'); _q.setFromEuler(_e); _m.compose(_v, _q, _s); flyers.setMatrixAt(i, _m);
  }
  flyers.count = flying.length; flyers.instanceMatrix.needsUpdate = true;
  updatePeople(dt);
  if (crowd.children.length || sparks.length) updateFinale(dt);
  if (flicker) flicker.intensity = Math.random() < .04 ? .05 : .7;
  if (dust && officeWalls.visible) { const a = dust.geometry.attributes.position.array, b = dust.userData.base, tt = performance.now() / 1000; for (let i = 0; i < a.length; i += 3) { a[i] = b[i] + Math.sin(tt * .13 + i) * .35; a[i + 1] = b[i + 1] + Math.sin(tt * .09 + i * 1.7) * .25; a[i + 2] = b[i + 2] + Math.cos(tt * .11 + i * .7) * .35; } dust.geometry.attributes.position.needsUpdate = true; }
  if (street.visible) for (const m of wisps) { m.position.x += m.userData.v * dt; if (m.position.x > 22) m.position.x -= 190; m.rotation.y = Math.atan2(camera.position.x - m.position.x, camera.position.z - m.position.z); }
  for (const b of billboards) {
    if (b.userData.ground) b.position.y = hAt(b.position.x, b.position.z);
    const wp = b.getWorldPosition(_v);
    b.rotation.y = Math.atan2(camera.position.x - wp.x, camera.position.z - wp.z);
  }
  if (phone.visible) {
    const t = performance.now(); camera.getWorldDirection(_dir);
    phone.position.copy(camera.position).addScaledVector(_dir, .9); phone.position.y += -.1 + Math.sin(t / 300) * .02;
    phone.rotation.set(0, player.yaw, Math.sin(t / 45) * (Math.sin(t / 700) > 0 ? .12 : 0));
  }
  learners.children.forEach(f => { if (f.userData.pop && f.scale.x < LEARNER_SCALE - .01) f.scale.setScalar(Math.min(LEARNER_SCALE, f.scale.x + (LEARNER_SCALE - f.scale.x) * .12 + .01)); });
  if (phase === 'peak' && Math.random() < .25) { const [x, z] = randomSpot(R); launchSheet('land', new THREE.Vector3(x, H + 14 + Math.random() * 8, z)); }
  if (talker && talker.userData.mark.visible) talker.userData.mark.position.y = 2.6 + Math.sin(performance.now() / 300) * .08;
  // inside: dark office fog; outside (once the walls are gone): Silent Hill's pale grey
  const outside = !officeWalls.visible || S.dissolve > .3 || phase === 'street' || phase === 'drive';
  _fogC.copy(outside ? FOG_OUT : FOG_IN); scene.fog.color.lerp(_fogC, Math.min(1, dt * 1.2)); scene.background.copy(scene.fog.color);
  const wideP = phase === 'peak' || phase === 'talk' || phase === 'forever';
  const far = outside ? (wideP ? (ps1 ? 80 : 130) : (ps1 ? 55 : 110)) : (ps1 ? FOG.ps1[2] : FOG.clean[2]); scene.fog.far += (far - scene.fog.far) * Math.min(1, dt * 1.5);
  flash.intensity = phase === 'drive' ? .25 : outside ? .9 : 1.3;
  if (S.dawn) {
    S.dawn = Math.min(1, S.dawn + dt / 7); const k = S.dawn * S.dawn * (3 - 2 * S.dawn);
    scene.fog.color.copy(FOG_OUT).lerp(DAWN, k); scene.background.copy(scene.fog.color);
    scene.fog.far = 80 + 220 * k; scene.fog.near = 3 + 30 * k; sun.intensity = .32 + .9 * k; sun.color.setHex(0xd8d4c8).lerp(SUN_WARM, k); flash.intensity = .9 * (1 - k);
  }
  updateTags();
  if (ps1) {
    if ((frameN++ & 63) === 0) ps1Sweep();
    postMat.uniforms.time.value = performance.now() / 1000;
    renderer.setRenderTarget(rt); renderer.render(scene, camera); renderer.setRenderTarget(null); renderer.render(postScene, postCam);
  } else renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
