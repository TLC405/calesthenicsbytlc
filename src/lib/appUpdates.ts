/** Refresh the worker on return to the app; never reload an active workout. */
declare global{
 interface Window{TLCBoot?:{ready:()=>void;repair:()=>Promise<void>;isChunkError:(error:unknown)=>boolean;};}
}
export function prepareAppUpdates(){
 if(!import.meta.env.PROD||!('serviceWorker' in navigator))return;
 let registration:ServiceWorkerRegistration|undefined;
 let lastCheck=0;
 const check=()=>{
  if(document.visibilityState==='hidden'||!navigator.onLine||Date.now()-lastCheck<60000)return;
  lastCheck=Date.now();void registration?.update().catch(()=>{});
 };
 const register=()=>{
  void navigator.serviceWorker.register('/power-sw.js',{scope:'/',updateViaCache:'none'})
   .then(value=>{registration=value;check();}).catch(()=>{});
 };
 if(document.readyState==='complete')register();else window.addEventListener('load',register,{once:true});
 window.addEventListener('online',check);
 document.addEventListener('visibilitychange',check);
}
