import { useEffect, useState } from 'react';
import { movementTutorialSources, type ThumbnailExercise } from '@/lib/movementThumbnails';
import { EmbeddedMedia } from './EmbeddedMedia';
import { ExerciseArtwork } from './ExerciseArtwork';
import { Play } from 'lucide-react';
export function MovementVideo({exercise}:{exercise:ThumbnailExercise}){
 const lessons=movementTutorialSources(exercise);const [selected,setSelected]=useState(0),[playing,setPlaying]=useState(false);
 useEffect(()=>{setSelected(0);setPlaying(false);},[exercise.slug]);
 const lesson=lessons[selected];const url=lesson?.url||exercise.instagram_url;
 if(!url)return <p className="text-sm text-muted-foreground">A matching tutorial is still needed for this exercise. The written practice steps remain available here.</p>;
 const title=lesson?.title||exercise.name;
 return <section className="power-clean-lesson" aria-label={`${exercise.name} in-app tutorial`}>
  {lesson?.scope==='guide'&&<p className="power-related-note">Related lesson: {title}. This covers a broader skill and may show other exercises.</p>}
  {playing?<EmbeddedMedia key={url} url={url} title={title}/>:<button type="button" className="power-load-lesson" onClick={()=>setPlaying(true)} aria-label={`Watch ${exercise.name} tutorial inside POWER`}><ExerciseArtwork title={title} youtubeUrl={lesson?.url}/><span><Play size={24} fill="currentColor"/><strong>Watch here</strong><small>{title}</small></span></button>}
  {lessons.length>1&&<details className="power-lesson-options"><summary>Other lessons for this skill</summary>{lessons.map((option,index)=><button type="button" key={option.url} aria-pressed={selected===index} onClick={()=>{setSelected(index);setPlaying(true);}}>{option.title}<small>{option.scope==='guide'?'Related coaching lesson':'Exercise tutorial'}</small></button>)}</details>}
 </section>;
}
