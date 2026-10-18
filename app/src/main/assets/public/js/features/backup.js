/* Brokerlynx module: features/backup
   Backup export, restore, snapshots, reminders.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

const BKI='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5.5c0 4.2 2.9 7.6 7 9.5 4.1-1.9 7-5.3 7-9.5V6z"/><path d="M12 8.5v5M9.8 11.5 12 13.7l2.2-2.2"/></svg>';
function bkInfo(){const has=(db.c||[]).length+(db.l||[]).length+(db.o||[]).length>0,lb=db.lb?new Date(db.lb):null,days=lb?Math.floor((Date.now()-lb)/864e5):null;return{has,lb,days,lvl:!has?'none':(days===null||days>=30)?'due':days>=23?'soon':'ok',left:days===null?0:Math.max(0,30-days)}}
function bkCard(){const b=bkInfo();if(b.lvl!='due'&&b.lvl!='soon')return '';return `<div class="bkc ${b.lvl}"><div class="bi">${BKI}</div><div class="bt"><b>${b.lvl=='due'?'Monthly backup due':'Backup due in '+b.left+' day'+(b.left==1?'':'s')}</b><span>${b.days===null?'You have not backed up yet. Your data is stored only on this phone.':'Last backup was '+b.days+' day'+(b.days==1?'':'s')+' ago. Your data is stored only on this phone.'}</span></div><button onclick="expBk()">Back up</button></div>`}
const LN=()=>{try{return window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications}catch(e){return null}};
async function bkSched(ask){const L=LN();if(!L||!SESS)return 0;
 try{let p=await L.checkPermissions();if(p.display!=='granted'){if(!ask)return 0;p=await L.requestPermissions();if(p.display!=='granted')return 0}
  await L.cancel({notifications:Array.from({length:10},(_,i)=>({id:7101+i}))});
  const b=bkInfo();if(!b.has)return 1;const now=Date.now();let base=b.lb?+b.lb:now;const offs=b.lb?[30,33,37,44,60,90]:[3,7,14,30];
  const mk=d=>{const t=new Date(base+d*864e5);t.setHours(10,0,0,0);return t};let ts=offs.map(mk).filter(t=>t.getTime()>now+36e5);
  if(!ts.length){base=now;ts=[1,4,10,30].map(mk)}
  await L.schedule({notifications:ts.map((t,i)=>({id:7101+i,title:'Time to back up Brokerlynx',body:'Your data is stored only on this phone. Open the app and tap Back up to save a copy.',schedule:{at:t,allowWhileIdle:true},smallIcon:'ic_stat_backup',iconColor:'#B98429',extra:{bk:1}}))});
  return 1}catch(e){return 0}}
async function bkRemOn(){if(!LN())return toast('Reminders need the latest version of the app');const r=await bkSched(true);db.rm=r?1:0;save();toast(r?'Monthly reminders are on':'Notifications are blocked. Allow them in phone Settings > Apps > Brokerlynx');render()}
const BELL='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 17V11a6 6 0 1112 0v6l1.5 2h-15z"/><path d="M10 21h4"/></svg>';
function bkRem(){return `<div class="bkc ok rmc"><div class="bi">${BELL}</div><div class="bt"><b>Phone reminders</b><span>${db.rm?'On. You will get a notification when your monthly backup is due, even when the app is closed.':'Get a notification on your phone when your monthly backup is due.'}</span></div><button onclick="bkRemOn()">${db.rm?'Refresh':'Turn on'}</button></div>`}
function bkNudge(f){if(!SESS)return;const b=bkInfo();if(b.lvl!='due')return;const d=new Date().toDateString();if((!f&&db.bn===d)||document.querySelector('#sh .ov')||document.getElementById('pvw'))return;db.bn=d;save();
 sh(`<div class="ul bkn"><div class="bkh"><div class="bi big">${BKI}</div><span class="hb">MONTHLY BACKUP</span><h2>Time to back up your data</h2><p>Your contracts, ledgers and delivery orders are stored only on this phone. If the phone is lost, reset or the app is uninstalled, they cannot be recovered without a backup file.</p></div><div class="bks"><div><i>1</i>Tap <b>Back up now</b></div><div><i>2</i>Save the file to Google Drive, email or WhatsApp</div><div><i>3</i>Repeat every month</div></div><div class="mu" style="text-align:center;margin-bottom:12px">${b.days===null?'You have not made a backup yet.':'Last backup: '+b.days+' days ago.'}</div><button class="btn" onclick="cs();expBk()">Back up now</button><button class="btn s" style="margin-top:10px" onclick="cs()">Remind me tomorrow</button></div>`)}
const cntDb=x=>({contracts:(x.c||[]).length,ledgers:(x.l||[]).length,deliveryOrders:(x.o||[]).length,items:(x.i||[]).length,brokers:(x.br||[]).length,brokerPayments:(x.bp||[]).length});
/* Security: ids are placed inside inline click handlers, so a hostile backup file could smuggle code through them.
   Legitimate ids only ever contain letters, digits, _ . - ; anything else is replaced by _ (the same way everywhere,
   so references between records stay intact). Applied to every restore; clean files are left byte-for-byte unchanged. */
const idCl=v=>typeof v=='string'?v.replace(/[^A-Za-z0-9_.\-]/g,'_'):v;
function idClean(x){if(!x||typeof x!='object')return x;const L=(a,ks)=>{if(Array.isArray(a))a.forEach(o=>{if(o&&typeof o=='object')ks.forEach(k=>{if(k in o)o[k]=idCl(o[k])})})};
 ['l','c','o','i','t','vh','br','bp'].forEach(n=>L(x[n],['id']));L(x.c,['b','s']);L(x.o,['c']);L(x.vh,['t']);L(x.bp,['bid','cid','aid']);
 if(Array.isArray(x.c))x.c.forEach(c=>L(c&&c.ba,['bid']));return x}
const okDb=x=>!!x&&Array.isArray(x.l)&&Array.isArray(x.c)&&x.l.every(l=>l&&l.id)&&x.c.every(c=>c&&c.id)&&(!x.o||Array.isArray(x.o)&&x.o.every(o=>o&&o.id))&&(!x.i||Array.isArray(x.i))&&brOk(x);
async function deliverBackup(blob,fn,title){try{return !!(await savePdf_(blob,fn,title))}catch(e){if(!/cancel|declined/i.test(String(e&&(e.message||e.code)||e)))toast('Could not save the backup');return false}}
const fnvS=s=>{let a=2166136261,b=5381;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a=Math.imul(a^c,16777619)>>>0;b=(Math.imul(b,33)^c)>>>0}return 'f:'+a.toString(16).padStart(8,'0')+b.toString(16).padStart(8,'0')+s.length.toString(16)};
async function dbSum(x,ref){const s=JSON.stringify(x);if((ref&&String(ref).startsWith('f:'))||!(window.crypto&&crypto.subtle))return fnvS(s);const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(d),v=>v.toString(16).padStart(2,'0')).join('')}
async function expBk(){const at=new Date().toISOString(),bid='BKL-'+at.replace(/\D/g,'').slice(0,17),dbx=Object.assign({},db,{lb:at,ow:emN(ACC.e)});{const ts=ACX.trial().start;if(ts&&(!dbx.tr||Date.parse(dbx.tr)>ts))dbx.tr=new Date(ts).toISOString()}let txt,sum;
 try{sum=await dbSum(dbx);txt=JSON.stringify({app:'Brokerlynx',format:2,id:bid,at,counts:cntDb(dbx),sum,db:dbx});const t=JSON.parse(txt);if(!t.db||await dbSum(t.db,sum)!==sum)throw 0}catch(e){return toast('Backup check failed. Nothing was saved. Please try again')}
 if(await deliverBackup(new Blob([txt],{type:'application/json'}),'Brokerlynx-Backup_'+monYr()+'_'+stamp()+'_'+bid.slice(-5)+'.json','Brokerlynx backup')){db.lb=at;db.bn=0;save();const w=document.getElementById('fullw');toast('Backup saved (ID '+bid+'). Keep it somewhere safe');render();bkSched(db.rm===undefined).then(r=>{if(r||db.rm===undefined){db.rm=r?1:0;save()}})}}
function rsf(inp){const f=inp.files&&inp.files[0];if(!f)return;const r=new FileReader();r.onload=async()=>{inp.value='';let o;try{o=JSON.parse(String(r.result).replace(/^﻿/,''))}catch(e){return toast('This file is not a valid backup')}
 if(o&&o.app&&o.app!=='Brokerlynx')return toast('This is not a Brokerlynx backup file');if(o&&o.format>2)return toast('This backup was made by a newer version of Brokerlynx. Please update the app first');
 let legacy=true;if(o&&o.sum){let ck='';try{ck=await dbSum(o.db,o.sum)}catch(e){}if(ck!==o.sum)return toast('This backup file is damaged or was edited. It was not restored');legacy=false}
 const x=o&&o.db?o.db:o;if(!okDb(x))return toast('This file is not a Brokerlynx backup');idClean(x);
 if(x.ow&&ACC.e&&x.ow!==emN(ACC.e))return toast('This backup belongs to another account ('+x.ow.replace(/^(.).*(@.*)$/,'$1***$2')+'). Sign in with that account to restore it');
 PEND={raw:JSON.stringify(x),at:o.at||'',n:cntDb(x),src:f.name,legacy};rsv()};r.readAsText(f)}
function rss(k){const s=snapList().find(x=>x.k==k);if(!s)return;let x;try{x=JSON.parse(s.raw)}catch(e){return toast('This snapshot is damaged')}if(!okDb(x))return toast('This snapshot is damaged');idClean(x);PEND={raw:JSON.stringify(x),at:s.at,n:cntDb(x),src:s.label};rsv()}
function rsv(){const n=PEND.n;sh(`<h2>Restore this backup?</h2><div class="kv"><div class="w"><span>Source</span><b>${esc(PEND.src)}</b></div><div class="w"><span>Saved on</span><b>${PEND.at?esc(fd(ymd(new Date(PEND.at)))+', '+t12(p2(new Date(PEND.at).getHours())+':'+p2(new Date(PEND.at).getMinutes()))):'Unknown'}</b></div><div><span>Contracts</span><b>${n.contracts}</b></div><div><span>Ledgers</span><b>${n.ledgers}</b></div><div><span>Delivery orders</span><b>${n.deliveryOrders}</b></div><div><span>Items</span><b>${n.items}</b></div>${n.brokers||n.brokerPayments?`<div><span>Brokers</span><b>${n.brokers}</b></div><div><span>Broker payments</span><b>${n.brokerPayments}</b></div>`:''}</div>${PEND.legacy===false?'<p class="mu" style="color:#2F855A;font-weight:700">File check passed. This backup is complete and unchanged.</p>':PEND.legacy===true?'<p class="mu" style="color:#B7791F">This is an older backup file without a damage check.</p>':''}<p class="mu">This replaces everything in the app with the data above. A snapshot of your current data is kept first, so you can undo it from the snapshot list.</p><div class="acts" style="grid-template-columns:1fr"><button class="btn d" onclick="arm(this,rsdo)">Replace current data</button></div>`)}
function rsMerge(raw){const x=JSON.parse(raw);let kept='';
 if(PREM&&db.lic){x.lic=db.lic;x.dev=db.dev;delete x.req;delete x.rec;kept='lic'}
 else if(x.lic){delete x.req;delete x.rec}
 else{if(db.dev)x.dev=db.dev;if(db.lic)x.lic=db.lic;if(db.req)x.req=db.req;else delete x.req;if(db.rec)x.rec=db.rec;else delete x.rec}
 return{raw:JSON.stringify(x),kept}}
function rsdo(){if(!PEND)return;const prev=localStorage.getItem(K)||JSON.stringify(db);snapNow('Before restore',prev);
 let M;try{M=rsMerge(PEND.raw);if(!okDb(JSON.parse(M.raw)))throw 0}catch(e){return toast('This backup could not be verified. Your current data was kept safe')}
 const want=cntDb(JSON.parse(M.raw)),WR=M.raw;
 const put=()=>{localStorage.setItem(K,WR);if(localStorage.getItem(K)!==WR)return false;const b=JSON.parse(localStorage.getItem(K)),g=cntDb(b);return g.contracts===want.contracts&&g.ledgers===want.ledgers&&g.deliveryOrders===want.deliveryOrders&&g.brokers===want.brokers&&g.brokerPayments===want.brokerPayments};let ok=0;
 try{ok=put()}catch(e){try{snapKeys().filter(k=>!/Before restore/.test(localStorage.getItem(k)||'')).forEach(k=>localStorage.removeItem(k));ok=put()}catch(e2){}}
 if(!ok){let rb=0;try{if(localStorage.getItem(K)!==prev)localStorage.setItem(K,prev)}catch(e){}try{rb=localStorage.getItem(K)===prev}catch(e){}return toast(rb?'Could not restore. Your current data was kept safe':'Restore failed. Open Masters > Backup > Automatic snapshots to recover your data')}
 const kp=M.kept;PEND=null;cs();toast(kp?'Restored. Your lifetime access was kept. Reloading':'Restored. Reloading');setTimeout(()=>{try{location.reload()}catch(e){}},500)}
