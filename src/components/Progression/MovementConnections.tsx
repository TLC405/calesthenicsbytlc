import { ArrowDownRight, ArrowUpRight, Repeat2 } from 'lucide-react';
import { movementRelations, movementHistorySummary } from '@/lib/movementRelations';
import { MovementThumbnail } from '@/components/Exercise/MovementThumbnail';
import type { SkillAttempt, SkillTrainingProfile } from '@/lib/skillGraph';
export function MovementConnections({slug,profile,attempts,onChoose,mode='browse'}:{slug:string;profile:SkillTrainingProfile;attempts:SkillAttempt[];onChoose:(slug:string)=>void;mode?:'browse'|'replace'}){
 const connections=movementRelations(slug,profile);const history=movementHistorySummary(slug,attempts);
 const groups=[{key:'easier' as const,label:'Easier option',icon:ArrowDownRight},{key:'harder' as const,label:'Next options',icon:ArrowUpRight},{key:'variations' as const,label:'Related variations',icon:Repeat2}];
 return <section className="power-movement-connections" aria-label="Movement progression options"><h3>Explore this movement</h3><p className="power-movement-history">{history.count?`${history.count} logged attempts${history.best!==null?` · best controlled result ${history.best} ${history.metric}`:''}`:'No results logged for this movement yet.'}</p>
  {groups.map(({key,label,icon:Icon})=>connections[key].length>0&&<div key={key} className="power-connection-group"><h4><Icon size={15}/>{label}</h4>{connections[key].map(({exercise,level,reasons})=><button type="button" key={exercise.slug} disabled={mode==='replace'&&reasons.length>0} onClick={()=>onChoose(exercise.slug)} aria-label={`${mode==='replace'?'Replace with':'View'} ${exercise.name}`} className="power-connection-option"><MovementThumbnail exercise={exercise}/><span><strong>{exercise.name}</strong><small>L{level} · {reasons.length?'Preparation needed':'Fits current checks'}</small>{reasons.length>0&&<small>{reasons[0]}</small>}</span><ArrowUpRight size={16}/></button>)}</div>)}
  {!Object.values(connections).some(group=>group.length>0)&&<p className="text-xs text-muted-foreground">No curated next-step link yet. Explore related practice in its progression family.</p>}
  <p className="power-connections-note">Options come from curated movement links. Your working level, equipment and entry/exit checks still apply.</p>
 </section>;
}
