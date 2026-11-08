import { MediaSheet } from '@/components/Media/MediaSheet';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings2, Zap, TvMinimal } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { TrainingSettings } from '@/components/Settings/TrainingSettings';
import { readTrainingProfile } from '@/lib/skillGraph';
import { TRAINING_LEVELS } from '@/lib/trainingPolicy';
export function AppControls(){
 const {pathname}=useLocation();const [open,setOpen]=useState(false);const [watchOpen,setWatchOpen]=useState(false);const [profile,setProfile]=useState(readTrainingProfile);
 useEffect(()=>{const sync=()=>setProfile(readTrainingProfile());window.addEventListener('power-training-profile',sync);return()=>window.removeEventListener('power-training-profile',sync);},[]);
 useEffect(()=>{setOpen(false);setWatchOpen(false);},[pathname]);
 const level=TRAINING_LEVELS[(profile.tier||1)-1];
 return <><header className="power-app-controls"><Link to="/" aria-label="POWER home" className="power-app-wordmark"><Zap size={19} fill="currentColor"/>POWER<small>BY TLC</small></Link><div><span className="power-working-level">{level.label}</span><button type="button" aria-label="Open videos and live streams" onClick={()=>setWatchOpen(true)}><TvMinimal size={21}/><span>Watch</span></button><button type="button" aria-label="Open settings" onClick={()=>setOpen(true)}><Settings2 size={21}/><span>Settings</span></button></div></header><Sheet open={open} onOpenChange={setOpen}><SheetContent className="power-settings-sheet overflow-y-auto" side="right"><SheetTitle>Settings</SheetTitle><SheetDescription>Your level, appearance and app options, without leaving your page.</SheetDescription><TrainingSettings/></SheetContent></Sheet><MediaSheet open={watchOpen} onOpenChange={setWatchOpen}/></>;
}
