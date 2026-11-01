import publicCatalog from '@/data/publicExerciseCatalog.json';

/** Real catalog only. Workout presets are editorial suggestions, not athlete assessments. */
export type SkillLevel = 'foundation' | 'building' | 'advanced';
export type SkillMinutes = 15 | 25 | 40;
export type WorkoutPhase = 'warmup' | 'skill' | 'support' | 'cooldown';
export type SkillMetric = 'reps' | 'seconds';
export interface SkillExercise {
  id: string;
  slug: string;
  name: string;
  category: string;
  primary_muscles: string[];
  secondary_muscles?: string[];
  equipment?: string[];
  cues?: unknown;
  youtube_url?: string | null;
  image_url?: string | null;
  difficulty_level?: number | null;
}
export interface SkillWorkoutItem {
  key: string;
  phase: WorkoutPhase;
  exercise: SkillExercise;
  sets: number;
  target: number;
  metric: SkillMetric;
}
interface SkillGoal {
  id: string;
  title: string;
  detail: string;
  equipment: string;
  warmup: readonly string[];
  main: Record<SkillLevel, readonly string[]>;
  support: readonly string[];
  cooldown: readonly string[];
}
export const SKILL_GOALS: readonly SkillGoal[] = [
  {
    id: 'planche', title: 'Planche', detail: 'Straight-arm strength and control', equipment: 'Floor · optional parallettes',
    warmup: ['wrist-circles','shoulder-cars','cat-cow'],
    main: {
      foundation: ['planche-lean','frog-stand','planche-plank'],
      building: ['tuck-planche','planche-lean','parallette-tuck-planche'],
      advanced: ['advanced-tuck-planche','straddle-planche','full-planche'],
    },
    support: ['pseudo-planche-push-up','hollow-body-hold','push-up'],
    cooldown: ['child-s-pose','cat-cow','wrist-circles','shoulder-cars'],
  },
  {
    id: 'straddle-press', title: 'Straddle Press', detail: 'Compression into a handstand', equipment: 'Floor · wall · optional parallettes',
    warmup: ['wrist-circles','straddle-stretch','shoulder-cars'],
    main: {
      foundation: ['seated-pike-lift','seated-straddle-lift','press-hs-journey'],
      building: ['elevated-chair-compression','press-hs-journey','straddle-hs-kick-up'],
      advanced: ['straddle-press-to-hs','stalder-press-to-hs','l-sit-to-handstand'],
    },
    support: ['seated-straddle-compression-lift','chest-to-wall-handstand','hollow-body-hold'],
    cooldown: ['pancake-stretch','seated-forward-fold','child-s-pose'],
  },
  {
    id: 'handstand', title: 'Handstand', detail: 'Inversion, balance and line', equipment: 'Wall · clear floor',
    warmup: ['wrist-circles','shoulder-cars','cat-cow'],
    main: {
      foundation: ['wall-handstand','chest-to-wall-handstand','handstand-bail'],
      building: ['chest-to-wall-handstand-hold','handstand-heel-pull','freestanding-handstand-kick-up'],
      advanced: ['freestanding-handstand','wall-pull-aways','handstand-heel-pull'],
    },
    support: ['pike-push-up','hollow-body-hold','wall-handstand-shoulder-taps'],
    cooldown: ['child-s-pose','cat-cow','shoulder-cars','wrist-circles'],
  },
  {
    id: 'front-lever', title: 'Front Lever', detail: 'Horizontal pulling and hollow tension', equipment: 'Pull-up bar · optional rings',
    warmup: ['shoulder-cars','scapular-pull-up','cat-cow'],
    main: {
      foundation: ['ring-scapular-row','australian-row','tuck-front-lever'],
      building: ['tuck-front-lever','front-lever-raise','tuck-front-lever-on-rings'],
      advanced: ['front-lever','front-lever-raise','advanced-tuck-front-lever-on-rings'],
    },
    support: ['pull-up','hollow-body-hold','ring-row'],
    cooldown: ['child-s-pose','shoulder-cars','cat-cow'],
  },
  {
    id: 'ring-muscle-up', title: 'Ring Muscle-Up', detail: 'False grip, transition, dip', equipment: 'Gymnastic rings',
    warmup: ['shoulder-cars','ring-scapular-depression','wrist-circles'],
    main: {
      foundation: ['assisted-ring-support-hold','false-grip-ring-row','low-ring-muscle-up-assisted'],
      building: ['false-grip-ring-hang','ring-muscle-up-transition-drill','low-ring-muscle-up-assisted'],
      advanced: ['ring-muscle-up-transition-drill','ring-muscle-up','ring-dip-negative'],
    },
    support: ['assisted-ring-dip','ring-row','ring-support-hold'],
    cooldown: ['child-s-pose','shoulder-cars','cat-cow'],
  },
  {
    id: 'hspu', title: 'Handstand Push-Up', detail: 'Vertical pressing strength', equipment: 'Wall · floor',
    warmup: ['wrist-circles','shoulder-cars','cat-cow'],
    main: {
      foundation: ['pike-push-up','chest-to-wall-handstand','push-up'],
      building: ['pike-push-up','handstand-push-up','wall-handstand-shoulder-taps'],
      advanced: ['handstand-push-up','freestanding-handstand','bent-arm-handstand'],
    },
    support: ['parallel-bar-dip','hollow-body-hold','pseudo-planche-push-up'],
    cooldown: ['child-s-pose','shoulder-cars','wrist-circles'],
  },
  {
    id: 'l-sit', title: 'L-Sit', detail: 'Hip compression and support', equipment: 'Floor · optional parallettes',
    warmup: ['seated-pike-lift','cat-cow','straddle-stretch'],
    main: {
      foundation: ['tuck-sit','l-sit-tuck-hold','seated-pike-lift'],
      building: ['l-sit-tuck-hold','l-sit','elevated-chair-compression'],
      advanced: ['l-sit','ring-l-sit-hold','l-sit-to-handstand'],
    },
    support: ['seated-pike-lift','hollow-body-hold','ring-knee-raise'],
    cooldown: ['pike-stretch','seated-forward-fold','child-s-pose'],
  },
  {
    id: 'pistol', title: 'Pistol Squat', detail: 'Single-leg strength and mobility', equipment: 'Floor · optional rings for assistance',
    warmup: ['wall-ankle-dorsiflexion','90-90-hip-switches','deep-squat-hold'],
    main: {
      foundation: ['split-squat','reverse-lunge','bodyweight-squat'],
      building: ['assisted-pistol-squat','bulgarian-split-squat','pistol-squat'],
      advanced: ['pistol-squat','shrimp-squat','cossack-squat'],
    },
    support: ['glute-bridge','cossack-squat','split-squat'],
    cooldown: ['couch-stretch','wall-ankle-dorsiflexion','seated-forward-fold'],
  },
];
export const findSkillGoal = (id: string) => SKILL_GOALS.find(g => g.id === id);

const catalog = new Map<string, SkillExercise>(
  (publicCatalog as SkillExercise[]).map(exercise => [exercise.slug, exercise])
);

const timedSlugs = new Set([
  'planche-lean','planche-plank','frog-stand','parallette-tuck-planche','tuck-planche',
  'advanced-tuck-planche','straddle-planche','full-planche','hollow-body-hold',
  'wall-handstand','chest-to-wall-handstand','chest-to-wall-handstand-hold',
  'handstand-heel-pull','freestanding-handstand','ring-support-hold',
  'assisted-ring-support-hold','false-grip-ring-hang','tuck-front-lever','front-lever',
  'tuck-front-lever-on-rings','advanced-tuck-front-lever-on-rings',
  'tuck-sit','l-sit','l-sit-tuck-hold','ring-l-sit-hold','deep-squat-hold',
  'straddle-stretch','pancake-stretch','pike-stretch','couch-stretch',
  'seated-forward-fold','child-s-pose','wall-ankle-dorsiflexion'
]);
function isTimed(slug: string) { return timedSlugs.has(slug); }

const layout: Record<SkillMinutes, Record<WorkoutPhase, number>> = {
  15: { warmup: 1, skill: 1, support: 1, cooldown: 1 },
  25: { warmup: 2, skill: 2, support: 1, cooldown: 1 },
  40: { warmup: 2, skill: 2, support: 2, cooldown: 2 },
};
export function getCandidates(goalId: string, level: SkillLevel, phase: WorkoutPhase): SkillExercise[] {
  const goal = findSkillGoal(goalId);
  if (!goal) return [];
  const slugs = phase === 'warmup' ? goal.warmup : phase === 'skill' ? goal.main[level] : phase === 'support' ? goal.support : goal.cooldown;
  return slugs.flatMap(slug => {
    const e = catalog.get(slug);
    return e ? [e] : [];
  });
}
export function buildSkillWorkout(goalId: string, level: SkillLevel, minutes: SkillMinutes): SkillWorkoutItem[] {
  const slots = layout[minutes];
  const seen = new Set<string>();
  const items: SkillWorkoutItem[] = [];
  (['warmup','skill','support','cooldown'] as WorkoutPhase[]).forEach(phase => {
    const pool = getCandidates(goalId,level,phase);
    for (const exercise of pool) {
      if (items.filter(i=>i.phase===phase).length >= slots[phase]) break;
      if (seen.has(exercise.slug)) continue;
      seen.add(exercise.slug);
      const metric: SkillMetric = isTimed(exercise.slug) ? 'seconds' : 'reps';
      const sets = phase === 'warmup' || phase === 'cooldown' ? 1 : phase === 'skill' ? (minutes === 40 ? 4 : 3) : 2;
      const target = metric === 'seconds'
        ? (phase === 'cooldown' ? 30 : phase === 'warmup' ? 20 : phase === 'skill' ? 8 : 15)
        : (phase === 'skill' ? 5 : phase === 'cooldown' ? 8 : phase === 'warmup' ? 8 : 10);
      items.push({key: `${phase}-${exercise.slug}`,phase,exercise,sets,target,metric});
    }
  });
  return items;
}
export const PHASE_LABELS: Record<WorkoutPhase,string> = {
  warmup: 'Prepare', skill: 'Skill practice', support: 'Build strength', cooldown: 'Recover'
};
export function toSessionEntries(items: SkillWorkoutItem[]) {
  return items.map(item => ({
    section: item.phase === 'skill' ? 'workout' : item.phase === 'support' ? 'compression' : item.phase,
    phaseLabel: PHASE_LABELS[item.phase],
    exercise: item.exercise,
    sets: Array.from({length:item.sets},()=>({
      reps: item.metric === 'seconds' ? 0 : item.target,
      ...(item.metric === 'seconds' ? {seconds:item.target} : {}),
      done: false
    }))
  }));
}
