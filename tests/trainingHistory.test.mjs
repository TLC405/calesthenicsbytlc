import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExerciseHistory, formatCompletedSets } from '../src/lib/trainingHistory.ts';

const row = (date, exerciseId, sets, quality = false, suffix = '10:00:00Z') => ({
  date,
  created_at: date + 'T' + suffix,
  entries: [{ exercise_id: exerciseId, sets, unit: 'seconds', quality_confirmed: quality }],
});

test('old scheduled sets cannot masquerade as training history', () => {
  const records = [row('2026-11-04', 'exercise-a', [{ seconds: 15 }, { seconds: 15 }], true)];
  const history = buildExerciseHistory(records);
  assert.equal(history.has('exercise-a'), false);
});

test('only explicitly checked sets count as completed', () => {
  const history = buildExerciseHistory([
    row('2026-11-04', 'exercise-a', [
      { reps: 0, seconds: 10, completed: true },
      { reps: 0, seconds: 12, completed: false },
    ], true),
  ]);
  assert.equal(history.get('exercise-a')?.completedSessions, 1);
  assert.equal(history.get('exercise-a')?.previous?.allSetsCompleted, false);
  assert.equal(formatCompletedSets(history.get('exercise-a').previous), '10s');
});

test('two distinct comfortable and completed sessions permit review, not automatic progression', () => {
  const history = buildExerciseHistory([
    row('2026-11-01', 'exercise-a', [{ seconds: 10, completed: true }, { seconds: 12, completed: true }], true),
    row('2026-11-03', 'exercise-a', [{ seconds: 15, completed: true }, { seconds: 15, completed: true }], true),
  ]);
  assert.equal(history.get('exercise-a')?.eligibleToReviewVariation, true);
  assert.deepEqual(history.get('exercise-a')?.previous?.completedSets.map(s => s.seconds), [15, 15]);
});

test('missing comfort confirmation suppresses progression review', () => {
  const history = buildExerciseHistory([
    row('2026-11-01', 'exercise-a', [{ seconds: 10, completed: true }], true),
    row('2026-11-03', 'exercise-a', [{ seconds: 10, completed: true }], false),
  ]);
  assert.equal(history.get('exercise-a')?.eligibleToReviewVariation, false);
});

test('duplicated exercise entries inside one workout never count as two sessions', () => {
  const record = row('2026-11-03', 'exercise-a', [{ seconds: 12, completed: true }], true);
  record.entries.push({ ...record.entries[0] });
  const history = buildExerciseHistory([record]);
  assert.equal(history.get('exercise-a')?.completedSessions, 1);
  assert.equal(history.get('exercise-a')?.eligibleToReviewVariation, false);
});

test('malformed exercise records do not crash the history parser', () => {
  const history = buildExerciseHistory([
    { date: '2026-11-02', entries: 'not an array' },
    { date: '2026-11-03', entries: [null, 99, { exercise_id: 'exercise-a', sets: ['x', null] }] },
  ]);
  assert.equal(history.size, 0);
});

test('older records with no explicit set completion remain separate from completed sessions', () => {
  const history = buildExerciseHistory([
    row('2026-10-22', 'exercise-a', [{ seconds: 20 }], true),
    row('2026-11-03', 'exercise-a', [{ seconds: 9, completed: true }], true),
  ]);
  assert.equal(history.get('exercise-a')?.completedSessions, 1);
});
