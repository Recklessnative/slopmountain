/* ================= boot ================= */
const fontsReady = document.fonts ? Promise.race([
  Promise.all(['400 60px "IM Fell English"', '400 20px "Special Elite"', '400 11px "JetBrains Mono"'].map(f => document.fonts.load(f))),
  new Promise(r => setTimeout(r, 2500))
]) : Promise.resolve();
$('#begin').disabled = true;
fontsReady.then(() => { applyLook(); buildPhone(); buildOffice(); buildStreet(); bake(officeWalls, officeAO); bake(officeFloor, officeAO); bake(deskG, officeAO); bake(street, streetAO); updateTerrain(); $('#begin').disabled = false; animate(); });
// test hook for automated playthroughs only
window.__slop = { get phase() { return phase; }, set phase(v) { phase = v; }, get people() { return people; }, get deskG() { return deskG; }, finale: () => finale(), get S() { return S; }, player, get frozen() { return frozen; }, get talker() { return talker; }, get H() { return H; }, get n() { return paperCount; }, get voiceOK() { return voiceOK; }, get talking() { return talking; } };
