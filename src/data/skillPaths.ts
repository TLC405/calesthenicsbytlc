export interface SkillPath {
  id: string;
  title: string;
  short: string;
  focus: string;
  equipment: string;
  cue: string;
  safety: string;
  slugs: readonly string[];
}
export const SKILL_PATHS: readonly SkillPath[] = [
  {
    id: 'planche',
    title: 'Planche',
    short: 'Straight-arm strength',
    focus: 'Protraction • scapular control • progressive leverage',
    equipment: 'Floor or parallettes',
    cue: 'Push tall through your shoulders; use a progression you can control without elbow bending.',
    safety: 'Warm wrists and shoulders first. Reduce leverage or stop if joints hurt.',
    slugs: ['planche-plank', 'planche-lean', 'parallette-tuck-planche', 'tuck-planche', 'advanced-tuck-planche', 'straddle-planche', 'full-planche'],
  },
  {
    id: 'straddle-press',
    title: 'Straddle → Handstand',
    short: 'Compression-to-balance studio',
    focus: 'Straddle mobility • active compression • controlled pressing',
    equipment: 'Floor, wall and optional parallettes',
    cue: 'Build hip compression and shoulder elevation first; a press should be controlled, not a jump.',
    safety: 'Practice safe handstand exits before freestanding attempts. Never force range through pain.',
    slugs: ['straddle-stretch', 'seated-straddle-compression-lift', 'seated-straddle-lift', 'press-hs-journey', 'straddle-hs-kick-up', 'straddle-press-to-hs', 'stalder-press-to-hs'],
  },
  {
    id: 'handstand',
    title: 'Handstand',
    short: 'Line, kick-up and balance',
    focus: 'Overhead mobility • exit technique • balance',
    equipment: 'Wall and open floor',
    cue: 'Own the chest-to-wall line and safe exits before progressively reducing wall support.',
    safety: 'Use a clear training area and practice a safe exit before balance work.',
    slugs: ['wall-handstand', 'chest-to-wall-handstand-hold', 'handstand-bail', 'handstand-heel-pull', 'freestanding-handstand-kick-up', 'freestanding-handstand', 'l-sit-to-handstand'],
  },
];
export const getSkillPath = (id?: string) => SKILL_PATHS.find(path=>path.id===id);
