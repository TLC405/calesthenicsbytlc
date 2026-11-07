import { useEffect, useMemo, useState } from 'react';
import { movementThumbnailSources, type ThumbnailExercise } from '@/lib/movementThumbnails';
export function MovementThumbnail({exercise,className=''}:{exercise:ThumbnailExercise;className?:string}){
 const sources=useMemo(()=>movementThumbnailSources({slug:exercise.slug,name:exercise.name,image_url:exercise.image_url,youtube_url:exercise.youtube_url}),[exercise.slug,exercise.name,exercise.image_url,exercise.youtube_url]);
 const [index,setIndex]=useState(0);
 useEffect(()=>setIndex(0),[sources]);
 const source=sources[index];
 return <span className={`power-movement-thumbnail ${className}`} title={source?`${source.title}${source.scope==='guide'?' · related lesson':source.scope==='category'?' · category picture':''}`:`${exercise.name} · image not sourced`}>
  {source?<><img key={source.src} src={source.src} alt={source.scope==='category'?`${exercise.name} · ${source.title}`:source.scope==='guide'?`${exercise.name} · related coaching preview: ${source.title}`:`${exercise.name} · ${source.label.toLowerCase()} preview`} loading="lazy" decoding="async" onError={()=>setIndex(value=>value+1)} onLoad={event=>{if(source.scope!=='photo'&&(event.currentTarget.naturalWidth<=120||event.currentTarget.naturalHeight<=90))setIndex(value=>value+1);}}/><span className="power-thumbnail-label">{source.label}</span></>:<span className="power-thumbnail-empty" role="img" aria-label={`${exercise.name}: image not sourced`}><strong>{exercise.name.split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase()}</strong><small>No image</small></span>}
 </span>;
}
