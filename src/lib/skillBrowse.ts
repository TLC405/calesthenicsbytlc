import { SKILL_PATHS, type SkillPath } from '../data/skillPaths';
import { canonicalSlug, exercisePaths } from './exerciseProgressions';
export const SKILL_CATEGORIES=[
 {id:'grip',title:'Grip strength',detail:'Hangs, pinch, crush and wrists',cover:'grip-support'},
 {id:'calves',title:'Calves & tibialis',detail:'Heel raises and shin strength',cover:'calves-tibialis'},
 {id:'rings',title:'Rings',detail:'Support, rows, dips & muscle-ups',cover:'rings'},
 {id:'straight-arm',title:'Straight-arm strength',detail:'Planche, levers & strong support',cover:'planche'},
 {id:'handstands',title:'Handstands & presses',detail:'Balance, pike pressing & Stalder',cover:'handstand'},
 {id:'compression',title:'Core & compression',detail:'Leg lifts, L-sits & body control',cover:'pike-compression'},
 {id:'strength',title:'Strength basics',detail:'Push-ups, pull-ups & legs',cover:'push-up'},
 {id:'mobility',title:'Mobility & warm-ups',detail:'Wrists, shoulders, hips & recovery',cover:'wrist-preparation'},
 {id:'yoga',title:'Yoga',detail:'Floor poses, standing & balance',cover:'yoga-foundation'},
 {id:'ballet',title:'Ballet & balance',detail:'Barre, leg lifts & steady holds',cover:'ballet-barre'},
 {id:'specialty',title:'Specialty skills',detail:'Human Flag, Iron Cross & bar skills',cover:'human-flag'},
 {id:'basics',title:'Start here',detail:'Your full-body foundation',cover:'foundation'},
] as const;
export type SkillCategoryId=typeof SKILL_CATEGORIES[number]['id'];
export function skillCategory(path:SkillPath):SkillCategoryId{
 if(path.group==='Grip'||path.id.startsWith('grip-'))return 'grip';
 if(path.id==='calves-tibialis')return 'calves';
 if(['human-flag','iron-cross','bar-transitions'].includes(path.id))return 'specialty';
 if(path.id==='foundation')return 'basics';
 if(path.group==='Yoga')return'yoga';if(path.group==='Ballet')return'ballet';
 if(path.group==='Mobility'||['pancake','recovery'].includes(path.id))return'mobility';
 if(path.group==='Rings'||path.id.startsWith('ring'))return'rings';
 if(path.group==='Compression'||path.group==='Core')return'compression';
 if(path.group==='Press & balance'||['handstand','hspu','pike-press','straddle-press','stalder','forearm-balance','bent-arm-press','crow','elbow-lever'].includes(path.id))return'handstands';
 if(path.group==='Lower body'||['pull-up','push-up','dip','foundation-push','foundation-pull','foundation-inversion','foundation-legs'].includes(path.id))return'strength';
 return'straight-arm';
}
export function browseCategory(value:string){const aliases:Record<string,SkillCategoryId>={Rings:'rings','Straight arms':'straight-arm','Straight arm':'straight-arm',Handstands:'handstands',Compression:'compression','Leg lifts & core':'compression',Strength:'strength','Leg strength':'strength',Basics:'basics',Grip:'grip',Forearms:'grip',Calves:'calves','Calves & tibialis':'calves',Balance:'handstands',Mobility:'mobility',Yoga:'yoga',Ballet:'ballet'};return SKILL_CATEGORIES.some(c=>c.id===value)?value as SkillCategoryId:aliases[value]||null;}
export function familySearch(path:SkillPath,query:string){const terms=query.toLowerCase().trim().split(/\s+/);const value=`${path.title} ${path.short} ${path.slugs.join(' ')}`.toLowerCase().replace(/-/g,' ');return terms.every(term=>value.includes(term));}
export function matchesBrowseCategory(exercise:{slug:string;category?:string},category:string|null){if(!category)return true;const id=browseCategory(category);if(!id)return false;const paths=exercisePaths(canonicalSlug(exercise.slug));if(paths.some(p=>skillCategory(p)===id))return true;const raw=exercise.category||'';return (id==='grip'&&(/grip|pinch|hang|wrist|finger|farmer|towel|support-hold/.test(exercise.slug)||raw==='Grip'))||(id==='calves'&&(/calf|calves|tibial|heel-raise/.test(exercise.slug)))||id==='strength'&&['Push','Pull','Legs'].includes(raw)||id==='compression'&&raw==='Core'||id==='rings'&&raw==='Rings'||id==='yoga'&&raw==='Yoga'||id==='ballet'&&raw==='Ballet'||id==='mobility'&&['Mobility','Flexibility'].includes(raw);}
export function pageSlice<T>(items:readonly T[],page:number,size=8){const pages=Math.max(1,Math.ceil(items.length/size));const index=Math.max(0,Math.min(pages-1,Math.floor(page)||0));return{items:items.slice(index*size,(index+1)*size),page:index,pages,start:items.length?index*size+1:0,end:Math.min(items.length,(index+1)*size),total:items.length};}
export const familiesInCategory=(id:SkillCategoryId)=>SKILL_PATHS.filter(p=>skillCategory(p)===id);
