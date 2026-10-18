/* Brokerlynx module: features/contract-pdf
   Contract PDF generation.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

function mk(id){
 if(!window.jspdf)return null;
 const c=C(id);let r;
 for(const k of [1,.93,.86,.79,.72,.65]){r=drawNote(c,k);if(r.y<=257)break}
 return r}
function pdfKit(d){const rg=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));return{rg,fl:h=>d.setFillColor(...rg(h)),ik:h=>d.setTextColor(...rg(h)),ld:h=>d.setDrawColor(...rg(h)),tx:(t,x,y,o)=>d.text(t,x,y,o),fo:(w,z)=>{d.setFont('helvetica',w);d.setFontSize(z)},rs:n=>'Rs. '+(+n).toLocaleString('en-IN',{maximumFractionDigits:2})}}
function pdfHead(d,K,title,rl,rv){const{fl,ik,tx,fo}=K,W=210,M=15;
 fl('#0B3B3C');d.rect(0,0,W,38,'F');fl('#D9A84E');d.rect(0,38,W,1.5,'F');
 ik('#FFFFFF');fo('bold',21);{let z=21;const nm=CO().n.toUpperCase();fo('bold',z);while(z>11&&d.getTextWidth(nm)>118){z--;fo('bold',z)}tx(nm,M,17);z=8.5;const cl=coLine();fo('normal',z);while(z>6&&d.getTextWidth(cl)>118){z-=.5;fo('normal',z)}ik('#D9A84E');tx(cl,M,24)}ik('#B8D4D2');fo('bold',9);tx(title,M,32);
 fo('normal',8.5);ik('#B8D4D2');tx(rl,W-M,15,{align:'right'});ik('#D9A84E');fo('bold',17);tx(String(rv),W-M,25,{align:'right'})}
function pdfFoot(d,K,sigs,what){const{fl,ik,ld,tx,fo}=K,W=210,M=15;
 ld('#9AA8B6');d.setLineWidth(.2);sigs.forEach((t,i)=>{const x=M+i*65;d.line(x,264,x+50,264);ik('#64748B');fo('normal',8);let t2=t;while(d.getTextWidth(t2)>58&&t2.length>6){t2=t2.slice(0,-2)}if(t2!=t)t2=t2.trim()+'..';tx(t2,x,269)});
 fl('#0B3B3C');d.rect(0,274,W,23,'F');fl('#D9A84E');d.rect(0,274,W,1.2,'F');ik('#D9A84E');fo('bolditalic',12);{const fit=(t,z,st)=>{fo(st||'normal',z);while(z>5&&d.getTextWidth(t)>180){z-=.5;fo(st||'normal',z)}return t};tx(fit('Thank You For Connecting With '+CO().n,12,'bolditalic'),W/2,284,{align:'center'});ik('#FFFFFF');tx(fit(coLine(),8.5),W/2,290,{align:'center'});ik('#8FB3B1');tx(fit((CO().ad?CO().ad+'  |  ':'')+'Computer-generated '+what+'  |  '+fd(ymd(new Date())),7),W/2,294.5,{align:'center'})}}
function pdfParty(d,K,x,y,t,l){const{fl,ik,ld,tx,fo}=K;
 fl('#F3F6F8');ld('#DDE4EA');d.roundedRect(x,y,87,38,2,2,'FD');ik('#17696A');fo('bold',8);tx(t,x+5,y+6);ik('#0F1D2B');fo('bold',12);tx(d.splitTextToSize(l.name||'-',77)[0],x+5,y+13);fo('normal',8.5);ik('#475569');
 const g=l.gst?checkGST(l.gst):null,rows=[l.gst?'GSTIN: '+l.gst:'GSTIN: not provided',...d.splitTextToSize([l.addr,l.city,g&&g.ok?g.d.state.replace(/ \(\d+\)/,''):'',l.pin].filter(Boolean).join(', ')||'Address not provided',77).slice(0,2),l.ph?'Phone: '+l.ph:''].filter(Boolean).slice(0,5);
 rows.forEach((r,i)=>tx(r,x+5,y+19+i*4.4))}
function drawNote(c,k){
 const b=L(c.b)||{},s=L(c.s)||{},d=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),W=210,M=15,fk=Math.max(k,.8),K=pdfKit(d),{fl,ik,ld,tx,rs}=K,
 fo0=K.fo,fo=(w,z)=>K.fo(w,z*fk);
 pdfHead(d,K,'CONTRACT NOTE','Contract no.',c.no);
 [['Contract date',fd(c.dt)+', '+c.tm],['Valid till',fd(c.v)],['Status',st(c)]].forEach((m,i)=>{const x=M+i*61;ik('#64748B');fo0('normal',8);tx(m[0],x,48);ik('#0F1D2B');fo0('bold',11);tx(m[1],x,54)});
 pdfParty(d,K,M,59,'BUYER',b);pdfParty(d,K,M+93,59,'SELLER',s);
 let y=102;fl('#0B3B3C');d.rect(M,y,180,8,'F');ik('#FFFFFF');fo0('bold',9);tx('Contract details',M+4,y+5.6);y+=8;
 const rows=[['Item',c.item],['Quantity',vq(c,c.q)+kgT(c,c.q)],['Rate per '+rtS(c),rs(c.r)+(txT(c)?'  ('+txT(c)+')':'')],...(altR(c)?[[altR(c)[0],rs(altR(c)[1])]]:[]),['Contract value',rs(val(c))],['Delivered so far',vq(c,dv(c))],['Pending delivery',vq(c,pe(c))+'  ('+rs(amtOf(c,pe(c)))+')'],['Payment terms',c.pt],['Delivery terms',c.dp],['Quality / specification',c.ql],['Packing',c.pk],['Brokerage',bkLine(c,rs)]].filter(r=>r[1]);
 rows.forEach((r,i)=>{const hl=r[0]=='Contract value';fo('bold',hl?12:10);const t=d.splitTextToSize(String(r[1]),116),h=Math.max(8.4*k,(t.length*4.6+3.6)*k),by=t.length==1?y+h/2+1.2*fk:y+4.2*k;
  fl(hl?'#FBF3E1':i%2?'#F3F6F8':'#FFFFFF');d.rect(M,y,180,h,'F');ik('#64748B');fo('normal',9);tx(r[0],M+4,by);ik('#0F1D2B');fo('bold',hl?12:10);tx(t,M+58,by);y+=h});
 ld('#DDE4EA');d.line(M,y,W-M,y);ik('#64748B');fo('normal',8);tx(c.ru=='n'?'Quantity is counted in Nos and the rate is quoted per Nos.':c.ru=='q'?'Quantity is in kgs and the rate is quoted per kg. 1 MT = 1,000 kg.':c.ru=='g'?'Quantity is in kgs and the rate is quoted per 10 kg. 1 MT = 1,000 kg.':c.ru=='m'?'Rates are quoted per MT. 1 MT = 1,000 kg.':'Rates are quoted per 10 kg. 1 MT = 1,000 kg = 100 units of 10 kg.',M,y+4.6*k+1);y+=9*k;
 if(c.note){fo('bold',9);ik('#17696A');tx('Remarks',M,y+3);fo('normal',8.5);ik('#0F1D2B');const t=d.splitTextToSize(c.note,180).slice(0,3);tx(t,M,y+3+4.4*fk);y+=3+4.4*fk+t.length*3.6*fk+2*k}
 const dd=c.d||[];if(dd.length){fo('bold',9);ik('#17696A');tx('Delivery record',M,y+3);y+=6.5*k;fo('normal',8);ik('#0F1D2B');const sh_=dd.slice(-12),rn=Math.ceil(sh_.length/3);sh_.forEach((x,i)=>tx(fdt(x)+'  -  '+vq(c,x.q),M+(i%3)*60,y+2.5+Math.floor(i/3)*4.4*fk));y+=rn*4.4*fk+3*k;if(dd.length>12){fo('normal',7.5);ik('#64748B');tx('Showing latest 12 of '+dd.length+' deliveries',M,y);y+=3.5*k}}
 const tc=(db.tc!=null?db.tc:DTCf()).split('\n').map(x=>x.trim()).filter(Boolean);
 if(tc.length){fo('bold',9);ik('#17696A');tx('Terms & conditions',M,y+3);y+=6.5*k;fo('normal',7.8);ik('#334155');tc.forEach((t,i)=>{const l=d.splitTextToSize((i+1)+'. '+t,180);tx(l,M,y+2.2);y+=l.length*3.3*fk+1.2*k})}
 pdfFoot(d,K,['Buyer signature','Seller signature','Broker signature'],'contract note');
 return{d,c,y}}
async function pdf(id,who){
 const r=mk(id);if(!r)return toast('PDF engine not loaded');
 const{d,c}=r,fn='Contract-'+String(c.no).replace(/[^\w-]/g,'')+'.pdf',blob=d.output('blob');
 const msg=who?`Contract ${c.no}: ${c.item}, ${vq(c,c.q)} at ${inr(c.r)} per ${rtS(c)}${txT(c)?' ('+txT(c)+')':''}. Please find the contract note attached.\n- ${CO().n}${CO().ph?', '+CO().ph:''}`:'';
 try{const ok=await pvOpen(blob,fn,'Contract '+c.no,'pdf',()=>savePdf(blob,fn,msg,'Contract '+c.no));if(ok)toast(who?'Choose WhatsApp to send':'PDF ready')}catch(e){if(!/cancel/i.test(String(e&&e.message||e)))toast('Could not create the PDF')}
}
