/**
 * Interpret legacy POWER workout JSON without inventing completed performance.
 *
 * Important: older workouts contain planned sets but no completed flags.
 * They are intentionally excluded from previous *completed* performance
 * and from readiness suggestions.
 */
export interface LoggedSet {
  reps?: number;
  seconds?: number;
  weight?: number;
  completed?: boolean;
}
export interface StoredWorkout {
  date?: string | null;
  created_at?: string | null;
  entries?: unknown;
}
interface StoredEntry {
  exercise_id?: unknown;
  sets?: unknown;
  unit?: unknown;
  quality_confirmed?: unknown;
}
export interface CompletedExerciseSession {
  date: string | null;
  unit: 'reps' | 'seconds';
  completedSets: LoggedSet[];
  totalSets: number;
  allSetsCompleted: boolean;
  qualityConfirmed: boolean;
}
export interface ExerciseHistory {
  previous?: CompletedExerciseSession;
  completedSessions: number;
  eligibleToReviewVariation: boolean;
}

const safeAmount = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;

function readSet(value: unknown): LoggedSet | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const valueObject = value as Record<string, unknown>;
  return {
    reps: safeAmount(valueObject.reps),
    seconds: safeAmount(valueObject.seconds),
    weight: safeAmount(valueObject.weight),
    completed: valueObject.completed === true,
  };
}
function readEntries(value: unknown): StoredEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is StoredEntry =>
    Boolean(item) && typeof item === 'object' && !Array.isArray(item));
}
export function buildExerciseHistory(rows: StoredWorkout[]): Map<string, ExerciseHistory> {
  const sessions = new Map<string, CompletedExerciseSession[]>();
  const sorted = [...rows].sort((a, b) => {
    const first = (a.date || '') + 'T' + (a.created_at || '');
    const second = (b.date || '') + 'T' + (b.created_at || '');
    return second.localeCompare(first);
  });
  for (const workout of sorted) {
    const entries = readEntries(workout.entries);
    const recordedThisWorkout = new Set<string>();
    for (const entry of entries) {
      const id = entry.exercise_id;
      if (typeof id !== 'string' || !id) continue;
      const allSets = Array.isArray(entry.sets)
        ? entry.sets.map(readSet).filter((set): set is LoggedSet => set !== null)
        : [];
      const done = allSets.filter(set => set.completed &&
        (entry.unit === 'seconds' ? (set.seconds ?? 0) > 0 : (set.reps ?? 0) > 0));
      if (done.length === 0 || recordedThisWorkout.has(id)) continue;
      recordedThisWorkout.add(id);
      const session: CompletedExerciseSession = {
        date: workout.date || null,
        unit: entry.unit === 'seconds' ? 'seconds' : 'reps',
        completedSets: done,
        totalSets: allSets.length,
        allSetsCompleted: allSets.length > 0 && done.length === allSets.length,
        qualityConfirmed: entry.quality_confirmed === true,
      };
      sessions.set(id, [...(sessions.get(id) || []), session]);
    }
  }
  const result = new Map<string, ExerciseHistory>();
  for (const [id, history] of sessions) {
    const firstTwo = history.slice(0, 2);
    result.set(id, {
      previous: history[0],
      completedSessions: history.length,
      // A prompt to REVIEW variations, never an automatic advancement.
      eligibleToReviewVariation: firstTwo.length === 2 &&
        firstTwo.every(item => item.allSetsCompleted && item.qualityConfirmed),
    });
  }
  return result;
}
export function formatCompletedSets(session: CompletedExerciseSession): string {
  const unit = session.unit === 'seconds' ? 's' : ' reps';
  return session.completedSets.map(set =>
    String(session.unit === 'seconds' ? set.seconds ?? 0 : set.reps ?? 0) + unit).join(' · ');
}
