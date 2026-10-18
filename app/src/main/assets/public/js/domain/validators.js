/* Brokerlynx module: domain/validators
   Input validators: vehicle, pincode, phone.
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

const vnOk=v=>{v=String(v||'');const m=/^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{4})$/.exec(v);if(m)return RTO.includes(m[1])&&+m[2]>0&&+m[4]>0;const b=/^(\d{2})BH(\d{4})[A-Z]{1,2}$/.exec(v);return !!b&&+b[1]>=21&&+b[2]>0};
const vnMsg=v=>{const m=/^([A-Z]{2})/.exec(v);return m&&!/^\d{2}BH/.test(v)&&!RTO.includes(m[1])?`“${m[1]}” is not a valid state or UT code. Use a real registration such as GJ01AB1234`:'Enter a valid registration number such as GJ01AB1234 (state code, RTO number, series letters, 4 digits) or a BH series like 22BH1234AA'};
const PINC=[[11,28],[30,34],[36,49],[50,53],[56,59],[60,64],[67,79],[80,86],[90,99]];
const pinOk=v=>/^[1-9]\d{5}$/.test(v)&&PINC.some(([a,b])=>+v.slice(0,2)>=a&&+v.slice(0,2)<=b);
const phNorm=v=>{let d=String(v||'').replace(/\D/g,'');if(d.length==12&&d.startsWith('91'))d=d.slice(2);else if(d.length==11&&d[0]=='0')d=d.slice(1);return d};
const phOk=v=>/^[6-9]\d{9}$/.test(v)&&!/^(\d)\1{9}$/.test(v)&&!'01234567890123456789'.includes(v)&&!'98765432109876543210'.includes(v)&&new Set(v).size>2;
const pinLive=e=>{e.value=e.value.replace(/\D/g,'').slice(0,6);e.style.borderColor=e.value.length==6&&!pinOk(e.value)?'#C0392B':''};
const phLive=e=>{e.value=phNorm(e.value).slice(0,10);e.style.borderColor=e.value.length==10&&!phOk(e.value)?'#C0392B':''};
const vnLive=e=>{e.value=e.value.toUpperCase().replace(/[^A-Z0-9]/g,'');e.style.borderColor=e.value.length>=6&&!vnOk(e.value)?'#C0392B':''};
