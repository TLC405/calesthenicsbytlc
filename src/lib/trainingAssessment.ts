import { allowedAtLevel, minimumTier, type Capability, type TrainingTier } from './trainingPolicy';
import { nodeDose, nodeProgress, type SkillAttempt, type SkillTrainingProfile } from './skillGraph';

export const ASSESSMENT_QUESTIONS = [
  {id:'push',title:'Which push-up can you repeat with control?',note:'Use a recent comfortable result. No max-effort test is needed.',options:['Wall or supported only / not sure','Incline push-ups with a steady body line','At least 5 floor push-ups without losing your body line']},
  {id:'pull',title:'What pulling work can you control?',note:'Choose the easier answer if grip or shoulder control fades.',options:['Supported preparation / not sure','Controlled rows with feet supported','Controlled active hanging and at least 3 strict pull-ups']},
  {id:'support',title:'How is your straight-arm support?',note:'Keep shoulders active and breathe normally.',options:['I need my feet supported / not sure','A stable 15-second support or tall plank, repeated comfortably']},
  {id:'core',title:'Can you maintain a controlled body line?',note:'A tucked hollow position is fine. Keep breathing.',options:['I am still learning / not sure','A controlled 20-second hollow or tuck hold']},
  {id:'compression',title:'Which seated lift can you control?',note:'No bouncing, straining, or forced range.',options:['Bent knees or assistance / not sure','At least 5 straight-leg pike or straddle lifts']},
  {id:'straightArm',title:'Have you practiced a planche lean?',note:'This asks about existing practice, not an invitation to try it now.',options:['Not yet / not sure','Repeated comfortable 10-second leans with straight elbows and active shoulders']},
  {id:'inversion',title:'Can you safely enter and exit a handstand?',note:'Only confirm a skill you have already practiced.',options:['Not yet / not sure','Controlled wall entry, support, and exit','Controlled freestanding entry, balance, and exit']},
] as const;
export type AssessmentAnswers = Partial<Record<typeof ASSESSMENT_QUESTIONS[number]['id'], number>>;
export function assessStartingLevel(answers:AssessmentAnswers) {
  const score=(id:keyof AssessmentAnswers)=>{
    const question=ASSESSMENT_QUESTIONS.find(q=>q.id===id)!;
    const value=answers[id];
    return Number.isInteger(value)&&value!>=0&&value!<question.options.length?value!:0;
  };
  const capabilities:Capability[]=[];
  if(score('push')>=2)capabilities.push('push-base');
  if(score('pull')>=1)capabilities.push('pull-base');
  if(score('support')>=1)capabilities.push('support-base');
  if(score('compression')>=1)capabilities.push('compression-control');
  if(score('straightArm')>=1)capabilities.push('straight-arm-base');
  if(score('inversion')>=1)capabilities.push('inversion-control');
  let tier:TrainingTier=1;
  if(score('core')&&((score('push')>=1&&score('support'))||score('pull')>=1))tier=2;
  if(tier===2&&score('push')===2&&score('pull')>=1&&score('support')&&(score('compression')||score('straightArm')||score('inversion')))tier=3;
  return {tier,capabilities,safeExit:score('inversion')>=1,
    strengths:capabilities,
    nextFocus:score('core')===0?'Body line and breathing':score('support')===0?'Supported straight-arm control':score('compression')===0?'Bent-knee compression and active range':score('inversion')===0?'Supported overhead control and safe exits':'Repeat your current variations across several sessions'};
}

/** Product review benchmarks: questionnaire results never assign L4/L5. */
export function levelReview(profile:SkillTrainingProfile,attempts:SkillAttempt[],now=Date.now()) {
  const tier=profile.tier||1;
  const nextTier=Math.min(5,tier+1) as TrainingTier;
  const recent=attempts.filter(a=>{const at=Date.parse(a.at);return Number.isFinite(at)&&at<=now&&at>=now-60*86400000;}).sort((a,b)=>a.at.localeCompare(b.at));
  const slugs=[...new Set(recent.filter(a=>minimumTier(a.nodeId)===tier&&allowedAtLevel(a.nodeId,profile)).map(a=>a.nodeId))];
  const evidence=slugs.filter(slug=>{
    const dose=nodeDose(slug);
    const usable=recent.filter(a=>a.nodeId===slug&&a.metric===dose.metric&&a.target>=dose.target);
    return nodeProgress(slug,usable).consistent;
  });
  const qualifying=recent.filter(a=>evidence.includes(a.nodeId)&&a.quality>=4&&a.value>=a.target&&!a.discomfort);
  const sessions=new Set(qualifying.map(a=>a.sessionId)).size;
  const days=new Set(qualifying.map(a=>a.at.slice(0,10))).size;
  const recentConcern=recent.slice(-2).some(a=>a.discomfort||a.quality<3);
  const ready=tier<5&&evidence.length>=2&&sessions>=3&&days>=2&&!recentConcern;
  return {tier,nextTier,ready,evidence,sessions,days,recentConcern,
    remaining:tier===5?'Keep refining your individual skills.':recentConcern?'Review recent discomfort or technique loss before progressing.':evidence.length<2?'Build repeatable results in two movements at your current level.':sessions<3||days<2?'Repeat that control across at least 3 sessions on 2 different days.':'Your recent logs support reviewing the next level.'};
}
