/* Brokerlynx module: ui/preview
   In-app file preview for PDF and CSV.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

const PVX='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
function pvLib(){if(window.pdfjsLib&&window.pdfjsWorker)return Promise.resolve();
 return PVP||(PVP=(async()=>{const ld=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('load '+src));document.head.appendChild(s)});
  const inl=id=>{const e=document.getElementById(id);if(!e)return false;let t=e.textContent;if(e.dataset.b64){const bin=atob(t.trim()),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);t=new TextDecoder().decode(u)}const s=document.createElement('script');s.textContent=t;document.head.appendChild(s);return true};
  if(!window.pdfjsLib&&!inl('pvlib1'))await ld('pdf.min.js');
  if(!window.pdfjsWorker&&!inl('pvlib2'))await ld('pdf.worker.min.js');
  if(!window.pdfjsLib||!window.pdfjsWorker)throw new Error('pdf viewer missing')})().catch(e=>{PVP=null;throw e}))}
function pvClose(v){const o=document.getElementById('pvw');if(o)o.remove();if(PV){const r=PV.res,d=PV.doc;PV=null;try{d&&d.destroy()}catch(e){}if(r)r(!!v)}}
function pvOpen(blob,fn,title,kind,action){return new Promise(res=>{pvClose(false);
 const o=document.createElement('div');o.id='pvw';o.className='pvw';o.setAttribute('role','dialog');o.setAttribute('aria-label','File preview');
 const kb=Math.max(1,Math.round(blob.size/1024)),K=String(kind).toUpperCase();
 o.innerHTML=`<div class="pvh"><button class="pvx" aria-label="Close preview" onclick="pvClose(false)">${PVX}</button><div class="pvt"><small>${K} preview</small><b>${esc(title||fn)}</b><span>${esc(fn)} &middot; ${kb} KB</span></div>${kind=='pdf'?'<div class="pvz"><button aria-label="Zoom out" onclick="pvZoom(-1)">&minus;</button><button aria-label="Zoom in" onclick="pvZoom(1)">+</button></div>':''}</div>
 <div class="pvb" id="pvb"><div class="pvl"><i class="pvsp"></i>Preparing preview&hellip;</div></div>
 <div class="pvf"><button class="pvs" id="pvs">Save / Share ${K}</button><button class="pvc" onclick="pvClose(false)">Close</button></div>`;
 document.body.appendChild(o);PV={res,kind,blob,zoom:1,busy:0,tok:0};
 document.getElementById('pvs').onclick=async()=>{if(!PV||PV.busy)return;PV.busy=1;const b=document.getElementById('pvs'),t=b.textContent;b.disabled=true;b.textContent='Opening\u2026';let ok=0;
  try{ok=await action()}catch(e){if(!/cancel/i.test(String(e&&e.message||e)))toast('Could not save the file')}
  if(PV)PV.busy=0;const b2=document.getElementById('pvs');if(b2){b2.disabled=false;b2.textContent=t}if(ok)pvClose(true)};
 (kind=='pdf'?pvPdf():pvCsv()).catch(()=>{const b=document.getElementById('pvb');if(b)b.innerHTML='<div class="pvl">A preview is not available for this file on this device. You can still save or share it.</div>'})})}
function pvZoom(d){if(!PV||PV.kind!='pdf')return;const Z=[.75,1,1.5,2,3],i=Math.max(0,Math.min(Z.length-1,Z.indexOf(PV.zoom)+d));if(Z[i]===PV.zoom)return;PV.zoom=Z[i];pvPdf().catch(()=>{})}
async function pvPdf(){await pvLib();if(!PV)return;const P=window.pdfjsLib;
 if(!PV.doc){const data=new Uint8Array(await PV.blob.arrayBuffer());PV.doc=await P.getDocument({data}).promise}
 const body=document.getElementById('pvb');if(!body||!PV)return;const doc=PV.doc,N=Math.min(doc.numPages,40),tok=++PV.tok,sy=body.scrollTop;body.innerHTML='';
 const w=Math.max(200,body.clientWidth-20),dpr=Math.min(window.devicePixelRatio||1,2);
 for(let i=1;i<=N;i++){if(!PV||PV.tok!==tok)return;const pg=await doc.getPage(i),v0=pg.getViewport({scale:1}),sc=w/v0.width*PV.zoom,vp=pg.getViewport({scale:sc*dpr});
  const wrap=document.createElement('div');wrap.className='pvp';const cv=document.createElement('canvas');cv.width=Math.floor(vp.width);cv.height=Math.floor(vp.height);cv.style.width=Math.floor(vp.width/dpr)+'px';cv.style.height=Math.floor(vp.height/dpr)+'px';wrap.appendChild(cv);
  const lb=document.createElement('div');lb.className='pvn';lb.textContent='Page '+i+' of '+doc.numPages;wrap.appendChild(lb);body.appendChild(wrap);
  await pg.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;if(i==1)body.scrollTop=sy}
 if(PV&&PV.tok===tok&&doc.numPages>N){const m=document.createElement('div');m.className='pvm';m.textContent='Showing the first '+N+' pages. The saved file has all '+doc.numPages+' pages.';body.appendChild(m)}}
async function pvCsv(){const txt=await PV.blob.text(),rows=csvParse(txt),body=document.getElementById('pvb');if(!body||!PV)return;
 if(!rows.length){body.innerHTML='<div class="pvl">This file has no rows.</div>';return}
 const MR=300,MC=40,nc=Math.min(MC,Math.max(...rows.slice(0,MR+1).map(r=>r.length))),hdr=rows[0].length>=nc&&nc>1,L=i=>String.fromCharCode(65+i%26)+(i>=26?Math.floor(i/26):''),heads=hdr?rows[0].slice(0,nc):[...Array(nc).keys()].map(L),data=hdr?rows.slice(1):rows,nr=data.length,rs=data.slice(0,MR);
 body.innerHTML=`<div class="pvm">${nr} row${nr==1?'':'s'} &middot; ${Math.max(...rows.map(r=>r.length))} column${nc==1?'':'s'}</div><div class="pvtw"><table class="pvtb"><thead><tr><th>#</th>${heads.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rs.map((r,i)=>`<tr><td>${i+1}</td>${heads.map((_,j)=>`<td>${esc(r[j]==null?'':r[j])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${nr>MR?`<div class="pvm">Showing the first ${MR} rows. The saved file has all ${nr} rows.</div>`:''}`}
