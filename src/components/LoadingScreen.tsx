import { useEffect, useState } from 'react';
export function LoadingScreen() {
 const [progress,setProgress]=useState(8);
 useEffect(()=>{
  const id=window.setInterval(()=>setProgress(v=>Math.min(94,v+4)),90);
  return ()=>window.clearInterval(id);
 },[]);
 return <div role="status" aria-label="Loading TLC Prime" className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden" style={{background:'#e9d8b7',padding:'max(18px,env(safe-area-inset-top)) 16px max(20px,env(safe-area-inset-bottom))'}}>
  <div className="w-full max-w-3xl flex flex-col items-center gap-5">
   <div className="w-full overflow-hidden rounded-[18px] border-[3px] border-[#9e8055] bg-[#e8d5af]" style={{boxShadow:'inset 0 2px 0 #fff7,0 14px 36px #2a1e1740'}}>
    <img src="/spread-more-tlc-loading.svg" alt="Spread More TLC — Oklahoma City community doodle artwork" className="block w-full h-auto object-contain" loading="eager"/>
   </div>
   <div className="text-center" style={{color:'#252338'}}>
    <h1 className="font-black text-xl tracking-[.12em]">TLC PRIME</h1>
    <p className="text-xs font-semibold mt-1 tracking-[.12em]">TRAIN · LENGTHEN · CONTROL</p>
   </div>
   <div className="w-full max-w-xs h-2 overflow-hidden rounded-full border border-[#a68e6d] bg-[#f7ecd7]">
    <div className="h-full rounded-full transition-all duration-100" style={{width:progress+'%',background:'linear-gradient(90deg,#bf641d,#e3aa46)'}}/>
   </div>
  </div>
 </div>;
}
