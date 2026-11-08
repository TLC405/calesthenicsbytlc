import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SkillCategoryBrowser } from '@/components/Progression/SkillCategoryBrowser';
import Library from './Library';
export default function Skills(){
 const [params]=useSearchParams();const navigate=useNavigate();const [view,setView]=useState('paths');
 return <main className="power-movements-page"><header className="power-page-intro"><h1>Movements</h1><p>Pick a category, then the skill you want to practice.</p></header><div className="power-view-tabs" role="group" aria-label="Movement view"><button type="button" aria-pressed={view==='paths'} onClick={()=>setView('paths')}>Skill groups</button><button type="button" aria-pressed={view==='all'} onClick={()=>setView('all')}>Find a movement</button></div>{view==='all'?<Library embedded/>:<><SkillCategoryBrowser initialCategory={params.get('group')||''} onChoose={path=>navigate(`/skills/${path.id}`)}/><Link to="/assessment" className="power-quiet-link">Find my starting level <ArrowRight size={16}/></Link></>}</main>;
}
