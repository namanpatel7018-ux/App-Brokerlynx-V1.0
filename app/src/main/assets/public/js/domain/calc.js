/* Brokerlynx module: domain/calc
   Contract maths: quantities, amounts, brokerage, status.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

const L=id=>db.l.find(x=>x.id==id),C=id=>db.c.find(x=>x.id==id),ln=id=>L(id)?L(id).name:'(deleted)';
const dv=c=>(c.d||[]).reduce((s,x)=>s+x.q,0),pe=c=>Math.max(0,+(c.q-dv(c)).toFixed(3));
const st=c=>c.x?'Cancelled':pe(c)<=0?'Completed':c.v<ymd(new Date())?'Expired':'Pending';
const open=c=>{const s=st(c);return s=='Pending'||s=='Expired'};
const KG=c=>c&&(c.ru=='g'||c.ru=='q'),uq=c=>c&&c.ru=='n'?'Nos':KG(c)?'Kgs':'MT',mul=c=>c&&(c.ru=='m'||c.ru=='n'||c.ru=='q')?1:c&&c.ru=='g'?.1:100,t10=c=>KG(c)?.1:100,rtS=c=>({k:'10 kg',m:'MT',n:'Nos',g:'10 kg',q:'kg'}[(c&&c.ru)||'k']);
const amtOf=(c,q)=>c.ru=='g'?q/10*c.r:q*mul(c)*c.r;
const vq=(c,q)=>n3(q)+' '+uq(c),kgT=(c,q)=>uq(c)=='MT'?'  ('+n3(q*1000)+' kg)':KG(c)?'  ('+n3(q/1000)+' MT)':'';
const qkg=(c,q)=>uq(c)=='MT'?Math.round(q*1000):KG(c)?q:'';
const altR=c=>({k:['Rate per MT',c.r*100],g:['Rate per MT',c.r*100],m:['Rate per 10 kg',c.r/100],q:['Rate per MT',c.r*1000]}[c.ru||'k']||null);
const qsum=(a,f=c=>c.q,h)=>{const t={MT:0,Kgs:0,Nos:0};a.forEach(c=>{t[uq(c)]+=f(c)});const p=[];['MT','Kgs','Nos'].forEach(u=>{if(t[u]||(u=='MT'&&!t.Kgs&&!t.Nos))p.push(n3(t[u])+(h?'<span>'+u+'</span>':' '+u))});return p.join(h?' + ':' + ')};
const val=c=>amtOf(c,c.q);
const ML=['J','F','M','A','M','J','J','A','S','O','N','D'];
const bkPend=c=>!c.bkT||!(c.bkR>0)||c.x?0:c.bkT=='mt'?pe(c)*c.bkR:c.bkT=='pm'?pe(c)/1000*c.bkR:c.bkT=='q'?pe(c)*t10(c)*c.bkR:amtOf(c,pe(c))*c.bkR/100;
const bkSh=(c,p)=>{const k=c.bkP||'x';return k=='x'?(c.b==p?.5:0)+(c.s==p?.5:0):k=='b'?(c.b==p?1:0):(c.s==p?1:0)};
function partyBk(rows){const m={};rows.forEach(c=>{[c.b,c.s].forEach((p,i)=>{const sh=bkSh(c,p);if(!(sh>0)||!(bkAmt(c)>0))return;const o=m[p]||(m[p]={id:p,n:0,nb:0,ns:0,t:0,p:0});o.n++;o.t+=bkAmt(c)*sh;o.p+=bkPend(c)*sh;i?o.ns++:o.nb++})});return Object.values(m).sort((a,b)=>b.p-a.p||ln(a.id).localeCompare(ln(b.id)))}
const doMatch=(o,q)=>{const c=C(o.c)||{};return !q||(o.no+(o.on||'')+o.vn+o.tn+o.lr+(c.no||'')+(c.on||'')+ln(c.b)+ln(c.s)+(c.item||'')).toLowerCase().includes(q)};
const remDo=(c,ex)=>Math.max(0,+(c.q-dv(c)+(((c.d||[]).find(e=>ex&&e.do==ex))||{q:0}).q).toFixed(3));
const bkAmt=c=>!c.bkT||!(c.bkR>0)?0:c.bkT=='mt'?c.q*c.bkR:c.bkT=='pm'?c.q/1000*c.bkR:c.bkT=='q'?c.q*t10(c)*c.bkR:val(c)*c.bkR/100;
const txT=c=>({i:'Taxes Included',e:'+GST'}[c.tx]||'');
const bkTxt=(c,f)=>{f=f||inr;return !c.bkT||!(c.bkR>0)?'':c.bkT=='pc'?c.bkR+'% of value':f(c.bkR)+(c.bkT=='mt'?' per '+(KG(c)?'kg':uq(c)):c.bkT=='pm'?' per MT':' per 10 kg')};
const bkLine=(c,f)=>c.bkT&&c.bkR>0?bkTxt(c,f)+'  =  '+f(bkAmt(c)):(c.bk||'');
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
