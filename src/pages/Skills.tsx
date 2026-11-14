import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SkillCategoryBrowser } from '@/components/Progression/SkillCategoryBrowser';
import Library from './Library';
import { TlcTvTopBar } from '@/components/Media/TlcTvTopBar';
import { SkillLaddersPanel } from '@/components/Training/SkillLaddersPanel';
export default function Skills(){
 const [params]=useSearchParams();const navigate=useNavigate();const [view,setView]=useState('paths');
 return <main className="power-movements-page"><TlcTvTopBar/><header className="power-page-intro"><p className="power-simple-eyebrow">TLC / THE STRENGTH LIBRARY</p><h1>Super Human Skills</h1><p>Pick a skill. Watch the video. Try your level.</p></header><div className="power-view-tabs" role="group" aria-label="Movement view"><button type="button" aria-pressed={view==='paths'} onClick={()=>setView('paths')}>Skills</button><button type="button" aria-pressed={view==='all'} onClick={()=>setView('all')}>All exercises</button></div>{view==='all'?<Library embedded/>:<><SkillCategoryBrowser initialCategory={params.get('group')||''} onChoose={path=>navigate(`/skills/${path.id}`)}/><div className="mt-4 flex flex-wrap gap-3"><Link to="/program" className="power-quiet-link">My A/D/E/B/C training plan <ArrowRight size={16}/></Link><Link to="/assessment" className="power-quiet-link">Test my strength <ArrowRight size={16}/></Link></div><div className="mx-auto mt-6 max-w-5xl"><SkillLaddersPanel/></div></>}</main>;
}
