/* Brokerlynx module: platform/files
   File naming and PDF/CSV delivery (share, download).
   Classic script, shared global scope. Loaded by index.html in the documented order (see ARCHITECTURE.md). */

const fcCode=()=>{const ym=bizYM();db.sqf=db.sqf||{};if(!db.sqm){Object.keys(db.sqf).forEach(k=>{if(db.sqf[k]>0)db.sqf[k]--});db.sqm=1}return fmtNo(ym,(db.sqf[ym]||0)+1,coP())};
const xp=fn=>{FCN=fcCode();return FCN+'_'+fn};
const fcDone=fn=>{if(FCN&&String(fn).startsWith(FCN+'_')){const ym=bizYM();db.sqf=db.sqf||{};db.sqf[ym]=(db.sqf[ym]||0)+1;save()}FCN=''};
async function savePdf(blob,fn,msg,title){
 const cap=window.Capacitor,P=cap&&cap.Plugins;
 if(cap&&cap.isNativePlatform&&cap.isNativePlatform()&&P&&P.Filesystem&&P.Share){
  const b64=await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(',')[1]);r.onerror=no;r.readAsDataURL(blob)});
  const f=await P.Filesystem.writeFile({path:fn,data:b64,directory:'CACHE'});
  await P.Share.share({title:title,text:msg||'',url:f.uri,dialogTitle:'Share file'});return 1}
 const file=new File([blob],fn,{type:blob.type||'application/pdf'});
 if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],text:msg||''});return 1}catch(e){if(e&&e.name=='AbortError')return 0}}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fn;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);return 1
}
