import { MovementThumbnail } from '@/components/Exercise/MovementThumbnail';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/providers/AuthProvider';
import { askCoach } from '@/lib/coachClient';
import { matchCoachGoal } from '@/lib/coachGrounding';
import { readTrainingProfile } from '@/lib/skillGraph';
import { buildSkillWorkout } from '@/lib/skillWorkoutBuilder';
import type { CoachTurn } from '@/lib/coachConversation';
import type { SkillExercise } from '@/lib/skillWorkoutBuilder';

type Message=CoachTurn&{source?:string;exercises?:SkillExercise[]};
interface Props {open:boolean;onOpenChange:(value:boolean)=>void;workoutSlugs:string[];onAdd:(exercises:SkillExercise[])=>void;}
export function WorkoutCoach({open,onOpenChange,workoutSlugs,onAdd}:Props){
 const {user}=useAuth();const mobile=useIsMobile(800);
 const [messages,setMessages]=useState<Message[]>([]);const [query,setQuery]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const end=useRef<HTMLDivElement>(null);const owner=user?.id;
 useEffect(()=>{setMessages([]);setError('');},[owner]);
 useEffect(()=>{end.current?.scrollIntoView({block:'nearest'});},[messages.length,busy]);
 async function send(text:string){
  const prompt=text.trim();if(!prompt||busy)return;
  const history=messages.map(({role,content})=>({role,content}));
  setMessages(old=>[...old,{role:'user',content:prompt}]);setQuery('');setError('');setBusy(true);
  try{
   if(user){
    const result=await askCoach(prompt,user.id,{history,workoutSlugs});
    setMessages(old=>[...old,{role:'assistant',content:result.message,source:'AI coach',exercises:result.exercises}]);
   }else{
    const profile=readTrainingProfile();const goal=matchCoachGoal(prompt);const tier=profile.tier||1;
    const plan=buildSkillWorkout(goal,tier>=4?'advanced':tier>=3?'building':'foundation',25,profile);
    const exercises=plan.filter(i=>i.phase==='skill'||i.phase==='support').map(i=>i.exercise).filter(e=>!workoutSlugs.includes(e.slug)).slice(0,5);
    setMessages(old=>[...old,{role:'assistant',source:'Local progression planner',content:`Here are level-appropriate suggestions from the matching progression at L${tier}. Review the movements below before adding them. Sign in for AI conversation and follow-up coaching.`,exercises}]);
   }
  }catch(e){setError(e instanceof Error?e.message:'Coach could not connect.');setQuery(prompt);}
  finally{setBusy(false);}
 }
 return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side={mobile?'bottom':'right'} className={`power-coach-sheet flex flex-col gap-0 p-0 ${mobile?'h-[88dvh] rounded-t-2xl':'w-[420px] max-w-[calc(100vw-1rem)] sm:max-w-[420px]'}`}>
  <header className="border-b px-4 pt-5 pb-4 pr-12"><SheetTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/>Workout coach</SheetTitle><SheetDescription className="text-xs mt-2">Plan together, then add the movements you choose.</SheetDescription>{!user&&<Link className="inline-flex items-center min-h-11 mt-1 text-xs text-primary font-bold underline" to="/admin-login?return=workout">Sign in for AI chat</Link>}</header>
  <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4" role="log" aria-label="Workout coach conversation" aria-live="polite">
   {!messages.length&&<div className="space-y-4"><p className="text-sm leading-relaxed">Tell me your goal, available equipment and what you want to work on. Your level and readiness apply to every suggestion.</p><div className="flex flex-col gap-2">{['Planche straight-arm strength','Pike and Stalder compression','Gentle yoga practice','Ballet barre foundations'].map(text=><button type="button" className="min-h-12 text-left rounded-xl border px-3 py-2 text-xs" key={text} onClick={()=>setQuery(text)}>{text}</button>)}</div><p className="text-xs text-muted-foreground">{user?'AI uses your current level, recent training metrics and selected exercises.':'The local planner works without an account. AI chat requires sign-in.'}</p></div>}
   {messages.map((message,i)=><article key={i} className={`rounded-2xl p-3 text-sm leading-relaxed ${message.role==='user'?'ml-6 bg-primary text-primary-foreground':'border bg-card'}`}><p className="text-[10px] uppercase tracking-wider mb-2 opacity-70">{message.role==='user'?'You':message.source}</p><p className="whitespace-pre-wrap break-words">{message.content}</p>{message.exercises?.length>0&&<div className="mt-3 space-y-2">{message.exercises.map(e=><div className="flex gap-2 items-center justify-between border-t pt-2" key={e.slug}><MovementThumbnail exercise={e} className="is-small"/><span className="text-xs flex-1 min-w-0">{e.name}</span><Button size="sm" variant="outline" className="shrink-0 h-11 px-3" disabled={workoutSlugs.includes(e.slug)} onClick={()=>onAdd([e])} aria-label={`Add ${e.name} to workout`}>{workoutSlugs.includes(e.slug)?'Added':<><Plus size={14} className="mr-1"/>Add</>}</Button></div>)}<Button variant="outline" className="w-full min-h-12 mt-3" disabled={message.exercises.every(e=>workoutSlugs.includes(e.slug))} onClick={()=>onAdd(message.exercises||[])}>Add suggested movements</Button></div>}</article>)}
   {busy&&<p className="flex items-center gap-2 text-xs"><Loader2 size={16} className="animate-spin"/>Coach is thinking…</p>}<div ref={end}/>
  </div>
  <form className="border-t bg-background p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] shrink-0" onSubmit={e=>{e.preventDefault();void send(query);}}>{error&&<p role="alert" className="text-xs text-destructive mb-2">{error}</p>}<label className="sr-only" htmlFor="workout-coach-message">Message workout coach</label><div className="flex items-end gap-2"><textarea id="workout-coach-message" rows={2} maxLength={1000} value={query} onChange={e=>setQuery(e.target.value)} placeholder="What would you like to work on?" className="min-w-0 flex-1 resize-none rounded-xl border bg-card p-3 text-base"/><Button type="submit" disabled={busy||!query.trim()} className="h-12 w-12 shrink-0" aria-label="Send message to workout coach"><Send size={18}/></Button></div></form>
 </SheetContent></Sheet>;
}
