import { useState } from 'react';
import { TrainingLevelControls } from '@/components/Progression/TrainingLevelControls';
import { readTrainingProfile, writeTrainingProfile } from '@/lib/skillGraph';
import { minimumTier } from '@/lib/trainingPolicy';
import { Link } from 'react-router-dom';
import { ArrowRight, Dumbbell, Crown } from 'lucide-react';
import { SKILL_PATHS } from '@/data/skillPaths';
import { PowerDisciplineIcon, type PowerDiscipline } from '@/components/Brand/PowerDisciplineIcon';

const icons: Record<string, PowerDiscipline> = {planche:'planche',handstand:'handstand',rings:'rings','ring-muscle-up':'muscle-up','straddle-press':'handstand',hspu:'handstand'};
export default function Skills() {
  const [search,setSearch]=useState('');const [group,setGroup]=useState('All');const [profile,setProfile]=useState(readTrainingProfile);
  const groups=['All',...new Set(SKILL_PATHS.map(p=>p.group))];
  const visible=SKILL_PATHS.filter(p=>(group==='All'||p.group===group)&&`${p.title} ${p.short}`.toLowerCase().includes(search.toLowerCase()));
  const unfinished = Boolean(localStorage.getItem('power-active-workout-v2'));
  return <main className="power-simple-page" aria-labelledby="skills-title">
    <header className="power-simple-heading"><div><p className="power-simple-eyebrow"><Crown size={15}/> POWER / TLC</p><h1 id="skills-title">Skills</h1><p>Build control. Choose your progression.</p></div></header>
    {unfinished && <Link className="power-simple-resume" to="/workout"><Dumbbell size={19}/><span>Resume your workout</span><ArrowRight size={18}/></Link>}
    <details className="border rounded-xl p-3"><summary className="min-h-11 cursor-pointer font-bold text-sm">L{profile.tier||1} · Level and readiness</summary><TrainingLevelControls profile={profile} onChange={next=>{setProfile(next);writeTrainingProfile(next);}}/></details>
    <label className="block my-4 text-sm font-bold">Find a progression<input className="mt-2 h-12 w-full bg-card border rounded-xl px-3" placeholder="Compression, pike, planche, Stalder…" value={search} onChange={e=>setSearch(e.target.value)}/></label>
    <label className="block text-xs font-bold my-3">Focus<select className="block w-full h-12 rounded-xl border bg-card px-3 mt-2" value={group} onChange={e=>setGroup(e.target.value)}>{groups.map(g=><option key={g}>{g}</option>)}</select></label>
    <p className="text-xs text-muted-foreground mb-3">{visible.length} progression families · your current level is L{profile.tier||1}</p>
    <div className="power-skills-grid" aria-label="Choose a skill">{visible.map((path,index)=><Link className="power-goal-card" to={`/skills/${path.id}`} key={path.id}>
      <div className="power-goal-card-top"><PowerDisciplineIcon discipline={icons[path.id]||(/Compression/.test(path.group)?'core':'planche')} width={38} height={38}/><span>{String(index+1).padStart(2,'0')}</span></div>
      <h2>{path.title}</h2><p>{path.short}</p><div className="power-goal-card-footer"><span>{path.slugs.length} movements · L{Math.min(...path.slugs.map(minimumTier))}–{Math.max(...path.slugs.map(minimumTier))}</span><ArrowRight size={19}/></div>
    </Link>)}</div>
    {visible.length===0&&<p className="text-sm text-muted-foreground">No matching progression. Try a skill name or choose All.</p>}
    <Link className="power-simple-secondary" to="/ai-lab">Coach · help choose my next step <ArrowRight size={18}/></Link>
    <Link className="power-simple-secondary" to="/build">Build a skill workout <ArrowRight size={18}/></Link>
  </main>;
}
