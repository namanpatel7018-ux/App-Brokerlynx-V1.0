/* Brokerlynx module: domain/migrations
   Data migrations.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

function migLink(){if(db.nv>=5)return;const bak=JSON.stringify(db);try{localStorage.setItem(K+'_pre_link_backup',bak)}catch(e){}
 try{db.o.slice().sort((a,b)=>(a.dt||'').localeCompare(b.dt||'')).forEach(o=>{const c=C(o.c);if(!c)return;c.d=c.d||[];if(c.d.some(e=>e.do==o.id))return;const room=Math.max(0,+(c.q-dv(c)).toFixed(3)),q=Math.min(o.q,room);if(q>0)c.d.push({dt:o.dt,tm:'',q,do:o.id,no:o.no})});db.nv=5;save()}
 catch(e){db=JSON.parse(bak);db.sq=db.sq||{};db.sqo=db.sqo||{};console.error('Delivery link migration rolled back',e)}}
