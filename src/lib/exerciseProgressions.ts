import { SKILL_PATHS } from '../data/skillPaths';
import aliases from '../data/catalogAliases.json';
export const canonicalSlug=(slug:string)=>(aliases as Record<string,string>)[slug]||slug;
export function exercisePaths(slug:string){const canonical=canonicalSlug(slug);return SKILL_PATHS.filter(p=>p.slugs.includes(canonical)||p.accessories?.includes(canonical));}
export function matchesProgression(slug:string,pathId:string){return !pathId||exercisePaths(slug).some(p=>p.id===pathId);}
