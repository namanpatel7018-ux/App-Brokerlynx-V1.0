/* Brokerlynx module: core/helpers
   Small pure helpers: escaping, dates, formatting, ids.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

const $=s=>document.querySelector(s),p2=n=>String(n).padStart(2,'0');

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ymd=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const fd=s=>s?new Date(s+'T00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'';
const n3=n=>(+n).toLocaleString('en-IN',{maximumFractionDigits:3}),inr=n=>'₹'+(+n).toLocaleString('en-IN',{maximumFractionDigits:2});
const nk=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');

const t12=t=>{const[h,m]=String(t).split(':').map(Number);return isNaN(h)?t:((h%12)||12)+':'+p2(m)+' '+(h<12?'AM':'PM')};
const monYr=()=>{const n=new Date();return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][n.getMonth()]+'-'+n.getFullYear()};
const stamp=()=>{const n=new Date(),h=n.getHours();return p2(n.getDate())+'-'+p2(n.getMonth()+1)+'-'+String(n.getFullYear()).slice(-2)+'_'+p2((h%12)||12)+'-'+p2(n.getMinutes())+(h<12?'AM':'PM')};
const vfn=o=>String(o.vn||o.no).replace(/[^\w-]/g,'')+'_'+stamp();
const fdt=x=>fd(x.dt)+(x.tm?', '+t12(x.tm):'');
