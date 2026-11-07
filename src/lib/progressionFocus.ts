import { getSkillPath } from '../data/skillPaths';
type Focus={pathId:string;slug:string};
const key=(owner:string)=>`power-progression-focus-v1:${owner}`;
export function readProgressionFocus(owner:string):Focus|null{
 try{const x=JSON.parse(localStorage.getItem(key(owner))||'null');return x&&typeof x.pathId==='string'&&typeof x.slug==='string'&&getSkillPath(x.pathId)?.slugs.includes(x.slug)?x:null;}catch{return null;}
}
export function writeProgressionFocus(owner:string,focus:Focus){if(getSkillPath(focus.pathId)?.slugs.includes(focus.slug))localStorage.setItem(key(owner),JSON.stringify(focus));}
export function readProgressionGoal(owner:string,pathId:string){
 const path=getSkillPath(pathId);if(!path)return '';
 try{const value=JSON.parse(localStorage.getItem(`power-progression-goals-v1:${owner}`)||'{}')[pathId];if(path.slugs.includes(value))return value;}catch{}
 return path.slugs[path.slugs.length-1];
}
export function writeProgressionGoal(owner:string,pathId:string,slug:string){
 if(!getSkillPath(pathId)?.slugs.includes(slug))return;
 let old:Record<string,string>={};try{const x=JSON.parse(localStorage.getItem(`power-progression-goals-v1:${owner}`)||'{}');if(x&&typeof x==='object'&&!Array.isArray(x))old=x;}catch{}
 localStorage.setItem(`power-progression-goals-v1:${owner}`,JSON.stringify({...old,[pathId]:slug}));
}
