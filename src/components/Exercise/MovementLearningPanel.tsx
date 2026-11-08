import { ArrowRight } from 'lucide-react';
import { MovementThumbnail } from './MovementThumbnail';
import { MovementOverview } from './MovementOverview';
import { MovementTutorialButton } from './MovementTutorialButton';
import { DifficultyBadge } from './DifficultyBadge';
import { minimumTier } from '@/lib/trainingPolicy';
import { movementRelations } from '@/lib/movementRelations';
import type { SkillExercise } from '@/lib/skillWorkoutBuilder';
import type { SkillTrainingProfile } from '@/lib/skillGraph';
export function MovementLearningPanel({exercise,profile,onNavigate}:{exercise:SkillExercise;profile:SkillTrainingProfile;onNavigate:(slug:string)=>void}){
 const relations=movementRelations(exercise.slug,profile);
 return <div className="power-learning-panel"><MovementThumbnail exercise={exercise} className="power-detail-thumbnail"/><DifficultyBadge level={minimumTier(exercise.slug)}/><MovementTutorialButton exercise={exercise} label/><MovementOverview exercise={exercise}/>
  {(['easier','harder','variations'] as const).map(kind=>relations[kind].length>0&&<section className="power-learning-relations" key={kind}><h3>{kind==='easier'?'Before this · easier practice':kind==='harder'?'After this · later options':'Related practice'}</h3>{relations[kind].map(r=><button type="button" className="power-learning-link" key={r.exercise.slug} onClick={()=>onNavigate(r.exercise.slug)}><MovementThumbnail exercise={r.exercise}/><span><strong>{r.exercise.name}</strong><DifficultyBadge level={r.level}/></span><ArrowRight size={16}/></button>)}</section>)}
 </div>;
}
