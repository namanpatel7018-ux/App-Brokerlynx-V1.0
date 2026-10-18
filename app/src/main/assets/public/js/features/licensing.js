/* Brokerlynx module: features/licensing
   Licensing UI: key check, requests, upgrade window, restore request, expiry window.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

const trialLbl=()=>{const t=ACX.trial();return t.expired?'Free trial ended':t.daysLeft+' of '+CFG.TRIAL_DAYS+' trial days left'};
const PUBK={"kty":"EC","crv":"P-256","x":"eQc1v-na9dqcP7je-3-dl8n53Br70bANrrTxgKwPh_8","y":"Z1Usz1u68rC5iOu_-7292QSF3GzFivYyd2FWfA4K8Og"};
const PUBK_NEW={"kty":"EC","crv":"P-256","x":"RVGNNP2HHsn0E-CznctQbZ1VwbHC6cEX2E8sreCz73M","y":"bkZOySwBuFMhqUloYbK8bGOqg5d5auGO14ioi1QGLR0"};
const u8=s=>{s=String(s).replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0))};
const b8=a=>{let s='';a.forEach(x=>s+=String.fromCharCode(x));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
function devId(){if(!db.dev){const a=new Uint8Array(6);crypto.getRandomValues(a);db.dev='D'+Array.from(a,x=>x.toString(36).padStart(2,'0')).join('').toUpperCase().slice(0,10);save()}return db.dev}
async function licCheck(k){try{k=String(k||'').replace(/\s+/g,'');const q=k.split('.');if(q.length!=2)return{ok:0,m:'This is not a valid activation key. Copy the whole key again.'};
 let good=false;for(const pk of [PUBK_NEW,PUBK]){try{const key=await crypto.subtle.importKey('jwk',pk,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);if(await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,u8(q[1]),new TextEncoder().encode(q[0]))){good=true;break}}catch(e){}}
 if(!good)return{ok:0,m:'This key is not genuine. Please get a key from the admin.'};
 const p=JSON.parse(new TextDecoder().decode(u8(q[0])));
 if(p.t!='L')return{ok:0,m:'This key is not a lifetime key.'};
 if(p.id!=db.dev)return{ok:0,m:'This key was made for a different device or install. Send a new request code to the admin.'};
 if(!p.e||p.e!==ACC.e)return{ok:0,m:'This key belongs to a different account email. Sign in with the email you used to request it.'};
 const qs_=[db.req&&db.req.q,db.rec&&db.rec.q].filter(Boolean);if(p.q&&qs_.length&&!qs_.includes(p.q))return{ok:0,m:'This key was issued for a different request. Please use the key sent for your own request.'};
 return{ok:1,p}}catch(e){return{ok:0,m:'This is not a valid activation key.'}}}
const licBtn=()=>{const b=document.getElementById('upb');if(b)b.classList.toggle('hide',!!PREM)};
async function licInit(){devId();const r=db.lic&&await licCheck(db.lic.k);PREM=!!(r&&r.ok);LICV=PREM?1:0;licBtn();if(PREM){const f=document.getElementById('fto');if(f)f.remove()}}
const utrFmt=u=>{const d=+u.slice(1,4),hh=+u.slice(4,6);return d>=1&&d<=366&&hh<=23};
const utrChk=u=>{if(!/^\d{12}$/.test(u)||!utrFmt(u))return '';const n=new Date(),Y=+u[0];let y=n.getFullYear();while(y%10!==Y)y--;const t=new Date(y,0,+u.slice(1,4),+u.slice(4,6)),ag=(n-t)/864e5;if(ag<-1)return 'This UTR is dated in the future. Enter the UTR of the payment you just made.';if(ag>30)return 'This UTR belongs to an old payment ('+t.toLocaleDateString()+'). Enter the UTR of the payment you just made.';return ''};
const utrOk=u=>{u=String(u||'');if(!/^\d{12}$/.test(u)||/^000/.test(u)||new Set(u).size<5)return 0;if(/(\d)\1{3}/.test(u)||/^(\d{2,6})\1+$/.test(u)||u===[...u].reverse().join(''))return 0;const up='01234567890123456789',dn='98765432109876543210';for(let i=0;i<=6;i++){const s=u.slice(i,i+6);if(up.includes(s)||dn.includes(s))return 0}return 1};
function utrLive(el){el.value=el.value.replace(/\D/g,'');const a=document.getElementById('lu').value,c=document.getElementById('lu2'),h=document.getElementById('uh'),b=document.getElementById('usb');if(c)c.value=c.value.replace(/\D/g,'');const v2=c?c.value:a;let m='',k='';
 if(a.length&&a.length<12)m=a.length+' of 12 digits';else if(a.length==12){if(!utrOk(a)){m='This does not look like a real UTR. Check your payment receipt.';k='er'}else if(utrChk(a)){m=utrChk(a);k='er'}else if(c&&v2.length&&v2!==a){m='The two UTR entries do not match.';k='er'}else if(c&&v2.length<12)m='Re-enter the UTR to confirm it.';else{m=utrFmt(a)?'UTR confirmed. Ready to submit.':'Unusual format. Make sure it matches your receipt exactly.';k='ok'}}
 if(h){h.textContent=m;h.style.color=k=='ok'?'#6ee7a8':k=='er'?'#ff9d94':'#8fb0b3'}if(b)b.disabled=!(utrOk(a)&&!utrChk(a)&&(!c||v2===a))}
async function licPay(e){const nat=window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform();if(nat)return;e.preventDefault();const ok=await lcopy(UPIID);const h=document.getElementById('upn');if(h)h.textContent=ok?'UPI ID copied: '+UPIID+'. Open your UPI app and pay '+CFG.price()+'.':'Pay '+CFG.price()+' to UPI ID '+UPIID}
const RQK='bb_reqs';
function rqr(){try{const a=JSON.parse(localStorage.getItem(RQK)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}}
function rqw(a){try{localStorage.setItem(RQK,JSON.stringify(a))}catch(e){}}
function newRid(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',used=new Set(rqr().map(x=>x.q));let q;do{const r=new Uint8Array(8);crypto.getRandomValues(r);q='BLR-'+devId().slice(1,5)+'-'+Array.from(r,x=>A[x%32]).join('')}while(used.has(q));return q}
const fnv=s=>{let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)>>>0}return x.toString(16).padStart(8,'0')};
function reqCode(u,q,at,pn,rc){const o=CO(),d={q,id:devId(),e:ACC.e||'',a:ACC.n||'',n:o.n,ph:o.ph,em:o.em,u,c:db.c.length,at:at||new Date().toISOString(),pn:pn||'',pp:PRICE,ts:(()=>{const t=ACX.trial().start;return t?new Date(t).toISOString():''})()};if(rc)d.r=1;d.k=fnv([d.q,d.u,d.e,d.id].join('|'));return 'BLREQ.'+b8(new TextEncoder().encode(JSON.stringify(d)))}
function reqEnsure(){const r=db.req;if(r&&!r.q){r.q=newRid();r.code=reqCode(r.utr,r.q,r.at,r.payer);const a=rqr();a.push({q:r.q,u:r.utr,e:(ACC.e||'').toLowerCase(),at:r.at});rqw(a);save()}return r}
function reqBox(r){return `<div class="pnote"><b>Request under process</b><span>${PMSG}</span></div><div class="cd" style="border-color:#d9a84e;text-align:center"><div class="mu" style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700">Your request ID</div><div id="rqid" style="font:800 22px ui-monospace,Consolas,monospace;letter-spacing:.06em;margin:6px 0;word-break:break-all">${esc(r.q)}</div><span class="bd Cancelled">Pending Approval</span><div class="r3" style="margin-top:10px"><span>UTR</span><b>${esc(r.utr)}</b></div><div class="r3"><span>Account email</span><b>${esc(ACC.e||'')}</b></div><div class="r3"><span>Submitted</span><b>${esc(fd(r.at.slice(0,10)))}</b></div><div class="mu" style="margin-top:8px;font-size:12px">Quote this ID when you contact the admin. Each UTR and each email can raise only one request.</div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn s" style="flex:1" onclick="licCopyId()">Copy ID</button><button class="btn s" style="flex:1" onclick="licCopy2()">Copy request</button></div>${PORTAL_URL?'<button class="btn s" style="margin-top:10px" onclick="licNow()">Check approval status</button>':''}</div>`}
const PORTAL_URL='',PMSG='Your request is already under process. Please be patient, the admin will verify your payment and approve it shortly.';
async function portalSend(r){if(!PORTAL_URL)return;try{await fetch(PORTAL_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:r.q,payer:r.payer||'',utr:r.utr,at:r.at,amount:PRICE,email:ACC.e||'',name:ACC.n||'',company:CO().n||'',phone:CO().ph||'',device:devId(),code:r.code,contracts:db.c.length})})}catch(e){}}
async function licNow(){if(!db.req||PREM)return;if(!PORTAL_URL)return toast('Waiting for the admin. The activation key will arrive from the admin.');try{const j=await(await fetch(PORTAL_URL+(PORTAL_URL.includes('?')?'&':'?')+'q='+encodeURIComponent(db.req.q))).json();if(j&&j.status=='approved'&&j.key){const t=$('#lk');if(t){t.value=j.key;return licAct()}}toast(j&&j.status=='rejected'?'Your request was not approved. Please contact the admin.':'Still under process. Please be patient.')}catch(e){toast('Could not check right now. Try again shortly.')}}
async function licCopyId(){const ok=await lcopy(db.req.q);toast(ok?'Request ID copied':'Select the ID and copy it')}
function licPending(){return db.req&&!PREM?db.req:null}
function licOpen(){
 if(PREM){let p={};try{p=JSON.parse(new TextDecoder().decode(u8(db.lic.k.split('.')[0])))}catch(e){}
  return sh(`<div class="ul"><h2>Lifetime Premium</h2><div class="cd"><div class="r1"><b>Active</b><span class="bd Cancelled">Lifetime</span></div><div class="r3"><span>Activated for</span><b>${esc(p.n||'')}</b></div><div class="r3"><span>Issued on</span><b>${esc(p.iat||'')}</b></div></div><p class="mu">There is no contract limit. This license belongs to this install and travels with your backup file.</p><button class="btn s" onclick="cs()">Close</button></div>`)}
 const rq=licPending();
 sh(`<div class="ul"><h2>Unlock Brokerlynx</h2>
 <div class="hero"><span class="hb">LIFETIME ACCESS</span><div class="big">${CFG.price()} <span>one-time</span></div><div class="hs">No contract limit. Pay once, use forever.</div><div class="hf"><span>&#10003; Unlimited contracts</span><span>&#10003; All features</span><span>&#10003; Backup-safe licence</span></div></div>
 <div class="cd"><div class="r1"><b>Free trial</b><span class="bd Cancelled">${trialLbl()}</span></div></div>
 ${rq?reqBox(reqEnsure()):''}
 <div class="cd"><div class="r1"><b>Lifetime will be linked to</b></div><div class="r3"><b>${esc(ACC.e||"")}</b></div></div>
 ${rq?'<div id="er" class="er"></div>':`<div class="stp"><i>1</i><b>Scan and pay ${CFG.price()}</b></div>
 <div class="qrb"><img alt="Pay ${CFG.price()} by UPI" src="${UPIQR}" style="width:100%;display:block;image-rendering:pixelated"></div>
 <div class="uid">UPI ID &nbsp;<b>${UPIID}</b></div><div class="mu" style="text-align:center;margin-bottom:10px">Scan with any UPI app. The amount ${CFG.price()} is filled in automatically.</div>
 <a class="btn s" style="display:block;text-align:center;text-decoration:none" href="${UPIURL}" onclick="licPay(event)">Pay ${CFG.price()} in my UPI app</a>
 <div class="mu" id="upn" style="text-align:center;margin:8px 0 4px"></div>
 <div class="stp"><i>2</i><b>Submit your UTR</b></div>
 <div class="mu" style="margin-bottom:8px">After paying, copy the 12-digit UTR / UPI transaction number from your payment receipt. Lifetime access is not unlocked by the UTR alone. It unlocks only after the admin checks the payment and approves it.</div>
 <div class="f"><span>UPI ID or mobile number you paid from</span><input id="lp" placeholder="e.g. name@okhdfc or 98xxxxxxxx" maxlength="60" autocomplete="off" autocapitalize="off"></div><div class="f"><span>UTR / UPI transaction number (12 digits)</span><input id="lu" inputmode="numeric" maxlength="12" placeholder="e.g. 628712849305" value="${rq?esc(rq.utr):''}" oninput="utrLive(this)"></div><div class="f"><span>Re-enter UTR to confirm</span><input id="lu2" inputmode="numeric" maxlength="12" placeholder="Type the same UTR again" autocomplete="off" oninput="utrLive(this)"><div id="uh" class="mu" style="margin-top:6px;min-height:16px"></div></div>
 <div id="er" class="er"></div>
 <button class="btn" id="usb" onclick="licReq()" disabled>Submit payment request</button>`}
 <div class="stp"><i>3</i><b>Approved by admin? Activate</b></div>
 <div class="f"><textarea id="lk" rows="3" placeholder="Paste the activation key here" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea></div>
 <div id="er2" class="er"></div>
 <button class="btn s" onclick="licAct2()">Activate lifetime access</button>
 ${PREM?'':`<div class="rcv"><div class="bi">${BKI}</div><div class="bt"><b>Reinstalled the app or changed phone?</b><span>If you already paid for lifetime access you do not pay again. Restore it in one of two ways.</span></div></div>
 <button class="btn s" onclick="T='i';MS='b';cs();render()">I have my backup file: restore it</button>
 <button class="btn s" style="margin-top:10px" onclick="recOpen()">No backup: ask the admin to restore my lifetime</button>`}</div>`);const _u=document.getElementById('lu');if(_u)utrLive(_u);if(rq&&PORTAL_URL)licNow()}
function licAct2(){licAct()}
function licMsg(c,u){return 'Hello, I have paid '+CFG.price()+' for Brokerlynx Lifetime. Please approve my request.\nRequest ID: '+(db.req&&db.req.q||'')+'\nAccount email: '+(ACC.e||'')+'\nUTR: '+u+'\nPaid from (UPI ID / mobile): '+(db.req&&db.req.payer||'-')+'\nRequest code:\n'+c}
async function licReq(){if(RQB)return;const u=$('#lu').value.trim(),er=m=>{$('#er').textContent=m};er('');
 if(!utrOk(u))return er('Enter the correct 12-digit UTR / UPI transaction number from your payment');
 const ce=utrChk(u);if(ce)return er(ce);
 const pv=(($('#lp')&&$('#lp').value)||'').trim().replace(/\s+/g,''),pvOk=/^[\w.\-]{2,}@[A-Za-z][A-Za-z0-9.\-]*$/.test(pv)||/^(\+?91)?\d{10}$/.test(pv);if(!pvOk)return er('Enter the UPI ID or mobile number you paid from, for example name@okhdfc.');
 if($('#lu2')&&$('#lu2').value!==u)return er('The two UTR entries do not match. Please re-enter the UTR carefully.');
 if(db.req&&!PREM)return er(PMSG);
 const em=(ACC.e||'').toLowerCase(),a=rqr();
 if(a.some(x=>x.u==u))return er('This UTR has already been used to raise a request. A UTR can be used only once.');
 if(a.some(x=>x.e==em))return er(PMSG);
 const q=newRid(),at=new Date().toISOString(),c=reqCode(u,q,at,pv);a.push({q,u,e:em,at});rqw(a);RQB=1;db.req={q,utr:u,at,code:c,payer:pv};save();portalSend(db.req);RQB=0;licDone()}
function licDone(){const r=reqEnsure();if(!r)return;const wa='https://wa.me/919825333167?text='+encodeURIComponent(licMsg(r.code,r.utr));
 cs();const d=document.createElement('div');d.className='rq';d.id='rqd';
 d.innerHTML=`<div class="pc" role="dialog" aria-label="Request submitted"><div class="ic"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2a1d02" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h3>Request Submitted Successfully!</h3><div style="margin:2px 0 10px"><div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.75;font-weight:700">Request ID</div><div style="font:800 21px ui-monospace,Consolas,monospace;letter-spacing:.06em;word-break:break-all;margin-top:4px">${esc(r.q)}</div></div><p>Your Request Is Submitted, Kindly Wait For Approval. Thanks For Connecting With Brokerlynx.</p><div class="st">Pending Approval</div><a class="w" href="${wa}" onclick="licWa(event)">Send request to admin on WhatsApp</a><button onclick="licCopy2()">Copy request code</button><div class="nt" id="rqn">Your lifetime access will unlock only after the admin verifies your payment and approves it.</div><button onclick="document.getElementById('rqd').remove()">Close</button></div>`;
 document.body.appendChild(d)}
async function licCopy2(){const ok=await lcopy(licMsg(db.req.code,db.req.utr));$('#rqn').textContent=ok?'Copied. Paste it to the admin on WhatsApp or email.':'Could not copy. Please use the WhatsApp button.'}
async function licWa(e){const nat=window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform();if(nat)return;e.preventDefault();licCopy2()}
async function licAct(){const er=m=>{const e=$('#er2');if(e)e.textContent=m};er('');const k=$('#lk').value.replace(/\s+/g,'');if(!k)return er('Paste the activation key');
 const r=await licCheck(k);if(!r.ok)return er(r.m);db.lic={k,at:new Date().toISOString()};delete db.req;delete db.rec;save();PREM=1;LICV=1;licBtn();cs();toast('Lifetime access activated');render()}

async function lcopy(v){try{await navigator.clipboard.writeText(v);return 1}catch(e){}try{const t=document.createElement('textarea');t.value=v;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();const ok=document.execCommand('copy');t.remove();return ok}catch(e){return 0}}
async function lct(e,t,v){const nat=window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform();if(nat)return;e.preventDefault();const ok=await lcopy(v),f=document.querySelector('.lpop .fn');if(f)f.textContent=ok?(t=='tel'?'Number':'Email')+' copied: '+v+'. Paste it in your '+(t=='tel'?'dialer or WhatsApp.':'mail app.'):'Please note down: '+v}
function lcp(){const m=document.querySelector('.lm');if(!m||m.querySelector('.lpop'))return;const d=document.createElement('div');d.className='lpop';d.onclick=e=>{if(e.target==d)d.remove()};
d.innerHTML=`<div class="pc" role="dialog" aria-label="Contact admin"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="#2a1d02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z"/></svg></div>
<h3>Upgrade to the full version</h3><div class="sb">Please contact on the details below for further procedure.</div>
<a class="row" href="tel:+919825333167" onclick="lct(event,'tel','9825333167')"><i><svg viewBox="0 0 24 24" fill="none" stroke="#e9c26e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg></i><span><small>Call / WhatsApp</small><b>9825333167</b></span></a>
<a class="row" href="mailto:namanpatel7018@gmail.com?subject=Brokerlynx%20full%20version" onclick="lct(event,'mail','namanpatel7018@gmail.com')"><i><svg viewBox="0 0 24 24" fill="none" stroke="#e9c26e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></i><span><small>Email</small><b class="em">namanpatel7018@gmail.com</b></span></a>
<div class="fn">Tap the email to open your mail app.</div><button onclick="licOpen()" style="margin-bottom:10px;border-color:#d9a84e;color:#f1d28f">Upgrade / enter activation key</button><button onclick="this.closest('.lpop').remove()">Close</button></div>`;m.appendChild(d)}

function lim(){if(LICV)return cs();$('#sh').innerHTML=`<div class="lm" role="dialog" aria-modal="true" aria-label="Free trial expired"><div class="cardx"><div class="seal"><svg viewBox="0 0 24 24" fill="none" stroke="#2a1d02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.2" fill="#2a1d02"/></svg></div>
<div class="kick">Brokerlynx</div><h2>Free trial expired</h2>
<p>Your ${CFG.TRIAL_DAYS}-day free trial has ended. Unlock Brokerlynx for life with a one-time payment of <b style="color:#f1d28f">${CFG.price()}</b>. Please contact the admin to continue.</p>${licPending()?'<div class="mcap" style="color:#f1d28f;font-weight:800">Your lifetime request is pending admin approval</div>':''}
<div class="meter">${'<i></i>'.repeat(10)}</div><div class="mcap">${CFG.TRIAL_DAYS} of ${CFG.TRIAL_DAYS} trial days used</div>
<div class="ct" onclick="lcp()" role="button" tabindex="0"><small>Contact admin</small><b>${ADMIN}</b><em>Tap for contact details</em></div>
<button class="b1" onclick="lcp()">Contact admin for full version</button>
<button class="b2" onclick="licOpen()" style="margin-bottom:10px;border-color:#d9a84e;color:#f1d28f">I have an activation key</button><button class="b2" onclick="expBk()">Back up my data</button>
<div class="by">A Product By Patel Naman</div></div></div>`}
function recMsg(){const r=db.rec,o=CO();return 'Hello, I reinstalled Brokerlynx and my Lifetime access needs to be restored. I already paid for it earlier, so there is no new payment.\nRequest ID: '+r.q+'\nAccount email: '+(ACC.e||'')+'\nName: '+(ACC.n||o.n||'')+'\nPhone: '+(o.ph||'')+'\nRequest code:\n'+r.code}
function recOpen(){if(PREM)return;let again=!!db.rec;if(!db.rec){const q=newRid(),at=new Date().toISOString();db.rec={q,at,code:reqCode('',q,at,'',1)};save()}recShow(again)}
function recShow(again){const r=db.rec;if(!r)return;const wa='https://wa.me/919825333167?text='+encodeURIComponent(recMsg());
 sh(`<div class="ul"><h2>Restore lifetime access</h2>
 <div class="pnote"><b>${again?'Request under process':'Request created'}</b><span>${again?'Your restore request is already under process. Please be patient, the admin will check your earlier purchase and restore it shortly.':'Send it to the admin. They will check your earlier purchase and send a new activation key.'}</span></div>
 <div class="cd"><div class="r1"><b>Restore will be linked to</b></div><div class="r3" style="margin-top:6px"><span><b>${esc(ACC.e||'')}</b></span></div></div>
 <div class="cd"><div class="r1"><b>Request ID</b></div><div style="font:800 17px ui-monospace,Consolas,monospace;letter-spacing:.06em;margin-top:6px;word-break:break-all">${esc(r.q)}</div></div>
 <div class="stp"><i>1</i><b>Send your request to the admin</b></div>
 <a class="btn" style="display:block;text-align:center;text-decoration:none;box-sizing:border-box" href="${wa}" target="_blank" rel="noopener" onclick="recWa(event)">Send on WhatsApp</a>
 <button class="btn s" style="margin-top:10px" onclick="recCopy()">Copy request</button><div id="rcn" class="mu" style="text-align:center;min-height:16px;margin-top:6px"></div>
 <div class="stp"><i>2</i><b>Paste the key the admin sends</b></div>
 <div class="f"><textarea id="lk" rows="3" placeholder="Paste the activation key here" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea></div>
 <div id="er2" class="er"></div><button class="btn" onclick="licAct2()">Activate lifetime access</button>
 <div class="mu" style="margin-top:12px;line-height:1.5">Tip: sign up with the same email you used before. Your old contracts and ledgers return only if you restore a backup file.</div></div>`)}
async function recCopy(){const ok=await lcopy(recMsg());const n=$('#rcn');if(n)n.textContent=ok?'Copied. Paste it to the admin on WhatsApp or email.':'Could not copy. Please use the WhatsApp button.'}
function recWa(e){const nat=window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform();if(nat)return;e.preventDefault();recCopy()}
