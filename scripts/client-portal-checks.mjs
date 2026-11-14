import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';

const dir=await mkdtemp(path.join(tmpdir(),'tlc-client-checks-'));
const store=()=>{
  const values=new Map();
  return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
};
const local=store(),session=store();
globalThis.window={localStorage:local,sessionStorage:session};

try{
  const out=path.join(dir,'portal.mjs');
  await build({entryPoints:['src/lib/clientPortal.ts'],outfile:out,bundle:true,platform:'node',format:'esm',logLevel:'silent'});
  const lib=await import(pathToFileURL(out).href);
  const at='2026-11-14T14:00:00.000Z';
  const clean={
    profile:{displayName:'Example',goal:'calisthenics',experience:'new',updatedAt:at},
    baseline:{answers:{push:1,pull:0},tier:1,nextFocus:'Body line and breathing',at},
    history:[{id:'entry-1',at,pathId:'planche',movement:'Frog stand',metric:'seconds',value:8,quality:4,assistance:'none',comfortable:true}],
  };
  assert.equal(lib.readClientPortal('guest').history.length,0);
  assert(lib.writeClientPortal('guest',clean),'guest demo should accept in-session data');
  assert.equal(session.values.size,1,'guest data uses session only');
  assert.equal(local.values.size,0,'guest preview must never use persistent localStorage');
  assert.equal(lib.readClientPortal('guest').history[0].value,8);
  assert.equal(lib.readClientPortal('u-1').history.length,0,'user account must not load guest tests');
  assert(lib.writeClientPortal('u-1',clean),'signed-in account should be scoped');
  assert.equal(local.values.size,1);
  assert.equal(lib.readClientPortal('u-1').history.length,1);
  assert.equal(lib.readClientPortal('u-2').history.length,0,'different account must have separate records');

  const invalid={...clean,history:[{...clean.history[0],id:'bad',quality:9},clean.history[0]]};
  local.setItem('tlc-client-portal-v1:u-1',JSON.stringify(invalid));
  assert.equal(lib.readClientPortal('u-1').history.length,1,'invalid client results should not display');

  const app=await readFile('src/App.tsx','utf8');
  const nav=await readFile('src/components/Layout/MobileNav.tsx','utf8');
  const portal=await readFile('src/pages/ClientPortal.tsx','utf8');
  assert(app.includes('path="/client"')&&app.includes('path="/client/:tab"'),'client portal routes registered');
  const more=await readFile('src/pages/More.tsx','utf8');
  assert(nav.includes("path:'/more',label:'More'"),'Fold-safe navigation must expose the More tools hub');
  assert(more.includes("to:'/client',label:'Client Portal'"),'Grammatically named Client Portal must remain reachable from More');
  assert(portal.includes('className="tlc-client-access__actions"'),'Client access shows signup and sign-in buttons');
  assert(portal.includes("saveSkillCheck(owner,check)"),'client result integrates with the existing skill-check store');
  assert(portal.includes("owner!=='guest'"),'guest tests do not overwrite the shared legacy guest assessment');
  assert(portal.includes('questionIndex')&&portal.includes('currentQuestion.options'),'starter assessment is a step-by-step wizard');
  assert(portal.includes('Copy assessment link'),'public client entry can be shared');
  assert(portal.includes("label:'Skill Test'")&&portal.includes("label:'Overview'"),'Portal navigation uses clear, parallel tab labels');
  assert(portal.includes('Explore the Skill Tree'),'Client results lead to the Skill Tree');
  assert(portal.includes('coach review and cross-device cloud sync are not active yet'),'UI must not falsely promise remote results');

  console.log('PASS: client test routes, onboarding, wizard, owner-isolated local records, session-only guest, invalid records and honest sync notices.');
}finally{
  await rm(dir,{recursive:true,force:true});
  delete globalThis.window;
}
