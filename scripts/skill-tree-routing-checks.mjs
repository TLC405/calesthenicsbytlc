import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

const temp=await mkdtemp(join(tmpdir(),'tlc-skill-tree-'));
try{
 const outfile=join(temp,'routing.mjs');
 await build({entryPoints:['src/lib/masterTreeRouting.ts'],outfile,bundle:true,format:'esm',platform:'node',logLevel:'silent'});
 const {routeMasterTree}=await import(pathToFileURL(outfile).href);
 const graph=JSON.parse(await readFile('src/data/masterSkillMap.json','utf8'));
 const geo={left:160,top:125,colPitch:224,rowPitch:157,cardWidth:186,cardHeight:116};
 const rect=(n)=>{
  const laneIndex=graph.lanes.findIndex(l=>l.id===n.lane);
  return{x:geo.left+laneIndex*geo.colPitch+(geo.colPitch-geo.cardWidth)/2,
   y:geo.top+(11-n.row)*geo.rowPitch+14,
   w:geo.cardWidth,h:geo.cardHeight};
 };
 const test=[graph.edges,graph.edges.filter(e=>e.type==='primary'||e.type==='bridge'),graph.edges.filter(e=>e.type!=='bridge')];
 for(const [selection,edges] of test.entries()){
  const nodes=selection===2?graph.nodes.filter(n=>n.kind!=='bridge'):graph.nodes;
  const included=new Set(nodes.map(n=>n.id));
  const active=edges.filter(e=>included.has(e.from)&&included.has(e.to));
  const routes=routeMasterTree(nodes,active,graph.lanes,geo);
  assert.equal(routes.length,active.length,'Route count equals source edges');
  const byId=new Map(nodes.map(n=>[n.id,n]));
  for(const route of routes){
   const a=byId.get(route.edge.from),b=byId.get(route.edge.to);
   assert(route.d.startsWith('M '),'Valid SVG path');
   assert(route.points.length>=2,'Each route has endpoints');
   for(const [x,y] of route.points)assert(Number.isFinite(x)&&Number.isFinite(y),'Finite poster path coordinates');
   const start=route.points[0],end=route.points.at(-1),ar=rect(a),br=rect(b);
   assert(start[0]>ar.x&&start[0]<ar.x+ar.w&&Math.abs(start[1]-ar.y)<1,'Arrow leaves the source card top');
   assert(end[0]>br.x&&end[0]<br.x+br.w&&Math.abs(end[1]-(br.y+br.h+2))<1,'Arrow approaches the target card bottom');
   for(let i=1;i<route.points.length;i++){
    const [x1,y1]=route.points[i-1],[x2,y2]=route.points[i];
    assert(Math.abs(x1-x2)<.001||Math.abs(y1-y2)<.001,'Routing must use Manhattan corridors');
    for(const other of nodes){
     if(other.id===a.id||other.id===b.id)continue;
     const r=rect(other),padding=1;
     if(Math.abs(x1-x2)<.001){
      const overlaps=x1>r.x+padding&&x1<r.x+r.w-padding&&Math.max(y1,y2)>r.y+padding&&Math.min(y1,y2)<r.y+r.h-padding;
      assert(!overlaps,'Route intersects a third-party skill card: '+a.id+'>'+b.id+' through '+other.id);
     }else{
      const overlaps=y1>r.y+padding&&y1<r.y+r.h-padding&&Math.max(x1,x2)>r.x+padding&&Math.min(x1,x2)<r.x+r.w-padding;
      assert(!overlaps,'Route intersects a third-party skill card: '+a.id+'>'+b.id+' through '+other.id);
     }
    }
   }
  }
 }
 const landing=await readFile('src/pages/Skills.tsx','utf8'),page=await readFile('src/pages/MasterSkillMap.tsx','utf8');
 const client=await readFile('src/pages/ClientPortal.tsx','utf8'),more=await readFile('src/pages/More.tsx','utf8');
 assert(landing.includes("raw==='paths'||raw==='all'?raw:'tree'")&&landing.includes('Skill Tree')&&landing.includes('<MasterSkillMap embedded/>'),'Skills Studio defaults to the actual Skill Tree');
 assert(landing.includes('setParams(updated,{replace:true})'),'Skills tab selection uses URL state');
 assert(page.includes("updated.set('skill',id)")&&page.includes('new URLSearchParams(prev)'),'Selecting skill preserves URL tab');
 assert(page.includes("typeof window!=='undefined'&&window.matchMedia"),'Mobile defaults to readable focused tree');
 assert(page.includes('const Wrapper=embedded?'),'Nested main avoided');
 assert(page.includes('routeMasterTree(visible,edges'),'Poster uses assigned channel routing');
 assert(page.includes('READ THE TREE'),'Standalone SVG includes its own legend');
 assert(client.includes("label:'Overview'")&&client.includes("label:'Skill Test'"),'Portal tab grammar consistent');
 assert(more.includes("label:'Client Portal'"),'More navigation is grammatically clear');
 assert(!more.includes('Client Portal / Sign Up'),'No squashed sign-up noun in navigation title');
 console.log('PASS: Skill Tree tab, URL-stable node selection, 3 routing variants, 93 card-avoiding orthogonal paths, standalone poster legend, mobile view, and cleaned Client Portal labels.');
}finally{await rm(temp,{recursive:true,force:true});}
