import { Component, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

/** A client render failure must never leave Skills, Client Portal, or the app white.
 * An error resets on route changes; diagnostic output stays in developer console.
 */
class RouteFailureBoundary extends Component<{children:ReactNode},{failed:boolean}> {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(error:Error,info:{componentStack:string}){
  console.error('[TLC screen recovery]',error,info.componentStack);
  if(window.TLCBoot?.isChunkError(error))void window.TLCBoot.repair();
 }
 render(){
  if(!this.state.failed)return this.props.children;
  return <main className="power-simple-page tlc-screen-recovery" role="alert">
   <div className="tlc-screen-recovery__inner">
    <AlertCircle size={28}/>
    <h1>This screen didn't load correctly.</h1>
    <p>Your saved workouts and skill results have not been cleared. Try opening the Skill Tree again, or browse the exercise library.</p>
    <div className="tlc-screen-recovery__actions">
      <button type="button" onClick={()=>window.location.reload()}><RefreshCw size={17}/> Retry this screen</button>
      <Link to="/skills?view=paths">Browse skill paths <ArrowRight size={17}/></Link>
      <Link to="/library">Open exercise library <ArrowRight size={17}/></Link>
    </div>
   </div>
  </main>;
 }
}
export function RouteGuard({children}:{children:ReactNode}){
 const location=useLocation();
 return <RouteFailureBoundary key={location.pathname}>{children}</RouteFailureBoundary>;
}
