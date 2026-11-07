import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Target } from 'lucide-react';
import { ASSESSMENT_QUESTIONS, assessStartingLevel, type AssessmentAnswers } from '@/lib/trainingAssessment';
import { CAPABILITIES, TRAINING_LEVELS } from '@/lib/trainingPolicy';
import { readTrainingProfile, writeTrainingProfile } from '@/lib/skillGraph';

export default function LevelAssessment(){
  const [answers,setAnswers]=useState<AssessmentAnswers>({});
  const [step,setStep]=useState(0);const heading=useRef<HTMLHeadingElement>(null);
  const [params]=useSearchParams();const navigate=useNavigate();
  const requested=params.get('return')||'/skills';
  const back=/^\/(skills(?:\/[^?#]*)?|build|ai-lab|workout|more)(?:[?#]|$)/.test(requested)?requested:'/skills';
  const question=ASSESSMENT_QUESTIONS[step];const result=assessStartingLevel(answers);
  useEffect(()=>{heading.current?.focus();},[step]);
  function apply(){
    writeTrainingProfile({...readTrainingProfile(),tier:result.tier,capabilities:result.capabilities,safeExit:result.safeExit});
    localStorage.setItem('power-starting-assessment-v1',JSON.stringify({version:1,at:new Date().toISOString(),answers,tier:result.tier}));
    navigate(back);
  }
  return <main className="power-simple-page power-assessment"><Link className="inline-flex gap-2 items-center min-h-12 text-sm" to={back}><ArrowLeft size={17}/> Back to training</Link>
    <header className="power-simple-heading mt-4"><div><p className="power-simple-eyebrow"><Target size={16}/> POWER / STARTING POINT</p><h1 ref={heading} tabIndex={-1}>{question?'Find your starting level.':'Your starting point.'}</h1><p>Answer from recent practice. Choose the easier option when unsure.</p></div></header>
    {question?<section className="power-elevated p-4 sm:p-6 space-y-4" aria-label="Starting-level assessment">
      <p className="text-xs text-primary">Question {step+1} of {ASSESSMENT_QUESTIONS.length}</p><div className="h-1.5 rounded-full bg-secondary overflow-hidden" role="progressbar" aria-label="Assessment progress" aria-valuenow={step+1} aria-valuemin={0} aria-valuemax={ASSESSMENT_QUESTIONS.length}><div className="h-full bg-primary" style={{width:`${(step+1)/ASSESSMENT_QUESTIONS.length*100}%`}}/></div>
      <h2 className="text-xl font-bold leading-snug">{question.title}</h2><p className="text-sm text-muted-foreground">{question.note}</p>
      <div className="grid gap-3" role="group" aria-label={question.title}>{question.options.map((option,index)=><button key={option} type="button" aria-pressed={answers[question.id]===index} className={`power-assessment-option ${answers[question.id]===index?'is-selected':''}`} onClick={()=>setAnswers({...answers,[question.id]:index})}><span>{option}</span>{answers[question.id]===index&&<Check size={20} aria-hidden="true"/>}</button>)}</div>
      <div className="grid grid-cols-2 gap-3 pt-2"><button type="button" className="power-assessment-action" disabled={step===0} onClick={()=>setStep(step-1)}>Previous</button><button type="button" className="power-assessment-action is-primary" disabled={answers[question.id]===undefined} onClick={()=>setStep(step+1)}>{step===ASSESSMENT_QUESTIONS.length-1?'See my result':'Continue'}<ArrowRight size={17}/></button></div>
    </section>:<section className="power-elevated p-5 sm:p-7 space-y-4" aria-label="Assessment result"><p className="text-xs uppercase tracking-widest text-primary">Suggested working level</p><h2 className="font-bold text-3xl">{TRAINING_LEVELS[result.tier-1].label}</h2><p className="text-sm text-muted-foreground">{TRAINING_LEVELS[result.tier-1].note}. Each advanced movement still has its own readiness checks.</p><div className="rounded-xl border p-3"><p className="font-bold text-sm">Practice next</p><p className="text-sm mt-1">{result.nextFocus}</p></div><p className="text-xs text-muted-foreground">Reported strengths: {result.strengths.length?result.strengths.map(id=>CAPABILITIES.find(c=>c.id===id)?.label).join(' · '):'Start with supported foundations.'}</p><p className="text-xs text-muted-foreground">This is a training suggestion from your answers, not a form or medical assessment. Advanced levels need individual skill evidence. Nothing is recorded as a completed exercise.</p><button className="power-assessment-action is-primary w-full" type="button" onClick={apply}>Use this starting level <Check size={18}/></button><button className="power-assessment-action w-full" type="button" onClick={()=>setStep(0)}>Review my answers</button></section>}
  </main>;
}
