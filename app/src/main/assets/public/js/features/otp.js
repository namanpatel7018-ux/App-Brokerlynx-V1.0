/* Brokerlynx module: features/otp
   Forgot password by emailed one-time code (the only reset method).
   Needs the server in server/ (the app cannot send email by itself); BLX.cfg.OTP_API is its address.
   The server proves the person controls the email; the new password is still set on this phone only. */
(function(){
 const API=()=>String(BLX.cfg.OTP_API||'').trim();
 let CD=0,CT=null,ST={e:''},VB=0;
 const post=async(path,body)=>{const r=await fetch(API(),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({action:path.replace('/otp/','')},body))});let j={};try{j=await r.json()}catch(e){}return{ok:r.ok&&j&&j.ok,j,s:r.status}};
 const mask=e=>{const i=e.indexOf('@');if(i<1)return e;const n=e.slice(0,i);return (n.length<=2?n[0]:n.slice(0,2))+'\u2022\u2022\u2022\u2022'+e.slice(i)};
 const ico=(p)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
 const I={
  mail:'<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="m4 8 8 5.5L20 8"/>',
  shield:'<path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9.5 4.1-1.9 7-5.3 7-9.5V6z"/><path d="m9 12 2.2 2.2L15 10.4"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  back:'<path d="M15 5 8 12l7 7"/>'};
 const pwf=(id,lbl)=>`<div class="af"><label for="${id}">${lbl}</label><div class="ap iw">${aIc('lock')}<input id="${id}" type="password" autocomplete="new-password" autocapitalize="off" spellcheck="false"><button type="button" class="ae" aria-label="Show password" onclick="aEye('${id}',this)">Show</button></div></div>`;
 const head=()=>{const lg=($('.logo')||{}).src||'';return `<div class="ab"><img alt="" src="${lg}"><b>Broker<span>lynx</span></b><small>Smart Deals, Seamless Records</small></div>`};
 const steps=n=>`<div class="rs" role="img" aria-label="Step ${n} of 2"><i class="on"></i><i class="${n==2?'on':''}"></i></div>`;
 const backLink=`<div class="as rb"><a href="#" onclick="authShow('in');return false">${ico(I.back)}Back to sign in</a></div>`;
 function shell(inner){
  let a=document.getElementById('auth');if(!a){a=document.createElement('div');a.id='auth';document.body.appendChild(a)}
  a.innerHTML=`<div class="aw">${head()}<div class="ac rp">${inner}</div></div>`;return a}
 function view(step){
  if(!API()){shell(`<div class="rh"><span class="rbdg">${ico(I.shield)}</span><h1>Reset unavailable</h1><p>Password reset by email is not available right now. Please contact support.</p></div>${backLink}`);return}
  let a;
  if(step==1){
   a=shell(`${steps(1)}<div class="rh"><span class="rbdg">${ico(I.mail)}</span><h1>Reset your password</h1><p>Enter the email you signed up with. We will send you a 6-digit verification code.</p></div>
    <div class="af"><label for="ao_e">Email address</label>${aWrap(`<input id="ao_e" type="email" inputmode="email" autocomplete="username" autocapitalize="off" value="${esc(ST.e)}">`,'mail')}</div>
    <div id="ao_m" class="am" role="alert"></div><button class="ag" id="ao_b" onclick="otpSend()">Send verification code</button>
    <div class="rn">${ico(I.clock)}<span>The code is valid for 10 minutes.</span></div>${backLink}`);
  }else{
   a=shell(`${steps(2)}<div class="rh"><span class="rbdg">${ico(I.shield)}</span><h1>Check your email</h1><p>We sent a 6-digit code to</p>
    <div class="rm"><b>${esc(mask(ST.e))}</b><a href="#" onclick="otpChange();return false">Change</a></div></div>
    <div class="af"><label id="ao_cl">Verification code</label><div class="ro" id="ao_c" role="group" aria-labelledby="ao_cl">${[0,1,2,3,4,5].map(i=>`<input class="od" inputmode="numeric" pattern="[0-9]*" maxlength="1" autocomplete="${i?'off':'one-time-code'}" aria-label="Digit ${i+1}">`).join('')}</div></div><div id="ao_v" class="am" role="status" aria-live="polite"></div>
    ${pwf('ao_p','New password')}<div class="sm" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div id="ao_s" class="ah"></div>
    ${pwf('ao_q','Confirm new password')}
    <div id="ao_m" class="am" role="alert"></div><button class="ag" id="ao_b" onclick="otpReset()">Reset password</button>
    <div class="as"><a href="#" id="ao_r" onclick="otpSend(1);return false">Resend code</a></div>${backLink}`);
   wireBoxes(a);const pe=a.querySelector('#ao_p');if(pe)pe.addEventListener('input',()=>aMeter('ao_p','ao_s'));tick();
  }
  a.querySelectorAll('input:not(.od)').forEach(i=>i.addEventListener('keydown',e=>{if(e.key=='Enter'){const b=a.querySelector('.ag:not([disabled])');if(b)b.click()}}));
  const f=a.querySelector(step==1?'#ao_e':'.od');if(f&&f.focus)try{f.focus()}catch(e){}
 }
 function wireBoxes(a){
  const bx=[].slice.call(a.querySelectorAll('.od'));
  const fill=(from,txt)=>{const d=String(txt).replace(/\D/g,'').slice(0,6-from);d.split('').forEach((c,k)=>{bx[from+k].value=c});bx[Math.min(5,from+d.length)].focus();otpAuto()};
  bx.forEach((b,i)=>{
   b.addEventListener('input',()=>{const v=b.value.replace(/\D/g,'');if(v.length>1){b.value='';fill(i,v);return}b.value=v;if(v&&i<5)bx[i+1].focus();otpAuto()});
   b.addEventListener('keydown',e=>{if(e.key=='Backspace'&&!b.value&&i>0){bx[i-1].value='';bx[i-1].focus();e.preventDefault()}else if(e.key=='ArrowLeft'&&i>0)bx[i-1].focus();else if(e.key=='ArrowRight'&&i<5)bx[i+1].focus()});
   b.addEventListener('paste',e=>{const t=(e.clipboardData||window.clipboardData).getData('text');e.preventDefault();fill(i,t)});
   b.addEventListener('focus',()=>{try{b.select()}catch(x){}})})}
 const code=()=>[].map.call(document.querySelectorAll('#ao_c .od'),b=>b.value).join('');
 async function otpAuto(){
  if(ST.v||VB||AB)return;const c=code();if(c.length!=6)return;
  const lk=fLock();if(lk)return aMsg('ao_v','Too many attempts. Try again in '+lk+' seconds.','er');
  VB=1;aMsg('ao_v','Checking code...','');
  try{const r=await post('/otp/verify',{email:ST.e,code:c});
   if(r.ok){fOk();ST.v=1;ST.vc=c;ST.vt=Date.now();
    const g=document.getElementById('ao_c');if(g){g.classList.add('ok');g.querySelectorAll('.od').forEach(x=>{x.disabled=true})}
    aMsg('ao_v','\u2713 Code verified. Now set your new password.','');aMsg('ao_m','');
    const pe=document.getElementById('ao_p');if(pe&&pe.focus)try{pe.focus()}catch(e){}}
   else{fBad();aMsg('ao_v',r.s==429?'Too many wrong codes. Request a new code.':'That code is not correct or has expired.','er');
    const bs=document.querySelectorAll('#ao_c .od');bs.forEach(x=>{x.value=''});if(bs[0]&&bs[0].focus)try{bs[0].focus()}catch(e){}}}
  catch(x){aMsg('ao_v','No internet connection. Check it and enter the code again.','er')}
  VB=0}
 function tick(){clearInterval(CT);const r=document.getElementById('ao_r');if(!r)return;const u=()=>{const s=Math.max(0,Math.ceil((CD-Date.now())/1000)),el=document.getElementById('ao_r');if(!el){clearInterval(CT);return}el.textContent=s?'Resend code in '+s+'s':'Resend code';el.style.pointerEvents=s?'none':'';el.style.opacity=s?.5:1;if(!s)clearInterval(CT)};u();CT=setInterval(u,1000)}
 function done(s){
  const a=shell(`<div style="text-align:center"><div class="ai">&#10003;</div><h1>Password updated</h1><p>Your new password is active on this phone.</p><button class="ag" id="ao_go">Continue to Brokerlynx</button></div>`);
  a.querySelector('#ao_go').onclick=()=>aStart(s)}
 window.otpStart=function(){ST.e=ST.e||'';view(1)};
 window.otpOpen=window.otpStart;
 window.otpChange=function(){clearInterval(CT);ST.v=0;ST.vc='';view(1)};
 window.otpSend=async function(again){
  if(AB)return;const inp=document.getElementById('ao_e'),e=again?ST.e:emN(inp&&inp.value);
  if(!e)return aMsg('ao_m','Please enter your email address.','er');if(!emOk(e))return aMsg('ao_m','Please enter a valid email address.','er');
  if(!aget().list.find(x=>x.email==e))return aMsg('ao_m','This email is not registered on this phone. Sign up first, or restore from your backup.','er');
  const lk=fLock();if(lk)return aMsg('ao_m','Too many attempts. Try again in '+lk+' seconds.','er');
  AB=1;const b=document.getElementById('ao_b');if(b){b.disabled=true;b.textContent='Sending...'}
  const reset=()=>{AB=0;if(b){b.disabled=false;b.textContent='Send verification code'}};
  try{const r=await post('/otp/send',{email:e});ST.e=e;ST.v=0;ST.vc='';
   if(r.s==429){reset();return aMsg('ao_m','Please wait a little before asking for another code.','er')}
   if(!r.ok){reset();return aMsg('ao_m','Could not send the email. Please try again.','er')}
   CD=Date.now()+60000;AB=0;view(2);aMsg('ao_m','If this email is registered, a code is on its way.','')}
  catch(x){reset();aMsg('ao_m','No internet connection. Connect to the internet and try again.','er')}};
 window.otpReset=async function(){
  if(AB)return;const c=code(),p=document.getElementById('ao_p').value,q=document.getElementById('ao_q').value;
  if(c.length!=6)return aMsg('ao_m','Enter the 6-digit code from the email.','er');
  const r0=pwCheck(p);if(!r0.ok)return aMsg('ao_m',r0.m,'er');if(!q)return aMsg('ao_m','Please confirm your password.','er');if(p!==q)return aMsg('ao_m','Passwords do not match.','er');
  const lk=fLock();if(lk)return aMsg('ao_m','Too many attempts. Try again in '+lk+' seconds.','er');
  AB=1;const b=document.getElementById('ao_b');b.disabled=true;b.textContent='Please wait...';
  try{if(!(ST.v&&ST.vc===c&&Date.now()-ST.vt<600000)){const r=await post('/otp/verify',{email:ST.e,code:c});
   if(!r.ok){fBad();AB=0;b.disabled=false;b.textContent='Reset password';return aMsg('ao_m',r.s==429?'Too many wrong codes. Request a new code.':'That code is not correct or has expired.','er')}
   fOk()}
   const reg=aget(),a=reg.list.find(x=>x.email==ST.e);if(!a)throw 0;
   const salt=rnd(16);a.s=b8(salt);a.h=await hpw(p,salt);delete a.rs;delete a.rh;if(!aput(reg))throw 0;
   AB=0;done({id:a.id,k:a.k,e:a.email,n:a.name})}
  catch(x){AB=0;b.disabled=false;b.textContent='Reset password';aMsg('ao_m','Something went wrong. Please check your connection and try again.','er')}};
})();
