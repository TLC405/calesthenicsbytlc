/** Deterministic metro-style routing for the 13-lane master skill tree.
 * Source method: user-provided Matplotlib poster (ordered ports + horizontal
 * inter-row tracks + vertical inter-lane aisles). Doesn't claim that all
 * pairwise connector crossings have been mathematically eliminated.
 */
export type RouteNode={id:string;lane:string;row:number};
export type RouteEdge={from:string;to:string;type:string};
export type RouteLane={id:string};
export type RouteGeometry={left:number;top:number;colPitch:number;rowPitch:number;cardWidth:number;cardHeight:number};
type Point=[number,number];
type Plan={mode:'direct'|'single'|'bypass'|'multi';xs:number;ys:number;xe:number;ye:number;rowOut?:number;rowIn?:number;aisle?:number};
type HTrack={index:number;role:'mid'|'out'|'in';span:number;startX:number};
type VTrack={index:number;fromRow:number;toRow:number};
export type RoutedEdge={d:string;points:Point[];edge:RouteEdge};
const precision=(value:number)=>Math.round(value*100)/100;
function roundedOrtho(points:Point[],radius=6){
 if(points.length<2)return '';
 const unique=points.filter((p,i)=>i===0||p[0]!==points[i-1][0]||p[1]!==points[i-1][1]);
 if(unique.length<2)return '';
 let d='M '+precision(unique[0][0])+' '+precision(unique[0][1]);
 for(let i=1;i<unique.length-1;i++){
  const [ax,ay]=unique[i-1],[bx,by]=unique[i],[cx,cy]=unique[i+1];
  const a=Math.hypot(bx-ax,by-ay),b=Math.hypot(cx-bx,cy-by);
  if(!a||!b)continue;
  const inX=(bx-ax)/a,inY=(by-ay)/a,outX=(cx-bx)/b,outY=(cy-by)/b;
  const cross=Math.abs(inX*outY-inY*outX);
  if(cross<0.005){d+=' L '+precision(bx)+' '+precision(by);continue;}
  const r=Math.min(radius,a*.35,b*.35);
  const x1=bx-inX*r,y1=by-inY*r,x2=bx+outX*r,y2=by+outY*r;
  d+=' L '+precision(x1)+' '+precision(y1)+' Q '+precision(bx)+' '+precision(by)+' '+precision(x2)+' '+precision(y2);
 }
 const last=unique[unique.length-1];return d+' L '+precision(last[0])+' '+precision(last[1]);
}
export function routeMasterTree(nodes:RouteNode[],edges:RouteEdge[],lanes:readonly RouteLane[],geo:RouteGeometry):RoutedEdge[]{
 const lookup=new Map(nodes.map(n=>[n.id,n]));
 const laneIndex=new Map(lanes.map((lane,i)=>[lane.id,i]));
 const coordinate=(node:RouteNode)=>{
  const index=laneIndex.get(node.lane)!;
  const x=geo.left+index*geo.colPitch+(geo.colPitch-geo.cardWidth)/2;
  const y=geo.top+(11-node.row)*geo.rowPitch+14;
  return {x,y,cx:x+geo.cardWidth/2,top:y,bottom:y+geo.cardHeight,index};
 };
 const occupied=new Set(nodes.map(n=>n.lane+':'+n.row));
 const outs=new Map<string,number[]>(),ins=new Map<string,number[]>();
 edges.forEach((e,i)=>{outs.set(e.from,[...(outs.get(e.from)||[]),i]);ins.set(e.to,[...(ins.get(e.to)||[]),i]);});
 const sourcePort=new Map<number,number>(),targetPort=new Map<number,number>();
 for(const [id,indices] of outs){
  const sorted=[...indices].sort((a,b)=>{
   const av=lookup.get(edges[a].to)!,bv=lookup.get(edges[b].to)!;
   return laneIndex.get(av.lane)!-laneIndex.get(bv.lane)!||av.row-bv.row||a-b;
  });
  const center=coordinate(lookup.get(id)!).cx;
  const spread=sorted.length>1?Math.min(15,82/(sorted.length-1)):0;
  sorted.forEach((index,k)=>sourcePort.set(index,center+(k-(sorted.length-1)/2)*spread));
 }
 for(const [id,indices] of ins){
  const sorted=[...indices].sort((a,b)=>{
   const av=lookup.get(edges[a].from)!,bv=lookup.get(edges[b].from)!;
   return laneIndex.get(av.lane)!-laneIndex.get(bv.lane)!||bv.row-av.row||a-b;
  });
  const center=coordinate(lookup.get(id)!).cx;
  const spread=sorted.length>1?Math.min(15,82/(sorted.length-1)):0;
  sorted.forEach((index,k)=>targetPort.set(index,center+(k-(sorted.length-1)/2)*spread));
 }
 const plans:Plan[]=[];
 const tracksByRow=new Map<number,HTrack[]>(),tracksByAisle=new Map<number,VTrack[]>();
 const addH=(row:number,track:HTrack)=>tracksByRow.set(row,[...(tracksByRow.get(row)||[]),track]);
 const addV=(aisle:number,track:VTrack)=>tracksByAisle.set(aisle,[...(tracksByAisle.get(aisle)||[]),track]);
 edges.forEach((edge,index)=>{
  const from=lookup.get(edge.from)!,to=lookup.get(edge.to)!;
  const p=coordinate(from),q=coordinate(to);
  const xs=sourcePort.get(index)!,ys=p.top,xe=targetPort.get(index)!,ye=q.bottom+2;
  if(from.lane===to.lane){
   let blocked=false;for(let row=from.row+1;row<to.row;row++){if(occupied.has(from.lane+':'+row)){blocked=true;break;}}
   if(!blocked){plans[index]={mode:'direct',xs,ys,xe,ye};return;}
   const aisle=p.index===0?1:p.index;
   addH(from.row,{index,role:'out',span:0,startX:xs});
   addH(to.row-1,{index,role:'in',span:0,startX:xe});
   addV(aisle,{index,fromRow:from.row,toRow:to.row});
   plans[index]={mode:'bypass',xs,ys,xe,ye,rowOut:from.row,rowIn:to.row-1,aisle};return;
  }
  const span=Math.abs(p.index-q.index);
  if(to.row===from.row+1){
   addH(from.row,{index,role:'mid',span,startX:Math.min(xs,xe)});
   plans[index]={mode:'single',xs,ys,xe,ye,rowOut:from.row};return;
  }
  const aisle=q.index>p.index?q.index:q.index+1;
  addH(from.row,{index,role:'out',span,startX:Math.min(xs,xe)});
  addH(to.row-1,{index,role:'in',span,startX:Math.min(xs,xe)});
  addV(aisle,{index,fromRow:from.row,toRow:to.row});
  plans[index]={mode:'multi',xs,ys,xe,ye,rowOut:from.row,rowIn:to.row-1,aisle};
 });
 const horz=new Map<string,number>();
 for(const [row,tracks] of tracksByRow){
  const upperRowY=geo.top+(11-(row+1))*geo.rowPitch+14+geo.cardHeight;
  const lowerRowY=geo.top+(11-row)*geo.rowPitch+14;
  const low=upperRowY+5,high=lowerRowY-5;
  const sorted=[...tracks].sort((a,b)=>a.span-b.span||a.startX-b.startX||a.index-b.index);
  sorted.forEach((track,k)=>{
   const y=sorted.length===1?(low+high)/2:low+k*(high-low)/(sorted.length-1);
   horz.set(track.index+':'+track.role,y);
  });
 }
 const vert=new Map<number,number>();
 for(const [aisle,tracks] of tracksByAisle){
  const previous=coordinate({id:'',lane:lanes[Math.max(0,aisle-1)].id,row:1});
  const next=coordinate({id:'',lane:lanes[Math.min(lanes.length-1,aisle)].id,row:1});
  const low=aisle===0?next.x-32:previous.x+geo.cardWidth;
  const high=aisle===lanes.length?previous.x+geo.cardWidth+32:next.x;
  const xLow=low+5,xHigh=high-5;
  const sorted=[...tracks].sort((a,b)=>(a.toRow-a.fromRow)-(b.toRow-b.fromRow)||a.fromRow-b.fromRow||a.index-b.index);
  sorted.forEach((track,k)=>vert.set(track.index,sorted.length===1?(xLow+xHigh)/2:xLow+k*(xHigh-xLow)/(sorted.length-1)));
 }
 return edges.map((edge,index)=>{
  const plan=plans[index];const {xs,ys,xe,ye}=plan;
  let points:Point[];
  if(plan.mode==='direct'){
   if(Math.abs(xs-xe)<.2)points=[[xs,ys],[xe,ye]];
   else{const mid=(ys+ye)/2;points=[[xs,ys],[xs,mid],[xe,mid],[xe,ye]];}
  }else if(plan.mode==='single'){
   const y=horz.get(index+':mid')!;
   points=[[xs,ys],[xs,y],[xe,y],[xe,ye]];
  }else{
   const y1=horz.get(index+':out')!,y2=horz.get(index+':in')!,x=vert.get(index)!;
   points=[[xs,ys],[xs,y1],[x,y1],[x,y2],[xe,y2],[xe,ye]];
  }
  return {edge,points,d:roundedOrtho(points)};
 });
}
