import { useEffect, useRef, useState } from 'react';
import { recordPlayback } from '@/lib/mediaAudit';

type Player={destroy:()=>void;getIframe:()=>HTMLIFrameElement};
type YouTubeApi={Player:new(element:HTMLElement,options:Record<string,unknown>)=>Player};
type ApiWindow=Window&{YT?:YouTubeApi;onYouTubeIframeAPIReady?:()=>void};
let apiPromise:Promise<YouTubeApi>|undefined;
function loadApi(){
 const target=window as ApiWindow;
 if(target.YT?.Player)return Promise.resolve(target.YT);
 if(!apiPromise)apiPromise=new Promise<YouTubeApi>((resolve,reject)=>{
  const prior=target.onYouTubeIframeAPIReady;
  const timeout=window.setTimeout(()=>{document.querySelector('script[data-power-youtube-api]')?.remove();apiPromise=undefined;reject(new Error('Player library did not load'));},12000);
  target.onYouTubeIframeAPIReady=()=>{prior?.();window.clearTimeout(timeout);if(target.YT)resolve(target.YT);else{apiPromise=undefined;reject(new Error('Player unavailable'));}};
  const existing=document.querySelector<HTMLScriptElement>('script[data-power-youtube-api]');
  if(!existing){const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;script.dataset.powerYoutubeApi='true';script.onerror=()=>{script.remove();window.clearTimeout(timeout);apiPromise=undefined;reject(new Error('Player library blocked'));};document.head.appendChild(script);}
 });
 return apiPromise;
}
function errorLabel(code:number){return code===100?'The source is unavailable or private.':code===101||code===150?'The creator does not allow embedded playback.':code===153?'YouTube could not validate this embedded player.':'The video could not play here.';}

/** Only the provider PLAYING event records successful playback; loading an iframe never does. */
export function InlineYouTubeFrame({videoId,title,startSec=0,autoplay=false}:{videoId:string;title:string;startSec?:number;autoplay?:boolean}){
 const host=useRef<HTMLDivElement>(null);const [error,setError]=useState('');const [attempt,setAttempt]=useState(0);const [ready,setReady]=useState(false);const [hint,setHint]=useState('');
 useEffect(()=>{
  let active=true;let player:Player|undefined;let waiting:number|undefined;setError('');setReady(false);setHint('');
  const timeout=window.setTimeout(()=>{if(active)setError('The player is taking too long to load. Retry when your connection is ready.');},20000);
  void loadApi().then(api=>{
   if(!active||!host.current)return;
   const mount=document.createElement('div');host.current.replaceChildren(mount);
   player=new api.Player(mount,{host:'https://www.youtube-nocookie.com',videoId,width:'100%',height:'100%',playerVars:{playsinline:1,rel:0,origin:window.location.origin,start:startSec,autoplay:autoplay?1:0},events:{
    onReady:()=>{if(active){window.clearTimeout(timeout);setReady(true);setError('');recordPlayback({videoId,at:new Date().toISOString(),state:'loaded'});waiting=window.setTimeout(()=>{if(active)setHint('Playback has not started. Tap Play inside the video, or retry if it stays blank.');},15000);const frame=player?.getIframe();if(frame){frame.title=title;frame.referrerPolicy='strict-origin-when-cross-origin';frame.setAttribute('allow','autoplay; encrypted-media; fullscreen; picture-in-picture');}}},
    onStateChange:(event:{data:number})=>{if(active&&event.data===1){window.clearTimeout(waiting);setHint('');setError('');recordPlayback({videoId,at:new Date().toISOString(),state:'played'});}},
    onAutoplayBlocked:()=>{if(active)setHint('Tap Play inside the video. This browser requires another gesture.');},
    onError:(event:{data:number})=>{if(active){window.clearTimeout(timeout);setError(errorLabel(event.data));recordPlayback({videoId,at:new Date().toISOString(),state:'error',code:event.data});}},
   }});
  }).catch(()=>{if(active){window.clearTimeout(timeout);setError('The player library could not load. Retry to check your connection.');}});
  return()=>{active=false;window.clearTimeout(timeout);window.clearTimeout(waiting);try{player?.destroy();}catch{/* Provider may already have removed the iframe. */}};
 },[videoId,title,startSec,autoplay,attempt]);
 return <div className="relative"><div ref={host} className="power-embedded-stage bg-black" aria-label={`${title} embedded player`}/>{!ready&&!error&&<p className="text-xs p-2 text-muted-foreground" role="status">Loading embedded player…</p>}{(error||hint)&&<div className="border-t p-3 text-xs space-y-2" role="status"><p>{error||hint}</p>{error&&<p className="text-muted-foreground">Keep using the movement cues, or choose another exercise.</p>}<button className="power-assessment-action w-full" type="button" onClick={()=>setAttempt(x=>x+1)}>Retry embedded video</button></div>}</div>;
}
