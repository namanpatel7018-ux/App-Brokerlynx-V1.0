/* Brokerlynx module: domain/numbering
   Contract / delivery-order numbering and its one-time migrations.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

const ymNow=()=>{const n=new Date();return n.getFullYear()+'-'+p2(n.getMonth()+1)};
const mkNo=(pre,arr)=>{const n=new Date(),Lt=pre+ML[n.getMonth()],y=String(n.getFullYear()).slice(-2),re=new RegExp('^'+Lt+'(\\d+)'+y+'$'),ym=ymNow(),v=arr.filter(x=>(x.cm||x.dt.slice(0,7))==ym).map(x=>{const m=re.exec(x.no);return m?+m[1]:-1}).filter(k=>k>=0);return Lt+(v.length?Math.max(...v)+1:0)+y};
const MON=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],BTZ='Asia/Kolkata';
const bizYM=()=>{const p={};new Intl.DateTimeFormat('en-US',{timeZone:BTZ,year:'numeric',month:'2-digit'}).formatToParts(new Date()).forEach(x=>p[x.type]=x.value);return p.year+'-'+p.month};
const coP=()=>{const m=String(CO().n||'').match(/[A-Za-z]/);return m?m[0].toUpperCase():'S'};
const fmtNo=(ym,n,pre=coP(),sep='-')=>pre+sep+MON[+ym.slice(5,7)-1]+sep+n+sep+ym.slice(2,4);
const seqOf=(no,ym,pre=coP())=>{const m=new RegExp('^'+pre+'-?'+MON[+ym.slice(5,7)-1]+'-?(\\d+)-?'+ym.slice(2,4)+'$').exec(String(no||''));return m?+m[1]:-1};
const peekSeq=(ym,arr=db.c,sq=db.sq,pre=coP())=>Math.max(sq[ym]||0,...arr.map(c=>seqOf(c.no,ym,pre)+1),1);
const nextNo=()=>fmtNo(bizYM(),peekSeq(bizYM()));
const allocNo=(arr=db.c,k='sq',pre=coP())=>{const ym=bizYM();db[k]=db[k]||{};let n=peekSeq(ym,arr,db[k],pre);while(arr.some(c=>c.no==fmtNo(ym,n,pre)))n++;db[k][ym]=n+1;return fmtNo(ym,n,pre)};
const allocDo=()=>allocNo(db.o,'sqo','DO'+coP());
function migNo(){if(db.nv>=3)return;const bak=JSON.stringify(db);try{localStorage.setItem(K+'_pre_numbering_backup',bak)}catch(e){}
 try{const g={};db.c.forEach((c,i)=>{const ym=(c.dt||'').slice(0,7)||c.cm||bizYM();(g[ym]=g[ym]||[]).push({c,i})});
  Object.keys(g).sort().forEach(ym=>{g[ym].sort((a,b)=>(a.c.dt||'').localeCompare(b.c.dt||'')||(a.c.tm||'').localeCompare(b.c.tm||'')||a.i-b.i).forEach((x,k)=>{const nn=fmtNo(ym,k,'S','');if(x.c.no!=nn&&!x.c.on)x.c.on=x.c.no;x.c.no=nn});db.sq[ym]=g[ym].length});
  const b0=JSON.parse(bak),ids=new Set(db.c.map(c=>c.id)),nos=new Set(db.c.map(c=>c.no));
  if(nos.size!=db.c.length||b0.c.length!=db.c.length||b0.c.some(c=>!ids.has(c.id))||b0.o.length!=db.o.length||JSON.stringify(b0.o)!=JSON.stringify(db.o)||db.c.some((c,i)=>JSON.stringify({...c,no:0,on:0})!=JSON.stringify({...b0.c[i],no:0,on:0})))throw new Error('validation failed');
  db.nv=3;db.mig={at:new Date().toISOString(),n:db.c.length};save()}
 catch(e){db=JSON.parse(bak);db.sq=db.sq||{};try{localStorage.setItem(K,bak)}catch(_){}console.error('Numbering migration rolled back',e)}}
function migDo(){if(db.nv>=4)return;const bak=JSON.stringify(db);try{localStorage.setItem(K+'_pre_do_numbering_backup',bak)}catch(e){}
 try{db.sqo=db.sqo||{};const g={};db.o.forEach((o,i)=>{const ym=(o.dt||'').slice(0,7)||o.cm||bizYM();(g[ym]=g[ym]||[]).push({o,i})});
  Object.keys(g).sort().forEach(ym=>{g[ym].sort((a,b)=>(a.o.dt||'').localeCompare(b.o.dt||'')||a.i-b.i).forEach((x,k)=>{const nn=fmtNo(ym,k,'DOS','');if(x.o.no!=nn&&!x.o.on)x.o.on=x.o.no;x.o.no=nn});db.sqo[ym]=g[ym].length});
  const b0=JSON.parse(bak),ids=new Set(db.o.map(o=>o.id)),nos=new Set(db.o.map(o=>o.no)),cids=new Set(db.c.map(c=>c.id));
  if(nos.size!=db.o.length||b0.o.length!=db.o.length||b0.o.some(o=>!ids.has(o.id))||JSON.stringify(b0.c)!=JSON.stringify(db.c)||db.o.some((o,i)=>JSON.stringify({...o,no:0,on:0})!=JSON.stringify({...b0.o[i],no:0,on:0}))||db.o.some(o=>!cids.has(o.c)&&b0.c.some(c=>c.id==o.c)))throw new Error('validation failed');
  db.nv=4;db.migDo={at:new Date().toISOString(),n:db.o.length};save()}
 catch(e){db=JSON.parse(bak);db.sq=db.sq||{};db.sqo=db.sqo||{};try{localStorage.setItem(K,bak)}catch(_){}console.error('Delivery order numbering rolled back',e)}}
const nextDo=()=>{const p='DO'+coP();return fmtNo(bizYM(),peekSeq(bizYM(),db.o,db.sqo,p),p)};
