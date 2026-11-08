import { useEffect, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { MovementLearningPanel } from './MovementLearningPanel';
import { ProgressionPathStrip } from './ProgressionPathStrip';
import { useAuth } from '@/providers/AuthProvider';
import { exerciseBySlug, readTrainingProfile, trainingBlockers } from '@/lib/skillGraph';
import { exerciseReadinessReasons } from '@/lib/trainingPolicy';
import { supabase, backendConfigured } from '@/integrations/supabase/client';
import { plainTrainingText } from '@/lib/workoutPresentation';
import type { SkillExercise } from '@/lib/skillWorkoutBuilder';
interface Exercise extends SkillExercise {secondary_muscles:string[];equipment:string[];chain_group?:string|null;chain_order?:number|null;description?:string|null;instagram_url?:string|null;}
interface Progression {id:string;name:string;level:number;description:string|null;}
interface Props {workoutSlugs?:string[];exercise:Exercise|null;open:boolean;onClose:()=>void;onAddToWorkout?:(exercise:Exercise)=>boolean|void;}
export function ExerciseDetailModal({exercise,open,onClose,onAddToWorkout,workoutSlugs=[]}:Props){
 const {user}=useAuth();const [current,setCurrent]=useState(exercise);const [profile,setProfile]=useState(readTrainingProfile);const [notes,setNotes]=useState<Progression[]>([]);
 useEffect(()=>setCurrent(exercise),[exercise]);
 useEffect(()=>{const sync=()=>setProfile(readTrainingProfile());window.addEventListener('power-training-profile',sync);return()=>window.removeEventListener('power-training-profile',sync);},[]);
 useEffect(()=>{let active=true;setNotes([]);if(current?.id&&open&&backendConfigured){void supabase.from('progressions').select('*').eq('exercise_id',current.id).order('level').then(({data})=>{if(active)setNotes(data||[]);});}return()=>{active=false;};},[current?.id,open,user?.id]);
 if(!current)return null;
 const isAdded=workoutSlugs.includes(current.slug);
 const reasons=exerciseBySlug.has(current.slug)?trainingBlockers(current.slug,profile,true):exerciseReadinessReasons(current,profile);
 function navigateSlug(slug:string){const next=exerciseBySlug.get(slug);if(next)setCurrent({...next,secondary_muscles:next.secondary_muscles||[],equipment:next.equipment||[]});}
 async function navigateLegacy(id:string){if(!backendConfigured)return;const {data}=await supabase.from('exercises').select('*').eq('id',id).single();if(data)setCurrent(data as Exercise);}
 return <Dialog open={open} onOpenChange={value=>{if(!value)onClose();}}><DialogContent className="power-movement-dialog"><header className="power-movement-dialog-head"><p className="power-eyebrow">MOVEMENT GUIDE</p><DialogTitle>{current.name}</DialogTitle><DialogDescription>Learn the steps and choose a variation you can control.</DialogDescription></header><div className="power-movement-dialog-body"><MovementLearningPanel exercise={current} profile={profile} onNavigate={navigateSlug}/>{(current.chain_group||notes.length>0)&&<details className="power-learn-section"><summary>Saved coaching notes</summary><ProgressionPathStrip exerciseId={current.id} chainGroup={current.chain_group||null} onNavigate={id=>void navigateLegacy(id)}/>{notes.map(note=><article className="power-coaching-note" key={note.id}><strong>{note.name}</strong>{note.description&&<p>{plainTrainingText(note.description)}</p>}</article>)}</details>}</div>{onAddToWorkout&&<footer className="power-movement-dialog-footer">{reasons.map(reason=><p key={reason}>{plainTrainingText(reason)}</p>)}<button type="button" className="focus-primary" disabled={reasons.length>0||isAdded} onClick={()=>{if(onAddToWorkout(current)!==false)onClose();}}>{isAdded?<Check size={18}/>:<Plus size={18}/>} {isAdded?'Added to your workout':'Add to my workout'}</button></footer>}</DialogContent></Dialog>;
}
