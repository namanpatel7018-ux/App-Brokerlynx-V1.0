/* Brokerlynx module: domain/brokerage
   Brokerage shared with brokers (dalals): data rules, balances and validation. No DOM here.
   Data (all inside the normal db, so existing backups carry it automatically):
     db.br  = [{id, name, ph, note, act, at}]                 brokers; act:0 = inactive (kept for history)
     c.ba   = [{id, bid, amt}]                                 on a contract: Rs share of ITS brokerage payable to broker bid
     db.bp  = [{id, bid, cid, aid, amt, dt, mode, ref, note, cn, at}]   payments to a broker against one allocation (cid + aid)
   Payment status (Unpaid / Partly paid / Paid) is DERIVED from allocations and payments, never stored,
   so it can never disagree with the money. Every payment belongs to exactly one allocation, so it is
   counted exactly once in every total. Contracts without `ba` are simply "Unassigned"; nothing is guessed. */
const brR2=n=>{n=+n||0;return Math.round((n+(n<0?-1:1)*1e-9)*100)/100};
const broAll=()=>db.br||[];            /* read-only: reading never changes stored data */
const bpayAll=()=>db.bp||[];
const broW=()=>db.br||(db.br=[]);      /* write access: creates the list only when something is saved */
const bpayW=()=>db.bp||(db.bp=[]);
const broGet=id=>broAll().find(b=>b.id==id);
const broName=id=>{const b=broGet(id);return b?b.name:'Removed broker'};
const broLabel=b=>b.name+(b.ph?' · '+b.ph:'');
const baOf=c=>c&&c.ba||[];
const baSum=c=>brR2(baOf(c).reduce((s,a)=>s+(+a.amt||0),0));
const baTotal=c=>c&&!c.x&&c.bkT&&c.bkR>0?brR2(bkAmt(c)):0;
const baFree=c=>Math.max(0,brR2(baTotal(c)-baSum(c)));
const bpayOf=(cid,aid)=>bpayAll().filter(p=>p.cid==cid&&p.aid==aid);
const bpaid=(cid,aid)=>brR2(bpayOf(cid,aid).reduce((s,p)=>s+(+p.amt||0),0));
const baStat=(amt,paid)=>paid<=0?'Unpaid':paid+0.005<amt?'Partly paid':'Paid';
const baCls=s=>({'Unpaid':'Expired','Partly paid':'Pending','Paid':'Completed','Cancelled':'Cancelled'}[s]||'Cancelled');
/* One broker: what is payable, paid and left, with every deal and payment. Cancelled contracts owe nothing
   (their allocations stay visible); payments already made are never dropped. */
function broStats(bid){
 const deals=[],seen=new Set();let payable=0,paid=0;
 db.c.forEach(c=>baOf(c).forEach(a=>{if(a.bid!=bid)return;const ps=bpayOf(c.id,a.id),p=brR2(ps.reduce((s,x)=>s+(+x.amt||0),0)),eff=c.x?0:brR2(a.amt);
  ps.forEach(x=>seen.add(x.id));deals.push({c,a,share:brR2(a.amt),eff,paid:p,bal:brR2(eff-p),status:c.x?'Cancelled':baStat(brR2(a.amt),p)});payable+=eff;paid+=p}));
 const pays=bpayAll().filter(p=>p.bid==bid).slice().sort((x,y)=>(y.dt+(y.at||'')).localeCompare(x.dt+(x.at||'')));
 const orphan=pays.filter(p=>!seen.has(p.id));orphan.forEach(p=>{paid+=(+p.amt||0)});
 deals.sort((x,y)=>(y.c.dt+y.c.tm).localeCompare(x.c.dt+x.c.tm));
 return{payable:brR2(payable),paid:brR2(paid),balance:brR2(payable-paid),deals,pays,orphan}}
/* Whole-business view. paid = every payment record once; allocated = per contract, so the figures reconcile. */
function broTotals(){
 let brokerage=0,allocated=0,unassigned=0,unDeals=0;
 db.c.forEach(c=>{const t=baTotal(c);if(t>0){brokerage+=t;allocated+=Math.min(baSum(c),t);const f=baFree(c);unassigned+=f;if(f>0.005)unDeals++}});
 const paid=brR2(bpayAll().reduce((s,p)=>s+(+p.amt||0),0));
 return{brokerage:brR2(brokerage),allocated:brR2(allocated),unassigned:brR2(unassigned),unDeals,paid,balance:brR2(allocated-paid),
  rows:broAll().map(b=>({b,s:broStats(b.id)}))}}
/* Validate the shares typed on a contract against totals and against payments already made. Returns '' when fine. */
function broCheck(x,rows,o){
 const total=brR2(bkAmt(x)),has=x.bkT&&x.bkR>0;
 if(o)for(const old of baOf(o)){const paid=bpaid(o.id,old.id);if(paid<=0)continue;const nr=rows.find(r=>r.id==old.id);
  if(!nr)return 'Cannot remove '+broName(old.bid)+': payments of '+inr(paid)+' are already recorded for this contract';
  if(nr.bid!=old.bid)return 'Cannot change the broker for '+broName(old.bid)+': payments are already recorded';
  if(brR2(nr.amt)+0.004<paid)return 'The share for '+broName(old.bid)+' cannot be below the '+inr(paid)+' already paid'}
 if(!rows.length)return '';
 if(!has)return 'Set the brokerage rate before sharing brokerage with brokers';
 const seen=new Set();let sum=0;
 for(const r of rows){
  if(!r.bid)return 'Select a broker for each brokerage share';
  const b=broGet(r.bid);if(!b)return 'A selected broker no longer exists';
  if(b.act===0&&!(o&&baOf(o).some(a=>a.id==r.id&&a.bid==r.bid)))return b.name+' is inactive. Reactivate the broker or choose another';
  if(seen.has(r.bid))return b.name+' appears twice. Use one share per broker';seen.add(r.bid);
  if(!(+r.amt>0))return 'Enter the brokerage share for '+b.name;sum+=brR2(r.amt)}
 if(brR2(sum)>total+0.004)return 'Broker shares ('+inr(sum)+') are more than the total brokerage ('+inr(total)+')';
 return ''}
/* Backup integrity: brokers, shares and payments must reference each other correctly. */
const brOk=x=>{
 if(x.br!==undefined&&!(Array.isArray(x.br)&&x.br.every(b=>b&&b.id&&typeof b.name==='string')))return false;
 if(x.bp!==undefined&&!(Array.isArray(x.bp)&&x.bp.every(p=>p&&p.id&&p.bid&&p.cid&&p.aid&&+p.amt>0)))return false;
 const ids=new Set((x.br||[]).map(b=>b.id)),cm=new Map(x.c.map(c=>[c.id,c]));
 for(const c of x.c){if(c.ba===undefined||c.ba===null)continue;if(!Array.isArray(c.ba))return false;for(const a of c.ba)if(!a||!a.id||!a.bid||!(+a.amt>=0)||!ids.has(a.bid))return false}
 for(const p of (x.bp||[])){if(!ids.has(p.bid))return false;const c=cm.get(p.cid);if(!c||!(c.ba||[]).some(a=>a.id==p.aid&&a.bid==p.bid))return false}
 return true};
