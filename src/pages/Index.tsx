import { Link } from 'react-router-dom';
import { ArrowRight, Dumbbell, Target, Menu, Zap } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { readProgressionFocus } from '@/lib/progressionFocus';
import { exerciseBySlug } from '@/lib/skillGraph';

export default function Index() {
  const {user}=useAuth();
  const focus=readProgressionFocus(user?.id||'guest');
  const unfinished=Boolean(localStorage.getItem('power-active-workout-v2'));
  return <main className="power-home power-simple-page">
    <header className="flex items-center justify-between gap-4"><Link to="/" className="inline-flex items-center gap-2 font-black tracking-widest text-lg"><Zap className="text-primary" fill="currentColor"/>POWER</Link><Link to="/more" className="grid h-12 w-12 place-items-center border rounded-xl" aria-label="More tools and appearance"><Menu size={21}/></Link></header>
    <section className="power-home-welcome"><p className="power-simple-eyebrow">YOUR PRACTICE. YOUR PACE.</p><h1>What are we<br/>working on?</h1><p className="text-muted-foreground text-sm mt-3">Choose a skill or build your own session.</p></section>
    {unfinished&&<Link to="/workout" className="power-simple-resume"><Dumbbell size={22}/><span>Resume workout</span><ArrowRight size={20}/></Link>}
    {!unfinished&&focus&&<Link to={`/skills/${focus.pathId}`} className="power-simple-resume"><Target size={22}/><span><strong className="block">Continue my progression</strong><small className="font-normal text-muted-foreground">{exerciseBySlug.get(focus.slug)?.name}</small></span><ArrowRight size={20}/></Link>}
    <div className="power-home-choices"><Link to="/planner" className="power-home-choice"><span className="power-home-choice-icon"><Dumbbell size={25}/></span><div><h2>Build a workout</h2><p>Your exercises, sets and AI coach.</p></div><ArrowRight size={22}/></Link><Link to="/skills" className="power-home-choice"><span className="power-home-choice-icon"><Target size={25}/></span><div><h2>Practice a progression</h2><p>Strength, compression, yoga and ballet.</p></div><ArrowRight size={22}/></Link></div>
    <Link to="/library" className="flex min-h-12 items-center justify-between gap-3 text-sm font-bold mt-5 px-1">Browse all exercises <ArrowRight size={18}/></Link>
  </main>;
}
