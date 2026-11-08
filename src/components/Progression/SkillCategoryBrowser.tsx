import { useState } from 'react';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { SKILL_PATHS, getSkillPath, type SkillPath } from '@/data/skillPaths';
import { SKILL_CATEGORIES, browseCategory, skillCategory, familySearch, familiesInCategory, pageSlice } from '@/lib/skillBrowse';
import { skillCoverMovement } from '@/lib/movementThumbnails';
import { presentWorkout } from '@/lib/workoutPresentation';
import { MovementThumbnail } from '@/components/Exercise/MovementThumbnail';
import { DifficultyBadge } from '@/components/Exercise/DifficultyBadge';
import { minimumTier } from '@/lib/trainingPolicy';
import { ResultPager } from '@/components/Exercise/ResultPager';
export function SkillCategoryBrowser({onChoose,initialCategory='',selected}:{onChoose:(path:SkillPath)=>void;initialCategory?:string;selected?:string}){
 const [category,setCategory]=useState(()=>browseCategory(initialCategory));const [query,setQuery]=useState('');const [page,setPage]=useState(0);
 const matches=SKILL_PATHS.filter(path=>(query?true:category?skillCategory(path)===category:false)&&familySearch(path,query));const result=pageSlice(matches,page,6);const current=SKILL_CATEGORIES.find(c=>c.id===category);
 function reset(){setCategory(null);setQuery('');setPage(0);}
 return <section className="power-skill-browser" aria-label="Find a skill"><label className="power-movement-search"><Search size={18}/><input aria-label="Find a movement or progression" placeholder="Find rings, planche, yoga…" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}}/></label>{!category&&!query?<div className="power-category-grid">{SKILL_CATEGORIES.map(c=>{const paths=familiesInCategory(c.id);const cover=getSkillPath(c.cover)||paths[0];const e=cover&&skillCoverMovement(cover);return <button type="button" key={c.id} aria-label={`Browse ${c.title}`} onClick={()=>{setCategory(c.id);setPage(0);}}>{e&&<MovementThumbnail exercise={e} coverTitle={c.title}/>}<span><strong>{c.title}</strong><small>{paths.length} skill {paths.length===1?'group':'groups'}</small></span><ArrowRight size={15}/></button>;})}</div>:<><header className="power-browse-heading"><button type="button" onClick={reset}><ArrowLeft size={16}/>Categories</button><h2>{query?'Search results':current?.title}</h2><small>{matches.length} skill groups</small></header><div className="power-path-list">{result.items.map(path=>{const e=skillCoverMovement(path);const levels=path.slugs.map(minimumTier);return <button type="button" className="power-path-row" key={path.id} aria-label={`Choose ${presentWorkout(path).title}`} aria-pressed={selected===path.id} onClick={()=>onChoose(path)}>{e&&<MovementThumbnail exercise={e} coverTitle={presentWorkout(path).title}/>}<span><strong>{presentWorkout(path).title}</strong><small>{presentWorkout(path).detail}</small><span className="power-path-meta"><DifficultyBadge level={Math.min(...levels)} showLabel={false}/>{Math.max(...levels)!==Math.min(...levels)&&<><span>to</span><DifficultyBadge level={Math.max(...levels)} showLabel={false}/></>}<small>{path.slugs.length} movements</small></span></span><ArrowRight size={18}/></button>;})}</div><ResultPager result={result} onPage={setPage} noun="skill groups"/>{!matches.length&&<p className="power-empty-result">No matching skills. Try a shorter name.</p>}</>}
 </section>;
}
