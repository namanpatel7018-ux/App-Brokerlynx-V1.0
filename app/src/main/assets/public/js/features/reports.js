/* Brokerlynx module: features/reports
   Reports and exports: party statements, CSV and PDF.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

/* PDF export + native share */
async function deliverCsv(blob,fn,title){try{const ok=await pvOpen(blob,fn,title,'csv',()=>savePdf(blob,fn,'',title));if(ok){fcDone(fn);toast('CSV ready')}else FCN=''}catch(e){FCN='';if(!/cancel/i.test(String(e&&e.message||e)))toast('Could not create the CSV')}}
async function savePdf_(blob,fn,title){return await savePdf(blob,fn,'',title)}
async function deliverPdf(blob,fn,title){try{const ok=await pvOpen(blob,fn,title,'pdf',()=>savePdf(blob,fn,'',title));if(ok){fcDone(fn);toast('PDF ready')}else FCN=''}catch(e){FCN='';if(!/cancel/i.test(String(e&&e.message||e)))toast('Could not create the PDF')}}
function rdata(){if(RC){const c=C(RC);return c?[c]:[]}return db.c.filter(c=>!c.x&&c.dt>=RF&&c.dt<=RT&&(!RI||nk(c.item)==nk(RI))).sort((a,b)=>(a.dt+a.tm).localeCompare(b.dt+b.tm))}
async function ppdf(id){
 if(!window.jspdf)return toast('PDF engine not loaded');const l=L(id);if(!l)return;
 const rows=rdata().filter(c=>(c.b==id||c.s==id)&&bkSh(c,id)>0),d=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),W=210,M=15,K=pdfKit(d),{fl,ik,ld,tx,fo,rs}=K,
 tot=rows.reduce((s,c)=>s+bkAmt(c)*bkSh(c,id),0),pen=rows.reduce((s,c)=>s+bkPend(c)*bkSh(c,id),0);
 pdfHead(d,K,'PARTY BROKERAGE STATEMENT','Statement period','');
 ik('#D9A84E');fo('bold',11);tx(RC&&rows.length==1?'Contract '+rows[0].no:fd(RF)+'  to  '+fd(RT),W-M,25,{align:'right'});
 let y=44;pdfParty(d,K,M,y,'PARTY',l);
 [['Contracts',String(rows.length)],['Total brokerage',rs(tot)],['Pending brokerage',rs(pen)]].forEach((b,i)=>{const yy=y+i*13;fl(i==2?'#FBF3E1':'#F3F6F8');ld('#DDE4EA');d.roundedRect(M+93,yy,87,11,2,2,'FD');ik('#64748B');fo('normal',8);tx(b[0],M+97,yy+7);ik('#0F1D2B');fo('bold',10.5);tx(b[1],M+176,yy+7.2,{align:'right'})});
 y+=46;const n0=rows.length,avail=266-y-8-10-8;let ch=10,fit=0;
 for(const h of [10,9,8,7,6,5.4,4.6,4,3.6]){ch=h;if(n0*h<=avail){fit=1;break}}
 const cN=fit?n0:Math.max(1,Math.floor(avail/ch));
 fl('#0B3B3C');d.rect(M,y,180,8,'F');ik('#FFFFFF');fo('bold',8);tx('Date',M+2,y+5.4);tx('Contract',M+19,y+5.4);tx('Counterparty',M+38,y+5.4);tx('Item',M+90,y+5.4);tx('Quantity',M+128,y+5.4,{align:'right'});tx('Brokerage',M+153,y+5.4,{align:'right'});tx('Pending',M+178,y+5.4,{align:'right'});y+=8;
 rows.slice(0,cN).forEach((c,i)=>{const sh=bkSh(c,id),other=c.b==id?c.s:c.b,two=ch>=9,fs=two?8:Math.max(5.6,Math.min(8,ch*1.4)),by=y+ch/2+fs*0.125,a=bkAmt(c)*sh;
  fl(i%2?'#FFFFFF':'#F3F6F8');d.rect(M,y,180,ch,'F');ik('#0F1D2B');fo('normal',two?7.5:fs);tx(fd(c.dt),M+2,by);fo('bold',two?8:fs);tx(String(c.no),M+19,by);
  if(two){fo('bold',7.2);tx(d.splitTextToSize(ln(other),48)[0],M+38,y+ch*0.42);fo('normal',6.4);ik('#64748B');tx((c.b==id?'Buyer':'Seller')+' - pays '+Math.round(sh*100)+'%',M+38,y+ch*0.8)}
  else{fo('normal',fs);tx(d.splitTextToSize(ln(other),50)[0],M+38,by)}
  ik('#0F1D2B');fo('normal',two?7.5:fs);const qt=vq(c,c.q),qw=d.getTextWidth(qt),iw=Math.max(14,35.5-qw),it=String(c.item||'-').replace(/\s+/g,' ').trim(),cut=(t,w)=>{if(d.getTextWidth(t)<=w)return t;while(t.length>1&&d.getTextWidth(t.replace(/\s+$/,'')+'...')>w)t=t.slice(0,-1);return t.replace(/\s+$/,'')+'...'};
  if(two){fo('normal',7.2);const il=d.splitTextToSize(it,iw);if(il.length<2)tx(cut(il[0],iw),M+90,by);else{tx(cut(il[0],iw),M+90,y+ch*0.42);tx(cut(il.slice(1).join(' '),iw),M+90,y+ch*0.8)}fo('normal',7.5)}
  else tx(cut(it,iw),M+90,by);
  tx(qt,M+128,by,{align:'right'});fo('bold',two?8:fs);tx(bkAmt(c)>0?rs(a):'Not set',M+153,by,{align:'right'});tx(bkAmt(c)>0?rs(bkPend(c)*sh):'-',M+178,by,{align:'right'});y+=ch});
 fl('#FBF3E1');d.rect(M,y,180,10,'F');ik('#0F1D2B');fo('bold',9);tx('Total',M+38,y+6.5);tx(rs(tot),M+153,y+6.5,{align:'right'});tx(rs(pen),M+178,y+6.5,{align:'right'});y+=10;
 if(cN<n0){fo('normal',7);ik('#64748B');tx((n0-cN)+' more contract'+(n0-cN==1?'':'s')+' not listed to keep this statement on one page. Totals include them. Narrow the dates to list everything.',M,y+4)}
 else if(!n0){fo('normal',9);ik('#64748B');tx('No brokerage contracts for this party in the period.',M+2,y+8)}
 pdfFoot(d,K,[],'statement');
 await deliverPdf(d.output('blob'),xp('Brokerage-'+String(l.name).replace(/[^\w]+/g,'_').slice(0,30)+'_'+stamp()+'.pdf'),'Brokerage statement')}
async function partyCsv(only){
 const rows=rdata(),pbs=partyBk(rows).filter(p=>!only||p.id==only);
 if(!pbs.length)return toast('No party brokerage to export');
 const dmy=s=>s?new Date(s+'T00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).replace(/ /g,'-'):'',out=[],add=a=>out.push(a.map(x=>Array.isArray(x)?csvCell(x[0],x[1]):csvCell(x)).join(',')),N=(v)=>[+(+v).toFixed(2),1],
 roleOf=p=>p.nb&&p.ns?'Buyer & Seller':p.nb?'Buyer':'Seller',now=new Date();
 add([CO().n.toUpperCase()]);if(CO().g)add(['GSTIN',CO().g]);if(CO().ad)add(['Address',CO().ad]);add([only?'Party Brokerage Statement':'Party-wise Brokerage Report']);
 add(['Period',(RC&&rows.length==1?'Contract '+rows[0].no:dmy(RF)+' to '+dmy(RT))]);
 if(RI&&!RC)add(['Item filter',RI]);
 add(['Generated',dmy(ymd(now))+' '+t12(p2(now.getHours())+':'+p2(now.getMinutes()))]);add(['Contact',[CO().ph,CO().em].filter(Boolean).join(' | ')]);add(['Amounts in','INR']);add([]);
 add(['PARTY SUMMARY']);add(['Party','Role','GSTIN','Mobile','City','State','Contracts','Total Brokerage (INR)','Pending Brokerage (INR)']);
 let gT=0,gP=0,gC=0;
 pbs.forEach(p=>{const l=L(p.id)||{},g=l.gst?checkGST(l.gst):null;gT+=p.t;gP+=p.p;gC+=p.n;add([ln(p.id),roleOf(p),l.gst||'',l.ph||'',l.city||'',g&&g.ok?g.d.state.replace(/ \(\d+\)/,''):'',[p.n,1],N(p.t),N(p.p)])});
 add(['TOTAL','','','','','',[gC,1],N(gT),N(gP)]);add([]);
 add(['CONTRACT DETAIL']);add(['Party','Role','Contract No','Contract Date','Counterparty','Item','Quantity','Unit','Rate (INR)','Rate Basis','Tax','Brokerage Basis','Payable Share (%)','Brokerage (INR)','Pending Quantity','Pending Brokerage (INR)']);
 pbs.forEach(p=>{let st=0,sp=0;rows.filter(c=>(c.b==p.id||c.s==p.id)&&bkSh(c,p.id)>0).sort((a,b)=>a.dt.localeCompare(b.dt)||String(a.no).localeCompare(String(b.no),'en',{numeric:true})).forEach(c=>{const sh=bkSh(c,p.id),a=bkAmt(c)*sh,pd=bkPend(c)*sh,other=c.b==p.id?c.s:c.b;st+=a;sp+=pd;
   add([ln(p.id),c.b==p.id?'Buyer':'Seller',c.no,dmy(c.dt),ln(other),c.item,[+(+c.q).toFixed(3),1],uq(c),N(c.r),'per '+rtS(c),txT(c),bkTxt(c,v=>'INR '+(+v).toFixed(2))||'Not set',[Math.round(sh*100),1],bkAmt(c)>0?N(a):'',[+pe(c).toFixed(3),1],bkAmt(c)>0?N(pd):''])});
  add(['Subtotal - '+ln(p.id),'','','','','','','','','','','','',N(st),'',N(sp)]);add([])});
 add(['GRAND TOTAL','','','','','','','','','','','','',N(gT),'',N(gP)]);
 await deliverCsv(new Blob(['﻿'+out.join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'}),xp((only?'Party-Brokerage_'+String(ln(only)).replace(/[^\w]+/g,'_').slice(0,30):'Party-wise-Brokerage')+'_'+stamp()+'.csv'),'Party brokerage CSV')}
async function rpdf(){
 if(!window.jspdf)return toast('PDF engine not loaded');
 const rows=rdata(),pbs=partyBk(rows),one=!!RC&&rows.length==1,d=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),W=210,M=15,K=pdfKit(d),{fl,ik,ld,tx,fo,rs}=K,
 tq=qsum(rows),tb=rows.reduce((s,c)=>s+bkAmt(c),0),tp=rows.reduce((s,c)=>s+bkPend(c),0),over=[0];
 pdfHead(d,K,'BROKERAGE REPORT','Report period','');
 ik('#D9A84E');fo('bold',11);tx(one?'Contract '+rows[0].no:fd(RF)+'  to  '+fd(RT),W-M,25,{align:'right'});
 [['Contracts',String(rows.length)],['Total quantity',tq],['Total brokerage',rs(tb)],['Pending brokerage',rs(tp)]].forEach((b,i)=>{const x=M+i*45.5;fl(i==3?'#FBF3E1':'#F3F6F8');ld('#DDE4EA');d.roundedRect(x,45,43,19,2,2,'FD');ik('#64748B');fo('normal',7.5);tx(b[0],x+3.5,51);ik('#0F1D2B');fo('bold',10.5);tx(b[1],x+3.5,59)});
 let y=(RI&&!one)?76:72;if(RI&&!one){ik('#64748B');fo('normal',8.5);tx('Item: '+RI,M,71)}
 const ens=(h,hd)=>{if(y+h>266){d.addPage();y=20;over[0]=1;if(hd)hd()}};
 const payer=c=>({b:'Buyer',s:'Seller',x:'Buyer and seller equally'}[c.bkP||'x']),roleOf=p=>p.nb&&p.ns?'Buyer & Seller':p.nb?'Buyer':'Seller';
 const pHead=()=>{fl('#0B3B3C');d.rect(M,y,180,8,'F');ik('#FFFFFF');fo('bold',8);tx('Party details',M+2,y+5.4);tx('Role',M+92,y+5.4);tx('Contracts',M+128,y+5.4,{align:'right'});tx('Total',M+154,y+5.4,{align:'right'});tx('Pending',M+178,y+5.4,{align:'right'});y+=8};
 let pN=pbs.length,cN=rows.length;
 const pRows=ph=>{pbs.slice(0,pN).forEach((p,i)=>{ens(ph,pHead);const l=L(p.id)||{},g=l.gst?checkGST(l.gst):null,two=ph>=8,fs=two?8:Math.max(5.6,Math.min(8,ph*1.4)),by=y+ph/2+fs*0.125,
   det=[l.gst?'GSTIN '+l.gst:'GSTIN not provided',l.ph?'Ph '+l.ph:'',[l.addr,l.city,g&&g.ok?g.d.state.replace(/ \(\d+\)/,''):'',l.pin].filter(Boolean).join(', ')].filter(Boolean).join('  |  ');
   fl(i%2?'#FFFFFF':'#F3F6F8');d.rect(M,y,180,ph,'F');ik('#0F1D2B');fo('bold',two?8:fs);tx(d.splitTextToSize(ln(p.id),86)[0],M+2,two?y+ph*0.42:by);
   if(two){fo('normal',6.6);ik('#64748B');tx(d.splitTextToSize(det,84)[0],M+2,y+ph*0.8)}
   ik('#0F1D2B');fo('normal',two?7.5:fs);tx(roleOf(p),M+92,by);tx(String(p.n),M+128,by,{align:'right'});tx(rs(p.t),M+154,by,{align:'right'});fo('bold',two?8:fs);tx(rs(p.p),M+178,by,{align:'right'});y+=ph})};
 const cHead=()=>{fl('#0B3B3C');d.rect(M,y,180,8,'F');ik('#FFFFFF');fo('bold',8);tx('Date',M+2,y+5.4);tx('Contract',M+19,y+5.4);tx('Buyer / Seller',M+36,y+5.4);tx('Item',M+84,y+5.4);tx('Quantity',M+124,y+5.4,{align:'right'});tx('Brokerage',M+151,y+5.4,{align:'right'});tx('Pending',M+178,y+5.4,{align:'right'});y+=8};
 const cRows=ch=>{rows.slice(0,cN).forEach((c,i)=>{ens(ch,cHead);const two=ch>=9,fs=two?8:Math.max(5.6,Math.min(8,ch*1.4)),by=y+ch/2+fs*0.125,a=bkAmt(c);
   fl(i%2?'#FFFFFF':'#F3F6F8');d.rect(M,y,180,ch,'F');ik('#0F1D2B');fo('normal',two?7.5:fs);tx(fd(c.dt),M+2,by);fo('bold',two?8:fs);tx(String(c.no),M+19,by);
   if(two){fo('bold',7.2);tx(d.splitTextToSize(ln(c.b),44)[0],M+36,y+ch*0.42);fo('normal',6.6);ik('#64748B');tx('from '+d.splitTextToSize(ln(c.s),38)[0],M+36,y+ch*0.8)}
   else{fo('normal',fs);tx(d.splitTextToSize(ln(c.b)+' / '+ln(c.s),46)[0],M+36,by)}
   ik('#0F1D2B');fo('normal',two?7.5:fs);tx(d.splitTextToSize(c.item,24)[0],M+84,by);tx(vq(c,c.q),M+124,by,{align:'right'});
   fo('bold',two?8:fs);tx(a>0?rs(a):'Not set',M+151,by,{align:'right'});if(two&&a>0){fo('normal',6.2);ik('#64748B');tx(bkTxt(c,rs),M+151,y+ch*0.8,{align:'right'})}
   ik('#0F1D2B');fo('bold',two?8:fs);tx(a>0?rs(bkPend(c)):'-',M+178,by,{align:'right'});y+=ch})};
 const tRow=()=>{ens(10);fl('#FBF3E1');d.rect(M,y,180,10,'F');ik('#0F1D2B');fo('bold',9);tx('Total',M+36,y+6.5);tx(tq,M+124,y+6.5,{align:'right'});tx(rs(tb),M+151,y+6.5,{align:'right'});tx(rs(tp),M+178,y+6.5,{align:'right'});y+=10};
 if(one){const c=rows[0];
  pdfParty(d,K,M,y,'BUYER',L(c.b)||{});pdfParty(d,K,M+93,y,'SELLER',L(c.s)||{});y+=42;
  fl('#0B3B3C');d.rect(M,y,180,8,'F');ik('#FFFFFF');fo('bold',9);tx('Brokerage details',M+4,y+5.6);y+=8;
  [['Contract date',fd(c.dt)+', '+t12(c.tm)],['Item',c.item],['Quantity',vq(c,c.q)+kgT(c,c.q)],['Rate per '+rtS(c),rs(c.r)+(txT(c)?'  ('+txT(c)+')':'')],['Brokerage basis',bkTxt(c,rs)||'Not set'],['Total brokerage',rs(bkAmt(c))],['Pending quantity',vq(c,pe(c))],['Pending brokerage',rs(bkPend(c))],['Payable by',payer(c)]].forEach((r,i)=>{const hl=r[0]=='Pending brokerage';fl(hl?'#FBF3E1':i%2?'#F3F6F8':'#FFFFFF');d.rect(M,y,180,8.2,'F');ik('#64748B');fo('normal',9);tx(r[0],M+4,y+5.6);ik('#0F1D2B');fo('bold',hl?11:9.5);tx(String(r[1]),M+58,y+5.6);y+=8.2});
  y+=6;if(pbs.length){pHead();pRows(10)}}
 else{const nP0=pbs.length,nC0=rows.length,avail=266-y-(nP0?13:0)-(nC0?29:0);
  let ph=10,ch=11,fit=0;for(const[a,b]of[[10,11],[9,9.5],[8.4,8.6],[7.2,7.2],[6.2,6.2],[5.4,5.4],[4.6,4.6],[4,4],[3.6,3.6]]){ph=a;ch=b;if(nP0*a+nC0*b<=avail){fit=1;break}}
  if(!fit){pN=Math.min(nP0,Math.max(1,Math.floor(avail*0.3/ph)));cN=Math.max(1,Math.floor((avail-pN*ph)/ch))}
  if(nP0){pHead();pRows(ph);y+=5}
  if(nC0){cHead();cRows(ch);tRow();if(cN<nC0||pN<nP0){fo('normal',7);ik('#64748B');tx((cN<nC0?(nC0-cN)+' more contract'+(nC0-cN==1?'':'s'):'')+(cN<nC0&&pN<nP0?' and ':'')+(pN<nP0?(nP0-pN)+' more part'+(nP0-pN==1?'y':'ies'):'')+' not listed to keep this report on one page. All totals include them. Narrow the dates or pick an item to list everything.',M,y+4)}}else{fo('normal',9);ik('#64748B');tx('No contracts in this period.',M+2,y+8)}}
 pdfFoot(d,K,[],'report');
 await deliverPdf(d.output('blob'),(one?'Brokerage-'+String(rows[0].no)+'.pdf':xp('Brokerage-Report-'+RF+'_to_'+RT+'.pdf')),'Brokerage report');
}
const csvCell=(v,num)=>{v=v==null?'':String(v);if(!num&&/^[=+\-@]/.test(v))v="'"+v;return /[",\r\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
async function doCsv(id){const q=Q.trim().toLowerCase(),a=(id?db.o.filter(o=>o.id==id):db.o.filter(o=>doMatch(o,q))).sort((x,y)=>x.dt.localeCompare(y.dt)||x.no.localeCompare(y.no));
 if(!a.length)return toast('No delivery orders to export');
 const H=['DO Number','Order Date','Contract No','Contract Date','Buyer','Buyer GSTIN','Seller','Seller GSTIN','Item','Quantity','Unit','Quantity (kg)','Vehicle No','Transporter','LR No','Billing Cycle','Contract Quantity','Dispatched Till This Order','Balance To Dispatch','Remarks'],
 rows=a.map(o=>{const c=C(o.c)||{},b=L(c.b)||{},s=L(c.s)||{},idx=db.o.findIndex(x=>x.id==o.id),cum=db.o.filter((x,i)=>x.c==o.c&&i<=idx).reduce((t,x)=>t+x.q,0),bal=Math.max(0,+((c.q||0)-cum).toFixed(3));
  const dd=s_=>s_?new Date(s_+'T00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).replace(/ /g,'-'):'';
  return[[o.no],[dd(o.dt)],[c.no],[dd(c.dt)],[b.name||c.b&&ln(c.b)],[b.gst],[s.name||c.s&&ln(c.s)],[s.gst],[c.item],[+(+o.q).toFixed(3),1],[uq(c)],[qkg(c,o.q),1],[o.vn],[o.tn],[o.lr],[o.bc],[c.q==null?'':+(+c.q).toFixed(3),1],[+cum.toFixed(3),1],[bal,1],[o.note]]});
 const nw=new Date(),top=[[CO().n.toUpperCase()],...(CO().g?[['GSTIN',CO().g]]:[]),...(CO().ad?[['Address',CO().ad]]:[]),[id?'Delivery Order '+a[0].no:'Delivery Orders'],['Generated',fd(ymd(nw))+' '+t12(p2(nw.getHours())+':'+p2(nw.getMinutes()))],['Contact',[CO().ph,CO().em].filter(Boolean).join(' | ')],[]].map(r=>r.map(x=>csvCell(x)));
 const csv=[...top,H.map(h=>csvCell(h)),...rows.map(r=>r.map(x=>csvCell(x[0],x[1])))].map(r=>r.join(',')).join('\r\n')+'\r\n';
 await deliverCsv(new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'}),(id?vfn(a[0])+'.csv':xp('Delivery-Orders_'+stamp()+'.csv')),'Delivery order CSV')}
