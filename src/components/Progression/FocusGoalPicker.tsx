import { goalDiscipline } from '@/lib/goalPresentation';
import { useState } from 'react';
import { ArrowUpRight, Check, Search, Sparkles } from 'lucide-react';
import { SKILL_PATHS } from '@/data/skillPaths';
import { PowerDisciplineIcon } from '@/components/Brand/PowerDisciplineIcon';
const featured=['planche','straddle-press','stalder','handstand','rings','pike-compression','yoga-foundation','ballet-barre'];

export function FocusGoalPicker({selected,onChoose}:{selected:string;onChoose:(id:string)=>void}){
 const [all,setAll]=useState(false);const [search,setSearch]=useState('');
 const choices=SKILL_PATHS.filter(p=>(all||search||featured.includes(p.id))&&`${p.title} ${p.short}`.toLowerCase().includes(search.toLowerCase()));
 return <div className="focus-goal-picker"><button type="button" aria-pressed={selected==='auto'} className={`focus-auto-goal ${selected==='auto'?'is-selected':''}`} onClick={()=>onChoose('auto')}><span className="focus-goal-icon"><Sparkles size={24}/></span><span><strong>Help me choose</strong><small>Use my goal history, level and recent results.</small></span><ArrowUpRight size={20}/></button>
  <div className="focus-goal-grid">{choices.map((p,index)=><button type="button" aria-pressed={selected===p.id} className={`focus-goal-tile ${selected===p.id?'is-selected':''}`} key={p.id} onClick={()=>onChoose(p.id)}><span className="focus-goal-tile-top"><span className="focus-goal-icon"><PowerDisciplineIcon discipline={goalDiscipline(p.id,p.group)} width={36} height={36}/></span><span className="focus-index">{selected===p.id?<Check size={18}/>:String(index+1).padStart(2,'0')}</span></span><strong>{p.title}</strong><small>{p.short}</small><span className="focus-tile-footer">{p.slugs.length} core movements <ArrowUpRight size={16}/></span></button>)}</div>
  <button type="button" className="focus-text-button" aria-expanded={all} onClick={()=>{if(all)setSearch('');setAll(v=>!v);}}>{all?'Show featured goals':`Explore all ${SKILL_PATHS.length} movement families`}</button>
  {all&&<label className="focus-search"><Search size={18}/><input aria-label="Search training goals" placeholder="Find a skill or movement family" value={search} onChange={e=>setSearch(e.target.value)}/></label>}
  {!choices.length&&<p className="text-sm text-muted-foreground">No matching family. Try a shorter skill name.</p>}
 </div>;
}
