/* Brokerlynx module: features/brokers
   Brokers (dalals) master, brokerage payments to them, broker-wise statements, and the
   searchable broker picker used inside the contract form. Rules live in domain/brokerage.js. */
let BRE='',BPE='',BPB='',BAR=[],BAQ={open:-1,q:'',add:0};
const brIn=(k,s)=>{const q=String(k||'').trim().toLowerCase();return !q||(s.name+' '+(s.ph||'')).toLowerCase().includes(q)};
const brPlural=(n,w)=>n+' '+w+(n==1?'':'s');
/* ---------- Masters > Brokers ---------- */
function broList(){
 const t=broTotals(),rows=t.rows.slice().sort((a,b)=>(a.b.act===0)-(b.b.act===0)||a.b.name.localeCompare(b.b.name));
 if(!rows.length&&!t.allocated)return `<div class="emp"><b>No brokers yet</b>Add each broker (dalal) once, then share a contract's brokerage with them from the contract form.<br><button class="btn" style="margin-top:14px" onclick="brf()">+ Add broker</button></div>`;
 return `<div class="hero"><small>Brokerage still to pay to brokers</small><div class="big">${inr(t.balance)}</div><div class="st"><div><small>Shared with brokers</small><b>${inr(t.allocated)}</b></div><div><small>Paid</small><b>${inr(t.paid)}</b></div><div><small>Brokers</small><b>${rows.length}</b></div></div></div>`
 +(t.unDeals?`<div class="mu" style="margin:-4px 0 12px">${inr(t.unassigned)} of brokerage on ${brPlural(t.unDeals,'contract')} is not shared with any broker (Unassigned). Open the contract and tap Edit to assign it.</div>`:'')
 +rows.map(({b,s})=>`<div class="cd" onclick="brv('${b.id}')"><div class="r1"><b>${esc(b.name)}</b>${b.act===0?'<span class="bd Cancelled">Inactive</span>':`<b>${inr(s.balance)}</b>`}</div><div class="r3"><span>${b.ph?esc(b.ph)+' · ':''}${brPlural(s.deals.length,'deal')}</span><span>${b.act===0?'Balance '+inr(s.balance):'to pay'}</span></div><div class="r3"><span>Payable <b>${inr(s.payable)}</b></span><span>Paid <b>${inr(s.paid)}</b></span></div></div>`).join('')}
/* ---------- broker form ---------- */
function brf(id){if(ACX.guard())return;BRE=id||'';const b=broGet(id)||{};
 sh(`<h2>${id?'Edit broker':'New broker'}</h2>
 <div class="f"><span>Broker name</span><input id="brn" value="${esc(b.name||'')}" placeholder="e.g. Ramesh Patel"></div>
 <div class="f"><span>Mobile (optional)</span><input id="brp" type="tel" inputmode="numeric" maxlength="10" value="${esc(b.ph||'')}" placeholder="10-digit mobile" oninput="phLive(this)"></div>
 <div class="f"><span>Note (optional)</span><input id="brm" value="${esc(b.note||'')}"></div>
 <div id="er" class="er"></div><button class="btn" onclick="brs()">Save broker</button>
 ${id?`<div class="acts"><button class="btn s" onclick="brAct('${id}')">${b.act===0?'Reactivate':'Deactivate'}</button><button class="btn d" onclick="arm(this,()=>brDel('${id}'))">Delete</button></div><div class="mu">A broker with deals or payments cannot be deleted. Deactivate it instead: it stays in all history and is hidden from new contracts.</div>`:''}`)}
function brCheckNew(name,phRaw,self){name=String(name||'').replace(/\s+/g,' ').trim();if(!name)return{e:'Enter the broker name'};
 if(broAll().some(b=>nk(b.name)==nk(name)&&b.id!=self))return{e:'A broker named '+name+' already exists'};
 let ph=String(phRaw||'').trim();if(ph){ph=phNorm(ph);if(!phOk(ph))return{e:'Enter a valid 10-digit mobile number or leave it empty'}}
 return{name,ph}}
function brs(){if(ACX.guard())return;const er=m=>{$('#er').textContent=m},r=brCheckNew($('#brn').value,$('#brp').value,BRE);if(r.e)return er(r.e);
 const o=BRE&&broGet(BRE),note=$('#brm').value.trim();
 if(o){o.name=r.name;o.ph=r.ph;o.note=note}else broW().push({id:uid(),name:r.name,ph:r.ph,note,act:1,at:new Date().toISOString()});
 save();cs();render();toast('Broker saved')}
function brAct(id){if(ACX.guard())return;const b=broGet(id);if(!b)return;b.act=b.act===0?1:0;save();cs();render();toast(b.act===0?'Broker deactivated. History is kept':'Broker reactivated')}
function brDel(id){if(ACX.guard())return;if(db.c.some(c=>baOf(c).some(a=>a.bid==id))||bpayAll().some(p=>p.bid==id))return toast('Cannot delete: this broker has deals or payments. Deactivate instead');
 db.br=broAll().filter(b=>b.id!=id);save();cs();render();toast('Broker deleted')}
/* ---------- broker detail: deals, balances, payment history ---------- */
function brv(id){const b=broGet(id);if(!b)return;const s=broStats(id);
 sh(`<div class="r1"><h2 style="margin:0">${esc(b.name)}</h2>${b.act===0?'<span class="bd Cancelled">Inactive</span>':''}</div>${b.ph?`<div class="mu" style="margin:4px 0 6px">${esc(b.ph)}</div>`:''}
 <div class="hero" style="margin-top:8px"><small>Balance to pay</small><div class="big">${inr(s.balance)}</div><div class="st"><div><small>Brokerage payable</small><b>${inr(s.payable)}</b></div><div><small>Paid</small><b>${inr(s.paid)}</b></div><div><small>Deals</small><b>${s.deals.length}</b></div></div></div>
 ${s.balance<-0.004?'<div class="hint" style="color:#B42318;margin:-4px 0 10px">Paid is more than payable (for example a contract was cancelled after payment).</div>':''}
 <div class="sec">Deals</div>${s.deals.length?s.deals.map(d=>`<div class="cd" onclick="vc('${d.c.id}')"><div class="r1"><b>${esc(d.c.no)}</b><span class="bd ${baCls(d.status)}">${d.status}</span></div><div class="r3"><span>${fd(d.c.dt)} · ${esc(d.c.item)}</span><span>Share <b>${inr(d.share)}</b></span></div><div class="r3"><span>${esc(ln(d.c.b))} from ${esc(ln(d.c.s))}</span><span>Paid <b>${inr(d.paid)}</b> · Left <b>${inr(d.bal)}</b></span></div><div class="r3"><span></span><span><button class="btn2" style="padding:8px 14px" onclick="event.stopPropagation();brCPdf('${d.c.id}','${d.a.id}')">PDF</button>${!d.c.x&&d.bal>0.004?` <button class="btn2" style="padding:8px 14px" onclick="event.stopPropagation();bpf('${id}','${d.c.id}','${d.a.id}')">Pay</button>`:''}</span></div></div>`).join(''):'<div class="mu" style="margin-bottom:8px">No contract brokerage is shared with this broker yet.</div>'}
 <div class="sec">Payment history</div>${s.pays.length?s.pays.map(p=>`<div class="dl" onclick="bpf('${id}','','','${p.id}')" style="cursor:pointer"><span><b>${inr(p.amt)}</b> <span class="mu">· ${fd(p.dt)} · ${esc(p.mode||'')}${p.ref?' · '+esc(p.ref):''}</span><br><span class="mu">${esc(p.cn||'')}${p.note?' · '+esc(p.note):''}</span></span></div>`).join(''):'<div class="mu" style="margin-bottom:8px">No payments recorded.</div>'}
 <div class="acts" style="grid-template-columns:1fr"><button class="btn" onclick="bpf('${id}')">Record payment</button></div>
 <div class="acts"><button class="btn s" onclick="brPdf('${id}')">PDF statement</button><button class="btn s" onclick="brCsv('${id}')">CSV</button></div>
 <div class="acts" style="grid-template-columns:1fr"><button class="btn s" onclick="brf('${id}')">Edit broker</button></div>`)}
/* ---------- payments to a broker ---------- */
function bpf(bid,cid,aid,pid){if(ACX.guard())return;const p=pid&&bpayAll().find(x=>x.id==pid);if(pid&&!p)return;const b=broGet(p?p.bid:bid);if(!b)return;
 const s=broStats(b.id),mine=d=>p&&d.c.id==p.cid&&d.a.id==p.aid,opts=s.deals.filter(d=>!d.c.x&&(d.bal>0.004||mine(d)));
 if(!pid&&cid&&aid&&!opts.some(d=>d.c.id==cid&&d.a.id==aid))return toast('This deal has nothing left to pay');
 if(!opts.length)return sh(`<h2>Record payment</h2><p class="mu">${esc(b.name)} has no unpaid brokerage. Share a contract's brokerage with this broker first (contract form, Brokerage).</p><button class="btn" onclick="brv('${b.id}')">Back</button>`);
 const av=d=>brR2(d.eff-d.paid+(mine(d)?+p.amt:0)),pick=p?p.cid+'|'+p.aid:(cid&&aid?cid+'|'+aid:opts[0].c.id+'|'+opts[0].a.id),cur=opts.find(d=>d.c.id+'|'+d.a.id==pick)||opts[0];
 BPE=pid||'';BPB=b.id;const today=ymd(new Date());
 sh(`<h2>${pid?'Edit payment':'Record payment'}</h2><div class="kv"><div class="w"><span>Paying</span><b>${esc(b.name)}</b></div></div>
 <div class="f"><span>Deal (contract)</span><select id="bpd" onchange="bpFill()">${opts.map(d=>`<option value="${d.c.id}|${d.a.id}" data-av="${av(d)}" ${d===cur?'selected':''}>${esc(d.c.no)} · ${esc(d.c.item)} · left ${inr(av(d))}</option>`).join('')}</select></div>
 <div class="f"><span>Amount paid (₹)</span><input id="bpa" type="number" step="any" min="0" inputmode="decimal" value="${pid?p.amt:av(cur)}"><div id="bph" class="hint" style="margin:6px 0 0">Left to pay on this deal: ${inr(av(cur))}</div></div>
 <div class="two"><div class="f"><span>Date</span><input id="bpt" type="date" max="${today}" value="${pid?p.dt:today}"></div><div class="f"><span>Mode</span><select id="bpm">${['Cash','UPI','Bank transfer','Cheque','Other'].map(m=>`<option ${(p&&p.mode)==m?'selected':''}>${m}</option>`).join('')}</select></div></div>
 <div class="f"><span>Reference (optional)</span><input id="bpr" value="${esc(p&&p.ref||'')}" placeholder="UTR / cheque no."></div>
 <div class="f"><span>Note (optional)</span><input id="bpn" value="${esc(p&&p.note||'')}"></div>
 <div id="er" class="er"></div><button class="btn" onclick="bps()">Save payment</button>
 <div class="acts" style="grid-template-columns:${pid?'1fr 1fr':'1fr'}"><button class="btn s" onclick="brv('${b.id}')">Cancel</button>${pid?`<button class="btn d" onclick="arm(this,()=>bpDel('${pid}'))">Delete payment</button>`:''}</div>`)}
function bpFill(){const o=$('#bpd').selectedOptions[0];if(!o)return;if(!BPE)$('#bpa').value=o.dataset.av;$('#bph').textContent='Left to pay on this deal: '+inr(+o.dataset.av)}
function bps(){if(ACX.guard())return;const g=i=>$('#'+i).value.trim(),er=m=>{$('#er').textContent=m},b=broGet(BPB);if(!b)return er('Broker not found');
 const [cid,aid]=g('bpd').split('|'),c=C(cid),a=c&&baOf(c).find(x=>x.id==aid);if(!a||a.bid!=b.id)return er('Select the deal');if(c.x)return er('This contract is cancelled');
 const amt=brR2(+g('bpa'));if(!(amt>0))return er('Enter the amount paid');const dt=g('bpt');if(!dt)return er('Enter the payment date');if(dt>ymd(new Date()))return er('Payment date cannot be in the future');
 const was=BPE&&bpayAll().find(x=>x.id==BPE);if(BPE&&!was)return er('Payment not found');
 const already=brR2(bpayOf(cid,aid).filter(x=>x.id!=BPE).reduce((s,x)=>s+(+x.amt||0),0)),avail=brR2(a.amt-already);if(amt>avail+0.004)return er('Only '+inr(avail)+' is left to pay on this deal');
 const rec={bid:b.id,cid,aid,amt,dt,mode:g('bpm'),ref:g('bpr'),note:g('bpn'),cn:c.no};
 if(was)Object.assign(was,rec);else bpayW().push({id:uid(),...rec,at:new Date().toISOString()});
 save();cs();render();brv(b.id);toast('Payment saved')}
function bpDel(pid){if(ACX.guard())return;const p=bpayAll().find(x=>x.id==pid);if(!p)return;const bid=p.bid;db.bp=bpayAll().filter(x=>x.id!=pid);save();cs();render();brv(bid);toast('Payment deleted')}
/* ---------- contract form: searchable broker picker and shares ---------- */
let BAX=0;
function baInit(c){BAR=baOf(c).map(a=>({id:a.id,bid:a.bid,amt:a.amt}));BAQ={open:-1,q:'',add:0};BAX=BAR.length?1:0;baDraw()}
function baLiveTotal(){const c={q:+$('#cq').value||0,r:+$('#cr').value||0,ru:$('#cru').value,bkT:$('#cbt').value,bkR:+$('#cbr').value||0,tx:$('#ctx').value};return c.bkT&&c.bkR>0?brR2(bkAmt(c)):0}
function baDraw(){const e=$('#cbw');if(!e)return;
 if(!BAR.length&&!BAX){e.innerHTML=`<a href="#" class="mu" style="font-size:12.5px" onclick="BAX=1;baDraw();return false">+ Share brokerage with another broker</a>`;return}
 e.innerHTML=`<span>Share brokerage with brokers (optional)</span>`+BAR.map((r,i)=>{const b=broGet(r.bid);
  return `<div class="cd" style="cursor:default;padding:10px"><div class="row" style="align-items:stretch"><button type="button" class="srch" style="flex:1.7;text-align:left;cursor:pointer" onclick="baOpen(${i})">${b?esc(broLabel(b)):'Select broker'}</button><input class="srch" type="number" step="any" min="0" inputmode="decimal" placeholder="₹ share" value="${r.amt||''}" style="flex:1" oninput="BAR[${i}].amt=+this.value||0;baLive()"><button type="button" class="btn2" aria-label="Remove broker share" onclick="baDel(${i})">×</button></div>${BAQ.open==i?baPicker(i):''}</div>`}).join('')
 +`<button type="button" class="btn2" style="padding:10px 14px;margin-top:4px" onclick="baAdd()">+ Add broker share</button><div id="cbs" class="hint" style="margin:8px 0 0"></div>`;baLive()}
function baPicker(i){return `<div style="margin-top:8px"><input class="srch" id="bqs" placeholder="Search broker by name or phone" value="${esc(BAQ.q)}" oninput="baFilter(this.value)"><div id="bql" style="max-height:190px;overflow:auto;margin-top:6px">${baList(i)}</div></div>`}
function baList(i){const used=new Set(BAR.filter((r,j)=>j!=i&&r.bid).map(r=>r.bid)),cur=BAR[i]&&BAR[i].bid,
  l=broAll().filter(b=>(b.act!==0||b.id==cur)&&brIn(BAQ.q,b)).sort((a,b)=>a.name.localeCompare(b.name)),all=broAll().filter(b=>b.act!==0).length;
 return (l.length?l.map(b=>used.has(b.id)?`<div class="cd" style="cursor:default;padding:10px;margin:6px 0;opacity:.5">${esc(broLabel(b))} <span class="mu">· already added</span></div>`:`<div class="cd" style="padding:10px;margin:6px 0" onclick="baSel(${i},'${b.id}')">${esc(b.name)}<span class="mu">${b.ph?' · '+esc(b.ph):''}</span></div>`).join(''):`<div class="mu" style="padding:8px 2px">${all?'No broker matches your search.':'No brokers yet. Add the first broker below.'}</div>`)
 +(BAQ.add||!all?`<div class="cd" style="cursor:default;padding:10px;margin:6px 0"><div class="f" style="margin:0 0 8px"><span>New broker name</span><input id="bnn" placeholder="e.g. Ramesh Patel"></div><div class="f" style="margin:0 0 8px"><span>Mobile (optional)</span><input id="bnp" type="tel" inputmode="numeric" maxlength="10" oninput="phLive(this)"></div><div id="bne" class="er"></div><button type="button" class="btn" style="height:44px" onclick="baNew(${i})">Save broker and select</button></div>`:`<button type="button" class="btn2" style="padding:10px 14px" onclick="BAQ.add=1;baDraw()">+ Add new broker</button>`)}
function baOpen(i){BAQ={open:BAQ.open==i?-1:i,q:'',add:0};baDraw();const s=$('#bqs');if(s)s.focus()}
function baFilter(q){BAQ.q=q;const l=$('#bql');if(l)l.innerHTML=baList(BAQ.open)}
function baSel(i,id){BAR[i].bid=id;if(!(BAR[i].amt>0)){const f=brR2(baLiveTotal()-BAR.reduce((s,r,j)=>s+(j==i?0:(+r.amt||0)),0));BAR[i].amt=f>0?f:0}BAQ={open:-1,q:'',add:0};baDraw()}
function baAdd(){const f=brR2(baLiveTotal()-BAR.reduce((s,r)=>s+(+r.amt||0),0));BAR.push({id:uid(),bid:'',amt:f>0?f:0});BAQ={open:BAR.length-1,q:'',add:0};baDraw()}
function baDel(i){const r=BAR[i];if(r&&bpaid(EID,r.id)>0)return toast('Cannot remove: payments are recorded for this broker share');BAR.splice(i,1);BAQ={open:-1,q:'',add:0};baDraw()}
function baNew(i){if(ACX.guard())return;const r=brCheckNew($('#bnn').value,$('#bnp').value,''),er=m=>{$('#bne').textContent=m};if(r.e)return er(r.e);
 const b={id:uid(),name:r.name,ph:r.ph,note:'',act:1,at:new Date().toISOString()};broW().push(b);save();baSel(i,b.id);toast('Broker added')}
function baLive(){const e=$('#cbs');if(!e)return;const t=baLiveTotal(),s=brR2(BAR.reduce((x,r)=>x+(+r.amt||0),0));
 if(!BAR.length){e.textContent=t>0?'Brokerage '+inr(t)+' is not shared with any broker (Unassigned).':'';e.style.color='';return}
 e.textContent=t>0?'Total brokerage '+inr(t)+' · Shared '+inr(s)+' · Unassigned '+inr(Math.max(0,brR2(t-s))):'Set the brokerage rate above to share it with brokers';e.style.color=s>t+0.004?'#B42318':''}
function brApply(x,o){const rows=BAR.filter(r=>r.bid||r.amt),e=broCheck(x,rows,o);if(e)return e;
 if(rows.length)x.ba=rows.map(r=>({id:r.id||uid(),bid:r.bid,amt:brR2(r.amt)}));else if(o&&o.ba)x.ba=undefined;return ''}
/* ---------- shown on the contract view and the Report tab ---------- */
function broSec(c){const rows=baOf(c);if(!rows.length)return '';
 return `<div class="sec">Brokerage shared with brokers</div>`+rows.map(a=>{const p=bpaid(c.id,a.id),s=c.x?'Cancelled':baStat(brR2(a.amt),p);return `<div class="dl" onclick="brv('${a.bid}')" style="cursor:pointer"><span><b>${esc(broName(a.bid))}</b><br><span class="mu">Share ${inr(a.amt)} · Paid ${inr(p)} · Left ${inr(c.x?0:brR2(a.amt-p))}</span><br><button class="btn s" style="padding:6px 12px;margin-top:6px" onclick="event.stopPropagation();brCPdf('${c.id}','${a.id}')">PDF for broker</button></span><span class="bd ${baCls(s)}">${s}</span></div>`}).join('')+(baFree(c)>0.005?`<div class="mu" style="margin:6px 0 8px">Unassigned ${inr(baFree(c))}</div>`:'')}
function broRepCard(){const t=broTotals();if(!broAll().length&&!t.allocated)return '';
 return `<div class="cd" onclick="T='i';MS='br';render()"><div class="r1"><b>Brokerage payable to brokers</b><b>${inr(t.balance)}</b></div><div class="r3"><span>Shared ${inr(t.allocated)} · Paid ${inr(t.paid)}</span><span>${brPlural(broAll().length,'broker')}</span></div>${t.unDeals?`<div class="r3"><span>Unassigned ${inr(t.unassigned)} on ${brPlural(t.unDeals,'contract')}</span></div>`:''}</div>`}
/* ---------- broker statement: CSV and PDF ---------- */
async function brCsv(id){const b=broGet(id);if(!b)return;const s=broStats(id),out=[],add=a=>out.push(a.map(x=>Array.isArray(x)?csvCell(x[0],x[1]):csvCell(x)).join(',')),N=v=>[+(+v).toFixed(2),1],dmy=x=>x?new Date(x+'T00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).replace(/ /g,'-'):'';
 add([CO().n.toUpperCase()]);add(['Broker Brokerage Statement']);add(['Broker',b.name]);if(b.ph)add(['Mobile',b.ph]);add(['Generated',dmy(ymd(new Date()))]);add(['Amounts in','INR']);add([]);
 add(['SUMMARY']);add(['Brokerage payable (INR)',N(s.payable)]);add(['Paid (INR)',N(s.paid)]);add(['Balance to pay (INR)',N(s.balance)]);add([]);
 add(['DEALS']);add(['Contract No','Date','Buyer','Seller','Item','Share (INR)','Paid (INR)','Balance (INR)','Status']);
 s.deals.forEach(d=>add([d.c.no,dmy(d.c.dt),ln(d.c.b),ln(d.c.s),d.c.item,N(d.share),N(d.paid),N(d.bal),d.status]));add([]);
 add(['PAYMENT HISTORY']);add(['Date','Contract No','Amount (INR)','Mode','Reference','Note']);s.pays.slice().reverse().forEach(p=>add([dmy(p.dt),p.cn||'',N(p.amt),p.mode||'',p.ref||'',p.note||'']));
 await deliverCsv(new Blob(['﻿'+out.join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'}),xp('Broker-'+String(b.name).replace(/[^\w]+/g,'_').slice(0,30)+'_'+stamp()+'.csv'),'Broker statement CSV')}
async function brPdf(id){if(!window.jspdf)return toast('PDF engine not loaded');const b=broGet(id);if(!b)return;const s=broStats(id),d=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),W=210,M=15,K=pdfKit(d),{fl,ik,ld,tx,fo,rs}=K;
 pdfHead(d,K,'BROKER BROKERAGE STATEMENT','Statement date','');ik('#D9A84E');fo('bold',11);tx(fd(ymd(new Date())),W-M,25,{align:'right'});
 let y=44;ik('#64748B');fo('normal',8);tx('BROKER',M,y);ik('#0F1D2B');fo('bold',12);tx(String(b.name),M,y+6);if(b.ph){fo('normal',9);tx(String(b.ph),M,y+11)}
 [['Brokerage payable',rs(s.payable)],['Paid',rs(s.paid)],['Balance to pay',rs(s.balance)]].forEach((x,i)=>{const yy=y+i*13-4;fl(i==2?'#FBF3E1':'#F3F6F8');ld('#DDE4EA');d.roundedRect(M+93,yy,87,11,2,2,'FD');ik('#64748B');fo('normal',8);tx(x[0],M+97,yy+7);ik('#0F1D2B');fo('bold',10.5);tx(x[1],M+176,yy+7.2,{align:'right'})});
 y+=40;const head=(cols)=>{fl('#0B3B3C');d.rect(M,y,180,8,'F');ik('#FFFFFF');fo('bold',8);cols.forEach(c=>tx(c[0],M+c[1],y+5.4,c[2]?{align:'right'}:undefined));y+=8};
 const room=()=>y<262;
 ik('#0F1D2B');fo('bold',9);tx('Deals',M,y-2);y+=1;head([['Date',2],['Contract',20],['Parties',44],['Share',120,1],['Paid',150,1],['Balance',178,1]]);
 let n=0;s.deals.forEach((x,i)=>{if(!room()||n>=Math.max(1,Math.floor((262-y)/7)-(s.pays.length?Math.min(s.pays.length,6)+4:0)))return;n++;fl(i%2?'#FFFFFF':'#F3F6F8');d.rect(M,y,180,7,'F');ik('#0F1D2B');fo('normal',7.5);tx(fd(x.c.dt),M+2,y+4.8);fo('bold',7.5);tx(String(x.c.no),M+20,y+4.8);fo('normal',7);tx(d.splitTextToSize(ln(x.c.b)+' / '+ln(x.c.s),70)[0],M+44,y+4.8);fo('normal',7.5);tx(rs(x.share),M+120,y+4.8,{align:'right'});tx(rs(x.paid),M+150,y+4.8,{align:'right'});fo('bold',7.5);tx(rs(x.bal),M+178,y+4.8,{align:'right'});y+=7});
 if(!s.deals.length){fo('normal',9);ik('#64748B');tx('No contract brokerage is shared with this broker.',M+2,y+5);y+=9}
 if(n<s.deals.length){fo('normal',7);ik('#64748B');tx((s.deals.length-n)+' more deal'+(s.deals.length-n==1?'':'s')+' not listed to keep this on one page. Totals include them. Use the CSV for the full list.',M,y+4);y+=7}
 y+=6;if(s.pays.length&&y<250){ik('#0F1D2B');fo('bold',9);tx('Payment history',M,y-2);y+=1;head([['Date',2],['Contract',24],['Mode / reference',50],['Amount',178,1]]);
  let k=0;s.pays.forEach((p,i)=>{if(y>=268)return;k++;fl(i%2?'#FFFFFF':'#F3F6F8');d.rect(M,y,180,7,'F');ik('#0F1D2B');fo('normal',7.5);tx(fd(p.dt),M+2,y+4.8);tx(String(p.cn||''),M+24,y+4.8);tx(d.splitTextToSize((p.mode||'')+(p.ref?' - '+p.ref:''),100)[0],M+50,y+4.8);fo('bold',7.5);tx(rs(p.amt),M+178,y+4.8,{align:'right'});y+=7});
  if(k<s.pays.length){fo('normal',7);ik('#64748B');tx((s.pays.length-k)+' more payment'+(s.pays.length-k==1?'':'s')+' not listed. Use the CSV for the full history.',M,y+4)}}
 pdfFoot(d,K,[],'statement');await deliverPdf(d.output('blob'),xp('Broker-'+String(b.name).replace(/[^\w]+/g,'_').slice(0,30)+'_'+stamp()+'.pdf'),'Broker statement')}

/* ---------- contract-wise brokerage note for ONE broker (PDF to send to that broker) ----------
   Shows this broker's share of this contract only (never other brokers' shares). */
async function brCPdf(cid,aid){if(!window.jspdf)return toast('PDF engine not loaded');const c=C(cid);if(!c)return;const a=baOf(c).find(x=>x.id==aid);if(!a)return;const b=broGet(a.bid);
 const d=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),W=210,M=15,K=pdfKit(d),{fl,ik,ld,tx,fo,rs}=K,share=brR2(a.amt),pays=bpayOf(c.id,a.id).slice().sort((x,y)=>String(x.dt).localeCompare(String(y.dt))),paid=bpaid(c.id,a.id),left=c.x?0:brR2(share-paid),st=c.x?'Cancelled':baStat(share,paid);
 pdfHead(d,K,'BROKERAGE NOTE','Contract no',c.no);
 let y=46;ik('#64748B');fo('normal',8);tx('BROKER',M,y);ik('#0F1D2B');fo('bold',13);tx(String(b?b.name:'Broker'),M,y+6);if(b&&b.ph){fo('normal',9);ik('#475569');tx('Phone: '+b.ph,M,y+11)}
 ik('#64748B');fo('normal',8);tx('Date',W-M,y,{align:'right'});ik('#0F1D2B');fo('bold',10);tx(fd(ymd(new Date())),W-M,y+6,{align:'right'});
 y=62;pdfParty(d,K,M,y,'BUYER',L(c.b)||{name:ln(c.b)});pdfParty(d,K,M+93,y,'SELLER',L(c.s)||{name:ln(c.s)});
 y=106;ik('#0F1D2B');fo('bold',9);tx('Contract details',M,y);y+=3;
 const rows=[['Contract date',fd(c.dt)+(c.tm?', '+t12(c.tm):'')],['Item',c.item],['Quantity',vq(c,c.q)+kgT(c,c.q)],['Rate per '+rtS(c),rs(c.r)+(txT(c)?'  ('+txT(c)+')':'')],['Contract value',rs(val(c))],['Brokerage basis',bkTxt(c,v=>'Rs. '+(+v).toLocaleString('en-IN',{maximumFractionDigits:2}))||'-']];
 rows.forEach((r,i)=>{fl(i%2?'#FFFFFF':'#F3F6F8');d.rect(M,y,180,7.5,'F');ik('#64748B');fo('normal',8.5);tx(r[0],M+3,y+5);ik('#0F1D2B');fo('bold',9);tx(d.splitTextToSize(String(r[1]),110)[0],M+70,y+5);y+=7.5});
 y+=8;[['Your brokerage share',rs(share)],['Paid so far',rs(paid)],['Balance to pay',rs(left)]].forEach((x,i)=>{const xx=M+i*61;fl(i==2?'#FBF3E1':'#F3F6F8');ld('#DDE4EA');d.roundedRect(xx,y,58,17,2,2,'FD');ik('#64748B');fo('normal',8);tx(x[0],xx+4,y+6);ik('#0F1D2B');fo('bold',12);tx(x[1],xx+4,y+13.5)});
 y+=22;ik('#64748B');fo('normal',8.5);tx('Status: ',M,y);ik(st=='Paid'?'#0F7B3E':st=='Cancelled'?'#B42318':'#B7791F');fo('bold',9);tx(st,M+14,y);
 if(c.x){ik('#B42318');fo('normal',8);tx('This contract was cancelled, so no brokerage is payable on it.',M+40,y)}
 y+=8;if(pays.length){ik('#0F1D2B');fo('bold',9);tx('Payments made',M,y);y+=2;fl('#0B3B3C');d.rect(M,y,180,8,'F');ik('#FFFFFF');fo('bold',8);tx('Date',M+3,y+5.4);tx('Mode / reference',M+34,y+5.4);tx('Amount',M+177,y+5.4,{align:'right'});y+=8;
  let k=0;pays.forEach((p,i)=>{if(y>=250)return;k++;fl(i%2?'#FFFFFF':'#F3F6F8');d.rect(M,y,180,7,'F');ik('#0F1D2B');fo('normal',8);tx(fd(p.dt),M+3,y+4.8);tx(d.splitTextToSize((p.mode||'')+(p.ref?' - '+p.ref:''),110)[0],M+34,y+4.8);fo('bold',8);tx(rs(p.amt),M+177,y+4.8,{align:'right'});y+=7});
  if(k<pays.length){fo('normal',7);ik('#64748B');tx((pays.length-k)+' more payment'+(pays.length-k==1?'':'s')+' not listed.',M,y+4)}}
 else{fo('normal',9);ik('#64748B');tx('No payment has been made against this share yet.',M,y+2)}
 pdfFoot(d,K,['Broker signature','For '+CO().n],'brokerage note');
 await deliverPdf(d.output('blob'),xp('Brokerage-Note_'+String(c.no)+'_'+String(b?b.name:'Broker').replace(/[^\w]+/g,'_').slice(0,30)+'_'+stamp()+'.pdf'),'Brokerage note')}
