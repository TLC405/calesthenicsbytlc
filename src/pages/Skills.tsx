import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SkillCategoryBrowser } from '@/components/Progression/SkillCategoryBrowser';
import Library from './Library';
export default function Skills(){
 const [params]=useSearchParams();const navigate=useNavigate();const [view,setView]=useState('paths');
 return <main className="power-movements-page"><header className="power-page-intro"><p className="power-simple-eyebrow">TLC / THE STRENGTH LIBRARY</p><h1>Super Human Skills</h1><p>Find your starting level. Explore every progression in strength, balance, grip and control. You choose what to train.</p></header><div className="power-view-tabs" role="group" aria-label="Movement view"><button type="button" aria-pressed={view==='paths'} onClick={()=>setView('paths')}>Strength paths</button><button type="button" aria-pressed={view==='all'} onClick={()=>setView('all')}>Find a movement</button></div>{view==='all'?<Library embedded/>:<><SkillCategoryBrowser initialCategory={params.get('group')||''} onChoose={path=>navigate(`/skills/${path.id}`)}/><Link to="/assessment" className="power-quiet-link">Test my strength <ArrowRight size={16}/></Link></>}</main>;
}
