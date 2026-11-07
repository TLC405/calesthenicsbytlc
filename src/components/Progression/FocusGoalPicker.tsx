import { MovementThumbnail } from '@/components/Exercise/MovementThumbnail';
import { exerciseBySlug } from '@/lib/skillGraph';
import { goalDiscipline } from '@/lib/goalPresentation';
import { useState } from 'react';
import { ArrowUpRight, Check, Search, Sparkles } from 'lucide-react';
import { SKILL_PATHS } from '@/data/skillPaths';
import { PowerDisciplineIcon } from '@/components/Brand/PowerDisciplineIcon';
const featured=['rings','straight-arm','planche','pike-compression','handstand','straddle-press','stalder','yoga-foundation'];

export function FocusGoalPicker({selected,onChoose}:{selected:string;onChoose:(id:string)=>void}){
 const [all,setAll]=useState(false);const [search,setSearch]=useState('');
 const choices=SKILL_PATHS.filter(p=>(all||search||featured.includes(p.id))&&`${p.title} ${p.short}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>!all&&!search?featured.indexOf(a.id)-featured.indexOf(b.id):0);
 return <div className="focus-goal-picker"><label className="focus-search power-home-skill-search"><Search size={18}/><input aria-label="Search training goals" placeholder="Find a skill: rings, planche, Stalder…" value={search} onChange={e=>setSearch(e.target.value)}/></label>
  <div className="focus-goal-grid">{choices.map((p,index)=><button type="button" aria-pressed={selected===p.id} className={`focus-goal-tile ${selected===p.id?'is-selected':''}`} key={p.id} onClick={()=>onChoose(p.id)}><span className="focus-goal-tile-top"><span className="focus-goal-icon"><MovementThumbnail exercise={exerciseBySlug.get(p.slugs[0])!}/></span><span className="focus-index">{selected===p.id?<Check size={18}/>:String(index+1).padStart(2,'0')}</span></span><strong>{p.title}</strong><small>{p.short}</small><span className="focus-tile-footer">{p.slugs.length} movements <ArrowUpRight size={16}/></span></button>)}</div>
  <button type="button" className="focus-text-button" aria-expanded={all} onClick={()=>{if(all)setSearch('');setAll(v=>!v);}}>{all?'Show featured goals':`Explore all ${SKILL_PATHS.length} movement families`}</button>
  <button type="button" className="focus-auto-goal power-home-auto" onClick={()=>onChoose('auto')}><Sparkles size={19}/><span><strong>Help me choose</strong><small>Suggest a focus from my level and recent practice.</small></span><ArrowUpRight size={18}/></button>
  {!choices.length&&<p className="text-sm text-muted-foreground">No matching family. Try a shorter skill name.</p>}
 </div>;
}
