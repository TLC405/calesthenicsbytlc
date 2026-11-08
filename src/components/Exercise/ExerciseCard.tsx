import { MovementTutorialButton } from './MovementTutorialButton';
import { DifficultyBadge } from './DifficultyBadge';
import { minimumTier } from '@/lib/trainingPolicy';
import { MovementThumbnail } from './MovementThumbnail';
import { ArrowRight, Check, Plus, LockKeyhole } from 'lucide-react';
interface Exercise {id:string;name:string;slug:string;category:string;primary_muscles:string[];secondary_muscles:string[];equipment:string[];cues:any;difficulty_level?:number|null;youtube_url?:string|null;instagram_url?:string|null;image_url?:string|null;}
export function ExerciseCard({exercise,onViewDetails,onAddToWorkout,isAdded=false,addDisabledReason}:{isAdded?:boolean;addDisabledReason?:string;exercise:Exercise;onViewDetails:(exercise:Exercise)=>void;onAddToWorkout?:(exercise:Exercise)=>void}){
 const level=minimumTier(exercise.slug);
 return <article className="power-exercise-row"><button type="button" className="power-exercise-open" onClick={()=>onViewDetails(exercise)} aria-label={`View ${exercise.name} details`}><MovementThumbnail exercise={exercise}/><span><strong>{exercise.name}</strong><DifficultyBadge level={level}/><small>{exercise.equipment?.join(', ')||'Bodyweight'}</small></span><ArrowRight size={17}/></button><MovementTutorialButton exercise={exercise}/>{onAddToWorkout&&<button type="button" className={`power-exercise-add ${isAdded?'is-added':''}`} disabled={isAdded||Boolean(addDisabledReason)} title={addDisabledReason} aria-label={`${isAdded?'Already added':'Add'} ${exercise.name} to workout`} onClick={()=>onAddToWorkout(exercise)}>{isAdded?<Check size={18}/>:addDisabledReason?<LockKeyhole size={18}/>:<Plus size={18}/>}<span>{isAdded?'Added':'Add to workout'}</span></button>}</article>;
}
