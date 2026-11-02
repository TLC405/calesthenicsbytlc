import catalog from '@/data/publicExerciseCatalog.json';
import { SKILL_PATHS } from '@/data/skillPaths';

export type EdgeType = 'prerequisite' | 'supports' | 'mobility_dependency' | 'alternative';
export type SkillEdge = { from: string; to: string; type: EdgeType; hardGate: boolean };
export type SkillAttempt = {
  id: string; nodeId: string; sessionId: string; at: string;
  metric: 'reps' | 'seconds'; value: number; target: number; quality: number;
  leanCm?: number; assistanceKg?: number; negativeSeconds?: number; clearanceCm?: number;
  assistance?: 'none' | 'feet' | 'wall' | 'band'; rom?: 'partial' | 'full';
  elbowLocked?: boolean; scapularControl?: boolean; discomfort?: string;
};
export type TrainingEquipment = 'floor' | 'wall' | 'rings' | 'bar' | 'parallettes' | 'bands';
export type SkillTrainingProfile = { equipment: TrainingEquipment[]; safeExit: boolean };
export interface SkillProgressAdapter {
  read(owner: string): SkillAttempt[];
  write(owner: string, attempts: SkillAttempt[]): void;
}
const key = (owner: string) => `power-skill-attempts-v1:${owner}`;
const known = new Set(catalog.map(e => e.slug));
export const exerciseBySlug = new Map(catalog.map(e => [e.slug,e]));
export const skillEdges: SkillEdge[] = [];
for (const path of SKILL_PATHS) {
  for (let i=1;i<path.slugs.length;i++) skillEdges.push({from:path.slugs[i-1],to:path.slugs[i],type:path.id==='hspu'&&i<3?'supports':'prerequisite',hardGate:false});
}
const cross: [string,string,EdgeType][] = [
  ['wrist-circles','planche-lean','supports'],['wrist-circles','wall-handstand','supports'],
  ['scapular-pull-up','ring-row','supports'],['hollow-body-hold','tuck-planche','supports'],
  ['seated-straddle-compression-lift','straddle-press-to-hs','prerequisite'],
  ['handstand-bail','freestanding-handstand','prerequisite'],
  ['chest-to-wall-handstand-hold','straddle-press-to-hs','prerequisite'],
  ['ring-support-hold','ring-muscle-up','prerequisite'],['ring-dip','ring-muscle-up','prerequisite'],
  ['false-grip-ring-hang','ring-muscle-up','prerequisite'],
  ['wall-handstand','handstand-push-up','prerequisite'],
  ['straddle-stretch','straddle-press-to-hs','mobility_dependency'],
  ['tuck-planche','parallette-tuck-planche','alternative'],
];
for(const [from,to,type] of cross) skillEdges.push({from,to,type,hardGate:false});
export function graphProblems() {
  const problems=skillEdges.filter(e=>!known.has(e.from)||!known.has(e.to)).map(e=>`Missing catalog node: ${e.from} → ${e.to}`);
  const visited=new Set<string>(), active=new Set<string>();
  function visit(node:string) {
    if(active.has(node)){problems.push(`Prerequisite cycle at ${node}`);return;}
    if(visited.has(node))return;
    active.add(node);
    for(const e of skillEdges.filter(e=>e.from===node&&e.type==='prerequisite'))visit(e.to);
    active.delete(node);visited.add(node);
  }
  for(const node of known)visit(node);
  return [...new Set(problems)];
}
export const deviceSkillProgress: SkillProgressAdapter = {
  read(owner) {
    try { const data:unknown=JSON.parse(localStorage.getItem(key(owner))||'[]');
      return Array.isArray(data)?data.filter((x):x is SkillAttempt=>Boolean(x&&typeof x==='object'&&typeof x.id==='string'&&known.has(x.nodeId)&&typeof x.sessionId==='string'&&Number.isFinite(Date.parse(x.at))&&['seconds','reps'].includes(x.metric)&&Number.isFinite(x.value)&&x.value>=0&&Number.isFinite(x.target)&&x.target>0&&Number.isInteger(x.quality)&&x.quality>=1&&x.quality<=5)).slice(-1000):[];
    } catch { return []; }
  },
  write(owner,attempts) { localStorage.setItem(key(owner),JSON.stringify(attempts.slice(-1000))); window.dispatchEvent(new Event('power-skill-progress')); },
};
export function saveAttempt(owner:string,attempt:SkillAttempt) {
  const previous=deviceSkillProgress.read(owner);
  deviceSkillProgress.write(owner,[...previous.filter(x=>x.id!==attempt.id),attempt]);
}
export function removeAttempt(owner:string,id:string) {deviceSkillProgress.write(owner,deviceSkillProgress.read(owner).filter(x=>x.id!==id));}
export function readTrainingProfile(): SkillTrainingProfile {
  try {const x=JSON.parse(localStorage.getItem('power-training-profile-v1')||'null');
    if(x&&Array.isArray(x.equipment))return {equipment:x.equipment.filter((v:string)=>['floor','wall','rings','bar','parallettes','bands'].includes(v)),safeExit:x.safeExit===true};
  } catch {}
  return {equipment:['floor'],safeExit:false};
}
export function writeTrainingProfile(profile:SkillTrainingProfile){localStorage.setItem('power-training-profile-v1',JSON.stringify(profile));}
export function nodeDose(slug:string) {
  const timed=/planche|hold|hang|stand$|l-sit|frog-stand|lever/.test(slug)&&!/(push-up|kick-up|bail|dip|lift|transition|raise|row)/.test(slug);
  return {metric:timed?'seconds' as const:'reps' as const,target:slug==='ring-muscle-up'?1:slug==='handstand-push-up'?3:timed?8:5,sets:slug==='freestanding-handstand'?8:/muscle-up|handstand-push-up|ring-dip/.test(slug)?3:4,restSeconds:slug==='ring-muscle-up'?180:slug==='handstand-push-up'?150:/planche|muscle-up|push-up/.test(slug)?120:60,stopRule:'End the attempt when technique deteriorates or pain appears.'};
}
export function nodeProgress(slug:string,attempts:SkillAttempt[]) {
  const logs=attempts.filter(a=>a.nodeId===slug).sort((a,b)=>a.at.localeCompare(b.at)).slice(-20);
  const good=logs.filter(a=>a.quality>=4&&a.value>=a.target&&!a.discomfort);
  const confidence=(1+good.length)/(2+logs.length);
  const sessions=new Set(good.map(a=>a.sessionId)).size;
  const consistent=good.length>=3&&sessions>=2&&confidence>=.8&&!logs.slice(-2).some(a=>a.discomfort||a.quality<3);
  return {logs,good,confidence,sessions,consistent,state:consistent?'Consistent':logs.length?'Practicing':'Untried'};
}
export function relatedNodes(slug:string){return skillEdges.filter(e=>e.to===slug||e.from===slug&&e.type==='alternative');}
export function regressionFor(slug:string) {
  return [...skillEdges].reverse().find(e=>e.to===slug&&e.type==='prerequisite'&&SKILL_PATHS.some(p=>p.slugs.includes(e.from)&&p.slugs.includes(slug)))?.from || null;
}
export function trainingBlockers(slug:string,profile:SkillTrainingProfile,comfortable:boolean) {
  const reasons:string[]=[];
  if(!comfortable)reasons.push('Confirm a comfortable, pain-free variation before starting.');
  const equipment = (exerciseBySlug.get(slug)?.equipment || []).map(e=>e.toLowerCase());
  if(equipment.some(e=>/pull.?up bar|horizontal bar/.test(e))&&!profile.equipment.includes('bar'))reasons.push('A pull-up bar is required for this variation.');
  if(/ring|false-grip/.test(slug)&&!profile.equipment.includes('rings'))reasons.push('Gymnastic rings are required.');
  if(/parallette/.test(slug)&&!profile.equipment.includes('parallettes'))reasons.push('Parallettes are required for this variation.');
  if(/wall|chest-to-wall/.test(slug)&&!profile.equipment.includes('wall'))reasons.push('A clear wall is required.');
  if(/handstand|press-to-hs|hs-kick-up|stalder/.test(slug)&&!/bail|prep|mobility/.test(slug)&&!profile.safeExit)reasons.push('Confirm that you can safely enter and exit the inversion.');
  return reasons;
}
export function recommendedNode(pathId:string,attempts:SkillAttempt[]) {
  const path=SKILL_PATHS.find(p=>p.id===pathId);
  if(!path)return null;
  for(const slug of path.slugs) {
    if(nodeProgress(slug,attempts).consistent)continue;
    const dependencies=skillEdges.filter(e=>e.to===slug&&e.type==='prerequisite');
    return dependencies.find(e=>!nodeProgress(e.from,attempts).consistent)?.from || slug;
  }
  return path.slugs[path.slugs.length-1];
}
