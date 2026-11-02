import { Link } from 'react-router-dom';
import { ArrowRight, Dumbbell, Crown } from 'lucide-react';
import { SKILL_PATHS } from '@/data/skillPaths';
import { PowerDisciplineIcon, type PowerDiscipline } from '@/components/Brand/PowerDisciplineIcon';

const icons: Record<string, PowerDiscipline> = {planche:'planche',handstand:'handstand',rings:'rings','ring-muscle-up':'muscle-up','straddle-press':'handstand',hspu:'handstand'};
export default function Skills() {
  const unfinished = Boolean(localStorage.getItem('power-active-workout-v2'));
  return <main className="power-simple-page" aria-labelledby="skills-title">
    <header className="power-simple-heading"><div><p className="power-simple-eyebrow"><Crown size={15}/> POWER / TLC</p><h1 id="skills-title">Skills</h1><p>Choose what you want to master.</p></div></header>
    {unfinished && <Link className="power-simple-resume" to="/workout"><Dumbbell size={19}/><span>Resume your workout</span><ArrowRight size={18}/></Link>}
    <div className="power-skills-grid" aria-label="Choose a skill">{SKILL_PATHS.map((path,index)=><Link className="power-goal-card" to={`/skills/${path.id}`} key={path.id}>
      <div className="power-goal-card-top"><PowerDisciplineIcon discipline={icons[path.id]} width={38} height={38}/><span>{String(index+1).padStart(2,'0')}</span></div>
      <h2>{path.title}</h2><p>{path.short}</p><div className="power-goal-card-footer"><span>{path.slugs.length} movements</span><ArrowRight size={19}/></div>
    </Link>)}</div>
    <Link className="power-simple-secondary" to="/build">Build a skill workout <ArrowRight size={18}/></Link>
  </main>;
}
