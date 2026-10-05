// Full headless playthrough on AZERTY keys: car, office, deadlines, CourseGen, peak, all six conversations, the finale.
// Screenshots land in tests/out/. Exits non-zero on any page error.
const { chromium } = require('playwright');
const fs=require('fs'), http=require('http'), path=require('path');
(async()=>{
  const dist=path.join(__dirname,'..','dist'), out=path.join(__dirname,'out'); fs.mkdirSync(out,{recursive:true});
  const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.mp3':'audio/mpeg'};
  const srv=http.createServer((q,r)=>{ const f=path.join(dist,decodeURIComponent(q.url.split('?')[0]).replace(/\.\./g,'')); const g=f.endsWith('/')?f+'index.html':f; fs.readFile(g,(e,d)=>{ if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{'content-type':types[path.extname(g)]||'application/octet-stream'}); r.end(d); }); }).listen(0);
  const url=`http://localhost:${srv.address().port}/`; const shot=n=>path.join(out,n);
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:{width:1100,height:700}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(3000);
  await p.screenshot({path:shot('title.png')}); await p.click('input[value=azerty]'); console.log('kb', await p.evaluate(()=>document.querySelector('#kbMove').textContent)); await p.screenshot({path:shot('title.png')}); await p.click('#begin'); await p.waitForTimeout(2500); await p.screenshot({path:shot('street.png')});
  for(let i=0;i<4;i++){ await p.keyboard.press(' '); await p.waitForTimeout(700);} await p.screenshot({path:shot('radio.png')});
  for(let i=0;i<6;i++){ await p.keyboard.press(' '); await p.waitForTimeout(700);}
  console.log('listening', await p.evaluate(()=>__slop.S.listening), 'vo fetched', await p.evaluate(()=>performance.getEntriesByType('resource').filter(e=>e.name.includes('/vo/')).length), 'voiceOK', await p.evaluate(()=>__slop.voiceOK));
  await p.waitForFunction(()=>__slop.S.parked,null,{timeout:120000}); await p.waitForTimeout(1500); await p.screenshot({path:shot('parked.png')});
  await p.keyboard.press('e'); await p.waitForFunction(()=>__slop.phase==='street',null,{timeout:30000}); await p.waitForTimeout(600); await p.screenshot({path:shot('out.png')});
  await p.evaluate(()=>{ Object.assign(__slop.player,{x:0,z:11.5,yaw:0}); }); await p.keyboard.down('z'); await p.waitForTimeout(900); await p.screenshot({path:shot('door.png')});
  await p.waitForFunction(()=>__slop.phase==='desk',null,{timeout:30000}); await p.keyboard.up('z'); await p.waitForTimeout(1500); await p.screenshot({path:shot('inside.png')});
  await p.evaluate(()=>{ Object.assign(__slop.player,{x:0,z:1.1,yaw:0,pitch:-.18}); }); await p.waitForTimeout(500); await p.screenshot({path:shot('desk.png')});
  const st=()=>p.evaluate(()=>({ph:__slop.phase,cr:__slop.S.crafted,pz:__slop.S.pz,g:__slop.S.generated,ring:__slop.S.ringing,ch:!document.querySelector('#choices').hidden,end:!document.querySelector('#ending').hidden,t:__slop.S.talkIdx,pub:!document.querySelector('#publish').disabled,note:!document.querySelector('#voiceNote').hidden}));
  const waitFor=async(fn,max=120000)=>{let t=0;while(t<max){const s=await st(); if(fn(s)) return s; await p.waitForTimeout(400); t+=400;} return await st();};
  await p.waitForTimeout(3500); console.log('after 3.5s', JSON.stringify(await st()));
  await p.keyboard.press('e'); let s=await waitFor(s=>s.ph==='screen',20000); console.log('screen',JSON.stringify(s));
  await p.waitForTimeout(800); await p.screenshot({path:shot('mail0.png')}); await p.click('#mailList .mi.brief'); await p.waitForTimeout(400); await p.screenshot({path:shot('brief.png')});
  await p.click('#tCraft'); await p.click('#card-0-0'); await p.click('#card-1-0'); await p.click('#card-2-0'); await p.click('#card-3-0'); await p.click('#publish'); await p.waitForTimeout(2600); await p.screenshot({path:shot('fail.png')});
  console.log('trust after fail', await p.evaluate(()=>__slop.S.trust)); await p.click('#tMail'); await p.click('#mailList .mi.bad'); await p.waitForTimeout(300); await p.screenshot({path:shot('pushback.png')}); await p.click('#tCraft');
  const solve=async(ans)=>{ for(let i=0;i<4;i++){ const on=await p.evaluate(i=>__slop.S.sel[i],i); if(on!==ans[i]) await p.click(`#card-${i}-${ans[i]}`);} await p.click('#publish'); };
  await solve([1,2,0,1]); await p.waitForTimeout(2200); await p.screenshot({path:shot('pass.png')});
  s=await waitFor(s=>s.pz===1&&s.pub,40000); console.log('p2',JSON.stringify(s));
  await p.evaluate(()=>{__slop.S.clock=__slop.S.due-13}); await p.waitForTimeout(2500); await p.screenshot({path:shot('crunch.png')});
  await p.waitForFunction(()=>!__slop.talking,null,{timeout:30000}).catch(()=>{});
  await p.evaluate(()=>{__slop.S.clock=__slop.S.due-.5}); await p.waitForTimeout(1500); await p.screenshot({path:shot('late.png')});
  await p.evaluate(()=>{__slop.S.clock=__slop.S.due+29.5}); await p.waitForTimeout(1500);
  console.log('late', await p.evaluate(()=>({late:__slop.S.late,missed:__slop.S.missed,trust:__slop.S.trust,mails:__slop.S.mails.slice(0,3).map(m=>m.subj)})));
  await p.click('#tCraft'); await p.screenshot({path:shot('late2.png')});
  await solve([1,1,1,1]);
  s=await waitFor(s=>s.ch,40000); console.log('offer',JSON.stringify(s)); await p.waitForTimeout(800); await p.screenshot({path:shot('offer.png')});
  await p.evaluate(()=>dispatchEvent(new KeyboardEvent('keydown',{key:'&',code:'Digit1'})));
  s=await waitFor(s=>s.g>=5,60000); await p.waitForTimeout(600); await p.screenshot({path:shot('gen5.png')}); s=await waitFor(s=>s.g>=11,60000); await p.screenshot({path:shot('shaky.png')});
  s=await waitFor(s=>s.ph==='tool',60000); console.log('back in office',JSON.stringify(s)); await p.waitForTimeout(2500); await p.screenshot({path:shot('office.png')});
  for(let i=0;i<80;i++){ await p.keyboard.press('e'); await p.waitForTimeout(80);} 
  s=await waitFor(s=>s.ph==='peak',200000); console.log('peak',JSON.stringify(s)); await p.waitForTimeout(4000); await p.screenshot({path:shot('peak.png')});
  for(let i=0;i<10;i++){ await p.keyboard.press(' '); await p.waitForTimeout(600);} 
  await p.waitForFunction(()=>__slop.S.ringing||document.querySelectorAll('.tag').length>3,null,{timeout:60000}).catch(()=>{}); await p.waitForTimeout(3000); await p.screenshot({path:shot('learners.png')}); s=await waitFor(s=>s.ring,60000); await p.waitForTimeout(800); await p.screenshot({path:shot('ring.png')}); await p.keyboard.press('e');
  for(let i=0;i<12;i++){ await p.keyboard.press(' '); await p.waitForTimeout(500);} 
  s=await waitFor(s=>s.ch,30000); await p.keyboard.press('e'); await p.waitForTimeout(1500);
  await p.screenshot({path:shot('arrow.png')});
  for(let k=0;k<6;k++){
    await waitFor(s=>!s.ch,5000);
    await p.evaluate(()=>{const t=__slop.talker; __slop.player.x=t.position.x; __slop.player.z=t.position.z+1.8; __slop.player.yaw=0;});
    await p.waitForTimeout(400); await p.keyboard.press('e'); if(k===0){ await p.waitForTimeout(2500); await p.screenshot({path:shot('talker.png')}); }
    s=await waitFor(s=>s.ch,30000); await p.evaluate(()=>dispatchEvent(new KeyboardEvent('keydown',{key:'&',code:'Digit1'})));
    for(let i=0;i<4;i++){ await p.waitForTimeout(400); await p.keyboard.press(' ');} 
    s=await waitFor(s=>s.t>k||s.end,60000);
  }
  for(let i=0;i<30;i++){ await p.waitForTimeout(1000); if(i%3===0) await p.screenshot({path:shot(`finale-${i/3}.png`)}); }
  await p.waitForTimeout(100); s=await waitFor(s=>s.end,40000); console.log('end',JSON.stringify(s));
  console.log(errs.join('\n')||'no errors'); await b.close(); srv.close(); if(errs.length) process.exitCode=1;
})();
