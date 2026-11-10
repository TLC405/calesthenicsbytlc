/**
 * Straight-arm pike press + handstand + compression + pistol squat program.
 * Targets are editable training prescriptions, not fixed readiness criteria.
 */
export type PressUnit = 'reps' | 'seconds';
export type PressSection = 'warmup' | 'compression' | 'workout' | 'cooldown';

export interface PressExercise {
  name: string;
  section: PressSection;
  category: string;
  sets: number;
  target: number;
  unit: PressUnit;
  cue: string;
  targetLabel?: string;
  adaptive?: boolean;
}

export interface PressSession {
  key: 'A' | 'B' | 'C' | 'D';
  title: string;
  subtitle: string;
  duration: string;
  optional?: boolean;
  exercises: PressExercise[];
}

const ex = (
  name: string,
  section: PressSection,
  sets: number,
  target: number,
  unit: PressUnit,
  cue: string,
  category = 'Skills'
): PressExercise => ({ name, section, sets, target, unit, cue, category });

export const PRESS_STEPS: Array<{ name: string; cue: string; target: number; unit: PressUnit }> = [
  { name: 'Pike support hold', cue: 'Hands firmly planted. Push tall through shoulders; build wrist tolerance and clean pike positioning.', target: 20, unit: 'seconds' },
  { name: 'Straight-arm pike rocks', cue: 'Maintain locked elbows and elevated shoulders while shifting shoulders ahead of wrists.', target: 6, unit: 'reps' },
  { name: 'Floating pike rocks', cue: 'Lean progressively forward and briefly unload the feet without jumping.', target: 4, unit: 'reps' },
  { name: 'Wall-assisted pike press', cue: 'Rise with straight arms and controlled hips; use wall contact only as needed.', target: 3, unit: 'reps' },
  { name: 'Wall-assisted pike press negative', cue: 'Lower slowly from a supported handstand; keep elbows straight and land softly.', target: 3, unit: 'reps' },
  { name: 'Elevated half pike press', cue: 'Use blocks or a bench for less compression demand. Reduce elevation as control improves.', target: 3, unit: 'reps' },
  { name: 'Standing straight-arm pike press', cue: 'Press slowly with straight elbows, shoulders elevated, and no jump or momentum.', target: 2, unit: 'reps' },
];

export const PRESS_FOUNDATION_LADDER = [
  'Deep pike and hamstring range',
  'Quality pike push-ups (bent-arm strength accessory)',
  'Controlled headstand leg lifts (inversion accessory)',
  'Wall-supported handstand entries',
  'Pike rocks with feet gradually unloading',
  'Wall-assisted straight-arm presses',
];

export const PRESS_COMPRESSION_MENU = [
  'Seated straight-leg lifts',
  'Hip compression lifts on blocks',
  'Pike support hold',
  'Forward-fold active compression',
  'L-sit hold',
  'Hanging straight-leg raises',
  'Seated good mornings',
  'Single-leg pike lifts',
];

export const PRESS_SESSIONS: PressSession[] = [
  {
    key: 'A',
    title: 'Compression + Pike Press',
    subtitle: 'Primary press practice, then pistols',
    duration: '55–65 min',
    exercises: [
      ex('Wrist rocks', 'warmup', 2, 30, 'seconds', 'Gently load the wrist in both directions.', 'Mobility'),
      ex('Scapular push-ups', 'warmup', 2, 12, 'reps', 'Keep elbows locked; move through the shoulder blades.', 'Warm-up'),
      ex('Pike stretch', 'warmup', 2, 30, 'seconds', 'Fold at hips without forcing the lower back.', 'Mobility'),
      ex('Seated straight-leg lifts', 'compression', 3, 10, 'reps', 'Lift heels without leaning backward. Pause 1–2 seconds.', 'Core'),
      ex('Compression hip lifts on blocks', 'compression', 3, 6, 'reps', 'Push into blocks and float hips or feet within control.', 'Core'),
      { ...ex('Current press progression', 'workout', 5, 4, 'reps', 'Select the hardest clean straight-arm step.'), adaptive: true },
      ex('Wall-assisted pike press', 'workout', 3, 3, 'reps', 'Controlled reps; skip if this duplicates or exceeds your selected step.'),
      ex('Ring-assisted pistol squat', 'workout', 3, 6, 'reps', 'Six controlled reps per leg; use rings only as needed.', 'Legs'),
      ex('Forward-fold compression hold', 'cooldown', 2, 30, 'seconds', 'Easy range, no painful stretch.', 'Mobility'),
    ],
  },
  {
    key: 'B',
    title: 'Handstand + Strength',
    subtitle: 'Balance quality, supported pressing and strength',
    duration: '45–60 min',
    exercises: [
      ex('Wrist circles and wrist rocks', 'warmup', 2, 30, 'seconds', 'Prepare wrist extension gently.', 'Warm-up'),
      ex('Scapular push-ups', 'warmup', 2, 10, 'reps', 'Active shoulder elevation and protraction.', 'Warm-up'),
      ex('Chest-to-wall handstand', 'workout', 4, 25, 'seconds', 'Stack the body and breathe; choose a comfortable wall distance.'),
      ex('Freestanding handstand attempts', 'workout', 5, 2, 'reps', 'One or two controlled entries each set; bail safely.'),
      { ...ex('Current press progression', 'workout', 4, 3, 'reps', 'Practice with full rest.'), adaptive: true },
      ex('Pike push-ups', 'workout', 3, 6, 'reps', 'Bent-arm shoulder-strength accessory, not a substitute for the straight-arm press.', 'Push'),
      ex('Seated straight-leg lifts', 'compression', 2, 8, 'reps', 'Light quality work, no grinding.', 'Core'),
      ex('Shoulder mobility flow', 'cooldown', 2, 30, 'seconds', 'Gentle wall slides and shoulder extension.', 'Mobility'),
    ],
  },
  {
    key: 'C',
    title: 'Full Skill Integration',
    subtitle: 'Controlled press entries + single-leg strength',
    duration: '55–70 min',
    exercises: [
      ex('Wrist rocks', 'warmup', 2, 30, 'seconds', 'Prepare extension range.', 'Warm-up'),
      ex('Downward dog to pike', 'warmup', 2, 8, 'reps', 'Shift smoothly into stacked shoulders.', 'Mobility'),
      ex('Single-leg pike lifts', 'compression', 3, 8, 'reps', 'Eight clean lifts per side.', 'Core'),
      ex('Pike support hold', 'compression', 3, 20, 'seconds', 'Drive through straight arms.'),
      { ...ex('Current press progression', 'workout', 5, 3, 'reps', 'Aim for smooth weight transfer.'), adaptive: true },
      ex('Wall-supported press negatives', 'workout', 3, 3, 'reps', 'Slow eccentric; omit if it exceeds your current strength.'),
      ex('Pistol squat negatives', 'workout', 3, 5, 'reps', 'Five per side, slow lower, stand with both legs.', 'Legs'),
      ex('Pike mobility', 'cooldown', 2, 30, 'seconds', 'Finish with gentle range.', 'Mobility'),
    ],
  },
  {
    key: 'D',
    title: 'Recovery + Light Volume',
    subtitle: 'Optional easy movement day',
    duration: '25–40 min',
    optional: true,
    exercises: [
      ex('Wrist circles', 'warmup', 2, 30, 'seconds', 'Easy range only.', 'Warm-up'),
      ex('Wall handstand hold', 'workout', 3, 15, 'seconds', 'Submaximal holds; stop before fatigue.'),
      ex('Seated straight-leg lifts', 'compression', 2, 8, 'reps', 'Low-effort reps.', 'Core'),
      ex('Single-leg pike lifts', 'compression', 2, 6, 'reps', 'Gentle compression practice.', 'Core'),
      ex('Ring-assisted pistol squat', 'workout', 2, 5, 'reps', 'Easy technique per side; no grinders.', 'Legs'),
      ex('Shoulder and pike mobility', 'cooldown', 3, 30, 'seconds', 'Comfortable mobility; no force.', 'Mobility'),
    ],
  },
];

export function resolvedPressExercises(session: PressSession, selectedStep: number): PressExercise[] {
  const step = PRESS_STEPS[Math.max(0, Math.min(PRESS_STEPS.length - 1, selectedStep - 1))];
  return session.exercises.map(item =>
    item.adaptive
      ? {
          ...item,
          name: step.name,
          unit: step.unit,
          target: step.target,
          cue: step.cue,
          targetLabel: 'Current press level ' + selectedStep,
          adaptive: false,
        }
      : item
  );
}
