/* Brokerlynx module: features/delivery
   Delivery orders.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

function syncDo(o){db.c.forEach(c=>{if(c.id!=o.c&&c.d)c.d=c.d.filter(e=>e.do!=o.id)});const c=C(o.c);if(!c)return;c.d=c.d||[];const n=new Date(),e=c.d.find(x=>x.do==o.id);if(e){e.q=o.q;e.dt=o.dt;e.no=o.no}else c.d.push({dt:o.dt,tm:p2(n.getHours())+':'+p2(n.getMinutes()),q:o.q,do:o.id,no:o.no})}
const unsyncDo=id=>db.c.forEach(c=>{if(c.d)c.d=c.d.filter(e=>e.do!=id)});
function mkDo(id){
 if(!window.jspdf)return null;
 const o=db.o.find(x=>x.id==id),c=C(o.c),b=L(c.b)||{},s=L(c.s)||{},d=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),W=210,M=15,K=pdfKit(d),{fl,ik,ld,tx,fo}=K,
 idx=db.o.findIndex(x=>x.id==id),cum=db.o.filter((x,i)=>x.c==c.id&&i<=idx).reduce((t,x)=>t+x.q,0),bal=Math.max(0,+(c.q-cum).toFixed(3));
 pdfHead(d,K,'DELIVERY ORDER','Delivery order no.',o.no);
 [['Order date',fd(o.dt)],['Against contract',String(c.no)],['Contract date',fd(c.dt)]].forEach((m,i)=>{const x=M+i*61;ik('#64748B');fo('normal',8);tx(m[0],x,48);ik('#0F1D2B');fo('bold',11);tx(m[1],x,54)});
 pdfParty(d,K,M,59,'BUYER',b);pdfParty(d,K,M+93,59,'SELLER',s);
 let y=102;fl('#0B3B3C');d.rect(M,y,180,8,'F');ik('#FFFFFF');fo('bold',9);tx('Dispatch details',M+4,y+5.6);y+=8;
 const rows=[['Item',c.item],['Quantity dispatched',vq(c,o.q)+kgT(c,o.q)],['Vehicle number',o.vn],['Transporter',o.tn],['LR number',o.lr||'-'],['Billing cycle',o.bc||'-'],['Contract quantity',vq(c,c.q)],['Dispatched incl. this order',vq(c,cum)],['Balance to dispatch',vq(c,bal)],['Remarks',o.note]].filter(r=>r[1]);
 rows.forEach((r,i)=>{const hl=r[0]=='Quantity dispatched'||r[0]=='Vehicle number',t=d.splitTextToSize(String(r[1]),116),h=Math.max(9.2,t.length*4.6+4.6);fo('bold',hl?12:10);
  fl(r[0]=='Quantity dispatched'?'#FBF3E1':i%2?'#F3F6F8':'#FFFFFF');d.rect(M,y,180,h,'F');ik('#64748B');fo('normal',9);tx(r[0],M+4,y+6.1);ik('#0F1D2B');fo('bold',hl?12:10);tx(t,M+58,y+6.1);y+=h});
 ld('#DDE4EA');d.line(M,y,W-M,y);ik('#64748B');fo('normal',8);const nt=d.splitTextToSize('This delivery order is issued against contract note '+c.no+' dated '+fd(c.dt)+'. The quantity shown is the dispatch quantity for the vehicle named above.',180);tx(nt,M,y+6);
 pdfFoot(d,K,['Issued by '+CO().n,'Transporter / driver','Received by'],'delivery order');
 return{d,o,y}}
async function dpdf(id){const r=mkDo(id);if(!r)return toast('PDF engine not loaded');await deliverPdf(r.d.output('blob'),vfn(r.o)+'.pdf','Delivery order '+r.o.no)}
function dof(id,cid){EID=id||'';const o=db.o.find(x=>x.id==id)||{},now=new Date(),
 cl=db.c.filter(c=>!c.x&&(remDo(c,id)>0||c.id==o.c)).sort((a,b)=>(b.dt+b.tm).localeCompare(a.dt+a.tm));
 if(!cl.length)return sh(`<h2>No contract available</h2><p class="mu">A delivery order is made against an existing contract that still has quantity left to dispatch. Create a contract first.</p><button class="btn" onclick="cf()">+ New contract</button>`);
 const sel=o.c||cid||'',tl=db.t.map(t=>t.name),vls=db.vh.map(v=>({no:v.no,t:(db.t.find(t=>t.id==v.t)||{}).name||''}));
 if(o.tn&&!tl.some(n=>nk(n)==nk(o.tn)))tl.push(o.tn);if(o.vn&&!vls.some(v=>v.no==o.vn))vls.push({no:o.vn,t:''});
 sh(`<h2>${id?'Edit delivery order':'New delivery order'}</h2>
 <div class="f"><span>Delivery order number</span><input id="dnum" value="${esc(o.no||nextDo())}" readonly style="font-weight:800;letter-spacing:.04em"></div>
 <div class="f"><span>Order date</span><input id="ddt" type="date" value="${o.dt||ymd(now)}"></div>
 <div class="f"><span>Contract</span><select id="dcon" onchange="dcc()"><option value="">Select contract</option>${cl.map(c=>`<option value="${c.id}" ${sel==c.id?'selected':''}>${esc(c.no)} · ${esc(ln(c.b))} · ${esc(c.item)}</option>`).join('')}</select></div>
 <div class="f"><span>Item (from contract)</span><input id="ditem" readonly></div><div id="dinfo" class="hint" style="margin:-4px 0 12px"></div>
 <div class="f"><span>Transporter</span><select id="dtsel" onchange="dts()"><option value="">Select transporter</option>${tl.map(n=>`<option value="${esc(n)}" ${nk(o.tn||'')==nk(n)?'selected':''}>${esc(n)}</option>`).join('')}<option value="__new">+ Add new transporter…</option></select><input id="dtrn" placeholder="New transporter name (saved for next time)" style="display:none;margin-top:8px"></div>
 <div class="f"><span>Vehicle number</span><select id="dvsel" onchange="dvs()"><option value="">Select vehicle</option>${vls.map(v=>`<option value="${esc(v.no)}" ${o.vn==v.no?'selected':''}>${esc(v.no)}${v.t?' · '+esc(v.t):''}</option>`).join('')}<option value="__new">+ Add new vehicle…</option></select><input id="dveh" maxlength="11" autocapitalize="characters" placeholder="e.g. GJ01AB1234" oninput="vnLive(this)" style="display:none;margin-top:8px"></div>
 <div class="two"><div class="f"><span>LR number</span><input id="dlr" value="${esc(o.lr||'')}"></div><div class="f"><span>Billing cycle</span><input id="dbc" value="${esc(o.bc||'')}" placeholder="e.g. 15 days"></div></div>
 <div class="f"><span id="dql">Quantity (MT)</span><input id="dqty" type="number" step="any" min="0" inputmode="decimal" value="${o.q||''}"></div>
 <div class="f"><span>Remarks (optional)</span><input id="drem" value="${esc(o.note||'')}"></div>
 <div id="er" class="er"></div><button class="btn" onclick="sdo()">Save delivery order</button>`);dcc(1)}
function dts(){$('#dtrn').style.display=$('#dtsel').value=='__new'?'block':'none'}
function dvs(){const v=$('#dvsel').value;$('#dveh').style.display=v=='__new'?'block':'none';const m=db.vh.find(x=>x.no==v);if(m&&m.t){const t=db.t.find(x=>x.id==m.t);if(t){$('#dtsel').value=t.name;dts()}}}
function dcc(init){const c=C($('#dcon').value),i=$('#dinfo');if(!c){$('#ditem').value='';i.textContent='';return}
 const rem=remDo(c,EID);$('#ditem').value=c.item;$('#dql').textContent='Quantity ('+uq(c)+')';i.className='hint ok';i.textContent=`${ln(c.b)} from ${ln(c.s)} · contract ${vq(c,c.q)} · left to dispatch ${vq(c,rem)}`;
 if(!init||!$('#dqty').value)$('#dqty').value=rem||''}
function sdo(){const g=i=>$('#'+i).value.trim(),er=m=>{$('#er').textContent=m},c=C(g('dcon')),q=+g('dqty'),dt=g('ddt'),ex=EID&&db.o.find(y=>y.id==EID),no=ex?ex.no:nextDo();
 let tn=g('dtsel'),vn=g('dvsel');if(tn=='__new')tn=g('dtrn').replace(/\s+/g,' ');if(vn=='__new')vn=g('dveh');
 if(!dt)return er('Enter the order date');
 if(!c)return er('Select a contract');
 if(dt<c.dt)return er('Order date cannot be before the contract date');
 if(!tn)return er('Select or add the transporter name');
 if(!vn)return er('Select or add the vehicle number');
 if(!vnOk(vn))return er(vnMsg(vn));
 const rem=remDo(c,EID);if(!(q>0))return er('Quantity must be greater than 0');if(q>rem+1e-9)return er(`Only ${vq(c,rem)} is left to dispatch on this contract`);
 const x={no,dt,c:c.id,vn,tn,lr:g('dlr'),bc:g('dbc'),q,note:g('drem')};
 let t=db.t.find(y=>nk(y.name)==nk(tn));if(!t){t={id:uid(),name:tn};db.t.push(t)}else x.tn=t.name;
 if(!db.vh.some(y=>y.no==vn))db.vh.push({id:uid(),no:vn,t:t.id});
 if(EID)Object.assign(ex,x);else db.o.push({id:uid(),cm:ymNow(),...x,no:allocDo()});
 syncDo(EID?ex:db.o[db.o.length-1]);
 save();cs();render();toast('Delivery order saved')}
function vdo(id){const o=db.o.find(x=>x.id==id),c=C(o.c);
 sh(`<div class="r1"><h2 style="margin:0">${esc(o.no)}</h2><span class="bd Pending">Delivery order</span></div><div style="height:12px"></div>
 <div class="kv"><div><span>Order date</span><b>${fd(o.dt)}</b></div><div><span>Contract</span><b class="lk" onclick="vc('${c.id}')">${esc(c.no)}</b></div>
 <div class="w"><span>Buyer</span><b>${esc(ln(c.b))}</b></div><div class="w"><span>Seller</span><b>${esc(ln(c.s))}</b></div>
 <div><span>Item</span><b>${esc(c.item)}</b></div><div><span>Quantity</span><b>${vq(c,o.q)}</b></div>
 <div><span>Vehicle number</span><b>${esc(o.vn)}</b></div><div><span>Transporter</span><b>${esc(o.tn)}</b></div>
 <div><span>LR number</span><b>${esc(o.lr)||'—'}</b></div><div><span>Billing cycle</span><b>${esc(o.bc)||'—'}</b></div>${o.note?`<div class="w"><span>Remarks</span><b>${esc(o.note)}</b></div>`:''}</div>
 <div class="acts" style="margin-bottom:0"><button class="btn" onclick="dpdf('${id}')">Export as PDF</button><button class="btn s" onclick="doCsv('${id}')">Export as CSV</button></div>
 <div class="acts"><button class="btn s" onclick="dof('${id}')">Edit</button><button class="btn d" onclick="arm(this,()=>ddl('${id}'))">Delete</button></div>`)}
function ddl(id){unsyncDo(id);db.o=db.o.filter(x=>x.id!=id);save();cs();render();toast('Delivery order deleted')}
