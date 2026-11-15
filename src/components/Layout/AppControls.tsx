import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings2, TvMinimal, WifiOff, PlugZap } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';

// Load the video studio and training settings only when they are opened.
// Both import the full 300+ movement catalog and must not block first paint.
const MediaSheet = lazy(() => import('@/components/Media/MediaSheet').then(m => ({default:m.MediaSheet})));
const TrainingSettings = lazy(() => import('@/components/Settings/TrainingSettings').then(m => ({default:m.TrainingSettings})));

const LEVEL_NAMES=['L1 · Starting','L2 · Foundation','L3 · Building','L4 · Advanced','L5 · Elite'] as const;
function readHeaderTier():number{
  try {
    const raw=JSON.parse(localStorage.getItem('power-training-profile-v1')||'null');
    return Number.isInteger(raw?.tier)&&raw.tier>=1&&raw.tier<=5?raw.tier:1;
  }catch{return 1;}
}
function HeaderTier({tier}:{tier:number}){
 return <span className={`power-level-badge power-level-${tier} power-level-size-sm`} aria-label={LEVEL_NAMES[tier-1]||LEVEL_NAMES[0]}>
   <span className="power-level-dot" aria-hidden="true"/>L{tier}
 </span>;
}
export function AppControls(){
 const {pathname}=useLocation();
 const [open,setOpen]=useState(false);
 const [watchOpen,setWatchOpen]=useState(false);
 const [tier,setTier]=useState(readHeaderTier);
 const [offline,setOffline]=useState(()=>!navigator.onLine);
 useEffect(()=>{
   const sync=()=>setTier(readHeaderTier());
   const connectivity=()=>setOffline(!navigator.onLine);
   window.addEventListener('power-training-profile',sync);
   window.addEventListener('online',connectivity);
   window.addEventListener('offline',connectivity);
   return ()=>{
     window.removeEventListener('power-training-profile',sync);
     window.removeEventListener('online',connectivity);
     window.removeEventListener('offline',connectivity);
   };
 },[]);
 useEffect(()=>{setOpen(false);setWatchOpen(false);},[pathname]);
 useEffect(()=>{
   const openTV=()=>setWatchOpen(true);
   window.addEventListener('power-open-tlctv',openTV);
   return()=>window.removeEventListener('power-open-tlctv',openTV);
 },[]);
 return <>
   <header className="power-app-controls">
     <Link to="/" aria-label="TLC Prime home" className="power-app-wordmark">
       <img src="/icons/tlc-prime-20261115-64.png" alt="" width={28} height={28}/>
       <span>TLC PRIME<small>TRAIN · LENGTHEN · CONTROL</small></span>
     </Link>
     <div>
       <button type="button" className="power-level-shortcut" aria-label="Review your training level" onClick={()=>setOpen(true)}>
         <HeaderTier tier={tier}/>
       </button>
       <button type="button" className="tlctv-masthead-btn" aria-label="Open videos and live streams" title="TLCtv · Watch exercise videos" onClick={()=>setWatchOpen(true)}>
         <TvMinimal size={21}/><span>TLCtv</span>
       </button>
       <button type="button" aria-label="Open settings" title="Settings" onClick={()=>setOpen(true)}>
         <Settings2 size={20}/><span>Settings</span>
       </button>
     </div>
   </header>
   {offline&&<div className="power-offline-banner" role="status"><WifiOff size={15}/><span>You’re offline. Some photos and videos may be unavailable.</span></div>}
   {open&&<Sheet open={open} onOpenChange={setOpen}>
     <SheetContent className="power-settings-sheet overflow-y-auto" side="right">
       <SheetTitle>Settings</SheetTitle>
       <SheetDescription>Training, appearance and app options.</SheetDescription>
       <Link to="/integrations" onClick={()=>setOpen(false)} className="flex min-h-12 items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-bold text-primary">
         <PlugZap size={17}/> ChatGPT &amp; Integrations
       </Link>
       <Suspense fallback={<p role="status" className="p-4 text-sm">Opening training settings…</p>}><TrainingSettings/></Suspense>
     </SheetContent>
   </Sheet>}
   {watchOpen&&<Suspense fallback={<p className="sr-only" role="status">Loading TLCtv…</p>}>
     <MediaSheet open={watchOpen} onOpenChange={setWatchOpen}/>
   </Suspense>}
 </>;
}
