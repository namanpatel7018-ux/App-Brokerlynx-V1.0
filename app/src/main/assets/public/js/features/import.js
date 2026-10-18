/* Brokerlynx module: features/import
   Ledger import from CSV / Excel.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

/* ---------- ledger import (CSV / Excel) ---------- */
const IMH={name:['name','partyname','party','ledger','ledgername','customer','customername','companyname','company','firmname','firm','buyer','seller','account','accountname','tradename','legalname','nameofparty'],
 type:['type','ledgertype','partytype','role','category','buyerseller','nature'],
 gst:['gstin','gst','gstno','gstnumber','gstinno','gstinnumber','gstinuin','gstregistrationnumber'],
 addr:['address','address1','addr','street','location','fulladdress','addressline1','officeaddress'],
 city:['city','town','district','place'],
 pin:['pincode','pin','zip','zipcode','postalcode','postcode','pinno'],
 ph:['phone','mobile','mobileno','mobilenumber','phoneno','phonenumber','contact','contactno','contactnumber','whatsapp','cell','telephone','tel','mob']};
const IMF=['name','type','gst','addr','city','pin','ph'],IML={name:'Party name',type:'Type',gst:'GSTIN',addr:'Address',city:'City',pin:'Pincode',ph:'Phone'};
const imNorm=s=>String(s==null?'':s).toLowerCase().replace(/[^a-z0-9]/g,'');
function csvParse(t){if(t.charCodeAt(0)==0xFEFF)t=t.slice(1);const first=t.split(/\r?\n/,1)[0]||'';
 const D=[',',';','\t','|'].map(d=>[d,first.split(d).length-1]).sort((a,b)=>b[1]-a[1])[0];const dl=D[1]?D[0]:',';
 const rows=[];let r=[],c='',q=0;for(let i=0;i<t.length;i++){const ch=t[i];
  if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=0}else c+=ch}
  else if(ch=='"')q=1;else if(ch==dl){r.push(c);c=''}
  else if(ch=='\n'||ch=='\r'){if(ch=='\r'&&t[i+1]=='\n')i++;r.push(c);rows.push(r);r=[];c=''}else c+=ch}
 if(c!==''||r.length){r.push(c);rows.push(r)}return rows.filter(x=>x.some(v=>String(v).trim()!==''))}
function decText(b){try{return new TextDecoder('utf-8',{fatal:true}).decode(b)}catch(e){return new TextDecoder('windows-1252').decode(b)}}
function imMap(hdr){const m={},used=new Set();
 hdr.forEach((h,i)=>{const n=imNorm(h);for(const f of IMF){if(m[f]===undefined&&IMH[f].includes(n)&&!used.has(i)){m[f]=i;used.add(i);break}}});
 hdr.forEach((h,i)=>{const n=imNorm(h);if(used.has(i)||!n)return;for(const f of IMF){if(m[f]===undefined&&IMH[f].some(s=>s.length>3&&n.includes(s))){m[f]=i;used.add(i);break}}});return m}
function imGuess(rows){const m={},n=Math.max(...rows.slice(0,50).map(r=>r.length),0),S=rows.slice(0,50),cols=[...Array(n).keys()];
 const ratio=(i,fn)=>{const v=S.map(r=>String(r[i]==null?'':r[i]).trim()).filter(Boolean);return v.length?v.filter(fn).length/v.length:0};
 const pick=(f,fn,th)=>{let b=-1,bs=th;cols.forEach(i=>{if(Object.values(m).includes(i))return;const s=ratio(i,fn);if(s>bs){bs=s;b=i}});if(b>=0)m[f]=b};
 pick('gst',v=>/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/i.test(v.replace(/\s/g,'')),.4);
 pick('ph',v=>/^(\+?91)?[6-9]\d{9}$/.test(v.replace(/[^\d+]/g,'')),.5);
 pick('pin',v=>/^\d{6}$/.test(v),.5);
 pick('name',v=>/[A-Za-z]{2}/.test(v)&&!/^\d+$/.test(v),.5);return m}
function imType(v,def){const s=String(v||'').toLowerCase();if(!s)return def;if(/both/.test(s))return 'Both';if(/buy|purchas|customer|debtor|party b/.test(s))return 'Buyer';if(/sell|suppl|vendor|creditor|sale/.test(s))return 'Seller';return def}
function imRows(){const I=IM,m=I.map,data=I.hdr?I.raw.slice(1):I.raw,out=[],seen=new Set(),seenG=new Set();
 data.slice(0,2000).forEach((r,ix)=>{const g=f=>m[f]===undefined?'':String(r[m[f]]==null?'':r[m[f]]).trim();
  const name=g('name').replace(/\s+/g,' ');if(!name)return;
  const x={n:ix+(I.hdr?2:1),name,type:imType(g('type'),I.def),gst:g('gst').toUpperCase().replace(/[^A-Z0-9]/g,''),addr:g('addr'),city:g('city'),pin:(g('pin').replace(/\s/g,'').match(/\d{6}/)||[''])[0],ph:'',issues:[],st:'ok'};
  const rawPh=g('ph'),phs=rawPh.split(/[,;\/\n]| and /i).map(s=>phNorm(s)).filter(Boolean);x.ph=phs.find(phOk)||'';
  if(!rawPh)x.issues.push('phone missing');else if(!x.ph)x.issues.push('phone not valid');
  if(!x.pin){x.issues.push(g('pin')?'pincode not valid':'pincode missing')}else if(!pinOk(x.pin)){x.issues.push('pincode not valid');x.pin=''}
  if(x.gst){const c=checkGST(x.gst);if(!c.ok){x.issues.push('GSTIN not valid, left blank');x.gst=''}}
  const k=nk(name);
  if(db.l.find(l=>nk(l.name)==k)){x.st='dup';x.why='already in your ledgers'}else if(seen.has(k)){x.st='dup';x.why='repeated in the file'}
  else if(x.gst&&(db.l.find(l=>l.gst==x.gst)||seenG.has(x.gst))){x.st='dup';x.why='GSTIN already used'}
  if(x.st=='ok'){seen.add(k);if(x.gst)seenG.add(x.gst)}out.push(x)});
 I.over=(data.length>2000);return out}
const IMI='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg>';
function impCard(){return `<div class="imc" onclick="imOpen()"><div class="bi">${IMI}</div><div class="bt"><b>Import ledgers from a file</b><span>Upload a CSV or Excel sheet. We read the names, GSTIN, phone and address for you.</span></div><i>&rsaquo;</i></div>`}
function imOpen(){IM=null;sh(`<div class="ul"><h2>Import ledgers</h2>
 <div class="stp" style="margin-top:4px"><i>1</i><b>Choose your file</b></div>
 <div class="mu" style="margin-bottom:10px;line-height:1.5">Works with CSV, Excel (.xlsx, .xls) and text files. Columns are matched automatically by their headings, such as Party Name, GSTIN, Phone, Address, City and Pincode. Only the party name is required.</div>
 <label class="btn" style="display:block;text-align:center;cursor:pointer;box-sizing:border-box">Choose CSV or Excel file<input id="imf" type="file" accept=".csv,.tsv,.txt,.xlsx,.xls,text/csv,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" style="display:none" onchange="imFile(this)"></label>
 <div id="imm" class="er"></div>
 <button class="btn s" style="margin-top:6px" onclick="imSample()">Download a sample file</button>
 <div class="mu" style="margin-top:12px;line-height:1.5">Nothing is changed until you review the list and tap Import. A safety copy of your data is saved first.</div></div>`)}
async function imSample(){const csv='\ufeffParty Name,Type,GSTIN,Address,City,Pincode,Phone\r\nAlpha Traders,Buyer,,"Shop 12, Market Road",Ahmedabad,380001,9825012345\r\nBeta Mills,Seller,,Plot 5 GIDC,Surat,395003,9898123456\r\n';
 await deliverCsv(new Blob([csv],{type:'text/csv;charset=utf-8'}),'Brokerlynx-Ledger-Import-Sample.csv','Sample ledger file')}
async function imFile(inp){const f=inp.files&&inp.files[0],e=$('#imm');if(!f)return;if(e)e.textContent='';
 try{const buf=await f.arrayBuffer();let rows;
  if(/\.xlsx?$/i.test(f.name)){if(!window.XLSX)throw new Error('The Excel reader is not available. Please save the sheet as CSV and try again.');const wb=XLSX.read(new Uint8Array(buf),{type:'array'});const ws=wb.Sheets[wb.SheetNames[0]];rows=XLSX.utils.sheet_to_json(ws,{header:1,raw:false,defval:''})}
  else rows=csvParse(decText(new Uint8Array(buf)));
  rows=rows.filter(r=>r.some(v=>String(v).trim()!==''));
  if(rows.length<1)throw new Error('This file has no rows.');
  let map=imMap(rows[0]),hdr=map.name!==undefined;if(!hdr)map=imGuess(rows);
  IM={raw:rows,map,hdr,def:'Both',file:f.name};
  if(map.name===undefined){IM.pick=1}imShow()}
 catch(x){const e2=$('#imm');if(e2)e2.textContent=String(x&&x.message||x)||'Could not read this file.'}}
function imShow(){const I=IM,R=imRows(),ok=R.filter(r=>r.st=='ok'),wn=ok.filter(r=>r.issues.length),dp=R.filter(r=>r.st=='dup');I.R=R;
 const cols=I.raw[0].map((h,i)=>I.hdr?(String(h).trim()||'Column '+(i+1)):'Column '+(i+1)+(I.raw[0][i]?': '+String(I.raw[0][i]).slice(0,14):''));
 const sel=IMF.map(f=>`<div class="f"><span>${IML[f]}</span><select onchange="imSet('${f}',this.value)"><option value="">Not in file</option>${cols.map((c,i)=>`<option value="${i}" ${IM.map[f]===i?'selected':''}>${esc(c)}</option>`).join('')}</select></div>`).join('');
 const rowH=r=>{const c=r.st=='dup'?'dp':r.issues.length?'wn':'';return `<div class="imr ${c}"><div class="ix">${r.st=='dup'?'&ndash;':r.issues.length?'!':'&#10003;'}</div><div><b>${esc(r.name)}</b><span>${esc([r.type,r.gst,r.ph,[r.city,r.pin].filter(Boolean).join(' ')].filter(Boolean).join(' · '))}</span>${r.st=='dup'?`<span style="color:#9db4b8">Skipped: ${r.why}</span>`:r.issues.length?`<span style="color:#f5c15d">${esc(r.issues.join(', '))}</span>`:''}</div></div>`};
 sh(`<div class="ul"><h2>Review import</h2><div class="mu" style="margin:-6px 0 6px;word-break:break-all">${esc(I.file)}</div>
 <div class="ims"><div class="ok"><b>${ok.length}</b><span>To import</span></div><div class="wn"><b>${wn.length}</b><span>Incomplete</span></div><div class="dp"><b>${dp.length}</b><span>Skipped</span></div></div>
 ${I.over?'<div class="pnote" style="margin-bottom:10px"><b>Large file</b><span>Only the first 2000 rows were read. Import the rest in a second file.</span></div>':''}
 ${R.length?`<div class="imlist">${R.slice(0,60).map(rowH).join('')}${R.length>60?`<div class="mu" style="padding:10px 0;text-align:center">and ${R.length-60} more</div>`:''}</div>`:'<div class="pnote"><b>No ledgers found</b><span>We could not find a party name column. Use "Match columns" below to choose it.</span></div>'}
 <div class="f" style="margin-top:12px"><span>Type for rows without a type</span><select onchange="IM.def=this.value;imShow()">${['Both','Buyer','Seller'].map(t=>`<option ${I.def==t?'selected':''}>${t}</option>`).join('')}</select></div>
 <details ${I.pick?'open':''} style="margin:4px 0 12px"><summary style="cursor:pointer;color:#f1d28f;font-weight:700;padding:6px 0">Match columns</summary><div style="margin-top:8px">${sel}</div></details>
 ${wn.length?`<div class="mu" style="margin-bottom:10px;line-height:1.5">Incomplete ledgers are still imported. They show an <b>Incomplete</b> tag so you can add the missing phone or pincode later.</div>`:''}
 <button class="btn" ${ok.length?'':'disabled'} onclick="imGo()">Import ${ok.length} ledger${ok.length==1?'':'s'}</button>
 <button class="btn s" style="margin-top:10px" onclick="cs()">Cancel</button></div>`)}
function imSet(f,v){IM.map[f]=v===''?undefined:+v;IM.pick=1;imShow()}
function imGo(){if(!IM||!IM.R)return;const ok=IM.R.filter(r=>r.st=='ok');if(!ok.length)return;
 snapNow('Before ledger import',localStorage.getItem(K)||JSON.stringify(db));
 ok.forEach(r=>db.l.push({id:uid(),name:r.name,type:r.type,gst:r.gst,addr:r.addr,city:r.city,pin:r.pin,ph:r.ph}));
 save();IM=null;cs();render();toast(ok.length+' ledger'+(ok.length==1?'':'s')+' imported')}
