import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Download, GitBranch, Play, Search, ShieldAlert, Target, TvMinimal, Waypoints } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { deviceSkillProgress, exerciseBySlug, nodeProgress, type SkillAttempt } from '@/lib/skillGraph';
import { InlineTlcTv } from '@/components/Exercise/InlineTlcTv';
import { MovementOverview } from '@/components/Exercise/MovementOverview';
import source from '@/data/masterSkillMap.json';
import { routeMasterTree } from '@/lib/masterTreeRouting';

type Domain='push'|'pull'|'core'|'legs'|'mob';
type Kind='start'|'orig'|'merged'|'bridge'|'apex'|'hub';
type Node={id:string;lane:string;row:number;kind:Kind;domain:Domain;og:string;label:string;passStandard:string;exerciseSlug:string|null;mapping:'exact'|'related'|'missing'};
type Edge={from:string;to:string;type:'primary'|'cross_explicit'|'cross_implicit'|'reconciled'|'bridge'};
type Lane={id:string;name:string;domain:Domain;path:string;index:number};
const map=source as {lanes:Lane[];nodes:Node[];edges:Edge[];source:string};
const domainColors:Record<Domain,{color:string;ink:string;label:string}>={
 push:{color:'#0072B2',ink:'#ffffff',label:'Push & Handbalance'},
 pull:{color:'#D55E00',ink:'#101820',label:'Pull & Levers'},
 core:{color:'#009E73',ink:'#101820',label:'Core & Compression'},
 legs:{color:'#E69F00',ink:'#101820',label:'Legs & Power'},
 mob:{color:'#CC79A7',ink:'#101820',label:'Mobility & Prehab'}
};
const tiers=[
 {name:'ELITE / APEX',rows:[11]},
 {name:'ADVANCED',rows:[9,10]},
 {name:'INTERMEDIATE II',rows:[7,8]},
 {name:'INTERMEDIATE I',rows:[5,6]},
 {name:'FOUNDATION',rows:[3,4]},
 {name:'ENTRY',rows:[1,2]}
];
const nodeMap=new Map(map.nodes.map(n=>[n.id,n]));
const outgoing=new Map(map.nodes.map(n=>[n.id,map.edges.filter(e=>e.from===n.id)]));
const incoming=new Map(map.nodes.map(n=>[n.id,map.edges.filter(e=>e.to===n.id)]));
function reach(start:string,direction:'up'|'down'){
 const visited=new Set<string>(),pending=[start];
 while(pending.length){const cur=pending.pop()!;
  for(const edge of (direction==='up'?incoming:outgoing).get(cur)||[]){
   const next=direction==='up'?edge.from:edge.to;
   if(!visited.has(next)&&next!==start){visited.add(next);pending.push(next);}
  }
 }
 return visited;
}
function shortLines(value:string,maxChars:number,maxLines:number){
 const words=value.split(/\s+/),lines:string[]=[];let current='';
 for(const word of words){if((current+' '+word).trim().length>maxChars&&current){lines.push(current);current=word;}else current=(current+' '+word).trim();}
 if(current)lines.push(current);
 if(lines.length>maxLines){const result=lines.slice(0,maxLines);result[maxLines-1]=result[maxLines-1].slice(0,maxChars-1)+'…';return result;}
 return lines;
}
const CW=186,CH=116,PX=224,PY=157,LEFT=160,TOP=125;
const WIDTH=LEFT+PX*map.lanes.length+28,HEIGHT=TOP+PY*11+120;
function pos(node:Node){
 const ix=map.lanes.findIndex(l=>l.id===node.lane);
 const x=LEFT+ix*PX+(PX-CW)/2,y=TOP+(11-node.row)*PY+14;
 return {x,y,cx:x+CW/2,cy:y+CH/2,bottom:y+CH,top:y,ix};
}
function graphColor(type:Edge['type']){
 return type==='bridge'?'#0F766E':type==='cross_implicit'?'#6F8096':type==='reconciled'?'#D55E00':type==='cross_explicit'?'#0072B2':'#738397';
}
function graphDash(type:Edge['type']){
 return type==='bridge'?'3 4':type==='cross_implicit'?'6 5':undefined;
}
export default function MasterSkillMap({embedded=false}:{embedded?:boolean}){
 const {user}=useAuth(),owner=user?.id||'guest';
 const [params,setParams]=useSearchParams();
 const first=params.get('skill');
 const [selectedId,setSelectedId]=useState(first&&nodeMap.has(first)?first:'hs_ctw');
 const [lane,setLane]=useState(nodeMap.get(first||'hs_ctw')?.lane||'HANDSTAND');
 const [view,setView]=useState<'focus'|'poster'>(()=>typeof window!=='undefined'&&window.matchMedia('(max-width:780px)').matches?'focus':'poster');
 const [bridges,setBridges]=useState(true);
 const [crossLinks,setCrossLinks]=useState(true);
 const [search,setSearch]=useState('');
 const [tracing,setTracing]=useState(true);
 const [attempts,setAttempts]=useState<SkillAttempt[]>(()=>deviceSkillProgress.read(owner));
 const [fit,setFit]=useState(false);
 const svgRef=useRef<SVGSVGElement>(null);
 useEffect(()=>{const refresh=()=>setAttempts(deviceSkillProgress.read(owner));refresh();window.addEventListener('power-skill-progress',refresh);return()=>window.removeEventListener('power-skill-progress',refresh);},[owner]);
 const selected=nodeMap.get(selectedId)!;
 const prereqs=useMemo(()=>reach(selectedId,'up'),[selectedId]);
 const unlocks=useMemo(()=>reach(selectedId,'down'),[selectedId]);
 const directPrereqs=incoming.get(selectedId)||[];
 const nextSteps=outgoing.get(selectedId)||[];
 const visible=useMemo(()=>map.nodes.filter(n=>bridges||n.kind!=='bridge'),[bridges]);
 const visibleIds=useMemo(()=>new Set(visible.map(n=>n.id)),[visible]);
 const edges=useMemo(()=>map.edges.filter(e=>visibleIds.has(e.from)&&visibleIds.has(e.to)&&(crossLinks||e.type==='primary'||e.type==='bridge')),[visibleIds,crossLinks]);
 const routes=useMemo(()=>routeMasterTree(visible,edges,map.lanes,{left:LEFT,top:TOP,colPitch:PX,rowPitch:PY,cardWidth:CW,cardHeight:CH}),[visible,edges]);
 const filtered=useMemo(()=>visible.filter(n=>(!search||n.label.toLowerCase().includes(search.toLowerCase()))&&(!lane||n.lane===lane)).sort((a,b)=>a.row-b.row),[visible,lane,search]);
 const linked=selected.exerciseSlug?exerciseBySlug.get(selected.exerciseSlug):null;
 const progress=linked&&selected.mapping==='exact'?nodeProgress(linked.slug,attempts):null;
 const laneInfo=map.lanes.find(l=>l.id===selected.lane)!;
 function selectNode(id:string){
  const n=nodeMap.get(id);if(!n)return;
  setSelectedId(id);setLane(n.lane);
  setParams(prev=>{const updated=new URLSearchParams(prev);updated.set('skill',id);return updated;},{replace:true});
 }
 function downloadSvg(){
  const current=svgRef.current;if(!current)return;
  const svg=current.cloneNode(true) as SVGSVGElement;
  svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
  const payload='<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(svg);
  const url=URL.createObjectURL(new Blob([payload],{type:'image/svg+xml;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='tlc-master-strength-map.svg';link.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1500);
 }
 const Wrapper=embedded?'section':'main';
 return <Wrapper className={'master-map-page'+(embedded?' is-embedded':'')}>
  {embedded?<header className="master-map-embedded-head"><span><Waypoints size={19}/> 80 SKILLS · 13 PATHS · 93 CONNECTIONS</span><h2>Skill Tree</h2><p>Follow the branches from foundation to elite. Tap a node to find its tutorial and next step.</p></header>:<div className="master-map-top">
   <Link to="/skills" className="master-map-back"><ArrowLeft size={16}/> Skills</Link>
   <span className="master-map-overline"><Waypoints size={15}/> TLC / SUPER HUMAN SYSTEM</span>
   <h1>Skill Tree<span>.</span></h1>
   <p>See how strength skills connect. Choose a move, watch its video and check what comes next.</p>
   <div className="master-map-numbers" aria-label="Map overview"><span><b>80</b> skills</span><span><b>13</b> paths</span><span><b>93</b> connections</span><span><b>6</b> levels</span></div>
  </div>}
  <section className="master-map-tools" aria-label="Map controls">
   <div className="master-map-switch" role="group" aria-label="Choose view">
    <button type="button" aria-pressed={view==='focus'} onClick={()=>setView('focus')}>Explore skills</button>
    <button type="button" aria-pressed={view==='poster'} onClick={()=>setView('poster')}>Full map</button>
   </div>
   <label className="master-map-search"><Search size={17}/><input aria-label="Search all 80 skills" value={search} onChange={e=>{setSearch(e.target.value);if(e.target.value)setLane('');}} placeholder="Find a skill…" /></label>
   {view==='focus'?<label className="master-map-select">Skill path <select value={lane} onChange={e=>setLane(e.target.value)}><option value="">All 13 paths</option>{map.lanes.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></label>:
    <div className="master-map-poster-tools">
     <label><input type="checkbox" checked={bridges} onChange={e=>setBridges(e.target.checked)}/> Show added steps</label>
     <label><input type="checkbox" checked={crossLinks} onChange={e=>setCrossLinks(e.target.checked)}/> Show links across paths</label>
     <button type="button" onClick={()=>setFit(f=>!f)}>{fit?'Original size':'Fit width'}</button>
     <button type="button" onClick={downloadSvg}><Download size={15}/> SVG</button>
    </div>}
  </section>
  <div className="master-map-legend" aria-label="Map categories">{Object.entries(domainColors).map(([key,domain])=><span key={key}><i style={{background:domain.color}}/>{domain.label}</span>)}<span><i className="master-map-start-dot"/>Your chart's starting nodes</span></div>
  {view==='focus'?<section className="master-map-body">
    <div className="master-map-skill-list" aria-label="Skills in selected path">
     <p className="master-map-list-title">{lane?map.lanes.find(l=>l.id===lane)?.name:'All paths'} <span>{filtered.length} skills</span></p>
     {filtered.map(n=>{
      const nLane=map.lanes.find(l=>l.id===n.lane)!;
      const color=domainColors[n.domain].color;
      const available=n.exerciseSlug&&n.mapping==='exact'?exerciseBySlug.get(n.exerciseSlug):null;
      const hasLog=available?nodeProgress(available.slug,attempts).logs.length>0:false;
      return <button type="button" key={n.id} onClick={()=>selectNode(n.id)} aria-pressed={selectedId===n.id}
        className={'master-map-skill '+(selectedId===n.id?'is-selected':'')+(n.kind==='bridge'?' is-bridge':'')}
        style={{'--master-accent':color} as CSSProperties}>
       <span className="master-map-skill-row"><span className="master-map-row">R{n.row}</span><span className="master-map-skill-name">{n.label}</span><ArrowRight size={17}/></span>
       <span className="master-map-skill-meta"><span>{nLane.name}</span><span>{n.kind==='start'?'★ START':n.kind==='bridge'?'ADDED STEP':n.kind==='merged'?'MERGED':n.kind==='hub'?'FOUNDATION HUB':n.kind==='apex'?'APEX':'ORIGINAL'}</span>{hasLog&&<span><Check size={12}/> Logged</span>}</span>
      </button>;
     })}
     {!filtered.length&&<p className="master-map-empty">No skills in this view. Change the search or path.</p>}
    </div>
    <SkillDetails key={selectedId} node={selected} lane={laneInfo} linked={linked} progress={progress} prereqs={directPrereqs} next={nextSteps} onChoose={selectNode} upstream={prereqs.size} downstream={unlocks.size}/>
  </section>:<section className="master-map-poster-layout">
   <div className="master-map-poster-hint"><GitBranch size={16}/> Tap a node to trace its connections. Scroll sideways through all 13 branches. <span>Checkpoints are goals, not daily workouts.</span></div>
   <div className={'master-map-scroll '+(fit?'is-fit':'')} tabIndex={0} aria-label="Scrollable 13-lane skill map">
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={'0 0 '+WIDTH+' '+HEIGHT} width={WIDTH} height={HEIGHT} role="img" aria-label="80-skill graph, 13 vertical paths and 11 rows">
     <defs>{['primary','cross_explicit','cross_implicit','reconciled','bridge'].map(type=><marker key={type} id={'master-arrow-'+type} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 1 L 9 5 L 0 9 Z" fill={graphColor(type as Edge['type'])}/></marker>)}</defs>
     <rect width={WIDTH} height={HEIGHT} fill="#F8FAFC"/>
     {tiers.map((t,i)=>{
      const row=Math.max(...t.rows),y=TOP+(11-row)*PY;
      return <g key={t.name}><rect x={12} y={y} width={WIDTH-24} height={PY*t.rows.length} rx={8} fill={i%2===0?'#F0F4F9':'#FFFFFF'} stroke="#DFE5EC"/><text x={24} y={y+37} fill="#334155" fontSize={11} fontWeight={850}>{t.name}</text><text x={24} y={y+53} fill="#64748B" fontSize={10}>{t.rows.map(r=>'R'+r).join('–')}</text></g>;
     })}
     {map.lanes.map(l=>{
      const x=LEFT+(l.index-1)*PX+11;const domain=domainColors[l.domain];
      return <g key={l.id}><rect x={x} y={63} width={PX-22} height={43} rx={9} fill={domain.color}/><text x={x+(PX-22)/2} y={80} textAnchor="middle" fontWeight={800} fontSize={11} fill={domain.ink}>{l.name.toUpperCase()}</text><text x={x+(PX-22)/2} y={96} textAnchor="middle" fontWeight={680} fontSize={8} fill={domain.ink}>{domain.label.toUpperCase()}</text></g>;
     })}
     <text x={24} y={35} fontSize={23} fontWeight={850} fill="#152333">TLC SUPER HUMAN · SKILL TREE</text>
     <text x={24} y={52} fontSize={11} fill="#475569">80 skills · 93 directional connections · 13 paths · 6 tiers · chart benchmarks ≠ training volume</text>
     <g>
      {edges.map((ed,i)=>{
       const ancestor=prereqs.has(ed.from)&&(prereqs.has(ed.to)||ed.to===selectedId);
       const descendant=unlocks.has(ed.to)&&(unlocks.has(ed.from)||ed.from===selectedId);
       const active=tracing&&(ancestor||descendant);
       const muted=tracing&&!active;
       return <path key={ed.from+'-'+ed.to+'-'+i} d={routes[i].d} fill="none" stroke={graphColor(ed.type)} strokeWidth={active?3:1.55} strokeDasharray={graphDash(ed.type)} opacity={muted?0.17:0.78} strokeLinejoin="round" markerEnd={'url(#master-arrow-'+ed.type+')'}/>;
      })}
     </g>
     {visible.map(n=>{
      const p=pos(n),domain=domainColors[n.domain],active=n.id===selectedId,related=prereqs.has(n.id)||unlocks.has(n.id);
      const faded=tracing&&!active&&!related;
      const background=n.kind==='hub'?'#1E293B':n.kind==='start'?'#FFFEF4':'#FFFFFF';
      const primaryText=n.kind==='hub'?'#FFFFFF':'#102338';
      return <g key={n.id} className="master-svg-node" role="button" tabIndex={0} aria-label={n.label+', row '+n.row+', '+n.passStandard}
       onClick={()=>selectNode(n.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectNode(n.id);}}} opacity={faded?0.43:1}>
       <title>{n.label+' · Exit: '+n.passStandard}</title>
       {n.kind==='start'&&<rect x={p.x-4} y={p.y-4} width={CW+8} height={CH+8} rx={12} fill="#F0E442" stroke="#0F172A" strokeWidth={2.5}/>}
       <rect x={p.x} y={p.y} width={CW} height={CH} rx={9} fill={background} stroke={active?'#111827':n.kind==='bridge'?'#0F766E':'#BAC8D6'} strokeWidth={active?3:n.kind==='bridge'?2:1.3} strokeDasharray={n.kind==='bridge'?'5 3':undefined}/>
       <rect x={p.x+2} y={p.y+2} width={CW-4} height={6} rx={3} fill={domain.color}/>
       <rect x={p.x+9} y={p.y+12} width={n.kind==='bridge'?61:n.kind==='start'?48:55} height={16} rx={5} fill={n.kind==='bridge'?'#CCFBF1':n.kind==='start'?'#F0E442':n.kind==='hub'?'#475569':'#EAF0F6'}/>
       <text x={p.x+15} y={p.y+24} fontSize={9} fontWeight={800} fill={n.kind==='hub'?'#FFFFFF':'#153347'}>{n.kind==='bridge'?'+ BRIDGE':n.kind==='start'?'★ START':n.kind==='hub'?'HUB':n.kind==='merged'?'MERGED':n.kind==='apex'?'APEX':'ORIGINAL'}</text>
       <text x={p.x+CW-9} y={p.y+24} textAnchor="end" fontSize={8.5} fill={n.kind==='hub'?'#CBD5E1':'#526578'}>{'R'+n.row+' · '+n.og}</text>
       {shortLines(n.label,27,2).map((line,i)=><text key={i} x={p.x+10} y={p.y+43+i*13} fontSize={11} fontWeight={780} fill={primaryText}>{line}</text>)}
       <rect x={p.x+6} y={p.y+70} width={CW-12} height={CH-76} rx={5} fill={n.kind==='hub'?'#334155':'#F0F4F8'}/>
       {shortLines(n.passStandard,34,3).map((line,i,all)=><text key={i} x={p.x+11} y={p.y+(all.length===3?82:all.length===2?87:92)+i*11} fontSize={all.length===3?8.2:9} fill={n.kind==='hub'?'#EFF6FF':'#334155'}>{line}</text>)}
      </g>;
     })}
     <g aria-label="Poster legend and exit-standard note">
      <rect x={18} y={TOP+11*PY+18} width={WIDTH-36} height={74} rx={9} fill="#FFFFFF" stroke="#CAD5E1"/>
      <text x={34} y={TOP+11*PY+41} fontSize={12} fontWeight={850} fill="#152333">READ THE TREE</text>
      {[
       ['#334155','Primary path · 55'],
       ['#0072B2','Cross-skill · 9'],
       ['#D55E00','Reconciled · 1'],
       ['#64748B','Chart prerequisite · 8'],
       ['#0F766E','Added support · 20']
      ].map(([color,label],i)=><g key={label}><line x1={194+i*324} y1={TOP+11*PY+36} x2={222+i*324} y2={TOP+11*PY+36} stroke={color} strokeWidth={2.5}/><text x={230+i*324} y={TOP+11*PY+40} fontSize={11} fontWeight={700} fill="#334155">{label}</text></g>)}
      <text x={34} y={TOP+11*PY+68} fontSize={10} fill="#475569">SOLID = chart progression or explicit connection · DASHED = inferred / added coaching link · YELLOW = chart starting position · IN-CARD FOOTER = milestone benchmark, not a daily set</text>
     </g>
    </svg>
   </div>
   <div className="master-map-poster-bottom"><label><input type="checkbox" checked={tracing} onChange={e=>setTracing(e.target.checked)}/> Highlight prerequisites and next steps</label><button type="button" onClick={()=>setView('focus')}><Target size={15}/> See selected skill</button></div>
   <SkillDetails key={selectedId} node={selected} lane={laneInfo} linked={linked} progress={progress} prereqs={directPrereqs} next={nextSteps} onChoose={selectNode} upstream={prereqs.size} downstream={unlocks.size}/>
  </section>}
  <div className="master-map-note"><ShieldAlert size={18}/><p><strong>Training note:</strong> A pass standard is a goal for evaluating the next step, not a daily workout target or proof of safe readiness. Chart tiers and links are coaching references. Progress depends on technique, recovery, equipment and comfort, not a fixed calendar.</p></div>
 </Wrapper>;
}

function SkillDetails({node,lane,linked,progress,prereqs,next,onChoose,upstream,downstream}:{
 node:Node;lane:Lane;linked:ReturnType<typeof exerciseBySlug.get>;progress:ReturnType<typeof nodeProgress>|null;
 prereqs:Edge[];next:Edge[];onChoose:(id:string)=>void;upstream:number;downstream:number
}){
 const exact=node.mapping==='exact'&&!!linked;
 const [maxHold,setMaxHold]=useState('');
 const isHold=/planche|lever|flag|stand|l-sit|hang|wall sit|support|hold/i.test(node.label)&&!/(push-up|pull-up|dip|squat|curl|press to handstand)/i.test(node.label);
 const max=Number(maxHold);
 const holdRange=isHold&&Number.isFinite(max)&&max>=3&&max<=180?[Math.max(1,Math.round(max*.6)),Math.max(1,Math.round(max*.7))]:null;
 return <aside className="master-map-detail" id="master-selected-skill" aria-label="Selected skill details">
  <div className="master-map-detail-head" style={{'--master-accent':domainColors[node.domain].color} as CSSProperties}>
   <span className="master-map-breadcrumb">{lane.name} · Tier {node.row<=2?'I':node.row<=4?'II':node.row<=6?'III':node.row<=8?'IV':node.row<=10?'V':'VI'}</span>
   <h2>{node.label}</h2>
   <div className="master-map-tags"><span>{node.kind==='start'?'★ YOUR CHART START':node.kind==='bridge'?'ADDED SUPPORT':node.kind==='hub'?'FOUNDATION HUB':node.kind==='merged'?'MERGED SOURCE':node.kind==='apex'?'APEX':'ORIGINAL'}</span><span>{node.og}{node.og.includes('*')?' · estimated':''}</span></div>
  </div>
  <div className="master-map-standard"><span><Target size={16}/> CHECKPOINT · NOT A WORKOUT</span><strong>{node.passStandard}</strong></div>
  {isHold&&<details className="master-map-science master-map-dose">
    <summary><Target size={15}/> Optional hold-time planning example <ChevronDown size={14}/></summary>
    <p>For practice, the chart suggests using about 60–70% of a recent controlled maximum hold. This is one coaching method, not a fixed prescription or readiness guarantee.</p>
    <label>Controlled max hold, seconds <input type="number" min="3" max="180" step="1" value={maxHold} onChange={e=>setMaxHold(e.target.value)} placeholder="e.g. 10"/></label>
    {holdRange&&<p className="master-map-dose-result">Example working holds: <strong>{holdRange[0]}–{holdRange[1]} seconds</strong> per attempt, adjusted for technique and comfort. Your exit checkpoint above is a separate test.</p>}
   </details>}

  <div className="master-map-links">
   <Link to={'/skills/'+lane.path}>Open {lane.name} path <ArrowRight size={15}/></Link>
   <Link to={'/assessment?skill='+encodeURIComponent(lane.path)}>Check my level <ArrowRight size={15}/></Link>
  </div>
  {linked?<div className="master-map-video">
    <div className="master-map-video-heading"><TvMinimal size={18}/><strong>{exact?'Watch this exercise':'Watch a related exercise'}</strong></div>
    {!exact&&<p>This clip teaches a related movement, not necessarily this exact chart step.</p>}
    <InlineTlcTv key={node.id} exercise={linked} compact/>
    {exact&&<details className="master-map-more-technique"><summary><BookOpen size={15}/> How to do this exercise</summary><MovementOverview exercise={linked}/></details>}
   </div>:<div className="master-map-unmatched"><TvMinimal size={20}/><div><strong>Exact tutorial not connected yet</strong><p>The chart node is preserved. Find a matching exercise without substituting a different one.</p><Link to="/library" state={{search:node.label}}>Find a tutorial <ArrowRight size={14}/></Link></div></div>}
  {progress&&<p className="master-map-progress"><Check size={15}/> Your linked exercise: {progress.state} · {progress.logs.length} saved attempts. Chart pass standards are assessed separately.</p>}
  <div className="master-map-deps"><h3>How this skill connects</h3><div className="master-map-chain-count"><span>{upstream} earlier skills in its wider chain</span><span>{downstream} later skills</span></div>
   <div className="master-map-dependency"><h4>Useful preparation ({prereqs.length})</h4>{prereqs.map(edge=>{const n=nodeMap.get(edge.from)!;return <button type="button" key={edge.from+'-'+edge.type} onClick={()=>onChoose(n.id)}><span>{n.label}</span><small>{edge.type==='bridge'?'Added step':edge.type==='cross_implicit'?'Chart benchmark':edge.type==='reconciled'?'Reconciled link':'Skill link'}</small><ArrowRight size={14}/></button>;})}{!prereqs.length&&<p>This node has no incoming chart links.</p>}</div>
   <div className="master-map-dependency"><h4>What it builds toward ({next.length})</h4>{next.map(edge=>{const n=nodeMap.get(edge.to)!;return <button type="button" key={edge.to+'-'+edge.type} onClick={()=>onChoose(n.id)}><span>{n.label}</span><small>R{n.row}</small><ArrowRight size={14}/></button>;})}{!next.length&&<p>This node is a chart endpoint.</p>}</div>
  </div>
  <details className="master-map-science"><summary><ShieldAlert size={15}/> Coaching, safety & research notes <ChevronDown size={14}/></summary>
   <p>These benchmarks are transcribed or conservatively restated from the supplied chart. They should not be used as unmodified daily working-set prescriptions. Training volume should be individualized.</p>
   <p>For straight-arm loading, handbalancing, knee-dominant variations and Nordic eccentrics, increase load gradually. Avoid attempting new milestones through joint pain or unstable equipment.</p>
   <p>The chart's estimated Overcoming Gravity levels (marked *) are not official ratings. Cross-lane links are helpful coaching relationships, not automatic physical-clearance certificates.</p><p>The 14 cm knee-to-wall benchmark comes from the source chart; it is not a universal cutoff for pistol squat readiness. The front-lever one-leg / straddle ordering is also individual rather than an absolute difficulty ranking.</p>
   <a href="https://stevenlow.org/overcoming-gravity/" target="_blank" rel="noopener noreferrer">Overcoming Gravity · progressions <ArrowRight size={13}/></a>
   <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4532714/" target="_blank" rel="noopener noreferrer">Tendon loading · systematic review <ArrowRight size={13}/></a>
   <a href="https://pubmed.ncbi.nlm.nih.gov/40991853/" target="_blank" rel="noopener noreferrer">Nordic exercise dosing review <ArrowRight size={13}/></a>
  </details>
 </aside>;
}
