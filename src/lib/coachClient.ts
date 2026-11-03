import { supabase } from '@/integrations/supabase/client';
import { readTrainingProfile, deviceSkillProgress } from './skillGraph';
import { validateCoachSelection } from './coachGrounding';
export async function askCoach(query:string,owner:string){
 const {data}=await supabase.auth.getSession();const token=data.session?.access_token;
 if(!token)throw new Error('AI coaching requires your owner/member sign-in. The rule-based planner works without signing in.');
 const profile=readTrainingProfile();
 const progress=deviceSkillProgress.read(owner).slice(-12).map(({nodeId,value,metric,quality})=>({nodeId,value,metric,quality}));
 const response=await fetch('/api/discover-exercises',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({query,profile,progress}),signal:AbortSignal.timeout(35000)});
 const result=await response.json();if(!response.ok)throw new Error(result.error||'AI coach is unavailable.');
 return validateCoachSelection({goal_id:result.goalId,exercise_slugs:(result.exercises||[]).map(e=>e.slug),message:result.message},profile);
}
