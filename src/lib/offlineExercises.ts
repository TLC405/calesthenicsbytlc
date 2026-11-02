/** Offline-first guest library: device-local only, never represented as a synced account. */
export type OfflineExercise = {
  id: string;
  name: string;
  slug: string;
  category: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string[];
  cues: string[];
  difficulty_level: number;
  description?: string | null;
  created_by: string | null;
  visibility: 'private' | 'public';
  youtube_url?: string | null;
  instagram_url?: string | null;
  image_url?: string | null;
};
export const LOCAL_USER_ID = 'offline-local-user';
const STORAGE_KEY = 'tlc-power-custom-exercises-v1';
const MAX_LOCAL = 200;

export const starterExercises: OfflineExercise[] = [
  { id: 'starter-wall-push-up', slug: 'wall-push-up', name: "Wall Push-up", category: "Push", primary_muscles: ["Chest"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 1, cues: ["Keep shoulders down","Control descent"], created_by: null, visibility: 'public' },
  { id: 'starter-incline-push-up', slug: 'incline-push-up', name: "Incline Push-up", category: "Push", primary_muscles: ["Chest"], secondary_muscles: [], equipment: ["Bench"], difficulty_level: 1, cues: ["Brace your core","Lower chest to the incline"], created_by: null, visibility: 'public' },
  { id: 'starter-standard-push-up', slug: 'standard-push-up', name: "Standard Push-up", category: "Push", primary_muscles: ["Chest"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 2, cues: ["Body in one line","Elbows slightly tucked"], created_by: null, visibility: 'public' },
  { id: 'starter-diamond-push-up', slug: 'diamond-push-up', name: "Diamond Push-up", category: "Push", primary_muscles: ["Triceps"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 3, cues: ["Keep wrists comfortable","Brace your core"], created_by: null, visibility: 'public' },
  { id: 'starter-pike-push-up', slug: 'pike-push-up', name: "Pike Push-up", category: "Push", primary_muscles: ["Shoulders"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 3, cues: ["Hips high","Lower head between hands"], created_by: null, visibility: 'public' },
  { id: 'starter-pseudo-planche-push-up', slug: 'pseudo-planche-push-up', name: "Pseudo Planche Push-up", category: "Push", primary_muscles: ["Shoulders"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 4, cues: ["Lean gradually","Keep elbows controlled"], created_by: null, visibility: 'public' },
  { id: 'starter-one-arm-push-up', slug: 'one-arm-push-up', name: "One-arm Push-up", category: "Push", primary_muscles: ["Chest"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 5, cues: ["Build side-to-side control","Use safe elevation first"], created_by: null, visibility: 'public' },
  { id: 'starter-dead-hang', slug: 'dead-hang', name: "Dead Hang", category: "Pull", primary_muscles: ["Forearms"], secondary_muscles: [], equipment: ["Pull-up Bar"], difficulty_level: 1, cues: ["Use an active grip","Breathe comfortably"], created_by: null, visibility: 'public' },
  { id: 'starter-scapular-pull-up', slug: 'scapular-pull-up', name: "Scapular Pull-up", category: "Pull", primary_muscles: ["Lats"], secondary_muscles: [], equipment: ["Pull-up Bar"], difficulty_level: 2, cues: ["Move shoulder blades","Avoid elbow bending"], created_by: null, visibility: 'public' },
  { id: 'starter-bodyweight-row', slug: 'bodyweight-row', name: "Bodyweight Row", category: "Pull", primary_muscles: ["Lats"], secondary_muscles: [], equipment: ["Rings"], difficulty_level: 2, cues: ["Keep hips tall","Pull rings toward ribs"], created_by: null, visibility: 'public' },
  { id: 'starter-chin-up', slug: 'chin-up', name: "Chin-up", category: "Pull", primary_muscles: ["Biceps"], secondary_muscles: [], equipment: ["Pull-up Bar"], difficulty_level: 3, cues: ["Use controlled lowering","Avoid swinging"], created_by: null, visibility: 'public' },
  { id: 'starter-pull-up', slug: 'pull-up', name: "Pull-up", category: "Pull", primary_muscles: ["Lats"], secondary_muscles: [], equipment: ["Pull-up Bar"], difficulty_level: 3, cues: ["Start from an active hang","Avoid neck craning"], created_by: null, visibility: 'public' },
  { id: 'starter-archer-pull-up', slug: 'archer-pull-up', name: "Archer Pull-up", category: "Pull", primary_muscles: ["Lats"], secondary_muscles: [], equipment: ["Pull-up Bar"], difficulty_level: 5, cues: ["Build both sides gradually","Use bands to scale"], created_by: null, visibility: 'public' },
  { id: 'starter-bodyweight-squat', slug: 'bodyweight-squat', name: "Bodyweight Squat", category: "Legs", primary_muscles: ["Quads"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 1, cues: ["Sit between hips","Keep heels grounded"], created_by: null, visibility: 'public' },
  { id: 'starter-reverse-lunge', slug: 'reverse-lunge', name: "Reverse Lunge", category: "Legs", primary_muscles: ["Glutes"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 2, cues: ["Take a comfortable step","Control the lowering"], created_by: null, visibility: 'public' },
  { id: 'starter-split-squat', slug: 'split-squat', name: "Split Squat", category: "Legs", primary_muscles: ["Quads"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 2, cues: ["Balance through your feet","Keep torso tall"], created_by: null, visibility: 'public' },
  { id: 'starter-assisted-pistol-squat', slug: 'assisted-pistol-squat', name: "Assisted Pistol Squat", category: "Legs", primary_muscles: ["Quads"], secondary_muscles: [], equipment: ["Rings"], difficulty_level: 4, cues: ["Use supports","Move in a pain-free range"], created_by: null, visibility: 'public' },
  { id: 'starter-calf-raise', slug: 'calf-raise', name: "Calf Raise", category: "Legs", primary_muscles: ["Calves"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 1, cues: ["Pause at the top","Lower steadily"], created_by: null, visibility: 'public' },
  { id: 'starter-plank', slug: 'plank', name: "Plank", category: "Core", primary_muscles: ["Abs"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 1, cues: ["Ribs stacked over pelvis","Breathe normally"], created_by: null, visibility: 'public' },
  { id: 'starter-dead-bug', slug: 'dead-bug', name: "Dead Bug", category: "Core", primary_muscles: ["Abs"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 1, cues: ["Keep back comfortable","Move slowly"], created_by: null, visibility: 'public' },
  { id: 'starter-hollow-body-hold', slug: 'hollow-body-hold', name: "Hollow Body Hold", category: "Core", primary_muscles: ["Abs"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 3, cues: ["Keep lower back supported","Shorten lever to scale"], created_by: null, visibility: 'public' },
  { id: 'starter-l-sit-tuck-hold', slug: 'l-sit-tuck-hold', name: "L-sit Tuck Hold", category: "Core", primary_muscles: ["Hip Flexors"], secondary_muscles: [], equipment: ["Parallettes"], difficulty_level: 3, cues: ["Push bars down","Begin with knees tucked"], created_by: null, visibility: 'public' },
  { id: 'starter-frog-stand', slug: 'frog-stand', name: "Frog Stand", category: "Skills", primary_muscles: ["Shoulders"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 3, cues: ["Place hands shoulder-width","Use a cushion if needed"], created_by: null, visibility: 'public' },
  { id: 'starter-wall-handstand', slug: 'wall-handstand', name: "Wall Handstand", category: "Skills", primary_muscles: ["Shoulders"], secondary_muscles: [], equipment: ["Wall"], difficulty_level: 3, cues: ["Press through fingertips","Use a spotter if unsure"], created_by: null, visibility: 'public' },
  { id: 'starter-freestanding-handstand', slug: 'freestanding-handstand', name: "Freestanding Handstand", category: "Skills", primary_muscles: ["Shoulders"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 5, cues: ["Practice safe exits","Accumulate brief balanced holds"], created_by: null, visibility: 'public' },
  { id: 'starter-ring-support-hold', slug: 'ring-support-hold', name: "Ring Support Hold", category: "Rings", primary_muscles: ["Shoulders"], secondary_muscles: [], equipment: ["Rings"], difficulty_level: 3, cues: ["Keep rings near hips","Use short sets"], created_by: null, visibility: 'public' },
  { id: 'starter-ring-dip', slug: 'ring-dip', name: "Ring Dip", category: "Rings", primary_muscles: ["Triceps"], secondary_muscles: [], equipment: ["Rings"], difficulty_level: 5, cues: ["Progress from solid support","Maintain stable shoulders"], created_by: null, visibility: 'public' },
  { id: 'starter-skin-the-cat-preparation', slug: 'skin-the-cat-preparation', name: "Skin the Cat Preparation", category: "Rings", primary_muscles: ["Shoulders"], secondary_muscles: [], equipment: ["Rings"], difficulty_level: 5, cues: ["Only with adequate mobility","Use professional coaching"], created_by: null, visibility: 'public' },
  { id: 'starter-cat-cow', slug: 'cat-cow', name: "Cat-Cow", category: "Mobility", primary_muscles: ["Lower Back"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 1, cues: ["Move with breathing","Stay comfortable"], created_by: null, visibility: 'public' },
  { id: 'starter-world-s-greatest-stretch', slug: 'world-s-greatest-stretch', name: "World's Greatest Stretch", category: "Mobility", primary_muscles: ["Hip Flexors"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 2, cues: ["Move slowly","Support your back knee"], created_by: null, visibility: 'public' },
  { id: 'starter-wrist-circles', slug: 'wrist-circles', name: "Wrist Circles", category: "Mobility", primary_muscles: ["Forearms"], secondary_muscles: [], equipment: ["None (Bodyweight)"], difficulty_level: 1, cues: ["Use small circles","Avoid painful angles"], created_by: null, visibility: 'public' },
  { id: 'starter-downward-facing-dog', slug: 'downward-facing-dog', name: "Downward Facing Dog", category: "Yoga", primary_muscles: ["Hamstrings"], secondary_muscles: [], equipment: ["Mat"], difficulty_level: 2, cues: ["Bend knees as needed","Lengthen spine"], created_by: null, visibility: 'public' },
  { id: 'starter-child-s-pose', slug: 'child-s-pose', name: "Child's Pose", category: "Yoga", primary_muscles: ["Lower Back"], secondary_muscles: [], equipment: ["Mat"], difficulty_level: 1, cues: ["Relax breathing","Use a cushion as needed"], created_by: null, visibility: 'public' },
  { id: 'starter-seated-forward-fold', slug: 'seated-forward-fold', name: "Seated Forward Fold", category: "Flexibility", primary_muscles: ["Hamstrings"], secondary_muscles: [], equipment: ["Mat"], difficulty_level: 2, cues: ["Hinge gently","No bouncing"], created_by: null, visibility: 'public' },
  { id: 'starter-pancake-stretch', slug: 'pancake-stretch', name: "Pancake Stretch", category: "Flexibility", primary_muscles: ["Hamstrings"], secondary_muscles: [], equipment: ["Mat"], difficulty_level: 3, cues: ["Rotate pelvis forward","Avoid forcing depth"], created_by: null, visibility: 'public' },
];

function valid(item: unknown): item is OfflineExercise {
  if (!item || typeof item !== 'object') return false;
  const value = item as Partial<OfflineExercise>;
  return typeof value.id === 'string' &&
    typeof value.name === 'string' && value.name.length <= 160 &&
    typeof value.category === 'string' &&
    value.created_by === LOCAL_USER_ID &&
    (value.visibility === 'private' || value.visibility === 'public') &&
    Array.isArray(value.primary_muscles) &&
    Array.isArray(value.secondary_muscles) &&
    Array.isArray(value.equipment) &&
    Array.isArray(value.cues);
}

export function getLocalCustomExercises(): OfflineExercise[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(valid).slice(0, MAX_LOCAL) : [];
  } catch {
    return [];
  }
}

export function getOfflineExercises() {
  return [...getLocalCustomExercises(), ...starterExercises];
}

export function saveLocalExercise(exercise: OfflineExercise) {
  if (!valid(exercise)) throw new Error('Exercise data is invalid');
  const existing = getLocalCustomExercises();
  const matches = existing.some(e => e.id === exercise.id);
  if (!matches && existing.length >= MAX_LOCAL) {
    throw new Error('Local storage has reached the limit of 200 custom exercises');
  }
  const next = [exercise, ...existing.filter(e => e.id !== exercise.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function removeLocalExercise(id: string) {
  const existing = getLocalCustomExercises();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.filter(e => e.id !== id)));
}

export function exportLocalExercises() {
  const backup = JSON.stringify({
    format: 'tlc-power-offline-v1',
    exported_at: new Date().toISOString(),
    exercises: getLocalCustomExercises(),
  }, null, 2);
  const url = URL.createObjectURL(new Blob([backup], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'power-personal-exercises-backup.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
