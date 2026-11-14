import { ArrowRight } from 'lucide-react';
import { MovementThumbnail } from './MovementThumbnail';
import { MovementPhotoGallery } from './MovementPhotoGallery';
import { MovementOverview } from './MovementOverview';
import { CoachResources } from './CoachResources';
import { InlineTlcTv } from './InlineTlcTv';
import { DifficultyBadge } from './DifficultyBadge';
import { movementRelations } from '@/lib/movementRelations';
import type { SkillExercise } from '@/lib/skillWorkoutBuilder';
import type { SkillTrainingProfile } from '@/lib/skillGraph';

export function MovementLearningPanel({exercise,profile,onNavigate}:{exercise:SkillExercise;profile:SkillTrainingProfile;onNavigate:(slug:string)=>void}){
 const relations=movementRelations(exercise.slug,profile);
 return <div className="power-learning-panel tlc-watch-and-learn">
   <InlineTlcTv exercise={exercise}/>
   <MovementOverview exercise={exercise} onChoose={onNavigate}/>
   <details className="power-learn-section tlc-guide-extra"><summary>Photos & examples</summary><MovementPhotoGallery exercise={exercise}/></details>
   <details className="power-learn-section tlc-guide-extra"><summary>More lessons & other moves</summary>
     <CoachResources slug={exercise.slug} category={exercise.category}/>
     {(['harder','variations'] as const).map(kind=>relations[kind].length>0&&
       <section className="power-learning-relations" key={kind}>
         <h3>{kind==='harder'?'Try later':'Related exercises'}</h3>
         {relations[kind].map(r=><button type="button" className="power-learning-link" key={r.exercise.slug} onClick={()=>onNavigate(r.exercise.slug)}>
           <MovementThumbnail exercise={r.exercise}/>
           <span><strong>{r.exercise.name}</strong><DifficultyBadge level={r.level}/></span>
           <ArrowRight size={16}/>
         </button>)}
       </section>)}
   </details>
 </div>;
}
