import { minimumTier, TRAINING_LEVELS } from '@/lib/trainingPolicy';
import { MovementThumbnail } from './MovementThumbnail';
import { ArrowRight, Plus } from 'lucide-react';
interface Exercise {id:string;name:string;slug:string;category:string;primary_muscles:string[];secondary_muscles:string[];equipment:string[];cues:any;difficulty_level?:number|null;youtube_url?:string|null;instagram_url?:string|null;image_url?:string|null;}
export function ExerciseCard({exercise,onViewDetails,onAddToWorkout}:{exercise:Exercise;onViewDetails:(exercise:Exercise)=>void;onAddToWorkout?:(exercise:Exercise)=>void}){
 const level=minimumTier(exercise.slug);
 return <article className="power-exercise-row"><button type="button" className="power-exercise-open" onClick={()=>onViewDetails(exercise)} aria-label={`View ${exercise.name} details`}><MovementThumbnail exercise={exercise}/><span><strong>{exercise.name}</strong><small>{TRAINING_LEVELS[level-1].label}</small><small>{exercise.equipment?.join(', ')||'Bodyweight'}</small></span><ArrowRight size={17}/></button>{onAddToWorkout&&<button type="button" className="power-exercise-add" aria-label={`Add ${exercise.name} to workout`} onClick={()=>onAddToWorkout(exercise)}><Plus size={18}/><span>Add to workout</span></button>}</article>;
}
