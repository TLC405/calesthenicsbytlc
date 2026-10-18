/** One-device guest workout log; deliberately isolated from cloud user records. */
import type { OfflineExercise } from './offlineExercises';

export type GuestSet = { reps: number; weight?: number; rpe?: number };
export type GuestWorkoutEntry = { exercise_id: string; exercise: OfflineExercise; sets: GuestSet[] };
export type GuestWorkout = {
  date: string;
  notes: string;
  entries: GuestWorkoutEntry[];
};
const KEY = 'tlc-power-workouts-v1';

export function readGuestWorkouts(): GuestWorkout[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(value)
      ? value.filter(item =>
          typeof item === 'object' && item !== null &&
          typeof item.date === 'string' &&
          Array.isArray(item.entries)
        ).slice(0, 366) as GuestWorkout[]
      : [];
  } catch { return []; }
}

export function getGuestWorkout(date: string): GuestWorkout | undefined {
  return readGuestWorkouts().find(workout => workout.date === date);
}

export function saveGuestWorkout(workout: GuestWorkout) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(workout.date)) throw new Error('Invalid workout date');
  const current = readGuestWorkouts().filter(item => item.date !== workout.date);
  localStorage.setItem(KEY, JSON.stringify([workout, ...current].slice(0, 366)));
}
