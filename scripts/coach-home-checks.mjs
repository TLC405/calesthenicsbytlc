import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const app=read('src/App.tsx');
const home=read('src/pages/SimpleHome.tsx');
const index=read('src/pages/Index.tsx');
const coach=read('src/pages/CoachChat.tsx');
const client=read('src/lib/coachClient.ts');
const entry=read('src/components/Layout/TrainingEntry.tsx');
const nav=read('src/components/Layout/MobileNav.tsx');
const more=read('src/pages/More.tsx');
const integrations=read('src/pages/Integrations.tsx');
const backend=read('api/discover-exercises.ts');
for(const [route,component] of [['/','Index'],['/build','FocusPlanner'],['/coach','CoachChat']]){
 assert(app.includes('path="'+route+'" element={<'+component+' />} />'),'Route missing '+route);
}
assert(index.includes("'/build'+search"),'Prior workout links should redirect to the builder');
assert(entry.includes('/build'),'Old /train and /today links should go to the builder');
for(const link of ['/build','/coach','/client','/skills','/assessment','/library']){
 assert(home.includes('to="'+link+'"')||home.includes("to:'"+link+"'"),'Home missing '+link);
}
assert(!home.includes('MovementLearningPanel')&&!home.includes('WorkoutCoach'),'Home must not eagerly render training heavy panels');
assert(nav.includes("['/coach','/integrations'"),'Coach needs correct active More dock state');
assert(more.includes("to:'/coach'"),'Coach must be discoverable in More');
assert(integrations.includes('to="/coach"'),'ChatGPT integrations must offer in-app AI chat');
for(const important of ["fetch('/api/discover-exercises'","await askCoach(","await signIn(","await signUp(","includeProgress:includeHistory","sessionStorage.setItem","rowsOwner!==owner","LOCAL PREVIEW · NOT AI"]){
 assert(coach.includes(important),'Chat feature integration missing '+important);
}
assert(client.includes('includeProgress?:boolean'),'Private records must be opt-in for dedicated coach');
assert(client.includes('options.includeProgress===false?[]'),'Disabled data sharing must send no personal attempt history');
assert(backend.includes('supabase.auth.getUser(token)'),'AI chat backend must verify Supabase token');
assert(backend.includes("rpc('consume_ai_request')"),'Server must enforce quota');
assert(backend.includes('process.env.OPENAI_API_KEY'),'AI key must stay server-side');
assert(!home.includes('fetch('),'Home should be offline-ready without network');
console.log('PASS: simplified offline-ready home, legacy deep links, embedded OpenAI coach, sign-up, privacy controls, guarded API and navigation.');
console.log('LIMIT: live authenticated ChatGPT responses require a signed-in test client and working provider quota, not verified by this source test.');
