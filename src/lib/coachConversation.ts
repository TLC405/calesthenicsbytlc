import catalog from '../data/publicExerciseCatalog.json';
export type CoachTurn={role:'user'|'assistant';content:string};
const known=new Set(catalog.map(e=>e.slug));
/** Client history is data, never a source of system instructions or authority over readiness. */
export function sanitizeCoachHistory(value:unknown):CoachTurn[]{
 if(!Array.isArray(value))return[];
 return value.filter((x):x is CoachTurn=>Boolean(x&&typeof x==='object'&&(x.role==='user'||x.role==='assistant')&&typeof x.content==='string'&&x.content.trim())).slice(-6).map(x=>({role:x.role,content:x.content.slice(0,800)}));
}
export function sanitizeBuilderSlugs(value:unknown):string[]{return Array.isArray(value)?[...new Set(value.filter((s):s is string=>typeof s==='string'&&known.has(s)))].slice(0,30):[];}
