/* Brokerlynx module: features/settings
   Company details and terms.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

const DTCf=()=>DTC.split('Sunshine Industries').join(CO().n);
function tcf(){sh(`<h2>Terms on every PDF</h2><p class="mu">One clause per line. These print under the contract details on every PDF. Edit them to match your own business terms.</p><div class="f"><textarea id="tct" rows="10">${esc(db.tc!=null?db.tc:DTCf())}</textarea></div><button class="btn" onclick="stc()">Save terms</button><div class="acts" style="grid-template-columns:1fr"><button class="btn s" onclick="rtc()">Reset to standard terms</button></div>`)}
function cof(){const o=CO();sh(`<h2>Company details</h2><p class="mu">Printed on every PDF and CSV you create.</p>
 <div class="f"><span>Company name *</span><input id="con" value="${esc(o.n)}" maxlength="60"></div>
 <div class="f"><span>GSTIN (optional)</span><input id="cog" value="${esc(o.g)}" maxlength="15" autocapitalize="characters" oninput="this.value=this.value.toUpperCase().replace(/[^0-9A-Z]/g,'')"></div>
 <div class="f"><span>Phone number *</span><input id="cop" value="${esc(o.ph)}" inputmode="numeric" maxlength="10"></div>
 <div class="f"><span>Email *</span><input id="coe" type="email" value="${esc(o.em)}" maxlength="80"></div>
 <div class="f"><span>Address (optional)</span><input id="coa" value="${esc(o.ad)}" maxlength="120"></div>
 <div id="er" class="er"></div><button class="btn" onclick="scof()">Save company details</button>`)}
function scof(){const g=i=>$('#'+i).value.trim().replace(/\s+/g,' '),er=m=>{$('#er').textContent=m},o=CO(),n=g('con'),gs=g('cog').toUpperCase(),ph=phNorm(g('cop')),em=g('coe'),ad=g('coa');
 if(!n)return er('Enter the company name');
 if(gs){const r=checkGST(gs);if(!r.ok)return er(r.m)}
 if(!phOk(ph))return er('Enter a valid 10-digit mobile number');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em))return er('Enter a valid email address');
 if(db.tc!=null&&o.n!=n)db.tc=db.tc.split(o.n).join(n);
 db.co={n,g:gs,ph,em,ad};save();cs();toast('Company details saved');render()}
function stc(){db.tc=$('#tct').value.trim();save();cs();toast('Terms saved')}
function rtc(){delete db.tc;save();tcf();toast('Standard terms restored')}
