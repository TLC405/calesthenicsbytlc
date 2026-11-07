import { matchesWorkoutCategory, presentWorkout } from '@/lib/workoutPresentation';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { SKILL_PATHS } from '@/data/skillPaths';
import { exerciseBySlug } from '@/lib/skillGraph';
import { movementThumbnailSources } from '@/lib/movementThumbnails';
import { minimumTier } from '@/lib/trainingPolicy';
import { MovementThumbnail } from '@/components/Exercise/MovementThumbnail';
import Library from './Library';
const featured=['foundation','rings','straight-arm','planche','pike-compression','straddle-press','yoga-foundation','ballet-barre'];
const categories=['Featured','Rings','Straight arm','Yoga','Compression','Balance','Mobility','Ballet','All'];
export default function Skills(){
 const [params]=useSearchParams();const [view,setView]=useState('paths');const [group,setGroup]=useState(params.get('group')||'Featured');const [search,setSearch]=useState('');
 const visible=SKILL_PATHS.filter(p=>{const match=group==='Featured'?featured.includes(p.id):matchesWorkoutCategory(p,group==='Straight arm'?'Straight arms':group==='Compression'?'Leg lifts & core':group);return (search||match)&&`${p.title} ${p.short} ${p.slugs.map(s=>exerciseBySlug.get(s)?.name).join(' ')}`.toLowerCase().includes(search.toLowerCase());});
 return <main className="power-movements-page"><header className="power-page-intro"><p className="power-kicker">LEARN • PRACTICE • PROGRESS</p><h1>Movements</h1><p>Choose a skill. See your level. Practice the right step.</p></header><div className="power-view-tabs" role="group" aria-label="Movement view"><button type="button" aria-pressed={view==='paths'} onClick={()=>setView('paths')}>Progressions</button><button type="button" aria-pressed={view==='all'} onClick={()=>setView('all')}>All movements</button></div>
 {view==='all'?<Library embedded/>:<><label className="power-movement-search"><Search size={19}/><input aria-label="Find a movement or progression" placeholder="Rings, planche, yoga, pike…" value={search} onChange={e=>setSearch(e.target.value)}/></label><div className="power-focus-chips" aria-label="Movement focus">{categories.map(c=><button type="button" key={c} aria-pressed={group===c} onClick={()=>setGroup(c)}>{c}</button>)}</div><div className="power-path-list">{visible.map(path=>{const e=path.slugs.map(s=>exerciseBySlug.get(s)).find(e=>e&&movementThumbnailSources(e).length)||exerciseBySlug.get(path.slugs[0]);const levels=path.slugs.map(minimumTier);return <Link to={`/skills/${path.id}`} className="power-path-row" key={path.id}>{e&&<MovementThumbnail exercise={e}/>}<span><strong>{presentWorkout(path).title}</strong><small>{presentWorkout(path).detail}</small><b>{Math.min(...levels)===Math.max(...levels)?`L${Math.min(...levels)}`:`L${Math.min(...levels)}–L${Math.max(...levels)}`} · {path.slugs.length} movements{path.kind==='collection'?' · choose any comfortable pose':''}</b></span><ArrowRight size={20}/></Link>;})}</div>{!visible.length&&<p className="py-8 text-sm">No matching movement. Try a shorter name or choose All.</p>}<Link to="/assessment" className="power-quiet-link">Unsure where to begin? Find my starting level <ArrowRight size={16}/></Link></>}
 </main>;
}
