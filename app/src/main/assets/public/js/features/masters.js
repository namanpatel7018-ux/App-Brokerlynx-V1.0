/* Brokerlynx module: features/masters
   Masters: items, transporters, vehicles.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

function itf(id){EID=id||'';const i=db.i.find(x=>x.id==id)||{};
 sh(`<h2>${id?'Edit item':'New item'}</h2><div class="f"><span>Item name</span><input id="in" value="${esc(i.name||'')}" placeholder="e.g. Wheat" autocomplete="off"></div><div id="er" class="er"></div><button class="btn" onclick="si()">Save item</button>${id?`<div class="acts" style="grid-template-columns:1fr"><button class="btn d" onclick="arm(this,()=>di('${id}'))">Delete item</button></div>`:''}`)}
function si(){const n=$('#in').value.trim().replace(/\s+/g,' ');if(!n)return $('#er').textContent='Enter the item name';
 const d=db.i.find(x=>nk(x.name)==nk(n)&&x.id!=EID);if(d)return $('#er').textContent=`Item “${d.name}” already exists`;
 if(EID){const o=db.i.find(x=>x.id==EID);db.c.forEach(c=>{if(nk(c.item)==nk(o.name))c.item=n});o.name=n}else db.i.push({id:uid(),name:n});
 save();cs();render();toast('Item saved')}
function di(id){const o=db.i.find(x=>x.id==id);if(db.c.some(c=>nk(c.item)==nk(o.name)))return toast('Cannot delete: item is used in contracts');db.i=db.i.filter(x=>x.id!=id);save();cs();render();toast('Item deleted')}
function ich(){$('#cin').style.display=$('#ci').value=='__new'?'block':'none'}
function tnf(id){EID=id||'';const t=db.t.find(x=>x.id==id)||{};
 sh(`<h2>${id?'Edit transporter':'New transporter'}</h2><div class="f"><span>Transporter name</span><input id="tn" value="${esc(t.name||'')}" autocomplete="off"></div><div id="er" class="er"></div><button class="btn" onclick="stn()">Save transporter</button>${id?`<div class="acts" style="grid-template-columns:1fr"><button class="btn d" onclick="arm(this,()=>dtn('${id}'))">Delete transporter</button></div>`:''}`)}
function stn(){const n=$('#tn').value.trim().replace(/\s+/g,' ');if(!n)return $('#er').textContent='Enter the transporter name';
 const d=db.t.find(x=>nk(x.name)==nk(n)&&x.id!=EID);if(d)return $('#er').textContent=`Transporter “${d.name}” already exists`;
 if(EID){const o=db.t.find(x=>x.id==EID);db.o.forEach(x=>{if(nk(x.tn)==nk(o.name))x.tn=n});o.name=n}else db.t.push({id:uid(),name:n});
 save();cs();render();toast('Transporter saved')}
function dtn(id){db.vh.forEach(v=>{if(v.t==id)v.t=''});db.t=db.t.filter(x=>x.id!=id);save();cs();render();toast('Transporter deleted')}
function vhf(id){EID=id||'';const v=db.vh.find(x=>x.id==id)||{};
 sh(`<h2>${id?'Edit vehicle':'New vehicle'}</h2><div class="f"><span>Vehicle number</span><input id="vn" value="${esc(v.no||'')}" maxlength="11" autocapitalize="characters" placeholder="e.g. GJ01AB1234" oninput="vnLive(this)"></div><div class="f"><span>Transporter (optional)</span><select id="vt"><option value="">No transporter</option>${db.t.map(t=>`<option value="${t.id}" ${v.t==t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select></div><div id="er" class="er"></div><button class="btn" onclick="svh()">Save vehicle</button>${id?`<div class="acts" style="grid-template-columns:1fr"><button class="btn d" onclick="arm(this,()=>dvh('${id}'))">Delete vehicle</button></div>`:''}`)}
function svh(){const n=$('#vn').value.trim(),er=m=>{$('#er').textContent=m};if(!vnOk(n))return er(vnMsg(n));
 if(db.vh.some(x=>x.no==n&&x.id!=EID))return er(`Vehicle ${n} already exists`);
 if(EID){const o=db.vh.find(x=>x.id==EID);db.o.forEach(x=>{if(x.vn==o.no)x.vn=n});o.no=n;o.t=$('#vt').value}else db.vh.push({id:uid(),no:n,t:$('#vt').value});
 save();cs();render();toast('Vehicle saved')}
function dvh(id){db.vh=db.vh.filter(x=>x.id!=id);save();cs();render();toast('Vehicle deleted')}
