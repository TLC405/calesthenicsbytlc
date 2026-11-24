import type { ThumbnailExercise, ThumbnailSource } from './movementThumbnails';

/**
 * Local, original DBZ-inspired concept illustrations for catalog movements that
 * have no approved photo, clip or hand-reviewed illustration.
 * These are labeled conceptual thumbnails, never technique certification.
 */
type P = [number,number];
type Pose = {head:P,neck:P,shoulders:[P,P],elbows:[P,P],hands:[P,P],hips:P,knees:[P,P],feet:[P,P],tool?:string};
const P=(head:P,neck:P,shoulders:[P,P],elbows:[P,P],hands:[P,P],hips:P,knees:[P,P],feet:[P,P],tool?:string):Pose=>({head,neck,shoulders,elbows,hands,hips,knees,feet,tool});
const poses:Record<string,Pose>={
 stand:P([320,112],[320,153],[[292,177],[349,177]],[[272,228],[368,228]],[[279,268],[367,268]],[320,267],[[299,325],[348,325]],[[290,382],[352,382]]),
 hang:P([320,152],[320,190],[[296,202],[347,202]],[[277,155],[362,155]],[[283,67],[357,67]],[320,263],[[298,316],[342,316]],[[293,380],[346,380]],'bar'),
 onehang:P([317,155],[320,191],[[295,204],[346,203]],[[277,164],[363,255]],[[280,66],[373,275]],[320,268],[[299,317],[346,317]],[[295,380],[347,380]],'bar'),
 press:P([329,247],[329,281],[[304,284],[351,285]],[[283,315],[372,319]],[[271,355],[389,355]],[330,319],[[299,345],[364,345]],[[284,377],[382,377]]),
 plank:P([184,280],[217,278],[[251,270],[253,293]],[[305,310],[307,323]],[[335,350],[341,351]],[403,273],[[482,289],[477,313]],[[542,329],[544,344]]),
 row:P([193,233],[222,247],[[249,253],[261,269]],[[309,208],[306,292]],[[361,168],[358,321]],[404,273],[[479,288],[483,305]],[[544,325],[541,333]],'rings'),
 squat:P([325,160],[322,199],[[297,213],[345,213]],[[271,237],[367,244]],[[259,262],[380,268]],[328,282],[[282,306],[374,307]],[[278,372],[381,372]]),
 lunge:P([324,154],[324,192],[[295,211],[347,210]],[[278,255],[367,250]],[[285,275],[366,275]],[325,277],[[273,334],[379,339]],[[241,377],[444,378]]),
 seated:P([264,245],[267,275],[[240,288],[286,287]],[[201,315],[307,317]],[[214,350],[326,345]],[332,330],[[412,345],[462,349]],[[503,356],[528,355]]),
 curl:P([324,134],[326,168],[[295,188],[355,188]],[[275,225],[375,238]],[[305,228],[398,210]],[328,282],[[296,325],[352,325]],[[294,377],[362,377]],'dumbbell'),
 wrist:P([314,152],[315,184],[[287,199],[349,199]],[[280,249],[360,248]],[[272,306],[400,297]],[320,280],[[299,324],[349,324]],[[294,378],[354,378]],'wrist'),
 pinch:P([326,153],[321,187],[[291,208],[345,205]],[[276,255],[365,257]],[[280,287],[367,295]],[321,277],[[300,326],[350,326]],[[292,379],[354,379]],'plate'),
 band:P([321,163],[322,189],[[291,212],[351,212]],[[256,240],[380,240]],[[210,254],[426,254]],[322,282],[[295,326],[352,326]],[[288,377],[360,377]],'band'),
 yoga:P([207,298],[225,303],[[268,285],[260,310]],[[318,309],[313,322]],[[354,348],[350,351]],[405,300],[[455,319],[448,338]],[[485,375],[512,373]]),
 inverted:P([329,318],[325,279],[[301,256],[354,256]],[[288,311],[368,312]],[[284,371],[376,371]],[326,178],[[303,120],[346,122]],[[299,61],[355,61]]),
 bridge:P([174,307],[210,302],[[237,293],[241,308]],[[264,340],[265,344]],[[283,362],[289,366]],[343,247],[[442,253],[458,273]],[[511,348],[517,354]]),
 jump:P([323,125],[323,168],[[287,185],[353,183]],[[270,153],[388,167]],[[244,119],[418,126]],[323,258],[[267,285],[379,291]],[[228,319],[420,328]]),
 calf:P([321,153],[323,187],[[289,207],[352,207]],[[277,255],[371,254]],[[286,276],[371,276]],[326,284],[[300,328],[351,328]],[[294,379],[359,352]]),
 grip:P([325,150],[325,191],[[285,214],[355,214]],[[256,247],[382,248]],[[227,261],[413,259]],[325,283],[[303,324],[350,324]],[[298,380],[356,380]],'gripper')
};
const exact:Record<string,string>={
 'seated-forward-fold':'seated','worlds-greatest-stretch':'lunge',
 'bodyweight-row':'row','dip':'press','standard-push-up':'plank',
 'handstand':'inverted','planche':'plank','rto-support-hold':'hang',
 'bridge':'bridge','cat-cow-stretch':'yoga','childs-pose':'yoga','crow-pose-yoga':'press','downward-facing-dog':'inverted',
 'seated-pike-leg-lifts-1773317360868':'seated','seated-pike-leg-lifts-1773317361818':'seated',
 'tuck-planche-1768085453845':'plank','ring-l-sit':'seated','ring-dips':'press',
 'ring-push-ups':'plank','planche-lean-1768085452113':'plank',
 'advanced-tuck-planche-1768085455793':'plank','straddle-planche-1768085457054':'plank',
 'scapular-pulls':'hang','ring-rows':'row','plate-pinch-hold':'pinch',
 'block-pinch-hold':'pinch','gripper-crush':'grip','farmers-carry':'stand',
 'suitcase-carry':'stand','wrist-extension':'wrist','wrist-flexion':'wrist',
 'one-arm-assisted-hang':'onehang','one-arm-hang':'onehang',
 'tibialis-raise':'calf','single-leg-calf-raise':'calf','seated-calf-raise':'seated',
 'weighted-calf-raise':'calf','band-finger-extension':'band','grip-roller':'wrist',
 'wrist-pronation-supination':'wrist','straight-bar-dip':'press','wall-sit':'squat',
 'reverse-nordic-partial':'lunge','reverse-nordic':'lunge','dragon-pistol':'squat',
 'broad-jump':'jump','tuck-jump':'jump','skater-hop':'jump','single-leg-bound':'jump',
 'box-jump':'jump','depth-jump':'jump','one-leg-front-lever':'row',
 'straddle-front-lever':'row','sliding-leg-curl':'bridge','nordic-curl-negative':'yoga',
};
export const CONCEPT_ART_SLUGS=Object.keys(exact);
const escape=(s:string)=>s.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]||c));
const path=(a:P,b:P)=>`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`;
const segment=(a:P,b:P,color='#102446',width=17)=>`<path d="${path(a,b)}" stroke="${color}" stroke-width="${width+4}" stroke-linecap="round"/><path d="${path(a,b)}" stroke="#f3a05a" stroke-width="${width}" stroke-linecap="round"/>`;
const labelLines=(name:string)=>name.length>22?[name.slice(0,23).trim(),name.slice(23,50).trim()]:[name];
export function conceptArtwork(exercise:ThumbnailExercise):ThumbnailSource|null{
 const name=exercise.name.trim();const slug=exercise.slug;
 const pose=poses[exact[slug]||'stand'];
 if(!exact[slug]||!pose)return null;
 const hash=[...slug].reduce((a,c)=>(a*33+c.charCodeAt(0))>>>0,7);
 const primary=['#ff862e','#38b3f3','#f8b83d','#46c6a2','#d985ef'][hash%5];
 const secondary=['#15345d','#172d63','#24335c'][hash%3];
 const category=/Grip|finger|wrist|pinch|hang|gripper|carry/i.test(name)?'GRIP / FOREARM':/Ring|Row|Lever/i.test(name)?'RINGS / PULL':/Yoga|Stretch|Pose/i.test(name)?'MOBILITY':/Jump|Squat|Calf|Leg|Nordic/i.test(name)?'LEGS / POWER':'STRENGTH SKILLS';
 const texts=labelLines(name).map((x,i)=>`<text x="32" y="${341+i*33}" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="${name.length>25?'22':'27'}" font-weight="900" letter-spacing=".2">${escape(x)}</text>`).join('');
 const equip=pose.tool==='bar'?'<path d="M125 67 H510" stroke="#111e40" stroke-width="15" stroke-linecap="round"/><path d="M125 67 H510" stroke="#5fc8ff" stroke-width="6" stroke-linecap="round"/>':
  pose.tool==='rings'?'<path d="M361 83 V145 M358 321 V140" stroke="#194775" stroke-width="5"/><circle cx="360" cy="166" r="18" fill="none" stroke="#ffd277" stroke-width="10"/><circle cx="358" cy="322" r="19" fill="none" stroke="#ffd277" stroke-width="9"/>':
  pose.tool==='plate'?'<circle cx="369" cy="296" r="37" fill="#1d3257" stroke="#fbd77a" stroke-width="12"/><circle cx="369" cy="296" r="11" fill="#122347"/>':
  pose.tool==='gripper'?'<path d="M226 261 Q320 197 413 259" fill="none" stroke="#ffd765" stroke-width="14" stroke-linecap="round"/>':
  pose.tool==='band'?'<path d="M210 254 Q321 224 426 254" fill="none" stroke="#5ee6a0" stroke-width="9" stroke-dasharray="12 7"/>':
  pose.tool==='wrist'||pose.tool==='dumbbell'?'<rect x="390" y="275" width="47" height="14" rx="5" fill="#a7c8ff" stroke="#152d5f" stroke-width="3"/><rect x="384" y="262" width="14" height="38" rx="4" fill="#1c3765"/><rect x="434" y="262" width="14" height="38" rx="4" fill="#1c3765"/>':'';
 const body=`<g>${segment(pose.neck,pose.hips,'#102446',26)}
 ${segment(pose.shoulders[0],pose.shoulders[1],'#122347',22)}
 ${segment(pose.shoulders[0],pose.elbows[0])}${segment(pose.elbows[0],pose.hands[0],undefined,15)}
 ${segment(pose.shoulders[1],pose.elbows[1])}${segment(pose.elbows[1],pose.hands[1],undefined,15)}
 ${segment(pose.hips,pose.knees[0])}${segment(pose.knees[0],pose.feet[0])}
 ${segment(pose.hips,pose.knees[1])}${segment(pose.knees[1],pose.feet[1])}
 <circle cx="${pose.head[0]}" cy="${pose.head[1]}" r="27" fill="#f0a46f" stroke="#102446" stroke-width="7"/>
 <path d="M${pose.head[0]-25} ${pose.head[1]-10} Q${pose.head[0]} ${pose.head[1]-45} ${pose.head[0]+24} ${pose.head[1]-10}" fill="#122347" stroke="#122347" stroke-width="8"/>
 <path d="M${pose.shoulders[0][0]} ${pose.shoulders[0][1]+11} Q${pose.neck[0]} ${pose.neck[1]+29} ${pose.shoulders[1][0]} ${pose.shoulders[1][1]+11} L${pose.hips[0]+15} ${pose.hips[1]} L${pose.hips[0]-15} ${pose.hips[1]} Z" fill="#f88329" stroke="#132b59" stroke-width="6"/>
 <path d="M${pose.neck[0]-10} ${pose.neck[1]+48} h20" stroke="#2f69cb" stroke-width="7"/>
 </g>`;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
 <rect width="640" height="420" fill="${secondary}"/>
 <path d="M0 0 H640 V300 H0 Z" fill="#24497a"/>
 <path d="M0 20 L640 205 M0 98 L640 245 M640 24 L0 261" stroke="${primary}" opacity=".18" stroke-width="21"/>
 <path d="M80 315 L128 90 M562 315 L516 90" stroke="#6ab6e9" opacity=".18" stroke-width="16"/>
 <circle cx="330" cy="188" r="141" fill="none" stroke="${primary}" stroke-width="9" opacity=".28"/>
 ${equip}${body}
 <path d="M0 300 H640 V420 H0 Z" fill="#071935"/>
 <path d="M0 300 H640" stroke="${primary}" stroke-width="7"/>
 <rect x="22" y="14" width="${Math.min(294,35+category.length*11)}" height="31" rx="7" fill="${primary}"/>
 <text x="34" y="36" font-size="15" font-weight="900" font-family="Arial,sans-serif" fill="#0b1831">${escape(category)}</text>
 ${texts}
 <text x="615" y="405" text-anchor="end" fill="#bad7f5" font-family="Arial,sans-serif" font-size="11">CONCEPT ART · NOT FORM INSTRUCTION</text>
 </svg>`;
 return {src:'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg),scope:'illustration',label:'Art',title:name+' · custom conceptual thumbnail; not a certified exercise demonstration',url:null};
}
