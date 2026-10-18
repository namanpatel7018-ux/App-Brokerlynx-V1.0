/* Brokerlynx module: core/storage
   Storage helpers: snapshots, company record, save().
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

function snapKeys(){const k=[];try{for(let i=0;i<localStorage.length;i++){const n=localStorage.key(i);if(n&&n.startsWith(SNP))k.push(n)}}catch(e){}return k.sort()}
function snapNow(label,raw){try{const ks=snapKeys();while(ks.length>=5)localStorage.removeItem(ks.shift());let tot=0;ks.forEach(k=>tot+=(localStorage.getItem(k)||'').length);while(ks.length&&tot+String(raw).length>15e5){const k=ks.shift();tot-=(localStorage.getItem(k)||'').length;localStorage.removeItem(k)}localStorage.setItem(SNP+Date.now()+'_'+Math.random().toString(36).slice(2,5),JSON.stringify({at:new Date().toISOString(),label,raw}))}catch(e){}}
function snapList(){const a=[];snapKeys().forEach(k=>{try{const v=JSON.parse(localStorage.getItem(k));a.push({k,at:v.at,label:v.label,raw:v.raw})}catch(e){}});return a.sort((x,y)=>y.at.localeCompare(x.at))}
const CODEF={n:'Sunshine Industries',g:'',ph:'7984324410',em:'sunshineindust@gmail.com',ad:''};
const CO=()=>Object.assign({},CODEF,db.co||{});
const coLine=g=>{const o=CO();return[g!==0&&o.g?'GSTIN: '+o.g:'',o.ph?'Tel: '+o.ph:'',o.em?'Email: '+o.em:''].filter(Boolean).join('   |   ')};
const save=()=>{try{const d=new Date(),day=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),prev=localStorage.getItem(K);if(prev&&db.sd!==day){db.sd=day;snapNow('Automatic daily snapshot',prev)}
 const s=JSON.stringify(db);try{localStorage.setItem(K,s)}catch(e){let ok=0;for(const k of snapKeys()){localStorage.removeItem(k);try{localStorage.setItem(K,s);ok=1;break}catch(_){}}if(!ok)throw e}
 if(SVF){SVF=0;const w=document.getElementById('fullw');if(w)w.remove()}}catch(e){SVF=1;fullWarn()}};
function fullWarn(){if(document.getElementById('fullw')||!document.body)return;const w=document.createElement('div');w.id='fullw';w.className='fullw';w.innerHTML='<span><b>Storage is full.</b> Your latest changes are not saved. Back up your data now, then free some space on the phone.</span><button onclick="expBk()">Back up</button>';document.body.appendChild(w)}
