import catalog from '@/data/publicExerciseCatalog.json';
import { SKILL_PATHS } from '@/data/skillPaths';
import { RULES, minimumTier } from '@/lib/trainingPolicy';
import { canonicalSlug } from '@/lib/exerciseProgressions';

type Exercise = (typeof catalog)[number];
export type EasierOption = {
  id: string;
  title: string;
  detail: string;
  slug?: string;
  source: 'curated' | 'progression' | 'setup';
};
export type ModificationPlan = {
  level: number;
  kind: 'foundation' | 'modified' | 'elite';
  options: EasierOption[];
  caution: string;
  hasNamedAlternative: boolean;
};

const known = new Map<string, Exercise>(catalog.map(e => [e.slug, e]));
const canonical = (slug:string) => canonicalSlug(slug);

/** Expert-curated substitutions from the existing 288-movement catalog.
 * These are optional ways to reduce demand, not proof of readiness or equivalent exercise prescriptions.
 */
const curated: Record<string, readonly string[]> = {
 'one-leg-front-lever':['advanced-tuck-front-lever-on-rings','tuck-front-lever'],
 'straddle-front-lever':['advanced-tuck-front-lever-on-rings','tuck-front-lever'],
 'sliding-leg-curl':['ring-hamstring-curl','glute-bridge'],
 'nordic-curl-negative':['sliding-leg-curl','ring-hamstring-curl'],
 'straight-bar-dip':['parallel-bar-dip','assisted-ring-support-hold'],
 'reverse-nordic-partial':['bodyweight-squat','wall-sit'],
 'reverse-nordic':['reverse-nordic-partial','bodyweight-squat'],
 'dragon-pistol':['pistol-squat','assisted-box-pistol-sit'],
 'broad-jump':['jump-squat','bodyweight-squat'],
 'tuck-jump':['jump-squat','bodyweight-squat'],
 'skater-hop':['bodyweight-squat','split-squat'],
 'single-leg-bound':['skater-hop','bodyweight-squat'],
 'box-jump':['jump-squat','bodyweight-squat'],
 'depth-jump':['box-jump','jump-squat'],
  'push-up':['incline-push-up','wall-push-up'],
  'standard-push-up':['incline-push-up','wall-push-up'],
  'wide-push-up':['incline-push-up','wall-push-up'],
  'diamond-push-up':['incline-push-up','push-up'],
  'decline-push-up':['push-up','incline-push-up'],
  'archer-push-up':['push-up','incline-push-up'],
  'pseudo-planche-push-up':['scapular-push-up','incline-push-up'],
  'one-arm-push-up':['incline-one-arm-push-up','push-up'],
  'incline-one-arm-push-up':['push-up','incline-push-up'],
  'ring-push-up':['incline-push-up','push-up'],
  'ring-push-ups':['incline-push-up','push-up'],
  'ring-push-up-turnout':['ring-push-ups','incline-push-up'],
  'pike-push-up':['incline-pike-push-up','wall-support-shrug'],
  'elevated-pike-push-up':['incline-pike-push-up','pike-push-up'],
  'handstand-push-up':['partial-rom-wall-hspu','pike-push-up'],
  'partial-rom-wall-hspu':['pike-push-up','wall-support-shrug'],
  'wall-hspu-negative':['pike-push-up','wall-support-shrug'],
  'tiger-bend-pushup':['incline-pike-push-up','pike-push-up'],
  'dip':['assisted-ring-dip','incline-push-up'],
  'ring-dip':['assisted-ring-dip','ring-support-hold'],
  'ring-dips':['assisted-ring-dip','assisted-ring-support-hold'],
  'ring-dip-negative':['assisted-ring-dip','ring-support-hold'],
  'parallel-bar-dip':['assisted-ring-support-hold','incline-push-up'],
  'pull-up':['band-assisted-pull-up','australian-row'],
  'chin-up':['band-assisted-pull-up','australian-row'],
  'archer-pull-up':['pull-up','band-assisted-pull-up'],
  'typewriter-pull-up':['pull-up','band-assisted-pull-up'],
  'weighted-pull-up':['pull-up','band-assisted-pull-up'],
  'one-arm-chin-up':['archer-pull-up','band-assisted-pull-up'],
  'muscle-up':['band-assisted-pull-up','ring-muscle-up-transition-drill'],
  'ring-muscle-up':['low-ring-muscle-up-assisted','ring-muscle-up-transition-drill'],
  'low-ring-muscle-up-assisted':['ring-muscle-up-transition-drill','ring-row'],
  'australian-row':['incline-ring-row','ring-row'],
  'bodyweight-row':['incline-ring-row','ring-row'],
  'archer-ring-row':['ring-row','incline-ring-row'],
  'feet-elevated-ring-row':['ring-row','incline-ring-row'],
  'false-grip-ring-row':['ring-row','incline-ring-row'],
  'ring-biceps-curl':['incline-ring-row','ring-row'],
  'ring-face-pull':['ring-scapular-row','ring-row'],
  'ring-triceps-extension':['ring-push-ups','incline-push-up'],
  'ring-body-saw':['plank','dead-bug'],
  'ring-fallout':['plank','dead-bug'],
  'ring-hamstring-curl':['glute-bridge','ring-assisted-deep-squat'],
  'bodyweight-squat':['ring-assisted-deep-squat'],
  'lunge':['split-squat','ring-assisted-deep-squat'],
  'reverse-lunge':['split-squat','ring-assisted-deep-squat'],
  'bulgarian-split-squat':['split-squat','ring-assisted-deep-squat'],
  'cossack-squat':['ring-assisted-deep-squat','bodyweight-squat'],
  'pistol-squat':['assisted-box-pistol-sit','ring-assisted-pistol-squat'],
  'assisted-pistol-squat':['assisted-box-pistol-sit','split-squat'],
  'ring-assisted-pistol-squat':['assisted-box-pistol-sit','split-squat'],
  'shrimp-squat':['assisted-box-pistol-sit','split-squat'],
  'nordic-curl':['ring-hamstring-curl','glute-bridge'],
  'single-leg-rdl':['glute-bridge','split-squat'],
  'sissy-squat':['bodyweight-squat','split-squat'],
  'jump-squat':['bodyweight-squat','ring-assisted-deep-squat'],
  'single-leg-calf-raise':['calf-raise','seated-calf-raise'],
  'weighted-calf-raise':['single-leg-calf-raise','calf-raise'],
  'hollow-body-hold':['dead-bug','tuck-sit'],
  'l-sit':['tuck-sit','l-sit-tuck-hold'],
  'one-leg-l-sit':['tuck-sit','l-sit-tuck-hold'],
  'ring-l-sit':['ring-tuck-hold','tuck-sit'],
  'ring-l-sit-hold':['ring-tuck-hold','tuck-sit'],
  'v-sit-preparation':['tuck-sit','seated-pike-lift'],
  'hanging-leg-raise':['ring-knee-raise','dead-bug'],
  'toes-to-bar':['ring-knee-raise','dead-bug'],
  'v-up':['dead-bug','hollow-body-hold'],
  'windshield-wiper':['dead-bug','side-plank'],
  'dragon-flag':['hollow-body-hold','dead-bug'],
  'l-sit-to-handstand':['tuck-sit','pike-support-hold'],
  'straddle-press-to-hs':['stalder-toe-assisted-press','seated-straddle-compression-lift'],
  'stalder-press-to-hs':['stalder-feet-assisted-hip-lift','seated-straddle-compression-lift'],
  'elevated-straddle-press':['stalder-toe-assisted-press','seated-straddle-lift'],
  'handstand':['chest-to-wall-handstand','wall-support-shrug'],
  'freestanding-handstand':['chest-to-wall-handstand','wall-support-shrug'],
  'handstand-walking':['chest-to-wall-handstand','wall-support-shrug'],
  'wall-handstand-shoulder-taps':['wall-support-shrug','chest-to-wall-handstand'],
  'wall-handstand':['chest-to-wall-handstand','wall-support-shrug'],
  'back-lever':['ring-back-lever-tuck','active-hang'],
  'front-lever':['tuck-front-lever','active-hang'],
  'front-lever-raise':['tuck-front-lever','active-hang'],
  'human-flag':['feet-assisted-human-flag','vertical-human-flag'],
  'vertical-human-flag':['feet-assisted-human-flag','side-plank'],
  'tuck-human-flag':['feet-assisted-human-flag','side-plank'],
  'straddle-human-flag':['feet-assisted-human-flag','side-plank'],
  'full-planche':['advanced-tuck-planche','tuck-planche'],
  'planche':['advanced-tuck-planche','tuck-planche'],
  'straddle-planche':['advanced-tuck-planche','tuck-planche'],
  'advanced-tuck-planche':['tuck-planche','planche-lean'],
  'tuck-planche':['band-assisted-tuck-planche','planche-lean'],
  'elbow-lever':['assisted-elbow-lever','supported-crow-balance'],
  'single-arm-elbow-lever':['assisted-elbow-lever','supported-crow-balance'],
  'crow-pose':['supported-crow-balance','frog-stand'],
  'iron-cross':['short-lever-iron-cross','assisted-ring-support-hold'],
  'maltese':['tuck-planche','planche-lean'],
  'manna':['tuck-sit','seated-straddle-lift'],
  'victorian-cross':['tuck-front-lever','active-hang'],
  '360-pull':['band-assisted-pull-up','active-hang'],
  'skin-the-cat':['skin-the-cat-preparation','active-hang'],
  'german-hang':['german-hang-preparation','active-hang'],
  'middle-split':['middle-split-frog-stretch','frog-stretch'],
  'front-split':['front-split-preparation','couch-stretch'],
  'middle-split-hold':['middle-split-frog-stretch','frog-stretch'],
  'pancake-stretch':['straddle-stretch','seated-forward-fold'],
  'pancake-good-morning':['seated-forward-fold','pike-stretch'],
  'wheel-pose':['shoulder-bridge','bridge-pose'],
  'warrior-iii':['tree-pose','warrior-ii'],
  'half-moon-pose':['triangle-pose','tree-pose'],
  'penche':['arabesque-hold','tree-pose'],
  'needle':['seated-forward-fold','couch-stretch'],
  'one-arm-hang':['one-arm-assisted-hang','dead-hang'],
  'one-arm-assisted-hang':['towel-hang','dead-hang'],
  'towel-hang':['dead-hang','active-hang'],
  'block-pinch-hold':['plate-pinch-hold'],
  'false-grip-ring-hang':['dead-hang','active-hang'],
  'grip-roller':['wrist-extension','wrist-flexion'],
  'gripper-crush':['plate-pinch-hold','band-finger-extension'],
  'weighted-carry':['farmers-carry'],
};

/** Setup cues apply where no named exercise directly matches. They are deliberately
 * conservative, avoid certifying equivalent load and never authorize an elite skill.
 */
function setupOptions(exercise:Exercise): EasierOption[]{
 const slug=exercise.slug.toLowerCase(), name=exercise.name.toLowerCase(), cat=exercise.category.toLowerCase();
 const make=(title:string,detail:string,id:string):EasierOption=>({id:'setup-'+id,title,detail,source:'setup'});
 if(/muscle.up|iron.cross|maltese|victorian|planche|human.flag|front.lever|back.lever|handstand|headstand|forearm.stand|elbow.stand|stalder|inversion|360.pull|german.hang|skin.the.cat|ringmaster/.test(slug))
  return [make('Build supported prerequisites','Use the linked foundation or assisted variation first. For inversions confirm a reliable exit; for rings and straight-arm skills do not improvise load-bearing support.','skill'),
   make('Keep the lever manageable','Reduce leverage or resistance only with an established, supervised setup. Do not force joint range or attempt a full skill before strength and control are repeatable.','lever')];
 if(/nordic|curl|hamstring|hinge|rdl|bridge/.test(slug))
  return [make('Shorter comfortable range','Use a range you can control without collapsing or pushing into joint discomfort.','range'),make('Add reliable support','Use stable hand support or a lighter resistance where the variation allows; choose the linked foundation for heavier eccentric drills.','support')];
 if(/jump|explosive|kip|grand.battement/.test(slug))
  return [make('Remove the jump or impact','Practice the corresponding controlled, non-impact movement. Landings and takeoffs should not be forced.','impact'),make('Reduce speed and height','Move steadily through the comfortable range first; only reintroduce speed when control is repeatable.','tempo')];
 if(cat==='legs'||/squat|lunge|pistol|calf|step.up|plie|releve/.test(slug))
  return [make('Hold a stable support','Use a wall, rail or secure rings for light balance assistance, without pulling yourself into extra depth.','support'),make('Work a comfortable depth','Reduce depth or step height; keep knees and feet controlled and build range gradually.','range')];
 if(cat==='pull'||/pull.up|row|chin.up|hang|grip|carry/.test(slug))
  return [make('Reduce bodyweight or resistance','Use an approved band, foot-supported row or lighter implement, with secure anchor points.','assistance'),make('Shorten the effort','Choose fewer controlled reps or shorter holds rather than losing your grip or swinging.','volume')];
 if(cat==='push'||/push.up|dip|press|scapular/.test(slug))
  return [make('Use an incline or assistance','Raise the hands on a stable surface, or use an appropriate supported variation to reduce the pressing load.','incline'),make('Reduce range and effort','Stay inside a controlled, pain-free range and stop before technique breaks down.','range')];
 if(cat==='core'||/plank|sit|leg.raise|compression|hollow|v.up/.test(slug))
  return [make('Bend the knees','Shorten the leg lever, keep your trunk stable and avoid pulling through the low back.','lever'),make('Add floor or foot support','Use a supported position, lighter hold or a smaller controlled range before moving to a long lever.','support')];
 if(cat==='grip'||/pinch|wrist|finger|farmer/.test(slug))
  return [make('Lighten the grip demand','Use a lighter object, a wider grip surface or two-handed assistance where appropriate.','load'),make('Shorten the hold','Release before grip fails and record the actual duration and implement.','time')];
 if(cat==='rings')
  return [make('Keep feet supported','Set rings at a suitable height and put part of your weight through feet on a secure floor, where appropriate.','rings'),make('Shorten the lever','Keep the body more upright and reduce instability instead of chasing extra depth.','lever')];
 if(cat==='flexibility'||cat==='mobility'||cat==='yoga')
  return [make('Use props for support','Use a wall, blocks, cushion or stable chair only as appropriate to the movement. Avoid forcing the position.','props'),make('Work a smaller range','Stay in a comfortable range and breathe normally. Avoid bouncing or pulling into pain.','range')];
 return [make('Reduce the demand','Choose a smaller controllable range, a stable support or a lighter load where appropriate to the specific movement.','general'),
  make('Practice fewer quality reps','Start with a short effort and stop when alignment deteriorates rather than completing a fixed target.','volume')];
}

export function movementModifications(slug:string):ModificationPlan {
 const original=known.get(slug)||known.get(canonical(slug));
 const level=minimumTier(slug);
 if(!original)return {level,kind:'foundation',options:[],hasNamedAlternative:false,caution:'This custom movement needs a coach-reviewed modification before it can be treated as a validated substitute.'};
 if(level===1)return {level,kind:'foundation',options:[],hasNamedAlternative:false,
   caution:'This is a starting-level movement. Choose a comfortable range, use stable support when appropriate, and stop for joint pain. No easier movement is required.'};
 const elite=level===5;
 const canonicalSlugValue=canonical(slug);
 const slugs:string[]=[];
 const add=(s?:string|null)=>{
  if(!s)return;const normalized=canonical(s);
  if(normalized===canonicalSlugValue||slugs.includes(normalized)||!known.has(normalized))return;
  const proposedLevel=minimumTier(normalized);
  if(proposedLevel>level)return;
  slugs.push(normalized);
 };
 for(const s of curated[canonicalSlugValue]||curated[slug]||[])add(s);
 add(RULES[canonicalSlugValue]?.regression);
 // Sequential progressions are candidates; collections are not ordered ladders.
 for(const path of SKILL_PATHS.filter(p=>p.kind!=='collection'&&p.slugs.includes(canonicalSlugValue))){
  const idx=path.slugs.indexOf(canonicalSlugValue);
  for(let i=idx-1;i>=0&&slugs.length<3;i--)add(path.slugs[i]);
 }
 const exercise=original;
 const options:EasierOption[]=slugs.slice(0,3).map((s,i)=>({
  id:'named-'+s,slug:s,title:known.get(s)!.name,
  detail:elite?'Review this prerequisite separately; it is not clearance to attempt the elite skill.':
   i===0?'An easier linked movement to inspect and choose if it fits your current checks.':'Another lower-demand option from the catalog.',
  source:(curated[canonicalSlugValue]||[]).includes(s)?'curated':'progression'
 }));
 if(!elite){
  const remaining=Math.max(0,3-options.length);
  options.push(...setupOptions(exercise).slice(0,remaining));
 }
 return {
  level,kind:elite?'elite':'modified',options,hasNamedAlternative:slugs.length>0,
  caution:elite?'Elite skills do not have automatic safe shortcuts. Build verified prerequisites with a secure setup and experienced spotting where appropriate.':
   'These are optional regressions—not certified equivalents. Choose a pain-free variation that meets your equipment and readiness checks; no workout is added automatically.'
 };
}
