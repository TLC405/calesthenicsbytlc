import type { AssessmentAnswers } from '@/lib/trainingAssessment';
import type { SkillCheck } from '@/lib/skillCheck';

export type ClientGoal='strength'|'calisthenics'|'balance'|'mobility'|'general';
export type ClientExperience='new'|'building'|'experienced';
export interface ClientProfile{
  displayName:string;
  goal:ClientGoal;
  experience:ClientExperience;
  updatedAt:string;
}
export interface ClientBaseline{
  answers:AssessmentAnswers;
  tier:1|2|3;
  nextFocus:string;
  at:string;
}
export interface ClientTestHistoryItem{
  id:string;
  at:string;
  pathId:string;
  movement:string;
  metric:'seconds'|'reps';
  value:number|null;
  quality:number;
  assistance:SkillCheck['assistance'];
  comfortable:boolean;
}
export interface ClientPortalData{
  profile:ClientProfile|null;
  baseline:ClientBaseline|null;
  history:ClientTestHistoryItem[];
}
const EMPTY:ClientPortalData={profile:null,baseline:null,history:[]};
const KEY='tlc-client-portal-v1:';
function storage(owner:string):Storage{
  // A guest demo is session-only, never shared to permanent device storage.
  return owner==='guest'?window.sessionStorage:window.localStorage;
}
function cleanHistory(value:unknown):ClientTestHistoryItem[]{
  if(!Array.isArray(value))return [];
  return value.slice(0,150).filter((row):row is ClientTestHistoryItem=>
    Boolean(row&&typeof row==='object'&&
      typeof row.id==='string'&&typeof row.at==='string'&&Number.isFinite(Date.parse(row.at))&&
      typeof row.pathId==='string'&&typeof row.movement==='string'&&
      (row.metric==='seconds'||row.metric==='reps')&&
      (row.value===null||(typeof row.value==='number'&&Number.isFinite(row.value)&&row.value>=0&&row.value<=999))&&
      Number.isInteger(row.quality)&&row.quality>=0&&row.quality<=5&&
      ['none','wall','feet','band'].includes(row.assistance)&&typeof row.comfortable==='boolean'));
}
export function readClientPortal(owner:string):ClientPortalData{
  try{
    const raw=JSON.parse(storage(owner).getItem(KEY+owner)||'null');
    if(!raw||typeof raw!=='object')return {...EMPTY,history:[]};
    const profile=raw.profile&&typeof raw.profile.displayName==='string'&&typeof raw.profile.goal==='string'&&
      ['strength','calisthenics','balance','mobility','general'].includes(raw.profile.goal)&&
      ['new','building','experienced'].includes(raw.profile.experience)?{
        displayName:raw.profile.displayName.slice(0,60),goal:raw.profile.goal as ClientGoal,
        experience:raw.profile.experience as ClientExperience,updatedAt:String(raw.profile.updatedAt||''),
      }:null;
    const baseline=raw.baseline&&raw.baseline.answers&&typeof raw.baseline.answers==='object'&&
      [1,2,3].includes(raw.baseline.tier)&&typeof raw.baseline.nextFocus==='string'&&
      Number.isFinite(Date.parse(raw.baseline.at))?{
        answers:raw.baseline.answers as AssessmentAnswers,tier:raw.baseline.tier as 1|2|3,
        nextFocus:raw.baseline.nextFocus,at:raw.baseline.at as string,
      }:null;
    return {profile,baseline,history:cleanHistory(raw.history)};
  }catch{return {...EMPTY,history:[]};}
}
export function writeClientPortal(owner:string,value:ClientPortalData):boolean {
  try{storage(owner).setItem(KEY+owner,JSON.stringify({...value,history:value.history.slice(0,150)}));return true;}
  catch{return false;}
}
export function exportClientPortalData(owner:string,data:ClientPortalData):void{
  const out={exportedAt:new Date().toISOString(),source:'TLC Super Human Strength · Client Portal (device)',...data};
  const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');
  anchor.href=url;anchor.download='tlc-client-assessments.json';anchor.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1500);
}
