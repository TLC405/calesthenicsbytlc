import { getYouTubeId } from './youtube';
export type EmbeddedSource =
 | {provider:'youtube';url:string;videoId?:string;playlistId?:string;startSeconds:number;kind:'Video'|'Video / live stream'|'Playlist'}
 | {provider:'instagram';url:string;embedUrl:string;kind:'Public Instagram post'};
export function parseEmbeddedMedia(value:string):EmbeddedSource|null{
 try{
  const url=new URL(value.trim());if(url.protocol!=='https:'||url.username||url.password||url.port)return null;
  const host=url.hostname.toLowerCase().replace(/^(www\.|m\.)/,'');
  if(['youtube.com','youtu.be','youtube-nocookie.com','music.youtube.com'].includes(host)){
   const videoId=getYouTubeId(url.href)||undefined;const list=url.searchParams.get('list');const playlistId=list&&/^[A-Za-z0-9_-]{6,180}$/.test(list)?list:undefined;
   if(!videoId&&!playlistId)return null;
   const raw=url.searchParams.get('start')||url.searchParams.get('t')||'';const parts=/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(raw);
   const seconds=/^\d+$/.test(raw)?Number(raw):parts?Number(parts[1]||0)*3600+Number(parts[2]||0)*60+Number(parts[3]||0):0;
   return {provider:'youtube',url:videoId?`https://www.youtube.com/watch?v=${videoId}${playlistId?'&list='+playlistId:''}`:`https://www.youtube.com/playlist?list=${playlistId}`,videoId,playlistId,startSeconds:Math.min(86400,seconds),kind:playlistId?'Playlist':url.pathname.startsWith('/live/')?'Video / live stream':'Video'};
  }
  if(host==='instagram.com'){
   const match=/^\/(p|reel|tv)\/([A-Za-z0-9_-]{5,80})\/?$/.exec(url.pathname);
   if(match)return {provider:'instagram',url:`https://www.instagram.com/${match[1]}/${match[2]}/`,embedUrl:`https://www.instagram.com/${match[1]}/${match[2]}/embed/`,kind:'Public Instagram post'};
  }
  return null;
 }catch{return null;}
}
