/* Brokerlynx module: domain/gst
   GSTIN validation and state / PAN decoding.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

/* GST validation: format + state code + PAN structure + checksum */
const SC={"01":"Jammu & Kashmir","02":"Himachal Pradesh","03":"Punjab","04":"Chandigarh","05":"Uttarakhand","06":"Haryana","07":"Delhi","08":"Rajasthan","09":"Uttar Pradesh","10":"Bihar","11":"Sikkim","12":"Arunachal Pradesh","13":"Nagaland","14":"Manipur","15":"Mizoram","16":"Tripura","17":"Meghalaya","18":"Assam","19":"West Bengal","20":"Jharkhand","21":"Odisha","22":"Chhattisgarh","23":"Madhya Pradesh","24":"Gujarat","26":"Dadra & Nagar Haveli and Daman & Diu","27":"Maharashtra","29":"Karnataka","30":"Goa","31":"Lakshadweep","32":"Kerala","33":"Tamil Nadu","34":"Puducherry","35":"Andaman & Nicobar","36":"Telangana","37":"Andhra Pradesh","38":"Ladakh","97":"Other Territory"};
const ENT={P:'Individual / Proprietor',C:'Company',F:'Partnership firm / LLP',H:'HUF',A:'Association of persons',T:'Trust',B:'Body of individuals',L:'Local authority',J:'Artificial juridical person',G:'Government'};
function gbox(d){return `<div class="gbx"><div><span>State</span><b>${d.state}</b></div><div><span>PAN</span><b>${d.pan}</b></div><div><span>Constitution</span><b>${d.ent}</b></div><div><span>Registration no.</span><b>${d.reg}</b></div><div class="w mu">Auto-filled from the GSTIN. Name and address are not encoded in a GSTIN, so add them below.</div></div>`}
function checkGST(g){
 if(g.length!=15)return{ok:0,m:'GSTIN must be 15 characters (you entered '+g.length+')'};
 if(!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(g))return{ok:0,m:'Invalid format. Pattern: 2 digits, 5 letters, 4 digits, 1 letter, 1 alphanumeric, Z, 1 alphanumeric'};
 if(!SC[g.slice(0,2)])return{ok:0,m:'Invalid state code '+g.slice(0,2)};
 const A='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';let s=0;
 for(let i=0;i<14;i++){const v=A.indexOf(g[i])*(i%2?2:1);s+=Math.floor(v/36)+v%36}
 const ck=A[(36-s%36)%36];
 if(ck!=g[14])return{ok:0,m:'Check digit is wrong (expected '+ck+'). Please re-check the number'};
 return{ok:1,m:'Valid GSTIN · '+SC[g.slice(0,2)]+' · PAN '+g.slice(2,12),d:{state:SC[g.slice(0,2)]+' ('+g.slice(0,2)+')',pan:g.slice(2,12),ent:ENT[g[5]]||'Other',reg:g[12]}};
}
