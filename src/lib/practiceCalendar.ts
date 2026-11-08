import { exerciseBySlug } from './skillGraph';
import type { SkillWorkoutItem } from './skillWorkoutBuilder';
import { getSkillPath } from '../data/skillPaths';
export function localDay(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function calendarDate(day:string){return new Date(`${day}T12:00:00`);}
export function validDay(day:string){return /^\d{4}-\d{2}-\d{2}$/.test(day)&&Number.isFinite(calendarDate(day).getTime())&&localDay(calendarDate(day))===day;}
export function shiftDay(day:string,amount:number){const date=calendarDate(day);date.setDate(date.getDate()+amount);return localDay(date);}
export function weekDays(day:string){const date=calendarDate(day);const start=shiftDay(day,-((date.getDay()+6)%7));return Array.from({length:7},(_,i)=>shiftDay(start,i));}
export type ScheduledPractice={date:string;goalId:string;title:string;items:SkillWorkoutItem[];savedAt:string};
const key=(owner:string)=>`power-practice-calendar-v1:${owner}`;
export function readScheduledPractice(owner:string):ScheduledPractice[]{try{const raw=JSON.parse(localStorage.getItem(key(owner))||'[]');if(!Array.isArray(raw))return[];return raw.filter(row=>row&&validDay(row.date)&&getSkillPath(row.goalId)&&Array.isArray(row.items)).slice(0,120).map(row=>({...row,title:String(row.title||'My workout').slice(0,100),items:row.items.filter(i=>i&&exerciseBySlug.has(i.exercise?.slug)&&['warmup','skill','support','cooldown'].includes(i.phase)&&Number.isInteger(i.sets)&&i.sets>0&&i.sets<=12&&Number.isFinite(i.target)&&i.target>0&&i.target<=999&&['seconds','reps'].includes(i.metric)).slice(0,exerciseBySlug.size).map(i=>({...i,exercise:exerciseBySlug.get(i.exercise.slug)!}))})).filter(row=>row.items.length);}catch{return[];}}
export function saveScheduledPractice(owner:string,plan:ScheduledPractice){if(!validDay(plan.date)||!getSkillPath(plan.goalId))throw Error('Choose a valid day and skill.');const next=[plan,...readScheduledPractice(owner).filter(p=>p.date!==plan.date)].slice(0,120);localStorage.setItem(key(owner),JSON.stringify(next));window.dispatchEvent(new Event('power-practice-calendar'));}
