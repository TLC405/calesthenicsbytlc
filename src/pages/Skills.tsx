import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, GitBranch, Layers3, Search } from 'lucide-react';
import { SkillCategoryBrowser } from '@/components/Progression/SkillCategoryBrowser';
const Library = lazy(()=>import('./Library'));
import { lazy, Suspense } from 'react';
const MasterSkillMap = lazy(()=>import('./MasterSkillMap'));
import { TlcTvTopBar } from '@/components/Media/TlcTvTopBar';
import { SkillLaddersPanel } from '@/components/Training/SkillLaddersPanel';

type View='paths'|'tree'|'all';
export default function Skills(){
 const [params,setParams]=useSearchParams(),navigate=useNavigate();
 const raw=params.get('view');
 const view:View=raw==='paths'||raw==='all'?raw:'tree';
 const chooseView=(next:View)=>{
  const updated=new URLSearchParams(params);
  if(next==='tree')updated.delete('view');else updated.set('view',next);
  setParams(updated,{replace:true,preventScrollReset:true});
 };
 return <main className="power-movements-page master-skills-shell" aria-label="Skills Studio">
  <TlcTvTopBar/>
  <header className="power-page-intro"><p className="power-simple-eyebrow">TLC / THE STRENGTH LIBRARY</p><h1>Super Human Skills</h1><p>Choose your skill. Follow its steps. Watch the movement.</p></header>
  <nav className="power-view-tabs master-skills-tabs" aria-label="Explore skills">
   <button type="button" aria-current={view==='paths'?'page':undefined} aria-pressed={view==='paths'} onClick={()=>chooseView('paths')}><Layers3 size={18}/><span>Skill Paths</span></button>
   <button type="button" aria-current={view==='tree'?'page':undefined} aria-pressed={view==='tree'} onClick={()=>chooseView('tree')}><GitBranch size={18}/><span>Skill Tree</span><small>80</small></button>
   <button type="button" aria-current={view==='all'?'page':undefined} aria-pressed={view==='all'} onClick={()=>chooseView('all')}><Search size={18}/><span>All Exercises</span></button>
  </nav>
  {view==='tree'?<>
    <div className="master-tree-standalone-link"><span>13 connected pathways · 6 training levels</span><Link to="/skills/map">Open full-screen Skill Tree <ArrowRight size={16}/></Link></div>
    <Suspense fallback={<div className="master-tree-loading" role="status">Loading the 80-skill tree…</div>}><MasterSkillMap embedded/></Suspense>
  </>:view==='all'?<Suspense fallback={<div className="master-tree-loading" role="status">Loading all exercises…</div>}><Library embedded/></Suspense>:<>
    <button className="master-tree-quick" type="button" onClick={()=>chooseView('tree')}>
      <GitBranch size={20}/><span><strong>Explore the Skill Tree</strong><small>See every path from beginner foundations to elite skills.</small></span><ArrowRight size={17}/>
    </button>
    <SkillCategoryBrowser initialCategory={params.get('group')||''} onChoose={path=>navigate(`/skills/${path.id}`)}/>
    <div className="mt-4 flex flex-wrap gap-3"><Link to="/program" className="power-quiet-link">My training plan <ArrowRight size={16}/></Link><Link to="/assessment" className="power-quiet-link">Test my strength <ArrowRight size={16}/></Link></div>
    <div className="mx-auto mt-6 max-w-5xl"><SkillLaddersPanel/></div>
  </>}
 </main>;
}
