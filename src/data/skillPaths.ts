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
    slugs: ['planche-lean', 'frog-stand', 'tuck-planche', 'advanced-tuck-planche', 'straddle-planche', 'full-planche'],
  },
  {
    id: 'straddle-press',
    title: 'Straddle Press',
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
    slugs: ['wall-handstand', 'handstand-bail', 'chest-to-wall-handstand-hold', 'handstand-heel-pull', 'freestanding-handstand-kick-up', 'freestanding-handstand', 'l-sit-to-handstand'],
  },
  {
    id: 'rings', title: 'Rings', short: 'Support, pull and stability',
    focus: 'Stable support • controlled pulling • comfortable range', equipment: 'Gymnastic rings',
    cue: 'Keep rings close, control the support, and scale with your feet when needed.',
    safety: 'Set ring height and foot assistance to your current control. Stop for joint pain.',
    slugs: ['incline-ring-row','ring-row','assisted-ring-support-hold','ring-support-hold','assisted-ring-dip','ring-dip','ring-turnout-support-hold'],
  },
  {
    id: 'hspu', title: 'Handstand Push-Up', short: 'Pressing strength and range',
    focus: 'Shoulder elevation • controlled range • stable overhead support', equipment: 'Floor and wall',
    cue: 'Use a pike variation you control. Build wall support and safe exits before inverted pressing.',
    safety: 'A pike push-up is a supported starting point. Advanced inverted pressing requires prior control.',
    slugs: ['pike-push-up','wall-handstand','wall-handstand-shoulder-taps','handstand-push-up'],
  },
  {
    id: 'ring-muscle-up', title: 'Ring Muscle-Up', short: 'Grip, pull, transition, push',
    focus: 'False grip • close pull • supported transition • dip', equipment: 'Gymnastic rings',
    cue: 'Work the weak component. Keep feet-assisted transitions smooth before full attempts.',
    safety: 'Strong pulling alone does not establish transition readiness. Use foot assistance.',
    slugs: ['false-grip-ring-row','false-grip-ring-hang','ring-muscle-up-transition-drill','low-ring-muscle-up-assisted','ring-muscle-up'],
  },
];
export const getSkillPath = (id?: string) => SKILL_PATHS.find(path=>path.id===id);
