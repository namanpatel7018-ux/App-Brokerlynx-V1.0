/* Brokerlynx module: features/ledgers
   Ledgers (parties): form, list, detail.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

/* Ledger form */
function lf(id){EID=id||'';const l=L(id)||{};
 sh(`<h2>${id?'Edit ledger':'New ledger'}</h2>
 <div class="f"><span>Party name</span><input id="ln" value="${esc(l.name||'')}" oninput="nck()" autocomplete="off"></div><div id="nm" class="hint"></div>
 <div class="f"><span>Ledger type</span><select id="lt">${['Buyer','Seller','Both'].map(t=>`<option ${l.type==t?'selected':''}>${t}</option>`).join('')}</select></div>
 <div class="f"><span>GSTIN (optional)</span><div class="row"><input id="lg" value="${esc(l.gst||'')}" maxlength="15" autocapitalize="characters" oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9]/g,'');gck(1)"><button class="btn2" type="button" onclick="gck()">Check GST</button></div></div><div id="gr" class="hint"></div><div id="gd"></div>
 <div class="f"><span>Address</span><input id="la" value="${esc(l.addr||'')}" placeholder="Shop / building, street, area"></div><div class="two"><div class="f"><span>City</span><input id="lc" value="${esc(l.city||'')}"></div><div class="f"><span>Pincode</span><input id="lp2" inputmode="numeric" maxlength="6" placeholder="6 digits" oninput="pinLive(this)" value="${esc(l.pin||'')}"></div></div><div class="f"><span>Phone</span><input id="lp" type="tel" inputmode="numeric" maxlength="14" placeholder="10-digit mobile" oninput="phLive(this)" value="${esc(l.ph||'')}"></div>
 <div id="er" class="er"></div><button class="btn" onclick="sl()">Save ledger</button>`);if(l.gst)gck(1)}
function nck(){const v=$('#ln').value.trim(),d=v&&db.l.find(x=>nk(x.name)==nk(v)&&x.id!=EID),e=$('#nm');
 e.className='hint '+(d?'bad':v?'ok':'');e.textContent=d?`A ledger named “${d.name}” already exists`:v?'Name is available':''}
function gck(a){const g=$('#lg').value,e=$('#gr'),gd=$('#gd');gd.innerHTML='';if(!g){e.textContent='';e.className='hint';return}
 if(a&&g.length<15){e.className='hint';e.textContent=g.length+'/15 characters';return}
 const r=checkGST(g);e.className='hint '+(r.ok?'ok':'bad');e.textContent=(r.ok?'✓ ':'✕ ')+r.m;if(r.ok)gd.innerHTML=gbox(r.d);return r}
function sl(){const n=$('#ln').value.trim().replace(/\s+/g,' '),g=$('#lg').value,t=$('#lt').value,er=m=>{$('#er').textContent=m};
 if(!n)return er('Enter the party name');
 const d=db.l.find(x=>nk(x.name)==nk(n)&&x.id!=EID);if(d)return er(`Ledger “${d.name}” already exists. Use a different name`);
 if(g){const r=checkGST(g);if(!r.ok)return er('GSTIN: '+r.m);const gd=db.l.find(x=>x.gst==g&&x.id!=EID);if(gd)return er(`This GSTIN is already used by “${gd.name}”`)}
 if(EID){if(t=='Buyer'&&db.c.some(c=>c.s==EID))return er('This party is a seller in a contract. Choose Seller or Both');
  if(t=='Seller'&&db.c.some(c=>c.b==EID))return er('This party is a buyer in a contract. Choose Buyer or Both')}
 const pn=$('#lp2').value.trim(),ph=phNorm($('#lp').value);if(!pn)return er('Enter the pincode');if(!pinOk(pn))return er('Enter a valid 6-digit Indian pincode, for example 382715');if(!ph)return er('Enter the mobile number');if(!phOk(ph))return er('Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9');
 const o={name:n,type:t,gst:g,addr:$('#la').value.trim(),city:$('#lc').value.trim(),pin:pn,ph:ph};
 if(EID)Object.assign(L(EID),o);else db.l.push({id:uid(),...o});
 save();cs();render();toast('Ledger saved')}
function vl(id){const l=L(id),gd=(l.gst&&checkGST(l.gst).d)||{},cs_=db.c.filter(c=>c.b==id||c.s==id).sort((a,b)=>b.dt.localeCompare(a.dt)),o=cs_.filter(open);
 sh(`<h2>${esc(l.name)}</h2><div class="kv"><div><span>Type</span><b>${l.type}</b></div><div><span>GSTIN</span><b>${l.gst?esc(l.gst)+' ✓':'—'}</b></div><div><span>State</span><b>${gd.state||'—'}</b></div><div><span>PAN</span><b>${gd.pan||'—'}</b></div><div><span>Constitution</span><b>${gd.ent||'—'}</b></div><div><span>Phone</span><b>${esc(l.ph)||'—'}</b></div><div class="w"><span>Address</span><b>${esc([l.addr,l.city,l.pin].filter(Boolean).join(', '))||'—'}</b></div>
 <div><span>Total contracts</span><b>${cs_.length}</b></div><div><span>Pending qty</span><b>${qsum(o,pe)}</b></div>
 <div><span>Total business</span><b>${inr(cs_.filter(c=>!c.x).reduce((s,c)=>s+val(c),0))}</b></div><div><span>Pending value</span><b>${inr(o.reduce((s,c)=>s+amtOf(c,pe(c)),0))}</b></div></div>
 <div class="sec">Ledger entries</div>${cs_.map(c=>`<div class="dl" onclick="vc('${c.id}')" style="cursor:pointer"><span><b>${esc(c.no)}</b><span class="tag">${c.b==id?'Buyer':'Seller'}</span><br><span class="mu">${esc(c.item)} · ${vq(c,c.q)} · ${fd(c.dt)}</span></span><span class="bd ${st(c)}">${st(c)}</span></div>`).join('')||'<div class="mu">No contracts with this party yet.</div>'}
 <div class="acts"><button class="btn s" onclick="lf('${id}')">Edit</button><button class="btn d" onclick="arm(this,()=>dl('${id}'))">Delete</button></div>`)}
function dl(id){if(db.c.some(c=>c.b==id||c.s==id)){toast('Cannot delete: ledger has contracts');return}db.l=db.l.filter(x=>x.id!=id);save();cs();render();toast('Ledger deleted')}
