import { useEffect, useMemo, useState } from 'react';
import { movementThumbnailSources, movementVisualDetails, type ThumbnailExercise } from '@/lib/movementThumbnails';
export function MovementThumbnail({exercise,className='',coverTitle}:{exercise:ThumbnailExercise;className?:string;coverTitle?:string}){
 const sources=useMemo(()=>movementThumbnailSources({slug:exercise.slug,name:exercise.name,image_url:exercise.image_url,youtube_url:exercise.youtube_url}),[exercise.slug,exercise.name,exercise.image_url,exercise.youtube_url]);
 const [index,setIndex]=useState(0);useEffect(()=>setIndex(0),[sources]);
 const source=sources[index],visual=movementVisualDetails(exercise);const title=coverTitle||exercise.name;
 return <span className={`power-movement-thumbnail ${source?'has-photo':'is-named-preview'} ${source?.scope==='illustration'?'is-illustration':''} ${className}`} data-movement={exercise.slug} title={source?source.title:`${title} · movement card; exercise photo still needed`}>
  {source?<><img key={source.src} src={source.src} alt={`${exercise.name} · ${source.label.toLowerCase()} preview`} loading="lazy" decoding="async" onError={()=>setIndex(value=>value+1)} onLoad={event=>{if(source.scope!=='photo'&&(event.currentTarget.naturalWidth<=120||event.currentTarget.naturalHeight<=90))setIndex(value=>value+1);}}/><span className="power-thumbnail-label">{source.label}</span></>:<span className="power-movement-name-card" role="img" aria-label={`${title}: named movement card; photo still needed`}><span className="power-preview-family">{visual.family}</span><strong>{title}</strong>{visual.cue&&<span className="power-preview-cue">{visual.cue}</span>}<span className="power-preview-footer"><img src="/icons/tlc-doodle-32.png" alt=""/><small>Movement card · photo needed</small></span></span>}
 </span>;
}
