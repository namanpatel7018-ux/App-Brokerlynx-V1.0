/* Brokerlynx module: features/contracts
   Contracts: form, view, edit, delete.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

function cf(id){if(ACX.guard())return;EID=id||'';_ne=0;const c=C(id)||{},B=db.l.filter(l=>l.type!='Seller'),S=db.l.filter(l=>l.type!='Buyer'),now=new Date(),v=new Date(Date.now()+15*864e5);
 if(!B.length||!S.length)return sh(`<h2>Create ledgers first</h2><p class="mu">You need at least one Buyer ledger and one Seller ledger (or a “Both” ledger for each side) before recording a contract.</p><button class="btn" onclick="lf()">+ New ledger</button>`);
 const o=(a,sel)=>'<option value="">Select party</option>'+a.map(l=>`<option value="${l.id}" ${sel==l.id?'selected':''}>${esc(l.name)}</option>`).join('');
 sh(`<h2>${id?'Edit contract':'New contract'}</h2>
 <div class="f"><span>Contract number</span><input id="cn" value="${esc(c.no||nextNo())}" readonly style="font-weight:800;letter-spacing:.04em"><div class="hint" style="margin:6px 0 0">Auto number: S + month + serial + year, e.g. SOCT026</div></div>
 <div class="two"><div class="f"><span>Date</span><input id="cd" type="date" value="${c.dt||ymd(now)}"></div><div class="f"><span>Time</span><input id="ct" type="time" value="${c.tm||p2(now.getHours())+':'+p2(now.getMinutes())}"></div></div>
 <div class="f"><span>Buyer</span><select id="cb">${o(B,c.b)}</select></div><div class="f"><span>Seller</span><select id="cs">${o(S,c.s)}</select></div>
 <div class="f"><span>Item</span><select id="ci" onchange="ich()"><option value="">Select item</option>${db.i.map(i=>`<option value="${esc(i.name)}" ${nk(c.item||'')==nk(i.name)?'selected':''}>${esc(i.name)}</option>`).join('')}<option value="__new">+ Add new item…</option></select><input id="cin" placeholder="New item name (saved for next time)" style="display:none;margin-top:8px"></div>
 <div class="f"><span>Quantity and rate basis</span><select id="cru" onchange="ruf()"><option value="k" ${(c.ru||'k')=='k'?'selected':''}>Quantity in MT · rate per 10 kg</option><option value="m" ${c.ru=='m'?'selected':''}>Quantity in MT · rate per MT</option><option value="g" ${c.ru=='g'?'selected':''}>Quantity in Kgs · rate per 10 kg</option><option value="q" ${c.ru=='q'?'selected':''}>Quantity in Kgs · rate per kg</option><option value="n" ${c.ru=='n'?'selected':''}>Quantity in Nos · rate per Nos</option></select></div>
 <div class="two"><div class="f"><span id="lq">Quantity (MT)</span><input id="cq" type="number" step="any" min="0" inputmode="decimal" value="${c.q||''}" oninput="am()"></div><div class="f"><span id="lr">Rate (₹ per 10 kg)</span><input id="cr" type="number" step="any" min="0" inputmode="decimal" value="${c.r||''}" oninput="am()"></div></div>
 <div class="amt"><span>Contract value</span><span id="ca">₹0</span></div>
 <div class="f"><span>Valid till</span><input id="cv" type="date" value="${c.v||ymd(v)}"></div>
 <div class="f"><span>Payment terms</span><input id="cpt" value="${esc(c.pt||'')}" placeholder="e.g. Within 7 days of delivery"></div>
 <div class="f"><span>Delivery terms / place</span><input id="cdp" value="${esc(c.dp||'')}" placeholder="e.g. Ex-godown, buyer's place"></div>
 <div class="f"><span>Quality / specification</span><input id="cql" value="${esc(c.ql||'')}"></div>
 <div class="f"><span>Packing</span><input id="cpk" value="${esc(c.pk||'')}"></div>
 <div class="f"><span>Rate is</span><select id="ctx">${id&&c.tx===undefined?'<option value="">Select +GST or Taxes Included</option>':''}<option value="e" ${(c.tx||(id?'':'e'))=='e'?'selected':''}>+GST</option><option value="i" ${c.tx=='i'?'selected':''}>Taxes Included</option></select></div>
 <div class="f"><span>Brokerage</span><div class="row"><select id="cbt" onchange="bam()" style="flex:1.3"><option value="">No brokerage</option><option value="mt" ${c.bkT=='mt'?'selected':''}>₹ per MT</option><option value="pm" ${c.bkT=='pm'?'selected':''}>₹ per MT</option><option value="q" ${c.bkT=='q'?'selected':''}>₹ per 10 kg</option><option value="pc" ${c.bkT=='pc'?'selected':''}>% of value</option></select><input id="cbr" type="number" step="any" min="0" inputmode="decimal" value="${c.bkR||''}" placeholder="Rate" oninput="bam()" style="flex:1"></div><div id="cba" class="hint" style="margin:6px 0 0"></div></div>
 <div class="f"><span>Brokerage payable by</span><select id="cbp"><option value="x" ${(c.bkP||'x')=='x'?'selected':''}>Buyer and seller equally</option><option value="b" ${c.bkP=='b'?'selected':''}>Buyer</option><option value="s" ${c.bkP=='s'?'selected':''}>Seller</option></select></div>
 <div class="f" id="cbw"></div>
 <div class="f"><span>Remarks (optional)</span><input id="cm" value="${esc(c.note||'')}"></div>
 <div id="er" class="er"></div><button class="btn" onclick="sc()">Save contract</button>`);ruf();baInit(c)}
function ruf(){const u=$('#cru').value||'k',n=u=='n';const ul=n?'Nos':(u=='g'||u=='q')?'Kgs':'MT';$('#lq').textContent='Quantity ('+ul+')';$('#lr').textContent='Rate (₹ per '+({k:'10 kg',m:'MT',n:'Nos',g:'10 kg',q:'kg'}[u])+')';const o=$('#cbt');if(o&&o.options){const kg=ul=='Kgs';o.options[1].text='₹ per '+(kg?'kg':ul);o.options[2].hidden=!kg;o.options[3].hidden=n;if((n&&o.value=='q')||(!kg&&o.value=='pm'))o.value=''}am()}
function am(){$('#ca').textContent=inr(amtOf({ru:$('#cru').value,r:+$('#cr').value||0},+$('#cq').value||0));bam()}
function bam(){const e=$('#cba');if(!e)return;const t=$('#cbt').value,r=+$('#cbr').value||0,c={q:+$('#cq').value||0,r:+$('#cr').value||0,ru:$('#cru').value,bkT:t,bkR:r};e.textContent=t&&r>0?'Brokerage: '+inr(bkAmt(c)):'';baLive()}
const x_ru=()=>$('#cru').value||'k';
function sc(){if(ACX.guard())return;const g=i=>$('#'+i).value.trim(),er=m=>{$('#er').textContent=m},no=EID?g('cn'):nextNo(),q=+g('cq'),r=+g('cr'),o=EID&&C(EID);
 if(!no)return er('Enter the contract number');
 if(db.c.some(c=>c.no.toLowerCase()==no.toLowerCase()&&c.id!=EID))return er(`Contract number ${no} is already used`);
 if(!g('cb')||!g('cs'))return er('Select both buyer and seller');
 if(g('cb')==g('cs'))return er('Buyer and seller cannot be the same party');
 let it=g('ci');if(it=='__new'){it=g('cin').replace(/\s+/g,' ');if(!it)return er('Enter the new item name');const di_=db.i.find(x=>nk(x.name)==nk(it));if(di_)it=di_.name;else db.i.push({id:uid(),name:it})}
 if(!it)return er('Select the item');
 if(!(q>0))return er('Quantity must be greater than 0');if(!(r>0))return er('Rate must be greater than 0');if(!g('ctx')&&!(o&&o.tx===undefined))return er('Select +GST or Taxes Included');
 if(!g('cd')||!g('ct')||!g('cv'))return er('Enter date, time and validity');
 if(g('cv')<g('cd'))return er('Validity cannot be before the contract date');
 if(o&&(o.ru||'k')!=x_ru()&&(dv(o)>0||db.o.some(y=>y.c==o.id)))return er('Quantity and rate basis cannot be changed after deliveries or delivery orders exist');
 if(o&&q<db.o.filter(x=>x.c==o.id).reduce((t,x)=>t+x.q,0))return er(`Quantity cannot be below delivery orders issued (${vq(o,db.o.filter(x=>x.c==o.id).reduce((t,x)=>t+x.q,0))})`);
 if(o&&q<dv(o))return er(`Quantity cannot be below delivered quantity (${vq(o,dv(o))})`);
 if(g('cbt')&&!(+g('cbr')>0))return er('Enter the brokerage rate');if(g('cbt')=='pc'&&+g('cbr')>100)return er('Brokerage percent cannot exceed 100');
 const x={no,dt:g('cd'),tm:g('ct'),b:g('cb'),s:g('cs'),item:it,q,r,v:g('cv'),note:g('cm'),pt:g('cpt'),dp:g('cdp'),ql:g('cql'),pk:g('cpk'),bkT:g('cbt'),bkR:+g('cbr')||0,bkP:g('cbp')||'x',tx:g('ctx'),ru:g('cru')||'k'};
 {const be=brApply(x,o);if(be)return er(be)}
 if(o)Object.assign(o,x);else{db.c.push({id:uid(),d:[],x:0,cm:ymNow(),...x,no:allocNo()});db.n++}
 save();cs();render();toast('Contract saved')}
function vc(id){const c=C(id),s=st(c);
 sh(`<div class="r1"><h2 style="margin:0">${esc(c.no)}</h2><span class="bd ${s}">${s}</span></div><div style="height:12px"></div>
 <div class="kv"><div><span>Date &amp; time</span><b>${fd(c.dt)}, ${c.tm}</b></div><div><span>Valid till</span><b>${fd(c.v)}</b></div>
 <div class="w"><span>Buyer</span><b class="lk" onclick="vl('${c.b}')">${esc(ln(c.b))}</b></div><div class="w"><span>Seller</span><b class="lk" onclick="vl('${c.s}')">${esc(ln(c.s))}</b></div>
 <div><span>Item</span><b>${esc(c.item)}</b></div><div><span>Rate</span><b>${inr(c.r)} / ${rtS(c)}</b><span>${altR(c)?'= '+inr(altR(c)[1])+' '+altR(c)[0].replace('Rate ',''):''}${txT(c)?(altR(c)?' · ':'')+txT(c):''}</span></div>
 <div><span>Quantity</span><b>${vq(c,c.q)}</b></div><div><span>Contract value</span><b>${inr(val(c))}</b></div>
 <div><span>Delivered</span><b>${vq(c,dv(c))}</b></div><div><span>Pending</span><b>${vq(c,pe(c))} · ${inr(amtOf(c,pe(c)))}</b></div>${[['Payment terms',c.pt],['Delivery terms',c.dp],['Quality / specification',c.ql],['Packing',c.pk],['Brokerage',bkLine(c,inr)]].filter(r=>r[1]).map(r=>`<div class="w"><span>${r[0]}</span><b>${esc(r[1])}</b></div>`).join('')}${c.note?`<div class="w"><span>Remarks</span><b>${esc(c.note)}</b></div>`:''}</div>
 <div class="bar"><i style="width:${Math.min(100,dv(c)/c.q*100)}%"></i></div>
 ${c.x?'':`<div class="sec">Record delivery</div><div class="row"><input class="srch" id="dq" type="number" step="any" inputmode="decimal" placeholder="Qty in ${uq(c)}" style="flex:1"><button class="btn2" onclick="ad('${id}')">Add</button></div><div id="er" class="er" style="margin-top:6px"></div>`}
 ${(c.d||[]).length?`<div class="sec">Delivery history</div>`+c.d.map((x,i)=>`<div class="dl"><span><b>${vq(c,x.q)}</b> <span class="mu">· ${fdt(x)}</span></span>${x.do?`<span class="tag">${esc(x.no||'Delivery order')}</span>`:`<button aria-label="Remove" onclick="rd('${id}',${i})">×</button>`}</div>`).join(''):''}
 ${db.o.filter(o=>o.c==id).length?`<div class="sec">Delivery orders</div>`+db.o.filter(o=>o.c==id).map(o=>`<div class="dl" onclick="vdo('${o.id}')" style="cursor:pointer"><span><b>${esc(o.no)}</b><span class="tag">${esc(o.vn)}</span><br><span class="mu">${vq(c,o.q)} · ${fd(o.dt)}</span></span></div>`).join(''):''}
 ${broSec(c)}
 <div class="acts" style="grid-template-columns:1fr;margin-bottom:0"><button class="btn" onclick="pdf('${id}')">Export as PDF</button></div><div class="acts"><button class="btn s" onclick="pdf('${id}','b')">WhatsApp buyer</button><button class="btn s" onclick="pdf('${id}','s')">WhatsApp seller</button></div>${c.x?'':`<div class="acts" style="grid-template-columns:1fr"><button class="btn s" onclick="dof('','${id}')">Create delivery order</button></div>`}
 <div class="acts"><button class="btn s" onclick="cf('${id}')">Edit</button><button class="btn s" onclick="tx('${id}')">${c.x?'Reopen':'Cancel contract'}</button></div>
 <div class="acts" style="grid-template-columns:1fr"><button class="btn d" onclick="arm(this,()=>dc('${id}'))">Delete contract</button></div>`)}
function ad(id){const c=C(id),q=+$('#dq').value;
 if(!(q>0))return $('#er').textContent='Enter a quantity greater than 0';
 if(q>pe(c)+1e-9)return $('#er').textContent=`Only ${vq(c,pe(c))} is pending on this contract`;
 {const n=new Date();c.d.push({dt:ymd(n),tm:p2(n.getHours())+':'+p2(n.getMinutes()),q})};save();render();vc(id);toast('Delivery recorded')}
function rd(id,i){C(id).d.splice(i,1);save();render();vc(id)}
function tx(id){const c=C(id);c.x=c.x?0:1;save();render();vc(id);toast(c.x?'Contract cancelled':'Contract reopened')}
function dc(id){if(bpayAll().some(p=>p.cid==id)){toast('Cannot delete: brokerage payments are recorded for this contract');return}if(db.o.some(o=>o.c==id)){toast('Cannot delete: contract has delivery orders');return}db.c=db.c.filter(c=>c.id!=id);save();cs();render();toast('Contract deleted')}
