import { MovementModifications } from './MovementModifications';
import { plainTrainingText } from '@/lib/workoutPresentation';
import { MOVEMENT_GUIDANCE } from '@/data/movementGuidance';
import { canonicalSlug, exercisePaths } from '@/lib/exerciseProgressions';
import { minimumTier, TRAINING_LEVELS } from '@/lib/trainingPolicy';
import { nodeDose } from '@/lib/skillGraph';
import { BookOpen, Check, Clock3, ShieldAlert } from 'lucide-react';

type Movement={slug:string;name:string;equipment?:string[];primary_muscles?:string[];cues?:unknown;description?:string|null};
export function MovementOverview({exercise,onChoose}:{exercise:Movement;onChoose?:(slug:string)=>void}){
 const tier=minimumTier(exercise.slug);
 const dose=nodeDose(exercise.slug);
 const paths=exercisePaths(exercise.slug);
 const guidance=MOVEMENT_GUIDANCE[canonicalSlug(exercise.slug)];
 const cues=(guidance?.steps || (Array.isArray(exercise.cues)?exercise.cues.filter(c=>typeof c==='string'):[]));
 const steps=(cues.length?cues:['Choose a range you can control.','Move steadily and keep breathing.','Stop when technique fades or joint pain appears.']).map(plainTrainingText);
 const description=plainTrainingText(exercise.description||`${exercise.name} builds ${exercise.primary_muscles?.slice(0,2).join(' and ').toLowerCase()||paths[0]?.short.toLowerCase()||'movement control'}. ${TRAINING_LEVELS[tier-1].note}.`);
 return <section className="power-movement-overview tlc-clear-guide" aria-label={exercise.name+' exercise guide'}>
  <div className="tlc-clear-guide__quick">
   <div><span className="tlc-clear-guide__eyebrow"><Clock3 size={14}/> HOW TO START</span><strong>{dose.sets} sets · {dose.target} {dose.metric==='seconds'?'sec holds':'reps'}</strong><small>Rest about {Math.round(dose.restSeconds/5)*5} sec · adjust to your level</small></div>
   <div><span className="tlc-clear-guide__eyebrow"><Check size={14}/> YOU'LL NEED</span><strong>{exercise.equipment?.join(', ')||'No equipment listed'}</strong><small>{TRAINING_LEVELS[tier-1].label} level</small></div>
  </div>
  <div className="tlc-clear-guide__tips"><h3>Do it right</h3><ol>{steps.slice(0,2).map((cue,i)=><li key={i}>{cue}</li>)}</ol></div>
  <MovementModifications slug={exercise.slug} onChoose={onChoose}/>
  <details className="power-learn-section tlc-guide-extra"><summary><BookOpen size={16}/> Full instructions</summary>
   <p>{description}</p><h4>All steps</h4><ol>{steps.map((cue,i)=><li key={i}>{cue}</li>)}</ol>
   <p>For longer holds and sets, stop when you lose control. Build up gradually at a level you can repeat.</p>
  </details>
  <details className="power-learn-section tlc-guide-extra"><summary><ShieldAlert size={16}/> Safety & form tips</summary>
   <p>{plainTrainingText(guidance?.watch||'Keep the same range and setup across your attempts. Reduce the difficulty if control fades.')}</p>
   <p>Use the same equipment setup when comparing progress. Stop for joint pain or loss of control. Do not push into a new level just to finish a number.</p>
   <p>{dose.stopRule}</p>
  </details>
 </section>;
}
