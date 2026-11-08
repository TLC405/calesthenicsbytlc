let pending:Promise<any>|undefined;
/** One loader shared by lessons, playlists and music. Reuses an already loaded provider API. */
export function loadYouTubeApi():Promise<any>{
 if(window.YT?.Player)return Promise.resolve(window.YT);
 if(pending)return pending;
 pending=new Promise((resolve,reject)=>{
  const previous=window.onYouTubeIframeAPIReady;
  const fail=()=>{pending=undefined;document.querySelector('script[data-power-youtube-api]')?.remove();reject(new Error('YouTube player could not load'));};
  const timeout=window.setTimeout(fail,12000);
  window.onYouTubeIframeAPIReady=()=>{try{previous?.();}catch{/* Another player callback must not block this loader. */}window.clearTimeout(timeout);if(window.YT?.Player)resolve(window.YT);else fail();};
  if(!document.querySelector('script[data-power-youtube-api]')){const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;script.dataset.powerYoutubeApi='true';script.onerror=()=>{window.clearTimeout(timeout);fail();};document.head.appendChild(script);}
 });
 return pending;
}
