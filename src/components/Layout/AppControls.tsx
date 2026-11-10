import { MediaSheet } from '@/components/Media/MediaSheet';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings2, TvMinimal, WifiOff } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { TrainingSettings } from '@/components/Settings/TrainingSettings';
import { DifficultyBadge } from '@/components/Exercise/DifficultyBadge';
import { readTrainingProfile } from '@/lib/skillGraph';
export function AppControls(){
 const {pathname}=useLocation();const [open,setOpen]=useState(false);const [watchOpen,setWatchOpen]=useState(false);const [profile,setProfile]=useState(readTrainingProfile);const [offline,setOffline]=useState(()=>!navigator.onLine);
 useEffect(()=>{const sync=()=>setProfile(readTrainingProfile());const connectivity=()=>setOffline(!navigator.onLine);window.addEventListener('power-training-profile',sync);window.addEventListener('online',connectivity);window.addEventListener('offline',connectivity);return()=>{window.removeEventListener('power-training-profile',sync);window.removeEventListener('online',connectivity);window.removeEventListener('offline',connectivity);};},[]);
 useEffect(()=>{setOpen(false);setWatchOpen(false);},[pathname]);
 return <><header className="power-app-controls"><Link to="/" aria-label="TLC's Super Human Strength home" className="power-app-wordmark"><img src="/icons/tlc-doodle-32.png" alt="" width={28} height={28}/><span>TLC'S<small>SUPER HUMAN STRENGTH</small></span></Link><div><button type="button" className="power-level-shortcut" aria-label="Review your training level" onClick={()=>setOpen(true)}><DifficultyBadge level={profile.tier||1} showLabel={false}/></button><button type="button" aria-label="Open videos and live streams" title="TLC TV: videos, tutorials and live streams" onClick={()=>setWatchOpen(true)}><TvMinimal size={20}/><span>TLC TV</span></button><button type="button" aria-label="Open settings" title="Settings" onClick={()=>setOpen(true)}><Settings2 size={20}/><span>Settings</span></button></div></header>{offline&&<div className="power-offline-banner" role="status"><WifiOff size={15}/><span>You’re offline. Some photos and videos may be unavailable.</span></div>}<Sheet open={open} onOpenChange={setOpen}><SheetContent className="power-settings-sheet overflow-y-auto" side="right"><SheetTitle>Settings</SheetTitle><SheetDescription>Training, appearance and app options.</SheetDescription><TrainingSettings/></SheetContent></Sheet><MediaSheet open={watchOpen} onOpenChange={setWatchOpen}/></>;
}
