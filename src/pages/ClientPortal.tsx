import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Activity, ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronRight,
  ClipboardCheck, Download, Dumbbell, FileCheck2, HeartPulse, LockKeyhole,
  LogIn, LogOut, RefreshCcw, ShieldCheck, Share2, Sparkles, Target, UserRound,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { ASSESSMENT_QUESTIONS, assessStartingLevel, type AssessmentAnswers } from '@/lib/trainingAssessment';
import { getSkillPath } from '@/data/skillPaths';
import { exerciseBySlug, nodeDose } from '@/lib/skillGraph';
import { readSkillChecks, saveSkillCheck, suggestedSkillStep, type SkillCheck } from '@/lib/skillCheck';
import {
  readClientPortal, writeClientPortal, exportClientPortalData,
  type ClientGoal, type ClientExperience, type ClientPortalData, type ClientTestHistoryItem,
} from '@/lib/clientPortal';

type Tab='overview'|'test'|'results';
type TestMode='starter'|'skill';
const GOALS:{value:ClientGoal;label:string}[]=[
  {value:'calisthenics',label:'Master calisthenics skills'},
  {value:'strength',label:'Build strength'},
  {value:'balance',label:'Improve balance & control'},
  {value:'mobility',label:'Move with more mobility'},
  {value:'general',label:'Build a general foundation'},
];
const EXPERIENCE:{value:ClientExperience;label:string}[]=[
  {value:'new',label:'New to this style of training'},
  {value:'building',label:'Building consistency'},
  {value:'experienced',label:'Experienced with bodyweight skills'},
];
const FEATURED_IDS=['foundation','handstand','planche','pull-up','front-lever','back-lever','human-flag','pistol','l-sit','pike-compression','straddle-press','ring-muscle-up','grip','posterior-chain','splits'];
const PATHS=FEATURED_IDS.map(id=>getSkillPath(id)).filter((p):p is NonNullable<typeof p>=>Boolean(p&&p.slugs.length));
const tabs:{key:Tab;label:string;icon:typeof ClipboardCheck;detail:string}[]=[
  {key:'overview',label:'Home',icon:UserRound,detail:'Your starting point'},
  {key:'test',label:'Test',icon:ClipboardCheck,detail:'Find your level'},
  {key:'results',label:'Results',icon:Activity,detail:'Review your progress'},
];

function dateLabel(at:string){return Number.isFinite(Date.parse(at))?new Date(at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'Unknown date'}
function NumberMetric({value,label,note}:{value:string|number;label:string;note:string}){
  return <div className="tlc-client-metric"><strong>{value}</strong><span>{label}</span><small>{note}</small></div>;
}
function ClientAccess({onSignedIn}:{onSignedIn:()=>void}){
  const {user,loading,signIn,signUp,signOut}=useAuth();
  const [showForm,setShowForm]=useState(false);
  const [newAccount,setNewAccount]=useState(false);
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [displayName,setDisplayName]=useState('');
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState('');
  useEffect(()=>{if(user){setShowForm(false);setPassword('');onSignedIn();}},[user?.id]);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setStatus('');
    try{
      const {error}=newAccount
        ? await signUp(email.trim(),password,displayName.trim(),'/client/test')
        : await signIn(email.trim(),password);
      if(error){setStatus(error.message||'Account access could not be completed.');return;}
      setStatus(newAccount?'Account request sent. Check your email for a confirmation link if required.':'Signed in to your existing account.');
      if(!newAccount){setShowForm(false);setPassword('');onSignedIn();}
    }catch(e){setStatus(e instanceof Error?e.message:'Unable to connect to account sign-in.');}
    finally{setBusy(false);}
  }
  if(loading)return <div className="tlc-client-access"><LockKeyhole size={18}/> Checking account session…</div>;
  if(user)return <section className="tlc-client-access" aria-label="Signed-in client account">
    <span className="tlc-client-access__icon"><ShieldCheck size={21}/></span>
    <div><strong>Signed-in training account</strong><p>{user.email||'Your account'} · Your client reports in this beta remain stored on this device.</p></div>
    <button type="button" onClick={()=>{void signOut();setStatus('');}} className="tlc-client-quiet"><LogOut size={15}/>Sign out</button>
  </section>;
  return <section className="tlc-client-access" aria-label="Client account access">
    <span className="tlc-client-access__icon"><LockKeyhole size={21}/></span>
    <div><strong>Client preview</strong><p>Try the portal without an account. Guest test entries last only for this browser tab/session and are not shared with a coach.</p></div>
    <button type="button" onClick={()=>setShowForm(v=>!v)} aria-expanded={showForm} className="tlc-client-quiet"><LogIn size={16}/>{showForm?'Close':'Account sign-in'}</button>
    {showForm&&<div className="tlc-client-access__form">
      <div className="tlc-client-switch" role="group" aria-label="Client account access mode">
        <button type="button" aria-pressed={!newAccount} onClick={()=>{setNewAccount(false);setStatus('');}}>Sign in</button>
        <button type="button" aria-pressed={newAccount} onClick={()=>{setNewAccount(true);setStatus('');}}>Create account</button>
      </div>
      <form onSubmit={submit}>
        {newAccount&&<label>Name (optional)<input maxLength={60} value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Your first name"/></label>}
        <label>Email<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="client@example.com"/></label>
        <label>Password<input type="password" required minLength={6} autoComplete={newAccount?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters"/></label>
        <button disabled={busy} type="submit" className="tlc-client-cta">{busy?'Checking…':newAccount?'Create client account':'Sign in'}<ArrowRight size={16}/></button>
        <p className="tlc-client-fineprint">Accounts use the app's existing authentication service. This beta does not yet sync client test reports to the coach or another device.</p>
        {status&&<p role="status" className="tlc-client-message">{status}</p>}
      </form>
    </div>}
  </section>;
}

export default function ClientPortal(){
  const {tab:rawTab}=useParams<{tab?:string}>();
  const activeTab:Tab=rawTab==='test'||rawTab==='results'?rawTab:'overview';
  const {user}=useAuth();
  const owner=user?.id||'guest';
  const [data,setData]=useState<ClientPortalData>(()=>readClientPortal(owner));
  const [notice,setNotice]=useState('');
  const [testMode,setTestMode]=useState<TestMode>('starter');
  const [questionIndex,setQuestionIndex]=useState(0);
  const [answers,setAnswers]=useState<AssessmentAnswers>({});
  const [draftName,setDraftName]=useState('');
  const [draftGoal,setDraftGoal]=useState<ClientGoal>('calisthenics');
  const [draftExperience,setDraftExperience]=useState<ClientExperience>('new');
  const [pathId,setPathId]=useState(PATHS[0]?.id||'planche');
  const [slug,setSlug]=useState('');
  const [value,setValue]=useState('');
  const [quality,setQuality]=useState(0);
  const [assistance,setAssistance]=useState<SkillCheck['assistance']>('none');
  const [comfortable,setComfortable]=useState(false);
  const [untested,setUntested]=useState(false);
  const [skillChecks,setSkillChecks]=useState<Record<string,SkillCheck>>(()=>owner==='guest'?{}:readSkillChecks(owner));
  const path=getSkillPath(pathId)||PATHS[0];
  const selected=slug&&path.slugs.includes(slug)?slug:path.slugs[0];
  const dose=nodeDose(selected);
  const completedSkills=new Set(data.history.filter(x=>x.value!==null).map(x=>x.pathId)).size;
  const completedQuestions=ASSESSMENT_QUESTIONS.filter(q=>Number.isInteger(answers[q.id])).length;
  const currentQuestion=ASSESSMENT_QUESTIONS[questionIndex];
  const latestChecks=useMemo(()=>{
    const seen=new Set<string>();
    return data.history.filter(row=>{if(seen.has(row.pathId))return false;seen.add(row.pathId);return true;});
  },[data.history]);
  useEffect(()=>{
    const next=readClientPortal(owner);setData(next);setAnswers(next.baseline?.answers||{});
    setDraftName(next.profile?.displayName||'');setDraftGoal(next.profile?.goal||'calisthenics');
    setDraftExperience(next.profile?.experience||'new');
    setSkillChecks(owner==='guest'?{}:readSkillChecks(owner));
    setNotice('');
  },[owner]);
  useEffect(()=>{
    const prior=owner==='guest'?undefined:readSkillChecks(owner)[path.id];
    setSlug(prior?.slug&&path.slugs.includes(prior.slug)?prior.slug:path.slugs[0]);
    setValue('');setQuality(0);setComfortable(false);setUntested(false);setAssistance('none');
  },[path.id,owner]);
  function persist(next:ClientPortalData,message:string):boolean{
    if(!writeClientPortal(owner,next)){setNotice('Could not store this result in browser storage. Copy or export results and check browser privacy settings.');return false;}
    setData(next);setNotice(message);return true;
  }
  async function copyClientLink(){
    const link=window.location.origin+'/client/test';
    try{await navigator.clipboard.writeText(link);setNotice('Public client test link copied. Results do not automatically reach your coach.');}
    catch{setNotice('Copy this client test address: '+link);}
  }
  function saveProfile(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const next={...data,profile:{displayName:draftName.trim().slice(0,60),goal:draftGoal,experience:draftExperience,updatedAt:new Date().toISOString()}};
    persist(next,'Client preferences saved on this device.');
  }
  function saveStarter(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(completedQuestions!==ASSESSMENT_QUESTIONS.length){setNotice('Answer all seven questions, choosing “not sure” when appropriate.');return;}
    const result=assessStartingLevel(answers);
    const tier=Math.min(3,Math.max(1,result.tier)) as 1|2|3;
    persist({...data,baseline:{answers,tier,nextFocus:result.nextFocus,at:new Date().toISOString()}},'Starter check recorded. This is a self-reported starting suggestion, not a clearance for advanced skills.');
  }
  function saveSkill(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const amount=Number(value);
    if(!untested&&(!value.trim()||!Number.isFinite(amount)||amount<=0||amount>999||quality<1||quality>5)){
      setNotice('Enter a positive controlled result and choose a technique score from 1–5, or mark the skill untested.');return;
    }
    const checkedAt=new Date().toISOString();
    const item:ClientTestHistoryItem={
      id:crypto.randomUUID(),at:checkedAt,pathId:path.id,movement:untested?'Not tested yet':exerciseBySlug.get(selected)?.name||selected,
      metric:dose.metric,value:untested?null:amount,quality:untested?0:quality,
      assistance:untested?'none':assistance,comfortable:untested?false:comfortable,
    };
    const next={...data,history:[item,...data.history].slice(0,150)};
    if(!persist(next,owner==='guest'?'Demo result recorded for this session only.':'Skill result saved on this browser.'))return;
    if(owner!=='guest'){
      const check:SkillCheck={
        pathId:path.id,slug:untested?null:selected,metric:dose.metric,value:untested?null:amount,
        quality:untested?0:quality,assistance:untested?'none':assistance,
        comfortable:untested?false:comfortable,at:checkedAt,
      };
      if(saveSkillCheck(owner,check))setSkillChecks(readSkillChecks(owner));
      else setNotice('Client report was saved, but it could not also update the existing Strength Test on this device.');
    }
    setValue('');setQuality(0);setUntested(false);setComfortable(false);
  }
  const current=skillChecks[path.id];
  const suggestion=current?suggestedSkillStep(path,current):null;
  const heading=activeTab==='overview'?'A better starting point.':activeTab==='test'?'Know your starting level.':'See what is improving.';
  return <main className="tlc-client-page min-h-screen pb-32">
    <div className="tlc-client-wrap">
      <div className="tlc-client-topline"><Link to="/" className="tlc-client-back"><ArrowLeft size={15}/>Back to Super Human Strength</Link><span>CLIENT PORTAL · PREVIEW</span></div>
      <header className="tlc-client-hero">
        <div className="tlc-client-hero__identity"><img src="/icons/tlc-doodle-180.png" width={72} height={72} alt="TLC sketch logo"/><span><strong>SPREAD TLC</strong><small>COACH TLC / CLIENT PERFORMANCE STUDIO</small></span></div>
        <div className="tlc-client-hero__copy"><span>PERSONAL BASELINE / COACHING TOOLS</span><h1>{heading}</h1><p>Understand where you are, test one movement at a time, and choose a progression you can actually control. No gamification. No preloaded workouts.</p></div>
        <div className="tlc-client-hero__trim"><span>TRUTH</span><span>LOVE</span><span>COMMUNITY</span></div>
      </header>
      <nav className="tlc-client-tabs" aria-label="Client portal tabs">
        {tabs.map(({key,label,icon:Icon,detail})=><Link key={key} to={key==='overview'?'/client':'/client/'+key}
          aria-current={activeTab===key?'page':undefined} className={activeTab===key?'is-active':''}>
          <Icon size={18}/><span><strong>{label}</strong><small>{detail}</small></span>
        </Link>)}
      </nav>
      <ClientAccess onSignedIn={()=>setNotice('Account connected. Assessment data from other devices is not yet synchronized.')}/>
      {notice&&<p className="tlc-client-notice" role="status">{notice}</p>}
      {activeTab==='overview'&&<>
        <section className="tlc-client-overview" aria-label="Client overview">
          <div className="tlc-client-panel tlc-client-welcome">
            <p className="tlc-client-eyebrow"><Sparkles size={15}/> START HERE</p>
            <h2>{data.profile?.displayName?'Welcome, '+data.profile.displayName+'.':'Welcome to your starting line.'}</h2>
            <p>Start with a gentle seven-question readiness check, then select the movement you want to measure. The system makes suggestions, not diagnoses or automatic level promotions.</p>
            <Link to="/client/test" className="tlc-client-cta">Open the Test tab <ArrowRight size={17}/></Link>
            <button type="button" onClick={()=>{void copyClientLink();}} className="tlc-client-secondary tlc-client-share"><Share2 size={16}/> Copy client test link</button>
          </div>
          <div className="tlc-client-panel">
            <h2>Client preferences</h2><p className="tlc-client-muted">Personalize your on-device portal without setting a fixed workout plan.</p>
            <form className="tlc-client-form" onSubmit={saveProfile}>
              <label>Name or nickname (optional)<input maxLength={60} value={draftName} onChange={e=>setDraftName(e.target.value)} placeholder="First name"/></label>
              <label>Primary focus<select value={draftGoal} onChange={e=>setDraftGoal(e.target.value as ClientGoal)}>{GOALS.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
              <label>Experience<select value={draftExperience} onChange={e=>setDraftExperience(e.target.value as ClientExperience)}>{EXPERIENCE.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
              <button type="submit" className="tlc-client-secondary"><Check size={16}/> Save preferences</button>
            </form>
          </div>
        </section>
        <section className="tlc-client-metrics" aria-label="Progress snapshot">
          <NumberMetric value={data.baseline?'Recorded':'—'} label="Starter baseline" note={data.baseline?dateLabel(data.baseline.at):'Ready when you are'}/>
          <NumberMetric value={completedSkills} label="Skills measured" note="One movement at a time"/>
          <NumberMetric value={data.history.length} label="Skill entries" note={owner==='guest'?'Session-only preview':'Saved in this browser'}/>
        </section>
        <section className="tlc-client-panel tlc-client-next">
          <h2>What happens after your test?</h2>
          <div className="tlc-client-steps">
            <div><span>01</span><strong>Measure</strong><p>Record a comfortable baseline without pushing to failure.</p></div>
            <div><span>02</span><strong>Understand</strong><p>See the stage, assistance and technique you reported.</p></div>
            <div><span>03</span><strong>Explore</strong><p>Open a related exercise with TLCtv instructions on the same page.</p></div>
          </div>
          <div className="tlc-client-actions"><Link to="/client/results">Review results <ArrowRight size={15}/></Link><Link to="/skills">Browse skills <ArrowRight size={15}/></Link></div>
        </section>
      </>}

      {activeTab==='test'&&<>
        <section className="tlc-client-panel tlc-client-test-head">
          <div><p className="tlc-client-eyebrow"><ClipboardCheck size={15}/> THE TEST STUDIO</p><h2>Choose a starting point</h2><p className="tlc-client-muted">Seven non-maximal questions or a measured exercise result. Both are self-reported.</p></div>
          <div role="group" className="tlc-client-mode-tabs" aria-label="Type of client test">
            <button type="button" aria-pressed={testMode==='starter'} onClick={()=>{setTestMode('starter');setNotice('');}}><HeartPulse size={16}/> Starter check</button>
            <button type="button" aria-pressed={testMode==='skill'} onClick={()=>{setTestMode('skill');setNotice('');}}><Dumbbell size={16}/> Skill test</button>
          </div>
        </section>
        {testMode==='starter'?<section className="tlc-client-panel tlc-client-assessment">
          <div className="tlc-client-section-title"><div><span>01 / READINESS BASELINE</span><h2>Seven questions, one starting point</h2></div><strong>{questionIndex+1}/{ASSESSMENT_QUESTIONS.length}</strong></div>
          <div className="tlc-client-progress" aria-label="Starter assessment steps"><span style={{width:((questionIndex+1)/ASSESSMENT_QUESTIONS.length*100)+'%'}}/></div>
          <p className="tlc-client-muted">Use what you've already done comfortably; do not perform difficult or inverted movements solely to fill in a test.</p>
          <form onSubmit={saveStarter} className="tlc-client-questions">
            <fieldset className="tlc-client-wizard-question">
              <legend><span>{String(questionIndex+1).padStart(2,'0')}</span>{currentQuestion.title}</legend>
              <p>{currentQuestion.note}</p>
              <div className="tlc-client-answer-grid">
                {currentQuestion.options.map((option,index)=><label key={index} className={answers[currentQuestion.id]===index?'is-checked':''}>
                  <input type="radio" name={'question-'+currentQuestion.id} value={index} checked={answers[currentQuestion.id]===index}
                    onChange={()=>setAnswers(old=>({...old,[currentQuestion.id]:index}))}/>
                  <span className="tlc-client-answer-check">{answers[currentQuestion.id]===index?<Check size={15}/>:null}</span>
                  <span>{option}</span>
                </label>)}
              </div>
            </fieldset>
            <div className="tlc-client-wizard-actions">
              <button type="button" className="tlc-client-secondary" disabled={questionIndex===0}
                onClick={()=>setQuestionIndex(x=>Math.max(0,x-1))}><ArrowLeft size={16}/> Previous</button>
              {questionIndex<ASSESSMENT_QUESTIONS.length-1
                ?<button type="button" className="tlc-client-cta" disabled={!Number.isInteger(answers[currentQuestion.id])}
                    onClick={()=>setQuestionIndex(x=>Math.min(ASSESSMENT_QUESTIONS.length-1,x+1))}>Next question <ArrowRight size={17}/></button>
                :<button className="tlc-client-cta" type="submit" disabled={completedQuestions!==ASSESSMENT_QUESTIONS.length}>
                  Save starter assessment <Check size={17}/>
                </button>}
            </div>
            <p className="tlc-client-muted">{completedQuestions} of {ASSESSMENT_QUESTIONS.length} answers completed · Choose “not sure” whenever necessary.</p>
          </form>
          {data.baseline&&<div className="tlc-client-assessment-result" role="status"><BadgeCheck size={20}/><div><strong>Starting range · Level {data.baseline.tier} of 5</strong><p>Focus suggestion: {data.baseline.nextFocus}. The questionnaire intentionally cannot assign advanced levels 4 or 5.</p><span>Recorded {dateLabel(data.baseline.at)}</span></div></div>}
        </section>:<section className="tlc-client-panel tlc-client-assessment">
          <div className="tlc-client-section-title"><div><span>02 / MOVEMENT BASELINE</span><h2>Test one skill at a time</h2></div><Target size={22}/></div>
          <p className="tlc-client-muted">Choose a variation you already control. Record your actual time or repetitions, assistance and form. This does not schedule a workout.</p>
          <form className="tlc-client-form" onSubmit={saveSkill}>
            <label>Choose a skill
              <select value={path.id} onChange={e=>setPathId(e.target.value)}>{PATHS.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select>
            </label>
            <div className="tlc-client-path-context"><span>{path.focus}</span><small>{path.slugs.length} variations available</small></div>
            <label className="tlc-client-checkline"><input type="checkbox" checked={untested} onChange={e=>setUntested(e.target.checked)}/> Not tested yet / not sure</label>
            {!untested&&<>
              <label>Hardest controlled variation
                <select value={selected} onChange={e=>{setSlug(e.target.value);setValue('');}}>
                  {path.slugs.map((s,i)=><option key={s} value={s}>{i+1}. {exerciseBySlug.get(s)?.name||s}</option>)}
                </select>
              </label>
              <div className="tlc-client-form-grid">
                <label>Best controlled {dose.metric==='seconds'?'hold · seconds':'repetitions'}
                  <input type="number" min="1" max="999" step="1" inputMode="numeric" value={value} onChange={e=>setValue(e.target.value)} placeholder={dose.metric==='seconds'?'e.g. 12':'e.g. 6'}/>
                </label>
                <label>Assistance used
                  <select value={assistance} onChange={e=>setAssistance(e.target.value as SkillCheck['assistance'])}>
                    <option value="none">Unassisted</option><option value="wall">Wall</option><option value="feet">Feet supported</option><option value="band">Band</option>
                  </select>
                </label>
              </div>
              <fieldset className="tlc-client-quality"><legend>Technique control</legend><p>1 = unstable · 3 = inconsistent · 5 = clean and repeatable</p>
                <div role="group" aria-label="Technique quality from 1 to 5">{[1,2,3,4,5].map(n=><button type="button" key={n} aria-pressed={quality===n} onClick={()=>setQuality(n)}>{n}</button>)}</div>
              </fieldset>
              <label className="tlc-client-checkline"><input type="checkbox" checked={comfortable} onChange={e=>setComfortable(e.target.checked)}/> No sharp joint pain; entered and exited safely</label>
            </>}
            <button type="submit" className="tlc-client-cta"><FileCheck2 size={17}/> Record this skill test</button>
          </form>
          {current&&<div className="tlc-client-assessment-result"><Activity size={18}/><div><strong>Latest connected strength check · {path.title}</strong><p>{current.slug?(exerciseBySlug.get(current.slug)?.name||current.slug)+' · '+(current.value??'—')+' '+current.metric:'No baseline yet'} · {dateLabel(current.at)}</p>{suggestion&&<span>{suggestion.label}: {suggestion.reason}</span>}</div></div>}
          <div className="tlc-client-actions"><Link to={'/skills/'+path.id}>Open progression and TLCtv <ArrowRight size={15}/></Link><Link to="/assessment">Advanced strength test <ArrowRight size={15}/></Link></div>
        </section>}
      </>}

      {activeTab==='results'&&<>
        <section className="tlc-client-panel tlc-client-results-head">
          <div><p className="tlc-client-eyebrow"><Activity size={16}/> PERSONAL PERFORMANCE</p><h2>Your assessment summary</h2><p className="tlc-client-muted">Review previous entries and retest the same skill to compare your results. No automatic advancement.</p></div>
          <button type="button" className="tlc-client-secondary" onClick={()=>exportClientPortalData(owner,data)}><Download size={16}/> Export report</button>
        </section>
        <section className="tlc-client-metrics" aria-label="Assessment summary">
          <NumberMetric value={data.baseline?'L'+data.baseline.tier:'—'} label="Starter range" note="Questionnaire estimate"/>
          <NumberMetric value={completedSkills} label="Skills measured" note="Latest skill baselines"/>
          <NumberMetric value={data.history.length} label="Total tests" note="Recorded in this portal"/>
        </section>
        {data.baseline&&<section className="tlc-client-panel tlc-client-results-base"><h2>Starter check</h2><p><strong>Suggested focus:</strong> {data.baseline.nextFocus}</p><small>Baseline L{data.baseline.tier} · {dateLabel(data.baseline.at)}</small></section>}
        <section className="tlc-client-panel">
          <div className="tlc-client-section-title"><div><span>RECENT ASSESSMENTS</span><h2>Skill test history</h2></div><span>{data.history.length} entries</span></div>
          {data.history.length===0?<div className="tlc-client-empty"><ClipboardCheck size={26}/><strong>No client skill tests yet</strong><p>Open Test to record a controlled movement baseline. You can use guest preview to explore without an account.</p><Link className="tlc-client-cta" to="/client/test">Take a skill test <ArrowRight size={16}/></Link></div>:<div className="tlc-client-history">
            {data.history.map(row=><article key={row.id}><span className="tlc-client-history__mark"><Activity size={17}/></span><div><strong>{getSkillPath(row.pathId)?.title||row.pathId}</strong><p>{row.movement}</p><small>{dateLabel(row.at)} · {row.assistance==='none'?'Unassisted':row.assistance+' assisted'}{row.value!==null?' · Form '+row.quality+'/5':''}</small></div><span className="tlc-client-history__value">{row.value===null?'—':row.value}<small>{row.value===null?'Not tested':row.metric==='seconds'?'sec':'reps'}</small></span></article>)}
          </div>}
          <div className="tlc-client-actions"><Link to="/client/test">Retest a skill <RefreshCcw size={15}/></Link><Link to="/skills">Explore the skill map <ArrowRight size={15}/></Link></div>
        </section>
        {latestChecks.length>0&&<p className="tlc-client-muted tlc-client-results-disclaimer">Latest measured skills: {latestChecks.map(x=>getSkillPath(x.pathId)?.title||x.pathId).slice(0,5).join(' · ')}. Measurements are client-reported, not independently verified by a coach.</p>}
      </>}


      <footer className="tlc-client-footer">
        <div><ShieldCheck size={17}/><span>{owner==='guest'?'Guest preview uses temporary session storage. Do not use a shared device for personal client records.':'Test records stay on this browser; coach review and cross-device cloud sync are not active yet.'}</span></div>
        <p>Physical tests are educational, not medical clearance. Stop for sharp pain, dizziness or loss of control. No training plans or appointments are automatically created.</p>
        <div className="tlc-client-footer__links"><Link to="/">Train app <ChevronRight size={13}/></Link><Link to="/program">Program <ChevronRight size={13}/></Link><Link to="/skills">Skill library <ChevronRight size={13}/></Link></div>
      </footer>
    </div>
  </main>;
}
