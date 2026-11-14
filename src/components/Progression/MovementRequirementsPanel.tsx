import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, Dumbbell, ScanLine, ShieldCheck, StretchHorizontal, Video } from 'lucide-react';
import { movementRequirementsFor, MOVEMENT_NEED_LABELS, type MovementNeed } from '@/data/movementRequirements';
import { type SkillPath } from '@/data/skillPaths';
import { exerciseBySlug } from '@/lib/skillGraph';
import { videoLessonCoverage } from '@/lib/videoLessonCoverage';
import { MovementThumbnail } from '@/components/Exercise/MovementThumbnail';
import { DifficultyBadge } from '@/components/Exercise/DifficultyBadge';
import { minimumTier } from '@/lib/trainingPolicy';

type Props={path:SkillPath;onChoose:(slug:string)=>void;activeSlug?:string;compact?:boolean};
const icons={strength:Dumbbell,mobility:StretchHorizontal,control:ScanLine,preparation:ShieldCheck,variation:BookOpen};
const badge=(exact:number,related:boolean)=>exact>0?'Specific tutorial':related?'Related lesson':'Video not attached';
export function MovementRequirementsPanel({path,onChoose,activeSlug,compact=false}:Props){
 const [expanded,setExpanded]=useState(false);
 const candidates=useMemo(()=>movementRequirementsFor(path),[path.id]);
 const extras=candidates.filter(item=>!item.inMainPath);
 const shown=expanded?extras:extras.slice(0,compact?3:5);
 return <section className={'tlc-movement-needs'+(compact?' tlc-movement-needs--compact':'')} aria-label={'Supporting movements for '+path.title}>
  <header className="tlc-movement-needs__heading">
   <div><span className="tlc-movement-needs__eyebrow">MOVEMENTS NEEDED · SUPPORTING WORK</span>
    <h2>Supporting movements</h2>
    <p>Optional strength, mobility and control work. <strong>No mandatory unlocks.</strong></p>
   </div>
   <span className="tlc-movement-needs__count">{extras.length} options</span>
  </header>
  {extras.length>0?<div className="tlc-movement-needs__grid">
   {shown.map(item=>{const e=exerciseBySlug.get(item.slug);if(!e)return null;
    const Icon=icons[item.role],coverage=videoLessonCoverage(e);
    return <button type="button" key={item.slug} onClick={()=>onChoose(item.slug)} aria-pressed={activeSlug===item.slug} className="tlc-movement-needs__card">
     <MovementThumbnail exercise={e} className="is-small"/>
     <span className="tlc-movement-needs__info">
      <span className="tlc-movement-needs__kind"><Icon size={12}/>{MOVEMENT_NEED_LABELS[item.role].title}</span>
      <strong>{e.name}</strong>
      <small>{item.why}</small>
      <span className="tlc-movement-needs__meta"><DifficultyBadge level={minimumTier(e.slug)} size="sm"/><span className={coverage.exactCount?'is-exact':''}><Video size={12}/>{badge(coverage.exactCount,coverage.hasRelated)}</span></span>
     </span><ArrowRight size={17} className="tlc-movement-needs__arrow"/>
    </button>;
   })}
  </div>:<p className="tlc-movement-needs__empty">The main path contains the core exercises. Choose one above to see its movement requirements.</p>}
  {extras.length>(compact?3:5)&&<button type="button" className="tlc-movement-needs__expand" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>
   {expanded?'Show fewer supporting movements':'Show all '+extras.length+' supporting movements'}<ChevronDown size={16} className={expanded?'is-up':''}/>
  </button>}
  <div className="tlc-movement-needs__footer"><CheckCircle2 size={15}/> Use only the drills that fit your ability, equipment and comfort.</div>
 </section>;
}
