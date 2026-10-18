/* Brokerlynx module: features/accounts
   On-device accounts: sign up, sign in, log out, change password. Forgotten passwords are reset by emailed code (features/otp.js).
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

const aget=()=>{try{const r=JSON.parse(localStorage.getItem(AK));if(r&&Array.isArray(r.list))return r}catch(e){}return{v:1,adopted:0,list:[]}};
const aput=r=>{try{localStorage.setItem(AK,JSON.stringify(r));return 1}catch(e){return 0}};
const emN=e=>String(e||'').trim().toLowerCase();
const emOk=e=>e.length<=120&&/^[^\s@.][^\s@]*@[^\s@.][^\s@]*\.[a-z]{2,}$/i.test(e)&&!/\.\./.test(e)&&(e.match(/@/g)||[]).length==1;
const PW_COMMON=['password1234','123456789012','qwertyuiop12','111111111111','admin1234567','welcome12345','iloveyou1234','letmein12345','password12345','brokerlynx123'];
function pwCheck(p){if(!p)return{ok:0,m:'Please enter a password.',s:0};
 if(p!==p.trim())return{ok:0,m:'Password cannot start or end with a space.',s:1};
 if(new Set(p).size<5||PW_COMMON.includes(p.toLowerCase()))return{ok:0,m:'This password is too easy to guess. Try a longer phrase.',s:1};
 const c=[/[a-z]/,/[A-Z]/,/\d/,/[^A-Za-z0-9]/].filter(r=>r.test(p)).length;
 return{ok:1,s:(p.length>=20||(p.length>=16&&c>=3))?4:(p.length>=16||c>=3)?3:2}}
async function hpw(pw,salt,it){it=it||150000;const km=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);return b8(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:it,hash:'SHA-256'},km,256)))}
const rnd=n=>crypto.getRandomValues(new Uint8Array(n));
function fLock(){try{const f=JSON.parse(localStorage.getItem(FK))||{};return f.until&&f.until>Date.now()?Math.ceil((f.until-Date.now())/1000):0}catch(e){return 0}}
function fBad(){try{const f=JSON.parse(localStorage.getItem(FK))||{n:0};f.n=(f.n||0)+1;if(f.n>=5)f.until=Date.now()+Math.min(900,30*Math.pow(2,f.n-5))*1000;localStorage.setItem(FK,JSON.stringify(f))}catch(e){}}
const fOk=()=>{try{localStorage.removeItem(FK)}catch(e){}};
const aq=s=>document.querySelector('#auth '+s);
const aIc=n=>`<svg class="fi" viewBox="0 0 24 24" aria-hidden="true">${({mail:'<path d="M3 6.5h18v11H3z"/><path d="m3.5 7 8.5 6.5L20.5 7"/>',lock:'<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',user:'<circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20c.6-3.6 3.6-5.6 7.2-5.6s6.6 2 7.2 5.6"/>',key:'<circle cx="8" cy="15" r="3.6"/><path d="m10.6 12.4 8.4-8.4M16 7l2.5 2.5M13.5 9.5 15.5 11.5"/>'})[n]}</svg>`;
const aWrap=(inp,ic)=>`<div class="iw">${aIc(ic)}${inp}</div>`;
function aMsg(id,m,c){const e=aq('#'+id);if(e){e.textContent=m||'';e.className='am'+(c?' '+c:'')}}
function authShow(v){AV=v||AV;if(AV=='fp'){if(window.otpStart)return window.otpStart();AV='in'}let a=document.getElementById('auth');if(!a){a=document.createElement('div');a.id='auth';document.body.appendChild(a)}
 const lg=($('.logo')||{}).src||'',rem=(()=>{try{return localStorage.getItem('bb_rem')||''}catch(e){return ''}})(),reg=aget(),ex=!reg.adopted&&(()=>{try{const d=JSON.parse(localStorage.getItem('brokerbook_v1'));return d&&((d.c||[]).length||(d.l||[]).length)}catch(e){return 0}})();
 const hd=`<div class="ab"><img alt="" src="${lg}"><b>Broker<span>lynx</span></b><small>Smart Deals, Seamless Records</small></div>`;
 const ft=`<div class="tr"><span><svg viewBox="0 0 24 24"><path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9.5 4.1-1.9 7-5.3 7-9.5V6z"/><path d="m9 12 2.2 2.2L15 10.4"/></svg>Encrypted password</span><span><svg viewBox="0 0 24 24"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>Data stays on device</span></div>`;
 const pw=(id,lbl,ac)=>`<div class="af"><label for="${id}">${lbl}</label><div class="ap iw">${aIc('lock')}<input id="${id}" type="password" autocomplete="${ac}" autocapitalize="off" spellcheck="false"><button type="button" class="ae" aria-label="Show password" onclick="aEye('${id}',this)">Show</button></div></div>`;
 let h='';
 if(AV=='in')h=`${hd}<div class="ac"><div class="tg" role="tablist"><button type="button" class="on" onclick="authShow('in')">Sign In</button><button type="button" class="" onclick="authShow('up')">Sign Up</button></div><h1>Welcome back</h1><p>Sign in to continue managing your business with Brokerlynx.</p>
 <div class="af"><label for="ai_e">Email address</label>${aWrap(`<input id="ai_e" type="email" inputmode="email" autocomplete="username" autocapitalize="off" value="${esc(rem)}">`,'mail')}</div>
 ${pw('ai_p','Password','current-password')}
 <div class="ar"><label class="ak"><input type="checkbox" id="ai_r" ${rem?'checked':''}><span>Remember email</span></label><a href="#" onclick="authShow('fp');return false">Forgot password?</a></div>
 <div id="ai_m" class="am" role="alert"></div><button class="ag" id="ai_b" onclick="aSignIn()">Sign In</button>
 <div class="as">New to Brokerlynx? <a href="#" onclick="authShow('up');return false">Create an account</a></div></div>`;
 if(AV=='up')h=`${hd}<div class="ac"><div class="tg" role="tablist"><button type="button" class="" onclick="authShow('in')">Sign In</button><button type="button" class="on" onclick="authShow('up')">Sign Up</button></div><h1>Create your account</h1><p>Get started with your free trial.</p>
 ${ex?'<div class="an">Your existing contracts and records on this phone will be linked to this account.</div>':''}
 <div class="af"><label for="au_n">Full name or company name</label>${aWrap(`<input id="au_n" autocomplete="name" maxlength="60">`,'user')}</div>
 <div class="af"><label for="au_e">Email address</label>${aWrap(`<input id="au_e" type="email" inputmode="email" autocomplete="username" autocapitalize="off" maxlength="120">`,'mail')}</div>
 ${pw('au_p','Password','new-password')}
 <div class="sm" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div id="au_s" class="ah"></div>
 ${pw('au_c','Confirm password','new-password')}
 <label class="ak" style="margin:6px 0 10px"><input type="checkbox" id="au_t"><span>I agree to the <a href="#" onclick="aTerms();return false">Terms and Privacy Policy</a></span></label>
 <div id="au_m" class="am" role="alert"></div><button class="ag" id="au_b" onclick="aSignUp()" disabled>Create Account</button>
 <div class="as">Already have an account? <a href="#" onclick="authShow('in');return false">Sign in</a></div></div>`;
 a.innerHTML=`<div class="aw">${h}${ft}</div>`;
 const on=(id,fn)=>{const e=aq('#'+id);if(e)e.addEventListener('input',fn)};
 if(AV=='up'){const f=()=>aUpLive();['au_n','au_e','au_p','au_c','au_t'].forEach(i=>{on(i,f);const e=aq('#'+i);if(e&&e.type=='checkbox')e.addEventListener('change',f)})}
 const first=aq(AV=='in'?(rem?'#ai_p':'#ai_e'):'#au_n');if(first&&first.focus)try{first.focus()}catch(e){}
 a.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key=='Enter'){const b=a.querySelector('.ag:not([disabled])');if(b)b.click()}}))}
function aEye(id,b){const i=aq('#'+id);const s=i.type=='password';i.type=s?'text':'password';b.textContent=s?'Hide':'Show';b.setAttribute('aria-label',s?'Hide password':'Show password')}
function aMeter(pid,sid){const p=aq('#'+pid).value,r=pwCheck(p),m=aq('#'+pid).closest('.aw').querySelector('.sm'),s=aq('#'+sid);const n=p?(r.ok?r.s:1):0;m.className='sm l'+n;s.textContent=p?(r.ok?['','','Fair','Good','Strong'][r.s]+' password':r.m):'';s.style.color=p&&!r.ok?'#ff9d94':''}
function aUpLive(){const n=aq('#au_n').value.trim(),e=emN(aq('#au_e').value),p=aq('#au_p').value,c=aq('#au_c').value,t=aq('#au_t').checked;aMeter('au_p','au_s');
 let m='';if(e&&!emOk(e))m='Please enter a valid email address.';else if(c&&p!==c)m='Passwords do not match.';aMsg('au_m',m,'er');
 aq('#au_b').disabled=AB||!(n&&emOk(e)&&pwCheck(p).ok&&p===c&&t)}
function aTerms(){const d=document.createElement('div');d.className='at';d.innerHTML=`<div class="ap2" role="dialog" aria-modal="true" aria-label="Terms and Privacy"><div class="th"><div class="tt"><small>Legal</small><h2>Terms &amp; Privacy</h2></div><button type="button" class="tx" aria-label="Close" onclick="this.closest('.at').remove()"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="tb"><section class="ts"><i><svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></svg></i><div><h3>Your data</h3><p>Brokerlynx stores your contracts, ledgers and records on this phone. We do not upload them anywhere. Export a backup regularly, because uninstalling the app or clearing its data removes them.</p></div></section><section class="ts"><i><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20c.6-3.6 3.6-5.6 7.2-5.6s6.6 2 7.2 5.6"/></svg></i><div><h3>Your account</h3><p>Your account details stay on this phone. Passwords are stored only as a one-way hash. If you forget your password, we email a verification code to your registered address so you can set a new one.</p></div></section><section class="ts"><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg></i><div><h3>Free trial and lifetime access</h3><p>You get a ${CFG.TRIAL_DAYS}-day free trial with no limit on contracts. After the trial, lifetime access is a one-time payment of ${CFG.price()} and is unlocked only after the owner verifies your payment and approves it.</p></div></section><section class="ts"><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg></i><div><h3>Use of the app</h3><p>Brokerlynx is a record-keeping tool for your brokerage work. You are responsible for the accuracy and completeness of the information you enter, and for checking your records, reports and exported documents before relying on them. The app is provided on an &ldquo;as is&rdquo; basis, without warranties of any kind, and we are not liable for losses arising from errors in your data or from lost data when no backup exists.</p></div></section></div><div class="tf"><button class="ag" onclick="this.closest('.at').remove()">I Understand</button><div class="cp">&copy; ${new Date().getFullYear()} Brokerlynx. All rights reserved.</div></div></div>`;document.getElementById('auth').appendChild(d)}
async function aSignUp(){if(AB)return;const n=aq('#au_n').value.trim().replace(/\s+/g,' '),e=emN(aq('#au_e').value),p=aq('#au_p').value,c=aq('#au_c').value;
 if(!n)return aMsg('au_m','Please enter your name.','er');if(!e)return aMsg('au_m','Please enter your email address.','er');if(!emOk(e))return aMsg('au_m','Please enter a valid email address.','er');
 const r=pwCheck(p);if(!r.ok)return aMsg('au_m',r.m,'er');if(!c)return aMsg('au_m','Please confirm your password.','er');if(p!==c)return aMsg('au_m','Passwords do not match.','er');if(!aq('#au_t').checked)return aMsg('au_m','Please accept the Terms and Privacy Policy.','er');
 AB=1;aq('#au_b').disabled=true;aq('#au_b').textContent='Creating account...';
 try{const reg=aget();
  if(reg.list.some(x=>x.email==e)){aMsg('au_m','This email is already registered. Please Sign In instead.','er');AB=0;aq('#au_b').textContent='Create Account';aq('#au_b').disabled=false;return}
  const salt=rnd(16),h=await hpw(p,salt),id='a'+Date.now().toString(36)+b8(rnd(3));
  let hasData=0;try{const d=JSON.parse(localStorage.getItem('brokerbook_v1'));hasData=d&&((d.c||[]).length||(d.l||[]).length)}catch(x){}
  const k=(!reg.adopted&&hasData)?'brokerbook_v1':'bb_data_'+id;
  if(k=='brokerbook_v1')reg.adopted=1;else localStorage.setItem(k,JSON.stringify({l:[],c:[],n:1,co:{n,g:'',ph:'',em:e,ad:''}}));
  reg.list.push({id,k,email:e,name:n,s:b8(salt),h,at:new Date().toISOString()});
  if(!aput(reg)){try{if(k!='brokerbook_v1')localStorage.removeItem(k)}catch(x){}throw 0}
  aStart({id,k,e,n})}
 catch(x){AB=0;const b=aq('#au_b');if(b){b.textContent='Create Account';b.disabled=false}aMsg('au_m','Something went wrong. Please try again.','er')}}
function aStart(s){try{localStorage.setItem('bb_sess',JSON.stringify({id:s.id,k:s.k,e:s.e,n:s.n}));localStorage.setItem('bb_last',Date.now());sessionStorage.setItem('bb_skip','1');sessionStorage.removeItem('bb_lk')}catch(e){}location.reload()}
function aNoAcct(e){const m=aq('#ai_m');m.className='am er nb';m.innerHTML='<b>No account found</b><span>This email is not registered. Please Sign Up first to create your account.</span><button type="button" class="ag2" id="ai_su">Sign Up First</button>';aq('#ai_su').onclick=()=>{authShow('up');const x=aq('#au_e');if(x){x.value=e;x.dispatchEvent(new Event('input'))}const n=aq('#au_n');if(n)n.focus()}}
async function aSignIn(){if(AB)return;const e=emN(aq('#ai_e').value),p=aq('#ai_p').value;
 if(!e)return aMsg('ai_m','Please enter your email address.','er');if(!emOk(e))return aMsg('ai_m','Please enter a valid email address.','er');if(!p)return aMsg('ai_m','Please enter your password.','er');
 const lk=fLock();if(lk)return aMsg('ai_m','Too many attempts. Try again in '+lk+' seconds.','er');
 AB=1;const b=aq('#ai_b');b.disabled=true;b.textContent='Signing in...';
 try{const a=aget().list.find(x=>x.email==e);
  if(!a){AB=0;b.disabled=false;b.textContent='Sign In';return aNoAcct(e)}
  const ok=(await hpw(p,u8(a.s)))===a.h;
  if(!ok){fBad();aMsg('ai_m',fLock()?'Too many attempts. Try again in '+fLock()+' seconds.':'Incorrect password. Please check your password and try again.','er');AB=0;b.disabled=false;b.textContent='Sign In';return}
  fOk();try{if(aq('#ai_r').checked)localStorage.setItem('bb_rem',e);else localStorage.removeItem('bb_rem')}catch(x){}
  aStart({id:a.id,k:a.k,e:a.email,n:a.name})}
 catch(x){AB=0;b.disabled=false;b.textContent='Sign In';aMsg('ai_m','Something went wrong. Please try again.','er')}}
function aOut(){try{localStorage.removeItem('bb_sess')}catch(e){}location.reload()}
function logoMenu(){if(!SESS||$('#sh').innerHTML)return;sh(`<h2>Account</h2><div class="mu" style="margin:0 0 14px">${esc(ACC.n||'')}${ACC.e?' &middot; '+esc(ACC.e):''}</div><button class="btn d" onclick="aOut()">Log out</button><button class="btn s" style="margin-top:10px" onclick="cs()">Cancel</button>`)}
function authInit(){let skip=0;try{skip=sessionStorage.getItem('bb_skip');sessionStorage.removeItem('bb_skip')}catch(e){}
 if(skip){const s=document.getElementById('spl');if(s)s.remove()}
 if(!SESS){const f=document.getElementById('fto');if(f)f.remove();const s=document.getElementById('spl');
  authShow('in')}}
function acctView(){return `<div class="cd"><div class="r1"><b>${esc(ACC.n||'')}</b><span class="bd Completed">Signed in</span></div><div class="r3"><span>Email</span><b>${esc(ACC.e||'')}</b></div></div><div class="mu" style="margin:10px 0">Your data is stored on this phone under this account. Lifetime access is linked to this email.</div><button class="btn s" onclick="cpwf()">Change password</button><button class="btn d" style="margin-top:10px" onclick="arm(this,aOut)">Log out</button><div class="mu" style="margin-top:10px">You stay signed in until you log out. Logging out keeps all your data on this phone; sign in again with your email and password.</div>`}
function cpwf(){sh(`<h2>Change password</h2><div class="f"><span>Current password</span><input id="cp0" type="password" autocomplete="current-password"></div><div class="f"><span>New password</span><input id="cp1" type="password" autocomplete="new-password"></div><div class="f"><span>Confirm new password</span><input id="cp2" type="password" autocomplete="new-password"></div><div id="er" class="er"></div><button class="btn" id="cpb" onclick="cpws()">Change password</button>`)}
async function cpws(){const er=m=>{$('#er').textContent=m},o=$('#cp0').value,p=$('#cp1').value,q=$('#cp2').value;if(!o)return er('Enter your current password.');const r=pwCheck(p);if(!r.ok)return er(r.m);if(p!==q)return er('Passwords do not match.');
 const lk=fLock();if(lk)return er('Too many attempts. Try again in '+lk+' seconds.');
 const reg=aget(),a=reg.list.find(x=>x.id==ACC.id);if(!a)return er('Account not found.');if((await hpw(o,u8(a.s)))!==a.h){fBad();return er('Current password is incorrect.')}
 fOk();const salt=rnd(16);a.s=b8(salt);a.h=await hpw(p,salt);if(!aput(reg))return er('Could not save. Please try again.');cs();toast('Password changed')}
