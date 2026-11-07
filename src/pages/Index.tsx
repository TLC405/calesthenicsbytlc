import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Dumbbell, Menu, Target, Zap } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { readProgressionFocus } from '@/lib/progressionFocus';
import { exerciseBySlug, readTrainingProfile } from '@/lib/skillGraph';
import { getSkillPath } from '@/data/skillPaths';
import { readFocusPreferences } from '@/lib/focusPlan';
import { PowerDisciplineIcon } from '@/components/Brand/PowerDisciplineIcon';
import { goalDiscipline } from '@/lib/goalPresentation';

export default function Index(){
 const {user}=useAuth();const owner=user?.id||'guest';const focus=readProgressionFocus(owner);const preferences=readFocusPreferences(owner);const profile=readTrainingProfile();
 const goal=getSkillPath(preferences.goalId)||getSkillPath(focus?.pathId);const unfinished=Boolean(localStorage.getItem('power-active-workout-v2'));
 return <main className="focus-home"><header className="focus-home-header"><Link to="/" className="focus-logo"><Zap size={22} fill="currentColor"/><span>POWER<small>BY TLC</small></span></Link><div><span className="focus-level-tag">L{profile.tier||1} / YOUR PRACTICE</span><Link to="/more" className="focus-menu" aria-label="More tools and appearance"><Menu size={21}/></Link></div></header>
  <section className="focus-home-hero"><img src="/art/power-studio-vasa.webp" alt="" width={1536} height={1024} fetchPriority="high"/><div className="focus-hero-copy"><p className="focus-eyebrow">CONTROL. STRENGTH. MASTERY.</p><h1>Every goal<br/>starts with<br/><em>the right focus.</em></h1><p>Know what to practice.<br/>Build the pieces. Make it repeatable.</p><Link to="/today" className="focus-primary">Build my focus <ArrowUpRight size={22}/></Link></div><span className="focus-hero-caption">THE PRACTICE / POWER 01</span></section>
  {unfinished?<Link to="/workout" className="focus-continue"><span className="focus-goal-icon"><Dumbbell size={24}/></span><span><small>YOUR SESSION IS SAVED</small><strong>Pick up where you left off</strong></span><ArrowRight size={21}/></Link>:goal&&<Link to={`/today?goal=${goal.id}`} className="focus-continue"><span className="focus-goal-icon"><PowerDisciplineIcon discipline={goalDiscipline(goal.id)} width={32} height={32}/></span><span><small>YOUR CURRENT DIRECTION</small><strong>{goal.title}</strong><small>{focus?exerciseBySlug.get(focus.slug)?.name:'Build a session at your current level'}</small></span><ArrowRight size={21}/></Link>}
  <section className="focus-home-tools"><Link to="/planner"><span className="focus-tool-number">01 / CREATE</span><Dumbbell size={23}/><strong>Build it your way</strong><p>Your movements, sets and coach chat.</p><ArrowUpRight size={18}/></Link><Link to="/skills"><span className="focus-tool-number">02 / EXPLORE</span><Target size={23}/><strong>Find your progression</strong><p>Strength, compression, yoga and ballet.</p><ArrowUpRight size={18}/></Link></section>
  <Link to="/library" className="focus-library-link"><span>Every movement has a place.<small>Open the full exercise library</small></span><ArrowRight size={20}/></Link>
 </main>;
}
