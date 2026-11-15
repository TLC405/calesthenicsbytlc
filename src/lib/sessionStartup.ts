/** A slow session refresh must not lock local training behind an endless spinner. */
interface SessionSource<T>{
 onAuthStateChange:(callback:(event:string,session:T|null)=>void)=>{data:{subscription:{unsubscribe:()=>void}}};
 getSession:()=>Promise<{data:{session:T|null}}>;
}
export function watchInitialSession<T>(auth:SessionSource<T>,onSession:(session:T|null)=>void,unblock:()=>void,waitMs=4500){
 let active=true,events=0;
 const finish=()=>{if(active){clearTimeout(deadline);unblock();}};
 const deadline=setTimeout(finish,waitMs);
 const {data:{subscription}}=auth.onAuthStateChange((_event,session)=>{
  if(!active)return;
  events++;onSession(session);finish();
 });
 void Promise.resolve().then(()=>auth.getSession()).then(({data})=>{
  // A sign-out or token refresh is more recent than this initial read.
  if(active&&events===0)onSession(data.session);
  finish();
 }).catch(finish);
 return()=>{active=false;clearTimeout(deadline);subscription.unsubscribe();};
}
