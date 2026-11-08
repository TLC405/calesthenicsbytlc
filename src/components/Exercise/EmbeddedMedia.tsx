import { useState } from 'react';
import { parseEmbeddedMedia } from '@/lib/embeddedMedia';
import { InlineYouTubeFrame } from './InlineYouTubeFrame';
export function EmbeddedMedia({url,title,autoPlay=false}:{url:string;title:string;autoPlay?:boolean}){
 const source=parseEmbeddedMedia(url);const [attempt,setAttempt]=useState(0);
 if(!source)return <p role="status" className="power-embed-note">Use a specific YouTube video, playlist or live-stream link, or a public Instagram post/reel. Profile and search pages cannot play here.</p>;
 if(source.provider==='youtube')return <InlineYouTubeFrame videoId={source.videoId} playlistId={source.playlistId} startSec={source.startSeconds} autoplay={autoPlay} title={title}/>;
 return <div className="power-instagram-embed"><iframe key={`${source.embedUrl}-${attempt}`} title={title} src={source.embedUrl} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" loading="lazy"/><p className="power-embed-note">Public Instagram embed. The creator must allow embedding; private or removed posts cannot play here.</p><button type="button" className="power-assessment-action" onClick={()=>setAttempt(v=>v+1)}>Reload this post</button></div>;
}
