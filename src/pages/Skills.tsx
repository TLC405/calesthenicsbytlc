import { readProgressionFocus } from '@/lib/progressionFocus';
import { useAuth } from '@/providers/AuthProvider';
import { exerciseBySlug } from '@/lib/skillGraph';
import { useState } from 'react';
import { TrainingLevelControls, LevelProgressReview } from '@/components/Progression/TrainingLevelControls';
import { readTrainingProfile, writeTrainingProfile } from '@/lib/skillGraph';
import { minimumTier } from '@/lib/trainingPolicy';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Dumbbell, Crown, Target } from 'lucide-react';
import { SKILL_PATHS } from '@/data/skillPaths';
import { PowerDisciplineIcon, type PowerDiscipline } from '@/components/Brand/PowerDisciplineIcon';

const icons: Record<string, PowerDiscipline> = {planche:'planche',handstand:'handstand',rings:'rings','ring-muscle-up':'muscle-up','straddle-press':'handstand',hspu:'handstand'};
export default function Skills() {
  const [params]=useSearchParams();
  const [showAll,setShowAll]=useState(false);
  const assessed=Boolean(localStorage.getItem('power-starting-assessment-v1'));
  const {user}=useAuth();const focus=readProgressionFocus(user?.id||'guest');
  const [search,setSearch]=useState('');const [group,setGroup]=useState(params.get('group')||'All');const [profile,setProfile]=useState(readTrainingProfile);
  const groups=['All',...new Set(SKILL_PATHS.map(p=>p.group))];
  const visible=SKILL_PATHS.filter(p=>(group==='All'||p.group===group)&&`${p.title} ${p.short} ${[...p.slugs,...(p.accessories||[])].map(slug=>exerciseBySlug.get(slug)?.name).join(' ')}`.toLowerCase().includes(search.toLowerCase()));
  const featured=['foundation','planche','pike-compression','straddle-press','handstand','rings','yoga-foundation','ballet-barre'];
  const displayed=group==='All'&&!search&&!showAll?visible.filter(p=>featured.includes(p.id)):visible;
  const unfinished = Boolean(localStorage.getItem('power-active-workout-v2'));
  return <main className="power-simple-page" aria-labelledby="skills-title">
    <header className="power-simple-heading"><div><p className="power-simple-eyebrow"><Crown size={15}/> POWER / TLC</p><h1 id="skills-title">Skills</h1><p>Build control. Choose your progression.</p></div></header>
    {unfinished && <Link className="power-simple-resume" to="/workout"><Dumbbell size={19}/><span>Resume your workout</span><ArrowRight size={18}/></Link>}
    {focus&&<Link className="power-simple-resume" to={`/skills/${focus.pathId}`}><Target size={19}/><span><strong className="block">Continue your progression</strong><small className="block mt-1 text-muted-foreground">{exerciseBySlug.get(focus.slug)?.name}</small></span><ArrowRight size={18}/></Link>}
    {!assessed&&<Link className="power-simple-secondary power-starting-link" to="/assessment"><span><strong className="block">Find my starting level</strong><small className="block font-normal text-muted-foreground mt-1">7 quick questions · no max-effort testing</small></span><ArrowRight size={19}/></Link>}
    <label className="block my-4 text-sm font-bold">Find a progression<input className="mt-2 h-12 w-full bg-card border rounded-xl px-3" placeholder="Planche, compression, yoga, ballet…" value={search} onChange={e=>setSearch(e.target.value)}/></label>
    <label className="block text-xs font-bold my-3">Focus<select className="block w-full h-12 rounded-xl border bg-card px-3 mt-2" value={group} onChange={e=>setGroup(e.target.value)}>{groups.map(g=><option key={g}>{g}</option>)}</select></label>
    <div className="flex flex-wrap gap-2 my-4">{['Yoga','Ballet','Compression','Rings'].map(g=><button type="button" aria-pressed={group===g} className="min-h-11 px-3 border rounded-xl text-xs font-bold" onClick={()=>setGroup(group===g?'All':g)} key={g}>{g}</button>)}</div>
    <p className="text-xs text-muted-foreground mb-3">{displayed.length} shown / {SKILL_PATHS.length} progression families · your current level is L{profile.tier||1}</p>
    <div className="power-skills-grid" aria-label="Choose a skill">{displayed.map((path,index)=><Link className="power-goal-card" to={`/skills/${path.id}`} key={path.id}>
      <div className="power-goal-card-top"><PowerDisciplineIcon discipline={icons[path.id]||(path.group==='Yoga'?'yoga':path.group==='Ballet'?'ballet':/Mobility/.test(path.group)?'mobility':/Compression|Core/.test(path.group)?'core':path.group==='Rings'?'rings':'planche')} width={38} height={38}/><span>{String(index+1).padStart(2,'0')}</span></div>
      <h2>{path.title}</h2><p>{path.short}</p><div className="power-goal-card-footer"><span>{path.slugs.length+(path.accessories?.length||0)} movements · L{Math.min(...path.slugs.map(minimumTier))}–{Math.max(...path.slugs.map(minimumTier))}</span><ArrowRight size={19}/></div>
    </Link>)}</div>
    {group==='All'&&!search&&<button type="button" className="power-assessment-action w-full my-4" onClick={()=>setShowAll(v=>!v)}>{showAll?'Show featured progressions':`Browse all ${SKILL_PATHS.length} progression families`}</button>}
    <details className="border rounded-xl p-3 my-4"><summary className="min-h-11 cursor-pointer font-bold text-sm">L{profile.tier||1} · Level and readiness</summary><LevelProgressReview profile={profile} onChange={next=>{setProfile(next);writeTrainingProfile(next);}}/><TrainingLevelControls profile={profile} onChange={next=>{setProfile(next);writeTrainingProfile(next);}}/></details>
    {visible.length===0&&<p className="text-sm text-muted-foreground">No matching progression. Try a skill name or choose All.</p>}
    <Link className="power-simple-secondary" to="/ai-lab">Coach · help choose my next step <ArrowRight size={18}/></Link>
    <Link className="power-simple-secondary" to="/build">Build a skill workout <ArrowRight size={18}/></Link>
  </main>;
}
