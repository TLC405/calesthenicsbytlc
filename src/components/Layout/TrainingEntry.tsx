import { Navigate, useSearchParams } from 'react-router-dom';
import { getSkillPath } from '@/data/skillPaths';
export function TrainingEntry(){const [params]=useSearchParams();const goal=params.get('goal')||params.get('skill')||'';const query=new URLSearchParams();if(getSkillPath(goal))query.set('goal',goal);else if(goal.startsWith('foundation-'))query.set('goal','foundation');if(params.get('node'))query.set('node',params.get('node')!);return <Navigate replace to={`/today${query.size?'?'+query.toString():''}`}/>;}
