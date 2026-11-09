/**
 * Discovery tags for the legacy flat exercise catalog.
 *
 * A single canonical exercise may match multiple goals. These tags are a
 * backwards-compatible bridge, not curated many-to-many progression edges.
 * Do not create or duplicate exercises simply because a tag exists.
 */
export const movementGoals: ReadonlyArray<{ id: string; label: string; terms: readonly string[]; categories: readonly string[] }> = [
  { id: 'planche', label: 'Planche', terms: ['planche', 'frog stand', 'crow stand'], categories: [] },
  { id: 'straight-arm', label: 'Straight-arm strength', terms: ['straight arm', 'straight-arm', 'planche lean', 'scapular protraction', 'scapular support', 'cross preparation', 'ring support'], categories: [] },
  { id: 'handstand', label: 'Handstands', terms: ['handstand', 'hand stand', 'wall walk', 'heel pull', 'toe pull'], categories: [] },
  { id: 'grip', label: 'Grip', terms: ['grip', 'hang', 'pinch', 'farmer', 'wrist', 'finger', 'towel', 'dead hang', 'false grip'], categories: [] },
  { id: 'flag', label: 'Human flag', terms: ['human flag', 'tuck flag', 'flag hold', 'flag progression', 'side lever', 'flag plank'], categories: [] },
  { id: 'front-lever', label: 'Front lever', terms: ['front lever'], categories: [] },
  { id: 'back-lever', label: 'Back lever', terms: ['back lever', 'skin the cat'], categories: [] },
  { id: 'levers', label: 'All levers', terms: ['front lever', 'back lever', 'lever raise', 'skin the cat'], categories: [] },
  { id: 'rings', label: 'Rings', terms: ['ring', 'iron cross', 'false grip', 'support scale', 'swallow'], categories: ['Rings'] },
  { id: 'muscle-up', label: 'Muscle-up', terms: ['muscle-up', 'muscle up', 'false grip', 'transition drill'], categories: [] },
  { id: 'pull', label: 'Pull strength', terms: ['pull-up', 'pullup', 'chin-up', 'row', 'archer pull'], categories: ['Pull'] },
  { id: 'push', label: 'Push strength', terms: ['push-up', 'pushup', 'dip', 'press-up', 'pseudo planche'], categories: ['Push'] },
  { id: 'legs', label: 'Legs', terms: ['squat', 'pistol', 'lunge', 'nordic', 'step-up', 'hamstring', 'split squat'], categories: ['Legs'] },
  { id: 'calves', label: 'Calves & tibialis', terms: ['calf', 'calves', 'tibial', 'heel raise', 'dorsiflexion'], categories: [] },
  { id: 'core', label: 'Core & compression', terms: ['hollow', 'dead bug', 'plank', 'l-sit', 'v-sit', 'leg raise', 'dragon flag', 'compression'], categories: ['Core'] },
  { id: 'mobility', label: 'Mobility', terms: ['mobility', 'stretch', 'flexibility', 'pancake', 'shoulder dislocate'], categories: ['Mobility', 'Flexibility', 'Yoga'] },
  { id: 'flow', label: 'Balance & flow', terms: ['flow', 'balance', 'crow', 'elbow lever', 'handstand walk', 'animal movement'], categories: [] },
];

export interface GoalExercise {
  name: string;
  category?: string | null;
  chain_group?: string | null;
  primary_muscles?: string[] | null;
}

export function matchesMovementGoal(exercise: GoalExercise, goalId: string): boolean {
  const goal = movementGoals.find(item => item.id === goalId);
  if (!goal) return false;
  const content = [exercise.name, exercise.chain_group || ''].join(' ').toLowerCase();
  const category = (exercise.category || '').toLowerCase();
  return goal.terms.some(term => content.includes(term)) ||
    goal.categories.some(value => value.toLowerCase() === category);
}
