import catalog from '../data/publicExerciseCatalog.json';
import { MOVEMENT_VARIANTS } from '../data/movementVariants';
import { RULES, minimumTier } from './trainingPolicy';
import { canonicalSlug } from './exerciseProgressions';
import { nodeDose, trainingBlockers, type SkillAttempt, type SkillTrainingProfile } from './skillGraph';
const known=new Map(catalog.map(e=>[e.slug,e]));
export function movementRelations(slug:string,profile:SkillTrainingProfile){
 const current=canonicalSlug(slug);
 const option=(s:string)=>{const exercise=known.get(s);return exercise?{exercise,level:minimumTier(s),reasons:trainingBlockers(s,profile,true)}:null;};
 const regression=RULES[current]?.regression;
 const harder=[...new Set(Object.entries(RULES).filter(([next,rule])=>next!==current&&canonicalSlug(next)===next&&rule.regression&&canonicalSlug(rule.regression)===current).map(([next])=>next))];
 const variations=[...new Set(MOVEMENT_VARIANTS.filter(group=>group.includes(current)).flatMap(group=>group.filter(s=>s!==current)))];
 return {easier:regression?[option(canonicalSlug(regression))].filter(Boolean):[],harder:harder.map(option).filter(Boolean).sort((a,b)=>a.level-b.level),variations:variations.map(option).filter(Boolean)};
}
export function movementHistorySummary(slug:string,attempts:SkillAttempt[],now=Date.now()){
 const current=canonicalSlug(slug);const metric=nodeDose(current).metric;
 const logs=attempts.filter(a=>canonicalSlug(a.nodeId)===current&&a.metric===metric&&Number.isFinite(a.value)&&a.value>=0&&Number.isFinite(Date.parse(a.at))&&Date.parse(a.at)<=now).sort((a,b)=>a.at.localeCompare(b.at));
 const controlled=logs.filter(a=>a.quality>=4&&!a.discomfort);
 return {count:logs.length,metric,last:logs[logs.length-1]||null,best:controlled.length?Math.max(...controlled.map(a=>a.value)):null};
}
