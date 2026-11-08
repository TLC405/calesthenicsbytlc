/**
 * Client-side goal discovery for the existing single-category exercise catalog.
 * This is a discovery fallback, not a substitute for editorially reviewed
 * many-to-many progression edges in the database.
 */
export const movementGoals = [
  { id: 'planche', label: 'Planche', terms: ['planche', 'pseudo planche'], categories: [] },
  { id: 'handstand', label: 'Handstands', terms: ['handstand', 'hand stand', 'wall walk'], categories: [] },
  { id: 'grip', label: 'Grip', terms: ['grip', 'hang', 'pinch', 'farmer', 'wrist', 'finger', 'towel'], categories: [] },
  { id: 'flag', label: 'Human flag', terms: ['human flag', 'flag hold', 'flag progression', 'side lever'], categories: [] },
  { id: 'levers', label: 'Levers', terms: ['front lever', 'back lever', 'lever raise', 'skin the cat'], categories: [] },
  { id: 'rings', label: 'Rings', terms: ['ring', 'iron cross', 'false grip'], categories: ['Rings'] },
  { id: 'legs', label: 'Legs', terms: ['squat', 'pistol', 'lunge', 'nordic', 'calf', 'tibial', 'hamstring'], categories: ['Legs'] },
  { id: 'mobility', label: 'Mobility', terms: ['mobility', 'stretch', 'flexibility'], categories: ['Mobility', 'Flexibility', 'Yoga'] },
] as const;

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
