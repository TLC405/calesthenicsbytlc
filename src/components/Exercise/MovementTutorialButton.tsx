import { lazy, Suspense, useState } from 'react';
import { TvMinimal } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { ThumbnailExercise } from '@/lib/movementThumbnails';
import { videoLessonCoverage } from '@/lib/videoLessonCoverage';
const InlineTlcTv = lazy(() => import('./InlineTlcTv').then(m => ({default:m.InlineTlcTv})));
// Tutorial code is loaded only when the athlete taps Watch.

export function MovementTutorialButton({exercise,label=false}:{exercise:ThumbnailExercise;label?:boolean}){
 const [open,setOpen]=useState(false);
 const coverage=videoLessonCoverage(exercise);
 return <>
  <button type="button" className={`power-direct-tutorial tlc-watch-control ${label?'with-label':''}`}
    aria-label={`Watch ${exercise.name} on TLCtv`}
    title={coverage.exactCount>0?'Watch exercise video on TLCtv':coverage.hasVideo?'Watch a related skill lesson on TLCtv':'Find or add a video on TLCtv'}
    onClick={()=>setOpen(true)}><TvMinimal size={19}/>{label&&<span>Watch</span>}</button>
  <Dialog open={open} onOpenChange={setOpen}>
   <DialogContent className="power-tutorial-dialog tlc-watch-dialog">
    <DialogTitle>{exercise.name}</DialogTitle>
    <DialogDescription>{coverage.exactCount>0?'Watch your exercise video':coverage.hasVideo?'Related skill lesson · find or add an exact demo':'Find or add your exercise video'}</DialogDescription>
    {open&&<Suspense fallback={<p role="status" className="p-3 text-sm">Loading exercise video…</p>}><InlineTlcTv key={exercise.slug} exercise={exercise} compact/></Suspense>}
   </DialogContent>
  </Dialog>
 </>;
}
