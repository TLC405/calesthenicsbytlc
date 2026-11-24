import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, ClipboardCopy, Eraser, LockKeyhole, MessageSquare, Send, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { askCoach } from '@/lib/coachClient';
import { matchCoachGoal, localCoachReply } from '@/lib/coachGrounding';
import type { CoachTurn } from '@/lib/coachConversation';
import '@/styles/coach-chat.css';

type ChatRow=CoachTurn&{id:string;source:'ai'|'local'|'user';goalId?:string;at:string};
const starters=[
 'What is the safest beginner planche progression?',
 'Help me improve my false grip and one-arm hang.',
 'What makes frog stand different from crow pose?',
 'How do I progress toward a handstand press?',
];
function readHistory(owner:string):ChatRow[]{
 try{const data=JSON.parse(sessionStorage.getItem('tlc-coach-conversation-v1:'+owner)||'[]');
 return Array.isArray(data)?data.slice(-24).filter((item):item is ChatRow=>item&&typeof item.content==='string'&&item.content.length<4000&&['assistant','user'].includes(item.role)&&['ai','local','user'].includes(item.source)&&typeof item.id==='string'&&typeof item.at==='string'):[];
 }catch{return[]}
}
function makeRow(role:'assistant'|'user',content:string,source:ChatRow['source'],goalId?:string):ChatRow{
 return {id:crypto.randomUUID(),role,content,source,goalId,at:new Date().toISOString()};
}
export default function CoachChat(){
 const {user,loading,signIn,signUp}=useAuth();
 const owner=user?.id||'guest';
 const [rows,setRows]=useState<ChatRow[]>(()=>readHistory(owner));
 const [rowsOwner,setRowsOwner]=useState(owner);
 const [question,setQuestion]=useState('');
 const [includeHistory,setIncludeHistory]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [configured,setConfigured]=useState<boolean|null>(null);
 const [mode,setMode]=useState<'login'|'signup'>('login');
 const [email,setEmail]=useState(''),[password,setPassword]=useState('');
 const [authBusy,setAuthBusy]=useState(false),[authMessage,setAuthMessage]=useState('');
 const end=useRef<HTMLDivElement>(null);
 useEffect(()=>{setRowsOwner(owner);setRows(readHistory(owner));setError('');},[owner]);
 // Do not persist one user's messages into another account during an auth transition.
 useEffect(()=>{if(rowsOwner!==owner)return;try{sessionStorage.setItem('tlc-coach-conversation-v1:'+owner,JSON.stringify(rows.slice(-24)));}catch{}},[owner,rows,rowsOwner]);
 useEffect(()=>{end.current?.scrollIntoView({behavior:'smooth',block:'nearest'});},[rows.length,busy]);
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/api/discover-exercises',{cache:'no-store',signal:controller.signal}).then(async r=>{
    const data=await r.json();if(!r.ok)throw Error('Unavailable');setConfigured(data.configured===true);
  }).catch(()=>{if(!controller.signal.aborted)setConfigured(false)});
  return()=>controller.abort();
 },[]);
 const visibleRows=rowsOwner===owner?rows:[];
 const history=useMemo<CoachTurn[]>(()=>visibleRows.filter(r=>r.source==='ai'||r.source==='user').slice(-16).map(({role,content})=>({role,content})),[visibleRows]);
 async function ask(input:string){
  const text=input.trim();
  if(!text||busy||loading||text.length>1000)return;
  const prior=history;
  setRows(old=>[...old,makeRow('user',text,'user')]);
  setQuestion('');setBusy(true);setError('');
  try{
    if(!user||!configured){
      const goal=matchCoachGoal(text);
      const explanation=localCoachReply(text)+(user?'\n\nThe OpenAI service is currently unavailable; this answer uses the built-in skill catalog.':'\n\nSign in to your TLC account to try OpenAI replies when your project is authorized.');
      setRows(old=>[...old,makeRow('assistant',explanation,'local',goal)]);
      return;
    }
    const result=await askCoach(text,user.id,{history:prior,includeProgress:includeHistory});
    const msg=typeof result.message==='string'?result.message:'The coach did not return an explanation.';
    setRows(old=>[...old,makeRow('assistant',msg,'ai',result.goalId)]);
  }catch(e){
    setError(e instanceof Error?e.message:'The AI coaching request failed.');
    // Always provide clearly labelled local skill guidance rather than a blank chat.
    setRows(old=>[...old,makeRow('assistant',localCoachReply(text),'local',matchCoachGoal(text))]);
  }finally{setBusy(false)}
 }
 function onSubmit(event:FormEvent){event.preventDefault();void ask(question);}
 async function authorize(event:FormEvent){
  event.preventDefault();if(authBusy||!email.includes('@')||password.length<6)return;
  setAuthBusy(true);setAuthMessage('');
  try{
   const result=mode==='login'?await signIn(email.trim(),password):await signUp(email.trim(),password,'TLC Client','/coach');
   if(result.error)throw result.error;
   setAuthMessage(mode==='signup'?'Account requested. Check your email for a confirmation link if required; return to this Coach page after verification.':'Signed in. You can now ask the AI coach.');
   setPassword('');
  }catch(e){setAuthMessage(e instanceof Error?e.message:'Could not complete account sign-in.');}
  finally{setAuthBusy(false)}
 }
 async function copy(text:string){try{await navigator.clipboard.writeText(text);}catch{setError('Copy is unavailable in this browser.');}}
 const isLive=Boolean(user&&configured);
 return <main className="tlc-coach-page" aria-label="TLC AI Coach">
   <header className="tlc-coach-hero">
    <Link to="/" className="tlc-coach-back"><ArrowLeft size={16}/> Home</Link>
    <p className="tlc-coach-kicker"><Sparkles size={17}/> TLC / TRAINING INTELLIGENCE</p>
    <h1>Your AI strength coach.</h1>
    <p>Ask about form, progressions, grip, planche, balance and training. You decide what goes into a workout.</p>
    <div className="tlc-coach-connection"><span className={isLive?'is-connected':''}/>{loading?'Restoring your TLC session…':configured===null?'Checking AI connection…':!configured?'AI provider not connected':user?'TLC account signed in · AI access subject to provider authorization':'TLC AI provider configured · sign in to your TLC account'}</div>
   </header>
   <div className="tlc-coach-layout">
    <section className="tlc-coach-chat" aria-label="Coach conversation">
      <div className="tlc-coach-chat-top"><div><MessageSquare size={19}/><strong>Conversation</strong></div><button type="button" onClick={()=>{setRows([]);setError('');}}><Eraser size={16}/> Clear</button></div>
      <div className="tlc-coach-messages" role="log" aria-label="Conversation messages" aria-live="polite">
        {!visibleRows.length&&<div className="tlc-coach-welcome"><img src="/icons/tlc-doodle-180.png" width={62} height={62} alt="TLC logo"/><h2>What are you working on?</h2><p>Choose a question or write your own. There are no automatic workout changes.</p><div>{starters.map(text=><button type="button" key={text} onClick={()=>void ask(text)}>{text}<ArrowRight size={15}/></button>)}</div></div>}
        {visibleRows.map(row=><article key={row.id} className={'tlc-coach-message is-'+row.role}>
          <span className="tlc-coach-message-tag">{row.role==='user'?'YOU':row.source==='ai'?'TLC AI COACH · OPENAI':'LOCAL PREVIEW · NOT AI'}</span>
          <p>{row.content}</p>
          {row.role==='assistant'&&<div className="tlc-coach-message-actions"><button type="button" onClick={()=>void copy(row.content)}><ClipboardCopy size={14}/> Copy</button>{row.goalId&&<Link to={'/build?goal='+encodeURIComponent(row.goalId)}>Explore related training <ArrowRight size={14}/></Link>}</div>}
        </article>)}
        {busy&&<p className="tlc-coach-working" role="status">Preparing an evidence-informed response…</p>}
        <div ref={end}/>
      </div>
      {error&&<p className="tlc-coach-error" role="alert">{error}</p>}
      <form className="tlc-coach-compose" onSubmit={onSubmit}>
       <label htmlFor="tlc-coach-question">Ask TLC AI Coach</label>
       <textarea id="tlc-coach-question" rows={3} maxLength={1000} placeholder="Example: Why is my false grip slipping off the rings?" value={question} onChange={e=>setQuestion(e.target.value)}/>
       <div><span>{question.length}/1000</span><button type="submit" disabled={!question.trim()||busy||loading}><Send size={17}/>{user?'Send question':'Preview question'}</button></div>
      </form>
    </section>
    <aside className="tlc-coach-aside" aria-label="AI connection and data controls">
      <section>
        <h2><ShieldCheck size={18}/> Connection & privacy</h2>
        <p>AI replies are generated by a server-side OpenAI model through your TLC app, not by a connection to your personal ChatGPT conversations or Plus subscription.</p>
        <label className="tlc-coach-consent"><input type="checkbox" checked={includeHistory} onChange={e=>setIncludeHistory(e.target.checked)}/><span>Include up to 12 recent self-reported training attempts in my next question</span></label>
        <small>Your training level and selected equipment are shared with the coaching service for safety. Conversations are kept only in this browser tab; they are not saved to a coach dashboard.</small>
      </section>
      {loading&&<p role="status" className="tlc-coach-auth-message">Checking your saved TLC sign-in…</p>}
      {!user&&!loading&&<section className="tlc-coach-signin">
        <h2><LockKeyhole size={18}/> TLC account · stay signed in</h2><p>This is your TLC account, not a separate ChatGPT login. It stays signed in on this device unless you sign out or clear browser data.</p>
        <form onSubmit={authorize}>
         <label>Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
         <label>Password<input type="password" required minLength={6} autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)}/></label>
         <button type="submit" disabled={authBusy}>{authBusy?'Connecting…':mode==='login'?'Sign in to TLC':'Create TLC account'}<ArrowRight size={16}/></button>
        </form>
        <button className="tlc-coach-mode" type="button" onClick={()=>{setMode(v=>v==='login'?'signup':'login');setAuthMessage('')}}>{mode==='login'?'New client? Create an account':'Already registered? Sign in'}</button>
        {authMessage&&<p className="tlc-coach-auth-message" role="status">{authMessage}</p>}
      </section>}
      <section className="tlc-coach-links"><h2>Keep exploring</h2><Link to="/skills"><BookOpen size={17}/> Skills and progressions <ArrowRight size={15}/></Link><Link to="/client/test"><Check size={17}/> Test your starting level <ArrowRight size={15}/></Link><Link to="/build"><UserRound size={17}/> Your workout builder <ArrowRight size={15}/></Link></section>
    </aside>
   </div>
 </main>;
}
