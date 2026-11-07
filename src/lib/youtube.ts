export function getYouTubeId(value?:string|null):string|null {
 if(!value)return null;
 try{const url=new URL(value);const host=url.hostname.toLowerCase().replace(/^www\./,'');let id:string|null=null;
  if(host==='youtu.be')id=url.pathname.split('/')[1];
  else if(['youtube.com','music.youtube.com','youtube-nocookie.com'].includes(host)){if(url.pathname==='/watch')id=url.searchParams.get('v');else if(/^\/(embed|shorts|live|v)\//.test(url.pathname))id=url.pathname.split('/')[2];}
  return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?id:null;
 }catch{return null;}
}
