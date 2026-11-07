import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { readProgressionFocus } from '@/lib/progressionFocus';
import { readFocusPreferences } from '@/lib/focusPlan';
import { getSkillPath } from '@/data/skillPaths';
import { exerciseBySlug } from '@/lib/skillGraph';
import { MovementThumbnail } from '@/components/Exercise/MovementThumbnail';
export default function Index(){
 const {user}=useAuth();const owner=user?.id||'guest';const focus=readProgressionFocus(owner);const preferences=readFocusPreferences(owner);const goal=getSkillPath(preferences.goalId)||getSkillPath(focus?.pathId);const unfinished=Boolean(localStorage.getItem('power-active-workout-v2'));
 return <main className="power-home-simple"><section className="power-practice-welcome"><div><p className="power-kicker">YOUR DAILY PRACTICE</p><h1>Build control.<br/><em>One step at a time.</em></h1><p>Level-appropriate practice, with your warm-up built in.</p><Link to={unfinished?'/workout':'/today'} className="focus-primary"><Play size={18}/>{unfinished?'Resume my session':'Start my training'}<ArrowRight size={20}/></Link></div><img src="/art/power-studio-vasa.webp" alt="" fetchPriority="high"/></section>
 {goal&&!unfinished&&<Link className="power-home-continue" to={`/today?goal=${goal.id}`}><span><small>CONTINUE YOUR FOCUS</small><strong>{goal.title}</strong></span><ArrowRight size={20}/></Link>}
 <section className="power-home-focus"><h2>What do you want to work on?</h2>{[{id:'rings',label:'Rings',sub:'Support, rows and controlled strength'},{id:'straight-arm',label:'Straight-arm strength',sub:'Shoulder control, leans and press preparation'},{id:'yoga-foundation',label:'Yoga & warm-ups',sub:'Comfortable range and simple movement'}].map(item=>{const path=getSkillPath(item.id)!;const e=exerciseBySlug.get(path.slugs[0])!;return <Link className="power-path-row" to={`/today?goal=${item.id}`} key={item.id}><MovementThumbnail exercise={e}/><span><strong>{item.label}</strong><small>{item.sub}</small></span><ArrowRight size={19}/></Link>;})}</section><Link to="/skills" className="power-quiet-link">Explore all movements & progressions <ArrowRight size={18}/></Link></main>;
}
