import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, ClipboardCheck, Dumbbell, Layers3, MessageSquare, PlayCircle, ShieldCheck, Users } from 'lucide-react';
import '@/styles/simple-home.css';

const destinations=[
 {to:'/skills',icon:Layers3,title:'Explore skills',copy:'Handstands, planche, human flag, grip and mobility',tone:'skills'},
 {to:'/coach',icon:MessageSquare,title:'TLC AI Coach',copy:'Ask questions directly inside the app',tone:'coach'},
 {to:'/client',icon:Users,title:'Client Portal / Sign Up',copy:'Take your starting tests and review results',tone:'clients'},
] as const;

export default function SimpleHome(){
 return <main className="tlc-home-v8" aria-label="TLC Super Human Strength homepage">
  <section className="tlc-home-v8__hero">
   <div className="tlc-home-v8__kicker"><ShieldCheck size={16}/> TLC / SUPER HUMAN STRENGTH</div>
   <h1>Train with purpose.<br/><span>Own your progress.</span></h1>
   <p>Choose a skill, build your own workout, or ask for help. Nothing is added to your plan without your say.</p>
   <div className="tlc-home-v8__primary-actions">
     <Link className="tlc-home-v8__primary" to="/build"><Dumbbell size={21}/> Build my workout <ArrowRight size={19}/></Link>
     <Link className="tlc-home-v8__continue" to="/build?view=workout">Your workout <ArrowRight size={17}/></Link>
   </div>
  </section>
  <section aria-label="Choose where to go" className="tlc-home-v8__destinations">
    {destinations.map(({to,icon:Icon,title,copy,tone})=>
      <Link to={to} key={to} className={`tlc-home-v8__destination tone-${tone}`}>
        <span className="tlc-home-v8__icon"><Icon size={25}/></span>
        <span className="tlc-home-v8__destination-text"><strong>{title}</strong><small>{copy}</small></span>
        <ArrowRight aria-hidden="true" size={18}/>
      </Link>)}
  </section>
  <section className="tlc-home-v8__quick">
    <h2>More ways to train</h2>
    <div>
      <Link to="/assessment"><ClipboardCheck size={18}/> Skills test</Link>
      <Link to="/library"><BookOpen size={18}/> Exercise library</Link>
      <Link to="/videos"><PlayCircle size={18}/> TLCtv tutorials</Link>
      <Link to="/program"><CalendarDays size={18}/> Training plan</Link>
    </div>
  </section>
  <p className="tlc-home-v8__footer">Your workout drafts and skill progress are preserved. Suggestions are optional.</p>
 </main>;
}
