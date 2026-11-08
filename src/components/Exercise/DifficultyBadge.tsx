import { TRAINING_LEVELS } from '@/lib/trainingPolicy';
import { cn } from '@/lib/utils';
interface DifficultyBadgeProps {level:number;showLabel?:boolean;size?:'sm'|'md'|'lg';className?:string;}
export function DifficultyBadge({level,showLabel=true,size='sm',className}:DifficultyBadgeProps){
 const tier=Math.max(1,Math.min(5,Math.round(level)||1));
 return <span className={cn('power-level-badge',`power-level-${tier}`,`power-level-size-${size}`,className)} aria-label={TRAINING_LEVELS[tier-1].label}><span className="power-level-dot" aria-hidden="true"/>{showLabel?TRAINING_LEVELS[tier-1].label:`L${tier}`}</span>;
}
export function getDifficultyLabel(level:number){return TRAINING_LEVELS.find(t=>t.id===level)?.label||'Unknown';}
