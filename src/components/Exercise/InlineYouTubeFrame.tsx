import { useEffect, useRef, useState } from 'react';
import { recordPlayback } from '@/lib/mediaAudit';

import { loadYouTubeApi } from '@/lib/youtubeApi';
type Player={destroy:()=>void;getIframe:()=>HTMLIFrameElement;getVideoData?:()=>{video_id?:string}};
function errorLabel(code:number){return code===100?'The source is unavailable or private.':code===101||code===150?'The creator does not allow embedded playback.':code===153?'YouTube could not validate this embedded player.':'The video could not play here.';}

/** Only the provider PLAYING event records successful playback; loading an iframe never does. */
export function InlineYouTubeFrame({videoId,playlistId,title,startSec=0,autoplay=false}:{videoId?:string;playlistId?:string;title:string;startSec?:number;autoplay?:boolean}){
 const host=useRef<HTMLDivElement>(null);const [error,setError]=useState('');const [attempt,setAttempt]=useState(0);const [ready,setReady]=useState(false);const [hint,setHint]=useState('');
 useEffect(()=>{
  let active=true;let player:Player|undefined;let waiting:number|undefined;setError('');setReady(false);setHint('');
  const timeout=window.setTimeout(()=>{if(active)setError('The player is taking too long to load. Retry when your connection is ready.');},20000);
  const evidence=(state:'loaded'|'played'|'error',code?:number)=>{const id=player?.getVideoData?.().video_id||videoId;if(id&&/^[A-Za-z0-9_-]{11}$/.test(id))recordPlayback({videoId:id,at:new Date().toISOString(),state,...(code?{code}:{})});};
  void loadYouTubeApi().then(api=>{
   if(!active||!host.current)return;
   const mount=document.createElement('div');host.current.replaceChildren(mount);
   player=new api.Player(mount,{host:'https://www.youtube-nocookie.com',videoId,width:'100%',height:'100%',playerVars:{playsinline:1,rel:0,origin:window.location.origin,start:startSec,autoplay:autoplay?1:0,...(playlistId?{listType:'playlist',list:playlistId}:{})},events:{
    onReady:()=>{if(active){window.clearTimeout(timeout);setReady(true);setError('');evidence('loaded');waiting=window.setTimeout(()=>{if(active)setHint('Playback has not started. Tap Play inside the video, or retry if it stays blank.');},15000);const frame=player?.getIframe();if(frame){frame.title=title;frame.referrerPolicy='strict-origin-when-cross-origin';frame.setAttribute('allow','autoplay; encrypted-media; fullscreen; picture-in-picture');}}},
    onStateChange:(event:{data:number})=>{if(active&&event.data===1){window.clearTimeout(waiting);setHint('');setError('');evidence('played');}},
    onAutoplayBlocked:()=>{if(active)setHint('Tap Play inside the video. This browser requires another gesture.');},
    onError:(event:{data:number})=>{if(active){window.clearTimeout(timeout);setError(errorLabel(event.data));evidence('error',event.data);}},
   }});
  }).catch(()=>{if(active){window.clearTimeout(timeout);setError('The player library could not load. Retry to check your connection.');}});
  return()=>{active=false;window.clearTimeout(timeout);window.clearTimeout(waiting);try{player?.destroy();}catch{/* Provider may already have removed the iframe. */}};
 },[videoId,playlistId,title,startSec,autoplay,attempt]);
 return <div className="relative"><div ref={host} className="power-embedded-stage bg-black" aria-label={`${title} embedded player`}/>{!ready&&!error&&<p className="text-xs p-2 text-muted-foreground" role="status">Loading embedded player…</p>}{(error||hint)&&<div className="border-t p-3 text-xs space-y-2" role="status"><p>{error||hint}</p>{error&&<p className="text-muted-foreground">Keep using the movement cues, or choose another exercise.</p>}<button className="power-assessment-action w-full" type="button" onClick={()=>setAttempt(x=>x+1)}>Retry embedded video</button></div>}</div>;
}
