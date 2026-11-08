import { useState } from 'react';
import { Play } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { movementTutorialSources, type ThumbnailExercise } from '@/lib/movementThumbnails';
import { MovementVideo } from './MovementVideo';
export function MovementTutorialButton({exercise,label=false}:{exercise:ThumbnailExercise;label?:boolean}){
 const [open,setOpen]=useState(false);const available=movementTutorialSources(exercise).length>0||Boolean(exercise.instagram_url);
 if(!available)return null;
 return <><button type="button" className={`power-direct-tutorial ${label?'with-label':''}`} aria-label={`Watch ${exercise.name} tutorial`} title={`Watch ${exercise.name} inside POWER`} onClick={()=>setOpen(true)}><Play size={18}/>{label&&<span>Watch tutorial</span>}</button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="power-tutorial-dialog"><DialogTitle>{exercise.name}</DialogTitle><DialogDescription>Tutorial · plays here inside your workout.</DialogDescription>{open&&<MovementVideo key={exercise.slug} exercise={exercise} autoPlay/>}</DialogContent></Dialog></>;
}
